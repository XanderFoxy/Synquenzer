// Modul "events": Ausflüge & Aktionen (Xander 16.11.2026) – Feste/Märkte/Museumsnächte im Umkreis, Gratis-Tage,
// Mitmachen mit Belohnung, Produkttests (Schwerpunkt Musiktechnik). Zwei Quellen:
//  1. vorteile/ausfluege.json: recherchierte Liste mit Quelle + Prüfdatum (feste Termine, Muster „jedes Jahr …“, dauerhaft)
//  2. Google News (wie erleben/tests): frische Meldungen je Art, nur mit Ort im Umkreis (Fest/Gratis/Mitmachen) bzw. mit
//     Test-Wort + Technik-Thema (Testen), unseriöse Zeichen (Gebühr, Abo, Vorkasse) -> „Vorsicht“.
// Ergebnis: eigene Datei <data>/events.json für den Reiter „Ausflüge“ der Seite; Einträge (aktuell.json) nur für Push:
// Gratis-Tag morgen in der Nähe, neuer seriöser Produkttest Musiktechnik. Vergangenes fliegt raus, Doppel auch.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, enthaelt, zaehle, schluessel } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { ortAus, ortNach, istOnline } from '../lib/orte.mjs';
import { sammleFeeds, eintrag, googleNews } from './gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const ARTEN = ['fest', 'gratis', 'mitmachen', 'testen'];
export const ART_NAME = { fest: 'Fest', gratis: 'Gratis', mitmachen: 'Mitmachen', testen: 'Testen' };

