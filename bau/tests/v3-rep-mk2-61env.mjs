// Independent repro: MK2-12 "gespielt" for waves 61-64. Reference = the app's own MKTAB.harm(n, F) (the envelope in Hz evaluated at
// the played note) and, at 220.27 Hz, the raw decoded trace a[k]. Also predicts the played partials from the blend of the two
// neighbouring octave sets (weight linear in semitones, as in the worklet) to confirm the cause.
import {launch, openApp, R, mergeO, OPEN, SR} from './v3-qa-mk2-lib.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const r1 = x => Math.round(x * 10) / 10;
const dB = x => 20 * Math.log10(Math.max(1e-12, x));
// exact DFT magnitude at frequency f over n samples from i0 (integer number of periods -> exact for harmonics)
const dft = (x, i0, n, f) => { let re = 0, im = 0; for (let i = 0; i < n; i++) { const a = 2 * Math.PI * f * (i0 + i) / SR; re += x[i0 + i] * Math.cos(a); im += x[i0 + i] * Math.sin(a); } return 2 * Math.hypot(re, im) / n; };
// fundamental by parabolic search of DFT magnitude around F
function f0(x, i0, n, F) { let best = F, bm = 0; for (let c = -30; c <= 30; c += 0.5) { const f = F * Math.pow(2, c / 1200), m = dft(x, i0, n, f); if (m > bm) { bm = m; best = f; } } return best; }
const ref = await page.evaluate(() => {
  const o = {}; const M = (typeof MKTAB !== "undefined" ? MKTAB : mkLoad().MKTAB);
  for (const n of [61, 62, 63, 64]) {
    const w = M.data()[n]; o[n] = {r: w.r, a: Array.from(w.a).slice(0, 17), sets: {}, at: {}};
    for (let j = 0; j < 8; j++) o[n].sets[j] = {g: M.norm(n, M.OCTF[j]), A: Array.from(M.harm(n, M.OCTF[j]).A).slice(0, 17)};
    for (const F of [155.56, 187.5, 220.27, 311.13]) o[n].at[F] = Array.from(M.harm(n, F).A).slice(0, 17);
  }
  o.OCTF = M.OCTF; return o;
});
const out = [];
for (const n of [61, 62, 63, 64]) for (const F of [130.81, 155.56, 187.5, 220.27, 261.63, 311.13]) {
  const note = 69 + 12 * Math.log2(F / 440);
  const x = (await R(page, mergeO({o1: {w: 5, c1: 0, c2: 2 * n - 2}}, OPEN), [[0, 'on', note, .8]], {sec: .8})).l;
  const P = Math.round(SR / F * 24), i0 = 19200;     // 24 periods from 0.4 s
  const fm = f0(x, i0, P, F);
  const meas = []; for (let k = 1; k <= 16; k++) meas.push(dB(dft(x, i0, P, k * F)));
  // reference A: the app's own envelope in Hz at this note (harm(n, F)), or the decoded trace when F is 220.27
  const H = ref[n].at[F] || null;
  // predicted blend of the two neighbouring octave sets (weight linear in semitones from C1)
  const o = (note - 24) / 12, j = Math.min(6, Math.floor(o)), t = Math.min(1, o - j), S = ref[n].sets;
  const pred = []; for (let k = 1; k <= 16; k++) pred.push(dB((1 - t) * S[j].g * S[j].A[k] + t * S[j + 1].g * S[j + 1].A[k]));
  const cmp = (refL) => { const mx = Math.max(...refL); const d = []; for (let k = 1; k <= 16; k++) if (refL[k - 1] - mx >= -40) d.push([k, meas[k - 1] - refL[k - 1]]);
    const g = d.reduce((s, v) => s + v[1], 0) / d.length; const dv = d.map(([k, v]) => [k, v - g]); return dv.reduce((a, v) => Math.abs(v[1]) > Math.abs(a[1]) ? v : a, [0, 0]); };
  const row = {n, F, f0: Math.round(fm * 100) / 100, cents: r1(1200 * Math.log2(fm / F))};
  if (H) row.vsEnvHz = cmp(H.slice(1).map(dB)).map(r1);
  if (F === 220.27) row.vsTrace = cmp(ref[n].a.slice(1).map(dB)).map(r1);
  row.vsBlendPred = cmp(pred).map(r1);
  out.push(row); console.log(JSON.stringify(row));
}
console.log('errors', errs.length, errs.slice(0, 3));
await b.close();
