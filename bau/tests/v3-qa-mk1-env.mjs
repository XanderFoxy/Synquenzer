import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, tD = v => .002 * Math.pow(2, 13 * v / 127), tA = v => .0005 * Math.pow(2, 15 * v / 127);
for (const v of [0, 8, 16, 32, 64]) {
  // decay: peak -> 90 % of the way to sustain 64
  let x = render(mkPatch({o1: {w: 2}, e2: {a: 0, d: v, s: 64, r: 0}}), [[0, 'on', 81, .8]], {sec: Math.max(.3, tD(v) * 3), tap: 'amp'}).l;
  let im = 0; for (let i = 0; i < 4800; i++) if (x[i] > x[im]) im = i; const pk = x[im], s = x[x.length - 2], tg = pk - .9 * (pk - s); let i = im; while (i < x.length && x[i] > tg) i++;
  const d = (i - im) / SR;
  // release: from the level at note off to -20 dB
  const t0 = .1; x = render(mkPatch({o1: {w: 2}, e2: {a: 0, d: 0, s: 127, r: v}}), [[0, 'on', 81, .8], [t0, 'off', 81]], {sec: t0 + Math.max(.2, tD(v) * 3), tap: 'amp'}).l;
  const i0 = Math.round(t0 * SR), L = x[i0 - 1]; let j = i0; while (j < x.length && x[j] > L / 10) j++;
  const r = (j - i0) / SR;
  console.log('v', v, 'decay', (d * 1000).toFixed(2), 'ms vs', (tD(v) * 1000).toFixed(2), '(' + ((d / tD(v) - 1) * 100).toFixed(0) + ' %)', '| release', (r * 1000).toFixed(2), 'ms (' + ((r / tD(v) - 1) * 100).toFixed(0) + ' %)');
}
