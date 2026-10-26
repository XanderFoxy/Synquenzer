// rapid wave changes (every quantum / every 2 quanta) at a sounding note: largest HP-5k 2 ms window vs the steady states, and a
// sample-step check (largest |x[n] - x[n-1]| during the sweep vs the steady parts)
import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {pdb} from './v3-mk1-ana.mjs';
const SR = 48000, ALL = []; for (let n = 1; n <= 64; n++) ALL.push(n);
function hp(x) { const f = 5000; const run = (v, q) => { const w = 2 * Math.PI * f / SR, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; }; return run(run(Float64Array.from(x), .5412), 1.3066); }
let s = 5; const RND = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
for (const [step, note] of [[1, 57], [2, 57], [1, 69], [3, 45], [1, 81]]) {
  // steady references: each wave alone at this note (max 2 ms HP window)
  const seq = []; for (let j = 0; j < 40; j++) seq.push(1 + Math.floor(RND() * 64));
  const at = seq.map((n, j) => [.5 + j * step * 128 / SR, {mkSet: {'t.0.o1.c2': 2 * n - 2}}]);
  const r = renderW(mkPatch({o1: {w: 5, c2: 0}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1, at}, ALL);
  const h = hp(r.l), W = 96, E = i => { let e = 0; for (let k = i; k < i + W; k++) e += h[k] * h[k]; return e / W + 1e-20; };
  let ref = 0; const used = [...new Set(seq.concat([1]))];
  for (const n of used) { const q = renderW(mkPatch({o1: {w: 5, c2: 2 * n - 2}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: .5}, [n]); const hq = hp(q.l); for (let i = 9600; i + W < 24000; i += 24) { let e = 0; for (let k = i; k < i + W; k++) e += hq[k] * hq[k]; ref = Math.max(ref, e / W); } }
  let worst = -99; const a0 = Math.round(.5 * SR), a1 = Math.round((.5 + 41 * step * 128 / SR) * SR); for (let i = a0 - W; i < a1 + 480; i += 24) worst = Math.max(worst, pdb(E(i) / ref));
  let jmp = 0, jref = 0; for (let i = a0; i < a1 + 480; i++) jmp = Math.max(jmp, Math.abs(r.l[i] - r.l[i - 1])); for (let i = 9600; i < a0 - 480; i++) jref = Math.max(jref, Math.abs(r.l[i] - r.l[i - 1]));
  console.log('changes every', step, 'quanta at note', note, ': HP window over the max steady window of all used waves', worst.toFixed(1), 'dB; max sample step', jmp.toFixed(3), '(steady first wave', jref.toFixed(3) + ')');
}
