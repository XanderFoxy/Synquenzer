// Modul knaller (Wochen-Knaller je Markt, 16.11.2026): Fixtures = gekürzte kaufDA-Seiten mit echten Angeboten aus den
// Mitschnitten auf roh-daten (31.10./08.11.2026), Daten auf eine Woche verschoben (08.–14.11.; eins abgelaufen, eins ab 16.11.).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import knaller, { knallerAngebot, marktVon, bereichVon, STANDARD } from '../module/knaller.mjs';
import { leseKaufdaSeite, angeboteAus, kaufdaZeit } from '../lib/kaufda.mjs';
import { eintrag, bildLink } from '../module/gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const JETZT = new Date('2026-11-10T10:00:00Z');
const MAERKTE = cfg.module.knaller.maerkte;

// Abruf nach Karte: Wert = Datei | 404 | 503
function abruf(karte) {
  const log = [];
  const fn = async url => {
    log.push(url);
    const t = Object.entries(karte).find(([k]) => url.endsWith(k));
    if (!t) throw new Error(`HTTP 404 bei www.kaufda.de`);
    if (t[1] === 404 || t[1] === 503) throw new Error(`HTTP ${t[1]} bei www.kaufda.de`);
    return readFile(join(FX, t[1]), 'utf8');
  };
  fn.log = log;
  return fn;
}
const STANDARD_KARTE = {
  '/Geschaefte/Aldi-Nord': 'kaputt.txt',
  '/Geschaefte/Lidl': 'knaller/lidl-anders.html',
  '/Geschaefte/Kaufland': 404,
  '/Geschaefte/Netto-Marken-Discount': 'knaller/netto-chemnitz.html',
  '/Geschaefte/Penny-Markt': 'knaller/penny.html',
  '/Geschaefte/REWE': 'knaller/rewe.html',
  '/Geschaefte/Marktkauf': 503,
};
const titelVon = d => d.angebote.map(a => `${a.markt}:${a.titel}:${a.pct}`);

