// TEST-STUB (nur im Testordner werkzeug/kern-test): hält den Export-Vertrag, damit #antworten ohne das echte Muster-Modul geprüft werden kann.
import { kern } from '../../kern.js';
const M = 'muster';
const S5 = [{ wert: 1, text: 'stimmt gar nicht' }, { wert: 2, text: 'stimmt eher nicht' }, { wert: 3, text: 'teils, teils' }, { wert: 4, text: 'stimmt eher' }, { wert: 5, text: 'stimmt genau' }];
const FR = [
  { id: 'd1', gruppe: 'Lust am Nachdenken', frage: 'Ich denke gern lange über eine Frage nach.', art: 'wahl', optionen: S5 },
  { id: 'd2', gruppe: 'Lust am Nachdenken', frage: 'Rätsel ohne klare Lösung reizen mich.', art: 'wahl', optionen: S5 },
  { id: 'd3', gruppe: 'Bauch und Kopf', frage: 'Was mir bei Entscheidungen wichtig ist (in eigenen Worten)', art: 'text' },
  { id: 'd4', gruppe: 'Rhythmus', frage: 'Wann wirst du an freien Tagen wach?', art: 'zeit' },
  { id: 'd5', gruppe: 'Rhythmus', frage: 'Wie viele Stunden schläfst du meistens?', art: 'zahl' }
];
const anz = (f, w) => w == null ? '' : f.optionen ? (f.optionen.find((o) => o.wert === w) || {}).text || String(w) : f.art === 'zahl' ? String(w).replace('.', ',') + ' Stunden' : String(w);
export function antwortListe(k) {
  const a = k.speicher.lies(M, 'antworten', {}), v = k.speicher.lies(M, 'vorher', {});
  return FR.map((f) => ({ ...f, wert: a[f.id] ?? null, anzeige: anz(f, a[f.id]), route: 'muster/fragen', vorher: (v[f.id] || []).map((x) => ({ ...x, anzeige: anz(f, x.wert) })) }));
}
export async function antwortSetzen(k, id, wert) {
  const a = k.speicher.lies(M, 'antworten', {}), v = k.speicher.lies(M, 'vorher', {});
  if (id in a) v[id] = [...(v[id] || []), { wert: a[id], zeit: new Date().toISOString() }].slice(-5);
  if (wert === null) delete a[id]; else a[id] = wert;
  k.speicher.schreib(M, 'vorher', v); k.speicher.schreib(M, 'antworten', a);
  k.speicher.setzeErgebnis(M, { schema: 1, antworten: a });
}
export function muster() { return []; }
export function aeste() { return []; }
export default { id: 'muster', ansicht({ el }) { el.innerHTML = '<h2>Dein Muster (Test-Stub)</h2><p><a href="#antworten/muster">Antworten dazu ändern</a></p>'; } };
