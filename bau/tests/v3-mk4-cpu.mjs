// MK4-11 CPU (Node-Offline, B.4 Nr. 1 like v3-mk2-cpu.mjs): each case in its own Node process, 4 voices (chords, new attack every
// 0.5 s), 40 s render, 25 % quantile of the 1-s windows after 5 s. Effect cost = (AM + all three effects) - (AM without effects),
// in VA voices = cost / (VA 4 voices / 4). Median of 5 runs each, cases interleaved. Usage: node v3-mk4-cpu.mjs [index.html]
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : new URL('../mk-br-MK4/index.html', import.meta.url).pathname);
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const FX = t => ({mfx: {type: t, spd: 64, dep: 100}, dly: {type: 1, sync: 1, time: 64, note: 5, dep: 64}, eq: {lf: 200, lg: 6, hf: 8000, hg: -4}});
const C = {kern: [base, null], cho: [base, FX(0)], ens: [base, FX(1)], pha: [base, FX(2)], va: [null, null], dly: [base, {dly: FX(0).dly}], eq: [base, {eq: FX(0).eq}], m0: [base, {mfx: FX(0).mfx}], m2: [base, {mfx: FX(2).mfx}]};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, fx] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? Object.assign(mkPatch(p), fx || {}) : null;
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), []).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop();
const R = process.env.ALL ? {kern: [], dly: [], eq: [], m0: [], m2: [], va: []} : {kern: [], cho: [], ens: [], pha: [], va: []};
for (let i = 0; i < 5; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[2], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
let f = 0;
for (const k of Object.keys(R).filter(k => k !== 'kern' && k !== 'va')) { const x = (m[k] - m.kern) / vaV, ok = x <= 1.0; if (!ok) f++; console.log((ok ? 'PASS' : 'FAIL') + ' MK4-11 ' + k + ' + Delay + EQ: +' + (m[k] - m.kern).toFixed(2) + ' ms je s = ' + x.toFixed(2) + ' × VA-Stimme (≤ 1,0)'); }
console.log('Info ms je s Audio (Median aus 5): ' + JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, +v.toFixed(2)]))) + ', VA-Stimme ' + vaV.toFixed(2));
process.exit(f ? 1 : 0);
