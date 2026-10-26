import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, pdb} from './v3-mk1-ana.mjs';
const SR = 48000, SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
const dep = +(process.argv[2] || 100), spd = +(process.argv[3] || 64), type = +(process.argv[4] || 0);
const p = Object.assign(mkPatch(SOFT), {mfx: {type, spd, dep}});
const b = render(p, [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec: 3.2});
const b0 = render(mkPatch(SOFT), [[0, 'on', 84, .7], [0, 'on', 88, .6], [0, 'on', 91, .6]], {sec: 3.2});
for (const [n, y] of [['fx L', b.l], ['fx R', b.r], ['dry', b0.l]]) { const k = mKlick(y, SR, [0]); console.log(n, k.worst.toFixed(2), k.at.toFixed(3)); }
// count windows over 4 dB
function cnt(x) { const K = []; let c = 0; for (let t = .3; t < 3.1; t += .1) { const seg = x; } }
