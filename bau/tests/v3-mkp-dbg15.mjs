import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1');
await page.addStyleTag({content: `#app{padding:0 47px 0 47px!important}#app.mkq #synthSheet{left:47px!important;right:47px!important}`}); await page.waitForTimeout(800);
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 6})); await page.waitForTimeout(400);
console.log(JSON.stringify(await page.evaluate(() => { const U = MKUI.P.el, fr = U.fr.getBoundingClientRect(), p = SYNQUENZER.mkPanel(), e = p.elements.find(x => x.id === 'l1.sel'), T = U.T, s = T.z / 1000;
  const x = 790, y = 127, px = (x - fr.left - T.tx) / s, py = (y - fr.top - T.ty) / s; const E = MKUI.ELS.find(q => q.id === 'l1.sel');
  return {fr: [fr.left, fr.top, fr.width, fr.height], fw: U.fw, fh: U.fh, T, epx: e.px, px, py, hit: MKUI.hitAt(px, py, null), E: E && [E.x0, E.y0, E.x1, E.y1], hull: U.hull.style.transform, vis: (() => { try { return MKUI.visRect ? MKUI.visRect() : null; } catch (e) { return String(e); } })()}; }), null, 1));
await b.close();
