// QA: per-quantum peak during repeated program switches (warm JIT), MK3 vs MK2 assignment switch
import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, OLD = new URL('../synq-snapshots/MK2.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const tt = {o1: {w: 1, c1: 30}, mix: {o1: 110, o2: 80, n: 20}, o2: {w: 0, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, l1: {w: 2, f: 80}};
const k4 = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
function probe(file, p, msgs, lab) {
  const at = []; for (let k = 0; k < 20; k++) at.push([.5 + k * .4, {mkSet: msgs[k % msgs.length]}]);
  const r = render(p, k4, {file, sec: 8.6, quantumMs: true, at});
  const rows = [];
  for (let k = 0; k < 20; k++) { const i = Math.round((.5 + k * .4) * SR / 128); const w = r.qms.slice(i, i + 24), pre = r.qms.slice(i - 60, i - 2); rows.push([med(pre), Math.max(...w), med(w)]); }
  const late = rows.slice(10);
  console.log(lab + ': vorher Median ' + (med(late.map(x => x[0])) * 1000).toFixed(1) + ' µs; in 64 ms nach Wechsel Median ' + (med(late.map(x => x[2])) * 1000).toFixed(1) + ' µs, Spitze (Median der Spitzen, Wechsel 11-20) ' + (med(late.map(x => x[1])) * 1000).toFixed(1) + ' µs, größte ' + (Math.max(...late.map(x => x[1])) * 1000).toFixed(1) + ' µs; erste 3 Spitzen ' + rows.slice(0, 3).map(x => (x[1] * 1000).toFixed(0)).join('/'));
}
for (let rep = 0; rep < 2; rep++) {
probe(OLD, prog({mode: 0}, tt), [{'t.0.asg': 2}, {'t.0.asg': 1}], 'MK2 Zuweisung Poly↔Unison');
probe(NEW, prog({mode: 0}, tt), [{'t.0.asg': 2}, {'t.0.asg': 1}], 'MK3 Zuweisung Poly↔Unison');
probe(NEW, prog({mode: 0}, tt, tt), [{mode: 1}, {mode: 0}], 'MK3 Einzeln↔Schicht');
probe(NEW, prog({mode: 1}, tt, tt), [{tv: 0}, {tv: 2}], 'MK3 STIMMEN 1+3↔3+1');
probe(NEW, prog({mode: 2, split: 50}, tt, tt), [{split: 58}, {split: 50}], 'MK3 SPLIT 50↔58');
}
