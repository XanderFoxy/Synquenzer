// Merkliste mit Produkten (Musiker 22.11.2026: „Produkte auswählen und in eine Merkliste legen … wenn ein gemerktes Produkt
// ab Montag oder ab Freitag im Angebot ist, am Start-Tag morgens eine Benachrichtigung ‚Heute ab: …, bis …, Markt, Preis' –
// nicht vorher, nicht jeden Tag“). Seite -> ntfy-Thema { worte: [...] } -> Radar sucht die Produkte (Stichwortseite, alle
// Angebote der Döbelner Prospekte, auch ohne Rabatt) -> knaller.json merkTreffer -> Erinnerung am Start-Tag 7–12 Uhr.
// Fixtures: knaller/aldi-doebeln-1611.html + stichwort-crunchips-1611.html (echt, Roh-Lauf 43818792502); Angebote mit
// „TESTWERT“ bzw. aus stichwortSeite() sind ausgedacht (Felder wie echt).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import knaller from '../module/knaller.mjs';
import { leseMerkNachrichten, merkWort, merkWorte, wortPasst, holeMerkliste, faelligeErinnerungen, erinnerungNachricht, verbucheErinnerung, wortNeu, MERK_WORTE_MAX } from '../lib/merken.mjs';
import { faelligkeit } from '../faellig.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures', 'knaller');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const MAERKTE = cfg.module.knaller.maerkte;
const JETZT = new Date('2026-11-16T08:30:00Z'); // Mo 09:30 Berlin
const ALDI_PROSPEKT = '6c21c979-269e-4bc0-b537-5bbb1a51b90e';
const lies = f => readFile(join(FX, f), 'utf8');
const nbsp = s => String(s).replace(/[  ]/g, ' ');
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
const stichwortSeite = items => `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { pageInformation: { location: { cityDisplayName: 'Berlin' }, offers: { main: { items, totalItems: items.length } } } } } })}</script>`;
const angebotRoh = (id, publisherName, prospekt, title, preise, extra = {}) => ({
  type: 'OFFER', id, publisherName, brand: extra.brand || '', title, description: extra.description || '',
  validFrom: extra.validFrom || '2026-11-15T23:00:00.000+0000', validUntil: extra.validUntil || '2026-11-21T22:00:00.000+0000', parentContent: { id: prospekt, type: 'static_brochure' },
  offerImages: { url: { normal: `https://content-media.bonial.biz/${id}/${id}.jpg?impolicy=SEO-offer-normal` } },
  prices: { mainPrice: preise[0], secondaryPrice: preise[1] ?? 0, secondaryPriceIsUVP: preise[2] ?? false, priceRange: false, conditions: [{}] },
});
const T = Date.parse('2026-11-22T10:00:00Z') / 1000; // Zeit der ntfy-Nachricht (Sekunden)
const ndjson = nachrichten => nachrichten.map(([id, time, d]) => JSON.stringify({ id, time, event: 'message', topic: 't', message: JSON.stringify(d) })).join('\n');

test('Produkte von der Seite: streng gelesen (Zeichen, Länge, doppelt, höchstens 12), „seit“ nie nach der Nachricht', () => {
  assert.deepEqual(merkWort({ w: '  Ben & Jerry’s  ', sorte: 'Cookie Dough, Chocolate Fudge Brownie', seit: '2026-11-21T10:00:00Z' }),
    { w: 'Ben & Jerry’s', sorte: 'Cookie Dough, Chocolate Fudge Brownie', seit: '2026-11-21T10:00:00.000Z' });
  assert.deepEqual(merkWort({ w: '<script>Haribo</script>' }), { w: 'script Haribo /script', sorte: '', seit: null }, 'Spitze Klammern weg');
  assert.equal(merkWort({ w: 'x' }), null, 'zu kurz');
  assert.equal(merkWort({ w: '12' }), null, 'ohne Buchstaben');
  assert.equal(merkWort('Crunchips'), null, 'kein Objekt');
  assert.equal(merkWort({ w: 'A'.repeat(80) }).w.length, 40);
  const viele = Array.from({ length: 20 }, (_, i) => ({ w: `Produkt ${i}` }));
  assert.equal(merkWorte([{ w: 'Crunchips' }, { w: 'crunchips ' }, ...viele]).length, MERK_WORTE_MAX, 'doppelt (Groß/klein) einmal, höchstens 12');
  // Satz in zwei Teilen: worte stehen im ersten Teil; seit in der Zukunft (Handy-Uhr) -> Zeit der Nachricht
  const n = leseMerkNachrichten(ndjson([
    ['t1', T, { v: 1, satz: 'x1', teil: 1, von: 2, merken: [], worte: [{ w: 'Crunchips', seit: '2030-01-01T00:00:00Z' }, { w: 'Haribo XXL', sorte: 'Goldbären', seit: '2026-11-21T10:00:00Z' }] }],
    ['t2', T + 1, { v: 1, satz: 'x1', teil: 2, von: 2, merken: [{ id: 'kd:a', titel: 'A', markt: 'lidl' }] }],
  ]));
  assert.deepEqual(n.worte.map(x => [x.w, x.sorte, x.seit]), [['Crunchips', '', new Date(T * 1000).toISOString()], ['Haribo XXL', 'Goldbären', '2026-11-21T10:00:00.000Z']]);
  assert.equal(n.liste.length, 1);
  // ältere Seite (ohne worte) -> undefined (Radar behält die letzte Wortliste)
  assert.equal(leseMerkNachrichten(ndjson([['t3', T, { v: 1, merken: [] }]])).worte, undefined);
});

