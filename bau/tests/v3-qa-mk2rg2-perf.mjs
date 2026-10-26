// QA regression MK2: smoothness while the demo plays and an MS 2000 track is added / its wave knob swept (longtasks, rAF gaps,
// scheduler: notes logged vs expected, tick errors), base 4.9.0 (MK1 waves) vs new 4.10.0 (Speicherwelle). Usage: node … [throttle]
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
const THR = +process.argv[2] || 1;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [name, file] of [['base', BASE], ['new', APP], ['base', BASE], ['new', APP]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  const r = await p.evaluate(async (isNew) => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); Q.setBpm(120); Q.clearLog(); Q.launchScene(0); await sl(1500);
    const t0 = performance.now(); window.__lt.length = 0; const gaps = []; let last = performance.now(), on = true;
    const raf = () => { const n = performance.now(); gaps.push(n - last); last = n; if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    const b0 = Q.runtime().beat;
    // add the MS 2000 engine on two tracks while playing, open its editor, sweep the wave knob (STEUER 2 / STEUER 1)
    Q.setEngine(3, 'mk'); await sl(50); Q.setEngine(0, 'mk'); await sl(50);
    if (isNew) { Q.mkSet(3, 't.0.o1.w', 5); Q.mkSet(0, 't.0.o1.w', 5); }
    Q.selectSlot(3, 0); Q.openEditor(); await sl(300);
    for (let v = 0; v <= 127; v += 2) { if (isNew) { Q.mkSet(3, 't.0.o1.c2', v); Q.mkSet(0, 't.0.o1.c2', 127 - v); } else { Q.mkSet(3, 't.0.o1.c1', v); Q.mkSet(0, 't.0.o1.c1', 127 - v); } await sl(30); }
    await sl(2000); on = false;
    const b1 = Q.runtime().beat, dt = performance.now() - t0;
    const L = Q.noteLog(8000).filter(n => n.beat != null && n.beat >= b0 && n.beat < b1);
    const lt = window.__lt.filter(x => x[0] >= t0);
    gaps.sort((a, b) => b - a);
    Q.closeEditor && Q.closeEditor(); Q.stop();
    return {sec: +(dt / 1000).toFixed(2), beats: +(b1 - b0).toFixed(2), notes: L.length, notesPerBeat: +(L.length / (b1 - b0)).toFixed(2), lt: lt.map(x => x[1]), rafWorst: gaps.slice(0, 4).map(Math.round), rafMed: +gaps[gaps.length >> 1].toFixed(1), te: Q.tickErrors(), info: Q.mkInfo(), eng: JSON.stringify(Q.engineInfo().perTrack.map(x => x.path))};
  }, name === 'new');
  r.errs = errs; console.log(name, JSON.stringify(r));
  await ctx.close();
}
await b.close();
