// QA (acceptance lens) MK1 DSP spot checks in Node with the app's worklet source. Independent measurements.
import {render, mkPatch, makeScope} from './v3-mk1-node.mjs';
import {db, pdb, rms, peak, amp, folded, peaks, zcFreq, mKlick, mEinbruch, spectrum} from './v3-mk1-ana.mjs';
const SR = 48000;
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
const log = (...a) => console.log(...a);
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { log('ERR', id, e.stack); } };

// manual stepping with access to the MkCore state
function stepper(pmk, o = {}) {
  const {G, procs} = makeScope(SR);
  const P = new procs['dirigent-analog']({processorOptions: {patch: Object.assign({eng: 3}, o.flat || {}), mods: [], mk: pmk}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
  if (o.mw0 != null) P.onMsg({mkWheel: {mw0: o.mw0}});
  if (o.tap) P.onMsg({mkTap: o.tap});
  const L = new Float32Array(128), R = new Float32Array(128); let f = 0;
  return {P, mk: P.mk, step(cb) { G.currentFrame = f; P.process([], [[L, R]]); if (cb) cb(L, R, f); f += 128; return [L, R]; }, get f() { return f; }, ev(e) { P.onMsg({ev: e}); }, msg(m) { P.onMsg(m); }};
}

T('LFO2sq', () => {
  // LFO2 Rechteck(+): mean 0.5 +- 0.01, only >= 0, over whole periods
  const s = stepper(mkPatch({l2: {w: 1, f: 64}}));
  s.ev([[0, 1, 1, 60, .8, -1]]);
  const vals = []; const sec = 30;
  for (let k = 0; k < sec * SR / 128; k++) { s.step(); const v = s.mk.V.find(x => x.on); if (v) vals.push(v.lv2); }
  // whole periods: period of f 64
  const hz = .05 * Math.pow(2, 10 * 64 / 127), per = SR / 128 / hz, n = Math.floor(vals.length / per) * per | 0;
  const vv = vals.slice(0, n); const mean = vv.reduce((a, b) => a + b, 0) / vv.length;
  log('LFO2 Rechteck(+) mean', M(mean, 4), 'min', Math.min(...vals), 'max', Math.max(...vals), 'samples', vv.length, 'periods', M(n / per, 2));
  // LFO1 square bipolar
  const s1 = stepper(mkPatch({l1: {w: 1, f: 64}}));
  s1.ev([[0, 1, 1, 60, .8, -1]]); const v1 = [];
  for (let k = 0; k < 10 * SR / 128; k++) { s1.step(); const v = s1.mk.V.find(x => x.on); if (v) v1.push(v.lv1); }
  log('LFO1 Rechteck min/max', Math.min(...v1), Math.max(...v1));
});

T('porta', () => {
  // Portamento 64 mono multi: C3 -> C4, 90 % time from the held pitch per control block (read per quantum)
  const pt = .002 * Math.pow(2, 12 * 64 / 127);
  const s = stepper(mkPatch({asg: 0, trig: 1, porta: 64}));
  s.ev([[0, 1, 1, 48, .8, -1], [.3, 1, 2, 60, .8, -1]]);
  const tr = [];
  for (let k = 0; k < 1 * SR / 128; k++) { s.step(); const v = s.mk.V.find(x => x.on && !x.ghost); tr.push([(k + 1) * 128 / SR, v ? v.pitch : null]); }
  let t90 = null; for (const [t, p] of tr) if (t > .3 && p >= 58.8) { t90 = t - .3; break; }
  log('porta t90', M(t90 * 1000, 1), 'ms vs W-13', M(pt * 1000, 1), 'ms; ratio', M(t90 / pt, 3));
  // audio-based: zero-crossing pitch track of the mixer output
  const r = render(mkPatch({asg: 0, trig: 1, porta: 64, mix: {o1: 0, o2: 127}, o2: {w: 2}}), [[0, 'on', 48, .8], [.3, 'on', 60, .8]], {sec: 1, tap: 'mix'});
  const x = r.l; let ta = null;
  for (let s0 = Math.round(.3 * SR); s0 + 480 < x.length; s0 += 48) { const fz = zcFreq(x, s0, s0 + 480, SR); const n = 69 + 12 * Math.log2(fz / 440); if (n >= 58.8) { ta = (s0 + 240) / SR - .3; break; } }
  log('porta t90 (audio, 10 ms window)', ta && M(ta * 1000, 1), 'ms');
  // Mono + Single: first note after release must not glide; legato second note glides
  const s2 = stepper(mkPatch({asg: 0, trig: 0, porta: 64}));
  s2.ev([[0, 1, 1, 48, .8, -1], [.2, 2, 1], [.4, 1, 2, 60, .8, -1], [.5, 1, 3, 64, .8, -1]]);
  const tr2 = [];
  for (let k = 0; k < .8 * SR / 128; k++) { s2.step(); const v = s2.mk.V.find(x => x.on && !x.ghost && x.gate); tr2.push([(k + 1) * 128 / SR, v ? v.pitch : null]); }
  const at = t => tr2.find(q => q[0] >= t);
  log('single: pitch at .405', at(.405), 'at .51', at(.51), 'at .6', at(.6));
});

T('attack', () => {
  // attack stage time at sample resolution: EG2 A 0..32, tap amp (per-sample interpolation of the block values)
  for (const v of [0, 8, 16, 32]) {
    const w = .0005 * Math.pow(2, 15 * v / 127);
    const x = render(mkPatch({o1: {w: 2}, e2: {a: v, d: 64, s: 127, r: 0}}), [[0, 'on', 81, .8]], {sec: .3, tap: 'amp'}).l;
    const pk = x[Math.round(.25 * SR)]; let i = 0; while (i < x.length && x[i] < .9 * pk) i++;
    log('attack', v, 'measured', M(i / SR * 1000, 3), 'ms vs', M(w * 1000, 3), 'ms ratio', M(i / SR / w, 2));
  }
  // and the real output (triangle at A5 through the whole chain): envelope of |x| with 0.1 ms resolution
  for (const v of [0, 16]) {
    const w = .0005 * Math.pow(2, 15 * v / 127);
    const x = render(mkPatch({o1: {w: 0}, e2: {a: v, d: 64, s: 127, r: 0}}), [[0, 'on', 45, .8]], {sec: .3}).l;
    const pk = peak(x, Math.round(.1 * SR), Math.round(.2 * SR));
    let i = 0; while (i < x.length && Math.abs(x[i]) < .9 * pk) i++;
    log('attack (audio first 90% peak)', v, M(i / SR * 1000, 3), 'ms vs', M(w * 1000, 3));
  }
});

T('dist', () => {
  // VERZERR. switched on / off at a sounding note: M-KLICK and level jump
  for (const [on, off] of [[1, 0], [0, 1]]) {
    for (const note of [48, 72]) {
      const r = render(mkPatch({a: {dist: on}, f: {cut: 80}}), [[0, 'on', note, .8]], {sec: 1.2, at: [[.6, {mkSet: {'t.0.a.dist': off}}]]});
      const k = mKlick(r.l, SR, [0]);
      const pre = rms(r.l, Math.round(.5 * SR), Math.round(.6 * SR)), post = rms(r.l, Math.round(.65 * SR), Math.round(.75 * SR));
      log('dist', on, '->', off, 'note', note, 'M-KLICK worst', M(k.worst, 1), 'dB at', M(k.at, 3), 'level step', M(db(post / pre), 1), 'dB');
    }
  }
  // gate switch for comparison (structural via SXF)
  const r = render(mkPatch({f: {cut: 80}}), [[0, 'on', 48, .8]], {sec: 1.2, at: [[.6, {mkSet: {'t.0.a.gate': 1}}]]});
  const k = mKlick(r.l, SR, [0]); log('gate switch M-KLICK', M(k.worst, 1));
});

T('lfoSwitch', () => {
  // LFO wave / tempo sync / key sync switches during a note with LFO1 -> OSC1 (PWM) and LFO2 -> vibrato
  const base = {o1: {w: 1, c1: 30, c2: 127}, vib: 63, l1: {w: 2, f: 70}, l2: {w: 2, f: 70}};
  for (const [path, v] of [['t.0.l1.w', 1], ['t.0.l1.w', 0], ['t.0.l2.w', 1], ['t.0.l1.sync', 1], ['t.0.l2.sync', 1], ['t.0.o2.mod', 2], ['t.0.f.type', 3], ['t.0.asg', 2], ['t.0.o1.w', 2]]) {
    const r = render(mkPatch(base), [[0, 'on', 60, .8]], {sec: 1.2, mw0: 1, at: [[.6, {mkSet: {[path]: v}}]]});
    const k = mKlick(r.l, SR, [0]); log('switch', path, v, 'M-KLICK', M(k.worst, 1), '@', M(k.at, 3), 'M-EINBRUCH', M(mEinbruch(r.l, SR, .6).worst, 2));
  }
});

T('monoPrio', () => {
  // Mono stacks: pitch via the voice note
  const run = (prio, ev, t) => { const s = stepper(mkPatch({asg: 0, prio})); s.ev(ev); let p = null; for (let k = 0; k < t * SR / 128; k++) { s.step(); } const v = s.mk.V.find(x => x.on && !x.ghost && x.gate); return v ? v.note : null; };
  // Low: hold C4, then C3 -> C3; release C3 -> back to C4; press E4 while C4 -> stays C4
  log('Low', run(1, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 48, .8, -1]], .2), run(1, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 48, .8, -1], [.2, 2, 2]], .3), run(1, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 64, .8, -1]], .2));
  log('High', run(2, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 48, .8, -1]], .2), run(2, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 64, .8, -1], [.2, 2, 2]], .3), run(2, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 64, .8, -1]], .2));
  log('Last', run(0, [[0, 1, 1, 60, .8, -1], [.1, 1, 2, 48, .8, -1], [.15, 1, 3, 64, .8, -1], [.2, 2, 3]], .3));
});

