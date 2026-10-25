// QA regression (V2d): PE1-like — 10 s demo with editor open (scene) and 10 s with a part running; rAF fps, long tasks; base vs new
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
for (const run of [1]) for (const [name, file] of [['base', BASE], ['new', APP]]) for (const mode of ['scene', 'part']) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(async mode => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120);
    if (mode === 'part') { Q.setPart(0, {name: 'A', slots: [{s: 0}, {s: 0}, {s: 0}, null, {s: 0}, null], chords: {len: 4, ch: [0, 1, 2, 3].map(k => ({b: k * 4, tg: Q.parseChord(['Am', 'F', 'C', 'G'][k])}))}}); Q.launchPart(0); }
    else Q.launchScene(0);
    Q.selectSlot(0, 0); Q.openEditor(); }, mode);
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => new Promise(res => {
    const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
    const fr = []; let last = performance.now(); const t0 = last;
    const f = now => { fr.push(now - last); last = now; if (now - t0 < 10000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b); const fps = 1000 / s[Math.floor(s.length / 2)]; res({fps: +fps.toFixed(1), frames: fr.length, p95: +s[Math.floor(s.length * .95)].toFixed(1), long: lt.length, maxLong: lt.length ? Math.max(...lt).toFixed(0) : 0}); } };
    requestAnimationFrame(f);
  }));
  const te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  console.log(run, name, mode, JSON.stringify(m), 'te', te, 'errs', errs.length);
  await b.close();
}
