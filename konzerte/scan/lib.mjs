// Gemeinsame Helfer: Distanz, Geohash, Namensabgleich, Release-Normalisierung, HTTP, ntfy.
export const UA = 'SynquenzerKonzertAlarm/1.0 (+https://github.com/xanderfoxy/synquenzer)';

export function distanzKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function geohash(lat, lon, len = 7) {
  const B = '0123456789bcdefghjkmnpqrstuvwxyz';
  let la = [-90, 90], lo = [-180, 180], bit = 0, ch = 0, even = true, out = '';
  while (out.length < len) {
    const r = even ? lo : la, v = even ? lon : lat, mid = (r[0] + r[1]) / 2;
    if (v >= mid) { ch = (ch << 1) | 1; r[0] = mid; } else { ch <<= 1; r[1] = mid; }
    even = !even;
    if (++bit === 5) { out += B[ch]; bit = 0; ch = 0; }
  }
  return out;
}

export const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

const ohneThe = s => s.replace(/^the /, '');

/** Gleicher Künstler? Exakt nach Normalisierung, "The" optional, Aliase zählen. */
export function istBand(name, band) {
  const n = ohneThe(norm(name));
  return [band.name, ...(band.aliase || [])].some(x => ohneThe(norm(x)) === n);
}

/** Kommt die Band als ganzes Wort in einem Fließtext vor? Groß-/Kleinschreibung wie im Namen oder KOMPLETT GROSS
 *  (Lineups), damit z. B. "a new order of tickets" nicht als New Order zählt. */
export function erwaehnt(text, band) {
  const roh = String(text || '').normalize('NFC');
  for (const x of [band.name, ...(band.aliase || [])]) {
    const kern = x.replace(/^the\s+/i, '').trim();
    if (!kern) continue;
    const esc = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    for (const v of new Set([kern, kern.toUpperCase()])) {
      if (new RegExp(`(^|[^\\p{L}\\p{N}])${esc(v)}(?![\\p{L}\\p{N}])`, 'u').test(roh)) return true;
    }
  }
  return false;
}

// --- Echter Auftritt der Band – oder Tribute-, Cover-, Party-Show, Lesung, Gast-Auftritt eines Mitglieds? -----------------
// Echter Eventim-Lauf 08.11.2026 (42435894704): Suche „Depeche Mode“ lieferte fast nur „Strangelove – The DEPECHE MODE
// Experience“, „Remode – The Music of Depeche Mode“, „Depeche Mode on piano – played by Thilo“, „Depeche Mode Party …“,
// Suche „Roxette“ nur „Rox! – Tribute to Roxette“, „Silverblue Joyriders – Songs by Roxette“ …, Suche „Alphaville“ zuerst
// „Control Room – Gast – Marian Gold (Alphaville)“ (Gesprächsabend mit dem Sänger). Gleiche Regel für alle Quellen.
const escRe = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bandNamen = band => [band.name, ...(band.aliase || [])].map(x => String(x || '').replace(/^the\s+/i, '').trim()).filter(Boolean);
// direkt VOR dem Bandnamen (normalisiert): „Tribute to …“, „The Music of …“, „Songs by …“, „Lesung … über …“, „with members of …“
const DAVOR = / (?:tributes? to|tribute an|tribute|hommage an|hommage a|homage to|homage|cover|covers|the music of|music of|musik von|songs (?:by|of|von)|hits (?:of|von)|played by|performed by|plays|spielt|a night of|a celebration of|celebrating|salute to|im stil von|in the style of|uber|about|members of|mitglieder von|singer of|sanger von|voice of|stimme von) $/;
// direkt NACH dem Bandnamen: „… Tribute (Band)“, „… Special Tribute“, „… Experience“, „… Party“, „… on piano“, „… by Mode Machine“
const DANACH = /^ (?:s )?(?:(?:[a-z0-9]+ )?tributes?|experience|[a-z]*party|revival|covers?|coverband|cover band|on piano|[a-z]*lounge|fans?|fanclub|fantreffen|lesung|lesetour|lesereise|by|played by|performed by) /;
// Name ohne Künstlerangabe: zusätzlich diese Wörter irgendwo im Namen (Party/DJ/Fan-Abend/Lesung/Gast …)
const NUR_NAME = / (?:tributes?|hommage|homage|covers?|coverband|experience|the music of|music of|musik von|songs (?:by|of|von)|hits (?:of|von)|played by|performed by|plays the music|on piano|a night of|with members of|revival|gast|dj|disco|karaoke|fans?|fanclub|fantreffen|lesung|lesetour|lesereise|musical|symphonic|klassik trifft|im stil von|salute) |party|lounge/;
// Nur DIREKT hinter dem Bandnamen (vor dem ersten „ - “, „:“, „|“) Zeichen eines Fan-Abends: echt 08.11. (quellen/005)
// „Depeche Mode Church Night“, „DEPECHE MODE "FESTIVAL FOR THE MASSES" - Live: BEBORN BETON, …“ – kamen nur durch die zufällige
// Künstlerangabe („DM Fan Base“, „Party for the Masses“) nicht durch. „The Human League - Night People Tour“ bleibt echt.
const NUR_NAME_DIREKT = / (?:[a-z]*night|nights|[a-z]*nacht|festival|for the masses) /;
const TRENNER = /\s[-–—|]\s|:\s|\s\|/;
// Ticket-Vorsätze ohne eigene Bedeutung („Loge / Premiumbereich - …“, „Premium Tickets - …“)
const VORSATZ = /^\s*(?:loge\s*\/\s*premiumbereich|premium[- ]?tickets?|vip[- ]?(?:tickets?|pakete?|packages?)?|tickets?)\s*[-–—:|]\s*/i;

