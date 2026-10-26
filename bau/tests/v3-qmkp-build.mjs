// MK-P-09 (a): first opening of the panel at CPU x4, DPR 3: slices, done, longtasks
import {launch, open} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4); const b = await launch();
for (const f of ['P1', 'L1']) for (let run = 0; run < 2; run++) {
  const page = await open(b, f, {dpr: 3, init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800);
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
  const r = await page.evaluate(async () => { const t0 = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
    await new Promise(r => { const f = () => (window.MKUI && MKUI.PL && MKUI.PL.ready ? r() : setTimeout(f, 5)); f(); }); const t1 = performance.now(); await new Promise(r => setTimeout(r, 300));
    return {done: Math.round(MKUI.PL.done), sliceMax: Math.max(...MKUI.PL.slices), slices: MKUI.PL.slices.length, openToReady: Math.round(t1 - t0), lt: window.__lt.filter(x => x[0] >= t0 - 5).map(x => Math.round(x[1]))}; });
  console.log(f, 'x' + THR, JSON.stringify(r));
  await page.ctx.close();
}
await b.close();