test('knaller: nur mit Vergleichspreis, ab 30 %, Art UVP/Streich, ab-Preis, App, abgelaufen raus, später rein, doppelt einmal', async () => {
  const hole = abruf(STANDARD_KARTE);
  const r = await knaller({ holeText: hole, cfg, jetzt: JETZT, zustand: {} });
  const d = r.datei;
  assert.equal(r.eintraege.length, 0, 'keine Einträge in aktuell.json (keine Pushes)');
  const penny = d.angebote.filter(a => a.markt === 'penny');
  const t = n => penny.find(a => a.titel.includes(n));
  // Knoppers Minis 1,99 statt 2,99 (UVP) = −33 %
  assert.equal(t('Knoppers Minis').pct, 33);
  assert.equal(t('Knoppers Minis').vorherArt, 'uvp');
  assert.equal(t('Knoppers Minis').vorher, 2.99);
  // Lachgummi 0,88 statt 1,49 (UVP) = 40,9 % -> abgerundet 40 (nie mehr versprechen), ab-Preis, „mit PENNY App“
  assert.equal(t('Lachgummi').pct, 40);
  assert.equal(t('Lachgummi').abPreis, true);
  assert.equal(t('Lachgummi').app, true);
  // Haribo Fruchtgummi 3,49 statt 4,99 = genau 30 % -> drin (Grenze)
  assert.ok(penny.some(a => a.titel.includes('Fruchtgummi') && a.preis === 3.49 && a.pct === 30));
  // Fruchtgummi 1,29 statt 1,49 = 13 % -> nicht; Knusper Flocken ohne Vergleichspreis -> nicht; Weihnachtsbeutel abgelaufen
  assert.ok(!penny.some(a => a.preis === 1.29));
  assert.ok(!penny.some(a => /Knusper/.test(a.titel)));
  assert.ok(!penny.some(a => /Weihnachtsbeutel/.test(a.titel)));
  // Crunchips beginnt erst am 16.11. -> mit gueltigAb in der Zukunft (Seite: „Ab Montag“)
  assert.ok(Date.parse(t('Crunchips').gueltigAb) > JETZT.getTime());
  // Frischkäse doppelt auf der Seite (andere id, gleicher Titel/Preis) -> einmal
  assert.equal(penny.filter(a => /Frischkäse/.test(a.titel)).length, 1);
  // „Netto mit dem Scottie“ auf der Penny-Seite gehört nicht zu Penny (und ist kein Markt der Liste)
  assert.ok(!d.angebote.some(a => /Choco Crossies/.test(a.titel)));
  // Netto Marken-Discount: Haribo 0,66 statt 1,19 (UVP) = 44,5 % -> −44 %; Dosen (−22 %) und Adventskalender (−22 %) erst ab
  // der neuen Stufe 20 % (Xander 16.11.2026: „Staffel 20/30/40/50“)
  assert.deepEqual(d.angebote.filter(a => a.markt === 'netto').map(a => [a.preis, a.pct]), [[0.66, 44], [3.49, 22], [6.99, 22]]);
  // Lidl (andere Struktur der Seite): HARIBO XXL 0,99 statt 1,49 = Streichpreis 33,6 % -> −33 %
  const lidl = d.angebote.filter(a => a.markt === 'lidl');
  assert.equal(lidl.length, 1);
  assert.equal(lidl[0].vorherArt, 'streich');
  assert.equal(lidl[0].pct, 33);
  // REWE hat nichts mit Vergleichspreis
  assert.equal(d.maerkte.rewe.anzahl, 0);
  // sortiert nach Rabatt
  const pcts = d.angebote.map(a => a.pct);
  assert.deepEqual(pcts, [...pcts].sort((a, b) => b - a));
  assert.equal(d.angebote.length, 10, titelVon(d).join('\n'));
  assert.equal(d.angebote.filter(a => a.pct >= 30).length, 8, 'ab 30 % wie bisher');
  // Übersicht für die Start-Kachel: Zähler nur für das, was HEUTE gilt (Crunchips ab 16.11. steht unter „kommt“)
  assert.deepEqual(r.kurz.ab, { 20: 9, 30: 7, 40: 3, 50: 0 });
  // Crunchips ab Mo 16.11. = nächste Woche (Di 10.11.): kurz.naechste, nicht „kommt diese Woche“ (Prüfer 16.11.)
  assert.deepEqual(r.kurz.kommt, { 20: 0, 30: 0, 40: 0, 50: 0 });
  assert.deepEqual(r.kurz.naechste, { 20: 1, 30: 1, 40: 0, 50: 0 });
  assert.equal(r.kurz.wocheBis, '2026-11-15T23:00:00.000Z');
  assert.equal(r.kurz.top[0].pct, 44);
  assert.equal(r.kurz.top[0].markt, 'Netto');
  // Bild = Prospekt-Ausschnitt (https, nur Link), Link = Händlerseite, regional mit Ort
  for (const a of d.angebote) {
    assert.match(a.bild, /^https:\/\/content-media\.bonial\.biz\//);
    assert.match(a.link, /^https:\/\/www\.kaufda\.de\//);
    assert.equal(a.regional, true);
    assert.ok(a.region);
    assert.ok(a.gueltigBis);
    assert.ok(a.vorher > a.preis);
    // Haribo-Adventskalender (neu ab 20 %) steht bei kaufDA unter Weihnachten -> nonfood; alles ab 30 % Lebensmittel wie bisher
    assert.equal(a.bereich, a.pct >= 30 ? 'lebensmittel' : a.bereich);
    assert.ok(['lebensmittel', 'nonfood'].includes(a.bereich));
  }
  // klein genug für das Handy
  assert.ok(JSON.stringify(d).length < 60000);
});

test('knaller: Ausfälle – 404 = Hinweis, kaputter Datenblock/503 = Fehler, alte Angebote des Markts bleiben, alles tot = Fehler', async () => {
  const vorherDatei = { angebote: [
    { id: 'kd:alt1', markt: 'marktkauf', titel: 'Kaffee', preis: 3.99, vorher: 7.99, vorherArt: 'streich', pct: 50, gueltigBis: '2026-11-14T22:59:00.000Z' },
    { id: 'kd:alt2', markt: 'marktkauf', titel: 'Butter', preis: 0.99, vorher: 2.29, vorherArt: 'streich', pct: 57, gueltigBis: '2026-11-07T22:59:00.000Z' },
  ] };
  const r = await knaller({ holeText: abruf(STANDARD_KARTE), cfg, jetzt: JETZT, zustand: {}, vorherDatei });
  assert.ok(r.hinweise.some(h => /Kaufland: keine kaufDA-Händlerseite/.test(h)));
  assert.ok(r.fehler.some(f => /^Aldi Nord: kaufDA: Datenblock __NEXT_DATA__ fehlt/.test(f)));
  assert.ok(r.fehler.some(f => /^Marktkauf: HTTP 503/.test(f)));
  const mk = r.datei.angebote.filter(a => a.markt === 'marktkauf');
  assert.deepEqual(mk.map(a => a.titel), ['Kaffee'], 'noch gültiges altes Angebot bleibt, abgelaufenes nicht');
  assert.equal(r.datei.maerkte.marktkauf.alt, true);
  assert.deepEqual(r.datei.status.kaufda.alt, ['marktkauf']);
  assert.equal(r.datei.status.kaufda.ok, false);
  // alle Seiten tot -> Modul wirft (main.mjs behält dann die alte Datei)
  const tot = async () => { throw new Error('HTTP 503 bei www.kaufda.de'); };
  await assert.rejects(() => knaller({ holeText: tot, cfg, jetzt: JETZT, zustand: {} }), /kaufDA: keine Händlerseite gelesen/);
});

test('knaller: Ortsseite zuerst (Döbeln, Chemnitz, Leipzig), dann bundesweit mit Hinweis; kein Markt in der Nähe = Hinweis; Pause 2,1 s', async () => {
  // echte gekürzte Seite /Leipzig/Kaufland/p-r2801 (Roh-Lauf 43793492110): Döbeln und Chemnitz 404 -> Leipzig
  const nurKaufland = { ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => m.id === 'kaufland') } } };
  const h1 = abruf({ '/Leipzig/Kaufland/p-r2801': 'knaller/kaufland-leipzig.html' });
  const r1 = await knaller({ holeText: h1, cfg: nurKaufland, jetzt: new Date('2026-11-16T10:00:00Z'), zustand: { knaller: { ohneStadt: '2026-11-16T02:27:17Z' } } });
  assert.deepEqual(h1.log, [
    'https://www.kaufda.de/Doebeln/Kaufland/p-r2801',
    'https://www.kaufda.de/Chemnitz/Kaufland/p-r2801',
    'https://www.kaufda.de/Leipzig/Kaufland/p-r2801',
  ], 'Orts-Händlerseiten in der Reihenfolge der config, bundesweit nicht mehr nötig');
  const d1 = r1.datei;
  assert.equal(d1.standort, 'Leipzig');
  assert.equal(d1.maerkte.kaufland.ort, 'Leipzig');
  assert.equal(d1.maerkte.kaufland.link, 'https://www.kaufda.de/Leipzig/Kaufland/p-r2801');
  assert.deepEqual(d1.status.kaufda.orte, { kaufland: 'Leipzig' });
  // echte Werte: Schokolade 0,88 statt 1,99 (Streichpreis) = −55 %, Junge Ente 3,99 statt 7,98 = −50 %, Paprika −44 %
  assert.deepEqual(d1.angebote.map(a => [a.titel.replace(/^\S+ /, ''), a.preis, a.vorher, a.pct, a.vorherArt]).slice(0, 3).map(x => x.slice(1)),
    [[0.88, 1.99, 55, 'streich'], [3.99, 7.98, 50, 'streich'], [1.39, 2.49, 44, 'streich']]);
  for (const a of d1.angebote) {
    assert.equal(a.region, 'Leipzig');
    assert.equal(a.regional, true, 'Leipziger Prospekt -> in Döbeln prüfen');
    assert.match(a.bild, /^https:\/\/content-media\.bonial\.biz\//);
  }
  // alte 7-Tage-Sperre der Stadt ist weg
  assert.equal(r1.datei.status.kaufda.abrufe, 3);
  // Döbeln-Seite da (dieselbe echte Seite, Standort Döbeln) -> standort Döbeln, nicht „regional“, nächste Filiale gemerkt
  const doebeln = (await readFile(join(FX, 'knaller/kaufland-leipzig.html'), 'utf8'))
    .replace(/"city": ?"Leipzig", ?"cityDisplayName": ?"Leipzig"/, '"city": "Döbeln", "cityDisplayName": "Döbeln"');
  const h2 = async u => { if (u.includes('/Doebeln/Kaufland/p-r2801')) return doebeln; throw new Error('HTTP 404 bei www.kaufda.de'); };
  const r2 = await knaller({ holeText: h2, cfg: nurKaufland, jetzt: new Date('2026-11-16T10:00:00Z'), zustand: {} });
  assert.equal(r2.datei.standort, 'Döbeln');
  assert.ok(r2.datei.angebote.length && r2.datei.angebote.every(a => a.regional === false && a.region === 'Döbeln'));
  assert.deepEqual(r2.datei.maerkte.kaufland.filiale, { adresse: 'Dresdner Straße 80, 04317 Leipzig', km: 2.4, von: 'Döbeln' });
  // Ortsseite meldet einen anderen Standort (kaufDA kennt die Stadt nicht) -> zählt nicht als Döbeln
  const h3 = async u => { if (u.includes('/Doebeln/') || u.includes('/Chemnitz/')) throw new Error('HTTP 404 bei www.kaufda.de'); if (u.includes('/Leipzig/')) return doebeln; return readFile(join(FX, 'knaller/rewe.html'), 'utf8'); };
  const r3 = await knaller({ holeText: h3, cfg: nurKaufland, jetzt: new Date('2026-11-16T10:00:00Z'), zustand: {} });
  assert.notEqual(r3.datei.maerkte.kaufland.ort, 'Leipzig');
  // keine Ortsseite -> bundesweit, sichtbar als Hinweis und je Angebot regional
  const h4 = abruf(STANDARD_KARTE);
  const r4 = await knaller({ holeText: h4, cfg, jetzt: JETZT, zustand: {} });
  assert.equal(r4.datei.standort, 'bundesweit');
  assert.ok(r4.hinweise.some(h => /^Penny: kein Prospekt für Döbeln\/Chemnitz\/Leipzig gefunden – bundesweite Angebote, in Döbeln prüfen/.test(h)), r4.hinweise.join('\n'));
  assert.match(r4.datei.angebote.find(a => a.markt === 'penny').region, /^bundesweit/);
  assert.ok(r4.datei.angebote.every(a => a.regional === true));
  // Marktkauf: nächste Filiale von Döbeln aus 45 km -> „kein Markt in der Nähe“ (Hinweis, keine Störung, kein Berlin-Prospekt)
  const weit = doebeln.replace(/"distance": ?[0-9.]+/, '"distance": 45.27').replace(/"publisherName": ?"Kaufland"/g, '"publisherName": "Marktkauf"');
  const nurMk = { ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => m.id === 'marktkauf') } } };
  const h5 = abruf({});
  const h5f = async u => { h5.log.push(u); if (u.includes('/Doebeln/Marktkauf/p-r60')) return weit; throw new Error('HTTP 404 bei www.kaufda.de'); };
  const r5 = await knaller({ holeText: h5f, cfg: nurMk, jetzt: new Date('2026-11-16T10:00:00Z'), zustand: {} });
  assert.deepEqual(h5.log, ['https://www.kaufda.de/Doebeln/Marktkauf/p-r60'], 'nach „kein Markt in der Nähe“ keine weiteren Abrufe');
  assert.ok(r5.hinweise.includes('Marktkauf: kein Markt in der Nähe von Döbeln (nächste Filiale 45,3 km)'), r5.hinweise.join('\n'));
  assert.deepEqual(r5.fehler, []);
  assert.equal(r5.datei.status.kaufda.ok, true);
  assert.equal(r5.datei.maerkte.marktkauf.keinMarkt, true);
  assert.equal(r5.datei.angebote.length, 0);
  // höflich: robots.txt crawl-delay 2 -> 2,1 s je Abruf bei kaufDA
  assert.ok(cfg.abruf.pauseMsJeHost['www.kaufda.de'] >= 2000);
  assert.ok(cfg.module.knaller.intervallStunden >= 3);
});