test('holeMerkliste: Wörter in zustand.knaller.merkWorte, ohne „worte“ bleibt die Liste, „worte: []“ vergisst', async () => {
  const zustand = {};
  const hole = text => async () => text;
  const st = await holeMerkliste({ holeText: hole(ndjson([['a1', T, { v: 1, merken: [], worte: [{ w: 'Crunchips', seit: '2026-11-21T10:00:00Z' }] }]])), cfg, zustand, jetzt: JETZT });
  assert.deepEqual(st, { neu: true, anzahl: 0, worte: 1 });
  assert.deepEqual(zustand.knaller.merkWorte.map(x => x.w), ['Crunchips']);
  await holeMerkliste({ holeText: hole(ndjson([['a2', T + 100, { v: 1, merken: [] }]])), cfg, zustand, jetzt: JETZT });
  assert.deepEqual(zustand.knaller.merkWorte.map(x => x.w), ['Crunchips'], 'alte Seite ohne worte: Liste bleibt');
  await holeMerkliste({ holeText: hole(ndjson([['a3', T + 200, { v: 1, merken: [], worte: [] }]])), cfg, zustand, jetzt: JETZT });
  assert.equal(zustand.knaller.merkWorte, undefined, 'leere Liste = alles vergessen');
});

test('wortPasst: alle Teile des Produkts, Umlaute/Zeichen egal; Sorte ja / „versch. Sorten“ = prüfen / andere Sorte = nein', () => {
  const bj = { w: 'Ben & Jerry’s', sorte: '' };
  assert.deepEqual(wortPasst("BEN & JERRY'S Eiscreme 465 ml", bj), { sorte: '' });
  assert.deepEqual(wortPasst('Ben&Jerrys Eis', bj), { sorte: '' });
  assert.equal(wortPasst('Jerry Eis', bj), null);
  const haribo = { w: 'Haribo XXL', sorte: 'Goldbären, Color-Rado' };
  assert.deepEqual(wortPasst('HARIBO Goldbären XXL 1 kg', haribo), { sorte: 'ja' });
  assert.deepEqual(wortPasst('Haribo Color-Rado XXL', haribo), { sorte: 'ja' });
  assert.deepEqual(wortPasst('HARIBO Fruchtgummi XXL · versch. Sorten, je 1-kg-Btl.', haribo), { sorte: 'pruefen' });
  assert.equal(wortPasst('HARIBO Phantasia XXL 1 kg', haribo), null, 'andere Sorte genannt -> kein Treffer');
  assert.equal(wortPasst('HARIBO Goldbären 175 g', haribo), null, 'ohne XXL');
  assert.deepEqual(wortPasst('Lorenz Crunchips Paprika', { w: 'Crunchips', sorte: 'Paprika oder Salted' }), { sorte: 'ja' });
});

