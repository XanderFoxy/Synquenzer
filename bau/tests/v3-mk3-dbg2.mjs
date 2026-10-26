import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const ev = []; for (let k = 0; k < 12; k++) ev.push([k * .05, 'on', 40 + k * 3, .8]);
for (const top of [{mode: 1, tv: 0}, {mode: 1, tv: 1}, {mode: 1, tv: 2}, {mode: 2, split: 55}]) for (const [a1, a2] of [[1, 1], [2, 1], [0, 1], [2, 2], [2, 0]]) {
  const p = prog(top, {asg: a1}, {asg: a2});
  for (const t of [.1, .3, .58]) { const r = render(p, ev, {sec: t, file: NEW}); const c = r.P.mk.tm.map(tm => tm.V.filter(v => v.on && !v.ghost).map(v => v.note + (v.fade > 0 ? 'f' : '')).join(','));
    if (r.P.mk.tm.reduce((s, tm) => s + tm.V.filter(v => v.on && !v.ghost).length, 0) > 4) console.log(JSON.stringify(top), a1, a2, t, c, r.P.mk.tm.map(x => [x.cv, x.cu, x.ea])); }
}
