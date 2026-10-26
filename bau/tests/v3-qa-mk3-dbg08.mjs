import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
{ const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => MKUI.setWahl(2, 9)); await page.waitForTimeout(100);
  console.log('knob k1 box', J(await box(page, 'k1')), 'knobs', J((await panel(page)).knobs.slice(0, 2)));
  await drag(page, 'k1', 80, 12); console.log('after drag up 80: skey', (await mkg(page)).skey, '|', await lcd(page));
  await drag(page, 'k1', -80, 12); console.log('after drag down 80: skey', (await mkg(page)).skey, '|', await lcd(page));
  await tap(page, 'k1'); const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkl button')].map(x => x.textContent.trim())); console.log('GRUNDTON tap list', J(rows));
  await page.evaluate(() => closePop());
  // set scale to Werckmeister by list, then drag GRUNDTON
  await tap(page, 'k0'); await pickPop(page, /Werckmeister/); console.log('scale', (await mkg(page)).scale);
  await drag(page, 'k1', 80, 12); console.log('after list + drag up: skey', (await mkg(page)).skey, '|', await lcd(page), '| pop open?', await page.evaluate(() => !!document.querySelector('.pop')));
  await drag(page, 'k1', 80, 12); console.log('2nd drag up: skey', (await mkg(page)).skey, '|', await lcd(page));
  console.log(errs);
  await ctx.close(); }
{ const {ctx, page, errs} = await open('L1');
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.1.f.cut', 40); MKUI.render(); });
  await tap(page, 'timbre'); console.log('timbre', (await panel(page)).timbre);
  const open3 = async () => { await page.evaluate(() => { const bt = [...document.querySelectorAll('#synthSheet button')].find(x => x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr'); bt.click(); }); await page.waitForTimeout(250); return page.evaluate(() => [...document.querySelectorAll('.pop button[data-a]')].map(x => x.dataset.a)); };
  console.log('menu', J(await open3()));
  const r = await page.evaluate(() => { const bt = document.querySelector('.pop button[data-a="tinit"]'); const q = bt.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  const u0 = await undoN(page); await page.touchscreen.tap(r[0], r[1]); await page.waitForTimeout(300);
  console.log('after tinit: undo +', (await undoN(page)) - u0, 't2 cut', (await mkg(page)).t[1].f.cut, 't1 cut', (await mkg(page)).t[0].f.cut, 'timbre', (await panel(page)).timbre, '|', await lcd(page), '| pop', await page.evaluate(() => !!document.querySelector('.pop')));
  console.log(errs);
  await ctx.close(); }
await b.close();
