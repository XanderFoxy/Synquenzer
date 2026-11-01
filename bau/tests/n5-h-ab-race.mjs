// VC2a-01: Geste nach einer Pause (> 2 s ohne Schreiben) – fängt der Abgleich die Änderung vor dem Ereignis der Geste ab?
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const gest = [
  ['＋ Spur (addTrack)', () => SYNQUENZER.addTrack()],
  ['Undo (API)', () => SYNQUENZER.undo()],
  ['Redo (API)', () => SYNQUENZER.redo()],
  ['Tastatur-Anschlag (setSetting)', () => setSetting('kbVel', S.settings.kbVel === 'pos' ? 'fixed' : 'pos', 'Tastatur-Anschlag')],
  ['Klang setSound', () => { const s = SYNQUENZER.getSound(0); s.p.cutoff = 1234; SYNQUENZER.setSound(0, s); }],
  ['Clip setClip', () => { const c = SYNQUENZER.getClip(0, 0); c.notes[0].v = 0.55; SYNQUENZER.setClip(0, 0, c); }],
  ['Undo (API) 2', () => SYNQUENZER.undo()],
];
const res = [];
for (const [name, fn] of gest) {
  await p.waitForTimeout(3000);
  const n0 = await nCur(p), u0 = await p.evaluate(() => UNDO.length);
  await p.evaluate(`(${fn.toString()})()`);
  await p.waitForTimeout(3000);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  const r = {name, nData: ev.length, ev: ev.map(short)};
  res.push(r); console.log(JSON.stringify(r));
}
console.log('Gesten mit leerem Patch im Gesten-Ereignis + proj davor:', res.filter(r => r.ev.some(e => e.u !== 'proj' && e.ops === 0) && r.ev.some(e => e.u === 'proj')).map(r => r.name));
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), errs.slice(0, 3));
await b.close();
