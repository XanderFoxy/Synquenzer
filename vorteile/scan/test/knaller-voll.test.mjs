// Wochen-Knaller vollständig (Xander 16.11.2026: „Bist du sicher, dass alle Angebote drin sind? Bei Aldi Nord die Crunchips mit
// 50 % finde ich nicht.“). Fixtures = echte, gekürzte Antworten aus dem Roh-Lauf 43818792502 (16.11.2026, 06:44 UTC):
//   knaller/aldi-doebeln-1611.html      /Doebeln/ALDI-Nord/p-r43 – 4 der 16 Angebote, totalItems 359, Prospekte unverändert
//   knaller/lidl-doebeln-1611.html      /Doebeln/Lidl/p-r74 – 2 Angebote, totalItems 1000, 5 Prospekte (2 ab 23.11.)
//   knaller/stichwort-crunchips-1611.html /Angebote/Crunchips (bundesweit) – Aldi Nord 0,99 statt 1,99 UVP, Prospekt 6c21c979
//   knaller/stichwort-cola-1611.html    /Doebeln/Angebote/Cola – 16 von 25
//   knaller/marktguru-chips-1611.json   marktguru q=chips, PLZ 04720 – 6 von 12 Treffern (Lidl/Kaufland/Netto)
// Ausgedachte Angebote sind als solche gekennzeichnet (angebotRoh/synthetisch).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import knaller, { startHinweis, tagAb, berlinMitternacht, marktguruGueltig, passtMarktguru, produktKey } from '../module/knaller.mjs';
import { leseKaufdaSeite, prospekteAus } from '../lib/kaufda.mjs';
import { leseMerkNachrichten, merkEintrag, holeMerkliste, faelligeErinnerungen, erinnerungNachricht, verbucheErinnerung, erinnerungFaellig } from '../lib/merken.mjs';
import { plane } from '../benachrichtigen.mjs';
import { faelligkeit } from '../faellig.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures', 'knaller');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const MAERKTE = cfg.module.knaller.maerkte;
const JETZT = new Date('2026-11-16T08:30:00Z'); // Mo 09:30 Berlin
const lies = f => readFile(join(FX, f), 'utf8');
const ALDI_PROSPEKT = '6c21c979-269e-4bc0-b537-5bbb1a51b90e';
const LIDL_PROSPEKT = 'edef33c8-4657-4847-a8a4-313b9b88d68f';

const nur = (ids, extra = {}) => ({ ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => ids.includes(m.id)), marktguru: null, ...extra } } });
function abruf(karte) {
  const log = [];
  const fn = async url => {
    log.push(url);
    const t = Object.entries(karte).find(([k]) => url.endsWith(k) || url.includes(k));
    if (!t) throw new Error(`HTTP 404 bei ${new URL(url).host}`);
    if (typeof t[1] === 'number') throw new Error(`HTTP ${t[1]} bei ${new URL(url).host}`);
    return typeof t[1] === 'function' ? t[1](url) : t[1].startsWith('<') || t[1].startsWith('{') ? t[1] : lies(t[1]);
  };
  fn.log = log;
  return fn;
}
// synthetisch (Felder wie echt): Stichwortseite mit Angeboten aus einem bestimmten Prospekt
const stichwortSeite = items => `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { pageInformation: { location: { cityDisplayName: 'Berlin' }, offers: { main: { items, totalItems: items.length } } } } } })}</script>`;
const angebotRoh = (id, publisherName, prospekt, title, preise, extra = {}) => ({
  type: 'OFFER', id, publisherName, brand: extra.brand || '', title, description: extra.description || '',
  validFrom: '2026-11-15T23:00:00.000+0000', validUntil: '2026-11-21T22:00:00.000+0000', parentContent: { id: prospekt, type: 'static_brochure' },
  offerImages: { url: { normal: `https://content-media.bonial.biz/${id}/${id}.jpg?impolicy=SEO-offer-normal` } },
  prices: { mainPrice: preise[0], secondaryPrice: preise[1] ?? 0, secondaryPriceIsUVP: preise[2] ?? false, priceRange: false, conditions: [{}] },
  ...extra,
});

