// Independent repro of FP-DSP MK6-12 report: 3 sequences (KEY SYNC Stimme, Glatt) with "heavier" targets vs. reference.
// Own process per case, cases interleaved, N runs. Three estimators per process:
//   q25  = 25 % quantile of the 1-s windows after 5 s (wall, builder/spec method)
//   wmin = smallest 1-s window after 5 s (wall, robust to preemption)
//   cpu  = process CPU time (user+sys) of the whole 40-s render loop, per s of audio (immune to preemption)
// Usage: N=9 node v3-rv-mk6cpu-indep.mjs <index.html>
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : '../mk-br-MK6/index.html');
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, e2: {a: 0, d: 64, s: 100, r: 8}, l1: {w: 2, ks: 2, sync: 0, f: 64, note: 6}};
const baseW = Object.assign({}, base, {o1: {w: 5, c1: 0, c2: 20}});
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const SEQ = (tg, m) => ({on: 1, last: 16, type: 2, run: 1, ks: 2, res: 3, q: [{k: tg[0], m: m[0], v: V(-40, 40)}, {k: tg[1], m: m[1], v: V(-30, 30)}, {k: tg[2], m: m[2], v: V(30, -30)}]});
// tg: 23 e2.s, 12 f.res, 25 l1.f, 5 o1.c2, 11 f.cut, 1 trans, 16 a.pan
const C = {
  kern: [base, null],
  egs: [base, SEQ([23, 12, 25], [0, 0, 0])],          // reported case
  egsStufe: [base, SEQ([23, 12, 25], [1, 1, 1])],     // same targets, BEWEGUNG Stufe (attribution: per-block rebuild only in Glatt)
  cheap: [base, SEQ([11, 1, 16], [0, 1, 0])],         // builder's seqv targets on this base
  kernW: [baseW, null],
  wv: [baseW, SEQ([5, 12, 23], [0, 0, 0])],           // reported case
  va: [null, null],
};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  // CPUCLK=1: time each quantum with process CPU time instead of wall time (preemption by other jobs is not counted)
  if (process.env.CPUCLK === '1') { const pn = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; }; Object.defineProperty(globalThis, 'performance', {value: {now: pn}, configurable: true, writable: true}); }
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq] = C[k], ev = [];
  for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  if (pm) pm.t[0].p = [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}];
  const waves = p && p.o1 && p.o1.w === 5 ? Array.from({length: 64}, (_, i) => i + 1) : [];
  const c0 = process.cpuUsage();
  const res = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), waves);
  const c1 = process.cpuUsage(c0);
  const q = res.qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b);
  console.log([win[Math.floor(win.length / 4)], win[0], (c1.user + c1.system) / 1000 / 40].map(x => x.toFixed(3)).join(' '));
  process.exit(0);
}
const N = +(process.env.N || 9), R = {};
const run = k => execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE], {encoding: 'utf8', env: process.env}).trim().split('\n').pop().split(' ').map(Number);
for (let i = 0; i < N; i++) for (const k in C) (R[k] = R[k] || []).push(run(k));
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const est = j => Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v.map(x => x[j]))]));
const NM = ['q25 (wall, 25 % quantile)', 'wmin (wall, best 1-s window)', 'cpu (process CPU time / s audio)'];
for (let j = 0; j < 3; j++) {
  const m = est(j), vaV = m.va / 4;
  console.log('== ' + NM[j] + ': VA voice ' + vaV.toFixed(2) + ' ms/s');
  for (const k of ['egs', 'egsStufe', 'cheap', 'wv']) { const ref = k === 'wv' ? m.kernW : m.kern, x = (m[k] - ref) / vaV;
    console.log('  ' + (x <= .5 ? 'PASS' : 'FAIL') + ' ' + k.padEnd(9) + ' +' + (m[k] - ref).toFixed(2) + ' ms/s = ' + x.toFixed(2) + ' x VA voice · runs ' + R[k].map(x => x[j].toFixed(1)).join('/') + ' vs ref ' + R[k === 'wv' ? 'kernW' : 'kern'].map(x => x[j].toFixed(1)).join('/')); }
}
