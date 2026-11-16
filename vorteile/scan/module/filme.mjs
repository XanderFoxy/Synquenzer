// Modul "filme": Filme & Serien bei Apple TV (iTunes Store Deutschland) für Xander.
// Gruppen: Wunschfilme (immer alle), Angebote (≤ 3,99 €), neue Filme aus den Charts (Komödie, Action, Thriller, Sci-Fi),
// 80er-/Kult-Klassiker, Staffeln (Rick and Morty, Star Trek) und Disney – mit eigener Preis-Historie (Tiefstpreis).
// Listen: vorteile/filme.json (frei änderbar). Ergebnis: Einträge nur für echte Treffer + eigene Datei filme.json
// (Rückgabefeld „datei“; main.mjs schreibt sie nach <data>/filme.json). Horror kommt nie auf die Seite (außer Wunschliste).
// Quellen, alle über holeText (Roh-Mitschnitt): iTunes Search API (DE + US), iTunes Lookup, Legacy-Charts (RSS als JSON),
// Wikidata (P6398 = iTunes movie ID), mydealz-Gruppen (apple-tv, filme-serien), Apple-TV-Angebotsräume (tv.apple.com/de/room,
// z. B. „Filme für 3,99 €“; filme.json „appleTv“) – Abgleich mit Wunsch-, 80er- und Disney-Liste (Xander 08.11.2026).
// Apple-Nummern ohne die kaputte Film-Suche: siehe Schritt 3 (Wege de → us → wikidata → charts) und QUELLEN-FIX.md.
// Höflich: höchstens maxAppleAbrufe pro Lauf, höchstens maxSuchen Suchen, maxNeueTitel neue Titel, Zeitbudget; Pause pro
// Host in lib/http.mjs; nach 3 Apple-Fehlern in Folge kein weiterer Apple-Abruf in diesem Lauf.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePrice, euro, round, schluessel } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { preisAngaben, threadId, altpreisAusText, dealPruefer } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, mydealzFeeds } from './gemeinsam.mjs';
import { raumLinks, raumFilme, raumName, raumPreis, passtZuListe, slugVon } from '../lib/appletv.mjs';

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
  // Übersicht (Xander 14.11.2026): Angebote in seinen Genres = Kauf ≤ 7,99 € oder deutlich unter dem bisherigen Preis
  angebotMax: 7.99,
  deutlichFaktor: 0.7, // ≤ 70 % des zuletzt/höchsten gesehenen Preises = „deutlich unter Normalpreis“
  maxGruppe: 40, // Titel je Genre-Gruppe auf der Seite
  // Qualität (nur Chart-Titel; deine Listen gelten immer): Wikidata – Bekanntheit (Wikipedia-Sprachen), Rotten Tomatoes, Horror
  qualitaet: true,
  qualiMaxAbrufe: 12, // Wikidata-Abfragen pro Lauf (12 × 15 = 180 ≥ Chart-Titel eines Laufs) (Rest im nächsten Lauf; das Ergebnis bleibt qualiTage im Zustand)
  qualiJeAbfrage: 15, // Titel je Abfrage (Namenssuche kostet Wikidata Zeit)
  qualiTage: 30,
  qualiFehltTage: 7, // nicht bei Wikidata gefunden -> so lange nicht neu fragen
  qualiRt: 60, // Rotten Tomatoes ab 60 % = guter Film
  qualiBekannt: 30, // ohne Bewertung: in so vielen Wikipedia-Sprachen = bekannter Film
  qualiBekanntNeu: 12, // neue Filme (≤ neuMonate) haben noch weniger Artikel
  qualiBlockbuster: 55, // so bekannt, dass er trotz schwacher Kritik bleibt (Popcorn-Kino)
  qualiOhneDatenPlatz: 15, // ohne Wikidata-Daten nur, wer so weit oben in den Apple-Charts steht
  // Boxen und alle Serien (Xander 15.11.2026: „alle Filmboxen und alle Serien, die gerade Preisknüller sind“)
  boxMax: 150, // Box-Nummern je Lookup-Abruf (Boxen kennt der Radar aus den Film-Lookups: collectionId)
  boxAbrufe: 2, // Box-Lookups pro Lauf (am längsten nicht geprüfte zuerst)
  serienPoolMax: 300, // Staffeln aus den Serien-Charts, deren Preis jeder Lauf weiter verfolgt (2 Lookups)
  maxBoxen: 40, // Boxen auf der Seite
  maxSerienAngebot: 60, // Staffeln anderer Serien im Angebot
  // Marke „Knüller“ – nur mit echtem Grund aus der eigenen Historie (FILME-NOTES.md)
  knuellerPct: 30, // mindestens so viel % unter dem üblichen Preis …
  knuellerTage: 7, // … und mindestens so viele Tage beobachtet (vorher gibt es keinen „üblichen“ Preis)
  knuellerTiefstTage: 14, // „so günstig wie nie“ zählt erst nach so vielen Tagen Beobachtung
  boxJeFilmKnueller: 2.5, // Box gesenkt und höchstens so viel je Film
  // Prüfer 15.11.: Box-/Staffel-Knüller nur bei echter, frischer Senkung – nicht nach einem Kurz-Hoch, nicht bei −5 %, nicht ewig
  knuellerMinPct: 20, // Box/Staffel/„so günstig wie nie“: mindestens so viel % unter dem Vergleichspreis
  knuellerFrischTage: 14, // Box/Staffel: der gesenkte Preis gilt erst seit weniger als so vielen Tagen
  angebotMinPct: 10, // Boxen/andere Serien „im Angebot“: mindestens so viel % unter dem üblichen (bzw. frisch unter dem letzten) Preis
  neuEntdecktTage: 3, // Staffel aus den Serien-Charts, so kurz erst beobachtet: „neu entdeckt, noch ohne Preisvergleich“
  // Breite Suche (Xander 16.11.2026: „wirklich alles, was wirklich da ist“): Top 200 JE GENRE (Filme und Staffeln, filme.json
  // charts.breit) – nur ZUSÄTZLICH zum bisherigen Weg. Der bisherige Weg sieht genau dieselben Daten wie vorher (Top 100 der
  // bisherigen Genres); neue Treffer werden angehängt, Doppel fallen weg, und alte Treffer verdrängt nie ein neuer (eigene Kappen).
  breitMaxCharts: 18, // Genre-Charts pro Lauf (am längsten nicht geholte zuerst; der Rest im nächsten Lauf)
  breitMaxLookups: 4, // Lookup-Abrufe für Kandidaten (je lookupMax Nummern)
  breitGesamtMax: 40, // alle Apple-Abrufe des Laufs zusammen (bisheriger Weg + breit)
  breitBisSek: 150, // danach keine breiten Abrufe mehr (main bricht ein Modul nach 240 s ab)
  breitQualiAbrufe: 8, // Wikidata-Abfragen (Qualität) nur für neue Kandidaten, nach denen des bisherigen Wegs
  breitQualiBisSek: 200,
  breitMerkTage: 1, // Kandidaten eines Genres, das in diesem Lauf nicht dran war, so lange weiter prüfen (Preis per Lookup)
  breitLeerTage: 7, // Genre ohne Einträge (gibt es im deutschen Store nicht) so lange ruhen lassen
  breitVergessenTage: 30, // Chart-Preis-Historie (zf.breit.p) danach löschen
  breitMaxFuer399: 100, // „Für 3,99 €“ gesamt (die bisherigen Treffer zählen weiter gegen maxGruppe und werden nie verdrängt)
  breitMaxGruppe: 60, // Action/Comedy gesamt
  breitMaxAngebot: 120, // „angebot“ gesamt
  breitMaxSerien: 30, // Staffeln mit echter Senkung aus den Genre-Charts
  // Große Produktion/Kinohit und Besetzung (Xander 16.11.2026: Filter „nur bekannte“, „nach Schauspieler“) – Wikidata, siehe grossGrund
  details: true,
  detailMaxAbrufe: 4, // Abfragen pro Lauf (4 × 25 = 100 Filme; Rest im nächsten Lauf, Ergebnis bleibt detailTage im Zustand)
  detailJeAbfrage: 25,
  detailTage: 30,
  detailBisPreis: 4.99, // nur Filme bis zu diesem Preis (die Seite zeigt nur noch 3,99-€-Filme)
  detailBisSek: 205,
  mdAppleWikidata: true, // mydealz-Tipp ohne gleichnamigen Apple-Film in diesem Lauf: 1 Wikidata-Abfrage + 1 Lookup (aus = false)
};

export const sucheUrl = (term, staffel = false, limit = STANDARD.sucheLimit, land = 'de') =>
  `${APPLE}/search?term=${encodeURIComponent(term)}&country=${land}&media=${staffel ? 'tvShow' : 'movie'}&entity=${staffel ? 'tvSeason' : 'movie'}&limit=${staffel ? 50 : limit}`;
export const lookupUrl = (ids, land = 'de') => `${APPLE}/lookup?id=${ids.map(i => String(i).replace(/^itunes:/, '')).join(',')}&country=${land}`;
export const chartUrl = (genre, limit = 100) => `${APPLE}/de/rss/topmovies/limit=${limit}/genre=${genre}/json`;
// Serien-Charts (Legacy-RSS „toptvseasons“, gleiches Format wie topmovies; ohne Genre = alle Serien) – Format im Roh-Lauf prüfen
export const serienChartUrl = (genre, limit = 100) => `${APPLE}/de/rss/toptvseasons/limit=${limit}${genre ? `/genre=${genre}` : ''}/json`;
// Reihenfolge der Gruppen in filme.json (die Seite zeigt: Wunschliste · Für 3,99 € · Action & Thriller · Comedy · 80er & Klassiker
// · Disney · Serien; „angebot“ und „neu“ bleiben für ältere Fassungen der Seite)
// „boxen“ (15.11.2026) steht hinten: ältere Seiten kennen die Gruppe nicht und lassen sie weg
export const GRUPPEN_REIHE = ['wunsch', 'fuer399', 'action', 'comedy', 'achtziger', 'disney', 'serien', 'angebot', 'neu', 'boxen'];
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

// ---------------------------------------------------------------- Qualität (Wikidata) – „richtig geile Filme, nicht irgendein Quatsch“
// Für Chart-Titel (nicht für deine Listen): Bekanntheit = Zahl der Wikipedia-Sprachen (wikibase:sitelinks), Kritik = Rotten
// Tomatoes (P444 „review score“ mit P447 = Q105584), Horror = Genre (P136) ist Horrorfilm Q200092 oder eine Unterart davon,
// Kinderfilm = Genre ist Kinderfilm Q2143665 oder Familienfilm Q1361932 (oder eine Unterart davon) – Animation allein nicht.
// Gefunden wird der Film über die Apple-Nummer (P6398, oft die US-Nummer) ODER die Namenssuche (wbsearchentities über
// Bezeichnung/Alias deutsch oder englisch, nur Filme); bei der Namenssuche müssen Name und Jahr passen (Jahr ±1, sonst ein älterer Film = Wiederveröffentlichung).
export const HORROR_TEXT = /horror(?!\s*!)|grusel|schocker|slasher|zombie|exorzis|okkult|satanis|paranormal|poltergeist|d(?:ä|ae)mon(?:en|isch\w*)?\b/i;
// schwache Zeichen: einzeln harmlos („unheimlich“, „Albtraum“); zwei verschiedene = Horror-Verdacht. Der zählt, wenn Wikidata
// den Film nicht kennt oder gestört ist (Apple führt Horror oft als „Thriller“: Midsommar, The Autopsy of Jane Doe); kennt
// Wikidata ihn, entscheidet dort das Genre (Serenity: „grauenhaft“ + „Kannibalen“, aber Science-Fiction).
export const HORROR_SCHWACH = /unheimlich|grauenvoll|grauenhaft|verstümmel|eingeweide|bösartige?n? (?:kraft|macht|wesen|präsenz)|übernatürlich|al[bp]tr(?:a|ä)um|heimgesucht|besessen|ritual|vampir|folter|kannibal|untote/gi;
// bildlich gemeint, kein Horror: „kämpft mit seinen inneren Dämonen“, „Dämonen seiner Vergangenheit“, Rollennamen („Dämon“)
const HORROR_BILDLICH = /(?:inneren|eigenen|persönlichen|seine[nmr]?|ihre[nmr]?)\s+d(?:ä|ae)monen|d(?:ä|ae)monen\s+(?:seiner|ihrer|der)\s+vergangenheit|\(\W*d(?:ä|ae)mon\W*\)/gi;
/** Horror aus der Apple-Beschreibung: 0 = nein, 1 = ein schwaches Zeichen, 2 = zwei schwache (Verdacht), 3 = klares Wort. Komödien und Kinderfilme
 *  (Ghostbusters, Hotel Transsilvanien, Harry Potter) prüft das nicht – dort sind Geister und Dämonen Spaß. */
export function horrorText(text, genre = '') {
  if (/kom(?:ö|oe)die|comedy|kinder|familie|musical|animation/i.test(String(genre ?? ''))) return 0;
  const t = String(text ?? '').replace(HORROR_BILDLICH, ' ');
  if (HORROR_TEXT.test(t)) return 3;
  const schwach = new Set((t.match(HORROR_SCHWACH) || []).map(x => x.toLowerCase().slice(0, 5))).size;
  return schwach >= 2 ? 2 : schwach;
}
const FILM_TYPEN = 'wd:Q11424 wd:Q29168811 wd:Q24869 wd:Q506240 wd:Q202866 wd:Q226730';

// Kinderfilme gehören nicht unter „Neu“ (Xander, Prüfer-Befund MV8 11: Woodwalkers 2, Die Schule der magischen Tiere 4,
// Vaiana – Apple führt sie als „Action“; Disney hat einen eigenen Bereich). Drei Zeichen, keins kostet einen Abruf extra:
// Apple-Chart „Kinder & Familie“ (charts.kinder, Standard 4410: gleiche Nummer oder gleiche Reihe), Wikidata-Genre
// (KINDER_GENRES, Flag k im Zustand), Apple-Genre.
// Animation allein heißt nicht Kinderfilm (Prüfer MV10 1): Animationsfilm Q202866 mit allen Unterarten (P279*) umfasst auch
// Anime und Animation für Erwachsene – „Felidae“ (FSK 16), „Animatrix“, „Final Fantasy – Die Mächte in dir“, „Kingsglaive“ aus
// den echten Charts vom 07.11.2026 wären bei einer Wiederveröffentlichung aus „Neu“ gefallen. Animierte Kinderfilme erkennt
// das Kinder-Chart (Titel/Reihe) oder Wikidatas Kinder-/Familienfilm-Genre.
export const KINDER_GENRES = ['wd:Q2143665', 'wd:Q1361932']; // Kinderfilm, Familienfilm
export const KINDER_TEXT = /kinder|familie/i;
/** Reihe eines Titels (ohne Folgenummer) für den Abgleich mit dem Kinder-Chart: „Woodwalkers 2“ -> „woodwalkers“, „Die Schule
 *  der magischen Tiere 4“ wie Teil 3 im Chart, „Vaiana“ (2026) wie „Vaiana 2“. Echtes Kinder-Chart 07.11.2026: dort stehen die
 *  früheren Teile als „Kinder und Familie“, die neuen führt Apple als „Action“. Untertitel bleiben („Spider-Man: Brand New Day“
 *  ≠ „Spider-Man: A New Universe“), Jahreszahlen auch („Blade Runner 2049“ ≠ „Blade Runner“). */
export function kinderReihe(titel) {
  const w = [...titelTokens(suchName(titel))];
  if (w.length > 1 && /^\d{1,2}$/.test(w.at(-1))) w.pop();
  while (w.length > 1 && /^(?:\||teil|part|kapitel)$/.test(w.at(-1))) w.pop();
  return w.join(' ');
}
/** Warum Kinderfilm? -> 'kinder-chart' | 'reihe' | 'apple-genre' | 'wikidata' | null. kinderChart = steht im Kinder-Chart
 *  (true / 'kinder-chart' = gleiche Nummer, 'reihe' = gleiche Reihe), genres = Apple-Genre-Texte, q = Wikidata (Zustand,
 *  null = keine Daten; kinder null = unbekannt). */
export function kinderGrund({ kinderChart = false, genres = [], q = null } = {}) {
  if (kinderChart) return typeof kinderChart === 'string' ? kinderChart : 'kinder-chart';
  if (genres.some(g => KINDER_TEXT.test(String(g ?? '')))) return 'apple-genre';
  return q?.kinder === true ? 'wikidata' : null;
}
export const kinderfilm = o => kinderGrund(o) != null;

