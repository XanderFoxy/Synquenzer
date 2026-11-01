// VC2a-02 / VL-R1: Kann historyCheck() einen Weg erkennen, der am Rekorder vorbeigeht? (Risiko-Satz der Spec)
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
for (let run = 1; run <= 2; run++) {
  const {b, p, errs} = await launch({mobile: true});
  await p.evaluate(() => historyCheck());
  // (a) Datenänderung ganz ohne Undo-Eintrag und ohne markDirty (simulierter Umweg eines Folgepakets)
  let n0 = await nCur(p);
  const a = await p.evaluate(async () => { S.bpm = 97; S.tracks[1].clips[0].notes[0].n = 77; return await historyCheck({detail: true}); });
  const evA = await since(p, n0);
  // (b) Folgepaket meldet eine Art falsch an (Teilbaum leer) – VL-R1-Fehler
  n0 = await nCur(p);
  const bb = await p.evaluate(async () => { HIST.kinds.set('sound', () => []); const s = SYNQUENZER.getSound(2); s.p.cutoff = 4321; SYNQUENZER.setSound(2, s); await new Promise(r => setTimeout(r, 50)); return await historyCheck({detail: true}); });
  const evB = await since(p, n0);
  console.log('Lauf', run, '(a) Umweg ohne Undo/markDirty: historyCheck', JSON.stringify(a), 'neue Ereignisse', JSON.stringify(evA.map(short)));
  console.log('Lauf', run, '(b) Art mit leerem Teilbaum: historyCheck', JSON.stringify(bb), 'neue Ereignisse', JSON.stringify(evB.map(short)));
  await b.close();
}
