// G9-02 … G9-06, G9-09, G9-55 auf dem synthetischen Korpus K-G9 (c). Marken = echter VS5a-Kern (detectMarks).
import fs from 'fs'; import {createRequire} from 'module';
import {loadVSM, sing, rng, lexikon, phrase, ausr} from './korpus.mjs';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js');
const HERE = new URL('.', import.meta.url).pathname, MU = HERE + '../../../../vendor/g9/syl/';
const M = loadVSM(), K = g9Make();
K.sylLoad('de', fs.readFileSync(MU + 'de-x-syllable.wasm')); K.sylLoad('en', fs.readFileSync(MU + 'en-us.wasm'));
const COST = process.env.G9_COST ? JSON.parse(process.env.G9_COST) : null, OPT = COST ? {cost: COST} : {};
const take = (P, seed, o) => { const S = sing(P, Object.assign({seed}, o)); const marks = M.detectMarks(S.x, S.sr).map(m => ({t: m.t, conf: m.conf})); return {S, marks, F: K.feat(S.x, S.sr, marks)}; };
const textOf = P => { let t = ''; P.forEach((y, i) => { if (i && y.line) t += '\n'; else if (i && y.w) t += ' '; t += y.x; }); return t; };
const R = rng(2024), res = {}, show = process.argv.includes('-v');
// Korpus: 40 DE + 40 EN Phrasen
const korpus = [];
for (const lang of ['de', 'en']) { const lex = lexikon(lang); for (let p = 0; p < 40; p++) { const {P} = phrase(R, lex, 5 + Math.floor(R() * 4)); korpus.push({lang, P, seed: 100 + korpus.length, f0: 150 + 150 * R()}); } }
// G9-02
let n = 0, okc = 0; const errs = [];
for (const c of korpus) {
  c.T = take(c.P, c.seed, {f0: c.f0});
  const s = K.align(K.words(textOf(c.P), c.lang), c.T.marks, c.T.F, OPT);
  c.s = s;
  if (s.length !== c.P.length) { c.bad = 'Silbenzahl ' + s.length + '≠' + c.P.length; }
  const a = ausr(c.T.S.syl, c.T.marks, s); n += a.n; okc += a.ok; if (a.med === a.med) errs.push(a.med);
  c.q = a.q;
}
// Median über alle Silben mit eigener Marke
const allErr = []; for (const c of korpus) c.T.S.syl.forEach((y, i) => { const g = c.s[i]; if (g && !g.j && !g.o) { let bk = -1, bd = .06; c.T.marks.forEach((m, k) => { const d = Math.abs(m.t - y.on); if (d <= bd) { bd = d; bk = k; } }); if (bk >= 0 && Math.abs(g.t - c.T.marks[bk].t) < 1e-5) allErr.push(Math.abs(g.t - y.on)); } });
allErr.sort((a, b) => a - b);
res['G9-02'] = {silben: n, richtig: +(100 * okc / n).toFixed(1), medianMs: +(1000 * allErr[allErr.length >> 1]).toFixed(1), marken: korpus.reduce((a, c) => a + c.T.marks.length, 0), pass: okc / n >= 0.92 && allErr[allErr.length >> 1] <= 0.025};
// VS5b-Vergleich auf demselben Korpus
let vOk = 0, vN = 0; for (const c of korpus) { const v = K.fromVs5b(textOf(c.P).replace(/\n/g, ' '), c.T.marks, c.lang); const a = ausr(c.T.S.syl, c.T.marks, K.normLy(v).s); vOk += a.ok; vN += a.n; }
res['VS5b-von-links'] = {richtig: +(100 * vOk / vN).toFixed(1)};
// G9-03 Melisma (40 Fälle), G9-04 Verschmelzen (30 Fälle)
const caseRun = (mk, nCase, check) => { let pass = 0, vs = 0; const log = []; for (let q = 0; q < nCase; q++) { const lang = q % 2 ? 'en' : 'de', lex = lexikon(lang); const c = mk(lex, q); const T = take(c.P, 900 + q * 7 + nCase, {f0: 160 + 10 * (q % 9)}); const s = K.align(K.words(textOf(c.P), lang), T.marks, T.F, OPT); const v = K.normLy(K.fromVs5b(textOf(c.P).replace(/\n/g, ' '), T.marks, lang)).s; const r = check(c, T, s), rv = check(c, T, v); if (r) pass++; if (rv) vs++; if (!r) log.push(textOf(c.P)); } return {faelle: nCase, ok: pass, quote: +(100 * pass / nCase).toFixed(1), vs5b: +(100 * vs / nCase).toFixed(1), fehl: log.slice(0, 5)}; };
const rightAfter = (truth, marks, s, from) => { for (let i = from; i < truth.length; i++) { let bk = -1, bd = .06; marks.forEach((m, k) => { const d = Math.abs(m.t - truth[i].on); if (d <= bd) { bd = d; bk = k; } }); if (bk < 0) continue; if (!s[i] || Math.abs(s[i].t - marks[bk].t) > 1e-5) return false; } return true; };
res['G9-03'] = caseRun((lex, q) => { const {P} = phrase(rng(50 + q), lex, 6); const mi = 1 + (q % Math.max(1, P.length - 3)); P[mi].mel = 3; return {P, mi}; }, 40, (c, T, s) => rightAfter(T.S.syl, T.marks, s, c.mi + 1));
res['G9-03'].pass = res['G9-03'].quote >= 90;
{ let ok = 0, vs = 0; const fehl = [];
  for (let q = 0; q < 30; q++) {
    const lang = q % 2 ? 'en' : 'de', lex = lexikon(lang); const {P} = phrase(rng(80 + q), lex, 6);
    let fi = P.findIndex((y, i) => i > 1 && !y.w); if (fi < 0) fi = 3;
    const T = take(P, 930 + q * 7, {f0: 160 + 10 * (q % 9)});
    let bk = -1, bd = .06; T.marks.forEach((m, k) => { const d = Math.abs(m.t - T.S.syl[fi].on); if (d <= bd) { bd = d; bk = k; } });
    if (bk < 0) { q--; continue; }
    const y0 = T.S.syl[fi], mk = T.marks.filter((m, k) => k !== bk && !(m.t > y0.on && m.t <= y0.von + 0.03)), F = K.feat(T.S.x, T.S.sr, mk);   // Einsatz entfernt (Konsonant- und Vokal-Marke der Silbe)
    const s = K.align(K.words(textOf(P), lang), mk, F, OPT), v = K.normLy(K.fromVs5b(textOf(P).replace(/\n/g, ' '), mk, lang)).s;
    const chk = z => z[fi] && z[fi - 1] && z[fi].t === z[fi - 1].t && rightAfter(T.S.syl, mk, z, fi + 1);
    if (chk(s)) ok++; else { fehl.push(textOf(P) + ' #' + fi); if (process.env.DBG4) console.log('W', T.S.syl.map(y => y.x + '@' + y.on.toFixed(3)).join(' '), '\nE', s.map(y => y.x + '@' + y.t.toFixed(3) + (y.j ? 'j' : '')).join(' '), '\nM', mk.map((m, k) => m.t.toFixed(3) + (F[k].vf ? 'v' : '')).join(' ')); } if (chk(v)) vs++;
  }
  res['G9-04'] = {faelle: 30, ok, quote: +(100 * ok / 30).toFixed(1), vs5b: +(100 * vs / 30).toFixed(1), fehl: fehl.slice(0, 5)}; }
