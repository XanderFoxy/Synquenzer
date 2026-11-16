// Reiter „Ausflüge“ (ausfluege.js + events.json vom Radar, 16.11.2026): Haken in index.html/sw.js, tolerantes Lesen,
// Filter (Art, Entfernung, Zeitraum), Ausweich auf die Liste, Browser: lazy, Filter tippen, Regelmäßig, Layout 428 × 926 und
// 926 × 428 (Tippflächen ≥ 44 px, nichts ragt raus). Fotos (deviceScaleFactor 2) nach $AUSFLUEGE_FOTOS.
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
const FOTOS = process.env.AUSFLUEGE_FOTOS || join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'ausfluege');
const EVENTS = readFileSync(join(FIX, 'ausfluege', 'events.json'), 'utf8');
const JETZT = '2026-11-16T10:00:00Z'; // Mo 16.11.2026

function modul() {
  const ctx = { window: {}, localStorage: { getItem: () => null, setItem: () => {} }, Intl, Date, console, URL };
  vm.runInNewContext(readFileSync(join(MV, 'ausfluege.js'), 'utf8'), ctx);
  return ctx.window.MeinVorteilAusfluege._intern;
}
const I = modul();
const plain = x => JSON.parse(JSON.stringify(x));

test('Haken: Leiste, Reiter-Seite, lazy Skript, Kachel, Worker; keine Emojis', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  assert.match(html, /<a href="#ausfluege" data-reiter="ausfluege" class="f-ausfluege">/);
  assert.match(html, /<section id="p-ausfluege" class="reiter-seite breite f-ausfluege"/);
  assert.match(html, /<symbol id="ic-ausfluege"/);
  assert.match(html, /REITER_START\.ausfluege = starteAusfluege/);
  assert.match(html, /if \(b === 'ausfluege'\) return ausflugKachel\(\);/);
  assert.doesNotMatch(html, /<script[^>]+src="ausfluege\.js"/, 'nur beim Öffnen laden');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /'ausfluege\.js': AUSFLUEGE/);
  assert.doesNotMatch(readFileSync(join(MV, 'ausfluege.js'), 'utf8'), /\p{Extended_Pictographic}/u);
});

test('Lesen: Vergangenes und Einträge ohne https-Quelle fallen weg, Doppel-ids einmal, Sortierung nach Datum', () => {
  const d = JSON.parse(EVENTS);
  d.termine.push({ ...d.termine[0] }, { id: 'alt', art: 'fest', titel: 'Vorbei', ab: '2026-10-01', bis: '2026-10-02', quelle: { name: 'x', url: 'https://x.de' } },
    { id: 'ohne', art: 'fest', titel: 'Ohne Quelle', ab: '2026-12-01', quelle: { url: 'http://x.de' } });
  const n = I.normalisiere(d, '2026-11-16');
  assert.ok(!n.termine.some(t => t.id === 'alt' || t.id === 'ohne'));
  assert.equal(n.termine.filter(t => t.id === d.termine[0].id).length, 1);
  const ab = n.termine.filter(t => t.ab).map(t => t.ab);
  assert.deepEqual(ab, [...ab].sort());
  assert.ok(n.regel.length >= 10);
  assert.ok(n.termine.every(t => t.quelle.url.startsWith('https://') && t.stand));
});

