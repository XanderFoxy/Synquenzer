// Browser-Tests der Seite „Mein Vorteil“ (Playwright, Chromium) mit echten Daten vom 31.10.2026 und Vertrags-Fixtures.
// Aufruf: cd mein-vorteil && node --test   (Bildschirmfotos nach $MV_SHOTS, sonst ins Temp-Verzeichnis)
// Ohne installiertes Playwright werden die Tests übersprungen.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..'); // Repo-Wurzel: /mein-vorteil/, /schnaeppchen/ … wie auf GitHub Pages
const FIX = join(HIER, 'fixtures');
const SHOTS = process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots');
const JETZT = '2026-10-31T16:35:00Z';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

let pw = null;
try { pw = createRequire(import.meta.url)('playwright'); } catch { /* nicht installiert */ }
const ohnePw = pw ? false : 'Playwright nicht installiert';

// --- kleiner Webserver für die Repo-Wurzel (mit umschaltbaren Antworten für den Service-Worker-Test) ---------------
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const ersatz = new Map(); // Pfad -> { typ, text }
let server, basis, browser;

before(async () => {
  if (!pw) return;
  server = createServer(async (rq, rs) => {
    let pfad = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (ersatz.has(pfad)) { const e = ersatz.get(pfad); rs.writeHead(200, { 'content-type': e.typ, 'cache-control': 'no-cache' }); rs.end(e.text); return; }
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
  await mkdir(SHOTS, { recursive: true });
});
after(async () => { await browser?.close(); await new Promise(r => (server ? server.close(r) : r())); });

// raw.githubusercontent.com -> Fixture-Satz
const DATEI = {
  'schnaeppchen-daten/schnaeppchen/data/current.json': 'schnaeppchen-current.json',
  'vorteile-daten/vorteile/data/aktuell.json': 'vorteile-aktuell.json',
  'konzerte-daten/konzerte/data/konzerte.json': 'konzerte-konzerte.json',
  'konzerte-daten/konzerte/data/releases.json': 'konzerte-releases.json',
  'konzerte-daten/konzerte/data/status.json': 'konzerte-status.json',
};
const SATZ = {
  v1: n => join(FIX, 'echt-2026-10-31', 'v1', n), // Produktionsformat vom 31.10.2026 (alte Scanner)
  v2: n => join(FIX, 'echt-2026-10-31', /^(schnaeppchen|vorteile)/.test(n) ? 'v2' : 'v1', n), // neue Scanner, echte Antworten
  vertrag: n => join(FIX, 'vertrag', n),
  vertragB: n => join(FIX, 'vertrag-b', n), // Sonderfälle der zweiten Prüfung (Versand im Preis, Ende nach 24 h, unplausibel)
};

async function oeffne({ satz = 'vertrag', jetzt = JETZT, breite = 428, hoehe = 926, pfad = '/mein-vorteil/', dunkel = false, kontext = null, sw = 'block', fehlt = [], uhr = 'fest' } = {}) {
  const ctx = kontext || await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: dunkel ? 'dark' : 'light', serviceWorkers: sw,
  });
  const zustand = { satz, offline: false, fehlt: new Set(fehlt) }; // fehlt: Dateinamen (z. B. 'konzerte-releases.json') -> 404
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    if (zustand.offline) return route.abort('internetdisconnected');
    const u = new URL(route.request().url());
    const rest = u.pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    const n = DATEI[rest];
    if (!n || zustand.fehlt.has(n)) return route.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' }, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: readFileSync(SATZ[zustand.satz](n)) });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, route => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  if (uhr === 'laeuft') await page.clock.install({ time: new Date(jetzt) }); // Zeit + Timer steuerbar (fastForward)
  else await page.clock.setFixedTime(new Date(jetzt));
  await page.goto(basis + pfad);
  if (pfad.startsWith('/mein-vorteil/')) await geladen(page);
  return { ctx, page, fehler, zustand };
}
const geladen = page => page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent), null, { timeout: 10000 });
const text = (page, sel) => page.locator(sel).innerText();
const nbsp = s => s.replace(/ /g, ' ');

async function reiter(page, name) {
  await page.locator(`#t-${name}`).click();
  await page.waitForFunction(n => !document.getElementById('p-' + n).hidden, name);
}