test('wortPasst an Wortgrenzen (Prüfer 22.11.2026): echte Titel aus knaller.json vom 22.11. – „Eis“ ist kein „Rundreise“', () => {
  const ja = (w, text) => assert.ok(wortPasst(text, { w, sorte: '' }), `${w} soll treffen: ${text}`);
  const nein = (w, text) => assert.equal(wortPasst(text, { w, sorte: '' }), null, `${w} soll NICHT treffen: ${text}`);
  // echt (knaller.json 22.11.): Titel | Info
  ja('Eis', 'Magnum Stieleis tiefgekühlt, versch. Sorten 255 ml – 270 ml 3 Stück');
  ja('Eis', 'Mars Eisriegel Versch. Sorten, z. B. Mars oder Snickers, 248 ml bzw. 252 ml');
  nein('Eis', 'Tunesien Rundreise & Baden 15-tägige Reise inkl. Flug, 4- & 5-Sterne-Hotels');
  nein('Eis', 'CHEF CUISINE Gusseiserner Bräter Oval 3-lagig emailliert');
  nein('Eis', 'Brita Wasserfilter-Kanne Modell „Marella“. Extrafeines Netzgewebe. Leistungsstarke Ionentauscher');
  nein('Eis', 'LUPILU Tischspiel Mini-Pool-Billard Für 2 Spieler. Teilweise inkl. Batterien.');
  nein('Eis', 'Coca Cola Eiswürfelmaker mit Tragegriff Mit 2 verschiedenen Eiswürfelgrößen');
  nein('Cola', 'Ehrmann High Protein Pudding mit Topping Chocolate 200-g-Becher');
  ja('Cola', 'Coca-Cola, Fanta, Sprite oder Mezzo Mix versch. Sorten');
  nein('Wein', 'Minutensteaks Frisch, aus dem Schweinerücken, zum Braten oder für den Grill');
  ja('Wein', 'Muscat von Samos PDO Samos/Griechenland Likörwein, süß je 6x 0,75 l');
  nein('Tee', 'Beste Ernte Pfirsiche halbe Frucht, leicht gezuckert');
  nein('Tee', 'Teelichte Brenndauer: je ca. 4 Stunden. 100er Pack');
  ja('Chips', 'FUNNY-FRISCH Chipsfrisch XXL Versch. Sorten. je 215 g');
  // ausgedacht: typische Prospekt-Wörter
  for (const t of ['Langnese Eiscreme', 'Speiseeis Vanille', 'Erdbeereis 1 l', 'Wassereis 10 Stück', 'Eis am Stiel', 'Softeis-Mix']) ja('Eis', t);
  for (const t of ['Aktionspreis 1,99', 'Milchreis Schoko', 'Basmatireis 1 kg', 'Eiskratzer mit Handschuh', 'Eiszapfen-Lichterkette', 'Hinweis: solange Vorrat reicht', 'Eisenpfanne', 'Eistee Pfirsich']) nein('Eis', t);
  for (const t of ['Glühwein 1 l', 'Rotweine aus Italien', 'Weißwein trocken']) ja('Wein', t);
  for (const t of ['Wildschwein-Gulasch', 'Hackfleisch gemischt (Schwein/Rind)', 'Schweinefilet']) nein('Wein', t);
  ja('Tee', 'Früchtetee 20 Beutel'); ja('Tee', 'Eistee Pfirsich'); nein('Tee', 'Frottee-Handtuch');
  ja('Ei', 'Bio-Eier Größe M'); nein('Ei', 'Bäckerei-Brötchen'); nein('Ei', 'Weihnachtsmann');
  nein('Reis', 'Städtereise Prag'); ja('Reis', 'Langkornreis 1 kg'); nein('Rum', 'Einkaufszentrum'); nein('Gin', 'Original Thüringer');
  // Leerzeichen egal, aber nur ganze Wörter über die Grenze
  ja('Ben&Jerrys', "BEN & JERRY'S Eiscreme"); ja('Coca Cola', 'Coca-Cola Zero'); ja('CocaCola', 'Coca-Cola Zero'); ja('Chips frisch', 'funny-frisch Chipsfrisch');
  // Sorte an Wortgrenzen: „Salted“ ist nicht „Salt“, Vanille trifft auch Vanilleeis
  assert.deepEqual(wortPasst('Magnum Vanilleeis', { w: 'Magnum', sorte: 'Vanille' }), { sorte: 'ja' });
  assert.equal(wortPasst('Magnum Mandel', { w: 'Magnum', sorte: 'Man' }), null);
});

