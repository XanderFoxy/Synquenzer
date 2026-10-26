import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const four = [[.01, 'on', 60, .8], [.05, 'on', 64, .8], [.1, 'on', 67, .8], [.15, 'on', 72, .8]];
for (const [lab, top, t1, t2, lim, ev] of [['Dual 2+2 Stufe 2', {mode: 1, tv: 1}, {}, {}, 2, four], ['Split 66 Stufe 2 (3 Tasten unten)', {mode: 2, split: 66}, {}, {}, 2, four], ['3+1 T1 Unison Stufe 1', {mode: 1, tv: 2}, {asg: 2}, {}, 1, [[.01, 'on', 60, .8]]], ['3+1 T1 Unison Stufe 0', {mode: 1, tv: 2}, {asg: 2}, {}, 0, [[.01, 'on', 60, .8]]], ['Dual 2+2 Stufe 0', {mode: 1, tv: 1}, {}, {}, 0, four]]) {
  const r = render(prog(top, t1, t2), ev, {file: NEW, sec: .3, at: [[0, {set: {mkLim: lim}}]]});
  const v = r.P.mk.tm.map(t => t.V.filter(x => x.on && !x.ghost && !(x.fade > 0)).map(x => x.note));
  console.log(lab.padEnd(36), 'lim', r.P.mk.lim, 'T1', JSON.stringify(v[0]), 'T2', JSON.stringify(v[1]));
}
