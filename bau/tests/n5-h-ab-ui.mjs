// VC2a-01/02 Abnahme mit echten Fingertipps: welche Bedienschritte erzeugen welche Ereignisse?
import { launch, nCur, since, short, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
async function tapSel(sel, txt) {
  const xy = await p.evaluate(([sel, txt]) => {
    const els = [...document.querySelectorAll(sel)].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && (!txt || x.textContent.trim().replace(/\s+/g, ' ').includes(txt)); });
    const e = els[0]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
  }, [sel, txt || null]);
  if (!xy) return false; await p.touchscreen.tap(xy[0], xy[1]); return true;
}
const steps = [
  ['Oktave hoch', '#octUp'], ['Oktave runter', '#octDn'], ['Modus TRANSP', '#segTr'], ['Modus SPIELEN', '#segPlay'],
  ['Metronom', '#bMetro'], ['Metronom zurück', '#bMetro'], ['LATCH', '#bLatch'], ['LATCH zurück', '#bLatch'],
  ['Szenenbank', '.szb'], ['Szenenbank zurück', '.szb'], ['SONG-Ansicht', '.corner'], ['SONG-Ansicht zurück', '.corner'],
  ['Spur 2 wählen', '.th', 'Synth 2'], ['Spur 4 wählen', '.th', 'Synth 4'],
  ['KLANG öffnen', '#bKlang'], ['Reiter FILTER', '#synthSheet button', 'FILTER'], ['Reiter HÜLLK.', '#synthSheet button', 'HÜLLK'], ['Reiter LFO', '#synthSheet button', 'LFO'], ['Reiter OSZ', '#synthSheet button', 'OSZ'],
  ['Editor schließen', '#synthSheet button', '✕'],
  ['Szene 2 starten', '.scn', '2'], ['Stopp', '#bPlay'], ['Clip tippen', '.cell.has, .cell.clip, .cl'],
  ['Mute M', '#bMute'], ['Mute zurück', '#bMute'], ['Audio folgt', '#bFolgt'], ['Audio folgt zurück', '#bFolgt'],
  ['Undo', '#bUndo'],
  ['AKKORD-Modus', '#bHMode'], ['ORIGINAL', '#bOrig'],
];
const res = [];
for (const [name, sel, txt] of steps) {
  const n0 = await nCur(p);
  const ok = await tapSel(sel, txt);
  await p.waitForTimeout(2400);
  const ev = await since(p, n0);
  const r = {name, tapped: ok, ev: ev.map(short)};
  res.push(r); console.log(JSON.stringify(r));
}
await p.evaluate(() => { try { closeEditor(); } catch (e) {} });
console.log('check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))));
console.log('errs', JSON.stringify(errs.slice(0, 5)));
await b.close();
