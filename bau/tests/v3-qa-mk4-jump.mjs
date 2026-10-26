// Mod-FX TIEFE 0 -> 127 as a jump on a held chord (all 3 types; builder tested type 0 only): M-EINBRUCH / M-KLICK, against the
// same moment of an engine where the effect was on all along (natural level movement of the effect)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, mEinbruch, db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
for (const [cn, ch] of [['C4 E4 G4', [60, 64, 67]], ['C6 E6 G6 (builder chord)', [84, 88, 91]], ['C3 G3', [48, 55]]]) for (const type of [0, 1, 2]) {
  const ev = ch.map((n, k) => [0, 'on', n, k ? .6 : .7]);
  const res = [];
  for (const ts of [.8, 1.1, 1.4, 1.7, 2.0]) {
    const a = render(FXP({mfx: {type, spd: 64, dep: 0}}, SOFT), ev, {sec: ts + .4, file: FILE, at: [[ts, {mkSet: {'mfx.dep': 127}}]]});
    const s = render(FXP({mfx: {type, spd: 64, dep: 127}}, SOFT), ev, {sec: ts + .4, file: FILE});
    const e = Math.min(mEinbruch(a.l, SR, ts).worst, mEinbruch(a.r, SR, ts).worst), es = Math.min(mEinbruch(s.l, SR, ts).worst, mEinbruch(s.r, SR, ts).worst);
    res.push(e.toFixed(1) + ' (on all along ' + es.toFixed(1) + ')');
  }
  console.log(cn.padEnd(26) + ' type ' + type + ' M-EINBRUCH at the jump 0→127 for 5 switch times: ' + res.join(', '));
}
