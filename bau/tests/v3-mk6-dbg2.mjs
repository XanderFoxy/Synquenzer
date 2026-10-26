import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, rms} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const c2 = [0, 20, 40, 60, 80, 100], ws = c2.map(x => Math.floor(x / 2) + 1);
const p = mkPatch({o1: {w: 5, c1: 0, c2: 40}, a: {gate: 1, lvl: 64}}); p.t[0].seq = {on: 1, last: 6, type: 0, run: 1, ks: 1, res: 6, q: [{k: 5, m: 1, v: c2.map(x => x - 40).concat(Z()).slice(0, 16)}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
const y = renderW(p, [[0, 'on', 57, .8]], {sec: 1.6, file: FILE}, ws).l;
// per-boundary M-KLICK
for (let k = 1; k < 7; k++) { const a = k * 12000 - 2400, b = k * 12000 + 2400; console.log('seq boundary', k, mKlick(y.subarray(a, b), SR, []).worst.toFixed(1)); }
// the same changes as knob jumps (mkSet) at the same instants
const q = mkPatch({o1: {w: 5, c1: 0, c2: 0}, a: {gate: 1, lvl: 64}}), at = c2.map((v, k) => [k * .25 - .0003, {mkSet: {'t.0.o1.c2': v}}]).slice(1).concat([[1.5 - .0003, {mkSet: {'t.0.o1.c2': 0}}]]);
const z = renderW(q, [[0, 'on', 57, .8]], {sec: 1.6, file: FILE, at}, ws).l;
for (let k = 1; k < 7; k++) { const a = k * 12000 - 2400, b = k * 12000 + 2400; console.log('knob jump', k, mKlick(z.subarray(a, b), SR, []).worst.toFixed(1)); }
