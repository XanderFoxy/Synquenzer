import {launch, open, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 1); const b = await launch();
for (const [nm, file] of [['new', FILE], ['old', VORG], ['new', FILE], ['old', VORG]]) for (const f of ['P1']) {
  const page = await open(b, f, {dpr: 3, file, init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800);
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
  const r = await page.evaluate(async () => { const t0 = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1500));
    return {lt: window.__lt.filter(x => x[0] >= t0 - 5).map(x => Math.round(x[1])), mkLoaded: typeof MKUI !== 'undefined'}; });
  console.log(nm, f, 'x' + THR, JSON.stringify(r)); await page.ctx.close();
}
await b.close();