res['G9-04'].pass = res['G9-04'].quote >= 90;
// G9-05 Zeilen: 8 Zeilen, 8 Atempausen ≥ 300 ms
{ let ok = 0; const lex = lexikon('de'), P = []; const R5 = rng(5);
  for (let l = 0; l < 8; l++) { const {P: p} = phrase(R5, lex, 2 + Math.floor(R5() * 2)); p[0].line = l > 0; P.push(...p); }
  const T = take(P, 555, {f0: 210}); const s = K.align(K.words(textOf(P), 'de'), T.marks, T.F, OPT);
  P.forEach((y, i) => { if (i === 0 || y.line) { const on = T.S.syl[i].on; let bk = -1, bd = .06; T.marks.forEach((m, k) => { const d = Math.abs(m.t - on); if (d <= bd) { bd = d; bk = k; } }); if (bk >= 0 && Math.abs(s[i].t - T.marks[bk].t) < 1e-5 && s[i].w === 2) ok++; } });
  res['G9-05'] = {zeilen: 8, ok, pass: ok === 8}; }
// G9-06 Getipptes Wort an seinem richtigen ersten Abschnitt (leerer Take), Vorschau = Ergebnis
{ let n6 = 0, ok6 = 0, pv = 0, pvn = 0;
  for (const c of korpus) { const T = c.T; let i = 0;
    while (i < c.P.length) { let e = i + 1; while (e < c.P.length && !c.P[e].w) e++; const ns = e - i;
      if (ns === 2 || ns === 3) { let bk = -1, bd = .06; T.marks.forEach((m, k) => { const d = Math.abs(m.t - T.S.syl[i].on); if (d <= bd) { bd = d; bk = k; } });
        if (bk >= 0) { const w = c.P.slice(i, e).map(y => y.x).join(''); const r = K.apply(null, T.marks, T.F, {op: 'wort', k: bk, text: w, lang: c.lang}, OPT); const pr = K.preview(null, T.marks, T.F, bk, w, c.lang, OPT);
          pvn++; if (pr && JSON.stringify(pr.s) === JSON.stringify(r.s)) pv++;
          n6++; const sub = T.S.syl.slice(i, e); if (r.ok && r.s.length === ns && rightAfter(sub, T.marks, r.s, 0)) ok6++; } }
      i = e; } }
  res['G9-06'] = {woerter: n6, richtig: +(100 * ok6 / n6).toFixed(1), vorschauGleich: +(100 * pv / pvn).toFixed(1), pass: ok6 / n6 >= 0.9 && pv === pvn}; }
