// QA MK2-05 robust resonance peak of the noise oscillator (many seeds, smoothed spectrum)
import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {spectrum} from './v3-mk1-ana.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
for (const [note, c1] of [[48, 24], [72, 24], [48, 36], [72, 36], [60, 24], [84, 24]]) {
  const n = 32768, P = new Float64Array(n / 2); let cnt = 0;
  for (let seed = 1; seed <= 24; seed++) { const r = await R(page, mergeO({o1: {w: 6, c1, c2: 127}}, OPEN), [[0, 'on', note, .8]], {sec: 4, seed});
    for (let s = 19200; s + n <= r.l.length; s += n / 2) { const p = spectrum(r.l, s, n, 'hann'); for (let k = 0; k < n / 2; k++) P[k] += p[k]; cnt++; } }
  const want = mtof(note) * 2 ** ((c1 - 24) / 12), bin = SR / n;
  // power-weighted centroid within +-0.5 * bandwidth (Q 25 -> f/25) around the max of a smoothed spectrum
  const sm = new Float64Array(n / 2); const h = 3; for (let k = h; k < n / 2 - h; k++) { let e = 0; for (let j = -h; j <= h; j++) e += P[k + j]; sm[k] = e; }
  let km = 10; for (let k = 10; k < n / 2 - h; k++) if (sm[k] > sm[km]) km = k;
  const bw = want / 25, lo = Math.round((km * bin - bw / 2) / bin), hi = Math.round((km * bin + bw / 2) / bin); let a = 0, w = 0; for (let k = lo; k <= hi; k++) { a += P[k] * k * bin; w += P[k]; }
  console.log('note', note, 'C1', c1, 'want', M(want), 'smoothed max', M(km * bin), 'ct', M(1200 * Math.log2(km * bin / want), 1), '| centroid', M(a / w), 'ct', M(1200 * Math.log2(a / w / want), 1), 'frames', cnt);
}
console.log('errors', errs.length);
await b.close();
