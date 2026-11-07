// Reiter „Filme“ (filme.js): statische Prüfungen (Vertrag, tolerantes Lesen, Haken in index.html/sw.js) und Browser-Tests
// mit test/fixtures/filme.json (Stand 07.11.2026 14:05). Fotos (iPhone 12 Pro Max, hoch + quer) nach $MV_SHOTS/filme/, sonst ins
// Temp-Verzeichnis – wie seite.test.mjs, damit keine Bilder im Repo (und auf GitHub Pages) landen.
// Seit MV2 (Abschnitte statt Reiter) hängt „Filme“ am Einhängepunkt der Sprung-Leiste: <a data-reiter="filme">, eigene Seite
// #p-filme nach </main>, REITER_START.filme / REITER_NEU.filme.
// Aufruf: cd mein-vorteil && npm test   (ohne Playwright laufen nur die statischen Prüfungen)
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
const FOTOS = join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'filme');
const JETZT = '2026-11-07T15:00:00Z'; // 16:00 Berliner Zeit, Daten von 14:05
const FILME_PFAD = 'vorteile-daten/vorteile/data/filme.json';
const FILME = JSON.parse(readFileSync(join(FIX, 'filme.json'), 'utf8'));
const GRUPPEN = ['wunsch', 'angebot', 'neu', 'achtziger', 'serien', 'disney'];

// filme.js ohne Browser laden (reine Funktionen über _intern)
function modul(speicher = {}) {
  const localStorage = { getItem: k => (k in speicher ? speicher[k] : null), setItem: (k, v) => { speicher[k] = String(v); } };
  const ctx = { window: {}, localStorage, Intl, Date, console };
  vm.runInNewContext(readFileSync(join(MV, 'filme.js'), 'utf8'), ctx);
  return { F: ctx.window.MeinVorteilFilme, speicher };
}

const plain = x => JSON.parse(JSON.stringify(x)); // Ergebnis aus vm (anderer Realm) -> normale Objekte

