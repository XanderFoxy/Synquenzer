// Modul "filme": Filme & Serien bei Apple TV (iTunes Store Deutschland) für Xander.
// Gruppen: Wunschfilme (immer alle), Angebote (≤ 3,99 €), neue Filme aus den Charts (Komödie, Action, Thriller, Sci-Fi),
// 80er-/Kult-Klassiker, Staffeln (Rick and Morty, Star Trek) und Disney – mit eigener Preis-Historie (Tiefstpreis).
// Listen: vorteile/filme.json (frei änderbar). Ergebnis: Einträge nur für echte Treffer + eigene Datei filme.json
// (Rückgabefeld „datei“; main.mjs schreibt sie nach <data>/filme.json). Horror kommt nie auf die Seite (außer Wunschliste).
// Quellen, alle über holeText (Roh-Mitschnitt): iTunes Search API, iTunes Lookup, Legacy-Charts (RSS als JSON), mydealz-Suche.
// Höflich: höchstens maxAppleAbrufe pro Lauf, höchstens maxSuchen neue Suchen, Zeitbudget; Pause pro Host in lib/http.mjs.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePrice, euro, round, schluessel } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { preisAngaben, threadId } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, mydealzSuche } from './gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const LISTEN_PFAD = join(HIER, '..', '..', 'filme.json');
const APPLE = 'https://itunes.apple.com';