test('knaller: Einstellungen – minProzent, maxJeMarkt, ab-Preise aus; Händler-Zuordnung', async () => {
  const mit = extra => ({ ...cfg, module: { knaller: { ...cfg.module.knaller, ...extra } } });
  const r31 = await knaller({ holeText: abruf(STANDARD_KARTE), cfg: mit({ minProzent: 31 }), jetzt: JETZT, zustand: {} });
  assert.ok(!r31.datei.angebote.some(a => a.pct < 31));
  assert.ok(!r31.datei.angebote.some(a => a.preis === 3.49 && a.markt === 'penny'));
  const r2 = await knaller({ holeText: abruf(STANDARD_KARTE), cfg: mit({ maxJeMarkt: 2 }), jetzt: JETZT, zustand: {} });
  assert.deepEqual(r2.datei.angebote.filter(a => a.markt === 'penny').map(a => a.pct), [41, 40]);
  const ohneAb = await knaller({ holeText: abruf(STANDARD_KARTE), cfg: mit({ abPreise: false }), jetzt: JETZT, zustand: {} });
  assert.ok(!ohneAb.datei.angebote.some(a => a.abPreis));
  assert.ok(!ohneAb.datei.angebote.some(a => /Lachgummi/.test(a.titel)));
  // Zuordnung: Scottie, ALDI SÜD, EDEKA gehören zu keinem Markt der Liste
  assert.equal(marktVon('Netto Marken-Discount', MAERKTE), 'netto');
  assert.equal(marktVon('Netto mit dem Scottie', MAERKTE), null);
  assert.equal(marktVon('ALDI NORD', MAERKTE), 'aldi-nord');
  assert.equal(marktVon('ALDI SÜD', MAERKTE), null);
  assert.equal(marktVon('PENNY', MAERKTE), 'penny');
  assert.equal(marktVon('EDEKA', MAERKTE), null);
  assert.equal(bereichVon({ categoryPaths: [[{ name: 'Haus und Garten' }, { name: 'Werkzeug' }]] }), 'nonfood');
  assert.equal(bereichVon({}), null);
});

