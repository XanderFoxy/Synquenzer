// Reiter „Filme“ – neue Bereiche (28.11.2026): Most Wanted, Advent, Alle 3,99 €, Staffeln 4,99 €, Musik, Sammlung (#besitz=…).
// Daten: test/fixtures/filme-neu/ (mit den echten Radar-Modulen aus nachgebauten Apple-Antworten erzeugt, ausgedachte Titel/Preise).
// Geräte: iPhone 12 Pro Max hoch/quer (428 × 926, 926 × 428) und ein aufgeklapptes Falt-iPhone (760 × 1000). Fotos nach
// $MV_SHOTS/filme-neu/ (sonst Temp-Verzeichnis), nie ins Repo.
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
const NEU = join(FIX, 'filme-neu');
const FOTOS = join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'filme-neu');
const JETZT = '2026-12-04T10:30:00Z'; // 11:30 Berliner Zeit, Daten von 11:05
const PFAD = 'vorteile-daten/vorteile/data/';
const DATEN = { 'filme.json': 'filme.json', 'filmkatalog.json': 'filmkatalog.json', 'musikstore.json': 'musikstore.json' };
const FILME = JSON.parse(readFileSync(join(NEU, 'filme.json'), 'utf8'));

function modul(speicher = {}) {
  const localStorage = { getItem: k => (k in speicher ? speicher[k] : null), setItem: (k, v) => { speicher[k] = String(v); }, removeItem: k => { delete speicher[k]; } };
  const ctx = { window: {}, localStorage, Intl, Date, console };
  vm.runInNewContext(readFileSync(join(MV, 'filme.js'), 'utf8'), ctx);
  return { F: ctx.window.MeinVorteilFilme, speicher };
}
const plain = x => JSON.parse(JSON.stringify(x));

test('Sammlung: Titel-Vergleich (Jahr, Artikel, römische Zahlen, Untertitel nur mit Jahr), Zeilen aus Link/Feld', () => {
  const I = modul().F._intern;
  assert.equal(I.besitzKey('Der Pate (1972)'), 'pate');
  assert.equal(I.besitzKey('Zurück in die Zukunft II'), I.besitzKey('Zurück in die Zukunft 2'));
  assert.equal(I.besitzKey('Bill & Ted'), 'bill und ted');
  const b = { liste: ['Jurassic Park (1993)', 'Ghostbusters (1984)', 'Star Trek', 'Go Trabi Go'].map(I.besitzEintrag) };
  const hat = (titel, jahr) => I.besitzt({ titel, jahr, typ: 'film' }, b);
  assert.ok(hat('Jurassic Park', 1993)); assert.ok(hat('Jurassic Park', 1994), '±1 Jahr');
  assert.ok(!hat('Jurassic Park', 2001), 'anderes Jahr');
  assert.ok(hat('Ghostbusters – Die Geisterjäger', 1984), 'Untertitel mit passendem Jahr');
  assert.ok(!hat('Ghostbusters – Legacy', 2021));
  assert.ok(hat('Star Trek', 2009)); assert.ok(!hat('Star Trek: Nemesis', 2002), 'Untertitel ohne Jahr in der Liste zählt nicht');
  assert.ok(hat('Go Trabi Go', 1991)); assert.ok(!hat('Go Trabi Go 2 – Das war der wilde Osten', 1992), 'Fortsetzung ist ein anderer Film');
  assert.ok(!I.besitzt({ titel: 'Jurassic Park Box', typ: 'box' }, b), 'Boxen nie');
  assert.deepEqual(plain(I.besitzZeilen('A|B; C\nD\r\n\n  ')), ['A', 'B', 'C', 'D']);
});