// --- statisch ------------------------------------------------------------------------------------------------------------
test('Vertrag: Fixture filme.json hat alle Gruppen und Felder', () => {
  assert.equal(FILME.version, 1);
  assert.ok(!Number.isNaN(Date.parse(FILME.aktualisiert)));
  const n = Object.fromEntries(GRUPPEN.map(g => [g, FILME.gruppen[g].length]));
  assert.deepEqual(n, { wunsch: 4, angebot: 6, neu: 6, achtziger: 10, serien: 14, disney: 8 });
  const w = FILME.gruppen.wunsch;
  assert.equal(w.filter(t => t.fehlt === true).length, 1, 'ein Wunschtitel nicht im Store');
  assert.ok(w.some(t => t.angebot && t.preis === 3.99 && t.istTiefst), 'ein Wunschtitel im Angebot für 3,99 € mit Tiefstpreis');
  const felder = ['id', 'typ', 'titel', 'jahr', 'genre', 'preis', 'preisSd', 'preisHd', 'leihe', 'vorher', 'tiefst', 'seit', 'tage', 'istTiefst', 'angebot', 'bild', 'link', 'chart', 'quelle'];
  for (const g of GRUPPEN) for (const t of FILME.gruppen[g]) {
    for (const f of felder) assert.ok(f in t, `${g}/${t.titel}: Feld ${f} fehlt`);
    assert.match(t.id, /^(itunes:\d+|wunsch:[a-z0-9-]+)$/);
    assert.ok(['film', 'staffel'].includes(t.typ));
    assert.doesNotMatch(String(t.genre), /horror/i, 'kein Horror');
    if (t.link) assert.match(t.link, /^https:\/\/itunes\.apple\.com\/de\//);
    if (t.tiefst) assert.ok(t.tiefst.p > 0 && /^\d{4}-\d\d-\d\d$/.test(t.tiefst.tag));
  }
  const s = FILME.gruppen.serien;
  for (const name of ['Rick and Morty', 'Star Trek: The Next Generation']) {
    assert.deepEqual(s.filter(t => t.titel.startsWith(name + ',')).map(t => +t.titel.match(/\d+$/)[0]).sort(), [1, 2, 3, 4, 5, 6, 7], name);
  }
  assert.ok(s.some(t => t.angebot) && s.some(t => !t.angebot), 'einige Staffeln im Angebot');
  assert.ok(FILME.gruppen.neu.every(t => t.jahr >= 2025 && t.chart > 0));
});

test('filme.js liest tolerant: Einzelobjekt, Preis -1, ohne Titel, Zahlen als Text, kaputte Links', () => {
  const { F } = modul();
  const I = F._intern;
  const n = plain(I.normalisiere({
    aktualisiert: '2026-11-07T13:05:00Z',
    gruppen: {
      disney: { id: 'itunes:1', typ: 'film', titel: 'Aladdin', preis: '9,99', jahr: '1992-11-25T08:00:00Z', bild: 'https://is1-ssl.mzstatic.com/a/b/100x100bb.jpg' },
      angebot: [
        { id: 'itunes:2', titel: 'Stirb langsam', preis: -1, preisHd: -1, preisSd: 3.99, link: 'javascript:alert(1)' },
        { id: 'itunes:3', preis: 3.99 }, // ohne Titel
        { id: 'itunes:4', titel: '   ' },
        null, 'Quatsch',
        { id: 'itunes:2', titel: 'Stirb langsam (doppelt)', preis: 3.99 },
      ],
      neu: 'kaputt',
      serien: [{ titel: 'Star Trek: Picard – Staffel 3', typ: 'staffel', preis: 9.99, angebot: true, tiefst: { p: 'x' } }],
    },
  }));
  assert.deepEqual(n.gruppen.disney.map(t => [t.titel, t.preis, t.jahr, t.bild]), [['Aladdin', 9.99, 1992, 'https://is1-ssl.mzstatic.com/a/b/200x200bb.jpg']]);
  assert.equal(n.gruppen.angebot.length, 1, 'ohne Titel / doppelt / kein Objekt fällt weg');
  assert.equal(n.gruppen.angebot[0].preis, 3.99, 'Preis -1 -> SD-Preis');
  assert.equal(n.gruppen.angebot[0].link, null, 'nur https-Links');
  assert.deepEqual(n.gruppen.neu, []);
  assert.deepEqual(n.gruppen.wunsch, []);
  assert.equal(n.gruppen.serien[0].tiefst, null);
  assert.deepEqual(plain(I.normalisiere(null).gruppen.wunsch), []);
  assert.deepEqual(plain(I.normalisiere({ gruppen: [] }).gruppen.angebot), []);
  // Serie + Staffel aus dem Titel
  for (const [titel, serie, nr] of [
    ['Rick and Morty, Staffel 3', 'Rick and Morty', 3], ['Star Trek: The Next Generation, Season 7', 'Star Trek: The Next Generation', 7],
    ['Star Trek: Picard – Staffel 2', 'Star Trek: Picard', 2], ['Star Trek: Discovery (Staffel 5)', 'Star Trek: Discovery', 5],
    ['Star Trek: Die komplette Serie', 'Star Trek: Die komplette Serie', null],
  ]) {
    assert.equal(I.serieVon({ titel }), serie, titel);
    assert.equal(I.staffelNr({ titel }), nr, titel);
  }
  // „Tiefstpreis“-Abzeichen nur, wenn es etwas heißt
  assert.equal(I.zeigeTiefst({ istTiefst: true, preis: 29.99, vorher: null, angebot: false }), false, 'Preis nie bewegt');
  assert.equal(I.zeigeTiefst({ istTiefst: true, preis: 7.99, vorher: 9.99, angebot: false }), true, 'gesenkt');
  assert.equal(I.zeigeTiefst({ istTiefst: true, preis: 3.99, vorher: null, angebot: false }), true, '≤ 3,99 €');
  assert.equal(I.zeigeTiefst({ istTiefst: false, preis: 3.99, vorher: 9.99, angebot: true }), false);
  // CSS: nur eigene Klassen (.fi-…), damit nichts auf der Seite verstellt wird
  const css = I.CSS().replace(/\/\*[\s\S]*?\*\//g, '');
  const selektoren = [...css.matchAll(/(^|})\s*([^{}]+)\{/g)].flatMap(m => m[2].split(',').map(x => x.trim())).filter(Boolean);
  assert.ok(selektoren.length > 20);
  for (const s of selektoren) assert.match(s, /^(a)?\.fi(-|\b)/, `fremder Selektor: ${s}`);
});

test('Echte Scanner-Ausgabe (test/fixtures/filme-scanner.json aus „npm run probe“ im Vorteils-Radar) wird gelesen und gezeichnet', () => {
  const roh = JSON.parse(readFileSync(join(FIX, 'filme-scanner.json'), 'utf8'));
  const { F } = modul();
  const I = F._intern;
  const n = plain(I.normalisiere(roh));
  for (const g of GRUPPEN) assert.equal(n.gruppen[g].length, (Array.isArray(roh.gruppen[g]) ? roh.gruppen[g] : []).filter(t => t?.titel).length, g);
  assert.ok(n.gruppen.wunsch.some(t => t.fehlt), 'Go Trabi Go nicht im Store');
  assert.ok(n.gruppen.wunsch.some(t => t.unterZiel && t.ziel === 4.99), 'Manta Manta unter dem Ziel');
  assert.ok(n.gruppen.angebot.some(t => /mydealz/.test(t.quelle)));
  // Staffeln nach dem Feld „serie“ des Scanners
  assert.deepEqual([...new Set(n.gruppen.serien.map(t => I.serieVon(t)))].sort(), ['Rick and Morty', 'Star Trek: Das nächste Jahrhundert']);
  for (const g of GRUPPEN) for (const t of n.gruppen[g]) {
    const html = I.karte(t, t.typ === 'staffel');
    assert.match(html, /class="fi-karte/);
    if (t.link) assert.match(html, /target="_blank" rel="noopener"/);
  }
});

test('Start-Chip: Wunschliste bei neuem Wunsch-Angebot, sonst der gemerkte, sonst „Angebote“', () => {
  const { F, speicher } = modul();
  const I = F._intern;
  const mit = I.normalisiere(FILME);
  assert.equal(I.startChip(mit), 'wunsch', 'Manta Manta im Angebot');
  speicher['mein-vorteil-filme-chip'] = JSON.stringify('disney');
  assert.equal(I.startChip(mit), 'disney', 'schon gesehen -> gemerkter Chip');
  const ohne = I.normalisiere({ gruppen: { wunsch: FILME.gruppen.wunsch.map(t => ({ ...t, angebot: false, unterZiel: false })) } });
  assert.equal(I.startChip(ohne), 'disney');
  delete speicher['mein-vorteil-filme-chip'];
  assert.equal(I.startChip(ohne), 'angebot');
  assert.equal(I.startChip(mit), 'wunsch', 'kommt das Angebot wieder, steht die Wunschliste wieder vorn');
});

test('Haken: index.html (Link in der Sprung-Leiste, eigene Seite, Skript erst beim Öffnen), sw.js (filme.js im Zwischenspeicher)', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  const leiste = html.match(/<div class="breite sprung-zeile">([\s\S]*?)<\/div>/)[1];
  assert.match(leiste, /<a href="#filme" data-reiter="filme">Filme<span class="n"><\/span><\/a>/);
  assert.match(html, /<\/main>\s*(<!--[^>]*-->\s*)?<section id="p-filme" class="reiter-seite breite" aria-labelledby="h-filme" hidden>/);
  assert.match(html, /<div id="i-filme"><p class="leer">Lade Filme …<\/p><\/div>/);
  assert.doesNotMatch(html, /<script[^>]+src="filme\.js"/, 'kein festes Skript-Tag: filme.js erst beim ersten Öffnen');
  assert.match(html, /filmeSkript\.src = 'filme\.js'/);
  assert.match(html, /REITER_START\.filme = starteFilme;/);
  assert.match(html, /REITER_NEU\.filme = /);
  assert.doesNotMatch(html, /filme\.json/, 'Daten-Adresse steht nur in filme.js');
  assert.doesNotMatch(html, /\.fi-/, 'kein Film-CSS in der Seite');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /addAll\(\[SEITE, 'filme\.js',/);
  assert.match(sw, /rest === 'filme\.js'/);
  assert.match(readFileSync(join(MV, 'filme.js'), 'utf8'), /raw\.githubusercontent\.com\/XanderFoxy\/Synquenzer\/vorteile-daten\/vorteile\/data\/filme\.json/);
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
    try {
      const inhalt = await readFile(datei);
      rs.writeHead(200, { 'content-type': TYP[extname(datei)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      rs.end(inhalt);
    } catch { rs.writeHead(404); rs.end('nicht gefunden'); }
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
// Poster-Ersatz: farbiges Bild in Apple-Größe (Film 133 × 200, Staffel 200 × 200), kommt absichtlich spät (Layout-Sprung?)
const titelZuBild = new Map(GRUPPEN.flatMap(g => FILME.gruppen[g]).filter(t => t.bild).map(t => [t.bild.replace(/\d+x\d+bb/, '200x200bb'), t]));
function poster(url) {
  const t = titelZuBild.get(url);
  let x = 7; for (const c of url) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  const h = x % 360, w = t?.typ === 'staffel' ? 200 : 133;
  const kurz = (t?.titel || '?').split(/[\s,:–-]+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},55%,48%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},60%,18%)"/></linearGradient></defs><rect width="${w}" height="200" fill="url(#g)"/><text x="${w / 2}" y="118" font-family="sans-serif" font-size="56" font-weight="700" fill="rgba(255,255,255,.85)" text-anchor="middle">${kurz}</text></svg>`;
}

async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#filme', dunkel = false, patch = null, fehlt = false, bildVerzug = 0, kontext = null } = {}) {
  const ctx = kontext || await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: dunkel ? 'dark' : 'light', serviceWorkers: 'block',
  });
  const zustand = { abrufe: [], offline: false, fehlt, patch };
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const u = new URL(route.request().url());
    const rest = u.pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    zustand.abrufe.push(rest);
    if (zustand.offline) return route.abort('internetdisconnected');
    const kopf = { 'access-control-allow-origin': '*' };
    if (rest === FILME_PFAD) {
      if (zustand.fehlt) return route.fulfill({ status: 404, headers: kopf, body: '' });
      let d = JSON.parse(JSON.stringify(FILME));
      if (zustand.patch) d = zustand.patch(d) ?? d;
      return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(d) });
    }
    if (!DATEI[rest]) return route.fulfill({ status: 404, headers: kopf, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', DATEI[rest])) });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, async route => {
    if (bildVerzug) await new Promise(r => setTimeout(r, bildVerzug));
    return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: poster(route.request().url()) }).catch(() => {});
  });
  // Kurs-Quellen der Krypto-Karte (MV2) gemockt – erfundene Kurse, kein echtes Netz
  await ctx.route(/^https:\/\/(api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)\//, route => {
    const u = new URL(route.request().url()), cors = { 'access-control-allow-origin': '*' };
    const json = b => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(b) });
    if (u.host === 'api.coingecko.com') return json({ bitcoin: { eur: 60000, eur_24h_change: 1 }, ethereum: { eur: 2000, eur_24h_change: -1 } });
    if (u.host === 'api.crypto.com') { const i = u.searchParams.get('instrument_name'); return json({ code: 0, result: { data: [{ i, a: i === 'BTC_EUR' ? '60000' : '2000', c: '0.01' }] } }); }
    return route.fulfill({ status: 404, headers: cors, body: '' });
  });
  // Layout-Sprünge mitschreiben (ohne die direkt nach einem Tippen)
  await ctx.addInitScript(() => {
    window.__cls = [];
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ t: performance.now(), v: e.value }); }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  page.on('request', r => { if (/\/mein-vorteil\/filme\.js$/.test(new URL(r.url()).pathname)) zustand.abrufe.push('filme.js'); });
  await page.clock.setFixedTime(new Date(JETZT));
  await page.goto(basis + pfad);
  await page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent), null, { timeout: 10000 });
  if (pfad.endsWith('#filme')) await filmeDa(page);
  return { ctx, page, fehler, zustand };
}
const filmeDa = page => page.waitForFunction(() => document.querySelector('#p-filme .fi-chips, #p-filme .fi-leer:not(.fi-erst), #p-filme .fi-erst:not(:empty)') && !/Lade Filme/.test(document.getElementById('p-filme').textContent), null, { timeout: 10000 });
const nbsp = s => s.replace(/[\u00a0\u202f]/g, ' '); // geschütztes Leerzeichen (de-DE: „3,99\u00a0€“) -> normales
const chip = (page, k) => page.locator(`[data-fi-chip="${k}"]`);
async function waehle(page, k) {
  await chip(page, k).click();
  await page.waitForFunction(k => document.getElementById('fi-liste')?.getAttribute('aria-labelledby') === 'fi-c-' + k, k);
}
const karten = page => page.locator('#fi-liste .fi-karte');
const karte = (page, titel) => page.locator('#fi-liste .fi-karte', { has: page.locator('.fi-titel', { hasText: titel }) });
const filmeLink = page => page.locator('.sprung a[data-reiter="filme"]');
async function zuAbschnitt(page, ab) { // Abschnitts-Link in der Sprung-Leiste: Filme zu, Abschnitte wieder da
  await page.locator(`.sprung a[data-ziel="${ab}"]`).click();
  await page.waitForFunction(ab => location.hash === '#' + ab && !document.querySelector('main').hidden && document.getElementById('p-filme').hidden, ab);
}

