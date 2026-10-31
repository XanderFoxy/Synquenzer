import { open } from './lib.mjs';
const {b, p, errs} = await open();
console.log(await p.evaluate(async () => { const A = SYNQUENZER; A.setBpm(120); A.setEngine(2, 'mk'); A.setClip(2, 0, {len: 1, notes: [{t: 0, d: 2, n: 57, v: .9}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}]; lanes[4] = [{bar: 0, slot: 0}]; A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const a = A.serialize(); await new Promise(r => setTimeout(r, 6000)); const c = A.serialize();
  if (a === c) return {same: true}; let k = 0; while (a[k] === c[k]) k++; return {same: a === c, at: k, a: a.slice(k - 20, k + 200), c: c.slice(k - 20, k + 200)}; }));
await b.close();
