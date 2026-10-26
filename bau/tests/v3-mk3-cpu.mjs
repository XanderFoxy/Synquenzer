// MK3-08 CPU helper: per-quantum time (median of the steady part) and process CPU time, min over N interleaved runs
import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = process.env.MK_FILE || new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
export const tt = {o1: {w: 1, c1: 30}, mix: {o1: 110, o2: 80, n: 20}, o2: {w: 0, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}, l1: {w: 2, f: 80}, p: [{s: 2, d: 4, i: 20}, {s: 3, d: 0, i: 3}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]};
const k4 = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]], k2 = k4.slice(0, 2);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const run = (p, ev) => { const c0 = process.cpuUsage(); const r = render(p, ev, {file: NEW, sec: 6, quantumMs: true}); const c = process.cpuUsage(c0); return [med(r.qms.slice(Math.round(2 * SR / 128))), (c.user + c.system) / 1000]; };
export function cpu(n) {
  const C = {S4: [prog({mode: 0}, tt), k4], D22: [prog({mode: 1, tv: 1}, tt, tt), k2]};
  const out = {S4: [], D22: []};
  for (let i = 0; i < n; i++) for (const k in C) out[k].push(run(...C[k]));
  const mn = (k, j) => Math.min(...out[k].map(x => x[j])), md = (k, j) => med(out[k].map(x => x[j]));
  return {q: [mn('S4', 0), mn('D22', 0)], qMed: [md('S4', 0), md('D22', 0)], cpu: [mn('S4', 1), mn('D22', 1)], ratioQ: mn('D22', 0) / mn('S4', 0), ratioCpu: mn('D22', 1) / mn('S4', 1), ratioMed: md('D22', 0) / md('S4', 0)};
}
if (process.argv[1] && process.argv[1].endsWith('v3-mk3-cpu.mjs')) console.log(JSON.stringify(cpu(+process.env.N || 7)));
