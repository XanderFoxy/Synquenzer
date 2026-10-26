// QA MK4: echo of clip notes / live taps after TIEFE > 0
import { open } from './v3-qa-mk4reg-pw.mjs';
const how = process.argv[2] || 'clip';
const {b, p, errs} = await open({width: 390, height: 844});
const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push(Math.round(performance.now() - t0) + ':' + (isFinite(m.rmsDb) ? m.rmsDb.toFixed(0) : '-inf')); await new Promise(r => setTimeout(r, 25)); } return xs.join(' '); }, ms);
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.selectTrack(0); await new Promise(r => setTimeout(r, 600));
  Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); await new Promise(r => setTimeout(r, 1000)); });
if (how === 'clip') await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setClip(0, 0, {len: 2, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); });
if (how === 'tapplay') await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setClip(1, 0, {len: 2, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 81, v: .01}]}); Q.launchClip(1, 0); setTimeout(() => Q.tap(57, 150), 300); });
if (how === 'keyon') await p.evaluate(() => { const Q = window.SYNQUENZER; Q.keyOn(57, .9); setTimeout(() => Q.keyOff(57), 150); });
const t = await trace(3500);
console.log(how, t.split(' ').filter(x => !/-inf|:-1\d\d/.test(x)).join(' '));
console.log(await p.evaluate(() => JSON.stringify({sel: window.SYNQUENZER.runtime().selected, play: window.SYNQUENZER.runtime().playing})), errs);
await b.close();
