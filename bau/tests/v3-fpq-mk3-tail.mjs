// FP-DSP: release tails of notes not concerned by a SPLIT / MODUS change (do they get cut?)
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const pad = {o1: {w: 2}, e2: {a: 0, d: 64, s: 127, r: 100}};
const lv = (x, a, b) => db(rms(x.l, Math.round(a * SR), Math.round(b * SR)) + rms(x.r, Math.round(a * SR), Math.round(b * SR)));
const cases = [
  ['Split 60: T1-Ausklang von C3, T2 hält C5, SPLIT 60→62', {mode: 2, split: 60}, {split: 62}, [[0, 'on', 48, .8], [.2, 'off', 48], [.1, 'on', 72, .8]], 1],
  ['Split 60: T1-Ausklang von C3, T2 hält C5, SPLIT 60→40 (C3 nun T2-Bereich)', {mode: 2, split: 60}, {split: 40}, [[0, 'on', 48, .8], [.2, 'off', 48], [.1, 'on', 72, .8]], 1],
  ['Schicht: Ausklang C3 (beide), hält G3, STIMMEN 2+2→3+1', {mode: 1, tv: 1}, {tv: 2}, [[0, 'on', 48, .8], [.2, 'off', 48], [.1, 'on', 55, .8]], 0],
];
for (const [lab, top, msg, ev, solo] of cases) {
  const at0 = solo ? [[0, {mkSolo: solo}]] : [];
  const a = render(prog(top, pad, {o1: {w: 1}}), ev, {file: NEW, sec: 1.5, at: at0});
  const b = render(prog(top, pad, {o1: {w: 1}}), ev, {file: NEW, sec: 1.5, at: at0.concat([[.5, {mkSet: msg}]])});
  console.log(lab + (solo ? ' (nur T1 gehört)' : '') + ': Pegel 0,6–0,9 s ohne Wechsel ' + lv(a, .6, .9).toFixed(1) + ' dB, mit Wechsel ' + lv(b, .6, .9).toFixed(1) + ' dB; 1,0–1,4 s ' + lv(a, 1, 1.4).toFixed(1) + ' / ' + lv(b, 1, 1.4).toFixed(1));
}
