/* SYNQUENZER drum model engine worklet (Nachtrag 6, package ND1): processor 'synq-md'.
   One node per drum track, 0 inputs, 1 stereo output -> drum track bus. Up to 12 channels (pads with source md),
   each channel = TONE (34 models) + NOISE (7 filters) + CLICK (12 tables) -> DIST -> EQ -> ECHO -> dry/pan/level,
   plus a shared hall (send after the echo, with the channel level). ASCII only (loaded through a Blob or data: URL).
   Globals used: sampleRate, currentFrame (AudioWorkletGlobalScope).
   Protocol main -> worklet (port.postMessage):
     {t:'ch', ch, p}            full channel program (flat m* values), structural values apply from the next hit
     {t:'kit', p}               kit effects {rvT, rvC, dlR, dlM, dlB, dlF}
     {t:'hit', list:[{ch, at, v, acc, tune, dec}]}   at = context time (s); v 0..1; acc = accent amount 0..1 (accentAmt);
                                tune = semitones (TUNE lock); dec = factor (DECAY lock)
     {t:'mute', ch, solo}       SOLO PART: solo 'tone'|'noise'|'click'|'all' on channel ch, other channels silent; solo null = off
     {t:'stop', at, tau}        voices fade with tau from at (tails keep ringing); queued hits at or after at are dropped
     {t:'panic'}                everything incl. echo and hall tails silent within 10 ms
     {t:'reset'}                voices off, noise sequences, echoes, hall and smoothers to their start (offline render, tests)
     {t:'lim', s}               CPU limiter stage 0..3 (modal models: s>=1 24 modes, s>=2 12 modes and no early reflections)
     {t:'test', tap, q}         test API: tap 0 normal, 1 = C2/C3 before their filters, 2 = hall input after COLOR;
                                q 'modes' -> {t:'test', modes:[per channel modes of the sounding voice]}
   Worklet -> main: {t:'load', v, nv} once per second (fraction of real time), {t:'late', n} count of late hits.
   Determinism: no Math.random; noise = xorshift32 per channel from a fixed seed; reset restarts everything. */
'use strict';
const SR = sampleRate, ISR = 1 / SR, CR = 16, NCH = 12, NV = 2, MAXM = 48, LN1K = 6.907755278982137;
const PI = Math.PI, TAU = 2 * Math.PI;
const NYQ = 0.45 * SR;
/* ---------- tables (built once when the module loads) ---------- */
const SN = 4096, SINT = new Float64Array(SN + 2);
for (let i = 0; i < SN + 2; i++) SINT[i] = Math.sin(TAU * i / SN);
function sinc(ph) { ph -= Math.floor(ph); const x = ph * SN, i = x | 0, f = x - i; return SINT[i] + (SINT[i + 1] - SINT[i]) * f; }   // ph in cycles
function cosc(ph) { return sinc(ph + 0.25); }
const TN = 4096, TANT = new Float64Array(TN + 2);          // tan(pi * f / SR) over f / SR in [0, 0.5)
for (let i = 0; i < TN + 2; i++) TANT[i] = Math.tan(PI * Math.min(i, TN - 1) / (2 * TN));
function tanf(f) { let x = f * ISR; if (x > 0.45) x = 0.45; if (x < 0) x = 0; x *= 2 * TN; const i = x | 0, fr = x - i; return TANT[i] + (TANT[i + 1] - TANT[i]) * fr; }
// minimum-phase band-limited step (minBLEP) for the A family: Blackman-windowed sinc (16 zero crossings, cut 0.45 fs),
// minimum phase via the real cepstrum, integrated; residual = step - 1 over 32 samples, 32 table points per sample
function fftc(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * PI / len, wr = Math.cos(a), wi = Math.sin(a), h = len >> 1;
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < h; j++) { const k = i + j + h, vr = re[k] * cr - im[k] * ci, vi = re[k] * ci + im[k] * cr;
      re[k] = re[i + j] - vr; im[k] = im[i + j] - vi; re[i + j] += vr; im[i + j] += vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const BZ = 16, BOS = 32, BL = 2 * BZ, BRES = new Float64Array(BL * BOS + BOS + 2);
(function () {
  const n = BL * BOS + 1, N = 8192, re = new Float64Array(N), im = new Float64Array(N), fc = 0.45;
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) / BOS, sn = x === 0 ? 2 * fc : Math.sin(2 * PI * fc * x) / (PI * x), w = 0.42 - 0.5 * Math.cos(2 * PI * i / (n - 1)) + 0.08 * Math.cos(4 * PI * i / (n - 1)); re[i] = sn * w; }
  fftc(re, im);
  for (let i = 0; i < N; i++) { re[i] = Math.log(Math.max(1e-12, Math.hypot(re[i], im[i]))); im[i] = 0; }
  fftc(re, im); for (let i = 0; i < N; i++) { re[i] /= N; im[i] = -im[i] / N; }            // real cepstrum (input real and even)
  for (let i = 1; i < N / 2; i++) { re[i] *= 2; im[i] *= 2; } for (let i = N / 2 + 1; i < N; i++) { re[i] = 0; im[i] = 0; }
  fftc(re, im);
  for (let i = 0; i < N; i++) { const e = Math.exp(re[i]), a = im[i]; re[i] = e * Math.cos(a); im[i] = -e * Math.sin(a); }
  fftc(re, im);
  let s = 0; for (let i = 0; i < n - 1; i++) s += re[i];
  let c = 0; for (let i = 0; i < BRES.length; i++) { if (i < n - 1) c += re[i] / s; BRES[i] = (i < n - 1 ? c : 1) - 1; }
  for (let i = BL * BOS; i < BRES.length; i++) BRES[i] = 0;
})();
// add a step of height h that happened frac samples before the next sample (ring position p + 1)
function blepAdd(R, p, frac, h) { for (let k = 0; k < BL; k++) { const x = (k + frac) * BOS, j = x | 0; R[(p + 1 + k) & 63] += h * (BRES[j] + (BRES[j + 1] - BRES[j]) * (x - j)); } }
// scales (section 1.2)
function Tsec(x) { return 0.004 * Math.pow(2500, x / 50); }
function Glv(x) { const a = x / 50; return a * a; }
function fNz(n) { return 30 * Math.pow(600, n / 50); }
function fEq(n) { return 40 * Math.pow(400, n / 50); }
function resQ(r) { const a = r / 20; return 0.5 + 15.5 * a * a; }
// VERH ratio steps (SPECTRA of F1-F4, r1-r2)
const VERH = new Float64Array(100);
(function () {
  const a = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1.41,
    0.25, 1 / 3, 2 / 3, 0.75, 1.25, 4 / 3, 1.5, 5 / 3, 1.75, 2.25, 7 / 3, 2.5, 8 / 3, 3.5, 4.5, 5.5,
    0.707, 1.19, 1.483, 1.571, 1.593, 1.618, 1.732, 1.8, 1.98, 2.136, 2.236, 2.295, 2.38, 2.44, 2.546, 2.63,
    2.646, 2.653, 2.67, 2.718, 2.756, 2.917, 2.94, 3.142, 3.155, 3.236, 3.317, 3.5, 3.598, 3.606, 3.897, 5.404];
  for (let i = 0; i < 64; i++) VERH[i] = a[i];
  for (let i = 0; i < 36; i++) VERH[64 + i] = 0.125 * Math.pow(2, i * 0.2);
})();
// VERST detune steps in semitones (SPECTRA of A2-A5, t2)
const VERST = new Float64Array(100);
(function () {
  VERST[0] = 0;
  for (let i = 1; i <= 24; i++) VERST[i] = 0.02 * i;
  for (let i = 25; i <= 48; i++) VERST[i] = i - 24;
  for (let i = 49; i <= 72; i++) VERST[i] = -(i - 48);
  for (let i = 73; i <= 99; i++) VERST[i] = 12 * Math.log2(VERH[i - 36]);
})();
// codes
const WAVES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 't1', 't2', 'F1', 'F2', 'F3', 'F4', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'P1', 'P2', 'P3', 'P4', 'C1', 'C2', 'C3', 'r1', 'r2'];
const FAM_A = 0, FAM_T = 1, FAM_F = 2, FAM_H = 3, FAM_D = 4, FAM_P = 5, FAM_C1 = 6, FAM_C2 = 7, FAM_C3 = 8, FAM_R = 9;
const WFAM = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 7, 8, 9, 9];
const WSUB = [1, 2, 3, 4, 5, 6, 1, 2, 1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 1, 2, 3, 1, 2];
const TMODES = ['E1', 'E2', 'E3', 'L', 'P', 'D'], NMODES = ['E1', 'E2', 'E3', 'L', 'G', 'D'];
const M_E1 = 0, M_E2 = 1, M_E3 = 2, M_L = 3, M_P = 4, M_D = 5, M_G = 4;
const NTYPES = ['L1', 'L2', 'b1', 'b2', 'H1', 'H2', 'H3'];
const CTYPES = ['n1', 'n2', 'n3', 'P1', 'P2', 'P3', 'H1', 'H2', 'H3', 'C1', 'C2', 'C3'];
const DTYPES = ['dr', 'SA', 'rn'];
const CRVS = ['Li', 'L1', 'L2', 'L3', 'O1', 'O2'];
const RVTS = ['ti', 'r1', 'r2', 'p1', 'p2', 'p3', 'p4', 'St', 'hA'];
// drumhead modes (Bessel zeros of the ideal circular membrane, ratios to the fundamental)
const D2L = [1, 1.593, 2.136, 2.295, 2.653, 2.917, 3.155, 3.5, 3.598, 3.647, 4.059, 4.132];
const DMOD = [
  {r: [1, 2.295, 3.598, 4.903, 6.209, 7.515], g: 0.6, b: 0.8, bd: -6, bt: 1.3},
  {r: D2L, g: 0.8, b: 1.0, bd: -6, bt: 1.3},
  {r: [0.85, 1, 1.5, 1.98, 2.44, 2.94, 3.4], g: 0.7, b: 0.6, bd: -12, bt: 1.0},
  {r: [1, 2, 3, 4, 5, 6, 1.5], g: 0.9, b: 0.4, bd: -12, bt: 1.0},
  {r: D2L.slice(0, 8), g: 0.7, b: 1.4, bd: -9, bt: 1.0},
  {r: D2L.concat([4.23, 4.601, 4.61, 4.832]), g: 0.5, b: 0.9, bd: 0, bt: 1.6},
  {r: [1, 1.593, 2.136, 2.295, 4.601, 4.832, 5.131, 5.412], g: 0.9, b: 1.2, bd: 3, bt: 1.0}];
// bar modes (P1-P4): ratios, amplitudes, decay factors
const PMOD = [
  {r: [1, 3.99, 9.95, 16.4], a: [1, 0.3, 0.12, 0.04], g: [1, 0.25, 0.1, 0.05]},
  {r: [1, 4, 10], a: [1, 0.35, 0.15], g: [1, 0.6, 0.35]},
  {r: [1, 3, 6, 9.8], a: [1, 0.45, 0.2, 0.1], g: [1, 0.4, 0.2, 0.1]},
  {r: [1, 2.756, 5.404, 8.933, 13.344], a: [1, 0.5, 0.3, 0.15, 0.08], g: [1, 0.6, 0.4, 0.25, 0.15]}];
