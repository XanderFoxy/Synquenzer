import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const SR = 48000, SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
let seed = 7; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const nz = n => { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (rnd() * 2 - 1) * .15; return x; };
for (const [nm, fx, at] of [['cho127 static', {mfx: {type: 0, spd: 64, dep: 127}}, []], ['cho100 static', {mfx: {type: 0, spd: 64, dep: 100}}, []], ['ens static', {mfx: {type: 1, spd: 64, dep: 100}}, []], ['pha static', {mfx: {type: 2, spd: 64, dep: 100}}, []],
  ['type sw', {mfx: {type: 0, spd: 64, dep: 100}}, [[.8, {mkSet: {'mfx.type': 1}}], [1.4, {mkSet: {'mfx.type': 2}}], [2, {mkSet: {'mfx.type': 0}}]]], ['dep jump', {mfx: {type: 0, spd: 64, dep: 0}}, [[.8, {mkSet: {'mfx.dep': 127}}], [1.6, {mkSet: {'mfx.dep': 0}}]]]]) {
  const x = nz(SR * 3.2); const a = render(Object.assign(mkPatch({}), fx), [], {sec: 3.2, tap: 'fx', at: [[0, {mkFxIn: {l: x, r: x}}]].concat(at)});
  const b = render(Object.assign(mkPatch(SOFT), fx), [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec: 3.2, at});
  const r = [a.l, a.r, b.l, b.r].map(y => { const k = mKlick(y, SR, [0]); return k.worst.toFixed(1) + '@' + k.at.toFixed(3); });
  console.log(nm, r.join('  '));
}
