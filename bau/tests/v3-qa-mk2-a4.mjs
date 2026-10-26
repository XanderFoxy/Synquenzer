// QA MK2-12 "gespielt": mkRender at 187.5 Hz (and other pitches for 61-64), partials 1..16 vs the decoded source / the envelope in Hz
import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const D = await page.evaluate(() => { const M = mkLoad().MKTAB, D = M.data(); const o = []; for (let n = 1; n <= 64; n++) o.push({r: D[n].r, K: D[n].K, a: Array.from(D[n].a)}); return o; });
const dft = (x, i0, n, f) => { let re = 0, im = 0; for (let i = 0; i < n; i++) { const a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * Math.cos(a); im += x[i0 + i] * Math.sin(a); } return 2 * Math.hypot(re, im) / n; };
// envelope in Hz of 61-64 (my own reading of MK2 Umfang 3): support points = traced partial k at k * 220.27 Hz, linear in dB over log f,
// under partial 1 -12 dB/oct
function envDb(w, f) { const h = f / 220.27, Ld = k => w.a[k] > 0 ? 20 * Math.log10(w.a[k]) : -100;
  if (h <= 1) return Ld(1) - 12 * Math.log2(1 / h); const m = Math.min(w.K - 1, Math.floor(h)), t = Math.log(h / m) / Math.log((m + 1) / m); return Ld(m) + (Ld(m + 1) - Ld(m)) * t; }
async function play(n, F) {
  const note = 69 + 12 * Math.log2(F / 440), w = D[n - 1], ft = F / w.r, P = Math.round(SR / ft * 8) ;
  const x = (await R(page, mergeO({o1: {w: 5, c1: 0, c2: 2 * n - 2}}, OPEN), [[0, 'on', note, .8]], {sec: .6})).l;
  const i0 = 14400, d = [];
  // reference levels
  const ref = []; for (let k = 1; k <= 16; k++) ref.push(n >= 61 ? envDb(w, k * ft) : (w.a[k] > 0 ? 20 * Math.log10(w.a[k]) : -200));
  const mx = Math.max(...ref);
  for (let k = 1; k <= 16; k++) { const L0 = ref[k - 1] - mx; if (L0 < -40) continue; d.push([k, 20 * Math.log10(dft(x, i0, P, k * ft) + 1e-12) - L0]); }
  // one gain: least squares in dB = mean
  const g = d.reduce((s, x) => s + x[1], 0) / d.length; const dev = d.map(([k, v]) => [k, v - g]);
  const wst = dev.reduce((a, x) => Math.abs(x[1]) > Math.abs(a[1]) ? x : a, [0, 0]);
  return {n, F, worst: wst, cnt: d.length, dev};
}
const res = []; for (let n = 1; n <= 64; n++) if (n !== 35) res.push(await play(n, 187.5));
const bad = res.filter(r => Math.abs(r.worst[1]) > 1);
console.log('MK2-12 played 187.5 Hz: waves with a partial > 1 dB off (mean-gain):', bad.map(r => r.n + ' (k' + r.worst[0] + ' ' + M(r.worst[1], 1) + ' dB)').join(', ') || 'none');
console.log('largest single waves:', res.filter(r => r.n < 61).sort((a, b) => Math.abs(b.worst[1]) - Math.abs(a.worst[1])).slice(0, 4).map(r => r.n + ':' + M(r.worst[1])).join(' '));
for (const n of [61, 62, 63, 64]) for (const F of [130.81, 155.56, 187.5, 220.27, 261.63, 311.13, 440]) { const r = await play(n, F); console.log('wave', n, 'F', F, 'worst k', r.worst[0], M(r.worst[1], 1), 'dB', 'devs', r.dev.map(x => x[0] + ':' + M(x[1], 1)).join(' ')); }
console.log('errors', errs.length);
await b.close();
