// Eine Clip-Aufnahme (● REC, 1 Takt, Noten gespielt) = wie viele Daten-Ereignisse, und wo stehen die Noten?
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => { selectTrack(3); selectSlot(3, 2); });
await p.waitForTimeout(2600); await p.evaluate(() => historyCheck());
const n0 = await nCur(p);
await p.evaluate(() => { SYNQUENZER.setRecOptions && SYNQUENZER.setRecOptions({len: 1, countIn: 0}); });
const st = await p.evaluate(async () => {
  const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  A.rec(); const s0 = A.runtime().rec; await sl(300);
  for (let i = 0; i < 12; i++) { A.keyOn(60 + (i % 5) * 2); await sl(120); A.keyOff(60 + (i % 5) * 2); await sl(120); if (A.runtime().rec.state === 'off') break; }
  for (let i = 0; i < 60 && A.runtime().rec.state !== 'off'; i++) await sl(200);
  if (A.runtime().rec.state !== 'off') A.rec();
  await sl(300);
  return {s0, end: A.runtime().rec, clip: S.tracks[3].clips[2] ? S.tracks[3].clips[2].notes.length : null};
});
await p.evaluate(() => SYNQUENZER.stop());
await p.waitForTimeout(3000);
const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
console.log(JSON.stringify(st));
console.log('Daten-Ereignisse:', ev.length, JSON.stringify(ev.map(e => Object.assign(short(e), {noteOps: (e.d || []).filter(o => /notes/.test(o.path) || (o.value && o.value.notes)).length}))));
console.log('check', await p.evaluate(() => historyCheck()), errs.slice(0, 3));
await b.close();
