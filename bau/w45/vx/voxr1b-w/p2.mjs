import {core, wav, RV, SRC, f0at} from './lib.mjs'; import {plops} from './synth.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const {x, T} = plops(v, sr); const Fe = K.done(K.feats(x, sr)), R = Fe.R, ev = K.plopFind(Fe, {});
console.log('T', T.join(' ')); 
for (const t of T) { const j = Math.round(t * sr / Fe.H), hit = ev.find(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05); const s = [];
  for (let q = j - 4; q < j + 14; q += 2) s.push([R.sub[q].toFixed(0), R.lf[q].toFixed(0), R.mid[q].toFixed(0), R.tot[q].toFixed(0)].join('/'));
  console.log(t, 'f0', f0at(t + 0.02).toFixed(0), hit ? 'HIT ' + hit.exDb : 'miss', s.join(' ')); }