test('Lazy: filme.js und filme.json erst beim Öffnen des Reiters, danach nicht bei jedem Wechsel', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne({ pfad: '/mein-vorteil/#angebote' });
  await page.waitForTimeout(300);
  assert.ok(!zustand.abrufe.includes('filme.js') && !zustand.abrufe.includes(FILME_PFAD), 'vor dem Öffnen nichts geholt: ' + zustand.abrufe);
  assert.equal(await page.evaluate(() => !!document.getElementById('fi-stil') || 'MeinVorteilFilme' in window), false);
  await filmeLink(page).click();
  await filmeDa(page);
  assert.equal(new URL(page.url()).hash, '#filme');
  assert.equal(await page.locator('main').isHidden(), true, 'Abschnitte ausgeblendet');
  assert.equal(await filmeLink(page).getAttribute('aria-current'), 'true');
  for (const ab of ['produkte', 'remix', 'mehr']) {
    await zuAbschnitt(page, ab);
    await filmeLink(page).click();
    await page.waitForFunction(() => !document.getElementById('p-filme').hidden && document.querySelector('main').hidden);
  }
  assert.equal(zustand.abrufe.filter(a => a === 'filme.js').length, 1);
  assert.equal(zustand.abrufe.filter(a => a === FILME_PFAD).length, 1);
  // ↻ holt die Filme mit
  await page.locator('#neu').click();
  await page.waitForFunction(() => !document.getElementById('neu').hasAttribute('aria-busy'));
  await page.waitForTimeout(200);
  assert.equal(zustand.abrufe.filter(a => a === FILME_PFAD).length, 2);
  // ↻ auf einem Abschnitt: Filme waren schon offen -> holen trotzdem frisch (wie die anderen Daten), aber nichts doppelt
  await zuAbschnitt(page, 'produkte');
  await page.locator('#neu').click();
  await page.waitForFunction(() => !document.getElementById('neu').hasAttribute('aria-busy'));
  await page.waitForTimeout(200);
  assert.equal(zustand.abrufe.filter(a => a === FILME_PFAD).length, 3);
  assert.equal(zustand.abrufe.filter(a => a === 'filme.js').length, 1);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Wunschliste: Start-Chip, Preis, Abzeichen, statt/Tiefstpreis, Film ohne Fund, Stand', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  assert.equal(await chip(page, 'wunsch').getAttribute('aria-selected'), 'true', 'Manta Manta im Angebot -> Wunschliste zuerst');
  assert.deepEqual((await page.locator('.fi-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()),
    ['Wunschliste 4', 'Angebote 6', 'Neu 6', '80er & Kult 10', 'Serien 14', 'Disney 8']);
  assert.equal(nbsp(await page.locator('.fi-stand').innerText()), 'Stand: heute 14:05');
  assert.deepEqual(await page.locator('#fi-liste .fi-titel').allInnerTexts(), ['Manta Manta (1991)', 'Mallrats (1995)', 'Shadow und der Fluch des Khan (1994)', 'Go Trabi Go (1991)']);
  const manta = karte(page, 'Manta Manta');
  const m = nbsp(await manta.innerText());
  assert.match(m, /Komödie/);
  assert.equal(nbsp(await manta.locator('.fi-preis').innerText()), '3,99 €');
  assert.deepEqual(await manta.locator('.fi-marke').allInnerTexts(), ['Tiefstpreis', 'Angebot', 'unter deinem Ziel']);
  assert.match(m, /statt 9,99 € · Tiefstpreis 3,99 € \(seit 01\.11\.\)/);
  assert.equal(await manta.locator('s').innerText().then(nbsp), '9,99 €');
  assert.equal(await manta.getAttribute('href'), 'https://itunes.apple.com/de/movie/manta-manta/id286559876?uo=4');
  assert.equal(await manta.getAttribute('target'), '_blank');
  assert.equal(await manta.getAttribute('rel'), 'noopener');
  assert.match(await manta.getAttribute('class'), /fi-deal/);
  // Mallrats war schon billiger: Tiefstpreis mit Tag, kein Abzeichen
  const mall = nbsp(await karte(page, 'Mallrats').innerText());
  assert.match(mall, /9,99 €/);
  assert.match(mall, /Tiefstpreis 7,99 € am 03\.11\. \(seit 01\.11\.\) · dein Ziel: 4,99 €/);
  assert.equal(await karte(page, 'Mallrats').locator('.fi-marke').count(), 0);
  // Shadow: gesenkt auf 7,99 € (Tiefstpreis), aber kein Angebot
  assert.deepEqual(await karte(page, 'Shadow').locator('.fi-marke').allInnerTexts(), ['Tiefstpreis']);
  // Go Trabi Go: nicht im Store -> kein Link, kein Preis, Platzhalter statt Bild
  const trabi = karte(page, 'Go Trabi Go');
  assert.equal(await trabi.evaluate(e => e.tagName), 'DIV');
  assert.deepEqual(await trabi.locator('.fi-marke').allInnerTexts(), ['nicht im Apple-Store']);
  assert.equal(await trabi.locator('.fi-preis').count(), 0);
  assert.equal(await trabi.locator('.fi-ohnebild').innerText(), 'GT');
  assert.match(nbsp(await page.locator('.fi-fuss').innerText()), /^Tiefstpreis = niedrigster Preis seit Beobachtung \(seit 01\.11\.\)\./);
  // Bilder: 200x200bb (auch wo die Daten noch 100x100bb liefern), faul geladen, feste Größe
  await waehle(page, 'angebot');
  const bilder = await page.locator('#fi-liste img.fi-bild').evaluateAll(i => i.map(x => [x.getAttribute('src'), x.loading, x.getAttribute('width'), x.getAttribute('height')]));
  assert.equal(bilder.length, 6);
  for (const [src, l, w, h] of bilder) { assert.match(src, /\/200x200bb\.jpg$/); assert.equal(l, 'lazy'); assert.deepEqual([w, h], ['56', '84']); }
  assert.match(nbsp(await karte(page, 'John Wick').innerText()), /Action & Abenteuer · Platz 14 der Charts[\s\S]*4,99 €[\s\S]*Tipp von mydealz/);
  // Quellen: mydealz gestört
  await page.locator('.fi-quellen summary').click();
  assert.match(nbsp(await page.locator('.fi-quellen').innerText()), /Apple-Store: 41 gefunden\s*Apple-Charts: 100 gefunden\s*mydealz: gestört – HTTP 403/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Serien nach Serie gruppiert (Angebote zuerst), Neu nach Chartplatz, Disney mit „nur leihen“', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  await waehle(page, 'serien');
  assert.deepEqual((await page.locator('.fi-gruppe').allInnerTexts()).map(t => nbsp(t).replace(/\s+/g, ' ')),
    ['Rick and Morty 2 im Angebot · 7 Staffeln', 'Star Trek: The Next Generation 1 im Angebot · 7 Staffeln']);
  const titel = (await page.locator('#fi-liste .fi-titel').allInnerTexts()).map(t => t.replace(/ \(\d{4}\)$/, ''));
  assert.deepEqual(titel, ['Staffel 1', 'Staffel 2', 'Staffel 3', 'Staffel 4', 'Staffel 5', 'Staffel 6', 'Staffel 7',
    'Staffel 3', 'Staffel 1', 'Staffel 2', 'Staffel 4', 'Staffel 5', 'Staffel 6', 'Staffel 7']);
  const st = page.locator('#fi-liste .fi-karte');
  assert.match(nbsp(await st.nth(0).innerText()), /9,99 €\s*Tiefstpreis\s*Angebot\s*statt 19,99 €/);
  assert.match(nbsp(await st.nth(7).innerText()), /7,99 €[\s\S]*statt 29,99 €/);
  // Preis hat sich nie bewegt: kein „Tiefstpreis“-Abzeichen, sondern „unverändert“
  assert.equal(await st.nth(2).locator('.fi-marke').count(), 0);
  assert.match(nbsp(await st.nth(2).innerText()), /19,99 €\s*Preis unverändert seit 01\.11\./);
  // Staffel-Bilder quadratisch (84 × 84)
  assert.deepEqual(await st.nth(0).locator('.fi-bild').evaluate(e => [e.getAttribute('width'), e.getAttribute('height'), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)]), ['84', '84', 84, 84]);
  await waehle(page, 'neu');
  assert.deepEqual((await page.locator('#fi-liste .fi-info').allInnerTexts()).map(t => Number(t.match(/Platz (\d+)/)[1])), [1, 2, 3, 5, 7, 9]);
  await waehle(page, 'achtziger');
  assert.deepEqual((await karten(page).evaluateAll(k => k.map(x => x.classList.contains('fi-deal')))), [true, true, true, false, false, false, false, false, false, false], 'Angebote zuerst');
  await waehle(page, 'disney');
  assert.equal(await karten(page).count(), 8);
  assert.match(nbsp(await karte(page, 'Die Unglaublichen').innerText()), /nur leihen: 3,99 €/);
  assert.match(nbsp(await karte(page, 'Aladdin').innerText()), /Tiefstpreis 7,99 € am 02\.11\. \(seit 01\.11\.\)/);
  // Tastatur: Pfeile wandern durch die Chips
  await chip(page, 'disney').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await chip(page, 'wunsch').getAttribute('aria-selected'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.fiChip), 'wunsch');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await chip(page, 'disney').getAttribute('aria-selected'), 'true');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Gewählter Chip bleibt gemerkt; ein neues Wunsch-Angebot holt die Wunschliste einmal nach vorn', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne();
  await waehle(page, 'disney');
  await page.reload();
  await filmeDa(page);
  assert.equal(await chip(page, 'disney').getAttribute('aria-selected'), 'true');
  // gewählter Chip ist ins Bild gescrollt (Disney steht ganz rechts)
  const sicht = await page.evaluate(() => { const l = document.querySelector('.fi-chips').getBoundingClientRect(), c = document.querySelector('[data-fi-chip="disney"]').getBoundingClientRect(); return c.left >= l.left - 1 && c.right <= l.right + 1; });
  assert.ok(sicht, 'Disney-Chip sichtbar');
  zustand.patch = d => { const m = d.gruppen.wunsch.find(t => t.titel === 'Mallrats'); Object.assign(m, { preis: 3.99, preisHd: 3.99, vorher: 9.99, angebot: true, unterZiel: true, istTiefst: true, tiefst: { p: 3.99, tag: '2026-11-07' } }); };
  await page.reload();
  await filmeDa(page);
  await page.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('mein-vorteil-daten-filme')).d.gruppen.wunsch.some(t => t.titel === 'Mallrats' && t.preis === 3.99); } catch { return false; } });
  // der gemerkte Stand (alt) zeichnet zuerst, die frischen Daten danach – der Chip darf dabei nicht springen
  await page.waitForTimeout(200);
  assert.equal(await chip(page, 'disney').getAttribute('aria-selected'), 'true', 'erst beim nächsten Öffnen entschieden');
  await page.reload();
  await filmeDa(page);
  assert.equal(await chip(page, 'wunsch').getAttribute('aria-selected'), 'true', 'neues Wunsch-Angebot');
  assert.match(nbsp(await karte(page, 'Mallrats').innerText()), /3,99 €/);
  await page.reload();
  await filmeDa(page);
  assert.equal(await chip(page, 'disney').getAttribute('aria-selected'), 'true', 'danach wieder der gewählte Bereich');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Offline-Kopie: letzter Stand sofort; Quelle gestört bzw. offline steht in der Stand-Zeile', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne();
  zustand.offline = true;
  await page.reload();
  await filmeDa(page);
  await page.waitForFunction(() => /gestört/.test(document.querySelector('.fi-stand')?.textContent || ''));
  assert.equal(nbsp(await page.locator('.fi-stand').innerText()), 'Stand: heute 14:05 · Quelle gerade gestört – du siehst den letzten Stand');
  assert.equal(await karten(page).count(), 4);
  await page.waitForFunction(() => !document.getElementById('neu').hasAttribute('aria-busy'));
  await ctx.setOffline(true);
  await page.locator('#neu').click();
  await page.waitForFunction(() => /offline/.test(document.querySelector('.fi-stand').textContent));
  assert.equal(nbsp(await page.locator('.fi-stand').innerText()), 'Stand: heute 14:05 · offline');
  assert.match(await page.locator('.fi-stand').getAttribute('class'), /fi-alt/);
  await page.waitForFunction(() => !document.getElementById('neu').hasAttribute('aria-busy'));
  await ctx.setOffline(false);
  zustand.offline = false;
  await page.locator('#neu').click();
  await page.waitForFunction(() => document.querySelector('.fi-stand').textContent === 'Stand: heute 14:05');
  assert.deepEqual(fehler.filter(f => !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(f)), []);
  await ctx.close();
});

