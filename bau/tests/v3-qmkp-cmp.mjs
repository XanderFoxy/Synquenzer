// COMPARE with a real two-finger touch: EDIT held, EXIT tapped (EXIT released first)
import {launch, open, openMk, panel} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'X';
const b = await launch(); const page = await open(b, f); await openMk(page);
await page.evaluate(() => { SYNQUENZER.initSound(0); }); await page.waitForTimeout(500);
await page.evaluate(() => { MKUI.view({ansicht: f => 0 || 'ganz'}); MKUI.view({ansicht: 'zoom', halt: 13}); }); await page.waitForTimeout(400);
await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 40)); await page.waitForTimeout(100);
await page.evaluate(() => { window.__E = []; const fr = MKUI.P.el.fr; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'lostpointercapture']) fr.addEventListener(t, e => window.__E.push(t + '#' + e.pointerId + ' held=' + MKUI.P.editHeld), true); });
const P = await panel(page); const eE = P.elements.find(e => e.id === 'edit'), xE = P.elements.find(e => e.id === 'exit');
const cdp = page.cdp, pt = (e, id) => ({x: e.px.x + e.px.w / 2, y: e.px.y + e.px.h / 2, id, radiusX: 1, radiusY: 1, force: 1});
const S = async nm => console.log(nm.padEnd(22), JSON.stringify(await page.evaluate(() => ({held: MKUI.P.editHeld, mode: MKUI.P.mode, ab: UI.ab && UI.ab.side, lcd2: SYNQUENZER.mkPanel().lcd[1], cut: SYNQUENZER.mkGet(0).t[0].f.cut}))));
await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(eE, 1)]}); await page.waitForTimeout(120); await S('EDIT down');
await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(eE, 1), pt(xE, 2)]}); await page.waitForTimeout(120); await S('EXIT down');
await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: [pt(xE, 2)]}); await page.waitForTimeout(200); await S('EXIT up (EDIT held)');
await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(200); await S('EDIT up');
console.log(JSON.stringify(await page.evaluate(() => window.__E)));
await b.close();
