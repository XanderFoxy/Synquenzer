// MK6-fix: MK6-12 CPU with all reported target sets (FP-DSP egs/wv, QA lfo/l1o/l2o/res3, builder cheap). Own process per case,
// interleaved, N runs, CPU clock per quantum (CPUCLK, preemption not counted) and wall q25. Limit: +0.5 x VA voice.
// Usage: N=5 node v3-mk6fix-cpu.mjs <index.html>   (KS=a,b to pick cases)
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : '../mk-br-MK6/index.html');
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const P1 = [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}];
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, e2: {a: 0, d: 64, s: 100, r: 8}, l1: {w: 2, ks: 2, sync: 0, f: 64, note: 6}, p: P1};
const baseW = Object.assign({}, base, {o1: {w: 5, c1: 0, c2: 20}});
const baseL = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: P1};
const SEQ = (tg, m) => ({on: 1, last: 16, type: 2, run: 1, ks: 2, res: 3, q: [0, 1, 2].map(i => ({k: tg[i] || 0, m: m[i] || 0, v: [V(-40, 40), V(-30, 30), V(30, -30)][i]}))});
const C = {
  kern: [base, null], egs: [base, SEQ([23, 12, 25], [0, 0, 0])], egsStufe: [base, SEQ([23, 12, 25], [1, 1, 1])], cheap: [base, SEQ([11, 1, 16], [0, 1, 0])],
  kernW: [baseW, null], wv: [baseW, SEQ([5, 12, 23], [0, 0, 0])],
  lfok: [baseL, null], lfo: [baseL, SEQ([25, 26, 12], [0, 0, 0])], l1o: [baseL, SEQ([25], [0])], l2o: [baseL, SEQ([26], [0])], res3: [baseL, SEQ([12], [0])],
  va: [null, null],
};
const REF = {egs: 'kern', egsStufe: 'kern', cheap: 'kern', wv: 'kernW', lfo: 'lfok', l1o: 'lfok', l2o: 'lfok', res3: 'lfok'};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  { const pn = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; }; Object.defineProperty(globalThis, 'performance', {value: {now: pn}, configurable: true, writable: true}); }
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq] = C[k], ev = [];
  for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  const waves = p && p.o1 && p.o1.w === 5 ? Array.from({length: 64}, (_, i) => i + 1) : [];
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), waves).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3) + ' ' + win[0].toFixed(3)); process.exit(0);
}
const N = +(process.env.N || 5), R = {}, ks = (process.env.KS || Object.keys(C).join(',')).split(',');
const need = new Set(ks); for (const k of ks) if (REF[k]) need.add(REF[k]); need.add('va');
const run = k => execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE], {encoding: 'utf8'}).trim().split('\n').pop().split(' ').map(Number);
for (let i = 0; i < N; i++) for (const k of need) (R[k] = R[k] || []).push(run(k));
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
for (const [j, nm] of [[0, 'q25 (CPU clock)'], [1, 'best window (CPU clock)']]) {
  const m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v.map(x => x[j]))])), vaV = m.va / 4;
  console.log('== ' + nm + ': VA voice ' + vaV.toFixed(2) + ' ms/s');
  for (const k of ks) if (REF[k]) { const x = (m[k] - m[REF[k]]) / vaV; console.log('  ' + (x <= .5 ? 'PASS' : 'FAIL') + ' ' + k.padEnd(9) + (x >= 0 ? '+' : '') + x.toFixed(2) + ' x VA voice (' + m[k].toFixed(2) + ' vs ' + REF[k] + ' ' + m[REF[k]].toFixed(2) + ' ms/s)'); }
}
