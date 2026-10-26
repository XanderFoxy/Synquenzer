import { chromium } from 'playwright';
const FILE = process.argv[2], OUT = new URL('./v3-mk6-shots/', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [f, w, h] of [['P1', 390, 844], ['L1', 844, 390], ['P3', 320, 568]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.on', 1); SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) SYNQUENZER.mkSet(0, 't.0.seq.q.0.v.' + s, Math.round(50 * Math.sin(s / 2.5))); MKUI.setWahl(2, 10); });
  await page.waitForTimeout(200); await page.screenshot({path: OUT + 'look0-' + f + '-seq.png'});
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(100); await page.screenshot({path: OUT + 'look0-' + f + '-seq2.png'});
  await page.evaluate(() => { MKUI.P.shift = 0; MKUI.viewOpen('schritte'); }); await page.waitForTimeout(300); await page.screenshot({path: OUT + 'look0-' + f + '-steps.png'});
  console.log(f, JSON.stringify(await page.evaluate(() => { const i = MKUI.stepsInfo(); return i && {w: i.w, h: i.h, geo: i.geo}; })), errs);
  await ctx.close();
}
await browser.close();
