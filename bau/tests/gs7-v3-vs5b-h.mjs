// VS5b test helpers
export * from './gs7-v3-vs5a-h.mjs';
import {SR} from './gs7-v3-vs5a-h.mjs';
export const OUTB = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/gs7/vs5b';
// sustained harmonic tone (vowel-like) with clicks on top at times T (N7V-28 "Klickfolge mit Ton dazwischen")
export function clickTone(T, len, o = {}) {
  const n = Math.round(len * SR), y = new Float32Array(n), f0 = o.f0 || 196, a = o.a == null ? 0.08 : o.a, t1 = o.toneFrom == null ? 0.3 : o.toneFrom;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; y[i] = 0.0004 * rnd();
    if (t >= t1) { ph += 2 * Math.PI * f0 * (1 + 0.003 * Math.sin(2 * Math.PI * 5.5 * t)) / SR; let s = 0; for (let h = 1; h <= 10; h++) s += Math.sin(h * ph) / h * (h === 3 || h === 4 ? 1.5 : 1); y[i] += a * s * Math.min(1, (t - t1) / 0.02) * Math.min(1, (len - t) / 0.03); }
  }
  for (const t of T) { const i0 = Math.round(t * SR); for (let i = 0; i < 0.03 * SR && i0 + i < n; i++) { const u = i / SR; y[i0 + i] += 0.6 * Math.exp(-u / 0.004) * (Math.sin(2 * Math.PI * 2100 * u) * 0.6 + rnd() * 0.4) * Math.min(1, i / 6); } }
  return y;
}
// find where block raw[S..S+L) occurs bit-identically in y within ±R samples of guess
export function findBlock(y, raw, S, guess, L = 480, R = 4800) {
  for (let d = 0; d <= R; d++) for (const o of d ? [guess + d, guess - d] : [guess]) {
    if (o < 0 || o + L > y.length) continue;
    let same = true; for (let j = 0; j < L; j++) if (y[o + j] !== raw[S + j]) { same = false; break; }
    if (same) return o;
  }
  return -1;
}
export const rmsDbR = (y, a, b) => { let s = 0; for (let i = a; i < b; i++) s += y[i] * y[i]; return 10 * Math.log10(s / Math.max(1, b - a) + 1e-20); };
