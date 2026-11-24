// Entweder – oder – Rechnung. Kein DOM, auch in Node testbar.
// Modell: Thurstone-Zwangswahl (Thurstone 1927; Thurstonian IRT nach Brown & Maydeu-Olivares 2011) für Paare:
//   Reiz einer Aussage i = λ · k_i · η_Bereich + ε_i,  ε_i ~ N(0, ψ²).   Wahl „i statt j“, wenn Reiz_i > Reiz_j:
//   P(i statt j | η) = Φ( λ (k_i η_a − k_j η_b) / √(ψ²_i + ψ²_j) ).
// Die Aussagen-Werte (λ, ψ², Schwellen) sind ANGENOMMEN (λ = 1, ψ² = 1, Schwelle 0), nicht an einer Stichprobe geschätzt.
// Schätzung: Vorwissen η ~ N(0, I) (alle Richtungen in der Mitte = „beides“), dann höchste Wahrscheinlichkeit nach allen Wahlen
// (MAP, Newton-Verfahren) und Unsicherheit aus der Krümmung (Laplace-Näherung), aufgeweitet mit 1,25.
// 0.3: Die Zahlen bleiben INNEN. Nach außen geht nur die Richtung in Worten: deutlich = 'klar' | 'leicht' | 'beides'
// (keine Prozente, keine Skala, kein Vergleich mit anderen Menschen, keine Prüf- oder Punkte-Werte).
import { AUSSAGEN, BEREICHE, PAARE, PAAR, WIEDER, KETTEN, SCHRITT, ABLAUF, TYP_REIHE, woerter } from './daten.js';

export const MODELL = { ladung: 1, rest: 1, aufweiten: 1.25, minPaare: 4, minDuelle: 10, zuege: 2000 };
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

// ---------- Richtungen aus den Haupt-Paaren ----------
const BI = Object.fromEntries(BEREICHE.map((b, i) => [b.id, i]));
// Koeffizienten für „a statt b“
export function koeff(aId, bId) {
  const a = AUSSAGEN[aId], b = AUSSAGEN[bId], c = new Map();
  c.set(BI[a.b], (c.get(BI[a.b]) || 0) + K * a.k); c.set(BI[b.b], (c.get(BI[b.b]) || 0) - K * b.k);
  return [...c.entries()];
}
// P(a statt b) bei bekanntem η (nur für Simulationen in Tests)
export function pPaar(aId, bId, eta) { return Phi(koeff(aId, bId).reduce((s, [i, k]) => s + k * eta[i], 0)); }
export const gewaehlt = (a) => !!(a && (a.w === 'a' || a.w === 'b'));
export function bigFiveBeob(antworten, ids = PAARE.map((p) => p.id)) {
  return ids.filter((id) => gewaehlt(antworten[id])).map((id) => ({ id, c: koeff(PAAR[id].a, PAAR[id].b), y: antworten[id].w === 'a' ? 1 : -1 }));
}
// p = wie sicher die Wahlen zum Pol „rechts“ zeigen (bleibt innen). Nach außen: Richtung + Deutlichkeit in Worten.
export function wortFuer(p) {
  if (p >= 0.9) return { richtung: 1, deutlich: 'klar' }; if (p >= 0.7) return { richtung: 1, deutlich: 'leicht' };
  if (p <= 0.1) return { richtung: -1, deutlich: 'klar' }; if (p <= 0.3) return { richtung: -1, deutlich: 'leicht' };
  return { richtung: 0, deutlich: 'beides' };
}
// Ergebnis je Bereich: { richtung: 1 | −1 | 0, deutlich, paare } – erst ab MODELL.minPaare beantworteten Paaren mit diesem Bereich.
export function richtungen(antworten) {
  const beob = bigFiveBeob(antworten), bereiche = {};
  if (!beob.length) return { n: 0, bereiche };
  const sch = schaetze(beob, BEREICHE.length), f = MODELL.aufweiten;
  BEREICHE.forEach((B, i) => {
    const paare = beob.filter((o) => o.c.some(([j]) => j === i)).length;
    if (paare < MODELL.minPaare) return;
    bereiche[B.id] = { ...wortFuer(Phi(sch.mittel[i] / (Math.sqrt(sch.kov[i][i]) * f))), paare };
  });
  return { n: beob.length, bereiche };
}
// Ein Beispiel aus seinen eigenen Wahlen für „woher“: ein Paar, in dem die gewählte Aussage zu diesem Bereich gehört
// und (wenn es eine Richtung gibt) in diese Richtung zeigt. Rückgabe { id, gewaehlt, andere } oder null.
export function beispiel(antworten, bereich, richtung = 0) {
  let ersatz = null;
  for (const p of PAARE) {
    const a = antworten[p.id]; if (!gewaehlt(a)) continue;
    const g = a.w === 'a' ? p.a : p.b, o = a.w === 'a' ? p.b : p.a, G = AUSSAGEN[g], O = AUSSAGEN[o];
    const x = { id: p.id, gewaehlt: G.t, andere: O.t };
    if (G.b === bereich && (!richtung || G.k === richtung)) return x;
    if (!ersatz && O.b === bereich && (!richtung || O.k === -richtung)) ersatz = x;
  }
  return ersatz;
}

