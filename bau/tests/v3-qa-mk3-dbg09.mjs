import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
for (const file of ['/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html', '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html']) {
  const {ctx, page, errs} = await open('L1', {file});
  await page.evaluate(() => MKUI.setWahl(1, 2)); await page.waitForTimeout(100);   // OSZ 1
  await tap(page, 'k0'); await pickPop(page, /Dreieck/);
  const c0 = (await mkg(page)).t[0].o1.c1; await drag(page, 'k1', 60, 10); const c1 = (await mkg(page)).t[0].o1.c1;
  await drag(page, 'k1', 60, 10); const c2 = (await mkg(page)).t[0].o1.c1;
  // and a tap after the pop: TIMBRE key in Single shows the lock hint
  await tap(page, 'k0'); await pickPop(page, /Säge/); await tap(page, 'timbre'); const l = await lcd(page);
  console.log(file.split('/').slice(-2).join('/'), 'w', (await mkg(page)).t[0].o1.w, 'STEUER1 first drag after list', c0, '→', c1, ' second drag →', c2, '| tap after list:', l.slice(0, 60));
  await ctx.close();
}
await b.close();
