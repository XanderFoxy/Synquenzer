// Enddaten für alle Einträge: „bis“ (ISO, UTC) aus einem Feld der Quelle oder aus dem Text, Beginn („ab“),
// Berliner Zeit, Jahresregel für Daten ohne Jahr und das Anzeigefenster für Einträge ohne bekanntes Ende.
// Grundsatz: Was ein bekanntes Ende in der Vergangenheit hat, fliegt raus. Was ein bekanntes Ende in der Zukunft hat,
// bleibt bis dahin stehen. Ohne bekanntes Ende gilt ein Höchstalter je Art (HOECHSTALTER_STUNDEN, siehe README).

/** Höchstalter in Stunden für Einträge OHNE bekanntes Ende (ab Veröffentlichung). */
export const HOECHSTALTER_STUNDEN = {
  preisfehler: 24, // Preisfehler sind laut echten Deal-Seiten nach 5 Minuten bis 3 Stunden vorbei
  deal: 72, // mydealz-Deals (Lebensmittel, Drogerie, Erleben)
  reise: 96, // mydealz Reisen, Urlaubspiraten
  freebie: 7 * 24, // mydealz Freebies
  gewinnspiel: 14 * 24, // mydealz Gewinnspiele ohne Teilnahmeschluss
  gewinnspielTicket: 6 * 24, // Ticket-Verlosungen ohne Teilnahmeschluss (enden vor der Veranstaltung)
  nachricht: 14 * 24, // Google News (Gewinnspiele, Produkttester, Feste): Ende unbekannt
  aufruf: 30 * 24, // „Bands gesucht“ ohne Frist
  job: 21 * 24, // Stellenanzeigen
  schnaeppchen: 7 * 24, // Angebote aus dem Schnäppchen-Wecker ohne gueltigBis
};

const MONATE = { jan: 1, feb: 2, mae: 3, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12 };

const BERLIN = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
function teileBerlin(ms) {
  return Object.fromEntries(BERLIN.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
}
function versatzMin(ms) {
  const p = teileBerlin(ms);
  return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 60e3);
}

/** Berliner Ortszeit -> ISO in UTC (Sommer-/Winterzeit richtig). */
export function berlinIso(jahr, monat, tag, std = 23, min = 59, sek = 59) {
  const lokal = Date.UTC(jahr, monat - 1, tag, std, min, sek);
  let utc = lokal - versatzMin(lokal) * 60e3;
  utc = lokal - versatzMin(utc) * 60e3;
  return new Date(utc).toISOString();
}

