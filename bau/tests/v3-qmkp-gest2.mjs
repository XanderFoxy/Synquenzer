// MK-P-08 gestures by CDP touch
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'X';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
const st = () => page.evaluate(() => { const p = SYNQUENZER.mkPanel(); return {ans: p.ansicht, halt: p.halt, haelfte: p.haelfte, u: SYNQUENZER.undoInfo().n, cut: SYNQUENZER.mkGet(0).t[0].f.cut, res: SYNQUENZER.mkGet(0).t[0].f.res, wave: SYNQUENZER.mkGet(0).t[0].o1.w, tr: MKUI.P.el.hull.style.transform}; });
const E = async id => (await panel(page)).elements.find(e => e.id === id);
// 1. overview: tap on a knob zooms, no value change, no undo
await page.evaluate(() => MKUI.view({ansicht: 'ganz', haelfte: 'links'})); await page.waitForTimeout(300);
let s0 = await st(); let e = await E('f.res'); await tap(page, ...ctr(e)); await page.waitForTimeout(400); let s1 = await st();
log.push('tap knob in overview: ' + s0.ans + '→' + s1.ans + ' halt ' + s1.halt + ' res ' + s0.res + '→' + s1.res + ' undo +' + (s1.u - s0.u));
if (s1.ans !== 'zoom' || s1.halt !== 4 || s1.res !== s0.res || s1.u !== s0.u) fails.push('tap knob overview → ' + JSON.stringify(s1));
// 2. in the stop: double tap = standard value (one undo)
await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.res', 90)); await page.waitForTimeout(100); s0 = await st();
e = await E('f.res'); await tap(page, ...ctr(e)); await page.waitForTimeout(120); await tap(page, ...ctr(e)); await page.waitForTimeout(300); s1 = await st();
log.push('double tap RESONANCE in stop: ' + s0.res + '→' + s1.res + ' undo +' + (s1.u - s0.u)); if (s1.res === s0.res || s1.u - s0.u !== 1) fails.push('double tap standard: ' + s0.res + '→' + s1.res + ' undo +' + (s1.u - s0.u));
// 3. key tap with > 8 px movement is discarded
s0 = await st(); e = await E('f.type'); let [x, y] = ctr(e); await touch(page, line(x, y, x + 3, y + 11, 4), 16); await page.waitForTimeout(200); s1 = await st();
const ft = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].f.type);
log.push('key tap with 11 px move: undo +' + (s1.u - s0.u)); if (s1.u !== s0.u) fails.push('key with >8px move acted');
// 4. swipe starting on a knob never moves the stop (sideways = fine)
s0 = await st(); e = await E('f.cut'); [x, y] = ctr(e); await touch(page, line(x, y, x - 160, y, 14), 16); await page.waitForTimeout(400); s1 = await st();
log.push('swipe from knob: halt ' + s0.halt + '→' + s1.halt + ' cut ' + s0.cut + '→' + s1.cut); if (s1.halt !== s0.halt) fails.push('swipe from knob moved the stop');
// 5. swipe from free area: exactly one stop
const P = await panel(page); const r = P.rahmen; s0 = await st();
await touch(page, line(r.x + r.w * .5, r.y + r.h * .97, r.x + r.w * .5 - 120, r.y + r.h * .97, 10), 16); await page.waitForTimeout(450); s1 = await st();
log.push('swipe free area left: halt ' + s0.halt + '→' + s1.halt); if (s1.halt !== s0.halt + 1) fails.push('swipe free: ' + s0.halt + '→' + s1.halt);
// 6. swipe right at stop 1 springs back
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 1})); await page.waitForTimeout(400); s0 = await st();
await touch(page, line(r.x + r.w * .3, r.y + r.h * .97, r.x + r.w * .3 + 150, r.y + r.h * .97, 10), 16); await page.waitForTimeout(450); s1 = await st();
log.push('swipe right at stop 1: halt ' + s1.halt + ' transform same ' + (s0.tr === s1.tr)); if (s1.halt !== 1 || s0.tr !== s1.tr) fails.push('spring at stop 1: ' + JSON.stringify([s0.tr, s1.tr]));
// 7. fine: sideways 70 px then vertical 80 px moves less than without
const fine = async dx => { await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.f.cut', 30); MKUI.view({ansicht: 'zoom', halt: 4}); }); await page.waitForTimeout(400); const k = await E('f.cut'); const [a, c] = ctr(k);
  const pts = [[a, c], ...line(a, c, a + dx, c, 6).slice(1), ...line(a + dx, c, a + dx, c - 80, 10).slice(1)]; await touch(page, pts, 16); await page.waitForTimeout(200); return (await st()).cut - 30; };
const d0 = await fine(0), d1 = await fine(70), d2 = await fine(150);
log.push(`fine: normal +${d0} ×¼ +${d1} ×1/16 +${d2}`); if (!(d1 < d0 * .4 && d2 < d1 * .5)) fails.push(`fine ratios ${d0}/${d1}/${d2}`);
// 8. two knobs with two fingers = two undos
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 4})); await page.waitForTimeout(400); s0 = await st();
const k1 = await E('f.cut'), k2 = await E('f.res'); const [ax, ay] = ctr(k1), [bx, by] = ctr(k2); const c = page.cdp; const P2 = (x1, y1, x2, y2) => [{x: x1, y: y1, id: 1}, {x: x2, y: y2, id: 2}];
await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: P2(ax, ay, bx, by)});
for (let k = 1; k <= 10; k++) { await page.waitForTimeout(16); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: P2(ax, ay - 5 * k, bx, by + 5 * k)}); }
await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(300); s1 = await st();
log.push('two fingers two knobs: cut ' + s0.cut + '→' + s1.cut + ' res ' + s0.res + '→' + s1.res + ' undo +' + (s1.u - s0.u)); if (s1.u - s0.u !== 2) fails.push('two knobs → undo +' + (s1.u - s0.u));
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
