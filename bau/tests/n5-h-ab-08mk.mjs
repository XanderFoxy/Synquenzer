// VC2a-08 Abnahme: MS-2000-Platte – 2-s-Reglerzug per Touch an mehreren Reglern
import { launch, touchDrag, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await p.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 10000});
await p.waitForTimeout(2800); await p.evaluate(() => historyCheck());
for (const id of ['f.cut', 'f.res', 'mix.o2', 'a.pan']) {
  for (const dir of [1, -1]) {
    const e = await p.evaluate(id => SYNQUENZER.mkPanel().elements.find(e => e.id === id), id);
    const x = e.px.x + e.px.w / 2, y = e.px.y + e.px.h / 2;
    const n0 = await nCur(p), v0 = e.val;
    const d = await touchDrag(p, x, y, t => [x, y - dir * (50 * t + 10 * Math.sin(t * 4 * Math.PI))], 2000);
    await p.waitForTimeout(2800);
    const v1 = await p.evaluate(id => SYNQUENZER.mkPanel().elements.find(e => e.id === id).val, id);
    const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
    console.log(JSON.stringify({id, dir, v0, v1, moves: d.n, ms: d.ms, nData: ev.length, events: ev.map(short)}));
  }
}
console.log('check', await p.evaluate(() => historyCheck()), 'errs', errs.slice(0, 3));
await b.close();
