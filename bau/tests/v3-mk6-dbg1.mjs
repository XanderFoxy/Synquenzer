import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, rms} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const c2 = [0, 20, 40, 60, 80, 100], ws = c2.map(x => Math.floor(x / 2) + 1);
const p = mkPatch({o1: {w: 5, c1: 0, c2: 0}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 6, q: [{k: 5, m: 1, v: c2.concat(Z()).slice(0, 16)}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
const r = renderW(p, [[0, 'on', 57, .8]], {sec: 1.6, file: FILE}, ws), y = r.l;
console.log(mKlick(y, SR, [0]));
for (let k = 0; k < 7; k++) console.log(k, rms(y, k * 12000 + 2000, k * 12000 + 10000).toFixed(4));
console.log(r.msgs.filter(m => m.mkwNeed != null));
// one wave alone
for (const c of [80, 100]) { const q = mkPatch({o1: {w: 5, c1: 0, c2: c}, a: {gate: 1, lvl: 64}}); const z = renderW(q, [[0, 'on', 57, .8]], {sec: .3, file: FILE}, [Math.floor(c / 2) + 1]); console.log(c, rms(z.l, 4000, 12000).toFixed(4), z.msgs.filter(m => m.mkwNeed != null)); }
