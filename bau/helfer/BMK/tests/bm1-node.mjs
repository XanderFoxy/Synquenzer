// BM1 acceptance (Nachtrag 7 Rev. 2, section 6 BM1-01 ... BM1-12, BM1-14) in Node: the processor of bau/helfer/BMK/index.html.
// Run: node bau/helfer/BMK/tests/bm1-node.mjs   (ONLY=regex to pick tests). Writes bm1-node.out.json next to this file.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {db, pdb, rms, fft, mKlick} from '../../../tests/v3-mk1-ana.mjs';
import {amps, span} from '../../../werkzeug/bm-tools/maskrule.mjs';
const HERE = new URL('.', import.meta.url).pathname;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push({id, ok: !!c, info}); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const W = 2 * Math.PI / 32;
const prog = o => ({t: 'prog', ab: 'a', p: o});
// the filter as high pass at CUTF 0 (20 Hz): the BM1 path (oscillators, decimator, DC block) without the LP of INIT
const P1 = (m, extra) => Object.assign({o1: {m, e: {l: 99, a: 0, d: 0, s: 15, r: 0, lp: 0}}, o2: {m: 7, e: {l: 0}}, n: {e: {l: 0}}, f: {md: 'hp', cu: 0}}, extra || {});
// a held note on a given frequency: note 69 with TUNE = f (the processor takes any number; the host clamps 400-470 Hz)
const tone = (f, m, sec, sr, extra) => render([[0, prog(P1(m, extra))], [0, {t: 'gl', p: {tn: f}}], [0, on(0, 69)]], {sec, sr});
// the formula of section 1.2 at the integer phase
const formula = (ph, M) => { const S = span(M), s = ph / 4294967296 * S, p = Math.floor(s), f = s - p, m = p & M; return m < 32 ? Math.sin(W * (m + f)) : 0; };
// DFT at one bin over [i0, i0 + n)
const dft = (x, i0, n, k) => { let re = 0, im = 0; const w = 2 * Math.PI * k / n; for (let i = 0; i < n; i++) { re += x[i0 + i] * Math.cos(w * i); im -= x[i0 + i] * Math.sin(w * i); } return 2 * Math.hypot(re, im) / n; };

T('BM1-01', () => {
  // the 16x signal (tap before the decimator) against the formula, all 512 masks, A4, 4096 16x samples each
  let worst = 0, wm = -1; const sr = 48000, inc = Math.round(440 * 4294967296 / (16 * sr)) >>> 0;
  for (let M = 0; M < 512; M++) {
    const r = render([[0, prog(P1(M))], [0, {t: 'tap', on: true, k: 'osc16', len: 4096}], [0, on(0, 69)], [.01, {t: 'tap', on: false}]], {sec: .012});
    const tp = r.msgs.find(m => m.t === 'tap'); if (!tp || tp.n < 4096) throw new Error('Abgriff fehlt M' + M);
    let ph = 0; for (let i = 0; i < 4096; i++) { ph = (ph + inc) >>> 0; const d = Math.abs(tp.buf[i] - formula(ph, M)); if (d > worst) { worst = d; wm = M; } }
  }
  ok('BM1-01 16-fach-Signal = Formel §1.2, alle 512 Masken, ≤ 2·10⁻⁴', worst <= 2e-4, 'größte Abweichung ' + worst.toExponential(2) + ' (Maske ' + wm + ')');
});

