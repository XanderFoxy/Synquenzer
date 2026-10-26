// Independent repro: M-EINBRUCH per Spec v3 §16 (5-ms RMS windows, 1-ms step, -50..+50 ms, ref = mean of windows -50..-10 ms)
// when a held key moves to the other timbre (MODUS / SPLIT) with equal timbres. Also a control: the same switch with T2 = T1
// but the key staying in its timbre (STIMMEN 2+2 -> 1+3 re-assigns inside a timbre and inherits phases).
import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
const pdb = x => 10 * Math.log10(x + 1e-30);
function mEin16(x, t) {
  const W = Math.round(.005 * SR), c = Math.round(t * SR), st = Math.round(.001 * SR);
  const win = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W; };
  const ws = []; for (let i = c - Math.round(.05 * SR); i + W <= c + Math.round(.05 * SR); i += st) ws.push([(i - c) / SR, win(i)]);
  const pre = ws.filter(([u]) => u + .005 <= -.01 + 1e-9); const ref = pre.reduce((a, b) => a + b[1], 0) / pre.length;
  let worst = 0, at = 0; for (const [u, e] of ws) { const d = pdb(e / ref); if (d < worst) { worst = d; at = u; } }
  // level after the switch (60..100 ms) relative to ref, to tell a hole from a level step
  let post = 0, m = 0; for (let i = c + Math.round(.06 * SR); i + W <= c + Math.round(.1 * SR); i += W) { post += win(i); m++; }
  return {worst, at, step: pdb(post / m / ref)};
}
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const cases = [
  ['INIT Säge, MODUS Einzeln→Split 60, Taste 64 T1→T2', {mode: 0}, {}, {}, {mode: 2, split: 60}, 64],
  ['INIT Säge, MODUS Split 60→Einzeln, Taste 64 T2→T1', {mode: 2, split: 60}, {}, {}, {mode: 0}, 64],
  ['Dreieck beide, MODUS Einzeln→Split 60, T1→T2', {mode: 0}, {o1: {w: 2}}, {o1: {w: 2}}, {mode: 2, split: 60}, 64],
  ['Dreieck beide, SPLIT 60→70, T2→T1', {mode: 2, split: 60}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 70}, 64],
  ['Dreieck beide, SPLIT 64→65 (one step of a split drag)', {mode: 2, split: 64}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 65}, 64],
  ['KONTROLLE Dreieck, Split, STIMMEN 2+2→1+3 (Taste bleibt in T2)', {mode: 2, split: 60, tv: 1}, {o1: {w: 2}}, {o1: {w: 2}}, {tv: 0}, 64],
  ['KONTROLLE Dreieck, Split, Taste 50 bleibt T1 (SPLIT 60→70)', {mode: 2, split: 60}, {o1: {w: 2}}, {o1: {w: 2}}, {split: 70}, 50],
];
for (const [lab, top, t1, t2, msg, note] of cases) {
  const res = [];
  for (let s = 1; s <= 24; s++) {
    const r = render(prog(top, t1, t2), [[0, 'on', note, .8]], {file: NEW, sec: 1, seed: s, at: [[.5, {mkSet: msg}]]});
    const e = mEin16(r.l, .5); res.push({s, ...e});
  }
  const bad = res.filter(x => x.worst < -3); const w = res.slice().sort((a, b) => a.worst - b.worst);
  console.log(lab.padEnd(64) + ' worst ' + w[0].worst.toFixed(1) + ' dB (seed ' + w[0].s + ', at ' + (w[0].at * 1000).toFixed(0) + ' ms), median ' + w[12].worst.toFixed(1) +
    ' dB, ' + bad.length + '/24 < -3 dB, level step after ' + w[0].step.toFixed(1) + ' dB');
}
