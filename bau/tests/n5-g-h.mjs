// N5 G1 test helpers (branch n5-br-G)
export {launch, sleep, writeWav, micOn, waitBeat, idle, deq} from './v3-qa-vs3-h.mjs';
export {clicks, toI16, onsetsRise, mKlick, hp, SR} from './gs7-v3-vs5a-h.mjs';
import {SR} from './gs7-v3-vs5a-h.mjs';
import {open} from './v3-qa-vs3-h.mjs';
export const APPG = process.env.G_APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-G/index.html';
export const OUTG = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5g';
export const openG = (br, o = {}) => open(br, Object.assign({url: 'file://' + APPG}, o));
// output recording (ScriptProcessor on all destination inputs; __recOut from the VS3 harness)
export async function recStart(p) { await p.evaluate(() => window.__recOut()); }
export async function recStop(p) {
  return p.evaluate(() => { const a = window.__rec; let n = 0; for (const b of a) n += b.length; const y = new Float32Array(n); let o = 0; for (const b of a) { y.set(b, o); o += b.length; } window.__sp.disconnect(); return {y: Array.from(y), sr: window.__ctx.sampleRate}; });
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
