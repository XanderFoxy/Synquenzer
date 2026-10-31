import {va, INIT} from './n5-k-lib.mjs';
const sr = 48000;
for (const lq of [0, 1]) {
const p = Object.assign({}, INIT, {lq, ftype: 2, res: 1, drive: 1, cutoff: 800, analog: .15, o1uni: 7, o2lvl: 1, o2uni: 7, o3lvl: 1, o3uni: 7, subLvl: 1, noise: 1, l1rate: 40, l2rate: 17});
const at = []; for (let t = .05; t < 1.8; t += .01) at.push([t, {set: {cutoff: 20 * Math.pow(1000, (Math.sin(t * 2 * Math.PI * 3) + 1) / 2), res: 1 - .3 * Math.abs(Math.sin(t * 40))}}]);
const r = va(p, [[0, 'on', 36, 1], [.02, 'on', 60, 1], [.03, 'on', 84, 1], [1.8, 'off', 36], [1.8, 'off', 60], [1.8, 'off', 84]], {sec: 2, at, mods: [{src: 1, dst: 3, amt: 1}, {src: 1, dst: 4, amt: 1}, {src: 2, dst: 5, amt: 1}]});
const W = 128, e = []; for (let i = Math.round(.1 * sr); i + W < Math.round(1.7 * sr); i += W) { let s = 0; for (let j = 0; j < W; j++) s += r.l[i + j] ** 2; e.push(Math.sqrt(s / W)); }
for (let i = 2; i < e.length - 2; i++) { const nb = Math.min(e[i - 2], e[i + 2]); if (nb > 1e-3 && e[i] < nb / 100) { const t = .1 + i * W / sr; console.log('lq', lq, 'drop at', t.toFixed(4), 'cut', (20 * Math.pow(1000, (Math.sin(t * 2 * Math.PI * 3) + 1) / 2)).toFixed(1), e.slice(i - 3, i + 4).map(x => x.toExponential(1)).join(' ')); } }
}
