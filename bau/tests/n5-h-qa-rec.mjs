// QA VC2a: a fixed-length recording (● with length 1 bar) is ONE undo step ("Aufnahme"). How many data events, and does the
// 'clip' event carry the recorded notes?
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
const waitB = async x => { await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, x, {timeout: 30000, polling: 5}); };
await E(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); }); await sleep(2600);
await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
await E(() => { SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await waitB(3.5);
const n0 = await t.evN(), u0 = await E(() => UNDO.length);
await E(() => SYNQUENZER.rec());
for (const [bb, n] of [[4.05, 60], [5.05, 64], [6.05, 67], [7.05, 72]]) { await waitB(bb); await E(n => SYNQUENZER.keyOn(n), n); await sleep(200); await E(n => SYNQUENZER.keyOff(n), n); }
await waitB(9); await sleep(300);
const st = await E(() => SYNQUENZER.runtime().rec.state);
await E(() => SYNQUENZER.stop()); await sleep(3000);
await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
const u1 = await E(() => ({n: UNDO.length, top: UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label}));
const clipNow = await E(() => (S.tracks[0].clips[3] || {notes: []}).notes.length);
console.log('rec state after', st, 'undo steps', u1.n - u0, JSON.stringify(u1.top), 'notes in clip', clipNow);
for (const e of evs) console.log('  ', e.u, e.l, 'ops', (e.d || []).length, JSON.stringify((e.d || []).map(o => o.op + ' ' + o.path + (o.value && o.value.notes ? ' notes=' + o.value.notes.length : ''))).slice(0, 300));
const clipEv = data.find(e => e.u === 'clip');
const notesInClipEvent = clipEv ? (clipEv.d || []).reduce((a, o) => a + (o.value && Array.isArray(o.value.notes) ? o.value.notes.length : /notes\/\d+$/.test(o.path) && o.op === 'add' ? 1 : 0), 0) : -1;
console.log('RESULT undo steps', u1.n - u0, 'data events', data.length, 'notes in the clip event', notesInClipEvent, 'of', clipNow);
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
