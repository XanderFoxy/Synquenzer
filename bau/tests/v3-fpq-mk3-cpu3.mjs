// QA: Single 4 voices CPU MK2 vs MK3 (interleaved, min of medians), plus 1 voice
import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, OLD = new URL('../synq-snapshots/MK2.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); return p; };
const tt = {o1: {w: 1, c1: 30}, mix: {o1: 110, o2: 80, n: 20}, o2: {w: 0, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, l1: {w: 2, f: 80}};
const k4 = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const o = {OLD4: [], NEW4: [], OLD1: [], NEW1: [], OLD0: [], NEW0: []};
for (let i = 0; i < 9; i++) for (const [k, f, ev] of [['OLD4', OLD, k4], ['NEW4', NEW, k4], ['OLD1', OLD, k4.slice(0, 1)], ['NEW1', NEW, k4.slice(0, 1)], ['OLD0', OLD, []], ['NEW0', NEW, []]]) {
  const r = render(prog({mode: 0}, tt), ev, {file: f, sec: 5, quantumMs: true}); o[k].push(med(r.qms.slice(Math.round(1.5 * SR / 128))));
}
const mn = k => Math.min(...o[k]) * 1000;
console.log('Single 4 Stimmen: MK2 ' + mn('OLD4').toFixed(2) + ' µs, MK3 ' + mn('NEW4').toFixed(2) + ' µs (' + (mn('NEW4') / mn('OLD4')).toFixed(3) + '×); 1 Stimme MK2 ' + mn('OLD1').toFixed(2) + ' / MK3 ' + mn('NEW1').toFixed(2) + ' (' + (mn('NEW1') / mn('OLD1')).toFixed(3) + '×); still MK2 ' + mn('OLD0').toFixed(2) + ' / MK3 ' + mn('NEW0').toFixed(2));
