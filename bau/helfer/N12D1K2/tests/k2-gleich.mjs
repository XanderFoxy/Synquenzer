// K2: old projects sound unchanged: renders without voice stealing are bit-identical to 4.23.0 (vs-base-B.html), FM and VA
import {render, FLAT, OP, FM6} from './k2-lib.mjs';
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname, OLD = process.argv[3] || new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname;
const x = {v: 2, n: 6, trans: 0, edges: [[2, 1], [4, 3], [5, 4]].map(([a, b]) => ({from: a, to: b})), ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: 1 + k % 3, ol: 85}))};
const ev = [[.01, 'on', 48], [.03, 'on', 55], [.05, 'on', 60], [.07, 'on', 64], [.8, 'off', 48], [.8, 'off', 55], [.9, 'off', 60], [1.0, 'off', 64]];
const va = Object.assign({}, FLAT, {eng: 0, o1lvl: 1, o2lvl: .5, ftype: 0, cutoff: 2000, res: .4, fenv: .3, lq: 1});
let bad = 0;
for (const [name, flat, fm] of [['FM', FLAT, FM6(x)], ['VA', va, null]]) { const a = render(flat, fm, ev, {sec: 1.6, file: NEW}), b = render(flat, fm, ev, {sec: 1.6, file: OLD});
  let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i])); if (d > 0) bad++; console.log((d === 0 ? 'OK   ' : 'FAIL ') + 'K2 gleich ' + name + ': max |Δ| = ' + d); }
process.exitCode = bad ? 1 : 0;
