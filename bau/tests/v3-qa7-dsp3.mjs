import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, peak, db, welch, bandE, R, ok} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const C = k => R[k + 3];
const env = (x, y, a, b, w) => { const o = []; for (let i = a; i + w <= b; i += w) { let s = 0; for (let j = i; j < i + w; j++) s += x[j] * x[j] + y[j] * y[j]; o.push(db(Math.sqrt(s / (2 * w)))); } return o; };
const gated = (f, sec, a, off) => { const x = sine(f, sec, a); for (let i = Math.round(off * SR); i < x.length; i++) x[i] = 0; return x; };
for (const k of [10, 14, 16]) for (const amp of [.5, .05]) {
  const f = C(k), efs = 0, want = .005 * Math.log(10) * 1000, sec = 2, off = 1;
  const s = vocSnd(base, {efs, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
  const out = await render(page, s, [], {sec, inputs: {e1: sine(f, sec, amp), e2: gated(f, sec, amp, off)}});
  const w = Math.max(48, Math.round(3 * SR / f)), a0 = Math.round((off - .3) * SR);
  const E = env(out.l, out.r, a0, sec * SR, w); const n0 = Math.round(.25 * SR / w), ref = E.slice(0, n0).reduce((p, c) => p + c, 0) / n0;
  const t = d => { for (let i = Math.round(.3 * SR / w); i < E.length; i++) if (E[i] <= ref + d) return (i + .5) * w / SR - .3; return NaN; };
  console.log(`k${k} amp ${amp} ref ${ref.toFixed(1)} dBFS pk ${db(peak(out.l)).toFixed(1)}: −6→−26 ${((t(-26) - t(-6)) * 1000).toFixed(1)} ms, 0→−20 ${(t(-20) * 1000).toFixed(1)} ms (W-38 ${want.toFixed(1)})`);
}
for (const efs of [64]) for (const amp of [.5, .05]) {
  const k = 10, f = C(k), want = .005 * Math.pow(2, 9 * efs / 126) * Math.log(10) * 1000, sec = 3, off = 1;
  const s = vocSnd(base, {efs, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
  const out = await render(page, s, [], {sec, inputs: {e1: sine(f, sec, amp), e2: gated(f, sec, amp, off)}});
  const w = 480, a0 = Math.round((off - .3) * SR);
  const E = env(out.l, out.r, a0, sec * SR, w); const n0 = Math.round(.25 * SR / w), ref = E.slice(0, n0).reduce((p, c) => p + c, 0) / n0;
  const t = d => { for (let i = Math.round(.3 * SR / w); i < E.length; i++) if (E[i] <= ref + d) return (i + .5) * w / SR - .3; return NaN; };
  console.log(`efs ${efs} amp ${amp} ref ${ref.toFixed(1)} dBFS: −6→−26 ${((t(-26) - t(-6)) * 1000).toFixed(1)} ms, 0→−20 ${(t(-20) * 1000).toFixed(1)} ms, 0→-6 ${(t(-6) * 1000).toFixed(1)} (W-38 ${want.toFixed(1)})`);
}
// hold with a sine carrier
{
  const sec = 8, f2 = C(6);
  const s = vocSnd(base, {efs: 40, ins: 127, res: 64}, {mix: {o1: 0, o2: 0, n: 0}});
  const out = await render(page, s, [], {sec, inputs: {e1: sine(f2, sec, .1), e2: gated(f2, sec, .1, 1.5)}, at: [[1.2, {mkSet: {'voc.efs': 127}}]]});
  const lv = (a, b) => db(rms(out.l, Math.round(a * SR), Math.round(b * SR)));
  const ref = lv(1.0, 1.2), L = []; for (let t = 1.6; t < 6.6; t += .25) L.push(+(lv(t, t + .25) - ref).toFixed(2));
  console.log('hold efs127 sine carrier ref', ref.toFixed(1), L.join(' '));
  ok('MK7-03 FOLGER 127 hält 5 s ± 0,5 dB (Sinus-Träger)', Math.max(...L.map(Math.abs)) <= .5, '');
}
// K-PEGEL isolated: hold only band k, chl 127 vs 0
{
  let worst = -999;
  for (const k of [1, 8, 16]) {
    const hold = new Array(16).fill(0); hold[k - 1] = 127; const chl = new Array(16).fill(127);
    const a = await render(page, vocSnd(base, {hold, chl, res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]], {sec: 1});
    chl[k - 1] = 0; const b = await render(page, vocSnd(base, {hold, chl, res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 48, .8]], {sec: 1});
    worst = Math.max(worst, db(rms(b.l, 4800) / rms(a.l, 4800)));
  }
  ok('MK7-07 K-PEGEL 0 isoliert ≤ −40 dB', worst <= -40, worst.toFixed(1));
}
Q.summary(); await br.close();
