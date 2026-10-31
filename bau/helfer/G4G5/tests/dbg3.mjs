import {loadG4} from './dsp-node.mjs';
import * as M from '../../../vs-dsp/marks.mjs';
import {sylTake, db, rms, pct} from './sig.mjs';
const D = loadG4(), sr = 44100, {y: x, seg} = sylTake(sr);
const mk = M.detectMarks(x, sr);
console.log('marks', mk.length, 'syl', seg.length);
const hits = seg.map(([a]) => mk.filter(m => Math.abs(m.t - a / sr) < 0.03).length);
console.log('hits per syl', hits.join(''));
const L0 = seg.map(([a, b]) => db(rms(x, a, b)));
for (const sy of [70, 80, 90, 100]) {
  const y = D.render(x, sr, {hp: 100, ds: 0, sy, ra: 1, thr: -24, lo: 0, mid: 0, pre: 0}, mk).y, L1 = seg.map(([a, b]) => db(rms(y, a, b)));
  const s0 = pct(L0, .9) - pct(L0, .1), s1 = pct(L1, .9) - pct(L1, .1);
  const yt = D.render(x, sr, {hp: 100, ds: 0, sy, ra: 1, thr: -24, lo: 0, mid: 0, pre: 0}, seg.map(([a]) => ({t: a / sr}))).y, L2 = seg.map(([a, b]) => db(rms(yt, a, b)));
  console.log(sy, (100 * (s0 - s1) / s0).toFixed(0) + '%', 'ideal marks', (100 * (s0 - (pct(L2, .9) - pct(L2, .1))) / s0).toFixed(0) + '%');
}
