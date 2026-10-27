import {clickTone} from './v3-vs5b-h.mjs';
const sr = 44100, n0 = 0;
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 8.2, {f0: 220}), n = x.length;
const dec = 4, nd = Math.floor(n / dec), xd = new Float32Array(nd), cumd = new Float64Array(nd + 1);
for (let j = 0; j < nd; j++) { let s = 0; for (let q = 0; q < dec; q++) s += x[j * dec + q]; xd[j] = s / dec; cumd[j + 1] = cumd[j] + xd[j] * xd[j]; }
const Hd = 220, Dd = 134, ia = Math.round(1.6 * sr), c = ia + 389, ta = Math.floor(ia / dec), ca = Math.floor(c / dec);
const ea = cumd[ta + Hd] - cumd[ta]; const out = [];
for (let d = -Dd; d <= Dd; d++) { const cc = ca + d; let s = 0; for (let m = 0; m < Hd; m++) s += xd[ta + m] * xd[cc + m]; const v = s / Math.sqrt(ea * (cumd[cc + Hd] - cumd[cc]) + 1e-20); out.push([d, v]); }
console.log(out.filter((v, i) => i > 0 && i < out.length - 1 && v[1] >= out[i - 1][1] && v[1] >= out[i + 1][1]).map(v => v[0] + ':' + v[1].toFixed(3)).join(' '));
