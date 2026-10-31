import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { leseRss } from '../rss.mjs';
import { marktguruAngebot, marktguruKeys, packungAusFeldern } from '../sources/marktguru.mjs';
import { keepa, keepaAngebot } from '../sources/keepa.mjs';
import { mydealz, mydealzAngebot, istLaden } from '../sources/mydealz.mjs';
import { macheFixtureAbruf } from '../http.mjs';
import { nachricht, dedupeKey } from '../notify.mjs';
import { scan, main } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const ECHT = join(FIX, 'echt-2026-10-31', 'quellen');
const BASIS = join(HIER, '..', '..');
const cfg = JSON.parse(await readFile(join(BASIS, 'config.json'), 'utf8'));
const watchlist = JSON.parse(await readFile(join(BASIS, 'watchlist.json'), 'utf8'));
const holeText = macheFixtureAbruf(FIX);
const JETZT = new Date('2026-10-31T12:00:00Z');

test('watchlist.json und config.json sind gültig', () => {
  const ids = new Set();
  for (const p of watchlist.produkte) {
    assert.ok(p.id && p.name && p.muss?.length && p.suche?.length, p.id);
    assert.ok(['stueck', '100g', '100ml'].includes(p.basis), p.id);
    assert.ok(!ids.has(p.id), `doppelte id ${p.id}`);
    ids.add(p.id);
  }
  assert.ok(cfg.ntfy.topic.length >= 30, 'langes, zufälliges ntfy-Thema');
});

test('RSS lesen (mydealz)', async () => {
  const items = leseRss(await readFile(join(FIX, 'mydealz-hot.xml'), 'utf8'));
  assert.equal(items.length, 4);
  assert.equal(items[0].shop, 'Amazon');
  assert.equal(items[0].preisText, '6,49€');
  assert.equal(items[1].titel, 'Samsung 55" QLED TV GQ55Q60 für 29,99 € statt 499 €', 'ohne „1215° - “ aus dem Heiß-Feed');
  assert.equal(items[1].temperatur, 1215);
  assert.throws(() => leseRss('<html>Access denied</html>'));
});

test('mydealz echt: Heiß-Feed-Temperatur, Datum als ISO, Laden-Deals ohne Versand', async () => {
  const hot = leseRss(await readFile(join(ECHT, '004-www-mydealz-de-rss-hot.xml'), 'utf8'));
  assert.ok(hot.every(it => !/^\d+°/.test(it.titel)), 'kein „113° - “ mehr im Titel');
  assert.ok(hot.every(it => Number.isFinite(it.temperatur)));
  const butter = mydealzAngebot(hot.find(it => it.titel.includes('Meersalzbutter')), {});
  assert.equal(butter.online, false, '[edeka] = im Laden');
  assert.equal(butter.versand, 0);
  assert.match(butter.datum, /^2026-10-31T\d\d:\d\d:\d\d\.000Z$/);
  assert.equal(istLaden('PENNY'), true);
  assert.equal(istLaden('Amazon'), false);
  assert.equal(istLaden('', '[Penny] Ben Jerrys 3,49 / …'), true);
});

