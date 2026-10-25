import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
for (const k of ['old', 'neu']) {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.addStyleTag({content: SA});
  const ids = await page.evaluate(() => SYNQUENZER.factory().filter(f => f.engine !== 'drum').map(f => [f.id, f.engine, f.name]));
  let bad = [], n = 0;
  for (const [id, eng, name] of ids) {
    const r = await page.evaluate(id => { SYNQUENZER.closeEditor(); SYNQUENZER.loadPreset(0, id); SYNQUENZER.setParam(0, 'fx.vol', .5); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); return new Promise(res => setTimeout(() => { const hd = document.querySelector('#synthSheet .sh-head'), hr = hd.getBoundingClientRect(), b = hd.querySelector('.sh-x').getBoundingClientRect(); res(Math.round(b.right - hr.right)); }, 250)); }, id);
    n++; if (r > 0) bad.push(eng + ':' + name + '(+' + r + 'px)');
  }
  console.log(k, 'sounds opened', n, '| ✕ beyond the header edge:', bad.length, bad.slice(0, 40).join(', '));
  await ctx.close();
}
await browser.close();
