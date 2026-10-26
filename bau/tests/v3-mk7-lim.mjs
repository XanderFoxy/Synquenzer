import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
import {mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const sr = 48000;
for (const [car, n] of [['noise', 1], ['saw', 4]]) {
  const t0 = car === 'noise' ? {mix: {o1: 0, o2: 0, n: 127}} : {};
  const ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]].slice(0, n);
  const a = render(vocP({res: 64}, t0), ch, {sec: 4, inputs: {e2: noise(4, sr, .2, 9)}});
  const b = render(vocP({res: 64}, t0), ch, {sec: 4, inputs: {e2: noise(4, sr, .2, 9)}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
  const L4 = db(rms(a.l, 2 * sr, 2.5 * sr)), L2 = db(rms(b.l, 2 * sr, 2.5 * sr));
  console.log(car, '4th', L4.toFixed(2), '2nd', L2.toFixed(2), 'diff', (L2 - L4).toFixed(2), 'klick', mKlick(b.l, sr, [0]).worst.toFixed(2), 'einbruch', mEinbruch(b.l, sr, 1.03).worst.toFixed(2), mEinbruch(b.l, sr, 2.53).worst.toFixed(2), 'back 4th', (db(rms(b.l, 3 * sr, 4 * sr)) - db(rms(a.l, 3 * sr, 4 * sr))).toFixed(2));
}
