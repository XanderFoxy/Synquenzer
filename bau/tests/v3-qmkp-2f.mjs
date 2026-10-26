// two knobs with two fingers: two undos, each undo reverts only its own knob
import {launch, open, openMk, panel, ctr} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'X';
const b = await launch(); const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.f.cut', 30); SYNQUENZER.mkSet(0, 't.0.f.res', 30); MKUI.view({ansicht: 'zoom', halt: 4}); }); await page.waitForTimeout(400);
const E = async id => (await panel(page)).elements.find(e => e.id === id);
const st = () => page.evaluate(() => ({u: SYNQUENZER.undoInfo().n, cut: SYNQUENZER.mkGet(0).t[0].f.cut, res: SYNQUENZER.mkGet(0).t[0].f.res}));
const s0 = await st();
const k1 = await E('f.cut'), k2 = await E('f.res'); const [ax, ay] = ctr(k1), [bx, by] = ctr(k2); const c = page.cdp;
const pt = (x, y, id) => ({x, y, id, radiusX: 1, radiusY: 1, force: 1});
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(ax, ay, 1)]}); await page.waitForTimeout(30);
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [pt(ax, ay, 1), pt(bx, by, 2)]});
for (let k = 1; k <= 10; k++) { await page.waitForTimeout(16); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [pt(ax, ay - 5 * k, 1), pt(bx, by - 5 * k, 2)]}); }
// finger 1 (CUTOFF) ends first, then finger 2 (RESONANCE)
await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: [pt(ax, ay - 50, 1)]}); await page.waitForTimeout(60);
await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(300);
const s1 = await st();
await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(250); const s2 = await st();
await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(250); const s3 = await st();
await page.evaluate(() => SYNQUENZER.redo()); await page.waitForTimeout(250); const s4 = await st();
await page.evaluate(() => SYNQUENZER.redo()); await page.waitForTimeout(250); const s5 = await st(); console.log('redo 2', JSON.stringify(s5));
console.log(f, 'start', JSON.stringify(s0), '\n after gesture', JSON.stringify(s1), '\n undo 1', JSON.stringify(s2), '\n undo 2', JSON.stringify(s3), '\n redo 1', JSON.stringify(s4));
await b.close();