/** Jede Stelle, an der die Band im Text steht: { vor, nach } (roh). gross = nur wie geschrieben oder KOMPLETT GROSS. */
function stellen(text, band, { gross = false } = {}) {
  const roh = String(text || '').normalize('NFC'), out = [];
  for (const kern of bandNamen(band)) {
    const varianten = gross ? [...new Set([kern, kern.toUpperCase()])] : [kern];
    for (const v of varianten) {
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escRe(v).replace(/\s+/g, '\\s+')})(?![\\p{L}\\p{N}])`, gross ? 'gu' : 'giu');
      for (const m of roh.matchAll(re)) {
        const a = m.index + m[1].length, e = a + m[2].length;
        out.push({ vor: roh.slice(0, a), nach: roh.slice(e), band });
      }
    }
  }
  return out;
}

/** Steht die Band an dieser Stelle als Gegenstand einer Tribute-/Cover-/Party-Show oder als Herkunft eines Mitglieds? */
function nachgespieltStelle({ vor, nach, band }) {
  // „Marian Gold (Alphaville)“, „Andy McCluskey (ex-OMD)“: ein Mitglied, nicht die Band – außer vor der Klammer steht die
  // Band selbst unter ihrem anderen Namen: „OMD (Orchestral Manoeuvres in the Dark)“, „Orchestral Manoeuvres In The Dark (OMD)“
  const klammer = /\(\s*(?:ex[- ]?|of |von |aus |from )?(?:the\s+)?$/i.exec(vor);
  if (klammer && /^\s*\)/.test(nach)) {
    const davor = ' ' + ohneThe(norm(vor.slice(0, klammer.index)));
    if (!bandNamen(band).some(x => { const k = ohneThe(norm(x)); return k && davor.endsWith(' ' + k); })) return true;
  }
  const v = (' ' + norm(vor.slice(-80)) + ' ').replace(/ the $/, ' ').replace(/ +$/, ' ');
  const n = ' ' + norm(nach.slice(0, 80)) + ' ';
  return DAVOR.test(v) || DANACH.test(n);
}

/** Sagt der Veranstaltungsname, dass hier jemand die Band nachspielt, feiert oder über sie spricht? */
export function nachgespielt(name, band) {
  return stellen(name, band).some(nachgespieltStelle);
}

/**
 * Echter Auftritt der Band? Mit Künstlerangabe (Eventim „attractions“, Ticketmaster „attractions“) entscheidet allein der
 * exakte Künstlername (normalisiert, „The“ optional, Aliase) – mehrere Künstler (Festival) zählen, wenn die Band dabei ist.
 * Ohne Künstlerangabe nur Namen, die mit der Band beginnen und keine Tribute-/Cover-/Party-/Gast-Wörter enthalten.
 * -> 'kuenstler' | 'name' | null (Art der Zuordnung, steht im Eintrag als „zuordnung“)
 */
export function auftrittZuordnung(name, attraktionen, band) {
  if (nachgespielt(name, band)) return null;
  const atts = (Array.isArray(attraktionen) ? attraktionen : []).map(a => String((a && typeof a === 'object' ? a.name : a) || '')).filter(Boolean);
  if (atts.length) return atts.some(a => istBand(a, band)) ? 'kuenstler' : null;
  const roh = String(name || '').replace(VORSATZ, ''), n = ohneThe(norm(roh));
  // Rest hinter dem Bandnamen prüfen (ein Bandname mit „Experience“ o. Ä. sperrt sich so nicht selbst aus)
  const b = bandNamen(band).map(x => ohneThe(norm(x))).filter(Boolean).find(x => n === x || n.startsWith(x + ' '));
  if (!b || NUR_NAME.test(' ' + n.slice(b.length).trim() + ' ')) return null;
  const direkt = ohneThe(norm(roh.split(TRENNER)[0]));
  return direkt.startsWith(b) && NUR_NAME_DIREKT.test(' ' + direkt.slice(b.length).trim() + ' ') ? null : 'name';
}

/** Festival-/Hallenseite: Band irgendwo wirklich im Programm (mindestens eine Erwähnung ohne Tribute-/Party-Zusammenhang). */
export function erwaehntEcht(text, band) {
  return stellen(text, band, { gross: true }).some(s => !nachgespieltStelle(s));
}

const ZUSATZ = /\b(deluxe|remaster(ed)?|edition|version|expanded|anniversary|bonus|single|ep|radio edit|edit|mix|remix(es)?|live)\b/;
/** Titel für Dedupe: Klammerzusätze wie (Deluxe) / - Single entfernen. */
export function titelSchluessel(t) {
  let s = String(t || '').replace(/\s*[([][^)\]]*[)\]]/g, m => (ZUSATZ.test(norm(m)) ? '' : m));
  s = s.replace(/\s+-\s+(single|ep)$/i, '');
  return norm(s);
}

export const WIEDERVEROEFFENTLICHUNG = /\b(remaster(ed)?|anniversary|jubil(ae|a)ums|reissue|re issue|best of|greatest hits|collection|the singles|singles \d|essential|anthology|compilation|hits|gold)\b/;

export function datumOk(d) { return /^\d{4}-\d{2}-\d{2}$/.test(d || ''); }

const BERLIN = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const versatzMin = ms => {
  const p = Object.fromEntries(BERLIN.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 60e3);
};
/** ISO -> "DD.MM. HH:MM" in Berliner Zeit (für Pushes) */
export function berlinKurz(iso) {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return '';
  const p = Object.fromEntries(BERLIN.formatToParts(new Date(t)).map(x => [x.type, x.value]));
  return `${p.day}.${p.month}. ${p.hour}:${p.minute}`;
}

/** "YYYY-MM-DD" (+ "HH:MM") in Berliner Ortszeit -> ISO in UTC; ohne Uhrzeit = Ende des Tages (23:59:59). */
export function berlinIso(datum, zeit = '') {
  if (!datumOk(datum)) return null;
  const [j, m, t] = datum.split('-').map(Number);
  const [h, mi, s] = /^\d{1,2}:\d{2}/.test(zeit) ? [...zeit.split(':').map(Number), 0].slice(0, 3) : [23, 59, 59];
  const lokal = Date.UTC(j, m - 1, t, h, mi, s);
  let utc = lokal - versatzMin(lokal) * 60e3;
  utc = lokal - versatzMin(utc) * 60e3;
  return new Date(utc).toISOString();
}

export function tageZwischen(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }

const warte = ms => new Promise(r => setTimeout(r, ms));

/** Höfliches HTTP mit Timeout, kleinem Retry und optionalem Mindestabstand pro Host. */
export function macheHttp({ fetchImpl = globalThis.fetch, abstandMs = {}, timeoutMs = 20000, schlafen = warte, versuche503 = { 'musicbrainz.org': 5 } } = {}) {
  const letzter = {};
  async function get(url, { json = true, headers = {} } = {}) {
    const host = new URL(url).host, gap = abstandMs[host] || 0;
    for (let versuch = 0; ; versuch++) {
      const seit = Date.now() - (letzter[host] || 0);
      if (gap && seit < gap) await schlafen(gap - seit);
      letzter[host] = Date.now();
      const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const r = await fetchImpl(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html', ...headers }, signal: ctrl.signal });
        // 429/5xx: kurz warten und neu versuchen; MusicBrainz antwortet bei Last mit 503 -> dort öfter und länger
        const max = (r.status === 503 || r.status === 429) && versuche503[host] ? versuche503[host] : 2;
        if ((r.status === 429 || r.status >= 500) && versuch < max) { await schlafen(2000 * (versuch + 1)); continue; }
        if (!r.ok) throw new Error(`HTTP ${r.status} ${host}`);
        return json ? await r.json() : await r.text();
      } catch (e) {
        if (versuch < 2 && (e.name === 'AbortError' || /fetch failed|ECONN|ETIMEDOUT/.test(String(e.message)))) { await schlafen(2000 * (versuch + 1)); continue; }
        throw e;
      } finally { clearTimeout(t); }
    }
  }
  return { get };
}

/** Push über ntfy (JSON-API, damit Umlaute im Titel funktionieren). */
export async function ntfy({ server, topic, token }, { titel, text, link, tags = [], prio = 4 }, fetchImpl = globalThis.fetch) {
  const body = { topic, title: titel, message: text, tags, priority: prio };
  if (link) { body.click = link; body.actions = [{ action: 'view', label: 'Öffnen', url: link }]; }
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetchImpl(server.replace(/\/$/, '') + '/', { method: 'POST', headers, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`ntfy HTTP ${r.status}`);
}

export function datumDe(d) {
  if (!datumOk(d)) return d || '?';
  const [y, m, t] = d.split('-');
  return `${t}.${m}.${y}`;
}