for (const P of PMOD) { let s = 0; for (const a of P.a) s += a * a; P.nrm = 1 / Math.sqrt(s); }
// C1: 48 partials from a fixed LCG sequence (a 1664525, c 1013904223, seed 12345), start phases from the same sequence
const C1R = new Float64Array(48), C1A = new Float64Array(48), C1G = new Float64Array(48), C1P = new Float64Array(48);
(function () {
  let s = 12345 >>> 0; const nx = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  let ss = 0;
  for (let k = 0; k < 48; k++) { const u = nx(); C1R[k] = Math.pow(24, (k + 0.8 * u) / 48); }
  for (let k = 0; k < 48; k++) C1P[k] = nx();
  for (let k = 0; k < 48; k++) { C1A[k] = Math.pow(C1R[k], -0.3); C1G[k] = Math.pow(C1R[k], -0.35); ss += C1A[k] * C1A[k]; }
  const n = 1 / Math.sqrt(ss); for (let k = 0; k < 48; k++) C1A[k] *= n;
})();
const C2R = [1, 1.483, 1.8, 2.546, 2.63, 3.897];
const C3R = [1, 1.414, 1.732, 2.236, 2.646, 3.317];
// CLICK tables (peak 1.0), built at the context rate with a fixed seed
const CLK = [];
(function () {
  let s = 0x2545F491 >>> 0; const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 2147483648 - 1; };
  const len = ms => Math.max(1, Math.round(ms * 0.001 * SR));
  const norm = b => { let m = 0; for (let i = 0; i < b.length; i++) m = Math.max(m, Math.abs(b[i])); if (m > 0) for (let i = 0; i < b.length; i++) b[i] /= m; return b; };
  // simple biquads for the table builder (RBJ)
  const biq = (b, type, f, q) => {
    const w = TAU * Math.min(f, 0.45 * SR) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
    let b0, b1, b2; const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    if (type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; } else if (type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; } else { b0 = al; b1 = 0; b2 = -al; }
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < b.length; i++) { const x = b[i], y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; b[i] = y; }
    return b;
  };
  const noise = (ms, env) => { const n = len(ms), b = new Float64Array(n); for (let i = 0; i < n; i++) b[i] = rnd() * env(i / SR, n); return b; };
  // n1 white noise, linear end, 1.5 ms
  CLK.push(norm(noise(1.5, (t, n) => 1 - t * SR / n)));
  // n2 noise, band-pass 5 kHz (Q 1), exp tau 1 ms, 4 ms
  { const n = len(4), b = new Float64Array(n); for (let i = 0; i < n; i++) b[i] = rnd(); biq(b, 'bp', 5000, 1); for (let i = 0; i < n; i++) b[i] *= Math.exp(-i / SR / 0.001); CLK.push(norm(b)); }
  // n3 noise, low-pass 1.5 kHz ("wood"), 8 ms, linear end
  { const n = len(8), b = new Float64Array(n); for (let i = 0; i < n; i++) b[i] = rnd(); biq(b, 'lp', 1500, 0.7071); for (let i = 0; i < n; i++) b[i] *= 1 - i / n; CLK.push(norm(b)); }
  // P1-P3 rectangular pulses 0.05 / 0.3 / 1.2 ms: full at the first sample, 0.1 ms raised-cosine fall
  const pulse = ms => { const w = Math.max(1, Math.round(ms * 0.001 * SR)), f = Math.max(1, Math.round(0.0001 * SR)), b = new Float64Array(w + f);
    for (let i = 0; i < w; i++) b[i] = 1; for (let i = 0; i < f; i++) b[w + i] = 0.5 * (1 + Math.cos(PI * (i + 1) / (f + 1))); return b; };
  CLK.push(pulse(0.05), pulse(0.3), pulse(1.2));
  // H1-H3: P1 -> HP 12 dB 2 kHz, P2 -> HP 4 kHz, P2 -> HP 8 kHz (lengths 1 / 2 / 3 ms)
  const hpP = (ms, f, L) => { const p = pulse(ms), b = new Float64Array(len(L)); for (let i = 0; i < Math.min(p.length, b.length); i++) b[i] = p[i]; biq(b, 'hp', f, 0.7071);
    const m = b.length, fo = Math.max(1, Math.round(0.00025 * SR)); for (let i = 0; i < fo; i++) b[m - 1 - i] *= i / fo; return norm(b); };
  CLK.push(hpP(0.05, 2000, 1), hpP(0.3, 4000, 2), hpP(0.3, 8000, 3));
  // C1-C3 sine chirps 8 -> 2 kHz / 4 -> 0.8 kHz / 2 -> 0.2 kHz, exponential, 2 / 4 / 8 ms, 0.25 ms raised-cosine end
  const chirp = (f1, f2, ms) => { const n = len(ms), b = new Float64Array(n), fo = Math.max(1, Math.round(0.00025 * SR)); let ph = 0;
    for (let i = 0; i < n; i++) { b[i] = Math.sin(TAU * ph); ph += f1 * Math.pow(f2 / f1, i / n) / SR; }
    for (let i = 0; i < fo; i++) b[n - 1 - i] *= 0.5 * (1 - Math.cos(PI * i / fo)); return norm(b); };
  CLK.push(chirp(8000, 2000, 2), chirp(4000, 800, 4), chirp(2000, 200, 8));
  for (let i = 0; i < CLK.length; i++) CLK[i] = Float32Array.from(CLK[i]);
})();
// hall types: RT60 s, size, damp Hz, predelay ms, early reflections (0 none, 1 sparse, 2 medium, 3 strong/bright), mod
const RV = [
  {rt: 0.7, sz: 0.45, dp: 12000, pd: 4, er: 3, md: 0.5}, {rt: 0.4, sz: 0.38, dp: 7000, pd: 2, er: 2, md: 0.5},
  {rt: 0.9, sz: 0.6, dp: 6000, pd: 6, er: 2, md: 0.5}, {rt: 0.8, sz: 0.5, dp: 11000, pd: 0, er: 0, md: 0.5},
  {rt: 1.3, sz: 0.7, dp: 11000, pd: 0, er: 0, md: 0.5}, {rt: 2.0, sz: 0.9, dp: 11000, pd: 0, er: 0, md: 0.5},
  {rt: 3.2, sz: 1.1, dp: 11000, pd: 0, er: 0, md: 0.5}, {rt: 1.6, sz: 1.0, dp: 5000, pd: 18, er: 1, md: 0.5},
  {rt: 3.0, sz: 1.4, dp: 4000, pd: 25, er: 1, md: 0.6}];
// early reflection patterns: [ms, gainL, gainR] (level per pattern: strong 0.6, medium 0.4, sparse 0.25)
const ERP = [null,
  [[7, 0.25, 0.2], [13, 0.18, 0.22], [21, 0.14, 0.12], [34, 0.1, 0.12]],
  [[3, 0.4, 0.3], [6, 0.3, 0.38], [10, 0.3, 0.26], [15, 0.22, 0.25], [21, 0.2, 0.16], [28, 0.14, 0.17]],
  [[2, 0.6, 0.45], [3.5, 0.45, 0.6], [5.5, 0.5, 0.42], [8, 0.4, 0.48], [11, 0.38, 0.3], [15, 0.28, 0.34], [19, 0.24, 0.2], [25, 0.18, 0.2]]];
