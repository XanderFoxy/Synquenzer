import {launch, open, openMk, FMT, OUT, panel} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of Object.keys(FMT)) {
  const page = await open(b, f);
  await page.waitForTimeout(800);
  const e0 = page.errs.slice();
  await openMk(page);
  await page.waitForTimeout(600);
  await page.screenshot({path: OUT + '/smoke-' + f + '.png'});
  const p = await panel(page);
  const m = await page.evaluate(() => ({sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, ver: SYNQUENZER.version || (typeof VERSION !== 'undefined' ? VERSION : '?')}));
  console.log(f, JSON.stringify(m), 'z', p.z, 'rahmen', JSON.stringify(p.rahmen), 'ansicht', p.ansicht, p.haelfte, 'errsBoot', e0.length, 'errs', JSON.stringify(page.errs).slice(0, 600));
  await page.ctx.close();
}
await b.close();
