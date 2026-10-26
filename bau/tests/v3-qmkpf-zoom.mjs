// MK-P fix: cost of the 13 stops (▶ every 300 ms) without playback, CPU x THR, DPR 3: task time and the longest frames
import {launch, open, openMk, tapSel} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1';
const b = await launch(); const page = await open(b, F, {dpr: 3, init: () => { window.__lf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lf.push(e.toJSON()); }).observe({type: 'long-animation-frame'}); } catch (e) {} }});
await openMk(page); await page.waitForTimeout(600);
if (process.env.EXP) await page.evaluate(x => (0, eval)(x), process.env.EXP);
await page.evaluate(() => MKUI.zoomTo(1, false)); await page.waitForTimeout(400);
const c = page.cdp; await c.send('Performance.enable'); await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
const g = async () => { const {metrics} = await c.send('Performance.getMetrics'); return Object.fromEntries(metrics.map(m => [m.name, m.value])); };
await page.evaluate(() => { window.__lf = []; }); const a = await g();
for (let k = 0; k < 9; k++) { await page.evaluate(() => MKUI.step(1)); await page.waitForTimeout(300); }
const z = await g(); const lf = await page.evaluate(() => window.__lf.map(e => Math.round(e.duration) + '/' + Math.round(e.startTime + e.duration - e.renderStart)));
console.log(F, 'x' + THR, 'task', Math.round((z.TaskDuration - a.TaskDuration) * 1000), 'style', Math.round((z.RecalcStyleDuration - a.RecalcStyleDuration) * 1000), 'layout', Math.round((z.LayoutDuration - a.LayoutDuration) * 1000), 'LoAF dur/render', JSON.stringify(lf));
await b.close();
