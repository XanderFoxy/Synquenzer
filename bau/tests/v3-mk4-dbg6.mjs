import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const SR = 48000, SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
const typ = +(process.argv[2] || 0);
const at = [[.8, {mkSet: {'mfx.dep': 127}}], [1.6, {mkSet: {'mfx.dep': 0}}]];
const b = render(Object.assign(mkPatch(SOFT), {mfx: {type: typ, spd: 64, dep: 0}}), [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec: 3.2, at});
const b2 = render(Object.assign(mkPatch(SOFT), {mfx: {type: typ, spd: 64, dep: 127}}), [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec: 3.2});
for (const t of [.8, 1.6]) for (const [n, y] of [['L', b.l], ['R', b.r], ['staticL', b2.l]]) { const sl = y.subarray(Math.round((t - .03) * SR), Math.round((t + .125) * SR)); const k = mKlick(sl, SR, []); console.log(t, n, k.worst.toFixed(2), (t - .03 + k.at).toFixed(3)); }