test('Ohne Daten: freundliche Hinweise (Liste noch nicht erstellt, leerer Bereich), Einträge ohne Titel fallen weg', { skip: ohnePw }, async () => {
  let o = await oeffne({ fehlt: true });
  assert.equal(nbsp(await o.page.locator('#i-filme').innerText()), 'Die Filmliste wird gerade zum ersten Mal erstellt – schau später noch einmal rein.');
  for (const ab of ['produkte', 'auftritte']) { await zuAbschnitt(o.page, ab); assert.ok(await o.page.locator(`#${ab} h2`).isVisible(), ab); }
  assert.deepEqual(o.fehler.filter(f => !/Failed to load resource/.test(f)), []);
  await o.ctx.close();
  const patch = d => {
    d.gruppen.wunsch = d.gruppen.wunsch.map(t => ({ ...t, angebot: false, unterZiel: false }));
    d.gruppen.angebot = [];
    d.gruppen.disney = d.gruppen.disney[0]; // Einzelobjekt statt Liste
    d.gruppen.neu = [{ id: 'itunes:9', preis: 3.99 }, { ...d.gruppen.neu[0], preis: -1, preisHd: -1, preisSd: -1, leihe: null }];
    delete d.gruppen.serien;
  };
  o = await oeffne({ patch });
  assert.equal(await chip(o.page, 'angebot').getAttribute('aria-selected'), 'true', 'kein Wunsch-Angebot -> Angebote');
  assert.equal(nbsp(await o.page.locator('#fi-liste').innerText()), 'Gerade keine Angebote – du bekommst eine Nachricht, sobald einer deiner Filme günstig ist. Eine Quelle ist gerade gestört.');
  assert.match(await chip(o.page, 'disney').innerText(), /1/);
  await waehle(o.page, 'neu');
  assert.equal(await karten(o.page).count(), 1);
  assert.match(nbsp(await karten(o.page).innerText()), /Nobody 2[\s\S]*gerade nicht zu kaufen/);
  await waehle(o.page, 'serien');
  assert.match(await o.page.locator('#fi-liste').innerText(), /Gerade keine Staffeln von Rick and Morty oder Star Trek gefunden/);
  assert.deepEqual(o.fehler, []);
  await o.ctx.close();
});

