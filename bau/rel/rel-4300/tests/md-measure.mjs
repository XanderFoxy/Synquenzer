// Measurement helpers (Anhang M): FFT, peaks, T60, cents, levels
export function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
      re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
export function spectrum(x, sr, a = 0, b = x.length, N = 65536, half = false) {
  const re = new Float64Array(N), im = new Float64Array(N), L = Math.min(b - a, N);
  // half: falling half of a Hann window (full weight at the hit, for decaying modes)
  for (let i = 0; i < L; i++) re[i] = x[a + i] * (half ? 0.5 + 0.5 * Math.cos(Math.PI * i / (L - 1)) : 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)));
  fft(re, im); const mag = new Float64Array(N / 2); for (let i = 0; i < N / 2; i++) mag[i] = Math.hypot(re[i], im[i]);
  return {mag, df: sr / N, N};
}
export const db = x => 20 * Math.log10(Math.max(x, 1e-30));
export function peaks(S, minDb = -50, fmin = 20, fmax = 20000) {
  const {mag, df} = S; let mx = 0; for (let i = Math.max(1, Math.floor(fmin / df)); i < Math.min(mag.length, fmax / df); i++) if (mag[i] > mx) mx = mag[i];   // reference: strongest bin inside the band
  const out = [];
  for (let i = Math.max(2, Math.floor(fmin / df)); i < Math.min(mag.length - 2, fmax / df); i++) {
    if (mag[i] > mag[i - 1] && mag[i] >= mag[i + 1] && mag[i] > mag[i - 2] && mag[i] >= mag[i + 2] && db(mag[i] / mx) > minDb) {
      const a = Math.log(mag[i - 1] + 1e-30), b = Math.log(mag[i]), c = Math.log(mag[i + 1] + 1e-30), p = 0.5 * (a - c) / (a - 2 * b + c);
      out.push({f: (i + p) * df, a: mag[i], db: db(mag[i] / mx)});
    }
  }
  return out.sort((x, y) => y.a - x.a);
}
export function magAt(S, f) { const i = Math.round(f / S.df); let m = 0; for (let k = i - 2; k <= i + 2; k++) m = Math.max(m, S.mag[k] || 0); return m; }
// envelope (abs, 2 ms smoothing via peak-hold window) in dB
export function envDb(x, sr, win = 0.002) { const w = Math.max(1, Math.round(win * sr)), out = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let k = 0; k < w; k++) s += x[i + k] * x[i + k]; out.push(10 * Math.log10(s / w * 2 + 1e-30)); } return {e: out, dt: win}; }
// Hilbert magnitude (analytic signal via FFT), smoothed 2 ms, in dB; decimated to 0.5 ms steps
export function hilbDb(x, sr, smooth = 0.002, step = 0.0005) {
  let N = 1; while (N < x.length) N <<= 1; const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < x.length; i++) re[i] = x[i];
  fft(re, im); for (let i = 1; i < N / 2; i++) { re[i] *= 2; im[i] *= 2; } for (let i = N / 2 + 1; i < N; i++) { re[i] = 0; im[i] = 0; }
  for (let i = 0; i < N; i++) im[i] = -im[i]; fft(re, im); const m = new Float64Array(x.length); for (let i = 0; i < x.length; i++) m[i] = Math.hypot(re[i], im[i]) / N;
  const w = Math.max(1, Math.round(smooth * sr)), st = Math.max(1, Math.round(step * sr)), e = [];
  let s = 0; const c = new Float64Array(x.length + 1); for (let i = 0; i < x.length; i++) { s += m[i]; c[i + 1] = s; }
  for (let i = 0; i + w <= x.length; i += st) e.push(20 * Math.log10((c[i + w] - c[i]) / w + 1e-30));
  return {e, dt: st / sr, off: w / 2 / sr};
}
// M-T60: regression between -5 and -35 dB below the peak, extrapolated to -60
export function t60(x, sr, lo = -5, hi = -35) {
  const {e, dt} = hilbDb(x, sr); let pk = -1e9, pi = 0; e.forEach((v, i) => { if (v > pk) { pk = v; pi = i; } });
  const pts = []; for (let i = pi; i < e.length; i++) { const d = e[i] - pk; if (d <= lo && d >= hi) pts.push([i * dt, e[i]]); if (d < hi - 3) break; }
  if (pts.length < 3) return NaN;
  const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0; for (const [a, b] of pts) { sxy += (a - mx) * (b - my); sxx += (a - mx) ** 2; }
  return -60 / (sxy / sxx);
}
// band-limited signal around f (for mode T60): simple 2nd-order bandpass (RBJ), Q
export function bandpass(x, sr, f, q = 10) { const w = 2 * Math.PI * f / sr, al = Math.sin(w) / (2 * q), cs = Math.cos(w), a0 = 1 + al;
  const b0 = al / a0, b2 = -al / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0; const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
export function rms(x, a = 0, b = x.length) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); }
export function peakAbs(x, a = 0, b = x.length) { let m = 0; for (let i = a; i < b; i++) m = Math.max(m, Math.abs(x[i])); return m; }
// instantaneous frequency by zero crossings (rising) with linear interpolation, mean over window [a,b) seconds
export function zcFreq(x, sr, a, b) { const z = []; for (let i = Math.max(1, Math.floor(a * sr)); i < Math.min(x.length, b * sr); i++) if (x[i - 1] < 0 && x[i] >= 0) z.push(i - 1 + (-x[i - 1]) / (x[i] - x[i - 1]));
  if (z.length < 2) return NaN; return (z.length - 1) / ((z[z.length - 1] - z[0]) / sr); }
export const cents = (f, f0) => 1200 * Math.log2(f / f0);
export function nullDb(a, b) { let s = 0, r = 0; for (let i = 0; i < b.length; i++) { s += (a[i] - b[i]) ** 2; r += b[i] ** 2; } return s === 0 ? -Infinity : 10 * Math.log10(s / r); }

// instantaneous frequency (Hz) per sample from the analytic signal's phase (Hilbert)
export function instFreq(x, sr) {
  let N = 1; while (N < x.length) N <<= 1; const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < x.length; i++) re[i] = x[i];
  fft(re, im); for (let i = 1; i < N / 2; i++) { re[i] *= 2; im[i] *= 2; } for (let i = N / 2 + 1; i < N; i++) { re[i] = 0; im[i] = 0; }
  for (let i = 0; i < N; i++) im[i] = -im[i]; fft(re, im); const f = new Float64Array(x.length);
  for (let i = 1; i < x.length; i++) { const a = Math.atan2(-im[i], re[i]), b = Math.atan2(-im[i - 1], re[i - 1]); let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; f[i] = d * sr / (2 * Math.PI); }
  return f;
}
