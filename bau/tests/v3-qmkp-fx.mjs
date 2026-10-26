import {launch, open, openMk, FMT, tapSel, OUT} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of ['P1', 'X', 'L2']) {
  const page = await open(b, f); await openMk(page); await page.waitForTimeout(400);
  const r = s => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map(Math.round).join(','); }, s);
  const a = {fr: await r('#synthSheet .mkfr'), pg: await r('#synthSheet .pg'), body: await r('#synthSheet .sh-body')};
  await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="fx"]'); await page.waitForTimeout(600);
  const c = {fr: await r('#synthSheet .mkfr'), pg: await r('#synthSheet .pg'), body: await r('#synthSheet .sh-body'), sh: await page.evaluate(() => document.scrollingElement.scrollHeight), pgScroll: await page.evaluate(() => { const e = document.querySelector('#synthSheet .pg'); return e ? e.scrollHeight + '/' + e.clientHeight : null; })};
  await page.screenshot({path: OUT + '/fx-' + f + '.png'});
  console.log(f, 'GERÄT', JSON.stringify(a), 'FX', JSON.stringify(c));
  await page.ctx.close();
}
await b.close();
