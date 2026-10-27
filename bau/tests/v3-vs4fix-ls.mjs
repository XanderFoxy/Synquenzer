import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const M = process.argv[2] || 'sat6', mic = rd(DIR + `/cap-${M}-0-mic.f32`), ref = rd(DIR + `/cap-${M}-0-ref.f32`), y = rd(DIR + '/cap-voice.f32'), sr = 44100, n = mic.length, P = y.length;
// align voice (offset found by measure(): search coarse)
let best = -1, off = 0; for (let o = 0; o < P; o += 8) { let s = 0; for (let i = 0; i < n; i += 16) s += mic[i] * y[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
for (let o = off - 8; o <= off + 8; o++) { let s = 0; for (let i = 0; i < n; i += 2) s += mic[i] * y[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
const yy = new Float32Array(n); for (let i = 0; i < n; i++) yy[i] = y[((i - off) % P + P) % P];
let g = 0, gg = 0; for (let i = 0; i < n; i++) { g += mic[i] * yy[i]; gg += yy[i] * yy[i]; } g /= gg;
const echo = new Float64Array(n); for (let i = 0; i < n; i++) echo[i] = mic[i] - g * yy[i];   // echo + noise
console.log('voice gain', g.toFixed(3), 'echo+noise dB', (10 * Math.log10(echo.reduce((s, v) => s + v * v, 0) / n)).toFixed(1));
const solve = (A, b) => { const m = b.length; for (let c = 0; c < m; c++) { let p = c; for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]]; for (let r = c + 1; r < m; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < m; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } } const x = new Float64Array(m); for (let c = m - 1; c >= 0; c--) { let s = b[c]; for (let k = c + 1; k < m; k++) s -= A[c][k] * x[k]; x[c] = s / A[c][c]; } return x; };
for (const [lab, feats] of []) {
  const T = 40, L0 = 515, F = feats.length, m = T * F, A = Array.from({length: m}, () => new Float64Array(m)), b = new Float64Array(m), row = new Float64Array(m);
  const fx = feats.map(f => Float64Array.from(ref, f));
  for (let i = L0 + T; i < n; i += 1) { for (let f = 0; f < F; f++) for (let t = 0; t < T; t++) row[f * T + t] = fx[f][i - L0 - t]; for (let a = 0; a < m; a++) { const ra = row[a]; if (!ra) continue; b[a] += ra * echo[i]; const Aa = A[a]; for (let c = a; c < m; c++) Aa[c] += ra * row[c]; } }
  for (let a = 0; a < m; a++) for (let c = 0; c < a; c++) A[a][c] = A[c][a];
  const w = solve(A, b); let e0 = 0, e1 = 0;
  for (let i = L0 + T; i < n; i++) { let p = 0; for (let f = 0; f < F; f++) for (let t = 0; t < T; t++) p += w[f * T + t] * fx[f][i - L0 - t]; e0 += echo[i] ** 2; e1 += (echo[i] - p) ** 2; }
  console.log(lab, 'ERLE (oracle LS, full signal)', (10 * Math.log10(e0 / e1)).toFixed(1), 'dB');
}
// local lag per 0.5 s window (echo vs ref), normalised correlation
const W = 22050, out = [];
for (let a = 2000; a + W < n; a += W) { let bl = 0, bc = -1; for (let l = 0; l < 2000; l++) { let s = 0, e1 = 0, e2 = 0; for (let i = a; i < a + W; i += 3) { s += echo[i] * ref[i - l]; e1 += echo[i] ** 2; e2 += ref[i - l] ** 2; } const c = s / Math.sqrt(e1 * e2 + 1e-20); if (c > bc) { bc = c; bl = l; } } out.push(bl + ':' + bc.toFixed(2)); }
console.log(out.join(' '));
