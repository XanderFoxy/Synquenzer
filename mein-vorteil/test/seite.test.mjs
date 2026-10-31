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

async function oeffne({ satz = 'vertrag', jetzt = JETZT, breite = 428, hoehe = 926, pfad = '/mein-vorteil/', dunkel = false, kontext = null, sw = 'block', fehlt = [], uhr = 'fest', patch = {}, vorher = null } = {}) {
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
    let body = readFileSync(SATZ[zustand.satz](n));
    if (patch[n]) { const d = JSON.parse(body); body = JSON.stringify(patch[n](d) ?? d); }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, route => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  if (vorher) await ctx.addInitScript(vorher);
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
  // (die Seite baut den Satz aus dem laufenden Angebot: ein Datumsformat auf der ganzen Karte, „ab Mo 2.11.“)
  assert.match(bj, /Tiefstpreis\?\s*unklar\s*PENNY hat 3,49 € \(mit App, ab Mo 2\.11\.\) – Packungsgröße dort nicht sicher/);
  assert.doesNotMatch(bj, /02\.11\./);
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
  // echte Daten (31.10., Lauf 41230376427): TM_KEY fehlt, nur 1 von 4 Festival-Seiten gestört (Gothic meets Klassik).
  // Die anderen drei wurden geprüft (HTTP 200) und melden neue Erwähnungen per Push -> nicht „Konzertsuche aus“.
  const echt = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#konzerte' });
  const kt = nbsp(await echt.page.locator('#p-konzerte').innerText());
  assert.doesNotMatch(kt, /Konzertsuche gerade aus|kein Push|README/);
  assert.match(kt, /Gerade nichts im Umkreis von 200 km\. Sobald etwas angekündigt wird, kommt ein Push\./);
  assert.match(kt, /Bis dahin kommen Termine nur von den Festival-Seiten \(Gothic meets Klassik gerade nicht erreichbar\)\./);
  assert.deepEqual(echt.fehler, []);
  await echt.ctx.close();
});

test('Konzerte: Festival-Seiten einzeln gezählt (status.seiten.geprueft/gesamt) – „aus“ nur, wenn keine Seite geprüft wurde', { skip: ohnePw }, async () => {
  const status = JSON.parse(readFileSync(join(FIX, 'echt-2026-10-31', 'v1', 'konzerte-status.json'), 'utf8'));
  const mit = seiten => JSON.stringify({ ...status, quellen: { ...status.quellen, seiten: { ...status.quellen.seiten, ...seiten } } });
  for (const [seiten, erwartet, nicht] of [
    // so schreibt der neue Scanner den echten Lauf 41230376427: 3 von 4 Seiten mit HTTP 200 geprüft
    [{ geprueft: 3, gesamt: 4 }, /nur von den Festival-Seiten \(3 von 4 geprüft – Gothic meets Klassik gerade nicht erreichbar\)\.[\s\S]*Festival-Seiten: 3 von 4 geprüft, 0 Treffer – gestört: Gothic meets Klassik: fetch failed/, /Konzertsuche gerade aus/],
    [{ geprueft: 0, gesamt: 4, fehler: ['Wave-Gotik-Treffen: HTTP 503', 'Dark Storm Festival: HTTP 503', 'NCN: fetch failed', 'Gothic meets Klassik: fetch failed'] },
      /Konzertsuche gerade aus – Ticketmaster-Schlüssel fehlt, Festival-Seiten gerade nicht erreichbar\. Bis das behoben ist, kommt hier kein Push\./, /Sobald etwas angekündigt wird/],
  ]) {
    const o = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#konzerte' });
    await o.ctx.route(/^https:\/\/raw\.githubusercontent\.com\/.*\/konzerte\/data\/status\.json/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: mit(seiten) }));
    await o.page.reload();
    await geladen(o.page);
    await o.page.evaluate(() => document.querySelectorAll('#p-konzerte details').forEach(d => (d.open = true)));
    const kt = nbsp(await o.page.locator('#p-konzerte').innerText());
    assert.match(kt, erwartet);
    assert.doesNotMatch(kt, nicht);
    assert.deepEqual(o.fehler, []);
    await o.ctx.close();
  }
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

