import {launch, open, tap, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const rects = page => page.evaluate(() => { const o = {}; for (const e of document.querySelectorAll('#synthSheet .mkx')) { const r = e.getBoundingClientRect(); o['k:' + e.dataset.k] = [r.x, r.y, r.width, r.height]; }
  const add = (n, e) => { if (e) { const r = e.getBoundingClientRect(); o[n] = [r.x, r.y, r.width, r.height]; } };
  add('wheels', document.getElementById('mkWh')); add('kb', document.getElementById('kbArea') || EL.kbArea); add('lcd', document.querySelector('#synthSheet .lcd')); add('pg', MKUI.P.pg); add('sheet', document.getElementById('synthSheet')); return o; });
const mv = (a, c, only) => { let m = 0, w = ''; for (const k in a) { if (!c[k] || (only && !only.test(k))) continue; const d = Math.max(...[0, 1, 2, 3].map(j => Math.abs(a[k][j] - c[k][j]))); if (d > m) { m = d; w = k; } } return [Math.round(m * 10) / 10, w]; };
for (const f of ['L1', 'P1', 'P2', 'L2']) {
  const {ctx, page} = await open(f);
  await page.evaluate(() => MKUI.setWahl(1, 0)); await page.waitForTimeout(150);
  const r0 = await rects(page);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.render(); MKUI.lcdOf(MKUI.knobs()[1]); }); await page.waitForTimeout(250); const r1 = await rects(page);
  await page.evaluate(() => { MKUI.P.shift = 1; MKUI.timbreKey(); }); await page.waitForTimeout(150); const r2 = await rects(page);
  await page.evaluate(() => { MKUI.timbreKey(); SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); }); await page.waitForTimeout(150); const r3 = await rects(page);
  await page.evaluate(() => MKUI.viewOpen('eigene')); await page.waitForTimeout(250); const r4 = await rects(page);
  await page.evaluate(() => MKUI.viewClose()); await page.waitForTimeout(250); const r5 = await rects(page);
  console.log(f, 'EINZELN→Split (LCD-Taste erscheint)', J(mv(r0, r1)), '| Solo', J(mv(r1, r2)), '| STIMMUNG', J(mv(r2, r3, /^k:/)), '| EIGENE auf: Rahmen/Räder', J(mv(r3, r4, /^(wheels|kb|lcd|pg|sheet)$/)), '| zurück', J(mv(r3, r5)));
  await ctx.close();
}
await b.close();
