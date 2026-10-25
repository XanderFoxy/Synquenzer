import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const AMP = mkPatch({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20});
const {G, procs} = makeScope(48000, process.env.MK_FILE2);
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: AMP}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); P.onMsg({mkWheel: {mw0: .5}});
P.onMsg({ev: [36].map((x, k) => [0, 1, k + 1, x, .8, -1])});
const L = new Float32Array(128), R = new Float32Array(128); let t0 = performance.now(), mx = 0, sq = 0, n = 0;
for (let f = 0; f < 48000 * 60 / 128; f++) { G.currentFrame = f * 128; P.process([], [[L, R]]); for (const x of L) { mx = Math.max(mx, Math.abs(x)); sq += x * x; n++; }
  if ((f + 1) % (48000 * 5 / 128) === 0) { const v = P.mk.V.filter(v => v.on)[0]; console.log(((f + 1) * 128 / 48000).toFixed(0) + 's', (performance.now() - t0).toFixed(0) + 'ms', 'peak', mx.toFixed(3), 'rms', Math.sqrt(sq / n).toExponential(2), v ? 's1 ' + v.s1.toExponential(2) + ' dx ' + v.dx.toExponential(2) + ' sr ' + v.sr : ''); t0 = performance.now(); mx = 0; sq = 0; n = 0; } }
