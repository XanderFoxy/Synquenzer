import * as MK from './marks.mjs';
import * as T from './test-signals.mjs';
const sr = 48000, dur = 20, r = T.rng(12), bpm = 110, spb = 60 / bpm;
const n = dur * sr, x = new Float32Array(n); let ph = 0;
for (let i = 0; i < n; i++) { ph += 2 * Math.PI * 196 / sr; let v = 0; for (let h = 1; h * 196 < 7000; h++) { const fh = h * 196; v += Math.sin(h * ph) * (1 / (1 + ((fh - 800) / 90) ** 2) + 0.6 / (1 + ((fh - 1150) / 100) ** 2) + 0.05) / Math.sqrt(h); } x[i] = 0.15 * v; }
for (let i = 0; i < sr; i++) x[i] = 0; for (let i = 0; i < n; i++) x[i] += 1e-4 * T.gauss(r);
const ons = []; for (let k = 3; k * spb / 2 < dur - 0.6; k++) if (r() < 0.8) ons.push(k * spb / 2 + (r() - 0.5) * 0.08);
for (const t of ons) { const i0 = Math.round(t * sr); for (let k = 0; k < 0.006 * sr; k++) x[i0 + k] += 0.8 * T.gauss(r) * Math.exp(-k / (0.0012 * sr)); }
const M = MK.detectMarks(x, sr, {pitch: false});
for (const t of ons) { let b = null; for (const m of M) if (!b || Math.abs(m.t - t) < Math.abs(b.t - t)) b = m; if (Math.abs(b.t - t) > 0.004) console.log(t.toFixed(4), b.t.toFixed(4), ((b.t - t) * 1000).toFixed(1), b.src); }
console.log(M.length, ons.length);
const {stretch} = await import('./stretch.mjs');
const q = MK.quantizeMarks(ons, {bpm, grid: '1/8', strength: 1}), w = MK.makeWarp(ons, Array.from(q.times), dur);
const y = stretch(x, sr, w).y, M2 = MK.detectMarks(y, sr, {pitch: false});
for (let k = 0; k < ons.length; k++) { const t = q.times[k]; let b = null; for (const m of M2) if (!b || Math.abs(m.t - t) < Math.abs(b.t - t)) b = m; if (Math.abs(b.t - t) > 0.004) console.log('out', k, ons[k].toFixed(4), t.toFixed(4), b.t.toFixed(4), ((b.t - t) * 1000).toFixed(1), b.src); }
const toneR = T.rms(x, 2 * sr, 2 * sr + sr / 10);
let worst = 0, wk = -1;
for (let k = 0; k < ons.length; k++) { if (ons[k] < 1.2) continue; const d0 = Math.round(q.times[k] * sr); for (let s = d0 - Math.round(0.012 * sr); s < d0 - 96; s += 48) { const v = T.rms(y, s, s + 96) / toneR; const dd = -20 * Math.log10(v); if (dd > worst) { worst = dd; wk = k; } } }
console.log('worst dip before anchors dB', worst.toFixed(1), 'at', wk);
const R = stretch(x, sr, w); 
{ const k = wk; const d0 = Math.round(q.times[k] * sr); const sg = R.segs.find(s => s.d1 === d0); console.log('seg', sg, 'ratio', (sg.d1 - sg.d0) / (sg.s1 - sg.s0));
  const prof = []; for (let s = d0 - Math.round(0.03 * sr); s < d0 + 480; s += 96) prof.push((20 * Math.log10(T.rms(R.y, s, s + 96) / toneR)).toFixed(1)); console.log(prof.join(' ')); }
