import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], L1: [844, 390], X: [926, 428]};
for (const [f, [w, h]] of Object.entries(FMT)) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(800);
  await page.screenshot({path: OUT + '-' + f + '.png'});
  const r = await page.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }; return {sheet: q('#synthSheet'), head: q('#synthSheet .sh-head'), bar: q('#synthSheet .sh-bar'), body: q('#synthSheet .sh-body'), pg: q('#synthSheet .pg'), kb: q('#kbArea')}; });
  console.log(f, JSON.stringify(r), errs);
  await ctx.close();
}
await browser.close();
