import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const PT = (i) => ({f: 'pt', y: [0, 99, 80, 60, 0], t: [5, 200, 300, 400], sus: 3});
function graph(n, kind) { const edges = kind === 'chain' ? [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})) : [];
  return {v: 2, n: 6, trans: 0, edges, ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: k < n ? 90 : 0, amp: PT(k)}))}; }
function bench(n, kind, notes, poly, xfLite) {
  const {G, procs} = scope(48000, FILE); const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, FLAT, {poly, xfLite}), mods: [], fm6: FM6(graph(n, kind))}});
  const ev = []; for (let rep = 0; rep < 4; rep++) notes.forEach((nt, j) => { ev.push([.01 + rep * 1.0 + j * .015, 1, rep * 10 + j + 1, nt, .8, -1]); ev.push([.8 + rep * 1.0, 2, rep * 10 + j + 1]); });
  P.onMsg({ev}); const L = new Float32Array(128), R = new Float32Array(128); let tot = 0, cnt = 0, maxOn = 0, faded = new Set();
  for (let f = 0; f < 48000 * 4.2; f += 128) { G.currentFrame = f; const t0 = performance.now(); P.process([], [[L, R]]); const d = performance.now() - t0; if (f > 48000) { tot += d; cnt++; }
    let on = 0; for (const v of P.V) if (v.on) { on++; if (v.fade > 0 && v.gate) faded.add(v.id); } maxOn = Math.max(maxOn, on); }
  return {msPerQ: +(tot / cnt).toFixed(4), maxOn, stolenGated: faded.size};
}
const chord = [48, 52, 55, 59, 62, 65];
for (const kind of ['par', 'chain']) for (const n of [1, 3, 4, 6]) console.log(kind, n, JSON.stringify(bench(n, kind, chord, 8, 0)), 'poly6', JSON.stringify(bench(n, kind, chord, 6, 1)), 'poly4', JSON.stringify(bench(n, kind, chord, 4, 1)));
