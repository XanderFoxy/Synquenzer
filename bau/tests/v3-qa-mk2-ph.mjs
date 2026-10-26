import {render, mkPatch} from './v3-mk1-node.mjs';
import {mktab} from './v3-mk2-node.mjs';
import {pdb, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, T = mktab();
function hp(x) { const f = 5000; const run = (v, q) => { const w = 2 * Math.PI * f / SR, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; }; return run(run(Float64Array.from(x), .5412), 1.3066); }
for (const [n, note] of [[20, 57], [61, 57], [35, 45], [27, 81], [3, 50]]) {
  const r = render(mkPatch({o1: {w: 5, c2: 2 * n - 2}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1, at: [[.4, {mkw: T.wave(n)}]]});
  const h = hp(r.l), W = 96, E = i => { let e = 0; for (let k = i; k < i + W; k++) e += h[k] * h[k]; return e / W + 1e-20; };
  const c = Math.ceil(.4 * SR / 128) * 128; let ref = 0; for (let i = c - 2400; i < c - 240; i += 24) ref = Math.max(ref, E(i)); for (let i = c + 480; i < c + 2400; i += 24) ref = Math.max(ref, E(i));
  let w = -99; for (let i = c - W; i < c + 480; i += 24) w = Math.max(w, pdb(E(i) / ref));
  console.log('placeholder -> wave', n, 'note', note, 'transient over max steady', w.toFixed(1), 'dB; asked', r.msgs.filter(m => m.mkwNeed === n).length);
}
