import {va, INIT, rms, db, mag} from './n5-k-lib.mjs';
const sr = 48000, ev = [[0, 'on', 57, .8], [0.9, 'off', 57]];   // A3 220 Hz
const R = (p) => va(Object.assign({}, INIT, {analog: 0}, p), ev, {sec: 1});
const seg = r => rms(r.l, 9600, 38400);
const cases = {
  o1: {o1lvl: 1}, o2: {o1lvl: 0, o2lvl: 1, o2fine: 0}, o3: {o1lvl: 0, o3lvl: 1, o3w: 0, o3oct: 0},
  o3def: {o1lvl: 0, o3lvl: 1}, o3pulse8: {o1lvl: 0, o3lvl: 1, o3w: 1, o3oct: 0},
};
for (const k in cases) { const r = R(cases[k]); console.log(k, db(seg(r)).toFixed(2), 'f0', db(mag(r.l, 220, sr, 9600, 38400)).toFixed(1), 'f/2', db(mag(r.l, 110, sr, 9600, 38400)).toFixed(1)); }
// effect of o3 changes on o1+o2: render o1 alone, then o1 + o3 with o3lvl 0 but other o3 params changed
const a = R({o1lvl: 1, o2lvl: .7, o2fine: 0});
for (const ch of [{o3w: 0}, {o3oct: 1}, {o3semi: 5}, {o3fine: 30}, {o3uni: 5}, {o3pw: .2}]) {
  const b = R(Object.assign({o1lvl: 1, o2lvl: .7, o2fine: 0}, ch)); let s = 0; for (let i = 0; i < a.l.length; i++) s += (a.l[i] - b.l[i]) ** 2; console.log('o3 change', JSON.stringify(ch), 'diff', s);
}
