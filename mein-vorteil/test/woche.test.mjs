// Reiter „Woche“ (woche.js, Wochen-Knaller je Markt, 16.11.2026) und Produktbilder bei den Gesuchen/Snacks: statische Prüfungen
// und Browser-Tests mit test/fixtures/knaller.json (Penny/Netto/Lidl = echte gekürzte kaufDA-Angebote aus den Mitschnitten,
// Einträge mit „TESTWERT“ erfunden). Fotos (hoch 428×926 und quer 926×428, Gerätefaktor 2) nach $MV_SHOTS/woche/, sonst ins
// Temp-Verzeichnis – keine Bilder im Repo. Produktbilder kommen im Test als gezeichnete Platzhalter (kein echtes Netz).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import vm from 'node:vm';

const HIER = dirname(fileURLToPath(import.meta.url));
const MV = join(HIER, '..');
const WURZEL = join(MV, '..');
const FIX = join(HIER, 'fixtures');
const FOTOS = join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'woche');
const JETZT = '2026-11-10T11:00:00Z'; // Di 10.11.2026, 12:00 Berliner Zeit; Daten von 10:05
const JETZT_DEALS = '2026-10-31T16:35:00Z'; // Stand der Vertrags-Daten (Deals mit Snack-Bildern)
const PFAD = 'vorteile-daten/vorteile/data/knaller.json';
const FIL_PFAD = 'vorteile-daten/vorteile/data/filialen.json';
const KNALLER = JSON.parse(readFileSync(join(FIX, 'knaller.json'), 'utf8'));
const plain = x => JSON.parse(JSON.stringify(x));
const nbsp = s => s.replace(/[  ]/g, ' ');

function modul() {
  const ctx = { window: {}, localStorage: { getItem: () => null, setItem: () => {} }, Intl, Date, console };
  vm.runInNewContext(readFileSync(join(MV, 'woche.js'), 'utf8'), ctx);
  return ctx.window.MeinVorteilWoche;
}

// --- statisch ------------------------------------------------------------------------------------------------------------
test('Prüfer 16.11.: Wochenende = Mo 00:00:00.000 Berlin, auch mit Sekunden/Millisekunden und bei Zeitumstellung', () => {
  const I = modul()._intern;
  const iso = t => new Date(I.wochenEnde(Date.parse(t))).toISOString();
  // echte Uhr hat Sekunden: vorher lag das Ende bei Mo 00:00:00.500 -> „LIDL LOHNT SICH ab Mo 23.11.“ stand unter „diese Woche“
  assert.equal(iso('2026-11-16T08:30:00.500Z'), '2026-11-22T23:00:00.000Z');
  assert.equal(iso('2026-11-19T15:12:34.567Z'), '2026-11-22T23:00:00.000Z');
  assert.equal(iso('2026-11-22T22:59:59.999Z'), '2026-11-22T23:00:00.000Z', 'So 23:59:59 Berlin');
  assert.equal(iso('2026-11-22T23:00:00.000Z'), '2026-11-29T23:00:00.000Z', 'Mo 00:00 Berlin = neue Woche');
  assert.equal(iso('2026-10-25T21:00:00.000Z'), '2026-10-25T23:00:00.000Z', 'So der Umstellung auf Winterzeit');
  assert.equal(iso('2027-03-28T20:00:00.000Z'), '2027-03-28T22:00:00.000Z', 'So der Umstellung auf Sommerzeit');
  // Seite: ein Angebot ab Mo 23.11. 00:00 ist „Ab Montag“, nicht „Kommt diese Woche“ (Uhr mit Millisekunden)
  const jetzt = Date.parse('2026-11-16T08:30:00.500Z');
  const n = I.normalisiere({ angebote: [
    { id: 'a', markt: 'lidl', titel: 'FUNNY-FRISCH Chipsfrisch XXL', preis: 1.79, vorher: 2.99, vorherArt: 'uvp', gueltigAb: '2026-11-22T23:00:00.000Z', gueltigBis: '2026-11-28T22:00:00.000Z' },
    { id: 'b', markt: 'lidl', titel: 'PEPSI', preis: 0.99, vorher: 1.79, vorherArt: 'uvp', gueltigAb: '2026-11-18T23:00:00.000Z', gueltigBis: '2026-11-21T22:00:00.000Z' },
  ] }, jetzt);
  const ende = I.wochenEnde(jetzt);
  assert.deepEqual(plain(n.angebote.filter(a => a.ab < ende).map(a => a.id)), ['b']);
  assert.deepEqual(plain(n.angebote.filter(a => a.ab >= ende).map(a => a.id)), ['a']);
});

test('Prüfer 16.11.: Merkliste in Teilen ≤ 3500 Byte (ntfy.sh nimmt 4096), wieder zusammengesetzt vollständig', () => {
  const I = modul()._intern;
  const lang = i => ({ id: `kd:${String(i).padStart(4, '0')}-6c21c979-269e-4bc0-b537-5bbb1a51b90e`, titel: `Lorenz Crunchips Paprika XXL Familienpackung Sorte ${i} – äöü – mit langem Namen bis 90 Zeichen`, markt: 'aldi-nord', preis: 0.99, vorher: 1.99, pct: 50, ab: '2026-11-15T23:00:00.000Z', bis: '2026-11-21T21:00:00.000Z' });
  for (const n of [0, 1, 20, 25, 60]) {
    const liste = Array.from({ length: n }, (_, i) => lang(i));
    const teile = plain([...I.merkTeile(liste, 'satz1')].map(t => JSON.parse(t)));
    for (const t of I.merkTeile(liste, 'satz1')) assert.ok(new TextEncoder().encode(t).length <= I.MERK_BYTES, `Teil ${new TextEncoder().encode(t).length} Byte`);
    assert.ok(teile.every((t, i) => t.v === 1 && t.satz === 'satz1' && t.teil === i + 1 && t.von === teile.length));
    assert.deepEqual(teile.flatMap(t => t.merken).map(x => x.id), liste.map(x => x.id), `${n} Einträge`);
    if (n === 60) assert.ok(teile.length >= 3, `${teile.length} Teile`);
    if (n === 0) assert.equal(teile.length, 1, 'leere Liste = eine Nachricht (alles vergessen)');
  }
});

