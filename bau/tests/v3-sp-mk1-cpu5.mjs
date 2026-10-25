// QA MK1-24: where does the AM voice spend its time? one scope, interleaved per quantum, 1 voice each, ratio to one VA voice
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
const base = {o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20};
const V = {full: base, noDist: Object.assign({}, base, {a: {dist: 0}}), noNoise: Object.assign({}, base, {mix: {o1: 127, o2: 100, n: 0}}), noSync: Object.assign({}, base, {o2: {w: 1, mod: 0, semi: 7}}),
  noForm: Object.assign({}, base, {o1: {w: 0, c1: 0, c2: 0}}), sawOnly: {o1: {w: 0}, mix: {o1: 127, o2: 0, n: 0}, f: {type: 0, cut: 70, res: 100}}};
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const {G, procs} = makeScope(SR);
const mk = (eng, flat, pmk, n) => { const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng}, flat || {}), mods: [], mk: pmk}}); P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (eng === 3) P.onMsg({mkWheel: {mw0: .5}}); P.onMsg({ev: n ? [[0, 1, 1, 48, .8, -1]] : []}); return P; };
const P = {amS: mk(3, null, mkPatch(base), 0), vaS: mk(0, VA, null, 0), va1: mk(0, VA, null, 1)}; for (const k in V) P[k] = mk(3, null, mkPatch(V[k]), 1);
const t = {}; for (const k in P) t[k] = 0; const L = new Float32Array(128), R = new Float32Array(128), N = Math.round(30 * SR / 128), ks = Object.keys(P);
for (let f = 0; f < N; f++) { G.currentFrame = f * 128; for (let j = 0; j < ks.length; j++) { const k = ks[(f + j) % ks.length]; const t0 = performance.now(); P[k].process([], [[L, R]]); if (f > N / 4) t[k] += performance.now() - t0; } }
const va = t.va1 - t.vaS; console.log(Object.keys(V).map(k => k + ' ' + ((t[k] - t.amS) / va).toFixed(2) + 'x').join(' · '));
