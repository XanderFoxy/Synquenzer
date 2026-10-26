// ideal float64 flanger (W-31) on the dry saw chord vs the worklet: is the M-KLICK peak inherent?
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const SR = 48000, SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}}, dep = 100, spd = 64;
const ev = [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]];
const b0 = render(mkPatch(SOFT), ev, {sec: 3.2, tap: 'fx'}), b = render(Object.assign(mkPatch(SOFT), {mfx: {type: 0, spd, dep}}), ev, {sec: 3.2, tap: 'fx'});
const x = b0.l, n = x.length, y = new Float64Array(n), buf = new Float64Array(n), hz = .02 * 2 ** (9 * spd / 127), w = Math.min(.5, .6 * dep / 127), fb = Math.max(0, (dep - 64) / 63) * .85;
let ph = 0;
for (let i = 0; i < n; i++) { const d = (.001 + .004 * dep / 127 * (.5 + .5 * Math.sin(2 * Math.PI * ph))) * SR; ph += hz / SR;
  const p = i - d, j = Math.floor(p), f = p - j, r = j >= 1 ? buf[j] + (buf[j + 1] - buf[j]) * f : 0; buf[i] = x[i] + fb * r; y[i] = x[i] * (1 - w) + r * w; }
console.log('ideal', mKlick(y, SR, [0]).worst.toFixed(2), 'worklet', mKlick(b.l, SR, [0]).worst.toFixed(2), 'dry', mKlick(x, SR, [0]).worst.toFixed(2));
