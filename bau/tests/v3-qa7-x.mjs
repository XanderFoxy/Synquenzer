import * as Q from './v3-qa7-lib.mjs';
const br = await Q.launch(); const {page} = await Q.openApp(br);
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
const r = await page.evaluate(async () => {
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; AU.tracks[1].duck.connect(an);
  const lv = () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 4096 + 1e-30)).toFixed(1); };
  const E = AU.synth[1]; E.on(9e6, 57, .8, c.currentTime + .02); E.flush();
  const out = []; for (let i = 0; i < 12; i++) { await new Promise(r => setTimeout(r, 250)); out.push(lv()); }
  return {eng: S.tracks[1].sound.engine, out, wk: !!AU.synth[1]};
});
console.log(JSON.stringify(r));
await br.close();
