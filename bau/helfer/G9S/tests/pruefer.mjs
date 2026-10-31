// Regression der Prüfer-Befunde (unabhängige Prüfung 31.10.) + Fuzz der Invarianten: t nicht fallend, j nie ohne gleiche Vorgängerin,
// j und o nie zusammen, ≤ 3 Silben je Marke ohne o, Silbenzahl erhalten, feste Silben ohne Marke wandern nie.
import fs from 'fs'; import {createRequire} from 'module'; import {rng} from './korpus.mjs';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js'), {g9ErkMake} = require('../g9-erk.js');
const HERE = new URL('.', import.meta.url).pathname, K = g9Make(), E = g9ErkMake();
K.sylLoad('de', fs.readFileSync(HERE + '../../../../vendor/g9/syl/de-x-syllable.wasm'));
const J = JSON.stringify, fails = []; let n = 0;
const ok = (c, m) => { n++; if (!c) fails.push(m); };
const mk = q => Array.from({length: q}, (_, k) => ({t: +(0.5 + 0.3 * k).toFixed(6), conf: 0.8})), F = q => Array.from({length: q}, () => ({rise: 20, gap: 0, pj: 0, vo: 1, von: 0, uv: 0, dur: 0.3, conf: 0.8, vf: 0}));
const L = (M, a) => K.normLy({v: 1, lang: 'de', src: 'getippt', s: a.map(([x, k, f]) => Object.assign({x, t: typeof k === 'number' && k >= 0 ? M[k].t : f.t}, f || {}))});
const inv = s => { const e = []; let pt = -1, run = 0; s.forEach((y, i) => { if (y.t < pt - 1e-9) e.push('t fällt ' + i); if (y.j && (!i || s[i - 1].t !== y.t)) e.push('j ohne ' + i); if (y.j && y.o) e.push('j+o ' + i); if (y.t === pt && !y.o) { run++; if (run > 3) e.push('>3 ' + i); } else if (!y.o) run = 1; pt = y.t; }); return e; };
// 1: o-Silbe mitten im Take
{ const M = mk(10), f = F(10); let ly = L(M, [['Ich', 1, {w: 1}], ['lie', 2, {w: 1}], ['be', 2, {j: 1}], ['dich', 2, {j: 1}], ['so', 3, {w: 1}], ['sehr', 5, {w: 1}], ['ja', 6, {w: 1}]]);
  ly = K.normLy({s: K.apply(ly, M, f, {op: 'mkDel', t: M[3].t}).s});
  const r = K.apply(ly, M, f, {op: 'rechts', i: 0}), k = r.s.map(y => M.findIndex(m => m.t === y.t));
  ok(k.slice(-2).join() === '6,7' && !r.s.slice(-2).some(y => y.o) && !inv(r.s).length, 'B1 o mitten ' + J(k)); }
// 2: trenn mit o in der Gruppe
{ const M = mk(8), f = F(8), ly = L(M, [['a', 1, {w: 1}], ['b', 2, {w: 1}], ['c', 2, {j: 1}], ['d', 2, {j: 1}], ['e', 2, {o: 1}], ['g', 5, {w: 1}]]);
  const r = K.apply(ly, M, f, {op: 'trenn', i: 1}); ok(r.ok && !inv(r.s).length && r.s.length === 6, 'B2 trenn ' + J(r.s)); }
// 4/5: feste Silbe ohne Marke wandert nie, nichts läuft an ihr vorbei
{ const M = mk(8), f = F(8);
  const a = K.align([{x: 'a', w: 1}, {x: 'X', w: 1, u: 1, t: 0.95}, {x: 'b', w: 1}], M, f); ok(a[1].t === 0.95 && !inv(a).length, 'B4 align ' + J(a));
  const ly = L(M, [['a', 0, {w: 1}], ['X', -1, {w: 1, u: 1, t: 0.95}], ['b', 2, {w: 1}], ['c', 3, {w: 1}]]);
  for (const op of [{op: 'rechts', i: 0}, {op: 'links', i: 2}, {op: 'wort', k: 0, text: 'Sehnsucht', ins: true}, {op: 'wort', k: 0, text: 'Gedanken'}, {op: 'versch', i: 0}, {op: 'loesch', k: 2}]) {
    const r = K.apply(ly, M, f, op); const X = r.s && r.s.find(y => y.x === 'X'); ok(!r.ok || (X && X.t === 0.95 && !inv(r.s).length), 'B5 ' + op.op + ' ' + J(r.s)); }
  const e = E.silben(K, [{text: 'ja', start: 0.5, end: 0.7}], 'de', M, f, L(M, [['X', -1, {w: 1, u: 1, t: 1.25}]]));
  ok(e.find(y => y.x === 'X').t === 1.25, 'B4 erk ' + J(e)); }
