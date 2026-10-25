// MK0 DoD: PE1-like (10 s demo playback, editor open, P1 touch) base vs new, new also with a newer-engine sound on the
// playing track (clips play INIT through it) and in ECO (native); 60 s playback without console errors; ECO audible.
// Usage: node v3-mk0-perf.mjs <base.html> <new.html>
import { open } from './v3-v2d-pw.mjs';
const [BASE, NEW] = process.argv.slice(2);
const X = {$: 'snd', v: 1, id: null, name: 'Zukunft', cat: 'lead', engine: 'xyz', ev: 3, p: {a: 1}, mods: [], fx: {}, origin: null, ct: 1, mt: 2};
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const measure = p => p.evaluate(() => new Promise(res => {
  const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
  const fr = []; let last = performance.now(); const t0 = last;
  const f = now => { fr.push(now - last); last = now; if (now - t0 < 10000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b);
    res({fps: +(1000 / s[Math.floor(s.length / 2)]).toFixed(1), long: lt.length, maxLong: lt.length ? Math.max(...lt).toFixed(0) : 0}); } };
  requestAnimationFrame(f); }));
for (const [name, file, foreign, eco] of [['base', BASE, false, false], ['new', NEW, false, false], ['new+xyz', NEW, true, false], ['new+xyz ECO', NEW, true, true]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(async ([x, foreign, eco]) => { const Q = window.SYNQUENZER; await Q.loadDemo(); if (eco) Q.forceNative(true); if (foreign) Q.setSound(0, x); Q.launchScene(0); Q.selectSlot(0, 0); Q.openEditor(); }, [X, foreign, eco]);
  await p.waitForTimeout(1500);
  const m = await measure(p);
  const te = await p.evaluate(() => window.SYNQUENZER.tickErrors ? window.SYNQUENZER.tickErrors() : 0);
  ok('PE1 ' + name, m.fps >= 55 && m.long === 0 && !te, JSON.stringify(m) + ' tickErrors=' + te);
  if (foreign) {
    // the playing foreign track is audible (INIT) and the sound is kept
    const lvl = await p.evaluate(async () => { const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 2048; AU.masterSum.connect(an); let mx = 0; const buf = new Float32Array(2048);
      const v = auditionStart(0, 64, .8); for (let k = 0; k < 12; k++) { await new Promise(r => setTimeout(r, 25)); an.getFloatTimeDomainData(buf); for (const x of buf) mx = Math.max(mx, Math.abs(x)); } if (v) v.release(nowT());
      return {peak: mx, eng: SYNQUENZER.getSound(0).engine, eco: trackEco(0)}; });
    ok('audible ' + name, lvl.peak > .005 && lvl.eng === 'xyz', JSON.stringify(lvl));
  }
  if (name === 'new+xyz') { await p.waitForTimeout(50000); ok('60 s playback without console errors (' + name + ')', errs.length === 0, errs.join(' | ').slice(0, 200)); }
  else ok('no console errors (' + name + ')', errs.length === 0, errs.join(' | ').slice(0, 200));
  await b.close();
}
process.exit(fails ? 1 : 0);
