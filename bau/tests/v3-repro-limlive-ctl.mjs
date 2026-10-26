import * as Q from './v3-qa7-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
const r = await page.evaluate(async () => {
  const Q_ = SYNQUENZER; Q_.setEngine(1, 'analog'); Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s);
  // modulator: the vowel source looped into track 1's chain (pre-fader) -> E2 of track 0, track 1 only as input
  const c = AU.ctx, x = SYNQUENZER.mkVowel({f0: 120, v: ['a'], sec: 4, sr: c.sampleRate, rms: -20}), b = c.createBuffer(1, x.length, c.sampleRate); b.getChannelData(0).set(Float32Array.from(x));
  const src = c.createBufferSource(); src.buffer = b; src.loop = true; src.connect(AU.tracks[1].duck); src.start();
  Q_.mkIn(0, 'e2', 1, 0);
  const an = c.createAnalyser(); an.fftSize = 32768; AU.tracks[0].cut.connect(an);
  const lv = () => { const d = new Float32Array(32768); an.getFloatTimeDomainData(d); let s2 = 0; for (const v of d) s2 += v * v; return 10 * Math.log10(s2 / d.length + 1e-30); };
  const A = AU.synth[0]; for (const [k, n] of [[1, 48], [2, 52], [3, 55]]) A.on(8e6 + k, n, .8, c.currentTime + .02); A.flush();
  const avg = async () => { let s3 = 0; for (let i = 0; i < 6; i++) { await new Promise(r => setTimeout(r, 700)); s3 += lv(); } return s3 / 6; };
  await new Promise(r => setTimeout(r, 800));
  const before = await avg(), l0 = LIM.level;
  /* no inject */ await new Promise(r => setTimeout(r, 2500));
  const l1 = LIM.level, after = await avg();
  return {before: +before.toFixed(2), after: +after.toFixed(2), lim: [l0, l1]};
});
console.log(JSON.stringify(r), 'Δ', (r.after - r.before).toFixed(2), 'dB'); console.log('errs', errs.slice(0, 3));
await br.close();
