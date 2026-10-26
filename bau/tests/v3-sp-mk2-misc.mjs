// FP-DSP MK2: independent re-measurement of MK2-01 (Sinus x), MK2-04 (Endlos), MK2-05 (noise oscillator), MK2-06 (patch pitch)
import {renderW, render, mkPatch} from './v3-mk2-node.mjs';
import {ampAt, powerSpec, db} from './v3-sp-mk2-ana.mjs';
const SR = 48000, OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}, mtof = n => 440 * 2 ** ((n - 69) / 12);
const P = o => mkPatch(Object.assign({}, OPEN, o));
// MK2-01
{ const f1 = mtof(57); let r = render(P({o1: {w: 3, c1: 0}}), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'}); const a1 = ampAt(r.l, 9600, 32768, f1, SR); let e = 0; for (let k = 2; k <= 10; k++) e += ampAt(r.l, 9600, 32768, k * f1, SR) ** 2;
  r = render(P({o1: {w: 3, c1: 64}, o2: {w: 2, semi: 12}, mix: {o1: 127, o2: 0}}), [[0, 'on', 57, .8]], {sec: 1.2, tap: 'mix'});
  const c = ampAt(r.l, 9600, 32768, f1, SR), s1 = ampAt(r.l, 9600, 32768, 3 * f1, SR), s2 = ampAt(r.l, 9600, 32768, f1 * 1, SR);
  console.log('MK2-01 X-MOD 0 THD', db(Math.sqrt(e) / a1).toFixed(1), 'dB; X-MOD 64 tri +12: f1+f2 sideband', db(s1 / c).toFixed(1), 'dB re carrier'); }
// MK2-04: 35 C3/C4 and Fis3/Fis4 partials in Hz (octave partials f/2 * 2^j), chromatic 2 oct level steps
{ const lv = note => { const f = mtof(note), r = renderW(P({o1: {w: 5, c2: 68}}), [[0, 'on', note, .8]], {sec: 1.2, tap: 'mix'}, [35]); const m = new Map(); for (let j = 0; j < 9; j++) { const fr = f / 2 * 2 ** j; if (fr < 15000) m.set(Math.round(fr), db(ampAt(r.l, 9600, 32768, fr, SR))); } return m; };
  const cmp = (a, b) => { const A = lv(a), B = lv(b); let w = 0; for (const [f, x] of A) if (B.has(f) && x > -60) w = Math.max(w, Math.abs(x - B.get(f))); return w; };
  const steps = []; let prev = null; for (let n = 48; n <= 72; n++) { const r = renderW(P({o1: {w: 5, c2: 68}}), [[0, 'on', n, .8]], {sec: .5}, [35]); let e = 0; for (let i = 4800; i < 24000; i++) e += r.l[i] ** 2; const L = 10 * Math.log10(e / 19200); if (prev != null) steps.push(Math.abs(L - prev)); prev = L; }
  console.log('MK2-04 35: C3/C4 max partial diff', cmp(48, 60).toFixed(2), 'dB, Fis3/Fis4', cmp(54, 66).toFixed(2), 'dB; chromatic 2 oct max step', Math.max(...steps).toFixed(2), 'dB'); }
// MK2-05 noise oscillator: resonance peak frequency
{ const peakF = (note, c1, c2) => { const r = render(P({o1: {w: 6, c1, c2}}), [[0, 'on', note, .8]], {sec: 4, tap: 'mix', seed: 5}); const N = 32768, acc = new Float64Array(N / 2); for (let s = 4800; s + N < r.l.length; s += N / 2) { const p = powerSpec(r.l, s, N); for (let k = 0; k < N / 2; k++) acc[k] += p[k]; }
    let bk = 1; for (let k = 2; k < N / 2 - 1; k++) if (acc[k] > acc[bk]) bk = k; // smooth peak: centroid over +-8 bins
    let a = 0, b = 0; for (let k = bk - 8; k <= bk + 8; k++) { a += acc[k] * k; b += acc[k]; } return a / b * SR / N; };
  const out = []; for (const [note, c1] of [[48, 24], [72, 24], [48, 36], [72, 36], [96, 24], [36, 24]]) { const f = peakF(note, c1, 127), want = mtof(note) * 2 ** ((c1 - 24) / 12); out.push(note + '/C1 ' + c1 + ': ' + (1200 * Math.log2(f / want)).toFixed(1) + ' ct'); }
  console.log('MK2-05 RESO 127 peak vs target:', out.join(', ')); }
// MK2-06 pitch patch +63 LFO1 square: +-24 HT
{ const r = render(P({o1: {w: 0}, l1: {w: 1, f: 20}, p: [{s: 2, d: 0, i: 63}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]}), [[0, 'on', 57, .8]], {sec: 6, tap: 'mix'});
  // zero-crossing frequency per 50 ms window
  const fr = []; for (let s = 0; s + 9600 < r.l.length; s += 4800) { let z = 0, f0 = -1, f1 = -1; for (let i = s + 1; i < s + 9600; i++) if (r.l[i - 1] < 0 && r.l[i] >= 0) { const t = i - 1 + r.l[i - 1] / (r.l[i - 1] - r.l[i]); if (f0 < 0) f0 = t; f1 = t; z++; } if (z > 3) fr.push((z - 1) / ((f1 - f0) / SR)); }
  const hi = Math.max(...fr), lo = Math.min(...fr); console.log('MK2-06 pitch patch: max', (1200 * Math.log2(hi / mtof(57))).toFixed(1), 'ct, min', (1200 * Math.log2(lo / mtof(57))).toFixed(1), 'ct'); }
