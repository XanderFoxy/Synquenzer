// order/time of events when a gesture and a context event happen in the same moment (REC start, empty cell tap → clip + start)
import {open, sleep} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]}); const {p, E} = T;
await sleep(2600); await T.drain(); let n0 = await T.evN();
await E(() => { SYNQUENZER.setClip(3, 2, {len: 1, notes: [{t: 0, d: .5, n: 64, v: .8}]}); SYNQUENZER.launchClip(3, 2); });
await sleep(800); await T.drain();
await E(() => { SYNQUENZER.stop(); }); await sleep(600);
await E(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 5); SYNQUENZER.rec(); });
await sleep(2500); await E(() => SYNQUENZER.stop()); await sleep(2800); await T.drain();
const evs = await T.evSince(n0);
let prev = -1; for (const e of evs) { console.log(String(e.t).padStart(7), e.t < prev ? 'NON-MONOTONIC' : '', e.u, e.u === 'ctx' ? e.z.c : JSON.stringify(e.z.p), JSON.stringify(e.l), 'd' + (e.d || []).length); prev = Math.max(prev, e.t); }
await T.b.close();
