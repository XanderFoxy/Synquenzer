import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { leseRss } from '../rss.mjs';
import { marktguruAngebot, marktguruKeys } from '../sources/marktguru.mjs';
import { keepa, keepaAngebot } from '../sources/keepa.mjs';
import { mydealz } from '../sources/mydealz.mjs';
import { macheFixtureAbruf } from '../http.mjs';
import { nachricht, dedupeKey } from '../notify.mjs';
import { scan, main } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
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
  assert.equal(items[1].titel, 'Samsung 55" QLED TV GQ55Q60 für 29,99 € statt 499 €');
  assert.throws(() => leseRss('<html>Access denied</html>'));
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

test('mydealz: kaputter Feed stoppt die anderen nicht', async () => {
  const r = await mydealz({ holeText, cfg, watchlist });
  assert.ok(r.angebote.length >= 5);
  assert.equal(r.fehler.length, 1);
  assert.ok(r.angebote.find(a => a.titel.startsWith('PlayStation')).preisfehlerFeed);
});

test('Keepa: ohne Schlüssel übersprungen, mit Schlüssel gelesen', async () => {
  assert.match((await keepa({ holeText, cfg, watchlist, env: {} })).hinweis, /KEEPA_KEY/);
  const wl = { produkte: [{ ...watchlist.produkte.find(p => p.id === 'knoppers-24'), asins: ['B000TESTKN'] }] };
  const r = await keepa({ holeText, cfg, watchlist: wl, env: { KEEPA_KEY: 'x' } });
  assert.equal(r.angebote[0].preis, 6.99);
  assert.equal(r.angebote[0].versand, 0);
  assert.equal(r.angebote[0].preisAlt, 9.99);
  assert.equal(keepaAngebot({ asin: 'X', stats: { current: [-1, -1] } }), null);
});

test('Gesamtlauf mit Fixtures: Deals, Technik, Fehlerliste, Dedupe', async () => {
  const fehlerHole = async url => { if (url.includes('keepa')) throw new Error('kaputt'); return holeText(url); };
  const wl = { ...watchlist, produkte: watchlist.produkte.map(x => x.id === 'knoppers-24' ? { ...x, asins: ['B000TESTKN'] } : x) };
  const r = await scan({ cfg, watchlist: wl, holeText: fehlerHole, env: { KEEPA_KEY: 'x' }, jetzt: JETZT,
    sent: {}, history: null });
  const p = id => r.current.produkte.find(x => x.id === id);
  assert.equal(p('crunchips').deal, true);
  assert.equal(p('crunchips').bestes.einheitspreis, 0.74);
  assert.equal(p('crunchips-xcut').bestes.shop, 'REWE');
  assert.equal(p('knoppers-24').bestes.shop, 'Netto Marken-Discount');
  assert.equal(p('knoppers-5').bestes.shop, 'Kaufland', 'Aldi Süd liegt nicht in der Liste der Märkte');
  assert.equal(p('knoppers-nussriegel').bestes.einheitspreis, 0.358);
  assert.equal(p('softys-rote-fruechte').deal, true);
  assert.equal(p('softys-fruchtmix').bestes, null, 'rote Tüte ist nicht die gelbe');
  assert.equal(r.current.produkte[0].deal, true, 'Deals stehen oben');
  assert.equal(r.current.technik.length, 2);
  assert.ok(r.current.fehler.some(f => f.startsWith('keepa')));
  assert.ok(r.current.fehler.some(f => f.includes('Lebensmittel')));
  assert.equal(r.msgs.length, 6);
  // second run: everything already sent -> no new messages
  const sent = Object.fromEntries(r.zuSenden.map(k => [dedupeKey(k), 'x']));
  const r2 = await scan({ cfg, watchlist, holeText, jetzt: JETZT, sent, history: r.history });
  assert.equal(r2.msgs.length, 0);
});

test('ntfy-Nachricht enthält Preis, Grundpreis, Ersparnis und direkten Link', () => {
  const m = nachricht({ typ: 'produkt', id: 'knoppers-24', name: 'Knoppers 24er-Pack', basis: 'stueck', titel: 'Knoppers 24er', shop: 'Netto',
    preis: 5.99, versand: 0, online: false, einheitspreis: 0.25, normalpreis: 0.38, tiefstpreis: 0.25, ersparnis: 0.34,
    grund: '34 % unter Normalpreis', gueltigBis: '2026-11-01T22:59:00Z', link: 'https://example.org/a' }, cfg);
  assert.equal(m.topic, cfg.ntfy.topic);
  assert.equal(m.click, 'https://example.org/a');
  assert.match(m.message, /5,99\s€ bei Netto/);
  assert.match(m.message, /0,25\s€ pro Stück – normal 0,38\s€/);
  assert.match(m.message, /34 % unter Normalpreis/);
  assert.equal(m.actions[0].url, 'https://example.org/a');
});

test('CLI dry-run schreibt current.json, history.json, sent.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-'));
  try {
    const log = console.log; console.log = () => {};
    try { await main(['--fixtures', '--data', dir, '--jetzt', JETZT.toISOString()], {}); } finally { console.log = log; }
    const c = JSON.parse(await readFile(join(dir, 'current.json'), 'utf8'));
    assert.equal(c.plz, '04720');
    assert.ok(c.produkte.length === watchlist.produkte.length);
    const s = JSON.parse(await readFile(join(dir, 'sent.json'), 'utf8'));
    assert.equal(Object.keys(s).length, 6);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
