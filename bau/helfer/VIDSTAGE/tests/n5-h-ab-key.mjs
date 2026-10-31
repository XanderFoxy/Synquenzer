// VC2a-01: Noten-Geste, die die automatische Tonart ändert -> wie viele Daten-Ereignisse? (eine Geste = ein Ereignis)
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const keys = () => p.evaluate(() => S.tracks.map((t, i) => i + ':' + t.clips.slice(0, 2).map(c => c ? (c.key ? c.key.root + c.key.scale.slice(0, 3) : '-') : '.').join(' ')).join(' | '));
console.log('vorher', await keys());
const sets = [[66, 68, 70, 71, 73, 75, 77, 78], [61, 63, 65, 66, 68, 70, 72, 73], [60, 62, 64, 65, 67, 69, 71, 72]];
for (const ns of sets) {
  for (const t of [1, 2]) {
    const n0 = await nCur(p), u0 = await p.evaluate(() => UNDO.length);
    await p.evaluate(([ns, t]) => { const c = SYNQUENZER.getClip(t, 0); c.notes = ns.map((n, i) => ({t: i * 0.5, d: 0.4, n, v: 0.8})); SYNQUENZER.setClip(t, 0, c); }, [ns, t]);
    await p.waitForTimeout(3000);
    const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
    console.log(JSON.stringify({t, ns: ns.slice(0, 3), undoEntries: (await p.evaluate(() => UNDO.length)) - u0, nData: ev.length, ev: ev.map(short)}), await keys());
  }
}
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), errs.slice(0, 3));
await b.close();
