// CPU AM vs VA: each kind in its own scope (own JIT, like the builder), stepped interleaved quantum by quantum, 30 s
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
const AMP = mkPatch(JSON.parse(process.env.AMP));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const mk = (eng, flat, pmk, n) => { const S = makeScope(SR); const P = new S.procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng}, flat || {}), mods: [], mk: pmk}}); P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (eng === 3) P.onMsg({mkWheel: {mw0: .5}});
  P.onMsg({ev: [36, 43, 48, 52].slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1])}); return {P, G: S.G}; };
const sets = {amS: mk(3, null, AMP, 0), am1: mk(3, null, AMP, 1), am4: mk(3, null, AMP, 4), vaS: mk(0, VA, null, 0), va1: mk(0, VA, null, 1)};
const t = {}; for (const k in sets) t[k] = 0;
const L = new Float32Array(128), R = new Float32Array(128);
const N = Math.round(30 * SR / 128), order = Object.keys(sets);
for (let f = 0; f < N; f++) {
  for (let j = 0; j < order.length; j++) { const k = order[(f + j) % order.length], s = sets[k]; s.G.currentFrame = f * 128; const t0 = performance.now(); s.P.process([], [[L, R]]); if (f > N / 6) t[k] += performance.now() - t0; }
}
const am1 = t.am1 - t.amS, am4 = t.am4 - t.amS, va1 = t.va1 - t.vaS;
console.log('own scopes, 25 s steady state: AM 1 voice / VA 1 voice =', (am1 / va1).toFixed(2), '× ; AM 4 voices =', (am4 / va1).toFixed(2), '× ; abs ms', JSON.stringify(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Math.round(v)]))));
