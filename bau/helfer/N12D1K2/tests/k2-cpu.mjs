// K2-03: CPU per voice (µs per 128-sample quantum, 6 held voices, after warm-up) for 1..6 FM operators vs a VA voice
import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const file = process.argv[2] || FILE;
function graph(n, kind) { const E = kind === 'chain' ? [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]] : kind === 'pairs' ? [[2, 1], [4, 3], [6, 5]] : [];
  return {v: 2, n: 6, trans: 0, edges: E.filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})), ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: k < n ? 80 : 0, amp: {f: 'pt', y: [0, 99, 80, 70, 0], t: [5, 300, 300, 400], sus: 3}}))}; }
export function bench(patch, fm6, file_) {
  const {G, procs} = scope(48000, file_ || file); const P = new procs['dirigent-analog']({processorOptions: {patch, mods: [], fm6}});
  const ev = []; [48, 52, 55, 59, 62, 65].forEach((nt, j) => ev.push([.001, 1, j + 1, nt, .8, -1])); P.onMsg({ev});
  const L = new Float32Array(128), R = new Float32Array(128); let tot = 0, cnt = 0;
  for (let f = 0; f < 48000 * 6; f += 128) { G.currentFrame = f; const t0 = performance.now(); P.process([], [[L, R]]); if (f > 48000 * 2) { tot += performance.now() - t0; cnt++; } }
  return +(tot / cnt / 6 * 1000).toFixed(2);
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const va = Object.assign({}, FLAT, {eng: 0, o1lvl: 1, o2lvl: 1, o3lvl: 0, ftype: 0, cutoff: 3000, res: .3, fenv: .3, lq: 1});
  for (let r = 0; r < 2; r++) {
    const row = {va: bench(va, null)};
    for (const kind of ['par', 'pairs', 'chain']) for (const n of [1, 3, 4, 6]) row[kind + n] = bench(FLAT, FM6(graph(n, kind)));
    console.log(JSON.stringify(row));
  }
}
