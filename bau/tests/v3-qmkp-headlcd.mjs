// landscape head: the LCD line (‹ Name › shows the clear text 1.5 s while turning, H-17) must not be cut
import {launch, open, openMk, touch, tap, line, panel, ctr, OUT} from './v3-qmkp-lib.mjs';
const b = await launch();
for (const f of ['L2', 'L1', 'X']) {
  const page = await open(b, f); await openMk(page); await page.waitForTimeout(2200);
  const res = [];
  for (const [nm, act] of [['GLOBAL', async () => { const E = (await panel(page)).elements.find(e => e.id === 'global'); await tap(page, ...ctr(E)); }],
    ['CUTOFF', async () => { const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); const [x, y] = ctr(E); await touch(page, line(x, y, x, y + 30, 8), 16); }],
    ['PATCH', async () => { const E = (await panel(page)).elements.find(e => e.id === 'k13'); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 30, 8), 16); }],
    ['HALT', async () => { await page.evaluate(() => MKUI.zoomTo(9)); }]]) {
    await act(); await page.waitForTimeout(120);
    const r = await page.evaluate(() => { const l = document.querySelector('.mkqh .lcd'); if (!l) return null; const cs = getComputedStyle(l); const kids = [...l.querySelectorAll('*')].map(k => ({c: k.className, t: k.textContent.slice(0, 60), sw: k.scrollWidth, cw: k.clientWidth, fs: getComputedStyle(k).fontSize}));
      const rg = document.createRange(); rg.selectNodeContents(l); const tr = rg.getBoundingClientRect(), lr = l.getBoundingClientRect();
      return {on: l.classList.contains('on'), w: Math.round(lr.width), textRight: Math.round(tr.right - lr.right), textW: Math.round(tr.width), sw: l.scrollWidth, cw: l.clientWidth, ov: cs.overflow, txt: l.textContent.slice(0, 90), kids}; });
    res.push([nm, r]);
    await page.screenshot({path: OUT + '/headlcd-' + f + '-' + nm + '.png', clip: {x: 0, y: 0, width: page.viewportSize().width, height: 46}});
    await page.waitForTimeout(1700);
  }
  for (const [nm, r] of res) console.log(f, nm, JSON.stringify(r).slice(0, 600));
  await page.ctx.close();
}
await b.close();
