import {render, mkPatch} from './v3-mk1-node.mjs';
import {zcFreq} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, Z = () => new Array(16).fill(0);
const p = mkPatch({o2: {w: 2, semi: 0}, mix: {o1: 0, o2: 127, n: 0}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [{k: 6, m: 1, v: [24, -24, 0].concat(Z()).slice(0, 16)}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
for (const f of [FILE, process.env.MK_PREV2]) { if (!f) continue; const r = render(p, [[0, 'on', 60, .8]], {sec: .4, file: f, at: [[0, {mkScope: true}]]}); const y = r.l;
  console.log([0, 1, 2].map(k => (1200 * Math.log2(zcFreq(y, k * 6000 + 1000, k * 6000 + 5400, 48000) / 261.6256)).toFixed(2)).join(' '), r.msgs.filter(m => m.mkScope).slice(3, 9).map(m => JSON.stringify(m.mkScope.seq[0].vals)).join(' ')); }
