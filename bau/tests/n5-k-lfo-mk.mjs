// K1-02 (MS 2000 engine, eng 3): LFO endurance with note / program / tempo / transport changes and background gaps
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
import {FILE} from './n5-k-lib.mjs';
const file = process.argv[2] || FILE, MIN = +(process.argv[3] || 10);
const sr = 48000, {G, procs} = makeScope(sr, file);
let rnd = 11; const R = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };
const prog = () => mkPatch({l1: {w: Math.floor(R() * 4), ks: Math.floor(R() * 3), sync: R() < .3 ? 1 : 0, f: 40 + Math.floor(R() * 60), note: 6}, l2: {w: Math.floor(R() * 4), ks: Math.floor(R() * 3), sync: R() < .3 ? 1 : 0, f: 40 + Math.floor(R() * 60), note: 4},
  p: [{s: 4, d: 3, i: 20}, {s: 5, d: 0, i: 0}, {s: 0, d: 0, i: 0}, {s: 0, d: 0, i: 0}]});
let pm = prog();
const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: pm}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 3}); P.onMsg({mkScope: true});
const L = new Float32Array(128), Rr = new Float32Array(128);
let f = 0, id = 1, cur = 0; const N = Math.round(MIN * 60 * sr / 128) * 128;
let nextNote = 0, nextScene = 3 * sr, nextTempo = 7 * sr, nextGap = 11 * sr, playing = false, events = 0, nan = 0;
const S1 = [], S2 = []; let cfg = pm.t[0];
while (f < N) {
  const t = f / sr;
  if (f >= nextNote) { if (cur && R() < .5) P.onMsg({ev: [[t, 2, cur]]}); cur = id++; P.onMsg({ev: [[t, 1, cur, 48 + Math.floor(R() * 24), .8, -1]]}); nextNote = f + Math.round((.2 + R()) * sr); events++; }
  if (f >= nextScene) { pm = prog(); cfg = pm.t[0]; P.onMsg({mk: pm}); nextScene = f + Math.round((2 + 4 * R()) * sr); events++; }
  if (f >= nextTempo) { playing = !playing || R() < .5; P.onMsg({tempo: {bpm: 80 + Math.floor(R() * 80), start: playing ? t - R() * 2 : null}}); nextTempo = f + Math.round((3 + 6 * R()) * sr); events++; }
  if (f >= nextGap) { f += Math.round(sr * (.5 + R() * 3) / 128) * 128; nextGap = f + Math.round((20 + 30 * R()) * sr); events++; continue; }
  G.currentFrame = f; P.process([], [[L, Rr]]);
  for (let i = 0; i < 128; i++) if (L[i] !== L[i]) nan++;
  const ms = P.__msgs; if (ms && ms.length) { for (const m of ms) if (m.mkScope && m.mkScope.voices.length) { const v = m.mkScope.voices.reduce((a, b) => (b.t > a.t ? b : a)); S1.push([m.mkScope.t, v.lfo1, cfg.l1]); S2.push([m.mkScope.t, v.lfo2, cfg.l2]); } P.__msgs = []; }
  f += 128;
}
const W = v => .05 * Math.pow(2, 10 * v / 127);
function check(S, name) {
  let n = 0;
  for (let i = 0, j = 0; i < S.length; i = j) {
    j = i + 1; while (j < S.length && S[j][1] === S[i][1] && S[j][0] - S[j - 1][0] < .1) j++;
    const dur = S[j - 1][0] - S[i][0], l = S[i][2], per = l.sync ? 4 * .5 * 60 / 80 * 4 : 1 / W(l.f), lim = l.w === 3 || l.w === 1 ? per * 1.05 : per * .5;
    if (dur > lim + .1) { n++; if (n < 4) console.log('stall', name, S[i][0].toFixed(2), dur.toFixed(2), JSON.stringify(l)); }
  }
  return n;
}
console.log(JSON.stringify({min: MIN, events, n: S1.length, nan, stall1: check(S1, 'lfo1'), stall2: check(S2, 'lfo2')}));
