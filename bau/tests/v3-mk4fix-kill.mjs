// MK4-fix: panic / tail kill of the program delay and Mod-FX tails (Node, real worklet): tail level after the kill, click check
// (largest sample step around the kill vs the steps of the running tail), a new note after the kill still gets its echo
import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => { const p = mkPatch(t || {}); p.mfx = {type: 0, spd: 64, dep: 0}; p.dly = {type: 0, sync: 0, time: 110, note: 8, dep: 0}; p.eq = {lf: 320, lg: 0, hf: 6000, hg: 0}; for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const pad = {o1: {w: 0}, f: {type: 0, cut: 100, res: 10, eg: 0}, e1: {a: 0, d: 64, s: 127, r: 20}, e2: {a: 0, d: 64, s: 127, r: 20}};
const db = x => (20 * Math.log10(Math.max(1e-12, x))).toFixed(1);
const pk = (y, a, b) => { let m = 0; for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) m = Math.max(m, Math.abs(y[i])); return m; };
const step = (y, a, b) => { let m = 0; for (let i = Math.round(a * SR) + 1; i < Math.round(b * SR); i++) m = Math.max(m, Math.abs(y[i] - y[i - 1])); return m; };
let bad = 0; const chk = (ok, s) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const cases = [['DELAY 127 (ZEIT 110)', {dly: {dep: 127}}], ['DELAY 127 + Cho/Flg 127', {dly: {dep: 127}, mfx: {type: 0, dep: 127}}], ['Phaser 127', {mfx: {type: 2, dep: 127}}], ['DELAY Cross 127 + EQ +12', {dly: {dep: 127, type: 1}, eq: {lg: 12}}]];
for (const [name, fx] of cases) for (const how of ['panic', 'kill']) {
  const ev = [[0, 'on', 57, .9], [0, 'on', 60, .9], [0, 'on', 64, .9], [.4, 'off', 57], [.4, 'off', 60], [.4, 'off', 64], [4.0, 'on', 69, .9], [4.2, 'off', 69]];
  const msg = how === 'panic' ? {ev: [[1.5, 6, 0]]} : {mkFxKill: 1};
  const a = render(FXP(fx, pad), ev, {sec: 6, file: FILE, at: [[1.5, msg]]}), b = render(FXP(fx, pad), ev, {sec: 6, file: FILE});
  const before = pk(b.l, 1.5, 3.9), after = pk(a.l, 1.52, 3.99), refStep = step(b.l, 1.4, 1.5), kStep = step(a.l, 1.49, 1.53);
  const echo2 = pk(a.l, 4.3, 6), echo2b = pk(b.l, 4.3, 6);
  console.log(`  ${name} / ${how}: tail without kill ${db(before)} dB, after the kill (20 ms on) ${db(after)} dB; max step at the kill ${kStep.toExponential(2)} vs running tail ${refStep.toExponential(2)}; echo of a new note ${db(echo2)} dB (without kill ${db(echo2b)})`);
  const late = pk(a.l, 2.0, 3.99);
  console.log(`     from 0.5 s after the kill: ${db(late)} dB`);
  chk(after < 1e-4, `${name} / ${how}: tail gone 20 ms after the kill (< -80 dB; the rest is the DC blocker settling)`);
  chk(late < 1e-5, `${name} / ${how}: silence from 0.5 s after the kill (< -100 dB)`);
  chk(kStep <= refStep * 1.05 + 1e-6, `${name} / ${how}: no click at the kill (step ≤ steps of the running tail)`);
  if (fx.dly) chk(echo2 > 1e-3, `${name} / ${how}: a note after the kill has its echo again`);
}
process.exitCode = bad ? 1 : 0;
