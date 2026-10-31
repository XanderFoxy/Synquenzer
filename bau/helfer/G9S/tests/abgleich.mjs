// Kosten-Abgleich G9a (§6.3: einmal am Prüfkorpus, Raster ±50 %): je Kosten-Teil ×0,5 / ×1,5, Maß = Mittel aus G9-02, G9-03, G9-04 (legato: Wortpausen 0–20 ms).
import fs from 'fs'; import {createRequire} from 'module';
import {loadVSM, sing, rng, lexikon, phrase, ausr} from './korpus.mjs';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js');
const HERE = new URL('.', import.meta.url).pathname, MU = HERE + '../../../../vendor/g9/syl/';
const M = loadVSM(), K = g9Make(); K.sylLoad('de', fs.readFileSync(MU + 'de-x-syllable.wasm')); K.sylLoad('en', fs.readFileSync(MU + 'en-us.wasm'));
const textOf = P => { let t = ''; P.forEach((y, i) => { if (i && y.w) t += ' '; t += y.x; }); return t; };
const near = (marks, on) => { let bk = -1, bd = .06; marks.forEach((m, k) => { const d = Math.abs(m.t - on); if (d <= bd) { bd = d; bk = k; } }); return bk; };
const cases = [], R = rng(4711);
for (let q = 0; q < 60; q++) {   // normal + legato + Melisma + Verschmelzen
  const lang = q % 2 ? 'en' : 'de', lex = lexikon(lang), {P} = phrase(R, lex, 6), kind = ['n', 'l', 'm', 'v'][q % 4];
  if (kind === 'm') P[2 + (q % 3)].mel = 3;
  const S = sing(P, {seed: 5000 + q, f0: 150 + 120 * R(), wordGap: kind === 'l' ? 0.01 : undefined});
  let marks = M.detectMarks(S.x, S.sr).map(m => ({t: m.t, conf: m.conf}));
  let fi = -1;
  if (kind === 'v') { fi = P.findIndex((y, i) => i > 1 && !y.w); if (fi < 0) fi = 3; const y0 = S.syl[fi], bk = near(marks, y0.on); marks = marks.filter((m, k) => k !== bk && !(m.t > y0.on && m.t <= y0.von + 0.03)); }
  cases.push({lang, P, S, marks, F: K.feat(S.x, S.sr, marks), W: K.words(textOf(P), lang), fi, kind});
}
function score(cost) {
  let ok = 0, n = 0, vOk = 0, vN = 0;
  for (const c of cases) { const s = K.align(c.W, c.marks, c.F, {cost}); const a = ausr(c.S.syl, c.marks, s); ok += a.ok; n += a.n;
    if (c.kind === 'v') { vN++; if (s[c.fi] && s[c.fi - 1] && s[c.fi].t === s[c.fi - 1].t) vOk++; } }
  return {ausr: +(100 * ok / n).toFixed(2), versch: +(100 * vOk / vN).toFixed(1), m: +((100 * ok / n + 100 * vOk / vN) / 2).toFixed(2)};
}
const base = score({}), tab = {basis: base};
for (const [k, v] of Object.entries(K.C)) { if (k === 'band' || k === 'tauS') continue; for (const f of [0.5, 1.5]) tab[k + '×' + f] = score({[k]: v * f}).m; }
const best = Object.entries(tab).filter(([k]) => k !== 'basis').sort((a, b) => b[1] - a[1])[0];
console.log(JSON.stringify(tab)); console.log('Basis', base.m, 'bestes', best, best[1] > base.m + 1 ? '→ Änderung lohnt' : '→ Werte bleiben (kein Gewinn > 1 Punkt)');
fs.writeFileSync(HERE + 'ergebnis-abgleich.json', JSON.stringify({tab, best}, null, 1));
