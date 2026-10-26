// Independent repro: Stimmwelle (OSC1 wave 4) FORM (c1) / WFM (c2 + LFO1) effect vs. pitch, via the app's own mkRender.
import {launch, openApp, R, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
// own Hann-2048 spectral centroid, averaged over frames in [s0, s1)
function cent(x, s0, s1, N = 2048) {
  const w = new Float64Array(N); for (let i = 0; i < N; i++) w[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1));
  let num = 0, den = 0;
  for (let s = s0; s + N <= s1; s += N) {
    for (let k = 1; k < N / 2; k++) { let re = 0, im = 0; const om = 2 * Math.PI * k / N;
      for (let i = 0; i < N; i++) { const v = x[s + i] * w[i]; re += v * Math.cos(om * i); im -= v * Math.sin(om * i); }
      const p = Math.sqrt(re * re + im * im); num += p * k * SR / N; den += p; }
  }
  return num / den;
}
const r2 = x => Math.round(x * 100) / 100;
const snd = (c1, c2, extra) => mergeO({o1: {w: 4, c1, c2: c2 || 0}}, OPEN, extra || {});
console.log('--- FORM 0 vs FORM 127, max |d| over 0.5 s, and M-SP (Hann 2048) at c1 0/32/64/95/127');
for (const note of [36, 48, 60, 72, 76, 79, 80, 84, 96]) {
  const f0 = 440 * 2 ** ((note - 69) / 12);
  const a = (await R(page, snd(0), [[0, 'on', note, .8]], {sec: .5})).l, c = (await R(page, snd(127), [[0, 'on', note, .8]], {sec: .5})).l;
  let d = 0, pk = 0; for (let i = 0; i < a.length; i++) { d = Math.max(d, Math.abs(a[i] - c[i])); pk = Math.max(pk, Math.abs(a[i])); }
  const cs = [];
  for (const c1 of [0, 32, 64, 95, 127]) { const x = (await R(page, snd(c1), [[0, 'on', note, .8]], {sec: .5})).l; cs.push(cent(x, 4800, 4800 + 4 * 2048)); }
  console.log('note', note, 'f0', r2(f0), 'peak', r2(pk), 'max|d|', d.toExponential(2), 'M-SP', cs.map(x => Math.round(x)).join(' '), 'FORM effect', r2(Math.log2(cs[0] / cs[4])), 'oct');
}
console.log('--- WFM: c1 0, c2 127, LFO1 triangle f 60, M-SP swing over 2 s (frames of 2048 hop 2400)');
for (const note of [48, 60, 72, 84, 96]) {
  const x = (await R(page, snd(0, 127, {l1: {w: 2, f: 60}}), [[0, 'on', note, .8]], {sec: 2})).l;
  const cs = []; for (let s = 4800; s + 2048 <= x.length; s += 2400) cs.push(cent(x, s, s + 2048));
  const y = (await R(page, snd(0, 0, {l1: {w: 2, f: 60}}), [[0, 'on', note, .8]], {sec: 2})).l;
  let d = 0; for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i]));
  console.log('note', note, 'WFM swing', r2(Math.log2(Math.max(...cs) / Math.min(...cs))), 'oct; c2 127 vs c2 0 max|d|', d.toExponential(2));
}
console.log('--- reference: saw (w 0) FORM 0 vs 127 at note 84/96 (does FORM work on other waves in this register?)');
for (const note of [84, 96]) {
  const a = (await R(page, mergeO({o1: {w: 0, c1: 0}}, OPEN), [[0, 'on', note, .8]], {sec: .5})).l, c = (await R(page, mergeO({o1: {w: 0, c1: 127}}, OPEN), [[0, 'on', note, .8]], {sec: .5})).l;
  console.log('saw note', note, 'M-SP c1 0', Math.round(cent(a, 4800, 4800 + 8192)), 'c1 127', Math.round(cent(c, 4800, 4800 + 8192)));
}
console.log('errors', errs.length, errs.slice(0, 3).join(' | '));
await b.close();
