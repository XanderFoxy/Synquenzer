// per-operator gain trace (fg1, voice of the first note) in an N-op graph vs the op alone; dx and point form; chain / parallel; chord
import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const PT = (i) => ({f: 'pt', y: [0, 99, 80 - i * 5, 60, 0], t: [5 + i * 20, 200 + i * 50, 300, 400], sus: 3});
const DX = (i) => ({f: 'dx', r: [80 - i * 5, 45 + i * 3, 40, 55], l: [99, 80, 60, 0]});
function graph(n, kind, form, only) {
  const edges = kind === 'chain' ? [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})) :
    kind === 'pairs' ? [[2, 1], [4, 3], [6, 5]].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})) : [];
  return {v: 2, n: 6, trans: 0, edges, ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: k < n && (only == null || only === k) ? 90 : 0, amp: form === 'pt' ? PT(k) : DX(k)}))};
}
function run(fm6, notes, sec) { const {G, procs} = scope(48000, FILE); const P = new procs['dirigent-analog']({processorOptions: {patch: FLAT, mods: [], fm6}});
  const ev = []; notes.forEach((nt, j) => { ev.push([.01 + j * .015, 1, j + 1, nt, .8, -1]); ev.push([1.0, 2, j + 1]); }); P.onMsg({ev});
  const L = new Float32Array(128), R = new Float32Array(128), rec = [], qm = []; let maxQ = 0, stolen = 0, ended = 0;
  for (let f = 0; f < 48000 * sec; f += 128) { G.currentFrame = f; const t0 = performance.now(); P.process([], [[L, R]]); const d = performance.now() - t0; qm.push(d);
    const v = P.V.find(v => v.on && v.id === 1); rec.push(v ? Array.from(v.fg1) : null); if (v && v.fade > 0) stolen++; }
  const msgs = (P.__msgs || []).filter(m => m.end).flatMap(m => m.end);
  return {rec, qm, msgs};
}
const out = [];
for (const form of ['dx', 'pt']) for (const kind of ['par', 'chain', 'pairs']) for (let n = 1; n <= 6; n++) {
  const A = run(FM6(graph(n, kind, form)), [57], 1.6); let worst = 0;
  for (let k = 0; k < n; k++) { const S = run(FM6(graph(n, kind, form, k)), [57], 1.6);
    for (let i = 0; i < A.rec.length; i++) { const a = A.rec[i] && A.rec[i][k], s = S.rec[i] && S.rec[i][k]; if (!(s > 1e-3)) continue; worst = Math.max(worst, Math.abs(20 * Math.log10((a || 1e-9) / s))); } }
  out.push(`${form} ${kind} n=${n} worstGainDev=${worst.toFixed(3)} dB`);
}
console.log(out.join('\n'));
