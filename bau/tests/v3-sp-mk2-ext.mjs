// FP-DSP MK2: NaN / Inf and peaks at extreme values (Teil F): waves 3-6, every control at a stop or random, Res 127, PATCH 1-4 at
// +-63 on random destinations, notes 0 ... 127, 20 s for the hardest cases. Node, the app worklet + the app's own tables.
import {renderW, mkPatch} from './v3-mk2-node.mjs';
let s = +(process.env.SEED || 4242); const R = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
const ri = (a, b) => a + Math.floor(R() * (b - a + 1)), ex = (a, b) => (R() < .7 ? (R() < .5 ? a : b) : ri(a, b));
const ALL = []; for (let n = 1; n <= 64; n++) ALL.push(n);
function randT(w) {
  return {asg: ri(0, 2), prio: ri(0, 2), trig: ri(0, 1), udet: ex(0, 99), trans: ex(-24, 24), tune: ex(-50, 50), vib: ex(-63, 63), bend: ex(-12, 12), porta: R() < .3 ? ex(0, 127) : 0,
    o1: {w, c1: ex(0, 127), c2: ex(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ex(-24, 24), tune: ex(-63, 63)},
    mix: {o1: ex(0, 127), o2: ex(0, 127), n: ex(0, 127)}, f: {type: ri(0, 3), cut: ex(0, 127), res: R() < .6 ? 127 : ex(0, 127), eg: ex(-63, 63), vel: ex(-63, 63), kbd: ex(-63, 63)},
    a: {lvl: ex(0, 127), pan: ex(-63, 63), gate: ri(0, 1), dist: ri(0, 1), vel: ex(-63, 63), kbd: ex(-63, 63)},
    e1: {a: ex(0, 127), d: ex(0, 127), s: ex(0, 127), r: ex(0, 127), rst: ri(0, 1)}, e2: {a: ex(0, 40), d: ex(0, 127), s: ex(0, 127), r: ex(0, 60), rst: ri(0, 1)},
    l1: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ex(0, 127), note: ri(0, 14)}, l2: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ex(0, 127), note: ri(0, 14)},
    p: [0, 1, 2, 3].map(() => ({s: ri(0, 7), d: ri(0, 7), i: R() < .8 ? (R() < .5 ? 63 : -63) : ri(-63, 63)}))};
}
const N = +(process.env.N || 80), SEC = +(process.env.SEC || 3); let nan = 0, worstPk = 0, worstAt = '', rows = [];
for (let k = 0; k < N; k++) {
  const w = 3 + (k % 4), t = randT(w), p = mkPatch(t);
  const ev = []; let tt = 0; const held = [];
  while (tt < SEC - .3) { if (held.length && R() < .4) ev.push([tt, 'off', held.shift()]); else { const n = R() < .5 ? ex(0, 127) : ri(20, 110); if (!held.includes(n)) { ev.push([tt, 'on', n, R() < .5 ? 1 : R()]); held.push(n); } } tt += .05 + R() * .4; }
  const at = []; for (let q = 0; q < 6; q++) at.push([R() * SEC, {mkWheel: {bend: R() * 2 - 1, mod: R()}}]);
  if (w === 5) for (let q = 0; q < 6; q++) at.push([R() * SEC, {mkSet: {'t.0.o1.c2': ri(0, 127)}}]);
  const r = renderW(p, ev, {sec: SEC, seed: ri(1, 99999), at}, ALL);
  let pk = 0, bad = 0; for (let i = 0; i < r.l.length; i++) { const a = r.l[i], b = r.r[i]; if (!isFinite(a) || !isFinite(b)) { bad++; continue; } const m = Math.max(Math.abs(a), Math.abs(b)); if (m > pk) pk = m; }
  if (bad) { nan++; rows.push('NaN/Inf case ' + k + ' w' + w + ' n=' + bad + ' ' + JSON.stringify(t)); }
  if (pk > worstPk) { worstPk = pk; worstAt = 'case ' + k + ' w' + w + ' ' + JSON.stringify(t); }
}
console.log('cases', N, 'x', SEC, 's; NaN/Inf cases', nan, '; worst peak', (20 * Math.log10(worstPk)).toFixed(1), 'dBFS', worstAt.slice(0, 900));
if (rows.length) console.log(rows.slice(0, 5).join('\n'));
