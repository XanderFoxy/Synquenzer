// Programm-Schnittstellen trotz robots.txt-Sperre (MV7, Xanders Entscheidung vom 16.11.2026: „mach das, was für die Seite am
// besten ist“). Hintergrund: robots.txt richtet sich an Web-Crawler, die Seiten einsammeln. Die fünf Dienste unten bieten
// daneben eine Schnittstelle an, die ausdrücklich für Abrufe durch Programme gebaut ist (API, RSS-Feed, SPARQL-Endpunkt) –
// ihre robots.txt sperrt diese Pfade trotzdem pauschal (Roh-Lauf 43868228532 und Lauf 43869290803, 16.11.2026).
// Darum gilt NUR für genau diese Pfade eine Ausnahme von der robots-Regel – mit den Nutzungsregeln des jeweiligen Dienstes:
//  - pauseMs: Mindestabstand zwischen zwei Abrufen beim Host (macheAbruf, zusätzlich zu abruf.pauseMsJeHost),
//  - maxJeLauf: harte Obergrenze je Lauf (darüber: Fehler „Rest im nächsten Lauf“, kein weiterer Abruf),
//  - cacheStunden: dieselbe Adresse höchstens so oft – dazwischen die gemerkte Antwort (zustand.schnittstellen, gzip),
//  - in einem Lauf wird dieselbe Adresse nie zweimal geholt.
// Alles andere bleibt unter der robots-Regel (auch andere Pfade derselben Hosts). Nutzungsbedingungs-Verbote
// (abruf.agbVerbot: Reddit, Freelancer.com) gehen immer vor – dafür gibt es nie eine Ausnahme (siehe NIE unten).
import { gzipSync, gunzipSync } from 'node:zlib';

// Hosts, die nie über eine Ausnahme gelesen werden – auch nicht, wenn jemand sie unten einträgt (Xander, 16.11.2026)
export const NIE = Object.freeze(['reddit.com', 'freelancer.com']);

export const SCHNITTSTELLEN = Object.freeze([
  Object.freeze({
    host: 'overpass-api.de', pfad: /^\/api\/interpreter$/, name: 'OpenStreetMap (Overpass)', pauseMs: 10000, maxJeLauf: 3, cacheStunden: 0,
    regeln: 'Overpass-Regeln (wiki.openstreetmap.org/wiki/Overpass_API): unter 10 000 Abfragen und 1 GB am Tag, eine Abfrage zur Zeit. Wir: Filialen einmal in der Woche, Essen-Lokale alle 20 Stunden, 10 s Abstand. Ausweich-Server nur, wenn dessen eigene robots.txt es erlaubt (keine Ausnahme).',
  }),
  Object.freeze({
    host: 'news.google.com', pfad: /^\/rss\/search$/, name: 'Google News (RSS)', pauseMs: 3000, maxJeLauf: 60, cacheStunden: 6,
    regeln: 'RSS-Suchfeed für Feed-Leser. Selten: jede Suche höchstens alle 6 Stunden (dazwischen gemerkt), 3 s Abstand, höchstens 60 Suchen je Lauf.',
  }),
  Object.freeze({
    // nur Film-/Serien-Charts (RSS als JSON) und die Search-API; /lookup ist ohnehin erlaubt
    host: 'itunes.apple.com', pfad: /^\/(?:search|[a-z]{2}\/rss\/(?:topmovies|toptvseasons)(?:\/limit=\d+)?(?:\/genre=\d+)?\/json)$/, name: 'Apple iTunes (Charts + Suche)', pauseMs: 3200, maxJeLauf: 60, cacheStunden: 0,
    regeln: 'iTunes Search API: etwa 20 Abrufe pro Minute -> 3,2 s Abstand; Filme-Bereich höchstens 45 Apple-Abrufe je Lauf (Suchen 25).',
  }),
  Object.freeze({
    host: 'query.wikidata.org', pfad: /^\/sparql$/, name: 'Wikidata (SPARQL)', pauseMs: 2000, maxJeLauf: 20, cacheStunden: 24,
    regeln: 'Wikidata Query Service: eigener User-Agent, eine Abfrage zur Zeit, höchstens 60 s Rechenzeit pro Minute. Wir: 2 s Abstand, Antworten 24 Stunden gemerkt.',
  }),
  Object.freeze({
    host: 'remotive.com', pfad: /^\/api\/remote-jobs$/, name: 'Remotive (API)', pauseMs: 30000, maxJeLauf: 2, cacheStunden: 0,
    regeln: 'Remotive-API (Doku): nur wenige Abrufe am Tag, Treffer verlinken auf Remotive und nennen Remotive als Quelle. Wir: höchstens alle 6 Stunden (Bereich Unterricht merkt die Antwort dazwischen).',
  }),
]);
for (const s of SCHNITTSTELLEN) if (NIE.some(h => s.host === h || s.host.endsWith(`.${h}`))) throw new Error(`Schnittstellen-Ausnahme für ${s.host} ist verboten`);

