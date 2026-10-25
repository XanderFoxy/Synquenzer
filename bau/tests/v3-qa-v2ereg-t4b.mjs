import { chromium } from 'playwright';
const F = {base: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html', new: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html'};
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [vp, w, h] of [['P2', 375, 667], ['P3', 320, 568]]) for (const k of ['base', 'new']) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 3, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  await p.goto('file://' + F[k]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime); await p.waitForTimeout(800);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.songView(true); }); await p.waitForTimeout(500);
  const info = await p.evaluate(() => { const e = document.querySelector('#songView .sv-lm'), s = e.querySelector('small'), cs = getComputedStyle(s), cb = getComputedStyle(e), cm = getComputedStyle(e.querySelector('.mlt'));
    return {txt: s.textContent, sw: s.scrollWidth, cw: s.clientWidth, ov: cs.overflow, to: cs.textOverflow, bov: cb.overflow, mov: cm.overflow, lbl: e.getBoundingClientRect().width}; });
  console.log(vp, k, JSON.stringify(info));
  await p.locator('#songView .sv-lm').screenshot({path: D + `t4b-${vp}-${k}-lm.png`});
  await ctx.close();
}
await br.close();
