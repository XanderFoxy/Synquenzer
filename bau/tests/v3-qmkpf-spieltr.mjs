// MK-P fix: trace of the first GERÄT -> SPIEL switch in landscape (audio on), x THR: long tasks, style recalc element counts
import {launch, open, openMk, tapSel} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'L1';
const b = await launch(); const page = await open(b, F, {dpr: 3});
await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 800)); }); await openMk(page); await page.waitForTimeout(800);
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await b.startTracing(page, {categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink']});
await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(700);
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents; await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
const tn = new Map(); for (const e of ev) if (e.name === 'thread_name') tn.set(e.pid + ':' + e.tid, e.args.name);
const M = ev.filter(e => tn.get(e.pid + ':' + e.tid) === 'CrRendererMain' && e.ph === 'X' && e.dur);
for (const t of M.filter(e => /RunTask/.test(e.name) && e.dur > 25000)) { const ch = M.filter(e => e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.dur > 3000 && !/RunTask/.test(e.name)).sort((a, b) => b.dur - a.dur).slice(0, 12);
  console.log('TASK', Math.round(t.dur / 1000)); for (const e of ch) console.log('   ', Math.round(e.dur / 1000), e.name, JSON.stringify(e.args && (e.args.elementCount != null ? {elementCount: e.args.elementCount} : e.args.data || e.args.beginData || '')).slice(0, 120)); }
await b.close();