test('Neue Daten: Most Wanted, Reihen, Advent, Zusatz gelesen; neue Bereiche nur mit neuen Daten; alte Datei unverändert', () => {
  const I = modul().F._intern;
  const n = plain(I.normalisiere(FILME));
  assert.equal(n.neu, true);
  assert.deepEqual(n.most.reihen.map(r => [r.name, r.filme.length]), [['Dino-Park', 4], ['Trabbi-Tour', 2]]);
  assert.deepEqual(n.most.reihen[0].filme.map(t => [t.titel, t.preis, t.imStore, t.unterAlarm]), [['Dino-Park', 3.99, true, true], ['Dino-Park II: Die Insel', 9.99, true, false], ['Dino-Park III', 3.99, true, true], ['Dino-Welt', null, false, false]]);
  assert.equal(n.most.serien[0].staffeln.length, 4); assert.equal(n.most.serien[0].ausgeblendet, 1);
  assert.deepEqual(Object.keys(n.advent.tage), ['2026-12-01', '2026-12-02', '2026-12-04']);
  assert.equal(n.zusatz.katalog.filme399, 64);
  const chips = plain(I.sichtbar(n)).map(c => c[0]);
  for (const k of ['most', 'advent', 'alle399', 'staffeln', 'musik', 'sammlung']) assert.ok(chips.includes(k), k);
  assert.deepEqual(chips.slice(0, 4), ['wunsch', 'most', 'advent', 'fuer399']);
  // alte Datei (07.11.2026): kein neuer Bereich, auch ohne Sammlung
  const alt = plain(I.normalisiere(JSON.parse(readFileSync(join(FIX, 'filme.json'), 'utf8'))));
  assert.equal(alt.neu, false);
  assert.ok(!plain(I.sichtbar(alt)).some(([k]) => I.NEU_CHIPS.has(k)));
  // CSS bleibt bei eigenen Klassen
  const css = I.CSS().replace(/\/\*[\s\S]*?\*\//g, '');
  for (const s of [...css.matchAll(/(^|})\s*([^{}]+)\{/g)].flatMap(m => m[2].split(',').map(x => x.trim())).filter(Boolean)) assert.match(s, /^(a)?\.fi(-|\b)/, s);
  // keine Emoji-Grafik in Skript und Daten der Seite
  assert.doesNotMatch(readFileSync(join(MV, 'filme.js'), 'utf8'), /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
});

test('index.html: #besitz= wird im <head> übernommen (nur localStorage, Adresse sofort ohne Fragment) – Krypto-Import bleibt', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  const kopf = html.slice(0, html.indexOf('</head>'));
  assert.match(kopf, /const BESITZ_IMPORT = \(\(\) => \{/);
  assert.match(kopf, /if \(!\/\^#besitz=\/i\.test\(location\.hash\)\) return null;/);
  assert.match(kopf, /history\.replaceState\(history\.state, '', location\.pathname \+ location\.search \+ '#filme'\)/);
  assert.match(kopf, /const KRYPTO_IMPORT = /);
  const block = kopf.slice(kopf.indexOf('const BESITZ_IMPORT'));
  assert.doesNotMatch(block.slice(0, block.indexOf('})();')), /fetch|XMLHttpRequest|sendBeacon|console\./, 'nie senden, nie loggen');
  assert.doesNotMatch(html, /filme\.json|filmkatalog\.json|musikstore\.json/, 'Daten-Adressen nur in filme.js');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /const CACHE = 'mein-vorteil-14'/);
});

// --- Browser ----------------------------------------------------------------------------------------------------------------------
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

const ANDERE = {
  'schnaeppchen-daten/schnaeppchen/data/current.json': 'schnaeppchen-current.json', 'vorteile-daten/vorteile/data/aktuell.json': 'vorteile-aktuell.json',
  'konzerte-daten/konzerte/data/konzerte.json': 'konzerte-konzerte.json', 'konzerte-daten/konzerte/data/releases.json': 'konzerte-releases.json',
  'konzerte-daten/konzerte/data/status.json': 'konzerte-status.json',
};
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#3a5a7a"/></svg>';
async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#filme', speicher = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'de-DE', timezoneId: 'Europe/Berlin', serviceWorkers: 'block' });
  const z = { abrufe: [], alle: [] };
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    z.abrufe.push(rest);
    const kopf = { 'access-control-allow-origin': '*' };
    if (rest.startsWith(PFAD) && DATEN[rest.slice(PFAD.length)]) return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(NEU, DATEN[rest.slice(PFAD.length)])) });
    if (ANDERE[rest]) return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', ANDERE[rest])) });
    return route.fulfill({ status: 404, headers: kopf, body: '' });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }).catch(() => {}));
  if (speicher) await ctx.addInitScript(s => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, speicher);
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  page.on('request', r => z.alle.push(r.url()));
  await page.clock.setFixedTime(new Date(JETZT));
  await page.goto(basis + pfad);
  await page.waitForFunction(() => document.querySelector('#p-filme .fi-chips') && !/Lade Filme/.test(document.getElementById('p-filme').textContent), null, { timeout: 10000 });
  return { ctx, page, fehler, z };
}
const chip = (page, k) => page.locator(`[data-fi-chip="${k}"]`);
async function waehle(page, k) {
  await chip(page, k).click();
  await page.waitForFunction(k => document.getElementById('fi-liste')?.getAttribute('aria-labelledby') === 'fi-c-' + k && !/Lade (den Katalog|Musik)/.test(document.getElementById('fi-liste').textContent), k);
}
const nbsp = s => s.replace(/[  ]/g, ' ');
async function pruefeLayout(page, wo) {
  const r = await page.evaluate(() => {
    const zuKlein = [];
    for (const el of document.querySelectorAll('#p-filme button, #p-filme a[href], #p-filme summary, #p-filme [role="tab"]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[hidden]') || el.closest('details:not([open]) > :not(summary)')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 30)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    return { zuKlein, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth };
  });
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  const vw = page.viewportSize().width;
  assert.ok(r.sw <= vw && r.bw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${vw})`);
}

test('Most Wanted: Start-Bereich bei neuem Alarm, Reihen mit Status/Alarm, Serie mit „ab“-Preis und Staffeln, Haken = Sammlung', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne();
  assert.equal(await chip(page, 'most').getAttribute('aria-selected'), 'true', 'neuer Alarm holt Most Wanted nach vorn');
  assert.ok(!z.abrufe.some(a => /filmkatalog|musikstore/.test(a)), 'Katalog und Musik erst beim Öffnen ihres Bereichs');
  const liste = page.locator('#fi-liste');
  assert.match(nbsp(await liste.locator('.fi-mw-kopf').innerText()), /3 unter deiner Alarm-Schwelle · Alarm: Filme bis 3,99 €, Staffeln bis 4,99 €/);
  assert.match(nbsp(await liste.locator('h3').first().innerText()), /Dino-Park\s+3 von 4 im Store/);
  const welt = liste.locator('.fi-mwz', { hasText: 'Dino-Welt' });
  assert.match(await welt.innerText(), /nicht im Apple-Store/);
  const eins = liste.locator('.fi-mwz', { hasText: 'Dino-Park (1993)' }).first();
  assert.match(nbsp(await eins.innerText()), /3,99 €[\s\S]*unter Alarm/);
  const zwei = liste.locator('.fi-mwz', { hasText: 'Dino-Park II: Die Insel' });
  assert.match(nbsp(await zwei.innerText()), /Alarm bis 3,99 €/);
  // Serie: ab-Preis, Tiefst, Neuauflage ausgeblendet, Staffeln aufklappbar
  const serie = liste.locator('.fi-serie', { hasText: 'Nachtfahrer' });
  const st = nbsp(await serie.innerText());
  assert.match(st, /Nachtfahrer \(1982–1986\)/); assert.match(st, /ab 4,99 €/); assert.match(st, /unter Alarm/);
  assert.match(st, /1 gleichnamige Staffel aus anderen Jahren ausgeblendet/);
  await serie.locator('summary').click();
  assert.equal(await serie.locator('details .fi-karte').count(), 4);
  assert.match(await liste.locator('.fi-serie', { hasText: 'Sternenreiter' }).innerText(), /nicht im Apple-Store/);
  // Haken: kommt in die Sammlung (nur localStorage), Zähler der Sammlung steigt
  const vorher = Number(await chip(page, 'sammlung').locator('.fi-n').innerText());
  await zwei.locator('.fi-haken').click();
  await page.waitForFunction(() => document.querySelector('.fi-mwz .fi-haken.fi-an'));
  assert.equal(await liste.locator('.fi-mwz', { hasText: 'Dino-Park II: Die Insel' }).locator('.fi-haken').getAttribute('aria-pressed'), 'true');
  assert.equal(Number(await chip(page, 'sammlung').locator('.fi-n').innerText()), vorher + 1);
  assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem('mein-vorteil-filme-besitz'))).roh, ['Dino-Park II: Die Insel (1997)']);
  assert.match(nbsp(await liste.locator('h3').first().innerText()), /1 hast du/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Advent: 31 Türchen, heute markiert, Tag mit Angebot zeigt die Karte, künftiger Tag „noch zu“, leerer Tag ehrlich', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ speicher: { 'mein-vorteil-filme-most-gesehen': '"x"' } });
  await waehle(page, 'advent');
  const tueren = page.locator('.fi-tuer');
  assert.equal(await tueren.count(), 31);
  assert.equal(await page.locator('.fi-tuer[aria-pressed="true"]').innerText(), '4');
  assert.equal(await page.locator('.fi-tuer.fi-hat').count(), 3);
  assert.match(nbsp(await page.locator('#fi-liste .fi-karte').first().innerText()), /Lichterkette[\s\S]*3,99 €/);
  await page.locator('[data-fi-tuer="2026-12-02"]').click();
  assert.match(await page.locator('#fi-liste .fi-karte').first().innerText(), /Schneesturm/);
  assert.match(await page.locator('#fi-liste .fi-karte').first().innerText(), /Tipp von mydealz/);
  await page.locator('[data-fi-tuer="2026-12-03"]').click();
  assert.match(await page.locator('#fi-liste .fi-leer').innerText(), /kein Tagesangebot gesehen/);
  await page.locator('[data-fi-tuer="2026-12-20"]').click();
  assert.match(await page.locator('#fi-liste .fi-leer').innerText(), /noch zu/);
  assert.match(await page.locator('#fi-liste .fi-fuss').innerText(), /nur in der TV-App/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Alle 3,99 € und Staffeln 4,99 €: Katalog erst beim Öffnen, Genre-Spalten mit Zahl, „weitere zeigen“, ehrlicher Hinweis', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne({ speicher: { 'mein-vorteil-filme-most-gesehen': '"x"' } });
  assert.equal(nbsp(await chip(page, 'alle399').innerText()).replace(/\s+/g, ' ').trim(), 'Alle 3,99 € 64', 'vor dem Laden: Zahl aus filme.json');
  await waehle(page, 'alle399');
  assert.equal(z.abrufe.filter(a => a.endsWith('filmkatalog.json')).length, 1);
  assert.equal(nbsp(await chip(page, 'alle399').innerText()).replace(/\s+/g, ' ').trim(), 'Alle 3,99 € 68', 'nach dem Laden: Zahl aus dem Katalog');
  assert.match(nbsp(await page.locator('.fi-mw-kopf').innerText()), /68 Filme für 3,99 € · der Radar kennt 84 Filme, 84 frisch geprüft/);
  const sub = (await page.locator('.fi-sub .fi-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
  assert.deepEqual(sub, ['Alle 68', 'Action & Abenteuer 22', 'Komödie 18', 'Kinder & Familie 12', 'Thriller 8', 'Drama 6']);
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 40);
  await page.locator('[data-fi-mehr="alle399"]').click();
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 68);
  await page.locator('.fi-sub [data-fi-sub="4416"]').click();
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 8);
  assert.match(await page.locator('#fi-liste .fi-fuss').innerText(), /nur die 100 meistgekauften/);
  // Auswahl bleibt gemerkt; Staffeln 4,99 € aus derselben Datei (kein zweiter Abruf)
  await waehle(page, 'staffeln');
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 6);
  assert.match(nbsp(await page.locator('#fi-liste .fi-karte').first().innerText()), /Serie \w+, Staffel \d[\s\S]*4,99 €/);
  assert.equal(z.abrufe.filter(a => a.endsWith('filmkatalog.json')).length, 1);
  // Boxen: Inhalt aus dem Katalog („einzeln …“)
  await waehle(page, 'boxen');
  assert.match(nbsp(await page.locator('#fi-liste .fi-karte', { hasText: 'Dino-Park 3-Film-Box' }).innerText()), /einzeln: 3 Filme bekannt, 2 je 3,99 €/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Musik: erst beim Öffnen, Alben (gesenkt zuerst) und Songs, Genre-Spalten, nicht gefundene Künstler ehrlich genannt', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, z } = await oeffne({ speicher: { 'mein-vorteil-filme-most-gesehen': '"x"' } });
  assert.ok(!z.abrufe.some(a => a.endsWith('musikstore.json')));
  await waehle(page, 'musik');
  assert.equal(z.abrufe.filter(a => a.endsWith('musikstore.json')).length, 1);
  const erste = nbsp(await page.locator('#fi-liste .fi-karte').first().innerText());
  assert.match(erste, /Kaltes Herz[\s\S]*Die Pulsare[\s\S]*5,99 €[\s\S]*gesenkt[\s\S]*statt 9,99 €/);
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 4);
  await page.locator('[data-fi-subart="musikArt"][data-fi-sub="songs"]').click();
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 6);
  await page.locator('[data-fi-subart="musikGenre"][data-fi-sub="Heavy Metal"]').click();
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), 2);
  assert.match(await page.locator('#fi-liste .fi-fuss').innerText(), /nicht gefunden: Unbekannt XY/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Sammlung per Link (#besitz=…): Adresse sofort ohne Liste, nichts geht ins Netz, Hinweis, Reihen-Fortschritt, markieren/ausblenden', { skip: ohnePw }, async () => {
  const liste = ['Polizeischule 1 (1984)', 'Polizeischule 2', 'Manta Manta', 'Dino-Park (1993)'].map(encodeURIComponent).join('|');
  const { ctx, page, fehler, z } = await oeffne({ pfad: `/mein-vorteil/#besitz=${liste}` });
  assert.equal(await page.evaluate(() => location.hash), '#filme');
  assert.ok(!z.alle.some(u => /Polizeischule|besitz|Manta%20Manta/i.test(u)), 'die Liste geht nie an einen Server');
  assert.equal(await chip(page, 'sammlung').getAttribute('aria-selected'), 'true');
  assert.match(await page.locator('.fi-ok').innerText(), /4 Titel übernommen – jetzt 4 in deiner Sammlung/);
  const reihe = nbsp(await page.locator('.fi-reihe', { hasText: 'Polizeischule' }).innerText());
  assert.match(reihe, /2 von 7/); assert.match(reihe, /es fehlen: Polizeischule 3/);
  assert.match(nbsp(await page.locator('.fi-reihe', { hasText: 'Dino-Park' }).innerText()), /1 von 4[\s\S]*günstigster fehlender: Dino-Park III für 3,99 €/);
  // suchen + hinzufügen
  await page.locator('[data-fi-besitz-suche]').fill('trabbi');
  await page.waitForFunction(() => document.querySelectorAll('#fi-besitz-treffer .fi-haken').length > 0);
  await page.locator('#fi-besitz-treffer .fi-haken').first().click();
  await page.waitForFunction(() => /5 Titel in deiner Sammlung/.test(document.getElementById('fi-liste').textContent));
  // markieren: Manta Manta unter „Für 3,99 €“ mit „habe ich“; ausblenden: weg
  await waehle(page, 'fuer399');
  assert.match(await page.locator('#fi-liste .fi-karte', { hasText: 'Manta Manta' }).first().innerText(), /habe ich/);
  const n = await page.locator('#fi-liste .fi-karte').count();
  await waehle(page, 'sammlung');
  await page.locator('[data-fi-besitz="modus:ausblenden"]').click();
  await waehle(page, 'fuer399');
  assert.equal(await page.locator('#fi-liste .fi-karte', { hasText: 'Manta Manta' }).count(), 0);
  assert.equal(await page.locator('#fi-liste .fi-karte').count(), n - 1);
  // Most Wanted bleibt vollständig (zeigt, was fehlt), mit gesetztem Haken
  await waehle(page, 'most');
  assert.equal(await page.locator('.fi-mwz', { hasText: 'Dino-Park (1993)' }).first().locator('.fi-haken').getAttribute('aria-pressed'), 'true');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer'], [760, 1000, 'falt']]) {
  test(`Layout ${breite}×${hoehe} (${lage}): neue Bereiche ohne seitliches Scrollen, Tippflächen ≥ 44 px, Foto je Bereich`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe, speicher: { 'mein-vorteil-filme-besitz': JSON.stringify({ v: 1, roh: ['Dino-Park (1993)', 'Polizeischule 1'], modus: 'markieren' }) } });
    for (const k of ['most', 'advent', 'alle399', 'staffeln', 'musik', 'sammlung', 'boxen']) {
      await waehle(page, k);
      if (k === 'most') await page.locator('.fi-serie summary').first().click();
      await pruefeLayout(page, `${lage} ${k}`);
      await page.screenshot({ path: join(FOTOS, `${lage}-${k}.png`), fullPage: true });
    }
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}
