// delay time sweep on a steady sine: echo amplitude envelope (5 ms RMS) and frequency of the wet part
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms, zcFreq} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = fx => Object.assign(mkPatch({}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx);
const n = SR * 4, x = new Float32Array(n); for (let i = 0; i < SR * 1.0; i++) x[i] = .3 * Math.sin(2 * Math.PI * 1000 * i / SR);   // 1 s tone, then the echoes alone
for (const [nm, steps] of [['ZEIT 90 -> 100 in 1 s (60 steps)', 60], ['ZEIT 90 -> 100 in 1 s (8 steps)', 8]]) {
  const at = [[0, {mkFxIn: {l: x, r: x}}]]; for (let k = 0; k <= steps; k++) at.push([1.2 + k / steps, {mkSet: {'dly.time': 90 + 10 * k / steps}}]);
  const r = render(FXP({dly: {type: 0, sync: 0, time: 90, note: 8, dep: 100}}), [], {sec: 3.5, file: FILE, tap: 'fx', at});
  const ref = render(FXP({dly: {type: 0, sync: 0, time: 90, note: 8, dep: 100}}), [], {sec: 3.5, file: FILE, tap: 'fx', at: [at[0]]});
  // envelope of the echo tail between 1.2 and 2.2 s in 5 ms windows relative to the same windows without the sweep (exp. decay)
  const W = 240; let mx = -99, mn = 99; const env = [];
  for (let i = Math.round(1.2 * SR); i + W < Math.round(2.2 * SR); i += W) { const a = db(rms(r.l, i, i + W)), b = db(rms(ref.l, i, i + W)); env.push(a - b); }
  // relative change window to window (wobble), ignoring the smooth decay difference: max |env[k] - env[k-1]|
  let wob = 0; for (let k = 1; k < env.length; k++) wob = Math.max(wob, Math.abs(env[k] - env[k - 1]));
  let lo = 0; for (const e of env) lo = Math.min(lo, e);
  // frequency of the echo during the sweep (zero crossings, 50 ms windows)
  const fr = []; for (let t = 1.25; t < 2.2; t += .1) fr.push(Math.round(zcFreq(r.l, Math.round(t * SR), Math.round((t + .05) * SR), SR)));
  console.log(nm + ': echo level vs no-sweep: min ' + lo.toFixed(1) + ' dB, largest 5-ms step ' + wob.toFixed(1) + ' dB; echo frequency (Hz) during sweep: ' + fr.join(' '));
}
