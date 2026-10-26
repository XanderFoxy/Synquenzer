import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]), ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], X: [926, 428], XH: [428, 926]};
for (const [f, [w, h]] of Object.entries(FMT)) {
  if (ONLY && !ONLY.includes(f)) continue;
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.stack || e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(700);
  await page.screenshot({path: OUT + '-' + f + '-ganz.png'});
  const info = await page.evaluate(() => { const p = SYNQUENZER.mkPanel(); return p && {fmt: p.fmt, rahmen: p.rahmen, z: p.z, zb: p.zb, ms: p.plateMs, ans: p.ansicht, h: p.haelfte, lcd: p.lcd}; });
  console.log(f, JSON.stringify(info));
  await page.evaluate(() => MKUI.zoomTo(4, false)); await page.waitForTimeout(300);
  await page.screenshot({path: OUT + '-' + f + '-filter.png'});
  await page.evaluate(() => MKUI.view({ansicht: 'spiel'})); await page.waitForTimeout(500);
  await page.screenshot({path: OUT + '-' + f + '-spiel.png'});
  console.log(f, 'errors', errs.length ? errs.slice(0, 5) : 'keine');
  await ctx.close();
}
await browser.close();
