import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, db} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const hp = x => { const y = new Float64Array(x.length); const g = Math.tan(Math.PI * 5000 / SR); let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
  for (let i = 0; i < x.length; i++) { let v = x[i]; { const k = 2 * Math.cos(Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z2, v1 = a1 * z1 + g * a1 * v3, v2 = z2 + g * a1 * z1 + g * g * a1 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; v = v - k * v1 - v2; }
    { const k = 2 * Math.cos(3 * Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z4, v1 = a1 * z3 + g * a1 * v3, v2 = z4 + g * a1 * z3 + g * g * a1 * v3; z3 = 2 * v1 - z3; z4 = 2 * v2 - z4; v = v - k * v1 - v2; } y[i] = v; } return y; };
const klick = (x, t0, t1) => { const h = hp(x), W = 96, E = []; for (let i = 0; i + W <= h.length; i += W) { let s2 = 0; for (let j = i; j < i + W; j++) s2 += h[j] * h[j]; E.push(10 * Math.log10(s2 / W + 1e-30)); }
  let w = -99, at = 0; for (let i = Math.round(t0 * SR / W); i < Math.round(t1 * SR / W); i++) { const nb = E.slice(i - 10, i + 11).sort((a, b) => a - b), med = nb[10]; if (E[i] - med > w) { w = E[i] - med; at = i * W / SR; } } return [w, at]; };
const sec = 3, vowF = Float32Array.from(await page.evaluate(sec => SYNQUENZER.mkVowel({f0: 140, v: ['a'], seg: 3, sec, sr: 48000, rms: -20}), sec));
const ev = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]];
// control: synth mode 0 (no vocoder) same switch
{ const s = JSON.parse(JSON.stringify(base)); s.p.mk.t[0].f.cut = 90;
  const a = await render(page, s, ev, {sec, at: [[1.0, {set: {mkLim: 1}}], [2.0, {set: {mkLim: 0}}]]});
  console.log('synth mode0 control: on', klick(a.l, .95, 1.15).map(x => x.toFixed(3)).join(' '), 'off', klick(a.l, 1.95, 2.15).map(x => x.toFixed(3)).join(' ')); }
// several seeds / vowels for the vocoder
for (const v of ['a', 'e', 'i', 'o', 'u']) {
  const m = Float32Array.from(await page.evaluate(([sec, v]) => SYNQUENZER.mkVowel({f0: 120, v: [v], seg: 3, sec, sr: 48000, rms: -20}), [sec, v]));
  const s = vocSnd(base, {}, {mix: {o1: 127, o2: 0, n: 0}});
  const a = await render(page, s, ev, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}], [2.0, {set: {mkLim: 0}}]]});
  const b = await render(page, s, ev, {sec, inputs: {e2: m}});
  console.log('INIT voc vowel ' + v + ': on +' + klick(a.l, .95, 1.15)[0].toFixed(1) + ' (base +' + klick(b.l, .95, 1.15)[0].toFixed(1) + ')  off +' + klick(a.l, 1.95, 2.15)[0].toFixed(1) + ' (base +' + klick(b.l, 1.95, 2.15)[0].toFixed(1) + ')');
}
await br.close();
