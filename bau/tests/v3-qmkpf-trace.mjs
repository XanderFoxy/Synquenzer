// MK-P fix: devtools timeline trace of (idle | drag | stops | edit) at CPU x THR, DPR 3; sums main-thread event time by name
import {launch, open, touch, tap, line, panel, ctr, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
import fs from 'fs';
const THR = +(process.env.THR || 4), MODE = process.argv[2] || 'idle', F = process.argv[3] || 'P1', WHICH = process.argv[4] || 'new';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : (WHICH === 'new' ? FILE : WHICH)});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
await page.waitForTimeout(1500);
const c = page.cdp; await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
await b.startTracing(page, {categories: (process.env.CATS || 'devtools.timeline,disabled-by-default-devtools.timeline').split(',')});
await page.evaluate(() => { window.__tk = []; let lt = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt) window.__tk.push(n - lt); lt = n; tick(); }, TICK_MS); });
if (MODE === 'idle') await page.waitForTimeout(4000);
else if (MODE === 'session') { const t0 = Date.now(); for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); }
  const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(260); for (let k = 0; k < 9 && Date.now() - t0 < 7000; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300);
  await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); while (Date.now() - t0 < 10000) await page.waitForTimeout(200); }
else if (MODE === 'drag') { for (const id of ['f.cut', 'f.res']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); } }
else if (MODE === 'stops') { const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(400); for (let k = 0; k < 6; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300); }
else if (MODE === 'edit') { await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(1000); }
const buf = await b.stopTracing(); const ev = JSON.parse(buf.toString()).traceEvents;
const tk = await page.evaluate(() => window.__tk); await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
// main thread of the renderer: the thread with most RunTask under CrRendererMain
const tn = new Map(); for (const e of ev) if (e.name === 'thread_name') tn.set(e.pid + ':' + e.tid, e.args.name);
const main = [...tn].filter(([k, v]) => v === 'CrRendererMain').map(([k]) => k);
const sums = new Map(), cnt = new Map(); let long = [];
for (const e of ev) { if (!main.includes(e.pid + ':' + e.tid) || e.ph !== 'X' || !e.dur) continue; sums.set(e.name, (sums.get(e.name) || 0) + e.dur); cnt.set(e.name, (cnt.get(e.name) || 0) + 1); if (e.name === 'RunTask' && e.dur > 50000) long.push(Math.round(e.dur / 1000)); }
const top = [...sums].sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => (v / 1000).toFixed(0).padStart(6) + ' ms ' + String(cnt.get(k)).padStart(5) + 'x ' + k).join('\n');
console.log(MODE, F, WHICH, 'x' + THR, 'gaps>50', tk.filter(x => x > 50).length, 'max', Math.round(Math.max(...tk)), 'longRunTask', JSON.stringify(long));
console.log(top);
{ const thr = new Map(); for (const e of ev) { if (e.ph !== 'X' || !e.dur || !(e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask' || e.name === 'TaskGraphRunner::RunTask' || e.name === 'ThreadPool_RunTask')) continue; const k = (tn.get(e.pid + ':' + e.tid) || e.tid) + '@' + e.pid; thr.set(k, (thr.get(k) || 0) + e.dur); }
  console.log('--- busy per thread (ms)'); console.log([...thr].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => (v / 1000).toFixed(0).padStart(6) + ' ' + k).join('\n')); }
// the long main-thread tasks with their children (wall ms)
{ const M = ev.filter(e => main.includes(e.pid + ':' + e.tid) && e.ph === 'X' && e.dur);
  const L = M.filter(e => e.name === 'RunTask' && e.dur > (+process.env.LT || 30000)).sort((a, b) => a.ts - b.ts);
  const ts0 = Math.min(...M.map(e => e.ts));
  for (const t of L.slice(0, +(process.env.NL || 40))) { const ch = new Map(); for (const e of M) if (e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.name !== 'RunTask' && e.name !== 'ThreadControllerImpl::RunTask') { const k = e.name + (e.args && e.args.data && e.args.data.functionName ? ':' + e.args.data.functionName : '') + (e.args && e.args.data && e.args.data.type ? ':' + e.args.data.type : ''); ch.set(k, Math.max(ch.get(k) || 0, 0) + e.dur); }
    console.log('task @' + Math.round((t.ts - ts0) / 1000), Math.round(t.dur / 1000) + 'ms |', [...ch].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k, v]) => k + ' ' + Math.round(v / 1000)).join(', ')); } }
if (process.env.SAVE) fs.writeFileSync(process.env.SAVE, JSON.stringify(ev));
await b.close();
