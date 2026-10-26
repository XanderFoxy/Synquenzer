import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const PATCHES = {
  init: {},
  voll: {o1: {w: 1, c1: 30}, mix: {o1: 110, o2: 80, n: 30}, o2: {w: 0, semi: 7, mod: 3}, f: {type: 0, cut: 80, res: 90, eg: 30, kbd: 20}, l1: {w: 3, f: 80}, l2: {w: 2, f: 60}, p: [{s: 2, d: 4, i: 20}, {s: 3, d: 0, i: 3}, {s: 0, d: 2, i: 30}, {s: 4, d: 5, i: 10}]},
  stimmw: {o1: {w: 4, c1: 50, c2: 40}, mix: {o1: 127, o2: 40, n: 0}, f: {type: 1, cut: 90, res: 40}}};
// 4 keys retriggered every 0.5 s (like the probe)
const evs = n => { const e = []; const ks = [48, 55, 60, 64].slice(0, n); for (let t = 0; t < 6; t += .5) for (const k of ks) { e.push([t, 'on', k, .8, k + '_' + t]); e.push([t + .45, 'off', k, 0, k + '_' + t]); } return e; };
const run = (p, ev) => { const r = render(p, ev, {file: NEW, sec: 6, quantumMs: true}); const q = r.qms.slice(Math.round(1 * SR / 128)); return q.reduce((a, b) => a + b, 0); };
const N = +(process.env.N || 7);
for (const [nm, t] of Object.entries(PATCHES)) {
  const cases = {S4: [prog({mode: 0}, t, t), evs(4)], D22k2: [prog({mode: 1, tv: 1}, t, t), evs(2)], D22k4: [prog({mode: 1, tv: 1}, t, t), evs(4)], S2: [prog({mode: 0}, t, t), evs(2)]};
  const out = {}; for (const k in cases) out[k] = [];
  run(...cases.S4);   // warm up
  for (let i = 0; i < N; i++) for (const k in cases) out[k].push(run(...cases[k]));
  const mn = k => Math.min(...out[k]), md = k => med(out[k]);
  console.log(nm.padEnd(7), 'Single 4 keys', md('S4').toFixed(0), 'ms | Dual 2+2 2 keys', md('D22k2').toFixed(0), '→ median ×' + (md('D22k2') / md('S4')).toFixed(3), 'min ×' + (mn('D22k2') / mn('S4')).toFixed(3),
    '| Dual 2+2 4 keys → median ×' + (md('D22k4') / md('S4')).toFixed(3), 'min ×' + (mn('D22k4') / mn('S4')).toFixed(3), '| (Single 2 keys ×' + (md('S2') / md('S4')).toFixed(3) + ')');
}
