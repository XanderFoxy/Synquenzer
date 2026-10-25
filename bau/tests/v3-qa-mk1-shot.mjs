import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [nm, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.screenshot({path: `v3-qa-mk1-shots/${nm}-home.png`});
  const info = await page.evaluate(() => SYNQUENZER.tracks ? SYNQUENZER.tracks().map(t => [t.name, t.type, t.engine]) : Object.keys(SYNQUENZER).filter(k => /track|Track/.test(k)));
  console.log(nm, JSON.stringify(info).slice(0, 600));
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(600);
  await page.screenshot({path: `v3-qa-mk1-shots/${nm}-editor-va.png`});
  console.log('errs', errs);
  await ctx.close();
}
await browser.close();
