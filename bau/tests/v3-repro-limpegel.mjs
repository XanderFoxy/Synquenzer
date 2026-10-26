// Independent repro: CPU limiter stage 1 vs vocoder level (MK7-11 M-PEGEL +-1 dB). Controls included.
import * as Q from './v3-qa7-lib.mjs';
const {SR, render, rms, db} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const sec = 3;
const lv = (x, a, b) => db(rms(x, a * SR, b * SR));
const both = r => { const L = rms(r.l, 1.5 * SR, 3 * SR), R = rms(r.r, 1.5 * SR, 3 * SR); return db(Math.sqrt((L * L + R * R) / 2)); };
const out = [];
// plain INIT AM in vocoder mode, nothing else changed (what a user gets with STIMME -> VOC.)
const init = JSON.parse(JSON.stringify(base)); init.p.mk.mode = 3;
out.push('INIT t0.mix=' + JSON.stringify(init.p.mk.t[0].mix) + ' voc.res=' + init.p.mk.voc.res + ' voc.fs=' + init.p.mk.voc.fs + ' osc1.w=' + JSON.stringify(init.p.mk.t[0].o1 || init.p.mk.t[0].osc1 || null));
const chord = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
for (const v of ['a', 'e', 'o']) {
  const m = Float32Array.from(await page.evaluate(([sec, v]) => SYNQUENZER.mkVowel({f0: 110, v: [v], seg: 3, sec, sr: 48000, rms: -18}), [sec, v]));
  const ref = await render(page, init, chord, {sec, inputs: {e2: m}});
  const ref2 = await render(page, init, chord, {sec, inputs: {e2: m}});
  const noop = await render(page, init, chord, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 0}}]]});
  const lim = await render(page, init, chord, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]});
  let dmax = 0; for (let i = 0; i < ref.l.length; i++) dmax = Math.max(dmax, Math.abs(ref.l[i] - ref2.l[i]));
  // inside one render: level before (0.5-0.95 s) vs after (1.5-3 s) the switch, minus the same in the reference
  const inRun = (lv(lim.l, 1.5, 3) - lv(lim.l, .5, .95)) - (lv(ref.l, 1.5, 3) - lv(ref.l, .5, .95));
  out.push(`INIT vocoder C3-E3-G3-B3, vowel ${v}: determinism max|d|=${dmax.toExponential(1)}, noop(mkLim:0) ${(both(noop) - both(ref)).toFixed(2)} dB, stage1 ${(both(lim) - both(ref)).toFixed(2)} dB (L/R avg), within-run ${inRun.toFixed(2)} dB, ref level ${both(ref).toFixed(1)} dBFS`);
}
// control: Synth mode 0, same saw chord, same switch
{
  const s0 = JSON.parse(JSON.stringify(base));
  const a = await render(page, s0, chord, {sec, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s0, chord, {sec});
  out.push(`Control Synth mode 0 saw chord: stage1 ${(both(a) - both(b)).toFixed(2)} dB`);
}
// control: vocoder with noise carrier
{
  const m = Float32Array.from(await page.evaluate(([sec]) => SYNQUENZER.mkVowel({f0: 110, v: ['a'], seg: 3, sec, sr: 48000, rms: -18}), [sec]));
  const s = Q.vocSnd(base, {}, {mix: {o1: 0, o2: 0, n: 127}});
  const a = await render(page, s, chord, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s, chord, {sec, inputs: {e2: m}});
  out.push(`Control vocoder noise carrier, vowel a: stage1 ${(both(a) - both(b)).toFixed(2)} dB`);
}
// a few RESO values with the plain INIT saw chord
for (const res of [0, 32, 64, 96]) {
  const m = Float32Array.from(await page.evaluate(([sec]) => SYNQUENZER.mkVowel({f0: 110, v: ['a'], seg: 3, sec, sr: 48000, rms: -18}), [sec]));
  const s = Q.vocSnd(base, {res}, {});
  const a = await render(page, s, chord, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s, chord, {sec, inputs: {e2: m}});
  out.push(`INIT saw chord RESO ${res}, vowel a: stage1 ${(both(a) - both(b)).toFixed(2)} dB`);
}
console.log(out.join('\n')); console.log('errs', errs.slice(0, 3));
await br.close();
