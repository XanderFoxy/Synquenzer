// K2-02: chord A (6 notes) rings out, chord B (6 notes) starts in A's release -> voices are stolen. Ideal = A alone + B alone
// (the graph is linear with the filter bypassed); the error's high band (> 2 kHz, 1-pole HP x2) relative to the music = the click
import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
function graph(n) { return {v: 2, n: 6, trans: 0, edges: [[2, 1], [4, 3], [6, 5]].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})),
  ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k % 2 ? 2 : 1, ol: k < n ? (k % 2 ? 60 : 95) : 0, amp: {f: 'dx', r: [95, 40, 30, 22], l: [99, 85, 70, 0]}}))}; }
const A = [48, 52, 55, 59, 62, 65], B = [50, 53, 57, 60, 64, 67];
function run(n, poly, which, file, xfLite) {
  const {G, procs} = scope(48000, file); const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, FLAT, {poly, xfLite: xfLite || 0}), mods: [], fm6: FM6(graph(n))}});
  const ev = [];
  if (which !== 'B') A.forEach((nt, j) => { ev.push([.05 + j * .015, 1, j + 1, nt, .9, -1]); ev.push([.5, 2, j + 1]); });
  if (which !== 'A') B.forEach((nt, j) => { ev.push([.6 + j * .015, 1, 20 + j, nt, .9, -1]); ev.push([1.4, 2, 20 + j]); });
  P.onMsg({ev}); const N = 48000 * 2, l = new Float64Array(N), L = new Float32Array(128), R = new Float32Array(128), q = [];
  for (let f = 0; f < N; f += 128) { G.currentFrame = f; const t0 = performance.now(); P.process([], [[L, R]]); q.push(performance.now() - t0); for (let i = 0; i < 128; i++) l[f + i] = L[i]; }
  return {l, q};
}
const hp = x => { const a = Math.exp(-2 * Math.PI * 2000 / 48000), y = new Float64Array(x.length); for (let pass = 0; pass < 2; pass++) { let px = 0, py = 0; const s = pass ? y.slice() : x; for (let i = 0; i < s.length; i++) { py = a * (py + s[i] - px); px = s[i]; y[i] = py; } } return y; };
export function steal(n, poly, file, xfLite) {
  const AB = run(n, poly, 'AB', file, xfLite).l, a = run(n, poly, 'A', file, xfLite).l, b = run(n, poly, 'B', file, xfLite).l, e = new Float64Array(AB.length);
  for (let i = 0; i < e.length; i++) e[i] = AB[i] - a[i] - b[i];
  const he = hp(e); let pk = 0, ref = 0; for (let i = 26400; i < 48000; i++) { pk = Math.max(pk, Math.abs(he[i])); ref = Math.max(ref, Math.abs(AB[i])); }
  return +(20 * Math.log10(Math.max(1e-12, pk) / ref)).toFixed(1);
}
if (import.meta.url === 'file://' + process.argv[1]) { const file = process.argv[2] || FILE; for (const n of [1, 3, 4, 6]) console.log('ops', n, 'click dB re peak: poly8', steal(n, 8, file), 'poly6', steal(n, 6, file, 1), 'poly4', steal(n, 4, file, 1)); }
