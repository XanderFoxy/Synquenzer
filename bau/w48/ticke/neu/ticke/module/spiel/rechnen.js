// Entweder – oder – Rechnung. Kein DOM, auch in Node testbar (test/spiel/rechnen-test.mjs).
// Modell: Thurstone-Zwangswahl (Thurstone 1927; Thurstonian IRT nach Brown & Maydeu-Olivares 2011) für Paare:
//   Reiz einer Aussage i = λ · k_i · η_Bereich + ε_i,  ε_i ~ N(0, ψ²).   Wahl „i statt j“, wenn Reiz_i > Reiz_j:
//   P(i statt j | η) = Φ( λ (k_i η_a − k_j η_b) / √(ψ²_i + ψ²_j) ).
// Die Aussagen-Werte (λ, ψ², Schwellen) sind ANGENOMMEN (λ = 1, ψ² = 1, Schwelle 0), nicht an einer Stichprobe geschätzt.
// Schätzung: Vorwissen η ~ N(0, I) (alle Bereiche in der Mitte), dann höchste Wahrscheinlichkeit nach allen Wahlen (MAP,
// Newton-Verfahren) und Unsicherheit aus der Krümmung (Laplace-Näherung). Weil die Werte nur angenommen sind, wird jede
// Unsicherheit mit 1,25 aufgeweitet. „Mitte“ heißt: Aussagen beider Seiten reizen dich gleich – nicht „wie der Durchschnitt“.
import { AUSSAGEN, BEREICHE, PAARE, PAAR, WIEDER, KETTEN, KETTEN_PAARE, SCHRITT, ABLAUF, LEVEL, TAETIGKEITEN, TYP_REIHE, woerter } from './daten.js';

export const MODELL = { ladung: 1, rest: 1, aufweiten: 1.25, z80: 1.2815515655446004, schnellJeWort: 120, schnellMin: 700 };
const K = MODELL.ladung / Math.sqrt(2 * MODELL.rest);   // Steilheit je Paar (Probit-Einheiten)

