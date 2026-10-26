import {render, mkPatch} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const p = mkPatch({mix: {o1: 100, o2: 0, n: 60}, l1: {w: 3, ks: 2, sync: 0, f: 100, note: 6}, f: {type: 0, cut: 80, res: 40, eg: 20, vel: 0, kbd: 0}});
p.mode = 1; p.tv = 1;
Object.assign(p.t[1], {asg: 1}); p.t[1].o1 = {w: 1, c1: 30, c2: 40}; p.t[1].mix = {o1: 90, o2: 0, n: 40}; p.t[1].l1 = {w: 3, ks: 0, sync: 0, f: 80, note: 6}; p.t[1].a = {lvl: 100, pan: 30, gate: 0, dist: 0, vel: 0, kbd: 0};
const ev = [[.05, 'on', 48, .8], [.1, 'on', 55, .7], [.15, 'on', 60, .9], [.6, 'off', 48], [.9, 'off', 55], [1, 'off', 60]];
const d = render(p, ev, {sec: 1.5, file: NEW}), a = render(p, ev, {sec: 1.5, file: NEW, at: [[0, {mkSolo: 1}]]}), b = render(p, ev, {sec: 1.5, file: NEW, at: [[0, {mkSolo: 2}]]});
let m = 0, pk = 0; for (let i = 0; i < d.l.length; i++) { m = Math.max(m, Math.abs(d.l[i] - a.l[i] - b.l[i]), Math.abs(d.r[i] - a.r[i] - b.r[i])); pk = Math.max(pk, Math.abs(d.l[i])); }
console.log('dual = sum', m, 'peak', pk);
const voices = d.msgs.filter(x => x.load).map(x => x.voices); console.log('voices', voices);
