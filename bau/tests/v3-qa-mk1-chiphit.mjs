import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
for (const [w, h] of [[390, 844], [375, 667], [320, 568]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(600);
  const r = await page.evaluate(() => { const b = document.querySelector('#synthSheet .engchip button'); if (!b) return null; const r = b.getBoundingClientRect(), cx = r.x + r.width / 2; let top = null, bot = null;
    for (let y = r.y - 30; y < r.bottom + 30; y += .5) { const e = document.elementFromPoint(cx, y); const on = e && (e === b || b.contains(e)); if (on && top == null) top = y; if (on) bot = y; }
    return {vis: [Math.round(r.width), Math.round(r.height)], hit: top == null ? 0 : +(bot - top + .5).toFixed(1)}; });
  console.log(w + 'x' + h, 'engine chip visible', JSON.stringify(r));
  await ctx.close();
}
await browser.close();
