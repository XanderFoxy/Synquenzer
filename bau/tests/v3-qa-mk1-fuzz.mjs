// QA MK1 (FP-DSP): random patches + random note sequences + random gestures; checks NaN/Inf, peaks, stuck voices, ended ids.
import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
let seed = +(process.env.SEED || 7);
const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[Math.floor(rnd() * a.length)];
function randT() {
  return {asg: ri(0, 2), prio: ri(0, 2), trig: ri(0, 1), udet: ri(0, 99), trans: ri(-24, 24), tune: ri(-50, 50), vib: ri(-63, 63), bend: ri(-12, 12), porta: pick([0, 0, ri(0, 127)]),
    o1: {w: ri(0, 2), c1: ri(0, 127), c2: ri(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ri(-24, 24), tune: ri(-63, 63)}, mix: {o1: ri(0, 127), o2: ri(0, 127), n: pick([0, ri(0, 127)])},
    f: {type: ri(0, 3), cut: ri(0, 127), res: ri(0, 127), eg: ri(-63, 63), vel: ri(-63, 63), kbd: ri(-63, 63)}, a: {lvl: ri(0, 127), pan: ri(-63, 63), gate: ri(0, 1), dist: ri(0, 1), vel: ri(-63, 63), kbd: ri(-63, 63)},
    e1: {a: ri(0, 127), d: ri(0, 127), s: ri(0, 127), r: ri(0, 127), rst: ri(0, 1)}, e2: {a: ri(0, 90), d: ri(0, 127), s: ri(0, 127), r: ri(0, 80), rst: ri(0, 1)},
    l1: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ri(0, 127), note: ri(0, 14)}, l2: {w: ri(0, 3), ks: ri(0, 2), sync: ri(0, 1), f: ri(0, 127), note: ri(0, 14)}};
}
const PATHS = ['f.cut', 'f.res', 'f.eg', 'f.kbd', 'o1.c1', 'o1.c2', 'mix.o1', 'mix.o2', 'mix.n', 'a.lvl', 'a.pan', 'trans', 'tune', 'o2.semi', 'o2.tune', 'vib', 'o1.w', 'o2.w', 'o2.mod', 'f.type', 'a.gate', 'a.dist', 'asg', 'prio', 'trig', 'e2.a', 'e2.r', 'l1.f', 'l2.f', 'l1.w', 'l2.w', 'porta', 'udet', 'bend'];
const RANGE = {'f.cut': [0, 127], 'f.res': [0, 127], 'f.eg': [-63, 63], 'f.kbd': [-63, 63], 'o1.c1': [0, 127], 'o1.c2': [0, 127], 'mix.o1': [0, 127], 'mix.o2': [0, 127], 'mix.n': [0, 127], 'a.lvl': [0, 127], 'a.pan': [-63, 63], trans: [-24, 24], tune: [-50, 50], 'o2.semi': [-24, 24], 'o2.tune': [-63, 63], vib: [-63, 63],
  'o1.w': [0, 2], 'o2.w': [0, 2], 'o2.mod': [0, 3], 'f.type': [0, 3], 'a.gate': [0, 1], 'a.dist': [0, 1], asg: [0, 2], prio: [0, 2], trig: [0, 1], 'e2.a': [0, 127], 'e2.r': [0, 127], 'l1.f': [0, 127], 'l2.f': [0, 127], 'l1.w': [0, 3], 'l2.w': [0, 3], porta: [0, 127], udet: [0, 99], bend: [-12, 12]};
const N = +(process.env.N || 60), SEC = 4;
let bad = 0, maxPk = -999, worst = '', stuck = 0, leak = 0;
const rep = [];
for (let it = 0; it < N; it++) {
  const T = randT(); const p = mkPatch(T);
  const ev = []; const held = []; let id = 1;
  for (let t = 0.01; t < SEC - 1.2; t += .02 + rnd() * .25) {
    if (held.length && (rnd() < .45 || held.length > 6)) { const k = held.splice(ri(0, held.length - 1), 1)[0]; ev.push([t, 'off', k.n, 0, k.id]); }
    else { const n = ri(24, 108); const k = {n, id: id++}; held.push(k); ev.push([t, 'on', n, .2 + rnd() * .8, k.id, k.id]); }
  }
  for (const k of held) ev.push([SEC - 1.2, 'off', k.n, 0, k.id]);
  const at = [[0, {mkScope: false}]];
  for (let g = 0; g < 12; g++) { const path = pick(PATHS), [a, b] = RANGE[path]; const v = Number.isInteger(a) && /\.w|mod|type|gate|dist|asg|prio|trig/.test(path) ? ri(a, b) : a + rnd() * (b - a); at.push([rnd() * (SEC - 1.3), {mkSet: {['t.0.' + path]: v}}]); }
  if (rnd() < .5) at.push([rnd() * 2, {mkWheel: {bend: rnd() * 2 - 1}}], [2.2, {mkWheel: {bend: 0, ret: .08}}]);
  if (rnd() < .5) at.push([rnd() * 2, {mkWheel: {mod: rnd()}}]);
  const r = render(p, ev, {sec: SEC + 2.5, seed: it + 1, at});
  let nb = 0, pk = 0, pki = 0;
  for (const ch of [r.l, r.r]) for (let i = 0; i < ch.length; i++) { const x = ch[i]; if (!Number.isFinite(x)) nb++; else if (Math.abs(x) > pk) { pk = Math.abs(x); pki = i; } }
  const pdb = 20 * Math.log10(pk + 1e-30);
  // voices left on long after all keys up (release max 80 -> ~ 1.0 s by W-06): allow 2.5 s
  const on = r.P.mk.V.filter(v => v.on).length, keys = r.P.mk.keys.length;
  const ended = new Set(r.P.ended); let notEnded = 0; for (let k = 1; k < id; k++) if (!ended.has(k)) notEnded++;
  // count ended ids pushed by MK (host ended array is drained by process? check msgs)
  const endCnt = {}; for (const m of r.msgs) if (m && m.end) for (const x of m.end) endCnt[x] = (endCnt[x] || 0) + 1;
  const miss = [], dup = []; for (let k = 1; k < id; k++) { if (!endCnt[k]) miss.push(k); else if (endCnt[k] > 1) dup.push(k); }
  if (!(on || keys) && (miss.length || dup.length)) { leak++; rep.push({it, miss: miss.slice(0, 8), dup: dup.slice(0, 8), n: id - 1, asg: T.asg, gestures: at.slice(1).map(a => Object.keys(a[1].mkSet || a[1].mkWheel || {}).join()).join(' ')}); }
  if (nb) bad++;
  if (on || keys) stuck++;
  if (pdb > maxPk) { maxPk = pdb; worst = 'it ' + it + ' at ' + (pki / SR).toFixed(3) + ' s'; }
  rep.push({it, nb, pk: +pdb.toFixed(1), at: +(pki / SR).toFixed(3), on, keys, asg: T.asg, dist: T.a.dist, ft: T.f.type, res: T.f.res, mod: T.o2.mod});
}
rep.sort((a, b) => (b.pk || 0) - (a.pk || 0));
console.log('NaN/Inf renders', bad, '/', N, '· voices/keys left on', stuck, '· max peak', maxPk.toFixed(1), 'dBFS', worst);
console.log('top peaks', JSON.stringify(rep.slice(0, 8)));
console.log('end-id problems', leak, JSON.stringify(rep.filter(x => x.miss).slice(0, 6)));
console.log('stuck', JSON.stringify(rep.filter(x => x.on || x.keys).slice(0, 8)));