test('Knaller: gemerkte Produkte immer als Stichwort, Treffer auch ohne Rabatt (merkTreffer), Knaller tragen merkwort', async () => {
  // ausgedacht: im Döbelner Aldi-Prospekt Ben & Jerry's ohne Vergleichspreis (kein Knaller) und Haribo ab Fr 20.11.
  const bj = stichwortSeite([angebotRoh('TESTWERT-bj', 'ALDI Nord', ALDI_PROSPEKT, "BEN & JERRY'S Eiscreme", [3.99], { description: 'versch. Sorten, je 465 ml' })]);
  const hb = stichwortSeite([angebotRoh('TESTWERT-hb', 'ALDI Nord', ALDI_PROSPEKT, 'HARIBO Goldbären XXL', [2.79, 3.99, false], { validFrom: '2026-11-19T23:00:00.000+0000' })]);
  const c = nur(['aldi-nord'], { stichworte: ['A'], maxStichwortSeiten: 1 });
  const zustand = { knaller: { merkWorte: [
    { w: 'Crunchips', sorte: '', seit: '2026-11-14T10:00:00.000Z' },
    { w: "Ben & Jerry's", sorte: 'Cookie Dough', seit: '2026-11-14T10:00:00.000Z' },
    { w: 'Haribo XXL', sorte: 'Goldbären', seit: '2026-11-14T10:00:00.000Z' },
  ] } };
  const hole = abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', '/Angebote/Ben-Jerrys': bj, '/Angebote/Haribo-XXL': hb, '/Angebote/A': stichwortSeite([]) });
  const r = await knaller({ holeText: hole, cfg: c, jetzt: JETZT, zustand });
  // die drei Produkte zuerst, dann ein Begriff der Liste
  assert.deepEqual(hole.log.filter(u => u.includes('/Angebote/')).map(u => u.split('/').pop()), ['Crunchips', 'Ben-Jerrys', 'Haribo-XXL', 'A']);
  const t = r.datei.merkTreffer;
  assert.deepEqual(t.map(a => [a.titel, a.wort, a.sorte ?? '', a.pct ?? null]), [
    ['Lorenz Crunchips', 'Crunchips', '', 50],
    ["BEN & JERRY'S Eiscreme", "Ben & Jerry's", 'pruefen', null],
    ['HARIBO Goldbären XXL', 'Haribo XXL', 'ja', 30],
  ], 'die nächsten zuerst (gültig ab Mo, dann ab Fr)');
  assert.ok(!r.datei.angebote.some(a => /JERRY/.test(a.titel)), 'ohne Vergleichspreis kein Knaller');
  assert.equal(r.datei.angebote.find(a => /Crunchips/.test(a.titel)).merkwort, 'Crunchips');
  assert.ok(t.every(a => !('_seit' in a) && !('_marke' in a)), 'keine internen Felder in der Datei');
  assert.deepEqual(r.datei.merkWorte.map(x => x.w), ['Crunchips', "Ben & Jerry's", 'Haribo XXL']);
  // Zustand für die Erinnerung: mit seit des Worts
  assert.deepEqual(zustand.knaller.merkRadar.map(x => [x.titel, x.seit]), t.map(a => [a.titel, '2026-11-14T10:00:00.000Z']));
  assert.equal(zustand.knaller.worteLauf, JETZT.toISOString());
  // Start-Kachel: die nächsten Treffer mit Marktname und ab
  assert.deepEqual(r.kurz.merk.map(x => [x.titel, x.markt, x.ab]), [
    ['Lorenz Crunchips', 'Aldi Nord', '2026-11-15T23:00:00.000Z'], ["BEN & JERRY'S Eiscreme", 'Aldi Nord', '2026-11-15T23:00:00.000Z'], ['HARIBO Goldbären XXL', 'Aldi Nord', '2026-11-19T23:00:00.000Z'],
  ]);
  // nächster Lauf: Stichwortseite Ben & Jerry's leer -> der Treffer bleibt aus der letzten Datei (Pool), solange er gilt
  const hole2 = abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', '/Angebote/Ben-Jerrys': stichwortSeite([]), '/Angebote/Haribo-XXL': hb, '/Angebote/A': stichwortSeite([]) });
  const r2 = await knaller({ holeText: hole2, cfg: c, jetzt: new Date(JETZT.getTime() + 6 * 3600e3), zustand, vorherDatei: r.datei });
  assert.ok(r2.datei.merkTreffer.some(a => /JERRY/.test(a.titel)), 'Treffer der letzten Datei bleibt');
  // sichtbar (seit wann die Seite den Treffer zeigen konnte): erster Lauf ohne letzte Datei = jetzt, danach bleibt es
  assert.ok(zustand.knaller.merkRadar.every(x => x.sichtbar === JETZT.toISOString()), 'sichtbar bleibt vom ersten Lauf');
  // Wort vergessen -> kein Treffer mehr, merkRadar weg
  zustand.knaller.merkWorte = [];
  const r3 = await knaller({ holeText: abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/A': stichwortSeite([]) }), cfg: c, jetzt: JETZT, zustand, vorherDatei: r.datei });
  assert.equal(r3.datei.merkTreffer, undefined);
  assert.equal(zustand.knaller.merkRadar, undefined);
  assert.equal(r3.kurz.merk, undefined);
});

// Erinnerung am Start-Tag – Zustand wie nach einem Knaller-Lauf
const ABMO = '2026-11-22T23:00:00.000Z'; // Mo 23.11. 00:00 Berlin
const BISSA = '2026-11-28T22:59:59.000Z';
const ABFR = '2026-11-26T23:00:00.000Z'; // Fr 27.11.
const treffer = (id, titel, ab, extra = {}) => ({ id, titel, markt: 'aldi-nord', preis: 0.99, vorher: 1.99, pct: 50, ab, bis: BISSA, wort: 'Crunchips', seit: '2026-11-21T10:00:00.000Z', ...extra });
const um = iso => new Date(iso);
const WORT = (w, seit = '2026-11-21T10:00:00.000Z', sorte = '') => ({ w, sorte, seit }); // gemerkt Sa 21.11. 11:00
const NAMEN = { 'aldi-nord': 'Aldi Nord', lidl: 'Lidl' };

test('Erinnerung genau am Start-Tag morgens: nicht vorher, nicht jeden Tag, Fenster 7–12 Uhr, verpasst -> nächster Morgen', () => {
  const zustand = { knaller: { merkWorte: [WORT('Crunchips'), WORT('Ben & Jerry’s')], merkRadar: [treffer('kd:mo', 'Lorenz Crunchips', ABMO), treffer('kd:fr', 'Ben & Jerry’s Eis', ABFR, { wort: 'Ben & Jerry’s', pct: null, vorher: null, preis: 2.22, markt: 'lidl' })] } };
  const f = j => faelligeErinnerungen({ zustand, cfg, jetzt: um(j) }).map(a => a.id);
  assert.deepEqual(f('2026-11-22T09:00:00Z'), [], 'So: noch nicht dran');
  assert.deepEqual(f('2026-11-23T05:59:00Z'), [], 'Mo 06:59: zu früh');
  assert.deepEqual(f('2026-11-23T06:05:00Z'), ['kd:mo'], 'Mo 07:05: Crunchips (ab Mo), Ben & Jerry’s (ab Fr) nicht');
  assert.deepEqual(f('2026-11-23T11:30:00Z'), [], 'Mo 12:30: nicht mehr am Nachmittag');
  const liste = faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-23T06:05:00Z') });
  const msg = erinnerungNachricht(liste, cfg, NAMEN);
  assert.equal(msg.title, 'Heute ab: Lorenz Crunchips');
  assert.equal(nbsp(msg.message), 'bis Sa 28.11., Aldi Nord, 0,99 € statt 1,99 € (−50 %)');
  assert.equal(msg.click, 'https://xanderfoxy.github.io/Synquenzer/mein-vorteil/#woche');
  verbucheErinnerung(zustand, liste, um('2026-11-23T06:05:00Z'));
  assert.deepEqual(f('2026-11-24T06:05:00Z'), [], 'Di: nicht noch einmal');
  // Fr 27.11.: Ben & Jerry's (ohne Rabatt) – Radar lief am Freitag nicht -> Sa 07:xx „Seit Fr 27.11.“
  assert.deepEqual(f('2026-11-27T06:05:00Z'), ['kd:fr']);
  const sa = faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-28T06:20:00Z') });
  const m2 = erinnerungNachricht(sa, cfg, NAMEN);
  assert.equal(m2.title, 'Seit Fr 27.11.: Ben & Jerry’s Eis');
  assert.equal(nbsp(m2.message), 'bis Sa 28.11., Lidl, 2,22 €');
  verbucheErinnerung(zustand, sa, um('2026-11-28T06:20:00Z'));
  assert.deepEqual(f('2026-11-28T08:00:00Z'), []);
  assert.deepEqual(f('2026-11-29T06:05:00Z'), [], 'abgelaufen');
});

test('Erinnerung: Wort-Treffer, der schon vor dem Merken lief, nie; ferne Märkte nie; Haken auf laufendes Angebot einmal', () => {
  const zustand = { knaller: {
    merkWorte: [WORT('Crunchips', '2026-11-25T18:00:00.000Z')],
    merkRadar: [
      treffer('kd:alt', 'Lorenz Crunchips', ABMO, { seit: '2026-11-25T18:00:00.000Z' }), // Wort Mi gemerkt, Angebot seit Mo
      treffer('kd:fern', 'Crunchips bei REWE', ABMO, { markt: 'rewe', fern: true }),
    ],
    merken: [{ id: 'kd:haken', titel: 'Pringles', markt: 'lidl', preis: 1.49, vorher: 2.49, pct: 40, ab: ABMO, bis: BISSA, gemerkt: '2026-11-25T19:00:00.000Z' }],
  } };
  const liste = faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-26T06:05:00Z') });
  assert.deepEqual(liste.map(a => a.id), ['kd:haken'], 'nur der Haken (ausdrücklich gemerkt), einmal am nächsten Morgen');
  assert.equal(nbsp(erinnerungNachricht(liste, cfg, NAMEN).title), 'Seit Mo 23.11.: Pringles');
});

test('Mehrere fällig: eine Nachricht, je Zeile „Heute ab: …, bis …, Markt, Preis“, Sorte prüfen', () => {
  const zustand = { knaller: { merkWorte: [WORT('Crunchips'), WORT('Haribo XXL')], merkRadar: [
    treffer('kd:1', 'Lorenz Crunchips', ABMO),
    treffer('kd:2', 'HARIBO Fruchtgummi XXL', ABMO, { wort: 'Haribo XXL', sorte: 'pruefen', preis: 2.49, vorher: null, pct: null, markt: 'lidl' }),
  ] } };
  const liste = faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-23T06:05:00Z') });
  const msg = erinnerungNachricht(liste, cfg, NAMEN);
  assert.equal(msg.title, 'Heute ab: 2 gemerkte Angebote');
  assert.deepEqual(nbsp(msg.message).split('\n'), [
    '• Heute ab: Lorenz Crunchips, bis Sa 28.11., Aldi Nord, 0,99 € statt 1,99 € (−50 %)',
    '• Heute ab: HARIBO Fruchtgummi XXL, bis Sa 28.11., Lidl, 2,49 € – Sorte im Markt prüfen',
  ]);
});

test('Vergessenes Produkt (×): kein Push mehr, auch wenn merkRadar vom letzten Knaller-Lauf es noch nennt (Prüfer 22.11.2026)', async () => {
  // Stand nach dem Knaller-Lauf So: Magnum gemerkt, Treffer ab Mo im merkRadar
  const mo = treffer('kd:magnum', 'Magnum Stieleis', ABMO, { wort: 'Magnum', seit: '2026-11-22T09:30:00.000Z' });
  const zustand = { knaller: { merkWorte: [WORT('Magnum', '2026-11-22T09:30:00.000Z')], worteLauf: '2026-11-23T03:00:00.000Z', merkRadar: [mo], merken: [], merkStand: '2026-11-22T09:30:00.000Z' } };
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-23T06:05:00Z') }).map(a => a.id), ['kd:magnum'], 'gemerkt: Mo 07:05 Push');
  // Mo 06:00 Berlin: × Magnum -> die Seite schickt worte: []
  const msg = ndjson([['n1', Date.parse('2026-11-23T05:00:00Z') / 1000, { v: 1, satz: 'abc', teil: 1, von: 1, merken: [], worte: [] }]]);
  await holeMerkliste({ holeText: async () => msg, cfg, zustand, jetzt: um('2026-11-23T05:10:00Z') });
  assert.equal(zustand.knaller.merkWorte, undefined);
  assert.equal(zustand.knaller.merkRadar.length, 1, 'merkRadar bleibt bis zum nächsten Knaller-Lauf');
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg, jetzt: um('2026-11-23T06:05:00Z') }), [], 'vergessen: kein Push');
  // dasselbe Produkt aus den merkworten der config zählt weiter (seit = null)
  const c2 = { ...cfg, module: { ...cfg.module, knaller: { ...cfg.module.knaller, merkworte: ['Magnum'] } } };
  assert.deepEqual(faelligeErinnerungen({ zustand, cfg: c2, jetzt: um('2026-11-23T06:05:00Z') }).map(a => a.id), ['kd:magnum']);
  // Treffer nach der alten Regel (Wortteil): mit frischen Daten (Info) geprüft -> kein Push
  const z2 = { knaller: { merkWorte: [WORT('Eis')], merkRadar: [treffer('kd:reise', 'Tunesien Rundreise & Baden', ABMO, { wort: 'Eis' })] } };
  const frisch = [{ id: 'kd:reise', titel: 'Tunesien Rundreise & Baden', info: '15-tägige Reise inkl. Flug', markt: 'lidl', preis: 899, gueltigAb: ABMO, gueltigBis: BISSA }];
  assert.deepEqual(faelligeErinnerungen({ zustand: z2, cfg, jetzt: um('2026-11-23T06:05:00Z'), angebote: frisch }), []);
});

