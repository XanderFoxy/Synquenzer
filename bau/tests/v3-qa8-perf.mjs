// QA MK8 perf: long tasks / durations on first MS 2000 use paths in a fresh page (demo project, block not loaded), vs 4.15.0
import {launch, open, FILE, BASE} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const [tag, file] of [['4.15.0', BASE], ['MK8', FILE], ['4.15.0', BASE], ['MK8', FILE]]) {
  const {ctx, page: p, errs} = await open(b, 'P1', file);
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); });
  await sleep(1500);
  const r = await p.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
    await SYNQUENZER.libraryReady(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await w(500);
    SYNQUENZER.play(); await w(800);
    window.__lt = [];
    let t = performance.now(); SYNQUENZER.setEngine(0, 'mk'); out.setEngine = +(performance.now() - t).toFixed(1); await w(800); out.ltEngine = window.__lt.slice(); window.__lt = [];
    t = performance.now(); openBrowser(0); out.openBrowserMk = +(performance.now() - t).toFixed(1); out.rowsMk = document.querySelectorAll('#sndSheet .brow').length; await w(600); out.ltBrowser = window.__lt.slice(); window.__lt = [];
    t = performance.now(); SYNQUENZER.browserScope ? SYNQUENZER.browserScope('all') : 0; out.allEng = +(performance.now() - t).toFixed(1); out.rowsAll = document.querySelectorAll('#sndSheet .brow').length; await w(600); out.ltAll = window.__lt.slice(); window.__lt = [];
    closeBrowser(false); await w(300);
    const te = SYNQUENZER.tickErrors(); out.tickErr = te; SYNQUENZER.stop();
    return out;
  });
  console.log(tag.padEnd(7), JSON.stringify(r), 'errs', errs.length);
  await ctx.close();
}
await b.close();
