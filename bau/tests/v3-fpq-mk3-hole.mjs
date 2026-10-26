// FP-DSP: M-EINBRUCH when a held key moves to the other timbre (Einzeln→Split, SPLIT point over a held key), equal and similar timbres, many seeds
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {mKlick, mEinbruch, db, rms} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const cases = [
  ['INIT, Einzeln→Split 60, Taste 64 wandert T1→T2', {mode: 0}, {}, {}, {mode: 2, split: 60}, 64],
  ['INIT, Split 60→70, Taste 64 wandert T2→T1', {mode: 2, split: 60}, {}, {}, {split: 70}, 64],
  ['T2 = T1 + Filter 100, Split 60→70', {mode: 2, split: 60}, {f: {cut: 110}}, {f: {cut: 100}}, {split: 70}, 64],
  ['Dreieck beide, Split 60→70', {mode: 2, split: 60}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 70}, 64],
  ['Säge / Säge+Oktave (T2 trans 12), Split 60→70', {mode: 2, split: 60}, {}, {trans: 12}, {split: 70}, 64],
  ['Schicht→Split 60 (T1 fällt weg), Taste 64', {mode: 1}, {}, {}, {mode: 2, split: 60}, 64],
];
for (const [lab, top, t1, t2, msg, note] of cases) {
  const ws = [], ks = [];
  for (let s = 1; s <= 24; s++) {
    const r = render(prog(top, t1, t2), [[0, 'on', note, .8]], {file: NEW, sec: 1, seed: s, at: [[.5, {mkSet: msg}]]});
    const e = mEinbruch(r.l, SR, .5), k = mKlick(r.l, SR, [0]); ws.push(e.worst); ks.push(k.worst);
  }
  const bad = ws.filter(x => x < -3).length; ws.sort((a, b) => a - b);
  console.log(lab + ': M-EINBRUCH schlechtester ' + ws[0].toFixed(1) + ' dB, Median ' + ws[12].toFixed(1) + ' dB, ' + bad + '/24 Seeds < −3 dB; M-KLICK max ' + Math.max(...ks).toFixed(1) + ' dB');
}