test('knaller: einzelnes Angebot – Bild nur https, unplausibler Rabatt ohne %, Kartenpreis, Mengenbedingung', () => {
  const o = {
    id: 'x1', type: 'OFFER', publisherName: 'Kaufland', brand: 'Milka', title: 'Schokolade', description: 'je 100-g-Tafel',
    validFrom: '2026-11-08T23:00:00.000+0000', validUntil: '2026-11-14T22:59:00.000+0000',
    offerImages: { url: { thumbnail: 'http://unsicher.example/b.jpg', normal: 'javascript:alert(1)' } },
    prices: { mainPrice: 0.79, secondaryPrice: 1.49, secondaryPriceIsUVP: false, priceRange: false, conditions: [{ other: 'mit Kaufland Card' }, { other: 'ab 3 Stück' }] },
  };
  const opt = { ...STANDARD };
  const a = knallerAngebot(o, { markt: 'kaufland', seite: 'https://www.kaufda.de/Geschaefte/Kaufland', region: 'Chemnitz', jetztMs: JETZT.getTime(), opt }).angebot;
  assert.equal(a.bild, null, 'nur https-Bilder');
  assert.equal(a.app, true, 'Kaufland Card = Kartenpreis');
  assert.equal(a.bedingung, 'ab 3 Stück');
  assert.equal(a.pct, 46, '0,79 statt 1,49 = 46,98 % -> abgerundet 46');
  assert.equal(a.titel, 'Milka Schokolade');
  const komisch = knallerAngebot({ ...o, prices: { mainPrice: 0.09, secondaryPrice: 9.99 } }, { markt: 'kaufland', seite: '', region: '', jetztMs: JETZT.getTime(), opt });
  assert.equal(komisch.grund, 'Rabatt unplausibel');
  assert.equal(knallerAngebot({ ...o, prices: { mainPrice: 0.79, secondaryPrice: 0 } }, { markt: 'kaufland', seite: '', region: '', jetztMs: JETZT.getTime(), opt }).grund, 'ohne Vergleichspreis');
  assert.equal(knallerAngebot({ ...o, prices: { mainPrice: 0.79, secondaryPrice: 0.79 } }, { markt: 'kaufland', seite: '', region: '', jetztMs: JETZT.getTime(), opt }).grund, 'ohne Vergleichspreis');
});

