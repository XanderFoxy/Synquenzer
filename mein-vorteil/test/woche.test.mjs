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
const KNALLER = JSON.parse(readFileSync(join(FIX, 'knaller.json'), 'utf8'));
const plain = x => JSON.parse(JSON.stringify(x));
const nbsp = s => s.replace(/[  ]/g, ' ');

function modul() {
  const ctx = { window: {}, localStorage: { getItem: () => null, setItem: () => {} }, Intl, Date, console };
  vm.runInNewContext(readFileSync(join(MV, 'woche.js'), 'utf8'), ctx);
  return ctx.window.MeinVorteilWoche;
}

// --- statisch ------------------------------------------------------------------------------------------------------------
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
  assert.match(sw, /const CACHE = 'mein-vorteil-([4-9]|\d\d)'/); // ab 4 (Woche), 5 = Ausflüge
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

async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#woche', foto = false, speicher = null, kurz = true, knaller = KNALLER, bildVerzug = 0, jetzt = JETZT, snackBilder = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: foto ? 2 : 1, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block',
  });
  const z = { abrufe: [], offline: false, knaller };
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    z.abrufe.push(rest);
    const kopf = { 'access-control-allow-origin': '*' };
    if (z.offline) return route.abort('internetdisconnected');
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
      d.status.knaller = { ok: true, anzahl: 0, kurz: { anzahl: 13, ab: { 30: 13, 40: 7, 50: 2 }, top: [
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

test('Stufen 30/40/50 % und Märkte: Zähler, Gruppen, gemerkte Wahl, leere Wahl mit Knopf, Kachel-Zahl folgt der Stufe', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  // Standard 30 %: alle 13, nach Rabatt gruppiert, „Ab Montag“ unten
  assert.equal(await kacheln(page).count(), 13);
  assert.deepEqual((await page.locator('.wo-stufe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 30 % 13', 'ab 40 % 7', 'ab 50 % 2']);
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
  assert.deepEqual((await page.locator('.wo-stufe').allInnerTexts()).map(t => t.replace(/\s+/g, ' ')), ['ab 30 % 2', 'ab 40 % 2', 'ab 50 % 1'], 'Stufen zählen im gewählten Markt');
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
