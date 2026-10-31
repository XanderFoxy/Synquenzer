import {loadG4} from './dsp-node.mjs';
import {sibTake, band59, db, maxWin, rms, pct} from './sig.mjs';
const D = loadG4(), sr = 44100, {y: x, at} = sibTake(sr);
const P = {on: true, hp: 100, ds: 4, sy: 0, thr: -24, ra: 3, lo: -1, mid: -2, pre: 3};
for (const v of [{}, {ra: 1}, {ra: 1, pre: 0, lo: 0, mid: 0}]) {
  const y1 = D.render(x, sr, {...P, ...v}, []).y, y0 = D.render(x, sr, {...P, ...v, ds: 0}, []).y;
  const b1 = band59(y1, sr), b0 = band59(y0, sr), W = Math.round(0.01 * sr);
  const d = at.map(([i0, i1]) => db(maxWin(b1, i0, i1, W)) - db(maxWin(b0, i0, i1, W)));
  const info = D.render(x, sr, {...P, ...v}, []).info;
  console.log(JSON.stringify(v), d.map(z => z.toFixed(1)).join(' '), JSON.stringify(info.ds));
}
