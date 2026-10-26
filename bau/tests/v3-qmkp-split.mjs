// typische Fehler 6/10: "Split ← nächste Note" (armed by a tap on the display at 01 COMMON SPLIT) must end with any other tap, Stop, scene change
import {launch, open, openMk, tap, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch();
const ways = ['exit', 'cur.r', 'knob', 'stop', 'none'];
for (const w of ways) {
  const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.view({modus: 'edit', seite: '01', cursor: 2}); MKUI.renderSoon(); });
  await page.waitForTimeout(200);
  const P0 = await panel(page); const lcd = P0.elements.find(e => e.id === 'lcd');
  const sp0 = await page.evaluate(() => ({split: SYNQUENZER.mkGet(0).split, item: MKUI.curItem().p, lcd: MKUI.lcdLines()}));
  await tap(page, ...ctr(lcd)); await page.waitForTimeout(200);   // arm
  const armed = await page.evaluate(() => ({arm: MKUI.P.splitArm, lcd: MKUI.lcdLines(), head: (document.querySelector('.mkqh .lcd') || {}).textContent}));
  if (w === 'exit' || w === 'cur.r') { const E = (await panel(page)).elements.find(e => e.id === w); await tap(page, ...ctr(E)); }
  if (w === 'knob') { const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, ...ctr(E)); }
  if (w === 'stop') await page.evaluate(() => { SYNQUENZER.play(); }), await page.waitForTimeout(300), await page.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.stop(); });
  await page.waitForTimeout(1500);
  const mid = await page.evaluate(() => ({arm: MKUI.P.splitArm, lcd: MKUI.lcdLines()}));
  await page.evaluate(async () => { await SYNQUENZER.tap(72, 120); });
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({split: SYNQUENZER.mkGet(0).split, arm: MKUI.P.splitArm, undo: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label}));
  console.log(w.padEnd(6), 'split', sp0.split, '-> armed', armed.arm, '| after', w, 'still armed', mid.arm, 'lcd', JSON.stringify(mid.lcd), '| note 72 -> split', after.split, after.undo, JSON.stringify(page.errs).slice(0, 200));
  await page.ctx.close();
}
await b.close();
