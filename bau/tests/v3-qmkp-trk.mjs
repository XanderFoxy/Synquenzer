// MK-P-08/13: switching between two MS 2000 tracks keeps the zoom and the frame; close/open keeps the zoom
import {launch, open, openMk, panel} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of ['P1', 'X']) {
  const page = await open(b, f); await page.evaluate(() => { SYNQUENZER.setEngine(1, 'mk'); }); await openMk(page, 0);
  await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 5})); await page.waitForTimeout(400);
  const a = await panel(page);
  await page.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }); await page.waitForTimeout(900);
  const c = await panel(page);
  await page.evaluate(() => { closeEditor(); }); await page.waitForTimeout(500); await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(900);
  const d = await panel(page);
  console.log(f, 'T1 zoom', a.ansicht, a.halt, JSON.stringify(a.rahmen), '| T2', c.ansicht, c.halt, JSON.stringify(c.rahmen), '| close+open T1', d.ansicht, d.halt, JSON.stringify(d.rahmen), JSON.stringify(page.errs).slice(0, 200));
  await page.ctx.close();
}
await b.close();
