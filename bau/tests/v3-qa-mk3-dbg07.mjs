import {render, mkDefaults} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const saw = {o1: {w: 0}, f: {cut: 100, res: 40}}, pad = {o1: {w: 1, c1: 30}, f: {cut: 90}, e2: {a: 40, r: 60}, a: {lvl: 110}};
const x = render(prog({mode: 0}, pad, saw), [[0, 'on', 60, .8]], {file: NEW, sec: 1.2, at: [[.5, {mkSet: {mode: 1}}]]});
const a = render(prog({mode: 0}, pad, saw), [[0, 'on', 60, .8]], {file: NEW, sec: 1.2});
const q = prog({mode: 1}, pad, saw); q.t[0].a.lvl = 0; const b = render(q, [[.5, 'on', 60, .8]], {file: NEW, sec: 1.2});
const s0 = Math.round(.5 * SR), N = Math.round(.04 * SR);
for (const [lab, f] of [['sin 40 ms', u => Math.sin(Math.PI / 2 * u)], ['none (plain onset)', u => 1]]) {
  const y = a.l.map((v, i) => v + b.l[i] * (i < s0 ? 0 : i < s0 + N ? f((i - s0) / N) : 1)); const k = mKlick(y, SR, [0]); console.log('ideal', lab, k.worst.toFixed(1), '@', k.at.toFixed(3)); }
const k = mKlick(x.l, SR, [0]); console.log('app Einzeln→Schicht', k.worst.toFixed(1), '@', k.at.toFixed(3));
const k2 = mKlick(x.l, SR, [0, .5]); console.log('app, switch counted as planned onset (3 ms)', k2.worst.toFixed(1), '@', k2.at.toFixed(3));
