// MK-P fix: where the synchronous opening task spends its time (x1, wraps MKUI/app functions with performance.now)
import {launch, open, FILE} from './v3-qmkp-lib.mjs';
const b = await launch(); const out = [];
for (let run = 0; run < 3; run++) {
  const page = await open(b, process.argv[2] || 'P1', {dpr: 3});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); mkLoad(); }); await page.waitForTimeout(800);
  out.push(await page.evaluate(() => { const T = {}; const wrap = (o, k, nm) => { const f = o[k]; o[k] = function () { const t0 = performance.now(); try { return f.apply(this, arguments); } finally { T[nm] = (T[nm] || 0) + performance.now() - t0; } }; };
    wrap(MKUI, 'build', 'MKUI.build'); wrap(window, 'buildSynthEd', 'buildSynthEd'); wrap(window, 'fillSynthTab', 'fillSynthTab'); wrap(window, 'lcdShow', 'lcdShow');
    const t0 = performance.now(); SYNQUENZER.selectTrack(0); const t1 = performance.now(); openEditor(); const t2 = performance.now(); document.body.offsetWidth; const t3 = performance.now();
    return JSON.stringify(Object.assign({selectTrack: t1 - t0, openEditor: t2 - t1, layoutAfter: t3 - t2}, Object.fromEntries(Object.entries(T).map(([k, v]) => [k, +v.toFixed(1)])))); }));
  await page.ctx.close();
}
console.log(out.join('\n')); await b.close();
