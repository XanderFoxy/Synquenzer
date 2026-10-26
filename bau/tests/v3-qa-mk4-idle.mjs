// QA MK4: effect smoothing only advances inside run(); a change made while the track is silent is applied at the NEXT note
import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const pluck = {o1: {w: 0}, f: {type: 0, cut: 90, res: 20, eg: 30}, e1: {a: 0, d: 50, s: 0, r: 30}, e2: {a: 0, d: 60, s: 0, r: 30}};
const dry = FXP({}, pluck);
const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [2.0, 'on', 64, .9], [2.5, 'off', 64]];
const cases = [
  ['program change while silent: Phaser 127 + EQ +12 dB -> dry program', FXP({mfx: {type: 2, spd: 64, dep: 127}, eq: {lf: 200, lg: 12, hf: 6000, hg: 0}}, pluck), [[1.0, {mk: dry}]]],
  ['TIEFE 127 -> 0 while silent (Ensemble)', FXP({mfx: {type: 1, spd: 64, dep: 127}}, pluck), [[1.0, {mkSet: {'mfx.dep': 0}}]]],
  ['TIEF-GAIN +12 -> 0 while silent', FXP({eq: {lf: 200, lg: 12, hf: 6000, hg: 0}}, pluck), [[1.0, {mkSet: {'eq.lg': 0}}]]],
];
for (const [name, p0, at] of cases) {
  const a = render(p0, ev, {sec: 2.6, file: FILE, at}), b = render(dry, ev, {sec: 2.6, file: PREV});
  const i0 = 2.0 * SR; let w = 0; for (let i = i0; i < a.l.length; i++) w = Math.max(w, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  const lv = (y, t0, t1) => db(rms(y, Math.round(t0 * SR), Math.round(t1 * SR)));
  const wins = [[2.0, 2.005], [2.005, 2.01], [2.01, 2.02], [2.02, 2.04], [2.04, 2.08]].map(([x, y]) => (lv(a.l, x, y) - lv(b.l, x, y)).toFixed(1));
  // first note itself (with FX) vs dry: shows FX were audible in note 1
  console.log(name + ':\n   note 2 (TIEFE/GAIN already 0 for 1 s) vs 4.10.0 dry: max |d| ' + w.toFixed(4) + ' (peak ' + Math.max(...b.l.subarray(i0)).toFixed(3) + '); level a-b in 0-5/5-10/10-20/20-40/40-80 ms: ' + wins.join(' / ') + ' dB');
  // same edit made while a note sounds (control): note 2 equal?
  const ev2 = [[0, 'on', 60, .9], [1.2, 'off', 60], [2.0, 'on', 64, .9], [2.5, 'off', 64]], ev2d = ev2;
  const c = render(p0, ev2, {sec: 2.6, file: FILE, at}), d = render(dry, ev2d, {sec: 2.6, file: PREV});
  let w2 = 0; for (let i = i0; i < c.l.length; i++) w2 = Math.max(w2, Math.abs(c.l[i] - d.l[i]));
  console.log('   control (same edit while note 1 still sounds): note 2 max |d| ' + w2.toExponential(2));
}
