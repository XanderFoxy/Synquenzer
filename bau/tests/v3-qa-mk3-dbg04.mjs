import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const saw = {o1: {w: 0}, f: {cut: 100, res: 40}}, pad = {o1: {w: 1, c1: 30}, f: {cut: 90}, e2: {a: 40, r: 60}, a: {lvl: 110}};
const one = [[0, 'on', 60, .8]], ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
// klick only in the window 0.49 .. 0.56 s (the switch) vs. the same window without switch
const kWin = (x) => { const k = mKlick(x.l.subarray(Math.round(.4 * SR), Math.round(.7 * SR)), SR, []); return k; };
for (const [lab, top, msg, ev, t1, t2] of [['saw/saw 1+3→3+1 Akkord', {mode: 1, tv: 0}, {tv: 2}, ch, saw, saw], ['saw/pad Einzeln→Split Akkord', {mode: 0}, {mode: 2, split: 57}, ch, saw, pad],
  ['pad/saw Schicht→1 (1 Note)', {mode: 1}, {mode: 0}, one, pad, saw], ['pad/saw Split 60→61', {mode: 2, split: 60}, {split: 61}, one, pad, saw], ['saw/pad Split 61→60', {mode: 2, split: 61}, {split: 60}, one, saw, pad],
  ['pad/saw 1→Schicht', {mode: 0}, {mode: 1}, one, pad, saw]]) {
  const p = prog(top, t1, t2), x = render(p, ev, {file: NEW, sec: 1.2, at: [[.5, {mkSet: msg}]]}), y = render(p, ev, {file: NEW, sec: 1.2});
  const p2 = prog(Object.assign({}, top, msg), t1, t2), z = render(p2, ev, {file: NEW, sec: 1.2});
  const kx = mKlick(x.l, SR, [0]), ky = mKlick(y.l, SR, [0]), kz = mKlick(z.l, SR, [0]);
  console.log(lab.padEnd(34), 'switch worst', kx.worst.toFixed(1), '@', kx.at.toFixed(3), '| no switch (old state)', ky.worst.toFixed(1), '@', ky.at.toFixed(3), '| new state from start', kz.worst.toFixed(1), '@', kz.at.toFixed(3));
}
