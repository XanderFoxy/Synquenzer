import {launch, openApp, R, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, rms, amp} from './v3-mk1-ana.mjs';
const b = await launch(); const {page} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
for (const note of [60, 66, 72, 78, 84, 96]) {
  const a = (await R(page, mergeO({o1: {w: 4, c1: 0}}, OPEN), [[0, 'on', note, .8]], {sec: .5})).l, c = (await R(page, mergeO({o1: {w: 4, c1: 127}}, OPEN), [[0, 'on', note, .8]], {sec: .5})).l;
  let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - c[i]));
  const f0 = 440 * 2 ** ((note - 69) / 12), h = x => [1, 2, 3, 4].map(k => db(amp(x, 4800, 16384, k * f0, SR)).toFixed(1)).join('/');
  console.log('note', note, 'FORM 0 vs 127: max |d|', d.toExponential(2), '| harmonics 1-4 dB FORM 0:', h(a), 'FORM 127:', h(c));
}
await b.close();
