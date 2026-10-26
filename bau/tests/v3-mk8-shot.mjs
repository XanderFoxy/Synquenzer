import { chromium } from 'playwright';
const FILE = process.argv[2], FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for (const f of (process.argv[3] || 'P1,P3,L2').split(',')) {
  const [w, h] = FMT[f]; const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W'}); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(3, 4); });
  await page.waitForTimeout(400);
  await page.screenshot({path: `v3-mk8-shots/${f}-editor.png`});
  await page.tap('#synthSheet .sh-head .preset .pv'); await page.waitForTimeout(400);
  await page.screenshot({path: `v3-mk8-shots/${f}-bibliothek.png`});
  await page.tap('#sndSheet .brbank'); await page.waitForTimeout(300);
  await page.screenshot({path: `v3-mk8-shots/${f}-bankpop.png`});
  await page.evaluate(() => { closePop(); closeBrowser(true); });
  await page.waitForTimeout(400);
  await page.tap('#synthSheet .sh-head .hb.sv'); await page.waitForTimeout(300);
  await page.screenshot({path: `v3-mk8-shots/${f}-sichern.png`});
  console.log(f, errs);
  await ctx.close();
}
await browser.close();
