import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, rms, db} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page); const sec = 3;
const m = Float32Array.from(await page.evaluate(([sec, v]) => SYNQUENZER.mkVowel({f0: 120, v: [v], seg: 3, sec, sr: 48000, rms: -20}), [sec, 'i']));
const s = vocSnd(base, {res: 64}, {mix: {o1: 127, o2: 0, n: 0}});
for (let i = 0; i < 6; i++) {
  const a = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]});
  const b = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: m}});
  const lv = x => [0, .5, 1, 1.5, 2, 2.5].map(t => db(rms(x.l, t * SR, (t + .5) * SR)).toFixed(1)).join(' ');
  console.log('switch  ', lv(a), ' len', a.l.length); console.log('no sw   ', lv(b), ' len', b.l.length);
}
console.log('errs', errs); await br.close();