/** Apple-Titel für die Namenssuche: „Charade (1963)“ -> „Charade“, „Jungs Von Spinal Tap, Die“ -> „Die Jungs Von Spinal Tap“,
 *  „THX 1138 (Director's Cut)“ -> „THX 1138“, „The Outfit -- Verbrechen nach Maß“ -> „The Outfit“. */
export function suchName(titel) {
  let s = String(titel ?? '').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*\((?:19|20)\d\d\)\s*/g, ' ').trim();
  s = s.replace(/\s*[(\[]\s*(?:extended|director'?s|uncut|remastered|kinofassung|special|ungek|omu|ov\b|4k|uhd)[^)\]]*[)\]]\s*$/i, '');
  s = s.replace(/\s+(?:-\s*)?(?:extended|uncut|director'?s)\s+(?:cut|edition|version|fassung)\s*$/i, '');
  s = s.replace(/\s+--\s+.*$/, '');
  const m = s.match(/^(.*?),\s*(Der|Die|Das|The)$/i);
  if (m) s = `${m[2]} ${m[1]}`;
  return s.trim();
}
/** Jahr aus dem Titel („Meteor (1979)“), sonst null – Apples Datum ist bei alten Filmen oft die Wiederveröffentlichung. */
export const jahrImTitel = t => { const x = String(t ?? '').match(/\((19\d\d|20\d\d)\)/); return x ? Number(x[1]) : null; };

/** SPARQL für bis zu qualiJeAbfrage Titel: [{ nr: '123', name: 'Charade' }] -> eine Zeile je (Titel, Wikidata-Film). */
export function qualiAbfrage(titel) {
  const ids = titel.map(t => sparqlText(t.nr)).join(' ');
  // Name genau wie Bezeichnung/Alias (deutsch oder englisch) – wie der Weg „wikidata“, der im echten Lauf antwortet.
  // (Die mwapi-Namenssuche brach im echten Lauf 14.11.2026 mit HTTP 500 ab: „Could not find binding for parameter search“.)
  const namen = titel.flatMap(t => ['de', 'en'].map(l => `(${sparqlText(t.nr)} ${sparqlText(t.name)}@${l})`)).join(' ');
  return 'SELECT ?key ?weg ?item ?l (MIN(?j) AS ?jahr) (MAX(?h0) AS ?h) (MAX(?k0) AS ?k) (GROUP_CONCAT(DISTINCT ?rt0; separator="|") AS ?rt) '
    // feste Reihenfolge: erst die paar Filme (Nummer/Name), dann je Film Genre/Kritik – sonst rechnet Wikidata erst alle
    // Horrorfilme der Welt aus (2. echter Lauf 14.11.2026: Zeitüberschreitung nach 20 s)
    + '(GROUP_CONCAT(DISTINCT ?lab0; separator="|") AS ?lab) WHERE { hint:Query hint:optimizer "None" . '
    + `{ VALUES ?key { ${ids} } ?item wdt:P6398 ?key . BIND("id" AS ?weg) } UNION `
    + `{ VALUES (?key ?suche) { ${namen} } ?item rdfs:label|skos:altLabel ?suche . `
    + `?item wdt:P31 ?typ . VALUES ?typ { ${FILM_TYPEN} } BIND("name" AS ?weg) } `
    + '?item wikibase:sitelinks ?l . '
    // Kinderfilm: von den paar Genres des Films aufwärts (nicht alle Unterarten abwärts); als EXISTS genau eine Zeile je Film
    // (Prüfer MV10 4: ein OPTIONAL vervielfacht bei 3–5 passenden Genres alle späteren Blöcke); vor den Erscheinungsdaten
    + `BIND(IF(EXISTS { ?item wdt:P136 ?kg . ?kg wdt:P279* ?kz . FILTER(?kz IN (${KINDER_GENRES.join(', ')})) }, 1, 0) AS ?k0) `
    + 'OPTIONAL { ?item wdt:P577 ?d . BIND(YEAR(?d) AS ?j) } '
    + 'OPTIONAL { ?item wdt:P136 ?gen . ?gen wdt:P279* wd:Q200092 . BIND(1 AS ?h0) } '
    + 'OPTIONAL { ?item p:P444 ?st . ?st pq:P447 wd:Q105584 ; ps:P444 ?rt0 . } '
    + 'OPTIONAL { ?item rdfs:label ?lab0 . FILTER(LANG(?lab0) = "de" || LANG(?lab0) = "en") } '
    + '} GROUP BY ?key ?weg ?item ?l LIMIT 2000';
}

/** Antwort -> [{ key, weg, item, l, jahr, horror, kinder, rt, namen }] (Zeilen ohne Schlüssel fallen weg). */
export function leseQuali(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('keine gültige Wikidata-Antwort'); }
  const b = j?.results?.bindings;
  if (!Array.isArray(b)) throw new Error('Wikidata-Antwort ohne results.bindings');
  const out = [];
  for (const r of b) {
    const key = String(r?.key?.value ?? '').trim();
    const l = Number(r?.l?.value);
    if (!/^\d{5,12}$/.test(key) || !Number.isFinite(l)) continue;
    const jahr = Number(r?.jahr?.value);
    const rts = String(r?.rt?.value ?? '').split('|').map(x => x.trim().match(/^(\d{1,3})\s*%$/)).filter(Boolean).map(x => Number(x[1])).filter(x => x <= 100);
    out.push({
      key, weg: r?.weg?.value === 'id' ? 'id' : 'name', item: String(r?.item?.value ?? '').replace(/^.*\//, '') || null, l,
      jahr: Number.isInteger(jahr) && jahr > 1880 && jahr < 2100 ? jahr : null, horror: Number(r?.h?.value) === 1,
      kinder: Number(r?.k?.value) === 1, rt: rts.length ? Math.max(...rts) : null, namen: String(r?.lab?.value ?? '').split('|').map(x => x.trim()).filter(Boolean),
    });
  }
  return out;
}

/** Passender Wikidata-Film für einen Apple-Titel ({ nr, name, jahr }) -> { l, horror, kinder, rt, item, jahr } | null. */
export function qualiWahl(zeilen, t) {
  const eigene = zeilen.filter(z => z.key === t.nr);
  const best = l => l.sort((a, b) => b.l - a.l)[0] || null;
  const perId = best(eigene.filter(z => z.weg === 'id'));
  const wahl = z => ({ l: z.l, horror: z.horror, kinder: !!z.kinder, rt: z.rt, item: z.item, jahr: z.jahr ?? null });
  if (perId) return wahl(perId);
  const passName = z => z.namen.some(n => namensWert(n, t.name) >= 85 || namensWert(t.name, n) >= 85);
  const kand = eigene.filter(z => z.weg === 'name' && passName(z));
  if (!kand.length) return null;
  let w = null;
  if (t.jahr) {
    w = best(kand.filter(z => z.jahr != null && Math.abs(z.jahr - t.jahr) <= 1))
      || best(kand.filter(z => z.jahr != null && z.jahr < t.jahr)); // Apple-Datum = Wiederveröffentlichung („Dirty Harry“ 2014)
  } else w = best(kand);
  return w ? wahl(w) : null;
}

/** Horror-Verdacht aus der Beschreibung (ht = horrorText 0–3) zusammen mit Wikidata (q = Zustand, null = keine Daten):
 *  klares Wort immer; zwei schwache Zeichen, wenn Wikidata nichts sagt (gestört oder nicht gefunden); EIN schwaches Zeichen,
 *  wenn Wikidata den Film sicher nicht kennt (l < 0) – „Kraken: Erwachen der Tiefe“ („Alptraum“) und „Flight 298“
 *  („unheimliche“) standen so unter „Neu“ (Prüfer-Befund MV8 1). Bekannte Filme (Fluch der Karibik: „Untote“) bleiben. */
export function horrorVerdacht(ht, q) {
  if (ht >= 3) return true;
  const kennt = !!(q && q.l >= 0);
  if (ht >= 2 && !kennt) return true;
  return ht >= 1 && !!q && !(q.l >= 0);
}

/** Push-Titel eines Films: „Dirty Harry (1971) für 3,99 €“; steht schon ein Jahr im Titel, kein zweites
 *  (nicht „Charade (1963) (1963)“, nicht „Scarface (1983) (1984)“). */
export const filmPushTitel = t => `${t.titel}${t.typ === 'film' && t.jahr && jahrImTitel(t.titel) == null ? ` (${t.jahr})` : ''} für ${euro(t.preis)}`;

/** mydealz-Tipp zu genau einem Film, der schon als Apple-Titel in der Liste steht („Flow ~ 3,99€ | UHD …“ neben „Flow“)?
 *  Sets („6 Filme …“) nie; nach dem Apple-Titel muss ein Trenner folgen (~ | : ( , Preis, „für“), sonst schluckt „Up“ „Up to 5 …“. */
export function doppelTipp(mdTitel, appleTitel) {
  const klein = s => String(s ?? '').toLowerCase().replace(/\s*\((?:1[89]|20)\d\d\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (preisJeFilm(mdTitel, 1) != null && preisJeFilm(mdTitel, 1) < 1) return false; // Set
  const m = klein(mdTitel);
  return appleTitel.map(klein).filter(a => a.length >= 2)
    .some(a => m.startsWith(a) && /^(?:\s*$|\s*[~|:(\[,–—-]|\s+(?:für|for|ab|nur)\b|\s*\d)/.test(m.slice(a.length)));
}

/** Urteil für einen Chart-Titel: true = gut genug für die Seite. q = Zustand (null = keine Daten, l < 0 = nicht gefunden). */
export function qualiOk(q, { chart = null, neu = false } = {}, m = STANDARD) {
  const oben = chart != null && chart <= m.qualiOhneDatenPlatz;
  if (!q || !(q.l >= 0)) return oben;
  if (q.horror) return false;
  if (q.rt != null) return q.rt >= m.qualiRt || q.l >= m.qualiBlockbuster;
  return q.l >= (neu ? m.qualiBekanntNeu : m.qualiBekannt) || (neu && oben);
}
/** Sortierwert (höher = besser): Kritik und Bekanntheit. */
export const qualiWert = q => (q && q.l >= 0 ? (q.rt ?? 55) + Math.min(q.l, 120) / 2 : 0);

// ---------------------------------------------------------------- Große Produktion? Besetzung (Xander 16.11.2026: „Filter, um
// Indie-Produktionen auszublenden – nur bekannte große Produktionen/Kinohits; nach Schauspieler filtern“)
// Eine Abfrage je bis zu detailJeAbfrage Filme über die Wikidata-Nummer (Q…), die der Qualitäts-Schritt schon gefunden hat:
// Einspielergebnis (P2142), Auszeichnungen (P166), Produktionsfirma (P272), Verleih (P750), Besetzung (P161, mit Bekanntheit der
// Schauspieler = Wikipedia-Sprachen). Je Eigenschaft eigene Zeilen (UNION) – kein Kreuzprodukt wie bei vielen OPTIONAL.
// Große Studios und Verleiher (englische Wikidata-Namen): Hollywood-Majors mit Töchtern und die großen deutschen/europäischen Häuser
export const GROSSE_STUDIOS = /\b(?:warner bros|warner brothers|new line cinema|castle rock|universal pictures|universal studios|focus features|illumination|dreamworks|paramount|20th century|twentieth century|columbia pictures|tristar|sony pictures|screen gems|walt disney|disney|pixar|marvel studios|lucasfilm|touchstone pictures|hollywood pictures|buena vista|metro-goldwyn-mayer|mgm|united artists|lionsgate|lions gate|summit entertainment|legendary|amblin|miramax|orion pictures|new regency|regency enterprises|village roadshow|skydance|eon productions|working title|imagine entertainment|carolco|constantin film|neue constantin|ufa|bavaria film|studio babelsberg|x filme|wiedemann & berg|rat pack filmproduktion|studiocanal|gaumont|path[eé]|europacorp)\b/i;
export const detailUrlMax = 7000;
export function detailAbfrage(qids) {
  const werte = [...new Set(qids.filter(q => /^Q\d{1,12}$/.test(String(q))))].map(q => `wd:${q}`).join(' ');
  const label = '?x rdfs:label ?wert . FILTER(LANG(?wert) = "en")';
  return 'SELECT ?item ?art ?wert ?n WHERE { '
    + `VALUES ?item { ${werte} } `
    + '{ ?item wdt:P2142 ?wert . BIND("b" AS ?art) } '
    + `UNION { ?item wdt:P166 ?x . ${label} BIND("a" AS ?art) } `
    + `UNION { ?item wdt:P272 ?x . ${label} BIND("s" AS ?art) } `
    + `UNION { ?item wdt:P750 ?x . ${label} BIND("v" AS ?art) } `
    + `UNION { ?item wdt:P161 ?x . ?x wikibase:sitelinks ?n . ${label} BIND("c" AS ?art) } `
    + '} LIMIT 8000';
}
/** Antwort -> Map(Q… -> { b: höchstes Einspielergebnis, a: [Auszeichnungen], s: [Studios], v: [Verleih], c: [{ name, n }] }). */
export function leseDetails(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('keine gültige Wikidata-Antwort'); }
  const b = j?.results?.bindings;
  if (!Array.isArray(b)) throw new Error('Wikidata-Antwort ohne results.bindings');
  const out = new Map();
  for (const r of b) {
    const q = String(r?.item?.value ?? '').replace(/^.*\//, '');
    const art = r?.art?.value, w = String(r?.wert?.value ?? '').trim();
    if (!/^Q\d+$/.test(q) || !w) continue;
    const d = out.get(q) || { b: null, a: [], s: [], v: [], c: [] };
    out.set(q, d);
    if (art === 'b') { const z = Number(w); if (Number.isFinite(z) && z > 0) d.b = Math.max(d.b ?? 0, z); }
    else if (art === 'a' || art === 's' || art === 'v') { if (!d[art].includes(w)) d[art].push(w); }
    else if (art === 'c' && !d.c.some(x => x.name === w)) d.c.push({ name: w, n: Number(r?.n?.value) || 0 });
  }
  return out;
}
/** Rohdaten einer Abfrage -> kurzer Eintrag für den Zustand (zf.detail[Q]): b = Einspielergebnis in Mio. (gerundet), o = Oscars,
 *  g = Golden Globes, a = Auszeichnungen gesamt, st = Studio (das große zuerst), gs = 1 bei großem Studio/Verleih,
 *  c = die bekanntesten Schauspieler (höchstens 8, nach Wikipedia-Sprachen). */
export function detailKurz(d, tag) {
  const studios = [...d.s, ...d.v];
  const gross = studios.find(x => GROSSE_STUDIOS.test(x));
  return {
    b: d.b != null ? Math.round(d.b / 1e6) : null,
    o: d.a.filter(x => /^Academy Award for /i.test(x)).length,
    g: d.a.filter(x => /^Golden Globe Award for /i.test(x)).length,
    a: d.a.length,
    st: (gross || d.s[0] || null)?.slice(0, 40) ?? null,
    gs: gross ? 1 : 0,
    c: [...d.c].sort((x, y) => y.n - x.n).slice(0, 8).map(x => x.name.slice(0, 40)),
    tag,
  };
}
/**
 * „Große Produktion oder Kinohit?“ – Grund oder null. l = Wikipedia-Sprachen (Bekanntheit), d = detailKurz (oder null).
 * Schwellen (an echten Daten 16.11.2026 geprüft, siehe test/filme-bekannt.test.mjs):
 *  kinohit     Einspielergebnis ≥ 50 Mio. (Wikidata, meist US-$) – ein Kinoerfolg, egal welches Studio
 *  studio      großes Studio/großer Verleih UND ≥ 20 Wikipedia-Sprachen – eine große Produktion, kein Video-Ableger
 *  weltbekannt ≥ 60 Wikipedia-Sprachen – auch ohne Zahlen bekannt (Klassiker, Kultfilme)
 *  oscar       mindestens ein Oscar UND ≥ 45 Sprachen – preisgekrönt und bekannt
 * Ohne Wikidata-Treffer (l < 0 / null): nicht „bekannt“ (lieber einen Film zu wenig als Indie-Ramsch).
 */
export function grossGrund(l, d) {
  if (!(l >= 0)) return null;
  if (d?.b != null && d.b >= 50) return 'kinohit';
  if (d?.gs && l >= 20) return 'studio';
  if (l >= 60) return 'weltbekannt';
  if (d?.o >= 1 && l >= 45) return 'oscar';
  return null;
}

/** Apple-Genre -> Gruppe der Seite: 'action' (Action, Abenteuer, Thriller, Krimi, Sci-Fi, Western, Krieg) | 'comedy' | null */
export function genreGruppe(genre) {
  const g = String(genre ?? '');
  if (/kom(?:ö|oe)die|comedy/i.test(g)) return 'comedy';
  if (/action|abenteuer|thriller|krimi|science|sci-?fi|fantasy|western|krieg|spionage/i.test(g)) return 'action';
  return null;
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

// Komplett-Boxen einer Serie („Die komplette Serie“, „The Complete Series“) – Apple führt sie als „TV Season“ ohne Nummer
const KOMPLETT = /\b(?:die\s+)?komplette\s+(?:serie|staffeln|box)\b|\bcomplete\s+(?:series|collection|seasons?\s*\d+\s*[-–]\s*\d+)\b|\bkomplettbox\b|\bgesamtbox\b|\bstaffeln?\s+\d+\s*[-–]\s*\d+\b|\bseasons\s+\d+\s*[-–]\s*\d+\b/i;
/** "Rick and Morty – Die komplette Serie" -> { serie, nr: null, zusatz: 'komplett' } | null */
export function komplettInfo(name) {
  const s = String(name ?? '');
  const m = KOMPLETT.exec(s);
  if (!m) return null;
  const serie = s.slice(0, m.index).replace(/[\s,:–—(\[-]+$/, '').replace(/\b(?:the|die|das)\s*$/i, '').replace(/[\s,:–—(\[-]+$/, '').trim();
  return { serie, nr: null, zusatz: 'komplett' };
}

/** Staffeln einer Serie aus Suchergebnissen (nur genau diese Serie, nicht Ableger). */
export function staffelnAus(ergebnisse, item) {
  const ziel = new Set(namen(item).filter(x => x.faktor === 1).map(x => normTitel(x.n)));
  const out = [];
  for (const r of ergebnisse) {
    const d = ausItunes(r);
    if (!d || d.typ !== 'staffel') continue;
    const info = (d.komplett && komplettInfo(d.titel)) || staffelInfo(d.titel) || komplettInfo(d.titel);
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

/**
 * Box eines Films: Liegt ein Film in einer Box, nennt sein Lookup collectionId/collectionName/trackCount (echter Lauf
 * 43653935144: 140 von 274 Filmen, 105 Boxen). collectionPrice dort ist NICHT der Box-Preis (102 von 140 = Filmpreis,
 * „Indiana Jones 4-Movie Collection“ 9,99 € statt 14,99 €) – den holt erst der Box-Lookup über die collectionId.
 */
export function boxVon(r) {
  if (!r || r.wrapperType !== 'track' || !r.collectionId || !r.collectionName || String(r.collectionId) === String(r.trackId)) return null;
  const filme = Number(r.trackCount);
  if (!Number.isInteger(filme) || filme < 2) return null;
  return { id: `itunes:${r.collectionId}`, name: String(r.collectionName).trim(), filme };
}

/** Ein Ergebnis der Search-/Lookup-API (Film, Staffel oder Film-Box) -> einheitliche Daten, sonst null. */
export function ausItunes(r) {
  if (!r || typeof r !== 'object') return null;
  const film = r.wrapperType === 'track' && (r.kind === 'feature-movie' || (!r.kind && r.trackName));
  const staffel = r.wrapperType === 'collection' && /season/i.test(String(r.collectionType || ''));
  // Film-Box (Box-Lookup über die collectionId): „collection“, aber keine Staffel und keine Musik/Bücher. Format im Roh-Lauf prüfen.
  const box = r.wrapperType === 'collection' && !staffel && !/album|compilation|podcast|book|software|audiobook/i.test(String(r.collectionType || ''));
  if (film && r.trackId && r.trackName) {
    const preisSd = preisWert(r.trackPrice ?? r.collectionPrice);
    const preisHd = preisWert(r.trackHdPrice ?? r.collectionHdPrice);
    return {
      id: `itunes:${r.trackId}`, typ: 'film', titel: String(r.trackName).trim(), jahr: jahrAus(r.releaseDate), release: r.releaseDate || null,
      genre: r.primaryGenreName || null, preisSd, preisHd, leihe: preisWert(r.trackHdRentalPrice) ?? preisWert(r.trackRentalPrice),
      bild: bildUrl(r.artworkUrl100 || r.artworkUrl60), link: appleLink(r.trackViewUrl),
      // Beschreibung nur, wenn da (sonst bliebe beim Zusammenführen die Chart-Beschreibung nicht erhalten)
      ...(typeof r.longDescription === 'string' && r.longDescription.trim() ? { text: r.longDescription.slice(0, 600) } : {}),
      ...(boxVon(r) ? { box: boxVon(r) } : {}),
    };
  }
  if (staffel && r.collectionId && r.collectionName) {
    return {
      id: `itunes:${r.collectionId}`, typ: 'staffel', titel: String(r.collectionName).trim(), jahr: jahrAus(r.releaseDate), release: r.releaseDate || null,
      genre: r.primaryGenreName || null, preisSd: preisWert(r.collectionPrice), preisHd: preisWert(r.collectionHdPrice), leihe: null,
      bild: bildUrl(r.artworkUrl100 || r.artworkUrl60), link: appleLink(r.collectionViewUrl), folgen: Number(r.trackCount) || null,
      kuenstler: typeof r.artistName === 'string' && r.artistName.trim() ? r.artistName.trim() : null, // = die Serie
      ...(KOMPLETT.test(String(r.collectionName)) ? { komplett: true } : {}),
    };
  }
  if (box && r.collectionId && r.collectionName) {
    return {
      id: `itunes:${r.collectionId}`, typ: 'box', titel: String(r.collectionName).trim(), jahr: jahrAus(r.releaseDate), release: r.releaseDate || null,
      genre: r.primaryGenreName || null, preisSd: preisWert(r.collectionPrice), preisHd: preisWert(r.collectionHdPrice), leihe: null,
      bild: bildUrl(r.artworkUrl100 || r.artworkUrl60), link: appleLink(r.collectionViewUrl), filme: Number(r.trackCount) >= 2 ? Number(r.trackCount) : null,
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
      text: typeof e.summary?.label === 'string' ? e.summary.label.slice(0, 600) : null,
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
    || (gesenkt && preis <= vorher * 0.7) || (istTiefst && hoechst > preis)); // Box: „angebot“ setzt der Lauf aus bewerte()
  return { vorher, tage, tiefst, istTiefst, hoechst, gesenkt, angebot };
}

/**
 * Üblicher Preis = der Preis, der in der eigenen Historie am längsten galt (Tage; der laufende Preis bis heute).
 * Erst ab tageMin Tagen Beobachtung – vorher gibt es keinen „üblichen“ Preis (null).
 */
export function ueblichPreis(v, tag, tageMin = STANDARD.knuellerTage) {
  const h = v?.h || [];
  if (!h.length || !v.seit || tageZwischen(v.seit, tag) + 1 < tageMin) return null;
  const dauer = new Map();
  for (let i = 0; i < h.length; i++) {
    const d = i + 1 < h.length ? tageZwischen(h[i][0], h[i + 1][0]) : tageZwischen(h[i][0], tag) + 1;
    dauer.set(h[i][1], (dauer.get(h[i][1]) || 0) + Math.max(0, d));
  }
  let best = null;
  for (const [p, d] of dauer) if (!best || d > best.d || (d === best.d && p > best.p)) best = { p, d };
  return best ? best.p : null;
}

/**
 * Preisknüller-Bewertung aus der EIGENEN Historie (kein Allzeit-Tiefst: der Radar kennt nur, was er seit „seit“ gesehen hat).
 * -> { ueblich, ersparnis {eur, pct, basis}, ueberTiefst, nieSoGuenstig, jeFilm, knueller {grund} | null, guenstig, rang }
 * Vergleichsbasis ist der übliche Preis; „zuletzt“ (der letzte andere Preis) nur, solange es noch keinen üblichen gibt
 * (< knuellerTage beobachtet) – so wird ein Kurz-Hoch (7,99 -> 13,99 -> 9,99) nie zum „statt“ (Prüfer 15.11.).
 * Knüller nur mit echtem Grund: ≥ knuellerPct % unter dem üblichen Preis (≥ knuellerTage beobachtet) · so günstig wie nie,
 * ≥ knuellerMinPct % unter üblich und der Tiefst frisch (≥ knuellerTiefstTage beobachtet) · Box ≤ boxJeFilmKnueller je Film bzw.
 * Staffel ≤ staffelZiel, jeweils frisch (< knuellerFrischTage) um ≥ knuellerMinPct % gesenkt – gegen den üblichen Preis oder,
 * noch ohne üblichen, auf den niedrigsten bisher gesehenen Preis. guenstig = ≥ angebotMinPct % unter der Vergleichsbasis.
 */
export function bewerte(v, preis, tag, lage, { typ = 'film', filme = null, staffelZiel = 9.99, m = STANDARD } = {}) {
  const leer = { ueblich: null, ersparnis: null, ueberTiefst: null, nieSoGuenstig: false, jeFilm: null, knueller: null, guenstig: false, rang: 0 };
  if (preis == null) return leer;
  const k = { ...STANDARD, ...m };
  const ueblich = ueblichPreis(v, tag, k.knuellerTage);
  const h = v?.h || [];
  const preisSeit = h.length && h.at(-1)[1] === preis ? h.at(-1)[0] : tag; // Tag, seit dem der heutige Preis gilt
  const frisch = tageZwischen(preisSeit, tag) < k.knuellerFrischTage;
  const unterUeblich = ueblich != null && ueblich > preis + 0.004;
  const basis = unterUeblich ? { p: ueblich, basis: 'üblich' }
    : ueblich == null && lage.gesenkt && lage.vorher > preis ? { p: lage.vorher, basis: 'zuletzt' } : null;
  const ersparnis = basis ? { eur: round(basis.p - preis, 2), pct: Math.round((1 - preis / basis.p) * 100), basis: basis.basis } : null;
  const ueberTiefst = lage.tiefst ? round(Math.max(0, preis - lage.tiefst.p), 2) : null;
  const amTiefst = !!lage.tiefst && preis <= lage.tiefst.p + 0.004;
  // „so günstig wie nie“ nur unter dem üblichen Preis: ein Normalpreis nach einem Kurz-Hoch ist kein Angebot
  const nieSoGuenstig = amTiefst && (lage.hoechst ?? 0) > preis && lage.tage >= k.knuellerTage && unterUeblich;
  const jeFilm = typ === 'box' && Number.isInteger(filme) && filme >= 2 ? round(preis / filme, 2) : null;
  const senkung = !!ersparnis && ersparnis.pct >= k.knuellerMinPct && frisch && (ersparnis.basis === 'üblich' || amTiefst);
  let grund = null;
  if (ersparnis?.basis === 'üblich' && ersparnis.pct >= k.knuellerPct && lage.tage >= k.knuellerTage) grund = `${ersparnis.pct} % unter dem üblichen Preis`;
  // „so günstig wie nie“ als Knüller nur, solange der Tiefstpreis frisch ist (gilt er schon länger, ist er der neue Normalpreis)
  else if (nieSoGuenstig && ersparnis.pct >= k.knuellerMinPct && lage.tage >= k.knuellerTiefstTage && tageZwischen(lage.tiefst.tag, tag) < k.knuellerTage) grund = 'so günstig wie nie';
  else if (jeFilm != null && jeFilm <= k.boxJeFilmKnueller && senkung) grund = `gesenkt, ${euro(jeFilm)} je Film`;
  else if (typ === 'staffel' && preis <= staffelZiel && senkung) grund = `Staffel gesenkt auf ${euro(preis)}`;
  const rang = (grund ? 1000 : 0) + (ersparnis?.pct ?? 0) + (nieSoGuenstig ? 25 : ueberTiefst === 0 && lage.tage >= k.knuellerTage ? 5 : 0)
    + (jeFilm != null ? Math.max(0, 10 - jeFilm) * 3 : 0);
  const guenstig = !!ersparnis && ersparnis.pct >= k.angebotMinPct;
  // ueblich auch, wenn er dem heutigen Preis gleicht: dann weiß die Seite, dass es kein „statt <Kurz-Hoch>“ gibt
  return { ueblich, ersparnis, ueberTiefst, nieSoGuenstig, jeFilm, knueller: grund ? { grund } : null, guenstig, rang };
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
// „HD digital“, „4K Dolby Vision digital“, „IMDb 7,5“, „Kauf-Stream“: so beschreibt mydealz einzelne Kauf-Filme (echter Feed 08.11.2026)
const FILM_WORT = /film|movie|staffel|season|serie|kino|blockbuster|klassiker|disney|pixar|marvel|star wars|star trek|leihen|kaufen|kollektion|collection|trilogie|bundle|\b(?:u?hd|4k)\b[^|]{0,30}\bdigital\b|\bimdb\b|kauf-?stream|\bregie\b/i;
const KEIN_FILMDEAL = /apple\s?tv\s?(\+|plus)|\babo\b|abonnement|probemonat|monate? (gratis|kostenlos)|\d+\s?gb\b|generation|\bgen\.|siri remote|fernbedienung|\bhdmi\b|geschenkkarte|guthabenkarte|gutscheinkarte|app store (&|und) itunes karte|horror/i;

// Geräte statt Filme: „Apple TV 4K (2026)“ (voelkner), „Apple TV 4K (4. Generation) 2026 Version“, „Apple TV 4K 32GB HDR
// 1. Generation A1842 (Gebraucht)“ – echte mydealz-Gruppe apple-tv vom 08.11.2026.
const GERAET_TITEL = /^\W*apple\s?tv(?:\s?4k|\s?hd)?\s*(?:\(\s*(?:\d\.\s*gen|20\d\d)|20\d\d\b|\d+\s?gb\b|$|wi-?fi|ethernet)|\bsiri remote\b|\bapple tv\s?4k\b.*\b(?:chip|gebraucht|refurbished|generation)\b/i;
// Händler, bei denen ein „Film“-Deal ein Film ist (sonst steht „Filme/Serien“ nur in der Produktbeschreibung eines Geräts)
// Staffel-/Serien-Deal bei mydealz („Yellowstone – Die komplette Serie“, „… – Staffel 1-3“): Tipp unter „Serien“
export const STAFFEL_WORT = /\bstaffel|\bseason|\bkomplette\s+serie|\bcomplete\s+series|\bkomplettbox\b|\bgesamtbox\b/i;
const FILM_HAENDLER = /apple|itunes|prime video|amazon video|rakuten|google play|youtube|sky store|magenta|maxdome|chili/i;
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Beschreibung ohne den mydealz-Kopf „<Preis> - <Händler>“: Der Händler der iTunes-Deals heißt bei mydealz „Apple TV Plus“
 * (echter Feed 08.11.2026: „3,99€ - Apple TV Plus Aktuell erhaltet ihr …“) – das traf das Abo-Muster und warf JEDEN
 * echten Film-Deal (Flash Gordon, Bill & Teds …) raus, während das Gerät „Apple TV 4K (2026)“ durchkam.
 */
export function ohneHaendlerKopf(it) {
  const b = String(it.beschreibung || '');
  const shop = String(it.shop || '').trim();
  const preis = '(?:[\\d.,]+\\s?€\\s*-\\s*)?';
  return shop ? b.replace(new RegExp(`^\\s*${preis}${esc(shop)}\\s*`, 'i'), '') : b.replace(new RegExp(`^\\s*[\\d.,]+\\s?€\\s*-\\s*`), '');
}

export function istAppleFilmDeal(it) {
  const beschreibung = ohneHaendlerKopf(it);
  const text = `${it.titel} ${beschreibung}`;
  const shop = String(it.shop || '').trim();
  const apple = APPLE_WORT.test(`${it.titel} ${shop}`) || /^(apple|itunes|apple tv)$/i.test(shop);
  if (!apple || GERAET_TITEL.test(it.titel)) return false;
  // fremder Händler (voelkner, eBay, MediaMarkt …): „Film“ muss im Titel stehen, nicht nur in der Gerätebeschreibung
  const filmWort = FILM_HAENDLER.test(shop) || !shop ? FILM_WORT.test(text) : FILM_WORT.test(it.titel);
  return filmWort && !KEIN_FILMDEAL.test(text);
}

/** Preis je Film eines Deals („Rambo Collection | 5 Filme als Set“ 13,40 € -> 2,68 €); ohne Angabe = Preis. */
export function preisJeFilm(titel, preis) {
  if (preis == null) return null;
  // „… u.a. Filme je 5,99€ (alle 10 Filme im Sale)“ (echter Feed 16.11.2026): „je“ vor dem Preis = Preis je Film, kein Set
  if (/\bje\s*\d{1,3}(?:[.,]\d{1,2})?\s*(?:€|eur)/i.test(String(titel || ''))) return preis;
  const n = Number(String(titel || '').match(/\b(\d{1,2})[\s-]*(?:filme|film-kollektion|film collection|filme-kollektion|movie collection|movies)\b/i)?.[1]);
  return n >= 2 ? preis / n : preis;
}

/** Filmname aus einem mydealz-Titel: „Der Grinch ~ 3,99€ | UHD digital | Apple TV / Amazon Video“ -> „Der Grinch“. */
export function mdFilmTitel(titel) {
  const x = String(titel ?? '').replace(/^\s*\[[^\]]{0,40}\]\s*/, '')
    // „Apple TV Countdown Tag 5: Wicked …“, „iTunes Adventskalender – Wicked …“ -> „Wicked …“
    .replace(/^[^:–—]{0,60}?(?:countdown|adventskalender|advent|tag\s*\d{1,2})[^:–—]{0,30}[:–—]\s*/i, '')
    .replace(/^[^:–—]{0,20}?tag\s*\d{1,2}[^:–—]{0,10}[:–—]\s*/i, '')
    .split(/\s*(?:[~|@]|\s(?:für|for|ab|nur|bei|im|in)\s|\d{1,3}[.,]\d{2}\s*(?:€|eur)|\(\s*(?:u?hd|4k|kauf|leih|digital))/i)[0];
  return x.replace(/[\s:,;–—-]+$/, '').trim();
}
/** Countdown/Adventskalender von Apple (Dezember: „Apple TV Countdown Tag 5“, „iTunes Adventskalender“, „31 Tage, 31 Angebote“) */
export const COUNTDOWN_WORT = /countdown|adventskalender|advent|31\s*tage|film des tages|tagesangebot|tages-?deal/i;
/**
 * Apple-Eintrag zu einem mydealz-Tipp (Xander 16.11.2026: „Apple statt mydealz“) – nur eindeutig: gleicher Filmname (normTitel)
 * und genau EIN Apple-Film zu höchstens dem Tipp-Preis (+1 ct). Kandidaten = alle Apple-Filme dieses Laufs ({ id, titel, jahr, preis }).
 * -> { treffer, gleicheNamen } (treffer = der Kandidat oder null; gleicheNamen = Apple-Filme mit diesem Namen, egal welcher Preis)
 */
export function appleZuTipp(mdTitel, mdPreis, kandidaten) {
  const name = normTitel(mdFilmTitel(mdTitel));
  if (name.length < 2) return { treffer: null, gleicheNamen: [] };
  const gesehen = new Set();
  const gleiche = kandidaten.filter(k => k && k.id && !gesehen.has(k.id) && gesehen.add(k.id) && normTitel(k.titel) === name);
  const passend = mdPreis == null ? [] : gleiche.filter(k => k.preis != null && k.preis <= mdPreis + 0.011);
  return { treffer: passend.length === 1 ? passend[0] : null, gleicheNamen: gleiche };
}

// ---------------------------------------------------------------- Ausgabe

const SO_FILM = 'Link öffnen – die TV-App zeigt den Film. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen. Gekaufte Filme bleiben in deiner Mediathek.';
const SO_STAFFEL = 'Link öffnen – die TV-App zeigt die Staffel. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen. Alle Folgen bleiben in deiner Mediathek.';
const SO_DEAL = 'Deal öffnen: dort steht, welche Filme dabei sind. Dann in der TV-App suchen, Preis prüfen und kaufen.';
const SO_BOX = 'Link öffnen – die TV-App zeigt die Box. Preis prüfen, „Kaufen“ tippen und mit Face ID bestätigen. Alle Filme der Box bleiben in deiner Mediathek.';

const NULL_TITEL = { genre: null, preis: null, preisSd: null, preisHd: null, leihe: null, vorher: null, tiefst: null, seit: null, tage: 0, istTiefst: false, angebot: false, bild: null, link: null, chart: null };

function titelObjekt(d, lage, extra = {}) {
  const preis = d.preisHd ?? d.preisSd ?? d.preis ?? null;
  const o = {
    id: d.id, typ: d.typ, titel: d.titel, jahr: d.jahr ?? null, genre: d.genre ?? null,
    preis, preisSd: d.preisSd ?? null, preisHd: d.preisHd ?? null, leihe: d.leihe ?? null,
    vorher: lage.vorher ?? null, tiefst: lage.tiefst ? { p: lage.tiefst.p, tag: lage.tiefst.tag } : null, seit: lage.seit ?? null,
    tage: lage.tage ?? 0, istTiefst: !!lage.istTiefst, angebot: !!lage.angebot,
    bild: d.bild ?? null, link: d.link ?? null, chart: d.chart ?? null, quelle: 'Apple',
    // Preisknüller (15.11.2026): nur ergänzt; Tiefstpreis = eigene Beobachtung (tiefstQuelle 'eigen'), extern = Allzeit-Tiefst
    // einer erlaubten öffentlichen Preis-Historie mit Quelle – heute keine (FILME-NOTES.md), darum immer null
    ueblich: lage.ueblich ?? null, ersparnis: lage.ersparnis ?? null, ueberTiefst: lage.ueberTiefst ?? null,
    nieSoGuenstig: !!lage.nieSoGuenstig, knueller: lage.knueller ?? null, tiefstQuelle: 'eigen', extern: lage.extern ?? null,
    ...extra,
  };
  if (d.typ === 'staffel') { o.serie = d.serie ?? null; o.nr = d.nr ?? null; if (d.komplett) o.komplett = true; }
  if (d.typ === 'box') { o.filme = d.filme ?? null; o.jeFilm = lage.jeFilm ?? null; }
  return o;
}

/**
 * Ergebnis aus einem fremden Store? Film-Lookups im deutschen Store verweisen auch auf Boxen aus Frankreich, Japan, Thailand
 * („Shrek Coffret 6 Films“, echter Lauf 43653935144) – Box- und Serien-Preise nur aus dem deutschen Store (DEU, EUR, /de/).
 */
export function fremdStore(r) {
  if (!r || typeof r !== 'object') return false;
  const url = String(r.collectionViewUrl || r.trackViewUrl || '');
  const land = /\.apple\.com\/([a-z]{2})\//i.exec(url)?.[1];
  return (r.country != null && r.country !== 'DEU') || (r.currency != null && r.currency !== 'EUR') || (land != null && land.toLowerCase() !== 'de');
}

const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
/** „2026-11-07“ -> „Nov. 2026“ (Beobachtungsbeginn in Texten: „Tiefst seit Nov. 2026“) */
export const monatJahr = d => { const m = /^(\d{4})-(\d\d)/.exec(String(d || '')); return m ? `${MONATE[Number(m[2]) - 1]} ${m[1]}` : ''; };

/** Allzeit-Tiefst aus einer externen Quelle (zustand.filme.extern[id] = { p, tag, quelle, url }) – nur vollständig, sonst null. */
export function externTiefst(x) {
  if (!x || typeof x !== 'object') return null;
  const p = preisWert(x.p), q = typeof x.quelle === 'string' ? x.quelle.trim() : '';
  const url = typeof x.url === 'string' && /^https:\/\//.test(x.url) ? x.url : null;
  return p != null && q && url && /^\d{4}-\d\d-\d\d$/.test(String(x.tag || '')) ? { p, tag: x.tag, quelle: q.slice(0, 40), url } : null;
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
  const kinderCharts = new Set(liste(chartCfg.kinder ?? [4410]).map(Number)); // wer hier steht, ist ein Kinderfilm (nicht unter „Neu“)
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
  async function lookup(ids, quelle, { nurDe = false } = {}) {
    for (let i = 0; i < ids.length; i += m.lookupMax) {
      if (nurDe && zeitUm()) { status[quelle].uebersprungen = (status[quelle].uebersprungen || 0) + ids.length - i; break; } // Rest im nächsten Lauf
      const teil = ids.slice(i, i + m.lookupMax);
      const set = new Set(teil);
      try {
        const res = leseErgebnisse(await apple(lookupUrl(teil)));
        for (const r of res) {
          const d = ausItunes(r);
          if (!d || !set.has(d.id)) continue;
          if (nurDe && fremdStore(r)) { status[quelle].fremdLand = (status[quelle].fremdLand || 0) + 1; continue; }
          daten.set(d.id, { ...daten.get(d.id), ...d });
        }
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
  const kinderIds = new Set(), kinderReihen = new Set(); // alle Titel der Kinder-Charts (auch teure: chartTreffer kennt nur Neues und Angebote)
  const neuGrenze = new Date(new Date(jetzt).getTime() - neuMonate * 30.44 * 864e5);
  // breite Suche (Schritt 4d): eigene Genres mit limit=200 – Apple liefert je Feed höchstens 100 (echter Lauf 43796648997:
  // limit=200 = dieselben 100 Einträge, Byte für Byte). Die bisherigen Genres bleiben darum genau wie vorher (limit=100).
  const breitCfg = chartCfg.breit && typeof chartCfg.breit === 'object' && chartCfg.breit.aktiv !== false ? chartCfg.breit : null;
  const breitLimit = breitCfg ? Math.min(200, Math.max(100, Number(breitCfg.limit) || 200)) : 100;
  for (const g of [...chartsNeu.map(x => ({ ...x, neu: true })), ...chartsAngebot.map(x => ({ ...x, neu: false }))]) {
    let eintraege;
    try {
      eintraege = leseCharts(await apple(chartUrl(g.id)));
      status['apple-charts'].anzahl += eintraege.length;
      alleCharts.push(...eintraege);
      if (kinderCharts.has(Number(g.id))) for (const e of eintraege) { kinderIds.add(e.id); const r = kinderReihe(e.titel); if (r) kinderReihen.add(r); }
    } catch (e) {
      melde('apple-charts', `Charts ${g.name || g.id}: ${e.message}`);
      // alter Stand dieses Genres (höchstens 3 Tage)
      const z = zf.charts[g.id];
      if (z && tageZwischen(z.tag, tag) <= 3) {
        // Kinder-Chart: gemerkte Reihen aller Titel (Prüfer MV10 2: in ids stehen nur die billigen – ohne Woodwalkers,
        // Schule der magischen Tiere 1–3, Vaiana 2 kämen die neuen Teile bei einer Apple-Störung zurück unter „Neu“)
        if (kinderCharts.has(Number(g.id))) for (const r of liste(z.reihen)) if (typeof r === 'string' && r) kinderReihen.add(r);
        for (const [id, pos, neu] of liste(z.ids)) {
          const t = alt.get(id);
          if (kinderCharts.has(Number(g.id))) { kinderIds.add(id); const r = t ? kinderReihe(t.titel) : ''; if (r) kinderReihen.add(r); }
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
      const billig = e.preis != null && e.preis <= m.angebotMax;
      const ph = zf.preise[e.id]?.h;
      const hoch = ph?.length ? ph.reduce((x, y) => Math.max(x, y[1]), 0) : 0; // schon beobachtet und jetzt deutlich billiger
      const gesenkt = e.preis != null && hoch > 0 && e.preis <= hoch * m.deutlichFaktor;
      if (!neu && !billig && !gesenkt) continue;
      const vor = chartTreffer.get(e.id);
      if (!vor || e.pos < vor.pos || (neu && !vor.neu)) chartTreffer.set(e.id, { pos: Math.min(e.pos, vor?.pos ?? Infinity), genreId: g.id, neu: neu || !!vor?.neu, d: e });
      merk.push([e.id, e.pos, neu ? 1 : 0]);
    }
    zf.charts[g.id] = { tag, ids: merk };
    // Kinder-Chart: Reihen aller Titel merken (auch teure), damit der Chart-Ersatz oben 3 Tage lang auch Kinderfilme kennt
    if (kinderCharts.has(Number(g.id))) zf.charts[g.id].reihen = [...new Set(eintraege.map(e => kinderReihe(e.titel)).filter(Boolean))];
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
      if (d && !d.serie) { const info = (d.komplett && komplettInfo(d.titel)) || staffelInfo(d.titel) || komplettInfo(d.titel); if (info) daten.set(id, { ...d, serie: p.item.titel, nr: info.nr, zusatz: info.zusatz }); }
    }
  }

  // 3b) Film-Boxen: entdeckt aus den Film-Lookups dieses Laufs (collectionId, kein Abruf extra), Preis per Box-Lookup
  //     (höchstens boxAbrufe × boxMax Nummern, am längsten nicht geprüfte zuerst). Der collectionPrice im Film-Datensatz
  //     ist oft nur der Filmpreis (Spiegelwert) und wird nie als Box-Preis genommen.
  zf.boxen ||= {};
  for (const d of daten.values()) {
    if (!d?.box) continue;
    const b = (zf.boxen[d.box.id] ||= { n: d.box.name, filme: d.box.filme, seit: tag, filmIds: [] });
    b.tag = tag; b.filme = d.box.filme || b.filme;
    if (!liste(b.filmIds).includes(d.id)) b.filmIds = [...liste(b.filmIds), d.id].slice(-30);
  }
  const bs = { ok: true, anzahl: 0, fehler: [], bekannt: Object.keys(zf.boxen).length, abgefragt: 0, ohnePreis: 0, formatFremd: 0, fremdLand: 0, uebersprungen: 0 };
  status['apple-boxen'] = bs;
  const boxIds = Object.keys(zf.boxen).sort((a, b) => String(zf.boxen[a].geprueft || '').localeCompare(String(zf.boxen[b].geprueft || '')) || a.localeCompare(b))
    .slice(0, m.boxMax * m.boxAbrufe);
  for (let i = 0; i < boxIds.length; i += m.boxMax) {
    if (zeitUm()) { bs.uebersprungen += boxIds.length - i; break; } // Zeitbudget: Rest im nächsten Lauf (zuerst die am längsten nicht geprüften)
    if (appleGestoert() || appleAbrufe >= m.maxAppleAbrufe) break;
    const teil = boxIds.slice(i, i + m.boxMax);
    const set = new Set(teil);
    try {
      const res = leseErgebnisse(await apple(lookupUrl(teil)));
      bs.abgefragt += teil.length;
      for (const r of res) {
        const d = ausItunes(r);
        if (d?.typ === 'box' && set.has(d.id) && fremdStore(r)) bs.fremdLand++; // Box eines anderen Stores -> nichts übernehmen
        else if (d?.typ === 'box' && set.has(d.id)) {
          const z = zf.boxen[d.id];
          daten.set(d.id, { ...d, filme: d.filme ?? z.filme ?? null });
          z.n = d.titel; bs.anzahl++;
          if (d.preisHd == null && d.preisSd == null) bs.ohnePreis++;
        } else if (r && set.has(`itunes:${r.collectionId}`)) bs.formatFremd++; // Antwort nicht im erwarteten Format -> nichts übernehmen
      }
      for (const id of teil) zf.boxen[id].geprueft = tag;
    } catch (e) {
      melde('apple-boxen', `Apple-Boxen: ${e.message}`);
      for (const id of teil) if (alt.has(id)) altDaten.set(id, alt.get(id));
    }
  }

  // 3c) Alle Serien: Serien-Charts (Apple, deutscher Store) entdecken Staffeln; deren Preise verfolgt jeder Lauf weiter
  //     (zf.staffelPool: id -> zuletzt in den Charts), damit „gesenkt“ und der Tiefstpreis auch nach den Charts stimmen.
  const serienCharts = chartCfg.serien === false ? [] : liste(chartCfg.serien ?? [{ id: null, name: 'Alle Serien' }]);
  const ss = { ok: true, anzahl: 0, fehler: [], staffeln: 0, neuEntdeckt: 0, deineAusCharts: 0, fremdLand: 0, uebersprungen: 0 };
  status['apple-serien'] = ss;
  zf.staffelPool ||= {};
  for (const g of serienCharts) {
    if (zeitUm()) { ss.uebersprungen++; break; }
    if (appleGestoert() || appleAbrufe >= m.maxAppleAbrufe - 2) break;
    try {
      const e = leseCharts(await apple(serienChartUrl(g?.id ?? null)));
      for (const x of e) if (!istHorror(x, horrorIds)) zf.staffelPool[x.id] = tag;
      ss.anzahl += e.length;
    } catch (e) { melde('apple-serien', `Serien-Charts ${g?.name || g?.id || 'alle'}: ${e.message}`); }
  }
  const poolIds = Object.entries(zf.staffelPool).filter(([id]) => !daten.has(id)).sort((a, b) => String(b[1]).localeCompare(String(a[1])))
    .map(([id]) => id).slice(0, m.serienPoolMax);
  if (poolIds.length && !appleGestoert()) await lookup(poolIds.slice(0, Math.max(0, (m.maxAppleAbrufe - appleAbrufe)) * m.lookupMax), 'apple-serien', { nurDe: true });
  // Staffeln deiner Serien, die über die Charts (oder mydealz) kommen, gehören zu deiner Serie – erkannt am Seriennamen
  // (Titel, „en“, „auch“ aus filme.json „serien“; Ableger wie „Rick and Morty: The Anime“ zählen nicht). Prüfer 15.11.
  const wunschSerie = new Map(); // normTitel(Name) -> Posten
  for (const p of posten.filter(x => x.serie)) for (const x of namen(p.item)) if (x.faktor === 1 && !wunschSerie.has(normTitel(x.n))) wunschSerie.set(normTitel(x.n), p);
  const wunschPosten = (...n) => { for (const x of n) { const p = x && wunschSerie.get(normTitel(x)); if (p) return p; } return null; };
  for (const id of Object.keys(zf.staffelPool)) {
    const d = daten.get(id);
    if (d?.typ !== 'staffel' || d.serie) continue;
    const info = (d.komplett && komplettInfo(d.titel)) || staffelInfo(d.titel) || komplettInfo(d.titel);
    const p = wunschPosten(info?.serie, d.kuenstler);
    daten.set(id, { ...d, serie: p ? p.item.titel : info?.serie || d.kuenstler || d.titel, nr: info?.nr ?? null, zusatz: info?.zusatz || '', ...(p ? { wunschKey: p.key } : {}) });
  }

  // 4) mydealz: Apple-Film-Aktionen
  const deals = [];
  const serienDeals = []; // Staffel-Deals über dem Film-Preisdeckel: nur Tipp unter „Serien“ (kein „Angebote“, kein Push)
  // Gruppen statt Suche (die mydealz-RSS-Suche gibt es nicht mehr). Alte Liste mit Suchwörtern -> Standard-Gruppen, [] = aus.
  const md = listen.mydealz;
  const mdGruppen = md === false ? [] : Array.isArray(md) ? (md.length ? MYDEALZ_GRUPPEN : []) : liste(md?.gruppen ?? MYDEALZ_GRUPPEN);
  const feeds = mydealzFeeds(mdGruppen, { maxAlterTage: 7 });
  if (feeds.length) {
    const { items, fehler: f } = await sammleFeeds(holeText, feeds, { jetzt, maxAlterTage: 7 });
    for (const x of f) melde('mydealz', x);
    // Preisregel wie bei Apple: höchstens angebotPreisAktion (4,99 €) je Film; ohne Preis (Aktion) bleibt der Deal
    for (const it of items) {
      if (!istAppleFilmDeal(it)) continue;
      const jeFilm = preisJeFilm(it.titel, preisWert(it.preisText));
      if (jeFilm != null && jeFilm > m.angebotPreisAktion) { if (STAFFEL_WORT.test(it.titel) && serienDeals.length < 10) serienDeals.push(it); continue; }
      deals.push(it);
    }
    status.mydealz.anzahl = deals.length;
    status.mydealz.serienTipps = serienDeals.length;
  }
  const aktion = deals.length > 0;

  // 4b) Apple-TV-Angebotsräume: Raum-Links von der Filmseite des Stores (Name/Slug klingt nach Angebot) + feste Räume aus
  //     filme.json; die Filme im Raum werden mit Wunsch-/80er-/Disney-Liste abgeglichen (gleicher Slug wie der Listen-Name).
  const at = listen.appleTv || {};
  status['apple-tv-raeume'] = { ok: true, anzahl: 0, fehler: [], raeume: [] };
  const raumTreffer = [];
  const raumAlle = []; // alle Filme aus Angebotsräumen mit Preis im Namen („Filme für 3,99 €“) -> Chip „Für 3,99 €“
  const raumCountdown = []; // Filme aus einem Countdown-/Adventskalender-Raum der TV-App (Dezember)
  if (at.aktiv !== false && (liste(at.start).length || liste(at.raeume).length)) {
    const max = at.maxAbrufe ?? 4;
    let abrufe = 0;
    const raeume = new Map(); // url -> Name
    for (const r of liste(at.raeume)) { const u = typeof r === 'string' ? r : r?.url; if (u) raeume.set(u, typeof r === 'string' ? '' : r.name || ''); }
    for (const start of liste(at.start)) {
      if (abrufe >= max) break;
      try {
        abrufe++;
        // Start = Apple-TV-Startseite: dort stehen alle Räume/Sammlungen der Woche; Angebote werden am Namen erkannt
        // (3,99 / Angebot / Deal …), damit eine neue Aktions-Sammlung ohne feste Adresse gefunden wird
        const links = raumLinks(await holeText(start, { headers: { accept: 'text/html' } }));
        status['apple-tv-raeume'].gesehen = (status['apple-tv-raeume'].gesehen ?? 0) + links.length;
        for (const l of links) if (l.angebot && !raeume.has(l.url)) raeume.set(l.url, l.name);
      } catch (e) { melde('apple-tv-raeume', `Apple TV Filmseite: ${e.message}`); }
    }
    const filmPosten = posten.filter(p => !p.serie);
    for (const [url, name0] of raeume) {
      if (abrufe >= max) break;
      try {
        abrufe++;
        const html = await holeText(url, { headers: { accept: 'text/html' } });
        const name = raumName(html) || name0 || 'Angebote';
        const preis = raumPreis(html);
        const filmeImRaum = raumFilme(html);
        status['apple-tv-raeume'].raeume.push({ name, url, filme: filmeImRaum.length, preis });
        status['apple-tv-raeume'].anzahl += filmeImRaum.length;
        for (const f of filmeImRaum) {
          if (preis != null && !raumAlle.some(x => x.f.umc === f.umc)) raumAlle.push({ f, raum: name, raumUrl: url, preis });
          // Countdown/Adventskalender-Raum (Dezember) auch ohne Preis im Namen – nur für den Tages-Push
          if (COUNTDOWN_WORT.test(`${name} ${name0}`) && !raumCountdown.some(x => x.f.umc === f.umc)) raumCountdown.push({ f, raum: name, raumUrl: url, preis });
          const p = filmPosten.find(x => passtZuListe(f, x.item));
          if (p && !raumTreffer.some(t => t.p.key === p.key)) raumTreffer.push({ f, p, raum: name, raumUrl: url, preis });
        }
      } catch (e) { melde('apple-tv-raeume', `Apple TV Raum: ${e.message}`); }
    }
    status['apple-tv-raeume'].abrufe = abrufe;
  }

  // 4c) Qualität der Chart-Titel (Wikidata, im Zustand gemerkt): Horror und Ramsch raus, Bekanntes und gut Bewertetes bleibt
  zf.quali ||= {};
  const qs = { ok: true, anzahl: 0, fehler: [], abfragen: 0, offen: 0, raus: 0, gefunden: 0 };
  status.qualitaet = qs;
  const listenIds = new Set(posten.filter(p => !p.serie).map(p => zf.ids[p.key]?.id).filter(Boolean));
  // gefundene Einträge ohne Wikidata-Jahr (vor dem 15.11.2026 gemerkt) einmal neu fragen: das Jahr ersetzt ein Apple-Datum,
  // das nur die Wiederveröffentlichung ist („Dirty Harry (2014)“, Prüfer-Befund MV8 10); Billiges zuerst, höchstens qualiMaxAbrufe
  // … ebenso gefundene ohne Wikidata-Nummer „q“ (vor dem 16.11.2026 gemerkt): die braucht der Schritt „Große Produktion/Besetzung“
  const qualiFrisch = q => q && q.tag && (q.l < 0 || ('j' in q && 'q' in q)) && tageZwischen(q.tag, tag) < (q.l >= 0 ? m.qualiTage : m.qualiFehltTage);
  const nr = id => String(id).replace(/^itunes:/, '');
  if (m.qualitaet !== false) {
    // deine Listen-Titel bis angebotPreisAktion auch (nur Bekanntheit/Besetzung für die Filter der Seite – sie bleiben immer stehen)
    const listeBillig = [...listenIds].filter(id => { const d = daten.get(id); const p = d ? d.preisHd ?? d.preisSd ?? d.preis ?? null : null; return p != null && p <= m.angebotPreisAktion; })
      .filter(id => !chartTreffer.has(id)).map(id => [id, { pos: 999 }]);
    const kandidat = [...chartTreffer.entries(), ...listeBillig]
      .filter(([id]) => (!listenIds.has(id) || listeBillig.some(x => x[0] === id)) && !qualiFrisch(zf.quali[nr(id)]))
      .map(([id, c]) => {
        const d = daten.get(id) || c.d || c.altTitel || {};
        const preis = d.preisHd ?? d.preisSd ?? d.preis ?? null;
        return { id, nr: nr(id), name: suchName(d.titel), jahr: jahrImTitel(d.titel) ?? d.jahr ?? null, preis, pos: c.pos };
      })
      .filter(t => t.name && /^\d+$/.test(t.nr))
      .sort((a, b) => (a.preis ?? 99) - (b.preis ?? 99) || a.pos - b.pos); // Billiges zuerst (das kommt auf die Seite)
    qs.offen = kandidat.length;
    const zeitQuali = () => Date.now() - start > (m.zeitBudgetSek + 40) * 1000;
    for (let i = 0; i < kandidat.length && qs.abfragen < m.qualiMaxAbrufe && !zeitQuali(); i += m.qualiJeAbfrage) {
      const teil = kandidat.slice(i, i + m.qualiJeAbfrage);
      qs.abfragen++;
      try {
        const zeilen = leseQuali(await holeText(wikidataUrl(qualiAbfrage(teil)), { headers: { accept: 'application/sparql-results+json' } }));
        for (const t of teil) {
          const q = qualiWahl(zeilen, t);
          zf.quali[t.nr] = q ? { l: q.l, h: q.horror ? 1 : 0, k: q.kinder ? 1 : 0, rt: q.rt, j: q.jahr ?? null, q: q.item ?? null, tag } : { l: -1, tag };
          if (q) qs.gefunden++;
        }
        qs.anzahl += teil.length;
        qs.offen -= teil.length;
      } catch (e) {
        qs.ok = false; qs.fehler.push(`Wikidata (Qualität): ${e.message}`); // kein „fehler“ des Moduls: die Seite zeigt dann die Charts-Regel
        break;
      }
    }
    // alte Einträge (Titel lange nicht mehr in den Charts) vergessen
    for (const [k, q] of Object.entries(zf.quali)) if (!q?.tag || tageZwischen(q.tag, tag) > m.qualiTage * 2) delete zf.quali[k];
  }
  // k fehlt (vor dem 15.11.2026 gemerkt) = unbekannt; kommt mit der nächsten regulären Abfrage (qualiTage), kein Abruf extra
  const qualiVon = id => { const q = zf.quali[nr(id)]; return q ? { l: q.l, horror: q.h === 1, kinder: 'k' in q ? q.k === 1 : null, rt: q.rt ?? null, jahr: q.j ?? null } : null; };

  // 4d) Breite Suche (Xander 16.11.2026: „wirklich alles, was wirklich da ist“): Top 200 JE GENRE – Filme (topmovies) und
  //     Staffeln (toptvseasons), Genres in filme.json charts.breit. Nur ZUSÄTZLICH: läuft nach allen Schritten des bisherigen
  //     Wegs (Abrufe, Qualität), mit eigenem Budget (breitGesamtMax Apple-Abrufe im ganzen Lauf, breitBisSek). Der Chart-Preis
  //     (Kauf) ist der Vorfilter; der Lookup (bis lookupMax Nummern je Abruf) holt nur Kandidaten: Filme ≤ angebotPreisAktion,
  //     Action/Comedy ≤ angebotMax, Filme ohne Preis, Gesenktes laut eigener Chart-Preis-Historie (zf.breit.p). Staffeln nur
  //     mit echter Senkung gegenüber dem zuvor selbst gesehenen Chart-Preis. Genres rotieren (am längsten nicht geholte zuerst).
  const bst = { ok: true, anzahl: 0, fehler: [], charts: 0, ruhen: 0, offen: 0, abrufe: 0, kandidaten: 0, lookups: 0, filme: 0, staffeln: 0, quali: 0, genres: [] };
  status['apple-breit'] = bst;
  const breitIds = new Set(); // Filme, die nur die breite Suche gefunden hat (Kappen, Push-Reihenfolge)
  const breitCharts = []; // alle Film-Einträge der Genre-Charts dieses Laufs (nur für den Abgleich mydealz -> Apple)
  const breitVergleich = new Map(); // id -> { vorher, hoch } aus der eigenen Chart-Preis-Historie
  const breitStaffeln = []; // { id, vorher }
  if (breitCfg) {
    const zb = (zf.breit ||= {});
    zb.g ||= {}; zb.p ||= {};
    const tagNr = Math.round(tagMs(tag) / 864e5);
    const vorAbrufe = appleAbrufe;
    const breitZeit = () => Date.now() - start > m.breitBisSek * 1000;
    const altGenres = new Set([...chartsNeu, ...chartsAngebot].map(g => Number(g.id)));
    const serienEigen = new Set(posten.filter(p => p.serie).flatMap(p => liste(zf.ids[p.key]?.ids)));
    const genres = [...liste(breitCfg.filme).map(g => ({ ...g, art: 'film' })), ...liste(breitCfg.serien).map(g => ({ ...g, art: 'staffel' }))]
      .filter(g => Number.isInteger(Number(g?.id)) && !(g.art === 'film' && (horrorIds.has(Number(g.id)) || altGenres.has(Number(g.id)))))
      .map(g => ({ ...g, key: `${g.art === 'film' ? 'f' : 's'}${g.id}` }))
      .sort((a, b) => String(zb.g[a.key]?.t || '').localeCompare(String(zb.g[b.key]?.t || '')));
    // Chart-Preis merken (kompakt): [Preis ct, höchster ct, vorheriger anderer ct (0 = keiner), erster Tag, letzter Tag, Tag seit Preis]
    // Staffeln: krumme Chart-Preise (17,94 €, 50,83 € – Season-Pass/Teilstaffel, echter Lauf 43796023775: 5 von 98 weichen vom
    // Lookup ab) zählen nicht; Filme: Chart-Preis = HD-Kaufpreis des Lookups (25 von 25)
    const merkP = (e, art = 'film') => {
      if (e?.preis == null || (art === 'staffel' && Math.round(e.preis * 100) % 10 !== 9)) return zb.p[nr(e?.id)] || null;
      const k = nr(e.id), c = Math.round(e.preis * 100);
      let v = zb.p[k];
      if (!Array.isArray(v) || v.length < 6) v = zb.p[k] = [c, c, 0, tagNr, tagNr, tagNr];
      else { if (v[0] !== c) { v[2] = v[0]; v[0] = c; v[5] = tagNr; } v[1] = Math.max(v[1], c); v[4] = tagNr; }
      return v;
    };
    // echte Senkung laut eigener Chart-Historie: ≥ angebotMinPct % unter dem zuletzt gesehenen anderen Preis, und frisch
    const gesenktP = (v, preis = v ? v[0] / 100 : null) => !!v && preis != null && v[2] > 0 && preis <= (v[2] / 100) * (1 - m.angebotMinPct / 100) && tagNr - v[5] < m.knuellerFrischTage;
    const deutlichP = (v, preis) => !!v && preis != null && v[1] > 0 && preis <= (v[1] / 100) * m.deutlichFaktor;
    const filmOk = (preis, genre, v) => preis == null || preis <= m.angebotPreisAktion || (!!genreGruppe(genre) && preis <= m.angebotMax) || gesenktP(v, preis) || deutlichP(v, preis);
    const kand = new Map(); // id -> { e, g, art }
    const pruefe = (e, g, art) => {
      if (!e?.id || kand.has(e.id)) return false;
      const v = merkP(e, art);
      if (art === 'film') {
        if (chartTreffer.has(e.id) || listenIds.has(e.id)) return false; // gehört dem bisherigen Weg
        if (istHorror(e, horrorIds) || horrorText(e.text, e.genre) >= 3) return false;
        if (!filmOk(e.preis, e.genre, v)) return false;
      } else if (zf.staffelPool[e.id] != null || serienEigen.has(e.id) || !gesenktP(v)) return false;
      kand.set(e.id, { e, g, art });
      return true;
    };
    for (const g of genres) {
      const z = zb.g[g.key];
      if (z?.leer && tageZwischen(z.leer, tag) < m.breitLeerTage) { bst.ruhen++; continue; }
      if (bst.charts >= m.breitMaxCharts || breitZeit() || appleGestoert() || appleAbrufe >= m.breitGesamtMax - 1) {
        // nicht dran: Kandidaten vom letzten Mal (höchstens breitMerkTage alt) weiter prüfen – der Preis kommt frisch per Lookup
        bst.offen++;
        if (z?.t && tageZwischen(String(z.t).slice(0, 10), tag) <= m.breitMerkTage) {
          for (const [id, pos] of liste(z.k)) if (!kand.has(id) && !chartTreffer.has(id) && !listenIds.has(id)) kand.set(id, { e: { id, pos }, g, art: g.art, alt: true });
        }
        continue;
      }
      bst.charts++;
      try {
        const e = leseCharts(await apple(g.art === 'film' ? chartUrl(g.id, breitLimit) : serienChartUrl(g.id, breitLimit)));
        if (g.art === 'film') breitCharts.push(...e); // für den Abgleich mydealz-Tipp -> Apple-Eintrag
        bst.anzahl += e.length;
        const k = e.filter(x => pruefe(x, g, g.art));
        zb.g[g.key] = { t: new Date(jetzt).toISOString(), n: e.length, k: k.slice(0, 200).map(x => [x.id, x.pos]), ...(e.length ? {} : { leer: tag }) };
        bst.genres.push({ id: g.id, name: g.name || '', art: g.art, eintraege: e.length, kandidaten: k.length });
      } catch (e) { bst.ok = false; bst.fehler.push(`${g.art === 'film' ? 'Filme' : 'Serien'} ${g.name || g.id}: ${e.message}`); }
    }
    bst.kandidaten = kand.size;
    // Lookup für Kandidaten ohne frische Daten: Filme zuerst, Billiges zuerst
    const ids = [...kand.values()].filter(x => !daten.has(x.e.id))
      .sort((a, b) => (a.art === b.art ? 0 : a.art === 'film' ? -1 : 1) || ((a.e.preis ?? m.angebotPreis) - (b.e.preis ?? m.angebotPreis)) || ((a.e.pos ?? 999) - (b.e.pos ?? 999)))
      .map(x => x.e.id);
    for (let i = 0; i < ids.length && bst.lookups < m.breitMaxLookups; i += m.lookupMax) {
      if (breitZeit() || appleGestoert() || appleAbrufe >= m.breitGesamtMax) { bst.ohneLookup = ids.length - i; break; }
      const teil = ids.slice(i, i + m.lookupMax), set = new Set(teil);
      bst.lookups++;
      try {
        for (const r of leseErgebnisse(await apple(lookupUrl(teil)))) {
          const d = ausItunes(r);
          if (d && set.has(d.id) && !fremdStore(r)) daten.set(d.id, { ...daten.get(d.id), ...d });
        }
      } catch (e) { bst.ok = false; bst.fehler.push(`Lookup: ${e.message}`); }
    }
    // Kandidaten mit echtem Preis entscheiden
    for (const { e, g, art } of kand.values()) {
      const d = daten.get(e.id);
      const v = zb.p[nr(e.id)] || null;
      if (art === 'film') {
        if (!d && !e.titel) continue; // gemerkter Kandidat ohne Lookup: nächster Lauf
        if (d && d.typ !== 'film') continue;
        const preis = d ? d.preisHd ?? d.preisSd ?? null : e.preis;
        const genre = d?.genre ?? e.genre;
        if (preis == null || istHorror({ genre }, horrorIds) || !filmOk(preis, genre, v)) continue;
        chartTreffer.set(e.id, { pos: e.pos ?? 999, genreId: g.id, neu: false, d: e.titel ? e : { ...d, preis }, breit: true });
        breitIds.add(e.id);
        if (v) breitVergleich.set(e.id, { vorher: v[2] > 0 ? v[2] / 100 : null, hoch: v[1] / 100 });
        bst.filme++;
      } else {
        if (d?.typ !== 'staffel' || !v || v[2] <= 0) continue;
        const preis = d.preisHd ?? d.preisSd ?? null;
        if (!gesenktP(v, preis) || Math.abs(preis - v[0] / 100) > 0.005) continue; // echter Preis = Chart-Preis und unter dem früher gesehenen
        const info = (d.komplett && komplettInfo(d.titel)) || staffelInfo(d.titel) || komplettInfo(d.titel);
        if (wunschPosten(info?.serie, d.kuenstler)) continue; // Staffel deiner Serie: bleibt beim bisherigen Weg
        daten.set(e.id, { ...d, serie: info?.serie || d.kuenstler || d.titel, nr: info?.nr ?? null, zusatz: info?.zusatz || '' });
        breitStaffeln.push({ id: e.id, vorher: v[2] / 100 });
        bst.staffeln++;
      }
    }
    // Qualität (Wikidata) nur für die neuen Film-Kandidaten – nach denen des bisherigen Wegs, eigenes Budget
    if (m.qualitaet !== false) {
      const kq = [...breitIds].filter(id => !qualiFrisch(zf.quali[nr(id)])).map(id => {
        const c = chartTreffer.get(id), d = daten.get(id) || c?.d || {};
        return { id, nr: nr(id), name: suchName(d.titel), jahr: jahrImTitel(d.titel) ?? d.jahr ?? null, preis: d.preisHd ?? d.preisSd ?? d.preis ?? null, pos: c?.pos ?? 999 };
      }).filter(t => t.name && /^\d+$/.test(t.nr)).sort((a, b) => (a.preis ?? 99) - (b.preis ?? 99) || a.pos - b.pos);
      for (let i = 0; i < kq.length && bst.quali < m.breitQualiAbrufe && Date.now() - start < m.breitQualiBisSek * 1000; i += m.qualiJeAbfrage) {
        const teil = kq.slice(i, i + m.qualiJeAbfrage);
        bst.quali++;
        try {
          const zeilen = leseQuali(await holeText(wikidataUrl(qualiAbfrage(teil)), { headers: { accept: 'application/sparql-results+json' } }));
          for (const t of teil) {
            const q = qualiWahl(zeilen, t);
            zf.quali[t.nr] = q ? { l: q.l, h: q.horror ? 1 : 0, k: q.kinder ? 1 : 0, rt: q.rt, j: q.jahr ?? null, q: q.item ?? null, tag } : { l: -1, tag };
          }
        } catch (e) { bst.fehler.push(`Wikidata (Qualität): ${e.message}`); break; }
      }
    }
    for (const [k, v] of Object.entries(zb.p)) if (!Array.isArray(v) || tagNr - v[4] > m.breitVergessenTage) delete zb.p[k];
    for (const k of Object.keys(zb.g)) if (!genres.some(g => g.key === k)) delete zb.g[k];
    bst.abrufe = appleAbrufe - vorAbrufe;
  }

  // 4e) Große Produktion? Besetzung? (Xander 16.11.2026) – Wikidata über die Q-Nummer aus 4c/4d, im Zustand gemerkt (zf.detail,
  //     detailTage); nur Filme bis detailBisPreis (die Seite filtert nur unter den günstigen), Billiges zuerst, eigenes Budget
  zf.detail ||= {};
  const ds = { ok: true, anzahl: 0, fehler: [], abfragen: 0, offen: 0 };
  status['wikidata-details'] = ds;
  if (m.details !== false && m.qualitaet !== false) {
    const preisVonId = id => { const d = daten.get(id) || chartTreffer.get(id)?.d; return d ? d.preisHd ?? d.preisSd ?? d.preis ?? null : null; };
    const frisch = x => x && x.tag && tageZwischen(x.tag, tag) < m.detailTage;
    const offen = [], gesehenQ = new Set();
    for (const id of new Set([...chartTreffer.keys(), ...breitIds, ...listenIds])) {
      const q = zf.quali[nr(id)]?.q;
      if (!q || gesehenQ.has(q) || frisch(zf.detail[q])) continue;
      const p = preisVonId(id);
      if (p == null || p > m.detailBisPreis) continue;
      gesehenQ.add(q); offen.push({ q, p });
    }
    offen.sort((a, b) => a.p - b.p);
    ds.offen = offen.length;
    for (let i = 0; i < offen.length && ds.abfragen < m.detailMaxAbrufe && Date.now() - start < m.detailBisSek * 1000; i += m.detailJeAbfrage) {
      const teil = offen.slice(i, i + m.detailJeAbfrage);
      ds.abfragen++;
      try {
        const roh = leseDetails(await holeText(wikidataUrl(detailAbfrage(teil.map(x => x.q))), { headers: { accept: 'application/sparql-results+json' } }));
        for (const x of teil) zf.detail[x.q] = detailKurz(roh.get(x.q) || { b: null, a: [], s: [], v: [], c: [] }, tag);
        ds.anzahl += teil.length; ds.offen -= teil.length;
      } catch (e) { ds.ok = false; ds.fehler.push(`Wikidata (Details): ${e.message}`); break; } // kein Modul-Fehler: Filter nutzt dann die Bekanntheit
    }
    for (const [k, x] of Object.entries(zf.detail)) if (!x?.tag || tageZwischen(x.tag, tag) > m.detailTage * 2) delete zf.detail[k];
  }
  const detailVon = id => { const q = zf.quali[nr(id)]?.q; return q ? zf.detail[q] ?? null : null; };

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
      const lage0 = { ...preisLage(v, preis, tag, { typ: d.typ, ...opts }), seit: v.seit };
      const bw = bewerte(v, preis, tag, lage0, { typ: d.typ, filme: d.filme ?? null, staffelZiel, m });
      const lage = { ...lage0, ...bw, extern: externTiefst(zf.extern?.[id]) };
      if (preis != null && tiefstVorher && !ersteBeobachtung && preis < tiefstVorher.p) neueTiefst.add(id);
      t = titelObjekt({ ...d, chart: chartTreffer.get(id)?.pos ?? null }, lage);
      t._hoechst = lage.hoechst; t._gesenkt = lage.gesenkt; t._horror = istHorror(d, horrorIds); t._rang = bw.rang; t._guenstig = bw.guenstig;
      if (d.typ === 'box') t.angebot = !!bw.guenstig || !!bw.knueller; // Box: nur echt gesenkt (nicht nach Kurz-Hoch, nicht ewig)
      // breite Suche: eigener früher gesehener Chart-Preis als Vergleich (der Radar kennt den Film sonst erst ab heute)
      const bv = breitVergleich.get(id);
      if (bv && t.preis != null) {
        if (bv.hoch > (t._hoechst ?? 0)) t._hoechst = bv.hoch;
        if (t.vorher == null && bv.vorher > t.preis) { t.vorher = bv.vorher; t._gesenkt = true; }
      }
      const ct = chartTreffer.get(id)?.d; // Lookup ohne Beschreibung -> die aus den Charts
      t._horrorText = Math.max(horrorText(d.text, d.genre), horrorText(ct?.text, ct?.genre ?? d.genre)); // nur Chart-Titel zählen: 0–3
    } else {
      const a = altDaten.get(id) || chartTreffer.get(id)?.altTitel;
      if (a) { t = { ...a }; t._horror = istHorror(a, horrorIds); t._alt = true; }
    }
    if (t) titel.set(id, t);
    return t;
  }

  const gruppen = { wunsch: [], angebot: [], neu: [], achtziger: [], serien: [], disney: [], boxen: [] };
  const wunschIds = new Set(), kuratiert = new Map(); // id -> 'achtziger' | 'disney'
  const nachPreis = (a, b) => (b.angebot - a.angebot) || ((a.preis ?? Infinity) - (b.preis ?? Infinity));
  // Kappe mit Schutz: die Treffer des bisherigen Wegs zählen wie vorher gegen altMax (dieselben bleiben), neue Treffer der
  // breiten Suche füllen nur bis gesamtMax auf – ein neuer Treffer verdrängt nie einen bisherigen
  const kappe = (arr, altMax, gesamtMax) => {
    let alt = 0;
    const r = arr.filter(t => breitIds.has(t.id) || ++alt <= altMax);
    let frei = Math.max(0, gesamtMax - Math.min(alt, altMax));
    return r.filter(t => !breitIds.has(t.id) || frei-- > 0);
  };

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
  const wunschStaffeln = new Set(); // alle Staffel-Nummern deiner Serien (auch die doppelten, die nicht gezeigt werden)
  for (const p of posten.filter(x => x.serie)) {
    const eigene = liste(zf.ids[p.key]?.ids);
    const ausCharts = Object.keys(zf.staffelPool).filter(id => daten.get(id)?.wunschKey === p.key && !eigene.includes(id));
    ss.deineAusCharts += ausCharts.length;
    for (const id of [...eigene, ...ausCharts]) {
      wunschStaffeln.add(id);
      const t = baue(id);
      if (!t || t._horror || t.typ !== 'staffel') continue;
      const d = daten.get(id);
      const k = `${p.item.titel}|${t.nr ?? t.titel}|${normTitel(d?.zusatz || '').replace(/\b(uncensored|unzensiert|remastered|omu|ov|hd|4k)\b/g, '').trim()}`;
      const vor = staffeln.get(k);
      const besser = !vor || (t.preis ?? Infinity) < (vor.preis ?? Infinity) || ((t.preis ?? Infinity) === (vor.preis ?? Infinity) && !(d?.zusatz) && !!daten.get(vor.id)?.zusatz);
      if (besser) staffeln.set(k, t);
    }
  }
  const serienSort = (a, b) => (b.angebot - a.angebot) || ((serienReihe.get(a.serie) ?? 99) - (serienReihe.get(b.serie) ?? 99)) || ((a.nr ?? 0) - (b.nr ?? 0));
  gruppen.serien = [...staffeln.values()].slice(0, 400).sort(serienSort);
  for (const t of gruppen.serien) t.wunsch = true; // deine Serien (Liste „serien“) bleiben oben
  // alle anderen Serien: nur Staffeln im Angebot – mindestens angebotMinPct % unter dem üblichen Preis (bzw. frisch unter dem
  // zuletzt gesehenen, solange es noch keinen üblichen gibt) oder Knüller. ≤ 9,99 € allein reicht nicht (viele alte Staffeln kosten
  // das immer); ein Kurz-Hoch und eine längst dauerhafte Senkung zählen nicht (Prüfer 15.11.). Knüller zuerst, dann nach Ersparnis.
  // Dazu „neu entdeckt“: erst seit ≤ neuEntdecktTage beobachtet, gerade in den Serien-Charts, ≤ staffelZiel – ehrlich ohne Vergleich.
  const nachRang = (a, b) => (!!b.knueller - !!a.knueller) || (!!a.neuEntdeckt - !!b.neuEntdeckt) || ((b._rang ?? 0) - (a._rang ?? 0)) || ((a.preis ?? Infinity) - (b.preis ?? Infinity));
  const imAngebot = t => t.preis != null && (!!t.knueller || t._guenstig);
  const andere = [];
  for (const id of Object.keys(zf.staffelPool)) {
    if (wunschStaffeln.has(id)) continue;
    const t = baue(id);
    if (!t || t._alt || t._horror || t.typ !== 'staffel' || t.preis == null) continue;
    if (imAngebot(t)) { t.angebot = true; andere.push(t); continue; }
    const neu = zf.staffelPool[id] === tag && (t.tage ?? 99) <= m.neuEntdecktTage && t.vorher == null && t.preis <= staffelZiel;
    if (neu) { t.angebot = false; t.neuEntdeckt = true; andere.push(t); ss.neuEntdeckt++; }
  }
  for (const t of andere) t.wunsch = false;
  ss.staffeln = andere.length;
  gruppen.serien.push(...andere.sort(nachRang).slice(0, m.maxSerienAngebot));
  // Staffeln aus der breiten Suche: nur mit echter Senkung gegenüber dem selbst gesehenen Chart-Preis, hinter den bisherigen
  const inSerien = new Set(gruppen.serien.map(t => t.id));
  const breitS = [];
  for (const b of breitStaffeln) {
    if (inSerien.has(b.id) || wunschStaffeln.has(b.id)) continue;
    const t = baue(b.id);
    if (!t || t._alt || t._horror || t.typ !== 'staffel' || t.preis == null || !(b.vorher > t.preis)) continue;
    const pct = Math.round((1 - t.preis / b.vorher) * 100);
    if (pct < m.angebotMinPct) continue;
    t.vorher = b.vorher; t._gesenkt = true;
    if (!t.ersparnis) t.ersparnis = { eur: round(b.vorher - t.preis, 2), pct, basis: 'zuletzt' };
    t.angebot = true; t.wunsch = false; t._rang = Math.max(t._rang ?? 0, pct);
    breitS.push(t);
  }
  status['apple-breit'].staffelnAngebot = breitS.length;
  gruppen.serien.push(...breitS.sort(nachRang).slice(0, m.breitMaxSerien));
  // Film-Boxen: nur im Angebot (≥ angebotMinPct % unter dem üblichen bzw. frisch unter dem letzten Preis) oder Knüller – eine Box,
  // die immer günstig je Film ist, aber nicht gesenkt, steht nicht unter „im Angebot“ (Prüfer 15.11.). Gleich benannte Boxen
  // (Star Wars, „10 Modern Classics“ je zweimal) nur einmal: die günstigere. Knüller zuerst, dann nach Ersparnis/Preis je Film.
  const boxNamen = new Map();
  for (const t of Object.keys(zf.boxen).map(id => baue(id))) {
    if (!t || t._alt || t._horror || t.typ !== 'box' || t.preis == null || !(t.knueller || t._guenstig)) continue;
    t.angebot = true;
    const k = normTitel(t.titel), vor = boxNamen.get(k);
    if (!vor || t.preis < vor.preis || (t.preis === vor.preis && !!t.knueller > !!vor.knueller)) boxNamen.set(k, t);
  }
  gruppen.boxen = [...boxNamen.values()].sort((a, b) => nachRang(a, b) || ((a.jeFilm ?? 99) - (b.jeFilm ?? 99))).slice(0, m.maxBoxen);
  // Neu aus den Charts – ohne Kinderfilme (Kinder-Chart, Wikidata-Genre, Apple-Genre); in den anderen Bereichen bleiben sie
  // (leere Reihe – Titel ohne lateinische Buchstaben – zählt nicht: sonst gälten alle solchen Titel als Kinderfilm)
  const kindGrund = t => { const r = kinderReihe(t.titel); return kinderGrund({ kinderChart: kinderIds.has(t.id) ? 'kinder-chart' : !!r && kinderReihen.has(r) && 'reihe', genres: [t.genre, chartTreffer.get(t.id)?.d?.genre], q: qualiVon(t.id) }); };
  const neuRoh = [...chartTreffer.entries()].filter(([, c]) => c.neu).sort((a, b) => a[1].pos - b[1].pos)
    .map(([id]) => baue(id)).filter(t => t && !t._horror && t.typ === 'film');
  const kindIn = new Map(neuRoh.map(t => [t.id, kindGrund(t)]));
  gruppen.neu = neuRoh.filter(t => !kindIn.get(t.id)).slice(0, m.maxNeu);
  // Angebote: Filme ≤ 3,99 € (≤ 4,99 € bei Tiefstpreis oder laufender Apple-Aktion) – nur Kuratiertes oder Chart-Titel
  const kandidaten = new Map();
  for (const t of [...gruppen.wunsch, ...gruppen.achtziger, ...gruppen.disney]) if (t.id?.startsWith('itunes:')) kandidaten.set(t.id, t);
  for (const id of chartTreffer.keys()) { const t = baue(id); if (t) kandidaten.set(id, t); }
  const rang = t => (wunschIds.has(t.id) ? 0 : kuratiert.has(t.id) ? 1 : 2);
  // Qualität: deine Listen immer; Chart-Titel nur, wenn bekannt/gut bewertet und kein Horror (Genre, Wikidata, Beschreibung)
  // Beschreibung: klares Horror-Wort immer raus; zwei schwache Zeichen raus, wenn Wikidata den Film nicht kennt oder gestört ist
  const gut = t => {
    if (rang(t) < 2) return true;
    const q = qualiVon(t.id), ht = t._horrorText || 0;
    if (horrorVerdacht(ht, q)) return false;
    // breite Suche: Platz in einem Nischen-Genre sagt nichts – nur mit Wikidata-Daten (bekannt oder gut bewertet; echter Lauf
    // 43796648997: ohne diese Regel kamen Kurzfilme für 1,99 € und ein falscher „Death Wish“ nach vorn)
    if (breitIds.has(t.id)) return !!q && q.l >= 0 && qualiOk(q, { chart: null, neu: false }, m);
    return qualiOk(q, { chart: t.chart, neu: !!chartTreffer.get(t.id)?.neu }, m);
  };
  let qualiRaus = 0;
  for (const t of [...kandidaten.values()]) {
    const q = qualiVon(t.id);
    if (q && q.l >= 0) { t.rt = q.rt; t.bekannt = q.l; } // Zusatzfelder: Rotten Tomatoes (%) und Wikipedia-Sprachen
    // große Produktion/Kinohit (gross = Grund, null = eher klein/Indie; fehlt = noch keine Daten) und Besetzung für die Filter der Seite
    const dt = detailVon(t.id);
    if (dt) { if (dt.c?.length) t.cast = dt.c; if (dt.st) t.studio = dt.st; if (dt.b != null) t.einspiel = dt.b; if (dt.o) t.oscars = dt.o; }
    if (q && q.l >= 0 && (dt || q.l >= 60)) t.gross = grossGrund(q.l, dt);
    // Filmjahr von Wikidata, wenn Apple nur die Wiederveröffentlichung kennt (≥ 2 Jahre älter; Festival-Premieren ein Jahr vorher zählen nicht)
    if (q && q.l >= 0 && q.jahr && t.typ === 'film' && t.jahr && q.jahr <= t.jahr - 2 && jahrImTitel(t.titel) == null) t.jahr = q.jahr;
    if (!gut(t)) { kandidaten.delete(t.id); qualiRaus++; }
  }
  qs.raus = qualiRaus;
  gruppen.neu = gruppen.neu.filter(gut);
  // so viele Kinderfilme wären ohne die Regel unter „Neu“ zu sehen gewesen (Prüfer MV10 6: nach maxNeu und Qualität gezählt);
  // Titel mit Grund zum Nachsehen nach echten Läufen (Prüfer MV10 1)
  const kinderWeg = neuRoh.slice(0, m.maxNeu).filter(t => kindIn.get(t.id) && gut(t));
  status['apple-charts'].kinderNichtNeu = kinderWeg.length;
  status['apple-charts'].kinderNichtNeuTitel = kinderWeg.slice(0, 10).map(t => `${t.titel} (${kindIn.get(t.id)})`);
  gruppen.angebot = [...kandidaten.values()]
    .filter(t => t.typ === 'film' && !t._horror && t.preis != null && (t.preis <= m.angebotPreis
      || (t.preis <= m.angebotPreisAktion && ((t.istTiefst && t.tage >= 7 && (t._hoechst ?? 0) > t.preis) || (aktion && t._gesenkt)))))
    .sort((a, b) => rang(a) - rang(b) || ((a.chart ?? 999) - (b.chart ?? 999)) || (a.preis - b.preis));
  gruppen.angebot = kappe(gruppen.angebot, m.maxAngebot, m.breitMaxAngebot);
  for (const t of raumTreffer) {
    gruppen.angebot.push({
      id: `appletv:${t.f.umc}`, typ: 'film', titel: t.p.item.titel, jahr: t.p.item.jahr ?? null,
      ...NULL_TITEL, preis: t.preis, seit: tag, tage: 1, angebot: true, link: t.f.link, quelle: 'Apple', raum: t.raum, raumUrl: t.raumUrl, liste: t.p.gruppe,
    });
  }
  const mdEintrag = it => ({
    id: `mydealz:${threadId(it.link) || schluessel(it.link)}`, typ: /staffel|season|serie/i.test(it.titel) ? 'staffel' : 'film',
    titel: it.titel.replace(/^\s*\[[^\]]{1,30}\]\s*/, '') || it.titel, jahr: null, // „[iTunes / Apple TV] …“ -> kurz
    ...NULL_TITEL, preis: preisWert(it.preisText), seit: tag, tage: 1, angebot: true, bild: it.bild || null, link: it.link, quelle: 'mydealz',
    _text: `${it.titel} ${it.beschreibung || ''}`,
  });
  for (const it of deals) gruppen.angebot.push(mdEintrag(it));

  // mydealz-Tipps: Staffeln zu „Serien“, Sets/Collections zu „Boxen“ (dieselben Einträge wie unter „angebot“). Eine Staffel deiner
  // Serie (am Namen erkannt) steht bei deiner Serie, nicht unter „Weitere Serien“ (Prüfer 15.11.: Strange New Worlds).
  const BOX_WORT = /collection|kollektion|trilogie|bundle|sammlung|\b\d{1,2}[\s-]*(?:filme|movies)\b|\bset\b|\bbox\b/i;
  const mdStaffel = t => {
    const info = komplettInfo(t.titel) || staffelInfo(t.titel);
    const p = wunschPosten(info?.serie, t.titel.replace(/\s+[–—|-]\s.*$/, ''));
    return p ? { ...t, typ: 'staffel', wunsch: true, serie: p.item.titel } : { ...t, typ: 'staffel', wunsch: false };
  };
  for (const t of gruppen.angebot.filter(x => x.quelle === 'mydealz')) {
    if (t.typ === 'staffel' || STAFFEL_WORT.test(t.titel)) gruppen.serien.push(mdStaffel(t));
    else if (BOX_WORT.test(t.titel)) gruppen.boxen.push(t);
  }
  // mydealz-Box-Tipps mit echtem Vergleichspreis (Xander 16.11.2026: „Boxen, die gerade deutlich reduziert sind – echter
  // Unterschied zum Originalpreis“): „statt“ aus dem Deal-Text (UVP, Vergleichspreis, statt …), sonst der Vergleichspreis der
  // Deal-Seite (nextBestPrice; gemeinsames Budget der Deal-Seiten je Lauf). Ohne Vergleichspreis bleibt der Tipp ohne „statt“
  // (die Seite stellt ihn unter „Tipps ohne Vergleichspreis“).
  const boxPruefer = dealPruefer({ holeText, zustand, jetzt });
  for (const t of gruppen.boxen.filter(x => x.quelle === 'mydealz' && x.preis != null)) {
    let v = altpreisAusText(t._text || t.titel, t.preis);
    if (!(v?.preis > t.preis)) {
      const s = await boxPruefer.pruefe(t.link, { neuNachStunden: 12 });
      v = s.info?.vergleichspreis > t.preis ? { preis: s.info.vergleichspreis, quelle: 'Vergleichspreis laut mydealz' } : null;
    }
    if (v?.preis > t.preis) {
      t.vorher = v.preis;
      t.vorherQuelle = v.quelle;
      t.ersparnis = { eur: Math.round((v.preis - t.preis) * 100) / 100, pct: Math.round((1 - t.preis / v.preis) * 100) };
    }
  }
  for (const it of serienDeals) gruppen.serien.push(mdStaffel(mdEintrag(it)));
  // deine Serien oben (auch die mydealz-Tipps dazu, Angebote zuerst), dann alle anderen in Radar-Reihenfolge
  gruppen.serien = [...gruppen.serien.filter(t => t.wunsch !== false).sort(serienSort), ...gruppen.serien.filter(t => t.wunsch === false)];

  // 5c) Übersicht nach Xanders Wunsch (14.11.2026): Für 3,99 € · Action & Thriller · Comedy · 80er & Klassiker
  //     Angebot = Kauf ≤ angebotMax (7,99 €) oder ≤ 70 % des zuletzt/höchsten gesehenen Preises; Wunschliste zuerst, dann
  //     Kuratiertes, dann nach Preis und Qualität. mydealz-Aktionen: ≤ 3,99 € je Film -> „Für 3,99 €“, sonst nach Titel.
  const deutlich = t => t.preis != null && ((t.vorher != null && t.preis <= t.vorher * m.deutlichFaktor) || ((t._hoechst ?? 0) > 0 && t.preis <= t._hoechst * m.deutlichFaktor));
  const istAngebotGenre = t => t.preis != null && (t.preis <= m.angebotMax || deutlich(t));
  const pool = [...kandidaten.values()].filter(t => t.typ === 'film' && !t._horror && t.preis != null && t.id?.startsWith('itunes:'));
  for (const t of pool) { if (chartTreffer.get(t.id)?.neu) t.neu = true; if (deutlich(t) && !t.angebot) t.angebot = true; }
  const nachWert = (a, b) => rang(a) - rang(b) || (a.preis - b.preis) || (qualiWert(qualiVon(b.id)) - qualiWert(qualiVon(a.id))) || ((a.chart ?? 999) - (b.chart ?? 999));
  const mdDeals = gruppen.angebot.filter(t => t.quelle === 'mydealz');
  const raumTitel = gruppen.angebot.filter(t => String(t.id).startsWith('appletv:'));
  const mdJeFilm = t => preisJeFilm(t.titel, t.preis);
  // Apples eigene Aktions-Sammlung („Filme für 3,99 €“) zuerst: Film schon aus den Charts bekannt -> dieser Eintrag (Bild, Preis)
  // mit Raum-Marke, sonst ein Eintrag aus dem Raum (Titel wie bei Apple, Preis aus dem Raum-Namen). Horror bleibt draußen.
  const ausRaum = [];
  for (const r of raumAlle.filter(x => x.preis <= m.angebotPreis)) {
    const titel = r.f.name || r.f.titel;
    const bekannt = [...kandidaten.values()].find(t => t.typ === 'film' && t.preis != null && t.preis <= m.angebotPreis && slugVon(t.titel) === r.f.slug);
    if (bekannt?._horror || (!bekannt && horrorText(titel) >= 2)) continue;
    if (raumTitel.some(t => t.id === `appletv:${r.f.umc}`)) continue; // steht schon als Treffer deiner Liste drin
    ausRaum.push(bekannt ? { ...bekannt, angebot: true, raum: r.raum, raumUrl: r.raumUrl }
      : { id: `appletv:${r.f.umc}`, typ: 'film', titel, jahr: null, ...NULL_TITEL, preis: r.preis, seit: tag, tage: 1, angebot: true, link: r.f.link, quelle: 'Apple', raum: r.raum, raumUrl: r.raumUrl });
  }
  const ausRaumIds = new Set(ausRaum.map(t => t.id));
  // mydealz-Tipps -> Apple-Eintrag (Xander 16.11.2026: „sahen aus, als ruhten sie noch auf der mydealz-Seite statt in der
  // Apple-App“): ein einzelner Film (kein Set) mit genau einem gleichnamigen Apple-Film zum Tipp-Preis wird der Apple-Eintrag
  // (Link in die TV-App, Vermerk „Tipp von mydealz“). Sonst bleibt der Tipp mit Hinweis. Kandidaten: alle Apple-Filme dieses
  // Laufs (Lookups, Charts, Genre-Charts); ohne Treffer ein Versuch über Wikidata (P6398 = iTunes-Nummer) + ein Lookup.
  const appleKand = new Map();
  const kand = (id, titel, jahr, preis) => { if (id && titel && preis != null) appleKand.set(id, { id, titel, jahr: jahr ?? null, preis }); };
  for (const e of [...alleCharts, ...breitCharts]) kand(e.id, e.titel, e.jahr, e.preis);
  for (const d of daten.values()) if (d?.typ === 'film') kand(d.id, d.titel, d.jahr, d.preisHd ?? d.preisSd ?? null); // Lookup = frischer Preis
  const einzeln = t => t.preis != null && mdJeFilm(t) != null && Math.abs(mdJeFilm(t) - t.preis) < 0.005; // kein Set
  const mdApple = new Map(); // mydealz-id -> Apple-Nummer
  const abgleich = (status.mydealz.apple = { geprueft: 0, gefunden: 0, wikidata: 0 });
  const tippZiele = mdDeals.filter(t => einzeln(t) && (t.preis <= m.angebotPreis || COUNTDOWN_WORT.test(t._text || t.titel)));
  const ordne = t => { const r = appleZuTipp(t.titel, t.preis, [...appleKand.values()]); if (r.treffer) mdApple.set(t.id, r.treffer.id); return r; };
  const offenTipps = tippZiele.filter(t => { abgleich.geprueft++; return !ordne(t).treffer; });
  // Budget: der eine Lookup zählt zu allen Apple-Abrufen des Laufs (breitGesamtMax) – ist es aufgebraucht, bleibt der Tipp ein Tipp
  if (offenTipps.length && m.mdAppleWikidata !== false && m.wikidata !== false && !appleGestoert() && appleAbrufe < Math.min(m.maxAppleAbrufe, m.breitGesamtMax)) {
    try {
      const namen = [...new Set(offenTipps.map(t => mdFilmTitel(t.titel)).filter(x => x.length >= 2))].slice(0, 6);
      abgleich.wikidata++;
      const zeilen = leseWikidata(await holeText(wikidataUrl(wikidataAbfrage(namen)), { headers: { accept: 'application/sparql-results+json' } }));
      const ids = [...new Set(zeilen.map(z => z.id))].slice(0, 40);
      if (ids.length) {
        for (const r of leseErgebnisse(await apple(lookupUrl(ids)))) {
          const d = ausItunes(r);
          if (d?.typ !== 'film' || fremdStore(r)) continue;
          daten.set(d.id, { ...daten.get(d.id), ...d });
          kand(d.id, d.titel, d.jahr, d.preisHd ?? d.preisSd ?? null);
        }
      }
    } catch (e) { status.mydealz.fehler.push(`Abgleich mit Apple: ${e.message}`); } // kein Modul-Fehler: der Tipp bleibt Tipp
    for (const t of offenTipps) ordne(t);
  }
  const ausTipp = t => {
    const id = mdApple.get(t.id);
    const a = id ? baue(id) : null;
    if (!a || a._horror || a._alt || a.preis == null || a.typ !== 'film') {
      if (!id) t.hinweis = 'bei Apple nicht eindeutig gefunden';
      return t;
    }
    abgleich.gefunden++;
    a.tipp = { quelle: 'mydealz', link: t.link }; // Vermerk: kam als Tipp von mydealz, der Link führt in die TV-App
    if (!a.angebot) a.angebot = true;
    return a;
  };
  const tipps399 = mdDeals.filter(t => einzeln(t) && t.preis <= m.angebotPreis && !doppelTipp(t.titel, pool.filter(x => x.preis <= m.angebotPreis).map(x => x.titel))).map(ausTipp);
  const fuer399Ids = new Set();
  gruppen.fuer399 = kappe([
    ...raumTitel.filter(t => t.preis != null && t.preis <= m.angebotPreis),
    ...ausRaum,
    ...pool.filter(t => t.preis <= m.angebotPreis && !ausRaumIds.has(t.id)).sort(nachWert),
    ...raumTitel.filter(t => t.preis == null),
    // Sets („4 Filme für 14,99 €“) stehen unter „Boxen“, nicht unter „Für 3,99 €“ (Xander 16.11.2026)
    ...tipps399.filter(t => t.quelle === 'mydealz' || t.preis <= m.angebotPreis),
  ].filter(t => !fuer399Ids.has(t.id) && fuer399Ids.add(t.id)), m.maxGruppe, m.breitMaxFuer399);
  // Countdown/Adventskalender (Dezember): Apples Tagesangebot aus mydealz-Tipps und Angebotsräumen – für den Tages-Push
  const countdown = [
    ...mdDeals.filter(t => einzeln(t) && COUNTDOWN_WORT.test(t._text || t.titel)).map(t => {
      const a = mdApple.has(t.id) ? baue(mdApple.get(t.id)) : null;
      return a && a.preis != null && !a._horror
        ? { id: a.id, titel: a.titel, jahr: a.jahr ?? null, preis: a.preis, link: a.link, bild: a.bild ?? null, quelle: 'mydealz', tag }
        : { id: t.id, titel: mdFilmTitel(t.titel) || t.titel, jahr: null, preis: t.preis, link: t.link, bild: t.bild ?? null, quelle: 'mydealz', tag };
    }),
    ...raumCountdown.map(r => ({ id: `appletv:${r.f.umc}`, titel: r.f.name || r.f.titel, jahr: null, preis: r.preis, link: r.f.link, bild: null, quelle: 'apple-tv', raum: r.raum, tag })),
  ].filter(x => x.titel && x.link).slice(0, 5);
  const mdRest = mdDeals.filter(t => !(mdJeFilm(t) != null && mdJeFilm(t) <= m.angebotPreis));
  const mdComedy = t => /kom(?:ö|oe)die|comedy/i.test(t.titel);
  gruppen.action = kappe([...pool.filter(t => genreGruppe(t.genre) === 'action' && istAngebotGenre(t)).sort(nachWert), ...mdRest.filter(t => !mdComedy(t))], m.maxGruppe, m.breitMaxGruppe);
  gruppen.comedy = kappe([...pool.filter(t => genreGruppe(t.genre) === 'comedy' && istAngebotGenre(t)).sort(nachWert), ...mdRest.filter(mdComedy)], m.maxGruppe, m.breitMaxGruppe);
  // 80er & Klassiker: deine 80er-Liste (alle, Angebote zuerst) + gute Klassiker aus den Charts im Angebot (bis 1999)
  const in80 = new Set(gruppen.achtziger.map(t => t.id));
  const klassiker = pool.filter(t => !in80.has(t.id) && !kuratiert.has(t.id) && !wunschIds.has(t.id) && t.jahr != null && (jahrImTitel(t.titel) ?? t.jahr) <= 1999 && istAngebotGenre(t));
  gruppen.achtziger = [...gruppen.achtziger, ...klassiker].sort(nachPreis);
  // Zahl auf der Kachel: echte Angebote – Für 3,99 €, Gesenktes, deine Wunschfilme unter Ziel; nicht der Normalpreis bis 7,99 €
  // aus Action/Comedy (Dune 7,99 €, Iron Man 4,99 €; Prüfer-Befund MV8 8 / MV7 11)
  const echt = t => t.angebot || (t.preis != null && t.preis <= m.angebotPreis);
  const angebotsZahl = new Set([...gruppen.fuer399, ...[...gruppen.action, ...gruppen.comedy, ...gruppen.achtziger, ...gruppen.disney, ...gruppen.serien].filter(t => t.angebot || (t.typ === 'film' && echt(t))), ...gruppen.boxen.filter(t => t.angebot || t.knueller), ...gruppen.wunsch.filter(t => t.angebot || t.unterZiel)].map(t => t.id)).size;
  // Xander 16.11.2026: „Bei den Filmen geht es mir nur um die 3,99-€-Sachen, teurere müssen nicht rein“ – die Kachel zählt nur
  // noch einzelne Filme bis 3,99 € (dazu deine Wunschfilme unter Ziel); die alte Zahl bleibt als angeboteAlle für ältere Seiten
  const bis399 = t => t && t.typ === 'film' && t.preis != null && t.preis <= m.angebotPreis + 0.004 && t.quelle !== 'mydealz';
  const fuer399Zahl = new Set([...gruppen.fuer399, ...gruppen.action, ...gruppen.comedy, ...gruppen.achtziger, ...gruppen.disney, ...gruppen.wunsch].filter(bis399).map(t => t.id)).size;
  const kurz = {
    angebote: new Set([...[...gruppen.fuer399, ...gruppen.action, ...gruppen.comedy, ...gruppen.achtziger, ...gruppen.disney, ...gruppen.wunsch].filter(bis399), ...gruppen.wunsch.filter(t => t.preis != null && t.unterZiel)].map(t => t.id)).size,
    fuer399: fuer399Zahl,
    angeboteAlle: angebotsZahl,
    top: [...gruppen.wunsch.filter(t => t.preis != null && (t.angebot || t.unterZiel)), ...gruppen.fuer399.filter(bis399)] // deine Wunschfilme unter Ziel bleiben vorn
      .filter((t, i, a) => a.findIndex(x => x.id === t.id) === i).slice(0, 3).map(t => ({ titel: t.titel, preis: t.preis ?? null })),
  };

  // 6) Einträge für Seite und Push: nur echte Treffer
  const eintraege = [];
  const mitPreis = t => t && t.preis != null && t.link && !t._alt;
  const neuerEintrag = (t, { grund, wert, sofort, gruppe, zusatz = [] }) => {
    // „statt“ = der übliche Preis, sobald es einen gibt (nie ein Kurz-Hoch); sonst wie bisher der zuletzt andere Preis.
    // „Tiefst seit <Monat Jahr>“: der Radar kennt nur, was er selbst gesehen hat (Prüfer 15.11.)
    const ueblich = t.ueblich != null && t.preis != null;
    const p = preisAngaben({ preis: t.preis, preisVorher: ueblich ? t.ueblich : t.vorher, vorherQuelle: ueblich ? 'üblicher Preis bei Apple TV' : 'zuletzt bei Apple TV' });
    const seit = monatJahr(t.seit);
    const zeile = [
      p.preisVorher != null ? `Kaufen ${euro(t.preis)} statt ${euro(p.preisVorher)}` : `Kaufen ${euro(t.preis)}`,
      t.istTiefst && t.tage >= 7 ? (seit ? `Tiefst seit ${seit}` : 'Tiefst seit Beobachtung') : '', t.leihe != null ? `Leihen ${euro(t.leihe)}` : '',
      ...zusatz.map(z => z === 'neuer Tiefstpreis' && seit ? `neuer Tiefst seit ${seit}` : z),
    ].filter(Boolean).join(' · ');
    eintraege.push(eintrag({
      id: `film-${schluessel(t.id, String(t.preis))}`, kategorie: 'filme',
      titel: filmPushTitel(t),
      link: t.link, quelle: 'Apple TV', datum: jetzt, jetzt, art: 'deal', preise: p, zeile,
      soGehts: t.typ === 'staffel' ? SO_STAFFEL : t.typ === 'box' ? SO_BOX : SO_FILM, wert, sofort, grund,
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
    if (t.wunsch !== true || !mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt) continue; // Regel wie bisher: nur deine Serien
    gemeldet.add(t.id);
    if (t.preis <= staffelZiel) neuerEintrag(t, { grund: 'Staffel im Angebot', wert: 80, sofort: true, gruppe: 'serien' });
    else if (t.preis <= t.vorher * 0.7) neuerEintrag(t, { grund: 'Staffel billiger', wert: 60, sofort: false, gruppe: 'serien' });
  }
  for (const g of ['achtziger', 'disney']) {
    for (const t of gruppen[g]) {
      if (!mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt || !kuratiert.has(t.id)) continue; // Chart-Klassiker: unten als Angebot
      gemeldet.add(t.id);
      // teurer als 3,99 €: keine Meldung mehr (Xander 16.11.2026: „teurere müssen nicht rein; ich will sparen“)
      if (t.preis <= m.angebotPreis) neuerEintrag(t, { grund: g === 'disney' ? 'Disney-Film für 3,99 €' : 'Kultfilm für 3,99 €', wert: 80, sofort: true, gruppe: g });
    }
  }
  for (const t of gruppen.angebot) {
    if (t.quelle !== 'Apple' || !mitPreis(t) || gemeldet.has(t.id) || !t._gesenkt || t.preis > m.angebotPreis + 0.004) continue; // nur bis 3,99 €
    gemeldet.add(t.id);
    neuerEintrag(t, { grund: 'Film im Angebot', wert: breitIds.has(t.id) ? 49 : 50, sofort: false, gruppe: 'angebot', zusatz: t.chart ? [`Platz ${t.chart} der Charts`] : [] });
  }
  // neu (15.11.2026): Knüller unter den Boxen und den anderen Serien – nur in die Tageszusammenfassung (nie sofort)
  for (const t of [...gruppen.boxen, ...gruppen.serien.filter(x => x.wunsch === false)]) {
    if (t.quelle !== 'Apple' || !mitPreis(t) || gemeldet.has(t.id) || !t.knueller || !t._gesenkt) continue;
    gemeldet.add(t.id);
    neuerEintrag(t, { grund: t.typ === 'box' ? 'Film-Box: Preisknüller' : 'Staffel: Preisknüller', wert: 58, sofort: false, gruppe: t.typ === 'box' ? 'boxen' : 'serien', zusatz: [t.knueller.grund] });
  }
  // Apple-TV-Angebotsraum: Film von deiner Liste steht drin (Wunsch = sofort; 80er/Disney sofort bei ≤ 3,99 €)
  const schonTitel = new Set(eintraege.map(e => normTitel(String(e.extra?.filmTitel || e.titel).replace(/\s+für\s+[\d.,]+\s*€.*$/, '').replace(/\s*\(\d{4}\)$/, ''))));
  for (const t of raumTreffer) {
    const it = t.p.item, g = t.p.gruppe;
    if (schonTitel.has(normTitel(it.titel))) continue;
    const wunsch = g === 'wunsch';
    const billig = t.preis != null && t.preis <= m.angebotPreis;
    const p = preisAngaben({ preis: t.preis });
    eintraege.push(eintrag({
      id: `film-raum-${schluessel(t.f.umc, String(t.preis))}`, kategorie: 'filme',
      titel: `${it.titel}${it.jahr ? ` (${it.jahr})` : ''}${t.preis != null ? ` für ${euro(t.preis)}` : ' im Angebot'}`,
      link: t.f.link, quelle: 'Apple TV', datum: jetzt, jetzt, art: 'deal', preise: p,
      zeile: [`im Apple-TV-Raum „${t.raum}“`, wunsch ? 'auf deiner Wunschliste' : g === 'disney' ? 'Disney' : '80er/Kult'].join(' · '),
      soGehts: SO_FILM, wert: wunsch ? 92 : billig ? 80 : 65, sofort: wunsch || billig, grund: wunsch ? 'Wunschfilm im Apple-TV-Angebot' : 'Film von deiner Liste im Apple-TV-Angebot',
      extra: { filmId: `appletv:${t.f.umc}`, typ: 'film', jahr: it.jahr ?? null, gruppe: 'angebot', liste: g, raum: t.raum, raumUrl: t.raumUrl, filmTitel: it.titel },
    }));
  }
  const wunschNamen = posten.filter(x => x.gruppe === 'wunsch').flatMap(p => namen(p.item).filter(x => x.faktor === 1).map(x => normTitel(x.n)));
  for (const it of deals) {
    const n = ` ${normTitel(`${it.titel} ${it.beschreibung || ''}`)} `;
    const wunsch = wunschNamen.some(w => n.includes(` ${w} `));
    const jeFilm = preisJeFilm(it.titel, preisWert(it.preisText));
    if (jeFilm != null && jeFilm > m.angebotPreis + 0.004 && !wunsch) continue; // nur bis 3,99 € je Film (Xander 16.11.2026)
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
  for (const [k, b] of Object.entries(zf.boxen)) if (!b?.tag || b.tag < grenze) delete zf.boxen[k];
  for (const [k, t] of Object.entries(zf.staffelPool)) if (typeof t !== 'string' || t < grenze) delete zf.staffelPool[k];

  const offen = posten.filter(p => { const s = zf.ids[p.key]; return !s || s.weiter != null; }).length;
  status['apple-suche'].offen = offen;
  status['apple-suche'].nichtGefunden = posten.filter(p => zf.ids[p.key]?.fehlt).map(p => p.item.titel).slice(0, 50);
  status['apple-preise'].abrufe = appleAbrufe;

  const sauber = t => Object.fromEntries(Object.entries(t).filter(([k, v]) => !k.startsWith('_') && v !== undefined));
  const datei = {
    version: 1,
    aktualisiert: new Date(jetzt).toISOString(),
    gruppen: Object.fromEntries(GRUPPEN_REIHE.filter(k => gruppen[k]).map(k => [k, gruppen[k].map(sauber)])),
    kurz,
    ...(countdown.length ? { countdown } : {}), // Dezember: Apples Tagesangebot (Countdown/Adventskalender), für den Tages-Push
    status,
    hinweis: "Tiefstpreis = niedrigster Preis seit Beobachtungsbeginn (Datum in 'seit'), kein Allzeit-Tiefst (tiefstQuelle 'eigen'; extern nur mit Quelle).",
  };
  return { eintraege: eintraege.slice(0, m.maxEintraege), fehler, datei, kurz };
}
