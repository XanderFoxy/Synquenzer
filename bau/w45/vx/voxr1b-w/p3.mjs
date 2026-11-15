import {core, wav, RV, SRC, f0at} from './lib.mjs'; import {plops} from './synth.mjs';
const K = core(process.argv[2]); const A = wav(RV + SRC[0]), sr = A.sr, v = A.x;
const {x, T} = plops(v, sr); const Fe = K.done(K.feats(x, sr)), R = Fe.R, nf = Fe.nf, fps = Fe.sr / Fe.H;
const med = (a, i0, i1) => { i0 = Math.max(0, i0); i1 = Math.min(a.length, i1); if (i1 <= i0) return null; const t = Array.prototype.slice.call(a, i0, i1).sort((p, q) => p - q); return t[t.length >> 1]; };
const pct = (a, q) => { const t = Array.from(a).filter(v => v > -150).sort((p, r) => p - r); return t.length ? t[Math.min(t.length - 1, Math.floor(q * t.length))] : -150; };
const LF = R.sub, r = new Float64Array(nf); for (let j = 0; j < nf; j++) r[j] = LF[j] - R.mid[j];
const flo = pct(LF, 0.1), top = pct(R.tot, 0.99), B0 = Math.round(0.25 * fps), B1 = Math.round(0.03 * fps), A0 = Math.round(0.1 * fps), A1 = Math.round(0.3 * fps);
console.log('flo', flo, 'top', top);
for (const t of T) { const jc = Math.round(t * sr / Fe.H); const row = [];
  for (let j = jc - 2; j < jc + 12; j++) { const rb = med(r, j - B0, j - B1), ra = med(r, j + A0, j + A1), lb = med(LF, j - B0, j - B1), la = med(LF, j + A0, j + A1); const base = Math.max(rb, ra), lbase = Math.max(lb, la);
    const f = (LF[j] < flo + 15 ? 'F' : '') + (LF[j] < top - 20 ? 'T' : '') + (LF[j] < R.tot[j] - 10 ? 'O' : '') + (r[j] - base < 9 ? 'X' : '') + (LF[j] - lbase < 6 ? 'L' : '');
    row.push((f || '+') + ':' + (r[j] - base).toFixed(0)); }
  console.log(t, row.join(' ')); }
