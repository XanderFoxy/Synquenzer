// Kaninchenbau 0.2 – Auswertung. Reine Funktionen (kein DOM, kein Speicher), auch in Node testbar (test/auswertung-test.mjs).
// antw = { [frageId]: { w: Index der gewählten Möglichkeit | −1 (übersprungen), t: zuletzt geändert (ms), t0: zuerst beantwortet } }
// extra = [{ m, x, quelle }] – Antworten aus anderen Teilen (Startfragen von 0.1 → Neugier), zählen wie Antworten.
// Alles regelbasiert und nachvollziehbar: Mittelwerte, Zählungen, feste Regeln aus wesen.js. Keine externe KI, nichts wird gesendet.
import { BEREICHE, BEREICH, MERKMALE, MERKMAL, FRAGEN, FRAGE, SKALA, STUFE, ZIEL, THEMEN, VERBINDUNGEN, ZUKUNFT, LERN_GAENGE } from './wesen.js';

export const optionen = (f) => (f.art === 'skala' ? SKALA : f.art === 'stufe' ? STUFE : f.opt);
export const antwortText = (f, w) => (w >= 0 ? optionen(f)[w]?.[0] ?? '' : 'übersprungen');
export function frageText(f) {
  if (f.art === 'stufe') return `${MERKMAL[f.m].gebiete[f.gebiet]} – wie gut kennst du dich aus?`;
  return f.text;
}
// Wert einer Antwort: Achse → Zahl −1…+1, Thema → Thema-Schlüssel, Stufe → 0–3
export function wert(f, w) {
  if (w < 0) return null;
  if (f.art === 'skala') return SKALA[w] ? SKALA[w][1] * f.r : null;
  if (f.art === 'stufe') return STUFE[w] ? STUFE[w][1] : null;
  return f.opt[w] ? f.opt[w][1] : null;
}
const gueltig = (f, a) => a && Number.isInteger(a.w) && a.w >= 0 && a.w < optionen(f).length;
export const zielVon = (m) => (MERKMAL[m]?.ziel || ZIEL);

// ---------- Lage: alle Merkmale, Bereiche, Gesamt ----------
function leerMerkmal(mm) { return { id: mm.id, b: mm.b, art: mm.art, zusatz: !!mm.zusatz, n: 0, werte: [], tags: {}, gebiete: {}, fragen: [] }; }
function fertigMerkmal(L, mm) {
  if (mm.art === 'achse') {
    const v = L.werte; L.mittel = v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
    L.widerspruch = v.some((x) => x >= 0.5) && v.some((x) => x <= -0.5);
    L.pol = Math.abs(L.mittel) < 0.2 ? 0 : Math.sign(L.mittel);
  } else if (mm.art === 'thema') {
    const r = Object.entries(L.tags).sort((a, b) => b[1] - a[1]);
    L.rang = r.map(([t]) => t);
    const max = r.length ? r[0][1] : 0;
    L.top = r.filter(([, c]) => c === max && c > 0).map(([t]) => t).slice(0, 2);
    L.anteilTop = L.n ? max / L.n : 0;
  } else if (mm.art === 'stufe') {
    L.stark = Object.entries(L.gebiete).filter(([, s]) => s >= 2).sort((a, b) => b[1] - a[1]).map(([g]) => g);
    L.neu = Object.entries(L.gebiete).filter(([, s]) => s === 0).map(([g]) => g);
  }
  const ziel = zielVon(mm.id);
  L.anteil = mm.zusatz ? (L.n ? 1 : 0) : Math.min(L.n, ziel) / ziel;
  L.sicher = !L.n ? 'offen' : (!mm.zusatz && L.n < ziel) ? 'vorläufig' : L.widerspruch ? 'gemischt' : (mm.art === 'achse' && Math.abs(L.mittel) >= 0.5) || (mm.art === 'thema' && L.anteilTop >= 0.6) ? 'klar' : 'eher';
  L.satz = satz(L, mm);
  return L;
}
function zaehle(L, mm, f, x) {
  if (x == null) return;
  L.n++; if (f) L.fragen.push(f.id);
  if (mm.art === 'achse') L.werte.push(x);
  else if (mm.art === 'thema') L.tags[x] = (L.tags[x] || 0) + 1;
  else if (mm.art === 'stufe' && f) L.gebiete[f.gebiet] = x;
}
// Bedingung „wenn“ einer Nachfrage (gegen die Grund-Merkmale): {m, pol} oder {m, tag}; Liste = eine reicht
export function wennOk(f, m) {
  if (!f.wenn) return true;
  return f.wenn.some((c) => { const L = m[c.m]; if (!L || !L.n) return false; return c.tag ? (L.tags[c.tag] || 0) > 0 : L.mittel * c.pol >= 0.2; });
}

