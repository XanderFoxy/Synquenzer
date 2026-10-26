// QA MK7: per-quantum time without harness allocations; GC events via perf_hooks. argv: syn|voc|vocNoLfo|vocHold
import fs from 'fs';
import {PerformanceObserver, performance} from 'perf_hooks';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {makeScope} = await import('./v3-mk1-node.mjs');
const {vocP} = await import('./v3-mk7-node.mjs');
const k = process.argv[2] || 'voc', sr = 48000, sec = 30, N = Math.round(sec * sr / 128) * 128;
const {G, procs, MKW: W} = makeScope(sr, FILE);
const src = fs.readFileSync(FILE, 'utf8'), mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, rms: -20}, W);
const p = vocP({res: 64, msrc: k === 'vocNoLfo' ? 1 : 2, mint: 30, hpl: 40, dir: 20, th: 0, gs: 40}, {f: {type: 0, cut: 100, res: 40}, l1: {w: 2, f: 90, sync: 0, ks: 0}});
if (k === 'syn') p.mode = 0;
if (k === 'vocHold') p.voc.hold = new Array(16).fill(60);
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: p}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
const ev = []; let id = 1; for (let t = 0; t < sec; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 1, id, nt, .8, -1]); ev.push([t + .45, 2, id]); id++; }
P.onMsg({ev});
const gcs = []; const obs = new PerformanceObserver(l => { for (const e of l.getEntries()) gcs.push([e.startTime, e.duration]); }); obs.observe({entryTypes: ['gc']});
const L = new Float32Array(128), R = new Float32Array(128), i1 = new Float32Array(128), i2 = new Float32Array(128), inp = [[i1, i2]], none = [], out = [[L, R]];
const qt = new Float64Array(N / 128), qs = new Float64Array(N / 128); if (global.gc) global.gc(); console.log("LOOPSTART");
for (let f = 0, q = 0; f < N; f += 128, q++) {
  G.currentFrame = f;
  if (k !== 'syn') for (let n = 0; n < 128; n++) i2[n] = vox[f + n] || 0;
  const t0 = performance.now(); P.process(k === 'syn' ? none : inp, out); const t1 = performance.now(); qt[q] = t1 - t0; qs[q] = t0;
}
await new Promise(r => setTimeout(r, 50)); obs.disconnect();
const q2 = Array.from(qt.slice(750)), s = q2.slice().sort((a, b) => a - b), pc = x => s[Math.min(s.length - 1, Math.floor(s.length * x))];
// attribute spikes: does a GC overlap the quantum?
let spk = 0, spkGc = 0; for (let q = 750; q < qt.length; q++) if (qt[q] > 10 * pc(.5)) { spk++; if (gcs.some(([st, d]) => st < qs[q] + qt[q] && st + d > qs[q])) spkGc++; }
const gcT = gcs.reduce((a, [, d]) => a + d, 0);
console.log(k.padEnd(9) + ' median ' + pc(.5).toFixed(4) + ' ms · p99 ' + pc(.99).toFixed(4) + ' · p99.9 ' + pc(.999).toFixed(4) + ' · max ' + s[s.length - 1].toFixed(3) + ' · spikes >10×med ' + spk + ' (with GC ' + spkGc + ') · GC ' + gcs.length + ' events, ' + gcT.toFixed(1) + ' ms total');
