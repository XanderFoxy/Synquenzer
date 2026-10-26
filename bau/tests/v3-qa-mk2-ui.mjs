// QA MK2-10 / MK2-03 UI in every format: wave list, PATCH lists, EDIT-WAHL 2 list; rows >= 44 px, inside the viewport, no clipped text,
// no page h-scroll, "≈" in every wave row; LCD per patch; labels of the active knobs not clipped
import {launch, openApp} from './v3-qa-mk2-lib.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const b = await launch();
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
const chkPop = page => page.evaluate(() => { const p = document.querySelector('.pop'); if (!p) return {none: true}; const pr = p.getBoundingClientRect(), bs = [...p.querySelectorAll('button')];
  const vis = bs.filter(x => { const r = x.getBoundingClientRect(); return r.height > 0; });
  return {n: bs.length, minH: Math.min(...vis.map(x => x.getBoundingClientRect().height)), minW: Math.min(...vis.map(x => x.getBoundingClientRect().width)), clipped: vis.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim().slice(0, 30)),
    inView: pr.left >= -1 && pr.top >= -1 && pr.right <= innerWidth + 1 && pr.bottom <= innerHeight + 1, pr: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)], hs: document.documentElement.scrollWidth > innerWidth,
    approx: bs.filter(x => x.dataset.v != null).every(x => x.textContent.includes('≈')), heads: p.querySelectorAll('h5').length}; });
for (const [f, [w, h]] of Object.entries(FMT)) {
  const {ctx, page, errs} = await openApp(b, FILE, {vp: {width: w, height: h}, mobile: f !== 'W'});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); MKUI.setWahl(1, 2); MKUI.render && MKUI.render(); });
  await page.waitForTimeout(200);
  const k2 = await box(page, 'k2'); let L = null;
  if (k2) { await page.mouse.click(k2.x + k2.w / 2, k2.y + k2.h / 2 + 6); await page.waitForTimeout(250); L = await chkPop(page); await page.evaluate(() => closePop()); }
  // knob labels of OSZ 1 not clipped, LCD not clipped
  const lab = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.dataset.k));
  // PATCH 1
  await page.evaluate(() => { MKUI.setWahl(2, 0); MKUI.render && MKUI.render(); }); await page.waitForTimeout(200);
  const pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const k0 = await box(page, 'k0'); let Q = null; if (k0) { await page.mouse.click(k0.x + k0.w / 2, k0.y + k0.h / 2 + 6); await page.waitForTimeout(250); Q = await chkPop(page); await page.evaluate(() => closePop()); }
  const k1 = await box(page, 'k1'); let Z = null; if (k1) { await page.mouse.click(k1.x + k1.w / 2, k1.y + k1.h / 2 + 6); await page.waitForTimeout(250); Z = await chkPop(page); await page.evaluate(() => closePop()); }
  const w2 = await box(page, 'w2'); let E2 = null; if (w2) { await page.mouse.click(w2.x + w2.w / 2, w2.y + w2.h / 2 + 6); await page.waitForTimeout(250); E2 = await chkPop(page); await page.evaluate(() => closePop()); }
  const lcd = await page.evaluate(() => { const e = ED.lcd; return e ? {t: e.innerText.replace(/\s+/g, ' '), clip: [...e.querySelectorAll('*')].filter(x => x.scrollWidth > x.clientWidth + 1).length} : null; });
  const tgt = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [e.dataset.k, Math.round(r.width), Math.round(r.height)]; }).filter(x => x[1] < 44 || x[2] < 44));
  console.log(f, '| wave list', JSON.stringify(L), '| clipped knob labels', JSON.stringify(lab), '| PATCH sel', JSON.stringify(pi.sel), 'knobs', JSON.stringify(pi.knobs && pi.knobs.map(k => k && k.l)),
    '| QUELLE list', JSON.stringify(Q && {n: Q.n, minH: Q.minH, clipped: Q.clipped, inView: Q.inView}), '| ZIEL list', JSON.stringify(Z && {n: Z.n, minH: Z.minH, clipped: Z.clipped, inView: Z.inView}), '| EDIT-WAHL 2 list', JSON.stringify(E2 && {n: E2.n, minH: E2.minH, clipped: E2.clipped, inView: E2.inView, pr: E2.pr}),
    '| lcd', JSON.stringify(lcd), '| small targets', JSON.stringify(tgt), '| errors', errs.length);
  await ctx.close();
}
await b.close();
