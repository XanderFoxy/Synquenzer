import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
for (const [lab, re, wait] of [['Werckmeister', /Werckmeister/, 0], ['Werckmeister', /Werckmeister/, 1500], ['Rein Dur', /Rein Dur/, 0], ['Eigene', /^Eigene/, 0], ['Gleichstufig', /Gleichstufig/, 0]]) {
  const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => MKUI.setWahl(2, 9)); await page.waitForTimeout(100);
  if (lab === 'Gleichstufig') { await page.evaluate(() => SYNQUENZER.mkSet(0, 'scale', 3)); await page.evaluate(() => MKUI.render()); }
  await page.evaluate(() => { window.__k1 = document.querySelector('#synthSheet .mkx[data-k="k1"]'); window.__builds = 0; const o = MKUI.build; });
  await tap(page, 'k0'); await pickPop(page, re); await page.waitForTimeout(wait);
  const same0 = await page.evaluate(() => document.querySelector('#synthSheet .mkx[data-k="k1"]') === window.__k1);
  await drag(page, 'k1', 80, 12); const s1 = (await mkg(page)).skey;
  const same1 = await page.evaluate(() => document.querySelector('#synthSheet .mkx[data-k="k1"]') === window.__k1);
  console.log(lab.padEnd(14), 'wait', wait, 'ms: k1 same element before drag', same0, 'after', same1, '→ skey after first drag', s1, '|', (await lcd(page)).slice(0, 50));
  await ctx.close();
}
await b.close();
