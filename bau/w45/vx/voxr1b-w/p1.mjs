import {core, wav, RV, SRC, f0at} from './lib.mjs';
const K = core(process.argv[2]);
const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const Fe = K.done(K.feats(v, sr)); const ev = K.plopFind(Fe, {});
console.log('n', ev.length, 'sr', sr, 'H', Fe.H);
for (const e of ev) { const j = Math.round(e.s0 / Fe.H); const R = Fe.R; const s = [];
  for (let q = j - 6; q < j + 16; q += 2) s.push([R.sub[q].toFixed(0), R.lf[q].toFixed(0), R.mid[q].toFixed(0), R.tot[q].toFixed(0)].join('/'));
  console.log(e.t0.toFixed(3), (e.t1 - e.t0).toFixed(3), e.exDb, 'f0', f0at(e.t0).toFixed(0), f0at(e.t0 - 0.05).toFixed(0), f0at(e.t1 + 0.05).toFixed(0), s.join(' ')); }
