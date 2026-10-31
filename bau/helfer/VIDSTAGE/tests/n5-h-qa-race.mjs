// QA VC2a: race between the background Abgleich timer (histTimer -> histSweep, no drain first) and the capture of a gesture
// (setTimeout 0). Gestures at user-like random pauses; each gesture changes data the Abgleich would see.
// Counts gesture events with an EMPTY patch whose change shows up in a 'proj' event instead.
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const N = +(process.argv[2] || 60);
const {b, p, errs, cdp} = await open('P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
const n0 = await t.evN();
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < N; i++) {
  const k = i % 3;
  await E(([i, k]) => {
    if (k === 0) { const s = SYNQUENZER.getSound(2); s.p.cutoff = 400 + (i * 137) % 7000; SYNQUENZER.setSound(2, s); }
    else if (k === 1) setBusFx('hall.decay', +(1 + (i % 9) * 0.4).toFixed(2));
    else setSetting('kbVel', S.settings.kbVel === 'pos' ? 'fixed' : 'pos', 'Tastatur-Anschlag');
  }, [i, k]);
  await sleep(150 + Math.floor(rnd() * 2400));
}
await sleep(2800); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
const empty = data.filter(e => e.u !== 'proj' && (!e.d || !e.d.length));
const proj = data.filter(e => e.u === 'proj');
console.log('gestures', N, 'data events', data.length, 'gesture events with EMPTY patch', empty.length, JSON.stringify(empty.map(e => e.u + ' ' + e.l)), 'proj events', proj.length);
for (const e of proj) console.log('  proj', e.l, JSON.stringify(e.d.map(o => o.op + ' ' + o.path + '=' + JSON.stringify(o.value))).slice(0, 200));
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
