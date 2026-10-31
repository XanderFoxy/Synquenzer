// BM2-05 (4 target slots per source: every target kind acts, two slots on one target add, amount law 25/50/99) and the processor
// part of BM2-06 (a cleared slot [x] acts at once; INIT has no route). Node. ONLY=regex. Writes bm2-slots.out.json.
import fs from 'fs';
import {render, on} from './bm-node.mjs';
import {rms, db} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push({id, ok: !!c, info}); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const SRC = {v: ['flt', 'feg', 'vol', 'mask', 'peg', 'atk'], mw: ['flt', 'l1a', 'l1s', 'l2a', 'l2s', 'vol', 'mask', 'freq', 'o1v', 'o1m', 'o2v', 'o2m', 'nf', 'nv', 'fx1b', 'fx2b'],
  lfo: ['freq', 'vol', 'flt', 'mask', 'pan', 'o1f', 'o1v', 'o1m', 'o2f', 'o2v', 'o2m', 'nf', 'nv', 'fx1t', 'fx2t', 'fx2b']};
const FX = {fx1t: 1, fx2t: 1, fx1b: 1, fx2b: 1};
// a program where every target can be heard: both oscillators, noise, filter envelope, pitch delta, slow attack, LFOs on small amounts
const P0 = () => ({o1: {m: 7, e: {l: 90, a: 8, d: 0, s: 15, r: 3}}, o2: {m: 24, st: 7, e: {l: 70, a: 0, d: 0, s: 15, r: 3}}, n: {fr: 60, e: {l: 30, a: 0, d: 0, s: 15, r: 3}},
  f: {md: 'lp', cu: 45, re: 20, e: {l: 30, a: 0, d: 6, s: 4, r: 3}}, pe: {ds: 20, dv: 20},
  l1: {sp: 55, w: 'sin', t: [['freq', 15], ['flt', 0], ['mask', 0], ['vol', 0]]}, l2: {sp: 40, w: 'up', t: [['flt', 20], ['freq', 0], ['mask', 0], ['vol', 0]]},
  mo: {v: [['flt', 0], ['feg', 0], ['vol', 0], ['mask', 0]], mw: [['l1a', 0], ['flt', 0], ['mask', 0], ['vol', 0]], at: [['flt', 0], ['l1a', 0], ['mask', 0], ['vol', 0]]}, fx: {t1: 'CH1', b1: 0, t2: 'RV1', b2: 0}});
