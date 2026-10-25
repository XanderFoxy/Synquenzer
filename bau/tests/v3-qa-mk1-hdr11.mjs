import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
for (const [w, h, sa, tag] of [[667, 375, false, 'L2'], [844, 390, true, 'L1SA']]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (sa) await page.addStyleTag({content: SA});
  // user flow: open the editor of track 1, turn one knob (any edit), close with ✕, open again
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(400);
  await page.evaluate(() => SYNQUENZER.setParam(0, 'cutoff', 500)); await page.waitForTimeout(200);
  await page.screenshot({path: new URL(`./v3-qa-mk1-hdr-${tag}-afteredit.png`, import.meta.url).pathname, clip: {x: 0, y: 40, width: w, height: 50}});
  const xb = await page.evaluate(() => { const r = document.querySelector('#synthSheet .sh-x').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, Math.round(r.right)]; });
  await page.touchscreen.tap(xb[0], xb[1]); await page.waitForTimeout(400);
  const closed = await page.evaluate(() => R.editor);
  await page.evaluate(() => SYNQUENZER.openEditor()); await page.waitForTimeout(500);
  const r = await page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'), hr = hd.getBoundingClientRect(), b = hd.querySelector('.sh-x').getBoundingClientRect(); return {x: [Math.round(b.left), Math.round(b.right)], head: Math.round(hr.right)}; });
  await page.screenshot({path: new URL(`./v3-qa-mk1-hdr-${tag}-edited.png`, import.meta.url).pathname, clip: {x: 0, y: 40, width: w, height: 50}});
  console.log(tag, 'before closing ✕ right', xb[2], '| editor after ✕ tap:', closed, '| reopened: ✕', JSON.stringify(r));
  await ctx.close();
}
await browser.close();