test('Befund echt: Döbelner Aldi-Seite zeigt 4 (im Original 16) von 359 Angeboten, Prospekte mit Gültigkeit', async () => {
  const s = leseKaufdaSeite(await lies('aldi-doebeln-1611.html'));
  assert.equal(s.ort, 'Döbeln');
  assert.equal(s.gesamt, 359);
  assert.equal(s.items.length, 4);
  assert.ok(!s.items.some(o => /crunchips/i.test(o.title)), 'Crunchips steht nicht auf der Händlerseite');
  assert.deepEqual(s.prospekte.map(p => [p.id.slice(0, 8), p.titel, p.ab, p.bis, p.seiten]), [
    ['6c21c979', 'Aktuelle Angebote', '2026-11-15T23:00:00.000Z', '2026-11-21T21:00:00.000Z', 56],
    ['53035373', 'Aktuelle Angebote', '2026-11-14T23:00:00.000Z', '2026-11-21T21:00:00.000Z', 3],
  ]);
  const l = leseKaufdaSeite(await lies('lidl-doebeln-1611.html'));
  assert.equal(l.gesamt, 1000);
  assert.equal(l.prospekte.filter(p => p.bald).length, 2, 'Lidl: zwei Prospekte ab 23.11. (valid_soon)');
  // bundesweite Stichwortseite: dieselbe Prospekt-id wie in Döbeln
  const c = leseKaufdaSeite(await lies('stichwort-crunchips-1611.html'));
  const aldi = c.items.find(o => o.publisherName === 'ALDI Nord');
  assert.equal(aldi.parentContent.id, ALDI_PROSPEKT);
  assert.deepEqual([aldi.prices.mainPrice, aldi.prices.secondaryPrice, aldi.prices.secondaryPriceIsUVP, aldi.parentContent.page.number], [0.99, 1.99, true, 20]);
  assert.deepEqual(prospekteAus({}), []);
});

test('Crunchips: über die Stichwortseite + gleiche Prospekt-id als Döbelner Angebot (−50 % UVP), EDEKA/E center nicht', async () => {
  const c = nur(['aldi-nord'], { stichworte: ['Crunchips', 'Chips'], maxStichwortSeiten: 5 });
  const hole = abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', '/Angebote/Chips': 404 });
  const zustand = {};
  const r = await knaller({ holeText: hole, cfg: c, jetzt: JETZT, zustand });
  const d = r.datei;
  const cr = d.angebote.find(a => /Crunchips/.test(a.titel));
  assert.ok(cr, d.angebote.map(a => a.titel).join(' | '));
  assert.deepEqual([cr.titel, cr.preis, cr.vorher, cr.vorherArt, cr.pct, cr.markt, cr.region, cr.regional, cr.prospekt, cr.fund],
    ['Lorenz Crunchips', 0.99, 1.99, 'uvp', 50, 'aldi-nord', 'Döbeln', false, ALDI_PROSPEKT, 'Crunchips']);
  assert.equal(cr.gueltigAb, '2026-11-15T23:00:00.000Z');
  assert.equal(d.angebote.filter(a => a.markt !== 'aldi-nord').length, 0, 'EDEKA/E center sind keine Märkte der Liste');
  // Vollständigkeit sichtbar: kaufDA zählt 359, gelesen 5 (4 Händlerseite + Crunchips)
  assert.equal(d.maerkte['aldi-nord'].gesamt, 359);
  assert.equal(d.maerkte['aldi-nord'].gelesen, 5);
  assert.deepEqual(d.maerkte['aldi-nord'].prospekte.map(p => p.titel), ['Aktuelle Angebote', 'Aktuelle Angebote']);
  // Status: 2 Begriffe, einer leer (404 -> 7 Tage Pause), ein Treffer
  assert.deepEqual(d.status.kaufda.stichworte, { gelesen: 1, leer: 1, fehler: 0, treffer: 1, begriffe: ['Crunchips'] });
  assert.ok(Date.parse(zustand.knaller.stichwortLeer.Chips) > JETZT.getTime() + 6 * 864e5);
  // Staffel: ab 50 % jetzt 3 (Mascarpone −54 %, Crunchips −50 %, Stieleis −50 %)
  assert.equal(r.kurz.ab['50'], 3);
  assert.deepEqual(Object.keys(r.kurz.ab), ['20', '30', '40', '50']);
});

