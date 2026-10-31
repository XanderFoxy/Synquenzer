import {scope, FLAT, OP, FM6, FILE} from './k2-lib.mjs';
function x(n, only) { return {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: (k < n && (only == null || only === k)) ? 99 : 0}))}; }
function run(fm6) { const {G, procs} = scope(48000, FILE); const P = new procs['dirigent-analog']({processorOptions: {patch: FLAT, mods: [], fm6}});
  P.onMsg({ev: [[.01, 1, 1, 57, .8, -1]]}); const L = new Float32Array(128), R = new Float32Array(128), rec = [];
  for (let f = 0; f < 48000 * .4; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); const v = P.V.find(v => v.on); rec.push(v ? [v.fg1[0], v.flvl[0], v.vgain, v.fgate, v.panL] : null); } return rec; }
const A = run(FM6(x(6))), S = run(FM6(x(6, 0)));
for (const i of [5, 10, 20, 50, 100]) console.log(i, JSON.stringify(A[i]), JSON.stringify(S[i]));