/** ISO -> Kalendertag in Berlin ("YYYY-MM-DD"). */
export function berlinTag(iso) {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return null;
  const p = teileBerlin(t);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Text vereinfachen, aber Ziffern, Punkte und Doppelpunkte behalten. */
export function klein(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9.:,\-() ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Jahr ergänzen: ohne Jahr gilt das aktuelle Jahr; liegt das Datum dann mehr als ~2 Monate zurück, das nächste.
function mitJahr(jahr, monat, tag, jetzt) {
  if (jahr != null && jahr < 100) jahr += 2000;
  if (jahr == null) {
    jahr = jetzt.getUTCFullYear();
    if (Date.UTC(jahr, monat - 1, tag) < jetzt.getTime() - 864e5 * 60) jahr++;
  }
  return jahr;
}

// "Montag, den 2.11." | "Montag dem 02.11.26" | "Mo. 2.11."
const WOCHENTAG = '(?:(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|mo|di|mi|do|fr|sa|so)\\.?,?\\s*(?:de[nm]\\s*)?)?';
// "07.11.2026" | "07.11." | "7.11.26" | "7. november 2026" | "4. nov"
const DATUM = new RegExp(`^${WOCHENTAG}(\\d{1,2})\\s?\\.\\s?(\\d{1,2})\\s?\\.?(?:\\s?(\\d{4})|(\\d{2})(?![\\d.:]))?|^${WOCHENTAG}(\\d{1,2})\\s?\\.?\\s?([a-z]{3})[a-z]*\\.?(?:\\s?(\\d{4}))?`);
const ZEIT = /^\s*,?\s*\(?\s*(?:um\s*)?(\d{1,2})[:.](\d{2})\s*(?:uhr)?/;

/** Datum (+ optionale Uhrzeit) am Anfang von rest lesen -> { jahr, monat, tag, std, min, laenge } | null */
export function datumAm(rest, jetzt) {
  const d = rest.match(DATUM);
  if (!d) return null;
  let tag, monat, jahr = null;
  if (d[1] != null) { tag = +d[1]; monat = +d[2]; jahr = d[3] ? +d[3] : d[4] ? +d[4] : null; }
  else { tag = +d[5]; monat = MONATE[d[6]]; jahr = d[7] ? +d[7] : null; if (!monat) return null; }
  if (!(tag >= 1 && tag <= 31 && monat >= 1 && monat <= 12)) return null;
  // Beträge wie "1.000 €" oder "12.99 €" sind keine Daten
  if (/^\s*(?:€|eur|euro)/.test(rest.slice(d[0].length))) return null;
  jahr = mitJahr(jahr, monat, tag, jetzt);
  const z = rest.slice(d[0].length).match(ZEIT);
  const std = z && +z[1] <= 23 && +z[2] <= 59 ? +z[1] : null;
  return { jahr, monat, tag, std, min: std != null ? +z[2] : null, laenge: d[0].length + (std != null ? z[0].length : 0) };
}

// Wörter, nach denen ein Datum das Ende einer Aktion/Teilnahme meint
const SIGNAL = /((?<![a-z])frist|nur (?:noch )?(?:heute )?am|bewerbungsschluss|einsendeschluss|anmeldeschluss|teilnahmeschluss|annahmeschluss|deadline|bewerben bis|bewerbung bis|anmeldung bis|teilnahme bis|buchbar bis|buchung bis|buchungen bis|endet am|endet|laeuft bis|laeuft noch bis|gueltig bis|nur noch bis|noch bis|bis spaetestens|bis einschliesslich|bis zum|bis)\s*:?\s*(?:(?:zum|am|einschliesslich|spaetestens|ende)\s+)*/g;
// Steht davor eines dieser Wörter, ist das Datum ein Reise-, Aufenthalts- oder Haltbarkeitszeitraum – kein Aktionsende.
const KEIN_ENDE = /(reisezeit|(?<!aktions|angebots|buchungs|teilnahme)zeitraum|reisen|reise |reisedatum|aufenthalt|hinflug|rueckflug|anreise|abreise|nacht von|uebernachtung|geoeffnet|oeffnungszeit|mhd|haltbar|liefer|einloesbar|coupon ist|termine)[^.!?]{0,40}$/;

// Punkte in Daten ("von 01.11. bis") sind kein Satzende
const ohneDatumsPunkte = s => s.replace(/(?<=\d)\.|\.(?=\d)/g, '');

/** Schwaches „bis“-Datum, das weit nach der Veröffentlichung liegt, ist eher ein Reise-/Nutzungszeitraum als ein Aktionsende. */
export const SCHWACH_MAX_TAGE = 45;

/**
 * Ende einer Aktion aus Freitext. Liefert { bis (ISO, UTC), tag ("YYYY-MM-DD", Berlin), mitZeit, schwach } oder null.
 * Ohne Uhrzeit gilt 23:59:59 Berliner Zeit. Ohne Jahr: dieses Jahr, außer es liegt > 2 Monate zurück (dann nächstes).
 */
export function endeAus(text, jetzt = new Date()) {
  const t = klein(text);
  SIGNAL.lastIndex = 0;
  let m;
  while ((m = SIGNAL.exec(t))) {
    const vor = ohneDatumsPunkte(t.slice(Math.max(0, m.index - 45), m.index));
    const rest = t.slice(m.index + m[0].length, m.index + m[0].length + 60);
    let d = datumAm(rest, jetzt);
    if (!d) continue;
    // "vom 18.09. bis 27.09" in Reise-/Aufenthaltszeiträumen überspringen
    if (KEIN_ENDE.test(vor)) continue;
    // verlängert: "bis 27.09 bis 8.11." -> das spätere Datum
    const weiter = rest.slice(d.laenge).match(/^\s*\.?\s*(?:-|bis|verlaengert bis)\s*(?:zum\s+)?/);
    const d2 = weiter && datumAm(rest.slice(d.laenge + weiter[0].length), jetzt);
    if (d2 && Date.UTC(d2.jahr, d2.monat - 1, d2.tag) > Date.UTC(d.jahr, d.monat - 1, d.tag)) d = d2;
    const bis = d.std != null ? berlinIso(d.jahr, d.monat, d.tag, d.std, d.min, 0) : berlinIso(d.jahr, d.monat, d.tag);
    // schwach = nur „bis (zum)“ ohne Wort wie Teilnahmeschluss/buchbar/gültig – kann auch ein Reisezeitraum sein
    const schwach = /^bis( zum)?$/.test(m[1]);
    return { bis, tag: `${d.jahr}-${String(d.monat).padStart(2, '0')}-${String(d.tag).padStart(2, '0')}`, mitZeit: d.std != null, schwach };
  }
  return null;
}

/** endeAus mit Plausibilität: ein schwaches „bis“ mehr als SCHWACH_MAX_TAGE nach der Veröffentlichung zählt nicht. */
export function endeAusFuer(text, datum, jetzt = new Date()) {
  const e = endeAus(text, jetzt);
  if (!e) return null;
  const basis = Number.isFinite(Date.parse(datum || '')) ? Date.parse(datum) : new Date(jetzt).getTime();
  if (e.schwach && Date.parse(e.bis) - basis > SCHWACH_MAX_TAGE * 864e5) return null;
  return e;
}

/** Beginn einer Aktion aus Freitext ("ab Montag den 2.11.", "vom 02.11. bis 07.11.2026", "gültig ab 4.11.") -> ISO | null */
export function abAus(text, jetzt = new Date()) {
  const t = klein(text);
  const re = /(?:^|[^a-z])(gueltig ab|erhaeltlich ab|ab|vom)\s+(?:dem\s+)?/g;
  let m;
  while ((m = re.exec(t))) {
    const vor = ohneDatumsPunkte(t.slice(Math.max(0, m.index - 45), m.index + 1));
    const rest = t.slice(m.index + m[0].length, m.index + m[0].length + 45);
    const d = datumAm(rest, jetzt);
    if (!d) continue;
    if (KEIN_ENDE.test(vor)) continue;
    if (m[1] === 'vom' && !/^\s*(?:-|bis)/.test(rest.slice(d.laenge))) continue;
    return berlinIso(d.jahr, d.monat, d.tag, d.std ?? 0, d.min ?? 0, 0);
  }
  return null;
}

/**
 * Ende eines Eintrags bestimmen.
 * bis/bisQuelle: Ende aus einem Feld der Quelle (z. B. gueltigBis) – hat Vorrang vor dem Text.
 * art: Schlüssel in HOECHSTALTER_STUNDEN (Anzeigefenster, wenn kein Ende bekannt ist).
 * Ergebnis: { bis, bisQuelle ('feld'|'deal-seite'|'text'|null), ab, sichtbarBis }
 *   sichtbarBis = bis, wenn bekannt; sonst Veröffentlichung + Höchstalter (Preisfehler: immer höchstens 24 h).
 */
export function bestimmeEnde({ bis = null, bisQuelle = null, ab = null, text = '', datum = null, art = 'deal', jetzt = new Date() } = {}) {
  let b = bis && Number.isFinite(Date.parse(bis)) ? new Date(bis).toISOString() : null;
  let q = b ? bisQuelle || 'feld' : null;
  if (!b && text) { const e = endeAusFuer(text, datum, jetzt); if (e) { b = e.bis; q = 'text'; } }
  const a = ab && Number.isFinite(Date.parse(ab)) ? new Date(ab).toISOString() : text ? abAus(text, jetzt) : null;
  const pub = Date.parse(datum || '');
  const fenster = Number.isFinite(pub) ? new Date(pub + (HOECHSTALTER_STUNDEN[art] ?? HOECHSTALTER_STUNDEN.deal) * 3600e3).toISOString() : null;
  let sichtbarBis = b || fenster;
  // Preisfehler: nie länger als das Fenster, auch wenn der Text ein späteres Ende nennt
  if (art === 'preisfehler' && fenster && (!sichtbarBis || sichtbarBis > fenster)) sichtbarBis = fenster;
  // "ab" nur, wenn der Beginn noch bevorsteht (sonst ist es für die Anzeige egal)
  const abZukunft = a && Date.parse(a) > new Date(jetzt).getTime() && (!b || a <= b) ? a : null;
  return { bis: b, bisQuelle: q, ab: abZukunft, sichtbarBis };
}

/** Ist der Eintrag vorbei? (bekanntes Ende oder Anzeigefenster überschritten) */
export function istVorbei(e, jetzt = new Date()) {
  const j = new Date(jetzt).getTime();
  return [e?.bis, e?.sichtbarBis].some(x => x && Date.parse(x) < j);
}

/** Alter in Stunden (unbekannt -> 0) */
export function alterStunden(datum, jetzt = new Date()) {
  const t = Date.parse(datum || '');
  return Number.isFinite(t) ? (new Date(jetzt).getTime() - t) / 3600e3 : 0;
}

// Welche Kategorie behält einen Eintrag, der (gleicher Link) in mehreren Kategorien steht: die speziellere.
const VORRANG = ['reisen', 'musik', 'erleben', 'tests', 'nebenverdienst'];

/**
 * Vor dem Speichern: Einträge, die vorbei sind (bis oder sichtbarBis < jetzt), entfernen – auch übernommene aus
 * Modulen, die in diesem Lauf nicht dran waren. Gleicher Link in mehreren Kategorien -> nur in der spezielleren;
 * ist eine Kopie ein Preisfehler (preisfehler: true, 24-h-Fenster, vorher → jetzt), bleibt immer diese.
 * Ändert kategorien direkt und gibt es zurück.
 */
export function aufraeumen(kategorien, jetzt = new Date()) {
  const j = new Date(jetzt).getTime();
  for (const [name, liste] of Object.entries(kategorien)) {
    kategorien[name] = (liste || []).filter(e => {
      if (istVorbei(e, j)) return false;
      // Altbestand ohne Enddaten (vor dieser Fassung): Preisfehler höchstens 24 h
      if (!('sichtbarBis' in e) && /preisfehler/i.test(`${e.grund} ${e.titel}`) && alterStunden(e.datum, j) > HOECHSTALTER_STUNDEN.preisfehler) return false;
      return true;
    });
  }
  const namen = Object.keys(kategorien).sort((a, b) => (VORRANG.indexOf(a) + 1 || 99) - (VORRANG.indexOf(b) + 1 || 99));
  const gesehen = new Set(), preisfehlerIn = new Map(); // Link -> Kategorie der Preisfehler-Kopie
  for (const name of namen) for (const e of kategorien[name]) if (e.preisfehler === true && e.link && !preisfehlerIn.has(e.link)) preisfehlerIn.set(e.link, name);
  for (const name of namen) {
    kategorien[name] = kategorien[name].filter(e => {
      if (!e.link || !/^https?:/.test(e.link) || /\/vorteile\/?$/.test(e.link)) return true;
      const pf = preisfehlerIn.get(e.link);
      if (pf && (pf !== name || e.preisfehler !== true)) return false;
      if (gesehen.has(e.link)) return false;
      gesehen.add(e.link);
      return true;
    });
  }
  return kategorien;
}
