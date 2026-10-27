// re-render the dumped QA-b take with the core (app map rules) and measure M-KLICK
import fs from 'fs';
import {stretch} from '../vs-dsp/stretch.mjs';
import {mKlick} from './v3-vs5a-h.mjs';
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, raw = Float32Array.from(D.raw), m = D.map, L = Math.round(0.004 * sr) / sr;
const s = m.src, d = m.dst, S2 = [], D2 = [];
for (let k = 1; k < s.length - 1; k++) { const l = Math.min(L, Math.max(0, Math.floor(Math.min(s[k], d[k]) * sr) - 1) / sr); S2.push(s[k] - l); D2.push(d[k] - l); }
const h = D2[0] - S2[0], e = D2[D2.length - 1] - S2[S2.length - 1], end = s[s.length - 1];
if (h >= 0) { S2.unshift(0); D2.unshift(h); } else { S2.unshift(-h); D2.unshift(0); }
S2.push(end); D2.push(end + e);
const y = stretch(raw, sr, {src: S2, dst: D2}, {lock: 0.02 + L}).y;
let same = true; const yo = D.y; for (let i = 0; i < Math.min(y.length, yo.length); i++) if (y[i] !== yo[i]) { same = false; break; }
console.log('same as app render', same, 'M-KLICK', JSON.stringify(mKlick(y, d.slice(1, -1), sr)), 'raw', JSON.stringify(mKlick(raw, s.slice(1, -1), sr)));
