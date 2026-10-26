import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, pdb, mEinbruch, mKlick, envDb} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE;
const FX0 = {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}};
const P = (t, fx) => { const p = Object.assign(mkPatch(t), JSON.parse(JSON.stringify(FX0))); for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6], [3.9, 'off', 60], [3.9, 'off', 64], [3.9, 'off', 67]];
const tim = {o1: {w: 0}, mix: {o1: 127}, f: {cut: 110}};
for (const [nm, fx, at, t, ctl] of [
  ['ens 127->0', {mfx: {type: 1, spd: 64, dep: 127}}, [[1.5, {mkSet: {'mfx.dep': 0}}]], 1.5, {mfx: {type: 1, spd: 64, dep: 127}}],
  ['ens 0->127', {mfx: {type: 1, spd: 64, dep: 0}}, [[2.5, {mkSet: {'mfx.dep': 127}}]], 2.5, {mfx: {type: 1, spd: 64, dep: 0}}],
  ['pha->ens', {mfx: {type: 2, spd: 64, dep: 127}}, [[1.5, {mkSet: {'mfx.type': 1}}]], 1.5, {mfx: {type: 2, spd: 64, dep: 127}}],
]) {
  const r = render(P(tim, fx), ev, {sec: 4, file: FILE, at}), c = render(P(tim, ctl), ev, {sec: 4, file: FILE});
  const E = envDb(r.l, 48000, 5), C = envDb(c.l, 48000, 5), i = Math.round(t / .005);
  console.log(nm, 'switch EIN', mEinbruch(r.l, 48000, t).worst.toFixed(2), mEinbruch(r.r, 48000, t).worst.toFixed(2), '| control (no switch) at same t', mEinbruch(c.l, 48000, t).worst.toFixed(2), mEinbruch(c.r, 48000, t).worst.toFixed(2));
  // the control at many times: how often is the plain effect itself below -3
  let bad = 0, n = 0, wst = 0; for (let tt = .5; tt < 3.5; tt += .05) { const w = Math.min(mEinbruch(c.l, 48000, tt).worst, mEinbruch(c.r, 48000, tt).worst); n++; if (w < -3) bad++; wst = Math.min(wst, w); }
  console.log('   control over 60 times: below -3 dB', bad, 'of', n, 'worst', wst.toFixed(2));
  console.log('   env L around switch (5ms):', E.slice(i - 10, i + 22).map(x => x.toFixed(1)).join(' '));
}
