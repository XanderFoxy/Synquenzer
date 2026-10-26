// MK-P fix: first opening of the panel (CPU x THR, DPR 3): long tasks + LoAF with script attribution, plate slices/done
import {launch, open, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 1), F = process.argv[2] || 'P1', WHICH = process.argv[3] || 'new';
const b = await launch();
for (let run = 0; run < +(process.env.RUNS || 2); run++) {
  const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : WHICH === 'new' ? FILE : WHICH, init: () => { window.__lt = []; window.__lf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lf.push(e.toJSON()); }).observe({type: 'long-animation-frame'}); } catch (e) {} }});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800);
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
  const r = await page.evaluate(async () => { const t0 = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); const t1 = performance.now(); await new Promise(r => setTimeout(r, 1500));
    return {sync: Math.round(t1 - t0), lt: window.__lt.filter(x => x[0] >= t0 - 5).map(x => [Math.round(x[0] - t0), Math.round(x[1])]), done: window.MKUI && MKUI.PL ? Math.round(MKUI.PL.done) : null, slices: window.MKUI && MKUI.PL ? MKUI.PL.slices : null,
      lf: window.__lf.filter(e => e.startTime >= t0 - 5).map(e => ({at: Math.round(e.startTime - t0), dur: Math.round(e.duration), block: Math.round(e.blockingDuration), render: Math.round(e.startTime + e.duration - e.renderStart), sl: e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : 0, scripts: e.scripts.map(s => (s.sourceFunctionName || s.invoker) + ':' + Math.round(s.duration) + '(fsl ' + Math.round(s.forcedStyleAndLayoutDuration) + ')')}))}; });
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  console.log(F, WHICH, 'x' + THR, JSON.stringify(r)); await page.ctx.close();
}
await b.close();
