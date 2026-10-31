// K1-04: ladder at max resonance / self-oscillation with fast knob turns: no NaN/Inf, no dropout (a 2.67 ms window falling
// > 40 dB below its neighbours while the gate is held), no runaway (peak)
import {va, INIT, maxAbs} from './n5-k-lib.mjs';
const sr = 48000, file = process.argv[2];
let worst = {drop: 0, peak: 0, nan: 0, inf: 0}, n = 0, fails = [];
const sweep = (sec, fn) => { const at = []; for (let t = .05; t < sec - .2; t += .01) at.push([t, {set: fn(t)}]); return at; };
for (const lq of [1, 0]) for (const ftype of [0, 1, 2, 3, 4, 5]) for (const res of [1, 1.15]) for (const drive of [0, 1]) for (const loud of [0, 1]) {
  const p = Object.assign({}, INIT, {lq, ftype, res, drive, cutoff: 800, analog: .15},
    loud ? {o1uni: 7, o2lvl: 1, o2uni: 7, o3lvl: 1, o3uni: 7, subLvl: 1, noise: 1} : {});
  const at = sweep(2, t => ({cutoff: 20 * Math.pow(1000, (Math.sin(t * 2 * Math.PI * 3) + 1) / 2), res: res - .3 * Math.abs(Math.sin(t * 40))}));
  const mods = [{src: 1, dst: 3, amt: 1}, {src: 1, dst: 4, amt: 1}, {src: 2, dst: 5, amt: 1}];
  const r = va(Object.assign({}, p, {l1rate: 40, l2rate: 17}), [[0, 'on', 36, 1], [.02, 'on', 60, 1], [.03, 'on', 84, 1], [1.8, 'off', 36], [1.8, 'off', 60], [1.8, 'off', 84]], {sec: 2, at, mods, file});
  const m = maxAbs(r.l); let inf = 0; for (const x of r.l) if (!isFinite(x) && x === x) inf++;
  // dropout: 128-sample RMS windows between .1 and 1.7 s
  const W = 128, e = []; for (let i = Math.round(.1 * sr); i + W < Math.round(1.7 * sr); i += W) { let s = 0; for (let j = 0; j < W; j++) s += r.l[i + j] ** 2; e.push(Math.sqrt(s / W)); }
  let drop = 0; for (let i = 2; i < e.length - 2; i++) { const nb = Math.min(e[i - 2], e[i + 2]); if (nb > 1e-3 && e[i] < nb / 100) drop++; }
  n++; worst.drop = Math.max(worst.drop, drop); worst.peak = Math.max(worst.peak, m.m); worst.nan += m.nan; worst.inf += inf;
  if (drop || m.nan || inf || m.m > 4) fails.push({lq, ftype, res, drive, loud, drop, nan: m.nan, inf, peak: +m.m.toFixed(2)});
}
console.log(JSON.stringify({cases: n, worst, fails: fails.slice(0, 12), nfail: fails.length}));
