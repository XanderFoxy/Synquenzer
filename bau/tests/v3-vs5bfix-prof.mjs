import {clickTone} from './v3-vs5b-h.mjs';
const mod = await import('../vs-dsp/stretch.mjs');
const sr = 44100, f0 = +(process.argv[2] || 220), st = +(process.argv[3] || 0.7);
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 8.2, {f0});
const L = Math.round(0.004 * sr) / sr, dst = T.map(t => { const tg = Math.round(t / .25) * .25; return t + (tg - t) * st; });
const S2 = [0, ...T.map(t => t - L), 8.2], D2 = [0, ...dst.map(t => t - L), 8.2]; D2[0] = Math.max(0, D2[1] - S2[1]); if (D2[1] - S2[1] < 0) { S2[0] = S2[1] - D2[1]; D2[0] = 0; }
D2[D2.length - 1] = 8.2 + D2[D2.length - 2] - S2[S2.length - 2];
const y = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}).y;
const W = Math.round(0.005 * sr), lv = (v, c) => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += v[i] * v[i]; return 10 * Math.log10(s / W + 1e-14); };
T.forEach((s, k) => { if (dst[k] < 0.7) return; const pr = []; let mn = 0; for (let ms = -240; ms <= 0; ms += 5) { const v = lv(y, dst[k] * sr + ms * sr / 1000) - lv(x, s * sr + ms * sr / 1000); if (ms > -60 || v < -2) pr.push(ms + ':' + v.toFixed(1)); mn = Math.min(mn, v); } if (mn < -2) console.log(k, 'fac', ((dst[k] - dst[k - 1]) / (s - T[k - 1])).toFixed(3), pr.join(' ')); });