export function lage(antw = {}, extra = []) {
  const m = {};
  for (const mm of MERKMALE) m[mm.id] = leerMerkmal(mm);
  // 1) Grund-Merkmale
  for (const f of FRAGEN) {
    const mm = MERKMAL[f.m]; if (mm.zusatz) continue;
    const a = antw[f.id]; if (gueltig(f, a)) zaehle(m[f.m], mm, f, wert(f, a.w));
  }
  for (const e of extra) { const mm = MERKMAL[e.m]; if (mm && !mm.zusatz) zaehle(m[e.m], mm, null, e.x); }
  for (const mm of MERKMALE) if (!mm.zusatz) fertigMerkmal(m[mm.id], mm);
  // 2) Nachfragen – nur, wenn ihre Bedingung (noch) gilt
  const ungueltig = [];
  for (const f of FRAGEN) {
    const mm = MERKMAL[f.m]; if (!mm.zusatz) continue;
    const a = antw[f.id]; if (!gueltig(f, a)) continue;
    if (wennOk(f, m)) zaehle(m[f.m], mm, f, wert(f, a.w)); else ungueltig.push(f.id);
  }
  for (const mm of MERKMALE) if (mm.zusatz) fertigMerkmal(m[mm.id], mm);
  const b = {};
  for (const B of BEREICHE) {
    const ms = MERKMALE.filter((x) => x.b === B.id && !x.zusatz);
    const n = MERKMALE.filter((x) => x.b === B.id).reduce((s, x) => s + m[x.id].n, 0);
    b[B.id] = { anteil: ms.reduce((s, x) => s + m[x.id].anteil, 0) / ms.length, n, merkmale: ms.length, fertig: ms.filter((x) => m[x.id].anteil >= 1).length };
  }
  const gesamt = BEREICHE.reduce((s, B) => s + b[B.id].anteil, 0) / BEREICHE.length;
  const antworten = Object.entries(antw).filter(([id, a]) => FRAGE[id] && gueltig(FRAGE[id], a) && !ungueltig.includes(id)).length;
  const uebersprungen = Object.entries(antw).filter(([id, a]) => FRAGE[id] && a && a.w === -1).length;
  return { m, b, gesamt, antworten, uebersprungen, ungueltig, extra: extra.length };
}
export const prozent = (x) => Math.round(Math.max(0, Math.min(1, x)) * 100);

// ---------- Sätze ----------
export function wortVon(mm, tag) { return mm.wort?.[tag] || THEMEN[tag] || tag; }
const liste = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' und ' + xs[xs.length - 1]);
function satz(L, mm) {
  if (!L.n) return '';
  if (mm.art === 'achse') return L.pol < 0 ? mm.satzL : L.pol > 0 ? mm.satzR : mm.satzM;
  if (mm.art === 'thema') return mm.satz.replace('{x}', liste(L.top.map((t) => wortVon(mm, t))));
  if (mm.art === 'stufe') {
    if (L.stark.length) return `Gut kennst du dich aus mit: ${liste(L.stark.slice(0, 3).map((g) => mm.gebiete[g]))}.`;
    return 'Vieles ist für dich noch neu – viel Platz zum Entdecken.';
  }
  return '';
}
// Wie deutlich ist ein Merkmal (für die Auswahl im Kern): 0 … 1
function deutlich(L) {
  if (!L || L.n < 1) return 0;
  const menge = Math.min(L.n, zielVon(L.id)) / zielVon(L.id);
  if (L.art === 'achse') return (L.pol === 0 ? (L.widerspruch ? 0 : 0.25) : Math.abs(L.mittel)) * menge * (L.widerspruch ? 0.5 : 1);
  if (L.art === 'thema') return L.anteilTop * menge * 0.9;
  if (L.art === 'stufe') return L.stark.length ? 0.55 * menge : 0.2 * menge;
  return 0;
}

