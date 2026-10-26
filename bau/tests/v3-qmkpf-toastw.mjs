// MK-P fix: the head toast in every landscape format: where it sits, whether its text fits, what it covers
import {launch, open, openMk, touch, tap, line, panel, ctr, OUT} from './v3-qmkp-lib.mjs';
import {realFont} from './v3-qmkpf-font.mjs';
const b = await launch();
for (const f of ['L2', 'L1', 'X', 'P1', 'P2', 'P3', 'XH']) {
  const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
  const rf = await realFont(page); if (!rf) throw new Error('real font not loaded'); await page.evaluate(() => MKUI.render());
  let E = (await panel(page)).elements.find(e => e.id === 'f.cut'); let [x, y] = ctr(E);
  await touch(page, line(x, y, x, y + 50, 10), 16); await page.waitForTimeout(300);
  const ub = await page.evaluate(() => { const q = [...document.querySelectorAll('.mkqh button[aria-label="Rückgängig"], #synthSheet button[aria-label="Rückgängig"]')].find(b => b.offsetWidth); if (!q) return null; const r = q.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  if (!ub) { console.log(f, 'no head ↶'); await page.ctx.close(); continue; }
  await tap(page, ub[0], ub[1]); await page.waitForTimeout(250);
  const r = await page.evaluate(() => { const t = document.getElementById('toast'), m = t.querySelector('.tmsg'), q = t.getBoundingClientRect(), fr = MKUI.P.el.fr.getBoundingClientRect();
    return {cls: t.className, box: [q.left, q.top, q.width, q.height].map(Math.round), msg: [m.scrollWidth, m.clientWidth, m.scrollHeight, m.clientHeight], font: getComputedStyle(m).fontFamily.slice(0, 40), overPlate: q.bottom > fr.top && q.top < fr.bottom, txt: m.textContent, under: SYNQUENZER.mkPanel().elements.filter(e => e.px).filter(e => { const x = document.elementFromPoint(e.px.x + e.px.w / 2, e.px.y + e.px.h / 2); return x && x.closest('#toast'); }).map(e => e.id)}; });
  console.log(JSON.stringify(f), JSON.stringify(r));
  await page.screenshot({path: OUT + '/toastw-' + (Array.isArray(f) ? f.join('x') : f) + '.png', clip: {x: 0, y: 0, width: page.viewportSize().width, height: 50}});
  await page.ctx.close();
}
await b.close();
