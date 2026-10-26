// QA MK7-12 (FP-DSP): cost of the new worklet input for synth programs, MK7 against the predecessor 4.12.0 (same machine, interleaved,
// each case in its own process), and peak quantum times. One VA voice = VA(4 voices)/4 from the same run.
import {execFileSync} from 'child_process';
const D = new URL('.', import.meta.url).pathname;
const MK7 = D + '../mk-br-MK7/index.html', PRE = D + '../synq-snapshots/G-MK34-merge.html';
if (process.argv[2] === 'one') {
  const [, , , k, file] = process.argv; process.env.MK_FILE = file;
  const {render, vocP} = await import('./v3-mk7-node.mjs');
  const ev = []; for (let t = 0; t < 30; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const p = vocP({res: 64, msrc: 2, mint: 30}, {f: {type: 0, cut: 100, res: 40}}); p.mode = 0;
  const o = {sec: 30, quantumMs: true, file};
  if (k === 'synIn') o.inputs = {both: true};
  if (k === 'va') o.eng = 0;
  const q = render(k === 'va' ? null : p, ev, o).qms, per = 375, win = [];
  for (let s = 3; s < 30; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(4)); process.exit(0);
}
const run = (k, f) => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, f], {encoding: 'utf8'}).trim().split('\n').pop();
const C = {preSyn: ['syn', PRE], mkSyn: ['syn', MK7], mkSynIn: ['synIn', MK7], preVa: ['va', PRE], mkVa: ['va', MK7]}, R = {};
for (const k in C) R[k] = [];
const RUNS = +(process.env.RUNS || 7);
for (let i = 0; i < RUNS; i++) for (const k in C) R[k].push(run(...C[k]));
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = (m.preVa + m.mkVa) / 8;
console.log('ms per s audio (median of ' + RUNS + '): ' + JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, +v.toFixed(3)]))) + ' · VA voice ' + vaV.toFixed(3));
console.log('raw: ' + JSON.stringify(R));
console.log('MK7 synth program, no input vs 4.12.0: ' + ((m.mkSyn - m.preSyn) / vaV).toFixed(3) + ' × VA voice (limit 0.16)');
console.log('MK7 synth program, input connected (silent) vs 4.12.0: ' + ((m.mkSynIn - m.preSyn) / vaV).toFixed(3) + ' × VA voice');
console.log('MK7 synth program, input connected vs not (same file): ' + ((m.mkSynIn - m.mkSyn) / vaV).toFixed(3) + ' × VA voice');
console.log('VA MK7 vs 4.12.0: ' + ((m.mkVa - m.preVa) / vaV).toFixed(3) + ' × VA voice');
// paired per-run differences (same iteration = closest in time)
const pd = (a, b) => R[a].map((x, i) => ((x - R[b][i]) / vaV).toFixed(3));
console.log('paired mkSyn−preSyn per run: ' + pd('mkSyn', 'preSyn').join(' ') + ' · mkSynIn−preSyn: ' + pd('mkSynIn', 'preSyn').join(' ') + ' · mkSynIn−mkSyn: ' + pd('mkSynIn', 'mkSyn').join(' '));
