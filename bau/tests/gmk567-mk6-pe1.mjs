// MK6-12 PE1 in Chromium: the demo plays (120 BPM), two tracks switch to the MS 2000 with three sequences (KEY SYNC Stimme on one,
// aus = song grid on the other), the editor shows SCHRITTE (canvas, running step at <= 30 Hz) while the step values are edited and the
// tempo changes 120 -> 90 -> 120. a held key on the edited track; rAF median >= 55 fps (1-s windows), no longtask > 50 ms, no console errors. base = the predecessor
// (same steps without sequences). Usage: node v3-mk6-pe1.mjs [throttle]
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = S + 'mk-wt/index.html', BASE = S + 'mk6-base-4.12.0.html', THR = +process.argv[2] || 1;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0;
for (const [name, file] of [['base', BASE], ['neu', APP], ['base', BASE], ['neu', APP]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  const r = await p.evaluate(async (isNew) => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); Q.setBpm(120); Q.clearLog();
    Q.setEngine(3, 'mk'); Q.setEngine(0, 'mk');   // setup (many API calls in one task) before the measurement
    if (isNew) for (const [t, ks] of [[3, 2], [0, 0]]) { Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.ks', ks); [11, 1, 16].forEach((k, j) => Q.mkSet(t, 't.0.seq.q.' + j + '.k', k)); for (let s = 0; s < 16; s++) { Q.mkSet(t, 't.0.seq.q.0.v.' + s, Math.round(40 * Math.sin(s / 2))); Q.mkSet(t, 't.0.seq.q.1.v.' + s, (s % 4) * 3); Q.mkSet(t, 't.0.seq.q.2.v.' + s, s * 4 - 30); } }
    Q.launchScene(0); await sl(1500);
    const t0 = performance.now(); window.__lt.length = 0; const gaps = [], fr = []; let last = performance.now(), on = true, w0 = performance.now(), wn = 0;
    const raf = () => { const n = performance.now(); gaps.push(n - last); last = n; wn++; if (n - w0 >= 1000) { fr.push(wn * 1000 / (n - w0)); w0 = n; wn = 0; } if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    const b0 = Q.runtime().beat;
    Q.selectSlot(3, 0); Q.openEditor(); await sl(200); if (isNew && window.MKUI) { MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); } await sl(200);
    Q.keyOn(60); const curs = []; for (let v = 0; v <= 127; v += 2) { if (isNew && window.MKUI && MKUI.stepsInfo()) curs.push(MKUI.stepsInfo().cur); if (isNew) { Q.mkSet(3, 't.0.seq.q.0.v.' + ((v >> 1) % 16), (v % 126) - 63); Q.mkSet(0, 't.0.seq.q.0.v.' + ((v >> 2) % 16), 63 - (v % 126)); } else { Q.mkSet(3, 't.0.f.cut', v); Q.mkSet(0, 't.0.f.cut', 127 - v); } await sl(30); }
    Q.keyOff(60); const tE = performance.now(); Q.setBpm(90); await sl(1500); Q.setBpm(120); await sl(1500);
    on = false;
    const b1 = Q.runtime().beat, dt = performance.now() - t0;
    const L = Q.noteLog(8000).filter(n => n.beat != null && n.beat >= b0 && n.beat < b1);
    const lt = window.__lt.filter(x => x[0] >= t0);
    gaps.sort((a, b) => b - a); fr.sort((a, b) => a - b);
    const cur = curs.length ? Math.max(...curs) : null, mk = {edit: Math.round(tE - t0)};
    Q.stop();
    return {sec: +(dt / 1000).toFixed(2), beats: +(b1 - b0).toFixed(2), notes: L.length, notesPerBeat: +(L.length / (b1 - b0)).toFixed(2), lt: lt.map(x => x[1]), ltAt: lt.map(x => Math.round(x[0] - t0)), mk, rafWorst: gaps.slice(0, 4).map(Math.round), fpsMed: +fr[fr.length >> 1].toFixed(1), fpsMin: +fr[0].toFixed(1), cur};
  }, name === 'neu');
  r.errs = errs; console.log(name, JSON.stringify(r));
  if (name === 'neu') { const c = r.fpsMed >= 55 && !r.lt.some(x => x > 50) && !errs.length && r.cur >= 1; if (!c) fails++; console.log((c ? 'PASS' : 'FAIL') + ' PE1 (MK6): rAF-Median ' + r.fpsMed + ' fps, longtasks ' + JSON.stringify(r.lt) + ', SCHRITTE zeigt Schritt ' + r.cur + ', Fehler ' + errs.length); }
  await ctx.close();
}
await b.close(); process.exit(fails ? 1 : 0);