// Kein seitliches Scrollen, alles Tippbare mindestens 44 × 44 px (auch in aufgeklappten Kästen)
async function pruefeLayout(page, wo) {
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => (d.open = true)));
  const r = await page.evaluate(() => {
    const zuKlein = [];
    for (const el of document.querySelectorAll('button, a[href], summary, [role="tab"], input, select')) {
      const b = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (!b.width || !b.height || st.visibility === 'hidden' || el.closest('[hidden]')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 40)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    return { zuKlein, sw: document.documentElement.scrollWidth, iw: innerWidth, bw: document.body.scrollWidth };
  });
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  // gegen die eingestellte Breite prüfen: auf Mobilgeräten wächst innerWidth mit, wenn etwas übersteht
  const vw = page.viewportSize().width;
  assert.ok(r.sw <= vw && r.bw <= vw && r.iw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw}/${r.iw} > ${vw})`);
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => (d.open = false)));
}

test('echte Daten (neue Scanner, 31.10. 16:35): Knoppers-Karte ist eindeutig', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v2' });
  const karte = page.locator('[data-produkt="knoppers-schnitte"]');
  const t = nbsp(await karte.innerText());
  assert.match(await karte.locator('h3').innerText(), /^Knoppers Schnitte$/);
  assert.match(t, /Storck Knoppers Milch-Haselnuss-Schnitte · 15 × 25 g/);
  assert.match(t, /2,79 €/);
  assert.match(t, /bei Kaufland/);
  assert.match(t, /0,19 € pro Stück/);
  assert.match(t, /Tiefstpreis\?\s*unklar\s*Einziges Angebot in deiner Nähe · Verlauf erst seit 1 Tag/);
  // geschätzter Normalpreis für DIESE Packungsgröße (15er-Familienpackung), nicht mehr 0,38 € / 51 %
  assert.match(t, /Normalpreis geschätzt\s*ca\. 0,30 € pro Stück für diese Packungsgröße · 38 % darunter/);
  assert.match(await karte.locator('.prozent').innerText(), /^−38 %$/);
  assert.match(t, /bis heute, 19:00 Uhr/);
  assert.match(t, /Im Prospekt ansehen \(Kaufland\)/);
  assert.doesNotMatch(t, /24er|40 Stück|0,07|82 %|51 %/);
  // Ben & Jerry's beginnt erst Montag -> „Bald günstig“, nicht „Jetzt günstig“ und nicht im Zähler
  const bjKarte = page.locator('[data-produkt="ben-jerrys"]');
  const bj = nbsp(await bjKarte.innerText());
  assert.match(bj, /ab Mo 2\.11\./);
  assert.match(bj, /465 ml oder 4 × 100 ml/);
  assert.match(bj, /1,00 € pro 100 ml/);
  // Tiefstpreis-Antwort nennt das billigere PENNY-Angebot statt „Einziges Angebot“ (echter Fall mydealz 2861577)
  assert.match(bj, /Tiefstpreis\?\s*unklar\s*PENNY hat 3,49 € \(mit App, ab Mo 02\.11\.\) – Packungsgröße dort nicht sicher/);
  assert.doesNotMatch(bj, /Einziges Angebot/);
  await bjKarte.locator('details.weitere summary').click();
  const reihe = nbsp(await bjKarte.locator('details.weitere li').innerText());
  assert.match(reihe, /PENNY · \[Penny\] Ben Jerrys 3,49 · Packungsgröße unklar/);
  assert.match(reihe, /ab Mo 2\.11\. · nur mit PENNY-App \(ohne App 3,99 €\)/);
  assert.doesNotMatch(reihe, /Ende unbekannt/);
  const h2 = await page.locator('#p-angebote h2').allInnerTexts();
  assert.ok(h2.some(h => /^Bald günstig/i.test(h)), h2.join(' | '));
  const jetztBlock = await page.evaluate(() => { const h = [...document.querySelectorAll('#p-angebote h2')]; const a = h.findIndex(x => /Jetzt günstig/i.test(x.textContent)); const b = h.findIndex(x => /Bald günstig/i.test(x.textContent)); return { a, b }; });
  assert.ok(jetztBlock.a >= 0 && jetztBlock.b > jetztBlock.a, 'Bald günstig steht unter Jetzt günstig');
  assert.match(nbsp(await text(page, '#stand')), /^Stand: Angebote gerade eben · Vorteile gerade eben · Konzerte vor 5 Min\./);
  assert.equal(await page.locator('#t-angebote .n').innerText(), '1', 'nur Knoppers läuft jetzt; Ben & Jerry\'s erst ab Montag');
  assert.equal(await page.locator('#t-konzerte .n').isHidden(), true, 'leerer Zähler bei 0 Konzerten');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('echte Daten: nach Kaufland-Ende (18:00 UTC) verschwindet das Angebot von selbst', { skip: ohnePw }, async () => {
  // Seite ist kurz vor Ende offen …
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', jetzt: '2026-10-31T17:59:00Z' });
  assert.match(nbsp(await page.locator('[data-produkt="knoppers-schnitte"]').innerText()), /endet heute, 19:00 Uhr/);
  // … und kommt nach dem Ende wieder in den Vordergrund (ohne neue Daten)
  await page.clock.setFixedTime(new Date('2026-10-31T18:00:30Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await page.locator('[data-produkt="knoppers-schnitte"]').count(), 0);
  assert.match(nbsp(await text(page, '#p-angebote')), /Knoppers Schnitte\s*Gerade kein Angebot · zuletzt 0,19 € pro Stück bei Kaufland · Normalpreis geschätzt: ca\. 0,30 € pro Stück/);
  assert.doesNotMatch(await text(page, '#p-angebote'), /Milch-Haselnuss-Schnitte/);
  // auch im Vorteils-Reiter nichts mehr davon
  assert.doesNotMatch(await page.locator('#p-vorteile').textContent(), /Knoppers/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('altes Produktionsformat (31.10.): keine falsche Packung, keine erfundenen Prozente, nichts Abgelaufenes', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v1' });
  const angebote = nbsp(await page.locator('#p-angebote').textContent());
  assert.doesNotMatch(angebote, /24er|5er-Pack|40 Stück|1 kg|0,07|0,05|−82 %/);
  const knoppers = page.locator('[data-produkt="knoppers-24"]');
  assert.equal(await knoppers.locator('h3').innerText(), 'Knoppers');
  assert.match(nbsp(await knoppers.innerText()), /Storck Knoppers Milch-Haselnuss-Schnitte · Packungsgröße unklar/);
  // RTX 5070 vom 12.10. (19 Tage alt, kein Ende in den Daten) und die drei abgelaufenen Radar-Preisfehler: weg
  assert.doesNotMatch(angebote, /RTX 5070|HARBR|Faltpavillon|Lumaland/);
  assert.match(angebote, /Gerade kein laufender Preisfehler/);
  await reiter(page, 'vorteile');
  const vorteile = await page.locator('#p-vorteile').textContent();
  assert.doesNotMatch(vorteile, /Preisfehler|Knoppers|Choco Crossies|Ben & Jerry/);
  assert.match(vorteile, /Tests & Gewinnspiele/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Preisfehler: vorher → jetzt, du sparst, Quelle; ohne Vorher-Preis ehrlich „unbekannt“; Abgelaufenes fehlt', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag' });
  const karten = page.locator('#p-angebote [data-preisfehler]');
  assert.equal(await karten.count(), 3, 'Lumaland (doppelt in beiden Quellen) einmal + RTX + Technik-Deal Samsung');
  const luma = nbsp(await karten.filter({ hasText: 'Lumaland' }).innerText());
  assert.match(luma, /vorher 96,99 €\s*→\s*jetzt 23,99 €/);
  assert.match(luma, /du sparst 73,00 € \(−75 %\)/);
  assert.match(luma, /Vergleichspreis laut mydealz/);
  assert.match(luma, /gemeldet vor 45 Min\./);
  assert.match(luma, /^Preisfehler/);
  assert.doesNotMatch(luma, /\bbis\b/, 'geschätztes Ende (gemeldet + 24 h) wird nicht als „bis“ gezeigt');
  const samsung = nbsp(await karten.filter({ hasText: 'Samsung' }).innerText());
  assert.match(samsung, /^Technik-Deal/, 'kein gemeldeter Preisfehler (Feld preisfehler: false)');
  assert.match(samsung, /bis heute, 21:00 Uhr/, 'echtes Ende von der Deal-Seite');
  assert.match(samsung, /vorher 499,00 €\s*→\s*jetzt 199,00 €/);
  assert.match(samsung, /du sparst 300,00 € \(−60 %\)/);
  assert.match(samsung, /statt-Preis laut Deal-Text · zzgl\. 4,99 € Versand/);
  const rtx = nbsp(await karten.filter({ hasText: 'RTX 5070' }).innerText());
  assert.match(rtx, /jetzt 165,00 €/);
  assert.match(rtx, /Originalpreis unbekannt/);
  assert.doesNotMatch(rtx, /vorher|du sparst/);
  // Preisfehler stehen oben, wenn es welche gibt; mit einem Technik-Deal dabei heißt die Überschrift auch so
  assert.match(await page.locator('#p-angebote h2').first().innerText(), /^Preisfehler & Technik-Deals\s*3$/i);
  assert.doesNotMatch(samsung, /storniert/, 'Storno-Warnung nur bei echten Preisfehlern');
  assert.match(luma, /storniert/);
  for (const r of ['angebote', 'vorteile', 'konzerte']) {
    await reiter(page, r);
    assert.doesNotMatch(await page.locator('#p-' + r).textContent(), /ABGELAUFEN/, `${r}: Abgelaufenes sichtbar`);
  }
  assert.equal(await page.locator('#t-angebote .n').innerText(), '4', 'Zähler: 1 laufender Deal + 3 Preisfehler/Technik-Deals (Ben & Jerry\'s beginnt erst Montag)');
  // Crunchips: das beste Angebot ist abgelaufen -> die Karte zeigt das teurere REWE-Angebot, ohne Prozent und ohne den alten Satz
  const chips = nbsp(await page.locator('[data-produkt="crunchips"]').innerText());
  assert.match(chips, /Lorenz Crunchips · 150 g/);
  assert.match(chips, /1,49 €\s*bei REWE/);
  assert.match(chips, /Tiefstpreis\?\s*nein\s*Schon günstiger gesehen: 0,66 € pro 100 g/);
  assert.doesNotMatch(chips, /−59 %|Günstigstes von 2|ABGELAUFEN/);
  assert.equal(await page.locator('[data-produkt="crunchips"].deal').count(), 0);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Preisfehler verschwinden von selbst: Technik-Deal am Deal-Ende, Preisfehler ohne Ende 24 h nach dem Melden', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag', jetzt: '2026-10-31T19:59:00Z' });
  const karten = page.locator('#p-angebote [data-preisfehler]');
  assert.equal(await karten.count(), 3);
  await page.clock.setFixedTime(new Date('2026-10-31T20:00:30Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.deepEqual((await karten.allInnerTexts()).map(t => /Lumaland/.test(t) ? 'Lumaland' : /RTX/.test(t) ? 'RTX' : t.slice(0, 30)), ['RTX', 'Lumaland']);
  // Lumaland: im Schnäppchen-Wecker bis = gemeldet + 24 h, im Radar sichtbarBis = gemeldet + 24 h -> beide weg
  await page.clock.setFixedTime(new Date('2026-11-01T15:51:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.deepEqual((await karten.allInnerTexts()).map(t => /RTX/.test(t) ? 'RTX' : t.slice(0, 30)), ['RTX']);
  await page.clock.setFixedTime(new Date('2026-11-01T16:06:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await karten.count(), 0);
  assert.match(await text(page, '#p-angebote'), /Gerade kein laufender Preisfehler/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Vorteile: alle Bereiche aus den Daten, neuer Bereich „Prämien & Freunde werben“ erscheint von selbst', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag', pfad: '/mein-vorteil/#vorteile' });
  const p = page.locator('#p-vorteile');
  const h2 = await p.locator('h2').allInnerTexts();
  for (const n of ['DEALS', 'REISEN', 'TESTS & GEWINNSPIELE', 'PRÄMIEN & FREUNDE WERBEN']) assert.ok(h2.some(h => h.toUpperCase().startsWith(n)), `${n} fehlt: ${h2}`);
  const pr = nbsp(await p.locator('article', { hasText: 'Startprämie' }).innerText());
  assert.match(pr, /Haken: Geldeingang 700 € pro Monat/);
  assert.match(nbsp(await p.locator('article[data-id="praemie-test-2"]').innerText()), /Haken: keine bekannten/);
  // Schnäppchen-Angebote und Preisfehler stehen nur unter „Angebote“
  const t = await p.textContent();
  assert.doesNotMatch(t, /Knoppers|Ben & Jerry|Lumaland|Hotel Test|Jetzt lohnt es sich/);
  // Ende unbekannt / bis …
  assert.match(nbsp(await p.locator('article', { hasText: 'SAS Sale' }).innerText()), /bis Mo 2\.11\./);
  assert.match(nbsp(await p.locator('article', { hasText: 'Ryanair' }).innerText()), /Ende unbekannt/);
  // Ausblenden merkt sich die Seite
  const vorher = await p.locator('article').count();
  await p.locator('article', { hasText: 'Ryanair' }).getByRole('button', { name: 'Ausblenden' }).click();
  assert.equal(await p.locator('article').count(), vorher - 1);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Konzerte: Vergangenes fehlt, Umkreis-Schalter, Vorverkauf, Neuerscheinungen', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag', pfad: '/mein-vorteil/#konzerte' });
  const p = page.locator('#p-konzerte');
  let t = nbsp(await p.innerText());
  assert.match(t, /Depeche Mode/);
  assert.match(t, /Magenta-Vorverkauf ab Mo 2\.11\., 10:00 Uhr/);
  assert.match(t, /OMD/);
  assert.doesNotMatch(t, /Camouflage|ABGELAUFEN/);
  await p.getByRole('button', { name: 'Alle' }).click();
  t = nbsp(await p.innerText());
  assert.match(t, /Camouflage\s*weit/);
  assert.doesNotMatch(t, /ABGELAUFEN/);
  assert.match(t, /Neue Veröffentlichungen/i);
  assert.match(t, /Plastic Autumn/);
  assert.deepEqual(fehler, []);
  await ctx.close();
  // echte Daten: TM_KEY fehlt und die Festival-Seiten waren gestört -> ehrlich „Konzertsuche aus“, kein Push-Versprechen
  const echt = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#konzerte' });
  const kt = nbsp(await echt.page.locator('#p-konzerte').innerText());
  assert.match(kt, /Konzertsuche gerade aus – Ticketmaster-Schlüssel fehlt, Festival-Seiten gerade nicht erreichbar\. Bis das behoben ist, kommt hier kein Push\./);
  assert.doesNotMatch(kt, /Sobald etwas angekündigt wird, kommt ein Push|README/);
  assert.deepEqual(echt.fehler, []);
  await echt.ctx.close();
});

test('Reiter: Direktlinks #angebote/#vorteile/#konzerte, letzter Reiter wird gemerkt', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#konzerte' });
  assert.equal(await page.locator('#t-konzerte').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#p-angebote').isHidden(), true);
  await reiter(page, 'vorteile');
  assert.equal(new URL(page.url()).hash, '#vorteile');
  await page.goto(basis + '/mein-vorteil/'); // wie vom Home-Bildschirm: ohne #
  await geladen(page);
  assert.equal(await page.locator('#t-vorteile').getAttribute('aria-selected'), 'true');
  await page.evaluate(() => { location.hash = '#angebote'; });
  await page.waitForFunction(() => !document.getElementById('p-angebote').hidden);
  // Push-Hilfe
  await page.locator('#push').click();
  assert.match(await page.locator('#push-hilfe').innerText(), /xander-schnaeppchen-b5cbf4442aaa9734f3/);
  await pruefeLayout(page, 'Push-Hilfe');
  await page.locator('#zu').click();
  assert.equal(await page.locator('#push-hilfe').isVisible(), false);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('ohne Netz: letzter Stand aus dem Speicher, als offline markiert', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne({ satz: 'v2' });
  zustand.offline = true;
  await page.reload();
  await page.waitForFunction(() => /offline/.test(document.getElementById('stand').textContent));
  assert.match(nbsp(await page.locator('[data-produkt="knoppers-schnitte"]').innerText()), /15 × 25 g/);
  assert.match(await text(page, '#stand'), /Angebote gerade eben \(offline\)/);
  // abgebrochene Abrufe erzeugen nur Netzwerk-Meldungen, keine Skriptfehler
  assert.deepEqual(fehler.filter(f => !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(f)), []);
  await ctx.close();
});

test('alte Adressen leiten sofort auf die neue Seite (mit passendem Reiter)', { skip: ohnePw }, async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  await ctx.route('https://**', r => r.fulfill({ status: 404, body: '' }));
  const page = await ctx.newPage();
  for (const [von, nach] of [['/schnaeppchen/', '#angebote'], ['/vorteile/', '#vorteile'], ['/vorteile/#schnaeppchen', '#angebote'], ['/konzerte/', '#konzerte']]) {
    await page.goto(basis + von);
    await page.waitForURL(u => u.pathname === '/mein-vorteil/');
    assert.equal(new URL(page.url()).hash, nach, von);
    assert.equal(new URL(page.url()).search, '', 'Marker ?von= wird aus der Adresse entfernt');
    assert.equal(await page.locator(`#t-${nach.slice(1)}`).getAttribute('aria-selected'), 'true', von);
    // einmaliger Hinweis aufs neue Symbol (bis „Verstanden“)
    if (von === '/schnaeppchen/') {
      assert.equal(await page.locator('#umzug').isVisible(), true);
      assert.match(await page.locator('#umzug').innerText(), /Teilen → Zum Home-Bildschirm/);
      await page.locator('#umzug-zu').click();
      assert.equal(await page.locator('#umzug').isVisible(), false);
    } else assert.equal(await page.locator('#umzug').isVisible(), false, `${von}: Hinweis nur einmal`);
  }
  await page.goto(basis + '/mein-vorteil/');
  assert.equal(await page.locator('#umzug').isVisible(), false, 'direkt geöffnet: kein Hinweis');
  await ctx.close();
});

