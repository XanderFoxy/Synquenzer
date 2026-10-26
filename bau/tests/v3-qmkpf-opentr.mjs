// MK-P fix: trace of the first panel opening at x THR; main-thread RunTasks > LT ms with their biggest child events
import {launch, open} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: process.env.FILE_ || undefined});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800);
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await b.startTracing(page, {categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc']});
await page.evaluate(async () => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1200)); });
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents; await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
const tn = new Map(); for (const e of ev) if (e.name === 'thread_name') tn.set(e.pid + ':' + e.tid, e.args.name);
const M = ev.filter(e => tn.get(e.pid + ':' + e.tid) === 'CrRendererMain' && e.ph === 'X' && e.dur);
const T = M.filter(e => (e.name === 'ThreadControllerImpl::RunTask' || e.name === 'RunTask') && e.dur > (+process.env.LT || 40) * 1000).sort((a, b) => a.ts - b.ts);
for (const t of T) { const ch = M.filter(e => e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.dur > 2000 && !/RunTask/.test(e.name)).sort((a, b) => b.dur - a.dur).slice(0, 14);
  console.log('TASK', Math.round(t.dur / 1000) + 'ms'); for (const e of ch) console.log('   ', Math.round(e.dur / 1000).toString().padStart(4), e.name, e.args && e.args.data ? JSON.stringify(e.args.data).slice(0, 90) : ''); }
await b.close();
