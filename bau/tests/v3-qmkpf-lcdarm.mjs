// MK-P fix: the armed LCD line (SPLIT ← TASTE ?) fits in the plate LCD with the app's real font, every format; screenshot
import {launch, open, openMk, tap, panel, ctr, OUT, FMT} from './v3-qmkp-lib.mjs';
import {realFont} from './v3-qmkpf-font.mjs';
const b = await launch(); let bad = 0;
for (const f of Object.keys(FMT)) {
  const page = await open(b, f, {dpr: 2}); await openMk(page); if (!await realFont(page)) throw new Error('font');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.view({modus: 'edit', seite: '01', cursor: 2, ansicht: 'zoom', halt: 9}); MKUI.splitArm(); MKUI.render(); }); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { const L = MKUI.PL.ui.lcd; return {txt: L.textContent, lines: [...L.children].map(x => [x.scrollWidth, x.clientWidth]), font: getComputedStyle(L).fontFamily.slice(0, 30), fits: [...L.children].every(x => x.scrollWidth <= x.clientWidth + 1)}; });
  if (!r.fits) bad++; console.log(f, JSON.stringify(r));
  if (f === 'X' || f === 'P1') { const E = (await panel(page)).elements.find(e => e.id === 'lcd'); if (E.px) await page.screenshot({path: OUT + '/lcdarm-' + f + '.png', clip: {x: Math.max(0, E.px.x - 10), y: Math.max(0, E.px.y - 10), width: E.px.w + 20, height: E.px.h + 20}}); }
  await page.ctx.close();
}
console.log(bad ? 'FAIL ' + bad : 'PASS'); await b.close();
