import * as Q from './v3-qa7-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(); const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/';
for (const [nm, vp] of [['P3', {width: 320, height: 568}], ['L2', {width: 667, height: 375}], ['W', {width: 844, height: 1180}]]) {
  const {page, errs} = await Q.openApp(br, {ctx: {viewport: vp, isMobile: nm !== 'W'}});
  await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
  await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); Q_.setEngine(1, 'analog'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 400)); Q_.mkIn(0, 'e2', 1);
    const c = AU.ctx; AU.synth[1].on(9e6, 57, .9, c.currentTime + .02); AU.synth[1].flush(); AU.synth[0].on(8e6, 48, .8, c.currentTime + .02); AU.synth[0].flush(); });
  await page.evaluate(() => { MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); }); await sleep(400);
  await page.screenshot({path: D + nm + '-eing1-l2.png'});
  await page.evaluate(() => { MKUI.P.shift = 0; MKUI.setWahl(2, 0); }); await sleep(300);
  await page.screenshot({path: D + nm + '-kpegel.png'});
  await page.evaluate(() => { MKUI.P.bA = 'chl'; MKUI.viewOpen('baender'); }); await sleep(800);
  await page.screenshot({path: D + nm + '-baender.png'});
  console.log(nm, 'errs', errs.slice(0, 2));
  await page.context().close();
}
await br.close();