test('marktguru echt: Packung aus volume (kg/l), geprüft mit Preis ÷ Grundpreis; keine angehängten Zahlen', async () => {
  const json = JSON.parse(await readFile(join(ECHT, '011-api-marktguru-de-api-v1-offers-search-as-web-limit-48-offset-0-q-knoppers-zipcode-04720.json'), 'utf8'));
  const kauf = marktguruAngebot(json.results.find(r => r.id === 25495632));
  assert.equal(kauf.beschreibung, 'mit knuspriger Waffel je 15 St. = 375-g-Packg.', 'früher hing „0.375 1 kg“ dran');
  assert.deepEqual(kauf.packMenge, { gramm: 375 });
  assert.equal(kauf.gueltigBis, '2026-10-31T18:00:00Z');
  const bj = JSON.parse(await readFile(join(ECHT, '019-api-marktguru-de-api-v1-offers-search-as-web-limit-48-offset-0-q-ben-20-26-20jerry-s-zipco.json'), 'utf8'));
  assert.deepEqual(marktguruAngebot(bj.results[0]).packMenge, { ml: 465 });
  // Widerspruch volume vs. Preis ÷ Grundpreis -> keine Packung aus den Feldern
  assert.equal(packungAusFeldern({ unit: { shortName: 'kg' }, volume: 1, price: 2.79, referencePrice: 7.44 }), null);
  const wider = marktguruAngebot({ unit: { shortName: 'kg' }, volume: 1, price: 2.79, referencePrice: 7.44, description: 'je 15 St.' });
  assert.equal(wider.packWiderspruch, true);
  assert.equal(kauf.packWiderspruch, false);
  assert.deepEqual(packungAusFeldern({ unit: { shortName: 'kg' }, volume: null, price: 1.11, referencePrice: 7.4 }), { gramm: 150 });
  assert.equal(packungAusFeldern({ unit: { shortName: 'St.' }, volume: 4, price: 1, referencePrice: 0.25 }), null);
});

test('marktguru: Schlüssel und Angebote', async () => {
  assert.deepEqual(await marktguruKeys(holeText, cfg), { apiKey: 'TEST-API-KEY', clientKey: 'TEST-CLIENT-KEY' });
  const json = JSON.parse(await readFile(join(FIX, 'marktguru-crunchips.json'), 'utf8'));
  const a = marktguruAngebot(json.results[0]);
  assert.equal(a.shop, 'PENNY');
  assert.equal(a.preis, 1.11);
  assert.deepEqual(a.refPreis, { preis: 7.4, einheit: 'kg' });
  assert.equal(a.link, 'https://www.marktguru.de/offers/2001');
  assert.equal(a.gueltigBis, '2026-11-01T22:59:00Z');
});

test('Die tote mydealz-Suche (HTTP 404) wird nicht mehr abgefragt', () => {
  assert.equal(cfg.quellen.mydealz.suchFeed, undefined);
});

test('mydealz: kaputter Feed stoppt die anderen nicht', async () => {
  const r = await mydealz({ holeText, cfg, watchlist });
  assert.ok(r.angebote.length >= 5);
  assert.equal(r.fehler.length, 1);
  assert.ok(r.angebote.find(a => a.titel.startsWith('PlayStation')).preisfehlerFeed);
});

test('Keepa: ohne Schlüssel übersprungen, mit Schlüssel gelesen', async () => {
  assert.match((await keepa({ holeText, cfg, watchlist, env: {} })).hinweis, /KEEPA_KEY/);
  const wl = { produkte: [{ ...watchlist.produkte.find(p => p.id === 'knoppers-schnitte'), asins: ['B000TESTKN'] }] };
  const r = await keepa({ holeText, cfg, watchlist: wl, env: { KEEPA_KEY: 'x' } });
  assert.equal(r.angebote[0].preis, 6.99);
  assert.equal(r.angebote[0].versand, 0);
  assert.equal(r.angebote[0].preisAlt, 9.99);
  assert.equal(keepaAngebot({ asin: 'X', stats: { current: [-1, -1] } }), null);
});

