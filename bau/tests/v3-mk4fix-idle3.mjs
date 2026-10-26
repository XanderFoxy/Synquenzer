// MK4-fix: edits made in the silence, compared with an engine that always had the new value (same notes)
import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => { const p = mkPatch(t || {}); p.mfx = {type: 0, spd: 64, dep: 0}; p.dly = {type: 0, sync: 0, time: 64, note: 8, dep: 0}; p.eq = {lf: 320, lg: 0, hf: 6000, hg: 0}; for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const pluck = {o1: {w: 0}, f: {type: 0, cut: 90, res: 20, eg: 30}, e1: {a: 0, d: 50, s: 0, r: 30}, e2: {a: 0, d: 60, s: 0, r: 30}};
const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [4.0, 'on', 64, .9], [4.5, 'off', 64]];
const cases = [
  ['Cho TIEFE 0 -> 127', {}, {mfx: {dep: 127}}, {'mfx.dep': 127}],
  ['Phaser TIEFE 40 -> 127', {mfx: {type: 2, dep: 40}}, {mfx: {type: 2, dep: 127}}, {'mfx.dep': 127}],
  ['Ensemble -> Phaser (dep 100)', {mfx: {type: 1, dep: 100}}, {mfx: {type: 2, dep: 100}}, {'mfx.type': 2}],
  ['EQ lg 0 -> +12, hg 0 -> -6', {}, {eq: {lg: 12, hg: -6}}, {'eq.lg': 12, 'eq.hg': -6}],
  ['DELAY dep 0 -> 100 (buffer new)', {}, {dly: {dep: 100}}, {'dly.dep': 100}],
];
let bad = 0;
for (const [name, f0, f1, set] of cases) {
  const a = render(FXP(f0, pluck), ev, {sec: 4.6, file: FILE, at: [[2.5, {mkSet: set}]]}), b = render(FXP(f1, pluck), ev, {sec: 4.6, file: FILE});
  let w = 0; for (let i = 4.0 * SR; i < a.l.length; i++) w = Math.max(w, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  let pk = 0; for (let i = 4.0 * SR; i < a.l.length; i++) pk = Math.max(pk, Math.abs(b.l[i]));
  const ok = w <= 1e-6; if (!ok) bad++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': note 2 max |d| ' + w.toExponential(2) + ' (peak ' + pk.toFixed(3) + ')');
}
// the delay case where the delay already had a buffer: compare with dry reference of delay time change while silent (ZEIT 64 -> 100)
{
  const p0 = FXP({dly: {dep: 90, time: 64}}, pluck), p1 = FXP({dly: {dep: 90, time: 100}}, pluck);
  const ev2 = [[0, 'on', 60, .9], [.05, 'off', 60], [9.0, 'on', 64, .9], [9.3, 'off', 64]];
  const a = render(p0, ev2, {sec: 9.6, file: FILE, at: [[8.0, {mkSet: {'dly.time': 100}}]]}), b = render(p1, ev2, {sec: 9.6, file: FILE});
  const q = a.P.mk.fx; let w = 0; for (let i = 9.0 * SR; i < a.l.length; i++) w = Math.max(w, Math.abs(a.l[i] - b.l[i]));
  console.log('     DELAY ZEIT 64 -> 100 while silent: note 2 max |d| ' + w.toExponential(2) + ' (dX ' + q.dX + ', hot ' + q.hot() + ')');
}
process.exitCode = bad ? 1 : 0;
