import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: NEW, sec: 1.6}, o || {}));
const ev = [[0, 'on', 48, .8], [.1, 'on', 55, .7], [.2, 'on', 60, .9], [.3, 'on', 64, .6], [.6, 'off', 55], [.8, 'on', 67, .8], [1.2, 'off', 48], [1.2, 'off', 60], [1.2, 'off', 64], [1.2, 'off', 67]];
const lv = x => db(rms(x.l) + rms(x.r));
for (const [a1, a2] of [[0, 2], [0, 1], [2, 0], [2, 2], [1, 1]]) for (const amp of [0, 1]) {
  const t1 = {asg: a1, o1: {w: 1}, p: amp ? [{s: 2, d: 5, i: 40}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}] : undefined, a: {vel: amp ? 40 : 0}}, t2 = {asg: a2, o1: {w: 0}, p: amp ? [{s: 3, d: 5, i: 40}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 30}] : undefined};
  const top = {mode: 1, tv: 1};
  const sT1 = R(prog(top, t1, t2), ev, {at: [[0, {mkSolo: 1}]]});
  const pa = R(prog(top, t1, merge(JSON.parse(JSON.stringify(t2)), {a: {lvl: 0}})), ev);
  const d = {l: pa.l.map((x, i) => x - sT1.l[i]), r: pa.r.map((x, i) => x - sT1.r[i])};
  console.log('asg ' + a1 + '/' + a2 + (amp ? ' mit AMP-Patch/Vel' : ' ohne') + ': (T2 PEGEL 0) − (Solo T1) = ' + lv(d).toFixed(1) + ' dB, T1 ' + lv(sT1).toFixed(1) + ' dB');
}
