import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
let rs = 1234; const rnd = () => { rs = (Math.imul(rs, 1103515245) + 12345) >>> 0; return rs / 4294967296; }; const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const randT = () => ({asg: ri(0, 2), prio: ri(0, 2), trig: ri(0, 1), udet: ri(0, 99), trans: ri(-24, 24), tune: ri(-50, 50), vib: ri(-63, 63), bend: ri(-12, 12), porta: ri(0, 127) * (rnd() < .5 ? 0 : 1),
  o1: {w: ri(0, 6), c1: ri(0, 127), c2: ri(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ri(-24, 24), tune: ri(-63, 63)}, mix: {o1: ri(0, 127), o2: ri(0, 127), n: ri(0, 127)},
  f: {type: ri(0, 3), cut: ri(20, 127), res: ri(0, 120), eg: ri(-63, 63), vel: ri(-63, 63), kbd: ri(-63, 63)}, a: {lvl: ri(40, 127), pan: ri(-63, 63), gate: ri(0, 1), dist: ri(0, 1), vel: ri(-63, 63), kbd: ri(-63, 63)},
  e1: {a: ri(0, 80), d: ri(0, 127), s: ri(0, 127), r: ri(0, 90), rst: ri(0, 1)}, e2: {a: ri(0, 60), d: ri(0, 127), s: ri(0, 127), r: ri(0, 90), rst: ri(0, 1)},
  l1: {w: ri(0, 3), ks: ri(0, 2), sync: 0, f: ri(0, 127), note: ri(0, 14)}, l2: {w: ri(0, 3), ks: ri(0, 2), sync: 0, f: ri(0, 127), note: ri(0, 14)},
  p: [0, 1, 2, 3].map(() => ({s: ri(0, 7), d: ri(0, 7), i: ri(-63, 63)}))});
const EVS = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .9], [.15, 'on', 64, .6], [.2, 'on', 67, .8], [.45, 'off', 48], [.5, 'on', 72, 1], [.6, 'off', 55], [.7, 'off', 60], [.8, 'on', 43, .5], [.9, 'off', 64], [1.0, 'off', 67], [1.1, 'off', 72], [1.2, 'off', 43]];
const want = +(process.argv[2] || 7);
let T1, T2, TOP;
for (let k = 0; k < 24; k++) { const t1 = randT(), t2 = randT(); t1.mix.n = Math.max(t1.mix.n, 60); t2.l1.w = 3; t2.a.lvl = Math.max(80, t2.a.lvl); t1.a.lvl = Math.max(80, t1.a.lvl);
  const top = {mode: k % 3 === 2 ? 2 : 1, tv: k % 3, split: ri(50, 66), scale: ri(0, 8), skey: ri(0, 11)}; if (k === want) { T1 = t1; T2 = t2; TOP = top; } }
const md = (x, y) => { let m = 0; for (let i = 0; i < x.l.length; i++) m = Math.max(m, Math.abs(x.l[i] - y.l[i]), Math.abs(x.r[i] - y.r[i])); return m; };
// discrepancy: T1 audible with T2 PEGEL 0  vs  T1 audible with T2 PEGEL full but soloed T1
const disc = (top, t1, t2) => { const R = (p, o) => render(p, EVS, Object.assign({file: NEW, sec: 1.6, seed: 7 + want}, o || {}));
  return md(R(prog(top, t1, merge(C(t2), {a: {lvl: 0}}))), R(prog(top, t1, t2), {at: [[0, {mkSolo: 1}]]})); };
const D = Object.assign(mkDefaults().t[0], {p: [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}]});
let cur = [C(TOP), C(T1), C(T2)], base = disc(...cur); console.log('start', base.toExponential(2));
for (let pass = 0; pass < 2; pass++) for (const w of [1, 2, 0]) { const obj = cur[w], keys = Object.keys(obj);
  for (const key of keys) { if (w === 2 && key === 'a') continue;
    const trial = C(cur); if (w === 0) { if (key === 'mode' || key === 'tv') continue; delete trial[0][key]; } else trial[w][key] = C(D[key]);
    const d = disc(...trial); if (d > 1e-4) { cur = trial; } } }
// also try sub-fields of a for T2
console.log('reduced', JSON.stringify(cur), disc(...cur).toExponential(2));
