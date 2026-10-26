// MK2-09 CPU (B.4 Nr. 1, Node-Offline): each case in its own Node process (own JIT state), 4 voices (chords, new attack every
// 0.5 s), 40 s render; the time of each 1-s window, the case value = the 25 % quantile of the windows after 5 s warm-up (the
// machine is shared: slow windows are other processes). Cases alternate with the saw, the ratio = median of 5 pairs.
// Usage: node v3-mk2-cpu.mjs [index.html]
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : new URL('../mk-wt/index.html', import.meta.url).pathname);
const merge = (...o) => { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; };
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const C = {saw: [merge(base, {o1: {w: 0}}), []], tab: [merge(base, {o1: {w: 5, c2: 44}}), [23]], oct: [merge(base, {o1: {w: 5, c2: 120}}), [61]], vox: [merge(base, {o1: {w: 4, c1: 64}}), []],
  sx: [merge(base, {o1: {w: 3, c1: 64}}), []], pat: [merge(base, {o1: {w: 0}, p: [{s: 0, d: 4, i: 20}, {s: 2, d: 0, i: 3}, {s: 3, d: 6, i: 30}, {s: 4, d: 5, i: 20}]}), []],
  va: [null, []]};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, ns] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const q = renderW(p ? mkPatch(p) : null, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), ns).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop();
const ratio = k => { const r = [], s = []; for (let i = 0; i < 5; i++) { const a = run('saw'), b = run(k); r.push(b / a); s.push(a); } r.sort((x, y) => x - y); s.sort((x, y) => x - y); return [r[2], s[2], r]; };
const out = {}; for (const k of ['tab', 'vox', 'sx', 'pat', 'oct', 'va']) out[k] = ratio(k);
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, {ratio: +v[0].toFixed(3), sawMsPerS: +v[1].toFixed(2), pairs: v[2].map(x => +x.toFixed(3))}]))));
const lim = {tab: 1.1, vox: 1.3, sx: 1.2, pat: 1.05}; let f = 0;
for (const k in lim) { const ok = out[k][0] <= lim[k]; if (!ok) f++; console.log((ok ? 'PASS' : 'FAIL') + ' MK2-09 ' + k + ' ×' + out[k][0].toFixed(3) + ' ≤ ' + lim[k]); }
console.log('Info: Oktav-Welle ×' + out.oct[0].toFixed(3) + ', AM-Säge gegen VA-Stimme (Spur-Spiel VA 4 Stimmen) ×' + (1 / out.va[0]).toFixed(3) + ', Säge ' + out.tab[1].toFixed(2) + ' ms je s Audio (4 Stimmen)');
process.exit(f ? 1 : 0);