test('„Lief schon beim Merken“ nach Uhrzeit: Angebot ab Mo 00:00, gemerkt Mo 06:00 oder 13:00 -> kein Push; So gemerkt -> Mo „Heute ab“', () => {
  const f = (seit, j) => faelligeErinnerungen({ zustand: { knaller: { merkWorte: [WORT('Crunchips', seit)], merkRadar: [treffer('kd:mo', 'Lorenz Crunchips', ABMO, { seit })] } }, cfg, jetzt: um(j) }).map(a => a.id);
  assert.deepEqual(f('2026-11-23T05:00:00.000Z', '2026-11-23T06:05:00Z'), [], 'Mo 06:00 gemerkt (stand unter „Heute“): nicht sofort „Heute ab“');
  assert.deepEqual(f('2026-11-23T12:00:00.000Z', '2026-11-24T06:05:00Z'), [], 'Mo 13:00 gemerkt: am Di kein „Seit Mo …“');
  assert.deepEqual(f('2026-11-22T21:30:00.000Z', '2026-11-23T06:05:00Z'), ['kd:mo'], 'So 22:30 gemerkt: Mo 07:05 „Heute ab“');
  // erst NACH dem Merken gefunden (Stichwortseite des neuen Produkts, die Seite konnte es nicht zeigen) -> Push wie sonst
  const spaet = j => faelligeErinnerungen({ zustand: { knaller: { merkWorte: [WORT('Crunchips', '2026-11-23T05:00:00.000Z')], merkRadar: [treffer('kd:mo', 'Lorenz Crunchips', ABMO, { seit: '2026-11-23T05:00:00.000Z', sichtbar: '2026-11-23T05:05:00.000Z' })] } }, cfg, jetzt: um(j) });
  assert.equal(erinnerungNachricht(spaet('2026-11-23T06:05:00Z'), cfg, NAMEN).title, 'Heute ab: Lorenz Crunchips');
  assert.deepEqual(faelligeErinnerungen({ zustand: { knaller: { merkWorte: [WORT('Crunchips', '2026-11-23T05:00:00.000Z')], merkRadar: [treffer('kd:mo', 'Lorenz Crunchips', ABMO, { seit: '2026-11-23T05:00:00.000Z', sichtbar: '2026-11-22T23:30:00.000Z' })] } }, cfg, jetzt: um('2026-11-23T06:05:00Z') }), [], 'stand schon auf der Seite: nein');
  // Haken auf ein laufendes Angebot bleibt ausdrücklich: einmal am nächsten Morgen
  const z = { knaller: { merken: [{ id: 'kd:h', titel: 'Pringles', markt: 'lidl', preis: 1.49, ab: ABMO, bis: BISSA, gemerkt: '2026-11-23T12:00:00.000Z' }] } };
  assert.deepEqual(faelligeErinnerungen({ zustand: z, cfg, jetzt: um('2026-11-24T06:05:00Z') }).map(a => a.id), ['kd:h']);
});

