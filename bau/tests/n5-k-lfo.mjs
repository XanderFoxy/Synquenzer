// K1-02: LFO endurance (VA worklet engine, eng 0): 10 min of audio time with note changes, scene changes (whole sound with
// crossfade), tempo changes, transport start/stop, "background" gaps; the LFO source value of the focus voice (scope at 30 Hz)
// must move within every 1.5 cycles. Also S&H: one new value per cycle, held in between.
import {makeScope} from './v3-mk1-node.mjs';
import {FILE, INIT} from './n5-k-lib.mjs';
const file = process.argv[2] || FILE, MIN = +(process.argv[3] || 10);
const sr = 48000, {G, procs} = makeScope(sr, file);
const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, INIT, {eng: 0, l1shape: 0, l1rate: 2, l2shape: 4, l2rate: 3}), mods: [{src: 1, dst: 3, amt: .2}, {src: 2, dst: 12, amt: .3}]}});
P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({scope: true});
const L = new Float32Array(128), Rr = new Float32Array(128);
let f = 0, id = 1, cur = 0, lastEv = 0, rnd = 7;
const R = () => { rnd = (Math.imul(rnd, 1664525) + 1013904223) >>> 0; return rnd / 4294967296; };
const shapes = [0, 1, 2, 3, 4];
let quanta = 0; const frozen = {g1: 0, g2: 0, v1: 0, v2: 0};
let stalls = [], samples = [], params = {l1shape: 0, l1rate: 2, l1sync: 0, l1retrig: 0, l2shape: 4, l2rate: 3, l2sync: 0, l2retrig: 0}, events = 0;
const N = Math.round(MIN * 60 * sr / 128) * 128;
let nextNote = 0, nextScene = 3 * sr, nextTempo = 7 * sr, nextGap = 11 * sr, playing = false;
const t0 = Date.now();
while (f < N) {
  const t = f / sr;
  if (f >= nextNote) {   // legato note change or new note
    const nn = 48 + Math.floor(R() * 24);
    if (cur && R() < .5) P.onMsg({ev: [[t, 2, cur]]});
    cur = id++; P.onMsg({ev: [[t, 1, cur, nn, .8, -1]]}); nextNote = f + Math.round((.2 + R()) * sr); events++;
  }
  if (f >= nextScene) {  // scene change: a whole sound (xf) with other LFO settings
    params = {l1shape: shapes[Math.floor(R() * 5)], l1rate: .5 + R() * 6, l1sync: R() < .3 ? [1, .5, 2][Math.floor(R() * 3)] : 0, l1retrig: R() < .3 ? 1 : 0,
      l2shape: shapes[Math.floor(R() * 5)], l2rate: .5 + R() * 6, l2sync: R() < .3 ? [1, .5, 4][Math.floor(R() * 3)] : 0, l2retrig: R() < .3 ? 1 : 0, o1w: Math.floor(R() * 4)};
    P.onMsg({set: params, xf: true}); nextScene = f + Math.round((2 + 4 * R()) * sr); events++;
  }
  if (f >= nextTempo) { playing = !playing || R() < .5; const bpm = 80 + Math.floor(R() * 80); P.onMsg({tempo: {bpm, start: playing ? t - R() * 2 : null}}); nextTempo = f + Math.round((3 + 6 * R()) * sr); events++; }
  if (f >= nextGap) { f += Math.round(sr * (.5 + R() * 3) / 128) * 128; nextGap = f + Math.round((20 + 30 * R()) * sr); events++; continue; }   // background: frames pass without process()
  const ph0 = [P.gl1, P.gl2], vp0 = P.V.map(v => (v.on ? [v.id, v.l1, v.l2] : null));
  G.currentFrame = f; P.process([], [[L, Rr]]);
  // phase check: every LFO phase in use moves in every quantum (global, and per note with Start NOTE)
  { const pr = P.P; quanta++;
    if (P.gl1 === ph0[0]) frozen.g1++; if (P.gl2 === ph0[1]) frozen.g2++;
    P.V.forEach((v, j) => { const o = vp0[j]; if (!v.on || !o || o[0] !== v.id) return; if (pr.l1retrig && v.l1 === o[1]) frozen.v1++; if (pr.l2retrig && v.l2 === o[2]) frozen.v2++; }); }
  const ms = P.__msgs; if (ms && ms.length) { for (const m of ms) if (m.scope && m.nv > 0) samples.push([m.t, m.scope[1], m.scope[2], params]); P.__msgs = []; }
  for (let i = 0; i < 128; i++) if (L[i] !== L[i]) { console.log('NaN at', t); process.exit(1); }
  f += 128;
}
// stall check: per LFO, a run of equal values longer than 1.5 cycles (rate from the params of that time; synced: bpm-dependent, use >= .25 Hz floor)
function check(k) {
  let worst = 0, n = 0;
  for (let i = 0, j = 0; i < samples.length; i = j) {
    j = i + 1; while (j < samples.length && samples[j][k] === samples[i][k] && samples[j][0] - samples[j - 1][0] < .1) j++;
    const dur = samples[j - 1][0] - samples[i][0], pr = samples[i][3], pre = k === 1 ? 'l1' : 'l2';
    const per = pr[pre + 'sync'] > 0 ? pr[pre + 'sync'] * 60 / 80 : 1 / pr[pre + 'rate'];
    const lim = pr[pre + 'shape'] >= 3 ? per * 1.05 : per * .5;   // square / S&H hold half / one cycle
    if (dur > lim + .07) { n++; worst = Math.max(worst, dur / per); if (n < 4) console.log('stall LFO', k, 'at', samples[i][0].toFixed(2), 'for', dur.toFixed(2), 's', JSON.stringify(pr)); }
  }
  return {stalls: n, worstCycles: worst};
}
console.log(JSON.stringify({min: MIN, events, quanta, frozenQuanta: frozen, pass: !frozen.g1 && !frozen.g2 && !frozen.v1 && !frozen.v2, valueRuns: {lfo1: check(1), lfo2: check(2)}, ms: Date.now() - t0}));
