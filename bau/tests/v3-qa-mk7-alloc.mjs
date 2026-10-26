// QA MK7 FP-IPHONE (memory): where the audio thread allocates per quantum (V8 sampling heap profiler incl. objects freed by GC)
import fs from 'fs';
import inspector from 'node:inspector';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {makeScope} = await import('./v3-mk1-node.mjs'); const {vocP} = await import('./v3-mk7-node.mjs');
const k = process.argv[2] || 'voc', sr = 48000, sec = 20, N = sec * sr; const {G, procs, MKW: W} = makeScope(sr, FILE);
const src = fs.readFileSync(FILE, 'utf8'), mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, rms: -20}, W);
const p = vocP({res: 64, msrc: 2, mint: 30}, {f: {type: 0, cut: 127}}); if (k === 'syn') p.mode = 0; if (k === 'hold') p.voc.hold = new Array(16).fill(60);
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: p}}); P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
const ev = []; let id = 1; for (let t = 0; t < sec; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 1, id, nt, .8, -1]); ev.push([t + .45, 2, id]); id++; } P.onMsg({ev});
const L = new Float32Array(128), R = new Float32Array(128), i1 = new Float32Array(128), i2 = new Float32Array(128), inp = [[i1, i2]], out = [[L, R]];
// warm up 2 s
let f = 0; for (; f < 2 * sr; f += 128) { G.currentFrame = f; for (let n = 0; n < 128; n++) i2[n] = vox[f + n]; P.process(k === 'syn' ? [] : inp, out); }
const s = new inspector.Session(); s.connect(); const post = (m, a) => new Promise((res, rej) => s.post(m, a || {}, (e, r) => e ? rej(e) : res(r)));
await post('HeapProfiler.enable'); await post('HeapProfiler.startSampling', {samplingInterval: 512, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true});
for (; f < N; f += 128) { G.currentFrame = f; for (let n = 0; n < 128; n++) i2[n] = vox[f + n]; P.process(k === 'syn' ? [] : inp, out); }
const {profile} = await post('HeapProfiler.stopSampling');
const agg = new Map(); let tot = 0;
(function walk(n) { const nm = (n.callFrame.functionName || '(anon)') + ' @' + n.callFrame.lineNumber; const sz = n.selfSize || 0; tot += sz; if (sz) agg.set(nm, (agg.get(nm) || 0) + sz); for (const c of n.children || []) walk(c); })(profile.head);
const q = (N - 2 * sr) / 128;
console.log(k + ': sampled allocation ' + (tot / 1048576).toFixed(1) + ' MB in ' + (sec - 2) + ' s = ' + (tot / q / 1024).toFixed(2) + ' KB per quantum · top: ' + [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, v]) => n + ' ' + (v / q).toFixed(0) + ' B/q').join(' | '));
