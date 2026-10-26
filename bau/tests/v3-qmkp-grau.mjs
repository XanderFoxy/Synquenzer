// MK-P-04: every grey element (vocoder) names its reason in the LCD line after a tap / drag (L2)
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'X';
const b = await launch(); const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 3); MKUI.view({ansicht: 'ganz', haelfte: 'links'}); }); await page.waitForTimeout(400);
const grey = (await panel(page)).elements.filter(e => e.grau).map(e => e.id);
console.log('grey elements', grey.join(' '));
for (const id of grey) {
  await page.evaluate(x => MKUI.view({ansicht: 'ganz', haelfte: x < 55.6 ? 'links' : 'rechts'}), (await panel(page)).elements.find(e => e.id === id).x); await page.waitForTimeout(350);
  const e = (await panel(page)).elements.find(x => x.id === id); const [x, y] = ctr(e);
  await page.evaluate(() => { if (ED.lcd) ED.lcd.textContent = ''; });
  if (e.art === 'k') await touch(page, line(x, y, x, y - 40, 10), 16); else await tap(page, x, y);
  await page.waitForTimeout(150);
  const t = await page.evaluate(() => (ED.lcd ? ED.lcd.textContent.trim().replace(/\s+/g, ' ') : ''));
  console.log((/Vocoder|VOCODER/.test(t) ? 'ok  ' : 'NO REASON ') + id.padEnd(8) + ' "' + t.slice(0, 90) + '"');
}
await b.close();