test('Gesamtlauf mit Fixtures: Deals, Technik, Fehlerliste, Dedupe', async () => {
  const abrufe = [];
  const fehlerHole = async url => { abrufe.push(url); if (url.includes('keepa')) throw new Error('kaputt'); return holeText(url); };
  const wl = { ...watchlist, produkte: watchlist.produkte.map(x => x.id === 'knoppers-schnitte' ? { ...x, asins: ['B000TESTKN'] } : x) };
  const r = await scan({ cfg, watchlist: wl, holeText: fehlerHole, env: { KEEPA_KEY: 'x' }, jetzt: JETZT,
    sent: {}, history: null });
  const p = id => r.current.produkte.find(x => x.id === id);
  assert.equal(p('crunchips').deal, true);
  assert.equal(p('crunchips').bestes.einheitspreis, 0.74);
  assert.equal(p('crunchips').grund, '54 % unter geschätztem Normalpreis');
  assert.equal(p('crunchips-xcut').bestes.shop, 'REWE');
  const k = p('knoppers-schnitte');
  assert.equal(k.bestes.shop, 'Kaufland', 'Aldi Süd liegt nicht in der Liste der Märkte');
  assert.equal(k.bestes.packung, '5 × 25 g');
  assert.deepEqual(k.weitere.map(w => w.shop), ['Netto Marken-Discount', 'Amazon'], '24er und 5er in einer Karte, pro Stück verglichen');
  assert.equal(k.tiefst.text, 'Günstigstes von 3 gefundenen Angeboten in deiner Nähe und online · Verlauf erst seit 1 Tag');
  assert.equal(p('knoppers-nussriegel').bestes.einheitspreis, 0.358);
  assert.equal(p('softys-rote-fruechte').deal, true);
  assert.equal(p('softys-fruchtmix').bestes, null, 'rote Tüte ist nicht die gelbe');
  assert.equal(r.current.produkte[0].deal, true, 'Deals stehen oben');
  // Technik: PS5 + Samsung laufen (Deal-Seite), AirPods laut Seite abgelaufen, Xbox älter als 24 h (Seite nicht geladen)
  assert.deepEqual(r.current.technik.map(t => t.titel.split(' ')[0]), ['PlayStation', 'Samsung']);
  const ps5 = r.current.technik[0];
  assert.deepEqual([ps5.preis, ps5.preisVorher, ps5.vorherQuelle, ps5.ersparnisEuro, ps5.ersparnisProzent],
    [44, 449, 'Vergleichspreis laut mydealz', 405, 90]);
  assert.equal(ps5.datum, '2026-10-30T20:00:00.000Z');
  assert.equal(ps5.bis, '2026-10-31T20:00:00.000Z', 'ohne Ende auf der Deal-Seite: gemeldet + 24 h (wie der Vorteils-Radar)');
  assert.equal(ps5.bisGeschaetzt, true);
  assert.equal(ps5.preisfehler, true, 'aus der Preisfehler-Gruppe');
  assert.equal(r.current.technik[1].preisfehler, false, 'Samsung: nur ≥ 60 % unter Vergleichspreis, kein gemeldeter Preisfehler');
  assert.equal(r.current.technik[1].vorherQuelle, 'statt-Preis laut Deal-Text');
  assert.ok(abrufe.includes('https://www.mydealz.de/deals/airpods-2500006'));
  assert.ok(!abrufe.some(u => u.includes('xbox')), 'zu alt -> nicht einmal geprüft');
  assert.equal(r.dealseiten.seiten['https://www.mydealz.de/deals/airpods-2500006'].abgelaufen, true);
  assert.ok(r.current.fehler.some(f => f.startsWith('keepa')));
  assert.ok(r.current.fehler.some(f => f.includes('Lebensmittel')));
  assert.equal(r.msgs.length, 6);
  assert.equal(r.msgs.find(m => m.title.includes('PlayStation')).message.split('\n')[0], 'vorher 449,00 € → jetzt 44,00 € (−90 %)');
  // second run: everything already sent -> no new messages; deal pages remembered (only running ones re-checked later)
  const sent = Object.fromEntries(r.zuSenden.map(k => [dedupeKey(k), 'x']));
  const abrufe2 = [];
  const r2 = await scan({ cfg, watchlist, holeText: async u => { abrufe2.push(u); return holeText(u); }, jetzt: JETZT, sent, history: r.history, dealseiten: r.dealseiten });
  assert.equal(r2.msgs.length, 0);
  assert.ok(!abrufe2.some(u => u.includes('/deals/')), 'gerade geprüft -> nicht sofort wieder');
});

