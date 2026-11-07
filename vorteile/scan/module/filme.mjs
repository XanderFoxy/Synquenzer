// Modul "filme": Filme & Serien bei Apple TV (iTunes Store Deutschland) für Xander.
// Gruppen: Wunschfilme (immer alle), Angebote (≤ 3,99 €), neue Filme aus den Charts (Komödie, Action, Thriller, Sci-Fi),
// 80er-/Kult-Klassiker, Staffeln (Rick and Morty, Star Trek) und Disney – mit eigener Preis-Historie (Tiefstpreis).
// Listen: vorteile/filme.json (frei änderbar). Ergebnis: Einträge nur für echte Treffer + eigene Datei filme.json
// (Rückgabefeld „datei“; main.mjs schreibt sie nach <data>/filme.json). Horror kommt nie auf die Seite (außer Wunschliste).
// Quellen, alle über holeText (Roh-Mitschnitt): iTunes Search API (DE + US), iTunes Lookup, Legacy-Charts (RSS als JSON),
// Wikidata (P6398 = iTunes movie ID), mydealz-Gruppen (apple-tv, filme-serien).
// Apple-Nummern ohne die kaputte Film-Suche: siehe Schritt 3 (Wege de → us → wikidata → charts) und QUELLEN-FIX.md.
// Höflich: höchstens maxAppleAbrufe pro Lauf, höchstens maxSuchen Suchen, maxNeueTitel neue Titel, Zeitbudget; Pause pro
// Host in lib/http.mjs; nach 3 Apple-Fehlern in Folge kein weiterer Apple-Abruf in diesem Lauf.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePrice, euro, round, schluessel } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { preisAngaben, threadId } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, mydealzFeeds } from './gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const LISTEN_PFAD = join(HIER, '..', '..', 'filme.json');
const APPLE = 'https://itunes.apple.com';

export const STANDARD = {
  maxAppleAbrufe: 45, // alle Apple-Abrufe eines Laufs (Suche + Lookup + Charts)
  maxSuchen: 25, // Apple-Suchen pro Lauf, DE und US zusammen (Titel -> Apple-Nummer wird danach im Zustand gemerkt)
  maxNeueTitel: 25, // so viele Titel pro Lauf neu auflösen (alle Wege zusammen)
  wegTotNach: 4, // so viele leere Antworten (resultCount 0) in Folge -> Suchweg ruht; jeder neue Lauf probiert ihn einmal
  wikidata: true, // Weg „wikidata“ (aus = false)
  wikidataMaxAbrufe: 3, // Wikidata-Abfragen pro Lauf
  wikidataUrlMax: 3500, // Länge einer Wikidata-Adresse (GET), danach eine weitere Abfrage
  sucheLimit: 20, // Treffer pro Suche (bei „Batman“ o. ä. reichen 10 nicht)
  lookupMax: 150, // IDs pro Lookup-Abruf
  zeitBudgetSek: 170, // danach keine neuen Suchen mehr (main bricht ein Modul nach 240 s ab)
  wiederholenTage: 7, // nicht gefundene Titel frühestens nach so vielen Tagen neu suchen
  serienNeuTage: 14, // Staffel-Listen so oft auffrischen (neue Staffeln)
  historieTage: 400,
  vergessenTage: 60, // Preis-Historie von Titeln, die so lange nicht mehr gesehen wurden, löschen
  angebotPreis: 3.99,
  angebotPreisAktion: 4.99, // mit Tiefstpreis oder laufender Apple-Aktion (mydealz)
  maxEintraege: 25,
  maxAngebot: 60,
  maxNeu: 40,
  maxStaffelnJeSerie: 20,
};

export const sucheUrl = (term, staffel = false, limit = STANDARD.sucheLimit, land = 'de') =>
  `${APPLE}/search?term=${encodeURIComponent(term)}&country=${land}&media=${staffel ? 'tvShow' : 'movie'}&entity=${staffel ? 'tvSeason' : 'movie'}&limit=${staffel ? 50 : limit}`;
export const lookupUrl = (ids, land = 'de') => `${APPLE}/lookup?id=${ids.map(i => String(i).replace(/^itunes:/, '')).join(',')}&country=${land}`;
export const chartUrl = genre => `${APPLE}/de/rss/topmovies/limit=100/genre=${genre}/json`;
export const MYDEALZ_GRUPPEN = [{ gruppe: 'apple-tv', name: 'Apple TV' }, { gruppe: 'filme-serien', name: 'Filme & Serien' }];

// ---------------------------------------------------------------- Wikidata (Weg „wikidata“)
// Eigenschaft P6398 „iTunes movie ID“ = Nummer des Films im iTunes Store (US-Fassung, wie bei Apple storefront-übergreifend);
// gesucht wird über Bezeichnung oder Alias (deutsch/englisch), dazu das früheste Erscheinungsjahr (P577).
// Antwort im W3C-Format „SPARQL 1.1 Query Results JSON“ (results.bindings).
export const WIKIDATA = 'https://query.wikidata.org/sparql';
const sparqlText = s => JSON.stringify(String(s)); // JSON-Escapes (\" \\ \uXXXX) sind auch in SPARQL gültig

export function wikidataAbfrage(namen) {
  const werte = [...new Set(namen.map(n => String(n).trim()).filter(Boolean))].flatMap(n => [`${sparqlText(n)}@de`, `${sparqlText(n)}@en`]).join(' ');
  return `SELECT ?item ?name ?itunes (MIN(YEAR(?datum)) AS ?jahr) WHERE { VALUES ?name { ${werte} } `
    + '?item rdfs:label|skos:altLabel ?name ; wdt:P6398 ?itunes . OPTIONAL { ?item wdt:P577 ?datum . } } GROUP BY ?item ?name ?itunes LIMIT 1000';
}
export const wikidataUrl = abfrage => `${WIKIDATA}?format=json&query=${encodeURIComponent(abfrage)}`;

/** Namen eines Listen-Eintrags für Wikidata (genau so geschrieben, wie sie in der Liste stehen). */
export function wikidataNamen(item) {
  return [...new Set([item.titel, item.en, ...liste(item.auch)].filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))];
}

/** Listen-Einträge in Abfragen aufteilen, deren Adresse höchstens urlMax Zeichen lang ist. -> [{ posten, url }] */
export function wikidataTeile(posten, urlMax = STANDARD.wikidataUrlMax) {
  const url = ps => wikidataUrl(wikidataAbfrage(ps.flatMap(p => wikidataNamen(p.item))));
  const teile = [];
  let akt = [];
  for (const p of posten) {
    if (akt.length && url([...akt, p]).length > urlMax) { teile.push({ posten: akt, url: url(akt) }); akt = []; }
    akt.push(p);
  }
  if (akt.length) teile.push({ posten: akt, url: url(akt) });
  return teile;
}

