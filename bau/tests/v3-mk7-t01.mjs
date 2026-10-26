import {render, vocP, sine, rms, db, spectrum, bandE} from './v3-mk7-node.mjs';
const sr = 48000, R = [39, 50, 65, 80, 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000, 6400, 8100, 10510, 12600];
const C = k => R[k + 4];   // band k 0..15
const edge = (k, s) => Math.sqrt(C(k) * (s > 0 ? (R[k + 5]) : R[k + 3]));
const N = 65536;
const lim = process.argv[2] ? +process.argv[2] : 0;
let worst1 = 99, worst3 = 99;
for (let k = 0; k < 16; k++) {
  const mod = sine(C(k), 2, sr, .3);
  const r = render(vocP({res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 60, .8]], {sec: 2, inputs: {e2: mod}, at: lim ? [[0, {set: {mkLim: lim}}]] : []});
  const P = spectrum(r.l, 96000 - N - 100, N);
  const E = j => (j < 0 || j > 15) ? null : bandE(P, sr, N, edge(j, -1), edge(j, 1));
  const ek = E(k); const o = [];
  for (const d of [-3, -1, 1, 3]) { const e = E(k + d); if (e == null) continue; const x = 10 * Math.log10(ek / e); o.push(d + ':' + x.toFixed(1)); if (Math.abs(d) === 1) worst1 = Math.min(worst1, x); else worst3 = Math.min(worst3, x); }
  console.log('band', k + 1, C(k), 'out', db(rms(r.l, 48000, 96000)).toFixed(1), o.join(' '));
}
console.log('worst k±1', worst1.toFixed(1), 'k±3', worst3.toFixed(1));
