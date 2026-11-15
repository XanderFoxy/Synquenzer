import fs from 'fs'; import {core, wav, RV, SRC, f0at} from './lib.mjs'; import {plops} from './synth.mjs';
const html = fs.readFileSync(process.argv[2], 'utf8'); const K = core(process.argv[2]);
const src = html.slice(html.indexOf('function plopSin('), html.indexOf('function* plop(y, sr, ev, o) {'));
const lpz = html.slice(html.indexOf('function lpZero('), html.indexOf('function arCoef('));
const bq = html.slice(html.indexOf('function bqC('), html.indexOf('function bqRun('));
const plopSin = new Function('TAU', src.replace('const W = Math.max', 'const DBG = globalThis.DBG; const W = Math.max').replace('const nh = Math.max', 'if (DBG) DBG.push({L: Ls && {f: Ls.f, H: Ls.H.map(q => q.R.toExponential(2))}, R: Rs && {f: Rs.f, H: Rs.H.map(q => q.R.toExponential(2))}}); const nh = Math.max') + '\nreturn plopSin;')(2 * Math.PI);
const A = wav(RV + SRC[0]), sr = A.sr, v = A.x; const {x, P, T} = plops(v, sr);
const r = K.done(K.run(x, sr, {steps: {plop: {fix: 1}}}));
globalThis.DBG = [];
const lowF = new Function('TAU', bq + lpz + '\nreturn lpZero;')(2 * Math.PI);
for (const t of [3.85, 10.03, 15.98, 21.94, 0.73]) { const e = r.info.plop.find(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05); const D = 40, mg = 220, C = 13230, s0 = Math.round(e.t0 * sr), s1 = Math.round(e.t1 * sr), a = s0 - mg - C, b = s1 + mg + C;
  const low = lowF(x, a, b, sr, 250), L = Math.floor((b - a) / D), z = new Float64Array(L); for (let j = 0; j < L; j++) z[j] = low[j * D];
  const lowv = lowF(v, a, b, sr, 250), zv = new Float64Array(L); for (let j = 0; j < L; j++) zv[j] = lowv[j * D];
  const g0 = Math.floor((s0 - mg - a) / D), g1 = Math.ceil((s1 + mg - a) / D) + 1; DBG.length = 0; const zu = plopSin(z, g0, g1, sr / D, 250);
  const rmsU = Math.sqrt(zu.reduce((s, q) => s + q * q, 0) / zu.length), rmsV = Math.sqrt(zv.subarray(g0, g1).reduce((s, q) => s + q * q, 0) / (g1 - g0));
  console.log(t, 'f0 ann', f0at(t - 0.03).toFixed(0), f0at(t + 0.02).toFixed(0), f0at(t + 0.07).toFixed(0), 'gap', g1 - g0, JSON.stringify(DBG[0]), 'rms fill/true', (20 * Math.log10(rmsU / rmsV)).toFixed(1)); }
