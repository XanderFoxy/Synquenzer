import { chromium } from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h] of [[428, 746], [390, 664], [428, 926], [926, 428], [844, 390], [568, 320], [320, 568]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(700);
  const r = await page.evaluate(() => { const pi = SYNQUENZER.mkPanel(); const bad = [];
    const vw = innerWidth, vh = innerHeight;
    for (const e of document.querySelectorAll('#synthSheet .mkx[data-k]')) { const b = e.getBoundingClientRect(); if (b.width === 0) continue; if (b.left < -.5 || b.right > vw + .5 || b.top < -.5 || b.bottom > vh + .5) bad.push(e.dataset.k + ' outside'); }
    const pg = document.querySelector('#synthSheet .pg.mkpg'); const body = document.querySelector('#synthSheet .mkbody');
    const kb = document.getElementById('kb').getBoundingClientRect();
    const tabs = [...document.querySelectorAll('#synthSheet .tabs button, #synthSheet .stab')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 6);
    return {fmt: pi && pi.fmt, half: pi && pi.half, scale: pi && +pi.scale.toFixed(3), body: pi && [Math.round(pi.body.w), Math.round(pi.body.h)], pg: pg ? [Math.round(pg.clientWidth), Math.round(pg.clientHeight), pg.scrollHeight > pg.clientHeight + 1 ? 'SCROLL' : 'ok'] : null, docScroll: [document.documentElement.scrollWidth > vw, document.documentElement.scrollHeight > vh], kb: [Math.round(kb.top), Math.round(kb.height)], bad: bad.slice(0, 5), tabs}; });
  await page.screenshot({path: new URL(`./v3-qa-mk1-fmt-${w}x${h}.png`, import.meta.url).pathname});
  console.log(w + 'x' + h, JSON.stringify(r), errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close();
