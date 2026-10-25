// QA MK1-24 (FP-DSP / FP-IPHONE): AM voice vs VA voice CPU with three methods.
// A: one worklet scope (as in the browser, all tracks share one AudioWorkletGlobalScope), processors interleaved per quantum.
// B: one scope, after a common warm-up each processor runs 10 s alone (sequential).
// C: a fresh scope per render (the builder's method), 10 s, first 2 s dropped.
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
const AMP = mkPatch({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20});
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const mkP = (procs, eng, flat, pmk, n) => { const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng}, flat || {}), mods: [], mk: pmk}}); P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (eng === 3) P.onMsg({mkWheel: {mw0: .5}});
  P.onMsg({ev: [36, 43, 48, 52].slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1])}); return P; };
const CFG = {amS: [3, null, AMP, 0], am1: [3, null, AMP, 1], am4: [3, null, AMP, 4], vaS: [0, VA, null, 0], va1: [0, VA, null, 1], va4: [0, VA, null, 4]};
const L = new Float32Array(128), R = new Float32Array(128);
const ratio = t => { const va1 = t.va1 - t.vaS; return {am1: ((t.am1 - t.amS) / va1).toFixed(2), am4: ((t.am4 - t.amS) / va1).toFixed(2), va4: ((t.va4 - t.vaS) / va1).toFixed(2), vaPctRT: (va1 / t.n / (128 / SR * 1000) * 100).toFixed(2)}; };
function A() {
  const {G, procs} = makeScope(SR); const P = {}; for (const k in CFG) P[k] = mkP(procs, ...CFG[k]);
  const t = {n: 0}; for (const k in P) t[k] = 0; const N = Math.round(20 * SR / 128), ks = Object.keys(P);
  for (let f = 0; f < N; f++) { G.currentFrame = f * 128; const meas = f > N / 4; if (meas) t.n++;
    for (let j = 0; j < ks.length; j++) { const k = ks[(f + j) % ks.length]; const t0 = performance.now(); P[k].process([], [[L, R]]); if (meas) t[k] += performance.now() - t0; } }
  return ratio(t);
}
function B() {
  const {G, procs} = makeScope(SR); const P = {}; for (const k in CFG) P[k] = mkP(procs, ...CFG[k]);
  const ks = Object.keys(P); for (let f = 0; f < Math.round(3 * SR / 128); f++) { G.currentFrame = f * 128; for (const k of ks) P[k].process([], [[L, R]]); }
  const t = {n: Math.round(10 * SR / 128)}; for (const k of ks) { let s = 0; for (let f = 0; f < t.n; f++) { G.currentFrame = (f + 2000) * 128; const t0 = performance.now(); P[k].process([], [[L, R]]); s += performance.now() - t0; } t[k] = s; }
  return ratio(t);
}
function C() {
  const t = {n: Math.round(8 * SR / 128)};
  for (const k in CFG) { const {G, procs} = makeScope(SR); const P = mkP(procs, ...CFG[k]); let s = 0; for (let f = 0; f < Math.round(10 * SR / 128); f++) { G.currentFrame = f * 128; const t0 = performance.now(); P.process([], [[L, R]]); if (f >= Math.round(2 * SR / 128)) s += performance.now() - t0; } t[k] = s; }
  return ratio(t);
}
for (let r = 0; r < +(process.env.R || 3); r++) console.log('A shared+interleaved', JSON.stringify(A()), '| B shared+sequential', JSON.stringify(B()), '| C fresh scope', JSON.stringify(C()));
