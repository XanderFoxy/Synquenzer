// QA FP-DSP for MK6 (independent): position discontinuities in Glatt vs Stufe -> M-KLICK
// Usage: MK_FILE=<index.html> node v3-fp6q-a.mjs
import {render, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, mEinbruch, db, rms} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SP = (t, sq) => { const p = mkPatch(t || {}); const q = (sq.q || []).concat([Q(0), Q(0), Q(0)]).slice(0, 3); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq, {q}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: FILE}, o || {}));
const M = x => Math.round(x * 10) / 10;
const fill = (a, b) => [a].concat(new Array(15).fill(b));
const out = [];
const SRC = {o1: 0, o2: 0, n: 127};
// helper: M-KLICK in a window around t (only judge windows near t)
function klickAt(y, t, span = .03) { const i0 = Math.max(0, Math.round((t - .06) * SR)), i1 = Math.min(y.length, Math.round((t + .06) * SR)); const seg = y.slice(i0, i1); const r = mKlick(seg, SR, []); return r; }

// 1) KEY SYNC Timbre restart while a voice is in its release, target Amp-Pegel; the new note is muted by its filter (kbd -63, vel)
for (const m of [0, 1]) {
  const base = {e2: {a: 0, d: 64, s: 127, r: 100}, a: {lvl: 64}, f: {cut: 127, kbd: -63, vel: 63}, mix: SRC};
  const p = SP(base, {ks: 1, res: 3, q: [Q(15, m, fill(30, -30))]});
  const y = R(p, [[0, 'on', 36, 1], [.30, 'off', 36], [.5625, 'on', 108, .01]], {sec: 1}).l;
  const k = klickAt(y, .5625); const ctl = R(SP(base, {ks: 1, res: 3, on: 0, q: [Q(15, m, fill(30, -30))]}), [[0, 'on', 36, 1], [.30, 'off', 36], [.5625, 'on', 108, .01]], {sec: 1}).l;
  const k0 = klickAt(ctl, .5625);
  out.push(`T1 KS Timbre restart in release, ${m ? 'Stufe' : 'Glatt'}: M-KLICK ${M(k.worst)} dB at ${M((k.at + .5625 - .06) * 1000)} ms (ctl seq off ${M(k0.worst)} dB)`);
}
// 2) KEY SYNC aus: the transport starts while a note is held (free -> song grid)
for (const m of [0, 1]) {
  const base = {e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 64}, mix: SRC};
  const p = SP(base, {ks: 0, res: 3, q: [Q(15, m, fill(30, -30))]});
  const y = R(p, [[0, 'on', 48, 1]], {sec: 1.4, at: [[.77, {tempo: {bpm: 120, start: .77 - .0625}}]]}).l;
  const k = klickAt(y, .77);
  out.push(`T2 KS aus, song starts at held note, ${m ? 'Stufe' : 'Glatt'}: M-KLICK ${M(k.worst)} dB`);
}
// 3) value edit of the running step (painting in SCHRITTE) while a note is held
for (const m of [0, 1]) {
  const base = {e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 64}, mix: SRC};
  const p = SP(base, {ks: 1, res: 3, q: [Q(15, m, new Array(16).fill(-30))]});
  const y = R(p, [[0, 'on', 48, 1]], {sec: 1, at: [[.55, {mkSet: {'t.0.seq.q.0.v.4': 30}}]]}).l;
  const k = klickAt(y, .55);
  out.push(`T3 running step edited -30 -> +30, ${m ? 'Stufe' : 'Glatt'}: M-KLICK ${M(k.worst)} dB`);
}
// 4) LÄNGE 16 -> 4 while a note is held at step 8 (position wraps)
for (const m of [0, 1]) {
  const base = {e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 64}, mix: SRC};
  const p = SP(base, {ks: 1, res: 3, q: [Q(15, m, [30, 30, 30, 30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30])]});
  const y = R(p, [[0, 'on', 48, 1]], {sec: 1.3, at: [[.94, {mkSet: {'t.0.seq.last': 4}}]]}).l;
  const k = klickAt(y, .94);
  out.push(`T4 LÄNGE 16 -> 4 at a held note (step 8 -> wraps), ${m ? 'Stufe' : 'Glatt'}: M-KLICK ${M(k.worst)} dB`);
}
// 5) TYP Vorwärts -> Rückwärts at a held note
for (const m of [0, 1]) {
  const base = {e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 64}, mix: SRC};
  const v = Array.from({length: 16}, (_, i) => i < 8 ? -30 : 30);
  const p = SP(base, {ks: 1, res: 3, q: [Q(15, m, v)]});
  const y = R(p, [[0, 'on', 48, 1]], {sec: 1, at: [[.31, {mkSet: {'t.0.seq.type': 1}}]]}).l;
  const k = klickAt(y, .31);
  out.push(`T5 TYP -> Rückwärts at a held note, ${m ? 'Stufe' : 'Glatt'}: M-KLICK ${M(k.worst)} dB`);
}
// reference: the amp knob itself jumps 34 -> 94 (5 ms smoothing)
{ const p = SP({e2: {a: 0, d: 64, s: 127, r: 20}, a: {lvl: 34}, mix: SRC}, {on: 0, q: []});
  const y = R(p, [[0, 'on', 48, 1]], {sec: 1, at: [[.55, {mkSet: {'t.0.a.lvl': 94}}]]}).l; const k = klickAt(y, .55);
  out.push(`REF knob A-PEGEL 34 -> 94 jump: M-KLICK ${M(k.worst)} dB`); }
console.log(out.join('\n'));
