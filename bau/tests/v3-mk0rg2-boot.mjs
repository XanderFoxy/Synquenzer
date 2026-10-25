import { launch, NEW, BASE } from './v3-mk0rg2-lib.mjs';
const br = await launch(); const out = {base: [], new: []};
for (let i = 0; i < 6; i++) for (const k of ['base', 'new']) { const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const t0 = Date.now(); await p.goto('file://' + (k === 'base' ? BASE : NEW)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {polling: 5}); out[k].push(Date.now() - t0);
  if (i === 5) out[k + 'Perf'] = await p.evaluate(async () => { let n = 0, lt = 0; const po = new PerformanceObserver(l => { lt += l.getEntries().length; }); try { po.observe({type: 'longtask'}); } catch (e) {} window.SYNQUENZER.launchScene(0); const t = performance.now(); await new Promise(r => { const f = () => { n++; if (performance.now() - t < 4000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }); window.SYNQUENZER.stop(); return {fps: Math.round(n / 4 * 10) / 10, longtasks: lt}; });
  await ctx.close(); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log(JSON.stringify(out), 'median base', med(out.base), 'new', med(out.new)); await br.close();
