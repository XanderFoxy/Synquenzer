// Independent repro: live key (worklet synq-stimme) with vibrato that is already present at note onset / runs through legato.
// Own voice generator at 48 kHz (no upsampling), own scoring (time-weighted, per note), base 4.5.1 vs new 4.5.2.
import fs from 'fs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/G-P1b-gruppe-fix.html', new: SCR + 'dirigent-wt/index.html'};
const wkSrc = f => { const h = fs.readFileSync(f, 'utf8'), A = 'const ST_WK = `', a = h.indexOf(A) + A.length, E = "registerProcessor('synq-stimme', SynqStimme);", b = h.indexOf(E, a) + E.length; return h.slice(a, b); };
const SRC = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, wkSrc(f)]));
const SR = 48000;
function runWk(src, x) {
  let C = null; const out = [];
  class AWP { constructor() { this.port = {postMessage: m => out.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AWP, (n, c) => { C = c; }, SR);
  const p = new C({processorOptions: {block: 4096, mpm: {src: 'voice', lock: false, bl: 0, bb: 0, lat: 0, unc: 50}}});
  const ref = new Float32Array(128), o = [[new Float32Array(128)]];
  for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [ref]], o); }
  return out.filter(m => m.lit !== undefined).map(m => [m.f / SR, m.lit]);
}
// voice: band-limited glottal-ish source (1/h^1.2), vowel /a/ formants, small breath noise
const FM = [[800, 80, 1], [1150, 90, 0.6], [2800, 140, 0.2], [3500, 200, 0.1]];
const fgain = f => { let g = 0.02; for (const [c, bw, a] of FM) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
let seed = 7; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
// pitch(t) in midi, amp(t)
function synth(dur, pitch, amp) {
  const n = Math.round(dur * SR), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, m = pitch(t), a = amp(t), f0 = 440 * 2 ** ((m - 69) / 12); ph += 2 * Math.PI * f0 / SR; if (ph > 2 * Math.PI * 1e4) ph -= 2 * Math.PI * 1e4;
    let v = 0; if (a > 0) for (let h = 1; h * f0 < 6500; h++) v += fgain(h * f0) / h ** 1.2 * Math.sin(h * ph);
    x[i] = 0.12 * a * v + (rnd() - 0.5) * 0.0006;
  }
  return x;
}
// legato phrase: notes [[midi, dur]], glide g (s), vibrato E cents at rate R Hz, phase phi, starting at t0 (continuous, no delay)
function phrase(notes, {g = 0.06, E = 80, R = 5.5, phi = 0, t0 = 0.3, jit = 0} = {}) {
  const on = []; let t = t0; for (const [m, d] of notes) { on.push([t, t + d, m]); t += d; } const tEnd = t;
  const base = tt => { for (let k = 0; k < on.length; k++) { const [a, b, m] = on[k];
      if (tt < b || k === on.length - 1) { if (k > 0 && tt < a + g / 2) { const pm = on[k - 1][2], u = (tt - (a - g / 2)) / g; return pm + (m - pm) * Math.max(0, Math.min(1, u)); }
        if (k < on.length - 1 && tt > b - g / 2) { const nm = on[k + 1][2], u = (tt - (b - g / 2)) / g; return m + (nm - m) * Math.max(0, Math.min(1, u)); } return m; } } return on[on.length - 1][2]; };
  // natural variant: rate and extent wander slowly
  let vph = phi, lastT = 0; const vib = tt => { const r = R * (1 + jit * 0.08 * Math.sin(2 * Math.PI * 0.7 * tt)), e = E * (1 + jit * 0.15 * Math.sin(2 * Math.PI * 0.43 * tt + 1)); vph += 2 * Math.PI * r * (tt - lastT); lastT = tt; return e / 100 * Math.sin(vph); };
  const pitch = tt => base(tt) + (tt >= t0 ? vib(tt) : 0);
  const amp = tt => tt < t0 ? 0 : tt < t0 + 0.015 ? (tt - t0) / 0.015 : tt < tEnd - 0.03 ? 1 : tt < tEnd ? (tEnd - tt) / 0.03 : 0;
  return {x: synth(tEnd + 0.5, pitch, amp), on, g};
}
// scoring per note: window [onset + 0.1, end - g/2]; time share of lit == sung, neighbour (±1), off (-1), other; sung ever lit; # key changes
function score(ev, on, g) {
  const res = [];
  for (const [a0, b0, m] of on) {
    const A = a0 + 0.1, B = b0 - g / 2; let cur = -1, tl = 0; const sh = {right: 0, nb: 0, off: 0, other: 0}; let changes = 0, ever = false, prev = null;
    const acc = (lo, hi, k) => { lo = Math.max(lo, A); hi = Math.min(hi, B); if (hi <= lo) return; const d = hi - lo; if (k === m) { sh.right += d; ever = true; } else if (k < 0) sh.off += d; else if (Math.abs(k - m) === 1) sh.nb += d; else sh.other += d; if (prev !== null && k !== prev) changes++; prev = k; };
    for (const [t, k] of ev) { acc(tl, t, cur); cur = k; tl = t; } acc(tl, B, cur);
    const W = B - A; res.push({m, right: sh.right / W, nb: sh.nb / W, off: sh.off / W, other: sh.other / W, ever, changes});
  }
  return res;
}
const agg = rs => { const n = rs.length, s = k => rs.reduce((q, r) => q + r[k], 0) / n; return {n, right: s('right'), nb: s('nb'), off: s('off'), other: s('other'), never: rs.filter(r => !r.ever).length, chg: s('changes')}; };
const fmt = q => `right ${(100 * q.right).toFixed(0).padStart(3)} %  neighbour ${(100 * q.nb).toFixed(0).padStart(3)} %  off ${(100 * q.off).toFixed(0).padStart(2)} %  never-right ${String(q.never).padStart(3)}/${q.n}  changes/note ${q.chg.toFixed(1)}`;