test('Preisfehler/Technik (vertrag-b): Versand im Preis = „inkl. Versand“, echtes Ende nach 24 h wird nicht als „bis“ gezeigt', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertragB' });
  const karten = page.locator('#p-angebote [data-preisfehler]');
  const camel = nbsp(await karten.filter({ hasText: 'CAMELBAK' }).innerText());
  assert.match(camel, /vorher 11,99 €\s*→\s*jetzt 6,98 €/);
  assert.match(camel, /du sparst 5,01 € \(−42 %\)/);
  assert.match(camel, /Vergleichspreis laut mydealz · inkl\. Versand/);
  assert.doesNotMatch(camel, /zzgl/);
  const sony = nbsp(await karten.filter({ hasText: 'Sony' }).innerText());
  assert.match(sony, /^Technik-Deal/);
  assert.doesNotMatch(sony, /\bbis\b|storniert/, 'Ende (3.11.) liegt nach dem Verschwinden der Karte (1.11. 11:00)');
  assert.match(await page.locator('#p-angebote h2').first().innerText(), /^Preisfehler & Technik-Deals/i);
  // 24 h nach dem Melden weg, obwohl die Deal-Seite ein späteres Ende nennt (Daten veraltet: kein neuer Lauf)
  await page.clock.setFixedTime(new Date('2026-11-01T10:00:30Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await karten.filter({ hasText: 'Sony' }).count(), 0);
  assert.equal(await karten.filter({ hasText: 'CAMELBAK' }).count(), 1);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Tiefstpreis auf der Seite: nie „Einziges Angebot“, wenn auf derselben Karte ein billigeres steht (ältere Daten)', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertragB' });
  const bj = nbsp(await page.locator('[data-produkt="ben-jerrys"]').innerText());
  assert.match(bj, /Tiefstpreis\?\s*unklar\s*PENNY hat 3,49 € \(mit App, ab Mo 2\.11\.\) – Packungsgröße dort nicht sicher/);
  assert.doesNotMatch(bj, /Einziges Angebot/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Unplausibles Angebot (eher anderes Produkt) wird nie zur Hauptkarte, auch wenn das beste abgelaufen ist', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertragB', jetzt: '2026-10-31T18:30:00Z' });
  assert.equal(await page.locator('[data-produkt="knoppers-schnitte"]').count(), 0);
  const t = nbsp(await page.locator('#p-angebote').innerText());
  assert.match(t, /Knoppers Schnitte\s*Gerade kein Angebot · zuletzt 0,19 € pro Stück bei Kaufland/);
  assert.doesNotMatch(t, /Knoppers Minis|0,050 €/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Vorverkauf: Beginn und Ende werden gemerkt – die Zeile wechselt von selbst, während die Seite offen ist', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag', pfad: '/mein-vorteil/#konzerte', jetzt: '2026-11-02T08:58:00Z', uhr: 'laeuft' });
  const dm = page.locator('#p-konzerte .liste > li', { hasText: 'Depeche Mode' }).first();
  assert.match(nbsp(await dm.innerText()), /Magenta-Vorverkauf ab heute, 10:00 Uhr/);
  await page.clock.fastForward('03:00');
  await page.waitForFunction(() => /läuft bis/.test(document.getElementById('p-konzerte').textContent));
  assert.match(nbsp(await dm.innerText()), /Magenta-Vorverkauf läuft bis Mi 4\.11\., 10:00 Uhr/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Neuerscheinungen gestört ≠ keine; Konzerttermine gestört -> Neuerscheinungen trotzdem da', { skip: ohnePw }, async () => {
  let o = await oeffne({ satz: 'vertrag', pfad: '/mein-vorteil/#konzerte', fehlt: ['konzerte-releases.json'] });
  let t = nbsp(await o.page.locator('#p-konzerte').innerText());
  assert.match(t, /Neuerscheinungen gerade nicht erreichbar/);
  assert.doesNotMatch(t, /Keine neuen Veröffentlichungen/);
  assert.match(t, /Depeche Mode/);
  await o.ctx.close();
  o = await oeffne({ satz: 'vertrag', pfad: '/mein-vorteil/#konzerte', fehlt: ['konzerte-konzerte.json'] });
  t = nbsp(await o.page.locator('#p-konzerte').innerText());
  assert.match(t, /Konzerttermine gerade nicht erreichbar/);
  assert.match(t, /Plastic Autumn/);
  assert.deepEqual(o.fehler.filter(f => !/Failed to load resource/.test(f)), []);
  await o.ctx.close();
});