// ---------- Normalverteilung ----------
export const phi = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
function erfc(x) {   // Numerical Recipes erfcc, relativer Fehler < 1,2e-7
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
export const Phi = (x) => 0.5 * erfc(-x / Math.SQRT2);
const logPhi = (x) => (x < -6 ? Math.log(phi(x) / -x) + Math.log(1 - 1 / (x * x) + 3 / (x ** 4)) : Math.log(Math.max(1e-300, Phi(x))));
const mills = (x) => (x < -6 ? -x / (1 - 1 / (x * x) + 3 / (x ** 4)) : phi(x) / Math.max(1e-300, Phi(x)));

// ---------- kleine Matrix-Hilfen ----------
function inv(M) {   // Gauss-Jordan, M symmetrisch positiv definit
  const n = M.length, A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c]; for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; if (f) for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; }
  }
  return A.map((r) => r.slice(n));
}
const mal = (M, v) => M.map((r) => r.reduce((s, x, j) => s + x * v[j], 0));
function cholesky(M) {
  const n = M.length, L = M.map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = M[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j];
  }
  return L;
}
export function zufall(saat) {   // mulberry32 – gleiche Saat, gleiche Folge
  let a = (saat >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hash(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------- Schätzung (MAP + Laplace) ----------
// beob: [{ c: [[index, koeffizient], …], y: +1 | −1 }]  mit z = Σ koeffizient · η_index, P(beob) = Φ(y · z)
export function schaetze(beob, dim) {
  let eta = Array(dim).fill(0), H = null, it = 0;
  const lauf = (e) => {
    const g = e.map((x) => -x), N = Array.from({ length: dim }, (_, i) => Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0)));   // −Hesse
    let ll = -0.5 * e.reduce((s, x) => s + x * x, 0);
    for (const o of beob) {
      let z = 0; for (const [i, k] of o.c) z += k * e[i];
      const x = o.y * z, m = mills(x), w = m * (x + m);
      ll += logPhi(x);
      for (const [i, k] of o.c) { g[i] += o.y * m * k; for (const [j, l] of o.c) N[i][j] += w * k * l; }
    }
    return { g, N, ll };
  };
  let r = lauf(eta);
  for (it = 1; it <= 60; it++) {
    const schritt = mal(inv(r.N), r.g);
    let f = 1, neu = eta.map((x, i) => x + schritt[i]), rn = lauf(neu);
    while (rn.ll < r.ll - 1e-12 && f > 1e-4) { f /= 2; neu = eta.map((x, i) => x + f * schritt[i]); rn = lauf(neu); }   // gedämpft
    const gross = Math.max(...schritt.map((x) => Math.abs(x * f)));
    eta = neu; r = rn;
    if (gross < 1e-9) break;
  }
  H = r.N;
  return { mittel: eta, kov: inv(H), schritte: it, ll: r.ll };
}

// ---------- Big Five aus den Haupt-Paaren ----------
const BI = Object.fromEntries(BEREICHE.map((b, i) => [b.id, i]));
// Koeffizienten für „a statt b“
export function koeff(aId, bId) {
  const a = AUSSAGEN[aId], b = AUSSAGEN[bId], c = new Map();
  c.set(BI[a.b], (c.get(BI[a.b]) || 0) + K * a.k); c.set(BI[b.b], (c.get(BI[b.b]) || 0) - K * b.k);
  return [...c.entries()];
}
// P(a statt b) bei bekanntem η (für Simulationen)
export function pPaar(aId, bId, eta) { return Phi(koeff(aId, bId).reduce((s, [i, k]) => s + k * eta[i], 0)); }
// P(a statt b) vorhergesagt aus einer Schätzung (mit ihrer Unsicherheit): Φ(μ / √(1 + σ²))
export function vorhersage(aId, bId, sch) {
  const c = koeff(aId, bId), f = MODELL.aufweiten ** 2;
  const mu = c.reduce((s, [i, k]) => s + k * sch.mittel[i], 0);
  let v = 0; for (const [i, k] of c) for (const [j, l] of c) v += k * l * sch.kov[i][j] * f;
  return Phi(mu / Math.sqrt(1 + v));
}
const gewaehlt = (a) => a && (a.w === 'a' || a.w === 'b');
export function bigFiveBeob(antworten, ids = PAARE.map((p) => p.id)) {
  return ids.filter((id) => gewaehlt(antworten[id])).map((id) => ({ id, c: koeff(PAAR[id].a, PAAR[id].b), y: antworten[id].w === 'a' ? 1 : -1 }));
}
// Messgenauigkeit je Bereich (Simulation mit 30 Paaren: Streuung meist 0,57–0,78, Mitte 0,63). Bewusst bescheiden benannt:
// selbst 0,6 heißt ein 80-%-Bereich von etwa ±8 Punkten auf der Skala 20–80.
export function sicherheit(sd) { return sd <= 0.6 ? 'mittelgenau' : sd <= 0.72 ? 'grob' : 'sehr grob'; }
export function wortFuer(p) {   // p = P(über der Mitte)
  if (p >= 0.9) return { stufe: 2, richtung: 1 }; if (p >= 0.7) return { stufe: 1, richtung: 1 };
  if (p <= 0.1) return { stufe: 2, richtung: -1 }; if (p <= 0.3) return { stufe: 1, richtung: -1 };
  return { stufe: 0, richtung: 0 };
}
export function bigFive(antworten) {
  const beob = bigFiveBeob(antworten);
  const sch = schaetze(beob, BEREICHE.length), f = MODELL.aufweiten;
  const bereiche = {};
  BEREICHE.forEach((B, i) => {
    const m = sch.mittel[i], sd = Math.sqrt(sch.kov[i][i]) * f;
    bereiche[B.id] = {
      m: rund(m, 3), sd: rund(sd, 3), t: rund(50 + 10 * m, 1),
      unten: rund(50 + 10 * (m - MODELL.z80 * sd), 1), oben: rund(50 + 10 * (m + MODELL.z80 * sd), 1),
      pOben: rund(Phi(m / sd), 3), sicherheit: sicherheit(sd), ...wortFuer(Phi(m / sd))
    };
  });
  const vergleiche = [];
  for (let i = 0; i < BEREICHE.length; i++) for (let j = i + 1; j < BEREICHE.length; j++) {
    const v = (sch.kov[i][i] + sch.kov[j][j] - 2 * sch.kov[i][j]) * f * f, p = Phi((sch.mittel[i] - sch.mittel[j]) / Math.sqrt(v));
    vergleiche.push(p >= 0.5 ? { vor: BEREICHE[i].id, nach: BEREICHE[j].id, p: rund(p, 3) } : { vor: BEREICHE[j].id, nach: BEREICHE[i].id, p: rund(1 - p, 3) });
  }
  vergleiche.sort((a, b) => b.p - a.p);
  return { n: beob.length, bereiche, vergleiche, schaetzung: { mittel: sch.mittel.map((x) => rund(x, 4)), kov: sch.kov.map((r) => r.map((x) => rund(x, 5))), schritte: sch.schritte }, sch };
}

// ---------- Interessen-Duell (Thurstone Fall V für sechs Bereiche) ----------
export function interessen(antworten, saat = 1) {
  const DI = Object.fromEntries(TYP_REIHE.map((t, i) => [t, i]));
  const beob = [];
  for (const s of ABLAUF) {
    if (s.art !== 'duell') continue; const a = antworten[s.id]; if (!gewaehlt(a)) continue;
    beob.push({ c: [[DI[s.a.typ], Math.SQRT1_2], [DI[s.b.typ], -Math.SQRT1_2]], y: a.w === 'a' ? 1 : -1 });
  }
  if (beob.length < 10) return null;
  const sch = schaetze(beob, 6), f = MODELL.aufweiten;
  const L = cholesky(sch.kov.map((r) => r.map((x) => x * f * f))), rnd = zufall(saat);
  const N = 4000, top1 = Array(6).fill(0), top2 = Array(6).fill(0);
  for (let s = 0; s < N; s++) {
    const z = Array.from({ length: 6 }, () => { const u = Math.max(1e-12, rnd()), w = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); });
    const x = sch.mittel.map((m, i) => m + L[i].reduce((t, l, j) => t + l * z[j], 0));
    const ord = x.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    top1[ord[0][1]]++; top2[ord[0][1]]++; top2[ord[1][1]]++;
  }
  const typen = TYP_REIHE.map((t, i) => ({ typ: t, m: rund(sch.mittel[i], 3), sd: rund(Math.sqrt(sch.kov[i][i]) * f, 3), pErst: rund(top1[i] / N, 3), pTop2: rund(top2[i] / N, 3),
    siege: beob.filter((o) => o.c.some(([j, k]) => j === i && Math.sign(k) === o.y)).length }));
  const rang = [...typen].sort((a, b) => b.pTop2 - a.pTop2 || b.m - a.m);
  return { n: beob.length, typen, rang: rang.map((t) => t.typ) };
}

