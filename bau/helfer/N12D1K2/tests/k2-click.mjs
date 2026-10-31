// K2-02: the click of a stolen voice: a loud low note in its release is stolen by 8 new notes; isolate it (render - the 8 notes alone)
// and measure its band > 3 kHz (2x 1-pole HP) in the 20 ms after the steal, relative to its level before
import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const file = process.argv[2] || FILE;
const x = {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {ol: k === 0 ? 99 : 0, amp: {f: 'dx', r: [95, 40, 30, 15], l: [99, 90, 85, 0]}}))};
function run(first) { const {G, procs} = scope(48000, file); const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, FLAT, {poly: 8}), mods: [], fm6: FM6(x)}});
  const ev = []; if (first) { ev.push([.05, 1, 1, 40, 1, -1]); ev.push([.4, 2, 1]); }
  [60, 62, 64, 65, 67, 69, 71, 72].forEach((nt, j) => ev.push([.5 + j * .002, 1, 10 + j, nt, .3, -1]));
  P.onMsg({ev}); const N = 48000, l = new Float64Array(N), L = new Float32Array(128), R = new Float32Array(128);
  for (let f = 0; f < N; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); for (let i = 0; i < 128; i++) l[f + i] = L[i]; } return l; }
const a = run(true), b = run(false), e = a.map((v, i) => v - b[i]);
const c = Math.exp(-2 * Math.PI * 3000 / 48000); let y = new Float64Array(e.length);
for (let p = 0; p < 2; p++) { const s = p ? y.slice() : e; let px = 0, py = 0; for (let i = 0; i < s.length; i++) { py = c * (py + s[i] - px); px = s[i]; y[i] = py; } }
let pk = 0, lv = 0; for (let i = 24000; i < 24960; i++) pk = Math.max(pk, Math.abs(y[i])); for (let i = 22000; i < 23900; i++) lv = Math.max(lv, Math.abs(e[i]));
console.log('click > 3 kHz re the stolen note:', (20 * Math.log10(pk / lv)).toFixed(1), 'dB');
