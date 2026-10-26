// QA MK2-09 (Node offline, own process per case): INIT-AM based voices (OSC 2 off) and the builder-style base; ratio vs saw
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : new URL('../mk-wt/index.html', import.meta.url).pathname);
const merge = (...o) => { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; };
const BASES = {init: {}, full: {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}}};
const mk = (base, o) => merge(BASES[base], o);
const CASES = b => ({saw: [mk(b, {o1: {w: 0}}), []], tab23: [mk(b, {o1: {w: 5, c2: 44}}), [23]], tab34: [mk(b, {o1: {w: 5, c2: 66}}), [34]], oct61: [mk(b, {o1: {w: 5, c2: 120}}), [61]], oct35: [mk(b, {o1: {w: 5, c2: 68}}), [35]],
  vox: [mk(b, {o1: {w: 4, c1: 64}}), []], sx: [mk(b, {o1: {w: 3, c1: 64}}), []], pat: [mk(b, {o1: {w: 0}, p: [{s: 0, d: 4, i: 20}, {s: 2, d: 0, i: 3}, {s: 3, d: 6, i: 30}, {s: 4, d: 5, i: 20}]}), []]});
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const [p, ns] = CASES(process.argv[4])[process.argv[3]], ev = []; for (let t = 0; t < 24; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const q = renderW(mkPatch(p), ev, {sec: 24, quantumMs: true}, ns).qms, per = 375, win = [];
  for (let s = 4; s < 24; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(4)); process.exit(0);
}
const run = (k, b) => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, b, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop();
for (const b of ['init', 'full']) {
  const res = {};
  for (const k of ['tab23', 'tab34', 'oct61', 'oct35', 'vox', 'sx', 'pat']) { const r = []; for (let i = 0; i < 5; i++) { const a = run('saw', b), c = run(k, b); r.push(c / a); } r.sort((x, y) => x - y); res[k] = r[2]; }
  console.log(b, JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, +v.toFixed(3)]))));
}
