import {launch, openApp, R, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, rms, centroid} from './v3-mk1-ana.mjs';
const b = await launch(); const {page} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
for (const n of [61, 63]) {
  const ev = []; for (let k = 0; k <= 24; k++) { ev.push([k * .4, 'on', 48 + k, .8]); ev.push([k * .4 + .35, 'off', 48 + k]); }
  const x = (await R(page, mergeO({o1: {w: 5, c2: 2 * n - 2}}, OPEN), ev, {sec: 10.2})).l;
  const L = [], C = []; for (let k = 0; k <= 24; k++) { const a = Math.round((k * .4 + .02) * SR), e = Math.round((k * .4 + .32) * SR); L.push(db(rms(x, a, e))); C.push(centroid(x, a, 8192, SR)); }
  let j = 0; for (let k = 1; k < L.length; k++) j = Math.max(j, Math.abs(L[k] - L[k - 1]));
  console.log('wave', n, 'chromatic C3..C5 level max step', j.toFixed(2), 'dB; levels', L.map(v => v.toFixed(1)).join(' '), '\n  M-SP', C.map(v => v.toFixed(0)).join(' '));
}
await b.close();
