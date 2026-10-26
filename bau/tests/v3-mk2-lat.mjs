import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true}); const page = await ctx.newPage();
await page.goto('file://' + process.argv[2]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(600);
console.log(await page.evaluate(async () => {
  ensureAudio(); await new Promise(r => setTimeout(r, 300));
  const M = MKUI.MKTAB, out = {};
  let t = performance.now(); M.data(); out.decode = performance.now() - t;
  out.single = []; for (const n of [12, 13, 14, 15, 16]) { t = performance.now(); M.wave(n); out.single.push(+(performance.now() - t).toFixed(2)); }
  out.oct = []; for (const n of [62, 63]) { t = performance.now(); for (let j = 0; j < 8; j++) M.mkTables({n, oct: j}); out.oct.push(+(performance.now() - t).toFixed(2)); }
  const s = SYNQUENZER.getSound(0); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * 23 - 2; t = performance.now(); SYNQUENZER.setSound(0, s); out.setSound = performance.now() - t;
  return JSON.stringify(out);
}));
await browser.close();
