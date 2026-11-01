// VC2a-01 mit echten Fingertipps: [＋ Spur]-Taste, ↶, Menü-Einstellung – jeweils nach 3 s Pause
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const tapEl = async (sel, txt) => { const xy = await p.evaluate(([sel, txt]) => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && (!txt || x.textContent.trim().replace(/\s+/g, ' ').includes(txt)); }); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [sel, txt || null]); if (!xy) throw new Error('kein ' + sel + ' ' + txt); await p.touchscreen.tap(xy[0], xy[1]); };
const steps = [
  ['Tipp [＋] (leere Spurzeile = ＋ Spur?)', async () => tapEl('#clipGrid .pk, .addT, button', '＋')],
  ['Tipp ↶', async () => tapEl('#bUndo')],
  ['Tipp ↶ nochmal', async () => tapEl('#bUndo')],
];
for (const [name, fn] of steps) {
  await p.waitForTimeout(3000);
  const n0 = await nCur(p), u0 = await p.evaluate(() => UNDO.length);
  await fn();
  await p.waitForTimeout(3000);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  console.log(JSON.stringify({name, undoDelta: (await p.evaluate(() => UNDO.length)) - u0, nData: ev.length, ev: ev.map(short)}));
}
// Knob-Zug am VA-Regler nach Pause zum Vergleich ist in n5-h-ab-08.mjs
console.log('errs', errs.slice(0, 3));
await b.close();
