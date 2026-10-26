// MK4-11 independent: one process per case (child), 4 voices chords re-struck every 0.5 s, 20 s; metric = MEDIAN quantum time x quanta
// (median, not a low quantile), 7 interleaved runs, median; VA voice = VA 4 voices / 4 from the same series
import {execFileSync} from 'child_process';
const FILE = process.env.MK_FILE;
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const FX = t => ({mfx: {type: t, spd: 90, dep: 127}, dly: {type: 1, sync: 1, time: 64, note: 5, dep: 100}, eq: {lf: 300, lg: -6, hf: 3000, hg: 6}});
if (process.argv[2] === 'one') {
  const {render, mkPatch} = await import('./v3-mk1-node.mjs');
  const k = process.argv[3], ev = []; for (let t = 0; t < 20; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  let pm = null; if (k !== 'va') { pm = mkPatch(base); if (k !== 'kern') Object.assign(pm, FX(+k.slice(2))); }
  const q = render(pm, ev, Object.assign({sec: 20, quantumMs: true, file: FILE}, k === 'va' ? {eng: 0} : {})).qms.slice(375 * 3);
  const s = q.slice().sort((a, b) => a - b), med = s[s.length >> 1], mean = q.reduce((a, b) => a + b, 0) / q.length;
  console.log((med * 375).toFixed(3) + ' ' + (mean * 375).toFixed(3) + ' ' + s[Math.floor(s.length * .999)].toFixed(4)); process.exit(0);
}
const K = ['kern', 'fx0', 'fx1', 'fx2', 'va'], R = {}, M = {}, P = {};
for (let i = 0; i < 7; i++) for (const k of K) { const [a, b, c] = execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k], {encoding: 'utf8', env: process.env}).trim().split(' ').map(Number); (R[k] = R[k] || []).push(a); (M[k] = M[k] || []).push(b); (P[k] = P[k] || []).push(c); }
const md = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const va = md(R.va) / 4, vaM = md(M.va) / 4;
for (const k of ['fx0', 'fx1', 'fx2']) console.log(k, 'median-based: +' + (md(R[k]) - md(R.kern)).toFixed(2) + ' ms/s = ' + ((md(R[k]) - md(R.kern)) / va).toFixed(2) + ' x VA', '| mean-based: ' + ((md(M[k]) - md(M.kern)) / vaM).toFixed(2) + ' x VA', '| p99.9 quantum ms', md(P[k]).toFixed(3), 'kern', md(P.kern).toFixed(3));
console.log('ms/s median', Object.fromEntries(K.map(k => [k, +md(R[k]).toFixed(2)])), 'VA voice', va.toFixed(2));
