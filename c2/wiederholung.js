// Feinschliff – Wiederholung ohne Langeweile (Leitner-Kästen 0–5 + Durchlauf-Regel).
// Regel: Eine richtig gelöste Übung kommt erst wieder, wenn ALLE anderen Übungen ihres Pools einmal dran waren.
// Falsch gelöste bleiben im laufenden Durchlauf verfügbar (Kasten 1) und kommen frühestens nach PAUSE_FALSCH wieder,
// höchstens ANTEIL_FALSCH einer Runde, damit immer auch Neues dabei ist. Typen werden gemischt (nie zweimal derselbe Typ hintereinander, wenn möglich).
import { speicher, mische } from './speicher.js';
export const PAUSE_FALSCH = 10 * 60e3;
export const ANTEIL_FALSCH = 0.4;
const karten = () => speicher.lies('karten', {});
const zyklen = () => speicher.lies('zyklen', {});
export const karte = (uid) => karten()[uid];
export const zyklus = (pool) => zyklen()[pool] || 0;
export function vermerke(uid, pool, richtig, jetzt = Date.now()) {
  const ks = karten(); const c = ks[uid] || { k: 0, n: 0, r: 0 };
  c.n++; c.z = jetzt;
  if (richtig) { c.r++; c.k = Math.min(5, (c.k || 0) + 1); c.f = 0; c.zy = zyklus(pool); }
  else { c.k = 1; c.f = 1; c.fz = jetzt; }
  ks[uid] = c; speicher.schreib('karten', ks); return c;
}
// Ist die Übung im laufenden Durchlauf ihres Pools noch offen?
const offen = (c, C) => !c || c.f === 1 || (c.zy ?? -1) < C;
const gesperrt = (c, jetzt) => c?.f === 1 && jetzt - (c.fz || 0) < PAUSE_FALSCH;
/**
 * kandidaten: [{uid, pool, typ, …}] – wählt n Einträge.
 * Verbraucht ein Pool alle offenen Übungen, beginnt sein nächster Durchlauf (zyklen[pool]++).
 */
export function waehle(kandidaten, n, { jetzt = Date.now(), anteilFalsch = ANTEIL_FALSCH, durchlauf = true } = {}) {   // durchlauf:false → nur Teilmenge, kein neuer Durchlauf
  const ks = karten(), zy = zyklen(), gewaehlt = [], genommen = new Set(), segmente = [];
  const pools = [...new Set(kandidaten.map((k) => k.pool))];
  if (n <= 0) return [];
  for (let runde = 0; runde < (durchlauf ? 3 : 1) && gewaehlt.length < n; runde++) {
    const verf = kandidaten.filter((k) => !genommen.has(k.uid) && offen(ks[k.uid], zy[k.pool] || 0));
    const falsch = mische(verf.filter((k) => ks[k.uid]?.f === 1 && jetzt - (ks[k.uid].fz || 0) >= PAUSE_FALSCH));
    const neu = mische(verf.filter((k) => !ks[k.uid]));
    const rest = mische(verf.filter((k) => ks[k.uid] && ks[k.uid].f !== 1))
      .sort((a, b) => (ks[a.uid].k - ks[b.uid].k) || ((ks[a.uid].z || 0) - (ks[b.uid].z || 0)));
    const platz = n - gewaehlt.length;
    const nf = Math.min(falsch.length, Math.max(1, Math.round(n * anteilFalsch)));
    const reihe = [...falsch.slice(0, nf), ...neu, ...rest, ...falsch.slice(nf)].slice(0, platz);
    for (const k of reihe) { gewaehlt.push(k); genommen.add(k.uid); }
    segmente.push(reihe);   // je Durchlauf getrennt mischen: Reste des alten Durchlaufs kommen vor dem neuen
    if (gewaehlt.length >= n || !durchlauf) break;
    // Pools ohne offene Übungen: nächster Durchlauf (alle richtig gelösten werden wieder frei)
    let neuerDurchlauf = false;
    for (const p of pools) {
      const imPool = kandidaten.filter((k) => k.pool === p);
      if (imPool.every((k) => genommen.has(k.uid) || !offen(ks[k.uid], zy[p] || 0) || gesperrt(ks[k.uid], jetzt))) { zy[p] = (zy[p] || 0) + 1; neuerDurchlauf = true; }
    }
    if (!neuerDurchlauf) break;
    speicher.schreib('zyklen', zy);
  }
  const out = []; for (const r of segmente) out.push(...typenMischen(r, out[out.length - 1]?.typ)); return out;
}
// Nie zweimal derselbe Typ hintereinander, wenn es sich vermeiden lässt (immer den häufigsten anderen Typ zuerst)
export function typenMischen(liste, davor = null) {
  const gruppen = new Map(); for (const k of liste) { if (!gruppen.has(k.typ)) gruppen.set(k.typ, []); gruppen.get(k.typ).push(k); }
  const out = []; let vor = davor;
  while (out.length < liste.length) {
    let best = null;
    for (const [t, g] of gruppen) if (g.length && t !== vor && (best == null || g.length > gruppen.get(best).length)) best = t;
    if (best == null) best = [...gruppen].find(([, g]) => g.length)[0];
    out.push(gruppen.get(best).shift()); vor = best;
  }
  return out;
}
// Statistik je Pool: gesehen, richtig-Quote, wie viele im laufenden Durchlauf noch offen
export function poolStand(kandidaten) {
  const ks = karten(); let gesehen = 0, n = 0, r = 0;
  for (const k of kandidaten) { const c = ks[k.uid]; if (c) { gesehen++; n += c.n; r += c.r; } }
  return { gesamt: kandidaten.length, gesehen, quote: n ? r / n : null };
}
