// QA MK6-12 variants: own Node process per case, median of 5, interleaved (method of v3-mk6-cpu.mjs)
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : '');
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const wav = {o1: {w: 5, c1: 0, c2: 40}, mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const SQ = (ks, q) => ({on: 1, last: 16, type: 2, run: 1, ks, res: 3, q});
const C = {
  kern: [base, null, []], va: [null, null, []],
  pat: [Object.assign({p: [{s: 2, d: 4, i: 20}, {s: 0, d: 1, i: 10}, {s: 3, d: 2, i: 10}, {s: 4, d: 5, i: 10}]}, base), SQ(2, [{k: 27, m: 0, v: V(-40, 40)}, {k: 28, m: 0, v: V(-20, 20)}, {k: 29, m: 0, v: V(30, -30)}]), []],
  patk: [Object.assign({p: [{s: 2, d: 4, i: 20}, {s: 0, d: 1, i: 10}, {s: 3, d: 2, i: 10}, {s: 4, d: 5, i: 10}]}, base), null, []],
  lfo: [Object.assign({l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base), SQ(2, [{k: 25, m: 0, v: V(-40, 40)}, {k: 26, m: 0, v: V(-40, 40)}, {k: 12, m: 0, v: V(30, -30)}]), []],
  lfok: [Object.assign({l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base), null, []],
  res3: [Object.assign({l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base), SQ(2, [{k: 12, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(30, -30)}]), []],
  l1o: [Object.assign({l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base), SQ(2, [{k: 25, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(30, -30)}]), []],
  l2o: [Object.assign({l1: {ks: 2, f: 60}, l2: {ks: 2, f: 60}, vib: 30, p: [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]}, base), SQ(2, [{k: 26, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(-40, 40)}, {k: 0, m: 0, v: V(30, -30)}]), []],
  wseq: [wav, SQ(2, [{k: 5, m: 1, v: V(-40, 60)}, {k: 1, m: 1, v: V(-12, 12)}, {k: 11, m: 0, v: V(30, -30)}]), Array.from({length: 64}, (_, i) => i + 1)],
  wglatt: [wav, SQ(2, [{k: 5, m: 0, v: V(-40, 60)}, {k: 1, m: 1, v: V(-12, 12)}, {k: 11, m: 0, v: V(30, -30)}]), Array.from({length: 64}, (_, i) => i + 1)],
  wkern: [wav, null, Array.from({length: 64}, (_, i) => i + 1)],
};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = process.argv[4];
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq, ws] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true, file: process.argv[4]}, p ? {} : {eng: 0}), ws).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop();
const R = Object.fromEntries(Object.keys(C).map(k => [k, []]));
const ONLYK = (process.env.KS || '').split(',').filter(Boolean); for (let i = 0; i < 5; i++) for (const k in R) if (!ONLYK.length || ONLYK.includes(k)) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[2], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
for (const [k, b, n] of [['res3', 'lfok', 'nur Resonanz glatt'], ['l1o', 'lfok', 'nur LFO1-FREQ glatt'], ['l2o', 'lfok', 'nur LFO2-FREQ glatt'], ['pat', 'patk', 'PATCH 1-3 INTENS. glatt, KS Stimme'], ['lfo', 'lfok', 'LFO1/2-FREQ (LFO Stimme) + Resonanz glatt'], ['wseq', 'wkern', 'Wellenfolge Stufe + Tonhöhe + Cutoff'], ['wglatt', 'wkern', 'Wellenfolge GLATT + Tonhöhe + Cutoff']]) {
  if (m[k] == null || m[b] == null) continue; const x = (m[k] - m[b]) / vaV; console.log((x <= .5 ? 'PASS' : 'FAIL') + ' ' + n + ': ' + x.toFixed(2) + ' × VA-Stimme (' + m[k].toFixed(2) + ' vs ' + m[b].toFixed(2) + ' ms/s)');
}
console.log(JSON.stringify(m) + ' VA-Stimme ' + vaV.toFixed(2));
