// Reiter „Spartricks“ (spartricks.js + spartricks.json): Daten-Schema (Pflichtfelder, gültige URLs, keine Doppelten),
// tolerantes Lesen, Haken in index.html/sw.js und Browser-Tests (Chips, Suche, Stern, Geburtstag, Frist, Start-Kachel,
// keine Konsolenfehler, Layout 428 × 926 und 926 × 428). Fotos nach $MV_SHOTS/spartricks/, sonst ins Temp-Verzeichnis.
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
const FOTOS = join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'spartricks');
const JETZT = '2026-11-15T10:00:00Z'; // So 15.11.2026, 11:00 Berliner Zeit
const DATEN = JSON.parse(readFileSync(join(MV, 'spartricks.json'), 'utf8'));
const CHIPS = ['top', 'geld', 'einkaufen', 'gratis', 'geburtstag', 'freizeit', 'gewinnspiele'];
const CHIP_NAMEN = ['Top 10', 'Geld zurück', 'Clever einkaufen', 'Gratis & Proben', 'Geburtstag gratis', 'Freizeit & Reisen', 'Gewinnspiele'];
const REGIONEN = ['Döbeln', 'Leipzig', 'Dresden', 'Chemnitz', 'Sachsen', 'bundesweit'];
// Zahlen je Chip kommen aus der Datei (Datenpflege lässt die Tests nicht scheitern)
const ANZAHL = Object.fromEntries(CHIPS.slice(1).map(c => [c, DATEN.tipps.filter(t => t.bereich === c).length]));
// Deal-Portale/Vergleichsseiten: allein kein Beleg (dann „community“); Umfrage-/Provisionsportale und fremde Länderseiten nie
const PORTAL = /(^|\.)(mydealz\.de|monsterdealz\.de|dealdoktor\.de|schnaeppchenfuchs\.com|freizeitparkdeals\.de|travelcircus\.de|groupon\.de)$/;
const NIE_QUELLE = /freecash\.com|airhelp\.|wandernundmehr\.|flightright\.|euclaim\.|\/en-(ie|gb|us)\//i;

function modul(speicher = {}) {
  const localStorage = { getItem: k => (k in speicher ? speicher[k] : null), setItem: (k, v) => { speicher[k] = String(v); } };
  const ctx = { window: {}, localStorage, Intl, Date, console, URL };
  vm.runInNewContext(readFileSync(join(MV, 'spartricks.js'), 'utf8'), ctx);
  return { S: ctx.window.MeinVorteilSpartricks, speicher };
}
const plain = x => JSON.parse(JSON.stringify(x));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9äöüß]+/g, ' ').trim();

