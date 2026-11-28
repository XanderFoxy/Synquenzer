// Modul "musikstore" (Xander 28.11.2026): „Musik: Alben/Songs im Angebot (günstigste Preisstufe), nur bekannte Künstler/Alben;
// Schwerpunkt Heavy Metal, Synthpop, Depeche Mode, OMD u. ä.“ – iTunes Store Deutschland.
// Liste: vorteile/musik.json (Künstler mit Genre-Spalte, Grenzen). Quellen (über holeText = Regel-Wache + Roh-Mitschnitt):
//  - iTunes Search API, nur um die Apple-Nummer eines Künstlers zu finden (entity=musicArtist; einmal, dann im Zustand gemerkt;
//    höchstens maxSuchen je Lauf – /search ist eine der Programm-Schnittstellen aus lib/schnittstellen.mjs),
//  - Ausweichweg, wenn die Suche den Künstler nicht findet: Wikidata (Eigenschaft P2850 „Apple Music artist ID“ – dieselbe
//    Künstlernummer wie im iTunes Store; eine Abfrage je Lauf, Format im Roh-Lauf prüfen),
//  - iTunes Lookup (deutscher Store): Alben (entity=album) und die bekanntesten Songs (entity=song) je Künstler, mit Preis.
//    Apple liefert sie in seiner Reihenfolge (die bekanntesten zuerst) – „bekannt“ = vorne in dieser Liste (rangMax).
// Je Lauf höchstens maxKuenstler Künstler (reihum, am längsten nicht geprüfte zuerst); die übrigen bleiben mit ihrem letzten Stand
// (höchstens frischTage alt) in der Datei. Preis-Historie je Album/Song im Zustand (zustand.musikstore.p): „gesenkt“ und
// „Tiefst seit …“ nur aus eigener Beobachtung – nie ein erfundener Normalpreis.
// Ausgabe: <data>/musikstore.json (Seite: Reiter „Filme“ → „Musik“). Keine Pushes.
import { round } from '../lib/text.mjs';
import { wikidataUrl } from './filme.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { istRegelSperre } from '../lib/robots.mjs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
export const MUSIK_PFAD = join(HIER, '..', '..', 'musik.json');
const APPLE = 'https://itunes.apple.com';
export const MUSIK = {
  albumMax: 4.99, // günstigste übliche Album-Stufe im deutschen Store (darüber nur, wenn deutlich gesenkt)
  songMax: 0.69, // günstigste Song-Stufe
  gesenktPct: 20, // so viel % unter dem zuletzt gesehenen Preis = „gesenkt“ (auch über albumMax, bis gesenktMax)
  gesenktMax: 7.99,
  maxKuenstler: 6, // Künstler je Lauf (je 2 Lookups)
  maxSuchen: 4, // Künstler-Suchen je Lauf
  suchePauseTage: 14, // nicht gefunden -> so lange nicht neu suchen
  albumLimit: 100, // Alben je Künstler (Lookup)
  songLimit: 25, // bekannteste Songs je Künstler
  rangMax: 25, // nur die ersten so vielen Alben eines Künstlers (Apples Reihenfolge) gelten als bekannt
  minTitel: 6, // Album: mindestens so viele Titel (Singles/EPs fallen weg)
  frischTage: 3, // Stand eines Künstlers höchstens so alt
  vergessenTage: 120,
  bisSek: 120,
  wikidata: true, // Ausweichweg für die Künstlernummer (aus = false)
  wikidataMax: 20, // Künstler je Wikidata-Abfrage
};
/** Wikidata: Künstlernummer (P2850) zu Namen (Bezeichnung oder Alias, englisch/deutsch) */
export function kuenstlerAbfrage(namen) {
  const werte = [...new Set(namen.filter(n => typeof n === 'string' && n.trim()).map(n => n.trim().replace(/["\\]/g, '')))]
    .flatMap(n => [`"${n}"@en`, `"${n}"@de`]).join(' ');
  return `SELECT ?name ?id WHERE { VALUES ?name { ${werte} } ?item rdfs:label|skos:altLabel ?name ; wdt:P2850 ?id . }`;
}
/** Antwort der Wikidata-Abfrage -> Map(nameNorm -> Nummer); mehrdeutige Namen (zwei Nummern) fallen weg */
export function leseKuenstlerWikidata(text) {
  let j;
  try { j = JSON.parse(String(text ?? '')); } catch { throw new Error('Wikidata-Antwort ist kein JSON'); }
  const out = new Map(), doppelt = new Set();
  for (const b of liste(j?.results?.bindings)) {
    const n = nameNorm(b?.name?.value), id = Number(String(b?.id?.value ?? '').trim());
    if (!n || !Number.isInteger(id) || id <= 0) continue;
    if (out.has(n) && out.get(n) !== id) doppelt.add(n); else out.set(n, id);
  }
  for (const n of doppelt) out.delete(n);
  return out;
}
export const suchUrl = name => `${APPLE}/search?term=${encodeURIComponent(name)}&country=de&media=music&entity=musicArtist&attribute=artistTerm&limit=10`;
export const albenUrl = (id, limit = MUSIK.albumLimit) => `${APPLE}/lookup?id=${id}&entity=album&limit=${limit}&country=de`;
export const songsUrl = (id, limit = MUSIK.songLimit) => `${APPLE}/lookup?id=${id}&entity=song&limit=${limit}&country=de`;

const tagNrVon = tag => Math.round(Date.parse(`${tag}T00:00:00Z`) / 864e5);
const tagVonNr = n => new Date(n * 864e5).toISOString().slice(0, 10);
const ct = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 0);
const eur = c => (c > 0 ? round(c / 100, 2) : null);
const liste = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
/** Name vergleichbar: klein, ohne Akzente/Umlaut-Punkte, „&“ = „and“, ohne Satzzeichen, ohne „the“ am Anfang */
export const nameNorm = s => String(s ?? '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^the /, '');
const bild = u => (typeof u === 'string' && /^https:\/\//.test(u) ? u.replace(/\/\d+x\d+(?:bb)?(?:-\d+)?\.(jpg|png|webp)$/i, '/200x200bb.$1') : null);
const link = u => { if (typeof u !== 'string' || !/^https:\/\//.test(u)) return null; try { const x = new URL(u); x.searchParams.delete('uo'); return x.toString(); } catch { return null; } };
const fremd = r => (r?.country != null && r.country !== 'DEU') || (r?.currency != null && r.currency !== 'EUR');
const jahr = d => { const m = /^(\d{4})/.exec(String(d ?? '')); return m ? Number(m[1]) : null; };

export async function ladeMusikListe(pfad = MUSIK_PFAD) { return JSON.parse(await readFile(pfad, 'utf8')); }

function lese(text) {
  let j;
  try { j = JSON.parse(String(text ?? '').trim()); } catch { throw new Error('keine gültige Apple-Antwort'); }
  if (!j || typeof j !== 'object') throw new Error('keine gültige Apple-Antwort');
  return j.results == null ? [] : Array.isArray(j.results) ? j.results : [j.results];
}

/** Künstler aus der Suche: genau dieser Name (oder ein „auch“-Name), sonst null – nie ein Zufallstreffer. */
export function waehleKuenstler(results, k) {
  const namen = new Set([k.name, ...liste(k.auch)].filter(x => typeof x === 'string').map(nameNorm).filter(Boolean));
  const r = liste(results).find(x => x && x.wrapperType === 'artist' && x.artistId && namen.has(nameNorm(x.artistName)));
  return r ? { id: Number(r.artistId), name: String(r.artistName) } : null;
}

const SINGLE = /\s-\s(?:single|ep)\s*$|\((?:single|ep)\)\s*$/i;
const KEIN_ALBUM = /karaoke|tribute to|in the style of|made famous|originally performed|instrumental versions? of|cover versions?/i;
/** Alben eines Künstlers aus dem Lookup -> [{ id, titel, kuenstler, jahr, preis(ct), titelZahl, bild, link, rang }] */
export function albenAus(results, k, m = MUSIK) {
  const name = nameNorm(k.name), auch = new Set(liste(k.auch).map(nameNorm));
  const out = [];
  for (const r of liste(results)) {
    if (!r || r.wrapperType !== 'collection' || !r.collectionId || !r.collectionName || fremd(r)) continue;
    if (r.collectionType && !/album/i.test(String(r.collectionType))) continue;
    const a = nameNorm(r.artistName);
    if (k.id && r.artistId && Number(r.artistId) !== Number(k.id) && a !== name && !auch.has(a)) continue; // Gastauftritt/Sampler
    if (SINGLE.test(r.collectionName) || KEIN_ALBUM.test(r.collectionName)) continue;
    if (!(Number(r.trackCount) >= m.minTitel)) continue;
    out.push({ id: `itunes:${r.collectionId}`, titel: String(r.collectionName).trim(), kuenstler: String(r.artistName || k.name).trim(), jahr: jahr(r.releaseDate),
      preis: ct(r.collectionPrice), titelZahl: Number(r.trackCount), bild: bild(r.artworkUrl100 || r.artworkUrl60), link: link(r.collectionViewUrl), rang: out.length + 1 });
  }
  return out;
}

/** Songs (die bekanntesten zuerst) -> [{ id, titel, kuenstler, album, preis(ct), bild, link, rang }] */
export function songsAus(results, k) {
  const name = nameNorm(k.name);
  const out = [];
  for (const r of liste(results)) {
    if (!r || r.wrapperType !== 'track' || r.kind !== 'song' || !r.trackId || !r.trackName || fremd(r)) continue;
    if (k.id && r.artistId && Number(r.artistId) !== Number(k.id) && nameNorm(r.artistName) !== name) continue;
    out.push({ id: `itunes:${r.trackId}`, titel: String(r.trackName).trim(), kuenstler: String(r.artistName || k.name).trim(), album: r.collectionName ? String(r.collectionName).trim() : null,
      jahr: jahr(r.releaseDate), preis: ct(r.trackPrice), bild: bild(r.artworkUrl100 || r.artworkUrl60), link: link(r.trackViewUrl), rang: out.length + 1 });
  }
  return out;
}

/** Preis in die eigene Historie (p = Preis, ps = seit, tp/tt = Tiefst, h = höchster, v = vorheriger anderer, k = geprüft). */
export function merkeMusikPreis(zp, id, c, tagNr) {
  const o = (zp[id] ||= {});
  if (c > 0) {
    if (o.p !== c) { if (o.p > 0) o.v = o.p; o.p = c; o.ps = tagNr; }
    if (!(o.tp > 0) || c < o.tp) { o.tp = c; o.tt = tagNr; }
    o.h = Math.max(o.h || 0, c);
  }
  o.k = tagNr;
  return o;
}

export default async function musikstore(ctx) {
  const { holeText, cfg, zustand, jetzt = new Date() } = ctx;
  const m = { ...MUSIK, ...(cfg?.module?.musikstore || {}) };
  let ml = ctx.musikListe;
  if (!ml) { try { ml = await ladeMusikListe(); } catch (e) { return { eintraege: [], fehler: [`musik.json nicht lesbar: ${e.message}`] }; } }
  for (const k of ['albumMax', 'songMax', 'gesenktPct', 'gesenktMax', 'rangMax']) if (typeof ml[k] === 'number' && ml[k] > 0) m[k] = ml[k];
  const kuenstler = liste(ml.kuenstler).filter(k => k && typeof k.name === 'string' && k.name.trim());
  const start = Date.now();
  const zeitUm = () => Date.now() - start > m.bisSek * 1000;
  const tag = berlinTag(new Date(jetzt).toISOString()), tagNr = tagNrVon(tag);
  const zm = (zustand.musikstore ||= {});
  zm.k ||= {}; zm.p ||= {}; zm.r ||= {};
  const st = { ok: true, anzahl: 0, fehler: [], suchen: 0, gefunden: 0, lookups: 0, kuenstlerGeprueft: [], nichtGefunden: [] };
  let fehlerInFolge = 0;
  const apple = async url => {
    if (fehlerInFolge >= 3) throw new Error('Apple antwortet gerade nicht – Rest im nächsten Lauf');
    // Regel-Sperre und „höchstens … je Lauf“ sind keine Störung von Apple (wie im Modul „filmkatalog“, Kurzprüfung 28.11.2026)
    try { const t = await holeText(url); fehlerInFolge = 0; return t; } catch (e) { if (!istRegelSperre(e) && !/je Lauf/.test(String(e?.message))) fehlerInFolge++; throw e; }
  };

  // 1) Apple-Nummern: aus musik.json („id“), sonst gemerkt, sonst Suche (höchstens maxSuchen je Lauf)
  for (const k of kuenstler) {
    const nr = Number(String(k.id ?? '').replace(/^itunes:/, ''));
    if (Number.isInteger(nr) && nr > 0) zm.k[k.name] = { id: nr, tag, manuell: 1 };
  }
  for (const k of kuenstler) {
    const z = zm.k[k.name];
    if (z?.id || (z?.fehlt && tagNr - tagNrVon(z.fehlt) < m.suchePauseTage)) continue;
    if (st.suchen >= m.maxSuchen || zeitUm() || fehlerInFolge >= 3) break;
    st.suchen++;
    try {
      const w = waehleKuenstler(lese(await apple(suchUrl(typeof k.suche === 'string' && k.suche.trim() ? k.suche.trim() : k.name))), k);
      zm.k[k.name] = w ? { id: w.id, tag, name: w.name } : { fehlt: tag };
      if (w) st.gefunden++;
    } catch (e) {
      // gemeinsame Obergrenze der Apple-Schnittstelle je Lauf erreicht: keine Störung, Rest im nächsten Lauf
      if (/je Lauf/.test(String(e?.message))) { st.sucheVertagt = true; break; }
      st.fehler.push(`Suche „${k.name}“: ${e.message}`);
    }
  }
  // Ausweichweg Wikidata (P2850) für Künstler, die die Suche nicht gefunden hat – eine Abfrage je Lauf, je Name höchstens alle
  // suchePauseTage (Antwort im Zustand: wd = Tag der Abfrage)
  const wdOffen = kuenstler.filter(k => zm.k[k.name]?.fehlt && !(zm.k[k.name].wd && tagNr - tagNrVon(zm.k[k.name].wd) < m.suchePauseTage)).slice(0, m.wikidataMax);
  if (m.wikidata !== false && wdOffen.length && !zeitUm()) {
    try {
      const namen = wdOffen.flatMap(k => [k.name, k.suche, ...liste(k.auch)]);
      const ids = leseKuenstlerWikidata(await holeText(wikidataUrl(kuenstlerAbfrage(namen)), { headers: { accept: 'application/sparql-results+json' } }));
      st.wikidata = 0;
      for (const k of wdOffen) {
        const id = [k.name, k.suche, ...liste(k.auch)].map(nameNorm).map(n => ids.get(n)).find(Boolean);
        zm.k[k.name] = id ? { id, tag, weg: 'wikidata' } : { ...zm.k[k.name], wd: tag };
        if (id) { st.gefunden++; st.wikidata++; }
      }
    } catch (e) { st.wikidataFehler = String(e.message || e).slice(0, 120); } // nur Ausweichweg: keine Störung des Bereichs
  }
  st.nichtGefunden = kuenstler.filter(k => zm.k[k.name]?.fehlt).map(k => k.name).slice(0, 30);

  // 2) Alben + Songs je Künstler, reihum (am längsten nicht geprüfte zuerst)
  const reihe = kuenstler.filter(k => zm.k[k.name]?.id).sort((a, b) => (zm.r[a.name] || 0) - (zm.r[b.name] || 0) || kuenstler.indexOf(a) - kuenstler.indexOf(b));
  const frisch = new Map(); // name -> { alben, songs }
  for (const k of reihe.slice(0, m.maxKuenstler)) {
    if (zeitUm() || fehlerInFolge >= 3) break;
    const id = zm.k[k.name].id, kk = { ...k, id };
    try {
      st.lookups++;
      const alben = albenAus(lese(await apple(albenUrl(id, m.albumLimit))), kk, m);
      st.lookups++;
      const songs = songsAus(lese(await apple(songsUrl(id, m.songLimit))), kk);
      frisch.set(k.name, { alben, songs });
      zm.r[k.name] = tagNr;
      st.kuenstlerGeprueft.push(k.name);
    } catch (e) { st.fehler.push(`${k.name}: ${e.message}`); }
  }

  // 3) Datei: frisch geprüfte Künstler neu bewerten, die übrigen mit ihrem letzten Stand (höchstens frischTage alt)
  const vorher = ctx.vorherDatei && typeof ctx.vorherDatei === 'object' ? ctx.vorherDatei : null;
  const genreVon = k => (typeof k.genre === 'string' && k.genre.trim() ? k.genre.trim() : 'Weitere');
  const bewerte = (x, art, k) => {
    const o = merkeMusikPreis(zm.p, x.id, x.preis, tagNr);
    const preis = eur(x.preis), max = art === 'album' ? m.albumMax : m.songMax;
    const gesenkt = o.v > 0 && x.preis > 0 && x.preis <= o.v * (1 - m.gesenktPct / 100) && tagNr - (o.ps || tagNr) < 14;
    const ok = preis != null && (preis <= max + 0.004 || (art === 'album' && gesenkt && preis <= m.gesenktMax + 0.004));
    if (!ok || (art === 'album' && x.rang > m.rangMax)) return null;
    return {
      id: x.id, typ: art, titel: x.titel, kuenstler: x.kuenstler, genre: genreVon(k), jahr: x.jahr ?? null, preis,
      ...(art === 'album' ? { titelZahl: x.titelZahl } : { album: x.album }),
      vorher: gesenkt ? eur(o.v) : null, gesenkt: !!gesenkt, tiefst: o.tp ? { p: eur(o.tp), tag: tagVonNr(o.tt) } : null,
      nieSoGuenstig: o.h > x.preis && x.preis <= o.tp, // war schon teurer und ist jetzt am eigenen Tiefst (nicht: Preis nie bewegt)
      seit: o.ps ? tagVonNr(o.ps) : null, bild: x.bild, link: x.link, rang: x.rang, geprueft: tag, quelle: 'Apple',
      kuenstlerListe: k.name, // Name aus musik.json (Apple schreibt „Orchestral Manoeuvres In the Dark“, die Liste „OMD“)
    };
  };
  const alben = [], songs = [];
  const vorherAlben = liste(vorher?.alben), vorherSongs = liste(vorher?.songs);
  const nochFrisch = x => x && typeof x.geprueft === 'string' && tagNr - tagNrVon(x.geprueft) <= m.frischTage;
  for (const k of kuenstler) {
    const f = frisch.get(k.name);
    if (f) {
      for (const x of f.alben) { const e = bewerte(x, 'album', k); if (e) alben.push(e); }
      for (const x of f.songs) { const e = bewerte(x, 'song', k); if (e) songs.push(e); }
    } else {
      const n = nameNorm(k.name);
      alben.push(...vorherAlben.filter(x => nameNorm(x?.kuenstlerListe ?? x?.kuenstler) === n && nochFrisch(x)));
      songs.push(...vorherSongs.filter(x => nameNorm(x?.kuenstlerListe ?? x?.kuenstler) === n && nochFrisch(x)));
    }
  }
  const sortiere = (a, b) => (b.gesenkt - a.gesenkt) || (a.preis - b.preis) || (a.rang - b.rang) || String(a.titel).localeCompare(String(b.titel), 'de');
  alben.sort(sortiere); songs.sort(sortiere);
  // Historie aufräumen: lange nicht geprüft
  for (const [id, o] of Object.entries(zm.p)) if (!o?.k || tagNr - o.k > m.vergessenTage) delete zm.p[id];
  for (const n of Object.keys(zm.r)) if (!kuenstler.some(k => k.name === n)) { delete zm.r[n]; delete zm.k[n]; }

  const genres = [...new Set(kuenstler.map(genreVon))];
  const kListe = kuenstler.map(k => ({ name: k.name, genre: genreVon(k), gefunden: !!zm.k[k.name]?.id, stand: zm.r[k.name] ? tagVonNr(zm.r[k.name]) : null }));
  st.anzahl = alben.length + songs.length;
  st.ok = !st.fehler.length;
  const nichts = !frisch.size && st.fehler.length;
  if (nichts && vorher) return { eintraege: [], fehler: st.fehler, datei: { ...vorher, status: { musik: st }, gestoert: true }, letzterStand: true, zahl: { n: liste(vorher.alben).length, wort: 'Alben im Angebot' } };
  const datei = {
    version: 1, aktualisiert: new Date(jetzt).toISOString(),
    grenzen: { album: m.albumMax, song: m.songMax, gesenktPct: m.gesenktPct },
    genres, alben: alben.slice(0, 400), songs: songs.slice(0, 400), kuenstler: kListe,
    zahlen: { kuenstler: kuenstler.length, gefunden: kListe.filter(k => k.gefunden).length, alben: alben.length, songs: songs.length },
    status: { musik: st },
    hinweis: 'iTunes Store Deutschland über die Lookup-Schnittstelle, je Künstler die Alben und die bekanntesten Songs in Apples Reihenfolge. „gesenkt“ und „Tiefst“ = eigene Beobachtung seit Beginn der Liste.',
  };
  return { eintraege: [], fehler: st.fehler, datei, zahl: { n: alben.length, wort: 'Alben im Angebot' } };
}
