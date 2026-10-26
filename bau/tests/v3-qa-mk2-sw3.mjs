// M-EINBRUCH fails at wave changes: real holes or window/period artefacts? Compare with the same measure on steady parts.
import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {pdb, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000;
let s = 11; const RND = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
const ALL = []; for (let n = 1; n <= 64; n++) ALL.push(n);
// steady-state "dip": 5 ms windows (1 ms step) in [t0, t0 + 50 ms] vs mean of [t0 - 50, t0 - 10]
function dip(x, c) { const W = 240, win = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W; };
  let pre = 0, n = 0; for (let i = c - 2400; i + W <= c - 480; i += 48) { pre += win(i); n++; } pre /= n; let w = 0; for (let i = c; i < c + 2400; i += 48) w = Math.min(w, pdb(win(i) / pre)); return w; }
for (let k = 0; k < 40; k++) {
  const note = [45, 52, 57, 64, 69, 76][k % 6], seq = []; for (let j = 0; j < 6; j++) seq.push(1 + Math.floor(RND() * 64));
  const at = seq.slice(1).map((n, j) => [.3 + j * .25, {mkSet: {'t.0.o1.c2': 2 * n - 2}}]);
  const r = renderW(mkPatch({o1: {w: 5, c2: 2 * seq[0] - 2}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}), [[0, 'on', note, .8]], {sec: 1.7, at}, ALL);
  at.forEach((a, j) => { if (seq[j] === seq[j + 1]) return; const t = Math.ceil(a[0] * SR / 128) * 128 / SR, e = mEinbruch(r.l, SR, t);
    if (!e.ok) { const c = Math.round(t * SR); console.log('note', note, 'wave', seq[j], '->', seq[j + 1], 'M-EINBRUCH', e.worst.toFixed(1), 'step', e.step.toFixed(1), '| same measure on steady old wave (t-120ms):', dip(r.l, c - 5760).toFixed(1), '| steady new wave (t+100ms):', dip(r.l, c + 4800).toFixed(1)); } });
}
