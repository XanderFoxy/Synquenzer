import {launch, open, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.render(); });
const u0 = await undoN(page), d0 = await page.evaluate(() => typeof R !== 'undefined' && R.dirty);
for (let k = 0; k < 3; k++) await tap(page, 'timbre');
await tap(page, 'shift'); await tap(page, 'timbre'); await tap(page, 'timbre');
console.log('undo steps by 3 TIMBRE taps + solo on/off:', (await undoN(page)) - u0);
// STIMME UNI-VERST with T2
await tap(page, 'timbre'); await page.evaluate(() => MKUI.setWahl(1, 0)); const a = await mkg(page); await drag(page, 'k4', 40, 8); const c = await mkg(page);
console.log('UNI-VERST with T2: t1 udet', a.t[0].udet, '→', c.t[0].udet, ' t2 udet', a.t[1].udet, '→', c.t[1].udet, '|', await lcd(page));
// EB2 PRIORITÄT list with T2 → only T2
await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await tap(page, 'k0'); await page.waitForTimeout(100);
const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .plist.mkl button')].map(x => x.textContent.trim())); await pickPop(page, /Tiefste|Low|tief/i);
const e = await mkg(page); console.log('PRIORITÄT list', J(rows), '→ t1 prio', e.t[0].prio, 't2 prio', e.t[1].prio);
// STIMMEN knob drag (EB2)
await page.waitForTimeout(800); await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); const tv0 = (await mkg(page)).tv; await drag(page, 'k1', -40, 8); console.log('STIMMEN drag: tv', tv0, '→', (await mkg(page)).tv, '|', await lcd(page));
console.log('errs', errs);
await ctx.close(); await b.close();
