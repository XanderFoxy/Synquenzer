// MK1 measurement helpers (Nachtrag 3 B.6 Nr. 12, Spec §0.3): FFT, harmonic levels, folded energy, M-KLICK, M-EINBRUCH.
export const db = x => 20 * Math.log10(Math.abs(x) + 1e-30);
export const pdb = x => 10 * Math.log10(x + 1e-30);
export function rms(a, i0 = 0, i1 = a.length) { let e = 0; for (let i = i0; i < i1; i++) e += a[i] * a[i]; return Math.sqrt(e / Math.max(1, i1 - i0)); }
export function peak(a, i0 = 0, i1 = a.length) { let p = 0; for (let i = i0; i < i1; i++) p = Math.max(p, Math.abs(a[i])); return p; }
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) { const k = i + j, l = k + len / 2, tr = re[l] * cr - im[l] * ci, ti = re[l] * ci + im[l] * cr;
        re[l] = re[k] - tr; im[l] = im[k] - ti; re[k] += tr; im[k] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
  }
}
// power spectrum (Blackman window, DC removed), n = power of two
export function spectrum(x, i0, n, win = 'blackman') {
  const re = new Float64Array(n), im = new Float64Array(n); let m = 0; for (let i = 0; i < n; i++) m += x[i0 + i]; m /= n;
  let ws = 0;
  for (let i = 0; i < n; i++) { const w = win === 'hann' ? .5 - .5 * Math.cos(2 * Math.PI * i / n) : .42 - .5 * Math.cos(2 * Math.PI * i / n) + .08 * Math.cos(4 * Math.PI * i / n); re[i] = (x[i0 + i] - m) * w; ws += w; }
  fft(re, im); const P = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) P[k] = (re[k] * re[k] + im[k] * im[k]) / (ws * ws) * 4; return P;
}
// amplitude of the component at f (Hann window, exact DFT at f, n samples)
export function amp(x, i0, n, f, sr) {
  let re = 0, im = 0, ws = 0;
  for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / sr; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; }
  return 2 * Math.hypot(re, im) / ws;
}
// B.6 Nr. 12: non-harmonic energy 20 Hz .. 10 kHz relative to the harmonic energy there (k f0 +- 6 bins), bins below f0/2 not counted
export function folded(x, i0, f0, sr, n = 32768) {
  const P = spectrum(x, i0, n), bin = sr / n; let h = 0, o = 0;
  for (let k = 1; k < n / 2; k++) { const f = k * bin; if (f < 20 || f > 10000 || f < f0 / 2) continue;
    const near = Math.abs(f / f0 - Math.round(f / f0)) * f0 <= 6 * bin && Math.round(f / f0) >= 1;
    if (near) h += P[k]; else o += P[k]; }
  return pdb(o / h);
}
export function centroid(x, i0, n, sr) { const P = spectrum(x, i0, n, 'hann'); let a = 0, b = 0; for (let k = 1; k < n / 2; k++) { const m = Math.sqrt(P[k]); a += m * k * sr / n; b += m; } return a / b; }
// strongest peaks (parabolic interpolation)
export function peaks(x, i0, sr, n = 32768, cnt = 4) {
  const P = spectrum(x, i0, n), bin = sr / n, out = [];
  for (let k = 2; k < n / 2 - 2; k++) if (P[k] > P[k - 1] && P[k] >= P[k + 1]) out.push([k, P[k]]);
  out.sort((a, b) => b[1] - a[1]);
  return out.slice(0, cnt).map(([k, p]) => { const a = Math.log(P[k - 1] + 1e-40), b = Math.log(p + 1e-40), c = Math.log(P[k + 1] + 1e-40), d = .5 * (a - c) / (a - 2 * b + c); return {f: (k + d) * bin, db: pdb(p)}; });
}
// frequency by zero crossings with interpolation over [i0, i1)
export function zcFreq(x, i0, i1, sr) {
  let first = -1, last = -1, n = 0;
  for (let i = i0 + 1; i < i1; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + (-x[i - 1]) / (x[i] - x[i - 1]); if (first < 0) first = t; else n++; last = t; }
  return n > 0 ? n * sr / (last - first) : 0;
}
// M-KLICK (Spec §0.3): HP 5 kHz, energy in 2 ms windows; a window must not lie > +6 dB over the median of the windows +-20 ms
function biquadHP(x, sr, f, q) { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w);
  const b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = (1 + cw) / 2, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
// M-KLICK as in qa-v2d/rec.mjs (V0b-fix tools): HP 5 kHz 24 dB/oct (Butterworth), 2 ms windows, > +6 dB over the median of
// +-20 ms; windows under 1e-9 (-90 dB) are not judged; except <= 3 ms after a planned onset
export function mKlick(x, sr, skip = []) {
  const h = biquadHP(biquadHP(Float64Array.from(x), sr, 5000, .5412), sr, 5000, 1.3066);
  const W = Math.round(.002 * sr), nw = Math.floor(h.length / W), E = new Float64Array(nw);
  for (let w = 0; w < nw; w++) { let e = 0; for (let i = w * W; i < (w + 1) * W; i++) e += h[i] * h[i]; E[w] = e / W + 1e-20; }
  let worst = -Infinity, at = -1;
  for (let w = 10; w < nw - 10; w++) {
    const t = w * W / sr; if (skip.some(s => t + .002 >= s - .0005 && t <= s + .003)) continue;
    if (E[w] <= 1e-9) continue;
    const nb = []; for (let j = w - 10; j <= w + 10; j++) if (j !== w) nb.push(E[j]); nb.sort((a, b) => a - b);
    const d = pdb(E[w] / nb[nb.length >> 1]); if (d > worst) { worst = d; at = t; }
  }
  if (worst === -Infinity) worst = 0;
  return {worst, at, ok: worst <= 6};
}
// M-EINBRUCH: 5 ms RMS windows +-50 ms around t; none more than 3 dB under the mean of the windows before t
export function mEinbruch(x, sr, t) {
  const W = Math.round(.005 * sr), c = Math.round(t * sr), win = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W; };
  let pre = 0, n = 0; for (let i = c - Math.round(.05 * sr); i + W <= c; i += W) { pre += win(i); n++; } pre /= n;
  let worst = 0; for (let i = c; i < c + Math.round(.05 * sr); i += W) worst = Math.min(worst, pdb(win(i) / pre));
  return {worst, ok: worst >= -3};
}
// one-pole envelope follower in dB (5 ms windows) of |x|
export function envDb(x, sr, ms = 5) { const W = Math.round(ms / 1000 * sr), out = []; for (let i = 0; i + W <= x.length; i += W) { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; out.push(pdb(e / W)); } return out; }
