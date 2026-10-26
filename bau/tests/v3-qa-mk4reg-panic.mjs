// QA MK4: how long the MS 2000 DELAY (TIEFE 127, ZEIT 127 = 1.4 s) keeps sounding after panic() ("Alle Töne aus")
import { open } from './v3-qa-mk4reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
  Q.mkSet(0, 'dly.time', 127); Q.mkSet(0, 'dly.dep', 127); Q.selectTrack(0);
  Q.keyOn(40, .01); await new Promise(r => setTimeout(r, 50)); Q.keyOff(40); await new Promise(r => setTimeout(r, 1500));   // audio + worklet running
  Q.chord([57, 60, 64], 300); await new Promise(r => setTimeout(r, 700)); Q.panic(); });
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now();
  while (performance.now() - t0 < 30000) { const m = Q.meter(); xs.push([performance.now() - t0, isFinite(m.rmsDb) ? m.rmsDb : -200]); await new Promise(r => setTimeout(r, 20)); }
  const per = []; for (let s = 0; s < 30; s += 2) per.push(s + 's:' + Math.round(Math.max(...xs.filter(x => x[0] >= s * 1000 && x[0] < (s + 2) * 1000).map(x => x[1]))));
  let lastAbove60 = 0; for (const x of xs) if (x[1] > -60) lastAbove60 = x[0];
  return {per: per.join(' '), lastAbove60dB_ms: Math.round(lastAbove60)}; });
console.log(JSON.stringify(r), errs);
await b.close();
