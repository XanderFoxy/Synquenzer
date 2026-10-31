// the same envelope on OP k alone (k = 1..6) must give the same gain trace as on OP 1 (position-independent), dx and point form, carrier and modulator
import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
const ENV = {pt: {f: 'pt', y: [0, 99, 70, 50, 0], t: [30, 250, 300, 400], sus: 3}, dx: {f: 'dx', r: [70, 45, 40, 55], l: [99, 80, 60, 0]}};
function run(fm6) { const {G, procs} = scope(48000, FILE); const P = new procs['dirigent-analog']({processorOptions: {patch: FLAT, mods: [], fm6}});
  P.onMsg({ev: [[.01, 1, 1, 57, .8, -1], [1.0, 2, 1]]}); const L = new Float32Array(128), R = new Float32Array(128), rec = [];
  for (let f = 0; f < 48000 * 1.6; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); const v = P.V.find(v => v.on && v.id === 1); rec.push(v ? Array.from(v.fg1) : [0, 0, 0, 0, 0, 0]); } return rec; }
for (const form of ['dx', 'pt']) {
  const tr = [];
  for (let k = 0; k < 6; k++) { const x = {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(j => OP(j, {ol: j === k ? 90 : 0, amp: ENV[form]}))}; tr.push(run(FM6(x)).map(r => r[k])); }
  const dev = tr.map(t => t.reduce((m, g, i) => tr[0][i] > 1e-3 ? Math.max(m, Math.abs(20 * Math.log10((g || 1e-9) / tr[0][i]))) : m, 0).toFixed(3));
  console.log(form, 'dev vs OP1', dev.join(' '));
}