test('Dauer-Angebot (19.10.–24.12.): genau ein Push, auch nach 30 Tagen und einem Push zu einem anderen Angebot (Prüfer 22.11.2026)', () => {
  const lang = { id: 'kd:puzzle', titel: 'Clementoni Puzzle', markt: 'lidl', preis: 9.99, vorher: null, pct: null, ab: '2026-10-18T22:00:00.000Z', bis: '2026-12-24T22:00:00.000Z' };
  for (const [name, zk] of [
    ['Produkt', { merkWorte: [WORT('Puzzle', '2026-10-01T10:00:00.000Z'), WORT('Crunchips')], merkRadar: [{ ...lang, wort: 'Puzzle', seit: '2026-10-01T10:00:00.000Z' }, treffer('kd:chips', 'Lorenz Crunchips', ABMO)] }],
    ['Haken', { merken: [lang, { ...treffer('kd:chips', 'Lorenz Crunchips', ABMO), wort: undefined, seit: undefined }] }],
  ]) {
    const zustand = { knaller: zk };
    const pushes = [];
    for (let t = Date.parse('2026-10-17T00:00:00Z'); t < Date.parse('2026-11-26T00:00:00Z'); t += 30 * 60e3) {
      const l = faelligeErinnerungen({ zustand, cfg, jetzt: new Date(t) });
      if (l.length) { pushes.push(`${new Date(t).toISOString().slice(0, 16)} ${l.map(a => a.id).join(',')}`); verbucheErinnerung(zustand, l, new Date(t)); }
    }
    assert.deepEqual(pushes, ['2026-10-19T05:00 kd:puzzle', '2026-11-23T06:00 kd:chips'], name); // 07:00 Berlin (Sommer-/Winterzeit)
    assert.ok(zustand.knaller.erinnert['kd:puzzle'], `${name}: Vermerk bleibt, solange das Angebot gilt`);
    // nach dem Ende (und 30 Tagen) räumt der nächste Push den Vermerk auf
    verbucheErinnerung(zustand, [], new Date('2026-12-26T06:00:00Z'));
    assert.equal(zustand.knaller.erinnert['kd:puzzle'], undefined, `${name}: abgelaufen -> weg`);
  }
});

