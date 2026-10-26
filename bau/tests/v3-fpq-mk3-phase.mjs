import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
for (const [lab, t] of [['Säge', {}], ['Dreieck', {o1: {w: 2}}]]) {
  const s1 = render(prog({mode: 0}, t, t), [[0, 'on', 60, .8]], {file: NEW, sec: .5});
  const L1 = db(rms(s1.l, 4800, 24000));
  const lv = []; for (let s = 1; s <= 24; s++) { const r = render(prog({mode: 1}, t, t), [[0, 'on', 60, .8]], {file: NEW, sec: .5, seed: s}); lv.push(db(rms(r.l, 4800, 24000)) - L1); }
  lv.sort((a, b) => a - b);
  // same seed, the note played twice in a row: does it come out the same each time?
  console.log(lab + ': Schicht (T1 = T2) gegen Einzeln je Seed: min ' + lv[0].toFixed(1) + ' dB, Median ' + lv[12].toFixed(1) + ', max ' + lv[23].toFixed(1) + ' dB');
  const r = render(prog({mode: 1}, t, t), [[0, 'on', 60, .8], [.3, 'off', 60], [.4, 'on', 60, .8], [.7, 'off', 60], [.8, 'on', 60, .8], [1.1, 'off', 60], [1.2, 'on', 60, .8], [1.5, 'off', 60]], {file: NEW, sec: 1.6, seed: 3});
  const ln = [0, .4, .8, 1.2].map(t0 => (db(rms(r.l, Math.round((t0 + .05) * SR), Math.round((t0 + .25) * SR))) - L1).toFixed(1));
  console.log(lab + ': Schicht, viermal C4 nacheinander (ein Seed): ' + ln.join(' / ') + ' dB gegen Einzeln');
}
