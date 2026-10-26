import {launch, open, touch, tap, line, panel, el, ctr} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.evaluate(() => { window.__L = []; const fr = document.querySelector('.mkfr'); for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) fr.addEventListener(t, e => __L.push(t + ' ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true); });
for (const id of ['k2', 'k3', 'k9']) {
  const e = await el(page, id); const [x, y] = ctr(e); const v0 = await page.evaluate(i => MKUI.get(MKUI.defOf(i)), id);
  await page.evaluate(() => __L.length = 0);
  await touch(page, line(x, y, x, y + 60), 16); await page.waitForTimeout(50);
  const r = await page.evaluate(([i, x, y]) => { const f = document.querySelector('.mkfr').getBoundingClientRect(); const T = MKUI.P.el.T; const px = (x - f.left - T.tx) * 1000 / T.z, py = (y - f.top - T.ty) * 1000 / T.z; const h = MKUI.hitAt(px, py); return {v: MKUI.get(MKUI.defOf(i)), hit: h && h.id, log: __L.slice(0, 4).concat(__L.slice(-2))}; }, [id, x, y]);
  console.log(id, v0, JSON.stringify(r));
}
await b.close();
