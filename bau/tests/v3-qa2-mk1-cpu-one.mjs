// one config per process (fresh JIT), one long render, mean quantum time per 5-s window (µs)
import {render, mkPatch} from './v3-mk1-node.mjs';
const cfgName = process.argv[2], sec = +(process.argv[3] || 40);
const AMP = mkPatch(Object.assign({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20}, process.env.AMPX ? JSON.parse(process.env.AMPX) : {}));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const ev = n => [36, 43, 48, 52].slice(0, n).map(x => [0, 'on', x, .8]);
const cfg = {amS: () => render(AMP, [], {sec, quantumMs: true}), am1: () => render(AMP, ev(1), {sec, quantumMs: true, mw0: .5}), am4: () => render(AMP, ev(4), {sec, quantumMs: true, mw0: .5}),
  vaS: () => render(null, [], {sec, quantumMs: true, eng: 0, flat: VA}), va1: () => render(null, ev(1), {sec, quantumMs: true, eng: 0, flat: VA}), va4: () => render(null, ev(4), {sec, quantumMs: true, eng: 0, flat: VA})};
const q = cfg[cfgName]().qms, W = 1875, out = [];
for (let s = 0; s + W <= q.length; s += W) { let a = 0; for (let i = s; i < s + W; i++) a += q[i]; out.push(+(a / W * 1000).toFixed(2)); }
console.log(JSON.stringify({cfg: cfgName, win_us: out}));
