import {core, wav, RV, SRC} from './lib.mjs'; import {plops} from './synth.mjs'; import {plopMeas} from './meas.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const {x, P, T} = plops(v, sr); const r = K.done(K.run(x, sr, {steps: {plop: {}}}));
const m = plopMeas(v, x, r.y, P, T, sr); console.log(JSON.stringify(m)); console.log(JSON.stringify(r.info.plop.filter(e => T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05))));
