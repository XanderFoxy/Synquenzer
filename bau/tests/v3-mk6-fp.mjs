// MK6 Fach-Prüfung (Nachtrag 2 Teil J): FP-DSP (switching at a sounding note: M-KLICK / M-EINBRUCH, NaN / peaks under fuzz) and
// FP-SONG (song grid: tempo change keeps the beat position, Einmal at KEY SYNC aus starts at beat 0 and holds after the cycle).
// Usage: MK_FILE=<index.html> node v3-mk6-fp.mjs
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mEinbruch, peak} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const Z = () => new Array(16).fill(0), Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SP = (t, sq) => { const p = mkPatch(t || {}); const q = (sq.q || []).concat([Q(0), Q(0), Q(0)]).slice(0, 3); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq, {q}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: FILE}, o || {}));
function mKlickSw(x, sr, ts) {   // = v3-mk2-osc.mjs: windows -2 ... +10 ms around the switch against the louder steady state
  const hp = (v, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < v.length; i++) { const o = (b0 * v[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  const h = hp(hp(Float64Array.from(x), 5000, .5412), 5000, 1.3066), W2 = Math.round(.002 * sr), E = i => { let e = 0; for (let k = i; k < i + W2; k++) e += h[k] * h[k]; return e / W2 + 1e-20; };
  const med = a => a.slice().sort((p, q) => p - q)[a.length >> 1], pdb = v => 10 * Math.log10(v);
  let worst = -99;
  for (const t of ts) { const c = Math.round(t * sr), pre = [], post = [];
    for (let i = c - Math.round(.022 * sr); i + W2 <= c - Math.round(.002 * sr); i += W2) pre.push(E(i)); for (let i = c + Math.round(.01 * sr); i + W2 <= c + Math.round(.03 * sr); i += W2) post.push(E(i));
    const ref = Math.max(med(pre), med(post)); for (let i = c - W2; i < c + Math.round(.01 * sr); i += W2 / 2) worst = Math.max(worst, pdb(E(i) / ref)); }
  return worst;
}
// switches at 0.40 s while a chord sounds (saw C5 E5 G5 + noise), steps of 1/8 (no step boundary at the switch). M-KLICK against the
// louder steady state (as MK2); M-EINBRUCH as a hole test: the 5-ms levels after the switch must not lie more than 3 dB under the
// lower of the two steady renders (A = the state before throughout, B = the state after throughout) - the content of a sequence
// (a smooth ramp, a quieter step) is no hole
const SIG = {mix: {o1: 127, o2: 0, n: 40}, a: {lvl: 90}, f: {cut: 90}};
const CH = [[0, 'on', 72, .7], [0, 'on', 76, .6], [0, 'on', 79, .6]];
const env5 = (y, i0, n) => { const W = 240, o = []; for (let w = 0; w < n; w++) { let e = 0; for (let k = i0 + w * W; k < i0 + (w + 1) * W; k++) e += y[k] * y[k]; o.push(10 * Math.log10(e / W + 1e-20)); } return o; };
function sw(name, sq, msg) {
  const t = .4, m = msg, A = R(SP(SIG, sq), CH, {sec: .9}).l, B = R(SP(SIG, sq), CH, {sec: .9, at: [[0, m]]}).l, r = R(SP(SIG, sq), CH, {sec: .9, at: [[t, m]]}), y = r.l;
  let nan = 0; for (const x of [r.l, r.r]) for (let i = 0; i < x.length; i++) if (!isFinite(x[i])) nan++;
  const k = mKlickSw(y, SR, [t]), i0 = Math.round(t * SR), ea = env5(A, i0, 10), eb = env5(B, i0, 10), es = env5(y, i0, 10);
  let hole = 0; for (let w = 0; w < 10; w++) hole = Math.min(hole, es[w] - Math.min(ea[w], eb[w]));
  ok('FP-DSP Umschalten ' + name, k <= 6 && hole >= -3 && !nan, 'M-KLICK ' + M(k) + ' dB (≤ 6), Einbruch gegen den leiseren Zustand ' + M(hole) + ' dB (≥ −3)' + (nan ? ', NaN ' + nan : ''));
}
const A = Array.from({length: 16}, (_, i) => (i & 1 ? -50 : 50));
sw('SEQ AN aus→an (Pegel Stufe ±50)', {on: 0, res: 6, q: [Q(15, 1, A)]}, {mkSet: {'t.0.seq.on': 1}});
sw('SEQ AN an→aus (Pegel Stufe ±50)', {on: 1, res: 6, q: [Q(15, 1, A)]}, {mkSet: {'t.0.seq.on': 0}});
sw('SEQ AN an→aus (Cutoff Glatt ±50)', {on: 1, res: 6, q: [Q(11, 0, A)]}, {mkSet: {'t.0.seq.on': 0}});
sw('SEQ AN aus→an (Cutoff Glatt ±50)', {on: 0, res: 6, q: [Q(11, 0, A)]}, {mkSet: {'t.0.seq.on': 1}});
sw('ZIEL Cutoff → Pegel', {res: 6, q: [Q(11, 1, A)]}, {mkSet: {'t.0.seq.q.0.k': 15}});
sw('ZIEL Pegel → Pan', {res: 6, q: [Q(15, 1, A)]}, {mkSet: {'t.0.seq.q.0.k': 16}});
sw('Vorrang: SEQ 3 kommt dazu', {res: 6, q: [Q(15, 1, A), Q(0), Q(0, 1, A.map(x => -x))]}, {mkSet: {'t.0.seq.q.2.k': 15}});
sw('BEWEGUNG Stufe → Glatt', {res: 6, q: [Q(15, 1, A)]}, {mkSet: {'t.0.seq.q.0.m': 0}});
sw('Schrittwert springt (Pegel, Stufe)', {res: 6, q: [Q(15, 1, Z())]}, {mkSet: {'t.0.seq.q.0.v.1': -63}});
sw('Schrittwert springt (Cutoff, Glatt)', {res: 6, q: [Q(11, 0, Z())]}, {mkSet: {'t.0.seq.q.0.v.1': -63}});
sw('KEY SYNC Timbre → Stimme', {res: 6, q: [Q(15, 1, A)]}, {mkSet: {'t.0.seq.ks': 2}});
sw('Aufnahme beginnt (SEQ 1 Pegel an)', {res: 6, q: [Q(15, 1, A)]}, {mkRec: {ti: 0, k: 0, tg: 11, base: 90}});

// NaN / peaks: 300 random sequences over all targets, key syncs, types, motions, extreme values, with patches and resonance
{ let s = 11; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }, I = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  let nan = 0, pk = 0, worst = '';
  for (let n = 0; n < 300; n++) {
    const q = [0, 1, 2].map(() => Q(I(0, 30), I(0, 1), Array.from({length: 16}, () => (rnd() < .3 ? (rnd() < .5 ? 63 : -63) : I(-63, 63)))));
    const t = {o1: {w: I(0, 6), c1: I(0, 127), c2: I(0, 127)}, o2: {w: I(0, 2), mod: I(0, 3), semi: I(-24, 24), tune: I(-63, 63)}, f: {type: I(0, 3), cut: I(0, 127), res: I(0, 127), eg: I(-63, 63), kbd: I(-63, 63)},
      a: {lvl: I(60, 127), dist: I(0, 1)}, p: [{s: I(0, 7), d: I(0, 7), i: I(-63, 63)}, {s: I(0, 7), d: I(0, 7), i: I(-63, 63)}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}], asg: I(0, 2), porta: I(0, 90), l2: {sync: I(0, 1)}};
    const r = R(SP(t, {ks: I(0, 2), type: I(0, 3), run: I(0, 1), last: I(1, 16), res: I(0, 15), q}), [[0, 'on', I(30, 90), .9], [.05, 'on', I(30, 90), .7], [.3, 'off', 0]], {sec: .5, songStart: rnd() < .5 ? 0 : null});
    for (const x of [r.l, r.r]) for (let i = 0; i < x.length; i++) if (!isFinite(x[i])) nan++;
    const p = Math.max(peak(r.l), peak(r.r)); if (p > pk) { pk = p; worst = JSON.stringify(q.map(x => x.k)); }
  }
  ok('FP-DSP Fuzz 300 Sequenzen', !nan && pk < 4, 'NaN ' + nan + ', größte Spitze ' + M(pk, 2) + ' (Ziele ' + worst + ')');
}

// FP-SONG: KEY SYNC aus at a tempo change 120 -> 90 BPM (the main thread re-anchors the song start so the beat goes on): the step
// follows the beat, not the time
{ const sq = {ks: 0, res: 3, q: [Q(11, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])]};
  const tc = 2.0, b = tc * 2, start2 = tc - b * 60 / 90;   // at 2.0 s = beat 4; 90 BPM from there with the same beat
  const r = R(SP({}, sq), [[0, 'on', 60, .8]], {sec: 4, songStart: 0, at: [[0, {mkScope: true}], [tc, {tempo: {bpm: 90, start: start2}}]]});
  const sc = r.msgs.filter(m => m.mkScope).map(m => m.mkScope), beat = t => (t < tc ? t * 2 : b + (t - tc) * 1.5);
  const bad = sc.filter(m => m.t > .05).filter(m => { const st = Math.floor((beat(m.t) % 4) / .25) + 1, f = (beat(m.t) % .25) / .25; return f > .05 && f < .95 && m.seq[0].step !== st; }).length;
  ok('FP-SONG Tempo-Wechsel (KEY SYNC aus)', bad === 0 && sc.length > 100, sc.length + ' Berichte: Schritt = (Song-Schlag mod 4) / ¼ vor und nach 120 → 90 BPM, ' + bad + ' Abweichungen');
  // Einmal at KEY SYNC aus: from beat 0, holds the last step after the cycle (16 x 1/16 = 4 beats = 2 s at 120)
  const r2 = R(SP({}, Object.assign({}, sq, {run: 0})), [[0, 'on', 60, .8]], {sec: 3.2, songStart: 0, at: [[0, {mkScope: true}]]});
  const s2 = r2.msgs.filter(m => m.mkScope).map(m => m.mkScope), after = s2.filter(m => m.t > 2.05).map(m => m.seq[0].step), before = s2.filter(m => m.t > .02 && m.t < .1).map(m => m.seq[0].step);
  ok('FP-SONG Einmal ab Schlag 0', before.every(x => x === 1) && after.length > 20 && after.every(x => x === 16) && s2.some(m => m.seq[0].done), 'Schlag 0–0,2: Schritt ' + [...new Set(before)].join(',') + ' · nach 2 s (4 Schläge) steht Schritt ' + [...new Set(after)].join(','));
  // KEY SYNC Timbre ignores the song position (a held note runs on through a tempo change without a jump)
  const r3 = R(SP({}, Object.assign({}, sq, {ks: 1})), [[.3, 'on', 60, .8]], {sec: 2, songStart: 0, at: [[0, {mkScope: true}], [1.0, {tempo: {bpm: 90, start: 1.0 - 2 * 60 / 90}}]]});
  const h = []; for (const m of r3.msgs.filter(m => m.mkScope)) if (m.mkScope.voices[0]) h.push(...m.mkScope.voices[0].seqStep);
  ok('FP-SONG KEY SYNC Timbre stetig', h.every((x, k) => k === 0 || x === h[k - 1] % 16 + 1), 'Schrittfolge ' + h.join(','));
}
console.log(fails ? fails + ' FEHLER' : 'alle bestanden');
process.exit(fails ? 1 : 0);
