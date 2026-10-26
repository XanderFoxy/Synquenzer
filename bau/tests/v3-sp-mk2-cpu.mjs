// FP-DSP MK2-09, independent: Node-Offline, each case in its own process; 4 voices for 24 s, the time of the 1-s windows
// 4 ... 24 s (min of 3 consecutive quanta sums is too noisy: use the median window), ratio to the AM saw from adjacent runs.
import {execFileSync} from 'child_process';
const merge = (...o) => { const r = {}; for (const x of o) for (const k in x || {}) r[k] = typeof x[k] === 'object' && !Array.isArray(x[k]) ? Object.assign({}, r[k] || {}, x[k]) : x[k]; return r; };
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const CH = {mid: [48, 55, 60, 64], bass: [43, 46, 48, 50], hi: [72, 76, 79, 84]};
const C = {
  saw: [merge(base, {o1: {w: 0}}), []],
  tab23: [merge(base, {o1: {w: 5, c2: 44}}), [23]],
  tab23sync: [merge(base, {o1: {w: 5, c2: 44}, o2: {w: 1, semi: 7, mod: 2}}), [23]],
  oct61: [merge(base, {o1: {w: 5, c2: 120}}), [61]],
  oct35: [merge(base, {o1: {w: 5, c2: 68}}), [35]],
  vox: [merge(base, {o1: {w: 4, c1: 64}}), []],
  sx: [merge(base, {o1: {w: 3, c1: 64}}), []],
  noise: [merge(base, {o1: {w: 6, c1: 24, c2: 64}}), []],
  pat4: [merge(base, {o1: {w: 0}, p: [{s: 0, d: 4, i: 20}, {s: 2, d: 0, i: 3}, {s: 3, d: 6, i: 30}, {s: 4, d: 5, i: 20}]}), []],
};
if (process.argv[2] === 'one') {
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const [p, ns] = C[process.argv[3]], ch = CH[process.argv[4]], ev = []; for (let t = 0; t < 24; t += .5) for (const nt of ch) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const q = renderW(mkPatch(p), ev, {sec: 24, quantumMs: true}, ns).qms, per = 375, win = [];
  for (let s = 4; s < 24; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  const qmax = Math.max(...q.slice(per * 4));
  win.sort((a, b) => a - b); console.log(win[win.length >> 1].toFixed(3) + ' ' + qmax.toFixed(3)); process.exit(0);
}
const run = (k, ch) => execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, ch], {encoding: 'utf8'}).trim().split('\n').pop().split(' ').map(Number);
const cases = (process.env.CASES || 'tab23:mid,tab23:bass,tab23sync:mid,oct61:mid,oct35:mid,vox:mid,sx:mid,noise:mid,pat4:mid').split(',');
for (const cs of cases) {
  const [k, ch] = cs.split(':'), r = [], qm = [];
  for (let i = 0; i < 5; i++) { const a = run('saw', ch), b = run(k, ch); r.push(b[0] / a[0]); qm.push([a[1], b[1]]); }
  r.sort((x, y) => x - y); console.log(cs.padEnd(16), 'ratio median', r[2].toFixed(3), 'all', r.map(x => x.toFixed(3)).join(' '), ' quantum max saw/case ms', qm.map(x => x.map(y => y.toFixed(2)).join('/')).join(' '));
}