/** Wikidata-Antwort -> [{ qid, name, id: 'itunes:…', jahr }] (kaputte Zeilen fallen weg). */
export function leseWikidata(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('keine gültige Wikidata-Antwort'); }
  const b = j?.results?.bindings;
  if (!Array.isArray(b)) throw new Error('Wikidata-Antwort ohne results.bindings');
  const out = [];
  for (const r of b) {
    const nr = String(r?.itunes?.value ?? '').trim().replace(/^id/i, '');
    const name = String(r?.name?.value ?? '').trim();
    if (!/^\d{5,12}$/.test(nr) || !name) continue;
    const jahr = Number(r?.jahr?.value);
    out.push({ qid: String(r?.item?.value ?? '').replace(/^.*\//, '') || null, name, id: `itunes:${nr}`, jahr: Number.isInteger(jahr) && jahr > 1880 && jahr < 2100 ? jahr : null });
  }
  return out;
}

/** Kandidaten (Apple-Nummern) für einen Listen-Eintrag aus den Wikidata-Zeilen: Name gleich, Jahr ±1 (falls bekannt). */
export function wikidataKandidaten(zeilen, item) {
  const ziel = new Set(wikidataNamen(item).map(normTitel));
  const out = [];
  for (const z of zeilen) {
    if (!ziel.has(normTitel(z.name))) continue;
    if (item.jahr && z.jahr != null && Math.abs(z.jahr - item.jahr) > 1) continue;
    if (out.some(x => x.id === z.id)) continue;
    out.push({ id: z.id, jahr: z.jahr, w: z.jahr == null ? 1 : z.jahr === item.jahr ? 3 : 2 });
  }
  return out.sort((a, b) => b.w - a.w);
}

// ---------------------------------------------------------------- Titel vergleichen

const ROEMISCH = { ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9' };
const ARTIKEL = new Set(['der', 'die', 'das', 'the']);
// Was nach dem gesuchten Titel kommt und ihn zu einem ANDEREN Film macht (Fortsetzung)
const FORTSETZUNG = /^(\d+|teil|zwoter|zweiter|dritter|vierter|part|kapitel|chapter|reloaded|revolutions|resurrection)$/;
// Was ohne Trenner hinter dem Titel stehen darf (gleicher Film, andere Fassung)
const FASSUNG = new Set(['extended', 'directors', 'director', 'cut', 'uncut', 'remastered', 'kinofassung', 'special', 'edition', '4k', 'hd',
  'omu', 'ov', 'dc', 'version', 'final', 'ultimate', 'fassung', 'restauriert', 'restaurierte', 'ungekuerzt', 'ungeschnitten', 'jubilaeumsedition']);

/** Titel in Wörter zerlegen: klein, Umlaute ausgeschrieben, Satzzeichen weg, römische Zahlen als Ziffer, „der/die/das/the“
 *  am Anfang egal. Trenner (Doppelpunkt, Gedankenstrich, Klammer, Komma, Schrägstrich) bleiben als '|'. */
const TOKEN_SPEICHER = new Map();
export function titelTokens(s) {
  const schl = String(s ?? '');
  const c = TOKEN_SPEICHER.get(schl);
  if (c) return c;
  const w = Object.freeze(titelTokensRoh(schl));
  if (TOKEN_SPEICHER.size > 20000) TOKEN_SPEICHER.clear();
  TOKEN_SPEICHER.set(schl, w);
  return w;
}
function titelTokensRoh(s) {
  const t = String(s ?? '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/½/g, ' 1 2 ').replace(/[&+]/g, ' und ')
    .replace(/[.'’‘`´!?¿¡"„“”«»]/g, '')
    .replace(/\s+-+\s*|\s*-+\s+|[:;()[\]/|,–—]/g, ' | ')
    .replace(/[^a-z0-9|]+/g, ' ');
  let w = t.split(/\s+/).filter(Boolean).map(x => ROEMISCH[x] ?? x);
  w = w.filter((x, i) => !(x === '|' && (i === 0 || w[i - 1] === '|')));
  while (w.at(-1) === '|') w.pop();
  if (w[0] === '|') w.shift();
  if (ARTIKEL.has(w[0]) && w.slice(1).some(x => x !== '|')) { w.shift(); if (w[0] === '|') w.shift(); }
  return w;
}
export const normTitel = s => titelTokens(s).filter(x => x !== '|').join(' ');
const slug = s => normTitel(s).replace(/ /g, '-');

/** Passt der Name (aus der Liste) zum Store-Titel? 100 = gleich, 85 = andere Fassung, 70 = mit Untertitel, 0 = nein. */
export function namensWert(storeTitel, name) {
  const k = titelTokens(storeTitel);
  const n = titelTokens(name).filter(x => x !== '|');
  if (!n.length || !k.length) return 0;
  const kp = k.filter(x => x !== '|');
  if (kp.join(' ') === n.join(' ')) return 100;
  let i = 0, j = 0;
  while (i < k.length && j < n.length) {
    if (k[i] === '|') { i++; continue; }
    if (k[i] !== n[j]) return 0;
    i++; j++;
  }
  if (j < n.length) return 0;
  const rest = k.slice(i), restPlain = rest.filter(x => x !== '|');
  if (!restPlain.length) return 100;
  // „Manta Manta (1991)“: Jahr in Klammern = gleicher Film; „Blade Runner 2049“ (ohne Trenner) = anderer Film
  if (rest[0] === '|' && restPlain.length === 1 && /^(19|20)\d\d$/.test(restPlain[0])) return 85;
  if (FORTSETZUNG.test(restPlain[0])) return 0;
  if (restPlain.every(x => FASSUNG.has(x))) return 85;
  if (rest[0] === '|') return 70;
  return 0;
}

/** Alle Namen eines Listen-Eintrags: Titel, „en“, „auch“ und der Haupttitel vor dem ersten Untertitel (schwächer). */
function namen(item) {
  const liste = [item.titel, item.en, ...(Array.isArray(item.auch) ? item.auch : [])].filter(x => typeof x === 'string' && x.trim());
  const out = liste.map(n => ({ n, faktor: 1 }));
  const haupt = titelTokens(item.titel);
  const k = haupt.indexOf('|');
  if (k > 0) {
    const kurz = haupt.slice(0, k);
    if (kurz.join('').length >= 4) out.push({ n: kurz.join(' '), faktor: 0.8 });
  }
  return out;
}

/** Wie gut passt ein Film (einheitliche Daten: typ, titel, jahr, Preise) zu einem Listen-Eintrag? 0 = gar nicht. */
export function filmWert(d, item) {
  if (!d || d.typ !== 'film') return 0;
  let w = 0;
  for (const { n, faktor } of namen(item)) {
    const nw = namensWert(d.titel, n);
    // der kurze Haupttitel („Ghostbusters“ für „Ghostbusters – Die Geisterjäger“) zählt nur, wenn er genau so heißt
    if (faktor < 1 && nw < 85) continue;
    w = Math.max(w, nw * faktor);
  }
  if (!w) return 0;
  if (item.jahr) {
    if (d.jahr == null) return 0;
    const dj = Math.abs(d.jahr - item.jahr);
    if (dj > 1) return 0;
    w += dj === 0 ? 20 : 10;
  }
  if (d.preisSd != null || d.preisHd != null || d.preis != null) w += 3;
  return w;
}

/** Die n besten Film-Treffer aus Such-/Lookup-Ergebnissen -> [{ d, w }] (bei gleichem Wert gewinnt der frühere). */
export function rangliste(ergebnisse, item, n = 3) {
  const out = [];
  for (const r of ergebnisse) {
    const d = ausItunes(r);
    const w = filmWert(d, item);
    if (w) out.push({ d, w });
  }
  return out.sort((a, b) => b.w - a.w).slice(0, n);
}

/** Bester Film-Treffer aus Such-/Lookup-Ergebnissen für einen Listen-Eintrag – oder null (kein Zufallstreffer). */
export function waehleTreffer(ergebnisse, item) {
  return rangliste(ergebnisse, item, 1)[0]?.d || null;
}

/** Englischer Titel für die Suche im US-Store (rein deutsche Filme haben keinen -> null). */
export const englisch = item => (typeof item?.en === 'string' && item.en.trim() ? item.en.trim() : null);

// ---------------------------------------------------------------- Charts als Weg „charts“ (Titel/Jahr-Abgleich)

/** Chart-Einträge nach erstem Titelwort ordnen (schneller Abgleich mit ~200 Listen-Einträgen). */
export function chartIndex(eintraege) {
  const idx = new Map();
  const gesehen = new Set();
  for (const e of eintraege) {
    if (!e?.id || gesehen.has(e.id)) continue;
    gesehen.add(e.id);
    const w = titelTokens(e.titel).find(x => x !== '|');
    if (!w) continue;
    if (!idx.has(w)) idx.set(w, []);
    idx.get(w).push(e);
  }
  return idx;
}

/** Bester Chart-Eintrag für einen Listen-Eintrag (gleiche Regeln wie bei der Suche: Name + Jahr ±1) -> Film-Daten | null */
export function chartFilm(idx, item) {
  let best = null;
  const erste = new Set(namen(item).map(x => titelTokens(x.n).find(y => y !== '|')).filter(Boolean));
  for (const w of erste) {
    for (const e of idx.get(w) || []) {
      const d = { id: e.id, typ: 'film', titel: e.titel, jahr: e.jahr ?? null, release: e.release ?? null, genre: e.genre ?? null, genreId: e.genreId ?? null,
        preisSd: null, preisHd: null, preis: e.preis ?? null, leihe: e.leihe ?? null, bild: e.bild ?? null, link: e.link ?? null };
      const wert = filmWert(d, item);
      if (wert && (!best || wert > best.wert)) best = { wert, d };
    }
  }
  return best?.d || null;
}

/** "Rick and Morty, Staffel 3" | "Star Trek: The Next Generation, Season 2 (Remastered)" -> { serie, nr, zusatz } */
export function staffelInfo(name) {
  const s = String(name ?? '');
  let m = s.match(/^(.*?)[\s,:–—-]*\b(?:staffel|season|series|saison|stagione)\s*(\d+)\b(.*)$/i);
  if (!m) { const m2 = s.match(/^(.*?)[\s,:–—-]*\b(\d+)\.\s*staffel\b(.*)$/i); if (m2) m = m2; }
  if (!m) return null;
  return { serie: m[1].replace(/\s*\([^)]*\)\s*$/, '').trim(), nr: Number(m[2]), zusatz: m[3].replace(/^[\s,:–—-]+/, '').trim() };
}

/** Staffeln einer Serie aus Suchergebnissen (nur genau diese Serie, nicht Ableger). */
export function staffelnAus(ergebnisse, item) {
  const ziel = new Set(namen(item).filter(x => x.faktor === 1).map(x => normTitel(x.n)));
  const out = [];
  for (const r of ergebnisse) {
    const d = ausItunes(r);
    if (!d || d.typ !== 'staffel') continue;
    const info = staffelInfo(d.titel);
    if (!info) continue;
    const serie = info.serie ? normTitel(info.serie) : normTitel(r.artistName);
    if (!ziel.has(serie)) continue;
    out.push({ ...d, serie: item.titel, nr: info.nr, zusatz: info.zusatz });
  }
  return out;
}

// ---------------------------------------------------------------- Apple-Daten lesen (tolerant)

/** Preis: Zahl > 0 oder null (fehlt, 0, -1, Text) */
export function preisWert(v) {
  if (typeof v === 'string') v = /^\s*-?\d+(\.\d+)?\s*$/.test(v) ? Number(v) : parsePrice(v);
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? round(v, 2) : null;
}
const bildUrl = u => (typeof u === 'string' && /^https:\/\//.test(u) ? u.replace(/\/\d+x\d+(?:bb)?(?:-\d+)?\.(?:jpg|png|webp)$/i, '/200x200bb.jpg') : null);
function appleLink(u) {
  if (typeof u !== 'string' || !/^https:\/\//.test(u)) return null;
  try { const x = new URL(u); x.searchParams.delete('uo'); return x.toString(); } catch { return null; }
}
const jahrAus = d => { const m = String(d ?? '').match(/^(\d{4})/); return m ? Number(m[1]) : null; };

/** Ein Ergebnis der Search-/Lookup-API (Film oder Staffel) -> einheitliche Daten, sonst null. */
export function ausItunes(r) {
  if (!r || typeof r !== 'object') return null;
  const film = r.wrapperType === 'track' && (r.kind === 'feature-movie' || (!r.kind && r.trackName));
  const staffel = r.wrapperType === 'collection' && /season/i.test(String(r.collectionType || ''));
  if (film && r.trackId && r.trackName) {
    const preisSd = preisWert(r.trackPrice ?? r.collectionPrice);
    const preisHd = preisWert(r.trackHdPrice ?? r.collectionHdPrice);
    return {
      id: `itunes:${r.trackId}`, typ: 'film', titel: String(r.trackName).trim(), jahr: jahrAus(r.releaseDate), release: r.releaseDate || null,
      genre: r.primaryGenreName || null, preisSd, preisHd, leihe: preisWert(r.trackHdRentalPrice) ?? preisWert(r.trackRentalPrice),
      bild: bildUrl(r.artworkUrl100 || r.artworkUrl60), link: appleLink(r.trackViewUrl),
    };
  }
  if (staffel && r.collectionId && r.collectionName) {
    return {
      id: `itunes:${r.collectionId}`, typ: 'staffel', titel: String(r.collectionName).trim(), jahr: jahrAus(r.releaseDate), release: r.releaseDate || null,
      genre: r.primaryGenreName || null, preisSd: preisWert(r.collectionPrice), preisHd: preisWert(r.collectionHdPrice), leihe: null,
      bild: bildUrl(r.artworkUrl100 || r.artworkUrl60), link: appleLink(r.collectionViewUrl), folgen: Number(r.trackCount) || null,
    };
  }
  return null;
}

/** Antwort der Search-/Lookup-API -> Liste der Ergebnisse (results fehlt / Einzelobjekt / kaputt). */
export function leseErgebnisse(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('keine gültige Apple-Antwort'); }
  if (!j || typeof j !== 'object') throw new Error('keine gültige Apple-Antwort');
  const r = j.results;
  return r == null ? [] : Array.isArray(r) ? r : [r];
}

const liste = v => (v == null ? [] : Array.isArray(v) ? v : [v]);

/** Legacy-Charts (…/rss/topmovies/…/json) -> [{ pos, id, titel, preis, leihe, bild, link, genreId, genre, release }] */
export function leseCharts(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('Chart-Feed ist kein JSON'); }
  const feed = j?.feed;
  if (!feed || typeof feed !== 'object') throw new Error('Chart-Feed ohne „feed“');
  const out = [];
  liste(feed.entry).forEach((e, i) => {
    if (!e || typeof e !== 'object') return;
    const links = liste(e.link);
    const href = (links.find(l => l?.attributes?.rel === 'alternate') || links[0])?.attributes?.href;
    const id = e.id?.attributes?.['im:id'] || String(href || e.id?.label || '').match(/\/id(\d+)/)?.[1];
    const titel = e['im:name']?.label;
    if (!id || !titel) return;
    const bilder = liste(e['im:image']).filter(b => b?.label).sort((a, b) => Number(b.attributes?.height || 0) - Number(a.attributes?.height || 0));
    const kat = e.category?.attributes || {};
    out.push({
      pos: i + 1, id: `itunes:${id}`, titel: String(titel).trim(),
      preis: preisWert(e['im:price']?.attributes?.amount) ?? preisWert(e['im:price']?.label),
      leihe: preisWert(e['im:rentalPrice']?.attributes?.amount) ?? preisWert(e['im:rentalPrice']?.label),
      bild: bildUrl(bilder[0]?.label), link: appleLink(href),
      genreId: Number(kat['im:id']) || null, genre: kat.label || null,
      release: e['im:releaseDate']?.label || null, jahr: jahrAus(e['im:releaseDate']?.label),
    });
  });
  return out;
}

// ---------------------------------------------------------------- Preis-Historie

const heute = jetzt => berlinTag(new Date(jetzt).toISOString());
const tagMs = t => Date.parse(`${t}T00:00:00Z`);
export const tageZwischen = (a, b) => Math.round((tagMs(b) - tagMs(a)) / 864e5);
const tagMinus = (t, n) => new Date(tagMs(t) - n * 864e5).toISOString().slice(0, 10);

/**
 * Preis in die Historie (zustand.filme.preise[id] = { h: [[tag, preis], …] nur Änderungen, tiefst: {p, tag}, seit, zuletzt }).
 * Liefert die Lage NACH dem Eintragen und den Tiefstpreis VOR dem Eintragen.
 */
export function merkeFilmPreis(zf, id, preis, tag, behaltenTage = STANDARD.historieTage) {
  const v = ((zf.preise ||= {})[id] ||= { h: [], tiefst: null, seit: tag, zuletzt: tag });
  const tiefstVorher = v.tiefst ? { ...v.tiefst } : null;
  const ersteBeobachtung = !v.h.length;
  if (preis != null) {
    if (!v.h.length || v.h.at(-1)[1] !== preis) v.h.push([tag, preis]);
    if (!v.tiefst || preis < v.tiefst.p) v.tiefst = { p: preis, tag };
  }
  v.zuletzt = tag;
  const grenze = tagMinus(tag, behaltenTage);
  while (v.h.length > 1 && v.h[1][0] < grenze) v.h.shift(); // ältester Preis vor der Grenze bleibt als Ausgangswert
  return { v, tiefstVorher, ersteBeobachtung };
}

/** Kennzahlen aus der Historie für einen aktuellen Preis. */
export function preisLage(v, preis, tag, { typ = 'film', staffelZiel = 9.99, angebotPreis = STANDARD.angebotPreis } = {}) {
  const h = v?.h || [];
  const letzter = h.at(-1);
  // zuletzt beobachteter ANDERER Preis
  const vorher = preis == null ? (letzter ? letzter[1] : null) : letzter && letzter[1] === preis ? (h.length >= 2 ? h.at(-2)[1] : null) : letzter ? letzter[1] : null;
  const tage = v?.seit ? tageZwischen(v.seit, tag) + 1 : 0;
  const tiefst = v?.tiefst || null;
  const istTiefst = preis != null && !!tiefst && preis <= tiefst.p && (tage >= 7 || preis <= angebotPreis);
  const hoechst = h.reduce((m, x) => Math.max(m, x[1]), 0);
  const gesenkt = preis != null && vorher != null && preis < vorher;
  const angebot = preis != null && (
    (typ === 'film' && preis <= angebotPreis) || (typ === 'staffel' && preis <= staffelZiel)
    || (gesenkt && preis <= vorher * 0.7) || (istTiefst && hoechst > preis));
  return { vorher, tage, tiefst, istTiefst, hoechst, gesenkt, angebot };
}

// ---------------------------------------------------------------- Listen

export async function ladeListen(pfad = LISTEN_PFAD) {
  return JSON.parse(await readFile(pfad, 'utf8'));
}

const gueltig = x => x && typeof x === 'object' && typeof x.titel === 'string' && x.titel.trim();

/** Alle Listen-Einträge in Such-Reihenfolge: Wunsch, Serien, dann 80er und Disney abwechselnd. */
export function postenListe(listen) {
  const film = (x, gruppe) => ({ key: `film:${slug(x.titel)}-${x.jahr ?? ''}`, gruppe, item: x, serie: false });
  const wunsch = liste(listen?.wunschliste).filter(gueltig).map(x => film(x, 'wunsch'));
  const serien = liste(listen?.serien).filter(gueltig).map(x => ({ key: `serie:${slug(x.titel)}`, gruppe: 'serien', item: x, serie: true }));
  const a = liste(listen?.achtziger).filter(gueltig).map(x => film(x, 'achtziger'));
  const d = liste(listen?.disney).filter(gueltig).map(x => film(x, 'disney'));
  const misch = [];
  for (let i = 0; i < Math.max(a.length, d.length); i++) { if (a[i]) misch.push(a[i]); if (d[i]) misch.push(d[i]); }
  return [...wunsch, ...serien, ...misch];
}

/** Suchbegriffe eines Eintrags: suche, Titel, „auch“, „en“ – ohne Doppelte, höchstens 3. */
export function suchbegriffe(item) {
  const gesehen = new Set(), out = [];
  for (const t of [item.suche, item.titel, ...liste(item.auch), item.en]) {
    if (typeof t !== 'string' || !t.trim()) continue;
    const k = normTitel(t);
    if (!k || gesehen.has(k)) continue;
    gesehen.add(k); out.push(t.trim());
  }
  return out.slice(0, 3);
}

/** Suchbegriffe einer Serie: Titel, „en“, „auch“ (deutsch, englisch, Varianten) – ohne Doppelte, höchstens 3.
 *  Alle werden gesucht (nicht nur bis zum ersten Treffer): die Apple-Suche liefert je Name nur einen Teil der Staffeln. */
export function serienBegriffe(item) {
  const gesehen = new Set(), out = [];
  for (const t of [item.suche, item.titel, item.en, ...liste(item.auch)]) {
    if (typeof t !== 'string' || !t.trim()) continue;
    const k = normTitel(t);
    if (!k || gesehen.has(k)) continue;
    gesehen.add(k); out.push(t.trim());
  }
  return out.slice(0, 3);
}

// ---------------------------------------------------------------- mydealz

const APPLE_WORT = /\b(itunes|apple\s?tv|tv[- ]app|apple store)\b/i;
const FILM_WORT = /film|movie|staffel|season|serie|kino|blockbuster|klassiker|disney|pixar|marvel|star wars|star trek|leihen|kaufen|kollektion|collection|trilogie|bundle/i;
const KEIN_FILMDEAL = /apple\s?tv\s?(\+|plus)|\babo\b|abonnement|probemonat|monate? (gratis|kostenlos)|\d+\s?gb\b|generation|\bgen\.|siri remote|fernbedienung|\bhdmi\b|geschenkkarte|guthabenkarte|gutscheinkarte|app store (&|und) itunes karte|horror/i;

export function istAppleFilmDeal(it) {
  const text = `${it.titel} ${it.beschreibung || ''}`;
  const apple = APPLE_WORT.test(`${it.titel} ${it.shop || ''}`) || /^(apple|itunes|apple tv)$/i.test(String(it.shop || '').trim());
  return apple && FILM_WORT.test(text) && !KEIN_FILMDEAL.test(text);
}

// ---------------------------------------------------------------- Ausgabe

const SO_FILM = 'Link öffnen – die TV-App zeigt den Film. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen. Gekaufte Filme bleiben in deiner Mediathek.';
const SO_STAFFEL = 'Link öffnen – die TV-App zeigt die Staffel. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen. Alle Folgen bleiben in deiner Mediathek.';
const SO_DEAL = 'Deal öffnen: dort steht, welche Filme dabei sind. Dann in der TV-App suchen, Preis prüfen und kaufen.';

const NULL_TITEL = { genre: null, preis: null, preisSd: null, preisHd: null, leihe: null, vorher: null, tiefst: null, seit: null, tage: 0, istTiefst: false, angebot: false, bild: null, link: null, chart: null };

function titelObjekt(d, lage, extra = {}) {
  const preis = d.preisHd ?? d.preisSd ?? d.preis ?? null;
  const o = {
    id: d.id, typ: d.typ, titel: d.titel, jahr: d.jahr ?? null, genre: d.genre ?? null,
    preis, preisSd: d.preisSd ?? null, preisHd: d.preisHd ?? null, leihe: d.leihe ?? null,
    vorher: lage.vorher ?? null, tiefst: lage.tiefst ? { p: lage.tiefst.p, tag: lage.tiefst.tag } : null, seit: lage.seit ?? null,
    tage: lage.tage ?? 0, istTiefst: !!lage.istTiefst, angebot: !!lage.angebot,
    bild: d.bild ?? null, link: d.link ?? null, chart: d.chart ?? null, quelle: 'Apple',
    ...extra,
  };
  if (d.typ === 'staffel') { o.serie = d.serie ?? null; o.nr = d.nr ?? null; }
  return o;
}

function istHorror(d, horrorIds) {
  return /horror/i.test(String(d?.genre || '')) || (d?.genreId != null && horrorIds.has(Number(d.genreId)));
}

// ---------------------------------------------------------------- Lauf

export default async function filme(ctx) {
  const { holeText, cfg, zustand, jetzt = new Date() } = ctx;
  const m = { ...STANDARD, ...(cfg?.module?.filme || {}) };
  const fehler = [];
  let listen = ctx.filmListen;
  if (!listen) {
    try { listen = await ladeListen(); } catch (e) { return { eintraege: [], fehler: [`filme.json nicht lesbar: ${e.message}`] }; }
  }
  const tag = heute(jetzt);
  const zf = (zustand.filme ||= {});
  zf.ids ||= {}; zf.preise ||= {}; zf.charts ||= {};
  const start = Date.now();
  const zeitUm = () => Date.now() - start > m.zeitBudgetSek * 1000;
  const status = {
    'apple-preise': { ok: true, anzahl: 0, fehler: [] },
    'apple-charts': { ok: true, anzahl: 0, fehler: [] },
    'apple-suche': { ok: true, anzahl: 0, fehler: [], offen: 0, nichtGefunden: [], suchen: 0, wege: { de: 0, us: 0, wikidata: 0, charts: 0 }, leer: { de: 0, us: 0, wikidata: 0 }, ruhend: [] },
    mydealz: { ok: true, anzahl: 0, fehler: [] },
  };
  const melde = (quelle, text) => { status[quelle].ok = false; status[quelle].fehler.push(text); fehler.push(text); };

  // Apple-Abrufe zählen (höflich: höchstens maxAppleAbrufe pro Lauf; nach 3 Fehlern in Folge keiner mehr)
  let appleAbrufe = 0, appleFehlerInFolge = 0;
  const appleGestoert = () => appleFehlerInFolge >= 3;
  const apple = async url => {
    if (appleAbrufe >= m.maxAppleAbrufe) throw new Error('Abruf-Grenze für diesen Lauf erreicht');
    if (appleGestoert()) throw new Error('Apple antwortet gerade nicht – Rest im nächsten Lauf');
    appleAbrufe++;
    try { const text = await holeText(url); appleFehlerInFolge = 0; return text; } catch (e) { appleFehlerInFolge++; throw e; }
  };

  const chartCfg = listen.charts || {};
  const chartsNeu = liste(chartCfg.neu).length ? liste(chartCfg.neu) : [{ id: 4404, name: 'Komödie' }, { id: 4401, name: 'Action & Abenteuer' }, { id: 4416, name: 'Thriller' }, { id: 4413, name: 'Sci-Fi & Fantasy' }];
  const chartsAngebot = chartCfg.angebot ? liste(chartCfg.angebot) : [{ id: 4403, name: 'Klassiker' }, { id: 4410, name: 'Kinder & Familie' }];
  const chartsSuche = liste(chartCfg.suche).filter(g => Number.isInteger(Number(g?.id)));
  const horrorIds = new Set(liste(chartCfg.horror ?? [4408]).map(Number));
  const neuMonate = chartCfg.neuMonate ?? 18;
  const neuProGenre = chartCfg.neuProGenre ?? 25;
  const zielpreis = preisWert(listen.zielpreis) ?? 4.99;
  const staffelZiel = preisWert(listen.staffelZiel) ?? 9.99;

  // alter Stand (Datei des letzten Laufs): bei Ausfall einer Quelle weiter zeigen
  const alt = new Map();
  for (const g of Object.values(ctx.vorherDatei?.gruppen || {})) for (const t of liste(g)) if (t?.id && !alt.has(t.id)) alt.set(t.id, t);

  const posten = postenListe(listen);
  const daten = new Map(); // id -> aktuelle Apple-Daten (frisch)
  const altDaten = new Map(); // id -> Titel aus der alten Datei (Quelle ausgefallen)

  // feste Apple-Nummern aus der Liste
  for (const p of posten) {
    const nr = String(p.item.id ?? '').replace(/^itunes:/, '');
    if (!p.serie && /^\d+$/.test(nr)) zf.ids[p.key] = { id: `itunes:${nr}`, manuell: true, tag: zf.ids[p.key]?.tag || tag };
  }

  // 1) Preise aller bekannten IDs (Lookup, bis lookupMax pro Abruf)
  const bekannte = [...new Set(posten.flatMap(p => {
    const s = zf.ids[p.key];
    return s?.id ? [s.id] : liste(s?.ids).slice(0, m.maxStaffelnJeSerie * 2);
  }))];
  async function lookup(ids, quelle) {
    for (let i = 0; i < ids.length; i += m.lookupMax) {
      const teil = ids.slice(i, i + m.lookupMax);
      const set = new Set(teil);
      try {
        const res = leseErgebnisse(await apple(lookupUrl(teil)));
        for (const r of res) { const d = ausItunes(r); if (d && set.has(d.id)) daten.set(d.id, { ...daten.get(d.id), ...d }); }
        status[quelle].anzahl += res.length;
      } catch (e) {
        melde(quelle, `Apple-Preise: ${e.message}`);
        for (const id of teil) if (alt.has(id)) altDaten.set(id, alt.get(id));
      }
    }
  }
  await lookup(bekannte, 'apple-preise');
  // in einer erfolgreichen Antwort fehlende Titel: kurz (3 Tage) den alten Stand zeigen, dann gilt er als nicht mehr im Store
  for (const id of bekannte) {
    if (daten.has(id) || altDaten.has(id)) continue;
    const zuletzt = zf.preise[id]?.zuletzt;
    if (alt.has(id) && zuletzt && tageZwischen(zuletzt, tag) <= 3) altDaten.set(id, alt.get(id));
  }

  // 2) Charts
  const chartTreffer = new Map(); // id -> { pos, genreId, neu, d }
  const alleCharts = []; // alle Chart-Einträge dieses Laufs (Weg „charts“: Apple-Nummern per Titel/Jahr-Abgleich)
  const neuGrenze = new Date(new Date(jetzt).getTime() - neuMonate * 30.44 * 864e5);
  for (const g of [...chartsNeu.map(x => ({ ...x, neu: true })), ...chartsAngebot.map(x => ({ ...x, neu: false }))]) {
    let eintraege;
    try {
      eintraege = leseCharts(await apple(chartUrl(g.id)));
      status['apple-charts'].anzahl += eintraege.length;
      alleCharts.push(...eintraege);
    } catch (e) {
      melde('apple-charts', `Charts ${g.name || g.id}: ${e.message}`);
      // alter Stand dieses Genres (höchstens 3 Tage)
      const z = zf.charts[g.id];
      if (z && tageZwischen(z.tag, tag) <= 3) {
        for (const [id, pos, neu] of liste(z.ids)) {
          const t = alt.get(id);
          if (!t) continue;
          const vor = chartTreffer.get(id);
          if (!vor || pos < vor.pos) chartTreffer.set(id, { pos, genreId: g.id, neu: !!neu, altTitel: t });
        }
      }
      continue;
    }
    const merk = [];
    for (const e of eintraege) {
      if (istHorror(e, horrorIds) || horrorIds.has(Number(g.id))) continue;
      const neu = g.neu && e.pos <= neuProGenre && e.release && Date.parse(e.release) >= neuGrenze.getTime();
      const billig = e.preis != null && e.preis <= m.angebotPreisAktion;
      if (!neu && !billig) continue;
      const vor = chartTreffer.get(e.id);
      if (!vor || e.pos < vor.pos || (neu && !vor.neu)) chartTreffer.set(e.id, { pos: Math.min(e.pos, vor?.pos ?? Infinity), genreId: g.id, neu: neu || !!vor?.neu, d: e });
      merk.push([e.id, e.pos, neu ? 1 : 0]);
    }
    zf.charts[g.id] = { tag, ids: merk };
  }
  // Such-Charts (z. B. Drama, Independent): nur für den Titel-Abgleich, höchstens einmal am Tag, nur solange Filme offen sind
  const offeneFilme = [...new Map(posten.filter(p => !p.serie && !zf.ids[p.key]?.id).map(p => [p.key, p])).values()];
  zf.suchCharts ||= {};
  for (const k of Object.keys(zf.suchCharts)) if (!chartsSuche.some(g => String(g.id) === k)) delete zf.suchCharts[k];
  for (const g of offeneFilme.length ? chartsSuche : []) {
    if (zf.suchCharts[g.id] === tag || appleGestoert() || appleAbrufe >= m.maxAppleAbrufe - 3) continue;
    try {
      const e = leseCharts(await apple(chartUrl(g.id)));
      alleCharts.push(...e.filter(x => !istHorror(x, horrorIds)));
      status['apple-charts'].anzahl += e.length;
      zf.suchCharts[g.id] = tag;
    } catch (e) { melde('apple-charts', `Charts ${g.name || g.id} (nur Suche): ${e.message}`); }
  }
  // Details (Kauf-/Leihpreis, Genre) für Chart-Titel, die noch nicht bekannt sind: ein Abruf
  const chartIds = [...chartTreffer.entries()].filter(([id, c]) => c.d && !daten.has(id)).sort((a, b) => a[1].pos - b[1].pos).map(([id]) => id).slice(0, m.lookupMax);
  if (chartIds.length) await lookup(chartIds, 'apple-charts');

  // 3) Neue Titel -> Apple-Nummer (im Zustand gemerkt). Die iTunes-Filmsuche liefert seit Herbst 2026 immer 0 Treffer
  //    (echter Lauf 07.11.2026, alle Filmsuchen; Apple-Forum Thread 848610: auch mit country=us), Lookup und Charts gehen.
  //    Deshalb mehrere Wege – je Titel wird der erste Erfolg gemerkt (zf.ids[key].weg):
  //      de       iTunes-Suche im deutschen Store (falls Apple sie repariert)
  //      us       Suche im US-Store mit englischem Titel („en“) -> Kandidat nach Titel/Jahr -> Lookup im deutschen Store
  //      wikidata Wikidata P6398 (iTunes movie ID) zu Titel/Originaltitel + Jahr -> Lookup im deutschen Store
  //      charts   Titel/Jahr-Abgleich mit den Apple-Charts (deutscher Store; kostet keinen Abruf extra)
  //    „fehlt“ nur, wenn alle Wege leer waren. Ein Suchweg mit wegTotNach leeren Antworten in Folge ruht (zf.wege), jeder
  //    neue Lauf probiert ihn einmal. Ergebnisse einer Suche gelten für alle offenen Titel (Beifang: „Back to the Future“
  //    findet auch Teil II und III). Serien: alle Namen (deutsch, englisch, Varianten) im deutschen Store + US-Store mit
  //    Lookup im deutschen Store; Staffeln aus allen Wegen zusammen, Doppel (Staffel DE/EN-Name) fasst Schritt 5 zusammen.
  const sw = status['apple-suche'];
  const zw = (zf.wege ||= {});
  const probe = new Set(Object.keys(zw).filter(k => (zw[k]?.leer ?? 0) >= m.wegTotNach));
  const ruht = k => (zw[k]?.leer ?? 0) >= m.wegTotNach && !probe.has(k);
  const wiederSeit = Object.values(zw).map(w => w?.wieder).filter(Boolean).sort().at(-1) || null;
  function antwort(k, anzahl) {
    const w = (zw[k] ||= { leer: 0 });
    probe.delete(k);
    if (anzahl > 0) { if ((w.leer ?? 0) >= m.wegTotNach) w.wieder = tag; w.leer = 0; w.zuletzt = tag; }
    else w.leer = (w.leer ?? 0) + 1;
  }

  const faellig = p => {
    const s = zf.ids[p.key];
    if (!s) return 1;
    if (s.weiter != null) return 1;
    // „fehlt“ aus der alten Fassung (nur die kaputte DE-Suche, ohne Marke alle) -> sofort mit allen Wegen, wie ein neuer Titel
    if (s.fehlt && !s.alle) return 1;
    // nicht gefunden: nach wiederholenTage – oder sofort, wenn ein ruhender Suchweg wieder Treffer liefert
    if (s.fehlt) return tageZwischen(s.fehlt, tag) >= m.wiederholenTage || (wiederSeit && s.fehlt < wiederSeit) ? 2 : 0;
    if (p.serie && (!s.tag || tageZwischen(s.tag, tag) >= m.serienNeuTage)) return 3;
    return 0;
  };
  // Reihenfolge innerhalb gleicher Stufe: Wunschliste und nie Versuchte zuerst, dann die am längsten nicht Versuchten.
  // Sonst blockieren dauerhaft offene Titel (Wikidata/Lookup gestört -> „weiter“) für immer die ersten maxNeueTitel Plätze.
  const versucht = p => (p.gruppe === 'wunsch' ? '' : String(zf.ids[p.key]?.versucht || ''));
  const runde = []; // dieser Lauf: höchstens maxNeueTitel Titel (gleicher Film in zwei Listen nur einmal)
  for (const { p } of posten.map(p => ({ p, f: faellig(p) })).filter(x => x.f).sort((a, b) => a.f - b.f || (versucht(a.p) < versucht(b.p) ? -1 : versucht(a.p) > versucht(b.p) ? 1 : 0))) {
    if (runde.length >= m.maxNeueTitel) break;
    if (!runde.some(x => x.key === p.key)) runde.push(p);
  }
  const serienPosten = [...new Map(posten.filter(p => p.serie).map(p => [p.key, p])).values()];

  const gefunden = new Map(); // key -> { id, weg }
  const idKandidaten = new Map(); // key -> [{ id, weg, w, jahr }] (brauchen den Lookup im deutschen Store)
  const neuKandidat = (key, k) => {
    const l = idKandidaten.get(key) || [];
    if (!l.some(x => x.id === k.id && x.weg === k.weg)) l.push(k);
    idKandidaten.set(key, l);
  };
  const treffer = (p, d, weg) => {
    if (gefunden.has(p.key)) return;
    gefunden.set(p.key, { id: d.id, weg });
    if (!daten.has(d.id)) daten.set(d.id, d);
  };
  // Beifang: eine Suche gilt für alle offenen Filme
  function beifang(res, land) {
    for (const q of offeneFilme) {
      if (gefunden.has(q.key)) continue;
      if (land === 'de') { const d = waehleTreffer(res, q.item); if (d) { daten.set(d.id, { ...daten.get(d.id), ...d }); treffer(q, d, 'de'); } }
      else for (const { d, w } of rangliste(res, q.item, 3)) neuKandidat(q.key, { id: d.id, weg: 'us', w, jahr: d.jahr });
    }
  }
  const serienFunde = new Map(); // key -> Map(id -> weg)
  const serienKand = new Map(); // key -> Set(id) aus dem US-Store (Lookup DE nötig)
  function beifangSerie(res, land) {
    for (const q of serienPosten) {
      const st = staffelnAus(res, q.item);
      if (!st.length) continue;
      if (land === 'de') {
        const f = serienFunde.get(q.key) || new Map();
        for (const d of st) { daten.set(d.id, { ...daten.get(d.id), ...d }); if (!f.has(d.id)) f.set(d.id, 'de'); }
        serienFunde.set(q.key, f);
      } else {
        const s = serienKand.get(q.key) || new Set();
        for (const d of st) s.add(d.id);
        serienKand.set(q.key, s);
      }
    }
  }

  let suchen = 0, fehlerInFolge = 0;
  const sucheGeht = () => suchen < m.maxSuchen && !zeitUm() && appleAbrufe < m.maxAppleAbrufe - 1 && fehlerInFolge < 2 && !appleGestoert();
  async function suche(term, serie, land) {
    suchen++;
    try {
      const res = leseErgebnisse(await apple(sucheUrl(term, serie, m.sucheLimit, land)));
      fehlerInFolge = 0;
      if (!res.length) sw.leer[land]++;
      if (!serie) antwort(`${land}-film`, res.length);
      return res;
    } catch (e) {
      melde('apple-suche', `Suche „${term}“${land === 'us' ? ' (US-Store)' : ''}: ${e.message}`);
      fehlerInFolge++;
      return null; // Zustand bleibt offen -> nächster Lauf
    }
  }

  // Weg „wikidata“ vorab für alle Filme dieses Laufs (wenige Abfragen, kein Apple-Abruf)
  const wd = new Map(); // key -> 'ok' | 'fehler'
  const filmeRunde = runde.filter(p => !p.serie);
  if (m.wikidata !== false && filmeRunde.length) {
    let n = 0;
    for (const teil of wikidataTeile(filmeRunde, m.wikidataUrlMax)) {
      if (n >= m.wikidataMaxAbrufe || zeitUm()) break; // Rest im nächsten Lauf
      n++;
      try {
        const zeilen = leseWikidata(await holeText(teil.url, { headers: { accept: 'application/sparql-results+json' } }));
        for (const p of teil.posten) {
          wd.set(p.key, 'ok');
          const ks = wikidataKandidaten(zeilen, p.item);
          for (const k of ks) neuKandidat(p.key, { ...k, weg: 'wikidata' });
          if (!ks.length) sw.leer.wikidata++;
        }
      } catch (e) {
        melde('apple-suche', `Wikidata: ${e.message}`);
        for (const p of teil.posten) wd.set(p.key, 'fehler');
        break; // nicht weiter hämmern
      }
    }
    sw.wikidataAbfragen = n;
  }

  // Suchwege de und us der Reihe nach
  const proto = new Map(); // key -> { de, us } je 'leer' | 'offen' | 'treffer' | 'fertig'
  for (const p of runde) {
    if (zeitUm()) break; // Rest bleibt unverändert -> nächster Lauf
    const pr = {};
    proto.set(p.key, pr);
    if (p.serie) {
      for (const term of serienBegriffe(p.item)) {
        if (!sucheGeht()) { pr.de = 'offen'; break; }
        const res = await suche(term, true, 'de');
        if (!res) { pr.de = 'offen'; break; }
        beifangSerie(res, 'de');
      }
      pr.de ??= 'fertig';
      if (!sucheGeht()) pr.us = 'offen';
      else { const res = await suche(englisch(p.item) || p.item.titel, true, 'us'); pr.us = res ? 'fertig' : 'offen'; if (res) beifangSerie(res, 'us'); }
      continue;
    }
    if (gefunden.has(p.key)) { pr.de = 'treffer'; continue; } // Beifang einer früheren Suche
    if (ruht('de-film')) pr.de = 'leer';
    else {
      for (const term of suchbegriffe(p.item)) {
        if (ruht('de-film')) break;
        if (!sucheGeht()) { pr.de = 'offen'; break; }
        const res = await suche(term, false, 'de');
        if (!res) { pr.de = 'offen'; break; }
        beifang(res, 'de');
        if (gefunden.has(p.key)) { pr.de = 'treffer'; break; }
      }
      pr.de ??= 'leer';
    }
    if (pr.de === 'treffer') continue;
    const en = englisch(p.item);
    if (!en || ruht('us-film')) pr.us = 'leer';
    else if (!sucheGeht()) pr.us = 'offen';
    else { const res = await suche(en, false, 'us'); pr.us = res ? 'fertig' : 'offen'; if (res) beifang(res, 'us'); }
  }
  sw.suchen = suchen;

  // Weg „charts“ für alle offenen Filme vormerken (Apple-Nummer aus dem deutschen Store, Details per Lookup)
  const chartIdx = chartIndex(alleCharts);
  const chartFunde = new Map();
  for (const p of offeneFilme) if (!gefunden.has(p.key)) { const d = chartFilm(chartIdx, p.item); if (d) chartFunde.set(p.key, d); }

  // ein Lookup im deutschen Store für alle Kandidaten (US, Wikidata, Charts, US-Staffeln)
  const kIds = new Set();
  for (const l of idKandidaten.values()) for (const k of l) kIds.add(k.id);
  for (const d of chartFunde.values()) kIds.add(d.id);
  for (const s of serienKand.values()) for (const id of s) kIds.add(id);
  const kListe = [...kIds].filter(id => !daten.has(id));
  let kandidatenOk = true;
  for (let i = 0; i < kListe.length; i += m.lookupMax) {
    const teil = kListe.slice(i, i + m.lookupMax);
    const set = new Set(teil);
    try {
      const res = leseErgebnisse(await apple(lookupUrl(teil)));
      for (const r of res) { const d = ausItunes(r); if (d && set.has(d.id)) daten.set(d.id, { ...daten.get(d.id), ...d }); }
    } catch (e) { kandidatenOk = false; melde('apple-suche', `Lookup der Kandidaten: ${e.message}`); }
  }
  // Entscheidung je Film in der Reihenfolge der Wege: us, wikidata, charts (de ist schon entschieden)
  const passt = (d, item, k) => d && d.typ === 'film'
    && (!item.jahr || (d.jahr != null ? Math.abs(d.jahr - item.jahr) <= 1 : k.jahr != null && Math.abs(k.jahr - item.jahr) <= 1));
  for (const p of offeneFilme) {
    if (gefunden.has(p.key)) continue;
    for (const weg of ['us', 'wikidata']) {
      const ks = (idKandidaten.get(p.key) || []).filter(k => k.weg === weg).sort((a, b) => b.w - a.w);
      const k = ks.find(x => passt(daten.get(x.id), p.item, x));
      if (k) { treffer(p, daten.get(k.id), weg); break; }
    }
    if (gefunden.has(p.key)) continue;
    const c = chartFunde.get(p.key);
    if (c) treffer(p, daten.get(c.id)?.typ === 'film' ? daten.get(c.id) : c, 'charts');
  }

  // Zustand: gefunden -> Nummer + Weg; alle Wege leer -> fehlt; sonst offen (nächster Lauf)
  for (const [key, g] of gefunden) { zf.ids[key] = { id: g.id, tag, weg: g.weg }; sw.wege[g.weg]++; }
  for (const p of filmeRunde) {
    const pr = proto.get(p.key);
    if (gefunden.has(p.key) || !pr) continue; // nicht mehr drangekommen -> unverändert
    const wdOffen = m.wikidata !== false && wd.get(p.key) !== 'ok';
    const lookupOffen = !kandidatenOk && (idKandidaten.get(p.key)?.length || chartFunde.has(p.key));
    const vorher = zf.ids[p.key] || {};
    zf.ids[p.key] = pr.de === 'offen' || pr.us === 'offen' || wdOffen || lookupOffen
      ? { weiter: 0, versucht: tag, ...(vorher.n ? { n: vorher.n } : {}) }
      : { fehlt: tag, n: (vorher.n || 0) + 1, alle: 1 };
  }
  for (const p of serienPosten) {
    const funde = new Map(serienFunde.get(p.key) || []);
    for (const id of serienKand.get(p.key) || []) if (daten.get(id)?.typ === 'staffel' && !funde.has(id)) funde.set(id, 'us');
    const vorher = zf.ids[p.key] || {};
    const alt = liste(vorher.ids);
    const neu = [...funde.keys()].filter(id => !alt.includes(id));
    for (const weg of new Set(neu.map(id => funde.get(id)))) sw.wege[weg]++;
    const ids = [...new Set([...alt, ...funde.keys()])].slice(0, m.maxStaffelnJeSerie * 2);
    const pr = proto.get(p.key);
    if (!pr) { if (neu.length) zf.ids[p.key] = { ids, ...(vorher.tag ? { tag: vorher.tag } : {}) }; continue; } // nur Beifang
    const offen = pr.de === 'offen' || pr.us === 'offen' || (!kandidatenOk && serienKand.get(p.key)?.size > 0);
    if (ids.length) zf.ids[p.key] = offen ? { ids, ...(vorher.tag ? { tag: vorher.tag } : {}), weiter: 0, versucht: tag } : { ids, tag };
    else zf.ids[p.key] = offen ? { weiter: 0, versucht: tag } : { fehlt: tag, n: (vorher.n || 0) + 1, alle: 1 };
  }
  sw.anzahl = Object.values(sw.wege).reduce((a, b) => a + b, 0);
  sw.ruhend = Object.entries(zw).filter(([, w]) => (w?.leer ?? 0) >= m.wegTotNach).map(([k]) => k).sort();
  // Staffel-Daten aus dem Lookup gehören zu ihrer Serie
  for (const p of posten.filter(x => x.serie)) {
    for (const id of liste(zf.ids[p.key]?.ids)) {
      const d = daten.get(id);
      if (d && !d.serie) { const info = staffelInfo(d.titel); if (info) daten.set(id, { ...d, serie: p.item.titel, nr: info.nr, zusatz: info.zusatz }); }
    }
  }

  // 4) mydealz: Apple-Film-Aktionen
  const deals = [];
  // Gruppen statt Suche (die mydealz-RSS-Suche gibt es nicht mehr). Alte Liste mit Suchwörtern -> Standard-Gruppen, [] = aus.
  const md = listen.mydealz;
  const mdGruppen = md === false ? [] : Array.isArray(md) ? (md.length ? MYDEALZ_GRUPPEN : []) : liste(md?.gruppen ?? MYDEALZ_GRUPPEN);
  const feeds = mydealzFeeds(mdGruppen, { maxAlterTage: 7 });
  if (feeds.length) {
    const { items, fehler: f } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: 7 });
    for (const x of f) melde('mydealz', x);
    for (const it of items) if (istAppleFilmDeal(it)) deals.push(it);
    status.mydealz.anzahl = deals.length;
  }
  const aktion = deals.length > 0;

  // 5) Titel bauen + Preis-Historie
  const titel = new Map(); // id -> Titel-Objekt
  const neueTiefst = new Set();
  const opts = { staffelZiel, angebotPreis: m.angebotPreis };
  function baue(id) {
    if (titel.has(id)) return titel.get(id);
    let t = null;
    // nur Chart-Daten (Details-Abruf fehlgeschlagen): ein Preis, ohne SD/HD-Aufteilung
    const c = chartTreffer.get(id)?.d;
    const d = daten.get(id) || (c ? { ...c, typ: 'film', preisSd: null, preisHd: null } : null);
    if (d) {
      const preis = d.preisHd ?? d.preisSd ?? d.preis ?? null;
      const { v, tiefstVorher, ersteBeobachtung } = merkeFilmPreis(zf, id, preis, tag, m.historieTage);
      const lage = { ...preisLage(v, preis, tag, { typ: d.typ, ...opts }), seit: v.seit };
      if (preis != null && tiefstVorher && !ersteBeobachtung && preis < tiefstVorher.p) neueTiefst.add(id);
      t = titelObjekt({ ...d, chart: chartTreffer.get(id)?.pos ?? null }, lage);
      t._hoechst = lage.hoechst; t._gesenkt = lage.gesenkt; t._horror = istHorror(d, horrorIds);
    } else {
      const a = altDaten.get(id) || chartTreffer.get(id)?.altTitel;
      if (a) { t = { ...a }; t._horror = istHorror(a, horrorIds); t._alt = true; }
    }
    if (t) titel.set(id, t);
    return t;
  }

  const gruppen = { wunsch: [], angebot: [], neu: [], achtziger: [], serien: [], disney: [] };
  const wunschIds = new Set(), kuratiert = new Map(); // id -> 'achtziger' | 'disney'
  const nachPreis = (a, b) => (b.angebot - a.angebot) || ((a.preis ?? Infinity) - (b.preis ?? Infinity));

  // Wunschliste: immer alle Titel
  for (const p of posten.filter(x => x.gruppe === 'wunsch')) {
    const s = zf.ids[p.key];
    const t = s?.id ? baue(s.id) : null;
    const ziel = preisWert(p.item.zielpreis) ?? zielpreis;
    if (t) {
      t.unterZiel = t.preis != null && t.preis <= ziel;
      t.ziel = ziel; // Zusatzfeld (nur Wunschliste): die Seite zeigt „dein Ziel: 4,99 €“
      wunschIds.add(t.id);
      gruppen.wunsch.push(t);
    } else {
      gruppen.wunsch.push({
        id: `wunsch:${slug(p.item.titel)}`, typ: 'film', titel: p.item.titel, jahr: p.item.jahr ?? null, ...NULL_TITEL, quelle: 'Apple',
        unterZiel: false, ziel, ...(s?.fehlt ? { fehlt: true } : {}),
      });
    }
  }
  // 80er / Kult und Disney
  for (const g of ['achtziger', 'disney']) {
    const gesehen = new Set();
    for (const p of posten.filter(x => x.gruppe === g)) {
      const id = zf.ids[p.key]?.id;
      if (!id || gesehen.has(id)) continue;
      const t = baue(id);
      if (!t || t._horror) continue;
      gesehen.add(id); kuratiert.set(id, kuratiert.get(id) || g);
      gruppen[g].push(t);
    }
    gruppen[g].sort(nachPreis);
  }
  // Serien: je Staffel ein Eintrag (günstigste Fassung), Angebote zuerst
  const serienReihe = new Map();
  posten.filter(x => x.serie).forEach((p, i) => serienReihe.set(p.item.titel, i));
  const staffeln = new Map();
  for (const p of posten.filter(x => x.serie)) {
    for (const id of liste(zf.ids[p.key]?.ids)) {
      const t = baue(id);
      if (!t || t._horror || t.typ !== 'staffel') continue;
      const d = daten.get(id);
      const k = `${p.item.titel}|${t.nr ?? t.titel}|${normTitel(d?.zusatz || '').replace(/\b(uncensored|unzensiert|remastered|omu|ov|hd|4k)\b/g, '').trim()}`;
      const vor = staffeln.get(k);
      const besser = !vor || (t.preis ?? Infinity) < (vor.preis ?? Infinity) || ((t.preis ?? Infinity) === (vor.preis ?? Infinity) && !(d?.zusatz) && !!daten.get(vor.id)?.zusatz);
      if (besser) staffeln.set(k, t);
    }
  }
  gruppen.serien = [...staffeln.values()].slice(0, 400)
    .sort((a, b) => (b.angebot - a.angebot) || ((serienReihe.get(a.serie) ?? 99) - (serienReihe.get(b.serie) ?? 99)) || ((a.nr ?? 0) - (b.nr ?? 0)));
  // Neu aus den Charts
  gruppen.neu = [...chartTreffer.entries()].filter(([, c]) => c.neu).sort((a, b) => a[1].pos - b[1].pos)
    .map(([id]) => baue(id)).filter(t => t && !t._horror && t.typ === 'film').slice(0, m.maxNeu);
  // Angebote: Filme ≤ 3,99 € (≤ 4,99 € bei Tiefstpreis oder laufender Apple-Aktion) – nur Kuratiertes oder Chart-Titel
  const kandidaten = new Map();
  for (const t of [...gruppen.wunsch, ...gruppen.achtziger, ...gruppen.disney]) if (t.id?.startsWith('itunes:')) kandidaten.set(t.id, t);
  for (const id of chartTreffer.keys()) { const t = baue(id); if (t) kandidaten.set(id, t); }
  const rang = t => (wunschIds.has(t.id) ? 0 : kuratiert.has(t.id) ? 1 : 2);
  gruppen.angebot = [...kandidaten.values()]
    .filter(t => t.typ === 'film' && !t._horror && t.preis != null && (t.preis <= m.angebotPreis
      || (t.preis <= m.angebotPreisAktion && ((t.istTiefst && t.tage >= 7 && (t._hoechst ?? 0) > t.preis) || (aktion && t._gesenkt)))))
    .sort((a, b) => rang(a) - rang(b) || ((a.chart ?? 999) - (b.chart ?? 999)) || (a.preis - b.preis))
    .slice(0, m.maxAngebot);
  for (const it of deals) {
    gruppen.angebot.push({
      id: `mydealz:${threadId(it.link) || schluessel(it.link)}`, typ: /staffel|season|serie/i.test(it.titel) ? 'staffel' : 'film',
      titel: it.titel.replace(/^\s*\[[^\]]{1,30}\]\s*/, '') || it.titel, jahr: null, // „[iTunes / Apple TV] …“ -> kurz
      ...NULL_TITEL, preis: preisWert(it.preisText), seit: tag, tage: 1, angebot: true, bild: it.bild || null, link: it.link, quelle: 'mydealz',
    });
  }

  // 6) Einträge für Seite und Push: nur echte Treffer
  const eintraege = [];
  const mitPreis = t => t && t.preis != null && t.link && !t._alt;
  const neuerEintrag = (t, { grund, wert, sofort, gruppe, zusatz = [] }) => {
    const p = preisAngaben({ preis: t.preis, preisVorher: t.vorher, vorherQuelle: 'zuletzt bei Apple TV' });
    const zeile = [
      p.preisVorher != null ? `Kaufen ${euro(t.preis)} statt ${euro(p.preisVorher)}` : `Kaufen ${euro(t.preis)}`,
      t.istTiefst && t.tage >= 7 ? 'Tiefstpreis' : '', t.leihe != null ? `Leihen ${euro(t.leihe)}` : '', ...zusatz,
    ].filter(Boolean).join(' · ');
    eintraege.push(eintrag({
      id: `film-${schluessel(t.id, String(t.preis))}`, kategorie: 'filme',
      titel: `${t.titel}${t.typ === 'film' && t.jahr ? ` (${t.jahr})` : ''} für ${euro(t.preis)}`,
      link: t.link, quelle: 'Apple TV', datum: jetzt, jetzt, art: 'deal', preise: p, zeile,
      soGehts: t.typ === 'staffel' ? SO_STAFFEL : SO_FILM, wert, sofort, grund,
      extra: { filmId: t.id, typ: t.typ, bild: t.bild, jahr: t.jahr, tiefst: t.tiefst?.p ?? null, gruppe },
    }));
  };
  const gemeldet = new Set();
  for (const t of gruppen.wunsch) {
    if (!mitPreis(t)) continue;
    gemeldet.add(t.id);
    if (t.unterZiel) neuerEintrag(t, { grund: 'Wunschfilm zum Zielpreis', wert: 95, sofort: true, gruppe: 'wunsch', zusatz: ['auf deiner Wunschliste'] });
    else if (neueTiefst.has(t.id)) neuerEintrag(t, { grund: 'Wunschfilm: neuer Tiefstpreis', wert: 88, sofort: true, gruppe: 'wunsch', zusatz: ['neuer Tiefstpreis', 'auf deiner Wunschliste'] });
  }
  for (const t of gruppen.serien) {
    if (!mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt) continue;
    gemeldet.add(t.id);
    if (t.preis <= staffelZiel) neuerEintrag(t, { grund: 'Staffel im Angebot', wert: 80, sofort: true, gruppe: 'serien' });
    else if (t.preis <= t.vorher * 0.7) neuerEintrag(t, { grund: 'Staffel billiger', wert: 60, sofort: false, gruppe: 'serien' });
  }
  for (const g of ['achtziger', 'disney']) {
    for (const t of gruppen[g]) {
      if (!mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt) continue;
      gemeldet.add(t.id);
      if (t.preis <= m.angebotPreis) neuerEintrag(t, { grund: g === 'disney' ? 'Disney-Film für 3,99 €' : 'Kultfilm für 3,99 €', wert: 80, sofort: true, gruppe: g });
      else if (t.preis <= t.vorher * 0.7 || neueTiefst.has(t.id)) neuerEintrag(t, { grund: 'Preis gesenkt', wert: 60, sofort: false, gruppe: g, zusatz: neueTiefst.has(t.id) ? ['neuer Tiefstpreis'] : [] });
    }
  }
  for (const t of gruppen.angebot) {
    if (t.quelle !== 'Apple' || !mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt) continue;
    gemeldet.add(t.id);
    neuerEintrag(t, { grund: 'Film im Angebot', wert: 50, sofort: false, gruppe: 'angebot', zusatz: t.chart ? [`Platz ${t.chart} der Charts`] : [] });
  }
  const wunschNamen = posten.filter(x => x.gruppe === 'wunsch').flatMap(p => namen(p.item).filter(x => x.faktor === 1).map(x => normTitel(x.n)));
  for (const it of deals) {
    const n = ` ${normTitel(`${it.titel} ${it.beschreibung || ''}`)} `;
    const wunsch = wunschNamen.some(w => n.includes(` ${w} `));
    const p = preisAngaben({ preis: preisWert(it.preisText) });
    eintraege.push(eintrag({
      kategorie: 'filme', titel: it.titel, link: it.link, quelle: 'mydealz', datum: it.datum, jetzt, bis: it.bis, ab: it.ab, art: 'deal',
      preise: p, zeile: ['Aktion bei Apple TV', p.preis != null ? `ab ${euro(p.preis)}` : '', wunsch ? 'mit einem Film von deiner Wunschliste' : ''].filter(Boolean).join(' · '),
      soGehts: SO_DEAL, wert: wunsch ? 85 : 60, sofort: wunsch, grund: wunsch ? 'Wunschfilm in einer Aktion' : 'Apple-Film-Aktion',
      extra: { gruppe: 'angebot', temperatur: it.temperatur ?? null },
    }));
  }
  eintraege.sort((a, b) => b.wert - a.wert);

  // 7) Aufräumen: Historie von Titeln, die lange nicht mehr gesehen wurden; IDs von Listen-Einträgen, die es nicht mehr gibt
  const grenze = tagMinus(tag, m.vergessenTage);
  for (const [id, v] of Object.entries(zf.preise)) if (!v?.zuletzt || v.zuletzt < grenze) delete zf.preise[id];
  const keys = new Set(posten.map(p => p.key));
  for (const k of Object.keys(zf.ids)) if (!keys.has(k)) delete zf.ids[k];
  for (const k of Object.keys(zf.charts)) if (!zf.charts[k]?.tag || zf.charts[k].tag < tagMinus(tag, 7)) delete zf.charts[k];

  const offen = posten.filter(p => { const s = zf.ids[p.key]; return !s || s.weiter != null; }).length;
  status['apple-suche'].offen = offen;
  status['apple-suche'].nichtGefunden = posten.filter(p => zf.ids[p.key]?.fehlt).map(p => p.item.titel).slice(0, 50);
  status['apple-preise'].abrufe = appleAbrufe;

  const sauber = t => Object.fromEntries(Object.entries(t).filter(([k, v]) => !k.startsWith('_') && v !== undefined));
  const datei = {
    version: 1,
    aktualisiert: new Date(jetzt).toISOString(),
    gruppen: Object.fromEntries(Object.entries(gruppen).map(([k, v]) => [k, v.map(sauber)])),
    status,
    hinweis: "Tiefstpreis = niedrigster Preis seit Beobachtungsbeginn (Datum in 'seit').",
  };
  return { eintraege: eintraege.slice(0, m.maxEintraege), fehler, datei };
}
