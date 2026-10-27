// VS5a-fix2: N7V-27 bit identity on the recorded beatbox take (dump), as the QA measures it (from its 10 % onset, its own rounding)
import fs from 'fs';
import {onsets20, QOUT} from './v3-qa-vs5a-h2.mjs';
const M = await import(process.argv[3] || '../vs-dsp/marks.mjs');
const D = JSON.parse(fs.readFileSync(process.argv[2] || QOUT + '/fix-a-dump.json')), sr = D.sr, raw = Float32Array.from(D.raw);
const mk = M.detectMarks(raw, sr), times = mk.map(m => m.t), t0 = D.W.t0;
const q = M.quantizeMarks(times, {bpm: 120, t0, grid: '1/16', strength: 1});
const r6 = v => +(+v).toFixed(6), w = M.makeWarp(times, Array.from(q.times, r6), raw.length / sr), src = Array.from(w.src, r6), dst = Array.from(w.dst, r6);
const LEAD = Math.round(+(process.argv[4] || 0) * sr) / sr; const y = M.renderSlices(raw, sr, src.slice(1, -1).map(v => v - LEAD), dst.slice(1, -1).map(v => v - LEAD));
const on = onsets20(raw, sr); let bit = 0, nb = 0; const bad = [];
for (const o of on) {
  let b = 1; for (let k = 1; k < src.length - 1; k++) if (Math.abs(src[k] - o) < Math.abs(src[b] - o)) b = k;
  if (Math.abs(src[b] - o) > 0.03) continue;
  const sh = dst[b] - src[b], O = Math.round(o * sr), Dd = O + Math.round(sh * sr); nb++;
  let first = -1; for (let j = 0; j < Math.round(0.02 * sr); j++) if (y[Dd + j] !== raw[O + j]) { first = j; break; }
  const Dc = Math.round(dst[b] * sr) - Math.round(src[b] * sr) + O; let first2 = -1; for (let j = 0; j < Math.round(0.02 * sr); j++) if (y[Dc + j] !== raw[O + j]) { first2 = j; break; }
  if (first < 0) bit++; else bad.push(`on ${o.toFixed(4)} mark ${src[b].toFixed(5)} (on−mark ${((o - src[b]) * 1000).toFixed(2)} ms) first diff +${first} smp; core rounding: ${first2}; shift QA ${Math.round(sh * sr)} core ${Math.round(dst[b] * sr) - Math.round(src[b] * sr)}`);
}
console.log('bit-identical 20 ms from the QA onset:', bit + '/' + nb); for (const s of bad) console.log('  ', s);
