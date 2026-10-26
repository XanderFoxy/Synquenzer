import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const sr = 48000;
for (const [car, n] of [['noise', 1], ['saw', 4]]) {
  const t0 = car === 'noise' ? {mix: {o1: 0, o2: 0, n: 127}} : {};
  const ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]].slice(0, n);
  const a = render(vocP({res: 64}, t0), ch, {sec: 4, inputs: {e2: noise(4, sr, .2, 9)}});
  const b = render(vocP({res: 64}, t0), ch, {sec: 4, inputs: {e2: noise(4, sr, .2, 9)}, at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]});
  const K = (x, t0, t1) => mKlick(x.subarray(t0 * sr, t1 * sr), sr, []);
  console.log(car, 'nosw', K(a.l, .5, 4).worst.toFixed(2), K(a.l, .5, 4).at, 'sw', K(b.l, .5, 4).worst.toFixed(2), K(b.l, .5, 4).at, 'at switch1', K(b.l, .9, 1.2).worst.toFixed(2), 'switch2', K(b.l, 2.4, 2.7).worst.toFixed(2), 'same windows no switch', K(a.l, .9, 1.2).worst.toFixed(2), K(a.l, 2.4, 2.7).worst.toFixed(2));
}
