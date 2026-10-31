// N5 G1 test helpers (branch n5-br-G)
export {launch, sleep, writeWav, micOn, waitBeat, idle, deq} from './v3-qa-vs3-h.mjs';
export {clicks, toI16, onsetsRise, mKlick, hp, SR} from './gs7-v3-vs5a-h.mjs';
import {SR} from './gs7-v3-vs5a-h.mjs';
import {open} from './v3-qa-vs3-h.mjs';
export const APPG = process.env.G_APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-G/index.html';
export const OUTG = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5g';
export const openG = (br, o = {}) => open(br, Object.assign({url: 'file://' + APPG}, o));
// output recording: AudioWorklet recorder of VS5a-fix2 (quanta in arrival order – no false 128-sample holes)
export {recStart, recStop} from './v3-vs5afix2-rec.mjs';
import {hp} from './gs7-v3-vs5a-h.mjs';
// M-KLICK (VS3/VS5a: HP 5 kHz, 2-ms windows, worst rise over the median of the windows ±20 ms) with exception ranges [a, b] (s)
export function mKlickR(y, ranges, sr = 48000) {
  const h = hp(y, 5000, sr), W = Math.round(0.002 * sr), n = Math.floor(h.length / W), e = new Float64Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = 10 * Math.log10(s / W + 1e-14); }
  let worst = -99, at = -1;
  for (let k = 10; k < n - 10; k++) {
    const t = k * W / sr; if (ranges.some(([a, b]) => t + W / sr > a && t <= b)) continue;
    const nb = []; for (let j = k - 10; j <= k + 10; j++) if (j !== k) nb.push(e[j]); nb.sort((a, b) => a - b);
    const d = e[k] - nb[nb.length >> 1]; if (d > worst) { worst = d; at = t; }
  }
  return {worst: +worst.toFixed(2), at: +at.toFixed(4)};
}
// syllable onsets by energy rise: 2-ms RMS envelope; onset = first 2-ms frame above 20 % of the max after ≥ 25 ms below 4 %
export function sylOnsets(y, sr) {
  const W = Math.round(0.002 * sr), n = Math.floor(y.length / W), e = new Float64Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += y[i] * y[i]; e[k] = Math.sqrt(s / W); }
  let mx = 0; for (const v of e) mx = Math.max(mx, v);
  const out = []; let quiet = 0;
  for (let k = 0; k < n; k++) {
    if (e[k] < mx * 0.04) { quiet++; continue; }
    if (quiet >= 12 && e[k] >= mx * 0.04) {
      // refine: first sample with |y| > 4 % of max in this region
      let i = k * W; const thr = mx * 0.04 * 1.0; let j = i; while (j < (k + 2) * W && Math.abs(y[j]) < thr) j++;
      out.push(j / sr);
    }
    quiet = 0;
  }
  return out;
}
// heard syllable positions by normalized cross-correlation: template = raw take [on_k, on_k + 15 ms); searched in the output y
// around ref + (on_k − on_0) ± R. Returns the shift of each syllable relative to syllable 0 (ms): heard − raw
export function resampleTo(y, from, to) { if (from === to) return y; const n = Math.floor(y.length * to / from), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i * from / to, j = Math.floor(t), f = t - j; o[i] = (y[j] || 0) * (1 - f) + (y[j + 1] || 0) * f; } return o; }
export function heardShifts(x, rawOn, y, sr, ref, R = 0.1, L = 0.015) {
  y = resampleTo(y, sr, SR); sr = SR;
  const nL = Math.round(L * sr), out = [];
  for (let k = 0; k < rawOn.length; k++) {
    const s0 = Math.round(rawOn[k] * sr), tpl = x.subarray(s0, s0 + nL); let te = 0; for (const v of tpl) te += v * v;
    const c = Math.round((ref + rawOn[k] - rawOn[0]) * sr), r = Math.round(R * sr); let best = -2, bi = c;
    for (let i = c - r; i <= c + r; i++) { if (i < 0 || i + nL > y.length) continue; let xy = 0, yy = 0; for (let j = 0; j < nL; j++) { xy += tpl[j] * y[i + j]; yy += y[i + j] * y[i + j]; } const v = xy / Math.sqrt(te * yy + 1e-20); if (v > best) { best = v; bi = i; } }
    out.push({ms: (bi / sr - ref - (rawOn[k] - rawOn[0])) * 1000, rho: best});
  }
  return out;
}