test('lib/kaufda: Angebote überall in pageInformation, kaputter Block = klarer Fehler, Zeit mit +0000', async () => {
  const s = leseKaufdaSeite(await readFile(join(FX, 'knaller', 'lidl-anders.html'), 'utf8'));
  assert.equal(s.items.length, 1);
  assert.equal(s.url, 'https://www.kaufda.de/Geschaefte/Lidl');
  assert.equal(angeboteAus({ a: { b: [{ type: 'OFFER', id: 1 }, { type: 'BROCHURE', id: 2 }] }, offers: { main: { items: [{ type: 'OFFER', id: 1 }] } } }).length, 1);
  assert.throws(() => leseKaufdaSeite('<html></html>'), /__NEXT_DATA__ fehlt/);
  assert.throws(() => leseKaufdaSeite('<script id="__NEXT_DATA__">{kaputt</script>'), /nicht lesbar/);
  assert.equal(kaufdaZeit('2026-10-31T22:00:00.000+0000'), '2026-10-31T22:00:00.000Z');
});

test('Einträge tragen das Produktbild weiter (nur https)', async () => {
  const e = eintrag({ kategorie: 'deals', titel: 'Haribo', link: 'https://www.mydealz.de/deals/x', bild: 'https://static.mydealz.de/threads/raw/a/150x150/qt/60/a.jpg', jetzt: JETZT });
  assert.equal(e.bild, 'https://static.mydealz.de/threads/raw/a/150x150/qt/60/a.jpg');
  assert.equal(eintrag({ kategorie: 'deals', titel: 'X', link: 'https://a.de', bild: 'http://a.de/b.jpg', jetzt: JETZT }).bild, undefined);
  assert.equal(bildLink('https://a.de/b c.jpg'), null);
  // deals: Schnäppchen-Angebot mit Bild (marktguru) -> Eintrag mit Bild
  const deals = (await import('../module/deals.mjs')).default;
  const cur = { produkte: [{ id: 'crunchips', name: 'Crunchips', basis: '100g', normalpreis: 1.2, deal: true,
    bestes: { shop: 'Netto Marken-Discount', titel: 'Crunchips', preis: 1.11, preisVorher: 2.29, gueltigBis: '2026-11-14T22:59:00Z', mengeSicher: true, packung: '150 g', menge: { gramm: 150 }, link: 'https://www.marktguru.de/offers/1', bild: 'https://mg2de.b-cdn.net/api/v1/offers/1/images/default/0/medium.webp' } }] };
  const hole = async url => { if (url.includes('schnaeppchen-daten')) return JSON.stringify(cur); return '<rss><channel></channel></rss>'; };
  const r = await deals({ holeText: hole, cfg: { ...cfg, module: { ...cfg.module, deals: { ...cfg.module.deals, feeds: [], cashback: null } } }, jetzt: JETZT, zustand: {} });
  const c = r.eintraege.find(x => /Crunchips/.test(x.titel));
  assert.ok(c, JSON.stringify(r));
  assert.equal(c.bild, 'https://mg2de.b-cdn.net/api/v1/offers/1/images/default/0/medium.webp');
});

