import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const p = prog({mode: 1}, {o1: {w: 0}, mix: {n: Number(process.argv[2] || 40)}}, {o1: {w: 1}, mix: {n: Number(process.argv[2] || 40)}}), ev = [[0, 'on', 57, .8], [0, 'on', 64, .8]];
const R = o => render(p, ev, Object.assign({file: NEW, sec: 1, seed: 5}, o));
const x = R({at: [[.3, {mkSolo: 1}]]}), s = R({at: [[0, {mkSolo: 1}]]}), q = C(p); q.t[1].a.lvl = 0; const o = render(q, ev, {file: NEW, sec: 1, seed: 5});
const lv = (a, t0, t1) => db(rms(a, Math.round(t0 * SR), Math.round(t1 * SR)));
const dif = (a, b) => a.map((v, i) => v - b[i]);
for (const [t0, t1] of [[.30, .31], [.31, .33], [.33, .4], [.4, .6], [.6, .95]]) console.log(t0, t1, 'x−s', lv(dif(x.l, s.l), t0, t1).toFixed(1), ' x−only', lv(dif(x.l, o.l), t0, t1).toFixed(1), ' s−only', lv(dif(s.l, o.l), t0, t1).toFixed(1), ' T1', lv(o.l, t0, t1).toFixed(1));
{ const r = dif(x.l, s.l).slice(Math.round(.31 * SR), Math.round(.31 * SR) + 8192); let lo = 0, hi = 0; // DFT energy split at 40 Hz
  const N = r.length; for (let k = 1; k < 400; k++) { let re = 0, im = 0; for (let i = 0; i < N; i++) { const a = 2 * Math.PI * k * i / N; re += r[i] * Math.cos(a); im -= r[i] * Math.sin(a); } const e = re * re + im * im; if (k * SR / N < 40) lo += e; else hi += e; }
  console.log('residual 0.31..0.48 s: energy < 40 Hz', (10 * Math.log10(lo)).toFixed(1), 'dB, 40 Hz .. 2.3 kHz', (10 * Math.log10(hi)).toFixed(1), 'dB'); }
