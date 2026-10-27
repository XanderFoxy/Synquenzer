import {clickTone} from './v3-vs5b-h.mjs';
const mod = await import(process.env.MOD || '../vs-dsp/stretch.mjs');
const sr = 44100, f0 = +(process.argv[2] || 220), st = +(process.argv[3] || 0.7), K = +(process.argv[4] || 5);
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 8.2, {f0});
const L = Math.round(0.004 * sr) / sr, dst = T.map(t => { const tg = Math.round(t / .25) * .25; return t + (tg - t) * st; });
const S2 = [0, ...T.map(t => t - L), 8.2], D2 = [0, ...dst.map(t => t - L), 8.2]; D2[0] = Math.max(0, D2[1] - S2[1]); if (D2[1] - S2[1] < 0) { S2[0] = S2[1] - D2[1]; D2[0] = 0; }
D2[D2.length - 1] = 8.2 + D2[D2.length - 2] - S2[S2.length - 2];
const dbg = []; globalThis.DBG = +(process.env.DBG||0); const y = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L, dbg}).y;
console.log(dbg.filter(d => d.k === K).map(d => `j${d.j}/${d.jf} rho ${d.rho} e ${d.e}`).join('\n'));
