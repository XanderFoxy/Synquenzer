// M5 training – Rechnen ohne DOM (in Node testbar): Datum, Tagesvorschlag aus Profil, Tagebuch (zuletzt, Woche), Gefühl je Übung,
// „vorher“-Liste für geänderte Antworten, Pläne, Kalender-Datei. Keine Serien, keine Zähler als Leistung.
// Eingaben kommen immer als Daten herein (kein Zugriff auf kern oder localStorage). Datum immer als lokales 'JJJJ-MM-TT'.
import { UEBUNGEN, UEBUNG, GRUPPE, RICHTUNG_UEBUNGEN, PROFIL_REGELN, BEREICH_NAME, POL_WORT } from './uebungen.js';

// ---------- Datum (lokal, nicht UTC) ----------
const zwei = (n) => String(n).padStart(2, '0');
export function tagText(d = new Date()) { return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`; }
export function ausText(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d, 12); }   // Mittag: sicher gegen Zeitumstellung
export function plusTage(s, n) { const d = ausText(s); d.setDate(d.getDate() + n); return tagText(d); }
export function abstand(a, b) { return Math.round((ausText(b) - ausText(a)) / 864e5); }                              // b − a in Tagen
export function wochentag(s) { return (ausText(s).getDay() + 6) % 7; }                                                 // 0 = Montag
export function montag(s) { return plusTage(s, -wochentag(s)); }
export function isoWoche(s) {
  const d = ausText(s); const t = new Date(d); t.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));   // Donnerstag derselben Woche
  const j = t.getFullYear(), erster = new Date(j, 0, 4, 12);
  const nr = 1 + Math.round(((t - erster) / 864e5 - 3 + ((erster.getDay() + 6) % 7)) / 7);
  return `${j}-W${zwei(nr)}`;
}
export const WT_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const WT_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const WT_ICS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
export function datumKurz(s) { const d = ausText(s); return `${d.getDate()}.${d.getMonth() + 1}.`; }
export function datumLang(s) { return `${WT_LANG[wochentag(s)]}, ${datumKurz(s)}`; }
export function uhrzeit(d = new Date()) { return `${zwei(d.getHours())}:${zwei(d.getMinutes())}`; }

// ---------- kleine Helfer ----------
export function hash01(text) {   // FNV-1a → [0, 1): gleicher Tag + gleiche Übung = gleicher Wert (stabiler Vorschlag über den Tag)
  let h = 0x811c9dc5; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h / 4294967296;
}
const eintraege = (tage, s) => (tage && Array.isArray(tage[s]) ? tage[s] : []);
export function heuteGemacht(tage, s, id) { return eintraege(tage, s).filter((e) => e.id === id).length; }
// Bewertungen je Übung über alle Tage: { id: { n, gut: [Anzahl 0, 1, 2], zuletzt } }
export function bewertungen(tage) {
  const r = {};
  for (const [s, l] of Object.entries(tage || {})) for (const e of l || []) {
    const x = r[e.id] || (r[e.id] = { n: 0, gut: [0, 0, 0], zuletzt: null });
    x.n++; if (e.gut === 0 || e.gut === 1 || e.gut === 2) x.gut[e.gut]++; if (!x.zuletzt || s > x.zuletzt) x.zuletzt = s;
  }
  return r;
}
// Alte Tage abschneiden (Speicher klein halten): behält die letzten `max` Tage.
export function kuerze(tage, heute, max = 400) {
  const r = {}; for (const [s, l] of Object.entries(tage || {})) if (abstand(s, heute) < max && Array.isArray(l) && l.length) r[s] = l; return r;
}

// ---------- Profil lesen (Ergebnisse aus M1, M2, M4 – nur bekannte Schemata) ----------
export function profilAus({ bigfive = null, rhythmus = null, wachstum = null, alter = null } = {}) {
  const bf = bigfive && bigfive.schema === 1 && bigfive.bereiche && typeof bigfive.bereiche === 'object' ? bigfive : null;
  const rh = rhythmus && rhythmus.schema === 1 && rhythmus.typ ? rhythmus : null;
  const w = wachstum && wachstum.schema === 1 && wachstum.id ? wachstum : null;
  return { bigfive: bf, rhythmus: rh, wachstum: w, alter };
}
const uhrText = (h) => { if (h == null || isNaN(h)) return '–'; let m = Math.round((((h % 24) + 24) % 24) * 12) * 5; m %= 1440; return `${Math.floor(m / 60)}:${zwei(m % 60)}`; };
export { uhrText };

// Gründe aus dem Profil: { uebungId: [{ text, stufe, quellen, gewicht, art }] }. Zeigt das Profil in keine Richtung („beides
// gehört zu dir“) → kein Grund (gegen Barnum-Sätze). Texte nur in Worten: Richtung mit zwei gleichwertigen Polen, keine Zahl, kein Vergleich.
export function profilGruende(profil) {
  const G = {}; const add = (id, g) => { if (!UEBUNG[id]) return; (G[id] || (G[id] = [])).push(g); };
  const bf = profil && profil.bigfive;
  if (bf) for (const r of PROFIL_REGELN) {
    const b = bf.bereiche[r.bereich]; if (!b || typeof b.stufe !== 'number' || !b.stufe) continue;
    if (Math.sign(b.stufe) !== r.seite) continue;
    const unsicher = !(b.klar === r.seite);
    const pol = (POL_WORT[r.bereich] || {})[r.seite] || BEREICH_NAME[r.bereich];
    const lage = `Dein Profil zeigt ${Math.abs(b.stufe) >= 2 && !unsicher ? 'klar' : 'leicht'} in Richtung „${pol}“ (${BEREICH_NAME[r.bereich]}).`;
    const gewicht = (Math.abs(b.stufe) >= 2 ? 2 : 1.5) * (unsicher ? 0.8 : 1);
    for (const id of r.uebungen) add(id, { text: `${lage} ${r.grund}`, stufe: r.stufe, quellen: r.quellen, gewicht, art: 'profil' });
  }
  const rh = profil && profil.rhythmus;
  if (rh) {
    const jl = Number(rh.sozialerJetlag);
    if (jl >= 2) for (const id of ['h-aufstehen', 'h-morgenlicht', 'h-abendlicht'])
      add(id, { text: 'An freien Tagen schläfst du deutlich später als an Tagen mit fester Zeit („sozialer Jetlag“). Das hängt in Studien mit schlechterem Schlaf und Befinden zusammen; regelmäßigere Zeiten und Morgenlicht setzen genau dort an.', stufe: 'abgeleitet', quellen: ['wittmann2006', 'blume2019'], gewicht: 1.6, art: 'rhythmus' });
    if (rh.typ === 'spaet' || rh.typ === 'eher-spaet') for (const id of ['h-morgenlicht', 'h-abendlicht'])
      add(id, { text: 'Du bist eher ein Abendtyp. Licht am Morgen und weniger helles Licht am Abend stellen die innere Uhr etwas früher.', stufe: 'abgeleitet', quellen: ['blume2019', 'wright2013'], gewicht: 1.4, art: 'rhythmus' });
    if (rh.typ === 'frueh' || rh.typ === 'eher-frueh') add('f-wichtigstes', { text: 'Du bist eher ein Morgentyp: Leg das Wichtigste in den Vormittag.', stufe: 'abgeleitet', quellen: ['schmidt2007'], gewicht: 1.2, art: 'rhythmus' });
    if (Array.isArray(rh.hinweise) && rh.hinweise.includes('kurz-geschlafen')) for (const id of ['h-koffein', 'h-abendlicht'])
      add(id, { text: 'Laut deinen Angaben ist dein Schlaf an Tagen mit fester Zeit eher kurz. Weniger spätes Koffein und gedämpftes Abendlicht können beim Einschlafen helfen.', stufe: 'abgeleitet', quellen: ['gardiner2023', 'chang2015'], gewicht: 1.4, art: 'rhythmus' });
    if (rh.fokus && rh.fokus.von != null) add('f-fenster', { text: `Dein Fokus-Fenster liegt etwa bei ${uhrText(rh.fokus.von)} bis ${uhrText(rh.fokus.bis)} Uhr (aus deinem Tagesrhythmus).`, stufe: 'abgeleitet', quellen: ['schmidt2007'], gewicht: 1.3, art: 'rhythmus' });
  }
  const w = profil && profil.wachstum;
  if (w) for (const id of RICHTUNG_UEBUNGEN[w.id] || [])
    add(id, { text: `Passt zu deiner gewählten Richtung „${w.titel || w.id}“.`, stufe: 'idee', quellen: [], gewicht: 2, art: 'wachstum' });
  return G;
}

// ---------- Tagesvorschlag ----------
// o: { tage, datum, schwerpunkt ('gemischt' | Gruppen-ID), zeit (0 = egal, sonst Höchstdauer), wechsel (Zahl), weg (heute übersprungene IDs), profil }
// Rückgabe: { haupt, weitere: [2], gruende: [{text, stufe, quellen}], gewicht: {id: Zahl} } – gewicht ist nur die interne Reihenfolge.
export function vorschlag({ tage = {}, datum, schwerpunkt = 'gemischt', zeit = 0, wechsel = 0, weg = [], profil = null, uebungen = UEBUNGEN } = {}) {
  const G = profilGruende(profil), B = bewertungen(tage);
  const sp = GRUPPE[schwerpunkt] ? schwerpunkt : 'gemischt';
  const kandidaten = uebungen.filter((u) => !zeit || u.dauer <= zeit);
  const pool = kandidaten.length ? kandidaten : uebungen;
  const punkte = {};   // interne Reihenfolge der Vorschläge, wird nie angezeigt
  for (const u of pool) {
    let p = 1;
    if (sp !== 'gemischt' && u.gruppe === sp) p += 4;
    for (const g of G[u.id] || []) p += g.gewicht;
    const b = B[u.id];
    if (b) { p += Math.min(1.6, 0.8 * b.gut[2]) - Math.min(5, 2.5 * b.gut[0]); }
    if (heuteGemacht(tage, datum, u.id)) p -= 8;                                     // heute schon gemacht → nach hinten
    else for (const n of [1, 2]) if (heuteGemacht(tage, plusTage(datum, -n), u.id)) { p -= 1.5; break; }   // Abwechslung
    if (weg.includes(u.id)) p -= 6;                                                  // „Anderer Vorschlag“ gedrückt
    p += hash01(`${datum}|${u.id}|${wechsel}`) * 1.2;
    punkte[u.id] = p;
  }
  const sortiert = [...pool].sort((a, b) => punkte[b.id] - punkte[a.id] || (a.id < b.id ? -1 : 1));
  const haupt = sortiert[0] || null;
  const weitere = [];
  const nimm = (bed) => { const u = sortiert.find((x) => x !== haupt && !weitere.includes(x) && bed(x)); if (u) weitere.push(u); };
  if (haupt) {
    if (sp !== 'gemischt') { nimm((x) => x.gruppe === sp); nimm((x) => x.gruppe !== sp); }
    else { nimm((x) => x.gruppe !== haupt.gruppe); nimm((x) => x.gruppe !== haupt.gruppe && x.gruppe !== (weitere[0] && weitere[0].gruppe)); }
    while (weitere.length < 2 && weitere.length < sortiert.length - 1) nimm(() => true);
  }
  const gruende = [];
  if (haupt) {
    if (sp !== 'gemischt' && haupt.gruppe === sp) gruende.push({ text: `Du hast „${GRUPPE[sp].titel}“ als Schwerpunkt gewählt.`, stufe: null, quellen: [] });
    const eigene = [...(G[haupt.id] || [])].sort((a, b) => b.gewicht - a.gewicht).slice(0, 2);
    for (const g of eigene) gruende.push({ text: g.text, stufe: g.stufe, quellen: g.quellen });
    const b = B[haupt.id]; if (b && b.gut[2]) gruende.push({ text: 'Hat dir schon gutgetan.', stufe: null, quellen: [] });
    if (!gruende.length) gruende.push({ text: 'Jeden Tag kommt ein anderer Vorschlag aus allen Bereichen.', stufe: null, quellen: [] });
  }
  return { haupt, weitere, gruende, gewicht: punkte };
}

// ---------- Herausforderungen zur Wachstums-Richtung (M4 passt.wachstum.aufgaben) ----------
export const hfId = (richtung, i) => `hf-${richtung}-${i}`;
export function herausforderungen(wachstum) {
  if (!wachstum || !Array.isArray(wachstum.aufgaben)) return [];
  return wachstum.aufgaben.filter((t) => typeof t === 'string' && t.trim()).map((text, i) => ({ id: hfId(wachstum.id, i), i, text }));
}
// Heute: ist heute schon eine gemacht, bleibt sie stehen (mit Haken). Sonst rotiert sie täglich und bevorzugt eine, die in den
// letzten 6 Tagen noch nicht gemacht wurde.
export function herausforderungHeute(wachstum, tage, datum, wechsel = 0) {
  const H = herausforderungen(wachstum); if (!H.length) return null;
  const heute = eintraege(tage, datum).map((e) => e.id); for (let i = heute.length - 1; i >= 0; i--) { const h = H.find((x) => x.id === heute[i]); if (h) return h; }
  const start = (Math.abs(abstand('2026-01-05', datum)) + wechsel) % H.length;
  const kuerzlich = new Set(); for (let n = 1; n < 7; n++) for (const e of eintraege(tage, plusTage(datum, -n))) kuerzlich.add(e.id);
  for (let k = 0; k < H.length; k++) { const h = H[(start + k) % H.length]; if (!kuerzlich.has(h.id)) return h; }
  return H[start];
}

// ---------- Tagebuch: zuletzt gemacht ----------
// Die zuletzt gemachten Übungen (jede nur einmal), neueste zuerst: [{ id, datum, text }]. Ein Verlauf für dich, kein Zähler.
export function zuletzt(tage, datum, n = 4, tageZurueck = 60) {
  const r = [], gesehen = new Set();
  for (let k = 0; k <= tageZurueck && r.length < n; k++) {
    const s = plusTage(datum, -k), l = eintraege(tage, s);
    for (let i = l.length - 1; i >= 0 && r.length < n; i--) { const e = l[i]; if (!e || gesehen.has(e.id)) continue; gesehen.add(e.id); r.push({ id: e.id, datum: s, text: e.text || null }); }
  }
  return r;
}
export function tagWort(s, heute) { const a = abstand(s, heute); return a === 0 ? 'heute' : a === 1 ? 'gestern' : datumLang(s); }

// ---------- Gefühl je Übung („Wie war das für dich?“) ----------
// Die Antwort je Übung ist der jüngste Eintrag mit Gefühl – oder, wenn es keinen gibt, der jüngste Eintrag überhaupt.
// Rückgabe { datum, i, gut } oder null. Genau diesen Eintrag ändert antwortSetzen; das Muster liest dasselbe.
export function gefuehlEintrag(tage, id) {
  let jung = null;
  for (const s of Object.keys(tage || {}).sort().reverse()) {
    const l = eintraege(tage, s);
    for (let i = l.length - 1; i >= 0; i--) if (l[i] && l[i].id === id) {
      const g = l[i].gut; if (g === 0 || g === 1 || g === 2) return { datum: s, i, gut: g };
      if (!jung) jung = { datum: s, i, gut: null };
    }
  }
  return jung;
}
export function gemachteIds(tage) { const r = new Set(); for (const l of Object.values(tage || {})) for (const e of Array.isArray(l) ? l : []) if (e && e.id) r.add(e.id); return [...r]; }
export function gruppeVon(id) { return UEBUNG[id] ? UEBUNG[id].gruppe : String(id).startsWith('hf-') ? 'wachsen' : null; }

// ---------- „vorher“: frühere Antworten (höchstens 5 je Frage, neueste zuerst) ----------
export function mitVorher(vorher, id, alt, neuWert, zeit = new Date().toISOString(), max = 5) {
  const v = vorher && typeof vorher === 'object' ? { ...vorher } : {};
  if (!alt || alt.wert == null || alt.wert === neuWert) return v;
  v[id] = [{ wert: alt.wert, anzeige: String(alt.anzeige || ''), zeit }, ...(Array.isArray(v[id]) ? v[id] : [])].slice(0, max);
  const ids = Object.keys(v); if (ids.length > 300) for (const k of ids.slice(0, ids.length - 300)) delete v[k];   // Speicher klein halten
  return v;
}

// ---------- Wochenrückblick (Montag bis Sonntag) ----------
// versatz 0 = diese Woche, -1 = letzte Woche … Rückgabe ohne DOM, Texte erst in modul.js. Ein Tagebuch: was wann gemacht wurde
// und wie es sich angefühlt hat – keine Tages-Zählung, kein Vergleich mit der Vorwoche.
export function woche(tage, datum, versatz = 0, plaene = []) {
  const mo = plusTage(montag(datum), 7 * versatz), so = plusTage(mo, 6);
  const tageListe = []; let anzahl = 0;
  const je = {}; const gruppen = {};
  for (let k = 0; k < 7; k++) {
    const s = plusTage(mo, k), l = eintraege(tage, s), zukunft = s > datum;
    tageListe.push({ datum: s, wt: WT_KURZ[k], eintraege: l, zukunft });
    for (const e of l) {
      anzahl++;
      const x = je[e.id] || (je[e.id] = { id: e.id, n: 0, gut: [0, 0, 0], text: e.text || null });
      x.n++; if (e.gut === 0 || e.gut === 1 || e.gut === 2) x.gut[e.gut]++;
      const g = UEBUNG[e.id] ? UEBUNG[e.id].gruppe : (String(e.id).startsWith('hf-') ? 'wachsen' : null);
      if (g) gruppen[g] = (gruppen[g] || 0) + 1;
    }
  }
  const liste = Object.values(je);
  const sort = (a, b) => b.n - a.n || (a.id < b.id ? -1 : 1);
  const plaeneWoche = (plaene || []).filter((p) => !p.aus).map((p) => ({ id: p.id, art: p.art, text: planText(p), tage: (p.haken || []).filter((h) => h >= mo && h <= so).sort().map((h) => WT_KURZ[wochentag(h)]) }));
  return {
    von: mo, bis: so, schluessel: isoWoche(mo), tage: tageListe, anzahl,
    gutgetan: liste.filter((x) => x.gut[2] > 0).sort((a, b) => b.gut[2] - a.gut[2] || sort(a, b)),
    gehtSo: liste.filter((x) => x.gut[1] > 0 && !x.gut[2]).sort(sort),
    eherNicht: liste.filter((x) => x.gut[0] > 0).sort((a, b) => b.gut[0] - a.gut[0] || sort(a, b)),
    unbewertet: liste.filter((x) => x.gut[0] + x.gut[1] + x.gut[2] < x.n).length,
    gruppen, plaene: plaeneWoche, aktuell: versatz === 0
  };
}

// ---------- Pläne (WOOP, Wenn-dann, Gewohnheit) ----------
export const PLAN_ART = { woop: 'WOOP-Ziel', wenndann: 'Wenn-dann-Plan', gewohnheit: 'Gewohnheit' };
export function fuelle(vorlage, felder) { return String(vorlage || '').replace(/\{(\w+)\}/g, (_, k) => String((felder && felder[k]) || '').trim().replace(/[.!?]+$/, '') || '___'); }
export function planText(p) {
  const f = (p && p.felder) || {};
  if (p.art === 'woop') return [f.wunsch && `Wunsch: ${f.wunsch}`, f.hindernis && `Hindernis: ${f.hindernis}`, f.plan && `Plan: ${f.plan}`].filter(Boolean).join(' · ');
  if (p.art === 'gewohnheit') return fuelle('Nachdem ich {nach}, mache ich {mache}.', f);
  return fuelle('Wenn {wenn}, dann {dann}.', f);
}
export function neuerPlan(art, felder, jetzt = new Date(), zufall = Math.random) {
  const sauber = {}; for (const [k, v] of Object.entries(felder || {})) { const t = String(v || '').trim().slice(0, 400); if (t) sauber[k] = t; }
  return { id: 'p' + jetzt.getTime().toString(36) + Math.floor(zufall() * 1296).toString(36), art, felder: sauber, erstellt: jetzt.toISOString(), haken: [] };
}
export function hakenUmschalten(p, datum) {
  const h = new Set(p.haken || []); if (h.has(datum)) h.delete(datum); else h.add(datum);
  return { ...p, haken: [...h].sort().slice(-400) };
}

// ---------- Kalender-Datei (.ics, RFC 5545) zum Selbst-Importieren ----------
// ereignisse: [{ titel, text, zeit 'HH:MM', tage ['MO', …], dauer (Min.) }]. Zeiten „schwebend“ (ohne Zeitzone) = Ortszeit des Geräts.
export function icsText(t) { return String(t || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
export function falte(zeile) {   // Zeilen über 75 Byte (UTF-8) falten; nie mitten in einem Zeichen trennen
  const enc = (c) => { const n = c.codePointAt(0); return n < 0x80 ? 1 : n < 0x800 ? 2 : n < 0x10000 ? 3 : 4; };
  const teile = []; let akt = '', b = 0, max = 75;
  for (const c of zeile) { const l = enc(c); if (b + l > max) { teile.push(akt); akt = ''; b = 0; max = 74; } akt += c; b += l; }
  teile.push(akt); return teile.join('\r\n ');
}
const stempel = (d) => `${d.getUTCFullYear()}${zwei(d.getUTCMonth() + 1)}${zwei(d.getUTCDate())}T${zwei(d.getUTCHours())}${zwei(d.getUTCMinutes())}${zwei(d.getUTCSeconds())}Z`;
export function ersterTermin(datum, zeit, tage, jetzt = null) {   // erster Tag ab `datum` (heute nur, wenn die Uhrzeit noch kommt), der in `tage` liegt
  for (let k = 0; k < 8; k++) {
    const s = plusTage(datum, k); if (!tage.includes(WT_ICS[wochentag(s)])) continue;
    if (k === 0 && jetzt && uhrzeit(jetzt) >= zeit) continue;
    return s;
  }
  return datum;
}
export function ics({ ereignisse = [], jetzt = new Date(), datum = tagText(jetzt), url = '', uid = null } = {}) {
  const Z = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wie ich ticke//Training//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  ereignisse.forEach((e, i) => {
    const tage = (e.tage || []).filter((t) => WT_ICS.includes(t)); if (!tage.length || !/^\d{2}:\d{2}$/.test(e.zeit || '')) return;
    const tag = ersterTermin(datum, e.zeit, tage, jetzt).replace(/-/g, '');
    const regel = tage.length === 7 ? 'RRULE:FREQ=DAILY' : `RRULE:FREQ=WEEKLY;BYDAY=${WT_ICS.filter((t) => tage.includes(t)).join(',')}`;
    const id = (uid ? `${uid}-${i}` : `${jetzt.getTime().toString(36)}-${i}-${Math.floor(Math.random() * 1e9).toString(36)}`) + '@wie-ich-ticke';
    Z.push('BEGIN:VEVENT', `UID:${id}`, `DTSTAMP:${stempel(jetzt)}`, `DTSTART:${tag}T${e.zeit.replace(':', '')}00`, `DURATION:PT${Math.max(1, Math.min(60, e.dauer || 10))}M`,
      regel, `SUMMARY:${icsText(e.titel)}`, `DESCRIPTION:${icsText(e.text)}`);
    if (/^https?:\/\//.test(url)) Z.push(`URL:${url}`);
    Z.push('TRANSP:TRANSPARENT', 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(e.titel)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  });
  Z.push('END:VCALENDAR');
  return Z.map(falte).join('\r\n') + '\r\n';
}
