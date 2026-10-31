// Kontext-Ereignisse per echtem Fingertipp: Szenen-Start, Clip-Start, ▶, ■, Hand-Träger (Akkord auf der Tastatur)
import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const tapEl = async (sel, pred) => { const xy = await p.evaluate(([sel, pred]) => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && (!pred || new RegExp(pred).test(x.textContent.replace(/\s+/g, ''))); }); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [sel, pred || null]); if (!xy) return 'nicht gefunden'; await p.touchscreen.tap(xy[0], xy[1]); return 'ok'; };
const steps = [
  ['Szene ▶2', () => tapEl('.scn', '^▶2')],
  ['Clip Synth 2 / Szene 1 (Tipp)', async () => { const xy = await p.evaluate(() => { const r = [...document.querySelectorAll('#clipGrid .slot.filled')].filter(x => x.getBoundingClientRect().width > 50)[2].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.touchscreen.tap(xy[0], xy[1]); return 'ok'; }],
  ['■ (Transport)', () => tapEl('#bPlay')],
  ['▶ (Transport)', () => tapEl('#bPlay')],
  ['Tastatur: 3 Tasten = Akkord (Hand-Träger)', async () => { const ks = await p.evaluate(() => { const kb = document.getElementById('kbArea').getBoundingClientRect(); return [kb.left + kb.width * 0.07, kb.left + kb.width * 0.36, kb.left + kb.width * 0.64].map(x => [x, kb.bottom - 30]); }); const cdp = await p.context().newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: ks.map(([x, y], i) => ({x, y, id: i + 1}))}); await p.waitForTimeout(400); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await cdp.detach(); return 'ok'; }],
  ['ORIGINAL', () => tapEl('#bOrig')],
  ['■ Stopp', () => tapEl('#bPlay')],
];
for (const [name, fn] of steps) {
  const n0 = await nCur(p); const st = await fn(); await p.waitForTimeout(2500);
  console.log(JSON.stringify({name, st, ev: (await since(p, n0)).map(short), carrier: await p.evaluate(() => { try { return document.getElementById('carVal').textContent.trim(); } catch (e) { return String(e).slice(0, 40); } })}));
}
console.log('errs', errs.slice(0, 3));
await b.close();
