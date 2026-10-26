import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const pluck = {o1: {w: 0}, f: {type: 0, cut: 90, res: 20, eg: 30}, e1: {a: 0, d: 50, s: 0, r: 30}, e2: {a: 0, d: 60, s: 0, r: 30}};
const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [2.0, 'on', 64, .9], [2.5, 'off', 64]];
// type change Phaser -> Cho/Flg while silent; reference: an engine that always had Cho/Flg (same history otherwise)
const a = render(FXP({mfx: {type: 2, spd: 64, dep: 127}}, pluck), ev, {sec: 2.6, file: FILE, at: [[1.0, {mkSet: {'mfx.type': 0}}]]});
const b = render(FXP({mfx: {type: 0, spd: 64, dep: 127}}, pluck), ev, {sec: 2.6, file: FILE});
const fx = a.P.mk.fx;
const lv = (y, t0, t1) => db(rms(y, Math.round(t0 * SR), Math.round(t1 * SR)));
let w = 0, wl = 0; for (let i = 2.0 * SR; i < 2.6 * SR; i++) { w = Math.max(w, Math.abs(a.l[i] - b.l[i])); } for (let i = 2.1 * SR; i < 2.6 * SR; i++) wl = Math.max(wl, Math.abs(a.l[i] - b.l[i]));
console.log('type change while silent: note 2 max |d| 0-600 ms', w.toFixed(4), ', 100-600 ms', wl.toFixed(5), '; fx.mOn stale =', fx.mOn, '(md', fx.md, ')');
console.log('level a-b 0-10/10-30/30-60 ms:', [[2, 2.01], [2.01, 2.03], [2.03, 2.06]].map(([x, y]) => (lv(a.l, x, y) - lv(b.l, x, y)).toFixed(2)).join(' / '));
// stale mOn right after a tail went quiet
const c = render(FXP({mfx: {type: 2, spd: 64, dep: 127}}, pluck), [[0, 'on', 60, .9], [.3, 'off', 60]], {sec: 1.5, file: FILE, at: [[1.0, {mkSet: {'mfx.dep': 0}}]]});
console.log('after dep -> 0 while silent: sMd', c.P.mk.fx.sMd, 'sW', c.P.mk.fx.sW, 'active()', c.P.mk.fx.active(), 'hot()', c.P.mk.fx.hot());
