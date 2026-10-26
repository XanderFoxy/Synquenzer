import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, rms, db} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page); const sec = 3; let silent = 0, n = 0;
const m = Float32Array.from(await page.evaluate(([sec, v]) => SYNQUENZER.mkVowel({f0: 120, v: [v], seg: 3, sec, sr: 48000, rms: -20}), [sec, 'i']));
for (const res of [0, 64, 127]) for (const sw of [0, 1]) for (let i = 0; i < 6; i++) {
  const s = vocSnd(base, {res}, {mix: {o1: 127, o2: 0, n: 0}});
  const o = {sec, inputs: {e2: m}}; if (sw) o.at = [[1.0, {set: {mkLim: 1}}]];
  const a = await render(page, s, [[0, 'on', 48, .8]], o); n++;
  const l = db(rms(a.l, 1.5 * SR, 3 * SR)); if (l < -200) { silent++; console.log('silent', res, sw, i, db(rms(a.l, 0, .5 * SR))); }
}
console.log('silent', silent, 'of', n, 'errs', errs); await br.close();
