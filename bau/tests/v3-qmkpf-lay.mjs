// MK-P fix: cost of styling + laying out the whole plate once (re-attach + forced layout), x1
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2] || 'P1', {dpr: 3}); await openMk(page); await page.waitForTimeout(600);
if (process.env.EXP) await page.evaluate(x => (0, eval)(x), process.env.EXP);
console.log(await page.evaluate(async () => { const out = []; for (let k = 0; k < 5; k++) { const pl = MKUI.PL.el, h = pl.parentNode; pl.remove(); document.body.offsetWidth; await new Promise(r => requestAnimationFrame(r));
  const t0 = performance.now(); h.appendChild(pl); document.body.offsetWidth; const t1 = performance.now(); pl.querySelector('.mkpt').getBoundingClientRect(); const t2 = performance.now(); await new Promise(r => requestAnimationFrame(r)); out.push([+(t1 - t0).toFixed(1), +(t2 - t1).toFixed(1)]); } return JSON.stringify(out); }));
await b.close();
