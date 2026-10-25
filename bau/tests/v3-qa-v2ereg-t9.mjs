// QA (V2e): song-view render cost while the song plays (32 bars, 8 marks incl. scenes and parts), CPU ×4: main-thread time per
// frame (Performance.getMetrics TaskDuration) and frame pacing, base vs new; P1 and L1
import { open, APP } from './v3-v2d-pw.mjs';
import { SETUP } from './v3-v2d2-lib.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html';
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const run of [1, 2]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; for (let k = 0; k < 5; k++) Q.placePart(k % 2, Q.song().bars, 'insert'); Q.setBpm(120); Q.songView(true); Q.clearLog(); Q.songPlay(0); });
  await p.waitForTimeout(1200);
  await cdp.send('Performance.enable'); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const m0 = await cdp.send('Performance.getMetrics');
  const m = await p.evaluate(() => new Promise(res => {
    const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
    const fr = []; let last = performance.now(); const t0 = last;
    const f = now => { fr.push(now - last); last = now; if (now - t0 < 8000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b); res({frames: fr.length, med: +s[Math.floor(s.length / 2)].toFixed(1), p95: +s[Math.floor(s.length * .95)].toFixed(1), long: lt.length, maxLong: lt.length ? +Math.max(...lt).toFixed(0) : 0}); } };
    requestAnimationFrame(f); }));
  const m1 = await cdp.send('Performance.getMetrics');
  const g = (M, k) => (M.metrics.find(x => x.name === k) || {}).value;
  const task = (g(m1, 'TaskDuration') - g(m0, 'TaskDuration')) * 1000, scr = (g(m1, 'ScriptDuration') - g(m0, 'ScriptDuration')) * 1000;
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  const info = await p.evaluate(() => ({bars: window.SYNQUENZER.song().bars, marks: window.SYNQUENZER.song().marks.length, te: window.SYNQUENZER.tickErrors()}));
  console.log(vp, run, name, JSON.stringify(m), 'mainThread ms/frame', (task / m.frames).toFixed(2), 'script ms/frame', (scr / m.frames).toFixed(2), JSON.stringify(info), 'errs', errs.length);
  await b.close();
}
