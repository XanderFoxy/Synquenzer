// QA VC2a-01 with REAL clip content: N clip gestures with valid notes ({t,d,n,v}), each its own task, pauses like a user
// -> data events must equal undo steps (one gesture = one event). Lists extra events.
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
const n0 = await t.evN(), u0 = await E(() => UNDO.length);
const KEYS = [[60, 64, 67], [62, 65, 69], [57, 60, 64], [55, 59, 62], [61, 65, 68], [63, 66, 70]];
const N = 12;
for (let i = 0; i < N; i++) {
  await E(i => { const Q = SYNQUENZER, ch = [[60, 64, 67], [62, 65, 69], [57, 60, 64], [55, 59, 62], [61, 65, 68], [63, 66, 70]][i % 6];
    const notes = []; for (let k = 0; k < 8; k++) notes.push({n: ch[k % 3] + 12 * (k % 2), t: k * .5, d: .5, v: .8});
    Q.setClip(1 + (i % 3), i % 4, {len: 1, notes}); }, i);
  await sleep(i % 2 ? 900 : 2800);   // user-like pauses (sometimes < 2 s)
}
await sleep(2800); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
const u1 = await E(() => UNDO.length);
console.log('gestures', N, 'undo steps', u1 - u0, 'data events', data.length);
for (const e of data.filter(e => e.u === 'proj')) console.log('  extra proj event:', e.l, JSON.stringify((e.d || []).map(o => o.op + ' ' + o.path + '=' + JSON.stringify(o.value))));
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log(data.length === u1 - u0 ? 'OK' : 'DEFECT: ' + (data.length - (u1 - u0)) + ' extra data events for ' + N + ' gestures');
console.log('errors', JSON.stringify(errs));
await b.close();
