import { open, buildSong, vocalWav, APP } from './mixa-lib.mjs';
const {p, errs, close} = await open(APP);
const bpm = await p.evaluate(() => window.SYNQUENZER.project().bpm), spb = 60 / bpm;
await buildSong(p, {vocal: vocalWav(12 * 4 * spb + 1, 48000, 4 * 4 * spb)});
for (const z of [-14, -9]) {
  let t = Date.now(); const m = await p.evaluate(z => window.SYNQUENZER.mixaMeasureAm(z), z); const ms = Date.now() - t;
  const am = await p.evaluate(() => window.SYNQUENZER.mixaInfo().am);
  console.log(z, ms, 'ms', JSON.stringify(am.P));
  await p.evaluate(() => window.SYNQUENZER.amApply());
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, D = Q.mixaCore(); await Q.vvRender({}); const r = Q.vvPcm(); return null; });
  // measure the video render inside the page
  const q = await p.evaluate(() => { const D = window.SYNQUENZER.mixaCore(); const r = VV.last, L = r.ch[0], R = r.ch[1]; return {I: D.integ(D.kblocks([L, R], r.sr)), tp16: D.truePeak([L, R], 16, 64), tp4: D.tpLim([L, R]), dur: r.dur, info: window.SYNQUENZER.mixaInfo().nodes}; });
  console.log('video', JSON.stringify(q));
}
console.log('errs', errs.slice(0, 5));
await close();
