import {launch, openApp} from './v3-qa-mk2-lib.mjs';
const b = await launch();
for (const FILE of [new URL('../synq-snapshots/G-MK1-merged.html', import.meta.url).pathname, new URL('../mk-wt/index.html', import.meta.url).pathname]) {
  const {ctx, page} = await openApp(b, FILE, {vp: {width: 320, height: 568}});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500);
  await page.evaluate(() => { MKUI.setWahl(2, 0); MKUI.render && MKUI.render(); }); await page.waitForTimeout(200);
  const w2 = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="w2"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
  await page.mouse.click(w2[0], w2[1]); await page.waitForTimeout(300);
  const r = await page.evaluate(() => [...document.querySelectorAll('.pop button')].map(x => ({t: x.innerText.replace(/\s+/g, ' ').slice(0, 60), sw: x.scrollWidth, cw: x.clientWidth, inner: [...x.querySelectorAll('*')].filter(y => y.scrollWidth > y.clientWidth + 1).map(y => y.className + ':' + y.textContent.slice(0, 20))})));
  const orig = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="orig"]'); return e ? {sw: e.scrollWidth, cw: e.clientWidth, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, vis: !!e.offsetParent, html: e.outerHTML.slice(0, 200)} : null; });
  console.log(FILE.split('/').pop(), JSON.stringify(r.filter(x => x.sw > x.cw + 1 || x.inner.length)), '\n orig', JSON.stringify(orig));
  await page.screenshot({path: new URL('./v3-qa-mk2-p3-w2-' + (FILE.includes('snap') ? 'old' : 'new') + '.png', import.meta.url).pathname});
  await ctx.close();
}
await b.close();