// 6: Normalisieren zählt gleiche Zeit ohne j mit
{ const r = K.normLy({s: ['a', 'b', 'c', 'd'].map(x => ({x, t: 1})).concat([{x: 'e', t: 1, j: 1}])}); ok(r.s.filter(y => y.o).length === 2 && J(K.normLy(r)) === J(r), 'B6 ' + J(r.s)); }
// 9–12, 15
ok(J(K.syl('-bend', 'de')) === '["-bend"]', 'B9 ' + J(K.syl('-bend', 'de')));
ok(K.sylX('1.000', 'de').p === 0.3 && K.sylX('3,5', 'de').p === 0.3, 'B10');
{ const w = K.words('... ! Herz', 'de'); ok(w.length === 1 && w[0].w === 2 && w[0].x === '...!Herz', 'B11a ' + J(w)); const v = K.words('a' + '😀'.repeat(12), 'de'); ok(!/[\ud800-\udbff]$/.test(v[0].x), 'B11b'); }
ok(K.lyText({s: [{x: 'x'.repeat(500), t: 0, w: 1}]}).length === 400, 'B12');
{ const r = K.apply(null, [], null, {op: 'wort', k: 0, text: 'ja', ins: true}); ok(r.s[0].o === 1, 'B15 ' + J(r.s)); }
{ const M = mk(10), r = K.align(K.words('ich lie-be dich', 'de'), M, null); ok(r[0].t === M[0].t, 'B13 Gleichstand links ' + J(r)); }
// 8: 30-%-Regel vor dem Abschneiden
{ const pl = {win: [{a: 0, b: 10}], map: [{s0: 0, t0: 0, len: 2}, {s0: 2.3, t0: 5, len: 2}], segs: [{a: 0.2, b: 1.8}, {a: 5.2, b: 6.8}]};
  ok(E.zurueck([[{text: 'x', start: 1.7, end: 2.25}]], pl).words.length === 0, 'B8'); }
// Fuzz
const R = rng(99), lex = ['Lie-be', 'Herz', 'Feu-er', 'Son-nen-schein', 'A-bend', 'dich', 'wun-der-bar'];
let fz = 0;
for (let c = 0; c < 3000; c++) {
  const m = 1 + Math.floor(R() * 9), M = []; let t = 0.4; for (let k = 0; k < m; k++) { t += 0.1 + R() * 0.5; M.push({t: +t.toFixed(6), conf: R()}); }
  const f = M.map(() => ({rise: R() < 0.2 ? 1 : 20, gap: R() < 0.2 ? 300 : 0, pj: R() < 0.2 ? 120 : 0, vo: 1, von: 0, uv: 0, dur: 0.3, conf: R(), vf: 0}));
  const s = []; const nw = 1 + Math.floor(R() * 6);
  for (let w = 0; w < nw; w++) { const word = lex[Math.floor(R() * lex.length)].split('-'); const k = Math.floor(R() * m); word.forEach((x, i) => s.push({x, t: M[Math.min(m - 1, k + i)].t, w: i ? 0 : 1, u: R() < 0.2 ? 1 : 0})); }
  if (R() < 0.4) s.splice(Math.floor(R() * s.length), 0, {x: 'X', t: +(M[0].t + R() * (t - M[0].t)).toFixed(6), w: 1, u: 1});
  s.sort((a, b) => a.t - b.t);
  const ly = K.normLy({s}); if (!ly) continue;
  const Xs = ly.s.filter(y => y.u && !M.some(mm => Math.abs(mm.t - y.t) <= 0.03)).map(y => y.x + '@' + y.t);
  const ops = [{op: 'rechts', i: Math.floor(R() * ly.s.length)}, {op: 'links', i: Math.floor(R() * ly.s.length)}, {op: 'versch', i: Math.floor(R() * ly.s.length)}, {op: 'trenn', i: Math.floor(R() * ly.s.length)},
    {op: 'wort', k: Math.floor(R() * m), text: 'Ge-dan-ken'}, {op: 'wort', k: Math.floor(R() * m), text: 'ja', ins: true}, {op: 'loesch', k: Math.floor(R() * m)}, {op: 'nach', i: Math.floor(R() * ly.s.length), n: 2},
    {op: 'mkDel', t: M[Math.floor(R() * m)].t}, {op: 'mkMove', tOld: M[Math.floor(R() * m)].t, tNew: +(M[0].t + R()).toFixed(6)}, {op: 'neu'}];
  for (const op of ops) {
    const r = K.apply(ly, M, f, op); if (!r.ok || !r.s) continue; fz++;
    const e = inv(r.s); if (e.length) { fails.push('fuzz ' + op.op + ' ' + e[0] + ' ' + J({s: ly.s, M, op, out: r.s})); continue; }
    if (['rechts', 'links', 'versch', 'trenn', 'nach', 'mkDel', 'mkMove', 'mkAdd', 'neu'].includes(op.op) && r.s.length !== ly.s.length) fails.push('fuzz Zahl ' + op.op);
    if (op.op !== 'neu' && op.op !== 'loesch' && !(op.op === 'wort' && !op.ins)) for (const x of Xs) if (!r.s.some(y => y.x + '@' + y.t === x)) { fails.push('fuzz fest gewandert ' + op.op + ' ' + x + ' ' + J({s: ly.s, M, op, out: r.s})); break; }
    const nn = K.normLy({s: r.s}); if (J(nn.s) !== J(r.s.map(y => Object.fromEntries(Object.entries(y))))) fails.push('fuzz norm ändert ' + op.op);
  }
}
console.log('Fälle', n, 'Fuzz-Schritte', fz); if (fails.length) console.log(fails.slice(0, 20).join('\n'));
fs.writeFileSync(HERE + 'ergebnis-pruefer.json', J({faelle: n, fuzz: fz, fehler: fails.length}));
console.log(fails.length ? 'NICHT bestanden (' + fails.length + ')' : 'Prüfer-Befunde + Fuzz BESTANDEN'); process.exitCode = fails.length ? 1 : 0;