// ---------- Bedingungen für Verbindungen und Ideen ----------
// x: −1/+1 (Pol einer Achse), '*' (irgendein Thema vorn), 'a|b' (eines dieser Themen vorn)
function gilt(lg, mId, x, extra) {
  if (mId === 'lernen') return lernThema(lg) ? 0.6 : 0;
  const L = lg.m[mId]; if (!L) return 0;
  if (!L.n) return 0;
  // Eine einzelne Antwort zählt nur, wenn sie deutlich ist – und dann nur halb so stark (vorläufig)
  const einzeln = !L.zusatz && L.n < 2;
  if (typeof x === 'number') { const v = L.mittel * x; if (einzeln) return v >= 0.75 ? 0.5 * v : 0; return v >= 0.25 && !L.widerspruch ? Math.min(1, v) : 0; }
  if (L.art !== 'thema') return 0;
  if (einzeln) return 0;
  if (x === '*') return L.top.length ? Math.max(0.4, L.anteilTop) : 0;
  const tags = x.split('|'); const vorn = L.rang.slice(0, 2).filter((t) => (L.tags[t] || 0) > 0);
  return tags.some((t) => vorn.includes(t)) ? 0.7 : 0;
}
function lernThema(lg) {
  const L = lg.m['w-neugier'];
  return (L?.rang || []).find((t) => LERN_GAENGE[t] && L.tags[t] > 0) || null;
}
const topWort = (lg, mId) => { const L = lg.m[mId]; return L?.top?.length ? liste(L.top.map((t) => wortVon(MERKMAL[mId], t))) : ''; };

export function verbindungen(lg) {
  const r = [];
  for (const v of VERBINDUNGEN) {
    const sa = gilt(lg, v.a[0], v.a[1]), sb = gilt(lg, v.b[0], v.b[1]);
    if (!sa || !sb) continue;
    r.push({ a: v.a[0], b: v.b[0], ba: MERKMAL[v.a[0]].b, bb: MERKMAL[v.b[0]].b, art: v.art, staerke: sa * sb, text: v.text.replace('{b}', topWort(lg, v.b[0])) });
  }
  return r.sort((p, q) => q.staerke - p.staerke);
}

// Rote Fäden: ein Thema, das in mehreren Bereichen auftaucht
export function faeden(lg) {
  const r = [];
  for (const t of Object.keys(THEMEN)) {
    const wo = new Map();
    for (const mm of MERKMALE) {
      const L = lg.m[mm.id]; let c = 0;
      if (mm.art === 'thema') c = L.tags[t] || 0;
      else if (mm.art === 'stufe') c = (L.gebiete[t] || 0) >= 2 ? 1 : 0;
      if (c) wo.set(mm.b, (wo.get(mm.b) || 0) + c);
    }
    const summe = [...wo.values()].reduce((s, c) => s + c, 0);
    if (wo.size >= 2 && summe >= 3) r.push({ tag: t, name: THEMEN[t], bereiche: BEREICHE.map((B) => B.id).filter((id) => wo.has(id)), summe });
  }
  return r.sort((p, q) => q.bereiche.length - p.bereiche.length || q.summe - p.summe).slice(0, 3);
}

