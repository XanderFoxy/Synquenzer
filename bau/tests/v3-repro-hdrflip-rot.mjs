import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const OUT = S + 'dirigent-test/v3-repro-hdrflip/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const st = p => p.evaluate(() => { const sh = document.getElementById('synthSheet'); const seg = sh.querySelector('.sh-head .seg.eng'); const pn = sh.querySelector('.preset .pv');
  return {open: sh.classList.contains('open'), chip: seg.classList.contains('engchip'), eng: [...seg.querySelectorAll('button')].map(x => x.innerText.replace(/\s+/g,' ') + ':' + Math.round(x.getBoundingClientRect().width)).join(' '), nameW: Math.round(pn.getBoundingClientRect().width), nameTrunc: pn.scrollWidth > pn.clientWidth || [...pn.querySelectorAll('*')].some(e => e.scrollWidth > e.clientWidth)}; });
// rotation P1 -> L1 with editor open
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1}); const p = await ctx.newPage();
  await p.goto('file://' + S + 'mk-wt/index.html'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime); await p.waitForTimeout(800);
  await p.tap('#bKlang'); await p.waitForTimeout(700); console.log('P1 open', JSON.stringify(await st(p)));
  await p.setViewportSize({width: 844, height: 390}); await p.waitForTimeout(1200); console.log('rot L1 ', JSON.stringify(await st(p)));
  await p.screenshot({path: OUT + 'rot-L1.png', clip: {x: 0, y: 0, width: 844, height: 120}});
  await p.locator('#synthSheet button.tab', {hasText: 'FILTER'}).tap(); await p.waitForTimeout(500); console.log('L1 FILTER', JSON.stringify(await st(p)));
  await ctx.close(); }
// L2 screenshots
{ const ctx = await b.newContext({viewport: {width: 667, height: 375}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
  await p.goto('file://' + S + 'mk-wt/index.html'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime); await p.waitForTimeout(800);
  await p.tap('#bKlang'); await p.waitForTimeout(700); console.log('L2 open', JSON.stringify(await st(p)));
  await p.screenshot({path: OUT + 'L2-1-open.png', clip: {x: 0, y: 0, width: 667, height: 90}});
  await p.locator('#synthSheet button.tab', {hasText: 'FILTER'}).tap(); await p.waitForTimeout(500); console.log('L2 FILTER', JSON.stringify(await st(p)));
  await p.screenshot({path: OUT + 'L2-2-filter.png', clip: {x: 0, y: 0, width: 667, height: 90}});
  await ctx.close(); }
await b.close();
