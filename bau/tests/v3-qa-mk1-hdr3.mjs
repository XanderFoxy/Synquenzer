import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
for (const [w, h] of [[568, 320], [640, 360], [844, 390]]) for (const eng of ['analog', 'mk']) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(eng => { if (eng !== 'analog') SYNQUENZER.setEngine(0, eng); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }, eng); await page.waitForTimeout(600);
  const m = () => page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'); const vw = innerWidth; const off = [...hd.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.right > vw + .5; }).map(b => b.getAttribute('aria-label') || b.innerText);
    return {off, cls: [hd.classList.contains('mkht'), !!hd.querySelector('.mk2z')]}; });
  const a = await m();
  // a rebuild like a tab tap
  const tb = await page.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet .stab, #synthSheet .tabs button, #synthSheet [data-tab]')].find(x => /FX/.test(x.innerText)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  if (tb) { await page.touchscreen.tap(tb[0], tb[1]); await page.waitForTimeout(400); }
  const b = await m();
  console.log(w + 'x' + h, eng, 'first open', JSON.stringify(a), '| after FX tab tap', JSON.stringify(b));
  await ctx.close();
}
await browser.close();
