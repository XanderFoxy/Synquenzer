// MK-P-09 (b)/(f) independent: CPU x THR, DPR 3, P1 / L1, 4 tracks play (2 MS 2000 with arp + seq); a 10 s session of REAL touches on the panel
import {launch, open, touch, tap, line, panel, ctr, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), FM = (process.argv[2] || 'P1').split(','), FILES = (process.argv[3] || 'new').split(',');
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const b = await launch();
for (const which of FILES) for (const f of FM) {
  const page = await open(b, f, {dpr: 3, file: which === 'old' ? VORG : FILE, init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
  await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
    Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
  await page.waitForTimeout(1500);
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
  await page.evaluate(() => { window.__raf = []; window.__on = true; let last = 0; const rf = n => { if (last) window.__raf.push(n - last); last = n; if (window.__on) requestAnimationFrame(rf); }; requestAnimationFrame(rf);
    window.__tk = []; window.__gap = []; window.__ph = []; let lt = 0; const T0 = AU.timer; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt) { window.__tk.push(n - lt); if (n - lt > 50) window.__gap.push([Math.round(lt - window.__t0), Math.round(n - lt)]); } lt = n; tick(); }, TICK_MS); window.__t0 = performance.now(); });
  const t0 = Date.now(); const isNew = which !== 'old' && !process.env.IDLE;
  // the session: 4 knob drags, tap zoom, ▶ through the stops, a swipe, map, EDIT pages, SPIEL
  if (isNew) {
    const ph = nm => page.evaluate(nm => window.__ph.push([nm, Math.round(performance.now() - window.__t0)]), nm);
    const drag = async id => { const E = (await panel(page)).elements.find(e => e.id === id); if (!E || !E.px) return; const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); };
    for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { await ph('drag ' + id); await drag(id); } await ph('tapzoom');
    const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6);
    await ph('stops'); for (let k = 0; k < 9 && Date.now() - t0 < 7000; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); }
    await ph('map'); await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300); await ph('edit');
    await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); }
    await ph('spiel'); await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await ph('idle');
  }
  while (Date.now() - t0 < 10000) await page.waitForTimeout(200);
  const r = await page.evaluate(() => { window.__on = false; return {gap: window.__gap, ph: window.__ph, raf: window.__raf, tk: window.__tk, lt: window.__lt.filter(x => x[0] >= window.__t0).map(x => Math.round(x[1]))}; });
  await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  console.log(which, f, 'x' + THR, 'rAF n', r.raf.length, 'p50', q(r.raf, .5).toFixed(1), 'p95', q(r.raf, .95).toFixed(1), '>50ms', r.raf.filter(x => x > 50).length, '| sched gaps >50ms', r.tk.filter(x => x > 50).length, 'max', Math.round(Math.max(...r.tk)), '| longtasks', r.lt.length, JSON.stringify(r.lt.slice(0, 12)), 'errs', page.errs.length); console.log('  phases', JSON.stringify(r.ph)); console.log('  gaps', JSON.stringify(r.gap));
  await page.ctx.close();
}
await b.close();