const DSR = 29761, MAXS = 1.6;
const HTL = [266, 2974, 1913, 1996, 1990, 187, 1066], HTR = [353, 3627, 1228, 2673, 2111, 335, 121];
function p2(n) { let p = 1; while (p < n) p <<= 1; return p; }
function rdl(b, m, p) { const i = Math.floor(p), f = p - i; return b[i & m] * (1 - f) + b[(i + 1) & m] * f; }
function clampN(v, a, b, d) { v = +v; if (!(v === v)) return d; return v < a ? a : v > b ? b : v; }
function idxOf(L, c, d) { const i = L.indexOf(c); return i < 0 ? d : i; }
// echo time of the kit (section 1.10): RATE 0..99 or BPM dial 0..470
function dlyTime(K) {
  if (K.dlM === 1) { const b = K.dlB;
    if (b < 120) return 60 / (60 + b); if (b < 210) return 30 / (90 + b - 120); if (b < 421) return 15 / (90 + b - 210); return 0.05 - 0.001 * (b - 421); }
  return 1.15 * Math.pow(0.01 / 1.15, K.dlR / 99);
}
/* ---------- channel program (parsed from the flat m* values) ---------- */
class Prog {
  constructor() { this.set(null); }
  set(p) {
    p = p || {};
    this.wav = idxOf(WAVES, p.mWav, 0); this.spc = Math.round(clampN(p.mSpc, 0, 99, 0)); this.frq = clampN(p.mFrq, 0, 50, 25);
    this.dyf = clampN(p.mDyf, 0, 9, 0); this.dec = clampN(p.mDec, 0, 50, 20); this.dm = idxOf(TMODES, p.mDm, 0); this.dd = clampN(p.mDd, 0, 50, 20);
    this.bnd = clampN(p.mBnd, -50, 50, 0); this.bt = clampN(p.mBt, 0, 50, 10); this.pit = clampN(p.mPit, 0, 127.5, 45);
    this.nres = clampN(p.mNres, 0, 20, 0); this.ntyp = idxOf(NTYPES, p.mNtyp, 0); this.nfrq = clampN(p.mNfrq, 0, 50, 30);
    this.ndyf = clampN(p.mNdyf, -9, 9, 0); this.ndec = clampN(p.mNdec, 0, 50, 15); this.ndm = idxOf(NMODES, p.mNdm === 'E' ? 'E1' : p.mNdm, 0); this.ndd = clampN(p.mNdd, 0, 50, 15);
    this.clv = clampN(p.mClv, 0, 50, 0); this.cty = idxOf(CTYPES, p.mCty, 0);
    this.nlv = clampN(p.mNlv, 0, 50, 0); this.tlv = clampN(p.mTlv, 0, 50, 40); this.lvl = clampN(p.mLvl, 0, 50, 40); this.pan = clampN(p.mPan, -9, 9, 0);
    this.eqf = clampN(p.mEqf, 0, 50, 25); this.eqg = clampN(p.mEqg, -9, 9, 0); this.dst = clampN(p.mDst, 0, 50, 0); this.dty = idxOf(DTYPES, p.mDty, 0);
    this.rvb = clampN(p.mRvb, 0, 50, 0); this.dly = clampN(p.mDly, 0, 50, 0); this.mono = p.mMono ? 1 : 0; this.crv = idxOf(CRVS, p.mCrv, 0);
    return this;
  }
}
function curveOf(c, v) {
  switch (c) { case 1: return Math.log(1 + 3 * v) / Math.log(4); case 2: return Math.log(1 + 15 * v) / Math.log(16); case 3: return Math.log(1 + 63 * v) / Math.log(64);
    case 4: return 0.6 + 0.4 * v; case 5: return 0.8 + 0.2 * v; default: return v; }
}
// envelope shapes (section 1.5); t, T in seconds
function envShape(m, t, T, v) {
  const x = t / T;
  switch (m) {
    case M_E2: return Math.exp(-LN1K * Math.pow(x, 0.7));
    case M_E3: return Math.exp(-LN1K * Math.sqrt(x));
    case M_L: return x < 1 ? 1 - x : 0;
    case M_P: return Math.exp(-LN1K * x) * (1 + v * Math.exp(-t / 0.006));
    default: return Math.exp(-LN1K * x);
  }
}
function gateShape(t, T) { if (t < T) return 1; const u = (t - T) / 0.002; return u < 1 ? 0.5 * (1 + Math.cos(PI * u)) : 0; }
function envEnd(m, T) { return m === M_E2 ? 2.7 * T : m === M_E3 ? 4 * T : m === M_L ? T : 2 * T; }   // -120 dB (L: 0)
// fast tanh (rational, |x| <= 3 exact limit 1)
function tnh(x) { if (x > 3) return 1; if (x < -3) return -1; const x2 = x * x; return x * (27 + x2) / (27 + 9 * x2); }
/* ---------- one voice ---------- */
class Voice {
  constructor(eng, ch) {
    this.E = eng; this.ch = ch; this.on = false; this.bp = 0;
    this.zr = new Float64Array(MAXM); this.zi = new Float64Array(MAXM); this.cr = new Float64Array(MAXM); this.ci = new Float64Array(MAXM);
    this.mf = new Float64Array(MAXM); this.mr = new Float64Array(MAXM); this.nm = 0;
    this.TB = new Float64Array(CR); this.NB = new Float64Array(CR);
    this.ph = new Float64Array(8); this.ph2 = new Float64Array(8); this.R1 = new Float64Array(64); this.R2 = new Float64Array(64); this.rp = 0;
    this.reset0();
  }
  reset0() {
    this.on = false; this.age = 0; this.cc = 0; this.fade = 1; this.fadeSt = 0; this.stp = 1; this.stpK = 1;
    this.s1 = 0; this.s2 = 0; this.s3 = 0; this.s4 = 0; this.s5 = 0; this.s6 = 0; this.s7 = 0; this.s8 = 0;
    this.n1 = 0; this.n2 = 0; this.n3 = 0; this.n4 = 0; this.n5 = 0; this.tri = 0; this.tri2 = 0; this.fb1 = 0; this.fb2 = 0; this.ef = 0;
    this.gT = 0; this.dgT = 0; this.gN = 0; this.dgN = 0; this.gC = 0; this.cpos = 1e9; this.clen = 0; this.ctab = null; this.cpol = 1;
    this.inc = 0; this.dinc = 0; this.ex = 0; this.exN = 0;
    if (this.R1) { this.R1.fill(0); this.R2.fill(0); } this.rp = 0;
  }
  // start a hit: everything structural is copied from the channel program here
  start(P, v, acc, tune, decK) {
    const E = this.E, C = E.chs[this.ch];
    this.reset0(); this.on = true;
    const vk = Math.min(1, v + 0.3 * acc);            // sound velocity (linear)
    this.vk = vk; this.vg = curveOf(P.crv, v) * (1 + 0.6 * acc);
    this.wav = P.wav; this.fam = WFAM[P.wav]; this.sub = WSUB[P.wav];
    // decay
    const xT = P.dm === M_D ? P.dd + (P.dec - P.dd) * vk : P.dec;
    this.T = Tsec(xT) * decK; this.tm = P.dm === M_D ? M_E1 : P.dm;
    const xN = P.ndm === M_D ? P.ndd + (P.ndec - P.ndd) * vk : P.ndec;
    this.TN = Tsec(xN) * decK; this.nm_ = P.ndm === M_D ? M_E1 : P.ndm;
    this.Tf = 0.5 * this.T; this.TfN = 0.5 * this.TN;
    // pitch, bend
    this.f0 = 440 * Math.pow(2, (P.pit + tune - 69) / 12);
    const b = P.bnd; this.b0 = (b < 0 ? -1 : 1) * 48 * (b / 50) * (b / 50) * (0.3 + 0.7 * vk); this.Tb = Tsec(P.bt);
    this.bm = this.bendAt(0);
    // dyn filter
    this.dfT = 4.6 * P.dyf * (0.35 + 0.65 * vk); this.dfN = 4.6 * P.ndyf * (0.35 + 0.65 * vk);
    this.frq = P.frq; this.spc = P.spc;
    // noise
    this.ntyp = P.ntyp; this.nfrq = P.nfrq; this.nq = resQ(P.nres); this.noiseOn = P.nlv > 0 || C.nlT > 0;
    // click
    if (P.clv > 0) { this.ctab = CLK[P.cty]; this.cpos = 0; this.clen = this.ctab.length; this.gC = Glv(P.clv) * vk; } else { this.ctab = null; this.cpos = 1e9; }
    this.tend = Math.max(this.tm === M_D ? 2 * this.T : envEnd(this.tm, this.T), this.noiseOn ? (this.nm_ === M_G ? this.TN + 0.003 : envEnd(this.nm_, this.TN)) : 0);
    this.modal = false; this.comp = 0;
    this.initTone(P);
    // click polarity = first half-wave of the tone (all models start positive except C1, computed there)
    this.tl = C.tlT; this.nl = C.nlT; this.cl = C.clT;
    this.cc = 0;
  }
  bendAt(t) {
    if (this.b0 === 0 || t >= this.Tb) return 1;
    const e4 = 0.01831563888873418, d = this.b0 * (Math.exp(-4 * t / this.Tb) - e4) / (1 - e4);
    return Math.pow(2, d / 12);
  }
  fEff(t, base, dfa, Tf) { let F = base + dfa * Math.exp(-LN1K * t / (Tf || this.Tf)); return F < 0 ? 0 : F > 50 ? 50 : F; }
  initTone(P) {
    const f0 = this.f0, fam = this.fam, s = this.sub, E = this.E;
    const F0 = this.fEff(0, this.frq, this.dfT);
    this.ph.fill(0); this.ph2.fill(0);
    const bmax = this.b0 > 0 ? Math.pow(2, this.b0 / 12) : 1;
    let cap = E.lim >= 2 ? 12 : E.lim >= 1 ? 24 : MAXM;
    this.inc = f0 * this.bm * ISR; this.dinc = 0;
    if (fam === FAM_A) {
      this.det = s >= 2 && s <= 5 ? Math.pow(2, VERST[this.spc] / 12) : 1;
      this.pw0 = 0.5 - 0.45 * this.spc / 99;
      this.ph2[0] = 0; this.tri = 0; this.tri2 = 0;
      if (s === 2) { this.ph[0] = 0.25; this.ph2[0] = 0.25; }            // triangle: integrated square starting a quarter in -> starts at 0 rising
    } else if (fam === FAM_T) {
      // excitation: pulse width 2 ms * 0.025^(F/50), limited to 0.45 period; normalised amplitude; tanh drive 1 + 2F/50
      const Fx = s === 1 ? F0 : this.fEff(0, 0, this.dfT);
      this.mixB = s === 2 ? this.frq / 50 : 0;
      this.det = s === 2 ? Math.pow(2, VERST[this.spc] / 12) : 1;
      this.drv = 1 + 2 * Fx / 50;
      let w = 0.002 * Math.pow(0.025, Fx / 50); const per = 1 / (f0 * bmax); if (w > 0.45 * per) w = 0.45 * per;
      const N = Math.max(1, Math.round(w * SR)); this.exN = N;
      const om = TAU * f0 * this.bm / SR, g1 = Math.abs(Math.sin(N * om / 2) / Math.sin(om / 2)) || 1;
      const om2 = om * this.det, g2 = Math.abs(Math.sin(N * om2 / 2) / Math.sin(om2 / 2)) || 1;
      this.ex = 1 / g1; this.ex2 = 1 / g2;
      this.setupModalDecay();
      this.mf[0] = f0; this.mf[1] = f0 * this.det;
      this.mr[0] = Math.pow(10, -3 / (this.TM * SR)); this.mr[1] = this.mr[0];
      this.zr[0] = this.zi[0] = this.zr[1] = this.zi[1] = 0;
      this.coefModes(2);
    } else if (fam === FAM_F) {
      this.rat = VERH[this.spc]; this.Imax = s === 1 ? 10 : 8;
    } else if (fam === FAM_R) {
      this.rat = VERH[this.spc];
    } else if (fam === FAM_C2 || fam === FAM_C3) {
      this.kap = Math.pow(2, (this.spc - 50) / 50);
    } else {
      // modal families
      this.setupModalDecay(); this.modal = true;
      this.nm = 0; this.cap = cap; this.bmax = bmax; this.gmax = 1;
      if (fam === FAM_H) {
        const al = 2 - 1.7 * F0 / 50, fc = f0 * Math.pow(2, 8 * this.spc / 99);
        let ss = 0; const kmax = s === 6 ? 24 : 64; let cnt = 0;
        const hcap = Math.min(cap, E.lim >= 1 ? (E.lim >= 2 ? 12 : 16) : 32);
        for (let k = 1; k <= kmax && cnt < 32; k++) {
          if (s === 2 && k % 2 === 0) continue; if (s === 3 && k % 3 === 0) continue; if (s === 4 && k > 1 && k % 2 === 1) continue;
          cnt++; const a = Math.pow(k, -al); ss += a * a;
        }
        const nrm = 1 / Math.sqrt(ss); cnt = 0; this.cap = hcap;
        for (let k = 1; k <= kmax && cnt < 32; k++) {
          if (s === 2 && k % 2 === 0) continue; if (s === 3 && k % 3 === 0) continue; if (s === 4 && k > 1 && k % 2 === 1) continue;
          cnt++; const f = s === 6 ? k * f0 * Math.sqrt(1 + 0.0008 * k * k) : k * f0;
          this.add(f, Math.pow(k, -al) * this.wH(f, fc, s === 5) * nrm, Math.pow(k, -0.5));
        }
      } else if (fam === FAM_D) {
        const D = DMOD[s - 1], fF = f0 * Math.pow(2, (this.spc - 33) / 33), tc = 0.004 * Math.pow(0.025, F0 / 50);
        const bodyA = Math.pow(10, D.bd / 20); let ss = bodyA * bodyA;
        for (let k = 0; k < D.r.length; k++) { const a = Math.pow(D.r[k], -D.g); ss += a * a; }
        const nrm = 1 / Math.sqrt(ss);
        this.add(f0, bodyA * hard(f0, tc) * nrm, D.bt);                             // body resonance at PITCH
        for (let k = 0; k < D.r.length; k++) {
          const r = D.r[k]; let a = Math.pow(r, -D.g), g = Math.pow(r, -D.b);
          if (s === 3 && k === 0) { a *= 0.25; g = 0.15; }                 // d3: weak mode 0.85 (-12 dB), 0.15 T
          if (s === 4 && k === 6) a *= 0.126;                               // d4: 1.5 at -18 dB
          if (s === 7 && k >= 4) { a *= F0 / 50; g = Math.pow(r, -2.0); }  // d7: slap group, level rises with FREQ
          this.add(fF * r, a * hard(fF * r, tc) * nrm, g);
        }
        this.snr = s === 5; this.ef = 0;
        if (this.snr) { this.sg = tanf(5000); this.sk = 1; this.sa1 = 1 / (1 + this.sg * (this.sg + this.sk)); this.sa2 = this.sg * this.sa1; this.sa3 = this.sg * this.sa2; this.efk = 1 - Math.exp(-1 / (0.002 * SR)); }
      } else if (fam === FAM_P) {
        const B = PMOD[s - 1], fR = f0 * Math.pow(2, (this.spc - 24) / 25), tc = 0.004 * Math.pow(0.025, F0 / 50);
        for (let k = 0; k < B.r.length; k++) {
          const f = f0 * B.r[k], l = Math.log2(f / fR), W = 1 + 3 * Math.exp(-l * l / (2 * 0.08 * 0.08));
          this.add(f, B.a[k] * B.nrm * hard(f, tc) * W, B.g[k] * (1 + 0.5 * (W - 1) / 3));
        }
      } else if (fam === FAM_C1) {
        const kap = Math.pow(2, (this.spc - 50) / 50), fl = f0 * Math.pow(2, 10 * F0 / 50);
        let sg = 0; const c1cap = Math.min(cap, 48);
        for (let k = 0; k < 48; k++) {
          const f = kap * f0 * C1R[k], q = f / fl, w = 1 / Math.sqrt(1 + q * q * q * q);
          const nb = this.nm; this.add(f, C1A[k] * w, C1G[k], C1P[k]); if (this.nm > nb) sg += this.zi[this.nm - 1];
          if (this.nm >= c1cap) break;
        }
        this.cpol = sg < 0 ? -1 : 1;
        // high-pass 12 dB at 1.5 kappa f0 on the output
        this.hpg = tanf(1.5 * kap * f0); this.hpk = 1.4142135623730951;
      }
      this.coefModes(this.nm);
      this.tend = Math.max(this.tend, (this.comp > 0 ? 0 : 2 * this.T * this.gmax));
    }
    this.lpk = 1.4142135623730951;   // Q 0.7071 for the 12 dB tone filters
  }
  add(f, a, g, ph) {
    const n = this.nm;
    if (n >= this.cap || f * this.bmax > NYQ || f <= 0 || a === 0) return;
    this.mf[n] = f; this.mr[n] = Math.pow(10, -3 / (this.TM * g * SR)); if (g > this.gmax) this.gmax = g;
    const p = ph || 0; this.zr[n] = a * cosc(p); this.zi[n] = a * sinc(p); this.nm = n + 1;
  }
  wH(f, fc, two) { const l = Math.log2(f / fc); let w = 1 + 7 * Math.exp(-l * l / 0.245); if (two) { const l2 = Math.log2(f / (2.5 * fc)); w += 3 * Math.exp(-l2 * l2 / 0.245); } return w; }
  setupModalDecay() {
    // E1 / P / Dynamic: modes ring with T (no output envelope besides punch); E2 / E3 / L: modes ring with 4 T and the output
    // envelope = shape * exp(+LN1K t / 4T) -> the fundamental follows the shape exactly
    if (this.tm === M_E2 || this.tm === M_E3 || this.tm === M_L) { this.TM = 4 * this.T; this.comp = LN1K / (4 * this.T); }
    else { this.TM = this.T; this.comp = 0; }
  }
  coefModes(n) {
    const bm = this.bm, mf = this.mf, mr = this.mr, cr = this.cr, ci = this.ci;
    for (let k = 0; k < n; k++) { const ph = mf[k] * bm * ISR; cr[k] = mr[k] * cosc(ph); ci[k] = mr[k] * sinc(ph); }
  }
  // control: every 16 samples of the voice's age
  control() {
    const E = this.E, C = E.chs[this.ch], t = this.age * ISR, t1 = (this.age + CR) * ISR;
    // live levels (smoothed per voice, tau 10 ms)
    const k = E.smK;
    this.tl += (C.tlT - this.tl) * k; this.nl += (C.nlT - this.nl) * k; this.cl += (C.clT - this.cl) * k;
    // fade (re-trigger / mono group), stop
    let f1 = this.fade; if (this.fadeSt > 0) { f1 = this.fade - this.fadeSt * CR; if (f1 < 0) f1 = 0; }
    let s1 = this.stp; if (this.stpK < 1) s1 = this.stp * this.stpK;
    const fi0 = this.fam === FAM_A || this.fam === FAM_C1 ? Math.min(1, t / 0.0005) : 1, fi1 = this.fam === FAM_A || this.fam === FAM_C1 ? Math.min(1, t1 / 0.0005) : 1;
    // tone envelope
    let e0, e1;
    if (this.modal || this.fam === FAM_T) {
      if (this.comp > 0) { e0 = envShape(this.tm, t, this.T, this.vk) * Math.exp(this.comp * t); e1 = envShape(this.tm, t1, this.T, this.vk) * Math.exp(this.comp * t1); }
      else if (this.tm === M_P) { e0 = 1 + this.vk * Math.exp(-t / 0.006); e1 = 1 + this.vk * Math.exp(-t1 / 0.006); }
      else { e0 = 1; e1 = 1; }
    } else { e0 = envShape(this.tm, t, this.T, this.vk); e1 = envShape(this.tm, t1, this.T, this.vk); }
    const gt = this.vg * this.tl;
    this.gT = gt * e0 * this.fade * this.stp * fi0; this.dgT = (gt * e1 * f1 * s1 * fi1 - this.gT) / CR;
    // noise envelope
    if (this.noiseOn) {
      let n0, n1;
      if (this.nm_ === M_G) { n0 = gateShape(t, this.TN); n1 = gateShape(t1, this.TN); } else { n0 = envShape(this.nm_, t, this.TN, 0); n1 = envShape(this.nm_, t1, this.TN, 0); }
      const gn = this.vg * this.nl * 1.224744871391589;   // noise RMS = sine RMS at the same level
      this.gN = gn * n0 * this.fade * this.stp; this.dgN = (gn * n1 * f1 * s1 - this.gN) / CR;
      // noise filter
      const nf = this.fEff(t, this.nfrq, this.dfN, this.TfN), fc = fNz(nf), g = tanf(fc);
      this.ng = g; const kq = 1 / this.nq; this.nk = kq;
      this.na1 = 1 / (1 + g * (g + kq)); this.na2 = g * this.na1; this.na3 = g * this.na2;
      const k2 = 1.4142135623730951; this.nk2 = k2;   // 2nd stage (24 dB / b2): Q 0.7071, no resonance
      this.nb1 = 1 / (1 + g * (g + k2)); this.nb2 = g * this.nb1; this.nb3 = g * this.nb2;
      if (this.ntyp === 6) { const gl = tanf(Math.max(3 * fc, 6000)); this.nlp = gl / (1 + gl); }
    }
    this.gCl = this.vg * this.cl * this.gC * this.fade * this.stp * this.cpol;
    // bend: increments at t and t1, modal coefficients
    const bm0 = this.bm, bm1 = this.bendAt(t1);
    this.bm = bm1;
    const f0 = this.f0;
    this.inc = f0 * bm0 * ISR; this.dinc = f0 * (bm1 - bm0) * ISR / CR;
    if ((this.modal || this.fam === FAM_T) && bm1 !== bm0) this.coefModes(this.fam === FAM_T ? 2 : this.nm);
    // timbre controls per family
    const fam = this.fam;
    if (fam === FAM_A || (fam === FAM_R && this.sub === 2)) {
      const F = this.fEff(t, this.frq, this.dfT), fc = f0 * bm1 * Math.pow(2, 9 * F / 50), g = tanf(fc), kq = this.lpk;
      this.la1 = 1 / (1 + g * (g + kq)); this.la2 = g * this.la1; this.la3 = g * this.la2;
      if (fam === FAM_A && this.sub === 6) { const ef = Math.exp(-LN1K * t / this.Tf); this.pw = 0.5 - (0.5 - this.pw0) * ef; }
      if (fam === FAM_A && this.sub === 5) { const gh = tanf(f0 * bm1); this.ha1 = 1 / (1 + gh * (gh + kq)); this.ha2 = gh * this.ha1; this.ha3 = gh * this.ha2; this.hk = kq; }
    } else if (fam === FAM_F) {
      const F0 = this.fEff(t, this.frq, this.dfT), F1 = this.fEff(t1, this.frq, this.dfT);
      const I0 = this.Imax * (F0 / 50) * (F0 / 50), I1 = this.Imax * (F1 / 50) * (F1 / 50);
      this.I = I0 / TAU; this.dI = (I1 - I0) / TAU / CR;     // index in cycles
    } else if (fam === FAM_R && this.sub === 1) {
      const m0 = this.fEff(t, this.frq, this.dfT) / 50, m1 = this.fEff(t1, this.frq, this.dfT) / 50;
      this.m = m0; this.dm = (m1 - m0) / CR;
    } else if (fam === FAM_C2 || fam === FAM_C3) {
      const kf = this.kap * f0 * bm1, F = this.fEff(t, this.frq, this.dfT);
      const fb = 16 * kf, gb = tanf(fb), kb = 1 / 1.5;
      this.ba1 = 1 / (1 + gb * (gb + kb)); this.ba2 = gb * this.ba1; this.ba3 = gb * this.ba2; this.bk = kb;
      const fh = fam === FAM_C2 ? 8 * kf : 8 * kf, gh = tanf(fh), kh = 1.4142135623730951;
      this.ha1 = 1 / (1 + gh * (gh + kh)); this.ha2 = gh * this.ha1; this.ha3 = gh * this.ha2; this.hk = kh;
      const fl = Math.min(fb * Math.pow(20000 / Math.min(fb, 20000), F / 50), NYQ), gl = tanf(fl);
      this.la1 = 1 / (1 + gl * (gl + kh)); this.la2 = gl * this.la1; this.la3 = gl * this.la2;
    }
    // end of the voice
    if (this.fadeSt > 0 && f1 <= 0) this.endAfter = true;
    if (this.stpK < 1 && s1 < 1e-5) this.endAfter = true;
    if (t > this.tend && this.cpos >= this.clen) this.endAfter = true;
    this.fade = f1; this.stp = s1;
    this.cc = CR;
  }
  render(out, a, b) {
    let s = a;
    while (s < b && this.on) {
      if (this.cc === 0) { this.endAfter = false; this.control(); }
      const n = Math.min(this.cc, b - s);
      this.chunk(out, s, n);
      this.cc -= n; s += n; this.age += n;
      if (this.cc === 0 && this.endAfter) { this.on = false; break; }
    }
  }
  chunk(out, s, n) {
    const TB = this.TB, E = this.E, mT = E.mskT[this.ch], mN = E.mskN[this.ch], mC = E.mskC[this.ch];
    // TONE
    if (this.gT !== 0 || this.dgT !== 0) {
      this.tone(TB, n);
      if (E.tap === 1 && (this.fam === FAM_C2 || this.fam === FAM_C3)) { /* test tap: raw oscillators already in TB */ }
      let g = this.gT; const dg = this.dgT;
      for (let i = 0; i < n; i++) { out[s + i] += TB[i] * g * mT; g += dg; }
      this.gT = g;
    } else this.skipTone(n);
    // NOISE
    if (this.noiseOn) {
      const NB = this.NB; this.noise(NB, n);
      let g = this.gN; const dg = this.dgN;
      for (let i = 0; i < n; i++) { out[s + i] += NB[i] * g * mN; g += dg; }
      this.gN = g;
    }
    // CLICK
    if (this.cpos < this.clen) {
      const T = this.ctab, g = this.gCl * mC; let p = this.cpos; const m = Math.min(n, this.clen - p);
      for (let i = 0; i < m; i++) out[s + i] += T[p++] * g;
      this.cpos = p;
    }
  }
  skipTone(n) {   // keep phases running while the tone is silent (TONE LVL 0 / solo of another part)
    if (this.modal || this.fam === FAM_T) { /* modes keep ringing in their state only when rendered: render to keep time */ this.tone(this.TB, n); return; }
    let inc = this.inc; for (let i = 0; i < n; i++) inc += this.dinc; this.ph[0] += this.inc * n; this.inc = inc;
  }
  tone(TB, n) {
    const fam = this.fam, s = this.sub;
    let inc = this.inc; const dinc = this.dinc;
    if (fam === FAM_A) {
      // naive waves + minBLEP residuals (ring per oscillator); square/pulse/saw jump +2 at the wrap, square -2 at 0.5, pulse -2 at w
      const ph = this.ph, ph2 = this.ph2, det = this.det, two = s >= 2 && s <= 5, R1 = this.R1, R2 = this.R2;
      let p1 = ph[0], p2 = ph2[0], tri = this.tri, tri2 = this.tri2, rp = this.rp;
      let z1 = this.s1, z2 = this.s2, h1 = this.s3, h2 = this.s4;
      const a1 = this.la1, a2 = this.la2, a3 = this.la3, w = this.pw;
      const leak = 1 - TAU * 5 * ISR;
      for (let i = 0; i < n; i++) {
        const q = rp & 63; let x;
        const inc2 = inc * det;
        if (s === 1) { x = sinc(p1); p1 += inc; if (p1 >= 1) p1 -= 1; }
        else {
          let y1, y2 = 0;
          if (s === 3) y1 = 1 - 2 * p1; else if (s === 6) y1 = p1 < w ? 1 : -1; else y1 = p1 < 0.5 ? 1 : -1;
          y1 += R1[q]; R1[q] = 0;
          const o1 = p1; p1 += inc;
          if (s !== 3) { const e = s === 6 ? w : 0.5; if (o1 < e && p1 >= e) blepAdd(R1, rp, (p1 - e) / inc, -2); }
          if (p1 >= 1) { p1 -= 1; blepAdd(R1, rp, p1 / inc, 2); if (s !== 3 && s !== 6 && p1 >= 0.5) blepAdd(R1, rp, (p1 - 0.5) / inc, -2); }
          if (two) {
            if (s === 3) y2 = 1 - 2 * p2; else y2 = p2 < 0.5 ? 1 : -1;
            y2 += R2[q]; R2[q] = 0;
            const o2 = p2; p2 += inc2;
            if (s !== 3 && o2 < 0.5 && p2 >= 0.5) blepAdd(R2, rp, (p2 - 0.5) / inc2, -2);
            if (p2 >= 1) { p2 -= 1; blepAdd(R2, rp, p2 / inc2, 2); if (s !== 3 && p2 >= 0.5) blepAdd(R2, rp, (p2 - 0.5) / inc2, -2); }
          }
          if (s === 2) { tri = tri * leak + 4 * inc * y1; tri2 = tri2 * leak + 4 * inc2 * y2; x = 0.5 * (tri + tri2); }
          else if (s === 6) x = y1 - (2 * w - 1);
          else x = 0.5 * (y1 + y2);
          if (s === 5) { // high-pass 12 dB at f0 (hollow)
            const hv3 = x - h2, hv1 = this.ha1 * h1 + this.ha2 * hv3, hv2 = h2 + this.ha2 * h1 + this.ha3 * hv3; h1 = 2 * hv1 - h1; h2 = 2 * hv2 - h2; x = x - this.hk * hv1 - hv2;
          }
          const v3 = x - z2, v1 = a1 * z1 + a2 * v3, v2 = z2 + a2 * z1 + a3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; x = v2;
        }
        TB[i] = x; rp++;
        inc += dinc;
      }
      ph[0] = p1; ph2[0] = p2; this.tri = tri; this.tri2 = tri2; this.s1 = z1; this.s2 = z2; this.s3 = h1; this.s4 = h2; this.rp = rp & 0x3fffffff;
    } else if (fam === FAM_T) {
      const cr0 = this.cr[0], ci0 = this.ci[0], cr1 = this.cr[1], ci1 = this.ci[1];
      let zr0 = this.zr[0], zi0 = this.zi[0], zr1 = this.zr[1], zi1 = this.zi[1];
      const two = s === 2, mb = this.mixB, ma = 1 - mb, d = this.drv * 0.9, nd = 1 / tnh(d);
      let exN = this.exN; const ex1 = this.ex, ex2 = this.ex2;
      for (let i = 0; i < n; i++) {
        const xa = exN > 0 ? ex1 : 0, xb = exN > 0 ? ex2 : 0; if (exN > 0) exN--;
        const t0 = zr0 * cr0 - zi0 * ci0 + xa; zi0 = zr0 * ci0 + zi0 * cr0; zr0 = t0;
        let y = zi0;
        if (two) { const t1 = zr1 * cr1 - zi1 * ci1 + xb; zi1 = zr1 * ci1 + zi1 * cr1; zr1 = t1; y = ma * zi0 + mb * zi1; }
        TB[i] = tnh(d * y) * nd;
      }
      if (Math.abs(zr0) + Math.abs(zi0) < 1e-15) { zr0 = 0; zi0 = 0; } if (Math.abs(zr1) + Math.abs(zi1) < 1e-15) { zr1 = 0; zi1 = 0; }
      this.zr[0] = zr0; this.zi[0] = zi0; this.zr[1] = zr1; this.zi[1] = zi1; this.exN = exN;
    } else if (fam === FAM_F) {
      const ph = this.ph, r = this.rat; let pc = ph[0], pm = ph[1], pm2 = ph[2], pc2 = ph[3], I = this.I; const dI = this.dI;
      let fb1 = this.fb1, fb2 = this.fb2;
      for (let i = 0; i < n; i++) {
        let x;
        if (s === 1) x = sinc(pc + I * sinc(pm));
        else if (s === 2) { const m = sinc(pm + 0.3 * (fb1 + fb2)); fb2 = fb1; fb1 = m; x = sinc(pc + I * m); }
        else if (s === 3) { const m2 = sinc(pm2), m1 = sinc(pm + 0.5 * I * m2); x = sinc(pc + I * m1); }
        else { const m = sinc(pm); x = (sinc(pc + I * m) + 0.5 * sinc(pc2 + I * m)) * 0.6666666666666666; }
        TB[i] = x;
        pc += inc; pm += inc * r; if (pc >= 1) pc -= 1; if (pm >= 1) pm -= Math.floor(pm);
        if (s === 3) { pm2 += inc * r * 1.41; if (pm2 >= 1) pm2 -= Math.floor(pm2); }
        if (s === 4) { pc2 += inc * 1.5; if (pc2 >= 1) pc2 -= 1; }
        inc += dinc; I += dI;
      }
      ph[0] = pc; ph[1] = pm; ph[2] = pm2; ph[3] = pc2; this.I = I; this.fb1 = fb1; this.fb2 = fb2;
    } else if (fam === FAM_R) {
      const ph = this.ph, r = this.rat; let pc = ph[0], pm = ph[1];
      if (s === 1) { let m = this.m; const dm = this.dm;
        for (let i = 0; i < n; i++) { TB[i] = sinc(pc) * ((1 - m) + m * sinc(pm)); pc += inc; pm += inc * r; if (pc >= 1) pc -= 1; if (pm >= 1) pm -= Math.floor(pm); inc += dinc; m += dm; }
        this.m = m;
      } else {
        let z1 = this.s1, z2 = this.s2; const a1 = this.la1, a2 = this.la2, a3 = this.la3;
        for (let i = 0; i < n; i++) {
          let x = sq(pc, inc) * sq(pm, inc * r);
          const v3 = x - z2, v1 = a1 * z1 + a2 * v3, v2 = z2 + a2 * z1 + a3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; x = v2;
          TB[i] = x; pc += inc; pm += inc * r; if (pc >= 1) pc -= 1; if (pm >= 1) pm -= Math.floor(pm); inc += dinc;
        }
        this.s1 = z1; this.s2 = z2;
      }
      ph[0] = pc; ph[1] = pm;
    } else if (fam === FAM_C2 || fam === FAM_C3) {
      const ph = this.ph, k = this.kap, R = fam === FAM_C2 ? C2R : C3R, raw = this.E.tap === 1;
      let z1 = this.s1, z2 = this.s2, h1 = this.s3, h2 = this.s4, l1 = this.s5, l2 = this.s6;
      for (let i = 0; i < n; i++) {
        let x = 0; const ik = inc * k;
        if (fam === FAM_C2) { for (let j = 0; j < 6; j++) { const d = ik * R[j]; x += sq(ph[j], d); let p = ph[j] + d; if (p >= 1) p -= Math.floor(p); ph[j] = p; } x *= 1 / 6; }
        else { for (let j = 0; j < 6; j += 2) { const d0 = ik * R[j], d1 = ik * R[j + 1]; x += sq(ph[j], d0) * sq(ph[j + 1], d1); let p = ph[j] + d0; if (p >= 1) p -= Math.floor(p); ph[j] = p; p = ph[j + 1] + d1; if (p >= 1) p -= Math.floor(p); ph[j + 1] = p; } x *= 1 / 3; }
        if (!raw) {
          if (fam === FAM_C2) { const v3 = x - z2, v1 = this.ba1 * z1 + this.ba2 * v3, v2 = z2 + this.ba2 * z1 + this.ba3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; x = this.bk * v1 * 2.5; }
          { const v3 = x - h2, v1 = this.ha1 * h1 + this.ha2 * v3, v2 = h2 + this.ha2 * h1 + this.ha3 * v3; h1 = 2 * v1 - h1; h2 = 2 * v2 - h2; x = x - this.hk * v1 - v2; }
          { const v3 = x - l2, v1 = this.la1 * l1 + this.la2 * v3, v2 = l2 + this.la2 * l1 + this.la3 * v3; l1 = 2 * v1 - l1; l2 = 2 * v2 - l2; x = v2; }
        }
        TB[i] = x; inc += dinc;
      }
      this.s1 = z1; this.s2 = z2; this.s3 = h1; this.s4 = h2; this.s5 = l1; this.s6 = l2;
    } else {
      // modal bank
      for (let i = 0; i < n; i++) TB[i] = 0;
      const nm = this.nm, zr = this.zr, zi = this.zi, cr = this.cr, ci = this.ci;
      let live = 0;
      for (let k = 0; k < nm; k++) {
        let a = zr[k], b = zi[k]; const c = cr[k], d = ci[k];
        if (a === 0 && b === 0) continue;
        for (let i = 0; i < n; i++) { const t = a * c - b * d; b = a * d + b * c; a = t; TB[i] += b; }
        if ((a < 0 ? -a : a) + (b < 0 ? -b : b) < 1e-15) { a = 0; b = 0; } else live++;
        zr[k] = a; zi[k] = b;
      }
      if (fam === FAM_D && this.snr) {   // d5: snare wires = own noise, band-pass 5 kHz, follows the rectified head output
        const E = this.E, ch = this.ch; let ef = this.ef, z1 = this.n4, z2 = this.n5; const k = this.efk, a1 = this.sa1, a2 = this.sa2, a3 = this.sa3;
        let st = E.nz[ch];
        for (let i = 0; i < n; i++) {
          const y = TB[i]; ef += ((y < 0 ? -y : y) - ef) * k;
          st ^= st << 13; st >>>= 0; st ^= st >>> 17; st ^= st << 5; st >>>= 0;
          const w = (st / 2147483648 - 1) * 1.7320508075688772;
          const v3 = w - z2, v1 = a1 * z1 + a2 * v3, v2 = z2 + a2 * z1 + a3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2;
          TB[i] = y + v1 * ef * 0.398 * 1.5;
        }
        E.nz[ch] = st; this.ef = ef; this.n4 = z1; this.n5 = z2;
      }
      if (fam === FAM_C1) {
        let h1 = this.s3, h2 = this.s4; const g = this.hpg, kq = this.hpk, a1 = 1 / (1 + g * (g + kq)), a2 = g * a1, a3 = g * a2;
        for (let i = 0; i < n; i++) { const x = TB[i], v3 = x - h2, v1 = a1 * h1 + a2 * v3, v2 = h2 + a2 * h1 + a3 * v3; h1 = 2 * v1 - h1; h2 = 2 * v2 - h2; TB[i] = x - kq * v1 - v2; }
        this.s3 = h1; this.s4 = h2;
      }
      this.live = live;
    }
    this.inc = inc;
  }
  noise(NB, n) {
    const E = this.E, ch = this.ch; let st = E.nz[ch];
    let z1 = this.n1, z2 = this.n2, y1 = this.n3, y2 = this.s7, lp = this.s8;
    const a1 = this.na1, a2 = this.na2, a3 = this.na3, k = this.nk, b1 = this.nb1, b2 = this.nb2, b3 = this.nb3, k2 = this.nk2, ty = this.ntyp;
    for (let i = 0; i < n; i++) {
      st ^= st << 13; st >>>= 0; st ^= st >>> 17; st ^= st << 5; st >>>= 0;
      const x = st / 2147483648 - 1;
      const v3 = x - z2, v1 = a1 * z1 + a2 * v3, v2 = z2 + a2 * z1 + a3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2;
      let y;
      if (ty === 0) y = v2;
      else if (ty === 2) y = k * v1;
      else if (ty === 4) y = x - k * v1 - v2;
      else {
        const u = ty === 1 ? v2 : ty === 3 ? k * v1 : x - k * v1 - v2;
        const w3 = u - y2, w1 = b1 * y1 + b2 * w3, w2 = y2 + b2 * y1 + b3 * w3; y1 = 2 * w1 - y1; y2 = 2 * w2 - y2;
        y = ty === 1 ? w2 : ty === 3 ? k2 * w1 : u - k2 * w1 - w2;
        if (ty === 6) { const v = (y - lp) * this.nlp, o = v + lp; lp = o + v; y = o; }   // TPT one-pole low-pass
      }
      NB[i] = y;
    }
    E.nz[ch] = st; this.n1 = z1; this.n2 = z2; this.n3 = y1; this.s7 = y2; this.s8 = lp;
  }
}
function hard(f, tc) { const u = PI * f * tc; return 1 / (1 + u * u); }
function blep(t, dt) { if (dt <= 0) return 0; if (t < dt) { const x = t / dt; return x + x - x * x - 1; } if (t > 1 - dt) { const x = (t - 1) / dt; return x * x + x + x + 1; } return 0; }
function sq(t, dt) { let y = t < 0.5 ? 1 : -1; y += blep(t, dt); let u = t + 0.5; if (u >= 1) u -= 1; y -= blep(u, dt); return y; }
function pulse(t, dt, w) { let y = t < w ? 1 : -1; y += blep(t, dt); let u = t + 1 - w; if (u >= 1) u -= 1; y -= blep(u, dt); return y; }
/* ---------- channel state (effects, smoothers) ---------- */
class Chan {
  constructor(eng, i) {
    this.i = i; this.P = new Prog(); this.has = false;
    this.v = [new Voice(eng, i), new Voice(eng, i)];
    this.buf = new Float64Array(128);
    this.dl = new Float32Array(p2(Math.ceil(1.2 * SR) + 4)); this.dm = this.dl.length - 1;
    this.reset();
  }
  reset() {
    this.tlT = 0; this.nlT = 0; this.clT = 0; this.tlS = 0; this.nlS = 0; this.clS = 0;
    this.dw = 0; this.dlyE = 0; this.dlS = 0; this.dl.fill(0);
    this.eqx1 = 0; this.eqx2 = 0; this.eqy1 = 0; this.eqy2 = 0; this.eqOn = false;
    this.dA = 0; this.adaa = 0; this.saAcc = 0; this.saH = 0; this.rnPh = 0; this.dcx = 0; this.dcy = 0;
    this.act = false; this.bad = false;
    for (const v of this.v) v.reset0();
  }
}
/* ---------- the processor ---------- */
class MdProc extends AudioWorkletProcessor {
  constructor() {
    super();
    this.smK = 1 - Math.exp(-CR / (0.01 * SR));       // tau 10 ms per 16 samples
    this.chs = []; for (let i = 0; i < NCH; i++) this.chs.push(new Chan(this, i));
    this.nz = new Uint32Array(NCH);
    this.mskT = new Float64Array(NCH); this.mskN = new Float64Array(NCH); this.mskC = new Float64Array(NCH);
    this.soloCh = -1; this.soloP = 0; this.lim = 0; this.tap = 0;
    // hit queue (preallocated)
    this.QN = 512; this.q = []; for (let i = 0; i < this.QN; i++) this.q.push({fr: 0, ch: 0, v: 0, acc: 0, tune: 0, dec: 1}); this.qn = 0;
    this.late = 0; this.lateSent = 0;
    this.stopFr = -1; this.stopTau = 0.02; this.pan = 0;
    // kit
    this.K = {rvT: 1, rvC: 0, dlR: 50, dlM: 0, dlB: 60, dlF: 0};
    this.dlyT = dlyTime(this.K); this.dlyS = this.dlyT * SR; this.dlyFb = 0;
    // hall (Dattorro tank like dirigent-hall, own instance)
    this.hallInit();
    this.hin = new Float64Array(128); this.dT = new Float64Array(128); this.dlySt = 1; this.hL = new Float64Array(128); this.hR = new Float64Array(128);
    this.busy = 0; this.busyN = 0; this.hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
    this.resetAll();
    this.port.onmessage = e => this.onMsg(e.data);
  }
  hallInit() {
    const r = SR / DSR, X = 32; this.hr = r;
    this.hdIn = [142, 107, 379, 277].map(n => Math.round(n * r));
    this.hins = this.hdIn.map(n => { const b = new Float32Array(p2(n + 4)); return {b, m: b.length - 1}; });
    this.hbase = [672, 4453, 1800, 3720, 908, 4217, 2656, 3163];
    this.hL8 = this.hbase.map(n => { const b = new Float32Array(p2(Math.ceil((n * MAXS + X + 2) * r) + 4)); return {b, m: b.length - 1}; });
    const pdN = p2(Math.ceil(0.08 * SR)); this.pdb = new Float32Array(pdN); this.pdm = pdN - 1;
    this.tl7 = new Int32Array(7); this.tr7 = new Int32Array(7);
  }
  hallReset() {
    for (const l of this.hins) l.b.fill(0); for (const l of this.hL8) l.b.fill(0); this.pdb.fill(0);
    this.hw = 1 << 20; this.hlpL = 0; this.hlpR = 0; this.hhpL = 0; this.hhpR = 0; this.hs = 0; this.hc = 1; this.hsleep = 1e9;
    const R = RV[this.K.rvT];
    this.hsize = R.sz; this.hrt = R.rt; this.hdamp = R.dp; this.hpd = R.pd * 0.001 * SR; this.hmod = R.md;
    this.erCur = this.K.rvT; this.erOld = -1; this.erX = 1;
    this.cz1 = 0; this.cz2 = 0; this.colC = this.K.rvC;
  }
  resetAll() {
    for (let i = 0; i < NCH; i++) { this.chs[i].reset(); this.nz[i] = (0x9E3779B9 ^ Math.imul(i + 1, 2654435761)) >>> 0 || 1; }
    for (let i = 0; i < NCH; i++) { const C = this.chs[i]; this.levels(C); C.tlS = C.tlT; C.nlS = C.nlT; C.clS = C.clT; this.fxSnap(C); }
    this.qn = 0; this.stopFr = -1; this.pan = 0; this.dlyT = dlyTime(this.K); this.dlyS = this.dlyT * SR; this.dlyFb = 0.97 * this.K.dlF / 20;
    this.hallReset();
  }
  // targets of the live part levels (with SOLO PART masks)
  levels(C) {
    const P = C.P, i = C.i, so = this.soloCh;
    let mt = 1, mn = 1, mc = 1;
    if (so >= 0) { if (so !== i) { mt = mn = mc = 0; } else if (this.soloP === 1) { mn = mc = 0; } else if (this.soloP === 2) { mt = mc = 0; } else if (this.soloP === 3) { mt = mn = 0; } }
    this.mskT[i] = 1; this.mskN[i] = 1; this.mskC[i] = 1;
    C.tlT = Glv(P.tlv) * mt; C.nlT = Glv(P.nlv) * mn; C.clT = mc;
    C.tlS = C.tlS; // smoothing happens per voice
  }
  fxTargets(C) {
    const P = C.P;
    C.tLvl = Glv(P.lvl); const x = (P.pan + 9) / 18 * PI / 2; C.tPl = Math.cos(x); C.tPr = Math.sin(x);
    C.tRv = P.rvb / 50; C.tDl = P.dly / 50; C.tDst = P.dst; C.tEqg = P.eqg * 2.6666666666666665; C.tEqf = fEq(P.eqf);
  }
  fxSnap(C) { this.fxTargets(C); C.sLvl = C.tLvl; C.sPl = C.tPl; C.sPr = C.tPr; C.sRv = C.tRv; C.sDl = C.tDl; C.sDst = C.tDst; C.sEqg = C.tEqg; C.sEqf = C.tEqf; C.eqOn = C.sEqg !== 0; this.eqCoef(C); C.b0 = C.nb0; C.b1 = C.nb1; C.b2 = C.nb2; C.a1 = C.na1; C.a2 = C.na2; }
  eqCoef(C) {
    const A = Math.pow(10, C.sEqg / 40), w = TAU * Math.min(C.sEqf, NYQ) * ISR, cs = Math.cos(w), al = Math.sin(w) / 2;   // Q 1
    const a0 = 1 + al / A; C.nb0 = (1 + al * A) / a0; C.nb1 = -2 * cs / a0; C.nb2 = (1 - al * A) / a0; C.na1 = -2 * cs / a0; C.na2 = (1 - al / A) / a0;
  }
  onMsg(m) {
    if (!m || !m.t) return;
    switch (m.t) {
      case 'ch': { const i = m.ch | 0; if (i < 0 || i >= NCH) return; const C = this.chs[i]; C.P.set(m.p); const first = !C.has; C.has = true; this.levels(C); if (first) { C.tlS = C.tlT; C.nlS = C.nlT; C.clS = C.clT; this.fxSnap(C); } else this.fxTargets(C); break; }
      case 'kit': { const p = m.p || {}, K = this.K;
        K.rvT = idxOf(RVTS, p.rvT, 1); K.rvC = Math.round(clampN(p.rvC, -9, 9, 0)); K.dlR = Math.round(clampN(p.dlR, 0, 99, 50)); K.dlM = p.dlM === 'b' ? 1 : 0;
        K.dlB = Math.round(clampN(p.dlB, 0, 470, 60)); K.dlF = Math.round(clampN(p.dlF, 0, 20, 0));
        this.dlyT = dlyTime(K); this.dlyFb = 0.97 * K.dlF / 20; this.dlySt = Math.max(1e-9, Math.abs(this.dlyT * SR - this.dlyS) / (0.05 * SR));
        if (K.rvT !== this.erCur) { this.erOld = this.erCur; this.erCur = K.rvT; this.erX = 0; }
        break; }
      case 'hit': { const L = m.list || []; for (const h of L) this.enqueue(h); break; }
      case 'mute': { const s = m.solo; this.soloCh = s ? (m.ch | 0) : -1; this.soloP = s === 'tone' ? 1 : s === 'noise' ? 2 : s === 'click' ? 3 : 0; for (const C of this.chs) this.levels(C); break; }
      case 'stop': { this.stopFr = Math.round((+m.at || 0) * SR); this.stopTau = Math.max(0.001, +m.tau || 0.02); break; }
      case 'panic': { this.qn = 0; this.pan = Math.max(1, Math.round(0.01 * SR)); this.panN = this.pan; break; }
      case 'reset': { this.resetAll(); break; }
      case 'lim': { this.lim = Math.max(0, Math.min(3, m.s | 0)); break; }
      case 'test': {
        if (m.tap != null) this.tap = m.tap | 0;
        if (m.q === 'modes') { const r = []; for (const C of this.chs) { let n = 0; for (const v of C.v) if (v.on && (v.modal)) n = Math.max(n, v.nm); r.push(n); } this.port.postMessage({t: 'test', modes: r}); }
        if (m.q === 'state') this.port.postMessage({t: 'test', state: {late: this.late, qn: this.qn, lim: this.lim, voices: this.chs.map(C => C.v.filter(v => v.on).length), hsleep: this.hsleep}});
        break; }
    }
  }
  enqueue(h) {
    const ch = h.ch | 0; if (ch < 0 || ch >= NCH || this.qn >= this.QN) return;
    const fr = Math.round((+h.at || 0) * SR);
    // insertion keeps the queue sorted by frame (stable)
    let j = this.qn; const q = this.q, rec = q[j];
    while (j > 0 && q[j - 1].fr > fr) { q[j] = q[j - 1]; j--; }
    q[j] = rec; this.qn++;
    rec.fr = fr; rec.ch = ch; rec.v = clampN(h.v, 0, 1, 0.8); rec.acc = clampN(h.acc, 0, 1, 0); rec.tune = clampN(h.tune, -48, 48, 0); rec.dec = clampN(h.dec, 0.05, 20, 1);
  }
  renderTo(C, s) { for (const v of C.v) if (v.on && v.bp < s) { v.render(C.buf, v.bp, s); v.bp = s; } }
  hit(h, off) {
    const C = this.chs[h.ch]; if (!C.has) return;
    this.renderTo(C, off);
    // mono group: the other channels of the group fall silent (3 ms)
    if (C.P.mono) for (const D of this.chs) if (D !== C && D.has && D.P.mono) { this.renderTo(D, off); for (const v of D.v) if (v.on && v.fadeSt === 0) v.fadeSt = 1 / (0.003 * SR); }
    // a new hit takes over; the old voice fades in 3 ms; the free (or quieter) slot plays the new hit
    let nv = null;
    for (const v of C.v) { if (v.on && v.fadeSt === 0) v.fadeSt = 1 / (0.003 * SR); }
    for (const v of C.v) if (!v.on) { nv = v; break; }
    if (!nv) nv = C.v[0].fade <= C.v[1].fade ? C.v[0] : C.v[1];
    nv.start(C.P, h.v, h.acc, h.tune, h.dec); nv.bp = off;
    if (nv.ctab) C.act = true;
    C.act = true;
  }
  process(inputs, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0], N = L.length;
    const t0 = this.hasPerf ? performance.now() : 0;
    L.fill(0); if (R !== L) R.fill(0);
    const fr0 = currentFrame, fr1 = fr0 + N;
    // stop: voices fade with tau, queued hits at or after it are dropped
    if (this.stopFr >= 0 && this.stopFr < fr1) {
      const k = Math.exp(-CR / (this.stopTau * SR));
      for (const C of this.chs) for (const v of C.v) if (v.on) v.stpK = k;
      let j = 0; for (let i = 0; i < this.qn; i++) { if (this.q[i].fr < this.stopFr) { const t = this.q[j]; this.q[j] = this.q[i]; this.q[i] = t; j++; } } this.qn = j;
      this.stopFr = -1;
    }
    let any = false;
    for (const C of this.chs) { if (C.act) { C.buf.fill(0); any = true; } for (const v of C.v) v.bp = 0; }
    // hits of this block, in time order
    let qi = 0;
    while (qi < this.qn && this.q[qi].fr < fr1) {
      const h = this.q[qi]; let off = h.fr - fr0;
      if (off < 0) { off = 0; this.late++; }
      const C = this.chs[h.ch]; if (C.has && !C.act) { C.buf.fill(0); C.act = true; any = true; }
      this.hit(h, off); qi++;
    }
    if (qi > 0) { const q = this.q; for (let i = qi; i < this.qn; i++) { const t = q[i - qi]; q[i - qi] = q[i]; q[i] = t; } this.qn -= qi; }
    if (!any && this.hsleep > 0.5 * SR / N && this.pan === 0) { this.account(t0, N); return true; }
    // echo time of this block (glides linearly to a new time within 50 ms)
    { const tg = this.dlyT * SR, st = this.dlySt, DT = this.dT; let d = this.dlyS;
      for (let i = 0; i < N; i++) { if (d !== tg) { if (d < tg) { d += st; if (d > tg) d = tg; } else { d -= st; if (d < tg) d = tg; } } DT[i] = d; }
      this.dlyS = d; }
    // voices
    const hin = this.hin; hin.fill(0);
    for (const C of this.chs) {
      if (!C.act) continue;
      let alive = false;
      for (const v of C.v) if (v.on) { v.render(C.buf, v.bp, N); if (v.on) alive = true; }
      this.chFx(C, L, R, hin, N);
      if (!alive && C.dlyE < 1e-10) C.act = false;
    }
    // hall
    this.hall(hin, L, R, N);
    // panic: 10 ms fade, then everything cleared
    if (this.pan > 0) {
      for (let i = 0; i < N; i++) { const g = this.pan > 0 ? this.pan / this.panN : 0; L[i] *= g; if (R !== L) R[i] *= g; if (this.pan > 0) this.pan--; }
      if (this.pan === 0) { for (const C of this.chs) { for (const v of C.v) v.reset0(); C.dl.fill(0); C.dlyE = 0; C.act = false; C.eqx1 = C.eqx2 = C.eqy1 = C.eqy2 = 0; } this.hallReset(); }
    }
    this.account(t0, N);
    return true;
  }
  account(t0, N) {
    if (this.hasPerf) this.busy += performance.now() - t0;
    this.busyN += N;
    if (this.busyN >= SR) {
      const ms = this.busyN / SR * 1000; let nv = 0; for (const C of this.chs) for (const v of C.v) if (v.on) nv++;
      this.port.postMessage({t: 'load', v: this.busy / ms, nv});
      if (this.late !== this.lateSent) { this.lateSent = this.late; this.port.postMessage({t: 'late', n: this.late}); }
      this.busy = 0; this.busyN = 0;
    }
  }
  chFx(C, L, R, hin, N) {
    const b = C.buf, k = this.smK;
    // NaN guard (once per block): a channel with NaN / Inf is muted and re-initialised
    let sum = 0; for (let i = 0; i < N; i += 8) sum += b[i];
    if (!(sum - sum === 0)) { b.fill(0); for (const v of C.v) v.reset0(); C.dl.fill(0); C.eqx1 = C.eqx2 = C.eqy1 = C.eqy2 = 0; C.adaa = 0; C.dlyE = 0; if (!C.bad) { C.bad = true; this.port.postMessage({t: 'err', ch: C.i, msg: 'NaN'}); } return; }
    // ---- DIST (amount smoothed; < 1 crossfades with the dry signal, 0 = bypassed bit-exact) ----
    if (C.tDst > 0 || C.sDst > 1e-4) {
      const ty = C.P.dty;
      for (let j = 0; j < N; j += CR) {
        const d0 = C.sDst; C.sDst += (C.tDst - C.sDst) * k; if (C.tDst === 0 && C.sDst < 1e-4) C.sDst = 0; const d1 = C.sDst, dd = (d1 - d0) / CR;
        let D = d0;
        const p0 = ty === 0 ? Math.pow(10, 1.5 * d0 / 50) : ty === 1 ? 48000 * Math.pow(400 / 48000, d0 / 50) * ISR : Math.pow(5000, d0 / 50) * ISR;
        const p1 = ty === 0 ? Math.pow(10, 1.5 * d1 / 50) : ty === 1 ? 48000 * Math.pow(400 / 48000, d1 / 50) * ISR : Math.pow(5000, d1 / 50) * ISR;
        let pv = p0; const dp = (p1 - p0) / CR;
        for (let i = j; i < j + CR; i++) {
          const x = b[i]; let y;
          if (ty === 0) {
            const g = pv, u = g * x + 0.2, u0 = C.adaa;
            const du = u - u0; let tn;
            if (du > 1e-5 || du < -1e-5) tn = (lcosh(u) - lcosh(u0)) / du; else tn = tnhx(0.5 * (u + u0));
            C.adaa = u; y = (tn - 0.197375320224904) / (1 + 0.04 * D);
            // DC blocker for the bias (5 Hz)
            const dc = y - C.dcx + 0.99935 * C.dcy; C.dcx = y; C.dcy = dc; y = dc;
          } else if (ty === 1) {
            C.saAcc += pv; if (C.saAcc >= 1) { C.saAcc -= Math.floor(C.saAcc); C.saH = x; } y = C.saH;
          } else {
            y = x * sinc(C.rnPh); C.rnPh += pv; if (C.rnPh >= 1) C.rnPh -= 1;
          }
          const w = D < 1 ? D : 1; b[i] = x + (y - x) * w; D += dd; pv += dp;
        }
      }
    } else { C.adaa = 0.2; C.dcx = 0; C.dcy = 0; }
    // ---- EQ (peaking, Q 1; coefficients interpolated over 16 samples; GAIN 0 = bypassed bit-exact) ----
    if (C.tEqg !== 0 || C.sEqg !== 0) {
      for (let j = 0; j < N; j += CR) {
        C.sEqg += (C.tEqg - C.sEqg) * k; C.sEqf += (C.tEqf - C.sEqf) * k;
        if (C.tEqg === 0 && Math.abs(C.sEqg) < 0.005) C.sEqg = 0;
        this.eqCoef(C);
        const db0 = (C.nb0 - C.b0) / CR, db1 = (C.nb1 - C.b1) / CR, db2 = (C.nb2 - C.b2) / CR, da1 = (C.na1 - C.a1) / CR, da2 = (C.na2 - C.a2) / CR;
        let b0 = C.b0, b1 = C.b1, b2 = C.b2, a1 = C.a1, a2 = C.a2, x1 = C.eqx1, x2 = C.eqx2, y1 = C.eqy1, y2 = C.eqy2;
        for (let i = j; i < j + CR; i++) {
          b0 += db0; b1 += db1; b2 += db2; a1 += da1; a2 += da2;
          const x = b[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y < 1e-15 && y > -1e-15 ? 0 : y; b[i] = y;
        }
        C.b0 = C.nb0; C.b1 = C.nb1; C.b2 = C.nb2; C.a1 = C.na1; C.a2 = C.na2; C.eqx1 = x1; C.eqx2 = x2; C.eqy1 = y1; C.eqy2 = y2;
      }
      if (C.sEqg === 0) { C.eqx1 = C.eqx2 = C.eqy1 = C.eqy2 = 0; }
    } else { C.sEqf = C.tEqf; this.eqCoef(C); C.b0 = C.nb0; C.b1 = C.nb1; C.b2 = C.nb2; C.a1 = C.na1; C.a2 = C.na2; }
    // ---- ECHO (own line per channel; time and feedback of the kit; time glides 50 ms) + dry/pan/level + hall send ----
    const dl = C.dl, dm = C.dm, useD = C.tDl > 0 || C.sDl > 1e-6 || C.dlyE > 1e-10;
    let w = C.dw, e2 = 0;
    const fb = this.dlyFb, DT = this.dT;
    for (let j = 0; j < N; j += CR) {
      const l0 = C.sLvl, pl0 = C.sPl, pr0 = C.sPr, rv0 = C.sRv, dl0 = C.sDl;
      C.sLvl += (C.tLvl - C.sLvl) * k; C.sPl += (C.tPl - C.sPl) * k; C.sPr += (C.tPr - C.sPr) * k; C.sRv += (C.tRv - C.sRv) * k; C.sDl += (C.tDl - C.sDl) * k;
      if (C.tDl === 0 && C.sDl < 1e-7) C.sDl = 0;
      const dL = (C.sLvl - l0) / CR, dPl = (C.sPl - pl0) / CR, dPr = (C.sPr - pr0) / CR, dRv = (C.sRv - rv0) / CR, dDl = (C.sDl - dl0) / CR;
      let lv = l0, pl = pl0, pr = pr0, rv = rv0, dd = dl0;
      for (let i = j; i < j + CR; i++) {
        let y = b[i];
        if (useD) {
          // delay time glides linearly to its target over 50 ms of the full range
          const e = rdl(dl, dm, w - DT[i]);
          let wv = y + fb * e; if (wv < 1e-18 && wv > -1e-18) wv = 0; dl[w & dm] = wv; w++;
          e2 += e * e;
          y = y * (1 - dd) + e * dd;
        }
        const g = y * lv, dry = g * (1 - rv);
        L[i] += dry * pl; R[i] += dry * pr; hin[i] += g * rv;
        lv += dL; pl += dPl; pr += dPr; rv += dRv; dd += dDl;
      }
    }
    if (useD) { C.dw = w & 0x3fffffff; C.dlyE = e2 / N; } else C.dlyE = 0;
  }
  hall(hin, L, R, N) {
    const K = this.K, Rv = RV[K.rvT];
    // input peak (sleep when silent for 0.5 s)
    let pk = 0; for (let i = 0; i < N; i++) { const a = hin[i] < 0 ? -hin[i] : hin[i]; if (a > pk) pk = a; }
    if (pk === 0 && this.hsleep > 0.5 * SR / N) return;
    // type parameters glide
    const gk = this.smK * 8 > 1 ? 1 : this.smK * 8;
    this.hrt += (Rv.rt - this.hrt) * gk; this.hdamp += (Rv.dp - this.hdamp) * gk; this.hmod += (Rv.md - this.hmod) * gk;
    this.hsize += Math.max(-0.002, Math.min(0.002, Rv.sz - this.hsize));
    const pdT = Rv.pd * 0.001 * SR; this.hpd += (pdT - this.hpd) * gk;
    // COLOR (input): -c low-pass 12 dB 20 kHz * (1.5k/20k)^(|c|/9), +c high-pass 12 dB 20 Hz * 75^(c/9)
    const c = K.rvC; let ca1 = 0, ca2 = 0, ca3 = 0;
    if (c !== 0) { const fc = c < 0 ? 20000 * Math.pow(1500 / 20000, -c / 9) : 20 * Math.pow(75, c / 9), g = tanf(fc), kq = 1.4142135623730951; ca1 = 1 / (1 + g * (g + kq)); ca2 = g * ca1; ca3 = g * ca2; }
    const r = this.hr, S = this.hsize * r, B = this.hbase;
    const lap1 = B[0] * S, ld1 = B[1] * S, lap2 = B[2] * S, ld2 = B[3] * S, lap3 = B[4] * S, ld3 = B[5] * S, lap4 = B[6] * S, ld4 = B[7] * S;
    const kd = -3 / (SR * this.hrt);
    const gA1 = Math.pow(10, kd * (lap1 + ld1)), gB1 = Math.pow(10, kd * (lap2 + ld2)), gA2 = Math.pow(10, kd * (lap3 + ld3)), gB2 = Math.pow(10, kd * (lap4 + ld4));
    const dampA = 1 - Math.exp(-TAU * Math.min(this.hdamp, NYQ) / SR), lowA = 1 - Math.exp(-TAU * 40 / SR);
    const mod = this.hmod, exc = mod * 16 * r, lfoW = TAU * (0.35 + 0.65 * mod) / SR;
    const tL = this.tl7, tR = this.tr7;
    for (let k = 0; k < 7; k++) { tL[k] = Math.round(HTL[k] * S); tR[k] = Math.round(HTR[k] * S); }
    const I = this.hins, n0 = this.hdIn[0], n1 = this.hdIn[1], n2 = this.hdIn[2], n3 = this.hdIn[3];
    const H = this.hL8, AP1 = H[0].b, D1 = H[1].b, AP2 = H[2].b, D2 = H[3].b, AP3 = H[4].b, D3 = H[5].b, AP4 = H[6].b, D4 = H[7].b;
    const mA1 = H[0].m, mD1 = H[1].m, mA2 = H[2].m, mD2 = H[3].m, mA3 = H[4].m, mD3 = H[5].m, mA4 = H[6].m, mD4 = H[7].m;
    const pdb = this.pdb, pdm = this.pdm;
    let w = this.hw, lpL = this.hlpL, lpR = this.hlpR, hpL = this.hhpL, hpR = this.hhpR, s = this.hs, cc = this.hc, z1 = this.cz1, z2 = this.cz2;
    // early reflections (current pattern, old one fades over 40 ms)
    const erOn = this.lim < 2, Pc = erOn ? ERP[RV[this.erCur].er] : null, Po = erOn && this.erOld >= 0 && this.erX < 1 ? ERP[RV[this.erOld].er] : null, erK = 1 / (0.04 * SR);
    const tap2 = this.tap === 2;
    let en = 0;
    for (let i = 0; i < N; i++) {
      let x = hin[i];
      if (c !== 0) { const v3 = x - z2, v1 = ca1 * z1 + ca2 * v3, v2 = z2 + ca2 * z1 + ca3 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; x = c < 0 ? v2 : x - 1.4142135623730951 * v1 - v2; }
      if (tap2) { L[i] = x; R[i] = x; continue; }
      pdb[w & pdm] = x;
      let erL = 0, erR = 0;
      if (Pc || Po) {
        const xf = this.erX; if (xf < 1) this.erX = Math.min(1, xf + erK);
        if (Pc) for (let j = 0; j < Pc.length; j++) { const e = Pc[j], v = pdb[(w - Math.round(e[0] * 0.001 * SR)) & pdm] * xf; erL += v * e[1]; erR += v * e[2]; }
        if (Po) for (let j = 0; j < Po.length; j++) { const e = Po[j], v = pdb[(w - Math.round(e[0] * 0.001 * SR)) & pdm] * (1 - xf); erL += v * e[1]; erR += v * e[2]; }
      }
      x = this.hpd >= 1 ? rdl(pdb, pdm, w - this.hpd) : x;
      s += lfoW * cc; cc -= lfoW * s;
      let d, v;
      d = I[0].b[(w - n0) & I[0].m]; v = x - 0.75 * d; I[0].b[w & I[0].m] = v; x = d + 0.75 * v;
      d = I[1].b[(w - n1) & I[1].m]; v = x - 0.75 * d; I[1].b[w & I[1].m] = v; x = d + 0.75 * v;
      d = I[2].b[(w - n2) & I[2].m]; v = x - 0.625 * d; I[2].b[w & I[2].m] = v; x = d + 0.625 * v;
      d = I[3].b[(w - n3) & I[3].m]; v = x - 0.625 * d; I[3].b[w & I[3].m] = v; x = d + 0.625 * v;
      x += (w & 1) ? 1e-20 : -1e-20;
      const fbR = rdl(D4, mD4, w - ld4) * gB2, fbL = rdl(D2, mD2, w - ld2) * gB1;
      let a = x + fbR;
      d = rdl(AP1, mA1, w - (lap1 + exc * (1 + s))); v = a + 0.7 * d; AP1[w & mA1] = v; a = d - 0.7 * v;
      D1[w & mD1] = a; a = rdl(D1, mD1, w - ld1) * gA1;
      lpL += dampA * (a - lpL); a = lpL; hpL += lowA * (a - hpL); a -= hpL;
      d = rdl(AP2, mA2, w - lap2); v = a - 0.5 * d; AP2[w & mA2] = v; a = d + 0.5 * v; D2[w & mD2] = a;
      let bb = x + fbL;
      d = rdl(AP3, mA3, w - (lap3 + exc * (1 + cc))); v = bb + 0.7 * d; AP3[w & mA3] = v; bb = d - 0.7 * v;
      D3[w & mD3] = bb; bb = rdl(D3, mD3, w - ld3) * gA2;
      lpR += dampA * (bb - lpR); bb = lpR; hpR += lowA * (bb - hpR); bb -= hpR;
      d = rdl(AP4, mA4, w - lap4); v = bb - 0.5 * d; AP4[w & mA4] = v; bb = d + 0.5 * v; D4[w & mD4] = bb;
      const yl = D3[(w - tL[0]) & mD3] + D3[(w - tL[1]) & mD3] - AP4[(w - tL[2]) & mA4] + D4[(w - tL[3]) & mD4] - D1[(w - tL[4]) & mD1] - AP2[(w - tL[5]) & mA2] - D2[(w - tL[6]) & mD2];
      const yr = D1[(w - tR[0]) & mD1] + D1[(w - tR[1]) & mD1] - AP2[(w - tR[2]) & mA2] + D2[(w - tR[3]) & mD2] - D3[(w - tR[4]) & mD3] - AP4[(w - tR[5]) & mA4] - D4[(w - tR[6]) & mD4];
      const ol = (yl + yr) * 0.3 + (yl - yr) * 0.3 + erL, or = (yl + yr) * 0.3 - (yl - yr) * 0.3 + erR;
      L[i] += ol; R[i] += or; en += ol * ol + or * or;
      w++;
    }
    if (w > 0x3f000000) w -= 0x20000000;
    this.hw = w; this.hlpL = lpL; this.hlpR = lpR; this.hhpL = hpL; this.hhpR = hpR; this.cz1 = z1; this.cz2 = z2;
    const m = Math.sqrt(s * s + cc * cc); this.hs = s / m; this.hc = cc / m;
    this.hsleep = pk === 0 && en < 1e-20 * N ? this.hsleep + 1 : 0;
  }
}
// log(cosh(u)) without overflow, tanh
function lcosh(u) { const a = u < 0 ? -u : u; return a + Math.log1p(Math.exp(-2 * a)) - 0.6931471805599453; }
function tnhx(u) { return Math.tanh(u); }
registerProcessor('synq-md', MdProc);
