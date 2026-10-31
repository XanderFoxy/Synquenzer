// QA VC2a: only looking into the editor of an EMPTY slot (no note) leaves no undo step; how many data events are recorded?
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open(process.argv[2] || 'P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
const n0 = await t.evN(), u0 = await E(() => UNDO.length);
// tap an empty slot of the selected track (Synth 4), then the ✎ button, then close the editor without a note
const slot = await E(() => { const e = [...document.querySelectorAll('.slot')].filter(x => x.offsetWidth && !x.classList.contains('filled'))[0]; const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2, txt: e.textContent}; });
await t.tap(slot.x, slot.y, 600);
const ed1 = await E(() => R.editor);
if (!ed1) { const r = await t.rect('#bEdit'); await t.tap(r.cx, r.cy, 800); }
const ed = await E(() => ({ed: R.editor, undo: UNDO.length, top: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label}));
await sleep(600);
await E(() => closeEditor()); await sleep(2800);
await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
const u1 = await E(() => UNDO.length);
console.log('editor while open', JSON.stringify(ed), 'undo steps after close', u1 - u0, 'data events', data.length, JSON.stringify(data.map(e => e.u + ' ' + e.l + ' ' + JSON.stringify((e.d || []).map(o => o.op + ' ' + o.path)))));
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))), 'errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