T('unison', () => {
  // Unison level vs Poly single note (4 voices at ug .5)
  const a = render(mkPatch({asg: 1}), [[0, 'on', 48, .8]], {sec: 1}).l, b = render(mkPatch({asg: 2, udet: 0}), [[0, 'on', 48, .8]], {sec: 1}).l, c = render(mkPatch({asg: 2, udet: 20}), [[0, 'on', 48, .8]], {sec: 1}).l;
  log('unison level vs poly (udet 0 / 20)', M(db(rms(b, 9600, 48000) / rms(a, 9600, 48000)), 2), M(db(rms(c, 9600, 48000) / rms(a, 9600, 48000)), 2), 'peak', M(db(peak(b)), 1));
});

T('selfosc', () => {
  // self oscillation at other cutoffs: pitch = W-01 +- 5 %, level >= -30 dBFS, peak <= 0
  for (const cut of [40, 64, 90, 110]) {
    const r = render(mkPatch({mix: {o1: 0, o2: 0, n: 0}, f: {type: 0, cut, res: 127}}), [[0, 'on', 60, .8]], {sec: 2});
    const f = zcFreq(r.l, SR, 2 * SR - 128, SR), w = 20 * Math.pow(1000, cut / 127), lv = db(rms(r.l, SR, 2 * SR - 128) * Math.SQRT2);
    const lv200 = db(rms(r.l, Math.round(.15 * SR), Math.round(.2 * SR)) * Math.SQRT2);
    log('selfosc cut', cut, 'f', M(f, 1), 'vs', M(w, 1), 'dev', M((f / w - 1) * 100, 1), '% level', M(lv, 1), 'dBFS, at 150-200 ms', M(lv200, 1), 'peak', M(db(peak(r.l)), 1));
  }
  // with resonance 116..126: onset of whistle
  for (const res of [100, 110, 116, 120, 124]) {
    const r = render(mkPatch({mix: {o1: 0, o2: 0, n: 0}, f: {type: 0, cut: 64, res}}), [[0, 'on', 60, .8]], {sec: 2});
    log('res', res, 'level', M(db(rms(r.l, SR, 2 * SR - 128)), 1));
  }
});

