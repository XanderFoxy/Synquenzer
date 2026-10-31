import { open } from './lib.mjs';
const {b, p, errs} = await open();
const run = (pre) => p.evaluate(async (pre) => {
  const A = SYNQUENZER; A.setBpm(120); A.setEngine(2, 'mk');
  if (pre) { A.setClip(2, 0, {len: 8, notes: [{t: 0, d: 32, n: 48, v: .9}]}); const l = []; for (let i = 0; i < NT(); i++) l.push([]); l[2] = [{bar: 0, slot: 0}]; A.setSong({bars: 8, lanes: l, carrier: [], mel: {}, marks: []}); await A.vvRender({}); }
  A.setClip(2, 0, {len: 1, notes: [{t: 0, d: 2, n: 57, v: .9}]});
  const lanes = []; for (let i = 0; i < NT(); i++) lanes.push([]); lanes[2] = [{bar: 0, slot: 0}]; lanes[4] = [{bar: 0, slot: 0}];
  A.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const parse = s => { let o = s; while (typeof o === 'string') o = JSON.parse(o); return o; };
  const dd = (a, b, path, out) => { if (out.length > 12) return; if (JSON.stringify(a) === JSON.stringify(b)) return; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) dd(a[k], b[k], path + '.' + k, out); } else out.push([path, JSON.stringify(a)?.slice(0, 150), JSON.stringify(b)?.slice(0, 150)]); };
  const before = A.serialize(); A.vvTest({opus: true, spur: 2}); await A.vvMake({fmt: '9:16', view: 'song'}); A.vvTest({}); const after = A.serialize();
  const d = []; dd(parse(before), parse(after), '', d);
  // control: same again without vvMake but same wait
  const c0 = A.serialize(); await new Promise(r => setTimeout(r, 3000)); const c1 = A.serialize(); const d2 = []; dd(parse(c0), parse(c1), '', d2);
  return {diffMake: d, diffCtl: d2};
}, pre);
console.log(JSON.stringify(await run(false), null, 1));
console.log(JSON.stringify(await run(true), null, 1));
console.log(errs);
await b.close();