test('Stichworte: nur derselbe Prospekt, Reihenfolge nach Alter, höchstens maxStichwortSeiten, Merkworte immer', async () => {
  // synthetisch: Aldi-Angebot aus einem ANDEREN Prospekt (z. B. Aldi Nord Berlin) -> zählt nicht für Döbeln
  const fremd = stichwortSeite([angebotRoh('f1', 'ALDI Nord', 'anderer-prospekt', 'Chipsfrisch', [0.99, 1.99, true], { brand: 'Funny Frisch' })]);
  const c = nur(['aldi-nord'], { stichworte: ['A', 'B', 'C'], maxStichwortSeiten: 2, merkworte: ['Crunchips'] });
  const karte = { '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', '/Angebote/A': fremd, '/Angebote/B': fremd, '/Angebote/C': fremd };
  const zustand = { knaller: { stichwortZeit: { A: '2026-11-16T01:00:00Z', B: '2026-11-15T01:00:00Z' } } };
  const h1 = abruf(karte);
  const r1 = await knaller({ holeText: h1, cfg: c, jetzt: JETZT, zustand });
  // Merkwort zuerst, dann C (nie gelesen), dann B (älter als A); A bleibt für den nächsten Lauf
  assert.deepEqual(h1.log.filter(u => u.includes('/Angebote/')).map(u => u.split('/').pop()), ['Crunchips', 'C', 'B']);
  assert.ok(!r1.datei.angebote.some(a => /Chipsfrisch/.test(a.titel)), 'fremder Prospekt zählt nicht');
  // Merkwort-Treffer ist markiert und für die Erinnerung im Zustand
  assert.equal(r1.datei.angebote.find(a => /Crunchips/.test(a.titel)).merkwort, 'Crunchips');
  assert.equal(zustand.knaller.merkRadar[0].titel, 'Lorenz Crunchips');
  const h2 = abruf(karte);
  await knaller({ holeText: h2, cfg: c, jetzt: new Date(JETZT.getTime() + 6 * 3600e3), zustand });
  assert.deepEqual(h2.log.filter(u => u.includes('/Angebote/')).map(u => u.split('/').pop()), ['Crunchips', 'A', 'B']);
  // ohne Prospekt-Angaben (alte Seiten-Fixtures) keine Stichwortseiten – keine überflüssigen Abrufe
  const ohne = abruf({ '/Doebeln/ALDI-Nord/p-r43': stichwortSeite([angebotRoh('x', 'ALDI Nord', ALDI_PROSPEKT, 'Kaffee', [3.99, 7.99])]).replace('"Berlin"', '"Döbeln"') });
  await knaller({ holeText: ohne, cfg: c, jetzt: JETZT, zustand: {} });
  assert.ok(!ohne.log.some(u => u.includes('/Angebote/')));
});

