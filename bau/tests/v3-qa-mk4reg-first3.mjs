// QA MK4: live echo trace, 1-bar loop with one note (track 0 MK, delay 530 ms TIEFE 127)
import { open } from './v3-qa-mk4reg-pw.mjs';
const pre = process.argv[2] || 'mkset';
const {b, p, errs} = await open({width: 390, height: 844});
const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); let last = -999; while (performance.now() - t0 < ms) { const m = Q.meter(); const v = isFinite(m.rmsDb) ? Math.round(m.rmsDb) : -999; if (v > -60 && last <= -60) xs.push(Math.round(performance.now() - t0) + ':' + v); last = v; await new Promise(r => setTimeout(r, 10)); } return xs.join(' '); }, ms);
await p.evaluate(async (pre) => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 600));
  if (pre === 'mkset') { Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); }
  else { const s = JSON.parse(JSON.stringify(Q.getSound(0))); s.p.mk.dly = {type: 0, sync: 0, time: 110, note: 8, dep: 127}; Q.setSound(0, s); }
  await new Promise(r => setTimeout(r, 1000));
  Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); }, pre);
console.log(pre, 'onsets(ms):', await trace(7000));
console.log(errs); await b.close();
