// a toast (e.g. after ↶ in the landscape head) covers the bottom of the plate and swallows touches on the knob row
import {launch, open, openMk, touch, tap, line, panel, ctr, OUT} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'L2';
const b = await launch(); const page = await open(b, f); await openMk(page); await page.waitForTimeout(400);
let E = (await panel(page)).elements.find(e => e.id === 'f.cut'); let [x, y] = ctr(E);
await touch(page, line(x, y, x, y + 50, 10), 16); await page.waitForTimeout(300);   // CUTOFF down: one undo step
const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
// tap ↶ in the head
const ub = await page.evaluate(() => { const q = [...document.querySelectorAll('.mkqh button')].find(b => /↶/.test(b.textContent) || b.getAttribute('aria-label') === 'Rückgängig'); const r = q.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, q.outerHTML.slice(0, 120)]; });
await tap(page, ub[0], ub[1]); await page.waitForTimeout(250);
const u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
const toast = await page.evaluate(() => [...document.querySelectorAll('.tmsg')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return {txt: e.textContent, r: [r.left, r.top, r.width, r.height].map(Math.round), pe: cs.pointerEvents, par: e.parentNode.className}; }));
await page.screenshot({path: OUT + '/toast2-' + f + '.png'});
// now drag knob k1 (ATTACK EG1) and CUTOFF while the toast shows
const res = [];
for (const id of ['k1', 'k4', 'k8', 's3', 'o1.c1']) {
  E = (await panel(page)).elements.find(e => e.id === id); [x, y] = ctr(E);
  const v0 = await page.evaluate(id => { const d = MKUI.defOf(id); return d ? MKUI.get(d) : MKUI.P.page; }, id);
  const efp = await page.evaluate(([x, y]) => { const q = document.elementFromPoint(x, y); return q ? q.className + '<' + (q.parentNode && q.parentNode.className) : null; }, [x, y]);
  if (E.art === 'k') await touch(page, line(x, y, x, y - 40, 10), 16); else await tap(page, x, y);
  await page.waitForTimeout(120);
  const v1 = await page.evaluate(id => { const d = MKUI.defOf(id); return d ? MKUI.get(d) : MKUI.P.page; }, id);
  res.push({id, at: [Math.round(x), Math.round(y)], efp, v0, v1, hit: await page.evaluate(() => MKUI.P.lastHit)});
}
const t1 = await page.evaluate(() => performance.now());
await page.waitForFunction(() => ![...document.querySelectorAll('.tmsg')].some(e => e.offsetWidth), null, {timeout: 15000}).catch(() => {});
const t2 = await page.evaluate(() => performance.now());
console.log(f, 'undo', u0, '->', u1, 'headBtn', ub[2]); console.log('toast', JSON.stringify(toast)); for (const r of res) console.log(JSON.stringify(r)); console.log('toast visible for another', Math.round(t2 - t1), 'ms');
await b.close();
