// FP-DSP MK2: "Aus = bitgleich" (B.6 Nr. 1, MK2-07) with a random fuzz of MK1 sounds (waves 0-2, every MK1 field random,
// patches with random source/destination but intensity 0) and the VA factory flats: 4.9.0 vs 4.10.0 in Node.
import {render, mkPatch} from './v3-mk1-node.mjs'; import fs from 'fs';
const OLD = new URL('../synq-snapshots/G-MK1-merged.html', import.meta.url).pathname;
const NEW = new URL('../mk-wt/index.html', import.meta.url).pathname;
let s = 777; const R = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
function randT() {
  return {asg: ri(0, 2), prio: ri(0, 2), trig: ri(0, 1), udet: ri(0, 99), trans: ri(-24, 24), tune: ri(-50, 50), vib: ri(-63, 63), bend: ri(-12, 12), porta: R() < .3 ? ri(0, 127) : 0,
    o1: {w: ri(0, 2), c1: ri(0, 127), c2: ri(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ri(-24, 24), tune: ri(-63, 63)},
    mix: {o1: ri(0, 127), o2: ri(0, 127), n: ri(0, 127)}, f: {type: ri(0, 3), cut: ri(0, 127), res: ri(0, 127), eg: ri(-63, 63), vel: ri(-63, 63), kbd: ri(-63, 63)},
    a: {lvl: ri(0, 127), pan: ri(-63, 63), gate: ri(0, 1), dist: ri(0, 1), vel: ri(-63, 63), kbd: ri(-63, 63)},
    e1: {a: ri(0, 127), d: ri(0, 127), s: ri(0, 127), r: ri(0, 127), rst: ri(0, 1)}, e2: {a: ri(0, 60), d: ri(0, 127), s: ri(0, 127), r: ri(0, 80), rst: ri(0, 1)},
    l1: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ri(0, 127), note: ri(0, 14)}, l2: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ri(0, 127), note: ri(0, 14)},
    p: [0, 1, 2, 3].map(() => ({s: ri(0, 7), d: ri(0, 7), i: 0}))};
}
const N = +(process.env.N || 60); let worst = 0, bad = [], cnt = 0;
for (let k = 0; k < N; k++) {
  const p = mkPatch(randT());
  const ev = [[0, 'on', ri(30, 90), R()], [.15, 'on', ri(30, 90), R()], [.5, 'off', null], [.7, 'on', ri(20, 100), R()], [1.2, 'off', null]];
  // resolve offs to the notes
  const evs = []; const on = []; for (const e of ev) { if (e[1] === 'on') { evs.push(e); on.push(e[2]); } else evs.push([e[0], 'off', on.shift()]); }
  const o = {sec: 1.6, seed: ri(1, 9999), bpm: ri(60, 180), mw0: R(), songStart: R() < .5 ? 0 : null};
  const a = render(p, evs, Object.assign({file: OLD}, o)), b = render(p, evs, Object.assign({file: NEW}, o));
  let d = 0; for (let i = 0; i < a.l.length; i++) { const x = Math.abs(a.l[i] - b.l[i]), y = Math.abs(a.r[i] - b.r[i]); if (x > d) d = x; if (y > d) d = y; if (Number.isNaN(a.l[i]) !== Number.isNaN(b.l[i])) d = Infinity; }
  cnt++; if (d > worst) worst = d; if (d > 1e-6) bad.push(k + ':' + d.toExponential(2) + ' ' + JSON.stringify(p.t[0]).slice(0, 300));
}
console.log('MK1 fuzz', cnt, 'sounds, max |d|', worst, bad.length ? '\n' + bad.join('\n') : 'all <= 1e-6');
const flats = JSON.parse(fs.readFileSync(new URL('./v3-sp-mk1-flats.json', import.meta.url), 'utf8'));
const ev = [[0, 'on', 48, .8], [0.05, 'on', 55, .6], [0.1, 'on', 64, .9], [0.8, 'off', 48], [0.9, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 72, .7], [1.6, 'off', 72]];
let w2 = 0, bad2 = [];
for (const f of flats) {
  const o = {sec: 2.2, eng: f.flat.eng, flat: f.flat, mods: f.mods, seed: 1};
  const a = render(null, ev, Object.assign({file: OLD}, o)), b = render(null, ev, Object.assign({file: NEW}, o));
  let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  if (d > w2) w2 = d; if (d > 1e-6) bad2.push(f.id + ' ' + d.toExponential(2));
}
console.log('VA flats', flats.length, 'max |d|', w2, bad2.join(', ') || 'none over 1e-6');
