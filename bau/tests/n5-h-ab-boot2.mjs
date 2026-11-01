// Mit gespeichertem Projekt: entstehen bei jedem Start Verlauf-Stücke für Projekte, die es nicht gibt?
import { launch } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
const dump = () => p.evaluate(async () => {
  const db = await histDb(); const tx = db.transaction(['m', 'c'], 'readonly');
  const ck = await new Promise(r => { const q = tx.objectStore('c').getAllKeys(); q.onsuccess = () => r(q.result); });
  const ps = await SYNQUENZER.projects();
  return {cur: S.id, name: S.name, projects: (ps.list || ps).map(x => x.id + ':' + x.name), chunks: ck};
});
await p.evaluate(async () => { const c = SYNQUENZER.getClip(1, 0); c.notes[0].v = .33; SYNQUENZER.setClip(1, 0, c); await new Promise(r => setTimeout(r, 300)); saveNow && saveNow(); });
await p.waitForTimeout(3000);
console.log('Start 1', JSON.stringify(await dump()));
for (let i = 2; i <= 4; i++) { await p.reload(); await p.waitForTimeout(3500); console.log('Start ' + i, JSON.stringify(await dump())); }
console.log(errs.slice(0, 3));
await b.close();
