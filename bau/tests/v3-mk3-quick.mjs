import {render, mkPatch} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, OLD = new URL('../mk3work/index.mk2base.html', import.meta.url).pathname;
const ev = [[0, 'on', 48, .8], [.05, 'on', 52, .7], [.1, 'on', 55, .9], [.15, 'on', 60, .8], [.2, 'on', 64, .8], [.6, 'off', 52], [.8, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 60], [1.1, 'off', 64]];
const cases = [{}, {asg: 0}, {asg: 2}, {mix: {o1: 100, o2: 80, n: 30}, o2: {w: 1, mod: 2, semi: 7, tune: 5}, l1: {w: 3, ks: 2, sync: 0, f: 90, note: 6}}, {asg: 0, porta: 60, trig: 0}, {prio: 1, f: {type: 1, cut: 70, res: 100, eg: 30, vel: 10, kbd: 48}}];
let worst = 0;
for (const c of cases) { const p = mkPatch(c); const a = render(p, ev, {sec: 1.6, file: OLD}), b = render(p, ev, {sec: 1.6, file: NEW});
  let m = 0; for (let i = 0; i < a.l.length; i++) m = Math.max(m, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  const ea = a.msgs.filter(x => x.end).map(x => x.end).flat().sort().join(), eb = b.msgs.filter(x => x.end).map(x => x.end).flat().sort().join();
  console.log(JSON.stringify(c).slice(0, 60), 'max|d|', m, 'ends equal', ea === eb); worst = Math.max(worst, m); }
console.log('WORST', worst);
