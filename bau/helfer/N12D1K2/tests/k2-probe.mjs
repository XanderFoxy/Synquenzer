import {render, mag, db, FLAT, OP, FM6} from './k2-lib.mjs';
const LV = +(process.env.LV || 1); FLAT.level = LV;
const sr = 48000, note = 57, f0 = 220;   // A3
// n active carriers (no edges), op k at ratio k+1; the others off (ol 0)
function x(n, amp, only) { return {v: 2, n: 6, trans: 0, edges: [], ops: [0, 1, 2, 3, 4, 5].map(k => OP(k, {coarse: k + 1, ol: (k < n && (only == null || only === k)) ? 99 : 0, ...(amp ? {amp} : {})}))}; }
const ev = [[0.01, 'on', note, .8], [1.2, 'off', note]];
const win = +(process.env.WIN || 1024), frames = []; for (let i = 0; i + win < 1.8 * sr; i += 2400) frames.push(i);
const envOf = (l, k) => frames.map(i => db(mag(l, f0 * (k + 1), sr, i, i + win)));
for (const n of [1, 2, 3, 4, 5, 6]) {
  const A = render(FLAT, FM6(x(n)), ev, {sec: 1.8});
  let worst = 0, off = [];
  for (let k = 0; k < n; k++) {
    const S = render(FLAT, FM6(x(n, null, k)), ev, {sec: 1.8});
    const ea = envOf(A.l, k), es = envOf(S.l, k);
    const o = ea[8] - es[8]; off.push(o.toFixed(1));
    for (let j = 0; j < ea.length; j++) if (es[j] > -60) worst = Math.max(worst, Math.abs(ea[j] - es[j] - o));
  }
  const pk = A.l.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  console.log(n, 'shape dev dB', worst.toFixed(2), 'level off vs solo', off.join(','), 'peak', pk.toFixed(3), 'ms/q', (A.qms.reduce((a, b) => a + b, 0) / A.qms.length).toFixed(4));
}