// SYNQUENZER-Worker der Wurzel (echte sw.js, Scope = Wurzel wie /Synquenzer/ auf GitHub Pages) speichert jede Seite in seinem
// Bereich als Offline-Kopie des Synthesizers. Ohne Zurücksetzen der Kopie: nach jedem Weg zu Mein Vorteil startet der SYNQUENZER
// ohne Netz und bei schwachem Netz (> 3 s) wieder als SYNQUENZER.
const SYNTH = '<!doctype html><meta charset="utf-8"><title>SYNQUENZER</title><p>Synth</p>';
async function mitWurzelWorker() {
  const ctx = await browser.newContext({ serviceWorkers: 'allow' });
  await ctx.route('https://**', r => r.fulfill({ status: 404, body: '' }));
  const page = await ctx.newPage();
  ersatz.set('/', { typ: TYP['.html'], text: SYNTH });
  await page.goto(`${basis}/`);
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js', { scope: '/' }); await navigator.serviceWorker.ready; });
  const kopie = () => page.evaluate(async () => { const r = await (await caches.open('synq-app-1')).match('/'); return r ? (await r.text()).match(/<title>([^<]*)/)?.[1] || '?' : null; });
  await page.waitForFunction(async () => !!(await (await caches.open('synq-app-1')).match('/')));
  assert.equal(await kopie(), 'SYNQUENZER');
  const istSynth = async wo => { // die Seite prüft die Kopie 1,5 s nach dem Laden (vorher kann der Wurzel-Worker noch speichern)
    await page.waitForTimeout(2000);
    await page.waitForFunction(async () => { const r = await (await caches.open('synq-app-1')).match('/'); return !!r && /<title>SYNQUENZER/.test(await r.text()); }, null, { timeout: 6000 })
      .catch(async () => assert.fail(`${wo}: Offline-Kopie des SYNQUENZER ist jetzt „${await kopie()}“`));
  };
  const synthStart = async (wie, wo) => { // SYNQUENZER-Symbol antippen: ohne Netz bzw. mit Antwort erst nach 5 s
    if (wie === 'offline') await ctx.setOffline(true);
    else await ctx.route(`${basis}/`, async r => { await new Promise(x => setTimeout(x, 5000)); r.continue().catch(() => {}); });
    await page.goto(`${basis}/`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    assert.equal(await page.title(), 'SYNQUENZER', `${wo}: SYNQUENZER ${wie} gestartet`);
    if (wie === 'offline') await ctx.setOffline(false); else await ctx.unroute(`${basis}/`);
  };
  return { ctx, page, kopie, istSynth, synthStart };
}

test('SYNQUENZER-Worker im Wurzelordner: alte Symbole überschreiben seine Offline-Kopie nicht (ohne Zurücksetzen)', { skip: ohnePw }, async () => {
  const { ctx, page, istSynth, synthStart } = await mitWurzelWorker();
  try {
    // alte Symbole, erster Besuch nach dem Umzug (konzerte/ hatte nie einen eigenen Worker)
    for (const o of ['schnaeppchen', 'vorteile', 'konzerte']) {
      await page.goto(`${basis}/${o}/`);
      await page.waitForURL(u => u.pathname === '/mein-vorteil/');
      await geladen(page);
      await istSynth(`erster Besuch /${o}/`);
    }
    // die Weiterleitung meldet Mein Vorteils eigenen Worker zuerst an -> die Seite kommt nie vom Wurzel-Worker
    assert.match(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || ''), /\/mein-vorteil\/sw\.js$/);
    await synthStart('offline', 'nach den alten Symbolen');
    await synthStart('langsam', 'nach den alten Symbolen');
    for (const o of ['schnaeppchen', 'vorteile', 'konzerte']) {
      await page.goto(`${basis}/${o}/`);
      await page.waitForURL(u => u.pathname === '/mein-vorteil/');
      await istSynth(`wieder /${o}/`);
    }
  } finally { ersatz.clear(); }
  await ctx.close();
});