T('pan', () => {
  for (const pan of [-63, 0, 63]) { const r = render(mkPatch({a: {pan}}), [[0, 'on', 60, .8]], {sec: .5}); log('pan', pan, 'L', M(db(rms(r.l, 4800, 24000)), 1), 'R', M(db(rms(r.r, 4800, 24000)), 1)); }
});

T('vel', () => {
  // default a.vel 0: velocity has no effect? and f.vel 0
  const a = render(mkPatch({}), [[0, 'on', 60, 1]], {sec: .5}).l, b = render(mkPatch({}), [[0, 'on', 60, .3]], {sec: .5}).l;
  log('INIT vel 1 vs .3', M(db(rms(a, 4800, 24000) / rms(b, 4800, 24000)), 2), 'dB');
  // a.vel -63: W-21 v<0: dB = 24 * (63/63) * (-vel) -> vel 1 = -24 dB, vel 0 = 0 dB
  const c = render(mkPatch({a: {vel: -63}}), [[0, 'on', 60, 1]], {sec: .5}).l, d = render(mkPatch({a: {vel: -63}}), [[0, 'on', 60, .5]], {sec: .5}).l;
  log('a.vel -63: vel 1 vs vel .5', M(db(rms(c, 4800, 24000) / rms(d, 4800, 24000)), 2), 'dB (W-21: -12)');
});

T('ring', () => {
  // ring with saw/square waves too, and Ring+Sync level
  for (const [w1, w2] of [[0, 0], [1, 1]]) {
    const r = render(mkPatch({o1: {w: w1}, o2: {w: w2, mod: 1, semi: 6}, mix: {o1: 0, o2: 127}, a: {gate: 1}}), [[0, 'on', 69, .8]], {sec: 1});
    log('ring w', w1, w2, 'rms', M(db(rms(r.l, 4800, 48000)), 1), 'peak', M(db(peak(r.l)), 1));
  }
});
