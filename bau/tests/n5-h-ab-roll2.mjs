// VC2a-01 Abnahme mit echten Fingertipps im Piano-Roll: jede Noten-Geste = genau 1 Daten-Ereignis?
import { launch, nCur, since, short, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const c = async sel => p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
let xy = await c('#bEdit'); await p.touchscreen.tap(xy[0], xy[1]); await p.waitForTimeout(2800);
const taps = [[324, 0], [236, 2], [434, 4], [390, 6], [280, 8], [324, 10]];
const res = [];
for (const [y, k] of taps) {
  const n0 = await nCur(p), u0 = await p.evaluate(() => UNDO.length);
  await p.touchscreen.tap(40 + 11 + k * 21.9, y);
  await p.waitForTimeout(3000);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  const r = {tap: [y, k], undoNeu: (await p.evaluate(() => UNDO.length)) - u0, nData: ev.length, ev: ev.map(short), key: await p.evaluate(() => JSON.stringify(S.tracks[3].clips[0].key)), notes: await p.evaluate(() => S.tracks[3].clips[0].notes.length)};
  res.push(r); console.log(JSON.stringify(r));
}
// Undo im Editor (↶) – Ereignisse?
for (let i = 0; i < 2; i++) {
  const n0 = await nCur(p);
  await p.evaluate(() => undo()); await p.waitForTimeout(3000);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  console.log('undo', JSON.stringify({nData: ev.length, ev: ev.map(short)}));
}
console.log('Gesten mit >1 Daten-Ereignis:', res.filter(r => r.nData > 1).length, 'von', res.length);
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), errs.slice(0, 3));
await b.close();