test('Neu gemerktes Produkt: Knaller sofort dran (Vorprüfung), danach normaler Takt; nicht während eines Neuversuchs', () => {
  const lauf = Object.fromEntries(Object.keys(cfg.module).map(k => [k, '2026-11-23T08:00:00Z']));
  const z = { gemeldet: {}, lauf, knaller: { worteLauf: '2026-11-23T08:00:00.000Z', merkWorte: [{ w: 'Crunchips', sorte: '', seit: '2026-11-23T07:00:00.000Z' }] } };
  const jetzt = um('2026-11-23T08:20:00Z');
  assert.equal(wortNeu(cfg, z, jetzt.getTime()), false, 'schon gesucht');
  assert.ok(!faelligkeit(cfg, z, jetzt).module.includes('knaller'));
  z.knaller.merkWorte.push({ w: 'Haribo XXL', sorte: '', seit: '2026-11-23T08:10:00.000Z' });
  assert.equal(wortNeu(cfg, z, jetzt.getTime()), true);
  assert.ok(faelligkeit(cfg, z, jetzt).module.includes('knaller'), 'neues Produkt -> Knaller gleich');
  z.neuversuch = { knaller: { n: 1, ab: '2026-11-23T11:00:00.000Z' } };
  assert.equal(wortNeu(cfg, z, jetzt.getTime()), false, 'Quelle gestört: nicht alle paar Minuten');
});

