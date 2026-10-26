import {render, mkDefaults} from './v3-mk1-node.mjs';
import {zcFreq} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const sine = {o1: {w: 3, c1: 0}};
const out = [];
for (const [sc, key, note, want, mode] of [[8, 9, 61, -130, 0], [6, 9, 72, -5.87, 0], [2, 0, 70, 17.60, 0], [7, 0, 69, 60, 2], [5, 4, 65, -9.78, 1], [9, 4, 68, 33, 0]]) {
  const top = {mode, split: 0, scale: sc, skey: key, usc: sc === 9 ? [0, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0] : null};
  const r = render(prog(top, sine, sine), [[0, 'on', note, .8]], {file: NEW, sec: 1.2, at: mode ? [[0, {mkSolo: 2}]] : []});
  const f = zcFreq(r.l, 9600, 57600, SR), f0 = 440 * Math.pow(2, (note - 69) / 12), ct = 1200 * Math.log2(f / f0);
  out.push('Stimmung ' + sc + ' Grundton ' + key + ' Note ' + note + (mode ? ' (T2, Modus ' + mode + ')' : '') + ': ' + ct.toFixed(2) + ' ct (Soll ' + want + ')');
}
console.log(out.join('\n'));
