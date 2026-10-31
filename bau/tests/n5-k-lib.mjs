// K1 helpers: worklet in Node (v3-mk1-node.mjs harness), VA flat patches, spectra, RMS
import {render as mkr} from './v3-mk1-node.mjs';
export const FILE = process.env.K_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html';
export const INIT = {o1w: 0, o1oct: 0, o1semi: 0, o1fine: 0, o1lvl: 1, o1uni: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0,
  ftype: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .002, aD: .3, aS: 1, aR: .15, glide: 0, mode: 0, poly: 8, level: .457};
export function va(flat, ev, o) { o = o || {}; return mkr(null, ev, Object.assign({eng: 0, flat, file: o.file || FILE}, o)); }
export const rms = (a, i0 = 0, i1 = a.length) => { let s = 0; for (let i = i0; i < i1; i++) s += a[i] * a[i]; return Math.sqrt(s / Math.max(1, i1 - i0)); };
export const db = x => 20 * Math.log10(Math.max(1e-12, x));
// magnitude at frequency f (Goertzel, Hann) over [i0, i1)
export function mag(a, f, sr, i0, i1) {
  const n = i1 - i0, w = 2 * Math.PI * f / sr; let re = 0, im = 0, ws = 0;
  for (let i = 0; i < n; i++) { const h = .5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)), x = a[i0 + i] * h; re += x * Math.cos(w * i); im -= x * Math.sin(w * i); ws += h; }
  return 2 * Math.hypot(re, im) / ws;
}
export function diffDb(a, b, i0 = 0, i1 = Math.min(a.length, b.length)) { let s = 0, r = 0; for (let i = i0; i < i1; i++) { const d = a[i] - b[i]; s += d * d; r += b[i] * b[i]; } return r > 0 ? 10 * Math.log10(Math.max(1e-30, s) / r) : (s > 0 ? 0 : -Infinity); }
export function maxAbs(a) { let m = 0, nan = 0; for (const x of a) { if (x !== x) nan++; else if (Math.abs(x) > m) m = Math.abs(x); } return {m, nan}; }
