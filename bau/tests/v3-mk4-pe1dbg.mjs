// MK4 PE1 / FP-IPHONE in Chromium: the demo plays (120 BPM), two tracks switch to the MS 2000 with all three effects (iPhone point:
// DELAY TEMPO SYNC on, NOTE 1/8, TIEFE 60; MOD-FX Ensemble on a pad), the editor stays on DELAY, the effect knobs are swept and the
// tempo changes 120 -> 90 -> 120 while it plays. rAF median >= 55 fps (1-s windows), no longtask > 50 ms, tick p95 <= 4 ms, notes as
// expected, no console errors. base = MK2 snapshot (same steps without effects). Usage: node v3-mk4-pe1.mjs [throttle]
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = S + 'mk-br-MK4/index.html', BASE = S + 'synq-snapshots/MK2.html', THR = +process.argv[2] || 1;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0;
for (const [name, file] of [['base', BASE], ['neu', APP], ['neu', APP], ['base', BASE]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  const r = await p.evaluate(async (isNew) => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); Q.setBpm(120); Q.clearLog(); Q.launchScene(0); await sl(1500);
    const t0 = performance.now(); window.__lt.length = 0; const gaps = [], fr = []; let last = performance.now(), on = true, w0 = performance.now(), wn = 0;
    const raf = () => { const n = performance.now(); gaps.push(n - last); last = n; wn++; if (n - w0 >= 1000) { fr.push(wn * 1000 / (n - w0)); w0 = n; wn = 0; } if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    const b0 = Q.runtime().beat;
    Q.setEngine(3, 'mk'); await sl(50); Q.setEngine(0, 'mk'); await sl(50);
    if (isNew) { Q.mkSet(3, 'dly.sync', 1); Q.mkSet(3, 'dly.note', 5); Q.mkSet(3, 'dly.dep', 60); Q.mkSet(0, 'mfx.type', 1); Q.mkSet(0, 'mfx.dep', 100); Q.mkSet(0, 'eq.hg', 4); }
    Q.selectSlot(3, 0); Q.openEditor(); await sl(200); if (isNew && window.MKUI) MKUI.setWahl(2, 5); await sl(200);
    for (let v = 0; v <= 127; v += 2) { if (isNew) { Q.mkSet(3, 'dly.dep', 30 + v / 4); Q.mkSet(0, 'mfx.spd', v); Q.mkSet(0, 'eq.lf', 40 + v * 7); } else { Q.mkSet(3, 't.0.f.cut', v); Q.mkSet(0, 't.0.f.cut', 127 - v); } await sl(30); }
    Q.setBpm(90); await sl(1500); Q.setBpm(120); await sl(1500);
    on = false;
    const b1 = Q.runtime().beat, dt = performance.now() - t0;
    const L = Q.noteLog(8000).filter(n => n.beat != null && n.beat >= b0 && n.beat < b1);
    const lt = window.__lt.filter(x => x[0] >= t0);
    gaps.sort((a, b) => b - a); fr.sort((a, b) => a - b);
    const ti = Q.engineInfo ? Q.engineInfo() : {}, te = Q.tickErrors ? Q.tickErrors() : null, tk = Q.tickStats ? Q.tickStats() : null;
    Q.stop();
    return {sec: +(dt / 1000).toFixed(2), beats: +(b1 - b0).toFixed(2), notes: L.length, per: [0,1,2,3,4,5,6,7].map(t => L.filter(n => n.track === t || n.t === t).length), k0: Object.keys(L[0] || {}).join(), notesPerBeat: +(L.length / (b1 - b0)).toFixed(2), lt: lt.map(x => x[1]), rafWorst: gaps.slice(0, 4).map(Math.round), fpsMed: +fr[fr.length >> 1].toFixed(1), fpsMin: +fr[0].toFixed(1), te, tk, fxB: Q.mkInfo().fxBytes, load: ti.load};
  }, name === 'neu');
  r.errs = errs; console.log(name, JSON.stringify(r));
  if (name === 'neu') { const c = r.fpsMed >= 55 && !r.lt.some(x => x > 50) && !errs.length; if (!c) fails++; console.log((c ? 'PASS' : 'FAIL') + ' PE1 (MK4): rAF-Median ' + r.fpsMed + ' fps, longtasks ' + JSON.stringify(r.lt) + ', Fehler ' + errs.length); }
  await ctx.close();
}
await b.close(); process.exit(fails ? 1 : 0);