test('Eine Quelle gestört (Telefon online): nicht „offline“, sondern „letzter Stand von … – Quelle gerade gestört“', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne({ satz: 'v2' });
  zustand.fehlt.add('schnaeppchen-current.json');
  await page.reload();
  await page.waitForFunction(() => /gestört/.test(document.getElementById('stand').textContent));
  const stand = nbsp(await text(page, '#stand'));
  assert.match(stand, /Angebote: letzter Stand von 17:35 Uhr – Quelle gerade gestört/);
  assert.match(stand, /Vorteile gerade eben/);
  assert.doesNotMatch(stand, /offline/);
  assert.match(nbsp(await text(page, '#p-angebote')), /^Quelle gerade gestört – du siehst den letzten Stand von 17:35 Uhr\./);
  assert.match(nbsp(await page.locator('[data-produkt="knoppers-schnitte"]').innerText()), /15 × 25 g/, 'Karten aus dem letzten Stand');
  assert.deepEqual(fehler.filter(f => !/Failed to load resource/.test(f)), []);
  await ctx.close();
});

const ALT_SEITE = '<!doctype html><meta charset="utf-8"><title>alt</title><p>alte Seite</p>';
for (const [ordner, nach, cache, altSeite] of [
  ['schnaeppchen', '#angebote', 'schnaeppchen-1', readFileSync(join(FIX, 'alt', 'schnaeppchen-index.html'))],
  ['vorteile', '#vorteile', 'vorteile-v1', ALT_SEITE],
]) {
  test(`alter Service Worker (${ordner}) wird ersetzt: Zwischenspeicher weg, kleiner Worker bleibt, Seite landet auf Mein Vorteil`, { skip: ohnePw }, async () => {
    const ctx = await browser.newContext({ serviceWorkers: 'allow' });
    await ctx.route('https://**', r => r.fulfill({ status: 404, body: '' }));
    const page = await ctx.newPage();
    // 1. Stand vor dem Umzug: alte Seite + alter Worker (mit eigener Kopie im Zwischenspeicher)
    for (const p of [`/${ordner}/`, `/${ordner}/index.html`]) ersatz.set(p, { typ: TYP['.html'], text: altSeite });
    ersatz.set(`/${ordner}/sw.js`, { typ: TYP['.js'], text: readFileSync(join(FIX, 'alt', `${ordner}-sw.js.txt`)) });
    try {
      await page.goto(`${basis}/${ordner}/`);
      await page.evaluate(async () => { await navigator.serviceWorker.register('sw.js', { scope: './' }); await navigator.serviceWorker.ready; });
      await page.reload();
      await page.waitForFunction(async c => !!navigator.serviceWorker.controller && (await caches.keys()).includes(c), cache);
    } finally { ersatz.clear(); }
    // 2. Umzug veröffentlicht: neuer kleiner sw.js + Weiterleitung. Update wie beim nächsten Öffnen.
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()).catch(() => {}));
    await page.waitForURL(u => u.pathname === '/mein-vorteil/', { timeout: 15000 });
    assert.equal(new URL(page.url()).hash, nach);
    const rest = await page.evaluate(async o => ({
      caches: await caches.keys(),
      regs: (await navigator.serviceWorker.getRegistrations()).map(r => ({ scope: new URL(r.scope).pathname, skript: r.active?.scriptURL || '' })),
    }), ordner);
    assert.ok(!rest.caches.includes(cache), 'alter Cache noch da: ' + rest.caches);
    // der Worker des alten Ordners bleibt (neue Fassung): so sieht der SYNQUENZER-Worker diese Adressen nie
    const alt = rest.regs.find(r => r.scope === `/${ordner}/`);
    assert.ok(alt && alt.skript.endsWith(`/${ordner}/sw.js`), JSON.stringify(rest.regs));
    // altes Symbol noch einmal antippen: landet wieder auf Mein Vorteil, auch ohne Netz
    await page.goto(`${basis}/${ordner}/`);
    await page.waitForURL(u => u.pathname === '/mein-vorteil/');
    await ctx.close();
  });
}

