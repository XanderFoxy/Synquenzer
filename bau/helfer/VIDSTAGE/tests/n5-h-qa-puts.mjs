// QA VC2a: IDB writes of the recorder at most every 2 s during continuous gestures
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500, init: () => {
  window.__puts = [];
  const o = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (v, k) { if (typeof k === 'string' && k.startsWith('hist2:')) window.__puts.push(performance.now()); return o.call(this, v, k); };
}});
const E = (f, a) => p.evaluate(f, a);
await sleep(2600); await E(() => { window.__puts.length = 0; });
const t0 = Date.now(); let i = 0;
while (Date.now() - t0 < 12000) { await E(i => { const Q = SYNQUENZER; Q.setClip(1 + (i % 3), i % 4, {len: 1, notes: [{n: 60 + (i % 12), t: 0, d: 1, v: .8}]}); const s = Q.getSound(2); s.p.cutoff = 500 + i * 10; Q.setSound(2, s); if (i % 5 === 0) Q.setBpm(100 + i % 20); }, i); i++; await sleep(250); }
await sleep(2500);
const puts = await E(() => window.__puts.slice());
const gaps = puts.slice(1).map((x, k) => Math.round(x - puts[k]));
console.log('gestures', i * 2, 'puts', puts.length, 'gaps', JSON.stringify(gaps), 'min', Math.min(...gaps));
await b.close();
