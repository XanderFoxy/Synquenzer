import {clickTone} from './v3-vs5b-h.mjs';
const sr = 44100;
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 8.2, {f0: 220});
const Hs = 882, ia = Math.round(1.6 * sr), c = ia + 389;
const r = []; for (let d = -529; d <= 529; d++) { let ab = 0, aa = 0, bb = 0; for (let m = 0; m < Hs; m++) { const u = x[ia + m], v = x[c + d + m]; ab += u * v; aa += u * u; bb += v * v; } r.push(ab / Math.sqrt(aa * bb)); }
const pk = []; for (let i = 1; i < r.length - 1; i++) if (r[i] >= r[i - 1] && r[i] >= r[i + 1] && r[i] > 0.3) pk.push((i - 529) + ':' + r[i].toFixed(3)); console.log(pk.join(' '));
