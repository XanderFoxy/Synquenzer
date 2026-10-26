// QA MK7-11: vocoder track cost vs the same synth program (4 saw voices, FC-MOD from LFO 1, vowel on E2), clean loop (no per-quantum
// allocation in the harness), each case in its own process, interleaved, 7 runs; VA voice = VA(4)/4 of the same runs
import {execFileSync} from 'child_process';
import fs from 'fs';
const D = new URL('.', import.meta.url).pathname, FILE = D + '../mk-br-MK7/index.html';
if (process.argv[2] === 'one') {
  const k = process.argv[3]; process.env.MK_FILE = FILE;
  const {makeScope} = await import('./v3-mk1-node.mjs'); const {vocP} = await import('./v3-mk7-node.mjs');
  const sr = 48000, sec = 30, N = sec * sr; const {G, procs, MKW: W} = makeScope(sr, FILE);
  const src = fs.readFileSync(FILE, 'utf8'), mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
  const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, rms: -20}, W);
  const p = vocP({res: 64, msrc: 2, mint: 30}, {f: {type: 0, cut: 127}}); if (k === 'syn') p.mode = 0;
  const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: k === 'va' ? 0 : 3}, mods: [], mk: k === 'va' ? null : p}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1}); if (k === 'lim') P.onMsg({set: {mkLim: 1}});
  const ev = []; let id = 1; for (let t = 0; t < sec; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 1, id, nt, .8, -1]); ev.push([t + .45, 2, id]); id++; } P.onMsg({ev});
  const L = new Float32Array(128), R = new Float32Array(128), i1 = new Float32Array(128), i2 = new Float32Array(128), inp = [[i1, i2]], out = [[L, R]], q = new Float64Array(N / 128);
  for (let f = 0, j = 0; f < N; f += 128, j++) { G.currentFrame = f; for (let n = 0; n < 128; n++) i2[n] = vox[f + n]; const t0 = performance.now(); P.process(k === 'voc' || k === 'lim' ? inp : [], out); q[j] = performance.now() - t0; }
  const per = 375, win = []; for (let s = 3; s < sec; s++) { let a = 0; for (let j = s * per; j < (s + 1) * per; j++) a += q[j]; win.push(a); } win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(4)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k], {encoding: 'utf8'}).trim().split('\n').pop();
const R = {syn: [], voc: [], lim: [], va: []}; for (let i = 0; i < 7; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[3], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
console.log('ms je s (Median aus 7): ' + JSON.stringify(m) + ' · VA-Stimme ' + vaV.toFixed(2));
console.log('Vocoder − Synth-Programm = ' + ((m.voc - m.syn) / vaV).toFixed(2) + ' × VA-Stimme (≤ 2,4) · Stufe 1: ' + ((m.lim - m.syn) / vaV).toFixed(2) + ' × · Vocoder-Spur gesamt ' + (m.voc / vaV).toFixed(2) + ' × (≤ 8)');
console.log('je Lauf (voc−syn)/VA: ' + R.voc.map((x, i) => ((x - R.syn[i]) / (R.va[i] / 4)).toFixed(2)).join(' '));
