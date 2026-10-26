import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q; const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
await page.evaluate(() => {
  const Q_ = SYNQUENZER; Q_.setEngine(1, 'analog'); Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 0; s.p.mk.voc.hpl = 127; s.p.mk.voc.hpg = 0; Q_.setSound(0, s);
  Q_.mkIn(0, 'e2', 1, 0);   // source only as input
  const c = AU.ctx, mk = n => { const an = c.createAnalyser(); an.fftSize = 4096; n.connect(an); return () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 4096 + 1e-30)).toFixed(1); }; };
  window.__m = mk(AU.masterSum); window.__v = mk(AU.tracks[0].cut);
  // source: a held saw on track 1 (bright: has content above 6 kHz)
  const E = AU.synth[1]; E.on(9e6, 69, .9, c.currentTime + .02); E.flush();
});
await sleep(600);
const a = await page.evaluate(() => ({master: __m(), voc: __v(), mute: S.tracks[0].mute}));
await page.evaluate(() => SYNQUENZER.setMute(0, true)); await sleep(600);
const b = await page.evaluate(() => ({master: __m(), voc: __v(), mute: S.tracks[0].mute}));
await page.evaluate(() => { SYNQUENZER.setMute(0, false); const s = SYNQUENZER.getSound(0); s.p.mk.voc.dir = 127; s.p.mk.voc.hpl = 0; SYNQUENZER.setSound(0, s); SYNQUENZER.setMute(0, true); }); await sleep(600);
const c = await page.evaluate(() => ({master: __m(), voc: __v(), mute: S.tracks[0].mute}));
console.log(JSON.stringify({unmuted_HPF: a, muted_HPF: b, muted_DIREKT: c}));
ok('Stumme Vocoder-Spur schweigt (HPF-PEGEL 127, HPF-GATE DIS)', b.voc < -90, `Vocoder-Spur im Master: offen ${a.voc} dB, stumm ${b.voc} dB (Master ${b.master})`);
ok('Stumme Vocoder-Spur schweigt (DIREKT 127)', c.voc < -90, `stumm ${c.voc} dB (Master ${c.master})`);
console.log('errs', errs.slice(0, 3)); Q.summary(); await br.close();
