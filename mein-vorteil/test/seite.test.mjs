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
};

async function oeffne({ satz = 'vertrag', jetzt = JETZT, breite = 428, hoehe = 926, pfad = '/mein-vorteil/', dunkel = false, kontext = null, sw = 'block' } = {}) {
  const ctx = kontext || await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: dunkel ? 'dark' : 'light', serviceWorkers: sw,
  });
  const zustand = { satz, offline: false };
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    if (zustand.offline) return route.abort('internetdisconnected');
    const u = new URL(route.request().url());
    const rest = u.pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    const n = DATEI[rest];
    if (!n) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: readFileSync(SATZ[zustand.satz](n)) });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com)/, route => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  await page.clock.setFixedTime(new Date(jetzt));
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
  assert.ok(r.sw <= r.iw && r.bw <= r.iw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${r.iw})`);
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
  assert.match(t, /Normalpreis geschätzt\s*ca\. 0,38 € pro Stück · 51 % darunter/);
  assert.match(t, /bis heute, 19:00 Uhr/);
  assert.match(t, /Im Prospekt ansehen \(Kaufland\)/);
  assert.doesNotMatch(t, /24er|40 Stück|0,07|82 %/);
  // Ben & Jerry's beginnt erst Montag
  const bj = nbsp(await page.locator('[data-produkt="ben-jerrys"]').innerText());
  assert.match(bj, /ab Mo 2\.11\./);
  assert.match(bj, /465 ml/);
  assert.match(bj, /PENNY · \[Penny\] Ben Jerrys 3,49 · Packungsgröße unklar|1 weiteres Angebot/);
  assert.match(nbsp(await text(page, '#stand')), /^Stand: Angebote gerade eben · Vorteile gerade eben · Konzerte vor 5 Min\./);
  assert.equal(await page.locator('#t-angebote .n').innerText(), '2');
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
  assert.match(await text(page, '#p-angebote'), /Knoppers Schnitte\s*Gerade kein Angebot/);
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
  assert.equal(await karten.count(), 2, 'Lumaland (doppelt in beiden Quellen) einmal + RTX');
  const luma = nbsp(await karten.filter({ hasText: 'Lumaland' }).innerText());
  assert.match(luma, /vorher 96,99 €\s*→\s*jetzt 23,99 €/);
  assert.match(luma, /du sparst 73,00 € \(−75 %\)/);
  assert.match(luma, /Vergleichspreis laut mydealz/);
  assert.match(luma, /gemeldet vor 45 Min\./);
  const rtx = nbsp(await karten.filter({ hasText: 'RTX 5070' }).innerText());
  assert.match(rtx, /jetzt 165,00 €/);
  assert.match(rtx, /Originalpreis unbekannt/);
  assert.doesNotMatch(rtx, /vorher|du sparst/);
  // Preisfehler stehen oben, wenn es welche gibt
  assert.match(await page.locator('#p-angebote h2').first().innerText(), /Preisfehler/i);
  for (const r of ['angebote', 'vorteile', 'konzerte']) {
    await reiter(page, r);
    assert.doesNotMatch(await page.locator('#p-' + r).textContent(), /ABGELAUFEN/, `${r}: Abgelaufenes sichtbar`);
  }
  assert.equal(await page.locator('#t-angebote .n').innerText(), '4', 'Zähler: 2 Deals + 2 Preisfehler');
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
  // echte Daten: TM_KEY fehlt -> ehrlicher Hinweis statt leerer Liste ohne Grund
  const echt = await oeffne({ satz: 'v2', pfad: '/mein-vorteil/#konzerte' });
  assert.match(await echt.page.locator('#p-konzerte').innerText(), /TM_KEY/);
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
    assert.equal(await page.locator(`#t-${nach.slice(1)}`).getAttribute('aria-selected'), 'true', von);
  }
  await ctx.close();
});

const ALT_SEITE = '<!doctype html><meta charset="utf-8"><title>alt</title><p>alte Seite</p>';
for (const [ordner, nach, cache, altSeite] of [
  ['schnaeppchen', '#angebote', 'schnaeppchen-1', readFileSync(join(FIX, 'alt', 'schnaeppchen-index.html'))],
  ['vorteile', '#vorteile', 'vorteile-v1', ALT_SEITE],
]) {
  test(`alter Service Worker (${ordner}) wird ersetzt: Zwischenspeicher weg, abgemeldet, Seite landet auf Mein Vorteil`, { skip: ohnePw }, async () => {
    const ctx = await browser.newContext({ serviceWorkers: 'allow' });
    await ctx.route('https://**', r => r.fulfill({ status: 404, body: '' }));
    const page = await ctx.newPage();
    // 1. Stand vor dem Umzug: alte Seite + alter Worker (mit eigener Kopie im Zwischenspeicher)
    for (const p of [`/${ordner}/`, `/${ordner}/index.html`]) ersatz.set(p, { typ: TYP['.html'], text: altSeite });
    ersatz.set(`/${ordner}/sw.js`, { typ: TYP['.js'], text: readFileSync(join(FIX, 'alt', `${ordner}-sw.js`)) });
    try {
      await page.goto(`${basis}/${ordner}/`);
      await page.evaluate(async () => { await navigator.serviceWorker.register('sw.js', { scope: './' }); await navigator.serviceWorker.ready; });
      await page.reload();
      await page.waitForFunction(async c => !!navigator.serviceWorker.controller && (await caches.keys()).includes(c), cache);
    } finally { ersatz.clear(); }
    // 2. Umzug veröffentlicht: neuer sw.js (Abschalt-Worker) + Weiterleitung. Update wie beim nächsten Öffnen.
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()).catch(() => {}));
    await page.waitForURL(u => u.pathname === '/mein-vorteil/', { timeout: 15000 });
    assert.equal(new URL(page.url()).hash, nach);
    const rest = await page.evaluate(async () => ({
      caches: await caches.keys(),
      regs: (await navigator.serviceWorker.getRegistrations()).map(r => new URL(r.scope).pathname),
    }));
    assert.ok(!rest.caches.includes(cache), 'alter Cache noch da: ' + rest.caches);
    assert.ok(!rest.regs.includes(`/${ordner}/`), 'alter Worker noch angemeldet: ' + rest.regs);
    await ctx.close();
  });
}

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
