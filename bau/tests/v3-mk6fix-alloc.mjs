// MK6-fix helper: allocation sites (incl. garbage) of one CPU-bench case. Usage: node v3-mk6fix-alloc.mjs <index.html> <case>
import inspector from 'inspector';
import path from 'path';
process.env.MK_FILE = path.resolve(process.argv[2]);
const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const P1 = [{s: 2, d: 4, i: 20}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}];
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, e2: {a: 0, d: 64, s: 100, r: 8}, l1: {w: 2, ks: 2, sync: 0, f: 64, note: 6}, p: P1};
const SEQ = (tg, m) => ({on: 1, last: 16, type: 2, run: 1, ks: 2, res: 3, q: [0, 1, 2].map(i => ({k: tg[i] || 0, m: m[i] || 0, v: [V(-40, 40), V(-30, 30), V(30, -30)][i]}))});
const k = process.argv[3]; const sq = k === 'kern' ? null : SEQ([23, 12, 25], k === 'egs' ? [0, 0, 0] : [1, 1, 1]);
const ev = []; for (let t = 0; t < 12; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
const pm = mkPatch(base); if (sq) pm.t[0].seq = sq;
renderW(pm, ev.filter(e => e[0] < 2), {sec: 2});   // warm up
const s = new inspector.Session(); s.connect();
const post = (m, p) => new Promise((res, rej) => s.post(m, p || {}, (e, r) => (e ? rej(e) : res(r))));
await post('HeapProfiler.enable');
await post('HeapProfiler.startSampling', {samplingInterval: 4096, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true});
renderW(pm, ev, {sec: 12});
const {profile} = await post('HeapProfiler.stopSampling');
const r = {};
(function walk(n, st) { const kk = n.callFrame.functionName + ':' + n.callFrame.lineNumber; r[kk] = (r[kk] || 0) + (n.selfSize || 0); for (const c of n.children || []) walk(c); })(profile.head);
for (const [kk, v] of Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log((v / 1e6).toFixed(2) + ' MB ' + kk);
