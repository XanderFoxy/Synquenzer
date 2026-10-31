import {render, mag, db, FLAT, OP, FM6} from './k2-lib.mjs';
const sr = 48000, note = 57, f0 = 220;
function x(n, only) { return {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: (k < n && (only == null || only === k)) ? 99 : 0}))}; }
const ev = [[0.01, 'on', note, .8], [1.2, 'off', note]];
const A = render(FLAT, FM6(x(6)), ev, {sec: 1.8}), S = render(FLAT, FM6(x(6, 0)), ev, {sec: 1.8});
let s = '';
for (let i = 0; i + 2048 < 1.8 * sr; i += 4800) s += (i / sr).toFixed(2) + ':' + (db(mag(A.l, f0, sr, i, i + 2048)) - db(mag(S.l, f0, sr, i, i + 2048))).toFixed(2) + '/' + db(mag(S.l, f0, sr, i, i + 2048)).toFixed(0) + ' ';
console.log(s);
// rms ratio of the whole sum vs sum of solos