// ---------- Tätigkeiten (Thurstone Fall V für sechs Bereiche) ----------
// Nach außen: welche zwei Bereiche vorn liegen (vorn), welcher eher hinten (hinten, falls deutlich), und wie deutlich.
export function interessen(antworten, saat = 1) {
  const DI = Object.fromEntries(TYP_REIHE.map((t, i) => [t, i]));
  const beob = [];
  for (const s of ABLAUF) {
    if (s.art !== 'duell') continue; const a = antworten[s.id]; if (!gewaehlt(a)) continue;
    beob.push({ c: [[DI[s.a.typ], Math.SQRT1_2], [DI[s.b.typ], -Math.SQRT1_2]], y: a.w === 'a' ? 1 : -1 });
  }
  if (beob.length < MODELL.minDuelle) return null;
  const sch = schaetze(beob, 6), f = MODELL.aufweiten;
  const L = cholesky(sch.kov.map((r) => r.map((x) => x * f * f))), rnd = zufall(saat >>> 0 || 1);
  const N = MODELL.zuege, top2 = Array(6).fill(0), letzt = Array(6).fill(0);
  for (let s = 0; s < N; s++) {
    const z = Array.from({ length: 6 }, () => { const u = Math.max(1e-12, rnd()), w = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); });
    const x = sch.mittel.map((m, i) => m + L[i].reduce((t, l, j) => t + l * z[j], 0));
    const ord = x.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    top2[ord[0][1]]++; top2[ord[1][1]]++; letzt[ord[5][1]]++;
  }
  const rang = TYP_REIHE.map((t, i) => ({ t, p: top2[i] / N, l: letzt[i] / N, m: sch.mittel[i] })).sort((a, b) => b.p - a.p || b.m - a.m);
  const [x0, x1] = rang, unten = [...rang].sort((a, b) => b.l - a.l)[0];
  const deutlich = Math.min(x0.p, x1.p) >= 0.75 ? 'klar' : x0.p >= 0.6 ? 'leicht' : 'beides';
  return { n: beob.length, rang: rang.map((x) => x.t), vorn: [x0.t, x1.t], hinten: unten.l >= 0.5 ? unten.t : null, deutlich };
}

