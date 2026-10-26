import {launch, open, openMk, touch, tap, line, panel, ctr, OUT} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'L2';
const b = await launch(); const page = await open(b, f); await openMk(page);
await page.evaluate(() => { window.__T = []; const mo = new MutationObserver(() => { for (const e of document.querySelectorAll('.tmsg')) if (e.offsetWidth) { const r = e.getBoundingClientRect(); window.__T.push({t: Math.round(performance.now()), txt: e.textContent.slice(0, 120), r: [r.left, r.top, r.width, r.height].map(Math.round)}); } }); mo.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true}); });
const P0 = await panel(page);
const ids = P0.elements.filter(e => e.bind && e.px && !/^(prog:|lcd:|view:|track:)/.test(e.bind) && e.id !== 'lcd').map(e => e.id);
for (const id of ids) {
  const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E);
  const n0 = await page.evaluate(() => window.__T.length);
  if (E.art === 'k') await touch(page, line(x, y, x, y - 30, 8), 16); else await tap(page, x, y);
  await page.waitForTimeout(150);
  const T = await page.evaluate(n0 => window.__T.slice(n0), n0);
  if (T.length) { console.log('after', id, '→ toast', JSON.stringify(T[0])); }
}
await page.screenshot({path: OUT + '/toast-' + f + '.png'});
await b.close();
