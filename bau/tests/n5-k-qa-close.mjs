import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({viewport: {width: 390, height: 844}, touch: true, mobile: true});
const keys = await p.evaluate(() => Object.keys(SYNQUENZER).filter(k => /play|stop|scene|launch|close|undo|redo|edited|dirty/i.test(k)));
console.log(keys.join(' '));
const openK1 = async () => { await p.evaluate(() => { loadPreset(3, 'f-moog-bass'); selectTrack(3); ED.tab = 'osc'; openEditor(); }); await p.waitForTimeout(400);
  await p.evaluate(() => SYNQUENZER.k1Open(3)); await p.waitForTimeout(200); return p.evaluate(() => !!document.querySelector('.pop.k1pop')); };
const res = {};
// 1 tap outside (on the editor body far from the pop)
res.open1 = await openK1(); await p.touchscreen.tap(195, 820); await p.waitForTimeout(250); res.tapOutside = !(await p.evaluate(() => !!document.querySelector('.pop.k1pop')));
// 2 play then stop
res.open2 = await openK1(); await p.evaluate(() => { SYNQUENZER.play(); }); await p.waitForTimeout(300); res.afterPlay = !(await p.evaluate(() => !!document.querySelector('.pop.k1pop'))); await p.evaluate(() => SYNQUENZER.stop()); await p.waitForTimeout(200); res.afterStop = !(await p.evaluate(() => !!document.querySelector('.pop.k1pop')));
// 3 scene switch
res.open3 = await openK1(); await p.evaluate(() => { (SYNQUENZER.launchScene || SYNQUENZER.selectScene || (() => {}))(2); }); await p.waitForTimeout(250); res.afterScene = !(await p.evaluate(() => !!document.querySelector('.pop.k1pop')));
// 4 editor close
res.open4 = await openK1(); await p.evaluate(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor()); await p.waitForTimeout(250); res.afterClose = !(await p.evaluate(() => !!document.querySelector('.pop.k1pop')));
console.log(JSON.stringify(res));
// ✕ by finger, „geändert“, toast Rückgängig, redo
await openK1();
const st0 = await p.evaluate(() => ({n: SYNQUENZER.k1Mods(3).length, ed: SYNQUENZER.soundEdited(3), u: SYNQUENZER.undoInfo()}));
const x0 = await p.evaluate(() => { const x = document.querySelector('.pop.k1pop .k1x'); const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, x.getAttribute('aria-label')]; });
await p.touchscreen.tap(x0[0], x0[1]); await p.waitForTimeout(300);
const st1 = await p.evaluate(() => ({n: SYNQUENZER.k1Mods(3).length, ed: SYNQUENZER.soundEdited(3), rows: document.querySelectorAll('.pop.k1pop .k1mr').length, toast: [...document.querySelectorAll('.toast, #toast, .tst')].map(t => t.innerText).join(' | '), dot: [...document.querySelectorAll('.edited, .dirty, .chg, [data-edited]')].filter(e => e.getBoundingClientRect().width > 0).length}));
// tap „Rückgängig“ in the toast
const tb = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Rückgängig' && b.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, Math.round(r.width), Math.round(r.height)]; });
if (tb) { await p.touchscreen.tap(tb[0], tb[1]); await p.waitForTimeout(300); }
const st2 = await p.evaluate(() => ({n: SYNQUENZER.k1Mods(3).length, ed: SYNQUENZER.soundEdited(3), pop: !!document.querySelector('.pop.k1pop'), rows: document.querySelectorAll('.pop.k1pop .k1mr').length}));
await p.evaluate(() => SYNQUENZER.redo()); await p.waitForTimeout(200);
const st3 = await p.evaluate(() => ({n: SYNQUENZER.k1Mods(3).length, ed: SYNQUENZER.soundEdited(3)}));
console.log(JSON.stringify({x0, st0, st1, toastBtn: tb, st2, st3}));
console.log('errs', errs);
await b.close();
