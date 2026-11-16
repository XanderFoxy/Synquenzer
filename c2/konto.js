// Feinschliff – Punkte, Lerntage, Einheiten, Serie (ohne Druck) und Ziel Woche/Monat.
// tage: { 'JJJJ-MM-TT': { p, n, r, e, b: { <bereich>: { p, n, r } } } }   themen: { '<bereich>/<id>': { n, r, t } }
import { speicher, tag, tagPlus, tageZwischen } from './speicher.js';
export const PUNKTE_RICHTIG = 10;
export const SCHONTAGE = 2;   // bis zu 2 freie Tage hintereinander unterbrechen die Serie nicht
export const tage = () => speicher.lies('tage', {});
export const einst = () => speicher.lies('einst', { ziel: { art: 'woche', wert: 5 }, modus: 'ueben' });
export const setzeEinst = (teil) => speicher.schreib('einst', { ...einst(), ...teil });
export function buche({ bereich, thema, richtig, punkte }) {
  const t = tag(), ts = tage(); const d = ts[t] || (ts[t] = { p: 0, n: 0, r: 0, e: 0, b: {} });
  const p = punkte ?? (richtig ? PUNKTE_RICHTIG : 0);
  d.p += p; d.n++; if (richtig) d.r++;
  const b = d.b[bereich] || (d.b[bereich] = { p: 0, n: 0, r: 0 }); b.p += p; b.n++; if (richtig) b.r++;
  speicher.schreib('tage', ts);
  if (thema) speicher.aendere('themen', {}, (th) => { const x = th[thema] || (th[thema] = { n: 0, r: 0 }); x.n++; if (richtig) x.r++; x.t = t; });
  speicher.aendere('summe', { p: 0 }, (s) => { s.p += p; });
  return p;
}
// Punkte ohne Antwort (z. B. Schreiben/Sprechen erledigt, Quiz-Bonus)
export function bonus(bereich, p) {
  const t = tag(), ts = tage(); const d = ts[t] || (ts[t] = { p: 0, n: 0, r: 0, e: 0, b: {} });
  d.p += p; const b = d.b[bereich] || (d.b[bereich] = { p: 0, n: 0, r: 0 }); b.p += p;
  speicher.schreib('tage', ts); speicher.aendere('summe', { p: 0 }, (s) => { s.p += p; });
}
export function einheit() {   // eine abgeschlossene Einheit (Runde, Hörtext, Lesetext, Schreib-/Sprechaufgabe, Quiz-Runde)
  const t = tag(), ts = tage(); const d = ts[t] || (ts[t] = { p: 0, n: 0, r: 0, e: 0, b: {} }); d.e++; speicher.schreib('tage', ts);
}
export const summe = () => speicher.lies('summe', { p: 0 }).p;
export const heutePunkte = () => tage()[tag()]?.p || 0;
// Serie: Lerntage in einer Kette, in der höchstens SCHONTAGE freie Tage am Stück liegen. Nie „verloren“, nur neu begonnen.
export function serie(heute = tag()) {
  const aktiv = Object.keys(tage()).filter((k) => tage()[k].n > 0 || tage()[k].e > 0).sort();
  if (!aktiv.length) return { tage: 0, heute: false, pause: null };
  const letzter = aktiv[aktiv.length - 1]; const luecke = tageZwischen(letzter, heute) - 1;
  if (luecke > SCHONTAGE) return { tage: 0, heute: false, pause: luecke + 1 };
  let n = 1;
  for (let i = aktiv.length - 1; i > 0; i--) { if (tageZwischen(aktiv[i - 1], aktiv[i]) - 1 > SCHONTAGE) break; n++; }
  return { tage: n, heute: letzter === heute, pause: null };
}
// Woche ab Montag, Monat ab dem 1.
export function zeitraum(art, heute = tag()) {
  const [j, m, d] = heute.split('-').map(Number), dt = new Date(j, m - 1, d);
  if (art === 'monat') { const von = tag(new Date(j, m - 1, 1)); return { von, bis: tag(new Date(j, m, 0)) }; }
  const wt = (dt.getDay() + 6) % 7; const von = tagPlus(heute, -wt); return { von, bis: tagPlus(von, 6) };
}
export function zielStand(heute = tag()) {
  const z = einst().ziel, { von, bis } = zeitraum(z.art, heute); let e = 0;
  for (const [k, v] of Object.entries(tage())) if (k >= von && k <= bis) e += v.e || 0;
  return { ...z, erreicht: e, von, bis };
}
export function wocheAktiv(heute = tag()) {
  const { von } = zeitraum('woche', heute);
  return Array.from({ length: 7 }, (_, i) => { const k = tagPlus(von, i); const v = tage()[k]; return { tag: k, aktiv: !!(v && (v.n || v.e)), heute: k === heute }; });
}