test('Film-Einträge des Radars (aktuell.json → filme) stehen nur auf der Filme-Seite, nicht noch einmal unter „Mehr“', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne({ pfad: '/mein-vorteil/#mehr' });
  const a = JSON.parse(readFileSync(join(FIX, 'vertrag', 'vorteile-aktuell.json'), 'utf8'));
  const eintrag = (id, kategorie) => ({ id, kategorie, titel: `Manta Manta (1991) für 4,99 € ${id}`, zeile: 'Kaufen 4,99 € · auf deiner Wunschliste', soGehts: 'Link öffnen – die TV-App zeigt den Film.',
    link: `https://itunes.apple.com/de/movie/manta-manta/id${id.length}0${id === 'film-x' ? 1 : 2}`, quelle: 'Apple TV', wert: 95, sofort: true, grund: 'Wunschfilm zum Zielpreis',
    datum: '2026-11-07T13:05:00.000Z', bis: null, sichtbarBis: '2026-11-10T13:05:00.000Z', preisfehler: false, preis: 4.99, extra: { gruppe: 'wunsch' } });
  a.kategorien.filme = [eintrag('film-x', 'filme')];
  a.kategorien.kino = [eintrag('kino-x', 'kino')]; // Gegenprobe: ein Bereich ohne eigene Seite erscheint unter „Mehr“
  a.namen = { ...a.namen, filme: 'Filme & Serien', kino: 'Kino-Probe' };
  a.aktualisiert = '2026-11-07T14:05:00.000Z';
  await ctx.route(/^https:\/\/raw\.githubusercontent\.com\/XanderFoxy\/Synquenzer\/vorteile-daten\/vorteile\/data\/aktuell\.json/,
    r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(a) }));
  await page.reload();
  await page.waitForFunction(() => /Kino-Probe/.test(document.getElementById('i-mehr').textContent), null, { timeout: 10000 });
  const mehr = await page.locator('#i-mehr').textContent();
  assert.doesNotMatch(mehr, /Filme & Serien|film-x/);
  assert.doesNotMatch(await page.locator('main').textContent(), /film-x/, 'nirgends in den Abschnitten');
  assert.ok(!zustand.abrufe.includes('filme.js') && !zustand.abrufe.includes(FILME_PFAD), 'Filme bleiben faul');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