// ---------- Kern: verstreute Antworten → wenige Sätze ----------
export function kern(lg) {
  const jeBereich = [];
  for (const B of BEREICHE) {
    let best = null, bs = 0;
    for (const mm of MERKMALE) {
      if (mm.b !== B.id || mm.zusatz) continue;
      const s = deutlich(lg.m[mm.id]);
      if (s > bs) { bs = s; best = mm.id; }
    }
    if (best && bs >= 0.15) jeBereich.push({ b: B.id, m: best, text: lg.m[best].satz, sicher: lg.m[best].sicher, s: bs });
  }
  const saetze = [...jeBereich].sort((p, q) => q.s - p.s).slice(0, 5).sort((p, q) => BEREICH[p.b].i - BEREICH[q.b].i);
  const woerter = MERKMALE.filter((mm) => mm.art === 'achse')
    .map((mm) => ({ mm, L: lg.m[mm.id], s: deutlich(lg.m[mm.id]) }))
    .filter((x) => x.L.pol !== 0 && x.L.n >= 2 && x.s >= 0.3).sort((p, q) => q.s - p.s).slice(0, 3)
    .map((x) => (x.L.pol < 0 ? x.mm.wortL : x.mm.wortR));
  const fd = faeden(lg)[0] || null;
  const sp = verbindungen(lg).filter((v) => v.art === 'spannung').slice(0, 1);
  return { kurz: woerter.join(', '), saetze, faden: fd, spannung: sp[0] || null };
}

// ---------- Ideen für die Zukunft ----------
// stand(astId) → 0–3 geschaffte Stufen (aus dem Lernen-Teil), titel(astId) → Name des Gangs
export function zukunft(lg, { stand = () => 0, titel = (id) => id, weg = [] } = {}) {
  const r = [];
  for (const z of ZUKUNFT) {
    if (weg.includes(z.id)) continue;
    let s = 1;
    for (const [m, x] of z.wenn) { const g = gilt(lg, m, x); s *= g; if (!s) break; }
    if (!s) continue;
    let text = z.text, weil = z.weil, link = z.link ? [...z.link] : null;
    const kraft = topWort(lg, 'g-kraft');
    const gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    text = text.replace('{g-kraft}', gross(kraft)); weil = weil.replace('{g-kraft}', gross(kraft));
    if (z.id === 'gang') {
      const t = lernThema(lg); const gaenge = LERN_GAENGE[t] || [];
      const id = gaenge.find((g) => stand(g) < 3); if (!id) continue;
      text = text.replace('{gang}', titel(id)); weil = weil.replace('{lernen}', THEMEN[t]); link[0] = link[0].replace('{gangId}', id);
    }
    r.push({ id: z.id, titel: z.titel, text, weil, link, s });
  }
  return r.sort((p, q) => q.s - p.s).slice(0, 4);
}