test('Sammeln über die Woche: Crunchips bleibt ohne neuen Abruf, solange der Prospekt gilt; fremder/abgelaufener raus', async () => {
  const c = nur(['aldi-nord'], { stichworte: [] });
  const vorherDatei = { angebote: [
    { id: 'kd:70329737-d588-41d6-83f3-76975dc83f8f', markt: 'aldi-nord', titel: 'Lorenz Crunchips', preis: 0.99, vorher: 1.99, vorherArt: 'uvp', pct: 50, prospekt: ALDI_PROSPEKT, gueltigAb: '2026-11-15T23:00:00.000Z', gueltigBis: '2026-11-21T21:00:00.000Z', region: 'Döbeln', regional: false },
    { id: 'kd:alt-prospekt', markt: 'aldi-nord', titel: 'Kaffee', preis: 3.99, vorher: 7.99, vorherArt: 'streich', pct: 50, prospekt: 'vorwoche', gueltigBis: '2026-11-21T21:00:00.000Z' },
    { id: 'kd:vorbei', markt: 'aldi-nord', titel: 'Butter', preis: 0.99, vorher: 2.29, vorherArt: 'streich', pct: 56, prospekt: ALDI_PROSPEKT, gueltigBis: '2026-11-14T22:00:00.000Z' },
  ] };
  const r = await knaller({ holeText: abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html' }), cfg: c, jetzt: JETZT, zustand: {}, vorherDatei });
  assert.deepEqual(r.datei.angebote.filter(a => a.pct >= 50).map(a => a.titel), ['Weihenstephan Mascarpone-/Rahmjoghurt', 'Lorenz Crunchips', 'NUII Stieleis']);
  assert.equal(r.datei.status.kaufda.pool, 1);
});

test('Gültigkeit: marktguru-Starttag je Angebot (Lidl Doritos ab Do 19.11.), Text „ab Donnerstag“/„Fr. + Sa.“, kurz.kommt', async () => {
  // echte marktguru-Antwort; die Lidl-Angebote im Döbelner Prospekt edef33c8 sind synthetisch (Preise wie bei marktguru)
  const sw = stichwortSeite([
    angebotRoh('d1', 'Lidl', LIDL_PROSPEKT, 'Chips', [1.11, 1.99, true], { brand: 'Doritos' }),
    angebotRoh('p1', 'Lidl', LIDL_PROSPEKT, 'Chips', [1.79, 2.99, true], { brand: 'Pringles' }),
    angebotRoh('t1', 'Lidl', LIDL_PROSPEKT, 'Lebkuchen', [0.99, 1.99, false], { description: 'ab Donnerstag, je 500-g-Packung' }),
    angebotRoh('w1', 'Lidl', LIDL_PROSPEKT, 'Rinderhack', [3.33, 5.99, false], { description: 'Fr. + Sa., je kg' }),
  ]);
  const c = nur(['lidl'], { stichworte: ['Chips'], marktguru: { aktiv: true, start: 'https://www.marktguru.de/', api: 'https://api.marktguru.de/api/v1/offers/search', plz: '04720', limit: 48 } });
  const hole = abruf({
    '/Doebeln/Lidl/p-r74': 'lidl-doebeln-1611.html', '/Angebote/Chips': sw,
    'www.marktguru.de/': '<script>{"apiKey":"oeffentlich-web","clientKey":"oeffentlich-client"}</script>',
    'api.marktguru.de/api/v1/offers/search': 'marktguru-chips-1611.json',
  });
  const r = await knaller({ holeText: hole, cfg: c, jetzt: JETZT, zustand: {} });
  const t = n => r.datei.angebote.find(a => a.titel.includes(n));
  assert.equal(t('Doritos').gueltigAb, '2026-11-18T23:00:00.000Z');
  assert.equal(t('Doritos').abQuelle, 'marktguru');
  assert.equal(t('Pringles').gueltigAb, '2026-11-15T23:00:00.000Z', 'Pringles gilt ab Mo (nicht die Chipsfrisch-Woche ab 23.11.)');
  assert.equal(t('Lebkuchen').gueltigAb, '2026-11-18T23:00:00.000Z');
  assert.equal(t('Lebkuchen').abQuelle, 'text');
  assert.equal(t('Rinderhack').gueltigAb, '2026-11-19T23:00:00.000Z');
  assert.equal(t('Rinderhack').wochenende, true);
  // 6 Treffer in der Antwort, davon 4 von Lidl (Kaufland ist hier kein Markt der Liste)
  assert.deepEqual(r.datei.status.kaufda.marktguru, { angebote: 4, treffer: 2 });
  // Zähler: heute gilt nur Pringles (−40 %) + Lidl-Händlerseite; Doritos/Lebkuchen/Rinderhack kommen noch
  assert.equal(r.kurz.kommt['30'], 3);
  const i = r.kurz.top.findIndex(x => x.ab);
  assert.ok(i === -1 || r.kurz.top.slice(i).every(x => x.ab), 'was jetzt gilt, steht vor dem, was noch kommt');
  // marktguru-Abruf mit den Schlüsseln der Web-Seite im Kopf, nie in der Adresse
  assert.ok(hole.log.some(u => /api\.marktguru\.de.*q=Chips&zipCode=04720/.test(u)));
  assert.ok(!hole.log.some(u => /oeffentlich/.test(u)));
});

test('Starttag-Hilfen: Text, Wochentag im Prospekt, Berliner Mitternacht (Sommer-/Winterzeit)', () => {
  assert.deepEqual(startHinweis('Lorenz Crunchips ab Donnerstag'), { tag: 4, wochenende: false });
  assert.deepEqual(startHinweis('ab Sa.'), { tag: 6, wochenende: true });
  assert.deepEqual(startHinweis('Freitag und Samstag'), { tag: 5, wochenende: true });
  assert.deepEqual(startHinweis('Wochenend-Knüller'), { tag: 5, wochenende: true });
  assert.equal(startHinweis('Montag bis Samstag'), null);
  assert.equal(startHinweis('ab 3 Stück'), null);
  assert.equal(tagAb('2026-11-15T23:00:00.000Z', 1), null, 'Mo = Prospektbeginn selbst');
  assert.equal(tagAb('2026-11-15T23:00:00.000Z', 6), '2026-11-20T23:00:00.000Z');
  assert.equal(berlinMitternacht('2026-07-02'), '2026-07-01T22:00:00.000Z');
  // marktguru: Händler-Zuordnung über die config, nur mit Preis und Start
  const g = marktguruGueltig({ results: [{ advertisers: [{ name: 'PENNY' }], price: 1.79, brand: { name: 'Lorenz' }, product: { name: 'Crunchips XXL' }, validityDates: [{ from: '2026-11-11T23:00:00Z', to: '2026-11-14T22:59:59Z' }] }, { advertisers: [{ name: 'EDEKA Foodservice' }], price: 1, validityDates: [{ from: 'x' }] }] }, MAERKTE);
  assert.equal(g.length, 1);
  assert.ok(passtMarktguru({ markt: 'penny', preis: 1.79, titel: 'LORENZ Crunchips XXL' }, g[0]));
  assert.ok(!passtMarktguru({ markt: 'penny', preis: 1.69, titel: 'LORENZ Crunchips XXL' }, g[0]));
});

test('ohne Vergleichspreis: „statt“ im Prospekttext, sonst derselbe Artikel im selben Markt aus einem früheren Lauf = geschätzt', async () => {
  const c = nur(['aldi-nord'], { stichworte: ['Knoppers'] });
  const seite1 = stichwortSeite([angebotRoh('k1', 'ALDI Nord', ALDI_PROSPEKT, 'Knoppers', [1.99, 2.99, false], { brand: 'Storck' })]);
  const zustand = {};
  await knaller({ holeText: abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Knoppers': seite1 }), cfg: c, jetzt: JETZT, zustand });
  assert.deepEqual(zustand.knaller.preise[produktKey('aldi-nord', 'Storck Knoppers')], { v: 2.99, a: 'streich', t: '2026-11-16' });
  // eine Woche später: derselbe Artikel, Prospekt ohne Vergleichspreis -> geschätzt (grau), mit Quelle; anderer Artikel ohne alles -> nicht
  const spaeter = new Date('2026-11-23T08:30:00Z');
  const seite2 = stichwortSeite([
    angebotRoh('k2', 'ALDI Nord', ALDI_PROSPEKT, 'Knoppers', [1.69], { brand: 'Storck', validFrom: '2026-11-22T23:00:00.000+0000', validUntil: '2026-11-28T22:00:00.000+0000' }),
    angebotRoh('m2', 'ALDI Nord', ALDI_PROSPEKT, 'Milka Schokolade', [0.88], { validFrom: '2026-11-22T23:00:00.000+0000', validUntil: '2026-11-28T22:00:00.000+0000' }),
    angebotRoh('s2', 'ALDI Nord', ALDI_PROSPEKT, 'Kaffee', [3.99], { description: 'je 500-g-Packung, statt 6,99 €', validFrom: '2026-11-22T23:00:00.000+0000', validUntil: '2026-11-28T22:00:00.000+0000' }),
  ]);
  const aldiNeu = (await lies('aldi-doebeln-1611.html')).replaceAll('2026-11-21T21:00:00.000+0000', '2026-11-28T21:00:00.000+0000');
  const r = await knaller({ holeText: abruf({ '/Doebeln/ALDI-Nord/p-r43': aldiNeu, '/Angebote/Knoppers': seite2 }), cfg: c, jetzt: spaeter, zustand });
  const k = r.datei.angebote.find(a => /Knoppers/.test(a.titel));
  assert.deepEqual([k.preis, k.vorher, k.vorherArt, k.pct, k.vorherQuelle], [1.69, 2.99, 'geschaetzt', 43, 'Vergleichspreis im Prospekt vom 16.11.']);
  assert.ok(!r.datei.angebote.some(a => /Milka/.test(a.titel)), 'ohne Bezugspreis kein Rabatt, keine erfundenen Prozente');
  const s = r.datei.angebote.find(a => /Kaffee/.test(a.titel));
  assert.deepEqual([s.vorher, s.vorherArt, s.pct, s.vorherQuelle], [6.99, 'streich', 42, 'Prospekttext „statt“']);
  assert.equal(r.datei.status.kaufda.geschaetzt, 1);
});

test('Merken: ntfy-Nachrichten lesen (neueste gewinnt), Erinnerung am ersten Gültigkeitstag ab 7 Uhr, einmal, nur was gilt', async () => {
  const liste = [
    { id: 'kd:70329737-d588-41d6-83f3-76975dc83f8f', titel: 'Lorenz Crunchips', markt: 'aldi-nord', preis: 0.99, vorher: 1.99, pct: 50, ab: '2026-11-15T23:00:00.000Z', bis: '2026-11-21T21:00:00.000Z' },
    { id: 'kd:doritos', titel: 'Doritos Chips', markt: 'lidl', preis: 1.11, vorher: 1.99, pct: 44, ab: '2026-11-18T23:00:00.000Z', bis: '2026-11-21T22:59:59.000Z' },
    { id: '<script>', titel: 'böse', markt: 'lidl' },
  ];
  const ndjson = [
    { id: 'altalt1', time: 1763270000, event: 'message', topic: 't', message: JSON.stringify({ v: 1, merken: [] }) },
    { id: 'neuneu2', time: 1763280000, event: 'message', topic: 't', message: JSON.stringify({ v: 1, merken: liste }) },
    { id: 'kaputt3', time: 1763270500, event: 'message', topic: 't', message: 'kein json' },
    { id: 'offen44', time: 1763260000, event: 'open', topic: 't' },
  ].map(x => JSON.stringify(x)).join('\n');
  const n = leseMerkNachrichten(ndjson);
  assert.equal(n.id, 'neuneu2');
  assert.deepEqual(n.liste.map(x => x.id), ['kd:70329737-d588-41d6-83f3-76975dc83f8f', 'kd:doritos'], 'fremde/kaputte Einträge raus');
  assert.equal(merkEintrag({ id: 'x', titel: 'a', markt: 'ALDI!' }), null);
  // holeMerkliste: Thema aus der config, since = letzte Nachricht
  const zustand = {};
  const urls = [];
  await holeMerkliste({ holeText: async u => { urls.push(u); return ndjson; }, cfg, zustand, jetzt: JETZT });
  assert.equal(urls[0], 'https://ntfy.sh/xander-schnaeppchen-b5cbf4442aaa9734f3-merken/json?poll=1&since=12h');
  assert.equal(zustand.knaller.merken.length, 2);
  await holeMerkliste({ holeText: async u => { urls.push(u); return ''; }, cfg, zustand, jetzt: JETZT });
  assert.match(urls[1], /since=neuneu2$/);
  assert.equal(zustand.knaller.merken.length, 2, 'keine neue Nachricht -> Liste bleibt');
  // Mo 06:30 Berlin: noch zu früh; Mo 09:30: Crunchips (gilt seit Mo) ja, Doritos (ab Do) nein
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg, jetzt: new Date('2026-11-16T05:30:00Z') }), []);
  const f = faelligeErinnerungen({ zustand, cfg, jetzt: JETZT });
  assert.deepEqual(f.map(x => x.titel), ['Lorenz Crunchips']);
  const msg = erinnerungNachricht(f, cfg, { 'aldi-nord': 'Aldi Nord' });
  msg.message = msg.message.replace(/\u00a0/g, ' ');
  assert.equal(msg.title, 'Gemerkt: Lorenz Crunchips – gilt jetzt');
  assert.match(msg.message, /^• Lorenz Crunchips – Aldi Nord 0,99 € statt 1,99 € \(−50 %\), bis Sa 21\.11\.$/);
  assert.equal(msg.click, 'https://xanderfoxy.github.io/Synquenzer/mein-vorteil/#woche');
  assert.equal(msg.topic, cfg.ntfy.topic);
  verbucheErinnerung(zustand, f, JETZT);
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg, jetzt: JETZT }), [], 'nur einmal');
  assert.equal(erinnerungFaellig(cfg, zustand, new Date('2026-11-19T06:10:00Z')), true, 'Do 07:10: Doritos dran');
  assert.equal(faelligkeit(cfg, { ...zustand, gemeldet: {}, lauf: Object.fromEntries(Object.keys(cfg.module).map(k => [k, '2026-11-19T06:00:00Z'])) }, new Date('2026-11-19T06:10:00Z')).faellig, true, 'Vorprüfung startet den Lauf für die Erinnerung');
  // frische Daten aus knaller.json gehen vor (Preis geändert); abgelaufen -> keine Erinnerung
  const frisch = faelligeErinnerungen({ zustand, cfg, jetzt: new Date('2026-11-19T06:10:00Z'), angebote: [{ id: 'kd:doritos', titel: 'Doritos Chips', markt: 'lidl', preis: 0.99, vorher: 1.99, pct: 50, gueltigAb: '2026-11-18T23:00:00.000Z', gueltigBis: '2026-11-21T22:59:59.000Z' }] });
  assert.equal(frisch[0].preis, 0.99);
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg, jetzt: new Date('2026-11-22T09:00:00Z') }), []);
});