test('main.lauf: knaller schreibt knaller.json und status.knaller.kurz, keine Kategorie-Einträge', async () => {
  const { lauf } = await import('../main.mjs');
  const nur = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'knaller' }])) };
  const r = await lauf({ cfg: nur, wunschliste: {}, vorher: null, zustand: {}, holeText: abruf(STANDARD_KARTE), jetzt: JETZT, alle: true });
  assert.ok(r.dateien.knaller);
  assert.equal(r.dateien.knaller.angebote.length, 10);
  assert.equal(r.dateien.knaller.angebote.filter(a => a.pct >= 30).length, 8);
  assert.deepEqual(r.aktuell.kategorien.knaller, []);
  assert.equal(r.aktuell.status.knaller.kurz.ab['40'], 3);
  assert.equal(r.aktuell.status.knaller.ok, false, 'Aldi/Marktkauf gestört');
});

// --- Prüfer-Befunde 16.11.2026 (Datenprüfung gegen die echten kaufDA-Mitschnitte) -------------------------------------------
const seiteMit = (items, ort = 'Berlin') => `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { pageInformation: { location: { cityDisplayName: ort }, offers: { main: { items } } } } } })}</script>`;
const angebotRoh = (id, extra = {}, preise = {}) => ({
  type: 'OFFER', id, publisherName: 'REWE', brand: 'Storck', title: 'Knoppers Nussriegel', validFrom: '2026-11-08T23:00:00.000+0000', validUntil: '2026-11-14T22:59:00.000+0000',
  offerImages: { url: { normal: `https://content-media.bonial.biz/${id}/${id}-bild.jpg?impolicy=SEO-offer-normal`, large: `https://content-media.bonial.biz/${id}/${id}-bild.jpg` } },
  parentContent: { id: `prospekt-${id}`, type: 'static_brochure' },
  ...extra, prices: { mainPrice: 1.69, secondaryPrice: 2.99, secondaryPriceIsUVP: false, ...preise },
});
const nurMarkt = id => ({ ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => m.id === id) } } });

