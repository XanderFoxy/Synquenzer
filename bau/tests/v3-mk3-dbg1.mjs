import {render, mkDefaults} from './v3-mk1-node.mjs';
import {envDb} from './v3-mk1-ana.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const base = {o1: {w: 2}, f: {cut: 100}}, base2 = {o1: {w: 1, c1: 40}, f: {cut: 90}, trans: 12, a: {lvl: 110}};
const chord = [[0, 'on', 57, .8], [0, 'on', 61, .8], [0, 'on', 64, .8]];
const [top, msg] = JSON.parse(process.argv[2]);
for (const solo of [0, 1, 2]) {
  const at = [[.5, {mkSet: msg}]]; if (solo) at.unshift([0, {mkSolo: solo}]);
  const x = render(prog(top, base, base2), chord, {sec: 1, at, file: NEW});
  const e = envDb(x.l, SR, 5); console.log('solo', solo, e.slice(90, 116).map(v => v.toFixed(1)).join(' '));
}
