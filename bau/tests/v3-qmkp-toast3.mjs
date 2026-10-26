// where does the undo toast sit relative to the plate frame in every format (head ↶ in landscape, sheet ↶ in portrait)
import {launch, open, openMk, touch, tap, line, panel, ctr, OUT, FMT} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of Object.keys(FMT)) {
  const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
  let E = (await panel(page)).elements.find(e => e.id === 'f.cut'); let [x, y] = ctr(E);
  await touch(page, line(x, y, x, y + 50, 10), 16); await page.waitForTimeout(300);
  const ub = await page.evaluate(() => { const q = [...document.querySelectorAll('#synthSheet button[aria-label="Rückgängig"], .mkqh button[aria-label="Rückgängig"]')].find(b => b.offsetWidth); const r = q.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(page, ub[0], ub[1]); await page.waitForTimeout(250);
  const r = await page.evaluate(() => { const fr = MKUI.P.el.fr.getBoundingClientRect(); const t = [...document.querySelectorAll('.tmsg')].find(e => e.offsetWidth); if (!t) return {none: 1}; const d = t.parentNode.getBoundingClientRect(), q = t.getBoundingClientRect();
    const ov = (a) => Math.max(0, Math.min(a.right, fr.right) - Math.max(a.left, fr.left)) * Math.max(0, Math.min(a.bottom, fr.bottom) - Math.max(a.top, fr.top));
    // which plate elements lie under the toast's dock
    const P = SYNQUENZER.mkPanel(); const under = P.elements.filter(e => e.px && e.bind && (() => { const cx = e.px.x + e.px.w / 2, cy = e.px.y + e.px.h / 2; const el = document.elementFromPoint(cx, cy); return el && el.closest('.tmsg, .dock'); })()).map(e => e.id);
    return {frame: [fr.left, fr.top, fr.width, fr.height].map(Math.round), dock: [d.left, d.top, d.width, d.height].map(Math.round), cls: t.parentNode.className, overlapPx: Math.round(ov(d)), under};
  });
  console.log(f, JSON.stringify(r));
  await page.screenshot({path: OUT + '/toast3-' + f + '.png'});
  await page.ctx.close();
}
await b.close();
