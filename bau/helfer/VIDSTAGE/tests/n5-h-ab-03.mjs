// VC2a-03 Abnahme: 450 Ereignisse (gemischt: Klang, Clip, Kontext Szene/Clip-Start, Undo) -> >= 3 Keyframes mit format + appVersion
import { launch } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  let k = 0;
  while (A.history().events < 450) {
    k++;
    const m = k % 5;
    if (m === 0) { const s = A.getSound(k % 4); s.p.cutoff = 300 + k; A.setSound(k % 4, s); }
    else if (m === 1) { const c = A.getClip(1, 0); c.notes[k % c.notes.length].v = 0.2 + (k % 8) / 10; A.setClip(1, 0, c); }
    else if (m === 2) A.launchScene(k % 2);
    else if (m === 3) A.launchClip ? A.launchClip(0, k % 2) : A.launchScene(0);
    else A.undo();
    await sl(5);
  }
  A.stop(); await sl(2600);
  const kfs = []; await histWalk((K, kk) => { kfs.push({w: kk.w, at: kk.at, format: K.format, appVersion: K.appVersion, tracks: K.p && K.p.tracks && K.p.tracks.length, name: K.p && K.p.name}); });
  return {h: A.history(), kfs, check: await historyCheck({detail: true})};
});
console.log(JSON.stringify(r));
console.log('errs', errs.slice(0, 3));
await b.close();
