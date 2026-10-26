import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
for (const f of ['L1', 'P1', 'P3', 'L2']) {
  const {ctx, page, errs} = await open(f);
  if (f === 'P3' || f === 'L2') await page.evaluate(() => { MKUI.setHalf('A'); MKUI.build(MKUI.P.pg, 0); });
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(100);
  const keys = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k^="n"]')].map(e => [e.dataset.k, e.innerText.replace(/\s+/g, ' ').trim(), e.classList.contains('dark') || !!e.querySelector('.mdk,.dark'), Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)]));
  const tim = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="timbre"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [e.innerText.replace(/\s+/g, ' ').trim(), Math.round(r.width) + 'x' + Math.round(r.height)]; });
  console.log(f, 'SHIFT keys', J(keys), '| TIMBRE', J(tim));
  await ctx.close();
}
await b.close();
