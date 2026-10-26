// MK3-09 x MK4: switching MODUS / STIMMEN / SPLIT / a whole program while the program effects run (merged worklet)
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {mKlick, mEinbruch, peak, rms, db} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
let bad = 0; const chk = (ok, s) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const M = x => Math.round(x * 10) / 10;
const prog = (top) => { const p = mkDefaults(); p.mfx = {type: 1, spd: 64, dep: 80}; p.dly = {type: 0, sync: 0, time: 70, note: 8, dep: 90}; p.eq = {lf: 320, lg: 3, hf: 6000, hg: -3};
  p.t[0].o1.w = 2; p.t[0].f.cut = 100; p.t[1].o1.w = 1; p.t[1].o1.c1 = 40; p.t[1].f.cut = 90; p.t[1].trans = 12; p.t[1].a.lvl = 110;
  for (const k in top || {}) p[k] = top[k]; return p; };
const chord = [[0, 'on', 57, .8], [0, 'on', 61, .8], [0, 'on', 64, .8]];
const rows = []; let all = true;
for (const [top, msg, lab] of [[{mode: 0}, {mode: 1}, 'Einzeln→Schicht'], [{mode: 1}, {mode: 0}, 'Schicht→Einzeln'], [{mode: 1}, {mode: 2, split: 62}, 'Schicht→Split'], [{mode: 2, split: 62}, {split: 58}, 'SPLIT 62→58'], [{mode: 1, tv: 1}, {tv: 0}, 'STIMMEN 2+2→1+3'], [{mode: 1}, {'dly.dep': 0}, 'DELAY TIEFE→0'], [{mode: 1}, {'mfx.type': 2}, 'MOD-FX Ens→Phaser']]) {
  const x = render(prog(top), chord, {file: FILE, sec: 1.2, at: [[.5, {mkSet: msg}]]});
  const k = mKlick(x.l, SR, [0]); const k2 = mKlick(x.r, SR, [0]);
  rows.push(lab + ' klick ' + M(Math.max(k.worst, k2.worst)) + ' dB'); if (Math.max(k.worst, k2.worst) > 6) all = false;
}
chk(all, 'M-KLICK ≤ +6 dB beim Umschalten mit laufenden Effekten (gehaltener Akkord): ' + rows.join(' | '));
// echo ringing (no voice) and the structure changes: the echo continues bit-identically (effects after the sum, nothing to re-route)
const ev = [[0, 'on', 57, .8], [.2, 'off', 57]];
let worst = 0; const r2 = [];
for (const [top, msg, lab] of [[{mode: 0}, {mode: 1}, 'Einzeln→Schicht'], [{mode: 1}, {mode: 2, split: 30}, 'Schicht→Split'], [{mode: 1}, {tv: 2}, 'STIMMEN']]) {
  const a = render(prog(top), ev, {file: FILE, sec: 2, at: [[.8, {mkSet: msg}]]}), b = render(prog(top), ev, {file: FILE, sec: 2});
  let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  r2.push(lab + ' Δ ' + d.toExponential(2) + ' echo@1.2s ' + M(db(rms(b.l, 1.1 * SR, 1.4 * SR)))); worst = Math.max(worst, d);
}
chk(worst < 1e-6, 'Umschalten während nur das Echo klingt: Echo unverändert — ' + r2.join(' | '));
// a whole program (sound load) while the echo rings: the new sound has the delay off -> the old echo? (MK4 rule: fxSettle)
{ const a = render(prog({mode: 1}), ev, {file: FILE, sec: 2, at: [[.8, {mk: Object.assign(prog({mode: 0}), {dly: {type: 0, sync: 0, time: 70, note: 8, dep: 0}})}]]});
  const k = mKlick(a.l, SR, [0]); console.log('INFO sound load (delay off) while echo rings: klick ' + M(k.worst) + ' dB, level 1.0–1.3 s ' + M(db(rms(a.l, 1.0 * SR, 1.3 * SR))) + ' dB'); }
process.exitCode = bad ? 1 : 0; console.log(bad ? bad + ' FAIL' : 'alles bestanden');
