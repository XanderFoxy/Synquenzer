// own analysis helpers for the MK2 specialist review (independent of v3-mk1-ana.mjs)
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const k = i + j, l = k + len / 2, tr = re[l] * cr - im[l] * ci, ti = re[l] * ci + im[l] * cr; re[l] = re[k] - tr; im[l] = im[k] - ti; re[k] += tr; im[k] += ti; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
export function powerSpec(x, i0, N) {
  const re = new Float64Array(N), im = new Float64Array(N); let m = 0; for (let i = 0; i < N; i++) m += x[i0 + i]; m /= N;
  for (let i = 0; i < N; i++) re[i] = (x[i0 + i] - m) * (.42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)));
  fft(re, im); const P = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) P[k] = re[k] * re[k] + im[k] * im[k]; return P;
}
// B.6 Nr. 12: DC removed, bins under f0/2 not counted, Blackman, 2^15 points, harmonic bins = k f0 +- 6 bins, 20 Hz ... 10 kHz
export function folded(x, i0, f0, sr) {
  const N = 32768, P = powerSpec(x, i0, N), bin = sr / N; let h = 0, o = 0;
  for (let k = 1; k < N / 2; k++) { const f = k * bin; if (f < 20 || f > 10000 || f < f0 / 2) continue; const kk = Math.round(f / f0); if (kk >= 1 && Math.abs(k - kk * f0 / bin) <= 6) h += P[k]; else o += P[k]; }
  return 10 * Math.log10(o / h);
}
export const db = x => 20 * Math.log10(Math.max(1e-15, Math.abs(x)));
export function ampAt(x, i0, N, f, sr) { let a = 0, b = 0, ws = 0; for (let i = 0; i < N; i++) { const w = .42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)); ws += w; const p = 2 * Math.PI * f * i / sr; a += x[i0 + i] * w * Math.cos(p); b += x[i0 + i] * w * Math.sin(p); } return 2 * Math.hypot(a, b) / ws; }