// M-SPEKTRUM at C2: integer period P = 734 samples (65.40 Hz), 64 periods, rectangular, partial k = bin 64 k
const SPEC = (() => { const cache = {}; return M => {
  if (cache[M]) return cache[M];
  const P = 734, f0 = 48000 / P, r = tone(f0, M, 1.4), i0 = 48000 * .35 | 0, n = 64 * P; const a = [];
  for (let k = 0; k <= 40; k++) a.push(k ? dft(r.l, i0, n, 64 * k) : 0);
  return (cache[M] = {a, r, i0, n, P});
}; })();
T('BM1-02', () => {
  const rel = (M, k) => { const s = SPEC(M); return db(s.a[k] / s.a[1]); }, ref = (M, k) => { const a = amps(M, 64); return db(a[k] / a[1]); };
  // 31: THD over all partials to 20 kHz
  { const s = SPEC(31); let h = 0; for (let k = 2; k * 48000 / s.P < 20000; k++) h += dft(s.r.l, s.i0, s.n, 64 * k) ** 2; const thd = pdb(h / s.a[1] ** 2);
    ok('BM1-02 Maske 31 THD ≤ −60 dB', thd <= -60, R(thd) + ' dB'); }
  { let w = 0; const got = []; for (let k = 2; k <= 8; k++) { const d = rel(7, k) - ref(7, k); got.push(R(rel(7, k), 2)); if (Math.abs(d) > Math.abs(w)) w = d; }
    ok('BM1-02 Maske 7 Teiltöne 2–8 ± 0,5 dB zur Referenz', Math.abs(w) <= .5, got.join(' / ') + ' dB, größte Abw. ' + R(w, 2) + ' dB'); }
  { let ev = -999; for (let k = 2; k <= 14; k += 2) ev = Math.max(ev, rel(8, k)); const h3 = rel(8, 3), k16 = rel(8, 16);
    ok('BM1-02 Maske 8 gerade Teiltöne (2–14) ≤ −45 dB, 3. −9,5 ± 0,5 dB', ev <= -45 && Math.abs(h3 + 9.5) <= .5, 'gerade 2–14 max ' + R(ev) + ' dB, 3. ' + R(h3, 2) + ' dB; k16 (Rampen-Rate, laut Regel selbst ' + R(ref(8, 16), 1) + ' dB) ' + R(k16, 1) + ' dB'); }
  { const a = rel(24, 3), b = rel(25, 3); ok('BM1-02 Maske 24/25 3. Teilton −9,7/−10,0 ± 0,5 dB', Math.abs(a + 9.7) <= .5 && Math.abs(b + 10) <= .5, R(a, 2) + ' / ' + R(b, 2) + ' dB'); }
  { const a = rel(30, 15), b = rel(30, 17); ok('BM1-02 Maske 30 k15/k17 −24,1 ± 0,5 dB', Math.abs(a + 24.1) <= .5 && Math.abs(b + 24.1) <= .5, R(a, 2) + ' / ' + R(b, 2) + ' dB'); }
  { const top = M => { const s = SPEC(M); let km = 1; for (let k = 1; k <= 40; k++) if (s.a[k] > s.a[km]) km = k; return km; };
    const g = [63, 95, 255].map(top); ok('BM1-02 Masken 63/95/255 stärkster Teilton 2/4/7', g[0] === 2 && g[1] === 4 && g[2] === 7, g.join(' / ')); }
});
T('BM1-03', () => {
  // centroid on the processor's own 16x signal: exact period 4096 16x samples (inc 2^20), FFT 4096, k = 1 ... 512
  const c = []; for (let M = 0; M < 512; M++) {
    const r = render([[0, prog(P1(M))], [0, {t: 'gl', p: {tn: 48000 * 16 / 4096}}], [0, {t: 'tap', on: true, k: 'osc16', len: 4096}], [0, on(0, 69)], [.01, {t: 'tap', on: false}]], {sec: .012});
    const tp = r.msgs.find(m => m.t === 'tap'), re = Float64Array.from(tp.buf), im = new Float64Array(4096); fft(re, im);
    let n = 0, d = 0; for (let k = 1; k <= 512; k++) { const p = re[k] ** 2 + im[k] ** 2; n += k * p; d += p; } c.push(n / d);
  }
  let okm = 0; const bad = []; for (let k = 1; k <= 32; k++) { const M = 16 * k - 1, l = c[M - 1], r = M + 1 < 512 ? c[M + 1] : Infinity; if (c[M] < l && c[M] < r) okm++; else bad.push(M); }
  let worst = -1; for (let b = 1; b < 32; b++) { const v = c.slice(16 * b, 16 * b + 16), idx = [...v.keys()].sort((x, y) => v[x] - v[y]), rank = []; idx.forEach((i, j) => rank[i] = j); let d2 = 0; for (let i = 0; i < 16; i++) d2 += (rank[i] - i) ** 2; worst = Math.max(worst, 1 - 6 * d2 / (16 * 255)); }
  ok('BM1-03 Schwerpunkt: 32/32 Masken 16k−1 lokale Minima, Rang-Korrelation Blöcke 1–31 ≤ −0,95', okm === 32 && worst <= -.95, okm + '/32' + (bad.length ? ' (Ausnahmen ' + bad + ')' : '') + ', schwächster Block ' + R(worst, 3));
});
T('BM1-04', () => {
  // M-PERIODE: normalized autocorrelation over 1 s; first peak >= 0.9 that is also >= 0.995 x the best peak (sub-periods of
  // pulse masks like 32 reach 0.97, see CHANGES); refined at the peak near 100 periods, parabolic, / 100
  let worst = 0, wm = -1;
  for (let M = 0; M < 512; M++) {
    const r = tone(440, M, 1.3), x = r.l, i0 = 9600, n = 48000; let e0 = 0; for (let i = 0; i < n; i++) e0 += x[i0 + i] ** 2;
    const ac = lag => { let s = 0; for (let i = 0; i < n; i++) s += x[i0 + i] * x[i0 + i + lag]; return s / e0; };
    const A = new Float64Array(240); for (let l = 0; l < 240; l++) A[l] = ac(l);
    let best = 0; for (let l = 20; l < 239; l++) if (A[l] > best) best = A[l];
    let L = -1; for (let l = 20; l < 239; l++) if (A[l] >= .9 && A[l] >= .995 * best && A[l] >= A[l - 1] && A[l] >= A[l + 1]) { L = l; break; }
    if (L < 0) { worst = 99; wm = M; continue; }
    const c = Math.round(L * 100), a = ac(c - 1), b = ac(c), d = ac(c + 1); let cc = c, bb = b;
    for (let s = c - 3; s <= c + 3; s++) { const v = ac(s); if (v > bb) { bb = v; cc = s; } }
    const a2 = ac(cc - 1), c2 = ac(cc + 1), off_ = .5 * (a2 - c2) / (a2 - 2 * bb + c2), per = (cc + off_) / 100, f = 48000 / per, ct = 1200 * Math.log2(f / 440);
    if (Math.abs(ct) > Math.abs(worst)) { worst = ct; wm = M; }
  }
  ok('BM1-04 alle 512 Masken auf A4: Periode 1/440 s ± 0,5 ct', Math.abs(worst) <= .5, 'größte Abw. ' + R(worst, 3) + ' ct (Maske ' + wm + ')');
});
// the ideal 16x reference (ref16.mjs, own tool): naive 16x with float phase, FFT, non-harmonic energy in 0 .. lim re harmonic
function ref16(M, f0, fs, lim) {
  const OS = 16, NO = 16384, N = NO * OS, S = span(M), x = new Float64Array(N), im = new Float64Array(N); let ph = 0; const inc = f0 / (fs * OS);
  for (let i = 0; i < N; i++) { ph += inc; if (ph >= 1) ph -= 1; const s = ph * S, p = Math.floor(s), m = p & M; x[i] = m < 32 ? Math.sin(W * (m + s - p)) : 0; }
  fft(x, im); let h = 0, a = 0; const k0 = Math.round(f0 / (fs / NO)), top = Math.floor(lim / (fs / NO));
  for (let b = 1; b <= top; b++) { const e = x[b] ** 2 + im[b] ** 2; if (b % k0 === 0) h += e; else a += e; }
  return pdb(a / h);
}
function alias(M, f0, fs, lim) {
  const NO = 16384, r = tone(f0, M, (NO + fs * .25) / fs + .05, fs), i0 = Math.round(fs * .25), re = Float64Array.from(r.l.subarray(i0, i0 + NO)), im = new Float64Array(NO); fft(re, im);
  let h = 0, a = 0; const k0 = Math.round(f0 / (fs / NO)), top = Math.floor(lim / (fs / NO));
  for (let b = 1; b <= top; b++) { const e = re[b] ** 2 + im[b] ** 2; if (b % k0 === 0) h += e; else a += e; }
  return pdb(a / h);
}
T('BM1-05', () => {
  const rows = []; let worst = 0;
  for (const fs of [48000, 44100]) for (const [nm, k] of [['C4', 89], ['C6', 357], ['C7', 714]]) {
    const f0 = k * fs / 16384;
    for (const M of [7, 8, 78, 255, 511]) { const a = alias(M, f0, fs, 16000), b = ref16(M, f0, fs, 16000), d = a - b; if (Math.abs(d) > Math.abs(worst)) worst = d; rows.push(fs / 1000 + 'k ' + nm + ' M' + M + ' ' + R(a) + '/' + R(b)); }
  }
  ok('BM1-05 M-ALIAS 0–16 kHz = ideale 16-fach-Referenz ± 2 dB (Masken 7, 8, 78, 255, 511; C4/C6/C7; 48 + 44,1 kHz)', Math.abs(worst) <= 2, 'größte Abw. ' + R(worst, 2) + ' dB; App/Ref: ' + rows.join(', '));
});
T('BM1-06', () => {
  for (const fs of [48000, 44100]) {
    const lev = f => { const r = tone(f, 31, .4, fs), i0 = Math.round(.2 * fs); return amp1(r.l, i0, 8192, f, fs); };
    const a1 = lev(1000); let w = 0; const g = [];
    for (const f of [100, 200, 500, 2000, 5000, 8000, 10000, 12000, 14000, 15000, 16000]) { const d = db(lev(f) / a1); g.push(f + ':' + R(d, 2)); if (Math.abs(d) > Math.abs(w)) w = d; }
    ok('BM1-06 Durchlass ± 0,5 dB bis 16 kHz (' + fs / 1000 + ' kHz)', Math.abs(w) <= .5, 'größte Abw. ' + R(w, 2) + ' dB (' + g.join(' ') + ')');
    // test tones 32 ... 384 kHz (48 kHz; 44.1 kHz: 29.4 ... 352.8 kHz) at 16x: energy in 0 .. 16 kHz re the same tone in the passband
    const top = 8 * fs; let worst = -999, wf = 0; const NO = 8192;
    for (let f = fs * 2 / 3; f <= top; f += 500) {
      const r = tone(f, 31, (NO + 2400) / fs + .02, fs), re = Float64Array.from(r.l.subarray(2400, 2400 + NO)), im = new Float64Array(NO);
      for (let i = 0; i < NO; i++) re[i] *= .5 - .5 * Math.cos(2 * Math.PI * i / NO);
      fft(re, im); let e = 0; const lim = Math.floor(16000 / (fs / NO)); for (let b = 2; b <= lim; b++) e += re[b] ** 2 + im[b] ** 2;
      const lv = pdb(e / (NO * NO / 4 * .375)) - db(a1); if (lv > worst) { worst = lv; wf = f; }
    }
    ok('BM1-06 Prüftöne ' + R(fs * 2 / 3000) + '–' + R(top / 1000) + ' kHz erscheinen in 0–16 kHz ≤ −70 dB (' + fs / 1000 + ' kHz)', fs !== 48000 || worst <= -70, 'schlimmster ' + R(worst) + ' dB bei ' + R(wf / 1000, 1) + ' kHz' + (fs !== 48000 ? ' (nur Messwert; Spec nennt 48 kHz)' : ''));
  }
});
function amp1(x, i0, n, f, sr) { let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / sr; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; } return 2 * Math.hypot(re, im) / ws; }
T('BM1-07', () => {
  // (a) by modulation (mask delta START +24, SPD 40): the 16x signal changes the mask only at the voice's control steps, phase continuous
  const sr = 48000, inc = Math.round(220 * 4294967296 / (16 * sr)) >>> 0;
  const r = render([[0, prog(P1(7, {o1: {m: 7, ds: 24, dv: 30, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}}))], [0, {t: 'gl', p: {tn: 220}}], [0, {t: 'tap', on: true, k: 'osc16', len: 16 * 4800}],
    [0, on(1000 / sr, 69)], [.12, {t: 'tap', on: false}]], {sec: .125});
  const tp = r.msgs.find(m => m.t === 'tap').buf;
  const r2 = render([[0, prog(P1(7, {o1: {m: 7, ds: 24, dv: 30, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}}))], [0, {t: 'gl', p: {tn: 220}}], [0, {t: 'tap', on: true, k: 'ctl'}], [0, on(1000 / sr, 69)], [.12, {t: 'tap', on: false}]], {sec: .125});
  const ct = r2.msgs.find(m => m.t === 'tap').buf, steps = []; for (let i = 0; i + 10 <= ct.length; i += 10) steps.push({f: ct[i], m: ct[i + 5]});
  let worst = 0, changes = 0, offGrid = 0, ph = 0;
  for (let i = 0; i < tp.length; i++) {
    ph = (ph + inc) >>> 0; const fr = 1000 + Math.floor(i / 16); let st = steps[0]; for (const s of steps) if (s.f <= fr) st = s; else break;
    worst = Math.max(worst, Math.abs(tp[i] - formula(ph, st.m)));
  }
  for (let k = 1; k < steps.length; k++) { if (steps[k].m !== steps[k - 1].m) { changes++; if (steps[k].f % 48 !== 0) offGrid++; } }
  ok('BM1-07 Maskenwechsel durch Modulation: nur am Steuerschritt (≤ 1 ms + 1 Sample), phasenstetig', worst <= 2e-4 && changes >= 5 && offGrid === 0,
    changes + ' Wechsel, alle auf dem gemeinsamen 48-Sample-Raster; 16-fach-Signal gegen Formel mit durchlaufender Phase: max ' + worst.toExponential(2));
  // (b) by turning MASK (set o1.m 7 -> 8 -> 78 -> 255 at 0.3/0.5/0.7 s): 10 ms crossfade, M-KLICK <= 6 dB
  const msgs = [[0, prog(P1(7))], [0, on(.05, 76)], [.3, {t: 'set', ab: 'a', k: 'o1.m', v: 8}], [.5, {t: 'set', ab: 'a', k: 'o1.m', v: 78}], [.7, {t: 'set', ab: 'a', k: 'o1.m', v: 255}], [.9, {t: 'set', ab: 'a', k: 'o1.m', v: 31}]];
  const rk = render(msgs, {sec: 1.1}), k = mKlick(rk.l, 48000, [.05]);
  ok('BM1-07 Maskenwechsel durch Drehen an MASK: 10-ms-Blende, M-KLICK ≤ 6 dB', k.worst <= 6, 'schlimmster ' + R(k.worst) + ' dB @ ' + R(k.at, 3) + ' s');
});
T('BM1-08', () => {
  // free voice starts at |y| <= 0.02 (16x signal and output), 20 notes O1 = O2 at odd times -> level per note +- 0.1 dB
  const r = render([[0, prog(P1(7))], [0, {t: 'tap', on: true, k: 'osc16', len: 64}], [0, on(.0123, 60)], [.05, {t: 'tap', on: false}]], {sec: .06});
  const tp = r.msgs.find(m => m.t === 'tap').buf, i0 = Math.round(.0123 * 48000); let o0 = 0; for (let i = i0; i < i0 + 3; i++) o0 = Math.max(o0, Math.abs(r.l[i]));
  ok('BM1-08 Key-Reset: freie Stimme beginnt bei |y| ≤ 0,02', Math.abs(tp[0]) <= .02 && o0 <= .02, '16-fach erster Wert ' + tp[0].toExponential(2) + ', Ausgang erste 3 Samples max ' + o0.toExponential(2));
  const pr = {o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, o2: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, n: {e: {l: 0}}};
  const msgs = [[0, prog(pr)]]; const ts = []; let t = .02; for (let k = 0; k < 20; k++) { msgs.push([0, on(t, 57 + (k % 3), .8, 100 + k)], [0, off(t + .15, 0, 100 + k)]); ts.push(t); t += .6 + (k * 0.000371) % .0011; }
  const rr = render(msgs, {sec: t + .1}), lv = ts.map((t0, k) => { const a = Math.round(t0 * 48000); return db(rms(rr.l, a, a + 4800)); });
  const per = {}; ts.forEach((_, k) => { const n = 57 + (k % 3); (per[n] = per[n] || []).push(lv[k]); });
  let sp = 0; for (const n in per) sp = Math.max(sp, Math.max(...per[n]) - Math.min(...per[n]));
  ok('BM1-08 20 Noten O1 = O2: Pegel je Note ± 0,1 dB gleich', sp <= .2, 'größte Spanne je Tonhöhe ' + R(sp, 4) + ' dB (Pegel ' + Object.keys(per).map(n => n + ': ' + R(per[n][0], 2)).join(', ') + ' dB)');
});
T('BM1-09', () => {
  const noise = (fr, sec) => render([[0, prog({o1: {m: 7, e: {l: 0}}, o2: {e: {l: 0}}, n: {fr, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, f: {md: 'hp', cu: 0}})], [0, on(0, 60)]], {sec});
  // FREQ 99: third-octave bands 100 Hz .. 16 kHz flat +- 1 dB (Welch PSD, 8192, Hann, 50 %)
  const r = noise(99, 12.2), x = r.l, n = 8192, P = new Float64Array(n / 2); let cnt = 0;
  for (let s = 4800; s + n <= x.length; s += n / 2) { const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = x[s + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / n)); fft(re, im); for (let k = 0; k < n / 2; k++) P[k] += re[k] ** 2 + im[k] ** 2; cnt++; }
  const bands = []; for (let b = 20; b <= 42; b++) { const fc = Math.pow(10, b / 10), lo = fc / Math.pow(2, 1 / 6), hi = fc * Math.pow(2, 1 / 6); let e = 0, m = 0; for (let k = Math.ceil(lo / (48000 / n)); k <= Math.floor(hi / (48000 / n)); k++) { e += P[k]; m++; } bands.push([fc, pdb(e / m)]); }
  const mean = bands.reduce((a, b) => a + b[1], 0) / bands.length; let w = 0; for (const [, v] of bands) if (Math.abs(v - mean) > Math.abs(w)) w = v - mean;
  ok('BM1-09 Rauschen FREQ 99 flach ± 1 dB (Terzen 100 Hz – 16 kHz)', Math.abs(w) <= 1, 'größte Abw. ' + R(w, 2) + ' dB (' + bands.length + ' Terzen)');
  // FREQ 50: hold rate = the first null of the sample-and-hold spectrum (Welch PSD, smoothed), +- 2 %
  const want = 30 * Math.pow(16 * 48000 / 30, 50 / 99), r2 = noise(50, 6.2), y = r2.l, Q = new Float64Array(n / 2);
  for (let s = 4800; s + n <= y.length; s += n / 2) { const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = y[s + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / n)); fft(re, im); for (let k = 0; k < n / 2; k++) Q[k] += re[k] ** 2 + im[k] ** 2; }
  const bin = 48000 / n; let kb = -1, vb = Infinity; for (let k = Math.round(want * .8 / bin); k <= Math.round(want * 1.2 / bin); k++) { let s = 0; for (let j = -2; j <= 2; j++) s += Q[k + j]; if (s < vb) { vb = s; kb = k; } }
  const got = kb * bin; ok('BM1-09 Rauschen FREQ 50: Halte-Rate ± 2 %', Math.abs(got / want - 1) <= .02, R(got) + ' Hz gegen ' + R(want) + ' Hz (' + R((got / want - 1) * 100, 2) + ' %)');
});
T('BM1-10', () => {
  for (const sr of [48000, 44100]) {
    const N = Math.round(sr / 1000), t0 = 777 / sr, toff = t0 + .0507;
    const r = render([[0, prog({o1: {m: 7, e: {l: 99, a: 6, d: 7, s: 9, r: 5}}, o2: {e: {l: 99, a: 0, d: 0, s: 8, r: 0}}, n: {e: {l: 50, a: 3, d: 0, s: 15, r: 3, lp: 0}}})],
      [0, {t: 'tap', on: true, k: 'ctl'}], [0, on(t0, 60)], [0, off(toff, 60)], [.2, {t: 'tap', on: false}]], {sec: .21, sr});
    const b = r.msgs.find(m => m.t === 'tap').buf, st = []; for (let i = 0; i + 10 <= b.length; i += 10) st.push(Array.from(b.subarray(i, i + 10)));
    const f0 = Math.round(t0 * sr); let grid = 0, q = 0; for (let k = 0; k < st.length; k++) { if (k === 0 ? st[0][0] !== f0 : st[k][0] % N !== 0) grid++; for (let j = 1; j <= 4; j++) if (Math.abs(st[k][j] * 1024 - Math.round(st[k][j] * 1024)) > 1e-6) q++; }
    // osc2: A = 0 -> 1 at the first step, D = 0 -> S at the next, R = 0 -> 0 at the first step after the note off
    const S = (8 / 15) ** 2, kOff = st.findIndex(s => s[0] >= Math.round(toff * sr));
    const jump = st[0][2] === 1 && Math.abs(st[1][2] - Math.round(S * 1024) / 1024) < 1e-9 && st[kOff][2] === 0 && st[kOff - 1][2] > 0;
    ok('BM1-10 Steuertakt ' + sr / 1000 + ' kHz: Stufen alle ' + N + ' Samples, ADSR auf 1/1024, A/D/R = 0 → Sprung im nächsten Schritt', grid === 0 && q === 0 && jump,
      st.length + ' Schritte (erster beim Tastendruck, dann das gemeinsame Raster), ' + grid + ' daneben, ' + q + ' Werte nicht auf 1/1024; OSC2 ' + st[0][2] + ' → ' + R(st[1][2], 4) + ' … ' + R(st[kOff - 1][2], 4) + ' → ' + st[kOff][2] + ' (Schritt nach dem Loslassen bei +' + (st[kOff][0] - Math.round(toff * sr)) + ' Samples)');
  }
});
T('BM1-11', () => {
  // DC block: -3 dB point by a sweep of very low mask-31 tones re 200 Hz
  const lev = f => { const r = tone(f, 31, 4.2, 48000, {f: {md: 'lp', cu: 99}}), n = Math.round(48000 / f * Math.floor(2 * f)); return rms(r.l, 2 * 48000, 2 * 48000 + n); };
  const ref = lev(200); let lo = 3, hi = 20; for (let it = 0; it < 22; it++) { const m = Math.sqrt(lo * hi); if (db(lev(m) / ref) < -3.0103) lo = m; else hi = m; }
  const fc = Math.sqrt(lo * hi); ok('BM1-11 DC-Sperre 8 Hz ± 10 %', Math.abs(fc / 8 - 1) <= .1, R(fc, 2) + ' Hz');
  const r = render([[0, prog(P1(15))], [0, on(0, 48)]], {sec: .6}), P = 48000 / (440 * Math.pow(2, (48 - 69) / 12)), n = Math.round(P * Math.floor(.2 * 48000 / P)); let s = 0; for (let i = 9600; i < 9600 + n; i++) s += r.l[i];
  let rawDc = amps(15, 2)[0];
  ok('BM1-11 Maske 15 gehalten → Gleichanteil ≤ 0,005 nach 200 ms', Math.abs(s / n) <= .005, 'Gleichanteil ' + (s / n).toExponential(2) + ' (ohne Sperre wären es ' + R(rawDc * .5 * (80 / 99) ** 2 * .88, 3) + ')');
});
T('BM1-12', () => {
  for (const sr of [48000, 44100]) {
    const msgs = [[0, {t: 'reset'}], [0, {t: 'tr', run: true, at: 0}], [0, prog({o1: {m: 78, e: {l: 99, a: 3, d: 8, s: 10, r: 6}}, o2: {m: 255, st: 7, ds: -40, dv: 15, e: {l: 70, a: 0, d: 9, s: 0, r: 4, lp: 1}}, n: {fr: 60, e: {l: 40, a: 2, d: 6, s: 4, r: 5}}})]];
    for (let k = 0; k < 12; k++) msgs.push([0, on(.01 + k * .0731, 48 + 3 * k, .5 + .04 * k, k + 1)], [0, off(.3 + k * .05, 0, k + 1)]);
    const a0 = render(msgs, {sec: 1.2, sr});
    msgs.push([.4, {t: 'set', ab: 'a', k: 'o1.m', v: 300}]);
    const a = render(msgs, {sec: 1.2, sr}), b = render(msgs, {sec: 1.2, sr});
    // a third run: the same processor, the song again after {t:'reset'} and ▶ at 1.2 s (other block phase at 44.1 kHz); the 1 ms grid starts with ▶
    let d = 0, d2 = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
    const sh = Math.round(1.2 * sr), c = render(msgs.concat(msgs.filter(([, m]) => m.t !== 'set').map(([t, m]) => [1.2, JSON.parse(JSON.stringify(m.t === 'reset' ? m : m).replace(/"at":([0-9.e-]+)/g, (q, x) => '"at":' + (+x + 1.2)))])).concat([[1.2, {t: 'tr', run: false}]]).sort((x, y) => x[0] - y[0] || (y[1].t === 'tr' && !y[1].run ? 1 : 0) - (x[1].t === 'tr' && !x[1].run ? 1 : 0)), {sec: 2.4, sr});
    for (let i = 0; i < a0.l.length && i + sh < c.l.length; i++) d2 = Math.max(d2, Math.abs(a0.l[i] - c.l[i + sh]));
    ok('BM1-12 bitgleich: zwei Offline-Render (' + sr / 1000 + ' kHz) M-NULL = −∞; nach reset im selben Prozessor ebenso', d === 0 && d2 === 0 && rms(a.l) > 1e-3, 'Differenz ' + d + ' / nach reset ' + d2 + ' (Pegel ' + R(db(rms(a.l)), 1) + ' dBFS)');
  }
});
T('BM1-14', () => {
  const html = fs.readFileSync(HERE + '../index.html', 'utf8'), a = html.indexOf('<script type="text/plain" id="sq-bm-src">'), b = html.indexOf('</script>', a), blk = html.slice(a, b);
  const wk = blk.slice(blk.indexOf('const BM_WK = `') + 15, blk.indexOf('`;'));
  const nonAscii = /[^\x00-\x7f]/.test(wk), hits = blk.match(/kodamo|mask ?1(?![0-9])|essence/gi) || [];
  ok('BM1-14 ASCII; grep kodamo|mask ?1(?![0-9])|essence = 0', !nonAscii && hits.length === 0, 'BM_WK ' + wk.length + ' Zeichen ASCII: ' + !nonAscii + ', Treffer im Block: ' + hits.length);
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
fs.writeFileSync(HERE + 'bm1-node.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
