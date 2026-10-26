// MK-P-09 Leistung: Chromium, CPU-Drosselung x4, DPR 3, 390 x 844 und 844 x 390; 4 Spuren spielen (2 MS-2000-Spuren mit Arp und Seq).
// (a) Aufbau (Häppchen, fertig, longtask), (b) Skript-Sitzung 10 s (panelScript: 4 Regler, Tipp-Zoom, 13 Halte, Karte, EDIT-Seiten,
// Spiel-Ansicht): Hauptfaden-Arbeit je Bild aus dem Trace, rAF p95, (c) Layout während Gleiten / beim Drehen, (e) Layer (CDP LayerTree),
// (f) Noten gegen das Raster und Scheduler-Abstände gegen den Vorgänger (4.15.0, dieselbe Szene, Editor offen), Ereignis-Schleife.
// Usage: node v3-mkp-perf.mjs <neu.html> <vorg.html> [P1,L1]
import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const NEW = process.argv[2], OLD = process.argv[3], ONLY = (process.argv[4] || 'P1,L1').split(','), THR = +process.env.THR || 4;
const FM = {P1: [390, 844], L1: [844, 390]}; const fail = [], R = {}; const ok = (id, c, info) => { if (!c) fail.push(id + ': ' + info); };
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const b = await launch();
async function run(file, f, isNew) {
  const [w, h] = FM[f]; const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: +process.env.DPR || 3});
  const page = await ctx.newPage(); const errs = []; page.on('crash', () => console.error('CRASH', file)); page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.addInitScript((ns) => { window.__ns = ns; window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }, !!process.env.NOSCRIPT);
  await page.goto('file://' + path.resolve(file)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
    Q.selectTrack(2); });
  await page.waitForTimeout(500);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
  // (a) the first opening builds the plate
  const a = await page.evaluate(async () => { const t0 = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
    await new Promise(r => { let n = 0; const f = () => (window.MKUI && MKUI.PL && MKUI.PL.ready || ++n > 150 ? r() : setTimeout(f, 10)); f(); }); await new Promise(r => setTimeout(r, 300));
    const lt = window.__lt.filter(x => x[0] >= t0 - 5).map(x => Math.round(x[1]));
    return MKUI.PL ? {slices: MKUI.PL.slices ? MKUI.PL.slices.length : null, sliceMax: MKUI.PL.slices ? Math.max(...MKUI.PL.slices) : null, done: MKUI.PL.done != null ? +MKUI.PL.done.toFixed(1) : null, ms: MKUI.PL.ms != null ? +MKUI.PL.ms.toFixed(1) : null, open: +(performance.now() - t0).toFixed(0), lt} : {lt}; });
  await page.evaluate(() => { SYNQUENZER.clearLog(); SYNQUENZER.launchScene(0); }); await page.waitForTimeout(900);
  // tracing (new: the panel session; old: the same scene with the editor open)
  const evs = []; cdp.on('Tracing.dataCollected', d => { for (const e of d.value) evs.push(e); });
  await cdp.send('Tracing.start', {categories: 'toplevel,devtools.timeline,disabled-by-default-devtools.timeline.frame,blink.user_timing', transferMode: 'ReportEvents'});
  console.error('phase session', file); const s = await page.evaluate(async (isNew) => {
    const sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
    const tk = [], gaps = []; let lastTk = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lastTk) { tk.push(n - lastTk); if (n - lastTk > 50) gaps.push([+((lastTk - t0g) / 1000).toFixed(2), Math.round(n - lastTk)]); } lastTk = n; tick(); }, TICK_MS); const t0g = performance.now();
    const raf = [], lag = []; let on = true, lastF = 0; const rf = n => { if (lastF) raf.push(n - lastF); lastF = n; if (on) requestAnimationFrame(rf); }; requestAnimationFrame(rf);
    let exp = performance.now() + 50; const lp = () => { const n = performance.now(); lag.push(Math.max(0, n - exp)); exp = n + 50; if (on) setTimeout(lp, 50); }; setTimeout(lp, 50);
    console.timeStamp('mkp-start'); const t0 = performance.now(); const PS = isNew && !window.__ns ? MKUI.panelScript(10000) : null;
    await sl(10300); on = false; if (PS) { PS.stop(); out.panel = PS.res; }
    const L = SYNQUENZER.noteLog(4000).filter(e => e.track < 2 || e.track >= 0), spb = 60 / S.bpm;
    // notes of the clips (src clip) against the 1/16 grid of the song: the scheduler never set a note late
    const t0a = AU.ctx.currentTime; out.notes = L.length;
    out.gridDev = L.filter(e => e.beat != null && e.src !== 'arp').map(e => Math.abs(e.beat * 4 - Math.round(e.beat * 4)) * spb / 4 * 1000);
    out.tick = {max: Math.max(...tk), p99: 0, n: tk.length}; out.gaps = gaps; out.tk = tk; out.raf = raf; out.lag = lag; out.lt = window.__lt.filter(x => x[0] >= t0).map(x => Math.round(x[1]));
    return out; }, isNew);
  const done = new Promise(r => { cdp.once('Tracing.tracingComplete', r); }); await cdp.send('Tracing.end'); await Promise.race([done, new Promise(r => setTimeout(r, 20000))]);
  // (e) layers outside transitions: the overview and a halt (z = 1320)
  const lay = {};
  for (const [nm, v] of [['ganz', {ansicht: 'ganz'}], ['halt4', {ansicht: 'zoom', halt: 4}]]) {
    if (!isNew) break;
    await page.evaluate(v => { if (ED.tab !== 'geraet') { ED.tab = 'geraet'; safeRebuild(buildSynthEd); } MKUI.view(v); }, v); await page.waitForTimeout(700);
    let layers = null; const got = new Promise(r => cdp.once('LayerTree.layerTreeDidChange', e => { layers = e.layers; r(); }));
    await cdp.send('DOM.enable'); await cdp.send('LayerTree.enable'); await page.evaluate(() => { const h = MKUI.P.el.hull; h.style.outline = '0px solid transparent'; requestAnimationFrame(() => { h.style.outline = ''; }); });
    await Promise.race([got, new Promise(r => setTimeout(r, 3000))]);
    const own = [];
    if (layers) { await cdp.send('DOM.getDocument', {depth: -1});
      for (const L of layers) { if (!L.backendNodeId) continue; try { const {object} = await cdp.send('DOM.resolveNode', {backendNodeId: L.backendNodeId}); const r = await cdp.send('Runtime.callFunctionOn', {objectId: object.objectId, functionDeclaration: 'function () { return !!(this.closest && (this.closest(".mkfr") || this.closest(".mknav"))) ? (this.className || this.tagName) + "" : ""; }', returnByValue: true});
        if (r.result.value) own.push({cls: r.result.value, w: L.width, h: L.height, mb: +(L.width * L.height * 4 / 1048576).toFixed(2)}); } catch (e) {} } }
    await cdp.send('LayerTree.disable');
    lay[nm] = {all: layers ? layers.length : null, own, mb: +own.reduce((x, y) => x + y.mb, 0).toFixed(1)};
  }
  // the trace: main thread of this page, per frame the top-level tasks, layouts in the glide and knob windows
  const st = evs.find(e => e.name === 'TimeStamp' && e.args && e.args.data && e.args.data.message === 'mkp-start'); let tr = null;
  if (st) { const pid = st.pid, tid = st.tid, T0 = st.ts, M = evs.filter(e => e.pid === pid && e.tid === tid);
    const fr = M.filter(e => e.name === 'BeginMainThreadFrame').map(e => e.ts).sort((x, y) => x - y);
    const tasks = M.filter(e => e.name === 'RunTask' && e.ph === 'X' && e.ts >= T0 && e.ts <= T0 + 10.3e6);
    const per = []; let k = 0; for (let j = 0; j + 1 < fr.length; j++) { if (fr[j] < T0 || fr[j] > T0 + 10e6) continue; let sum = 0; while (k < tasks.length && tasks[k].ts < fr[j]) k++; let kk = k; while (kk < tasks.length && tasks[kk].ts < fr[j + 1]) { sum += tasks[kk].dur || 0; kk++; } per.push(sum / 1000); }
    const lays = M.filter(e => e.name === 'Layout' && e.ph === 'X' && e.ts >= T0).map(e => (e.ts - T0) / 1e6);
    const glides = [1.9, ...Array.from({length: 13}, (_, n) => 2.2 + .33 * (n + 1)), 6.8], inG = lays.filter(t => glides.some(g => t > g + .03 && t < g + .26));
    const knobs = [0, 1, 2, 3].map(k => .2 + .4 * k), inK = lays.filter(t => knobs.some(g => t > g && t < g + .38));
    const kFrames = fr.filter(t => knobs.some(g => (t - T0) / 1e6 > g && (t - T0) / 1e6 < g + .38)).length;
    tr = {frames: per.length, le16: +(per.filter(x => x <= 16).length / Math.max(1, per.length) * 100).toFixed(2), gt33: per.filter(x => x > 33).length, p99: +q(per, .99).toFixed(2), max: +Math.max(0, ...per).toFixed(2),
      layouts: lays.length, layoutsGleiten: inG.length, layoutsDrehen: inK.length, framesDrehen: kFrames};
  }
  const o = {a: isNew ? a : undefined, panel: s.panel, rafP95: +q(s.raf, .95).toFixed(2), rafMed: +q(s.raf, .5).toFixed(2), rafGt50: s.raf.filter(x => x > 50).length, lagMax: +Math.max(0, ...s.lag).toFixed(1), lagP95: +q(s.lag, .95).toFixed(1),
    tickMax: +Math.max(...s.tk).toFixed(1), tickGt50: s.tk.filter(x => x > 50).length, notes: s.notes, gridMax: +Math.max(0, ...s.gridDev).toFixed(3), lt: s.lt, gaps: s.gaps, trace: tr, layers: isNew ? lay : undefined, errs: errs.slice(0, 3)};
  await ctx.close(); return o;
}
for (const f of ONLY) {
  const o = OLD ? await run(OLD, f, false) : null; const n = await run(NEW, f, true); R[f] = {neu: n, vorg: o};
  ok('MK-P-09a', n.a && n.a.sliceMax <= 16 && n.a.done <= 150 && !n.a.lt.some(x => x > 50), f + ' Aufbau ' + JSON.stringify(n.a));
  ok('MK-P-09b', n.trace && n.trace.le16 >= 99 && n.trace.gt33 === 0, f + ' Bilder ' + JSON.stringify(n.trace));
  ok('MK-P-09b', n.rafP95 <= 17.5, f + ' rAF p95 ' + n.rafP95);
  ok('MK-P-09c', n.trace && n.trace.layoutsGleiten === 0 && n.trace.layoutsDrehen <= n.trace.framesDrehen, f + ' Layout ' + JSON.stringify(n.trace));
  ok('MK-P-09e', n.layers && Object.values(n.layers).every(L => L.mb <= 48 && L.own.length <= 2), f + ' Layer ' + JSON.stringify(n.layers));
  ok('MK-P-09f', n.tickGt50 === 0 && (!o || n.gridMax <= Math.max(o.gridMax, .5)), f + ' Ton ' + JSON.stringify({neu: [n.tickMax, n.tickGt50, n.gridMax], vorg: o && [o.tickMax, o.tickGt50, o.gridMax]}));
  ok('MK-P-09f', !o || n.lagP95 <= o.lagP95 + 20, f + ' Ereignis-Schleife ' + JSON.stringify({neu: [n.lagP95, n.lagMax], vorg: o && [o.lagP95, o.lagMax]}));
  ok('konsole', !n.errs.length, f + ' ' + n.errs.join(' | '));
}
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
