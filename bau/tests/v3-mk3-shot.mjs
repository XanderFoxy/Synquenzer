// MK3 screenshots (portrait / landscape): STIMME Split + LCD key, STIMME EB2, TIMBRE T2, STIMMUNG, EIGENE, copy list
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3] || 'v3-mk3-shots'), ONLYF = process.argv[4] ? process.argv[4].split(',') : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
for (const [f, [w, h]] of Object.entries(FMT)) {
  if (ONLYF && !ONLYF.includes(f)) continue;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  const shot = async n => { await page.waitForTimeout(250); await page.screenshot({path: OUT + '/' + f + '-' + n + '.png'}); };
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.setWahl(1, 0); MKUI.P.lastKnob = MKUI.knobs()[1]; MKUI.lcdOf(MKUI.knobs()[1]); });
  await shot('stimme-split');
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); MKUI.lcdOf(MKUI.knobs()[2]); });
  await shot('stimme-eb2');
  await page.evaluate(() => { MKUI.P.shift = 0; MKUI.timbreKey(); MKUI.setWahl(1, 5); });
  await shot('filter-t2');
  await page.evaluate(() => { MKUI.timbreKey(); MKUI.render(); });
  await shot('filter-beide');
  await page.evaluate(() => { MKUI.timbreKey(); MKUI.P.shift = 1; MKUI.timbreKey(); });
  await shot('solo');
  await page.evaluate(() => { MKUI.timbreKey(); SYNQUENZER.mkSet(0, 'scale', 5); MKUI.setWahl(2, 9); });
  await shot('stimmung');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); MKUI.viewOpen('eigene'); });
  await shot('eigene');
  await page.evaluate(() => { MKUI.viewClose(); MKUI.timCopyPop(null); });
  await shot('kopieren');
  console.log(f, 'errors', errs.length ? errs : 'keine');
  await ctx.close();
}
await browser.close();
