// PINSEL E: alte Funktionen unverändert (Regel 28) – dieselben Aktionen in R-4261 und im PINSEL-Stand, Clip-Ergebnis gleich
import {open, ok, sleep, clipRoll, notes, xy, failed} from './lib.mjs';
import path from 'path';
import {HERE} from './lib.mjs';
const BASE = path.resolve(HERE, '..', '..', '..', '..', 'snapshots', 'R-4300.html'), NEW = path.resolve(HERE, '..', '..', 'index.html');   // DOPPEL: Basis R-4300, Pfade aus tests/alt-pinsel
const mk = a => a.map(([t, d, n]) => ({t, d, n, v: .8}));
const CL = mk([[0, .5, 57], [.5, .5, 60], [1, .5, 64], [2, .5, 62], [2.5, .5, 66], [3, 1, 60]]);
const BTN = ['▲ Stufe', '▼ Stufe', '+12', '−12', 'Spiegeln', 'Umdrehen', 'Legato', 'Dupl.', 'Takte +', 'Takte −'];
async function runAll(file) {
  process.env.APP = file;
  const {open: op} = await import('./lib.mjs?' + encodeURIComponent(file));
  const H = await op(428, 926), out = {};
  for (const b of BTN) { await clipRoll(H, CL, {root: 9, scale: 'aeolian'}); await H.tapBtn('.pr-bar button', b); await sleep(100); out[b] = await notes(H); }
  // Teilen / Verbinden mit Auswahl
  await clipRoll(H, CL, {root: 9, scale: 'aeolian'}); await H.E(() => window.SYNQUENZER.rollApi().selectIdx([2])); await H.tapBtn('.pr-bar button', 'Teilen'); out.teilen = await notes(H);
  await clipRoll(H, CL, {root: 9, scale: 'aeolian'}); await H.E(() => window.SYNQUENZER.rollApi().selectIdx([0, 1])); await H.tapBtn('.pr-bar button', 'Verbinden'); out.verbinden = await notes(H);
  // ✎ tippen = Note, Note ziehen = verschieben, ⌫ wischen = löschen
  await clipRoll(H, CL, {root: 9, scale: 'aeolian'});
  let p = await xy(H, 3.6, 69); await H.tap(p.x, p.y, 200); out.zeichnen = await notes(H);
  p = await xy(H, 1.2, 64); const q = await xy(H, 1.7, 67); await H.stroke([[p.x, p.y], [q.x, q.y]], 8, 16); out.ziehen = await notes(H);
  await H.tapBtn('.pr-bar button', '⌫'); p = await xy(H, .1, 57); const r = await xy(H, .6, 60); await H.stroke([[p.x, p.y], [r.x, r.y]], 8, 16); out.radieren = await notes(H);
  out.undo = await H.E(() => window.SYNQUENZER.gestures().undo);
  out.errs = H.errs.filter(x => !/AudioContext|autoplay/i.test(x));
  await H.b.close();
  return out;
}
const A = await runAll(BASE), B = await runAll(NEW);
for (const k of Object.keys(A)) if (k !== 'errs') ok(JSON.stringify(A[k]) === JSON.stringify(B[k]), `alt = neu: ${k}`);
const base = JSON.stringify(CL.map(n => ({t: n.t, d: n.d, n: n.n, v: n.v})));
{ const same = Object.keys(A).filter(k => Array.isArray(A[k]) && k !== 'errs' && JSON.stringify(A[k]) === base); ok(same.every(k => k === 'Takte +' || k === 'Takte −'), 'alle Noten-Aktionen ändern den Clip wirklich (Test greift; nur die Länge ändern: ' + same.join(', ') + ')'); }
ok(!B.errs.length, 'keine Konsolenfehler (neu)');
process.exit(failed() ? 1 : 0);
