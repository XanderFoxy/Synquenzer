// QA VC2a: Hand-Träger by real taps on the keyboard (AKKORD mode) while playing -> ctx 'hand' events, no data events
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open(process.argv[2] || 'P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
await E(() => SYNQUENZER.launchScene(0)); await sleep(1500);
{ const r = await t.rect('#segTr'); await t.tap(r.cx, r.cy, 500); }
await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
const n0 = await t.evN();
const keys = await E(() => { const ks = [...document.querySelectorAll('#kbArea [data-n], #kbArea .key, #kbArea button')].filter(e => e.offsetWidth); return ks.slice(0, 40).map(e => { const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height * 0.75, c: e.className, n: e.dataset.n}; }); });
console.log('keys found', keys.length, JSON.stringify(keys.slice(0, 3)));
for (const k of [keys[2], keys[5], keys[9]].filter(Boolean)) { await t.down(k.x, k.y); await sleep(300); await t.up(); await sleep(1500); }
await sleep(2800); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0);
console.log(JSON.stringify(evs.map(e => ({u: e.u, l: e.l, z: e.z, d: (e.d || []).map(o => o.op + ' ' + o.path)}))));
console.log('runtime carrier', JSON.stringify(await E(() => SYNQUENZER.runtime().carrier || null)));
await E(() => SYNQUENZER.stop());
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