// ---------- Nächste Frage (passt sich an) ----------
export function zufall(saat, text) { let h = (2166136261 ^ (saat >>> 0)) >>> 0; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
const nrIn = (f) => Number(f.id.slice(f.m.length + 1)) - 1;

// gestellt = IDs dieser Runde (in Reihenfolge). Liefert die beste noch offene Frage oder null.
export function naechste(antw, { bereich = null, gestellt = [], saat = 1, extra = [], lg = null } = {}) {
  lg = lg || lage(antw, extra);
  const letzte = gestellt.map((id) => FRAGE[id]).filter(Boolean);
  const l1 = letzte[letzte.length - 1], l2 = letzte[letzte.length - 2];
  const kandidat = (zweiteChance) => {
    let best = null, bs = -Infinity;
    for (const f of FRAGEN) {
      if (bereich && f.b !== bereich) continue;
      if (gestellt.includes(f.id)) continue;
      const a = antw[f.id];
      if (zweiteChance ? !(a && a.w === -1) : a) continue;
      const mm = MERKMAL[f.m];
      if (mm.zusatz && !wennOk(f, lg.m)) continue;
      const L = lg.m[f.m], ziel = zielVon(f.m);
      let s = 0;
      if (mm.zusatz) {
        // Nachfrage direkt nach der auslösenden Antwort: wirkt wie ein Gespräch
        const frisch = f.wenn.some((c) => letzte.slice(-3).some((q) => q.m === c.m));
        s += frisch ? 7 : 1.5;
      } else {
        s += (1 - Math.min(L.n, ziel) / ziel) * 3;
        if (L.n >= ziel) s -= L.sicher === 'gemischt' && L.n < ziel + 2 ? 0.5 : 3.5;   // gemischt → noch eine Kontrollfrage
      }
      s += (1 - lg.b[f.b].anteil) * 2;
      if (!bereich) { if (l1 && l1.b === f.b) s -= 2.5; if (l2 && l2.b === f.b) s -= 1; }
      if (letzte.slice(-3).some((q) => q.m === f.m) && !mm.zusatz) s -= 2;
      if (l1 && l1.art === f.art) s -= 0.6;
      s -= nrIn(f) * 0.15;
      s += zufall(saat, f.id) * 0.9;
      if (s > bs) { bs = s; best = f; }
    }
    return best;
  };
  return kandidat(false) || kandidat(true);
}
export function offeneZahl(antw, bereich = null) {
  const lg = lage(antw);
  return FRAGEN.filter((f) => (!bereich || f.b === bereich) && !antw[f.id] && (!MERKMAL[f.m].zusatz || wennOk(f, lg.m))).length;
}

// ---------- Stücke für das Defragmentieren ----------
// Jede Frage hat einen festen, verstreuten Platz (Mischung nach Prüfsumme). Defragmentierte Antworten liegen sortiert vorn
// (Bereich → Merkmal), neue oder geänderte Antworten (t > defragT) liegen verstreut im freien Platz.
const PLAETZE = (() => {
  const ids = FRAGEN.map((f) => f.id);
  const p = ids.map((id, i) => ({ id, k: zufall(7, id) + i * 1e-9 })).sort((a, b) => a.k - b.k);
  return Object.fromEntries(p.map((x, i) => [x.id, i]));
})();
export function stuecke(antw, defragT = 0, lg = null) {
  lg = lg || lage(antw);
  const N = FRAGEN.length;
  const da = FRAGEN.filter((f) => gueltig(f, antw[f.id]) && !lg.ungueltig.includes(f.id));
  const sortiert = da.filter((f) => defragT && antw[f.id].t <= defragT);
  const ordnung = (f) => BEREICH[f.b].i * 1000 + MERKMALE.findIndex((x) => x.id === f.m) * 10 + nrIn(f) / 100;
  sortiert.sort((a, b) => ordnung(a) - ordnung(b));
  const belegt = new Set(); const pos = {};
  sortiert.forEach((f, i) => { pos[f.id] = i; belegt.add(i); });
  const neu = da.filter((f) => !pos.hasOwnProperty(f.id));
  for (const f of neu) { let p = PLAETZE[f.id]; while (belegt.has(p)) p = (p + 1) % N; pos[f.id] = p; belegt.add(p); }
  const uebersprungen = FRAGEN.filter((f) => antw[f.id] && antw[f.id].w === -1).map((f) => f.id);
  return { N, sortiert: sortiert.length, neu: neu.length, stuecke: da.map((f) => ({ id: f.id, b: f.b, pos: pos[f.id], neu: !sortiert.includes(f) })), uebersprungen };
}
// Neue Ordnung nach dem Defragmentieren (alle Antworten sortiert)
export const defragOrdnung = (antw, lg) => stuecke(antw, Number.MAX_SAFE_INTEGER, lg);

// ---------- Ideen-Notizen: grob nach Themen ordnen (Schlüsselwörter) ----------
const SCHLUESSEL = {
  musik: /song|musik|lied|beat|melod|akkord|klang|sound|album|band|sing|gesang|synth|track|mix|master/i,
  worte: /buch|text|geschicht|schreib|gedicht|wort|rede|sprach|podcast/i,
  bilder: /bild|foto|film|video|zeichn|mal|farb|design|logo/i,
  technik: /app|programm|code|computer|technik|website|seite|software|ki\b|roboter/i,
  bauen: /bau|werkst|holz|basteln|reparier|möbel|garten/i,
  menschen: /freund|familie|leute|team|zusammen|gemeinsam|helfen|verein/i,
  bewegung: /sport|lauf|rad|tanz|wander|training|fitness/i,
  natur: /natur|wald|tier|pflanz|meer|berg/i,
  reisen: /reis|urlaub|stadt|land|fahrt|ausflug/i
};
export function ideenThema(text) {
  for (const [t, re] of Object.entries(SCHLUESSEL)) if (re.test(text)) return t;
  return null;
}
