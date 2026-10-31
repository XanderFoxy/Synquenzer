// VC2a-fix: welche Änderung an tracks/0 kommt ohne markDirty? (Fehlersuche)
import { launch, installGestures } from './n5-h-lib.mjs';
const {b, p, errs} = await launch();
await installGestures(p);
await p.evaluate(() => window.__setup());
await p.waitForTimeout(2600);
console.log('nach setup', JSON.stringify(await p.evaluate(async () => { const r = await historyCheck({detail: true}); return {r, last: JSON.parse(HIST.cur.strs[HIST.cur.strs.length - 1])}; })).slice(0, 1500));
for (const g of (process.env.G || 'mkin,mkslot,clip,sound').split(',')) {
  const r = await p.evaluate(async g => { const s0 = HIST.stray.length; await window.__G[g](); await new Promise(r => setTimeout(r, 2600)); const n0 = HIST.cur.strs.length; const c = await historyCheck({detail: true}); return {g, stray: HIST.stray.slice(s0), ev: HIST.cur.strs.slice(n0).map(s => JSON.parse(s)).filter(e => e.u === 'proj')}; }, g);
  console.log(JSON.stringify(r).slice(0, 1500));
}
await b.close();
