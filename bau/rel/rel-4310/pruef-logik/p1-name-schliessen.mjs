// P1: offene Namens-Eingabe – wird der getippte Name übernommen bei [Fertig], ✕ (Kopf), Tipp außerhalb, Wisch-zu, Ablegen, ✕ an der Leiste?
import {boot, ok, info, inject, sheet, segs, touchDrag, center} from './lib.mjs';
const {b, p, errs} = await boot();
await inject(p, 3);
const R = {};
async function openEdit(name) {
  await sheet(p); await p.waitForTimeout(150);
  await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-ed"]'); await p.waitForTimeout(100);
  await p.tap('.tksheet .g10c-name'); await p.waitForTimeout(60);       // Finger tippt ins Feld (Fokus, Tastatur)
  await p.keyboard.press('Control+A'); await p.keyboard.type(name); await p.waitForTimeout(60);
  const fo = await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('g10c-name'));
  return fo;
}
const nameOf = async () => (await segs(p))[0][1].name || null;
const popOpen = () => p.evaluate(() => !!(UI.pop && UI.pop.name === 'takes'));

// a) [Fertig] (Kontrolle)
let fo = await openEdit('Fertig-Name');
await p.tap('.tksheet button[data-a="g10c-edok"]'); await p.waitForTimeout(120);
R.fertig = await nameOf(); ok(R.fertig === 'Fertig-Name', '[Fertig] übernimmt (Fokus im Feld: ' + fo + ') → ' + R.fertig);
await p.evaluate(() => closePop());

// b) ✕ im Kopf
fo = await openEdit('X-Name');
await p.tap('.tksheet .psh-x'); await p.waitForTimeout(150);
R.x = await nameOf(); ok(!(await popOpen()), '✕ schließt das Blatt'); ok(R.x === 'X-Name', '✕ im Kopf übernimmt den getippten Namen (Fokus ' + fo + ') → ' + JSON.stringify(R.x));

// c) Tipp außerhalb (Rand / Hintergrund)
fo = await openEdit('Aussen-Name');
const box = await p.$eval('.tksheet', e => { const r = e.getBoundingClientRect(); return {l: r.left, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight}; });
const oy = box.b + 8 < box.h ? box.b + (box.h - box.b) / 2 : Math.max(2, box.t / 2);
info('Blatt ' + JSON.stringify(box) + ' → Tipp außerhalb bei y=' + oy);
await p.touchscreen.tap(Math.max(2, box.l / 2), oy); await p.waitForTimeout(150);
R.aussen = await nameOf(); ok(!(await popOpen()), 'Tipp außerhalb schließt das Blatt'); ok(R.aussen === 'Aussen-Name', 'Tipp außerhalb übernimmt den getippten Namen (Fokus ' + fo + ') → ' + JSON.stringify(R.aussen));

// d) Wisch nach unten am Kopf
fo = await openEdit('Wisch-Name');
const [hx, hy] = await center(p, '.tksheet .psh-t');
await touchDrag(p, hx, hy, hx, hy + 140, 10); await p.waitForTimeout(200);
R.wisch = await nameOf(); ok(!(await popOpen()), 'Wisch nach unten schließt das Blatt'); ok(R.wisch === 'Wisch-Name', 'Wisch-zu übernimmt den getippten Namen (Fokus ' + fo + ') → ' + JSON.stringify(R.wisch));

// e) Ablegen (Kontrolle: sheet.dock übernimmt) und dann ✕ an der Leiste
fo = await openEdit('Dock-Name');
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(150);
R.dock = await nameOf(); ok(R.dock === 'Dock-Name', 'Ablegen übernimmt den getippten Namen → ' + JSON.stringify(R.dock));
const st = await p.evaluate(() => ({dock: !!PSH.dock, ed: G10C.ed}));
info('nach Ablegen: ' + JSON.stringify(st));
await p.tap('#pshDock .psh-x'); await p.waitForTimeout(150);
const st2 = await p.evaluate(() => ({dock: !!PSH.dock, ed: G10C.ed, pop: !!UI.pop}));
ok(!st2.dock && st2.ed === -1, '✕ an der Leiste schließt, G10C.ed zurückgesetzt: ' + JSON.stringify(st2));

// f) Vergleich: Undo-Einträge je Weg
const u = await p.evaluate(() => UNDO.slice(-6).map(x => x.label));
info('letzte Undo-Einträge: ' + u.join(' | '));
info('Ergebnis: ' + JSON.stringify(R));
info('Fehler im Browser: ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' / ') : ''));
await b.close();
