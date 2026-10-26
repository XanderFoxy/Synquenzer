// Independent repro: held vocoder formant vs. SCHWELLE (gate) with no / quiet modulator.
import {render, vocP, noise, rms, db} from './v3-mk7-node.mjs';
const sr = 48000;
const hold = new Array(16).fill(90);
console.log('(1) stored hold all 90, no input at all, note A3 on at 0; rms 1..2 s');
for (const [th, gs] of [[0, 0], [5, 0], [5, 127], [127, 127]]) {
  const r = render(vocP({hold, th, gs}, {}), [[0, 'on', 57, .8]], {sec: 2});
  const peak = r.l.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  console.log(`th ${th} gs ${gs}: rms ${db(rms(r.l, sr, 2 * sr)).toFixed(1)} dBFS, first 50ms ${db(rms(r.l, 0, .05*sr)).toFixed(1)}, peak ${db(peak).toFixed(1)}`);
}
console.log('(2) stored hold, E2 = noise at -80 dBFS (quiet mic), th 10');
for (const th of [0, 10]) {
  const r = render(vocP({hold, th, gs: 20}, {}), [[0, 'on', 57, .8]], {sec: 2, inputs: {e2: noise(2, sr, 1e-4, 3)}});
  console.log(`th ${th}: rms 1..2 s ${db(rms(r.l, sr, 2 * sr)).toFixed(1)} dBFS`);
}
console.log('(3) stored hold, E2 = loud noise -10 dBFS, th 10 (gate open) -> should equal th 0');
for (const th of [0, 10]) {
  const r = render(vocP({hold, th, gs: 20}, {}), [[0, 'on', 57, .8]], {sec: 2, inputs: {e2: noise(2, sr, .5, 3)}});
  console.log(`th ${th}: rms 1..2 s ${db(rms(r.l, sr, 2 * sr)).toFixed(1)} dBFS`);
}
