import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, peak, db, welch, bandE, R, ok, corr} = Q;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const C = k => R[k + 3];
const env = (x, y, a, b, w) => { const o = []; for (let i = a; i + w <= b; i += w) { let s = 0; for (let j = i; j < i + w; j++) s += x[j] * x[j] + y[j] * y[j]; o.push(db(Math.sqrt(s / (2 * w)))); } return o; };
const gated = (f, sec, a, off) => { const x = sine(f, sec, a); for (let i = Math.round(off * SR); i < x.length; i++) x[i] = 0; return x; };
// MK7-03 follower decay -6 -> -26 dB (and 0 -> -20 from the steady level), E1 sine carrier at the band centre, no voice
await T('MK7-03', async () => {
  const k = 10, f = C(k);
  for (const efs of [0, 64, 126]) {
    const tau = .005 * Math.pow(2, 9 * efs / 126), want = tau * Math.log(10) * 1000;
    const sec = efs === 126 ? 16 : 3, off = efs === 126 ? 3 : 1;
    const s = vocSnd(base, {efs, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
    const out = await render(page, s, [], {sec, inputs: {e1: sine(f, sec, .5), e2: gated(f, sec, .5, off)}});
    const w = Math.round(SR * (efs === 0 ? .0026 : .01)), a0 = Math.round((off - .3) * SR);
    const E = env(out.l, out.r, a0, sec * SR, w); const ref = E.slice(0, Math.round(.25 * SR / w)).reduce((p, c) => p + c, 0) / Math.round(.25 * SR / w);
    const t = d => { for (let i = Math.round(.3 * SR / w); i < E.length; i++) if (E[i] <= ref + d) return (i + .5) * w / SR - .3; return NaN; };
    const t20 = t(-20) * 1000, slope = (t(-26) - t(-6)) * 1000;
    ok('MK7-03 FOLGER ' + efs + ' Abfall -20 dB', Math.abs(slope / want - 1) <= .1, `−6→−26: ${slope.toFixed(1)} ms, 0→−20: ${t20.toFixed(1)} ms, W-38 ${want.toFixed(1)} ms`);
  }
  // hold via efs 127 sent while the modulator plays
  {
    const sec = 8, f2 = C(6);
    const s = vocSnd(base, {efs: 40, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
    const out = await render(page, s, [], {sec, inputs: {e1: noise(sec, .3, 3), e2: gated(f2, sec, .5, 1.5)}, at: [[1.2, {mkSet: {'voc.efs': 127}}]]});
    const lv = (a, b) => db(rms(out.l, Math.round(a * SR), Math.round(b * SR)));
    const ref = lv(1.0, 1.2), L = []; for (let t = 1.6; t < 6.6; t += .5) L.push(lv(t, t + .5) - ref);
    const dev = Math.max(...L.map(Math.abs));
    ok('MK7-03 FOLGER 127 hält 5 s ± 0,5 dB', dev <= .5 && ref > -60, 'ref ' + ref.toFixed(1) + ' dBFS, Abweichung ' + dev.toFixed(2) + ' dB');
  }
  // a sound with hold sounds without any input
  {
    const hold = [0, 0, 100, 127, 110, 90, 80, 100, 70, 60, 50, 40, 30, 20, 0, 0];
    const s = vocSnd(base, {hold}, {});
    const out = await render(page, s, [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]], {sec: 1.5});
    const lv = db(rms(out.l, 24000, 72000));
    ok('MK7-03 hold klingt ohne Quelle', lv > -40, lv.toFixed(1) + ' dBFS');
    const none = await render(page, vocSnd(base, {}, {}), [[0, 'on', 48, .8]], {sec: 1});
    ok('MK7-03 ohne hold und ohne Quelle still', peak(none.l) === 0, 'peak ' + peak(none.l));
  }
});
// MK7-04 gate
await T('MK7-04', async () => {
  for (const gs of [64, 100]) {
    const sec = 4, f = C(8), drop = 2, gt = .002 * Math.pow(2, 10 * gs / 127);
    const e2 = sine(f, sec, .1); for (let i = drop * SR; i < e2.length; i++) e2[i] *= Math.pow(10, -40 / 20);   // -20 dBFS peak ... -> -60 dBFS-ish, below -41.8
    const s = vocSnd(base, {th: 64, gs, efs: 126, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
    const out = await render(page, s, [], {sec, inputs: {e1: sine(f, sec, .5), e2}});
    const w = 96, E = env(out.l, out.r, Math.round((drop - .2) * SR), sec * SR, w), ref = E.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
    let t60 = NaN; for (let i = 0; i < E.length; i++) if ((i * w / SR) > .2 && E[i] <= ref - 60) { t60 = i * w / SR - .2; break; }
    ok('MK7-04 Gate ' + gs + ' −60 dB nach W-39 ± 10 %', Math.abs(t60 / gt - 1) <= .1, `${(t60 * 1000).toFixed(1)} ms, W-39 ${(gt * 1000).toFixed(1)} ms`);
  }
  // th 0: bit-equal to gate off for any gs, follows down to -90 dB
  {
    const sec = 3, f = C(8), e2 = sine(f, sec, .5); for (let i = 0; i < e2.length; i++) e2[i] *= Math.pow(10, -100 * (i / e2.length) / 20);
    const a = await render(page, vocSnd(base, {th: 0, gs: 0, efs: 0, ins: 127}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e1: sine(f, sec, .5), e2}});
    const b = await render(page, vocSnd(base, {th: 0, gs: 127, efs: 0, ins: 127}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e1: sine(f, sec, .5), e2}});
    let md = 0; for (let i = 0; i < a.l.length; i++) md = Math.max(md, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
    ok('MK7-04 SCHWELLE 0 bitgleich (GATE 0 vs 127)', md === 0, 'max |Δ| ' + md);
    // follow: output level vs modulator level slope (dB per dB) between -10 and -90
    const lvO = t => db(rms(a.l, Math.round(t * SR), Math.round((t + .05) * SR))), lvM = t => db(rms(e2, Math.round(t * SR), Math.round((t + .05) * SR)));
    const pts = []; for (let t = .2; t < 2.9; t += .1) pts.push([lvM(t), lvO(t)]);
    const sel = pts.filter(p => p[0] < -15 && p[0] > -95); const sl = (sel[sel.length - 1][1] - sel[0][1]) / (sel[sel.length - 1][0] - sel[0][0]);
    const last = sel[sel.length - 1];
    ok('MK7-04 SCHWELLE 0 folgt bis −90 dB', Math.abs(sl - 1) < .1 && last[0] < -88, `Steigung ${sl.toFixed(3)} dB/dB, letzter Punkt Mod ${last[0].toFixed(1)} → Aus ${last[1].toFixed(1)}`);
  }
});
// MK7-05 HPF
await T('MK7-05', async () => {
  const sec = 2, hf = sine(9000, sec, .3);
  const lvHF = o => { const N = 8192, P = welch(o.l, 24000, sec * SR, N); return bandE(P, N, 8500, 9500); };
  const PM = (() => { const N = 8192, P = welch(hf, 24000, sec * SR, N); return bandE(P, N, 8500, 9500); })();
  const dis = await render(page, vocSnd(base, {hpl: 127, hpg: 0}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e2: hf}});
  const r1 = db(Math.sqrt(lvHF(dis) / PM));
  ok('MK7-05 HPF-PEGEL 127, DIS ohne Stimme: > 6 kHz ≥ −20 dB', r1 >= -20, r1.toFixed(1) + ' dB');
  const ena0 = await render(page, vocSnd(base, {hpl: 127, hpg: 1}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e2: hf}});
  ok('MK7-05 HPF-GATE ENA ohne Stimme still', peak(ena0.l, 4800) < 1e-6, 'peak ' + peak(ena0.l, 4800).toExponential(2));
  const ena1 = await render(page, vocSnd(base, {hpl: 127, hpg: 1}, {mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec, inputs: {e2: hf}});
  const r2 = db(Math.sqrt(lvHF(ena1) / PM));
  ok('MK7-05 HPF-GATE ENA mit Stimme ≥ −20 dB', r2 >= -20, r2.toFixed(1) + ' dB');
  const off = await render(page, vocSnd(base, {hpl: 0, hpg: 0}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e2: hf}});
  ok('MK7-05 HPF-PEGEL 0 still', peak(off.l) < 1e-6, 'peak ' + peak(off.l));
  // low content does not pass the HPF
  const lo = await render(page, vocSnd(base, {hpl: 127, hpg: 0}, {mix: {o1: 0, o2: 0, n: 0}}), [], {sec, inputs: {e2: sine(500, sec, .3)}});
  ok('MK7-05 HPF sperrt 500 Hz (≤ −60 dB)', db(rms(lo.l, 24000) / rms(sine(500, sec, .3))) <= -60, db(rms(lo.l, 24000) / rms(sine(500, sec, .3))).toFixed(1) + ' dB');
});
// MK7-06 direct
await T('MK7-06', async () => {
  const sec = 2, m = noise(sec, .3, 9);
  const d = await render(page, vocSnd(base, {dir: 127}, {}), [], {sec, inputs: {e2: m}});
  const c = corr(d.l, m, 4800, sec * SR); ok('MK7-06 DIREKT 127 Korrelation ≥ 0,95', c >= .95, c.toFixed(4) + ' Pegel ' + db(rms(d.l) / rms(m)).toFixed(1) + ' dB');
  const z = await render(page, vocSnd(base, {dir: 0}, {}), [], {sec, inputs: {e2: m}});
  ok('MK7-06 DIREKT 0 = nichts', peak(z.l) === 0 && peak(z.r) === 0, 'peak ' + peak(z.l));
});
// MK7-07 channel level / pan
await T('MK7-07', async () => {
  const sec = 2, edge = (a, b) => Math.sqrt(a * b), reg = k => [edge(R[k + 2], R[k + 3]), edge(R[k + 3], R[k + 4])];
  let worstL = -999, worstP = -999;
  for (const k of [1, 5, 9, 13, 16]) {
    const e2 = sine(C(k), sec, .4);
    const on = await render(page, vocSnd(base, {res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]], {sec, inputs: {e2}});
    const chl = new Array(16).fill(127); chl[k - 1] = 0;
    const offr = await render(page, vocSnd(base, {res: 64, chl}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]], {sec, inputs: {e2}});
    const N = 8192, [a, b] = reg(k), e = o => bandE(welch(o.l, 24000, sec * SR, N), N, a, b) + bandE(welch(o.r, 24000, sec * SR, N), N, a, b);
    worstL = Math.max(worstL, db(Math.sqrt(e(offr) / e(on))));
    const chp = new Array(16).fill(0); chp[k - 1] = -63;
    const pn = await render(page, vocSnd(base, {res: 64, chp}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]], {sec, inputs: {e2}});
    const eL = bandE(welch(pn.l, 24000, sec * SR, N), N, a, b), eR = bandE(welch(pn.r, 24000, sec * SR, N), N, a, b);
    worstP = Math.max(worstP, db(Math.sqrt(eR / eL)));
  }
  ok('MK7-07 K-PEGEL k = 0 → Band k ≤ −40 dB', worstL <= -40, 'schlechtestes ' + worstL.toFixed(1) + ' dB');
  ok('MK7-07 K-PAN L63 → rechts ≤ −30 dB', worstP <= -30, 'schlechtestes ' + worstP.toFixed(1) + ' dB');
});
console.log('errs', errs.slice(0, 5));
Q.summary(); await br.close();
