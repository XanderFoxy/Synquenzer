// QA VC2a-01 real UI: notes tapped into the roll editor (CDP touch) -> one data event per undo step? (auto scene key follow-up)
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const VP = process.argv[2] || 'P1';
const {b, p, errs, cdp} = await open(VP, {wait: 2500});
const t = T(p, cdp), E = t.E;
// an existing clip on Synth 2, scene 1; open its roll
await E(() => SYNQUENZER.openRoll(1, 0)); await sleep(800);
await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); }); await E(() => historyCheck());
const n0 = await t.evN(), u0 = await E(() => UNDO.length);
// tap notes of a different key (F#, A#, C#) at free beats
const taps = [[0.5, 66], [1.5, 70], [2.5, 73], [3.5, 66], [0.25, 61], [1.25, 63]];
const log = [];
for (const [beat, note] of taps) {
  const xy = await E(([b, n]) => { const r = SYNQUENZER.rollApi(); return r && r._xy ? r._xy(b, n) : null; }, [beat, note]);
  if (!xy) { console.log('no roll'); break; }
  const visible = await E(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : null; }, [xy.x, xy.y]);
  await t.tap(xy.x, xy.y, 200);
  await sleep(2800);
  log.push({beat, note, at: [Math.round(xy.x), Math.round(xy.y)], hit: visible});
}
await sleep(2800); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
const u1 = await E(() => UNDO.length);
console.log(JSON.stringify(log));
console.log('taps', taps.length, 'undo steps', u1 - u0, 'data events', data.length, data.map(e => e.u).join(','));
for (const e of data.filter(e => e.u === 'proj')) console.log('  extra proj event:', e.l, JSON.stringify((e.d || []).map(o => o.op + ' ' + o.path + '=' + JSON.stringify(o.value))));
console.log('check', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log(data.length === u1 - u0 ? 'OK' : 'DEFECT: ' + (data.length - (u1 - u0)) + ' extra data events');
console.log('errors', JSON.stringify(errs));
await b.close();
