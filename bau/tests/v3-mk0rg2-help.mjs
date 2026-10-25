import { open, NEW, OUT, launch } from './v3-mk0rg2-lib.mjs';
const br = await launch();
for (const vp of ['P3', 'L2']) {
  const {p, errs, close} = await open(NEW, vp, true, br);
  await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu *')].find(x => x.children.length === 0 && /NEUERE VERSION/.test(x.textContent)); if (!e) { const all = [...document.querySelectorAll('#menu *')].filter(x => /NEUERE VERSION/.test(x.textContent)); return {none: true, n: all.length, tag: all.map(x => x.tagName + '.' + x.className).slice(-3)}; } e.scrollIntoView({block: 'center'}); const q = e.getBoundingClientRect(); return {tag: e.tagName, cls: e.className, r: [q.left, q.top, q.width, q.height].map(Math.round), sw: e.scrollWidth, cw: e.clientWidth, iw: innerWidth, prev: e.previousElementSibling && e.previousElementSibling.textContent.slice(0, 60), html: e.outerHTML.slice(0, 300)}; });
  console.log(vp, JSON.stringify(r));
  await p.waitForTimeout(300); await p.screenshot({path: OUT + `help-new-${vp}.png`});
  console.log(errs); await close();
}
await br.close();