// --- Daten-Schema ------------------------------------------------------------------------------------------------------
test('Schema spartricks.json: Fassung, Stand, Bereiche, Pflichtfelder, gültige https-Quellen, keine Doppelten', () => {
  assert.equal(DATEN.version, 1);
  assert.match(DATEN.stand, /^\d{4}-\d\d-\d\d$/);
  assert.ok(!Number.isNaN(Date.parse(DATEN.stand)));
  assert.ok(typeof DATEN.hinweis === 'string' && DATEN.hinweis.length > 20);
  assert.deepEqual(DATEN.bereiche.map(b => b.id), CHIPS);
  assert.deepEqual(DATEN.bereiche.map(b => b.name), CHIP_NAMEN);
  const ids = new Set(), titel = new Set(), texte = new Set(), tops = [];
  for (const t of DATEN.tipps) {
    const wo = t.id || JSON.stringify(t).slice(0, 60);
    assert.match(t.id, /^[a-z0-9-]{2,60}$/, wo);
    assert.ok(!ids.has(t.id), `doppelte id ${t.id}`); ids.add(t.id);
    assert.ok(CHIPS.includes(t.bereich) && t.bereich !== 'top', `${wo}: Bereich ${t.bereich}`);
    for (const f of ['titel', 'text', 'nutzen', 'stand']) assert.ok(typeof t[f] === 'string' && t[f].trim().length >= 3, `${wo}: ${f} fehlt`);
    assert.ok(t.titel.length <= 100, `${wo}: Titel zu lang`);
    assert.ok(t.text.length <= 650, `${wo}: „So geht’s“ zu lang (${t.text.length})`);
    assert.ok(!titel.has(norm(t.titel)), `doppelter Titel ${t.titel}`); titel.add(norm(t.titel));
    assert.ok(!texte.has(norm(t.text)), `doppelter Text ${t.id}`); texte.add(norm(t.text));
    assert.ok(['belegt', 'community'].includes(t.sicherheit), `${wo}: sicherheit`);
    assert.ok(Array.isArray(t.region) && t.region.length && t.region.every(r => REGIONEN.includes(r)), `${wo}: region ${t.region}`);
    assert.equal(new Set(t.region).size, t.region.length, `${wo}: Region doppelt`);
    assert.ok(Array.isArray(t.quellen) && t.quellen.length >= 1 && t.quellen.length <= 4, `${wo}: Quellen`);
    const urls = new Set();
    for (const q of t.quellen) {
      assert.ok(typeof q.name === 'string' && q.name.length >= 3, `${wo}: Quellenname`);
      assert.match(q.url, /^https:\/\/[^\s"<>]+$/, `${wo}: ${q.url}`);
      const u = new URL(q.url);
      assert.equal(u.protocol, 'https:');
      assert.match(u.hostname, /^[a-z0-9.-]+\.[a-z]{2,}$/, `${wo}: Host ${u.hostname}`);
      assert.ok(!urls.has(q.url), `${wo}: Quelle doppelt`); urls.add(q.url);
    }
    if ('top' in t) { assert.ok(Number.isInteger(t.top) && t.top > 0, wo); tops.push(t.top); }
    if ('bis' in t) assert.match(t.bis, /^\d{4}-\d\d-\d\d$/, wo);
    if ('einmalig' in t) assert.ok(t.einmalig === true && 'bis' in t, `${wo}: einmalig nur mit bis`);
    if ('aktionBis' in t) assert.match(t.aktionBis, /^\d{4}-\d\d-\d\d$/, wo);
    if ('art' in t) assert.equal(t.art, 'anleitung', wo);
    for (const q of t.quellen) assert.doesNotMatch(q.url, NIE_QUELLE, `${wo}: fragwürdige Quelle ${q.url}`);
    if (t.sicherheit === 'belegt') assert.ok(t.quellen.some(q => !PORTAL.test(new URL(q.url).hostname)), `${wo}: „belegt“ nur mit Deal-Portalen`);
    if (t.bereich === 'geburtstag') {
      assert.ok(t.anmelden && Number.isInteger(t.anmelden.tage) && t.anmelden.tage >= 0 && t.anmelden.text.length > 5, `${wo}: anmelden fehlt`);
    } else assert.equal(t.anmelden, undefined, `${wo}: anmelden nur bei Geburtstag`);
    // Xander 07.11.2026: „Prämien & Freunde werben“ (Strom, Bank, Konto, Freunde werben) nie zeigen
    assert.doesNotMatch(`${t.titel} ${t.text}`, /freunde[ -]werben|girokonto|startprämie|kontoprämie|strom & gas|stromanbieter/i, `${wo}: Prämien-Thema`);
  }
  assert.deepEqual([...tops].sort((a, b) => a - b), tops.map((_, i) => i + 1), 'Top-Plätze lückenlos ab 1');
  assert.ok(tops.length >= 12, 'Ersatz für abgelaufene Fristen');
  for (const [c, z] of Object.entries(ANZAHL)) assert.ok(z >= 3, `Bereich ${c} fast leer (${z})`);
  // Top 10: Fristen zuerst, nur ein Flug-Tipp in den ersten zehn
  const top = DATEN.tipps.filter(t => t.top).sort((a, b) => a.top - b.top);
  const mitFrist = top.slice(0, 10).map(t => !!t.bis);
  assert.deepEqual(mitFrist, [...mitFrist].sort((a, b) => b - a), 'Fristen vor den übrigen');
  assert.equal(top.slice(0, 10).filter(t => /flug/i.test(t.id)).length, 1, 'ein Flug-Tipp in den Top 10');
  // Geburtstag: Regionen ehrlich (Marke = Ort), Anleitungen gekennzeichnet, kein Nicht-Angebot
  const geb = DATEN.tipps.filter(t => t.bereich === 'geburtstag');
  for (const r of ['Leipzig', 'Dresden', 'Chemnitz', 'Sachsen', 'bundesweit']) assert.ok(geb.some(t => t.region.includes(r)), `Geburtstag ohne ${r}`);
  assert.ok(geb.some(t => t.anmelden.tage > 0) && geb.some(t => t.anmelden.tage === 0));
  for (const t of geb) assert.doesNotMatch(`${t.titel} ${t.anmelden.text}`, /kein Geburtstag/i, `${t.id}: kein Geburtstagsangebot`);
  assert.deepEqual(geb.filter(t => t.art === 'anleitung').map(t => t.id), ['geb-planen', 'geb-plan-sachsen']);
  assert.match(geb.find(t => t.id === 'geb-plan-sachsen').ort, /Döbeln selbst .*kein Geburtstagsangebot/);
  // Prüfer-Stichprobe 15.11.2026 (M2–M5): richtige Regeln
  const tx = id => DATEN.tipps.find(t => t.id === id).text;
  assert.match(tx('rundfunk'), /binnen zwei Monaten nach dem Bescheid/);
  assert.match(tx('internet'), /Festnetz: 30 Messungen an 3 verschiedenen Kalendertagen/);
  assert.doesNotMatch(tx('museen-dresden'), /Weber-Museum ist der Eintritt|und im Carl-Maria-von-Weber-Museum ist/);
  assert.doesNotMatch(tx('lidl-plus'), /100 Punkte → 5/);
  assert.match(tx('flug-verspaetung'), /Pilotphase/);
});

test('spartricks.js liest tolerant: fehlende Pflichtfelder, doppelte ids, kaputte Links, fremde Regionen, neue Fassung', () => {
  const { S } = modul();
  const I = S._intern;
  const n = plain({ ...I.normalisiere({
    version: 1, stand: '2026-11-15',
    tipps: [
      { id: 'aa', bereich: 'geld', titel: 'A', text: 'So geht A', quellen: [{ name: 'x', url: 'javascript:alert(1)' }, { name: 'gut', url: 'https://example.org/a' }, { url: 'https://example.org/a' }], region: ['Mars', 'Leipzig'] },
      { id: 'aa', bereich: 'geld', titel: 'doppelt', text: 'x' },
      { id: 'bb', bereich: 'top', titel: 'B', text: 'x' }, // „top“ ist kein Bereich
      { id: 'cc', bereich: 'unbekannt', titel: 'C', text: 'x' },
      { id: 'dd', bereich: 'gratis', titel: '', text: 'x' },
      { id: 'E E', bereich: 'gratis', titel: 'E', text: 'x' },
      null, 'Quatsch',
      { id: 'ff', bereich: 'geburtstag', titel: 'F', text: 'x', anmelden: { tage: 'viel', text: 'y' }, bis: '2026-13-40', einmalig: 'ja', aktionBis: 'bald', art: 'werbung' },
      { id: 'gg', bereich: 'geld', titel: 'G', text: 'x', bis: '2026-12-31', einmalig: true, aktionBis: '2027-02-28', art: 'anleitung' },
    ],
  }), namen: null });
  assert.deepEqual(n.tipps.map(t => t.id), ['aa', 'ff', 'gg']);
  assert.deepEqual([n.tipps[1].einmalig, n.tipps[1].aktionBis, n.tipps[1].art], [false, null, null]);
  assert.deepEqual([n.tipps[2].einmalig, n.tipps[2].aktionBis, n.tipps[2].art], [true, '2027-02-28', 'anleitung']);
  assert.deepEqual(n.tipps[0].quellen, [{ name: 'gut', url: 'https://example.org/a' }]);
  assert.deepEqual(n.tipps[0].region, ['Leipzig']);
  assert.deepEqual(n.tipps[1].region, ['bundesweit']);
  assert.equal(n.tipps[1].anmelden, null);
  assert.equal(n.tipps[1].bis, null);
  assert.deepEqual(plain(I.normalisiere(null).tipps), []);
  assert.deepEqual(plain(I.normalisiere({ tipps: 'kaputt' }).tipps), []);
  // echte Datei: nichts fällt weg
  assert.equal(I.normalisiere(DATEN).tipps.length, DATEN.tipps.length);
  // CSS: nur eigene Klassen (.sp-…)
  const css = I.CSS().replace(/\/\*[\s\S]*?\*\//g, '');
  const sel = [...css.matchAll(/(^|})\s*([^{}]+)\{/g)].flatMap(m => m[2].split(',').map(x => x.trim())).filter(Boolean);
  assert.ok(sel.length > 30);
  for (const s of sel) assert.match(s, /^\.sp(-|\b)/, `fremder Selektor: ${s}`);
});

test('Listen: Top 10 nach Platz (abgelaufene Frist rückt nach), Bereiche in Daten-Reihenfolge, Suche mit Umlauten', () => {
  const { S } = modul();
  const I = S._intern;
  const n = I.normalisiere(DATEN);
  const top = plain(I.liste(n, 'top', '2026-11-15').map(t => t.id));
  assert.equal(top.length, 10);
  assert.deepEqual(top.slice(0, 3), ['kfz-wechsel', 'steuer-2022', 'flug-2023']);
  const dez = plain(I.liste(n, 'top', '2026-12-01').map(t => t.id));
  assert.equal(dez.length, 10);
  assert.ok(!dez.includes('kfz-wechsel') && dez.at(-1) === 'bahn-entschaedigung', 'Frist 30.11. vorbei -> Platz 11 rückt nach');
  // einmalige Frist (Steuer 2022) kommt nie wieder: danach ganz weg, nur unter „Gemerkt“ noch zu sehen
  assert.ok(I.liste(n, 'geld', '2026-12-31').some(t => t.id === 'steuer-2022'));
  assert.ok(!I.liste(n, 'geld', '2027-01-01').some(t => t.id === 'steuer-2022' || t.id === 'flug-2023'));
  assert.equal(I.liste(n, 'geld', '2027-01-01').at(-1).id, 'kfz-wechsel', 'jährliche Frist bleibt am Ende');
  assert.deepEqual(plain(I.liste(n, 'gemerkt', '2027-01-01', ['steuer-2022']).map(t => t.id)), ['steuer-2022']);
  const geld = I.liste(n, 'geld', '2026-12-01').map(t => t.id);
  assert.equal(geld.at(-1), 'kfz-wechsel', 'Frist vorbei: ans Ende des Bereichs');
  assert.equal(I.liste(n, 'geld', '2026-11-15')[0].id, 'kfz-wechsel');
  const such = q => plain(n.tipps.filter(t => I.passt(t, q, n)).map(t => t.id));
  assert.ok(such('Döbeln').includes('bibliothek'));
  assert.deepEqual(such('dobeln'), such('Döbeln'));
  assert.deepEqual(such('doebeln'), such('Döbeln'));
  assert.ok(such('bahn').length >= 5);
  assert.ok(such('payback').includes('payback') && such('payback').includes('drogerie'));
  assert.deepEqual(such('payback bahn'), [], 'alle Wörter müssen passen');
  assert.ok(such('Leipzig zoo').includes('zoo-leipzig'));
  assert.equal(such('').length, n.tipps.length);
  assert.deepEqual(plain(I.liste(n, 'gemerkt', '2026-11-15', ['pfand', 'gibtsnicht', 'rundfunk']).map(t => t.id)), ['rundfunk', 'pfand']);
});

test('Geburtstag: nächster Geburtstag und „vorher anmelden bis …“', () => {
  const { S } = modul();
  const I = S._intern;
  assert.equal(I.naechsterGeburtstag('03-04', '2026-11-15'), '2027-03-04');
  assert.equal(I.naechsterGeburtstag('11-15', '2026-11-15'), '2026-11-15');
  assert.equal(I.naechsterGeburtstag('12-24', '2026-11-15'), '2026-12-24');
  assert.equal(I.naechsterGeburtstag('02-29', '2026-11-15'), '2028-02-29');
  assert.equal(I.naechsterGeburtstag('kaputt', '2026-11-15'), null);
  const t = { anmelden: { tage: 28, text: 'Club beitreten' } };
  // Vorlauf ist eine Faustregel, keine Frist des Anbieters – so steht es da (Prüfer M6)
  assert.equal(I.anmeldeZeile(t, '2027-03-04', '2026-11-15'), '<b>Am besten anmelden bis 04.02.</b> (Faustregel 4 Wochen vorher) – Club beitreten');
  assert.equal(I.anmeldeZeile(t, null, '2026-11-15'), '<b>Rechtzeitig anmelden:</b> Faustregel 4 Wochen vor dem Geburtstag – Club beitreten');
  assert.match(I.anmeldeZeile(t, '2026-11-25', '2026-11-15'), /^<b>Jetzt anmelden<\/b> – Faustregel wäre 4 Wochen vorher, der Geburtstag ist in 10 Tagen/);
  assert.equal(I.anmeldeZeile({ anmelden: { tage: 14, text: 'App' } }, null, '2026-11-15'), '<b>Rechtzeitig anmelden:</b> Faustregel 2 Wochen vor dem Geburtstag – App');
  assert.doesNotMatch(JSON.stringify(DATEN.tipps.map(x => I.anmeldeZeile(x, '2027-03-04', '2026-11-15'))), /spätestens|musst/);
  assert.equal(I.anmeldeZeile({ anmelden: { tage: 0, text: 'keine Anmeldung – am Geburtstag mit Ausweis' } }, null), '<b>Ohne Anmeldung</b> – am Geburtstag mit Ausweis');
  assert.equal(I.anmeldeZeile({ anmelden: { tage: 0, text: 'vorher anrufen, ob es gilt' } }, null), '<b>Vorher:</b> vorher anrufen, ob es gilt');
  assert.equal(I.kurzName('Verbraucherzentrale Niedersachsen – Kfz-Versicherung 2026'), 'Verbraucherzentrale Niedersachsen');
  assert.equal(I.kurzName('Lohnsteuer kompakt: Antragsveranlagung'), 'Lohnsteuer kompakt');
  // gleich lautende Knöpfe bekommen das Thema dazu (Prüfer L7) – auf keiner Karte zwei gleiche Knöpfe
  assert.deepEqual(plain(I.quellNamen([{ name: 'mydealz – Übersicht Freebies zum Geburtstag' }, { name: 'mydealz – Zum Geburtstag: Gratis-Eintritte, Essen, Gutscheine' }, { name: 'Finanztip – Rundfunk' }, { name: 'mydealz' }, { name: 'L-IZ – Zoo Leipzig Kindertag 2026 am 1. Juni' }, { name: 'L-IZ – Zoo Leipzig Kindertag 2026 im September' }])),
    ['mydealz: Übersicht Freebies zum …', 'mydealz: Zum Geburtstag: …', 'Finanztip', 'mydealz', 'L-IZ: Zoo Leipzig Kindertag (1)', 'L-IZ: Zoo Leipzig Kindertag (2)']);
  for (const x of DATEN.tipps) { const k = I.quellNamen(x.quellen); assert.equal(new Set(k).size, k.length, `${x.id}: ${k.join(' · ')}`); }
  // Start-Kachel-Auszug: klein, nur was die Kachel braucht
  const auszug = JSON.stringify(I.kachelAuszug(DATEN));
  assert.ok(auszug.length < JSON.stringify(DATEN).length / 4, `Auszug ${auszug.length} Zeichen`);
  assert.deepEqual(Object.keys(I.kachelAuszug(DATEN).tipps[0]).sort(), ['bis', 'id', 'nutzen', 'sicherheit', 'titel', 'top']);
});

test('Haken: index.html (Leiste, eigene Seite, Skript erst beim Öffnen, Kachel), sw.js (spartricks.js im Zwischenspeicher)', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  const leiste = html.match(/<div class="breite sprung-zeile"[^>]*>([\s\S]*?)<\/div>/)[1];
  assert.match(leiste, /<a href="#spartricks" data-reiter="spartricks" class="f-spartricks"><svg class="ic" aria-hidden="true"><use href="#ic-spartricks"\/><\/svg><span class="t">Spartricks<\/span><span class="n"><\/span><\/a>\s*<a href="#mehr"/);
  assert.match(html, /<symbol id="ic-spartricks" viewBox="0 0 24 24">/);
  assert.match(html, /<section id="p-spartricks" class="reiter-seite breite f-spartricks" aria-labelledby="h-spartricks" hidden>/);
  assert.match(html, /<div id="i-spartricks"><p class="leer">Lade Spartricks …<\/p><\/div>/);
  assert.doesNotMatch(html, /<script[^>]+src="spartricks\.js"/, 'kein festes Skript-Tag');
  assert.match(html, /sparSkript\.src = 'spartricks\.js'/);
  assert.match(html, /REITER_START\.spartricks = starteSpartricks;/);
  assert.match(html, /REITER_NEU\.spartricks = /);
  assert.match(html, /const KACHEL_REIHE = \[[^\]]*'krypto', 'spartricks', 'mehr'\]/);
  assert.doesNotMatch(html, /\.sp-/, 'kein Spartricks-CSS in der Seite');
  assert.doesNotMatch(html, /fetch\(\s*['"`][^'"`]*spartricks\.json/, 'die Startseite holt die Daten nie selbst (lazy)');
  assert.doesNotMatch(html, /sparVorladen|requestIdleCallback\(los/, 'kein Abruf im Leerlauf');
  assert.doesNotMatch(readFileSync(join(MV, 'spartricks.js'), 'utf8'), /https?:\/\/(?!example)[^'"`\s]*\.(js|css)\b|googletagmanager|analytics|gtag\(|<script/i, 'keine fremden Skripte, kein Tracking');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /addAll\(\[SEITE, 'filme\.js', 'spartricks\.js',/);
  assert.match(sw, /rest === 'spartricks\.js'/);
  assert.doesNotMatch(sw, /spartricks\.json'/, 'Daten nicht im Worker');
});

// --- Browser ---------------------------------------------------------------------------------------------------------------
let pw = null;
try { pw = createRequire(import.meta.url)('playwright'); } catch { /* nicht installiert */ }
const ohnePw = pw ? false : 'Playwright nicht installiert';
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server, basis, browser;
const abrufe = [];
let sparAus = false; // spartricks.json „offline“
let sparInhalt = null; // statt der echten spartricks.json (neue Fassung, kaputte Datei)

before(async () => {
  if (!pw) return;
  server = createServer(async (rq, rs) => {
    let pfad = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (pfad.endsWith('/')) pfad += 'index.html';
    if (/spartricks\.(js|json)$/.test(pfad)) abrufe.push(pfad.split('/').pop());
    if (sparAus && pfad.endsWith('spartricks.json')) { rs.writeHead(503); rs.end(); return; }
    if (sparInhalt != null && pfad.endsWith('spartricks.json')) { rs.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' }); rs.end(sparInhalt); return; }
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
async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#spartricks', jetzt = JETZT, kontext = null, speicher = null } = {}) {
  const ctx = kontext || await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block',
  });
  const fremd = [];
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    const kopf = { 'access-control-allow-origin': '*' };
    if (!DATEI[rest]) return route.fulfill({ status: 404, headers: kopf, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', DATEI[rest])) });
  });
  await ctx.route(/^https:\/\/(api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)\//, route => {
    const u = new URL(route.request().url()), cors = { 'access-control-allow-origin': '*' };
    const json = b => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(b) });
    if (u.host === 'api.coingecko.com') return json({ bitcoin: { eur: 60000, eur_24h_change: 1 }, ethereum: { eur: 2000, eur_24h_change: -1 } });
    if (u.host === 'api.crypto.com') { const i = u.searchParams.get('instrument_name'); return json({ code: 0, result: { data: [{ i, a: i === 'BTC_EUR' ? '60000' : '2000', c: '0.01' }] } }); }
    return route.fulfill({ status: 404, headers: cors, body: '' });
  });
  // alles andere draußen (Quellen-Links) nie wirklich laden
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com|api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)/, route => { fremd.push(route.request().url()); return route.fulfill({ status: 204, body: '' }); });
  if (speicher) await ctx.addInitScript(s => { if (!sessionStorage.getItem('__gesetzt')) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem('__gesetzt', '1'); } }, speicher);
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  await page.clock.setFixedTime(new Date(jetzt));
  await page.goto(basis + pfad);
  await page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent), null, { timeout: 10000 });
  if (pfad.endsWith('#spartricks')) await sparDa(page);
  return { ctx, page, fehler, fremd };
}
const sparDa = page => page.waitForFunction(() => document.querySelector('#p-spartricks .sp-chips, #p-spartricks .sp-leer') && !/Lade Spartricks/.test(document.getElementById('p-spartricks').textContent), null, { timeout: 10000 });
const nbsp = s => s.replace(/[  ]/g, ' ');
const chip = (page, k) => page.locator(`.sp-chips [data-sp-chip="${k}"]`);
async function waehle(page, k) {
  await chip(page, k).click();
  await page.waitForFunction(k => document.getElementById('sp-liste')?.getAttribute('aria-labelledby') === 'sp-c-' + k, k);
}
const titel = page => page.locator('#sp-liste .sp-titel').allInnerTexts();
async function suche(page, q) {
  await page.locator('#sp-suche').fill(q);
  await page.waitForFunction(q => (q ? document.querySelector('.sp-trefferzahl, .sp-leer') : !document.querySelector('.sp-trefferzahl')) && document.getElementById('sp-suche').value === q, q);
  await page.waitForTimeout(160);
}
async function pruefeLayout(page, wo, { tippen = true } = {}) {
  const r = await page.evaluate(() => {
    const zuKlein = [], raus = [];
    for (const el of document.querySelectorAll('#p-spartricks button, #p-spartricks a[href], #p-spartricks input, #p-spartricks [role="tab"]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[hidden]') || el.classList.contains('sp-unsichtbar')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 30)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    for (const el of document.querySelectorAll('#p-spartricks .sp-karte, #p-spartricks .sp-suche, #p-spartricks .sp-geb')) {
      const b = el.getBoundingClientRect();
      if (b.left < -0.5 || b.right > innerWidth + 0.5) raus.push(`${el.className} ${Math.round(b.left)}–${Math.round(b.right)}`);
    }
    return { zuKlein, raus, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth };
  });
  const vw = page.viewportSize().width;
  if (tippen) assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  assert.deepEqual(r.raus, [], `${wo}: Karte ragt raus`);
  assert.ok(r.sw <= vw && r.bw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${vw})`);
}

test('Lazy: Startseite holt weder spartricks.js noch spartricks.json; erst der Reiter, danach „Tipp des Tages“ aus kleinem Auszug', { skip: ohnePw }, async () => {
  abrufe.length = 0;
  const { ctx, page, fehler, fremd } = await oeffne({ pfad: '/mein-vorteil/' });
  await page.waitForTimeout(3500); // früher kam die Datei nach ~2,6 s im Leerlauf
  assert.deepEqual(abrufe, [], 'beim Start nichts davon geholt – auch nicht im Leerlauf');
  assert.equal(await page.evaluate(() => !!document.getElementById('sp-stil') || 'MeinVorteilSpartricks' in window), false);
  const kachel = page.locator('#kacheln a[data-sprung="spartricks"]');
  assert.match(nbsp(await kachel.innerText()), /Spartricks[\s\S]*Geld zurück, Gratis, Geburtstag/);
  await kachel.screenshot({ path: join(FOTOS, 'kachel-spartricks-erst.png') });
  // Tippen auf die Kachel öffnet den Reiter, Skript und Daten erst jetzt
  await kachel.click();
  await sparDa(page);
  assert.equal(new URL(page.url()).hash, '#spartricks');
  assert.equal(await page.locator('main').isHidden(), true);
  assert.equal(await page.locator('.sprung a[data-reiter="spartricks"]').getAttribute('aria-current'), 'true');
  assert.equal(await page.locator('#ort-name').innerText(), 'Spartricks');
  assert.deepEqual(abrufe, ['spartricks.js', 'spartricks.json']);
  // Speicher: nur ein kleiner Auszug im localStorage (den sich die Seite mit dem Synquenzer teilt), die Datei im Cache Storage
  const sp = await page.evaluate(async () => ({
    auszug: (localStorage.getItem('mein-vorteil-spartricks-kachel') || '').length, alt: localStorage.getItem('mein-vorteil-daten-spartricks'),
    ablage: await caches.open('mv-spartricks').then(c => c.keys()).then(k => k.map(r => new URL(r.url).pathname)),
  }));
  assert.ok(sp.auszug > 500 && sp.auszug < 25000, `Auszug ${sp.auszug} Zeichen`);
  assert.equal(sp.alt, null);
  assert.deepEqual(sp.ablage, ['/mein-vorteil/spartricks.json']);
  // Wechsel hin und her: nichts doppelt
  for (const ab of ['deals', 'mehr']) {
    await page.locator(`.sprung a[data-ziel="${ab}"]`).click();
    await page.waitForFunction(() => document.getElementById('p-spartricks').hidden && !document.querySelector('main').hidden);
    await page.locator('.sprung a[data-reiter="spartricks"]').click();
    await page.waitForFunction(() => !document.getElementById('p-spartricks').hidden);
  }
  assert.equal(abrufe.filter(a => a === 'spartricks.js').length, 1);
  assert.equal(abrufe.filter(a => a === 'spartricks.json').length, 1, 'nur der Reiter, einmal');
  // zurück auf Start: jetzt „Tipp des Tages“ + nächste Frist (15.11.: Kfz-Versicherung 30.11.)
  await page.locator('.sprung a[data-ziel="start"]').click();
  await page.waitForFunction(() => /Tipp des Tages/.test(document.querySelector('#kacheln a[data-sprung="spartricks"]').textContent));
  assert.equal(await kachel.locator('li').count(), 2, 'zwei Zeilen');
  assert.match(nbsp(await kachel.innerText()), /Kfz-Versicherung: bis 30\. November kündigen und wechseln\s*Frist bis 30\.11\. · noch 15 Tage/);
  await kachel.screenshot({ path: join(FOTOS, 'kachel-spartricks.png') });
  // neu laden: Kachel bleibt (Auszug), Reiter zeigt sofort den letzten Stand
  await page.reload();
  await page.waitForFunction(() => /Tipp des Tages/.test(document.querySelector('#kacheln a[data-sprung="spartricks"]')?.textContent || ''));
  assert.equal(abrufe.filter(a => a === 'spartricks.json').length, 1, 'Start nach Neuladen holt nichts');
  assert.deepEqual(fremd, [], 'keine fremden Adressen geladen');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Neue Fassung oder kaputte Datei: sagt „Seite neu laden“ statt „nicht erreichbar“', { skip: ohnePw }, async () => {
  try {
    sparInhalt = JSON.stringify({ ...DATEN, version: 2 });
    let { ctx, page, fehler } = await oeffne();
    assert.match(nbsp(await page.locator('#p-spartricks').innerText()), /neue Fassung der Spartricks – bitte die Seite neu laden/);
    assert.equal(await page.locator('#p-spartricks [data-sp-neuladen]').innerText(), 'Seite neu laden');
    assert.doesNotMatch(await page.locator('#p-spartricks').innerText(), /nicht erreichbar/);
    await pruefeLayout(page, 'neue Fassung');
    assert.deepEqual(fehler, []);
    await ctx.close();
    sparInhalt = '{"version":1,"tipps":[{kaputt';
    ({ ctx, page, fehler } = await oeffne());
    assert.match(nbsp(await page.locator('#p-spartricks').innerText()), /Spartricks-Datei ist gerade fehlerhaft/);
    assert.deepEqual(fehler, []);
    await ctx.close();
  } finally { sparInhalt = null; }
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Chips, Top 10, Karten, Suche, Geburtstag, Layout (${lage} ${breite} × ${hoehe})`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler } = await oeffne({ breite, hoehe });
    assert.deepEqual((await page.locator('.sp-chips .sp-chip').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()),
      ['Top 10 10', ...CHIPS.slice(1).map((c, i) => `${CHIP_NAMEN[i + 1]} ${ANZAHL[c]}`)]);
    assert.equal(await chip(page, 'top').getAttribute('aria-selected'), 'true');
    assert.equal(nbsp(await page.locator('.sp-standzeile').innerText()), `Stand der Tipps: 15.11.2026 · ${DATEN.tipps.length} Tipps mit Quellen`);
    const t = await titel(page);
    assert.equal(t.length, 10);
    assert.match(t[0], /^1\s*Kfz-Versicherung: bis 30\. November kündigen und wechseln$/);
    const k1 = page.locator('#sp-liste .sp-karte').first();
    const k1t = nbsp(await k1.innerText());
    assert.match(k1t, /Frist: bis 30\.11\. · noch 15 Tage/);
    assert.match(k1t, /Bringt: .*50–200 €/);
    assert.match(k1t, /So geht’s: Die meisten Autoversicherungen/);
    assert.match(k1t, /Quellen[\s\S]*Verbraucherzentrale Niedersachsen[\s\S]*Stand 2026/);
    const links = await k1.locator('.sp-fuss a').evaluateAll(as => as.map(a => [a.href, a.target, a.rel]));
    assert.ok(links.length >= 2);
    for (const [href, target, rel] of links) { assert.match(href, /^https:\/\//); assert.equal(target, '_blank'); assert.equal(rel, 'noopener noreferrer'); }
    await pruefeLayout(page, `Top 10 ${lage}`);
    await page.screenshot({ path: join(FOTOS, `top10-${lage}.png`) });
    // Bereich „Geld zurück“: Reihenfolge der Daten, regionale Marke nur, wo es nicht bundesweit ist
    await waehle(page, 'geld');
    assert.equal((await titel(page)).length, ANZAHL.geld);
    assert.match(nbsp(await page.locator('#sp-reparaturbonus').innerText()), /Sachsen/);
    assert.equal(await page.locator('#sp-kfz-wechsel .sp-region').count(), 0);
    // Community-Erfahrung ist gekennzeichnet
    assert.equal(await page.locator('#sp-handy-rueckhol .sp-erfahrung').count(), 1);
    await pruefeLayout(page, `Geld zurück ${lage}`);
    // Suche: zählt je Chip, Liste im gewählten Chip, Umlaute egal
    await suche(page, 'doebeln');
    assert.equal(await chip(page, 'gratis').locator('.sp-n').innerText(), '2');
    assert.match(nbsp(await page.locator('#sp-liste').innerText()), /Keine Treffer für „doebeln“ unter „Geld zurück“\. Dafür hier:/);
    await page.locator('.sp-woanders [data-sp-chip="gratis"]').click();
    await page.waitForFunction(() => document.getElementById('sp-liste').getAttribute('aria-labelledby') === 'sp-c-gratis');
    assert.deepEqual((await titel(page)).length, 2);
    assert.match((await titel(page)).join(' | '), /Bibliotheksausweis/);
    assert.equal(await page.locator('#sp-suche').inputValue(), 'doebeln', 'Suchfeld bleibt');
    await suche(page, 'bahn');
    await waehle(page, 'freizeit');
    assert.ok((await titel(page)).length >= 3);
    assert.match(nbsp(await page.locator('.sp-trefferzahl').innerText()), /Treffer für „bahn“/);
    if (lage === 'hoch') await page.screenshot({ path: join(FOTOS, 'suche-bahn.png') });
    await suche(page, 'xyzqq');
    assert.match(await page.locator('#sp-liste').innerText(), /Keine Treffer für „xyzqq“/);
    assert.equal(await page.locator('.sp-woanders').count(), 0);
    await suche(page, '');
    assert.equal((await titel(page)).length, ANZAHL.freizeit);
    // Geburtstag gratis: Region an jeder Karte, „vorher anmelden“
    await waehle(page, 'geburtstag');
    const gk = page.locator('#sp-liste .sp-karte');
    assert.equal(await gk.count(), ANZAHL.geburtstag);
    for (const k of await gk.all()) {
      assert.ok(await k.locator('.sp-region').count() >= 1, 'Region-Markierung');
      assert.match(nbsp(await k.locator('.sp-anmelden').innerText()), /^(Rechtzeitig anmelden: Faustregel \d+ Wochen vor dem Geburtstag – |Ohne Anmeldung – |Vorher: )/);
    }
    assert.equal(await page.locator('#sp-liste .sp-karte .sp-anleitung').count(), 2, 'Anleitungen gekennzeichnet');
    assert.match(nbsp(await page.locator('#sp-saurierpark').innerText()), /Sachsen[\s\S]*Bautzen-Kleinwelka, ca\. 60 km von Dresden[\s\S]*Ohne Anmeldung – am Geburtstag mit Ausweis/);
    assert.equal(await page.locator('#sp-zoo-leipzig').count(), 0, 'kein Nicht-Angebot unter Geburtstag');
    assert.match(nbsp(await page.locator('#sp-dm-geburtstag').innerText()), /bundesweit/);
    await page.locator('#sp-geb-tag').fill('2027-03-04');
    await page.waitForFunction(() => /bis 04\.02\./.test(document.getElementById('sp-dm-geburtstag')?.textContent || ''));
    assert.match(nbsp(await page.locator('#sp-dm-geburtstag .sp-anmelden').innerText()), /^Am besten anmelden bis 04\.02\. \(Faustregel 4 Wochen vorher\) – dm-Konto/);
    assert.match(nbsp(await page.locator('#sp-supermarkt-geburtstag .sp-anmelden').innerText()), /^Am besten anmelden bis 18\.02\. \(Faustregel 2 Wochen vorher\)/);
    // gleich lautende Quellen-Knöpfe gibt es nicht mehr (z. B. drei mydealz-Links an „Gratis-Geburtstag planen“)
    const knoepfe = await page.locator('#sp-geb-planen .sp-fuss a').allInnerTexts();
    assert.equal(new Set(knoepfe).size, knoepfe.length, knoepfe.join(' · '));
    if (lage === 'hoch') await page.locator('#sp-geb-planen').screenshot({ path: join(FOTOS, 'karte-geb-planen-hoch.png') });
    assert.match(nbsp(await page.locator('.sp-geb-info').innerText()), /in 109 Tagen/);
    await pruefeLayout(page, `Geburtstag ${lage}`);
    await page.screenshot({ path: join(FOTOS, `geburtstag-${lage}.png`) });
    // Gewinnspiele + Freizeit: Layout
    for (const c of ['gewinnspiele', 'freizeit', 'einkaufen']) { await waehle(page, c); await pruefeLayout(page, `${c} ${lage}`); }
    // befristete Aktion: Datum an der Karte (dm 10fach bis 28.02.2027)
    assert.match(nbsp(await page.locator('#sp-drogerie .sp-marken').innerText()), /Aktion bis 28\.02\.2027/);
    if (lage === 'hoch') await page.locator('#sp-drogerie').screenshot({ path: join(FOTOS, 'karte-drogerie-hoch.png') });
    if (lage === 'quer') await page.screenshot({ path: join(FOTOS, 'einkaufen-quer.png') });
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

test('Stern: merken, Chip „Gemerkt“, bleibt nach Neuladen (nur localStorage), wieder weg', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  assert.equal(await chip(page, 'gemerkt').count(), 0, 'ohne Gemerktes kein Chip');
  const s = page.locator('#sp-steuer-2022 .sp-stern');
  assert.equal(await s.getAttribute('aria-pressed'), 'false');
  await s.click();
  assert.equal(await s.getAttribute('aria-pressed'), 'true');
  assert.equal(await s.getAttribute('aria-label'), 'Gemerkt – nicht mehr merken');
  assert.match((await chip(page, 'gemerkt').innerText()).replace(/\s+/g, ' '), /Gemerkt 1/);
  await waehle(page, 'geld');
  await page.locator('#sp-pfand .sp-stern').click();
  assert.match((await chip(page, 'gemerkt').innerText()).replace(/\s+/g, ' '), /Gemerkt 2/);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('mein-vorteil-spartricks-gemerkt'))), ['steuer-2022', 'pfand']);
  await page.reload();
  await sparDa(page);
  assert.equal(await page.locator('#sp-pfand .sp-stern').getAttribute('aria-pressed'), 'true', 'gewählter Chip und Stern gemerkt');
  await waehle(page, 'gemerkt');
  assert.deepEqual((await titel(page)).length, 2);
  await page.screenshot({ path: join(FOTOS, 'gemerkt.png') });
  await page.locator('#sp-steuer-2022 .sp-stern').click();
  await page.waitForFunction(() => document.querySelectorAll('#sp-liste .sp-karte').length === 1);
  await page.locator('#sp-pfand .sp-stern').click();
  await page.waitForFunction(() => !document.querySelector('.sp-chips [data-sp-chip="gemerkt"]'));
  assert.equal(await chip(page, 'top').getAttribute('aria-selected'), 'true', 'zurück auf Top 10');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Frist vorbei (01.12.): Kfz nicht mehr in Top 10 und Kachel, im Bereich am Ende mit Hinweis; offline: letzter Stand', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ jetzt: '2026-12-01T10:00:00Z' });
  const t = await titel(page);
  assert.equal(t.length, 10);
  assert.ok(!t.some(x => /Kfz/.test(x)));
  assert.match(t.at(-1), /Bahn verspätet/);
  await waehle(page, 'geld');
  const letzte = page.locator('#sp-liste .sp-karte').last();
  assert.match(nbsp(await letzte.innerText()), /Kfz-Versicherung[\s\S]*Frist für dieses Jahr vorbei/);
  // Start-Kachel: Frist-Zeile jetzt Steuer/Flug (31.12.)
  await page.locator('.sprung a[data-ziel="start"]').click();
  const k = nbsp(await page.locator('#kacheln a[data-sprung="spartricks"]').innerText());
  assert.match(k, /Tipp des Tages/);
  assert.doesNotMatch(k, /Kfz/);
  assert.match(k, /Frist bis 31\.12\. · noch 30 Tage/);
  // offline: spartricks.json gestört -> letzter Stand bleibt, mit Hinweis
  sparAus = true;
  try {
    await page.reload();
    await page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent));
    await page.locator('.sprung a[data-reiter="spartricks"]').click();
    await page.waitForFunction(() => /gerade offline/.test(document.querySelector('#p-spartricks .sp-standzeile')?.textContent || ''), null, { timeout: 8000 });
    assert.equal((await titel(page)).length, ANZAHL.geld, 'gemerkter Chip Geld zurück aus dem Speicher (Cache Storage)');
  } finally { sparAus = false; }
  assert.deepEqual(fehler.filter(f => !/503/.test(f)), []);
  await ctx.close();
});