test('Push nur für das, was jetzt gilt: ein Eintrag mit späterem Start bleibt ungemeldet, bis er gilt', () => {
  const e = { id: 'x', kategorie: 'deals', titel: 'Crunchips bei Edeka', zeile: '0,88 €', wert: 90, sofort: true, link: 'https://a.de', ab: '2026-11-18T23:00:00.000Z' };
  const z = { gemeldet: {} };
  assert.equal(plane({ eintraege: [e], zustand: z, cfg, jetzt: JETZT, modus: 'auto' }).sofort.length, 0);
  assert.equal(plane({ eintraege: [e], zustand: z, cfg, jetzt: new Date('2026-11-19T08:00:00Z'), modus: 'auto' }).sofort.length, 1);
});

test('main.lauf: Merkliste vom ntfy-Thema, fällige Erinnerung als eigene Nachricht', async () => {
  const { lauf } = await import('../main.mjs');
  const c = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'knaller', ...(k === 'knaller' ? { maerkte: MAERKTE.filter(m => m.id === 'aldi-nord'), stichworte: ['Crunchips'], marktguru: null } : {}) }])) };
  const merk = JSON.stringify({ id: 'abcdef1', time: 1763280000, event: 'message', message: JSON.stringify({ v: 1, merken: [{ id: 'kd:70329737-d588-41d6-83f3-76975dc83f8f', titel: 'Lorenz Crunchips', markt: 'aldi-nord' }] }) });
  const hole = abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', 'ntfy.sh/': merk });
  const r = await lauf({ cfg: c, wunschliste: {}, vorher: null, zustand: { gemeldet: {} }, holeText: hole, jetzt: JETZT, alle: true });
  assert.ok(r.erinnerung, 'Crunchips gemerkt und gilt heute');
  assert.match(r.erinnerung.msg.message.replace(/\u00a0/g, ' '), /Lorenz Crunchips – Aldi Nord 0,99 € statt 1,99 € \(−50 %\)/);
  assert.deepEqual(r.aktuell.status.knaller.merken, { neu: true, anzahl: 1 });
});