// Kein seitliches Scrollen, alles Tippbare im sichtbaren Bereich ≥ 44 px, Reiter-Wörter passen in ihre Knöpfe
async function pruefeLayout(page, wo) {
  const r = await page.evaluate(() => {
    const zuKlein = [];
    for (const el of document.querySelectorAll('button, a[href], summary, [role="tab"]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[hidden]') || el.closest('dialog:not([open])')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 30)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    const eng = [...document.querySelectorAll('.sprung a')].map(b => {
      const rg = document.createRange(); rg.selectNodeContents(b.firstChild);
      const t = rg.getBoundingClientRect(), k = b.getBoundingClientRect();
      return t.left >= k.left && t.right <= k.right ? null : b.getAttribute('href');
    }).filter(Boolean);
    return { zuKlein, eng, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth };
  });
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  assert.deepEqual(r.eng, [], `${wo}: Wort passt nicht in seinen Link der Sprung-Leiste`);
  const vw = page.viewportSize().width;
  assert.ok(r.sw <= vw && r.bw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${vw})`);
}

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Layout ${breite}×${hoehe} (${lage}): je Chip ein Foto, kein seitliches Scrollen, Chips ≥ 44 px, Bilder ohne Sprung`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe, bildVerzug: 600 });
    // Platz fürs Bild ist reserviert, bevor es da ist
    const vorher = await page.locator('#fi-liste .fi-bild').evaluateAll(b => b.map(x => [x.tagName, x.complete === false || x.tagName !== 'IMG', Math.round(x.getBoundingClientRect().width), Math.round(x.getBoundingClientRect().height)]));
    assert.ok(vorher.length >= 3);
    assert.ok(vorher.some(([t, offen]) => t === 'IMG' && offen), 'mindestens ein Bild lädt noch');
    for (const [, , w, h] of vorher) assert.deepEqual([w, h], [56, 84]);
    const start = await page.evaluate(() => performance.now());
    for (const k of GRUPPEN) {
      await waehle(page, k);
      const chips = await page.locator('.fi-chip').evaluateAll(c => c.map(x => Math.round(x.getBoundingClientRect().height)));
      assert.ok(chips.every(h => h >= 44), `${k}: Chips ${chips}`);
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.fi-chips')).flexWrap), 'nowrap');
      // faul geladene Bilder weiter unten holen, alle abwarten (sie kommen absichtlich spät)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForFunction(() => [...document.querySelectorAll('#fi-liste img')].every(i => i.complete), null, { timeout: 8000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await pruefeLayout(page, `${lage} ${k}`);
      await page.screenshot({ path: join(FOTOS, `${lage}-${k}.png`), fullPage: true });
    }
    const cls = await page.evaluate(s => window.__cls.filter(e => e.t >= s).reduce((a, e) => a + e.v, 0), start);
    assert.ok(cls < 0.01, `Layout-Sprünge (CLS) ${cls}`);
    // zurück zu den Abschnitten: die Seite läuft wie vorher
    for (const ab of ['krypto', 'produkte', 'remix']) {
      await zuAbschnitt(page, ab);
      assert.ok(await page.locator(`#${ab} h2`).isVisible(), ab);
      await pruefeLayout(page, `${lage} ${ab}`);
    }
    await zuAbschnitt(page, 'krypto');
    await page.screenshot({ path: join(FOTOS, `${lage}-zurueck-krypto.png`) });
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

test('Dunkel (hoch): Fotos Wunschliste und Serien, Kontrast der Abzeichen', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ dunkel: true });
  await page.screenshot({ path: join(FOTOS, 'hoch-dunkel-wunsch.png'), fullPage: true });
  // Kontrast Text/Hintergrund der Abzeichen und des Preises ≥ 4,5 : 1
  const kontraste = await page.evaluate(() => {
    const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
    const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const hg = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(.*, 0\)$|transparent/.test(c)) return c; } return getComputedStyle(document.body).backgroundColor; };
    return [...document.querySelectorAll('#fi-liste .fi-marke, #fi-liste .fi-preis, #fi-liste .fi-klein, .fi-chip, .fi-n')].map(e => {
      const a = lum(rgb(getComputedStyle(e).color)), b = lum(rgb(hg(e)));
      return [e.className, Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 10) / 10];
    });
  });
  for (const [k, v] of kontraste) assert.ok(v >= 4.5, `${k}: Kontrast ${v}`);
  await waehle(page, 'serien');
  await page.screenshot({ path: join(FOTOS, 'hoch-dunkel-serien.png'), fullPage: true });
  assert.deepEqual(fehler, []);
  await ctx.close();
});
