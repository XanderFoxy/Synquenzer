import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h] of [[428, 926], [414, 896], [390, 844], [375, 812], [844, 390], [667, 375]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(300);
  const info = () => page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'); const seg = hd.querySelector('.seg.eng'); const tt = hd.querySelector('.sh-title'); const pv = hd.querySelector('.pv');
    return {chip: seg.classList.contains('engchip'), keys: [...seg.querySelectorAll('button')].map(b => b.innerText.replace(/\n/g, '|')).join(','), title: [tt.innerText.replace(/\n/g, ' '), Math.round(tt.getBoundingClientRect().width)], pv: pv ? [pv.innerText, pv.scrollWidth, pv.clientWidth, Math.round(pv.getBoundingClientRect().width), getComputedStyle(pv).textOverflow] : null, eng: SYNQUENZER.getSound(0).engine}; });
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
  const a = await info();
  // rebuild the open sheet without any change (tab switch to FX and back)
  await page.evaluate(() => safeRebuild(buildSynthEd)); await page.waitForTimeout(200);
  const b = await info();
  // close and reopen
  await page.evaluate(() => { SYNQUENZER.closeEditor(); }); await page.waitForTimeout(300); await page.evaluate(() => SYNQUENZER.openEditor()); await page.waitForTimeout(400);
  const c = await info();
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'mk')); await page.waitForTimeout(300);
  const d = await info();
  await page.evaluate(() => { SYNQUENZER.closeEditor(); }); await page.waitForTimeout(300); await page.evaluate(() => SYNQUENZER.openEditor()); await page.waitForTimeout(400);
  const e = await info();
  console.log(w + 'x' + h, '\n first open ', JSON.stringify(a), '\n rebuilt    ', JSON.stringify(b), '\n reopened   ', JSON.stringify(c), '\n mk switch  ', JSON.stringify(d), '\n mk reopen  ', JSON.stringify(e));
  await ctx.close();
}
await browser.close();
