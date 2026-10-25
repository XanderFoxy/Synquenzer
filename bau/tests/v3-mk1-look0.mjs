import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [n, w, h] of [['W', 844, 1180], ['L0', 926, 428], ['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => { const R_ = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return {pg: R_('#synthSheet .pg'), body: R_('#synthSheet .sh-body'), head: R_('#synthSheet .sh-head'), bar: R_('#synthSheet .sh-bar'), kb: R_('#kbArea'), seg: R_('#synthSheet .seg.eng'), title: R_('#synthSheet .sh-title')}; });
  console.log(n, JSON.stringify(r));
  await p.screenshot({path: 'v3-mk1-shots/va-' + n + '.png'});
  await p.close();
}
await b.close();
