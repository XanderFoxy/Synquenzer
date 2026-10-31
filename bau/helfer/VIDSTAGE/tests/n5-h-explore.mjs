import { launch, installGestures, dataEvents } from './n5-h-lib.mjs';
const {b, p, errs} = await launch();
await installGestures(p);
console.log('hist0', JSON.stringify(await p.evaluate(() => SYNQUENZER.history())));
for (const g of ['clip','clipDel','sound','fx','set','part','kit','song','songChord','track','group','own','mkslot','takesGroup','takes','sel']) {
  const r = await p.evaluate(async g => {
    const u0 = UNDO.length, e0 = HIST.cur ? HIST.cur.strs.length : 0, top0 = UNDO[UNDO.length-1];
    let err = null; try { await window.__G[g](); } catch (e) { err = String(e).slice(0, 120); }
    await new Promise(r => setTimeout(r, 30));
    const evs = HIST.cur.strs.slice(e0).map(s => JSON.parse(s));
    return {g, du: UNDO.length - u0, top: UNDO.length ? UNDO[UNDO.length-1].kind : null, same: UNDO[UNDO.length-1] === top0, err, evs: evs.map(e => e.u + ':' + (e.d ? e.d.length : '-') + ':' + JSON.stringify(e.z).slice(0, 60))};
  }, g);
  console.log(JSON.stringify(r));
}
await p.waitForTimeout(2500);
const ev = await dataEvents(p);
console.log('proj events', ev.filter(e => e.u === 'proj').map(e => JSON.stringify(e).slice(0, 300)));
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))));
console.log('hist', JSON.stringify(await p.evaluate(() => SYNQUENZER.history())));
console.log('errors', JSON.stringify(errs));
await b.close();
