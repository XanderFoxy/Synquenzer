import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of ['P1', 'L1', 'P3']) { const page = await open(b, f, {dpr: 1}); await openMk(page); await page.waitForTimeout(500);
  console.log(f, await page.evaluate(() => { const L = ED.lcd; if (!L) return 'no ED.lcd'; const r = L.getBoundingClientRect(); return JSON.stringify({cls: L.className, r: [r.left, r.top, r.width, r.height].map(Math.round), vis: getComputedStyle(L).visibility, disp: getComputedStyle(L).display, par: L.parentNode && L.parentNode.className, onShow: !!L._onShow, txt: L.textContent.slice(0, 60)}); }));
  await page.ctx.close(); }
await b.close();
