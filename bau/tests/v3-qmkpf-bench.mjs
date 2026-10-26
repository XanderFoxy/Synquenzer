// MK-P fix: micro benchmark of panel JS functions (x1, ms per call)
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2] || 'P1'); await openMk(page); await page.waitForTimeout(500);
console.log(await page.evaluate(() => { const T = (f, n = 300) => { f(); const t0 = performance.now(); for (let k = 0; k < n; k++) f(); return +((performance.now() - t0) / n).toFixed(4); };
  const d = MKUI.defOf('f.cut');
  return JSON.stringify({render: T(() => MKUI.render()), lcdOf: T(() => MKUI.lcdOf(d)), setvLive: T(() => MKUI.setv(d, 40 + Math.random(), true)), soundHash: T(() => SQStore.soundHash(SYNQUENZER.mkGet ? S.tracks[0].sound : null)), edHead: T(() => { UI.dirty.edHead = true; edHeadRefresh(); }), lcdLines: T(() => MKUI.lcdLines()), panelInfo: T(() => MKUI.panelInfo(), 5)}); }));
await b.close();
