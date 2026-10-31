// QA VC2a-06 extra: IndexedDB open for synq-hist never answers (hangs) -> app normal? menu? "Als Datei sichern" with [mit Verlauf]?
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1', {wait: 2500, init: () => {
  const o = IDBFactory.prototype.open;
  IDBFactory.prototype.open = function (n, v) { if (n === 'synq-hist') { return {set onsuccess(f) {}, set onerror(f) {}, set onblocked(f) {}, set onupgradeneeded(f) {}}; } return o.call(this, n, v); };
}});
const E = (f, a) => p.evaluate(f, a);
await E(() => { const Q = SYNQUENZER; for (let i = 0; i < 4; i++) Q.setClip(1, i, {len: 1, notes: [{n: 60 + i, t: 0, d: 1, v: .8}]}); });
await sleep(2600);
console.log('history()', JSON.stringify(await E(() => SYNQUENZER.history())));
await E(() => openMenu()); await sleep(400);
console.log('menu rows', JSON.stringify(await E(() => [...document.querySelectorAll('#menu .mrow, #menu .small')].map(e => e.textContent.trim()).filter(t => /Verlauf/.test(t)))));
await E(() => closeMenu());
const t0 = Date.now();
const r1 = await Promise.race([E(() => historyCheck()).then(x => 'historyCheck ' + x), sleep(5000).then(() => 'historyCheck hängt > 5 s')]);
console.log(r1);
await E(() => { UI.histFile = true; });
const r2 = await Promise.race([E(async () => { const o = await histFileAdd(projectFileObj(S, false, true)); return 'histFileAdd fertig, history ' + !!o.history; }), sleep(6000).then(() => 'histFileAdd (Als Datei sichern, mit Verlauf) hängt > 6 s')]);
console.log(r2);
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
