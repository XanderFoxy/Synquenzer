// Feld z (Ziel) und l (Beschriftung) je Art: Teil, Song, Kontext-Clip, Abgleich
import { launch, nCur, since } from './n5-h-ab-lib.mjs';
for (let run = 1; run <= 2; run++) {
  const {b, p, errs} = await launch({mobile: true});
  await p.evaluate(() => historyCheck());
  const n0 = await nCur(p);
  await p.evaluate(async () => { const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    A.setPart(3, {name: 'Refrain'}); await sl(50); songSetChord(2, 'Am'); await sl(50); A.launchClip(1, 1); await sl(50); A.setMute(2, true); await sl(2500); A.stop(); });
  await p.waitForTimeout(2600);
  console.log('Lauf ' + run, JSON.stringify((await since(p, n0)).map(e => ({u: e.u, z: e.z, l: e.l, d0: e.d && e.d[0] && e.d[0].path}))));
  await b.close();
}
