import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, db, R, ok} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const hp = x => { const y = new Float64Array(x.length); const g = Math.tan(Math.PI * 5000 / SR); let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
  for (let i = 0; i < x.length; i++) { let v = x[i]; { const k = 2 * Math.cos(Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z2, v1 = a1 * z1 + g * a1 * v3, v2 = z2 + g * a1 * z1 + g * g * a1 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; v = v - k * v1 - v2; }
    { const k = 2 * Math.cos(3 * Math.PI / 8), a1 = 1 / (1 + g * (g + k)); const v3 = v - z4, v1 = a1 * z3 + g * a1 * v3, v2 = z4 + g * a1 * z3 + g * g * a1 * v3; z3 = 2 * v1 - z3; z4 = 2 * v2 - z4; v = v - k * v1 - v2; } y[i] = v; } return y; };
const klick = (x, t0, t1) => { const h = hp(x), W = 96, E = []; for (let i = 0; i + W <= h.length; i += W) { let s2 = 0; for (let j = i; j < i + W; j++) s2 += h[j] * h[j]; E.push(10 * Math.log10(s2 / W + 1e-30)); }
  let w = -99, at = 0; for (let i = Math.round(t0 * SR / W); i < Math.round(t1 * SR / W); i++) { const nb = E.slice(i - 10, i + 11).sort((a, b) => a - b), med = nb[10]; if (E[i] - med > w) { w = E[i] - med; at = i * W / SR; } } return [w, at]; };
for (const [nm, t0, mod] of [['noise', {mix: {o1: 0, o2: 0, n: 127}}, s => noise(s, .3, 2)], ['saw-chord', {mix: {o1: 127, o2: 0, n: 0}}, s => noise(s, .3, 2)], ['saw-sine', {mix: {o1: 127, o2: 0, n: 0}}, s => sine(1150, s, .3)]]) {
  const sec = 3, s = vocSnd(base, {res: 64}, t0);
  for (const sw of [1.0, 1.3333]) {
    const a = await render(page, s, [[0, 'on', 48, .8], [0, 'on', 55, .8]], {sec, inputs: {e2: mod(sec)}, at: [[sw, {set: {mkLim: 1}}], [2.0, {set: {mkLim: 0}}]]});
    const b = await render(page, s, [[0, 'on', 48, .8], [0, 'on', 55, .8]], {sec, inputs: {e2: mod(sec)}});
    const [ka, ta] = klick(a.l, sw - .1, sw + .15), [kb] = klick(b.l, sw - .1, sw + .15), [ka2, ta2] = klick(a.l, 1.9, 2.15), [kb2] = klick(b.l, 1.9, 2.15);
    console.log(nm, 'switch@' + sw, 'on: +' + ka.toFixed(1) + ' dB at ' + ta.toFixed(3) + ' (unswitched same window +' + kb.toFixed(1) + ')', ' off@2.0: +' + ka2.toFixed(1) + ' at ' + ta2.toFixed(3) + ' (unsw +' + kb2.toFixed(1) + ')');
  }
}
await br.close();
