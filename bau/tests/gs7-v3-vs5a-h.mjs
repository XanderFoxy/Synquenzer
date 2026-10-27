// VS5a test helpers (on top of the VS3 harness; app = the VS5 branch copy)
export * from './v3-qa-vs3-h.mjs';
import {open as open0} from './v3-qa-vs3-h.mjs';
export const APP5 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/gs7/vs5a';
export const open5 = (br, o = {}) => open0(br, Object.assign({url: 'file://' + APP5}, o));
export const SR = 48000;
// click: decaying 1.5 kHz + 3.1 kHz burst (percussive), amp a
export function clicks(times, len, a = 0.5) {
  const n = Math.round(len * SR), y = new Float32Array(n);
  let seed = 9; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) y[i] = 0.0005 * rnd();
  for (const t of times) { const i0 = Math.round(t * SR); for (let i = 0; i < 0.12 * SR && i0 + i < n; i++) { const u = i / SR; y[i0 + i] += a * Math.exp(-u / 0.025) * (Math.sin(2 * Math.PI * 1500 * u) * 0.7 + Math.sin(2 * Math.PI * 3100 * u) * 0.3) * Math.min(1, i / 24); } }
  return y;
}
// legato sung-like notes: harmonic tone, constant level, new pitch + small attack bump at each onset
export function legato(times, len, a = 0.25) {
  const n = Math.round(len * SR), y = new Float32Array(n), F = [220, 247, 262, 294, 330, 294, 262, 247, 220, 196, 220, 247, 262, 294, 330, 349];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; let k = -1; for (let j = 0; j < times.length; j++) if (t >= times[j]) k = j;
    if (k < 0) continue;
    const f = F[k % F.length] * (1 + 0.003 * Math.sin(2 * Math.PI * 5.5 * t)), u = t - times[k];
    ph += 2 * Math.PI * f / SR;
    const env = (k === 0 ? Math.min(1, u / 0.01) : 1) * (1 + 0.6 * Math.exp(-u / 0.03)) * Math.min(1, (len - 0.05 - t) / 0.05 > 0 ? 1 : 0);
    let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(h * ph) / h * (h === 3 || h === 4 ? 1.6 : 1);
    y[i] = a * env * s / 3;
  }
  return y;
}
export const toI16 = x => Array.from(x, v => Math.max(-32767, Math.min(32767, Math.round(v * 32767))));
// 4th-order HP (2x biquad) at f
export function hp(x, f, sr = SR) {
  let y = Float64Array.from(x);
  for (let pass = 0; pass < 2; pass++) {
    const w = 2 * Math.PI * f / sr, q = pass ? 1.3066 : 0.5412, al = Math.sin(w) / (2 * q), c = Math.cos(w);
    const b0 = (1 + c) / 2 / (1 + al), b1 = -(1 + c) / (1 + al), b2 = b0, a1 = -2 * c / (1 + al), a2 = (1 - al) / (1 + al);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const o = new Float64Array(y.length);
    for (let i = 0; i < y.length; i++) { const v = b0 * y[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = y[i]; y2 = y1; y1 = v; o[i] = v; }
    y = o;
  }
  return y;
}
// M-KLICK: HP 5 kHz, 2-ms windows, no window > +6 dB above the median of windows ±20 ms, except ≤ 3 ms after a planned attack
export function mKlick(y, attacks, sr = SR) {
  const h = hp(y, 5000, sr), W = Math.round(0.002 * sr), n = Math.floor(h.length / W), e = new Float64Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = 10 * Math.log10(s / W + 1e-14); }
  let worst = -99, at = -1;
  for (let k = 10; k < n - 10; k++) {
    const t = k * W / sr; if (attacks.some(a => t + W / sr > a - 0.0005 && t <= a + 0.003)) continue;
    const nb = []; for (let j = k - 10; j <= k + 10; j++) if (j !== k) nb.push(e[j]); nb.sort((a, b) => a - b);
    const d = e[k] - nb[nb.length >> 1]; if (d > worst) { worst = d; at = t; }
  }
  return {worst: +worst.toFixed(2), at: +at.toFixed(4)};
}
// M-EINBRUCH around point p: 5-ms windows step 1 ms from -50 to +50 ms; ref = mean of windows -50…-10 ms; worst drop
export function mEinbruch(y, p, sr = SR) {
  // VS5b-fix: ganzzahlige Indizes (bei 44,1 kHz war P + d·sr/1000 gebrochen → y[i] undefined → NaN → immer 0)
  const W = Math.round(0.005 * sr), lv = c => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += y[i] * y[i]; return 10 * Math.log10(s / W + 1e-14); };
  const P = Math.round(p * sr), ref = []; for (let d = -50; d <= -10; d++) ref.push(lv(P + d * sr / 1000));
  const r = ref.reduce((a, b) => a + b) / ref.length; let worst = 0;
  for (let d = -50; d <= 45; d++) { const v = lv(P + Math.round(d * sr / 1000)) - r; if (v < worst) worst = v; }
  return +worst.toFixed(2);
}
// independent onset finder: first sample in a window where |x| exceeds thr after quiet
export function onsets(y, thr = 0.05, sr = SR) {
  const out = []; let last = -1;
  for (let i = 0; i < y.length; i++) if (Math.abs(y[i]) > thr && (last < 0 || i - last > 0.06 * sr)) { let j = i; while (j > 0 && Math.abs(y[j - 1]) > 0.003 && i - j < 0.004 * sr) j--; out.push(j / sr); last = i; }
  return out;
}
export function peakDb(y, a, b) { let p = 0; for (let i = Math.max(0, a); i < Math.min(y.length, b); i++) p = Math.max(p, Math.abs(y[i])); return 20 * Math.log10(p + 1e-12); }
// onsets by rise: |y| crosses thr while the peak of the previous 40 ms stayed below thr/4
export function onsetsRise(y, sr = SR) {
  let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); const thr = pk * 0.3, out = [], W = Math.round(0.04 * sr);
  for (let i = W; i < y.length; i++) if (Math.abs(y[i]) > thr) { let m = 0; for (let j = i - W; j < i - Math.round(0.003 * sr); j++) m = Math.max(m, Math.abs(y[j])); if (m < thr / 4) { let j = i; while (j > 0 && Math.abs(y[j - 1]) > pk * 0.006 && i - j < 0.004 * sr) j--; out.push(j / sr); i += W; } }
  return out;
}
