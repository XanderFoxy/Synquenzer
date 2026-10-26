import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.evaluate(() => { window.__L = []; window.addEventListener('pointerdown', e => __L.push((e.target.className || e.target.tagName) + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
for (const id of ['a.lvl', 'mix.n']) { await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(30); const e = await el(page, id); await tap(page, ...ctr(e)); await page.waitForTimeout(300); console.log(id, (await panel(page)).halt); }
await page.evaluate(() => MKUI.view({ansicht: 'ganz'})); await page.waitForTimeout(30);
const p = await panel(page); console.log(p.ansicht, p.zOv, p.rahmen);
await page.evaluate(() => __L.length = 0);
await tap(page, p.rahmen.x + 100, p.rahmen.y + 10); await page.waitForTimeout(300);
console.log(await page.evaluate(() => ({L: __L, a: MKUI.P.ansicht, h: MKUI.P.halt, hit: MKUI.P.lastHit, T: MKUI.P.el.T, toast: document.getElementById('toast').className, ef: document.elementFromPoint(150, 60).className})));
await b.close();
