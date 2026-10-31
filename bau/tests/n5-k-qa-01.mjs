// QA K1-01: osc 3 solo = osc 1 solo (level), its pitch knobs act (semi +7), level steps, and osc 3 changes leave osc 1 alone (open filter)
import {launch, seedWorklet, renderIn, dbDiff, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const base = await p.evaluate(() => { const s = SYNQUENZER.getSound(0); Object.assign(s.p, {reset: 1, o1lvl: 0, o2lvl: 0, o3lvl: 0, o1w: 0, o2w: 0, o3w: 0, o1oct: 0, o2oct: 0, o3oct: 0, cutoff: 20000, res: 0}); return s; });
const v = o => { const s = JSON.parse(JSON.stringify(base)); Object.assign(s.p, o); return s; };
const ev = [[0, 'on', 57, .8, 'n'], [0.9, 'off', 57, .8, 'n']];
const rms = x => { let q = 0; for (let i = 4800; i < 40000; i++) q += x[i] * x[i]; return 10 * Math.log10(q / 35200); };
const R = {};
for (const [k, o] of Object.entries({o1: {o1lvl: 1}, o2: {o2lvl: 1}, o3: {o3lvl: 1}, o3half: {o3lvl: .5}, o3q: {o3lvl: .25}})) R[k] = +rms(await renderIn(p, v(o), ev, {sec: 1, seed: 1})).toFixed(2);
const s7 = await renderIn(p, v({o3lvl: 1, o3w: 3, o3semi: 7}), ev, {sec: 1, seed: 1}); R.o3semi7Hz = +freqZC(s7, 48000, 4800, 40000).toFixed(1);
const o1 = await renderIn(p, v({o1lvl: 1, o1w: 3}), ev, {sec: 1, seed: 1});
const o1o3 = await renderIn(p, v({o1lvl: 1, o1w: 3, o3lvl: 1, o3w: 3, o3oct: 1}), ev, {sec: 1, seed: 1});
const o3only = await renderIn(p, v({o3lvl: 1, o3w: 3, o3oct: 1}), ev, {sec: 1, seed: 1});
const sum = o1.map((x, i) => x + o3only[i]); R.mixIsSum = +dbDiff(o1o3, sum).toFixed(1);
console.log(JSON.stringify(R)); console.log('errs', errs);
await b.close();