test('knaller Prüfer: UVP-Kennzeichen fehlt -> „unbekannt“ (kein Goldrahmen), Rabatt abgerundet, App-/Kartenpreise', () => {
  const k = (preise, extra) => knallerAngebot(angebotRoh('x', extra, preise), { markt: 'rewe', seite: 'https://www.kaufda.de/Geschaefte/REWE', region: 'x', jetztMs: JETZT.getTime(), opt: { ...STANDARD } });
  assert.equal(k({ secondaryPriceIsUVP: undefined }).angebot.vorherArt, 'unbekannt');
  assert.equal(k({ secondaryPriceIsUVP: null }).angebot.vorherArt, 'unbekannt');
  assert.equal(k({ secondaryPriceIsUVP: true }).angebot.vorherArt, 'uvp');
  assert.equal(k({ secondaryPriceIsUVP: false }).angebot.vorherArt, 'streich');
  // 1,41 statt 2,00 = 29,5 % -> 29 (nicht „ab 30 %“); 0,70 statt 1,00 = 30 % bleibt 30 (keine Gleitkomma-Falle)
  assert.equal(k({ mainPrice: 1.41, secondaryPrice: 2 }).angebot.pct, 29);
  assert.equal(k({ mainPrice: 0.7, secondaryPrice: 1 }).angebot.pct, 30);
  for (const c of ['mit DeutschlandCard', 'mit REWE Bonus', 'Bonus-Guthaben', 'Mitgliederpreis', 'Nur mit Netto-App', 'nur mit PAYBACK'])
    assert.equal(k({ conditions: [{ other: c }] }).angebot.app, true, c);
  for (const c of ['ab 3 Stück', 'Bonuspackung 20 % mehr Inhalt', 'je 150-g-Packung'])
    assert.equal(k({ conditions: [{ other: c }] }).angebot.app, false, c);
  assert.equal(k({ conditions: [{}] }, { description: 'Nur mit DeutschlandCard' }).angebot.app, true);
  assert.equal(k({}).angebot.prospekt, 'prospekt-x');
});

test('knaller Prüfer: Doppel aus parallelen Prospekten (gleiches Foto oder Marke+Wort+Preis+Vergleich+Ende) nur einmal', async () => {
  const bild = n => ({ offerImages: { url: { normal: `https://content-media.bonial.biz/${n}/f322ef68-6485.jpg?impolicy=SEO-offer-normal` } } });
  const items = [
    angebotRoh('a1', { title: 'Knoppers Nussriegel oder Knoppers' }),
    angebotRoh('a2', { title: 'Knoppers Nussriegel' }), // anderer Titel, anderes Foto, gleiche Marke/Preis/Vergleich/Ende
    angebotRoh('s1', { brand: 'Haribo', title: 'Starmix', ...bild('s1') }, { mainPrice: 1.79, secondaryPrice: 2.79 }),
    angebotRoh('s2', { brand: 'Haribo', title: 'Starmix oder Goldbären', ...bild('s2') }, { mainPrice: 1.79, secondaryPrice: 2.79 }), // gleiches Foto
    angebotRoh('g1', { brand: 'Haribo', title: 'Goldbären Riesenpack' }, { mainPrice: 3.99, secondaryPrice: 6.99 }), // anderes Produkt
    angebotRoh('p1', { brand: 'Storck', title: 'Knoppers Nussriegel', offerImages: { url: { normal: 'https://content-media.bonial.biz/p1/main.jpg' } } }, { mainPrice: 1.69, secondaryPrice: 2.99, secondaryPriceIsUVP: false }),
  ];
  const r = await knaller({ holeText: async u => (u.includes('/Chemnitz/') ? seiteMit([], 'Chemnitz') : seiteMit(items)), cfg: nurMarkt('rewe'), jetzt: JETZT, zustand: {} });
  assert.deepEqual(r.datei.angebote.map(a => a.titel).sort(), ['Haribo Goldbären Riesenpack', 'Haribo Starmix', 'Storck Knoppers Nussriegel oder Knoppers'].sort(), titelVon(r.datei).join('\n'));
  assert.ok(r.datei.angebote.every(a => a.prospekt && !('_marke' in a) && !('_bildDatei' in a)));
  // Stadtseite geladen, aber ohne REWE-Angebote -> bundesweit genommen: standort ehrlich „bundesweit“, nicht „Chemnitz“
  assert.equal(r.datei.standort, 'bundesweit');
  assert.match(r.datei.angebote[0].region, /^bundesweit/);
  assert.equal(r.datei.status.kaufda.roh.rewe, 6);
});

