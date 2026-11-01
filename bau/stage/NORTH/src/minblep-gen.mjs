// Generates the minBLEP residual table of md-worklet.js (BZ 16 zero crossings, BOS 32 points per sample, Blackman-windowed
// sinc cut at 0.45 fs, minimum phase via the real cepstrum, integrated, residual = step - 1), quantised to Int16 (scale 2^14)
// and base64-encoded. Usage: node minblep-gen.mjs  -> prints the string for const BRES_B64 in md-worklet.js
const PI = Math.PI;
function fftc(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * PI / len, wr = Math.cos(a), wi = Math.sin(a), h = len >> 1;
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < h; j++) { const k = i + j + h, vr = re[k] * cr - im[k] * ci, vi = re[k] * ci + im[k] * cr;
      re[k] = re[i + j] - vr; im[k] = im[i + j] - vi; re[i + j] += vr; im[i + j] += vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const BZ = 16, BOS = 32, BL = 2 * BZ, out = new Float64Array(BL * BOS + BOS + 2);
const n = BL * BOS + 1, N = 8192, re = new Float64Array(N), im = new Float64Array(N), fc = 0.45;
for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) / BOS, sn = x === 0 ? 2 * fc : Math.sin(2 * PI * fc * x) / (PI * x), w = 0.42 - 0.5 * Math.cos(2 * PI * i / (n - 1)) + 0.08 * Math.cos(4 * PI * i / (n - 1)); re[i] = sn * w; }
fftc(re, im);
for (let i = 0; i < N; i++) { re[i] = Math.log(Math.max(1e-12, Math.hypot(re[i], im[i]))); im[i] = 0; }
fftc(re, im); for (let i = 0; i < N; i++) { re[i] /= N; im[i] = -im[i] / N; }
for (let i = 1; i < N / 2; i++) { re[i] *= 2; im[i] *= 2; } for (let i = N / 2 + 1; i < N; i++) { re[i] = 0; im[i] = 0; }
fftc(re, im);
for (let i = 0; i < N; i++) { const e = Math.exp(re[i]), a = im[i]; re[i] = e * Math.cos(a); im[i] = -e * Math.sin(a); }
fftc(re, im);
let s = 0; for (let i = 0; i < n - 1; i++) s += re[i];
let c = 0; for (let i = 0; i < out.length; i++) { if (i < n - 1) c += re[i] / s; out[i] = (i < n - 1 ? c : 1) - 1; }
for (let i = BL * BOS; i < out.length; i++) out[i] = 0;
const q = new Int16Array(out.length); for (let i = 0; i < out.length; i++) q[i] = Math.max(-32768, Math.min(32767, Math.round(out[i] * 16384)));
process.stdout.write(Buffer.from(q.buffer).toString('base64'));
