// one shared worklet scope (as in the browser: one AudioWorkletGlobalScope per context), all processors stepped
// interleaved quantum by quantum (rotating order), SEC seconds; ratio per 10-s window, so convergence is visible
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, SEC = +(process.env.SEC || 60);
const AMP = mkPatch(Object.assign({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20}, process.env.AMPX ? JSON.parse(process.env.AMPX) : {}));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const {G, procs} = makeScope(SR);
const mk = (eng, flat, pmk, n) => { const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng}, flat || {}), mods: [], mk: pmk}}); P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (eng === 3) P.onMsg({mkWheel: {mw0: .5}});
  P.onMsg({ev: (process.env.NOTES || '36,43,48,52').split(',').map(Number).slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1])}); return P; };
const sets = {amS: mk(3, null, AMP, 0), am1: mk(3, null, AMP, 1), am4: mk(3, null, AMP, 4), vaS: mk(0, VA, null, 0), va1: mk(0, VA, null, 1), va4: mk(0, VA, null, 4)};
const order = Object.keys(sets), W = Math.round(10 * SR / 128), N = Math.round(SEC * SR / 128);
const L = new Float32Array(128), R = new Float32Array(128);
let t = {}; const rows = [];
for (let f = 0; f < N; f++) {
  if (f % W === 0) { t = {}; for (const k of order) t[k] = 0; }
  G.currentFrame = f * 128;
  for (let j = 0; j < order.length; j++) { const k = order[(f + j) % order.length]; const t0 = performance.now(); sets[k].process([], [[L, R]]); t[k] += performance.now() - t0; }
  if (f % W === W - 1) { const am1 = t.am1 - t.amS, am4 = t.am4 - t.amS, va1 = t.va1 - t.vaS, va4 = t.va4 - t.vaS;
    rows.push({win: (f + 1 - W) * 128 / SR | 0, am1_va1: +(am1 / va1).toFixed(2), am4_va1: +(am4 / va1).toFixed(2), va4_va1: +(va4 / va1).toFixed(2), us: Object.fromEntries(order.map(k => [k, +(t[k] / W * 1000).toFixed(1)]))}); }
}
for (const r of rows) console.log(JSON.stringify(r));