test('Kachel: „Tipp des Tages“ wechselt nach Datum, nie leer, Start-Seite ohne seitliches Scrollen (15 Kacheln mit Essen, Woche, Nebenverdienst und Ausflüge)', { skip: ohnePw }, async () => {
  const speicher = { 'mein-vorteil-daten-spartricks': JSON.stringify({ d: DATEN, holZeit: Date.parse(JETZT) }) };
  const tipp = async jetzt => {
    const { ctx, page, fehler } = await oeffne({ pfad: '/mein-vorteil/', jetzt, speicher });
    const k = page.locator('#kacheln a[data-sprung="spartricks"]');
    const z = await k.locator('li b').allInnerTexts();
    const vw = page.viewportSize().width;
    const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, n: document.querySelectorAll('#kacheln a.kachel').length, letzteRechts: document.querySelector('#kacheln a.kachel:last-child').getBoundingClientRect().right, gitterRechts: document.querySelector('#kacheln').getBoundingClientRect().right, letzte: document.querySelector('#kacheln a.kachel:last-child').getBoundingClientRect().width, erste: document.querySelector('#kacheln a.kachel').getBoundingClientRect().width }));
    assert.ok(r.sw <= vw, 'kein seitliches Scrollen');
    assert.equal(r.n, 15);
    // 15 Kacheln (seit „Nebenverdienst“ und „Ausflüge“, 16.11.2026): hochkant 2 Spalten -> „Mehr“ füllt die letzte Reihe allein
    // (keine halbe Lücke), quer 3 Spalten = 5 volle Reihen
    assert.ok(r.letzte > r.erste * 1.5, '15 Kacheln: „Mehr“ füllt die letzte Reihe');
    assert.ok(Math.abs(r.letzteRechts - r.gitterRechts) < 2, '15 Kacheln: „Mehr“ schließt die letzte Reihe rechts ab');
    assert.deepEqual(fehler, []);
    await ctx.close();
    return z;
  };
  const a = await tipp('2026-11-16T10:00:00Z'), b = await tipp('2026-11-17T10:00:00Z'), a2 = await tipp('2026-11-16T20:00:00Z');
  assert.equal(a.length, 2);
  assert.notEqual(a[0], b[0], 'neuer Tag, neuer Tipp');
  assert.deepEqual(a, a2, 'gleicher Tag, gleicher Tipp');
});
