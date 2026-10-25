// QA MK1 (FP-DSP): M-KLICK / M-EINBRUCH on switches the builder's MK1-18 does not cover.
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, mEinbruch, rms, db} from './v3-mk1-ana.mjs';
const SR = 48000;
const out = [];
const rep = (nm, x, t, skip) => { const k = mKlick(x, SR, skip || [0]), e = mEinbruch(x, SR, t); const lvA = db(rms(x, Math.round((t - .06) * SR), Math.round((t - .01) * SR))), lvB = db(rms(x, Math.round((t + .06) * SR), Math.round((t + .11) * SR)));
  out.push((k.ok && e.ok ? 'ok   ' : 'FAIL ') + nm + ': M-KLICK ' + k.worst.toFixed(1) + ' dB @' + k.at.toFixed(3) + ' s, M-EINBRUCH ' + e.worst.toFixed(2) + ' dB, level ' + lvA.toFixed(1) + ' -> ' + lvB.toFixed(1) + ' dBFS'); };
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .2, poly: 8};
const tone = (over) => mkPatch(Object.assign({o1: {w: 0}, f: {type: 0, cut: 95, res: 20}, e2: {a: 0, d: 64, s: 127, r: 30}}, over || {}));
// 1. distortion on / off at a held note (not in MK_STRUCT: no SXF)
for (const mixv of [127, 64]) for (const [a, b] of [[0, 1], [1, 0]]) {
  const p = tone({mix: {o1: mixv, o2: 0, n: 0}, a: {dist: a}});
  const x = render(p, [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mkSet: {'t.0.a.dist': b}}]]}).l;
  rep('VERZERR. ' + a + ' -> ' + b + ' (Mixer ' + mixv + ', Saege A3, held)', x, .5);
}
// 1b. the same through the gesture path as the app sends it on a commit ({mk} whole block)
{
  const p = tone({mix: {o1: 127, o2: 0, n: 0}, a: {dist: 0}}), q = JSON.parse(JSON.stringify(p)); q.t[0].a.dist = 1;
  const x = render(p, [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mk: q}]]}).l; rep('VERZERR. 0 -> 1 via {mk}', x, .5);
}
// 2. engine change at a held key: VA -> MS 2000 and MS 2000 -> VA
{
  const p = tone({mix: {o1: 127, o2: 0, n: 0}});
  let x = render(p, [[0, 'on', 81, .8]], {sec: 1.2, eng: 0, flat: VA, at: [[.5, {set: Object.assign({}, VA, {eng: 3}), xf: true}]]}).l;
  rep('Engine VA -> MS 2000 (held)', x, .5);
  x = render(p, [[0, 'on', 81, .8]], {sec: 1.2, eng: 3, flat: VA, at: [[.5, {set: Object.assign({}, VA, {eng: 0}), xf: true}]]}).l;
  rep('Engine MS 2000 -> VA (held)', x, .5);
  // chord
  const ch = [[0, 'on', 81, .8], [0, 'on', 85, .8], [0, 'on', 88, .8]];
  x = render(p, ch, {sec: 1.2, eng: 3, flat: VA, at: [[.5, {set: Object.assign({}, VA, {eng: 0}), xf: true}]]}).l; rep('Engine MS 2000 -> VA (3 keys)', x, .5);
  x = render(p, ch, {sec: 1.2, eng: 0, flat: VA, at: [[.5, {set: Object.assign({}, VA, {eng: 3}), xf: true}]]}).l; rep('Engine VA -> MS 2000 (3 keys)', x, .5);
}
// 3. sound change ({mk} whole block, e.g. undo / program) at a held note: cutoff 95 -> 40, level 127 -> 60, pan 0 -> 63
{
  const p = tone({mix: {o1: 127}}), q = JSON.parse(JSON.stringify(p)); q.t[0].f.cut = 40; q.t[0].a.lvl = 60;
  const x = render(p, [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mk: q}]]}).l; rep('{mk} Cutoff 95->40 + Pegel 127->60 (held)', x, .5);
  const q2 = JSON.parse(JSON.stringify(p)); q2.t[0].a.pan = 63; const r2 = render(p, [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mk: q2}]]}); rep('{mk} Pan 0 -> R63 (L channel)', r2.l, .5);
}
// 4. assign changes at held keys
for (const [a, b] of [[1, 2], [2, 1], [0, 2], [2, 0]]) {
  const p = tone({asg: a}); const ev = [[0, 'on', 81, .8], [.05, 'on', 85, .8], [.1, 'on', 88, .8]];
  const x = render(p, ev, {sec: 1.2, at: [[.6, {mkSet: {'t.0.asg': b}}]]}).l; rep('Zuweisung ' + a + ' -> ' + b + ' (3 keys)', x, .6, [0, .05, .1]);
}
// 5. Mono legato, Multi, NEUSTART aus: a new key retriggers from the current level
{
  const p = tone({asg: 0, trig: 1, e2: {a: 40, d: 64, s: 64, r: 30, rst: 0}});
  const x = render(p, [[0, 'on', 81, .8], [.5, 'on', 84, .8]], {sec: 1}).l; rep('Mono Multi NEUSTART aus, legato key', x, .5, [0]);
}
// 6. LFO1 wave change at full PWM depth (pulse width jumps)
{
  const p = tone({o1: {w: 1, c1: 30, c2: 90}, l1: {w: 2, f: 70}});
  const x = render(p, [[0, 'on', 81, .8]], {sec: 1, at: [[.5, {mkSet: {'t.0.l1.w': 3}}]]}).l; rep('LFO1 Dreieck -> S/H bei PWM 90', x, .5);
}
// 7. unison detune turned at a held unison note (live?)
{
  const p = tone({asg: 2, udet: 0});
  const a = render(p, [[0, 'on', 81, .8]], {sec: 1.5, at: [[.3, {mkSet: {'t.0.udet': 99}}], [0, {mkScope: true}]]});
  const sc = a.msgs.filter(m => m.mkScope && m.mkScope.t > 1).map(m => m.mkScope.voices.map(v => v.udet));
  out.push('Unison VERSTIMMUNG 0 -> 99 at a held note: voice detune (ct) after 0.7 s = ' + JSON.stringify(sc[0]));
}
// 8. portamento changed while held (live?)
console.log(out.join('\n'));