// ---------------------------------------------------------------- Datum (reine Kalendertage „YYYY-MM-DD“, UTC-Rechnung)
const iso = (j, m, t) => `${j}-${String(m).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
export const plusTage = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const wochentag = d => new Date(d + 'T12:00:00Z').getUTCDay() || 7; // 1 = Mo … 7 = So
export const tageZwischen = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const istIso = v => typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) && Number.isFinite(Date.parse(v + 'T00:00:00Z'));

/** Ostersonntag (Gauß/Meeus, gregorianisch) */
export function ostern(j) {
  const a = j % 19, b = Math.floor(j / 100), c = j % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31), tag = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(j, monat, tag);
}

/** Termin eines Musters in einem Jahr -> { ab, bis } | null.
 *  wochentag: n-ter Wochentag wt (1 = Mo … 7 = So) im Monat (n = -1: letzter) · sonntagBis: letzter Sonntag am/vor Tag ·
 *  ostern: Ostersonntag + plus Tage · advent: n-ter Adventssonntag, tage = Länge bis einschließlich Sonntag (2 = Sa+So) ·
 *  datum: fester Tag (monat, tag) · dauer: Anzahl Tage (Standard 1). */
export function terminImJahr(m, j) {
  if (!m || typeof m !== 'object') return null;
  const dauer = Number.isInteger(m.dauer) && m.dauer > 0 ? m.dauer : 1;
  const mit = ab => ({ ab, bis: plusTage(ab, dauer - 1) });
  if (m.typ === 'wochentag') {
    if (m.n === -1) { let d = plusTage(m.monat === 12 ? iso(j + 1, 1, 1) : iso(j, m.monat + 1, 1), -1); while (wochentag(d) !== m.wt) d = plusTage(d, -1); return mit(d); }
    let d = iso(j, m.monat, 1);
    while (wochentag(d) !== m.wt) d = plusTage(d, 1);
    return mit(plusTage(d, 7 * (m.n - 1)));
  }
  if (m.typ === 'sonntagBis') { let d = iso(j, m.monat, m.tag); while (wochentag(d) !== 7) d = plusTage(d, -1); return mit(d); }
  if (m.typ === 'ostern') return mit(plusTage(ostern(j), m.plus || 0));
  if (m.typ === 'advent') {
    let s4 = iso(j, 12, 24); while (wochentag(s4) !== 7) s4 = plusTage(s4, -1); // 4. Advent = letzter Sonntag vor/an 24.12.
    const so = plusTage(s4, -7 * (4 - (m.n || 1)));
    const tage = Number.isInteger(m.tage) && m.tage > 0 ? m.tage : 1;
    return { ab: plusTage(so, -(tage - 1)), bis: so };
  }
  if (m.typ === 'datum') return mit(iso(j, m.monat, m.tag));
  return null;
}

/** Nächster Termin eines Eintrags ab heute (läuft er gerade, zählt er) -> { ab, bis } | null */
export function naechsterTermin(e, heute) {
  const feste = (Array.isArray(e.termine) ? e.termine : []).filter(t => istIso(t?.ab)).map(t => ({ ab: t.ab, bis: istIso(t.bis) ? t.bis : t.ab }));
  const kandidaten = feste.filter(t => t.bis >= heute).sort((a, b) => (a.ab < b.ab ? -1 : 1));
  if (kandidaten.length) return kandidaten[0];
  if (e.muster) {
    const j = Number(heute.slice(0, 4));
    for (const jahr of [j, j + 1, j + 2]) { const t = terminImJahr(e.muster, jahr); if (t && t.bis >= heute) return t; }
  }
  return null;
}

/** Fahrzeit grob: Luftlinie × 1,2 (Straße), Schnitt 75 km/h, auf 5 Minuten gerundet */
export const fahrMinuten = km => (km == null ? null : Math.max(5, Math.round((km * 1.2 / 75) * 60 / 5) * 5));

// ---------------------------------------------------------------- Seriosität (Produkttests, Mitmachen)
// Prüfer 16.11.: Kosten/Kontodaten fehlten; „seriös“ gab es schon für einen Markennamen im Text („Roland … bei Testerportal XY
// registrieren“) -> jetzt nur noch über die echte Adresse (Link oder bei Google News die Quelle aus <source url>), sonst
// „unbekannt“ (Seite: „Seriosität unbekannt – erst prüfen“). „keine Kosten“/„ohne Versandkosten“ zählt nicht als Kosten.
const UNSERIOES = ['vorkasse', 'gebühr|gebuehr', 'kreditkarte', 'kontodaten|bankdaten|bankverbindung|=iban', '=abo|abofalle|abo-falle|abonnement', 'bearbeitungsgebühr|bearbeitungsgebuehr', 'gewinnspiel-hotline|mehrwertnummer', 'schneeballsystem', 'kaution',
  'im monat|pro monat|monatlich', 'versandkosten', '=kosten|=kostet|=kostenpflichtig'];
const SERIOES_HOSTS = ['ableton.com', 'native-instruments.com', 'bitwig.com', 'arturia.com', 'korg.com', 'roland.com', 'moogmusic.com', 'elektron.se', 'novationmusic.com', 'teenage.engineering',
  'trnd.com', 'testbirds.com', 'testbirds.de', 'rewe.de', 'dm.de', 'test.de', 'stiftung-warentest.de', 'mpg.de', 'uni-leipzig.de', 'tu-dresden.de', 'tu-chemnitz.de', 'haema.de', 'drk.de', 'blutspende.de', 'blutspendedienst.com'];
const hostVon = u => { try { return new URL(String(u)).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };
export function seriositaet(text, link = '', quelleUrl = '') {
  const ohneVerneinung = String(text).replace(/\b(keine|ohne|null)\s+(versand)?kosten\b|\bkostenfrei\b/gi, ' ');
  if (enthaelt(ohneVerneinung, UNSERIOES)) return 'vorsicht';
  const echt = [hostVon(link), hostVon(quelleUrl)].filter(h => h && h !== 'news.google.com');
  return echt.some(h => SERIOES_HOSTS.some(x => h === x || h.endsWith('.' + x))) ? 'seriös' : 'unbekannt';
}

// ---------------------------------------------------------------- Liste lesen
export async function leseListe(pfad = join(HIER, '..', '..', 'ausfluege.json')) {
  return JSON.parse(await readFile(pfad, 'utf8'));
}

function ortInfo(name) {
  if (!name) return null;
  const o = ortNach(name);
  return o ? { ort: o.ort, km: o.km } : null;
}

/** Recherchierte Liste -> { termine, regelmaessig } (vergangene Termine weg, Muster mit nächstem Termin) */
export function ausListe(liste, heute) {
  const termine = [], regelmaessig = [];
  for (const e of Array.isArray(liste?.eintraege) ? liste.eintraege : []) {
    if (!e || !ARTEN.includes(e.art) || !e.titel || !e.quelle?.url || !istIso(e.geprueft)) continue;
    const o = ortInfo(e.ort);
    const basis = {
      id: e.id, art: e.art, titel: e.titel, ort: o ? e.ort : null, /* Schreibweise der Liste („Roßwein“, nicht „Rosswein“) */ region: e.region || null, km: o?.km ?? null, fahrMin: fahrMinuten(o?.km ?? null),
      vorteil: e.vorteil || '', wann: e.wann || '', quelle: { name: e.quelle.name || '', url: e.quelle.url }, stand: e.geprueft,
      sicherheit: e.sicherheit || 'belegt', ...(e.serioes ? { serioes: e.serioes } : {}), ...(e.musik ? { musik: true } : {}), ...(e.warnung ? { warnung: true } : {}),
      herkunft: 'liste',
    };
    const t = e.dauerhaft ? null : naechsterTermin(e, heute);
    if (e.muster || e.dauerhaft || (Array.isArray(e.termine) && e.termine.length)) regelmaessig.push({ ...basis, naechster: t, ...(e.dauerhaft ? { dauerhaft: true } : {}) });
    if (t) termine.push({ ...basis, ab: t.ab, bis: t.bis, ...(e.muster && !(e.termine || []).some(x => x.ab === t.ab) ? { ausMuster: true } : {}) });
  }
  return { termine, regelmaessig };
}

// ---------------------------------------------------------------- Meldungen (Google News)
const GRATIS = ['kostenlos', 'gratis', 'eintritt frei', 'freier eintritt', 'umsonst', 'ohne eintritt', 'kostenfrei'];
const BELOHNUNG = ['vergütung|verguetung', 'aufwandsentschädigung|aufwandsentschaedigung', 'gutschein', 'belohnung', 'prämie|praemie', 'honorar', 'euro', '€', 'dankeschön|dankeschoen', 'gewinnen'];
const TEST = ['produkttester', 'tester gesucht|testerin gesucht|testpersonen gesucht|testende gesucht', 'betatester|beta-tester|beta tester', 'beta-programm|betaprogramm|public beta', 'testen und behalten', 'kostenlos testen|gratis testen'];
const TECHNIK = ['synthesizer|synth', 'plugin|plug-in', 'daw', 'ableton|bitwig|native instruments|arturia|korg|roland|moog|behringer|elektron|novation', 'kopfhörer|kopfhoerer', 'lautsprecher', 'audio', 'midi', 'controller', 'technik', 'smartphone|tablet|laptop', 'musik'];
const MUSIK = ['synthesizer|synth', 'plugin|plug-in', 'daw', 'ableton|bitwig|native instruments|arturia|korg|roland|moog|behringer|elektron|novation', 'midi', 'musiksoftware|musik-software|audio-software'];
// Polizei-/Unglücks-/Impf-Meldungen sind keine Ausflüge (echter Roh-Lauf 43820200074: „Massenschlägerei auf Dorffest“,
// „Lange Nacht des Impfens“); config.module.events.ausschluss ergänzt die Liste
export const AUSSCHLUSS = ['schlägerei|schlaegerei|prügelei|pruegelei', 'polizei', 'ermittlung|ermittelt', 'unfall|verletzt|=tot|=tote|=toter|tödlich|toedlich', '=brand|großbrand|grossbrand|brandstiftung|feuerwehreinsatz', 'festgenommen|festnahme|haftbefehl', '=gericht|amtsgericht|landgericht|=prozess|angeklagt', 'messerangriff|=angriff|überfall|ueberfall', 'diebstahl', 'abgesagt|fällt aus|faellt aus', 'impfen|impfung|impfschutz', '=jva|gefängnis|gefaengnis', 'insolvenz', '=streik']; // „=“ = ganzes Wort (Brandenburg, Prozession, Gerichte bleiben)
// Prüfer 16.11.: „markt“/„fest“ als Wortteil trafen „Arbeitsmarkt“, „Supermarkt“, „Haushalt festgelegt“ -> ganze Wörter oder
// zusammengesetzte Fest-/Markt-Wörter
const FEST = ['stadtfest|dorffest|volksfest|strassenfest|straßenfest|vereinsfest|sommerfest|herbstfest|fruehlingsfest|frühlingsfest|weinfest|bierfest|oktoberfest|schuetzenfest|schützenfest|feuerwehrfest|kinderfest|heimatfest|hoffest|burgfest|schlossfest|parkfest|muehlenfest|mühlenfest|erntefest|lichterfest|brunnenfest|musikfest|sportfest|festumzug|festwoche|festmeile|=fest|=feste|=festes',
  'weihnachtsmarkt|christmarkt|adventsmarkt|flohmarkt|troedelmarkt|trödelmarkt|bauernmarkt|toepfermarkt|töpfermarkt|mittelaltermarkt|handwerkermarkt|kunsthandwerkermarkt|ostermarkt|herbstmarkt|fruehlingsmarkt|frühlingsmarkt|martinimarkt|kreativmarkt|regionalmarkt|=markt|=markttag',
  '=messe|fachmesse|verbrauchermesse|freizeitmesse|hochzeitsmesse|jobmesse|ausbildungsmesse|modellbahnmesse', 'tag der offenen tür|tag der offenen tuer', 'museumsnacht|lange nacht', 'festival', '=parade|bergparade', 'kirmes|rummel', 'feuerwerk'];

/** Eine Meldung -> Termin | null. m = config.module.events, art aus dem Feed */
export function bewerteMeldung(it, art, m, heute) {
  const text = `${it.titel} ${it.beschreibung || ''}`;
  if (enthaelt(text, [...AUSSCHLUSS, ...(m.ausschluss || [])])) return null;
  const maxKm = m.maxKm ?? 60;
  let o = null;
  if (art !== 'testen') {
    o = ortAus(text);
    if (!o || o.km > maxKm) return null;
  }
  if (art === 'fest' && !enthaelt(text, FEST)) return null;
  if (art === 'gratis' && !enthaelt(text, GRATIS)) return null;
  if (art === 'mitmachen' && !enthaelt(text, BELOHNUNG)) return null;
  let musik = false, serioes = null;
  if (art === 'testen') {
    if (!enthaelt(text, TEST) || !zaehle(text, TECHNIK)) return null;
    musik = enthaelt(text, MUSIK);
    serioes = seriositaet(text, it.link, it.herkunftUrl);
    o = ortAus(text);
    if (o && o.km > 300) o = null; // weit weg: nur „online/deutschlandweit“ zeigen
  } else if (art === 'mitmachen') serioes = seriositaet(text, it.link, it.herkunftUrl);
  const ab = it.ab ? berlinTag(it.ab) : null;
  const bis = it.bis ? berlinTag(it.bis) : ab;
  if (bis && bis < heute) return null;
  return {
    id: 'n-' + schluessel(art, it.titel.slice(0, 80)), art, titel: String(it.titel).replace(/\s+-\s+[^-]{2,40}$/, '').slice(0, 140),
    ort: o?.ort || null, region: o ? null : (istOnline(text) ? 'online' : 'deutschlandweit'), km: o?.km ?? null, fahrMin: fahrMinuten(o?.km ?? null),
    ab: ab || null, bis: bis || null, vorteil: art === 'gratis' ? 'gratis laut Meldung' : art === 'mitmachen' ? 'Belohnung laut Meldung' : art === 'testen' ? 'Testaufruf' : '',
    wann: ab ? '' : 'Datum in der Meldung', quelle: { name: it.herkunft || it.feed || 'Google News', url: it.link }, stand: heute,
    sicherheit: 'meldung', ...(serioes ? { serioes } : {}), ...(musik ? { musik: true } : {}), herkunft: 'radar', veroeffentlicht: it.datum || null,
  };
}

/** Doppel entfernen: gleiche id, gleicher Titelanfang, gleicher Ort + gleicher Tag + gleiche Art; Meldungen zu Listen-Einträgen weg */
export function ohneDoppel(liste, stichwoerter = []) {
  const raus = new Set(), aus = [];
  const kopf = t => norm(t).split(' ').slice(0, 6).join(' ');
  for (const e of liste) {
    if (e.herkunft === 'radar' && stichwoerter.some(s => norm(e.titel).includes(s))) continue;
    const k = [e.id, `t:${kopf(e.titel)}`, e.ab && e.ort ? `o:${e.art}|${e.ort}|${e.ab}` : null].filter(Boolean);
    if (k.some(x => raus.has(x))) continue;
    k.forEach(x => raus.add(x));
    aus.push(e);
  }
  return aus;
}

/** Sortierung: Termine nach Datum (ohne Datum ans Ende), dann nah zuerst */
const sortiere = (a, b) => (a.ab || '9999') < (b.ab || '9999') ? -1 : (a.ab || '9999') > (b.ab || '9999') ? 1 : (a.km ?? 999) - (b.km ?? 999);

export default async function events({ holeText, cfg, jetzt = new Date(), vorherDatei = null, ausfluege = null }) {
  const m = cfg.module.events || {};
  const heute = berlinTag(new Date(jetzt).toISOString());
  const morgen = plusTage(heute, 1);
  const hinweise = [], fehler = [];
  let liste = ausfluege;
  if (!liste) { try { liste = await leseListe(); } catch (e) { fehler.push(`ausfluege.json: ${e.message}`); liste = { eintraege: [] }; } }
  const { termine: listeTermine, regelmaessig } = ausListe(liste, heute);
  const stichwoerter = (liste.eintraege || []).flatMap(e => (e.stichwoerter || []).map(norm));

  // Meldungen je Art
  const feeds = [];
  for (const art of ARTEN) for (const q of m.nachrichten?.[art] || []) feeds.push({ name: `Nachrichten „${q}“`, url: googleNews(`${q} when:${m.tageZurueck ?? 30}d`), art, maxAlterTage: m.tageZurueck ?? 30 });
  const { items, fehler: feedFehler } = feeds.length ? await sammleFeeds(holeText, feeds, { jetzt }) : { items: [], fehler: [] };
  fehler.push(...feedFehler);
  const meldungen = [];
  for (const it of items) { const t = bewerteMeldung(it, it.feedInfo.art, m, heute); if (t) meldungen.push(t); }
  // alle Feeds tot: frühere Meldungen behalten (solange nicht vorbei, höchstens tageZurueck alt)
  if (feeds.length && feedFehler.length >= feeds.length && Array.isArray(vorherDatei?.termine)) {
    for (const t of vorherDatei.termine) if (t?.herkunft === 'radar' && !(t.bis && t.bis < heute) && tageZwischen(t.stand || heute, heute) <= (m.tageZurueck ?? 30)) meldungen.push(t);
    hinweise.push('Meldungen gerade nicht erreichbar – Stand vom letzten Lauf');
  }
  const alle = ohneDoppel([...listeTermine, ...meldungen.sort(sortiere)], stichwoerter);
  // ohne Datum: nur Meldungen der letzten 14 Tage
  const termine = alle.filter(t => t.ab || t.herkunft !== 'radar' || !t.veroeffentlicht || tageZwischen(berlinTag(t.veroeffentlicht) || heute, heute) <= 14).sort(sortiere);

  // Push: Gratis-Tag morgen in der Nähe, neuer seriöser Produkttest Musiktechnik (Meldung)
  const pushKm = m.pushKm ?? 60;
  const eintraege = [];
  for (const t of termine) {
    const link = t.quelle.url;
    if (t.art === 'gratis' && t.ab === morgen && (t.km == null ? !t.ort : t.km <= pushKm)) {
      eintraege.push(eintrag({ id: schluessel('events', 'gratis', t.id, t.ab), kategorie: 'events', titel: `Morgen gratis: ${t.titel}`, link, quelle: t.quelle.name, jetzt, datum: new Date(jetzt).toISOString(),
        bis: `${t.bis || t.ab}T22:59:00.000Z`, art: 'nachricht', zeile: [t.ort ? `${t.ort} · ${t.km} km` : t.region, t.vorteil].filter(Boolean).join(' · '),
        soGehts: 'Quelle öffnen, Öffnungszeiten prüfen und morgen hinfahren.', wert: 70, sofort: true, grund: 'gratis-morgen', extra: { events: t.id } }));
    } else if (t.art === 'testen' && t.herkunft === 'radar' && t.musik && t.serioes !== 'vorsicht') {
      eintraege.push(eintrag({ id: schluessel('events', 'test', t.id), kategorie: 'events', titel: `Produkttest Musiktechnik: ${t.titel}`, link, quelle: t.quelle.name, jetzt,
        datum: t.veroeffentlicht || new Date(jetzt).toISOString(), art: 'nachricht', zeile: t.serioes === 'seriös' ? 'seriös (Hersteller/Beta)' : 'Seriosität unbekannt – erst prüfen',
        soGehts: 'Aufruf lesen, nur mitmachen wenn es nichts kostet (keine Gebühr, kein Abo, keine Kontodaten).', wert: 65, sofort: true, grund: 'test-musik', extra: { events: t.id } }));
    }
  }

  const zahl = a => termine.filter(t => t.art === a).length;
  const naechste = termine.filter(t => t.ab && t.art !== 'testen' && (t.km == null || t.km <= (m.maxKm ?? 60))).slice(0, 3)
    .map(t => ({ titel: t.titel, ab: t.ab, bis: t.bis, ort: t.ort || t.region || '', km: t.km, art: t.art }));
  const datei = {
    version: 1, stand: heute, aktualisiert: new Date(jetzt).toISOString(), zuhause: cfg.ort || 'Döbeln', maxKm: m.maxKm ?? 60,
    hinweis: 'Fest/Gratis/Mitmachen/Testen – jede Angabe mit Quelle und Stand. Muster-Termine sind aus der Regel gerechnet: vor dem Losfahren prüfen.',
    termine: termine.slice(0, m.maxTermine ?? 80), regelmaessig,
    quellen: { liste: (liste.eintraege || []).length, meldungen: meldungen.length, feeds: feeds.length, fehler: fehler.length },
  };
  return { eintraege, fehler, hinweise, datei, kurz: { n: termine.length, fest: zahl('fest'), gratis: zahl('gratis'), mitmachen: zahl('mitmachen'), testen: zahl('testen'), top: naechste } };
}
