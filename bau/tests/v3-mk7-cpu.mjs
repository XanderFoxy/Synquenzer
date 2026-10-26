// MK7-11 / MK7-12 CPU (Node-Offline like v3-mk4-cpu.mjs): each case in its own process, 4 voices (chords, new attack every 0.5 s),
// 40 s, 25 % quantile of the 1-s windows after 5 s; median of 5 runs, cases interleaved. VA voice = (VA 4 voices) / 4.
// voc: 16 bands, 4 saw voices, FC-MOD from LFO 1, a vowel modulator on E2 | syn: the same timbre as a synth program (Single)
// synIn: syn with an input connected (silence) | vocLim: voc at limiter stage 1 (2nd order)
import {execFileSync} from 'child_process';
import path from 'path';
import fs from 'fs';
const FILE = path.resolve(process.argv[2] && process.argv[2] !== 'one' ? process.argv[2] : new URL('../mk-br-MK7/index.html', import.meta.url).pathname);
if (process.argv[2] === 'one') {
  process.env.MK_FILE = process.argv[4];
  const {render, vocP} = await import('./v3-mk7-node.mjs');
  const k = process.argv[3], ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const src = fs.readFileSync(process.argv[4], 'utf8'), a = src.indexOf('/*MKV{*/'), b = src.indexOf('/*}MKV*/');
  const W = render(vocP({}, {}), [], {sec: .01}).MKW, mkVowel = new Function('W', src.slice(a, b) + '\n;return mkVowel;')();
  const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 40, sr: 48000, rms: -20}, W);
  const p = vocP({res: 64, msrc: 2, mint: 30}, {f: {type: 0, cut: 127}}); if (k === 'syn' || k === 'synIn') p.mode = 0;
  const o = {sec: 40, quantumMs: true};
  if (k === 'voc' || k === 'vocLim') o.inputs = {e2: vox}; if (k === 'synIn') o.inputs = {both: true}; if (k === 'va') o.eng = 0; if (k === 'vocLim') o.at = [[0, {set: {mkLim: 1}}]];
  const q = render(k === 'va' ? null : p, ev, o).qms, per = 375, win = [];
  for (let s = 5; s < 40; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); const qs = q.slice(5 * per).sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(3) + ' ' + qs[Math.floor(qs.length * .999)].toFixed(4)); process.exit(0);
}
const run = k => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', k, FILE].map(String), {encoding: 'utf8'}).trim().split('\n').pop().split(' ')[0];
const R = {syn: [], voc: [], synIn: [], vocLim: [], va: []};
for (let i = 0; i < 5; i++) for (const k in R) R[k].push(run(k));
const med = a => a.slice().sort((x, y) => x - y)[2], m = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, med(v)])), vaV = m.va / 4;
let f = 0; const ok = (id, c, t) => { if (!c) f++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + t); };
const x = (m.voc - m.syn) / vaV, y = (m.synIn - m.syn) / vaV, z = (m.vocLim - m.syn) / vaV;
ok('MK7-11 Vocoder-Spur', x <= 2.4, 'Vocoder − Synth-Programm = ' + (m.voc - m.syn).toFixed(2) + ' ms je s = ' + x.toFixed(2) + ' × VA-Stimme (≤ 2,4)');
console.log('Info MK7-11 Begrenzer Stufe 1 (2. Ordnung): ' + z.toFixed(2) + ' × VA-Stimme');
ok('MK7-12 unbenutzter Eingang', y <= .16, 'Eingang verbunden (still) − ohne = ' + (m.synIn - m.syn).toFixed(3) + ' ms je s = ' + y.toFixed(3) + ' × VA-Stimme (≤ 0,16)');
console.log('Info ms je s Audio (Median aus 5): ' + JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, +v.toFixed(2)]))) + ', VA-Stimme ' + vaV.toFixed(2) + ' · Vocoder-Spur gesamt ' + (m.voc / vaV).toFixed(2) + ' × VA (B.4: ≤ 8)');
process.exit(f ? 1 : 0);
