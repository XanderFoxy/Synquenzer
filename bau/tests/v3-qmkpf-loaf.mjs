// MK-P fix: long animation frames (LoAF, script attribution) for idle | drag | stops | edit | session at CPU x THR, DPR 3
import {launch, open, touch, tap, line, panel, ctr, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), MODE = process.argv[2] || 'idle', F = process.argv[3] || 'P1', WHICH = process.argv[4] || 'new', MIN = +(process.env.MIN || 40);
const b = await launch(); const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : (WHICH === 'new' ? FILE : WHICH), init: () => { window.__lf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lf.push(e.toJSON()); }).observe({type: 'long-animation-frame', buffered: false}); } catch (e) {} }});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
await page.waitForTimeout(1500);
const c = page.cdp; await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
await page.evaluate(() => { window.__lf = []; window.__t0 = performance.now(); window.__tk = []; let lt = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt) window.__tk.push([Math.round(lt - window.__t0), Math.round(n - lt)]); lt = n; tick(); }, TICK_MS); });
const t0 = Date.now();
if (MODE === 'idle') await page.waitForTimeout(6000);
if (MODE === 'drag' || MODE === 'session') { for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); } }
if (MODE === 'stops' || MODE === 'session') { const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(260); for (let k = 0; k < 9 && Date.now() - t0 < 7000; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300); }
if (MODE === 'edit' || MODE === 'session') { await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); }
if (MODE === 'session') while (Date.now() - t0 < 10000) await page.waitForTimeout(200);
await page.waitForTimeout(500);
const r = await page.evaluate(() => ({lf: window.__lf, t0: window.__t0, tk: window.__tk}));
await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
const gaps = r.tk.filter(x => x[1] > 50);
console.log(MODE, F, WHICH, 'x' + THR, 'gaps>50', gaps.length, 'max', Math.max(...r.tk.map(x => x[1])), JSON.stringify(gaps));
for (const e of r.lf.filter(e => e.duration >= MIN)) {
  const st = Math.round(e.startTime - r.t0), ren = Math.round(e.startTime + e.duration - e.renderStart), sl = e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : 0;
  const sc = e.scripts.map(s => `${s.invoker}${s.sourceFunctionName ? '/' + s.sourceFunctionName : ''}:${Math.round(s.duration)}(fsl ${Math.round(s.forcedStyleAndLayoutDuration)})`).join(' ');
  console.log(`@${st} dur ${Math.round(e.duration)} block ${Math.round(e.blockingDuration)} render ${ren} styleLayout+paint ${sl} | ${sc}`);
}
await b.close();