/** Ausnahme für diese Adresse? Nur genauer Host (keine Unterdomains) und genau passender Pfad. -> Eintrag | null */
export function schnittstelleFuer(url, liste = SCHNITTSTELLEN) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();
  if (NIE.some(h => host === h || host.endsWith(`.${h}`))) return null;
  return liste.find(s => s.host === host && s.pfad.test(u.pathname)) || null;
}

/** Abstände der Schnittstellen für macheAbruf (größerer Wert gewinnt gegen abruf.pauseMsJeHost) */
export function schnittstellenPausen(jeHost = {}, liste = SCHNITTSTELLEN) {
  const p = { ...(jeHost || {}) };
  for (const s of liste) p[s.host] = Math.max(p[s.host] || 0, s.pauseMs || 0);
  return p;
}

// Cache im Zustand: zustand.schnittstellen.cache[url] = { zeit, gz } (gz = gzip, base64). Höchstens CACHE_MAX_BYTES (base64)
// zusammen – älteste fliegen zuerst; Abgelaufenes fliegt bei jedem Lauf.
export const CACHE_MAX_BYTES = 600_000;
const packe = text => gzipSync(Buffer.from(String(text), 'utf8')).toString('base64');
const entpacke = gz => gunzipSync(Buffer.from(gz, 'base64')).toString('utf8');

export function cacheLese(zustand, url, stunden, jetztMs) {
  const e = zustand?.schnittstellen?.cache?.[url];
  if (!e || !stunden || !(jetztMs - Date.parse(e.zeit) < stunden * 3600e3) || jetztMs < Date.parse(e.zeit) - 60e3) return null;
  try { return entpacke(e.gz); } catch { return null; }
}

export function cacheSchreibe(zustand, url, text, jetztMs) {
  if (!zustand) return;
  const c = ((zustand.schnittstellen ||= {}).cache ||= {});
  c[url] = { zeit: new Date(jetztMs).toISOString(), gz: packe(text) };
}

/** Abgelaufenes raus (je Host seine cacheStunden), dann Größe begrenzen (älteste zuerst) */
export function cacheAufraeumen(zustand, jetztMs, liste = SCHNITTSTELLEN, maxBytes = CACHE_MAX_BYTES) {
  const c = zustand?.schnittstellen?.cache;
  if (!c) return;
  for (const [url, e] of Object.entries(c)) {
    const s = schnittstelleFuer(url, liste);
    if (!s?.cacheStunden || !(jetztMs - Date.parse(e?.zeit) < s.cacheStunden * 3600e3) || typeof e?.gz !== 'string') delete c[url];
  }
  let summe = Object.values(c).reduce((n, e) => n + e.gz.length, 0);
  for (const [url, e] of Object.entries(c).sort((a, b) => Date.parse(a[1].zeit) - Date.parse(b[1].zeit))) {
    if (summe <= maxBytes) break;
    summe -= e.gz.length;
    delete c[url];
  }
}
