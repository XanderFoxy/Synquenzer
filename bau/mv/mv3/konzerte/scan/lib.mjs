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
