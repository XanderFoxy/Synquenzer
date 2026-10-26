import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.evaluate(() => { window.__L = []; document.addEventListener('pointerdown', e => __L.push('doc ' + e.target.className + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
for (const [id, h] of [['k8', 6], ['k9', 7], ['k10', 7]]) {
  await page.evaluate(h => MKUI.view({ansicht: 'zoom', halt: h}), h); await page.waitForTimeout(60);
  const e = await el(page, id); const [x, y] = ctr(e);
  await page.evaluate(() => __L.length = 0);
  await touch(page, line(x, y, x, y + 60), 16); await page.waitForTimeout(60);
  console.log(id, h, x, y, await page.evaluate(() => ({L: __L.slice(), hit: MKUI.P.lastHit, view: MKUI.P.view, gest: GEST.size, pt: 0, el: document.elementFromPoint(400, 200).className})));
}
await b.close();
