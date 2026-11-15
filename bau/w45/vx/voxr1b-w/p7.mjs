import {core, wav, RV, SRC} from './lib.mjs'; import {plops} from './synth.mjs'; import {plopMeas} from './meas.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const {x, P, T} = plops(v, sr);
const cfgs = JSON.parse(process.argv[3] || '[{}]');
for (const c of cfgs) { const r = K.done(K.run(x, sr, {steps: {plop: c}})); const m = plopMeas(v, x, r.y, P, T, sr);
  const ev = r.info.plop.filter(e => T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05));
  console.log(JSON.stringify(c), 'red', m.red.join(' '), '| harm', m.harm.join(' '), '| min red', Math.min(...m.red), 'max|harm|', Math.max(...m.harm.map(Math.abs)), 'spans', ev.map(e => ((e.t0 - T.find(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)) * 1000).toFixed(0) + '/' + ((e.t1 - e.t0) * 1000).toFixed(0)).join(' ')); }
