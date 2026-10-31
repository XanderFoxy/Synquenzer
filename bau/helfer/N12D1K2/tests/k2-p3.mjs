import {render, FLAT, OP, FM6} from './k2-lib.mjs';
function x(n, only) { return {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: (k < n && (only == null || only === k)) ? 99 : 0}))}; }
const ev = [[0.01, 'on', 57, .8], [1.2, 'off', 57]];
const A = render(FLAT, FM6(x(6)), ev, {sec: 1.8}); const sum = new Float64Array(A.l.length);
for (let k = 0; k < 6; k++) { const S = render(FLAT, FM6(x(6, k)), ev, {sec: 1.8}); for (let i = 0; i < sum.length; i++) sum[i] += S.l[i]; }
let e = 0, r = 0; for (let i = 0; i < sum.length; i++) { e += (A.l[i] - sum[i]) ** 2; r += sum[i] ** 2; }
console.log('nonlin dB', (10 * Math.log10(e / r)).toFixed(1));
for (let t of [0.02, 0.05, 0.1, 0.3, 0.8]) { let a = 0, s = 0; const i0 = t * 48000 | 0; for (let i = i0; i < i0 + 480; i++) { a += A.l[i] ** 2; s += sum[i] ** 2; } console.log(t, (10 * Math.log10(a / s)).toFixed(2)); }
