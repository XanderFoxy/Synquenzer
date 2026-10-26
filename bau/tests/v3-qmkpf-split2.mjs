// MK-P fix: Split ← nächste Note ends with a scene change and a second tap on the display; the plate LCD shows the armed state
import {launch, open, openMk, tap, panel, ctr} from './v3-qmkp-lib.mjs';
const b = await launch(); const fail = [];
for (const w of ['scene', 'lcd2', 'tab']) {
  const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.view({modus: 'edit', seite: '01', cursor: 2}); MKUI.renderSoon(); }); await page.waitForTimeout(200);
  const lcd = (await panel(page)).elements.find(e => e.id === 'lcd'); await tap(page, ...ctr(lcd)); await page.waitForTimeout(200);
  const armed = await page.evaluate(() => ({arm: MKUI.P.splitArm, l2: MKUI.lcdLines()[1], plate: MKUI.PL.ui.lcd.textContent}));
  if (w === 'scene') await page.evaluate(() => SYNQUENZER.launchScene(1));
  if (w === 'lcd2') await tap(page, ...ctr(lcd));
  if (w === 'tab') await page.evaluate(() => MKUI.view({ansicht: 'spiel'}));
  await page.waitForTimeout(300);
  const mid = await page.evaluate(() => ({arm: MKUI.P.splitArm, l2: MKUI.lcdLines()[1]}));
  if (w === 'tab') { await page.evaluate(async () => { await SYNQUENZER.tap(72, 120); }); await page.waitForTimeout(200); }
  const sp = await page.evaluate(() => SYNQUENZER.mkGet(0).split);
  const good = armed.arm && /SPLIT ← TASTE/.test(armed.plate) && (w === 'tab' ? sp === 72 : !mid.arm && !/TASTE/.test(mid.l2));
  if (!good) fail.push(w);
  console.log(w, JSON.stringify({armed, mid, split: sp}), good ? 'ok' : 'FAIL', JSON.stringify(page.errs).slice(0, 200));
  await page.ctx.close();
}
console.log('FEHLER', fail.length, JSON.stringify(fail)); await b.close();
