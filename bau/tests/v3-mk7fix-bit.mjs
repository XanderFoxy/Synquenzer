// bit-compare two builds' vocoder renders (stage 0, stage 1, switching, LFO FC-MOD)
import fs from 'fs';
import {render, vocP, noise} from './v3-mk7-node.mjs';
const [A, B] = process.argv.slice(2), sr = 48000;
const src = fs.readFileSync(A, 'utf8'), W = render(vocP({}, {}), [], {sec: .01, file: A}).MKW;
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vow = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .4, sec: 3, sr, rms: -20}, W);
const chord = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [.5, 'off', 52], [1.2, 'on', 64, .8]];
let worst = 0;
for (const [nm, p, at] of [['st0', vocP({res: 64}, {}), []], ['lfo st0', vocP({res: 64, msrc: 2, mint: 30}, {}), []], ['switch', vocP({res: 64, msrc: 2, mint: 30}, {}), [[.7, {set: {mkLim: 1}}], [2, {set: {mkLim: 0}}]]], ['hold th', vocP({th: 30, hold: new Array(16).fill(90)}, {}), [[1, {set: {mkLim: 1}}]]], ['noise', vocP({dir: 64, hpl: 64, hpg: 0}, {mix: {o1: 0, o2: 0, n: 127}}), [[1, {set: {mkLim: 1}}]]]]) {
  const a = render(p, chord, {sec: 3, inputs: {e2: vow}, at: at.map(x => [x[0], JSON.parse(JSON.stringify(x[1]))]), file: A}), b = render(p, chord, {sec: 3, inputs: {e2: vow}, at: at.map(x => [x[0], JSON.parse(JSON.stringify(x[1]))]), file: B});
  let m = 0; for (let i = 0; i < a.l.length; i++) m = Math.max(m, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  console.log(nm, 'max|d|', m); worst = Math.max(worst, m);
}
console.log('worst', worst);
