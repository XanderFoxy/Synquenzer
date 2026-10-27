import {stretch} from '../vs-dsp/stretch.mjs';
import {clickTone, SR, rmsDbR} from './v3-vs5b-h.mjs';
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 4.6);
const src = [0, 0.301, ...T], dst = [0, 0.25, ...T.map(t => Math.round(t / 0.25) * 0.25)];
const L = 0.004, S2 = [0, ...src.slice(1).map(v => v - L), 4.6], D2 = [0, ...dst.slice(1).map(v => v - L), 4.6];
for (const o of [{lock: .024}, {lock: .024, endAlign: false}, {lock: .024, search: .006}, {lock: .024, win: .03}]) {
  const t0 = Date.now(), y = stretch(x, SR, {src: S2, dst: D2}, o).y, ms = Date.now() - t0;
  const P2 = Math.round(2 * SR / 196), ref0 = rmsDbR(x, Math.round(0.35 * SR), Math.round(0.45 * SR));
  let worst = 0, n = 0; for (let s = Math.round(0.6 * SR); s + P2 < Math.round(4.3 * SR); s += P2 >> 2) { const v = rmsDbR(y, s, s + P2) - ref0; if (v < worst) worst = v; if (v < -3) n++; }
  console.log(JSON.stringify(o), 'worst', worst.toFixed(2), 'n<-3dB', n, ms + ' ms');
}