test('knaller Prüfer: Seite ohne ein einziges Angebot = Hinweis, alte Angebote bleiben; mehrere/alle leer = Störung (nicht still „0“)', async () => {
  const leer = seiteMit([]);
  const vorherDatei = { angebote: [{ id: 'kd:alt', markt: 'penny', titel: 'Kaffee', preis: 3.99, vorher: 7.99, vorherArt: 'streich', pct: 50, gueltigBis: '2026-11-14T22:59:00.000Z' }] };
  const penny = await readFile(join(FX, 'knaller', 'penny.html'), 'utf8');
  const c = { ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => m.id === 'penny' || m.id === 'netto') } } };
  const r = await knaller({ holeText: async u => (u.includes('Netto') ? penny : leer), cfg: c, jetzt: JETZT, zustand: {}, vorherDatei });
  // einzeln (echter Lauf 16.11.: Marktkauf ohne Prospekt am Standort) -> Hinweis, keine Störung
  assert.ok(r.hinweise.some(h => /^Penny: Seite ohne Angebote/.test(h)), r.hinweise.join('\n'));
  assert.ok(!r.fehler.some(f => /Penny/.test(f)), r.fehler.join('\n'));
  assert.deepEqual(r.datei.angebote.filter(a => a.markt === 'penny').map(a => a.titel), ['Kaffee']);
  assert.deepEqual(r.datei.status.kaufda.alt, ['penny']);
  // Netto-Seite gelesen, aber die Angebote darauf sind von Penny/Scottie -> Hinweis, roh.netto zählt nur Netto
  assert.ok(r.hinweise.some(h => /^Netto: keine Angebote dieses Markts/.test(h)) || r.datei.status.kaufda.roh.netto > 0);
  await assert.rejects(() => knaller({ holeText: async () => leer, cfg: c, jetzt: JETZT, zustand: {} }), /keine Händlerseite gelesen.*Seiten ohne Angebote \(Netto, Penny\)/);
  // 3 von 4 Seiten leer -> Störung im Status (Aufbau geändert?), die eine volle Seite zählt trotzdem
  const c4 = { ...cfg, module: { knaller: { ...cfg.module.knaller, maerkte: MAERKTE.filter(m => ['penny', 'netto', 'rewe', 'lidl'].includes(m.id)) } } };
  const r4 = await knaller({ holeText: async u => (u.includes('Netto') ? penny : leer), cfg: c4, jetzt: JETZT, zustand: {} });
  assert.equal(r4.datei.status.kaufda.ok, false);
  assert.ok(r4.fehler.some(f => /Seiten ohne Angebote \(Lidl, Penny, REWE\)/.test(f)), r4.fehler.join('\n'));
});

test('knaller Prüfer: Start-Kachel-Übersicht – was jetzt gilt zuerst, Späteres mit „ab“', async () => {
  const items = [
    angebotRoh('jetzt', { title: 'Knoppers Nussriegel' }, { mainPrice: 1.69, secondaryPrice: 2.99 }),
    angebotRoh('spaeter', { brand: 'Lorenz', title: 'Crunchips', validFrom: '2026-11-15T23:00:00.000+0000', validUntil: '2026-11-21T22:59:00.000+0000' }, { mainPrice: 0.99, secondaryPrice: 2.29 }),
  ];
  const r = await knaller({ holeText: async u => (u.includes('/Chemnitz/') ? seiteMit(items, 'Chemnitz') : seiteMit(items)), cfg: nurMarkt('rewe'), jetzt: JETZT, zustand: {} });
  assert.equal(r.datei.standort, 'Chemnitz');
  assert.deepEqual(r.kurz.top.map(x => [x.titel, x.ab || null]), [['Storck Knoppers Nussriegel', null], ['Lorenz Crunchips', '2026-11-15T23:00:00.000Z']]);
});
