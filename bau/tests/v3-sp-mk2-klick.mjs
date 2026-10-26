// FP-DSP MK2: M-KLICK (plain, Spec §0.3: HP 5 kHz 4th order, 2-ms windows, +6 dB over the median of the windows +-20 ms) and
// M-EINBRUCH at switches: stored-wave changes of similar brightness, across r (1 <-> 2 <-> 1.49831), octave waves, the late
// table (placeholder -> table), and the structure switches between waves 0 / 3 / 4 / 5 / 6 (SXF 30 ms).
import {renderW, render, mkPatch, mktab} from './v3-mk2-node.mjs';
const SR = 48000, MKT = mktab();
function hp4(x) { let y = Float64Array.from(x); for (const q of [.5412, 1.3066]) { const w = 2 * Math.PI * 5000 / SR, a = Math.sin(w) / (2 * q), c = Math.cos(w), b0 = (1 + c) / 2, b1 = -(1 + c), a0 = 1 + a, a1 = -2 * c, a2 = 1 - a; const o = new Float64Array(y.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < y.length; i++) { const v = (b0 * y[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = y[i]; y2 = y1; y1 = v; o[i] = v; } y = o; } return y; }
// a click = a 2-ms HP window more than 6 dB over BOTH steady states (median of the HP windows 22 ... 2 ms before and of the
// windows after the blend, from bl + 5 ms for 20 ms); a dip = a 5-ms level window more than 3 dB under BOTH steady levels
const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1];
function klick(x, t, bl) { const h = hp4(x), W = 96, c = Math.round(t * SR), b = Math.round((bl || .002) * SR), E = i => { let e = 0; for (let k = i; k < i + W; k++) e += h[k] * h[k]; return e / W + 1e-24; };
  const pre = [], post = []; for (let i = c - 1056; i + W <= c - 96; i += W) pre.push(E(i)); for (let i = c + b + 240; i + W <= c + b + 1200; i += W) post.push(E(i));
  const ref = Math.max(med(pre), med(post)); let worst = -99; for (let i = c - W; i < c + b + 240; i += W / 2) worst = Math.max(worst, 10 * Math.log10(E(i) / ref)); return worst; }
function einbruch(x, t, bl) { const c = Math.round(t * SR), W = 240, b = Math.round((bl || .002) * SR), L = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W + 1e-24; };
  let r1 = 0, n1 = 0, r2 = 0, n2 = 0; for (let i = c - 2400; i <= c - 480 - W; i += 48) { r1 += L(i); n1++; } for (let i = c + b + 480; i <= c + b + 2400 - W; i += 48) { r2 += L(i); n2++; }
  const ref = Math.min(r1 / n1, r2 / n2); let worst = 0; for (let i = c - 480; i <= c + b + 480; i += 48) worst = Math.min(worst, 10 * Math.log10(L(i) / ref)); return worst; }
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}, e2: {a: 0, d: 64, s: 127, r: 8}};
const ALL = []; for (let n = 1; n <= 64; n++) ALL.push(n);
const res = [];
// similar-brightness pairs and r changes
const pairs = [[8, 9], [9, 10], [40, 41], [41, 42], [2, 3], [3, 4], [27, 28], [28, 29], [33, 34], [34, 35], [35, 36], [58, 59], [59, 60], [60, 61], [61, 62], [63, 64], [1, 7], [12, 52]];
for (const [a, b] of pairs) for (const note of (process.env.NOTES || "76,81,88").split(",").map(Number)) {
  const T = .5 + 0.0013 * a; // off-grid
  const r = renderW(mkPatch(Object.assign({o1: {w: 5, c2: 2 * (a - 1)}}, OPEN)), [[0, 'on', note, .8]], {sec: 1, at: [[T, {mkSet: {'t.0.o1.c2': 2 * (b - 1)}}]]}, ALL);
  const ts = Math.ceil(T * SR / 128) * 128 / SR; res.push([a + '→' + b + '@' + note, klick(r.l, ts), einbruch(r.l, ts)]);
}
// late table: the placeholder saw, then the wave arrives at 0.4 s
for (const n of [12, 23, 36, 61]) { const W = MKT.wave(n); const r = render(mkPatch(Object.assign({o1: {w: 5, c2: 2 * (n - 1)}}, OPEN)), [[0, "on", +(process.env.NOTE || 81), .8]], {sec: 1, at: [[.4, {mkw: W}]]}); const ts = Math.ceil(.4 * SR / 128) * 128 / SR; res.push(['Platzhalter→' + n, klick(r.l, ts), einbruch(r.l, ts)]); }
// structure switches (SXF)
const W0 = [[0, {}], [3, {c1: 40}], [4, {c1: 64}], [5, {c2: 44}], [6, {c1: 24, c2: 0}]];
for (const [wa, oa] of W0) for (const [wb, ob] of W0) { if (wa === wb) continue;
  const at = [[.5, {mkSet: Object.assign({'t.0.o1.w': wb}, ob.c1 != null ? {'t.0.o1.c1': ob.c1} : {}, ob.c2 != null ? {'t.0.o1.c2': ob.c2} : {})}]];
  const r = renderW(mkPatch(Object.assign({o1: Object.assign({w: wa}, oa)}, OPEN)), [[0, "on", +(process.env.NOTE || 81), .8]], {sec: 1, at, seed: 3}, ALL);
  const ts = Math.ceil(.5 * SR / 128) * 128 / SR; res.push(['w' + wa + '→w' + wb, klick(r.l, ts, .033), einbruch(r.l, ts, .033)]); }
const bad = res.filter(x => x[1] > 6 || x[2] < -3);
console.log('switches', res.length, '; worst M-KLICK', Math.max(...res.map(x => x[1])).toFixed(1), 'dB; worst M-EINBRUCH', Math.min(...res.map(x => x[2])).toFixed(1), 'dB');
console.log('over limit:', bad.map(x => x[0] + ' K ' + x[1].toFixed(1) + ' E ' + x[2].toFixed(1)).join(' | ') || 'none');
console.log(res.filter(x => /w|Platz/.test(x[0])).map(x => x[0] + ' ' + x[1].toFixed(1) + '/' + x[2].toFixed(1)).join('  '));
