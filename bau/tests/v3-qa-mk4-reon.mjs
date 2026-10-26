// Mod-FX on -> off -> on again while a chord sounds: the re-enable skips the reset branch (stale mOn), stale line content?
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
let seed = 3; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const nz = new Float32Array(SR * 4); for (let i = 0; i < nz.length; i++) nz[i] = (rnd() * 2 - 1) * .15;
const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6]];
for (const type of [0, 1, 2]) {
  const msgs = [[1, {mkSet: {'mfx.dep': 0}}], [2.5, {mkSet: {'mfx.dep': 127}}]];
  const a = render(FXP({mfx: {type, spd: 64, dep: 127}}, SOFT), ev, {sec: 3.2, file: FILE, at: msgs});
  const fresh = render(FXP({mfx: {type, spd: 64, dep: 0}}, SOFT), ev, {sec: 3.2, file: FILE, at: [[2.5, {mkSet: {'mfx.dep': 127}}]]});
  const n = render(FXP({mfx: {type, spd: 64, dep: 127}}), [], {sec: 3.2, file: FILE, tap: 'fx', at: [[0, {mkFxIn: {l: nz, r: nz}}]].concat(msgs)});
  const nf = render(FXP({mfx: {type, spd: 64, dep: 0}}), [], {sec: 3.2, file: FILE, tap: 'fx', at: [[0, {mkFxIn: {l: nz, r: nz}}], [2.5, {mkSet: {'mfx.dep': 127}}]]});
  const seg = y => y.subarray(Math.round(2.45 * SR), Math.round(2.6 * SR));
  const k = y => Math.max(mKlick(seg(y.l), SR, []).worst, mKlick(seg(y.r), SR, []).worst);
  console.log(`type ${type}: re-enable at 2.5 s after off at 1 s — chord M-KLICK ${k(a).toFixed(1)} dB (first enable ${k(fresh).toFixed(1)}), noise M-KLICK ${k(n).toFixed(1)} dB (first enable ${k(nf).toFixed(1)}); M-EINBRUCH chord ${mEinbruch(a.l, SR, 2.5).worst.toFixed(1)} (first ${mEinbruch(fresh.l, SR, 2.5).worst.toFixed(1)})`);
}
