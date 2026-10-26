// QA regression MK2: viewer-like sandbox (localStorage / IndexedDB throw): boot, MS 2000 track with Speicherwelle + patch, play, save, no errors
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  await ctx.addInitScript(() => { const thr = () => { throw new DOMException('denied', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', {get: thr, configurable: true}); Object.defineProperty(window, 'sessionStorage', {get: thr, configurable: true});
    Object.defineProperty(window, 'indexedDB', {get: thr, configurable: true}); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); const r = {};
  try {
    await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
    r.st = await p.evaluate(() => window.SYNQUENZER.storage().mode);
    r.play = await p.evaluate(async (isNew) => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.setEngine(0, 'mk'); await sl(200);
      if (isNew) { Q.mkSet(0, 't.0.o1.w', 5); Q.mkSet(0, 't.0.o1.c2', 40); Q.mkSet(0, 't.0.p.1.i', 30); }
      Q.selectTrack(0); Q.openEditor(); await sl(400); Q.setBpm(200); Q.clearLog(); Q.launchScene(0); await sl(2500);
      const n = Q.noteLog(500).filter(x => x.beat != null).length; const m = Q.meter().rmsDb; Q.stop(); Q.closeEditor();
      const a = await Q.save().catch(e => 'err ' + e); return {n, m: +m.toFixed(1), save: String(a), info: Q.mkInfo().tables}; }, name === 'new');
  } catch (e) { r.FAIL = String(e).slice(0, 300); }
  r.errs = errs.slice(); console.log(name, JSON.stringify(r)); await ctx.close(); }
await b.close();