test('main.lauf: neues Produkt aus dem ntfy-Thema -> Knaller läuft im selben Lauf (außer Takt), Treffer in der Datei', async () => {
  const { lauf } = await import('../main.mjs');
  const c = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'knaller', ...(k === 'knaller' ? { maerkte: MAERKTE.filter(m => m.id === 'aldi-nord'), stichworte: [], marktguru: null } : {}) }])) };
  const merk = ndjson([['abc1', Date.parse('2026-11-16T08:05:00Z') / 1000, { v: 1, satz: 's1', teil: 1, von: 1, merken: [], worte: [{ w: 'Crunchips', seit: '2026-11-16T08:00:00Z' }] }]]);
  const hole = abruf({ '/Doebeln/ALDI-Nord/p-r43': 'aldi-doebeln-1611.html', '/Angebote/Crunchips': 'stichwort-crunchips-1611.html', 'ntfy.sh/': merk });
  // Knaller lief vor 1 h (Takt 6 h) – ohne neues Produkt wäre er nicht dran
  const zustand = { gemeldet: {}, lauf: { knaller: '2026-11-16T07:30:00.000Z' } };
  const r = await lauf({ cfg: c, wunschliste: {}, vorher: null, zustand, holeText: hole, jetzt: JETZT, alle: false });
  assert.ok(r.dateien.knaller, 'Knaller ist gelaufen');
  assert.deepEqual(r.dateien.knaller.merkTreffer.map(a => a.titel), ['Lorenz Crunchips']);
  assert.deepEqual(r.aktuell.status.knaller.merken, { neu: true, anzahl: 0, worte: 1 });
  // Crunchips gilt seit Mo 16.11. (heute), Wort gemerkt Mo 08:00 UTC -> Erinnerung „Heute ab“ in diesem Lauf
  assert.equal(r.erinnerung?.msg.title, 'Heute ab: Lorenz Crunchips');
  assert.deepEqual(r.aktuell.status.knaller.kurz.merk.map(x => x.titel), ['Lorenz Crunchips']);
});
