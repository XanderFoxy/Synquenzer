import {diffDb} from './n5-k-lib.mjs';
import {render as mkr, mkPatch} from './v3-mk1-node.mjs';
import {FILE as KF} from './n5-k-lib.mjs';
const file = process.argv[2] || KF, sr = 48000;
const notes = [[0, 'on', 48, .9], [.3, 'on', 55, .7], [1.2, 'off', 48], [1.4, 'off', 55], [4, 'on', 60, .8], [5.5, 'off', 60]];
const fin = {'t.0.f.cut': 70, 't.0.f.res': 90, 't.0.f.eg': 30, 't.0.mix.o2': 100, 't.0.o2.semi': 7, 't.0.l1.f': 80, 't.0.e1.d': 70, 't.0.o1.w': 1, 't.0.a.dist': 1};
for (const k of Object.keys(fin)) {
  const pm = mkPatch({});
  const detour = [[.5, {mkSet: {[k]: fin[k] * .5 + .37}}], [1.0, {mkSet: {[k]: fin[k] * 1.3 + .2}}], [1.7, {mkSet: fin}]];
  const A = mkr(pm, notes, {sec: 6, at: detour, file}), B = mkr(pm, notes, {sec: 6, at: [[1.7, {mkSet: fin}]], file});
  // also: no notes during the detour
  const n2 = [[4, 'on', 60, .8], [5.5, 'off', 60]];
  const A2 = mkr(pm, n2, {sec: 6, at: detour, file}), B2 = mkr(pm, n2, {sec: 6, at: [[1.7, {mkSet: fin}]], file});
  console.log(k, diffDb(A.l, B.l, 4 * sr, 6 * sr).toFixed(1), 'silent', diffDb(A2.l, B2.l, 4 * sr, 6 * sr).toFixed(1));
}