test('woche.js Fuß: Prospekt für Döbeln, Märkte aus Nachbarstadt/bundesweit sichtbar genannt, kein Markt in der Nähe', () => {
  const I = modul()._intern;
  const jetzt = Date.parse(JETZT);
  const daten = standort => ({ ...plain(KNALLER), standort, ort: 'Döbeln', maerkte: {
    kaufland: { name: 'Kaufland', ort: 'Döbeln', anzahl: 2 }, lidl: { name: 'Lidl', ort: 'Leipzig', anzahl: 1 },
    penny: { name: 'Penny', ort: 'bundesweit (Berlin)', anzahl: 1 }, marktkauf: { name: 'Marktkauf', keinMarkt: true, anzahl: 0 } } });
  const n = I.normalisiere(daten('Döbeln/Leipzig/bundesweit'), jetzt);
  assert.deepEqual(plain(n.maerkte.filter(m => ['lidl', 'marktkauf'].includes(m.id)).map(m => [m.id, m.ort, m.keinMarkt])), [['lidl', 'Leipzig', false], ['marktkauf', '', true]]);
  const text = nbsp(I.fuss(n).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  assert.match(text, /Prospekte Döbeln\/Leipzig\/bundesweit von kaufDA – ob es das in Döbeln gibt/);
  assert.match(text, /Nicht aus dem Prospekt für Döbeln: Lidl \(Leipzig\), Penny \(bundesweit \(Berlin\)\) – im Markt oder in der App prüfen\./);
  assert.match(text, /Kein Markt in der Nähe: Marktkauf\./);
  // alles aus dem Döbelner Prospekt -> kein „in Döbeln prüfen“
  const nur = I.normalisiere({ ...daten('Döbeln'), maerkte: { kaufland: { name: 'Kaufland', ort: 'Döbeln' } } }, jetzt);
  const t2 = nbsp(I.fuss(nur).replace(/<[^>]+>/g, ' '));
  assert.match(t2, /Prospekte für Döbeln von kaufDA/);
  assert.doesNotMatch(t2, /Nicht aus dem Prospekt|in Döbeln gibt/);
});

test('woche.js liest tolerant: ohne Vergleichspreis kein Knaller, % selbst nachgerechnet, nur https, abgelaufen raus', () => {
  const I = modul()._intern;
  const jetzt = Date.parse(JETZT);
  const n = plain(I.normalisiere({
    aktualisiert: '2026-11-10T09:05:00Z', standort: 'Chemnitz',
    maerkte: { penny: { name: 'Penny', link: 'https://www.kaufda.de/Geschaefte/Penny-Markt' }, kaputt: 'x', 'B Ö S E': {} },
    angebote: [
      { id: 'a', markt: 'penny', titel: 'Knoppers', preis: 1.99, vorher: 2.99, vorherArt: 'uvp', pct: 99, bild: 'https://content-media.bonial.biz/a.jpg', link: 'https://www.kaufda.de/x', gueltigBis: '2026-11-14T22:59:00Z' },
      { id: 'b', markt: 'penny', titel: 'ohne Vergleich', preis: 1.99, vorher: null, pct: 50 },
      { id: 'c', markt: 'penny', titel: 'abgelaufen', preis: 1, vorher: 3, gueltigBis: '2026-11-07T22:59:00Z' },
      { id: 'd', markt: 'penny', titel: '  ', preis: 1, vorher: 3 },
      { id: 'e', markt: '<script>', titel: 'böser Markt', preis: 1, vorher: 3 },
      { id: 'f', markt: 'lidl', titel: 'Haribo', preis: '0,99', vorher: '1,49', vorherArt: 'streich', bild: 'http://unsicher/b.jpg', link: 'javascript:alert(1)', gueltigAb: '2026-11-15T23:00:00Z' },
      null, 'Quatsch',
      { id: 'a', markt: 'penny', titel: 'doppelt', preis: 1, vorher: 9 },
    ],
  }, jetzt));
  // 0,99 statt 1,49 = 33,6 % -> 33 (abgerundet wie der Radar); 1,99 statt 2,99 = 33,4 % -> 33
  assert.deepEqual(n.angebote.map(a => [a.id, a.pct, a.art]), [['f', 33, 'streich'], ['a', 33, 'uvp']]);
  assert.equal(n.angebote[1].bild, 'https://content-media.bonial.biz/a.jpg');
  assert.equal(n.angebote[0].bild, null, 'kein http-Bild');
  assert.equal(n.angebote[0].link, null, 'kein javascript:-Link');
  assert.ok(n.angebote[0].ab > jetzt, 'beginnt später');
  assert.ok(n.maerkte.some(m => m.id === 'lidl') && !n.maerkte.some(m => /[^a-z0-9-]/.test(m.id)));
  // Datei ohne alles: kein Absturz
  assert.deepEqual(plain(I.normalisiere(null, jetzt)).angebote, []);
  assert.deepEqual(plain(I.normalisiere({ angebote: 'kaputt', maerkte: [] }, jetzt)).angebote, []);
});

test('Prüfer 16.11.: Art fehlt -> „unbekannt“ (grau, ohne „UVP“), Rabatt abgerundet, Ende 00:00 (Penny) zählt zum Vortag', () => {
  const I = modul()._intern;
  const jetzt = Date.parse(JETZT);
  const n = plain(I.normalisiere({ angebote: [
    { id: 'u', markt: 'rewe', titel: 'Ohne Art', preis: 1.41, vorher: 2.0, gueltigBis: '2026-11-14T22:59:00Z' },
    { id: 'p', markt: 'penny', titel: 'Penny bis Samstag', preis: 1, vorher: 2, vorherArt: 'uvp', gueltigBis: '2026-11-14T23:00:00Z' },
  ] }, jetzt));
  const u = n.angebote.find(a => a.id === 'u'), p = n.angebote.find(a => a.id === 'p');
  assert.equal(u.art, 'unbekannt');
  assert.equal(u.pct, 29, '29,5 % ist nicht „ab 30 %“');
  const ku = I.kachel(u), kp = I.kachel(p);
  assert.ok(!/wo-streich/.test(ku) && /wo-pct wo-uvp/.test(ku) && !/ UVP</.test(ku), ku);
  assert.ok(/ UVP</.test(kp));
  assert.match(nbsp(kp), /bis Sa 14\.11\./, 'Penny: 23:00 UTC = 00:00 Sonntag -> noch Samstag');
  assert.ok(!/bis So/.test(kp));
  // Bildfeld: fest quadratisch, Bild absolut darin (Hochformat-Fotos sprengen die Kachel nicht)
  assert.match(I.CSS(), /\.wo-bildfeld \{[^}]*aspect-ratio: 1 \/ 1;[^}]*overflow: hidden/);
  assert.match(I.CSS(), /\.wo-bild \{[^}]*position: absolute; inset: 0;/);
});