test('SYNQUENZER-Worker im Wurzelordner: alte Adressen überschreiben seine Offline-Kopie nicht mehr', { skip: ohnePw }, async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'allow' });
  await ctx.route('https://**', r => r.fulfill({ status: 404, body: '' }));
  const page = await ctx.newPage();
  const SYNTH = '<!doctype html><meta charset="utf-8"><title>SYNQUENZER</title><p>Synth</p>';
  const kopie = () => page.evaluate(async () => { const r = await (await caches.open('synq-app-1')).match('/'); return r ? (await r.text()).match(/<title>([^<]*)/)?.[1] || '?' : null; });
  const setzeKopie = () => page.evaluate(async t => (await caches.open('synq-app-1')).put('/', new Response(t, { headers: { 'content-type': 'text/html' } })), SYNTH);
  ersatz.set('/', { typ: TYP['.html'], text: SYNTH });
  try {
    // Wurzel-Worker wie auf GitHub Pages (Scope = Wurzel), dazu Mein Vorteil mit eigenem Worker
    await page.goto(`${basis}/mein-vorteil/`);
    await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js', { scope: '/' }); });
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).filter(r => r.active).length >= 2, null, { timeout: 15000 });
    await setzeKopie();
    // alte Adressen: der erste Besuch meldet den eigenen kleinen Worker an (konzerte/ hatte nie einen) …
    for (const o of ['schnaeppchen', 'vorteile', 'konzerte']) {
      await page.goto(`${basis}/${o}/`);
      await page.waitForURL(u => u.pathname === '/mein-vorteil/');
    }
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).filter(r => r.active).length >= 5, null, { timeout: 15000 });
    await setzeKopie();
    // … danach gehen alte Symbole und Push-Links nie mehr durch den Wurzel-Worker
    for (const o of ['schnaeppchen', 'vorteile', 'konzerte', 'schnaeppchen']) {
      await page.goto(`${basis}/${o}/`);
      await page.waitForURL(u => u.pathname === '/mein-vorteil/');
      assert.equal(await kopie(), 'SYNQUENZER', `nach /${o}/`);
    }
  } finally { ersatz.clear(); }
  await ctx.close();
});

