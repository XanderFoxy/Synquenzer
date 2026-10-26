// MK-P fix: Performance metrics of the first panel opening (1.5 s), x THR
import {launch, open, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 1), F = process.argv[2] || 'P1';
const b = await launch();
for (const [nm, file] of [['new', FILE], ['old', VORG], ['new', FILE], ['old', VORG]]) {
  const page = await open(b, F, {dpr: 3, file}); await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800);
  const c = page.cdp; await c.send('Performance.enable'); await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
  const g = async () => { const {metrics} = await c.send('Performance.getMetrics'); return Object.fromEntries(metrics.map(m => [m.name, m.value])); };
  const a = await g(); await page.evaluate(async () => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1500)); }); const z = await g();
  const d = k => Math.round((z[k] - a[k]) * 1000);
  console.log(nm, F, 'x' + THR, 'task', d('TaskDuration'), 'script', d('ScriptDuration'), 'style', d('RecalcStyleDuration') + '/' + (z.RecalcStyleCount - a.RecalcStyleCount), 'layout', d('LayoutDuration') + '/' + (z.LayoutCount - a.LayoutCount), 'nodes', z.Nodes);
  await page.ctx.close();
}
await b.close();