test('Filter: Zeitraum (Woche, Wochenende, Monat), Entfernung, Art', () => {
  assert.deepEqual(plain(I.zeitraum('wochenende', '2026-11-16')), ['2026-11-21', '2026-11-22']);
  assert.deepEqual(plain(I.zeitraum('wochenende', '2026-11-21')), ['2026-11-21', '2026-11-22']);
  assert.deepEqual(plain(I.zeitraum('wochenende', '2026-11-22')), ['2026-11-22', '2026-11-22']);
  assert.deepEqual(plain(I.zeitraum('woche', '2026-11-16')), ['2026-11-16', '2026-11-22']);
  const n = I.normalisiere(JSON.parse(EVENTS), '2026-11-16');
  const woche = I.filtere(n.termine, { art: 'alle', km: 60, zeit: 'woche' }, '2026-11-16');
  assert.ok(woche.every(t => t.ab && t.ab <= '2026-11-22'));
  const monat = I.filtere(n.termine, { art: 'fest', km: 30, zeit: 'monat' }, '2026-11-16');
  assert.ok(monat.length >= 2 && monat.every(t => t.art === 'fest' && (t.km == null || t.km <= 30)));
  assert.ok(monat.some(t => t.titel.includes('Freiberger')), 'Freiberg 28 km');
  assert.ok(!monat.some(t => t.titel.includes('Leipziger')), 'Leipzig > 30 km');
  assert.equal(I.datumText({ ab: '2026-11-24', bis: '2026-12-23' }, '2026-11-30'), 'läuft · bis Mi 23.12.');
  assert.equal(I.datumText({ ab: '2026-11-17', bis: '2026-11-17' }, '2026-11-16'), 'morgen · Di 17.11.');
});

test('Ausweich: recherchierte Liste ohne Radar-Datei (nur feste Termine, nichts Vergangenes)', () => {
  const liste = JSON.parse(readFileSync(join(WURZEL, 'vorteile', 'ausfluege.json'), 'utf8'));
  const n = I.normalisiere(liste, '2026-11-16');
  assert.equal(n.ausListe, true);
  assert.ok(n.termine.length >= 4 && n.termine.every(t => t.bis >= '2026-11-16'));
  assert.ok(n.regel.length >= 12);
});

