// MK-P fix: cost of GERÄT -> SPIEL -> GERÄT in landscape (CPU x THR, DPR 3): metrics + longest frame (LoAF)
import {launch, open, openMk, tapSel} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'L1';
const b = await launch(); const page = await open(b, F, {dpr: 3, init: () => { window.__lf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lf.push(e.toJSON()); }).observe({type: 'long-animation-frame'}); } catch (e) {} }});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 't.0.seq.on', 1); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); if (!window.__noplay) Q.launchScene(0); });
await page.waitForTimeout(800);
if (process.env.EXP) await page.evaluate(x => (0, eval)(x), process.env.EXP);
const c = page.cdp; await c.send('Performance.enable'); await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
const g = async () => { const {metrics} = await c.send('Performance.getMetrics'); return Object.fromEntries(metrics.map(m => [m.name, m.value])); };
for (const t of ['spiel', 'geraet', 'spiel', 'geraet']) {
  await page.evaluate(() => { window.__lf = []; }); const a = await g();
  await tapSel(page, `#synthSheet .sh-tabs .tab[data-tab="${t}"]`); await page.waitForTimeout(700);
  const z = await g(); const lf = await page.evaluate(() => window.__lf.map(e => [Math.round(e.duration), Math.round(e.blockingDuration), Math.round(e.startTime + e.duration - e.renderStart), e.scripts.map(s => (s.sourceFunctionName || s.invoker) + ':' + Math.round(s.duration)).join(' ')]));
  console.log(t.padEnd(7), 'task', Math.round((z.TaskDuration - a.TaskDuration) * 1000), 'script', Math.round((z.ScriptDuration - a.ScriptDuration) * 1000), 'style', Math.round((z.RecalcStyleDuration - a.RecalcStyleDuration) * 1000) + '/' + (z.RecalcStyleCount - a.RecalcStyleCount), 'layout', Math.round((z.LayoutDuration - a.LayoutDuration) * 1000) + '/' + (z.LayoutCount - a.LayoutCount), 'LoAF', JSON.stringify(lf));
}
await b.close();
