import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => { const p = mkPatch(t || {}); p.mfx = {type: 0, spd: 64, dep: 0}; p.dly = {type: 1, sync: 0, time: 110, note: 8, dep: 0}; p.eq = {lf: 320, lg: 0, hf: 6000, hg: 0}; for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const pad = {o1: {w: 0}, f: {type: 0, cut: 100, res: 10, eg: 0}, e1: {a: 0, d: 64, s: 127, r: 20}, e2: {a: 0, d: 64, s: 127, r: 20}};
const ev = [[0, 'on', 57, .9], [0, 'on', 60, .9], [0, 'on', 64, .9], [.4, 'off', 57], [.4, 'off', 60], [.4, 'off', 64]];
for (const fx of [{}, {eq: {lg: 12}}, {dly: {dep: 127}, eq: {lg: 12}}]) {
  const a = render(FXP(fx, pad), ev, {sec: 4, file: FILE, at: [[1.5, {mkFxKill: 1}]]});
  const w = [[1.52, 1.6], [1.6, 2], [2, 3], [3, 3.99]].map(([x, y]) => { let m = 0, mean = 0, c = 0; for (let i = x * SR; i < y * SR; i++) { m = Math.max(m, Math.abs(a.l[i])); mean += a.l[i]; c++; } return (20 * Math.log10(m + 1e-12)).toFixed(1) + '(dc ' + (mean / c).toExponential(1) + ')'; });
  console.log(JSON.stringify(fx), w.join(' | '), 'hot', a.P.mk.fx.hot(), 'dWr', a.P.mk.fx.dWr);
}
