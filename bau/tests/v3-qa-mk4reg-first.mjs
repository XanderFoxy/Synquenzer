// QA MK4: echo of a note played right after TIEFE goes > 0 (first switch-on) vs. later
import { open } from './v3-qa-mk4reg-pw.mjs';
const wait = +(process.argv[2] || 0);
const {b, p, errs} = await open({width: 390, height: 844});
const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push(Math.round(performance.now() - t0) + ':' + (isFinite(m.rmsDb) ? m.rmsDb.toFixed(0) : '-inf')); await new Promise(r => setTimeout(r, 25)); } return xs.join(' '); }, ms);
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.selectTrack(0); await new Promise(r => setTimeout(r, 600)); });
await p.evaluate(async (wait) => { const Q = window.SYNQUENZER; Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); await new Promise(r => setTimeout(r, wait)); Q.tap(57, 150); }, wait);
const t = await trace(1500);
console.log('wait', wait, t.split(' ').filter(x => !/-inf|:-1\d\d/.test(x)).join(' '));
console.log(await p.evaluate(() => JSON.stringify(window.SYNQUENZER.mkInfo())), errs);
await b.close();
