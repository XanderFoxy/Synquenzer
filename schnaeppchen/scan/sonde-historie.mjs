// Einmalige Sonde (nur Zweig preis-sonde): Welche Quellen liefern regulären Preis, Tiefstpreis und Preisverlauf –
// und sind sie aus GitHub Actions erreichbar? Gehört NICHT zum stündlichen Wecker, schreibt nichts in Daten-Zweige.
//
// Höflich:
//  - ehrlicher User-Agent (kein Browser-Name), siehe UA unten
//  - robots.txt jedes Hosts zuerst; was dort verboten ist, wird NICHT abgerufen (nur vermerkt)
//  - höchstens 1 Anfrage pro Sekunde insgesamt (Crawl-delay wird beachtet)
//  - Seiten, deren Nutzungsbedingungen automatisches Auslesen verbieten (Amazon, camelcamelcamel, idealo):
//    nur robots.txt, keine Produktseiten
// Gespeichert wird je Anfrage: Status, Kopfzeilen, höchstens 1 MB Inhalt (index.json + quellen/).
//
// Aufruf: node schnaeppchen/scan/sonde-historie.mjs --out <ordner>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const UA = 'Mozilla/5.0 (compatible; MeinVorteil/1.0; +https://xanderfoxy.github.io/Synquenzer/)';
const UA_TOKEN = 'meinvorteil';
const MAX_BYTES = 1024 * 1024;
const MIN_ABSTAND_MS = 1100;
const TIMEOUT_MS = 25000;

