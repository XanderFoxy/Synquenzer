// QA MK4: browser preview of a stored MS 2000 sound with DELAY: does the echo tail ring out or is it cut when the preview chain goes?
import { open } from './v3-qa-mk4reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await sl(300);
  Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127);
  await Q.libraryReady(); await Q.saveSound(0, 'QA Echo'); const rec = Q.library().find(x => x.name === 'QA Echo'); out.id = rec && rec.id;
  Q.setEngine(0, 'analog'); await sl(300);                                     // the track plays another sound: the preview gets its own chain
  Q.keyOn(40, .01); await sl(50); Q.keyOff(40); await sl(1500);               // audio running, worklet ready
  const st = Q.preview(0, rec.id); out.started = st;
  const xs = []; const t0 = performance.now(); let endAt = null;
  while (performance.now() - t0 < 9000) { const m = Q.meter(); const ps = Q.previewState(); if (!ps.on && endAt == null) endAt = performance.now() - t0; xs.push([Math.round(performance.now() - t0), isFinite(m.rmsDb) ? +m.rmsDb.toFixed(1) : -200]); await sl(8); }
  out.previewEnd = Math.round(endAt);
  // last moment with sound and the level just before it
  let last = -1; for (let i = xs.length - 1; i >= 0; i--) if (xs[i][1] > -120) { last = i; break; }
  out.lastSound = last >= 0 ? xs[last] : null; out.before = last >= 0 ? xs.slice(Math.max(0, last - 6), last + 4) : null;
  // per 250 ms peak
  const bins = []; for (let t = 0; t < 9000; t += 250) { const v = xs.filter(x => x[0] >= t && x[0] < t + 250).map(x => x[1]); bins.push(v.length ? Math.max(...v) : null); } out.bins = bins.join(' ');
  return out; });
console.log(JSON.stringify(r, null, 1), errs);
await b.close();
