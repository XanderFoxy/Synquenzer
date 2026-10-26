import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const t = {o1: {w: 1, c1: 30}, mix: {o1: 110, o2: 80, n: 30}, o2: {w: 0, semi: 7, mod: 3}, f: {type: 0, cut: 80, res: 90, eg: 30, kbd: 20}, l1: {w: 3, f: 80}, l2: {w: 2, f: 60}, p: [{s: 2, d: 4, i: 20}, {s: 3, d: 0, i: 3}, {s: 0, d: 2, i: 30}, {s: 4, d: 5, i: 10}]};
const k4 = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]], k2 = k4.slice(0, 2);
const run = (p, ev) => { const c0 = process.cpuUsage(); const r = render(p, ev, {file: NEW, sec: 8, quantumMs: true}); const c = process.cpuUsage(c0); const q = r.qms.slice(Math.round(1 * SR / 128)).sort((a, b) => a - b); return [q[q.length >> 1] * 1000, (c.user + c.system) / 1000]; };
const cases = {S4: [prog({mode: 0}, t, t), k4], D22: [prog({mode: 1, tv: 1}, t, t), k2], D13: [prog({mode: 1, tv: 0}, t, t), k2.concat([[0, 'on', 60, .8]])]};
const out = {S4: [], D22: [], D13: []}; run(...cases.S4);
for (let i = 0; i < 9; i++) for (const k of (i % 2 ? ['S4', 'D22', 'D13'] : ['D13', 'D22', 'S4'])) out[k].push(run(...cases[k]));
for (const j of [0, 1]) { const lab = j ? 'CPU-Zeit' : 'Quantum-Median µs'; const s = out.S4.map(x => x[j]), d = out.D22.map(x => x[j]), e = out.D13.map(x => x[j]);
  console.log(lab, 'S4 med', med(s).toFixed(1), 'min', Math.min(...s).toFixed(1), '| D22 med', med(d).toFixed(1), 'min', Math.min(...d).toFixed(1), '→ med ×' + (med(d) / med(s)).toFixed(3), 'min ×' + (Math.min(...d) / Math.min(...s)).toFixed(3), '| D13(3 keys: 1+3 → 4 voices) med ×' + (med(e) / med(s)).toFixed(3), 'min ×' + (Math.min(...e) / Math.min(...s)).toFixed(3)); }
