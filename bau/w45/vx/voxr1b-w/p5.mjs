import {core, wav, RV, SRC, f0at} from './lib.mjs'; import {plops} from './synth.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const {x, T} = plops(v, sr); const Fx = K.done(K.feats(x, sr)), Fv = K.done(K.feats(v, sr));
const W = [1, 2].map(k => { const w = wav(RV + SRC[k]); return K.done(K.feats(w.x, w.sr)); });
for (const rise of [0, 3, 6, 9, 12]) { const o = {rise}, e = K.plopFind(Fx, o), ev = K.plopFind(Fv, o);
  const hit = T.filter(t => e.some(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, own = e.filter(q => !T.some(t => q.t1 >= t - 0.01 && q.t0 <= t + 0.05));
  console.log('rise', rise, 'hit', hit, 'extra', own.length, 'sauberA', ev.length, ev.map(q => q.t0.toFixed(2) + ':' + q.exDb).join(' '), 'B', K.plopFind(W[0], o).length, 'C', K.plopFind(W[1], o).length); }