// ---------- Prüfungen: Aufmerksamkeit, Beständigkeit, Tempo, Kopfnüsse ----------
// Lese-Zeit: unter 120 ms je Wort (= 500 Wörter pro Minute, sehr schnelles Überfliegen; Brysbaert 2019: im Mittel etwa
// 240) und mindestens 0,7 s gilt eine Antwort als „sehr schnell“ – angelehnt an die 2-Sekunden-Regel je Frage (Huang u. a. 2012).
export const zuSchnell = (s, ms) => ms != null && ms < Math.max(MODELL.schnellMin, woerter(s) * MODELL.schnellJeWort);
const richtigBei = (s, a) => !!(a && s.richtig && a.w === s.richtig);

export function pruefungen(antworten, sch = null) {
  const R = { kontrolle: { richtig: 0, von: 0, falsch: [] }, leicht: { richtig: 0, von: 0, falsch: [] }, wieder: { gleich: 0, von: 0, liste: [] },
    ketten: { stimmig: 0, von: 0, kreise: [] }, tempo: { schnell: 0, von: 0, anteil: 0, median: null }, seiten: { links: 0, von: 0, anteil: 0.5, laengste: 0 },
    vorhersage: { treffer: 0, von: 0, erwartet: 0 } };
  const zeiten = [];
  let lauf = 0, vorige = null;
  for (const s of ABLAUF) {
    const a = antworten[s.id]; if (!gewaehlt(a)) continue;
    if (s.art === 'kontrolle' || s.art === 'leicht') { const T = R[s.art]; T.von++; if (richtigBei(s, a)) T.richtig++; else T.falsch.push(s.id); }
    if (s.art === 'wieder') { const o = antworten[s.von]; if (gewaehlt(o)) { R.wieder.von++; const g = o.w === a.w; if (g) R.wieder.gleich++; R.wieder.liste.push({ id: s.id, von: s.von, gleich: g }); } }
    if (s.art === 'paar' && a.ms != null) { R.tempo.von++; if (zuSchnell(s, a.ms)) R.tempo.schnell++; zeiten.push(a.ms); }
    // Seiten nur, wo die Seite zufällig war (nicht bei den festen Schwung-Fragen)
    if (!s.seite && (a.l === true || a.l === false)) {
      R.seiten.von++; if (a.l) R.seiten.links++;
      lauf = vorige === a.l ? lauf + 1 : 1; vorige = a.l; R.seiten.laengste = Math.max(R.seiten.laengste, lauf);
    }
  }
  for (const k of KETTEN) {
    const ws = ['a', 'b', 'c'].map((x) => antworten[k.id + x]);
    if (!ws.every(gewaehlt)) continue;
    R.ketten.von++;
    // k.aus = [A, B, C]; Paare: a = A–B, b = B–C, c = C–A. Kreis, wenn alle drei „vorne“ (a) oder alle „hinten“ (b) gewählt wurden.
    const vorn = ws.map((w) => w.w === 'a');
    if (vorn.every(Boolean) || vorn.every((x) => !x)) R.ketten.kreise.push(k.id); else R.ketten.stimmig++;
  }
  R.tempo.anteil = R.tempo.von ? rund(R.tempo.schnell / R.tempo.von, 3) : 0;
  R.tempo.median = zeiten.length ? median(zeiten) : null;
  R.seiten.anteil = R.seiten.von ? rund(R.seiten.links / R.seiten.von, 3) : 0.5;
  if (sch) {
    for (const kp of KETTEN_PAARE) {
      const a = antworten[kp.id]; if (!gewaehlt(a)) continue;
      const p = vorhersage(kp.a, kp.b, sch);
      R.vorhersage.von++; R.vorhersage.erwartet += Math.max(p, 1 - p);
      if ((p >= 0.5) === (a.w === 'a')) R.vorhersage.treffer++;
    }
    R.vorhersage.erwartet = rund(R.vorhersage.erwartet, 2);
  }
  // Urteil: Wie viel Gewicht hat das Ergebnis?
  const gruende = []; let punkte = 0;
  const kf = R.kontrolle.von - R.kontrolle.richtig;
  if (kf >= 2) { punkte += 2; gruende.push('kontrolle'); } else if (kf === 1) { punkte += 1; gruende.push('kontrolle'); }
  if (R.leicht.von - R.leicht.richtig >= 2) { punkte += 1; gruende.push('leicht'); }
  if (R.wieder.von >= 3 && R.wieder.gleich <= R.wieder.von / 4) { punkte += 1; gruende.push('wieder'); }
  if (R.ketten.von === 2 && R.ketten.kreise.length === 2) { punkte += 1; gruende.push('ketten'); }
  if (R.tempo.anteil > 0.5) { punkte += 2; gruende.push('tempo'); } else if (R.tempo.anteil > 0.3) { punkte += 1; gruende.push('tempo'); }
  if (R.seiten.von >= 20 && (R.seiten.anteil > 0.85 || R.seiten.anteil < 0.15 || R.seiten.laengste >= 12)) { punkte += 1; gruende.push('seiten'); }
  R.urteil = punkte === 0 ? 'gut' : punkte === 1 ? 'mittel' : 'fraglich';
  R.gruende = gruende; R.punkte = punkte;
  return R;
}

