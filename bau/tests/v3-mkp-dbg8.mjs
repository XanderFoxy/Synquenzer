import {launch, open, touch, tap} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.evaluate(() => { window.__L = []; window.addEventListener('pointerdown', e => __L.push((e.target.className || e.target.tagName).slice(0, 12) + ' ' + Math.round(e.clientY) + ' w' + e.width), true); });
for (const y of [47, 51, 56, 62, 70]) { await page.evaluate(() => { __L.length = 0; }); const c = page.cdp;
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 385, y, id: 1, radiusX: 0.5, radiusY: 0.5}]}); await page.waitForTimeout(20); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(250);
  console.log(y, await page.evaluate(() => __L.join('|') + ' ' + !!document.querySelector('#sndSheet.open'))); await page.evaluate(() => { if (document.querySelector('#sndSheet.open')) { closeSheets(); SYNQUENZER.openEditor(); } MKUI.view({ansicht: 'ganz'}); }); await page.waitForTimeout(200); }
await b.close();