const mode = process.argv[2] || 'all';
const PH = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]];
if (mode === 'all' || mode === 'legato') {
  console.log('== legato phrase C D E F G F E D (0.6 s each, 60 ms glides), vibrato continuous from first onset, 8 random phases x 2 transpositions');
  for (const R of [5.5, 6.2]) for (const E of [30, 50, 65, 80, 100]) { const row = {};
    for (const k of ['base', 'new']) { const all = []; seed = 11;
      for (let s = 0; s < 8; s++) for (const tr of [-3, 4]) { const phi = 2 * Math.PI * s / 8 + 0.3; const ns = PH.map(([m, d]) => [m + tr, d]); const P = phrase(ns, {E, R, phi});
        all.push(...score(runWk(SRC[k], P.x), P.on, P.g)); }
      row[k] = agg(all); }
    console.log(`  ${R} Hz ±${String(E).padStart(3)} ct | 4.5.1: ${fmt(row.base)}\n                 | 4.5.2: ${fmt(row.new)}`); }
}
if (mode === 'all' || mode === 'natural') {
  console.log('== same phrase, "natural" vibrato (rate ±8 %, extent ±15 % wandering), 5.6 Hz');
  for (const E of [60, 70, 80, 90]) { const row = {};
    for (const k of ['base', 'new']) { const all = []; seed = 23;
      for (let s = 0; s < 8; s++) for (const tr of [-5, 0, 2]) { const P = phrase(PH.map(([m, d]) => [m + tr, d]), {E, R: 5.6, phi: 2 * Math.PI * s / 8 + 1.1, jit: 1}); all.push(...score(runWk(SRC[k], P.x), P.on, P.g)); }
      row[k] = agg(all); }
    console.log(`  ±${E} ct | 4.5.1: ${fmt(row.base)}\n          | 4.5.2: ${fmt(row.new)}`); }
}
if (mode === 'all' || mode === 'held') {
  console.log('== single held notes 1.5 s, vibrato from onset, 8 phases x 4 pitches, 5.5 Hz');
  for (const E of [30, 50, 70, 80, 100]) { const row = {};
    for (const k of ['base', 'new']) { const all = []; seed = 5;
      for (let s = 0; s < 8; s++) for (const m of [52, 57, 62, 67]) { const P = phrase([[m, 1.5]], {E, R: 5.5, phi: 2 * Math.PI * s / 8}); all.push(...score(runWk(SRC[k], P.x), P.on, P.g)); }
      row[k] = agg(all); }
    console.log(`  ±${String(E).padStart(3)} ct | 4.5.1: ${fmt(row.base)}\n           | 4.5.2: ${fmt(row.new)}`); }
}
if (mode === 'all' || mode === 'delayed') {
  // control: vibrato starts 150 ms after onset with a 100 ms ramp (like many singers on long notes)
  console.log('== control: held notes 1.5 s, vibrato delayed 150 ms + 100 ms ramp, 5.5 Hz');
  for (const E of [80, 100]) { const row = {};
    for (const k of ['base', 'new']) { const all = []; seed = 5;
      for (let s = 0; s < 8; s++) for (const m of [52, 57, 62, 67]) {
        const t0 = 0.3, phi = 2 * Math.PI * s / 8, on = [[t0, t0 + 1.5, m]];
        const pitch = t => m + (t > t0 + 0.15 ? Math.min(1, (t - t0 - 0.15) / 0.1) * E / 100 * Math.sin(2 * Math.PI * 5.5 * (t - t0 - 0.15) + phi) : 0);
        const amp = t => t < t0 ? 0 : t < t0 + 0.015 ? (t - t0) / 0.015 : t < t0 + 1.47 ? 1 : t < t0 + 1.5 ? (t0 + 1.5 - t) / 0.03 : 0;
        all.push(...score(runWk(SRC[k], synth(2.3, pitch, amp)), on, 0.06)); }
      row[k] = agg(all); }
    console.log(`  ±${String(E).padStart(3)} ct | 4.5.1: ${fmt(row.base)}\n           | 4.5.2: ${fmt(row.new)}`); }
}
