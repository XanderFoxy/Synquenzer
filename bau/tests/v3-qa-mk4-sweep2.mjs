// delay time change on a steady tone: equal-power crossfade of two read heads (MK4) vs a gliding head (spec Umfang 2)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = fx => Object.assign(mkPatch({}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx);
const n = SR * 4, f0 = 440;
const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = .2 * Math.sin(2 * Math.PI * f0 * i / SR);
for (const [nm, dep, at] of [
  ['ZEIT 90 -> 91 (one step) TIEFE 64', 64, [[2, {mkSet: {'dly.time': 91}}]]],
  ['ZEIT 90 -> 91 (one step) TIEFE 127', 127, [[2, {mkSet: {'dly.time': 91}}]]],
  ['ZEIT 90 -> 100 sweep 1 s, 30 steps TIEFE 64', 64, Array.from({length: 31}, (_, k) => [2 + k / 30, {mkSet: {'dly.time': 90 + 10 * k / 30}}])],
  ['TEMPO SYNC 1/8 tempo 120 -> 118 BPM TIEFE 64', 64, [[2, {tempo: {bpm: 118}}]]]]) {
  const sync = nm.startsWith('TEMPO');
  const r = render(FXP({dly: {type: 0, sync: sync ? 1 : 0, time: 90, note: 5, dep}}), [], {sec: 3.6, file: FILE, tap: 'fx', bpm: 120, at: [[0, {mkFxIn: {l: x, r: x}}]].concat(at)});
  const echo = new Float32Array(n); for (let i = 0; i < r.l.length && i < n; i++) echo[i] = r.l[i] - x[i];
  const W = 240; const lv = []; for (let i = Math.round(1.5 * SR); i + W < Math.round(3.4 * SR); i += W) lv.push(db(rms(echo, i, i + W)));
  const ref = lv.slice(0, 40).reduce((a, b) => a + b, 0) / 40; let lo = 99, hi = -99; for (const v of lv) { lo = Math.min(lo, v - ref); hi = Math.max(hi, v - ref); }
  const outLv = []; for (let i = Math.round(1.5 * SR); i + W < Math.round(3.4 * SR); i += W) outLv.push(db(rms(r.l, i, i + W)));
  const oref = outLv.slice(0, 40).reduce((a, b) => a + b, 0) / 40; let olo = 99; for (const v of outLv) olo = Math.min(olo, v - oref);
  console.log(nm.padEnd(46) + ' echo part: min ' + lo.toFixed(1) + ' dB / max +' + hi.toFixed(1) + ' dB vs steady; whole output (dry+echo): min ' + olo.toFixed(1) + ' dB; M-EINBRUCH at the change ' + mEinbruch(r.l, SR, 2).worst.toFixed(1) + ' dB');
}