// --- Browser -------------------------------------------------------------------------------------------------------------
let pw = null;
try { pw = createRequire(import.meta.url)('playwright'); } catch { /* nicht installiert */ }
const ohnePw = pw ? false : 'Playwright nicht installiert';
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const DATEI = {
  'schnaeppchen-daten/schnaeppchen/data/current.json': 'schnaeppchen-current.json',
  'vorteile-daten/vorteile/data/aktuell.json': 'vorteile-aktuell.json',
  'konzerte-daten/konzerte/data/konzerte.json': 'konzerte-konzerte.json',
  'konzerte-daten/konzerte/data/releases.json': 'konzerte-releases.json',
  'konzerte-daten/konzerte/data/status.json': 'konzerte-status.json',
};
let server, basis, browser;
const abrufe = [];
before(async () => {
  if (!pw) return;
  server = createServer(async (rq, rs) => {
    let pfad = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (pfad.endsWith('/')) pfad += 'index.html';
    if (/ausfluege\.js$/.test(pfad)) abrufe.push('ausfluege.js');
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

async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#ausfluege', foto = false, ohneRadar = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: foto ? 2 : 1, isMobile: true, hasTouch: true, locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block' });
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    const kopf = { 'access-control-allow-origin': '*' };
    if (rest === 'vorteile-daten/vorteile/data/events.json') return ohneRadar ? route.fulfill({ status: 404, headers: kopf, body: '' }) : route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: EVENTS });
    if (rest === 'vorteile-daten/vorteile/data/aktuell.json') {
      const d = JSON.parse(readFileSync(join(FIX, 'vertrag', DATEI[rest]), 'utf8'));
      d.status.events = { ok: true, kurz: JSON.parse(EVENTS).termine.length ? { n: 12, top: [{ titel: 'Freiberger Christmarkt mit Bergparade', ab: '2026-11-24', bis: '2026-12-22', ort: 'Freiberg', km: 28, art: 'fest' }] } : null };
      return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(d) });
    }
    if (!DATEI[rest]) return route.fulfill({ status: 404, headers: kopf, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', DATEI[rest])) });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, route => route.fulfill({ status: 204, body: '' }));
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push(String(e)));
  await page.clock.setFixedTime(new Date(JETZT));
  await page.goto(basis + pfad);
  if (pfad.endsWith('#ausfluege')) await page.waitForFunction(() => document.querySelector('#i-ausfluege .aus-chip') && !/Lade Ausflüge/.test(document.getElementById('i-ausfluege').textContent), null, { timeout: 10000 });
  return { ctx, page, fehler };
}
async function pruefeLayout(page, wo) {
  const r = await page.evaluate(() => {
    const zuKlein = [], raus = [];
    for (const el of document.querySelectorAll('#p-ausfluege button, #p-ausfluege a[href]')) {
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.textContent.trim().slice(0, 30)} ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    for (const el of document.querySelectorAll('#p-ausfluege .aus-karte')) { const b = el.getBoundingClientRect(); if (b.right > innerWidth + 1 || b.left < -1) raus.push(el.textContent.slice(0, 30)); }
    return { zuKlein, raus, breiter: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen ≥ 44 px`);
  assert.deepEqual(r.raus, [], `${wo}: Karten im Bild`);
  assert.equal(r.breiter, false, `${wo}: kein seitliches Scrollen`);
}

test('Browser: Start-Kachel ohne Abruf von ausfluege.js, Reiter lädt beim Öffnen', { skip: ohnePw }, async () => {
  abrufe.length = 0;
  const { ctx, page, fehler } = await oeffne({ pfad: '/mein-vorteil/' });
  await page.waitForSelector('#kacheln a[data-sprung="ausfluege"]');
  assert.match(await page.locator('#kacheln a[data-sprung="ausfluege"]').innerText(), /Freiberger Christmarkt[\s\S]*ab 24\.11\. · Freiberg · 28 km/);
  assert.equal(abrufe.length, 0, 'lazy');
  await page.locator('.sprung a[data-reiter="ausfluege"]').click();
  await page.waitForFunction(() => document.querySelector('#i-ausfluege .aus-karte'));
  assert.equal(abrufe.length, 1);
  assert.match(await page.locator('#ort-name').innerText(), /Ausflüge/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Browser: Filter tippen, Regelmäßig, Ausweich ohne Radar-Datei; Layout hochkant + quer, Fotos', { skip: ohnePw }, async () => {
  for (const [breite, hoehe, name] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe, foto: true });
    await page.evaluate(() => localStorage.removeItem('mein-vorteil-ausfluege-filter'));
    const karten = () => page.locator('#i-ausfluege .aus-karte').count();
    assert.ok(await karten() >= 4, 'Monat bis 60 km: Weihnachtsmärkte');
    await pruefeLayout(page, name);
    await page.screenshot({ path: join(FOTOS, `ausfluege-termine-${name}.png`), fullPage: false });
    await page.locator('[data-aus="km"][data-wert="30"]').click();
    const t = await page.locator('#i-ausfluege').innerText();
    assert.match(t, /Freiberger/); assert.doesNotMatch(t, /Leipziger Weihnachtsmarkt/);
    await page.locator('[data-aus="zeit"][data-wert="wochenende"]').click();
    assert.match(await page.locator('#i-ausfluege').innerText(), /In diesem Zeitraum nichts bis 30 km/);
    await page.locator('[data-aus="art"][data-wert="testen"]').click();
    assert.match(await page.locator('#i-ausfluege').innerText(), /Immer möglich[\s\S]*Ableton/);
    await page.locator('[data-aus="ansicht"][data-wert="regel"]').click();
    await page.locator('[data-aus="art"][data-wert="alle"]').click();
    const r = await page.locator('#i-ausfluege').innerText();
    assert.match(r, /Gratis-Tage[\s\S]*Gratis Comic Tag[\s\S]*nächster: Sa 08\.05\./);
    assert.match(r, /Produkttests & Beta[\s\S]*seriös/);
    assert.match(r, /Vorsicht/);
    await pruefeLayout(page, name + ' Regelmäßig');
    await page.screenshot({ path: join(FOTOS, `ausfluege-regelmaessig-${name}.png`), fullPage: false });
    assert.deepEqual(fehler, []);
    await ctx.close();
  }
  const { ctx, page } = await oeffne({ ohneRadar: true });
  await page.locator('[data-aus="ansicht"][data-wert="termine"]').click();
  await page.locator('[data-aus="zeit"][data-wert="alle"]').click();
  const t = await page.locator('#i-ausfluege').innerText();
  assert.match(t, /Striezelmarkt/);
  assert.match(t, /Entfernungen kommen mit dem nächsten Radar-Lauf/);
  await ctx.close();
});
