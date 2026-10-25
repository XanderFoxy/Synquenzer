import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
for (const [w, h, sa] of [[844, 390, false], [926, 428, true], [667, 375, false], [736, 414, false], [812, 375, true]]) for (const k of ['old', 'neu']) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (sa) await page.addStyleTag({content: SA});
  const r = await page.evaluate(async () => { const out = [];
    for (const id of ['f-moog-bass', null]) { }
    const ids = SYNQUENZER.factory().filter(f => f.engine !== 'drum').slice(0, 6).map(f => f.id).concat(SYNQUENZER.factory().filter(f => f.engine === 'fm6').slice(0, 2).map(f => f.id));
    for (const id of ids) { SYNQUENZER.closeEditor(); SYNQUENZER.loadPreset(0, id); SYNQUENZER.setParam(0, 'fx.vol', .5); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 250));
      const hd = document.querySelector('#synthSheet .sh-head'), hr = hd.getBoundingClientRect(), b = hd.querySelector('.sh-x').getBoundingClientRect(); out.push(Math.round(b.right - hr.right)); }
    return out; });
  console.log(w + 'x' + h + (sa ? '+SA' : ''), k, 'edited sounds, ✕ right edge minus header edge (px, > 0 = clipped):', r.join(' '));
  await ctx.close();
}
await browser.close();
