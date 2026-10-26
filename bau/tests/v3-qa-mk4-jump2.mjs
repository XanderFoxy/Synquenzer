import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
for (const [ch, ts] of [[[84, 88, 91], 1.7], [[84, 88, 91], 2.0], [[60, 64, 67], 1.4]]) {
  const ev = ch.map((n, k) => [0, 'on', n, k ? .6 : .7]);
  const a = render(FXP({mfx: {type: 2, spd: 64, dep: 0}}, SOFT), ev, {sec: ts + .4, file: FILE, at: [[ts, {mkSet: {'mfx.dep': 127}}]]});
  const s = render(FXP({mfx: {type: 2, spd: 64, dep: 127}}, SOFT), ev, {sec: ts + .4, file: FILE});
  const d = render(FXP({}, SOFT), ev, {sec: ts + .4, file: FILE});
  const W = 240, row = [];
  for (let t = ts - .02; t < ts + .1; t += .005) { const i = Math.round(t * SR); row.push(((t - ts) * 1000).toFixed(0) + ':' + db(rms(a.l, i, i + W)).toFixed(1) + '/' + db(rms(s.l, i, i + W)).toFixed(1) + '/' + db(rms(d.l, i, i + W)).toFixed(1)); }
  console.log('chord ' + ch + ' switch ' + ts + ' s — ms: jump / phaser on all along / dry (dBFS, 5 ms RMS, L)\n  ' + row.join('  '));
  console.log('  M-EINBRUCH L/R', mEinbruch(a.l, SR, ts).worst.toFixed(1), mEinbruch(a.r, SR, ts).worst.toFixed(1));
}
