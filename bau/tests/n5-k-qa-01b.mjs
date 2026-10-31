import {launch, seedWorklet, renderIn} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const base = await p.evaluate(() => { const s = SYNQUENZER.getSound(0); Object.assign(s.p, {reset: 1, o1lvl: 0, o2lvl: 0, o3lvl: 0, o1w: 0, o2w: 0, o3w: 0, o1oct: 0, o2oct: 0, o3oct: 0, cutoff: 20000, res: 0}); return s; });
const v = o => { const s = JSON.parse(JSON.stringify(base)); Object.assign(s.p, o); return s; };
const ev = [[0, 'on', 57, .8, 'n'], [0.9, 'off', 57, .8, 'n']];
for (let k = 0; k < 3; k++) for (const o of [{o1lvl: 1}, {o3lvl: 1}]) {
  const x = await renderIn(p, v(o), ev, {sec: 1, seed: 1});
  let nan = 0, first = -1, q = 0; for (let i = 0; i < x.length; i++) { if (!isFinite(x[i])) { nan++; if (first < 0) first = i; } else if (i > 4800 && i < 40000) q += x[i] * x[i]; }
  console.log(JSON.stringify({run: k, o, len: x.length, nan, first, rms: +(10 * Math.log10(q / 35200)).toFixed(2)}));
}
console.log('errs', errs);
await b.close();
