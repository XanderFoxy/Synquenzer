import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
const q = () => page.evaluate(() => { const r = document.querySelector('.mkqh .pv').getBoundingClientRect(), f = document.querySelector('.mkfr').getBoundingClientRect(); return {pv: [r.top, r.height].map(Math.round), fr: Math.round(f.top), sc: document.querySelector('#synthSheet').scrollTop, ap: EL.app.scrollTop, cls: EL.app.className}; });
console.log('start', await q());
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 4})); await page.waitForTimeout(80);
const e = await el(page, 'f.cut'), [x, y] = ctr(e); await tap(page, x, y); await page.waitForTimeout(60); await tap(page, x, y); await page.waitForTimeout(60);
console.log('nach dbl', await q());
for (const id of ['f.cut', 'o2.semi', 'k3']) { await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(30); const e = await el(page, id); await tap(page, ...ctr(e)); await page.waitForTimeout(300); console.log(id, await q()); }
await b.close();
