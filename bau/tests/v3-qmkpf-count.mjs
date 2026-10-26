import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, 'P1', {dpr: 3}); await openMk(page); await page.waitForTimeout(800);
console.log(await page.evaluate(() => { const h = MKUI.P.el.hull, all = [...h.querySelectorAll('*')]; const by = new Map(); let pos = 0, tr = 0;
  for (const e of all) { const cs = getComputedStyle(e); if (cs.position !== 'static') pos++; if (cs.transform !== 'none') tr++; const k = e.tagName + '.' + String(e.className.baseVal ?? e.className).split(' ')[0]; by.set(k, (by.get(k) || 0) + 1); }
  return JSON.stringify({total: all.length, positioned: pos, transformed: tr, doc: document.querySelectorAll('*').length, top: [...by].sort((a, b) => b[1] - a[1]).slice(0, 20)}); }));
await b.close();
