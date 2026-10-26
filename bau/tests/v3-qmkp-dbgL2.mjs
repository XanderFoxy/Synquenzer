import {launch, open, openMk, touch, tap, line, panel, ctr, OUT} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'L2';
const b = await launch(); const page = await open(b, f); await openMk(page);
await page.waitForTimeout(500);
const P0 = await panel(page);
console.log('rahmen', JSON.stringify(P0.rahmen), 'z', P0.z, 'ansicht', P0.ansicht);
for (const id of ['k1', 'k5', 'k9', 'k10', 's1', 'o1.c1', 'k16']) {
  const E = P0.elements.find(e => e.id === id); const [x, y] = ctr(E);
  const r = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className + '|' + (e.closest('[class]') || {}).className + '|' + (e.closest('.mkfr') ? 'inframe' : 'OUT')) : null; }, [x, y]);
  const v0 = await page.evaluate(id => MKUI.get(MKUI.defOf(id) || {}), id);
  await touch(page, line(x, y, x, y - 40, 10), 16); await page.waitForTimeout(150);
  const after = await page.evaluate(() => ({hit: MKUI.P.lastHit}));
  const v1 = await page.evaluate(id => MKUI.get(MKUI.defOf(id) || {}), id);
  console.log(id, 'at', x.toFixed(1), y.toFixed(1), 'elementFromPoint', r, 'lastHit', after.hit, 'v', v0, '->', v1);
}
await page.screenshot({path: OUT + '/dbg-' + f + '.png'});
await b.close();