// ---------- Einmal so, einmal so ----------
// Wiederholte Paare: { id, von, gleich }. Ohne Urteil – ein Wechsel heißt nur: beides passt.
export function zweimal(antworten) {
  const r = [];
  for (const w of WIEDER) { const a = antworten[w.id], o = antworten[w.von]; if (gewaehlt(a) && gewaehlt(o)) r.push({ id: w.id, von: w.von, gleich: a.w === o.w }); }
  return r;
}
// Dreier-Vergleiche: { id, kreis }. Kreis (A vor B, B vor C, C vor A) heißt: Die drei sprechen dich ähnlich an.
export function dreier(antworten) {
  const r = [];
  for (const k of KETTEN) {
    const ws = ['a', 'b', 'c'].map((x) => antworten[k.id + x]); if (!ws.every(gewaehlt)) continue;
    const vorn = ws.map((w) => w.w === 'a');   // a = A–B, b = B–C, c = C–A: Kreis, wenn alle „vorne“ oder alle „hinten“
    r.push({ id: k.id, kreis: vorn.every(Boolean) || vorn.every((x) => !x) });
  }
  return r;
}

// Wo hast du länger überlegt? Haupt-Paare mit der längsten Zeit je Wort im Verhältnis zu deinem eigenen üblichen Tempo.
// Die Zeit bleibt innen; nach außen nur die Paare (in Worten). Langes Überlegen heißt oft: beides passt ein bisschen.
export function zoegern(antworten, n = 3) {
  const z = [];
  for (const s of ABLAUF) { if (s.art !== 'paar') continue; const a = antworten[s.id]; if (!gewaehlt(a) || a.ms == null) continue; z.push({ id: s.id, je: a.ms / woerter(s), w: a.w }); }
  if (z.length < 10) return [];
  const med = median(z.map((x) => x.je));
  return z.filter((x) => x.je >= 1.5 * med).sort((a, b) => b.je - a.je).slice(0, n)
    .map((x) => ({ id: x.id, gewaehlt: SCHRITT[x.id][x.w].t, andere: SCHRITT[x.id][x.w === 'a' ? 'b' : 'a'].t }));
}

// ---------- Gesamt (in Worten) ----------
export function auswerten(antworten, { saat = 1 } = {}) {
  const rb = richtungen(antworten);
  return {
    schema: 2, fassung: 'eo-2', n: rb.n, bereiche: rb.bereiche, interessen: interessen(antworten, saat),
    zweimal: zweimal(antworten), dreier: dreier(antworten), zoegern: zoegern(antworten),
    quellen: ['brown2011', 'thurstone1927', 'johnson2014']
  };
}
// Ergebnis der Vorlage 0.2.1 (schema 1: bereiche.{stufe, richtung}) in Worte übersetzen – nur, falls keine Wahlen mehr da sind.
export function ausAlt(res) {
  if (!res || !res.bereiche) return null;
  const bereiche = {};
  for (const B of BEREICHE) {
    const b = res.bereiche[B.id]; if (!b) continue;
    if (b.deutlich) { bereiche[B.id] = { richtung: b.richtung || 0, deutlich: b.deutlich }; continue; }
    bereiche[B.id] = b.stufe ? { richtung: b.richtung > 0 ? 1 : -1, deutlich: b.stufe === 2 ? 'klar' : 'leicht' } : { richtung: 0, deutlich: 'beides' };
  }
  let intr = null;
  if (res.interessen && Array.isArray(res.interessen.rang) && res.interessen.rang.length >= 2) {
    intr = res.interessen.vorn ? res.interessen : { rang: res.interessen.rang, vorn: res.interessen.rang.slice(0, 2), hinten: null, deutlich: 'leicht' };
  }
  return { schema: 2, n: res.n || 0, bereiche, interessen: intr, zweimal: res.zweimal || [], dreier: res.dreier || [], zoegern: (res.zoegern || []).map(({ id, gewaehlt: g, andere }) => ({ id, gewaehlt: g, andere })) };
}

// ---------- Hilfen ----------
function median(xs) { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
// Seite von Antwort a (links/rechts) für einen Lauf: getauscht (Wiederholung) oder zufällig aus der Saat.
export function seiteA(s, saat) {
  if (s.seite) return s.seite;
  if (s.art === 'wieder') return seiteA(SCHRITT[s.von], saat) === 'l' ? 'r' : 'l';
  return hash(saat + ':' + s.id) % 2 ? 'l' : 'r';
}
