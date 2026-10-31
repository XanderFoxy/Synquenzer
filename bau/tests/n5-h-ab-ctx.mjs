// Kontext-Ereignisse: Song-Wiedergabe (automatische Szenenwechsel), Teil-Wiedergabe, Hand-Träger per Akkord-Taste, Clip-Tipp
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
let n0 = await nCur(p);
await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}, {scene: 0, bars: 1}, {scene: 1, bars: 1}]); SYNQUENZER.setBpm(240); });
await p.waitForTimeout(2600);
n0 = await nCur(p);
await p.evaluate(() => { SYNQUENZER.songPlay ? SYNQUENZER.songPlay() : SYNQUENZER.play(); });
await p.waitForTimeout(12000);
await p.evaluate(() => SYNQUENZER.stop());
await p.waitForTimeout(2600);
const ev = await since(p, n0);
console.log('Song 12 s:', ev.length, 'Ereignisse', JSON.stringify(ev.map(e => e.u === 'ctx' ? 'ctx:' + e.z.c : e.u + ':' + (e.z && e.z.p)).reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {})));
console.log('pos', JSON.stringify(await p.evaluate(() => SYNQUENZER.runtime().song)));
console.log('check', await p.evaluate(() => historyCheck()), errs.slice(0, 3));
await b.close();
