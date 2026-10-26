import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, db, R, ok} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const hp = x => { const y = new Float64Array(x.length); const g = Math.tan(Math.PI * 5000 / SR); let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
  for (let i = 0; i < x.length; i++) { let v = x[i]; { const k = 2 * Math.cos(Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z2, v1 = a1 * z1 + g * a1 * v3, v2 = z2 + g * a1 * z1 + g * g * a1 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; v = v - k * v1 - v2; }
    { const k = 2 * Math.cos(3 * Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z4, v1 = a1 * z3 + g * a1 * v3, v2 = z4 + g * a1 * z3 + g * g * a1 * v3; z3 = 2 * v1 - z3; z4 = 2 * v2 - z4; v = v - k * v1 - v2; } y[i] = v; } return y; };
const klick = (x, t0, t1) => { const h = hp(x), W = 96, E = []; for (let i = 0; i + W <= h.length; i += W) { let s2 = 0; for (let j = i; j < i + W; j++) s2 += h[j] * h[j]; E.push(10 * Math.log10(s2 / W + 1e-30)); }
  let w = -99, at = 0, lv = 0, md = 0; for (let i = Math.round(t0 * SR / W); i < Math.round(t1 * SR / W); i++) { const nb = E.slice(i - 10, i + 11).sort((a, b) => a - b), med = nb[10]; if (E[i] - med > w) { w = E[i] - med; at = i * W / SR; lv = E[i]; md = med; } } return [w, at, lv, md]; };
const sec = 3;
const vow = await page.evaluate(sec => SYNQUENZER.mkVowel({f0: 140, v: ['a'], seg: 3, sec, sr: 48000, rms: -20}), sec);
const vowF = Float32Array.from(vow);
console.log('vowel rms', db(rms(vowF)).toFixed(1));
for (const [nm, voc, t0, mod] of [
  ['INIT-voc saw chord, vowel a', {}, {mix: {o1: 127, o2: 0, n: 0}}, vowF],
  ['res64 saw chord, vowel a', {res: 64}, {mix: {o1: 127, o2: 0, n: 0}}, vowF],
  ['res127 saw chord, vowel a', {res: 127}, {mix: {o1: 127, o2: 0, n: 0}}, vowF],
  ['res64 saw chord, sine 1150', {res: 64}, {mix: {o1: 127, o2: 0, n: 0}}, sine(1150, sec, .1)],
]) {
  const s = vocSnd(base, voc, t0), ev = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]];
  const a = await render(page, s, ev, {sec, inputs: {e2: mod}, at: [[1.0, {set: {mkLim: 1}}], [2.0, {set: {mkLim: 0}}]]});
  const b = await render(page, s, ev, {sec, inputs: {e2: mod}});
  const [ka, ta, la, ma] = klick(a.l, .95, 1.15), [kb] = klick(b.l, .95, 1.15), [ka2, ta2, la2, ma2] = klick(a.l, 1.95, 2.15), [kb2] = klick(b.l, 1.95, 2.15);
  console.log(`${nm}: rms ${db(rms(a.l, SR / 2, SR)).toFixed(1)} dBFS | on +${ka.toFixed(1)} dB @${ta.toFixed(3)} (HP win ${la.toFixed(1)} / med ${ma.toFixed(1)} dB) base +${kb.toFixed(1)} | off +${ka2.toFixed(1)} @${ta2.toFixed(3)} (HP ${la2.toFixed(1)} / med ${ma2.toFixed(1)}) base +${kb2.toFixed(1)}`);
  // max sample-to-sample jump of the difference a-b around the switch
}
await br.close();
