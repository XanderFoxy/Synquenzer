import * as Q from './v3-qa7-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
// ECO badge
const e = await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 300));
  await Q_.forceNative(true); await new Promise(r => setTimeout(r, 1500));
  return {ecoHidden: ED.eco && ED.eco.hidden, ecoB: ED.ecoB && ED.ecoB.className, ecoBtxt: ED.ecoB && ED.ecoB.innerText, title: ED.eco && ED.eco.title}; });
console.log('ECO', JSON.stringify(e));
const b = await page.evaluate(() => { const r = ED.ecoB.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await page.mouse.click(b[0], b[1]); await sleep(300);
console.log('LCD after badge tap:', await page.evaluate(() => ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''), ' engine now', await page.evaluate(() => S.tracks[0].sound.engine));
await page.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/eco.png'});
await page.evaluate(() => SYNQUENZER.forceNative(false)); await sleep(800);
// hold live level over time
const r = await page.evaluate(async () => {
  const Q_ = SYNQUENZER; Q_.setEngine(1, 'analog'); const s = Q_.getSound(0); s.p.mk.voc.hold = [0, 34, 28, 15, 63, 22, 48, 25, 34, 40, 38, 34, 33, 33, 31, 28]; Q_.setSound(0, s);
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; AU.tracks[0].cut.connect(an);
  const lv = () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 4096 + 1e-30)).toFixed(1); };
  const A = AU.synth[0]; for (const [k, n] of [[1, 48], [2, 52], [3, 55]]) A.on(8e6 + k, n, .8, c.currentTime + .02); A.flush();
  const out = []; for (let i = 0; i < 16; i++) { await new Promise(r => setTimeout(r, 500)); out.push(lv()); }
  const B = AU.synth[1]; B.on(9e6, 57, .8, c.currentTime + .02); B.flush(); const out2 = []; for (let i = 0; i < 12; i++) { await new Promise(r => setTimeout(r, 500)); out2.push(+(10 * Math.log10(1e-30)).toFixed(0)); }
  return {out, voices: SYNQUENZER.voices ? JSON.stringify(SYNQUENZER.voices()).slice(0, 300) : ''};
});
console.log('hold level over 8 s (0.5 s steps):', r.out.join(' '));
console.log('errs', errs.slice(0, 3));
await br.close();