// ---------- robots.txt (RFC 9309, vereinfacht) ----------
export function parseRobots(text) {
  const gruppen = [];
  let aktuell = null, letzteWarUa = false;
  for (const roh of String(text || '').split(/\r?\n/)) {
    const zeile = roh.replace(/#.*$/, '').trim();
    if (!zeile) continue;
    const m = zeile.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const feld = m[1].toLowerCase(), wert = m[2].trim();
    if (feld === 'user-agent') {
      if (!aktuell || !letzteWarUa) { aktuell = { agents: [], regeln: [], crawlDelay: null }; gruppen.push(aktuell); }
      aktuell.agents.push(wert.toLowerCase());
      letzteWarUa = true;
    } else {
      letzteWarUa = false;
      if (!aktuell) continue;
      if (feld === 'allow' || feld === 'disallow') { if (wert) aktuell.regeln.push({ allow: feld === 'allow', muster: wert }); }
      else if (feld === 'crawl-delay') { const n = parseFloat(wert); if (n >= 0) aktuell.crawlDelay = n; }
    }
  }
  return gruppen;
}

function musterPasst(muster, pfad) {
  const ende = muster.endsWith('$');
  const kern = ende ? muster.slice(0, -1) : muster;
  const re = new RegExp('^' + kern.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (ende ? '$' : ''));
  return re.test(pfad);
}

/** {erlaubt, regel, gruppe, crawlDelay} für einen Pfad (+Query). */
export function robotsEntscheid(gruppen, pfad, token = UA_TOKEN) {
  let passend = gruppen.filter(g => g.agents.some(a => a !== '*' && token.includes(a)));
  let gruppe = passend.length ? token : '*';
  if (!passend.length) passend = gruppen.filter(g => g.agents.includes('*'));
  const regeln = passend.flatMap(g => g.regeln);
  const crawlDelay = passend.map(g => g.crawlDelay).filter(v => v != null)[0] ?? null;
  let best = null;
  for (const r of regeln) {
    if (!musterPasst(r.muster, pfad)) continue;
    const len = r.muster.replace(/\$$/, '').length;
    if (!best || len > best.len || (len === best.len && r.allow && !best.allow)) best = { ...r, len };
  }
  return { erlaubt: !best || best.allow, regel: best ? `${best.allow ? 'Allow' : 'Disallow'}: ${best.muster}` : null, gruppe, crawlDelay };
}

// ---------- Inhalte grob einordnen (nur Hinweise für den Befund) ----------
const BLOCK_RE = /captcha|cf-chl|challenge-platform|just a moment\.\.\.|attention required|datadome|px-captcha|perimeterx|access denied|zugriff verweigert|are you a robot|bist du ein mensch|request unsuccessful|incapsula/i;

export function signale(text, typ = '') {
  const t = String(text || '');
  const s = {};
  const title = t.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i);
  if (title) s.titel = title[1].replace(/\s+/g, ' ').trim();
  s.block = BLOCK_RE.test(t.slice(0, 200000)) ? (t.match(BLOCK_RE) || [''])[0] : null;
  const z = re => (t.match(re) || []).length;
  s.preisverlauf = z(/preisverlauf|preishistorie|preisentwicklung|price.?history/gi);
  s.statt = z(/statt\s*(?:<[^>]*>\s*)*\d/gi);
  s.uvp = z(/\bUVP\b/g);
  s.regulaer = z(/regul(?:ä|&auml;|ae)r|normalpreis|originalpreis/gi);
  s.tiefst = z(/tiefstpreis|bestpreis|niedrigster preis|lowest/gi);
  const daten = [...t.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/g)].map(m => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
  const iso = [...t.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})(?:T|\b)/g)].map(m => `${m[1]}-${m[2]}-${m[3]}`);
  const alle = [...daten, ...iso].filter(d => d >= '2000-01-01' && d <= '2030-12-31').sort();
  s.daten = alle.length; s.datumMin = alle[0] || null; s.datumMax = alle[alle.length - 1] || null;
  s.euro = z(/\d+,\d{2}\s*(?:€|&euro;|EUR)/g);
  s.jsonLd = z(/application\/ld\+json/gi);
  if (/json/i.test(typ) || /^\s*[[{]/.test(t)) {
    try { const j = JSON.parse(t); s.jsonSchluessel = Array.isArray(j) ? [`[${j.length}]`] : Object.keys(j).slice(0, 25); } catch { s.jsonKaputt = true; }
  }
  return s;
}

const kurzname = url => String(url).replace(/^https?:\/\//, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
function endung(typ, text) {
  const t = String(typ || '').toLowerCase();
  if (t.includes('json')) return 'json';
  if (/xml|rss|atom/.test(t)) return 'xml';
  if (t.includes('html')) return 'html';
  const s = String(text || '').trimStart().slice(0, 200);
  if (/^[[{]/.test(s)) return 'json';
  if (/^<\?xml|^<rss|^<feed/i.test(s)) return 'xml';
  if (s.startsWith('<')) return 'html';
  return 'txt';
}

async function leseGedeckelt(r, max) {
  if (!r.body || typeof r.body.getReader !== 'function') {
    const buf = Buffer.from(await r.arrayBuffer());
    return { buf: buf.subarray(0, max), bytes: buf.length, gekuerzt: buf.length > max };
  }
  const reader = r.body.getReader();
  const teile = []; let n = 0, gekuerzt = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    teile.push(Buffer.from(value)); n += value.length;
    if (n > max) { gekuerzt = true; try { await reader.cancel(); } catch {} break; }
  }
  const buf = Buffer.concat(teile);
  return { buf: buf.subarray(0, max), bytes: gekuerzt ? null : buf.length, gekuerzt };
}

// ---------- Sonde ----------
export function macheSonde({ out, fetchImpl = globalThis.fetch, jetzt = () => Date.now(), warte = ms => new Promise(r => setTimeout(r, ms)) }) {
  mkdirSync(join(out, 'quellen'), { recursive: true });
  const abrufe = [];
  const robots = new Map();          // host -> {status, gruppen, fehler}
  const hostAbstand = new Map();     // host -> ms (Crawl-delay)
  const hostLetzter = new Map();
  let letzter = 0;

  async function takt(host) {
    const abstand = Math.max(MIN_ABSTAND_MS, hostAbstand.get(host) || 0);
    const bis = Math.max(letzter + MIN_ABSTAND_MS, (hostLetzter.get(host) || 0) + abstand);
    const w = bis - jetzt();
    if (w > 0) await warte(w);
    letzter = jetzt(); hostLetzter.set(host, letzter);
  }

  async function roh(url, { quelle, produkt = null, zweck = '', headers = {} } = {}) {
    const u = new URL(url);
    await takt(u.host);
    const nr = abrufe.length + 1;
    const e = { nr, quelle, produkt, zweck, url: String(url), status: null, statusText: '', endUrl: null, umgeleitet: false,
      ms: null, typ: '', headers: null, bytes: 0, gekuerzt: false, datei: null, fehler: null, signale: null };
    const t0 = jetzt();
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    let text = '';
    try {
      const r = await fetchImpl(url, { redirect: 'follow', signal: ctl.signal,
        headers: { 'user-agent': UA, 'accept-language': 'de-DE,de;q=0.9', accept: 'text/html,application/json,application/xml;q=0.9,*/*;q=0.8', ...headers } });
      e.status = r.status; e.statusText = r.statusText || '';
      e.endUrl = r.url || null; e.umgeleitet = !!r.redirected;
      e.headers = Object.fromEntries(r.headers?.entries ? [...r.headers.entries()] : []);
      e.typ = r.headers?.get?.('content-type') || '';
      const { buf, bytes, gekuerzt } = await leseGedeckelt(r, MAX_BYTES);
      e.bytes = bytes; e.gekuerzt = gekuerzt;
      text = buf.toString('utf8');
      if (buf.length) {
        e.datei = `quellen/${String(nr).padStart(3, '0')}-${kurzname(url)}.${endung(e.typ, text)}`;
        writeFileSync(join(out, e.datei), buf);
      }
      e.signale = signale(text, e.typ);
    } catch (err) {
      e.fehler = err?.name === 'AbortError' ? `Zeitüberschreitung (${TIMEOUT_MS} ms)` : String(err?.cause?.code || err?.message || err);
    } finally { clearTimeout(timer); e.ms = jetzt() - t0; }
    abrufe.push(e);
    console.log(`${String(nr).padStart(3)} ${e.status ?? 'ERR'} ${quelle} ${url}${e.fehler ? ' – ' + e.fehler : ''}${e.signale?.block ? ' – BLOCK? ' + e.signale.block : ''}`);
    return { e, text, ok: e.status >= 200 && e.status < 300 };
  }

  async function robotsFuer(host, quelle) {
    if (robots.has(host)) return robots.get(host);
    const { e, text } = await roh(`https://${host}/robots.txt`, { quelle, zweck: 'robots.txt' });
    let info;
    if (e.status >= 200 && e.status < 300 && !/<html/i.test(text.slice(0, 500))) info = { status: e.status, gruppen: parseRobots(text) };
    else if (e.status >= 200 && e.status < 300) info = { status: e.status, gruppen: [], hinweis: 'robots.txt ist HTML (keine Regeln lesbar) – wie „keine Regeln“ behandelt' };
    else if (e.status >= 400 && e.status < 500) info = { status: e.status, gruppen: [], hinweis: 'robots.txt fehlt (4xx) – laut RFC 9309 keine Einschränkung' };
    else info = { status: e.status, gruppen: null, fehler: e.fehler || `HTTP ${e.status}`, hinweis: 'robots.txt nicht erreichbar – laut RFC 9309 alles als verboten behandelt' };
    if (info.gruppen) {
      const cd = robotsEntscheid(info.gruppen, '/').crawlDelay;
      if (cd) hostAbstand.set(host, Math.min(cd, 30) * 1000);
      info.crawlDelay = cd;
    }
    robots.set(host, info);
    return info;
  }

  /** Abruf nur, wenn robots.txt es erlaubt. Sonst ein Eintrag „übersprungen“. */
  async function hole(url, opts = {}) {
    const u = new URL(url);
    const info = await robotsFuer(u.host, opts.quelle);
    const pfad = u.pathname + u.search;
    const ent = info.gruppen ? robotsEntscheid(info.gruppen, pfad) : { erlaubt: false, regel: 'robots.txt nicht erreichbar', gruppe: null };
    if (!ent.erlaubt) {
      const e = { nr: abrufe.length + 1, quelle: opts.quelle, produkt: opts.produkt ?? null, zweck: opts.zweck || '', url: String(url),
        status: null, uebersprungen: `robots.txt (${ent.gruppe || '-'}): ${ent.regel}`, datei: null };
      abrufe.push(e);
      console.log(`${String(e.nr).padStart(3)} --- ${opts.quelle} ${url} – übersprungen: ${e.uebersprungen}`);
      return { e, text: '', ok: false, uebersprungen: true };
    }
    const r = await roh(url, opts);
    r.e.robots = ent.regel ? `${ent.gruppe}: ${ent.regel}` : `${ent.gruppe}: keine Regel`;
    return r;
  }

  /** Erste erfolgreiche URL einer Kette (z. B. verschiedene Schreibweisen eines Slugs). */
  async function ersteVon(urls, opts) {
    let letzte = null;
    for (const url of urls) { letzte = await hole(url, opts); if (letzte.ok) return letzte; }
    return letzte;
  }

  function abschluss(extra = {}) {
    const proQuelle = {};
    for (const a of abrufe) {
      const q = proQuelle[a.quelle] ||= { anfragen: 0, uebersprungen: 0, status: {}, fehler: 0, block: 0 };
      if (a.uebersprungen) { q.uebersprungen++; continue; }
      q.anfragen++;
      if (a.fehler) q.fehler++;
      if (a.status != null) q.status[a.status] = (q.status[a.status] || 0) + 1;
      if (a.signale?.block) q.block++;
    }
    const robotsInfo = Object.fromEntries([...robots].map(([h, i]) => [h, { status: i.status, crawlDelay: i.crawlDelay ?? null, hinweis: i.hinweis || null,
      gruppen: (i.gruppen || []).filter(g => g.agents.includes('*') || g.agents.some(a => UA_TOKEN.includes(a))).map(g => ({ agents: g.agents, regeln: g.regeln.length })) }]));
    const info = { projekt: 'preis-sonde', ua: UA, erstellt: new Date().toISOString(), lauf: process.env.GITHUB_RUN_ID || null,
      maxBytesProDatei: MAX_BYTES, minAbstandMs: MIN_ABSTAND_MS, ...extra, proQuelle, robots: robotsInfo, abrufe };
    writeFileSync(join(out, 'index.json'), JSON.stringify(info, null, 1) + '\n');
    return info;
  }

  return { hole, roh, ersteVon, robotsFuer, abschluss, abrufe };
}

// ---------- Was geprüft wird ----------
export const PRODUKTE = [
  { id: 'knoppers-schnitte', name: 'Knoppers Schnitte', mg: 'Knoppers', off: 'knoppers', op: { name: 'noppers' } },
  { id: 'crunchips', name: 'Lorenz Crunchips', mg: 'Crunchips', off: 'lorenz crunchips', op: { name: 'runchips' } },
  { id: 'ben-jerrys', name: "Ben & Jerry's 465 ml", mg: "Ben & Jerry's", off: 'ben jerry 465', op: { marke: 'jerry' } },
  // EAN 4001686721483 = Haribo Color-Rado (laut rossmann.de/…/p/4001686721483)
  { id: 'haribo-colorado', name: 'Haribo Colorado (XXL)', mg: 'Haribo Colorado', off: 'haribo color-rado', op: { name: 'olor', marke: 'aribo' }, ean: ['4001686721483'] },
];

// Aus den Scanner-Daten vom 31.10.2026: Preisfehler-Feed (Zotac, steht in technik[] der Produktionsdaten)
// und mydealz „heiß“ (WD Elements, Modellnummer eindeutig; geizhals-ID aus geizhals.at a3524924).
export const TECHNIK = [
  { id: 'zotac-rtx-5070-twin-edge-oc', name: 'Zotac Gaming GeForce RTX 5070 Twin Edge OC 12GB', suche: 'zotac rtx 5070 twin edge oc',
    mydealz: 'https://www.mydealz.de/deals/zotac-gaming-geforce-rtx-5070-twin-edge-oc-nvidia-grafikkarte-12gb-2852994' },
  { id: 'wd-elements-6tb', name: 'WD Elements Portable 6 TB (WDBNEF0060BBK-EESN)', suche: 'WDBNEF0060BBK-EESN', geizhals: 3524924,
    mydealz: 'https://www.mydealz.de/deals/wd-elements-portable-6-tb-externe-25-festplatte-wdbnef0060bbk-eesn-usb-30-2862243' },
];

const enc = encodeURIComponent;

export async function sonde({ out, env = process.env, fetchImpl, warte }) {
  const s = macheSonde({ out, fetchImpl, warte });
  const notizen = [];

  // 1) marktguru (bisherige Quelle): gibt es oldPrice? Döbeln und zum Vergleich Berlin-Mitte
  {
    const q = 'marktguru';
    const start = await s.hole('https://www.marktguru.de/', { quelle: q, zweck: 'Startseite (API-Schlüssel der Web-App)' });
    const api = start.text.match(/"apiKey"\s*:\s*"([^"]+)"/), client = start.text.match(/"clientKey"\s*:\s*"([^"]+)"/);
    if (api && client) {
      const h = { 'x-apikey': api[1], 'x-clientkey': client[1], accept: 'application/json' };
      for (const p of PRODUKTE) await s.hole(`https://api.marktguru.de/api/v1/offers/search?as=web&limit=48&offset=0&q=${enc(p.mg)}&zipCode=04720`, { quelle: q, produkt: p.id, zweck: 'Angebote Döbeln', headers: h });
      await s.hole(`https://api.marktguru.de/api/v1/offers/search?as=web&limit=48&offset=0&q=${enc('Knoppers')}&zipCode=10115`, { quelle: q, produkt: 'knoppers-schnitte', zweck: 'Vergleich Berlin 10115: oldPrice dort gefüllt?', headers: h });
    } else notizen.push('marktguru: Schlüssel nicht auf der Startseite gefunden');
  }

  // 2) prospektangebote.de – Abschnitt „Preisverlauf“
  {
    const q = 'prospektangebote.de', b = 'https://www.prospektangebote.de';
    const ketten = {
      'knoppers-schnitte': ['/angebote/knoppers'],
      'crunchips': ['/angebote/crunchips', '/angebote/lorenz-crunchips'],
      'ben-jerrys': ['/angebote/ben-jerry-s', '/angebote/ben-jerrys'],
      'haribo-colorado': ['/angebote/haribo-color-rado', '/angebote/haribo-colorado', '/angebote/haribo'],
    };
    for (const p of PRODUKTE) await s.ersteVon(ketten[p.id].map(x => b + x), { quelle: q, produkt: p.id, zweck: 'Produktseite mit Preisverlauf' });
    await s.hole(`${b}/geschaefte/kaufland/angebote/haribo-phantasia-oder-color-rado-1kg-angebot-331098/`, { quelle: q, produkt: 'haribo-colorado', zweck: 'altes Einzelangebot (Archiv 2021?)' });
  }

  // 3) supermarktcheck.de – Regalpreise je Kette (Nutzermeldungen)
  {
    const q = 'supermarktcheck.de', b = 'https://www.supermarktcheck.de';
    const seiten = {
      'knoppers-schnitte': '/product/12061-storck-knoppers-milch-haselnuss-schnitte-',
      'crunchips': '/product/435077-lorenz-crunchips-',
      'ben-jerrys': '/product/78546-ben-jerrys-ice-cream',
    };
    let ersteSeite = '';
    for (const [id, pfad] of Object.entries(seiten)) {
      const r = await s.hole(b + pfad, { quelle: q, produkt: id, zweck: 'Produktseite (Regalpreise, Angebote, Inflations-Check)' });
      if (!ersteSeite && r.ok) ersteSeite = r.text;
    }
    // Haribo Colorado: ID unbekannt -> Suchformular der Seite benutzen (falls robots.txt es erlaubt)
    const form = [...ersteSeite.matchAll(/<form[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/form>/gi)]
      .map(m => ({ action: m[1], name: (m[2].match(/<input[^>]*name="([^"]+)"[^>]*(?:type="(?:search|text)")?/i) || [])[1] }))
      .find(f => /such|search/i.test(f.action) && f.name);
    if (form) {
      const url = new URL(form.action, b); url.searchParams.set(form.name, 'Haribo Colorado');
      const r = await s.hole(url.href, { quelle: q, produkt: 'haribo-colorado', zweck: `Suche (Formular ${form.action}?${form.name}=)` });
      const link = r.ok && (r.text.match(/href="(\/product\/\d+-[^"]*colo[^"]*)"/i) || [])[1];
      if (link) await s.hole(b + link, { quelle: q, produkt: 'haribo-colorado', zweck: 'Produktseite aus der Suche' });
      else notizen.push('supermarktcheck: kein Haribo-Colorado-Produkt in der Suche gefunden');
    } else notizen.push('supermarktcheck: kein Suchformular gefunden');
    await s.hole(`${b}/netto-marken-discount/doebeln/`, { quelle: q, zweck: 'Marktseite Döbeln (Netto MD)' });
  }

  // 4) discounto.de
  {
    const q = 'discounto.de', b = 'https://www.discounto.de';
    const marke = { 'knoppers-schnitte': ['Knoppers'], 'crunchips': ['Lorenz', 'Crunchips'], 'ben-jerrys': ['Ben-Jerrys', 'Ben-und-Jerrys'], 'haribo-colorado': ['Haribo'] };
    for (const p of PRODUKTE) await s.ersteVon(marke[p.id].map(m => `${b}/Aktuelle-Angebote/${m}/`), { quelle: q, produkt: p.id, zweck: 'Markenseite (Angebote, „statt“)' });
  }

  // 5) kaufDA (Bonial)
  {
    const q = 'kaufda.de', b = 'https://www.kaufda.de';
    await s.hole(`${b}/Angebote/Knoppers`, { quelle: q, produkt: 'knoppers-schnitte', zweck: 'Angebote bundesweit' });
    await s.hole(`${b}/Doebeln/Angebote/Knoppers`, { quelle: q, produkt: 'knoppers-schnitte', zweck: 'Angebote Döbeln' });
    await s.hole(`${b}/Angebote/Haribo`, { quelle: q, produkt: 'haribo-colorado', zweck: 'Angebote bundesweit' });
  }

  // 6) mydealz – vergangene Deals als Preisverlauf?
  {
    const q = 'mydealz.de', b = 'https://www.mydealz.de';
    await s.hole(`${b}/gruppe/knoppers`, { quelle: q, produkt: 'knoppers-schnitte', zweck: 'Gruppenseite (vergangene Deals)' });
    await s.hole(`${b}/rss/gruppe/knoppers`, { quelle: q, produkt: 'knoppers-schnitte', zweck: 'Gruppen-RSS' });
    await s.hole(`${b}/search?q=crunchips`, { quelle: q, produkt: 'crunchips', zweck: 'Suche (HTML)' });
    await s.hole(`${b}/search?q=${enc(TECHNIK[0].suche)}`, { quelle: q, produkt: TECHNIK[0].id, zweck: 'Suche (HTML)' });
    await s.hole(TECHNIK[1].mydealz, { quelle: q, produkt: TECHNIK[1].id, zweck: 'Deal-Seite (nextBestPrice = Vergleichspreis)' });
  }

  // 7) Open Food Facts + Open Prices (offene API, ODbL)
  {
    const codes = new Map(); // produkt -> Set
    for (const p of PRODUKTE) {
      const set = new Set(p.ean || []); codes.set(p.id, set);
      const r = await s.hole(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${enc(p.off)}&search_simple=1&action=process&json=1&page_size=10&sort_by=unique_scans_n&fields=code,product_name,brands,quantity,countries_tags,unique_scans_n`,
        { quelle: 'openfoodfacts.org', produkt: p.id, zweck: 'EANs finden (Produktsuche)' });
      try { for (const x of JSON.parse(r.text).products || []) if (x.code && set.size < 4 && (x.countries_tags || []).includes('en:germany')) set.add(x.code); } catch {}
    }
    const op = 'https://prices.openfoodfacts.org/api/v1';
    for (const p of PRODUKTE) {
      const f = new URLSearchParams({ price_count__gte: '1', order_by: '-price_count', size: '10' });
      if (p.op.name) { f.set('product_name__ilike', p.op.name); f.set('product_name__like', p.op.name); }
      if (p.op.marke) { f.set('brands__ilike', p.op.marke); f.set('brands__like', p.op.marke); }
      const r = await s.hole(`${op}/products?${f}`, { quelle: 'open-prices', produkt: p.id, zweck: 'Produkte mit Preisen' });
      try {
        const set = codes.get(p.id);
        const treffer = (JSON.parse(r.text).items || []).filter(x => x.code && (x.price_count || 0) > 0);
        // nur übernehmen, wenn der Filter offensichtlich gegriffen hat
        const term = (p.op.name || p.op.marke).toLowerCase();
        for (const x of treffer) if (`${x.product_name || ''} ${x.brands || ''}`.toLowerCase().includes(term)) set.add(x.code);
      } catch {}
    }
    for (const p of PRODUKTE) {
      for (const code of [...codes.get(p.id)].slice(0, 3))
        await s.hole(`${op}/prices?product_code=${code}&size=50&order_by=-date`, { quelle: 'open-prices', produkt: p.id, zweck: `Preise für EAN ${code}` });
    }
    await s.hole(`${op}/locations?osm_address_city__like=D%C3%B6beln&size=50`, { quelle: 'open-prices', zweck: 'Orte in Döbeln' });
  }

  // 8) Keepa (Amazon) – nur wenn ein Schlüssel hinterlegt ist; diese Sonde bekommt keinen Schlüssel, nur die Info
  notizen.push(`Keepa: Secret KEEPA_KEY ${env.KEEPA_GESETZT === 'true' ? 'IST gesetzt' : 'ist NICHT gesetzt'} (die Sonde fragt Keepa nicht ab; ohne Schlüssel liefert die API nichts)`);

  // 9) geizhals.de – Technik-Preisverlauf
  {
    const q = 'geizhals.de', b = 'https://geizhals.de';
    for (const t of TECHNIK) {
      let id = t.geizhals || null;
      if (!id) {
        const r = await s.hole(`${b}/?fs=${enc(t.suche)}`, { quelle: q, produkt: t.id, zweck: 'Suche (ID finden)' });
        id = r.ok ? +((r.text.match(/href="[^"]*?-a(\d{5,})\.html"[^>]*>[^<]*twin edge/i) || r.text.match(/-a(\d{5,})\.html/) || [])[1] || 0) || null : null;
      }
      if (id) {
        await s.hole(`${b}/a${id}.html`, { quelle: q, produkt: t.id, zweck: 'Produktseite' });
        await s.hole(`${b}/?phist=${id}`, { quelle: q, produkt: t.id, zweck: 'Preisverlauf' });
      } else notizen.push(`geizhals: keine ID für ${t.name}`);
    }
  }

  // 10) Seiten, deren Bedingungen automatisches Auslesen ausschließen: nur robots.txt (zur Dokumentation)
  for (const [host, quelle] of [['www.amazon.de', 'amazon.de'], ['de.camelcamelcamel.com', 'camelcamelcamel'], ['www.idealo.de', 'idealo.de'], ['api.keepa.com', 'keepa']])
    await s.robotsFuer(host, quelle);

  // 11) heisse-preise.io (Österreich-Schwerpunkt) – nur Startseite
  await s.hole('https://heisse-preise.io/', { quelle: 'heisse-preise.io', zweck: 'Startseite (noch aktiv?)' });

  return s.abschluss({ notizen, produkte: PRODUKTE.map(p => p.id), technik: TECHNIK.map(t => t.id) });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--out');
  const out = (i >= 0 && process.argv[i + 1]) || 'sonde-out';
  const info = await sonde({ out });
  console.log(JSON.stringify(info.proQuelle, null, 1));
  console.log(info.notizen.join('\n'));
}
