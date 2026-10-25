import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const AMP = mkPatch({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20});
const {G, procs} = makeScope(48000);
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: +(process.env.ENG || 3), o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8}, mods: [], mk: AMP}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); P.onMsg({mkWheel: {mw0: .5}});
P.onMsg({ev: [36, 43, 48, 52].map((x, k) => [0, 1, k + 1, x, .8, -1])});
const L = new Float32Array(128), R = new Float32Array(128); const t0 = performance.now();
for (let f = 0; f < 48000 * 60 / 128; f++) { G.currentFrame = f * 128; P.process([], [[L, R]]); }
console.log('ms', (performance.now() - t0).toFixed(0));
