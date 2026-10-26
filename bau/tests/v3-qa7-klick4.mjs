import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, rms, db} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const hp = x => { const y = new Float64Array(x.length); const g = Math.tan(Math.PI * 5000 / SR); let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
  for (let i = 0; i < x.length; i++) { let v = x[i]; { const k = 2 * Math.cos(Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z2, v1 = a1 * z1 + g * a1 * v3, v2 = z2 + g * a1 * z1 + g * g * a1 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; v = v - k * v1 - v2; }
    { const k = 2 * Math.cos(3 * Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z4, v1 = a1 * z3 + g * a1 * v3, v2 = z4 + g * a1 * z3 + g * g * a1 * v3; z3 = 2 * v1 - z3; z4 = 2 * v2 - z4; v = v - k * v1 - v2; } y[i] = v; } return y; };
const sec = 2.5, ev = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]];
const m = Float32Array.from(await page.evaluate(sec => SYNQUENZER.mkVowel({f0: 120, v: ['u'], seg: 3, sec, sr: 48000, rms: -20}), sec));
const s = vocSnd(base, {}, {mix: {o1: 127, o2: 0, n: 0}});
const a = await render(page, s, ev, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]});
const h = hp(a.l), W = 96; const rows = [];
for (let i = Math.round(.98 * SR / W); i < Math.round(1.09 * SR / W); i++) { let s2 = 0; for (let j = i * W; j < (i + 1) * W; j++) s2 += h[j] * h[j]; rows.push((i * W / SR).toFixed(3) + ':' + (10 * Math.log10(s2 / W + 1e-30)).toFixed(1)); }
console.log('signal rms', db(rms(a.l, SR / 2, SR)).toFixed(1), 'dBFS'); console.log(rows.join('  '));
await br.close();
