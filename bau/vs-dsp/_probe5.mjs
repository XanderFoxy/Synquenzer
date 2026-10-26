import {detectMarks} from './marks.mjs';
import * as T from './test-signals.mjs';
const sr = 48000, dur = +process.env.DUR || 30;
let hits = 0, tot = 0, fa = 0, sil = 0, nm = 0, errs = [];
for (const seed of [1, 2, 3]) {
  const S = T.song(sr, dur, {seed});
  const nz = T.noise(sr, dur, T.rms(S.x) * Math.pow(10, -(+process.env.SNR || 35) / 20), seed + 9);
  const x = new Float32Array(S.x.length); for (let i = 0; i < x.length; i++) x[i] = S.x[i] + nz[i];
  let t = performance.now();
  const M = detectMarks(x, sr);
  const ms = performance.now() - t;
  const used = new Uint8Array(M.length);
  for (const on of S.onsets) {
    tot++; let best = -1, bd = 0.03;
    M.forEach((m, k) => { const d = Math.abs(m.t - on); if (!used[k] && d <= bd) { bd = d; best = k; } });
    if (best >= 0) { hits++; used[best] = 1; errs.push((M[best].t - on) * 1000); (globalThis.HC ||= []).push(M[best].conf); } else if (process.env.V) console.log('miss', seed, on.toFixed(3), S.notes.find(n => n.t === on));
  }
  fa += used.length - used.reduce((a, b) => a + b, 0);
  for (const m of M) for (const [a, b] of S.silences) if (m.t > a + 0.03 && m.t < b - 0.03) { sil++; if (process.env.V) console.log('sil', m); }
  nm += M.length;
  if (process.env.V) M.forEach((m, k) => { if (!used[k]) console.log('extra', seed, m.t.toFixed(3), m.src, m.conf); });
  console.log('seed', seed, 'marks', M.length, 'onsets', S.onsets.length, 'ms', ms.toFixed(0));
}
errs.sort((a, b) => a - b);
console.log('hit', (hits / tot * 100).toFixed(1) + '%', 'false', fa, 'inSilence', sil, 'err med', errs[errs.length >> 1].toFixed(1), 'p10/p90', errs[Math.floor(errs.length * .1)].toFixed(1), errs[Math.floor(errs.length * .9)].toFixed(1));
const h=globalThis.HC.sort((a,b)=>a-b); console.log("hit conf p0..p10", h.slice(0,10).join(" "));