export function kopfnuesse(antworten) {
  const liste = [];
  for (const s of ABLAUF) if (s.art === 'kopf') { const a = antworten[s.id]; if (gewaehlt(a)) liste.push({ id: s.id, sorte: s.sorte, richtig: richtigBei(s, a), ms: a.ms ?? null }); }
  const r = (id) => { const x = liste.find((y) => y.id === id); return x ? x.richtig : null; };
  return { richtig: liste.filter((x) => x.richtig).length, von: liste.length, liste,
    reflexion: liste.filter((x) => x.sorte === 'reflexion' && x.richtig).length, reflexionVon: liste.filter((x) => x.sorte === 'reflexion').length,
    schwung: r('n4'), taeuschung: r('n5') };
}

// Wo hast du am längsten überlegt? Haupt-Paare mit der längsten Zeit je Wort (im Verhältnis zu deinem eigenen Median).
export function zoegern(antworten, n = 3) {
  const z = [];
  for (const s of ABLAUF) { if (s.art !== 'paar') continue; const a = antworten[s.id]; if (!gewaehlt(a) || a.ms == null) continue; z.push({ id: s.id, je: a.ms / woerter(s), ms: a.ms, w: a.w }); }
  if (z.length < 10) return [];
  const med = median(z.map((x) => x.je));
  return z.filter((x) => x.je >= 1.5 * med).sort((a, b) => b.je - a.je).slice(0, n)
    .map((x) => ({ id: x.id, ms: x.ms, faktor: rund(x.je / med, 1), gewaehlt: SCHRITT[x.id][x.w].t, andere: SCHRITT[x.id][x.w === 'a' ? 'b' : 'a'].t }));
}

