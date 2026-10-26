// MK2 screenshots (portrait / landscape, the new states): OSZ 1 Speicherwelle, PATCH 2, the wave list
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3] || 'v3-mk2-shots');
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
for (const [f, [w, h]] of Object.entries(FMT)) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); SYNQUENZER.mkSet(0, 't.0.o1.c2', 22); MKUI.setWahl(1, 2); MKUI.P.lastKnob = MKUI.knobs()[2]; MKUI.lcdOf(MKUI.knobs()[2]); });
  await page.waitForTimeout(300); await page.screenshot({path: OUT + '/' + f + '-osz1-speicherwelle.png'});
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.p.1.i', 32); MKUI.setWahl(2, 1); MKUI.lcdOf(MKUI.knobs()[2]); });
  await page.waitForTimeout(300); await page.screenshot({path: OUT + '/' + f + '-patch2.png'});
  await page.evaluate(() => { MKUI.setWahl(1, 2); });
  await page.waitForTimeout(200);
  const k = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k2"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
  if (k) { await page.mouse.click(k[0], k[1]); await page.waitForTimeout(400); await page.screenshot({path: OUT + '/' + f + '-wellenliste.png'}); }
  console.log(f, 'errors', errs.length ? errs : 'keine');
  await ctx.close();
}
await browser.close();
