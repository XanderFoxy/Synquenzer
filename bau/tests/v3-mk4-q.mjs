import {render, mkPatch} from './v3-mk1-node.mjs';
const p = mkPatch({a: {gate: 1}}); p.dly = {type: 0, sync: 1, time: 64, note: 5, dep: 64};
const N = 48000 * 2, l = new Float32Array(N), r = new Float32Array(N); l[4800] = .5; r[4800] = .5;
const o = render(p, [], {sec: 2, at: [[0, {mkFxIn: {l, r}}]]});
const pk = []; for (let i = 0; i < o.l.length; i++) if (Math.abs(o.l[i]) > 1e-2) pk.push([i, +o.l[i].toFixed(4)]);
console.log(pk.slice(0, 10), o.msgs.filter(m => m.mkFxMem));
