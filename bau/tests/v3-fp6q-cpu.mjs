// QA MK6-12 CPU with heavier targets (Glatt = values move every block): EG2 SUSTAIN (stage latch recompute), RESONANZ, LFO1 FREQ
// (LFO1 KEY SYNC Stimme), PATCH 1, wave sequence (Speicherwelle). Same method as v3-mk6-cpu.mjs (own process per case, 25 % quantile).
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : '../mk-br-MK6/index.html');
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, e2: {a: 0, d: 64, s: 100, r: 8}, l1: {w: 2, ks: 2, sync: 0, f: 64, note: 6}};
const baseW = Object.assign({}, base, {o1: {w: 5, c1: 0, c2: 20}});
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const SEQ = (ks, tg) => ({on: 1, last: 16, type: 2, run: 1, ks, res: 3, q: [{k: tg[0], m: 0, v: V(-40, 40)}, {k: tg[1], m: 0, v: V(-30, 30)}, {k: tg[2], m: 0, v: V(30, -30)}]});
const C = {kern: [base, null], egs: [base, SEQ(2, [23, 12, 25])], egs2: [base, SEQ(2, [19, 23, 27])], wv: [baseW, SEQ(2, [5, 12, 23])], kernW: [baseW, null], va: [null, null]};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  if (pm) pm.t[0].p = [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}];
  const waves = Array.from({length: 64}, (_, i) => i + 1);
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), p && p.o1 && p.o1.w === 5 ? waves : []).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); const qs = q.slice(5 * per).sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3) + ' ' + qs[Math.floor(qs.length * .999)].toFixed(4) + ' ' + qs[qs.length - 1].toFixed(4)); process.exit(0);
}
const PK = {}, MX = {}; const run = k => { const [a, b, c] = execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop().split(' ').map(Number); (PK[k] = PK[k] || []).push(b); (MX[k] = MX[k] || []).push(c); return a; };
const R = Object.fromEntries(Object.keys(C).map(k => [k, []]));
const N = +(process.env.N || 5);
for (let i = 0; i < N; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
const nm = {egs: 'EG2 SUSTAIN + RESONANZ + LFO1 FREQ (Glatt, KS Stimme)', egs2: 'EG1 SUSTAIN + EG2 SUSTAIN + PATCH 1 (Glatt, KS Stimme)', wv: 'Wellenfolge STEUER 2 + RESONANZ + EG2 SUSTAIN (Glatt, KS Stimme)'};
for (const k of ['egs', 'egs2', 'wv']) { const ref = k === 'wv' ? m.kernW : m.kern, x = (m[k] - ref) / vaV; console.log((x <= .5 ? 'PASS' : 'FAIL') + ' ' + nm[k] + ': +' + (m[k] - ref).toFixed(2) + ' ms/s = ' + x.toFixed(2) + ' x VA-Stimme (<= 0.5) · runs ' + R[k].map(x => x.toFixed(1)).join('/') + ' vs ' + (k === 'wv' ? R.kernW : R.kern).map(x => x.toFixed(1)).join('/')); }
console.log('VA voice ' + vaV.toFixed(2) + ' ms/s; runs va ' + R.va.map(x => x.toFixed(1)).join('/'));
console.log('peak per quantum 99.9 % (median): ' + JSON.stringify(Object.fromEntries(Object.entries(PK).map(([k, v]) => [k, +med(v).toFixed(3)]))));
console.log('max per quantum (median of runs): ' + JSON.stringify(Object.fromEntries(Object.entries(MX).map(([k, v]) => [k, +med(v).toFixed(3)]))));