test('Technik: „vielleicht abgelaufen“ laut Deal-Seite und älter als 24 h = nicht zeigen (wie der Vorteils-Radar)', async () => {
  const samsung = 'https://www.mydealz.de/deals/samsung-qled-2500002';
  const vielleicht = async (url, o) => {
    const t = await holeText(url, o);
    return url === samsung ? t.replace('"isMaybeExpired":false', '"isMaybeExpired":true') : t;
  };
  const r = await scan({ cfg, watchlist, holeText: vielleicht, jetzt: JETZT, sent: {}, history: null });
  assert.deepEqual(r.current.technik.map(t => t.titel.split(' ')[0]), ['PlayStation']);
  assert.equal(r.dealseiten.seiten[samsung].vielleichtAbgelaufen, true);
  // 25 Stunden nach dem Melden ist auch die PS5 weg (ohne dass ihre Seite noch einmal geladen wird)
  const abrufe = [];
  const spaet = await scan({ cfg, watchlist, holeText: async (u, o) => { abrufe.push(u); return holeText(u, o); },
    jetzt: new Date('2026-10-31T21:00:00Z'), sent: {}, history: null });
  assert.deepEqual(spaet.current.technik, [], 'PS5 + Samsung älter als 24 h, AirPods laut Seite abgelaufen');
  assert.ok(!abrufe.some(u => u.includes('ps5-2500005') || u.includes('samsung-qled-2500002')), 'zu alt -> Seite nicht geladen');
});

test('ntfy-Nachricht enthält Preis, Grundpreis, Ersparnis und direkten Link', () => {
  const m = nachricht({ typ: 'produkt', id: 'knoppers-schnitte', name: 'Knoppers Schnitte', basis: 'stueck', titel: 'Knoppers 24er', shop: 'Netto',
    packung: '24 × 25 g', preis: 5.99, versand: 0, online: false, einheitspreis: 0.25, normalpreis: 0.38, normalGeschaetzt: false, tiefstpreis: 0.25,
    ersparnis: 0.34, grund: '34 % unter Normalpreis', tiefstText: 'Günstigstes von 2 gefundenen Angeboten in deiner Nähe · so günstig wie nie in 30 Tagen',
    gueltigBis: '2026-11-01T22:59:00Z', link: 'https://example.org/a' }, cfg);
  assert.equal(m.topic, cfg.ntfy.topic);
  assert.equal(m.click, 'https://example.org/a');
  assert.match(m.message, /^5,99 € bei Netto · 24 × 25 g\n/);
  assert.match(m.message, /0,25 € pro Stück – normal 0,38 €\n/);
  assert.match(m.message, /34 % unter Normalpreis/);
  assert.match(m.message, /so günstig wie nie in 30 Tagen/);
  assert.match(m.message, /gültig bis So 1\.11\./);
  assert.equal(m.actions[0].url, 'https://example.org/a');
});

test('CLI dry-run schreibt current.json, history.json, sent.json, dealseiten.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-'));
  try {
    const log = console.log; console.log = () => {};
    try { await main(['--fixtures', '--data', dir, '--jetzt', JETZT.toISOString()], {}); } finally { console.log = log; }
    const c = JSON.parse(await readFile(join(dir, 'current.json'), 'utf8'));
    assert.equal(c.plz, '04720');
    assert.ok(c.produkte.length === watchlist.produkte.length);
    const s = JSON.parse(await readFile(join(dir, 'sent.json'), 'utf8'));
    assert.equal(Object.keys(s).length, 6);
    const d = JSON.parse(await readFile(join(dir, 'dealseiten.json'), 'utf8'));
    assert.equal(Object.keys(d.seiten).length, 3, 'geprüfte Deal-Seiten gemerkt');
    assert.equal(JSON.parse(await readFile(join(dir, 'history.json'), 'utf8')).version, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
