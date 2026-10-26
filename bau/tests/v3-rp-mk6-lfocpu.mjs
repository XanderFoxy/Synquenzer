// Reproduction MK6-12 (LFO-FREQ seq cost): controls to separate seq overhead from LFO-speed effect. Method of v3-qa6-cpu.mjs.
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : '');
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const K = (a) => Array.from({length: 16}, () => a);
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const SQ = (q) => ({on: 1, last: 16, type: 2, run: 1, ks: 2, res: 3, q});
const P = (f1, f2) => Object.assign({l1: {ks: 2, f: f1}, l2: {ks: 2, f: f2}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base);
const N0 = {k: 0, m: 0, v: K(0)};
const C = {
  va: [null, null],
  lfok: [P(60, 60), null],
  lfok80: [P(80, 80), null],
  lfok100: [P(100, 100), null],
  l1o: [P(60, 60), SQ([{k: 25, m: 0, v: V(-40, 40)}, N0, N0])],
  l1c1: [P(60, 60), SQ([{k: 25, m: 0, v: K(1)}, N0, N0])],
  l1c20: [P(60, 60), SQ([{k: 25, m: 0, v: K(20)}, N0, N0])],
  l1c20b: [P(80, 60), null],
  lfoc1: [P(60, 60), SQ([{k: 25, m: 0, v: K(1)}, {k: 26, m: 0, v: K(1)}, {k: 12, m: 0, v: K(1)}])],
  lfo: [P(60, 60), SQ([{k: 25, m: 0, v: V(-40, 40)}, {k: 26, m: 0, v: V(-40, 40)}, {k: 12, m: 0, v: V(30, -30)}])],
};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = process.argv[4];
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true, file: process.argv[4]}, p ? {} : {eng: 0}), []).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop();
const ONLYK = (process.env.KS || '').split(',').filter(Boolean), NR = +(process.env.NR || 5);
const R = Object.fromEntries(Object.keys(C).filter(k => !ONLYK.length || ONLYK.includes(k)).map(k => [k, []]));
for (let i = 0; i < NR; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
for (const k in m) if (k !== 'va' && k !== 'lfok') console.log(k + ': ' + ((m[k] - m.lfok) / vaV).toFixed(2) + ' x VA voice vs lfok (' + m[k].toFixed(2) + ' vs ' + m.lfok.toFixed(2) + ' ms/s)');
console.log(JSON.stringify(R));
console.log('VA voice ' + vaV.toFixed(2));
