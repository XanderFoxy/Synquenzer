import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
for (const k of ['old', 'neu']) {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.addStyleTag({content: SA});
  const st = () => page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'), hr = hd.getBoundingClientRect(), b = hd.querySelector('.sh-x').getBoundingClientRect(); return {xRight: Math.round(b.right), headRight: Math.round(hr.right), clipped: b.right > hr.right + .5, name: SYNQUENZER.getSound(0).name, eng: SYNQUENZER.getSound(0).engine}; });
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500);
  // tap the FM key in the header like a user
  const fmb = await page.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet .sh-head .seg.eng button')].find(x => x.innerText.trim() === 'FM'); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(fmb[0], fmb[1]); await page.waitForTimeout(500);
  const a = await st();
  // close the editor with ✕ and open it again
  const xb = await page.evaluate(() => { const r = document.querySelector('#synthSheet .sh-x').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.tap(xb[0], xb[1]); await page.waitForTimeout(500);
  await page.evaluate(() => SYNQUENZER.openEditor()); await page.waitForTimeout(600);
  const b = await st();
  if (k === 'neu') await page.screenshot({path: new URL('./v3-qa-mk1-L1SA-fm-reopen.png', import.meta.url).pathname, clip: {x: 0, y: 40, width: 844, height: 60}});
  console.log(k, 'after tapping FM:', JSON.stringify(a), '| after ✕ and reopening:', JSON.stringify(b));
  await ctx.close();
}
await browser.close();