test('SYNQUENZER-Worker im Wurzelordner: Push-Link direkt auf Mein Vorteil (erster Besuch) – Kopie wird repariert', { skip: ohnePw }, async () => {
  const { ctx, page, istSynth, synthStart } = await mitWurzelWorker();
  try {
    await page.goto(`${basis}/mein-vorteil/#vorteile`);
    await geladen(page);
    // dieser erste Aufruf lief über den Wurzel-Worker (Mein Vorteils Worker war noch nicht angemeldet)
    await istSynth('Push-Link');
    await synthStart('offline', 'nach dem Push-Link');
    await synthStart('langsam', 'nach dem Push-Link');
    // danach übernimmt Mein Vorteils eigener Worker
    await page.goto(`${basis}/mein-vorteil/#angebote`);
    await geladen(page);
    assert.match(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || ''), /\/mein-vorteil\/sw\.js$/);
    await istSynth('zweiter Besuch');
  } finally { ersatz.clear(); }
  await ctx.close();
});

test('Weiterleitungsseite an falscher Stelle (als /Synquenzer/ aus einem fremden Zwischenspeicher): absolutes Ziel, kein 404', async () => {
  for (const o of ['schnaeppchen', 'vorteile', 'konzerte']) {
    const html = readFileSync(join(WURZEL, o, 'index.html'), 'utf8');
    const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    for (const [pfad, erwartet] of [['/Synquenzer/', '/Synquenzer/mein-vorteil/'], [`/Synquenzer/${o}/`, '/Synquenzer/mein-vorteil/'], [`/${o}/`, '/mein-vorteil/']]) {
      let ziel = null;
      new Function('location', 'navigator', 'setTimeout', 'document', js)({ pathname: pfad, hash: '', replace: u => { ziel = u; } }, {}, () => {}, { write() {} });
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

test('Tiefstpreis-Satz nennt nie ein abgelaufenes Angebot (PENNY-Fenster vorbei) und kein vergangenes „ab“', { skip: ohnePw }, async () => {
  const bjText = async page => nbsp(await page.locator('[data-produkt="ben-jerrys"]').innerText());
  // Di 3.11.: PENNY läuft (seit Mo) -> genannt, aber ohne „ab Mo 2.11.“
  let o = await oeffne({ satz: 'v2', jetzt: '2026-11-03T10:00:00Z' });
  let bj = await bjText(o.page);
  assert.match(bj, /Tiefstpreis\?\s*unklar\s*PENNY hat 3,49 € \(mit App\) – Packungsgröße dort nicht sicher/);
  assert.doesNotMatch(bj, /ab Mo 0?2\.11\./);
  await o.ctx.close();
  // PENNY sichtbarBis (2026-11-04T23:00Z) + 1 min, Daten noch vom letzten Lauf: Zeile weg und Satz neu
  o = await oeffne({ satz: 'v2', jetzt: '2026-11-04T23:01:00Z' });
  bj = await bjText(o.page);
  assert.doesNotMatch(bj, /PENNY|weiteres Angebot/);
  assert.match(bj, /Tiefstpreis\?\s*unklar\s*Einziges gefundenes Angebot in deiner Nähe · noch kein Preisverlauf/);
  // die Seite bleibt offen: genau beim Ende wechselt der Satz von selbst
  await o.ctx.close();
  o = await oeffne({ satz: 'v2', jetzt: '2026-11-04T22:59:00Z', uhr: 'laeuft' });
  assert.match(await bjText(o.page), /PENNY hat 3,49 €/);
  await o.page.clock.fastForward('03:00');
  await o.page.waitForFunction(() => !/PENNY/.test(document.querySelector('[data-produkt="ben-jerrys"]').textContent));
  assert.match(await bjText(o.page), /Einziges gefundenes Angebot in deiner Nähe/);
  assert.deepEqual(o.fehler, []);
  await o.ctx.close();
});

test('Grundpreis bei „465 ml oder 4 × 100 ml“: die Karte sagt, für welche Packung er gilt', { skip: ohnePw }, async () => {
  const patch = { 'schnaeppchen-current.json': d => {
    const b = d.produkte.find(p => p.id === 'ben-jerrys').bestes;
    b.einheitspreisVarianten = [{ packung: '4 × 100 ml', einheitspreis: 0.9975 }, { packung: '465 ml', einheitspreis: 0.858 }];
  } };
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', patch });
  const bj = nbsp(await page.locator('[data-produkt="ben-jerrys"] .einheit').innerText());
  assert.equal(bj, '1,00 € pro 100 ml (bei 4 × 100 ml; 465 ml: 0,86 €)', 'Prospekt: 8,58 €/l = 0,86 € pro 100 ml');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Preisfehler ohne bekannten Preis: „Preis siehe Angebot“ statt „jetzt ?“', { skip: ohnePw }, async () => {
  const patch = { 'schnaeppchen-current.json': d => { d.technik.find(t => /RTX/.test(t.titel)).preis = null; } };
  const { ctx, page, fehler } = await oeffne({ satz: 'vertrag', patch });
  const rtx = nbsp(await page.locator('#p-angebote [data-preisfehler]', { hasText: 'RTX 5070' }).innerText());
  assert.match(rtx, /Preis siehe Angebot\s*Originalpreis unbekannt/);
  assert.doesNotMatch(rtx, /\?|jetzt/);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Aufgeklappte Kästen bleiben offen, wenn die Seite neu zeichnet (Rückkehr aus dem Prospekt, neue Daten)', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v2' });
  const weitere = page.locator('[data-produkt="ben-jerrys"] details.weitere');
  await weitere.locator('summary').click();
  await page.locator('#p-angebote details.kasten summary').click();
  assert.equal(await weitere.evaluate(d => d.open), true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); // zurück aus dem Prospekt
  await page.locator('#neu').click(); // neue Daten
  await geladen(page);
  await page.waitForFunction(() => !document.getElementById('neu').hasAttribute('aria-busy'));
  assert.equal(await weitere.evaluate(d => d.open), true, '„1 weiteres Angebot“ bleibt offen');
  assert.equal(await page.locator('#p-angebote details.kasten').evaluate(d => d.open), true, 'Quellen bleiben offen');
  assert.equal(await page.locator('[data-produkt="knoppers-schnitte"] details.weitere').count(), 0);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Vorteile-Zähler wie bei den Angeboten: was erst Montag beginnt, zählt nicht mit', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#vorteile' });
  const ab = await page.locator('#p-vorteile article .marke.warm', { hasText: 'ab Mo 2.11.' }).count();
  const karten = await page.locator('#p-vorteile article').count();
  assert.equal(ab, 2, 'Butter und Bonne Maman');
  assert.equal(await page.locator('#t-vorteile .n').innerText(), String(karten - ab));
  // die Zeile nennt den Beginn im selben Format wie die Marke
  assert.match(nbsp(await page.locator('#p-vorteile article', { hasText: 'Président' }).innerText()), /ab Mo 2\.11\./);
  // am Montag zählen sie mit
  await page.clock.setFixedTime(new Date('2026-11-02T08:00:00Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await page.locator('#t-vorteile .n').innerText(), String(await page.locator('#p-vorteile article').count()));
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Umzug-Hinweis im alten Home-Bildschirm-Symbol: Adresse zum Kopieren statt „in Safari Teilen“', { skip: ohnePw }, async () => {
  const vorher = () => Object.defineProperty(navigator, 'standalone', { value: true });
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/?von=schnaeppchen#angebote', vorher });
  const u = page.locator('#umzug');
  assert.equal(await u.isVisible(), true);
  assert.match(nbsp(await u.innerText()), /localhost:\d+\/mein-vorteil\/ in Safari öffnen, dann Teilen → Zum Home-Bildschirm/);
  assert.equal(await u.locator('button').count(), 2);
  await pruefeLayout(page, 'Umzug als App');
  await u.getByRole('button', { name: 'Verstanden' }).click();
  assert.equal(await u.isHidden(), true);
  assert.deepEqual(fehler, []);
  await ctx.close();
  // in Safari (kein eigenes Fenster) bleibt der kurze Hinweis
  const s = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/?von=schnaeppchen#angebote' });
  assert.match(nbsp(await s.page.locator('#umzug').innerText()), /in Safari Teilen → Zum Home-Bildschirm/);
  await s.ctx.close();
});

test('Spar-Tipps: „Zurück“ führt direkt zu Mein Vorteil (nicht über die alte Seite mit Umzug-Hinweis)', { skip: ohnePw }, async () => {
  const { ctx, page } = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#vorteile' });
  await page.locator('#p-vorteile details.kasten summary', { hasText: 'Spar-Tipps' }).click();
  await page.locator('#p-vorteile a', { hasText: 'Spar-Tipps öffnen' }).click();
  await page.waitForURL(u => u.pathname === '/vorteile/spartipps.html');
  await page.locator('a.zurueck').click();
  await page.waitForURL(u => u.pathname === '/mein-vorteil/');
  await geladen(page);
  assert.equal(new URL(page.url()).hash, '#vorteile');
  assert.equal(await page.locator('#umzug').isHidden(), true);
  await ctx.close();
});

test('Alte Vorteils-Adresse baut die alte Seite nicht mehr auf (keine Datenabrufe, kein Aufblitzen)', { skip: ohnePw }, async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const abrufe = [];
  await ctx.route(u => u.protocol === 'https:', r => { abrufe.push(r.request().url()); return r.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' }, body: '' }); });
  const page = await ctx.newPage();
  const html = [];
  page.on('response', async r => { if (new URL(r.url()).pathname === '/vorteile/') html.push(r.url()); });
  await page.goto(`${basis}/vorteile/#konzerte`, { waitUntil: 'commit' });
  await page.waitForURL(u => u.pathname === '/mein-vorteil/');
  assert.equal(new URL(page.url()).hash, '#konzerte');
  assert.equal(html.length, 1);
  // vor dem Weiterleiten: nur Mein Vorteils eigene fünf Datenabrufe, nicht die drei der alten Seite
  await geladen(page);
  await page.waitForFunction(() => /gestört|keine Verbindung/.test(document.getElementById('stand').textContent));
  const daten = abrufe.filter(u => /raw\.githubusercontent\.com/.test(u));
  assert.equal(daten.length, 5, daten.join('\n'));
  assert.ok(daten.every(u => /konzerte\/data\/(konzerte|releases|status)\.json|current\.json|aktuell\.json/.test(u)));
  await ctx.close();
});

test('Push-Hilfe quer (926 × 428): „In ntfy öffnen“ und „Schließen“ sind ohne Scrollen sichtbar', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ satz: 'v2', breite: 926, hoehe: 428 });
  await page.locator('#push').click();
  const d = await page.evaluate(() => { const r = document.getElementById('push-hilfe').getBoundingClientRect(); return { oben: r.top, unten: r.bottom }; });
  for (const name of ['In ntfy öffnen', 'Schließen']) {
    const b = await page.locator('#push-hilfe').getByRole(name === 'Schließen' ? 'button' : 'link', { name }).boundingBox();
    assert.ok(b && b.y >= d.oben && b.y + b.height <= Math.min(428, d.unten) + 0.5, `${name}: ${JSON.stringify(b)} Dialog ${JSON.stringify(d)}`);
  }
  await page.screenshot({ path: join(SHOTS, 'push-hilfe-quer.png') });
  assert.deepEqual(fehler, []);
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
