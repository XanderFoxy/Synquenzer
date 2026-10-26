import {stretch} from './stretch.mjs';
import {makeWarp, detectMarks} from './marks.mjs';
import * as T from './test-signals.mjs';
const sr = 48000, dur = 10;
// harmonic steady tone 220 Hz + clicks at marks
const n = dur * sr, x = new Float32Array(n), r = T.rng(4);
for (let i = 0; i < n; i++) { let v = 0; for (let h = 1; h <= 12; h++) v += Math.sin(2 * Math.PI * 220 * h * i / sr) / h; x[i] = 0.2 * v; }
const marks = []; for (let t = 0.5; t < dur - 0.5; t += 0.5 + 0.1 * r()) marks.push(t);
for (const t of marks) { const i0 = Math.round(t * sr) + 48; for (let k = 0; k < 0.004 * sr; k++) x[i0 + k] += 0.6 * T.gauss(r) * Math.exp(-k / (0.001 * sr)); }
const dst = marks.map((t, k) => t + (k ? 0.06 * Math.sin(k * 1.7) : 0) + 0.02 * k);
const w = makeWarp(marks, dst, dur, dur + 0.02 * marks.length);
let t0 = performance.now(); const R = stretch(x, sr, w); console.log('ms', (performance.now() - t0).toFixed(0), 'len', R.y.length, 'expected', Math.round(w.dst[w.dst.length - 1] * sr), 'warn', R.warnings.length, R.segs.map(s => s.mode).join(','));
let mjx = 0, mjy = 0; for (let i = 1; i < n; i++) mjx = Math.max(mjx, Math.abs(x[i] - x[i - 1])); for (let i = 1; i < R.y.length; i++) mjy = Math.max(mjy, Math.abs(R.y[i] - R.y[i - 1]));
console.log('maxjump x', mjx.toFixed(4), 'y', mjy.toFixed(4));
// bit-identical lock
let bad = 0; for (let k = 0; k < marks.length; k++) { const s0 = Math.round(w.src[k + 1] * sr), d0 = Math.round(w.dst[k + 1] * sr); for (let i = 0; i < 0.02 * sr; i++) if (R.y[d0 + i] !== x[s0 + i]) { bad++; break; } }
console.log('lock bad', bad);