// G9-55 Tipps (synthetisch: je Silbe ein Tipp am wahren Vokal-Einsatz ± 25 ms gleichverteilt)
{ const R55 = rng(55); let a0 = 0, a1 = 0, nn = 0;
  for (const c of korpus) { const tips = c.T.S.syl.map(y => [y.von + (R55() - 0.5) * 0.05, y.von + 0.08]);
    const W = K.words(textOf(c.P), c.lang); const s1 = K.align(W, c.T.marks, c.T.F, Object.assign({tips, tipOn: true}, OPT));
    const A = ausr(c.T.S.syl, c.T.marks, c.s), B = ausr(c.T.S.syl, c.T.marks, s1); a0 += A.ok; a1 += B.ok; nn += A.n; }
  const d = 100 * (a1 - a0) / nn;
  res['G9-55'] = {ohne: +(100 * a0 / nn).toFixed(1), mit: +(100 * a1 / nn).toFixed(1), punkte: +d.toFixed(1), pass: d >= 3, folge: d >= 3 ? 'Tipp-Kosten an' : 'Tipp-Kosten bleiben aus'}; }
// G9-09 Rechenzeit: 300 Marken × 250 Silben; lokale Wort-Ausrichtung
{ const R9 = rng(9), marks = [], F = []; let t = 0.3; for (let k = 0; k < 300; k++) { t += 0.08 + 0.4 * R9(); marks.push({t, conf: R9()}); F.push({rise: 20 * R9(), gap: R9() < 0.2 ? 200 : 0, pj: R9() < 0.15 ? 120 : 0, vo: 1, von: t + 0.04, uv: R9(), dur: 0.3, conf: marks[k].conf, vf: 0}); }
  const lex = lexikon('de'), W = []; while (W.length < 250) { const w = lex[Math.floor(R9() * lex.length)]; w.forEach((x, i) => W.length < 250 && W.push({x, w: i ? 0 : 1})); }
  for (let r = 0; r < 3; r++) K.align(W, marks, F);
  const ts = []; for (let r = 0; r < 15; r++) { const a = performance.now(); K.align(W, marks, F); ts.push(performance.now() - a); } ts.sort((a, b) => a - b);
  const tl = []; for (let r = 0; r < 200; r++) { const a = performance.now(); K.preview(null, marks, F, 40 + r, 'Sehnsucht', 'de'); tl.push(performance.now() - a); } tl.sort((a, b) => a - b);
  res['G9-09'] = {ganzMs: +ts[ts.length >> 1].toFixed(2), ganzMaxMs: +ts[ts.length - 1].toFixed(2), lokalMedMs: +tl[tl.length >> 1].toFixed(3), lokalMaxMs: +tl[tl.length - 1].toFixed(3), pass: ts[ts.length >> 1] <= 60 && tl[tl.length >> 1] <= 1}; }
for (const [k, v] of Object.entries(res)) console.log(k, JSON.stringify(v));
if (show) for (const c of korpus) if (c.q < 0.85 || c.bad) console.log((c.q * 100).toFixed(0) + '%', c.lang, textOf(c.P).replace(/\n/g, ' / '), c.bad || '');
fs.writeFileSync(HERE + 'ergebnis-ausrichtung' + (COST ? '-abgleich' : '') + '.json', JSON.stringify(res, null, 1));
const all = Object.values(res).filter(v => 'pass' in v && v !== res['G9-55']).every(v => v.pass);
console.log(all ? 'G9-02…G9-06, G9-09 BESTANDEN' : 'NICHT alles bestanden'); process.exitCode = all ? 0 : 1;
