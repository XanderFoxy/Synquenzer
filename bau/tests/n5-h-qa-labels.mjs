// QA VC2a: labels (l) of recorded events after real taps: German short labels?
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
await sleep(2600); await t.drain(); await E(() => historyCheck());
const n0 = await t.evN();
const tapSel = async (sel, i = 0) => { const r = await E(([s, i]) => { const e = [...document.querySelectorAll(s)].filter(x => x.offsetWidth)[i]; const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2}; }, [sel, i]); await t.tap(r.x, r.y, 400); };
await tapSel('.slot.filled', 1); await sleep(600);
await tapSel('.scn', 1); await sleep(600);
await tapSel('#bPlay'); await sleep(600);
await tapSel('#octUp'); await sleep(2800);
await E(() => { SYNQUENZER.setBpm(123); }); await sleep(2800);
await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0);
console.log(JSON.stringify(evs.map(e => ({u: e.u, l: e.l}))));
await b.close();
