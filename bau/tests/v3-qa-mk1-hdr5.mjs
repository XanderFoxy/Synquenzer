import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
for (const [w, h] of [[844, 390], [926, 428]]) for (const k of ['old', 'neu']) for (const eng of k === 'old' ? ['analog', 'fm6'] : ['analog', 'fm6', 'mk']) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.addStyleTag({content: SA});
  await page.evaluate(eng => { if (SYNQUENZER.getSound(0).engine !== eng) SYNQUENZER.setEngine(0, eng); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }, eng); await page.waitForTimeout(600);
  const m = () => page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'); const hr = hd.getBoundingClientRect(); const out = [...hd.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.right > hr.right + .5; }).map(b => (b.getAttribute('aria-label') || b.innerText).slice(0, 12) + '@' + Math.round(b.getBoundingClientRect().right) + '>' + Math.round(hr.right));
    const pre = hd.querySelector('.preset'); return {off: out, preset: pre ? Math.round(pre.getBoundingClientRect().width) : null, scroll: hd.scrollWidth > hd.clientWidth + 1}; });
  const a = await m();
  await page.evaluate(() => safeRebuild(buildSynthEd)); await page.waitForTimeout(300);
  const b = await m();
  console.log(w + 'x' + h + '+SA', k, eng, 'first open', JSON.stringify(a), '| rebuilt', JSON.stringify(b));
  await ctx.close();
}
await browser.close();