test('Haken: Leiste (Woche nach Deals), eigene Seite, Skript erst beim Öffnen, Kachel aus status.knaller.kurz, sw.js', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  assert.match(html, /<a href="#woche" data-reiter="woche" class="f-woche"><svg class="ic" aria-hidden="true"><use href="#ic-woche"\/><\/svg><span class="t">Woche<\/span><span class="n"><\/span><\/a>/);
  assert.match(html, /<section id="p-woche" class="reiter-seite breite f-woche" aria-labelledby="h-woche" hidden>/);
  assert.match(html, /<symbol id="ic-woche" viewBox="0 0 24 24">/);
  assert.doesNotMatch(html, /<script[^>]+src="woche\.js"/, 'kein festes Skript-Tag');
  assert.match(html, /wocheSkript\.src = 'woche\.js'/);
  assert.match(html, /REITER_START\.woche = starteWoche;/);
  assert.doesNotMatch(html, /['"`][^'"`\s]*knaller\.json/, 'die Startseite holt knaller.json nie selbst (lazy)');
  assert.match(html, /status\?\.knaller\?\.kurz/);
  assert.match(html, /<a href="#woche" data-sprung="woche">Wochen-Knaller je Markt ab 30 % ›<\/a>/, 'Link aus Deals');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /const CACHE = 'mein-vorteil-6'/);
  assert.match(sw, /rest === 'woche\.js'/);
  assert.match(sw, /'essen\.js', 'woche\.js'/);
  assert.doesNotMatch(sw, /knaller\.json'/, 'Daten nicht im Worker');
  const js = readFileSync(join(MV, 'woche.js'), 'utf8');
  assert.match(js, /raw\.githubusercontent\.com\/XanderFoxy\/Synquenzer\/vorteile-daten\/vorteile\/data\/knaller\.json/);
  assert.match(js, /const CACHE = 'mv-woche'/, 'eigener Cache, den der Worker nicht löscht (nicht „mein-vorteil-…“)');
  assert.doesNotMatch(js, /https?:\/\/(?!raw\.githubusercontent)[^'"`\s]*\.(js|css)\b|googletagmanager|analytics|gtag\(|<script/i, 'keine fremden Skripte');
  assert.doesNotMatch(js, /\p{Extended_Pictographic}/u, 'keine Emojis als Grafik');
  assert.match(readFileSync(join(MV, 'README.md'), 'utf8'), /Reiter „Woche“/);
});

// --- Browser ---------------------------------------------------------------------------------------------------------------
let pw = null;
try { pw = createRequire(import.meta.url)('playwright'); } catch { /* nicht installiert */ }
const ohnePw = pw ? false : 'Playwright nicht installiert';
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server, basis, browser;
before(async () => {
  if (!pw) return;
  server = createServer(async (rq, rs) => {
    let pfad = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (pfad.endsWith('/')) pfad += 'index.html';
    const datei = normalize(join(WURZEL, pfad));
    if (!datei.startsWith(WURZEL)) { rs.writeHead(403); rs.end(); return; }
    try { const inhalt = await readFile(datei); rs.writeHead(200, { 'content-type': TYP[extname(datei)] || 'application/octet-stream', 'cache-control': 'no-cache' }); rs.end(inhalt); }
    catch { rs.writeHead(404); rs.end('nicht gefunden'); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  basis = `http://localhost:${server.address().port}`;
  browser = await pw.chromium.launch();
  await mkdir(FOTOS, { recursive: true });
});
after(async () => { await browser?.close(); await new Promise(r => (server ? server.close(r) : r())); });

const DATEI = {
  'schnaeppchen-daten/schnaeppchen/data/current.json': 'schnaeppchen-current.json',
  'vorteile-daten/vorteile/data/aktuell.json': 'vorteile-aktuell.json',
  'konzerte-daten/konzerte/data/konzerte.json': 'konzerte-konzerte.json',
  'konzerte-daten/konzerte/data/releases.json': 'konzerte-releases.json',
  'konzerte-daten/konzerte/data/status.json': 'konzerte-status.json',
};
// Produktbild-Ersatz (Prospekt-Ausschnitt): heller Grund, farbige Packung mit Namen – kommt absichtlich spät (Layout-Sprung?)
const titelZuBild = new Map(KNALLER.angebote.filter(a => a.bild).map(a => [a.bild, a.titel]));
function produktBild(url) {
  // echte Prospekt-Ausschnitte haben jedes Format (Flasche hoch, Mehrfachpack quer) – zwei Fixture-Bilder sind darum 1:3 bzw. 3:1
  if (/hochformat/.test(url)) return '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="600"><rect width="200" height="600" fill="#2a6"/></svg>';
  if (/querformat/.test(url)) return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><rect width="600" height="200" fill="#a62"/></svg>';
  let x = 7; for (const c of url) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  const h = x % 360;
  const t = (titelZuBild.get(url) || url.split('/').slice(-3, -2)[0] || '?').replace(/\(TESTWERT\)/, '').trim();
  const w = t.split(/\s+/).slice(0, 2);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#fff"/><rect x="60" y="40" width="180" height="220" rx="18" fill="hsl(${h},70%,48%)"/><rect x="60" y="40" width="180" height="70" rx="18" fill="hsl(${(h + 30) % 360},80%,35%)"/>`
    + w.map((s, i) => `<text x="150" y="${150 + i * 40}" font-family="sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">${esc(s.slice(0, 11))}</text>`).join('') + '</svg>';
}

async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#woche', foto = false, speicher = null, kurz = true, knaller = KNALLER, bildVerzug = 0, jetzt = JETZT, snackBilder = false, geo = null, filialen = null } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: foto ? 2 : 1, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block',
    ...(geo ? { permissions: ['geolocation'], geolocation: { latitude: geo.lat, longitude: geo.lon, accuracy: 50 } } : {}),
  });
  const z = { abrufe: [], offline: false, knaller, filialen };
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    z.abrufe.push(rest);
    const kopf = { 'access-control-allow-origin': '*' };
    if (z.offline) return route.abort('internetdisconnected');
    if (rest === FIL_PFAD) return z.filialen ? route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(z.filialen) }) : route.fulfill({ status: 404, headers: kopf, body: '' });
    if (rest === PFAD) return z.knaller ? route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(z.knaller) }) : route.fulfill({ status: 404, headers: kopf, body: '' });
    if (!DATEI[rest]) return route.fulfill({ status: 404, headers: kopf, body: '' });
    if (rest.endsWith('/aktuell.json') && kurz) {
      const d = JSON.parse(readFileSync(join(FIX, 'vertrag', DATEI[rest]), 'utf8'));
      // Snack-Einträge des Radars mit Bild (TESTWERTE: so liefert es der Radar ab 16.11.2026 aus dem mydealz-RSS)
      if (snackBilder) {
        for (const [i, e] of (d.kategorien.deals || []).entries()) e.bild = `https://static.mydealz.de/threads/raw/test${i}/150x150/qt/55/${i}.jpg`;
        const snack = (n, titel, zeile) => ({ id: `test-snack-${n}`, kategorie: 'deals', titel, zeile, soGehts: 'TESTWERT', link: `https://www.mydealz.de/deals/test-snack-${n}`, quelle: 'mydealz Lebensmittel', wert: 60, sofort: false, grund: 'Deal durchgerechnet', frist: '2026-11-07', datum: '2026-10-31T10:00:00.000Z', bis: '2026-11-07T22:59:59.000Z', bisQuelle: 'text', ab: null, sichtbarBis: '2026-11-07T22:59:59.000Z', preisfehler: false, bild: `https://static.mydealz.de/threads/raw/snack${n}/150x150/qt/55/snack${n}.jpg` });
        d.kategorien.deals.push(snack(1, 'Haribo Goldbären 175 g für 0,79 € (TESTWERT)', '1 Packung für 0,79 € statt 1,29 € (−39 %)'), snack(2, 'Lindt Lindor Kugeln 200 g für 3,49 € (TESTWERT)', '1 Packung für 3,49 € statt 5,99 € (−42 %)'));
      }
      d.status.knaller = { ok: true, anzahl: 0, kurz: { anzahl: 13, ab: { 20: 13, 30: 13, 40: 7, 50: 2 }, kommt: { 20: 2, 30: 2, 40: 1, 50: 0 }, naechste: { 20: 1, 30: 1, 40: 1, 50: 0 }, wocheBis: '2026-11-15T23:00:00.000Z', top: [
        { titel: 'Milka Schokolade 100 g', markt: 'Kaufland', pct: 54, preis: 0.69, vorherArt: 'streich', app: true },
        { titel: 'Kaffee Crema ganze Bohne 1 kg', markt: 'Aldi Nord', pct: 53, preis: 7.99, vorherArt: 'streich' },
        { titel: 'Haribo Fruchtgummi', markt: 'Netto', pct: 45, preis: 0.66, vorherArt: 'uvp' }] } };
      return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(d) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', DATEI[rest])) });
  });
  await ctx.route(/^https:\/\/(api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)\//, route => {
    const u = new URL(route.request().url()), cors = { 'access-control-allow-origin': '*' };
    const json = b => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(b) });
    if (u.host === 'api.coingecko.com') return json({ bitcoin: { eur: 60000, eur_24h_change: 1 }, ethereum: { eur: 2000, eur_24h_change: -1 } });
    if (u.host === 'api.crypto.com') { const i = u.searchParams.get('instrument_name'); return json({ code: 0, result: { data: [{ i, a: i === 'BTC_EUR' ? '60000' : '2000', c: '0.01' }] } }); }
    return route.fulfill({ status: 404, headers: cors, body: '' });
  });
  // Bilder: Prospekt-Ausschnitte/Produktfotos als gezeichnete Platzhalter, „kaputt“ -> 404
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com|api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)/, async route => {
    const u = route.request().url();
    z.abrufe.push(u);
    if (bildVerzug) await new Promise(r => setTimeout(r, bildVerzug));
    if (/kaputt/.test(u)) return route.fulfill({ status: 404, body: '' }).catch(() => {});
    return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: produktBild(u) }).catch(() => {});
  });
  await ctx.addInitScript(sp => {
    if (sp) for (const [k, v] of Object.entries(sp)) try { localStorage.setItem(k, v); } catch {}
    window.__cls = [];
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ t: performance.now(), v: e.value }); }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  }, speicher);
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource.*(404|ERR_INTERNET_DISCONNECTED)/.test(m.text())) fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  page.on('request', r => { if (/\/mein-vorteil\/woche\.js$/.test(new URL(r.url()).pathname)) z.abrufe.push('woche.js'); });
  await page.clock.setFixedTime(new Date(jetzt));
  await page.goto(basis + pfad);
  await page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent), null, { timeout: 10000 });
  if (pfad.endsWith('#woche')) await wocheDa(page);
  return { ctx, page, fehler, z };
}
const wocheDa = page => page.waitForFunction(() => document.querySelector('#p-woche .wo-chips, #p-woche .wo-erst') && !/Lade Wochen-Knaller/.test(document.getElementById('p-woche').textContent), null, { timeout: 10000 });
const kacheln = page => page.locator('#wo-liste .wo-kachel');
async function stufe(page, s) { await page.locator(`.wo-stufe[data-wo-stufe="${s}"]`).click(); await page.waitForFunction(s => document.querySelector(`.wo-stufe[data-wo-stufe="${s}"]`)?.getAttribute('aria-checked') === 'true', s); }
async function markt(page, m) { await page.locator(`.wo-chip[data-wo-markt="${m}"]`).click(); await page.waitForFunction(m => document.querySelector(`.wo-chip[data-wo-markt="${m}"]`)?.getAttribute('aria-selected') === 'true', m); }
async function pruefeLayout(page, wo) {
  const r = await page.evaluate(() => {
    const zuKlein = [];
    for (const el of document.querySelectorAll('#p-woche button, #p-woche a[href], #p-woche summary, .sprung a')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[hidden]') || el.closest('details:not([open]) > :not(summary)')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 30)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    const raus = [...document.querySelectorAll('#p-woche .wo-kachel')].filter(k => { const b = k.getBoundingClientRect(); return b.right > innerWidth + 0.5 || b.left < -0.5; }).length;
    return { zuKlein, raus, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth };
  });
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  assert.equal(r.raus, 0, `${wo}: Kachel ragt über den Rand`);
  const vw = page.viewportSize().width;
  assert.ok(r.sw <= vw && r.bw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${vw})`);
}

test('Lazy: woche.js und knaller.json erst beim Öffnen; Start-Kachel und Zahl aus aktuell.json ohne eigenen Abruf', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne({ pfad: '/mein-vorteil/' });
  await page.waitForTimeout(300);
  assert.ok(!z.abrufe.includes('woche.js') && !z.abrufe.includes(PFAD), 'vor dem Öffnen nichts geholt: ' + z.abrufe.join(', '));
  const k = page.locator('#kacheln a[data-sprung="woche"]');
  assert.deepEqual(await k.locator('li b').allInnerTexts(), ['Milka Schokolade 100 g', 'Kaffee Crema ganze Bohne 1 kg']);
  assert.match(nbsp((await k.locator('li span').allInnerTexts())[0]), /^−54 % · 0,69 € · Kaufland · App$/);
  assert.equal(await k.locator('.kn').innerText(), '13');
  // Radar kurz.kommt: was diese Woche noch beginnt, als Hinweis unter den Zeilen (Zahl oben = was heute gilt)
  // Prüfer 16.11.: diese Woche und nächste Woche getrennt (kommt / naechste vom Radar)
  assert.equal(nbsp(await k.locator('.kw').innerText()), '+ 2 diese Woche, 1 ab Mo');
  assert.equal(await page.locator('.sprung a[data-reiter="woche"] .n').innerText(), '13');
  await k.click();
  await wocheDa(page);
  assert.ok(z.abrufe.includes('woche.js') && z.abrufe.includes(PFAD));
  assert.equal(await page.locator('#ort-name').innerText(), 'Wochen-Knaller');
  // zurück zu Deals und wieder hin: kein zweiter Abruf
  const n = z.abrufe.filter(a => a === PFAD).length;
  await page.locator('.sprung a[data-ziel="deals"]').click();
  await page.locator('.sprung a[data-reiter="woche"]').click();
  await page.waitForTimeout(200);
  assert.equal(z.abrufe.filter(a => a === PFAD).length, n);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Stufen 20/30/40/50 % und Märkte: Zähler, Gruppen, gemerkte Wahl, leere Wahl mit Knopf, Kachel-Zahl folgt der Stufe', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  // Standard 30 %: alle 13, nach Rabatt gruppiert, „Ab Montag“ unten; Staffel ab 20 % (Xander 16.11., 2. Runde)
  assert.equal(await kacheln(page).count(), 13);
  assert.deepEqual((await page.locator('.wo-stufe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 20 % 13', 'ab 30 % 13', 'ab 40 % 7', 'ab 50 % 2']);
  assert.equal(await page.locator('.wo-stufe[aria-checked="true"]').getAttribute('data-wo-stufe'), '30', 'Start bleibt 30 %');
  assert.deepEqual((await page.locator('.wo-gruppe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 50 % 2', '40 bis 49 % 5', '30 bis 39 % 5', 'Ab Montag 1']);
  const chips = (await page.locator('.wo-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
  assert.deepEqual(chips, ['Alle 13', 'Aldi Nord 1', 'Lidl 1', 'Kaufland 2', 'Netto 1', 'Penny 6', 'REWE 1', 'Marktkauf 1']);
  // 40 %: 7, Zahl der Start-Kachel folgt
  await stufe(page, 40);
  assert.equal(await kacheln(page).count(), 7);
  // Leiste und Start-Kachel zählen ab der gewählten Stufe (Übersicht status.knaller.kurz.ab[40] = 7)
  await page.waitForFunction(() => document.querySelector('.sprung a[data-reiter="woche"] .n')?.textContent === '7');
  assert.deepEqual((await page.locator('.wo-gruppe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 50 % 2', '40 bis 49 % 5']);
  await markt(page, 'kaufland');
  assert.deepEqual(await kacheln(page).locator('.wo-titel').allInnerTexts(), ['Milka Schokolade 100 g (TESTWERT)', 'Pringles 185 g (TESTWERT)']);
  assert.deepEqual((await page.locator('.wo-stufe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 20 % 2', 'ab 30 % 2', 'ab 40 % 2', 'ab 50 % 1'], 'Stufen zählen im gewählten Markt');
  assert.match(await page.locator('.wo-link').innerText(), /Alle Angebote von Kaufland bei kaufDA/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Marken: goldener Rahmen nur beim Streichpreis, UVP grau, App/Karte, ab-Preis „bis −n %“, Bild-Fehler -> Platzhalter, Link zu kaufDA', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  const info = await page.locator('#wo-liste .wo-kachel').evaluateAll(ks => ks.map(k => ({
    t: k.querySelector('.wo-titel').textContent, streich: k.classList.contains('wo-streich'), rand: getComputedStyle(k).borderTopWidth,
    pct: k.querySelector('.wo-pct').textContent, uvp: k.querySelector('.wo-pct').classList.contains('wo-uvp'), statt: k.querySelector('.wo-statt').textContent,
    marken: [...k.querySelectorAll('.wo-marke')].map(m => m.textContent), href: k.getAttribute('href'),
  })));
  const von = s => info.find(x => x.t.includes(s));
  assert.equal(von('Kaffee Crema').streich, true);
  assert.equal(von('Kaffee Crema').rand, '1px', 'Goldring als Schatten – gleiche Maße wie die anderen Kacheln');
  assert.notEqual(await page.locator('.wo-kachel.wo-streich').first().evaluate(k => getComputedStyle(k).boxShadow), 'none');
  assert.equal(await page.locator('.wo-kachel:not(.wo-streich)').first().evaluate(k => getComputedStyle(k).boxShadow), 'none');
  assert.equal(nbsp(von('Kaffee Crema').statt), 'statt 16,99 €');
  assert.equal(von('Fruchtgummi') && von('Haribo Fruchtgummi')?.uvp, true);
  const netto = info.find(x => x.pct === '−44 %'); // 0,66 statt 1,19 = 44,5 % -> abgerundet
  assert.equal(netto.streich, false);
  assert.equal(netto.rand, '1px');
  assert.equal(nbsp(netto.statt), 'statt 1,19 € UVP');
  assert.deepEqual(von('Milka').marken, ['nur mit App/Karte']);
  const lach = von('Lachgummi');
  assert.equal(nbsp(lach.pct), 'bis −40 %'); // 0,88 statt 1,49 = 40,9 % -> abgerundet
  assert.deepEqual(lach.marken, ['nur mit App/Karte', 'ab-Preis']);
  assert.match(von('Crunchips').marken.join(' '), /^ab Mo 16\.11\.$/);
  assert.match(netto.href, /^https:\/\/www\.kaufda\.de\//);
  // Bild-Fehler (Pringles) -> Platzhalter mit Marktname, Marktkauf ohne Bild ebenso; gleiche Höhe wie die anderen Bildfelder
  await page.waitForFunction(() => [...document.querySelectorAll('.wo-kachel')].find(k => /Pringles/.test(k.textContent))?.querySelector('.wo-ohnebild'));
  const felder = await page.locator('.wo-bildfeld').evaluateAll(f => f.map(x => Math.round(x.getBoundingClientRect().height)));
  assert.equal(new Set(felder).size, 1, 'alle Bildfelder gleich hoch: ' + felder);
  assert.equal(await page.locator('.wo-kachel', { hasText: 'Pringles' }).locator('.wo-ohnebild').innerText(), 'Kaufland');
  assert.equal(await page.locator('.wo-kachel', { hasText: 'Lindt' }).locator('.wo-ohnebild').innerText(), 'Marktkauf');
  // Bilder: lazy, feste Maße, ohne Referrer
  const img = await page.locator('.wo-bild').first().evaluate(i => [i.loading, i.decoding, i.getAttribute('width'), i.getAttribute('height'), i.referrerPolicy]);
  assert.deepEqual(img, ['lazy', 'async', '160', '160', 'no-referrer']);
  assert.match(nbsp(await page.locator('.wo-fuss-text').first().innerText()), /Gold umrandet = echter Streichpreis[\s\S]*UVP = gegen die Preisempfehlung[\s\S]*in Döbeln gibt/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Wahl gemerkt, Markt + Stufe leer -> Knopf, offline der letzte Stand aus dem Cache, Datei fehlt -> freundlicher Text', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne();
  await stufe(page, 50);
  await markt(page, 'penny');
  assert.equal(await kacheln(page).count(), 0);
  assert.match(nbsp(await page.locator('.wo-leer p').innerText()), /^Gerade nichts ab 50 % bei Penny – ab 40 % gibt es 2\.$/);
  await page.locator('.wo-leer .wo-knopf').click();
  await page.waitForFunction(() => document.querySelector('.wo-stufe[data-wo-stufe="40"]')?.getAttribute('aria-checked') === 'true');
  assert.equal(await kacheln(page).count(), 2);
  assert.equal(await page.evaluate(() => [localStorage.getItem('mein-vorteil-woche-stufe'), localStorage.getItem('mein-vorteil-woche-markt')].join('|')), '40|"penny"');
  // neu laden, offline: gemerkte Wahl und letzter Stand aus dem Cache Storage
  z.offline = true;
  await page.reload();
  await wocheDa(page);
  assert.equal(await kacheln(page).count(), 2);
  assert.equal(await page.locator('.wo-chip[aria-selected="true"]').getAttribute('data-wo-markt'), 'penny');
  assert.match(await page.locator('.wo-stand').innerText(), /letzten Stand|offline/);
  await ctx.close();
  // Datei gibt es noch nicht (404)
  const o2 = await oeffne({ knaller: null });
  assert.match(await o2.page.locator('#p-woche .wo-erst').innerText(), /zum ersten Mal gesucht/);
  assert.deepEqual(o2.fehler, []);
  await o2.ctx.close();
  assert.deepEqual(fehler, []);
});

test('Produktbilder: Angebotskarte (Snacks) mit Bild links, Karte nicht höher; weitere Angebote/andere Snacks mit kleinem Bild', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ pfad: '/mein-vorteil/#deals', jetzt: JETZT_DEALS, snackBilder: true });
  await page.waitForFunction(() => document.querySelector('#i-produkte .karte.angebot'));
  const r = await page.locator('#i-produkte .karte.angebot').evaluateAll(ks => ks.map(k => {
    const i = k.querySelector(':scope > .pbild');
    return { mit: !!i, w: i ? Math.round(i.getBoundingClientRect().width) : 0, h: i ? Math.round(i.getBoundingClientRect().height) : 0, lazy: i?.loading, src: i?.getAttribute('src') || '' };
  }));
  assert.ok(r.some(x => x.mit), 'mindestens eine Karte mit Bild');
  for (const x of r.filter(y => y.mit)) { assert.deepEqual([x.w, x.h, x.lazy], [64, 64, 'lazy']); assert.match(x.src, /^https:\/\//); }
  // Karte nicht höher: dieselbe Karte ohne Bild (Bild entfernt) ist gleich hoch
  const hoehe = await page.locator('#i-produkte .karte.angebot:has(> .pbild)').first().evaluate(k => {
    const mit = k.getBoundingClientRect().height;
    const i = k.querySelector(':scope > .pbild'); const platz = i.nextSibling; i.remove();
    const ohne = k.getBoundingClientRect().height; k.insertBefore(i, platz);
    return [Math.round(mit), Math.round(ohne)];
  });
  assert.ok(hoehe[0] - hoehe[1] <= 2, `Karte mit Bild ${hoehe[0]} px, ohne ${hoehe[1]} px`);
  await page.locator('#i-produkte .karte.angebot:has(> .pbild)').first().screenshot({ path: join(FOTOS, 'deals-karte-mit-bild.png') });
  // andere Snacks: 40-px-Bild vor dem Text, Zeile bleibt eine Zeile hoch genug
  const snack = await page.locator('#i-snacks .reihe').evaluateAll(rs => rs.map(r => { const i = r.querySelector('.pbild'); return i ? [Math.round(i.getBoundingClientRect().width), i.loading] : null; }));
  assert.ok(snack.length && snack.every(x => x && x[0] === 40 && x[1] === 'lazy'), JSON.stringify(snack));
  assert.deepEqual(fehler, []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Woche ${breite}×${hoehe} (${lage}): Kachel-Raster ohne seitliches Scrollen, Tippflächen ≥ 44 px, Bilder ohne Sprung, Fotos`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe, foto: true, bildVerzug: 400 });
    await pruefeLayout(page, `${lage} 30 %`);
    const spalten = await page.locator('.wo-raster').first().evaluate(u => getComputedStyle(u).gridTemplateColumns.split(' ').length);
    assert.equal(spalten, lage === 'hoch' ? 2 : 4, 'Spalten');
    await page.waitForTimeout(700); // Bilder kommen spät – Platz war reserviert
    const cls = await page.evaluate(() => window.__cls.reduce((s, e) => s + e.v, 0));
    assert.ok(cls < 0.02, `Layout-Sprung ${cls}`);
    // Prüfer 16.11.: ein Hochformat-Bild (200×600) darf das quadratische Bildfeld nicht aufdrücken, ein Querformat nicht schrumpfen
    const felder = await page.$$eval('.wo-bildfeld', l => l.map(f => { const r = f.getBoundingClientRect(); const i = f.querySelector('img'); return { w: r.width, h: r.height, src: i ? i.getAttribute('src') : '', nw: i ? i.naturalWidth : 0 }; }));
    assert.ok(felder.some(f => /hochformat/.test(f.src) && f.nw === 200) && felder.some(f => /querformat/.test(f.src)), JSON.stringify(felder.map(f => f.src)));
    for (const f of felder) assert.ok(Math.abs(f.w - f.h) <= 1, `Bildfeld nicht quadratisch: ${JSON.stringify(f)}`);
    const hoehen = await page.$$eval('.wo-kachel', l => l.map(k => k.getBoundingClientRect().height));
    assert.ok(Math.max(...hoehen) < (lage === 'hoch' ? 420 : 380), `Kachel zu hoch: ${Math.max(...hoehen)}`);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche-30.png`) });
    await page.screenshot({ path: join(FOTOS, `${lage}-woche-30-ganz.png`), fullPage: true });
    await stufe(page, 40);
    await markt(page, 'penny');
    await pruefeLayout(page, `${lage} 40 % Penny`);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche-40-penny.png`) });
    await stufe(page, 50);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche-50-penny-leer.png`) });
    await markt(page, 'alle');
    await page.evaluate(() => document.querySelector('.wo-fuss-text').scrollIntoView({ block: 'end' }));
    await page.screenshot({ path: join(FOTOS, `${lage}-woche-50-fuss.png`) });
    // Start mit der Kachel „Woche“
    await page.locator('.sprung a[data-ziel="start"]').click();
    await page.waitForFunction(() => !document.getElementById('start').hidden);
    await page.locator('#kacheln a[data-sprung="woche"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(FOTOS, `${lage}-start-kachel.png`) });
    assert.deepEqual(fehler, []);
    await ctx.close();
    // Deals mit Produktbildern (Vertrags-Daten vom 31.10.)
    const d = await oeffne({ breite, hoehe, foto: true, pfad: '/mein-vorteil/#deals', jetzt: JETZT_DEALS, snackBilder: true });
    await d.page.waitForFunction(() => document.querySelector('#i-produkte .karte.angebot'));
    await d.page.waitForTimeout(500);
    await pruefeLayout(d.page, `${lage} deals`);
    await d.page.screenshot({ path: join(FOTOS, `${lage}-deals-bilder.png`) });
    await d.page.locator('#snacks').scrollIntoViewIfNeeded();
    await d.page.screenshot({ path: join(FOTOS, `${lage}-deals-snacks.png`) });
    assert.deepEqual(d.fehler, []);
    await d.ctx.close();
  });
}

// Xander 16.11. (2. Runde): was heute gilt normal, was erst ab Do/Fr/Sa kommt als eigene Gruppe (gestrichelt, „ab Do …“) mit
// Sprung-Leiste; 20 %; „geschätzt“; Merken (Haken oder lange drücken) -> gemerkt, an den Radar (ntfy-Thema) gemeldet.
// Lidl Pepsi = echtes Angebot aus dem Roh-Lauf 43821908194 (Daten auf die Fixture-Woche verschoben), Rest TESTWERT.
const KNALLER2 = { ...plain(KNALLER), stufen: [20, 30, 40, 50], minProzent: 20, angebote: [...plain(KNALLER).angebote,
  { id: 'kd:9b2b7a64-pepsi', markt: 'lidl', titel: 'PEPSI', info: 'Versch. Sorten, je 1,25 l', preis: 0.99, vorher: 1.79, vorherArt: 'uvp', pct: 44, app: false, bedingung: '', bild: 'https://content-media.bonial.biz/test-lidl/pepsi.jpg', link: 'https://www.kaufda.de/Doebeln/Lidl/p-r74', gueltigAb: '2026-11-11T23:00:00.000Z', gueltigBis: '2026-11-14T22:59:00.000Z', abQuelle: 'marktguru', bestaetigt: 'marktguru', regional: false, region: 'Döbeln' },
  { id: 'kd:test-penny-we', markt: 'penny', titel: 'Wochenend-Knüller Rinderhack 500 g (TESTWERT)', info: 'TESTWERT', preis: 2.99, vorher: 4.69, vorherArt: 'streich', pct: 36, app: false, bedingung: '', bild: 'https://content-media.bonial.biz/test-penny/hack.jpg', link: 'https://www.kaufda.de/Doebeln/Penny-Markt/p-r75', gueltigAb: '2026-11-12T23:00:00.000Z', gueltigBis: '2026-11-14T22:59:00.000Z', abQuelle: 'text', wochenende: true, regional: false, region: 'Döbeln' },
  { id: 'kd:test-aldi-geschaetzt', markt: 'aldi-nord', titel: 'Lorenz Erdnusslocken 175 g (TESTWERT)', info: 'TESTWERT', preis: 0.89, vorher: 1.49, vorherArt: 'geschaetzt', vorherQuelle: 'UVP im Prospekt vom 02.11.', pct: 40, app: false, bedingung: '', bild: 'https://content-media.bonial.biz/test-aldi/locken.jpg', link: 'https://www.kaufda.de/Doebeln/ALDI-Nord/p-r43', gueltigAb: '2026-11-08T23:00:00.000Z', gueltigBis: '2026-11-14T22:59:00.000Z', regional: false, region: 'Döbeln' },
  { id: 'kd:test-netto-25', markt: 'netto', titel: 'Kaffeesahne 10 x 7,5 g (TESTWERT)', info: 'TESTWERT', preis: 0.59, vorher: 0.79, vorherArt: 'streich', pct: 25, app: false, bedingung: '', bild: null, link: 'https://www.kaufda.de/Doebeln/Netto-Marken-Discount/p-r9', gueltigAb: '2026-11-08T23:00:00.000Z', gueltigBis: '2026-11-14T22:59:00.000Z', regional: false, region: 'Döbeln' },
  { id: 'kd:test-alt', markt: 'penny', titel: 'Abgelaufen (TESTWERT)', preis: 0.5, vorher: 1, vorherArt: 'streich', pct: 50, gueltigAb: '2026-11-01T23:00:00.000Z', gueltigBis: '2026-11-07T22:59:00.000Z' },
] };
const gruppen = async page => (await page.locator('.wo-gruppe').allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
async function ntfyMitschnitt(ctx) {
  const posts = [];
  await ctx.route('https://ntfy.sh/**', async route => {
    const r = route.request();
    posts.push({ url: r.url(), methode: r.method(), kopf: r.headers()['content-type'] || '', body: r.postData() });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"id":"TESTWERT","event":"message"}' });
  });
  return posts;
}
const warteAuf = (fn, ms = 4000) => new Promise((ok, nein) => { const t0 = Date.now(); const i = setInterval(() => { if (fn()) { clearInterval(i); ok(); } else if (Date.now() - t0 > ms) { clearInterval(i); nein(new Error('Zeit um')); } }, 50); });

test('Kommt diese Woche: eigene Gruppe gestrichelt mit „ab Do/Fr“, Sprung-Leiste mit Zählern, 20 %, geschätzt grau, Abgelaufenes raus', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ knaller: KNALLER2 });
  // 30 %: heute 13 (12 aus der Fixture + geschätzt), diese Woche 2 (Pepsi ab Do, Hack ab Fr), nächste Woche 1 (Crunchips ab Mo)
  assert.deepEqual(await gruppen(page), ['ab 50 % 2', '40 bis 49 % 6', '30 bis 39 % 5', 'Kommt diese Woche 2', 'Ab Montag 1']);
  assert.deepEqual((await page.locator('.wo-sprung').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['Gilt jetzt 13', 'Kommt diese Woche 2', 'Ab Montag 1']);
  assert.ok(!(await page.locator('#wo-liste').innerText()).includes('Abgelaufen'));
  const kommt = await page.locator('#wo-g-kommt + .wo-gruppe-text + .wo-raster .wo-kachel').evaluateAll(ks => ks.map(k => ({
    t: k.querySelector('.wo-titel').textContent, kommt: k.classList.contains('wo-kommt'), stil: getComputedStyle(k).borderTopStyle,
    marken: [...k.querySelectorAll('.wo-marke')].map(m => m.textContent) })));
  assert.deepEqual(kommt.map(k => [k.t.replace(/ \(TESTWERT\)/, ''), k.kommt, k.stil]), [['PEPSI', true, 'dashed'], ['Wochenend-Knüller Rinderhack 500 g', true, 'dashed']]);
  assert.deepEqual(kommt.map(k => k.marken.join(' ')), ['ab Do 12.11.', 'ab Fr 13.11. Wochenende']);
  // was heute gilt: durchgezogener Rahmen
  assert.equal(await page.locator('#wo-g-jetzt + .wo-raster .wo-kachel').first().evaluate(k => getComputedStyle(k).borderTopStyle), 'solid');
  // geschätzt: graue Plakette „≈ −40 %“, „statt ~1,49 € geschätzt“, kein Goldrahmen
  const g = page.locator('.wo-kachel', { hasText: 'Erdnusslocken' });
  assert.equal(nbsp(await g.locator('.wo-pct').innerText()), '≈ −40 %');
  assert.ok(await g.locator('.wo-pct').evaluate(e => e.classList.contains('wo-geschaetzt')));
  assert.equal(nbsp(await g.locator('.wo-statt').innerText()), 'statt ~1,49 € geschätzt');
  assert.ok(!(await g.evaluate(k => k.classList.contains('wo-streich'))));
  assert.match(nbsp(await page.locator('.wo-fuss-text').first().innerText()), /„≈ … geschätzt“ = im Prospekt steht kein Vergleichspreis/);
  // Sprung: „Kommt diese Woche“ antippen -> Gruppe oben im Bild
  await page.locator('.wo-sprung[data-wo-sprung="wo-g-kommt"]').click();
  // landet direkt unter der festen Reiter-Leiste (nicht dahinter)
  await page.waitForFunction(() => { const h = document.getElementById('wo-g-kommt').getBoundingClientRect().top, n = document.querySelector('.sprung').getBoundingClientRect().bottom; return h >= n - 1 && h - n < 30; });
  // 20 %: Kaffeesahne (25 %) kommt dazu, eigene Gruppe
  await stufe(page, 20);
  assert.deepEqual(await gruppen(page), ['ab 50 % 2', '40 bis 49 % 6', '30 bis 39 % 5', '20 bis 29 % 1', 'Kommt diese Woche 2', 'Ab Montag 1']);
  assert.deepEqual((await page.locator('.wo-stufe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 20 % 17', 'ab 30 % 16', 'ab 40 % 9', 'ab 50 % 2']);
  await stufe(page, 30);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Merken: Haken -> „Gemerkt“ oben, lokal gespeichert, Liste an den Radar (ntfy, einfache Anfrage); lange drücken = merken ohne Öffnen', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ knaller: KNALLER2 });
  const posts = await ntfyMitschnitt(ctx);
  const neueSeiten = [];
  ctx.on('page', p => neueSeiten.push(p));
  const pepsi = page.locator('#wo-g-kommt ~ .wo-raster li', { hasText: 'PEPSI' }).first();
  const knopf = pepsi.locator('.wo-merk');
  assert.equal(await knopf.getAttribute('aria-pressed'), 'false');
  const b = await knopf.boundingBox();
  assert.ok(b.width >= 44 && b.height >= 44, `Haken ${b.width}×${b.height}`);
  await knopf.click();
  await page.waitForFunction(() => document.getElementById('wo-g-gemerkt'));
  assert.equal(await page.locator('#wo-g-kommt ~ .wo-raster li', { hasText: 'PEPSI' }).first().locator('.wo-merk').getAttribute('aria-pressed'), 'true');
  assert.equal((await gruppen(page))[0], 'Gemerkt 1');
  assert.deepEqual(await page.locator('#wo-g-gemerkt ~ .wo-raster').first().locator('.wo-titel').allInnerTexts(), ['PEPSI']);
  assert.equal(neueSeiten.length, 0, 'Haken öffnet kein kaufDA');
  // an den Radar: eine Nachricht mit der ganzen Liste (ohne eigene Kopfzeilen -> kein Preflight)
  await warteAuf(() => posts.length >= 1);
  assert.equal(posts[0].methode, 'POST');
  assert.equal(posts[0].url, 'https://ntfy.sh/xander-schnaeppchen-b5cbf4442aaa9734f3-merken');
  assert.match(posts[0].kopf, /^text\/plain/);
  const d = JSON.parse(posts[0].body);
  assert.deepEqual([d.v, d.merken.length, d.merken[0].id, d.merken[0].markt, d.merken[0].ab], [1, 1, 'kd:9b2b7a64-pepsi', 'lidl', '2026-11-11T23:00:00.000Z']);
  await page.waitForFunction(() => /Erinnerung per Push am ersten Gültigkeitstag/.test(document.querySelector('.wo-merkhinweis')?.textContent || ''));
  // lange drücken (Maus wie Finger): Hack wird gemerkt, kein neuer Tab
  const hack = page.locator('#wo-g-kommt ~ .wo-raster .wo-kachel', { hasText: 'Rinderhack' }).first();
  const hb = await hack.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + 40);
  await page.mouse.down();
  await page.waitForTimeout(750);
  await page.mouse.up();
  await page.waitForFunction(() => /Gemerkt 2/.test(document.getElementById('wo-g-gemerkt')?.textContent.replace(/\s+/g, ' ') || ''));
  await page.waitForTimeout(300);
  assert.equal(neueSeiten.length, 0, 'lange gedrückt öffnet nicht');
  await warteAuf(() => posts.length >= 2);
  assert.equal(JSON.parse(posts.at(-1).body).merken.length, 2);
  // neu laden: gemerkt bleibt (localStorage), Sprung-Leiste zählt „Gemerkt 2“
  await page.reload();
  await wocheDa(page);
  assert.equal((await gruppen(page))[0], 'Gemerkt 2');
  assert.match((await page.locator('.wo-sprung').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')).join('|'), /Gemerkt 2/);
  const lsl = await page.evaluate(() => JSON.parse(localStorage.getItem('mein-vorteil-woche-gemerkt')).liste.map(x => x.id));
  assert.deepEqual(lsl.sort(), ['kd:9b2b7a64-pepsi', 'kd:test-penny-we']);
  // Haken in „Gemerkt“ nimmt es wieder heraus
  await page.locator('#wo-g-gemerkt ~ .wo-raster').first().locator('li', { hasText: 'PEPSI' }).locator('.wo-merk').click();
  await page.waitForFunction(() => /Gemerkt 1/.test(document.getElementById('wo-g-gemerkt')?.textContent.replace(/\s+/g, ' ') || ''));
  await warteAuf(() => posts.some(p => JSON.parse(p.body).merken.length === 1 && JSON.parse(p.body).merken[0].id === 'kd:test-penny-we'));
  assert.deepEqual(fehler, []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Woche ${breite}×${hoehe} (${lage}): Kommt diese Woche + Gemerkt – Tippflächen ≥ 44 px, kein seitliches Scrollen, Fotos`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe, foto: true, knaller: KNALLER2 });
    await ntfyMitschnitt(ctx);
    await pruefeLayout(page, `${lage} Kommt`);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche2-oben.png`) });
    await page.locator('.wo-sprung[data-wo-sprung="wo-g-kommt"]').click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche2-kommt.png`) });
    await page.locator('#wo-g-kommt ~ .wo-raster li', { hasText: 'PEPSI' }).first().locator('.wo-merk').click();
    await page.waitForFunction(() => /Erinnerung per Push/.test(document.querySelector('.wo-merkhinweis')?.textContent || ''));
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await pruefeLayout(page, `${lage} Gemerkt`);
    await page.screenshot({ path: join(FOTOS, `${lage}-woche2-gemerkt.png`) });
    await stufe(page, 20);
    await page.locator('.wo-gruppe', { hasText: '20 bis 29 %' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(FOTOS, `${lage}-woche2-20.png`) });
    await page.locator('.sprung a[data-ziel="start"]').click();
    await page.waitForFunction(() => !document.getElementById('start').hidden);
    await page.locator('#kacheln a[data-sprung="woche"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(FOTOS, `${lage}-woche2-start.png`) });
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

// --- Märkte vor Ort (Xander 16.11.2026: „nur Märkte, die wirklich in Döbeln sind … anhand von GPS … nur die Märkte der Gegend“)
// Radar-Felder maerkte.<id>.nah/filiale (REWE: nächste in Leisnig, 15 km – wie Roh-Lauf 43843865340), Filial-Liste mit ausgedachten
// Punkten um Döbeln und Leipzig (Lidl, Kaufland, REWE in Leipzig; Aldi/Netto/Penny/Marktkauf nur in Döbeln).
const DOEBELN_TEST = { lat: 51.1211, lon: 13.1229 };
const LEIPZIG_TEST = { lat: 51.3397, lon: 12.3731 };
function knallerMitNaehe() {
  const d = plain(KNALLER);
  for (const [id, m] of Object.entries(d.maerkte)) {
    if (id === 'rewe') Object.assign(m, { nah: false, ort: 'Chemnitz', filiale: { adresse: 'Wilhelm-Ostwald-Straße 10, Leisnig', km: 15, von: 'Döbeln', quelle: 'OpenStreetMap' } });
    else Object.assign(m, { nah: true, ort: 'Döbeln', filiale: { adresse: `${m.name}-Straße 1, Döbeln (TESTWERT)`, km: 1.2, von: 'Döbeln' } });
  }
  return d;
}
const FILIALEN_TEST = { version: 1, aktualisiert: '2026-11-10T06:00:00.000Z', osmStand: '2026-11-10T06:00:00.000Z', maerkte: {
  'aldi-nord': [[51.1265, 13.139, 'Grimmaische Straße 67, Döbeln']], lidl: [[51.115, 13.108, 'Schlachthofstraße 2, Döbeln'], [51.335, 12.38, 'Test 1, Leipzig']],
  kaufland: [[51.1225, 13.1215, 'Schillerstraße 6, Döbeln'], [51.33, 12.36, 'Test 2, Leipzig']], netto: [[51.129, 13.118, 'Unnaer Straße 1d, Döbeln']],
  penny: [[51.123, 13.125, 'Schillerstraße 38, Döbeln']], rewe: [[51.06, 13.29, 'Teststraße 1, Testort'], [51.345, 12.37, 'Test 3, Leipzig']],
  marktkauf: [[51.114, 13.133, 'Richard-Köberlin-Straße 2, Döbeln']] } };

test('Märkte vor Ort (statisch): Lage je Markt – Radar nah/filiale, ältere Dateien, Standort mit Filial-Liste', () => {
  const I = modul()._intern;
  const n = I.normalisiere(knallerMitNaehe(), Date.parse(JETZT));
  const rewe = n.maerkte.find(m => m.id === 'rewe');
  assert.deepEqual(plain(I.lageVon(rewe, n, null, null)), { nah: false, km: 15, adresse: 'Wilhelm-Ostwald-Straße 10, Leisnig' });
  assert.equal(I.lageVon(n.maerkte.find(m => m.id === 'kaufland'), n, null, null).nah, true);
  // ältere Datei (ohne nah): km entscheidet; weder Filiale noch Döbelner Prospekt -> nicht in der Nähe; ohne jeden Beleg -> bleibt
  const alt = I.normalisiere({ ort: 'Döbeln', maerkte: { rewe: { name: 'REWE', ort: 'Chemnitz' }, penny: { name: 'Penny', filiale: { km: 0.2, adresse: 'x' } }, lidl: { name: 'Lidl', filiale: { km: 12.4 } }, kaufland: { name: 'Kaufland' } } }, Date.parse(JETZT));
  const lage = id => I.lageVon(alt.maerkte.find(m => m.id === id), alt, null, null).nah;
  assert.deepEqual([lage('rewe'), lage('penny'), lage('lidl'), lage('kaufland')], [false, true, false, true]);
  // Standort Leipzig: nur Märkte mit Filiale bis 10 km (wie Döbeln)
  const fil = I.filialenNorm(FILIALEN_TEST);
  const nah = n.maerkte.filter(m => I.lageVon(m, n, LEIPZIG_TEST, fil).nah).map(m => m.id);
  assert.deepEqual(plain(nah), ['lidl', 'kaufland', 'rewe']);
  assert.equal(I.filialenNorm({ maerkte: { lidl: [] } }), null, 'leere Liste = keine Filial-Liste');
  assert.ok(Math.abs(I.kmZwischen(DOEBELN_TEST, LEIPZIG_TEST) - 57) < 3);
  // echte Filial-Liste (Kopie im Ordner, OSM 16.11.2026): Standort Döbeln -> alle außer REWE (nächste in Leisnig, 15 km)
  const echt = I.filialenNorm(JSON.parse(readFileSync(join(MV, 'filialen.json'), 'utf8')));
  const inDoebeln = n.maerkte.filter(m => I.lageVon(m, n, DOEBELN_TEST, echt).nah).map(m => m.id);
  assert.deepEqual(plain(inDoebeln), ['aldi-nord', 'lidl', 'kaufland', 'netto', 'penny', 'marktkauf']);
  const rewe2 = I.lageVon(rewe, n, DOEBELN_TEST, echt);
  assert.ok(rewe2.km > 10 && /Leisnig/.test(rewe2.adresse), JSON.stringify(rewe2));
  // Prüfer 16.11.: Standort außerhalb der Filial-Liste (Berlin, Hamburg) -> Döbeln-Regel statt „keine Filiale in der Nähe“
  assert.equal(I.imGebiet(DOEBELN_TEST, echt), true);
  for (const pos of [{ lat: 52.52, lon: 13.4 }, { lat: 53.55, lon: 9.99 }]) {
    assert.equal(I.imGebiet(pos, echt), false, JSON.stringify(pos));
    const dort = n.maerkte.filter(m => I.lageVon(m, n, pos, echt).nah).map(m => m.id);
    assert.deepEqual(plain(dort), ['aldi-nord', 'lidl', 'kaufland', 'netto', 'penny', 'marktkauf'], 'wie Döbeln');
  }
  assert.equal(I.imGebiet({ lat: 51.34, lon: 12.37 }, I.filialenNorm({ maerkte: { lidl: [[51.1, 13.1, 'x']] } })), false, 'ohne Filiale bis 25 km');
});

test('Märkte vor Ort: ohne Standort nur Märkte bis 10 km um Döbeln, „weitere Märkte“ zeigt REWE gestrichelt (gemerkt)', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne({ knaller: knallerMitNaehe() });
  const chips = async () => (await page.locator('.wo-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
  assert.deepEqual(await chips(), ['Alle 12', 'Aldi Nord 1', 'Lidl 1', 'Kaufland 2', 'Netto 1', 'Penny 6', 'Marktkauf 1']);
  assert.equal(await kacheln(page).count(), 12);
  const ort = nbsp(await page.locator('.wo-ort').innerText()).replace(/\s+/g, ' ');
  assert.match(ort, /Märkte mit Filiale bis 10 km um Döbeln/);
  assert.match(ort, /Standort verwenden/);
  assert.match(ort, /Keine Filiale in der Nähe: REWE \(nächste 15 km, Wilhelm-Ostwald-Straße 10, Leisnig\) – ausgeblendet\./);
  assert.ok(!z.abrufe.includes(FIL_PFAD), 'Filial-Liste erst mit Standort');
  await page.locator('[data-wo-weitere]').click();
  await page.waitForFunction(() => document.querySelector('[data-wo-weitere]')?.getAttribute('aria-pressed') === 'true');
  assert.deepEqual(await chips(), ['Alle 13', 'Aldi Nord 1', 'Lidl 1', 'Kaufland 2', 'Netto 1', 'Penny 6', 'REWE 1', 'Marktkauf 1']);
  assert.equal(await page.locator('.wo-chip.wo-fern').getAttribute('data-wo-markt'), 'rewe');
  await markt(page, 'rewe');
  assert.equal(await kacheln(page).count(), 1);
  await pruefeLayout(page, 'hoch weitere');
  // wieder aus: REWE-Wahl fällt auf „Alle“ zurück
  await page.locator('[data-wo-weitere]').click();
  await page.waitForFunction(() => document.querySelector('.wo-chip[aria-selected="true"]')?.dataset.woMarkt === 'alle');
  assert.equal(await kacheln(page).count(), 12);
  assert.equal(await page.evaluate(() => localStorage.getItem('mein-vorteil-woche-weitere')), 'false');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Märkte vor Ort ${lage}: „Standort verwenden“ (Leipzig) -> nur Märkte bis 10 km, Hinweis Prospekt Döbeln, nichts gesendet, „Döbeln“ zurück, Fotos`, { skip: ohnePw }, async () => {
    await mkdir(FOTOS, { recursive: true });
    const { ctx, page, fehler, z } = await oeffne({ breite, hoehe, foto: true, knaller: knallerMitNaehe(), geo: LEIPZIG_TEST, filialen: FILIALEN_TEST });
    await pruefeLayout(page, `${lage} Döbeln`);
    await page.screenshot({ path: join(FOTOS, `${lage}-markt-doebeln.png`) });
    assert.equal(await page.evaluate(() => localStorage.getItem('mein-vorteil-woche-standort')), null, 'ohne Tipp kein Standort');
    await page.locator('[data-wo-ort="an"]').click();
    await page.waitForFunction(() => /um deinen Standort/.test(document.querySelector('.wo-ort')?.textContent || ''), null, { timeout: 10000 });
    const chips = (await page.locator('.wo-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
    assert.deepEqual(chips, ['Alle 4', 'Lidl 1', 'Kaufland 2', 'REWE 1']);
    const ort = nbsp(await page.locator('.wo-ort').innerText()).replace(/\s+/g, ' ');
    assert.match(ort, /Märkte mit Filiale bis 10 km um deinen Standort \(\d+ km von Döbeln\)/);
    assert.match(ort, /Keine Filiale in der Nähe: Aldi Nord \(nächste \d+ km\), Netto/, 'weit weg: ohne Adresse');
    assert.match(ort, /Die Prospekte gelten für Döbeln/);
    assert.match(ort, /Der Standort bleibt auf diesem Gerät/);
    const gespeichert = JSON.parse(await page.evaluate(() => localStorage.getItem('mein-vorteil-woche-standort')));
    assert.deepEqual([gespeichert.lat, gespeichert.lon], [51.34, 12.37], 'nur auf ~1 km gerundet gespeichert');
    // nichts mit Koordinaten verlassen das Gerät: nur die Filial-Liste (ohne Parameter außer dem Zeitstempel)
    assert.ok(z.abrufe.includes(FIL_PFAD));
    assert.ok(!z.abrufe.some(a => /51[.,]3|12[.,]3|lat|lon/i.test(a)), z.abrufe.join(' '));
    await pruefeLayout(page, `${lage} Standort`);
    await page.screenshot({ path: join(FOTOS, `${lage}-markt-standort-leipzig.png`) });
    await page.screenshot({ path: join(FOTOS, `${lage}-markt-standort-leipzig-ganz.png`), fullPage: true });
    // neu laden: Standort bleibt (Freigabe da -> still neu geortet), Filial-Liste aus dem Cache
    await page.reload();
    await wocheDa(page);
    await page.waitForFunction(() => /um deinen Standort/.test(document.querySelector('.wo-ort')?.textContent || ''), null, { timeout: 10000 });
    // „Döbeln“ = Standort vergessen
    await page.locator('[data-wo-ort="aus"]').click();
    await page.waitForFunction(() => /um Döbeln/.test(document.querySelector('.wo-ort')?.textContent || ''));
    assert.equal(await page.evaluate(() => localStorage.getItem('mein-vorteil-woche-standort')), null);
    assert.equal((await page.locator('.wo-chip').allInnerTexts()).length, 7);
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

test('Märkte vor Ort: Standort abgelehnt -> Hinweis, es gilt Döbeln; Filial-Liste fehlt -> Ersatz aus dem Ordner', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ knaller: knallerMitNaehe() });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (ok, nein) => setTimeout(() => nein({ code: 1, message: 'denied' }), 50) } });
  });
  await page.locator('[data-wo-ort="an"]').click();
  await page.waitForFunction(() => /nicht freigegeben/.test(document.querySelector('.wo-ort')?.textContent || ''));
  assert.match(nbsp(await page.locator('.wo-ort').innerText()), /Standort nicht freigegeben – es gilt Döbeln/);
  assert.equal((await page.locator('.wo-chip').allInnerTexts()).length, 7);
  // Radar-Liste nicht erreichbar (404): die Kopie im Ordner (mein-vorteil/filialen.json) springt ein
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: ok => setTimeout(() => ok({ coords: { latitude: 51.12, longitude: 13.12 } }), 50) } });
  });
  await page.locator('[data-wo-ort="an"]').click();
  await page.waitForFunction(() => /um deinen Standort|nicht erreichbar/.test(document.querySelector('.wo-ort')?.textContent || ''), null, { timeout: 10000 });
  assert.match(nbsp(await page.locator('.wo-ort').innerText()), /um deinen Standort/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});