// Wie reagierst du auf eine Kopfnuss? Lese-Tempo der zwei Paare danach im Vergleich zu deinem üblichen Tempo (je Wort).
// Nach Fehlern werden viele Menschen langsamer und vorsichtiger (Rabbitt 1966) – hier nur als Spiegel, nicht als Messung.
export function nachFalle(antworten) {
  const je = (s) => { const a = antworten[s.id]; return gewaehlt(a) && a.ms != null ? a.ms / woerter(s) : null; };
  const alle = ABLAUF.filter((s) => s.art === 'paar').map(je).filter((x) => x != null);
  if (alle.length < 10) return null;
  const med = median(alle), danach = [];
  ABLAUF.forEach((s, i) => {
    if (s.art !== 'kopf' || !gewaehlt(antworten[s.id])) return;
    let n = 0; for (let j = i + 1; j < ABLAUF.length && n < 2; j++) if (ABLAUF[j].art === 'paar') { const x = je(ABLAUF[j]); if (x != null) danach.push(x); n++; }
  });
  if (danach.length < 4) return null;
  return { faktor: rund(median(danach) / med, 2), n: danach.length };
}

// ---------- Punkte, Sterne, Abzeichen ----------
export function punkte(antworten) {
  let p = 0;
  for (const s of ABLAUF) { const a = antworten[s.id]; if (!gewaehlt(a)) continue; p += 10; if ((s.art === 'kontrolle' || s.art === 'leicht') && richtigBei(s, a)) p += 20; if (s.art === 'kopf' && richtigBei(s, a)) p += 30; }
  return p;
}
export function sterne(antworten, nr) {
  const L = LEVEL.find((x) => x.nr === nr); if (!L) return 0;
  let falsch = 0, schnell = 0, n = 0;
  for (const id of L.folge) {
    const s = SCHRITT[id], a = antworten[id]; if (!gewaehlt(a)) continue;
    if ((s.art === 'kontrolle' || s.art === 'leicht') && !richtigBei(s, a)) falsch++;
    if ((s.art === 'paar' || s.art === 'duell') && a.ms != null) { n++; if (zuSchnell(s, a.ms)) schnell++; }
  }
  return Math.max(1, 3 - (falsch ? 1 : 0) - (n && schnell / n > 0.3 ? 1 : 0) - (falsch >= 2 ? 1 : 0));
}
export const ABZEICHEN = {
  adlerauge: { name: 'Adlerauge', text: 'Alle Kontrollfragen und leichten Fragen richtig.' },
  kopfbremse: { name: 'Kopf-Bremse', text: 'Mindestens 4 von 5 Kopfnüssen geknackt.' },
  treu: { name: 'Treue Linie', text: 'Bei allen Wiederholungen gleich gewählt und beide Ketten stimmig.' },
  ruhig: { name: 'Ruhige Hand', text: 'Fast alles in Ruhe gelesen, kaum etwas im Eiltempo.' },
  bonus: { name: 'Bonus-Held', text: 'Das Interessen-Duell auch noch gespielt.' }
};
export function abzeichen(Q, kopf, mitBonus) {
  const a = [];
  if (Q.kontrolle.von && Q.kontrolle.richtig === Q.kontrolle.von && Q.leicht.richtig === Q.leicht.von) a.push('adlerauge');
  if (kopf.von >= 5 && kopf.richtig >= 4) a.push('kopfbremse');
  if (Q.wieder.von === 4 && Q.wieder.gleich === 4 && Q.ketten.von === 2 && !Q.ketten.kreise.length) a.push('treu');
  if (Q.tempo.von >= 20 && Q.tempo.anteil <= 0.1) a.push('ruhig');
  if (mitBonus) a.push('bonus');
  return a;
}

