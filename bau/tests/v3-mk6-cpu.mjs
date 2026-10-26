// MK6-12 CPU (Node-Offline, B.4 Nr. 1 like v3-mk4-cpu.mjs): each case in its own Node process, 4 voices (chords, new attack every
// 0.5 s), 40 s render, 25 % quantile of the 1-s windows after 5 s. Seq cost = (AM + 3 sequences at Key Sync Stimme) - (AM without
// seq), in VA voices = cost / (VA 4 voices / 4). Median of 5 runs each, cases interleaved. Usage: node v3-mk6-cpu.mjs [index.html]
import {execFileSync} from 'child_process';
import path from 'path';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : new URL('../mk-br-MK6/index.html', import.meta.url).pathname);
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const V = (a, b) => Array.from({length: 16}, (_, i) => Math.round(a + (b - a) * i / 15));
const SEQ = (ks, tg) => ({on: 1, last: 16, type: 2, run: 1, ks, res: 3, q: [{k: tg[0], m: 0, v: V(-40, 40)}, {k: tg[1], m: 1, v: V(-12, 12)}, {k: tg[2], m: 0, v: V(30, -30)}]});
const C = {kern: [base, null], seqv: [base, SEQ(2, [11, 1, 16])], seqt: [base, SEQ(1, [11, 1, 16])], seqe: [base, SEQ(2, [21, 27, 25])], va: [null, null]};
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const k = process.argv[3], [p, sq] = C[k], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const pm = p ? mkPatch(p) : null; if (pm && sq) pm.t[0].seq = sq;
  const q = renderW(pm, ev, Object.assign({sec: 40, quantumMs: true}, p ? {} : {eng: 0}), []).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); const qs = q.slice(5 * per).sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3) + ' ' + qs[Math.floor(qs.length * .999)].toFixed(4)); process.exit(0);
}
const PK = {}; const run = k => { const [a, b] = execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop().split(' ').map(Number); (PK[k] = PK[k] || []).push(b); return a; };
const R = {kern: [], seqv: [], seqt: [], seqe: [], va: []};
for (let i = 0; i < 5; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[2], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
let f = 0; const N = {seqv: '3 Sequenzen, KEY SYNC Stimme (Cutoff glatt, Tonhöhe Stufe, Pan glatt)', seqt: 'dieselben, KEY SYNC Timbre', seqe: 'KEY SYNC Stimme, Ziele A-HK DECAY, PATCH 1, LFO 1 FREQ'};
for (const k of ['seqv', 'seqt', 'seqe']) { const x = (m[k] - m.kern) / vaV, ok = x <= .5; if (!ok) f++; console.log((ok ? 'PASS' : 'FAIL') + ' MK6-12 ' + N[k] + ': ' + (m[k] - m.kern >= 0 ? '+' : '') + (m[k] - m.kern).toFixed(2) + ' ms je s = ' + x.toFixed(2) + ' × VA-Stimme (≤ 0,5)'); }
console.log('Info Spitze je Quantum (99,9 %, Median der Läufe, ms): ' + JSON.stringify(Object.fromEntries(Object.entries(PK).map(([k, v]) => [k, +med(v).toFixed(4)]))));
console.log('Info ms je s Audio (Median aus 5): ' + JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, +v.toFixed(2)]))) + ', VA-Stimme ' + vaV.toFixed(2));
process.exit(f ? 1 : 0);
