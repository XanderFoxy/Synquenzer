import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.evaluate(() => { window.__L = []; window.addEventListener('pointerdown', e => __L.push((e.target.className || e.target.tagName) + ' ' + e.pointerId + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
const tt = async (nm) => { await page.evaluate(() => { MKUI.view({ansicht: 'ganz'}); __L.length = 0; }); await page.waitForTimeout(30); await tap(page, 385, 51); await page.waitForTimeout(300); console.log(nm, await page.evaluate(() => [__L.join('|'), MKUI.P.ansicht, MKUI.P.halt, !!document.querySelector('#sndSheet.open')])); await page.evaluate(() => { try { closeSheets(); SYNQUENZER.openEditor(); } catch (e) {} }); await page.waitForTimeout(200); };
await tt('frisch');
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 4})); await page.waitForTimeout(60);
const e = await el(page, 'f.cut'), [x, y] = ctr(e); await tap(page, x, y); await page.waitForTimeout(60); await tap(page, x, y); await page.waitForTimeout(60);
await tt('nach Doppeltipp');
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 4})); await page.waitForTimeout(60);
const c = page.cdp, rx = 10, ry = 380; const [x2, y2] = ctr(await el(page, 'f.res'));
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: rx, y: ry, id: 9}]}); await page.waitForTimeout(30);
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: rx, y: ry, id: 9}, {x: x2, y: y2, id: 1}]});
for (let k = 1; k <= 12; k++) { await page.waitForTimeout(12); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: rx, y: ry, id: 9}, {x: x2, y: y2 - 10 * k, id: 1}]}); }
await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(40);
await tt('nach Rest');
await b.close();
