import {f0at} from './lib.mjs';
const TAU = 2 * Math.PI; export const db = p => 10 * Math.log10(p + 1e-20);
export const gz = (x, a, b, f, sr) => { const M = b - a, c = 2 * Math.cos(TAU * f / sr); let p1 = 0, p2 = 0; for (let i = 0; i < M; i++) { const w = 0.5 - 0.5 * Math.cos(TAU * i / M), s = (x[a + i] || 0) * w + c * p1 - p2; p2 = p1; p1 = s; } return p1 * p1 + p2 * p2 - c * p1 * p2; };
export function fftN(n) { const rev = new Uint32Array(n); let bits = 0; while ((1 << bits) < n) bits++; for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  return (re, im) => { for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= n; s <<= 1) { const h = s >> 1; for (let i = 0; i < n; i += s) for (let j = 0; j < h; j++) { const w = -TAU * j / s, c = Math.cos(w), sn = Math.sin(w), l = i + j + h, tr = re[l] * c - im[l] * sn, ti = re[l] * sn + im[l] * c; re[l] = re[i + j] - tr; im[l] = im[i + j] - ti; re[i + j] += tr; im[i + j] += ti; } } }; }
export function band(x, sr, f1, f2, a = 0) { const N = 4096, H = 2048, re = new Float64Array(N), im = new Float64Array(N), F = fftN(N); let e = 0;
  for (let p = a; p + N <= x.length; p += H) { for (let i = 0; i < N; i++) { re[i] = x[p + i] * (0.5 - 0.5 * Math.cos(TAU * i / N)); im[i] = 0; } F(re, im); for (let k = Math.ceil(f1 * N / sr); k <= Math.floor(f2 * N / sr); k++) e += re[k] * re[k] + im[k] * im[k]; } return e; }
export function plopMeas(v, x, y, P, T, sr) { const n = v.length, N = 4096, red = [], harm = [], harmMax = [];
  for (const t of T) { const c = Math.round((t + 0.02) * sr), a = c - N / 2, e = new Float32Array(n); for (let i = a; i < a + N; i++) e[i] = y[i] - v[i];
    const lo = (z) => band(z.subarray(a, a + N), sr, 0, 250); red.push(+(db(lo(P)) - db(lo(e))).toFixed(1));
    const f0 = f0at(t + 0.02), b2 = c - 1024; let hy = 0, hv = 0, mx = 0; for (let k = 1; k * f0 < 4000; k++) { const py = gz(y, b2, b2 + 2048, k * f0, sr), pv = gz(v, b2, b2 + 2048, k * f0, sr); hy += py; hv += pv; if (pv > 1e-6 * gz(v, b2, b2 + 2048, f0, sr)) mx = Math.max(mx, Math.abs(db(py) - db(pv)) * (pv / (hv || 1) > 0.02 ? 1 : 0)); }
    harm.push(+(db(hy) - db(hv)).toFixed(2)); harmMax.push(+mx.toFixed(2)); }
  return {red, harm, harmMax}; }
