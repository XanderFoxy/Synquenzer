import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
for (const [w, h] of [[390, 844], [844, 390], [320, 568]]) {
  const res = {};
  for (const k of ['old', 'neu']) {
    const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
    const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
    const grab = () => page.evaluate(() => { const A = document.getElementById('kbArea'); const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; };
      return JSON.stringify({area: r(A), kb: r(document.getElementById('kb')), kids: [...A.children].filter(c => c.getBoundingClientRect().width > 0).map(c => c.id || c.className).join(','), keys: [...document.querySelectorAll('#kb [data-n], #kb .key, #kb .white, #kb .black')].slice(0, 30).map(r)}); });
    await page.waitForTimeout(400);
    const a = await grab();
    // after an AM track was selected and back on a VA track
    let b = null;
    if (k === 'neu') { await page.evaluate(() => { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(300); await page.evaluate(() => SYNQUENZER.selectTrack(0)); await page.waitForTimeout(400); b = await grab(); }
    res[k] = [a, b]; await ctx.close();
  }
  console.log(w + 'x' + h, 'VA kb layout equal to 4.8.1 at start:', res.old[0] === res.neu[0], '| after visiting an AM track:', res.old[0] === res.neu[1]);
  if (res.old[0] !== res.neu[0]) console.log('  old', res.old[0].slice(0, 300), '\n  new', res.neu[0].slice(0, 300));
  if (res.old[0] !== res.neu[1]) console.log('  old', res.old[0].slice(0, 300), '\n  aft', res.neu[1].slice(0, 300));
}
await browser.close();
