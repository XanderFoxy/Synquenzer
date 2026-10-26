import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
const ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
const tims = [{}, {o1: {w: 1, c1: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 90, n: 20}, f: {type: 1, cut: 70, res: 80, eg: 30}, l1: {f: 90}}, {o1: {w: 3, c1: 64}, f: {type: 2, cut: 60}, a: {dist: 1}, asg: 2}];
for (const t of tims) { const p = mkPatch(t); for (const [x, y] of [[FILE, PREV], [PREV, PREV], [FILE, FILE]]) { const a = render(p, ev, {sec: 1.2, file: x}), b = render(p, ev, {sec: 1.2, file: y}); let w = 0, first = -1; for (let i = 0; i < a.l.length; i++) { const d = Math.abs(a.l[i] - b.l[i]); if (d > w) w = d; if (d > 1e-9 && first < 0) first = i; } console.log(w, first); } }