function run(src, slot, tgt, amt, extra) {
  const P = P0(); const key = src === 'v' ? ['mo', 'v'] : src === 'mw' ? ['mo', 'mw'] : src === 'at' ? ['mo', 'at'] : [src, 't'];
  const arr = P[key[0]][key[1]]; arr[slot] = [tgt, amt];
  if (src === 'l1' || src === 'l2') P[src].t[slot] = [tgt, amt];
  const msgs = [[0, {t: 'prog', ab: 'a', p: P}], [0, on(.01, 48, .5, 1)], [0, on(.01, 55, .5, 2)]];
  if (src === 'mw') msgs.push([0, {t: 'ctl', mw: .7}]); if (src === 'at') msgs.push([0, {t: 'ctl', pr: .7}]);
  return render(msgs.concat(extra || []), {sec: .7});
}
T('BM2-05', () => {
  const rows = []; let n = 0, bad = [];
  for (const src of ['v', 'mw', 'at', 'l1', 'l2']) {
    const list = src === 'v' ? SRC.v : src === 'mw' || src === 'at' ? SRC.mw : SRC.lfo;
    list.forEach((tgt, i) => {
      if (FX[tgt]) return;   // the FX targets act on FX1 / FX2 (BM3, bm3-fx.mjs)
      const slot = i % 4, a = run(src, slot, tgt, 99), b = run(src, slot, tgt, 0), d = new Float32Array(a.l.length); for (let j = 0; j < d.length; j++) d[j] = a.l[j] - b.l[j];
      const rel = db(rms(d, 4800) / rms(b.l, 4800)); n++; if (!(rel > -40)) bad.push(src + '→' + tgt + ' ' + R(rel)); rows.push(src + ':' + tgt + '@' + (slot + 1) + ' ' + R(rel));
    });
  }
  ok('BM2-05 jede Zielart jeder Quelle wirkt messbar (Platz 1–4; 6 + 16 + 16 + 2 × 16 ohne die 4 FX-Ziele → BM3)', bad.length === 0, n + ' Routen, Unterschied zur Menge 0 (dB re Signal): ' + (bad.length ? 'zu schwach: ' + bad.join(', ') + '; ' : '') + rows.join(', '));
  // two slots on the same target add (+- 2 %): MW 0.7 -> flt with 50 + 50 (cutoff steps from the coefficient tap)
  const tapFc = (P, mw) => { const r = render([[0, {t: 'tap', on: true, k: 'ctl'}], [0, {t: 'prog', ab: 'a', p: P}], [0, on(.001, 60)], [0, {t: 'ctl', mw}], [.1, {t: 'tap', on: false}]], {sec: .11}); const b = r.msgs.find(m => m.t === 'tap').buf; return b[b.length - 13 + 9]; };
  const steps = fc => 99 * Math.log(fc / 20) / Math.log(1000);
  const Pa = {o1: {m: 7}, f: {md: 'lp', cu: 20}, mo: {mw: [['flt', 50], ['flt', 50], ['mask', 0], ['vol', 0]]}}, Pb = {o1: {m: 7}, f: {md: 'lp', cu: 20}, mo: {mw: [['flt', 50], ['l1a', 0], ['mask', 0], ['vol', 0]]}};
  const u50 = Math.pow(50 / 99, 1.5), two = steps(tapFc(Pa, .7)) - 20, one = steps(tapFc(Pb, .7)) - 20, want2 = 2 * u50 * .7 * 99;
  // LFO slots on the same target: LFO1 square, two slots freq 40 + 40 -> pitch offset = 2 u40 * 24 semitones
  const tapP = P => { const r = render([[0, {t: 'tap', on: true, k: 'ctl'}], [0, {t: 'prog', ab: 'a', p: P}], [0, on(.001, 69)], [.05, {t: 'tap', on: false}]], {sec: .06}); const b = r.msgs.find(m => m.t === 'tap').buf; return b[13 + 10] - 69; };
  const lf2 = tapP({o1: {m: 7}, l1: {sp: 1, w: 'sqr', t: [['freq', 40], ['freq', 40], ['mask', 0], ['vol', 0]]}}), wantL = 2 * Math.pow(40 / 99, 1.5) * 24;
  ok('BM2-05 zwei Plätze auf dasselbe Ziel addieren (± 2 %)', Math.abs(two / want2 - 1) <= .02 && Math.abs(two / one - 2) <= .04 && Math.abs(lf2 / wantL - 1) <= .02,
    'MW→FLT 50 + 50: ' + R(two, 3) + ' Stufen (Soll ' + R(want2, 3) + ', ein Platz ' + R(one, 3) + '); LFO1→FREQ 40 + 40: ' + R(lf2, 4) + ' HT (Soll ' + R(wantL, 4) + ')');
  // amount law (|a|/99)^1.5 at 25 / 50 / 99: MW 1.0 -> freq (+-24 semitones) and negative amounts
  const law = a => { const r = render([[0, {t: 'tap', on: true, k: 'ctl'}], [0, {t: 'prog', ab: 'a', p: {o1: {m: 7}, mo: {mw: [['freq', a], ['flt', 0], ['mask', 0], ['vol', 0]]}}}], [0, on(.001, 69)], [0, {t: 'ctl', mw: 1}], [.1, {t: 'tap', on: false}]], {sec: .11}); const b = r.msgs.find(m => m.t === 'tap').buf; return (b[b.length - 13 + 10] - 69) / 24; };
  let w = 0; const g = []; for (const a of [25, 50, 99, -50]) { const got = law(a), want = Math.sign(a) * Math.pow(Math.abs(a) / 99, 1.5); w = Math.max(w, Math.abs(got / want - 1)); g.push(a + ': ' + R(got * 100, 2) + ' %'); }
  ok('BM2-05 Mengen-Gesetz bei 25 / 50 / 99 (12,7 / 35,9 / 100 %) ± 2 %', w <= .02, g.join(', '));
});
T('BM2-06', () => {
  // [x] = amount 0 by a set message: the sound changes at once (within 10 ms); INIT: every amount 0
  const P = P0(); P.mo.mw[1] = ['flt', 80];
  const base = [[0, {t: 'prog', ab: 'a', p: P}], [0, on(.01, 48, .8, 1)], [0, {t: 'ctl', mw: 1}]];
  const a = render(base, {sec: .6}), b = render(base.concat([[.3, {t: 'set', ab: 'a', k: 'mo.mw', v: [['l1a', 0], ['flt', 0], ['mask', 0], ['vol', 0]]}]]), {sec: .6});
  const i0 = Math.floor(.3 * SR / 128) * 128; let before = 0; for (let i = 0; i < i0; i++) before = Math.max(before, Math.abs(a.l[i] - b.l[i]));
  const d = new Float32Array(4800); for (let i = 0; i < 4800; i++) d[i] = a.l[i0 + 480 + i] - b.l[i0 + 480 + i];
  const chg = db(rms(d) / rms(a.l, i0 + 480, i0 + 5280));
  ok('BM2-06 [✕] (Menge 0) wirkt sofort hörbar; vorher gleich (Prozessor-Teil; Übersicht/Undo: BM5/BM6)', before === 0 && chg > -20, 'vor dem ✕: Differenz ' + before + '; 10–110 ms danach: ' + R(chg) + ' dB re Signal');
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
fs.writeFileSync(HERE + 'bm2-slots.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
