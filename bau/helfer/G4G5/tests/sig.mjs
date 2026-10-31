// G4-Testsignale (Node): gesungene Phrasen mit Pegelsprüngen, Zischlaute, Silben mit Anschlag; Band- und Pegelmaße
import {sung} from './lib.mjs';
export function rnd(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
// RBJ-Biquad wie in der App
export function bq(type, f, sr, Q) { const w = 2 * Math.PI * f / sr, cs = Math.cos(w), sn = Math.sin(w), al = sn / (2 * Q);
  const b0 = type === 'hp' ? (1 + cs) / 2 : (1 - cs) / 2, b1 = type === 'hp' ? -(1 + cs) : 1 - cs, a0 = 1 + al; return [b0 / a0, b1 / a0, b0 / a0, -2 * cs / a0, (1 - al) / a0]; }
export function run(x, c) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = c[0] * v + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; }
export const band59 = (x, sr) => run(run(run(run(x, bq('hp', 5000, sr, Math.SQRT1_2)), bq('hp', 5000, sr, Math.SQRT1_2)), bq('lp', 9000, sr, Math.SQRT1_2)), bq('lp', 9000, sr, Math.SQRT1_2));
export const band25 = (x, sr) => run(run(run(run(x, bq('hp', 2000, sr, Math.SQRT1_2)), bq('hp', 2000, sr, Math.SQRT1_2)), bq('lp', 5000, sr, Math.SQRT1_2)), bq('lp', 5000, sr, Math.SQRT1_2));
export const db = p => 10 * Math.log10(p + 1e-30);
export const rms = (x, a, b) => { let s = 0; a = Math.max(0, a | 0); b = Math.min(x.length, b | 0); for (let i = a; i < b; i++) s += x[i] * x[i]; return s / Math.max(1, b - a); };
export const maxWin = (x, a, b, W) => { let m = 0; for (let k = a; k + W <= b; k += W >> 1) m = Math.max(m, rms(x, k, k + W)); return m; };
export const pct = (a, p) => { const s = [...a].sort((x, y) => x - y), x = (s.length - 1) * p, i = Math.floor(x); return s[i] + ((s[Math.min(s.length - 1, i + 1)] - s[i]) * (x - i)); };
// G4-01: vier Phrasen (je 4 s) auf −30 / −20 / −34 / −24 dBFS RMS
export function dynTake(sr) {
  const lv = [-30, -20, -34, -24, -28, -21], parts = lv.map((l, k) => sung(4.4, sr, l, {seed: 31 + k, phrase: 8, noise: 0.0002}).y), n = parts.reduce((a, p) => a + p.length, 0), y = new Float32Array(n);
  let o = 0; for (const p of parts) { y.set(p, o); o += p.length; } return y;
}
// gehaltener Vokal mit festem Pegel (Pumpen): 6 s
export function steady(sr, rmsDb) { const n = Math.round(6 * sr), y = new Float32Array(n); let ph = 0; const f = 220;
  for (let i = 0; i < n; i++) { ph += f / sr; if (ph >= 1) ph -= 1; const env = Math.min(1, i / (0.05 * sr)) * Math.min(1, (n - i) / (0.05 * sr)); y[i] = env * ((2 * ph - 1) - 0.5 * Math.sin(2 * Math.PI * ph)); }
  const F = run(run(y, bq('lp', 3000, sr, 0.7)), bq('hp', 120, sr, 0.7)); let s = 0; for (const v of F) s += v * v; const g = Math.pow(10, rmsDb / 20) / Math.sqrt(s / n); for (let i = 0; i < n; i++) F[i] *= g; return F; }
// G4-02: gesungene Phrasen + „s“ (Rauschen 4,5–10 kHz, 160 ms) zwischen den Noten; Lage der Zischlaute
export function sibTake(sr) {
  const base = sung(12, sr, -26, {seed: 77, noteSec: 0.7, gapSec: 0.3, phrase: 4, noise: 0.0002}).y, r = rnd(99), y = Float32Array.from(base), at = [];
  let nz = new Float32Array(Math.round(0.16 * sr)); for (let i = 0; i < nz.length; i++) nz[i] = r() * 2 - 1;
  nz = run(run(run(nz, bq('hp', 4500, sr, 0.7)), bq('hp', 4500, sr, 0.7)), bq('lp', 10000, sr, 0.7));
  let s = 0; for (const v of nz) s += v * v; const g0 = Math.pow(10, -24 / 20) / Math.sqrt(s / nz.length);   // Zischlaut −24 dBFS RMS (Gesang −26)
  for (let t = 0.9; t < 11.4; t += 1.3) { const i0 = Math.round(t * sr); for (let i = 0; i < nz.length && i0 + i < y.length; i++) { const e = Math.min(1, i / (0.012 * sr)) * Math.min(1, (nz.length - i) / (0.02 * sr)); y[i0 + i] += nz[i] * g0 * e; } at.push([i0, i0 + nz.length]); }
  return {y, at};
}
// G4-06: Silben (0,22 s, Pause 0,06 s), Pegel zufällig ±6 dB um −26 dBFS, jede mit Anschlag (5 ms Rauschen +6 dB)
export function sylTake(sr, nSyl = 40) {
  const r = rnd(4242), D = Math.round(0.22 * sr), G = Math.round(0.06 * sr), y = new Float32Array(Math.round(0.5 * sr) + nSyl * (D + G) + sr), seg = [];
  const notes = [57, 60, 62, 64, 62, 60, 59, 57];
  let o = Math.round(0.5 * sr);
  for (let k = 0; k < nSyl; k++) {
    const lv = -26 + (r() * 12 - 6), f = 440 * Math.pow(2, (notes[k % 8] - 69) / 12), A = Math.pow(10, lv / 20) * 1.6;
    let ph = 0; for (let i = 0; i < D; i++) { ph += f / sr; if (ph >= 1) ph -= 1; const env = Math.min(1, i / (0.004 * sr)) * Math.min(1, (D - i) / (0.03 * sr)); y[o + i] += A * env * ((2 * ph - 1) * 0.6 + 0.4 * Math.sin(2 * Math.PI * ph)); }
    const T = Math.round(0.005 * sr); for (let i = 0; i < T; i++) y[o + i] += A * 2 * (r() * 2 - 1) * (1 - i / T);
    seg.push([o, o + D, lv]); o += D + G;
  }
  return {y: y.subarray(0, o + Math.round(0.5 * sr)), seg};
}