export const STANDARD = {
  maxAppleAbrufe: 45, // alle Apple-Abrufe eines Laufs (Suche + Lookup + Charts)
  maxSuchen: 25, // neue Suchen pro Lauf (Titel -> Apple-Nummer wird danach im Zustand gemerkt)
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

export const sucheUrl = (term, staffel = false, limit = STANDARD.sucheLimit) =>
  `${APPLE}/search?term=${encodeURIComponent(term)}&country=de&media=${staffel ? 'tvShow' : 'movie'}&entity=${staffel ? 'tvSeason' : 'movie'}&limit=${staffel ? 50 : limit}`;
export const lookupUrl = ids => `${APPLE}/lookup?id=${ids.map(i => String(i).replace(/^itunes:/, '')).join(',')}&country=de`;
export const chartUrl = genre => `${APPLE}/de/rss/topmovies/limit=100/genre=${genre}/json`;

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
export function titelTokens(s) {
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

/** Alle Namen eines Listen-Eintrags: Titel, „auch“ und der Haupttitel vor dem ersten Untertitel (schwächer). */
function namen(item) {
  const liste = [item.titel, ...(Array.isArray(item.auch) ? item.auch : [])].filter(x => typeof x === 'string' && x.trim());
  const out = liste.map(n => ({ n, faktor: 1 }));
  const haupt = titelTokens(item.titel);
  const k = haupt.indexOf('|');
  if (k > 0) {
    const kurz = haupt.slice(0, k);
    if (kurz.join('').length >= 4) out.push({ n: kurz.join(' '), faktor: 0.8 });
  }
  return out;
}

/** Bester Film-Treffer aus Such-/Lookup-Ergebnissen für einen Listen-Eintrag – oder null (kein Zufallstreffer). */
export function waehleTreffer(ergebnisse, item) {
  let best = null;
  for (const r of ergebnisse) {
    const d = ausItunes(r);
    if (!d || d.typ !== 'film') continue;
    let w = 0;
    for (const { n, faktor } of namen(item)) {
      const nw = namensWert(d.titel, n);
      // der kurze Haupttitel („Ghostbusters“ für „Ghostbusters – Die Geisterjäger“) zählt nur, wenn er genau so heißt
      if (faktor < 1 && nw < 85) continue;
      w = Math.max(w, nw * faktor);
    }
    if (!w) continue;
    if (item.jahr) {
      if (d.jahr == null) continue;
      const dj = Math.abs(d.jahr - item.jahr);
      if (dj > 1) continue;
      w += dj === 0 ? 20 : 10;
    }
    if (d.preisSd != null || d.preisHd != null) w += 3;
    if (!best || w > best.w) best = { w, d };
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
const bildUrl = u => (typeof u === 'string' && /^https:\/\//.test(u) ? u.replace(/\/\d+x\d+(bb|-\d+)?\.(jpg|png|webp)$/i, '/200x200bb.jpg') : null);
const appleLink = u => (typeof u === 'string' && /^https:\/\//.test(u) ? u.replace(/[?&]uo=\d+/, '').replace(/\?$/, '') : null);
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

/** Suchbegriffe eines Eintrags: suche, Titel, „auch“ – ohne Doppelte, höchstens 3. */
export function suchbegriffe(item) {
  const gesehen = new Set(), out = [];
  for (const t of [item.suche, item.titel, ...liste(item.auch)]) {
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
    'apple-suche': { ok: true, anzahl: 0, fehler: [], offen: 0, nichtGefunden: [] },
    mydealz: { ok: true, anzahl: 0, fehler: [] },
  };
  const melde = (quelle, text) => { status[quelle].ok = false; status[quelle].fehler.push(text); fehler.push(text); };

  // Apple-Abrufe zählen (höflich: höchstens maxAppleAbrufe pro Lauf)
  let appleAbrufe = 0;
  const apple = async url => {
    if (appleAbrufe >= m.maxAppleAbrufe) throw new Error('Abruf-Grenze für diesen Lauf erreicht');
    appleAbrufe++;
    return holeText(url);
  };

  const chartCfg = listen.charts || {};
  const chartsNeu = liste(chartCfg.neu).length ? liste(chartCfg.neu) : [{ id: 4404, name: 'Komödie' }, { id: 4401, name: 'Action & Abenteuer' }, { id: 4416, name: 'Thriller' }, { id: 4413, name: 'Sci-Fi & Fantasy' }];
  const chartsAngebot = chartCfg.angebot ? liste(chartCfg.angebot) : [{ id: 4403, name: 'Klassiker' }, { id: 4410, name: 'Kinder & Familie' }];
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
  const neuGrenze = new Date(new Date(jetzt).getTime() - neuMonate * 30.44 * 864e5);
  for (const g of [...chartsNeu.map(x => ({ ...x, neu: true })), ...chartsAngebot.map(x => ({ ...x, neu: false }))]) {
    let eintraege;
    try {
      eintraege = leseCharts(await apple(chartUrl(g.id)));
      status['apple-charts'].anzahl += eintraege.length;
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
  // Details (Kauf-/Leihpreis, Genre) für Chart-Titel, die noch nicht bekannt sind: ein Abruf
  const chartIds = [...chartTreffer.entries()].filter(([id, c]) => c.d && !daten.has(id)).sort((a, b) => a[1].pos - b[1].pos).map(([id]) => id).slice(0, m.lookupMax);
  if (chartIds.length) await lookup(chartIds, 'apple-charts');

  // 3) Suchen: neue Titel -> Apple-Nummer (gemerkt), nicht gefundene frühestens nach wiederholenTage, Serien alle serienNeuTage
  let suchen = 0;
  const faellig = p => {
    const s = zf.ids[p.key];
    if (!s) return 1;
    if (s.weiter != null) return 1;
    if (s.fehlt) return tageZwischen(s.fehlt, tag) >= m.wiederholenTage ? 2 : 0;
    if (p.serie && (!s.tag || tageZwischen(s.tag, tag) >= m.serienNeuTage)) return 3;
    return 0;
  };
  const warteschlange = posten.map(p => ({ p, f: faellig(p) })).filter(x => x.f).sort((a, b) => a.f - b.f).map(x => x.p);
  const erledigt = new Set();
  const budgetWeg = () => suchen >= m.maxSuchen || zeitUm() || appleAbrufe >= m.maxAppleAbrufe;
  let fehlerInFolge = 0;
  for (const p of warteschlange) {
    if (budgetWeg() || fehlerInFolge >= 2) break; // Rest im nächsten Lauf (Apple nicht weiter belasten)
    if (erledigt.has(p.key)) continue; // gleicher Film in zwei Listen
    erledigt.add(p.key);
    const terme = suchbegriffe(p.item);
    const vorher = zf.ids[p.key] || {};
    let gefunden = false, abbruch = false;
    for (let i = vorher.weiter ?? 0; i < terme.length; i++) {
      if (budgetWeg()) { zf.ids[p.key] = { ...vorher, weiter: i }; abbruch = true; break; }
      suchen++;
      let res;
      try { res = leseErgebnisse(await apple(sucheUrl(terme[i], p.serie, m.sucheLimit))); fehlerInFolge = 0; }
      catch (e) { melde('apple-suche', `Suche „${terme[i]}“: ${e.message}`); fehlerInFolge++; abbruch = true; break; } // Zustand bleibt -> nächster Lauf
      status['apple-suche'].anzahl++;
      if (p.serie) {
        const st = staffelnAus(res, p.item);
        if (st.length) {
          for (const d of st) daten.set(d.id, { ...daten.get(d.id), ...d });
          zf.ids[p.key] = { ids: [...new Set([...liste(vorher.ids), ...st.map(d => d.id)])].slice(0, m.maxStaffelnJeSerie * 2), tag };
          gefunden = true; break;
        }
      } else {
        const d = waehleTreffer(res, p.item);
        if (d) { daten.set(d.id, { ...daten.get(d.id), ...d }); zf.ids[p.key] = { id: d.id, tag }; gefunden = true; break; }
      }
    }
    if (abbruch || gefunden) continue;
    if (p.serie && liste(vorher.ids).length) zf.ids[p.key] = { ids: vorher.ids, tag }; // keine neuen Staffeln: alte behalten
    else zf.ids[p.key] = { fehlt: tag, n: (vorher.n || 0) + 1 };
  }
  // Staffel-Daten aus dem Lookup gehören zu ihrer Serie
  for (const p of posten.filter(x => x.serie)) {
    for (const id of liste(zf.ids[p.key]?.ids)) {
      const d = daten.get(id);
      if (d && !d.serie) { const info = staffelInfo(d.titel); if (info) daten.set(id, { ...d, serie: p.item.titel, nr: info.nr, zusatz: info.zusatz }); }
    }
  }

  // 4) mydealz: Apple-Film-Aktionen
  const deals = [];
  const feeds = liste(listen.mydealz).filter(q => typeof q === 'string' && q.trim()).map(q => ({ name: `mydealz „${q}“`, url: mydealzSuche(q), maxAlterTage: 7 }));
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
      t._ziel = ziel;
      wunschIds.add(t.id);
      gruppen.wunsch.push(t);
    } else {
      gruppen.wunsch.push({
        id: `wunsch:${slug(p.item.titel)}`, typ: 'film', titel: p.item.titel, jahr: p.item.jahr ?? null, ...NULL_TITEL, quelle: 'Apple',
        unterZiel: false, ...(s?.fehlt ? { fehlt: true } : {}),
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
      id: `mydealz:${threadId(it.link) || schluessel(it.link)}`, typ: /staffel|season|serie/i.test(it.titel) ? 'staffel' : 'film', titel: it.titel, jahr: null,
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
