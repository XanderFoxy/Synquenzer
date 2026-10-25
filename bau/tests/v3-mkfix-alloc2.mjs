import inspector from 'node:inspector/promises';
import fs from 'fs';
import {mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE || new URL('../mk-wt/index.html', import.meta.url).pathname;
const s0 = fs.readFileSync(FILE, 'utf8'); const i = s0.indexOf('id="sq-worklet-src">') + 'id="sq-worklet-src">'.length; const src = s0.slice(i, s0.indexOf('</script>', i));
const G = {currentFrame: 0}, procs = {};
class AWP { constructor() { this.port = {postMessage: () => {}, onmessage: null}; } }
globalThis.sampleRate = 48000; globalThis.AudioWorkletProcessor = AWP; globalThis.registerProcessor = (n, c) => { procs[n] = c; }; globalThis.__G = G;
(0, eval)(src.replace(/currentFrame/g, '__G.currentFrame'));
const s = new inspector.Session(); s.connect();
const AMP = mkPatch(Object.assign({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20}, process.env.AMPX ? JSON.parse(process.env.AMPX) : {}));
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: +(process.env.ENG || 3), o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8}, mods: [], mk: AMP}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); P.onMsg({mkWheel: {mw0: .5}});
P.onMsg({ev: [36, 43, 48, 52].map((x, k) => [0, 1, k + 1, x, .8, -1])});
const L = new Float32Array(128), R = new Float32Array(128);
for (let f = 0; f < 48000 * 5 / 128; f++) { G.currentFrame = f * 128; P.process([], [[L, R]]); }
await s.post('HeapProfiler.startSampling', {samplingInterval: 128, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true});
const t0 = performance.now();
for (let f = 48000 * 5 / 128; f < 48000 * 15 / 128; f++) { G.currentFrame = f * 128; P.process([], [[L, R]]); }
const ms = performance.now() - t0;
const {profile} = await s.post('HeapProfiler.stopSampling');
const acc = {}; (function walk(n) { const k = n.callFrame.functionName + ':' + n.callFrame.lineNumber + ':' + n.callFrame.columnNumber; acc[k] = (acc[k] || 0) + n.selfSize; (n.children || []).forEach(walk); })(profile.head);
console.log('ms', ms.toFixed(0)); Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([k, v]) => console.log((v / 1024).toFixed(0) + 'KB', k));
