// Keyframe "beim Öffnen": wie viele Projekte/Stücke liegen nach 4 Starts in synq-hist? (Wegwerf-Demo beim Start?)
import { launch } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
const dump = () => p.evaluate(async () => {
  const db = await histDb(); const tx = db.transaction(['m', 'c'], 'readonly');
  const keys = await new Promise(r => { const q = tx.objectStore('m').getAllKeys(); q.onsuccess = () => r(q.result); });
  const ms = await new Promise(r => { const q = tx.objectStore('m').getAll(); q.onsuccess = () => r(q.result); });
  const ck = await new Promise(r => { const q = tx.objectStore('c').getAllKeys(); q.onsuccess = () => r(q.result); });
  return {cur: S.id, projects: (await SYNQUENZER.projects()).map ? (await SYNQUENZER.projects()).map(x => x.id || x) : null, metaKeys: keys, chunks: ck, meta: ms.map(m => ({pid: m.pid, ne: m.ne, nk: m.nk, bytes: m.bytes}))};
});
console.log('Start 1', JSON.stringify(await dump()));
for (let i = 2; i <= 4; i++) { await p.reload(); await p.waitForTimeout(3500); console.log('Start ' + i, JSON.stringify(await dump())); }
console.log(errs.slice(0, 3));
await b.close();
