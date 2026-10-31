// K1-04 Zustandsfreiheit: the same notes, two different knob paths (A: many detours while notes sound, B: straight to the
// end values) -> the note played after the paths ends renders equal (<= -90 dB) - VA (eng 0), FM6 (eng 1) and MS 2000 (eng 3)
import {va, INIT, diffDb} from './n5-k-lib.mjs';
import {render as mkr, mkPatch} from './v3-mk1-node.mjs';
import {FILE as KF} from './n5-k-lib.mjs';
const file = process.argv[2] || KF, sr = 48000;
let rnd = 5; const R = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };
const notes = [[0, 'on', 48, .9], [.3, 'on', 55, .7], [1.2, 'off', 48], [1.4, 'off', 55], [4, 'on', 60, .8], [5.5, 'off', 60]];
const out = {};
// VA: detours over every knob kind incl. structural keys
{
  const fin = {cutoff: 900, res: .7, drive: .5, o1w: 1, o2lvl: .6, o2w: 2, o3lvl: .5, o3w: 3, ftype: 1, fenv: .4, l1rate: 3, aD: .4, o1uni: 3, lq: 1, o2sync: 1};
  const keys = Object.keys(fin), detour = [];
  for (let t = .05; t < 1.6; t += .013) { const k = keys[Math.floor(R() * keys.length)], v = fin[k]; detour.push([t, {set: {[k]: typeof v === 'number' && !Number.isInteger(v) ? v * (.2 + 2 * R()) : Math.floor(R() * 4) % (k === 'ftype' ? 6 : k === 'o1uni' ? 7 : 2) + (k === 'o1uni' ? 1 : 0)}}]); }
  detour.push([1.7, {set: fin}]);
  const base = Object.assign({}, INIT, {analog: .15, cutoff: 3000});
  const A = va(base, notes, {sec: 6, at: detour, file}), B = va(base, notes, {sec: 6, at: [[1.7, {set: fin}]], file});
  out.va = +diffDb(A.l, B.l, 4 * sr, 6 * sr).toFixed(1);
}
// MS 2000: detours through mkSet fractions, then the end values
{
  const pm = mkPatch({});
  const fin = {'t.0.f.cut': 70, 't.0.f.res': 90, 't.0.f.eg': 30, 't.0.mix.o2': 100, 't.0.o2.semi': 7, 't.0.l1.f': 80, 't.0.e1.d': 70, 't.0.o1.w': 1, 't.0.a.dist': 1};
  const keys = Object.keys(fin), detour = [];
  for (let t = .05; t < 1.6; t += .013) { const k = keys[Math.floor(R() * keys.length)]; detour.push([t, {mkSet: {[k]: fin[k] * (.3 + 1.4 * R()) + R()}}]); }
  detour.push([1.7, {mkSet: fin}]);
  const A = mkr(pm, notes, {sec: 6, at: detour, file}), B = mkr(pm, notes, {sec: 6, at: [[1.7, {mkSet: fin}]], file});
  out.mk = +diffDb(A.l, B.l, 4 * sr, 6 * sr).toFixed(1);
}
console.log(JSON.stringify(out));