// Erste Spur nach einem Level: der Bereich, der bisher am deutlichsten von der Mitte weg zeigt.
export function zwischenstand(antworten) {
  const beob = bigFiveBeob(antworten); if (beob.length < 6) return null;
  const sch = schaetze(beob, BEREICHE.length);
  let best = null;
  BEREICHE.forEach((B, i) => { const p = Phi(sch.mittel[i] / (Math.sqrt(sch.kov[i][i]) * MODELL.aufweiten)); const d = Math.abs(p - 0.5); if (!best || d > best.d) best = { id: B.id, p, d }; });
  return { bereich: best.id, richtung: best.p >= 0.5 ? 1 : -1, p: rund(Math.max(best.p, 1 - best.p), 2), n: beob.length };
}

// Vergleich mit dem Fragebogen (Modul bigfive): Reihenfolge der Bereiche (Spearman) und höchster/niedrigster Bereich.
export function vergleichBogen(bf, bereiche) {
  if (!bf || !bf.bereiche) return null;
  const ids = BEREICHE.map((b) => b.id).filter((id) => bf.bereiche[id] && typeof bf.bereiche[id].wert === 'number' && bereiche[id]);
  if (ids.length < 5) return null;
  const rang = (werte) => { const o = werte.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = Array(werte.length); o.forEach(([, i], k) => { r[i] = k + 1; }); return r; };
  const a = rang(ids.map((id) => bereiche[id].m)), b = rang(ids.map((id) => bf.bereiche[id].wert));
  const d2 = a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0), n = ids.length;
  const max = (r) => ids[r.indexOf(n)], min = (r) => ids[r.indexOf(1)];
  return { r: rund(1 - (6 * d2) / (n * (n * n - 1)), 2), hoch: { spiel: max(a), bogen: max(b) }, tief: { spiel: min(a), bogen: min(b) } };
}

// ---------- Gesamtergebnis ----------
export function auswerten(antworten, { saat = 1, start = null, ende = null } = {}) {
  const bf = bigFive(antworten);
  const Q = pruefungen(antworten, bf.sch);
  const kopf = kopfnuesse(antworten);
  const intr = interessen(antworten, saat);
  return {
    schema: 1, fassung: 'eo-1', modell: { ladung: MODELL.ladung, rest: MODELL.rest, aufweiten: MODELL.aufweiten, vorwissen: 'N(0, 1) je Bereich, unabhängig' },
    bereiche: bf.bereiche, vergleiche: bf.vergleiche, n: bf.n, schaetzung: bf.schaetzung,
    qualitaet: { urteil: Q.urteil, gruende: Q.gruende, kontrolle: Q.kontrolle, leicht: Q.leicht, wieder: Q.wieder, ketten: Q.ketten, tempo: Q.tempo, seiten: Q.seiten, vorhersage: Q.vorhersage },
    kopf, interessen: intr, zoegern: zoegern(antworten), nachFalle: nachFalle(antworten), punkte: punkte(antworten), abzeichen: abzeichen(Q, kopf, !!intr),
    dauer: start && ende ? Math.round((new Date(ende) - new Date(start)) / 1000) : null,
    quellen: ['brown2011', 'thurstone1927', 'johnson2014', 'meade2012', 'huang2012']
  };
}

// ---------- Hilfen ----------
function median(xs) { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function rund(x, n = 2) { const f = 10 ** n; return Math.round(x * f) / f; }
// Seite von Antwort a (links/rechts) für einen Lauf: fest, getauscht (Wiederholung) oder zufällig aus der Saat.
export function seiteA(s, saat) {
  if (s.seite) return s.seite;
  if (s.art === 'wieder') return seiteA(SCHRITT[s.von], saat) === 'l' ? 'r' : 'l';
  return hash(saat + ':' + s.id) % 2 ? 'l' : 'r';
}
