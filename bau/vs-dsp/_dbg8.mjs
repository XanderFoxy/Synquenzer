import {stretch} from './stretch.mjs';
import * as MK from './marks.mjs';
import * as T from './test-signals.mjs';
const sr = 48000, dur = 12, f0 = +(process.env.F0 || 196);
const n = dur * sr, x = new Float32Array(n); let ph = 0;
for (let i = 0; i < n; i++) { ph += 2 * Math.PI * f0 / sr; let v = 0; for (let h = 1; h * f0 < 7000; h++) { const fh = h * f0; v += Math.sin(h * ph) * (1 / (1 + ((fh - 800) / 90) ** 2) + 0.6 / (1 + ((fh - 1150) / 100) ** 2) + 0.05) / Math.sqrt(h); } x[i] = 0.15 * v; }
const marks = [1, 3, 5, 7, 9, 11], fac = [0.55, 1.9, 0.75, 1.4, 0.6, 1.0]; const dst = [1]; let acc = 1;
for (let k = 1; k < 6; k++) { acc += (marks[k] - marks[k - 1]) * fac[k - 1]; dst.push(acc); }
const w = MK.makeWarp(marks, dst, dur, acc + 1), R = stretch(x, sr, w, {endAlign: process.env.EA !== "0", xfade: +(process.env.XF || 0.005)}), y = R.y;
const P2 = Math.round(2 * sr / f0), ref = T.rms(x, sr, 2 * sr);
const dips = [];
for (let s = Math.round(1.02 * sr); s + P2 < y.length - sr; s += Math.round(P2 / 4)) { const d = -20 * Math.log10(T.rms(y, s, s + P2) / ref); if (d > 0.8) dips.push([(s / sr).toFixed(3), d.toFixed(2)]); }
console.log('anchors', dst.map(v => v.toFixed(3)).join(' '));
console.log(dips.slice(0, 40).map(d => d.join(':')).join('  '));
