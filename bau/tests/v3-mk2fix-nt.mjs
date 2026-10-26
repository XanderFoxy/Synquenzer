// MK2-fix note tables (35, 61-64) in Node with the app worklet: the table equals the app's own harm() at the played pitch, the
// switches blend <-> note table and old -> new table make no click and no hole, big pitch moves (PATCH +-24 HT, glide, TUNE
// sweep, unison) stay clean and finite, the per-quantum cost of a build is small, the cache stays bounded.
// Usage: MK_FILE=<index.html> node v3-mk2fix-nt.mjs
import {renderW, mkPatch, mktab, render} from './v3-mk2-node.mjs';
import {workletSrc} from './v3-mk1-node.mjs';
import {db, rms, peak, mKlick, mEinbruch, folded} from './v3-mk1-ana.mjs';
const PREV = process.env.MK_PREV || new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
const SR = 48000, T = mktab(), wv = n => 2 * n - 2, M = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
let fails = 0; const ok = (m, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (d ? ' — ' + d : '')); if (!c) fails++; };
const OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
const merge = (...o) => { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; };
const fin = x => { for (let i = 0; i < x.length; i++) if (!isFinite(x[i])) return false; return true; };
const mtof = m => 440 * 2 ** ((m - 69) / 12);
// 1. the note table = MKTAB harm(n, F) x level factor: partials 1..32 of its level 3 vs harm (scope with access to the cache)
{
  let src = workletSrc().replace(/currentFrame/g, '__G.currentFrame');
  const G = {currentFrame: 0}, procs = {}; class AWP { constructor() { this.port = {postMessage() {}, onmessage: null}; } }
  const X = new Function('sampleRate', 'AudioWorkletProcessor', 'registerProcessor', '__G', src + '\n;return {MKNT, mkntReq, mkntWork, mkwAdd, MKWT};')(SR, AWP, (n, c) => { procs[n] = c; }, G);
  let worst = 0, wk = '';
  for (const n of [35, 61, 62, 63, 64]) {
    X.mkwAdd(T.wave(n));
    for (const p of [33.3, 54.33, 57.02, 69, 81.7, 95.5]) {
      const key = n * 1e7 + Math.round(p * 1000) + 5e5, j = X.mkntReq(n, X.MKWT[n], key, p);
      for (let f = 1; !j.t && f < 400; f++) { G.currentFrame = f * 128; j.want = G.currentFrame; X.mkntWork(); }
      const F = mtof(p), H = T.harm(n, F), L = Math.max(j.lo, Math.min(j.hi, 3)), x = j.t.L[L], N = x.length - 1;
      // DFT of the table level: partial k amplitude
      let ref = 0; for (let k = 1; k <= 32; k++) ref = Math.max(ref, H.A[k]);
      let gfit = null;
      for (let k = 1; k <= Math.min(32, (512 >> L)); k++) { let re = 0, im = 0; for (let i = 0; i < N; i++) { re += x[i] * Math.cos(2 * Math.PI * k * i / N); im += x[i] * Math.sin(2 * Math.PI * k * i / N); } const a = 2 * Math.hypot(re, im) / N;
        if (H.A[k] < ref * 1e-3) continue; if (gfit == null) gfit = a / H.A[k]; const d = Math.abs(db(a / gfit) - db(H.A[k])); if (d > worst) { worst = d; wk = n + '@' + p + ' k' + k; } }
    }
  }
  ok('Note table = MKTAB harm(n, F) at the played pitch (35, 61-64; 6 pitches incl. 187.5 Hz, partials 1-32 >= -60 dB)', worst <= .01, 'max ' + M(worst, 4) + ' dB (' + wk + ')');
}
// 2. a new pitch: blend first, then the note table (crossfade 5 ms) - no click, no hole; and a cached pitch plays the table at once
for (const n of [61, 63, 35]) {
  const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(n)}}, OPEN)), [[0, 'on', 57, .8], [.4, 'on', 64, .8], [.4, 'off', 57]], {sec: .9}, [n]);
  const k = mKlick(r.l.subarray(Math.round(.03 * SR)), SR, [.37]);
  ok('wave ' + n + ': new pitches (octave blend -> own table when built): M-KLICK <= 6 dB, finite', k.ok && fin(r.l), 'worst ' + M(k.worst) + ' dB @' + M(k.at + .03, 3) + ' s');
}
// 3. TUNE moves while a note sounds: old table -> new table (crossfades), no click / hole
for (const n of [61, 64]) {
  const at = [[.3, {mkSet: {'t.0.tune': 25}}], [.6, {mkSet: {'t.0.tune': -40}}]]; for (let i = 0; i < 30; i++) at.push([.9 + i * .01, {mkSet: {'t.0.tune': -40 + i * 3}}]);
  const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(n)}}, OPEN)), [[0, 'on', 57, .8]], {sec: 1.6, at}, [n]);
  const r0 = renderW(mkPatch(merge({o1: {w: 5, c2: wv(n)}}, OPEN)), [[0, 'on', 57, .8]], {sec: 1.6, at, file: PREV}, [n]);
  const k = mKlick(r.l.subarray(Math.round(.05 * SR)), SR), k0 = mKlick(r0.l.subarray(Math.round(.05 * SR)), SR), e = [.3, .6].map(t => mEinbruch(r.l, SR, t + .015));
  ok('wave ' + n + ': TUNE jumps and a TUNE sweep on a held note: M-KLICK <= max(6, before + 1), M-EINBRUCH', k.worst <= Math.max(6, k0.worst + 1) && e.every(x => x.ok) && fin(r.l), 'Klick ' + M(k.worst) + ' dB @' + M(k.at + .05, 3) + ' s (before ' + M(k0.worst) + ' dB), Einbruch ' + e.map(x => M(x.worst)).join(' / ') + ' dB');
}
// 4. big pitch moves: PATCH pitch +-24 HT from LFO1 (table <-> blend at +-7 HT), glide over 2 octaves, unison 4 voices
for (const n of [61, 35]) {
  const base = merge({o1: {w: 5, c2: wv(n)}}, OPEN);
  const rp = renderW(mkPatch(merge(base, {l1: {w: 2, f: 40}, p: [{s: 2, d: 0, i: 63}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]})), [[0, 'on', 60, .8]], {sec: 2}, [n]);
  const rs = render(mkPatch(merge(OPEN, {o1: {w: 0}, l1: {w: 2, f: 40}, p: [{s: 2, d: 0, i: 63}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]})), [[0, 'on', 60, .8]], {sec: 2});
  const kp = mKlick(rp.l.subarray(4800), SR), ks = mKlick(rs.l.subarray(4800), SR);
  ok('wave ' + n + ': PATCH Tonhöhe +-24 HT (LFO1): finite, peak <= 0 dBFS, M-KLICK not above the saw with the same sweep + 3 dB', fin(rp.l) && peak(rp.l) <= 1 && kp.worst <= Math.max(6, ks.worst + 3), 'peak ' + M(db(peak(rp.l))) + ' dBFS, Klick ' + M(kp.worst) + ' dB (saw ' + M(ks.worst) + ')');
  const gl = (w, file) => { const r = renderW(mkPatch(merge(base, {o1: {w: 5, c2: wv(w)}, porta: 90})), [[0, 'on', 36, .8], [.3, 'on', 60, .8], [.3, 'off', 36], [1.0, 'on', 84, .8], [1.0, 'off', 60]], {sec: 1.8, file}, [w]); return {r, k: mKlick(r.l.subarray(4800), SR, [.3, 1.0])}; };
  const g1 = gl(n), g0 = gl(n, PREV), g2 = gl(23);
  ok('wave ' + n + ': glide over 2 octaves (PORTAMENTO 90): finite, M-KLICK <= max(6, before + 1, single wave 23 + 1)', fin(g1.r.l) && g1.k.worst <= Math.max(6, g0.k.worst + 1, g2.k.worst + 1), 'Klick ' + M(g1.k.worst) + ' dB @' + M(g1.k.at + .1, 3) + ' (before ' + M(g0.k.worst) + ', wave 23 ' + M(g2.k.worst) + ')');
  // unison: the first note builds 4 tables (blend -> table while it sounds), the second one finds them cached; the HF beating of
  // the detuned voices is the same in both, so the first may not exceed the second by more than 1 dB
  const ru = renderW(mkPatch(merge(base, {asg: 2, udet: 40})), [[0, 'on', 57, .8], [.5, 'off', 57], [1, 'on', 57, .8], [1.5, 'off', 57]], {sec: 2}, [n]);
  const ka = mKlick(ru.l.subarray(2400, 24000), SR), kb = mKlick(ru.l.subarray(50400, 72000), SR);
  ok('wave ' + n + ': unison (4 voices, detune 40): finite, M-KLICK of the note that builds its tables <= max(6, the cached note + 1)', fin(ru.l) && ka.worst <= Math.max(6, kb.worst + 1), 'Klick ' + M(ka.worst) + ' dB @' + M(ka.at + .05, 3) + ' s (cached note ' + M(kb.worst) + ' dB)');
}
// 5. the cost of a build: the longest quantum with 4 new pitches vs the saw; the cache stays bounded with 72 pitches
{
  const ev = [48, 52, 55, 59].map(nt => [0, 'on', nt, .8]);
  // fresh scopes (cold code, as at the first octave-wave note of a context), interleaved, best of 7: the longest quantum of an octave
  // wave (4 tables built) against a single wave (23) under the same conditions
  const q = (p, ns) => { const r = renderW(mkPatch(p), ev, {sec: .5, quantumMs: true}, ns); return Math.max(...r.qms.slice(1)); };
  let a = 1e9, b = 1e9; for (let i = 0; i < 7; i++) { a = Math.min(a, q(merge({o1: {w: 5, c2: wv(23)}}, OPEN), [23])); b = Math.min(b, q(merge({o1: {w: 5, c2: wv(61)}}, OPEN), [61])); }
  ok('longest quantum while 4 new note tables are built (cold code): <= single wave + 0.4 ms', b <= a + .4, M(b, 3) + ' ms (wave 23 ' + M(a, 3) + ' ms)');
  const ev2 = []; for (let k = 0; k < 72; k++) { ev2.push([k * .05, 'on', 30 + k, .8]); ev2.push([k * .05 + .045, 'off', 30 + k]); }
  const sk = ev2.map(e => e[0]).concat(ev2.filter(e => e[1] === 'off').map(e => e[0] + .002)), mk = (w, file) => { const r = renderW(mkPatch(merge({o1: {w: 5, c2: wv(w)}}, OPEN)), ev2, {sec: 4, file}, [w]); return {r, k: mKlick(r.l, SR, sk)}; };
  const a1 = mk(62), a0 = mk(62, PREV), a2 = mk(23);
  ok('72 different pitches in 3.6 s (each a new note table): finite, M-KLICK <= max(6, before + 1, wave 23 + 1)', fin(a1.r.l) && a1.k.worst <= Math.max(6, a0.k.worst + 1, a2.k.worst + 1), 'Klick ' + M(a1.k.worst) + ' dB @' + M(a1.k.at, 3) + ' (before ' + M(a0.k.worst) + ', wave 23 ' + M(a2.k.worst) + ')');
}
// 6. aliasing of the note tables (B.6 Nr. 12 at the oscillator) not above the octave sets of the predecessor (+ 0.5 dB)
{
  let worst = -99, wk = '';
  for (const n of [35, 61, 63]) for (const nt of [36, 43, 48, 55, 60, 67, 72, 84, 96]) {
    const f = file => folded(renderW(mkPatch({o1: {w: 5, c2: wv(n)}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', nt, .8]], {sec: 1.2, tap: 'mix', file}, [n]).l, 14400, mtof(nt) / (n === 35 ? 2 : 1), SR);
    const d = f() - f(PREV); if (d > worst) { worst = d; wk = n + '@' + nt; }
  }
  ok('folded energy at the oscillator (35, 61, 63; C2 ... C7) <= predecessor + 1 dB (all stay <= -50 dB)', worst <= 1, 'worst ' + M(worst, 2) + ' dB (' + wk + ')');
}
console.log(fails ? 'FAILS ' + fails : 'alles PASS');