test('Weiterleitungsseite an falscher Stelle (als /Synquenzer/ aus einem fremden Zwischenspeicher): absolutes Ziel, kein 404', async () => {
  for (const o of ['schnaeppchen', 'vorteile', 'konzerte']) {
    const html = readFileSync(join(WURZEL, o, 'index.html'), 'utf8');
    const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    for (const [pfad, erwartet] of [['/Synquenzer/', '/Synquenzer/mein-vorteil/'], [`/Synquenzer/${o}/`, '/Synquenzer/mein-vorteil/'], [`/${o}/`, '/mein-vorteil/']]) {
      let ziel = null;
      new Function('location', 'navigator', 'setTimeout', js)({ pathname: pfad, hash: '', replace: u => { ziel = u; } }, {}, () => {});
      assert.ok(ziel && ziel.startsWith(erwartet + '?von=' + o + '#'), `${o} als ${pfad}: ${ziel}`);
    }
    assert.match(html, /<noscript><meta http-equiv="refresh" content="0; url=\/Synquenzer\/mein-vorteil\//);
    assert.doesNotMatch(html, /\.\.\/mein-vorteil/, 'keine relativen Ziele mehr');
  }
});

test('als Home-Bildschirm-App: startet ohne Netz aus dem eigenen Service Worker', { skip: ohnePw }, async () => {
  const { ctx, page, fehler, zustand } = await oeffne({ satz: 'v2', sw: 'allow' });
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
  await page.waitForFunction(async () => !!(await caches.open('mein-vorteil-1').then(c => c.match('./'))));
  await ctx.setOffline(true);
  zustand.offline = true;
  await page.reload();
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'Seite kommt vom eigenen Worker');
  await page.waitForFunction(() => /offline/.test(document.getElementById('stand').textContent));
  assert.match(nbsp(await page.locator('[data-produkt="knoppers-schnitte"]').innerText()), /15 × 25 g/);
  assert.equal(await page.evaluate(() => document.title), 'Mein Vorteil');
  assert.deepEqual(fehler.filter(f => !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(f)), []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  for (const dunkel of [false, true]) {
    test(`Layout ${breite}×${hoehe} (${lage}, ${dunkel ? 'dunkel' : 'hell'}): kein seitliches Scrollen, Tippflächen ≥ 44 px, Bildschirmfotos`, { skip: ohnePw }, async () => {
      for (const satz of dunkel ? ['vertrag'] : ['vertrag', 'v2']) {
        const { ctx, page, fehler } = await oeffne({ satz, breite, hoehe, dunkel });
        for (const r of ['angebote', 'vorteile', 'konzerte']) {
          await reiter(page, r);
          await pruefeLayout(page, `${satz} ${r} ${lage}`);
          await page.screenshot({ path: join(SHOTS, `${satz}-${r}-${lage}${dunkel ? '-dunkel' : ''}.png`), fullPage: !dunkel && lage === 'hoch' });
        }
        if (!dunkel && lage === 'hoch') {
          await page.locator('#push').click();
          await page.screenshot({ path: join(SHOTS, `${satz}-push-hilfe-${lage}.png`) });
        }
        assert.deepEqual(fehler, []);
        await ctx.close();
      }
    });
  }
}
