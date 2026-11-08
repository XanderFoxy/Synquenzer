// Echter Roh-Lauf vom 08.11.2026 01:49 (GitHub-Lauf 42435894704), Antworten unverändert unter fixtures/echt-0811/:
//  1. Tribute-/Party-Shows zählten als echte Konzerte („Strangelove – The DEPECHE MODE Experience“, „Remode – The Music of
//     Depeche Mode“, „Depeche Mode on piano – played by Thilo“, „Depeche Mode … Party“, „Silverblue Joyriders – Songs by
//     Roxette“ …) – 33 der 39 Termine (27 × Depeche Mode, 6 × Roxette), alle 8 gesendeten Pushes falsch.
//  2. „Control Room – Gast – Marian Gold (Alphaville)“ (Gesprächsabend, keine Künstlerangabe) war Alphavilles „nächster Termin“.
// Regel jetzt (lib.mjs auftrittZuordnung): Künstlerangabe exakt; ohne sie nur „Band …“ ohne Tribute-/Party-/Gast-Wörter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auftrittZuordnung, nachgespielt, erwaehntEcht } from '../lib.mjs';
import eventim, { evParse, evUrl } from '../sources/eventim.mjs';
import { tmParse } from '../sources/ticketmaster.mjs';
import mbevents from '../sources/mbevents.mjs';
import { seiteTreffer } from '../sources/seiten.mjs';
import { koordinaten } from '../geo.mjs';
import { lauf } from '../run.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ECHT = path.join(HIER, 'fixtures', 'echt-0811');
const INDEX = JSON.parse(fs.readFileSync(path.join(ECHT, 'index.json'), 'utf8'));
const lies = datei => JSON.parse(fs.readFileSync(path.join(ECHT, datei), 'utf8'));
const BANDS = JSON.parse(fs.readFileSync(path.join(HIER, '..', '..', 'artists.json'), 'utf8')).bands.filter(b => b.aktiv !== false);
const band = n => BANDS.find(b => b.name === n);
const STAND = new Date('2026-11-08T01:49:28.032Z'); // Zeitpunkt des echten Laufs
const evDatei = name => INDEX.abrufe.find(a => a.url === evUrl(band(name))).datei;

/** Gibt genau die aufgezeichneten Antworten zurück (URL wie im echten Lauf); alles andere = Fehler wie ohne Netz. */
function wiederholung({ kaputt = [] } = {}) {
  const map = new Map(INDEX.abrufe.filter(a => a.status === 200 && a.datei).map(a => [a.url, a.datei]));
  const abrufe = [];
  return {
    abrufe,
    get: async url => {
      abrufe.push(url);
      if (kaputt.some(k => url.includes(k))) throw new Error('HTTP 503 public-api.eventim.com');
      const d = map.get(url);
      if (!d) throw new Error(`nicht aufgezeichnet: ${url}`);
      return lies(d);
    },
  };
}

async function stumm(fn) {
  const log = console.log; console.log = () => {};
  try { return await fn(); } finally { console.log = log; }
}

test('echt 08.11.: Depeche Mode / Roxette bei Eventim – nur Tribute-, Cover- und Party-Shows -> kein Termin', () => {
  const dm = lies(evDatei('Depeche Mode')), rox = lies(evDatei('Roxette'));
  assert.equal(dm.products.length, 50);
  assert.equal(rox.products.length, 17);
  assert.deepEqual(evParse(dm, band('Depeche Mode')), []);
  assert.deepEqual(evParse(rox, band('Roxette')), []);
  // die acht Pushes des echten Laufs – jede einzelne Show
  for (const n of ['Depeche Mode on piano - played by Thilo', 'Silverblue Joyriders - Songs by Roxette', 'Strangelove - The DEPECHE MODE Experience',
    'Depeche Mode Party mit DJ Tom und Gast DJ Marcus Meyn', 'Depeche Mode & Electro Party By Devote', 'Depeche Mode Church Night']) {
    const p = [...dm.products, ...rox.products].find(x => x.name === n);
    assert.ok(p, n);
    assert.equal(auftrittZuordnung(p.name, p.attractions, band(/roxette/i.test(n) ? 'Roxette' : 'Depeche Mode')), null, n);
  }
});

test('echt 08.11.: Alphaville – Gast-Abend von Marian Gold raus, echte Termine + Festivals (mehrere Künstler) drin', () => {
  const alpha = band('Alphaville');
  const k = evParse(lies(evDatei('Alphaville')), alpha);
  assert.deepEqual(k.map(x => [x.datum, x.stadt, x.festival]), [
    ['2026-12-04', 'Monheim am Rhein', false], // „Alphaville – Live in Concert“
    ['2027-03-06', 'Leipzig', true], //          „80s Super Show“ (8 Künstler, Alphaville dabei)
    ['2027-03-13', 'Hannover', true],
    ['2027-06-15', 'Mainz', false],
    ['2027-07-04', 'Königstein', false], //       „Alphaville – Festung Königstein Open Air“ (Sachsen)
    ['2027-08-20', 'Geldern', false],
    ['2027-09-04', 'Insel Usedom', true], //      „Mega 80er Usedom – mit Dieter Bohlen, Kim Wilde und Alphaville“
  ]);
  assert.ok(k.every(x => x.zuordnung === 'kuenstler'));
  assert.ok(!k.some(x => /Control Room|Marian Gold/.test(x.titel)));
  const koenig = k.find(x => x.stadt === 'Königstein');
  assert.equal(koenig.ort, 'Festung Königstein Sachsen');
  assert.ok(Math.abs(koenig.lat - 50.9042) < 1e-3 && Math.abs(koenig.lon - 14.1292) < 1e-3);
  assert.equal(k.find(x => x.stadt === 'Insel Usedom').plz, '17424');
});

test('echt 08.11.: alle neun Eventim-Antworten mit allen Bands – nur die sieben Alphaville-Termine, sonst nichts', async () => {
  const http = wiederholung();
  const r = await eventim({ http, bands: BANDS, config: {} });
  assert.deepEqual(r.fehler, []);
  assert.equal(http.abrufe.length, 9);
  assert.equal(r.konzerte.length, 7);
  assert.ok(r.konzerte.every(x => x.band === 'Alphaville'));
});

test('echt 08.11.: Gesamtlauf mit den echten Antworten – nächster echter Termin, km richtig, Push nur bis 200 km', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-echt-'));
  const daten = path.join(dir, 'konzerte', 'data');
  fs.mkdirSync(daten, { recursive: true });
  fs.writeFileSync(path.join(daten, 'gesehen.json'), JSON.stringify({ konzerte: {}, releases: {} })); // Folgelauf
  const http = wiederholung();
  const { erg } = await stumm(() => lauf({ env: { DATA_DIR: dir, DRY_RUN: '1' }, http, jetzt: STAND, quellen: [['eventim', eventim]] }));
  const zeile = k => `${k.datum} ${k.stadt} ${k.km}${k.weit ? ' weit' : ''}${k.naechster ? ' naechster' : ''}${k.festival ? ' Festival' : ''}`;
  assert.deepEqual(erg.konzerte.map(zeile), [
    '2026-12-04 Monheim am Rhein 435 weit naechster', // nächster echter Termin (nicht Witten/Control Room)
    '2027-03-06 Leipzig 58 Festival',
    '2027-03-13 Hannover 272 Festival',
    '2027-06-15 Mainz 364',
    '2027-07-04 Königstein 75',
    '2027-09-04 Insel Usedom 323 Festival', // vorher km null (Nominatim kennt „Insel Usedom“ nicht) -> wäre gepusht worden
  ]);
  assert.ok(erg.konzerte.every(k => k.band === 'Alphaville'));
  assert.ok(!erg.konzerte.some(k => k.stadt === 'Geldern'), 'zweiter ferner Termin nicht in der Liste');
  assert.deepEqual(erg.pushes.map(p => p.titel), ['Festival: Alphaville', 'Konzert: Alphaville']);
  assert.match(erg.pushes[0].text, /^06\.03\.2027 18:00 · QUARTERBACK Immobilien ARENA, Leipzig \(58 km\)/);
  assert.match(erg.pushes[1].text, /^04\.07\.2027 19:00 · Festung Königstein Sachsen, Königstein \(75 km\)\nAlphaville - Festung Königstein Open Air/);
  // Nominatim nur für Städte ohne Koordinaten bei Eventim (Monheim, Geldern); Usedom kommt aus der Tabelle
  assert.deepEqual(http.abrufe.filter(u => u.includes('nominatim')).map(u => new URL(u).searchParams.get('city')), ['Monheim am Rhein', 'Geldern']);
});

test('echt 08.11.: nächster Lauf auf dem echten Daten-Stand – alte Tribute-Einträge weg, keine Doppel-Pushes', async () => {
  for (const kaputt of [[], [evUrl(band('Depeche Mode')).split('?')[1]]]) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-stand-'));
    const daten = path.join(dir, 'konzerte', 'data');
    fs.mkdirSync(daten, { recursive: true });
    for (const n of ['konzerte.json', 'gesehen.json', 'geo.json']) fs.copyFileSync(path.join(ECHT, 'ausgabe', n), path.join(daten, n));
    const alt = lies('ausgabe/konzerte.json').konzerte;
    assert.deepEqual(['Depeche Mode', 'Roxette', 'Alphaville'].map(b => alt.filter(k => k.band === b).length), [27, 6, 6]); // Stand nach dem echten Lauf
    const { erg, status } = await stumm(() => lauf({ env: { DATA_DIR: dir, DRY_RUN: '1' }, http: wiederholung({ kaputt }), jetzt: STAND, quellen: [['eventim', eventim]] }));
    // auch wenn Eventim für Depeche Mode ausfällt: die alten Tribute-Termine (ohne „zuordnung“) kommen nicht zurück
    assert.equal(status.eventim.fehler.length, kaputt.length);
    assert.deepEqual([...new Set(erg.konzerte.map(k => k.band))], ['Alphaville']);
    assert.equal(erg.konzerte.length, 6);
    assert.equal(erg.konzerte.find(k => k.stadt === 'Insel Usedom').km, 323, 'gecachtes „nicht gefunden“ blockiert nicht mehr');
    // Leipzig/Königstein/Usedom waren im echten Lauf schon „gesehen“ -> kein zweiter Push; Monheim ist weit -> kein Push
    assert.deepEqual(erg.pushes, []);
  }
});

test('echt 08.11.: dieselben neun Eventim-Antworten OHNE Künstlerangabe – nur echte Alphaville-Titel, kein Fan-Abend', () => {
  // 32 der 159 echten Einträge haben keine Künstlerangabe (Depeche Mode: 12 von 50, z. B. „Depeche Mode Winterlounge“).
  // „Depeche Mode Church Night“ (157 km, im echten Lauf gepusht) und „DEPECHE MODE "FESTIVAL FOR THE MASSES" …“ fielen nur
  // heraus, weil Eventim zufällig „DM Fan Base“ bzw. „Party for the Masses“ mitschickte – ohne sie wären es Pushes gewesen.
  const dm = lies(evDatei('Depeche Mode')), DM = band('Depeche Mode');
  assert.equal(dm.products.filter(p => !(p.attractions || []).length).length, 12);
  const titel = ['Depeche Mode Church Night', 'DEPECHE MODE "FESTIVAL FOR THE MASSES" - Live: BEBORN BETON, MELOTRON, S.P.O.C.K',
    'DEPECHE MODE "FESTIVAL FOR THE MASSES" - Das Festival zum 35jährigen Jubiläum!'];
  for (const n of titel) {
    const p = dm.products.find(x => x.name === n);
    assert.ok(p && p.attractions.length === 1, n); // so im echten Lauf: eine fremde Künstlerangabe
    assert.equal(auftrittZuordnung(n, [], DM), null, n);
    assert.equal(auftrittZuordnung(n, undefined, DM), null, n);
  }
  const nackt = j => ({ ...j, products: j.products.map(({ attractions, ...p }) => p) });
  const treffer = INDEX.abrufe.filter(a => a.url.includes('public-api.eventim.com'))
    .flatMap(a => BANDS.flatMap(b => evParse(nackt(lies(a.datei)), b))).map(k => `${k.band} | ${k.titel} | ${k.stadt} | ${k.zuordnung}`);
  assert.deepEqual(treffer, [
    'Alphaville | Alphaville - Live in Concert | Monheim am Rhein | name',
    'Alphaville | Alphaville | Mainz | name',
    'Alphaville | Alphaville - Festung Königstein Open Air | Königstein | name',
    'Alphaville | Alphaville | Geldern | name',
  ]);
  // „Night“/„Festival“ zählt nur direkt hinter dem Bandnamen, nicht im Tour-Namen nach „ - “
  for (const n of ['Depeche Mode Night', 'Depeche Mode Clubnacht', 'Depeche Mode Festival 2027', 'Depeche Mode Church Night @ Heilig-Kreuz-Kirche'])
    assert.equal(auftrittZuordnung(n, [], DM), null, n);
  assert.equal(auftrittZuordnung('The Human League - Night People Tour', [], band('The Human League')), 'name');
  assert.equal(auftrittZuordnung('Alphaville – Live beim Sommerfestival', [], band('Alphaville')), 'name');
  assert.equal(auftrittZuordnung('Depeche Mode Live 2027', [], DM), 'name');
});

test('Klammer-Regel: „Langname (Kurzname)“ ist die Band selbst, „Mitglied (Band)“ bleibt raus', () => {
  const OMD = band('Orchestral Manoeuvres in the Dark'), AV = band('Alphaville');
  // vorher null trotz exakter Künstlerangabe
  assert.equal(auftrittZuordnung('OMD (Orchestral Manoeuvres in the Dark)', ['Orchestral Manoeuvres in the Dark'], OMD), 'kuenstler');
  assert.equal(auftrittZuordnung('Orchestral Manoeuvres In The Dark (OMD) - Live 2027', ['OMD'], OMD), 'kuenstler');
  assert.equal(auftrittZuordnung('Orchestral Manoeuvres in the Dark (O.M.D.)', [{ name: 'Orchestral Manoeuvres in the Dark' }], OMD), 'kuenstler');
  assert.equal(auftrittZuordnung('OMD (Orchestral Manoeuvres in the Dark)', [], OMD), 'name');
  assert.equal(auftrittZuordnung('Orchestral Manoeuvres In The Dark (OMD) - Live 2027', [], OMD), 'name');
  assert.ok(!nachgespielt('Orchestral Manoeuvres In The Dark (OMD)', OMD));
  // weiterhin raus: Mitglied vor der Klammer, Tribute vor dem Langnamen
  assert.equal(auftrittZuordnung('Control Room - Gast - Marian Gold (Alphaville)', [], AV), null);
  assert.equal(auftrittZuordnung('Marian Gold (Alphaville) – Lesung', ['Alphaville'], AV), null);
  assert.equal(auftrittZuordnung('Andy McCluskey (ex-OMD) DJ-Set', ['OMD'], OMD), null);
  assert.equal(auftrittZuordnung('Paul Humphreys (OMD)', ['OMD'], OMD), null);
  assert.equal(auftrittZuordnung('Tribute to OMD (Orchestral Manoeuvres in the Dark)', ['OMD'], OMD), null);
  // echter Eventim-Titel des Gesprächsabends unverändert raus
  const cr = lies(evDatei('Alphaville')).products.find(p => /Control Room/.test(p.name));
  assert.equal(auftrittZuordnung(cr.name, cr.attractions, AV), null);
});

test('Regel: Künstlerangabe exakt; ohne sie nur „Band …“ ohne Tribute-/Party-/Gast-Wörter', () => {
  const DM = band('Depeche Mode'), AV = band('Alphaville'), OMD = band('Orchestral Manoeuvres in the Dark'), HL = band('The Human League');
  // echt (Künstlerangabe)
  assert.equal(auftrittZuordnung('Depeche Mode – Memento Mori Tour – VIP Experience', ['Depeche Mode'], DM), 'kuenstler');
  assert.equal(auftrittZuordnung('Night of the Proms 2026', ['Night of the Proms', 'Alphaville', 'Holly Johnson'], AV), 'kuenstler');
  assert.equal(auftrittZuordnung('The Halo Effect | Special Guest: Alphaville', ['The Halo Effect', 'Alphaville'], AV), 'kuenstler');
  assert.equal(auftrittZuordnung('Synthpop Night', [{ name: 'Human League' }], HL), 'kuenstler');
  // echt (nur Name)
  assert.equal(auftrittZuordnung('Alphaville – Live in Concert', [], AV), 'name');
  assert.equal(auftrittZuordnung('Loge / Premiumbereich - Alphaville - Eternally Yours', [], AV), 'name');
  assert.equal(auftrittZuordnung('OMD - Bauhaus Staircase Tour', [], OMD), 'name');
  assert.equal(auftrittZuordnung('The Human League – Live 2027', undefined, HL), 'name');
  // nicht echt
  for (const [n, atts] of [
    ['Mode Machine - Depeche Mode tribute band - European tour 2026', ['Mode Machine']],
    ['Mode Machine - Depeche Mode tribute band', ['Depeche Mode']], // auch wenn die Künstlerangabe falsch wäre
    ['Strangelove - The DEPECHE MODE Experience', ['Depeche Mode']],
    ['Remode - The Music of Depeche Mode', []], ['Forced To Mode', []], ['Depeche Mode on piano - played by Thilo', []],
    ['Depeche Mode und New Wave Party', []], ['Depeche Mode Jubiläumsparty @2 Floors!', []], ['Depeche Mode Winterlounge', []],
    ['Temple of Wave - tributes to Depeche Mode, The Cure & Joy Division', []], ['DEPECHE MODE by Mode Machine', ['Depeche Mode']],
    ['101 Voices - Depeche Mode Special Tribute', ['Depeche Mode']], ['Sascha Lange - Eine Lesung aus drei Büchern über Depeche Mode', []],
    ['Depeche Mode Tribute Night', []], ['Depeche Mode Revival', []], ['Depeche Mode Fan-Treffen', []], ['Depeche Mode – Gast: DJ X', []],
  ]) assert.equal(auftrittZuordnung(n, atts, DM), null, n);
  assert.equal(auftrittZuordnung('Control Room - Gast - Marian Gold (Alphaville)', [], AV), null);
  assert.equal(auftrittZuordnung('Marian Gold (Alphaville) – Lesung', ['Alphaville'], AV), null, 'Mitglied, nicht die Band');
  assert.equal(auftrittZuordnung('Andy McCluskey (ex-OMD) DJ-Set', [], OMD), null);
  assert.equal(auftrittZuordnung('Forever Young – Alphaville Tribute', [], AV), null);
  assert.equal(auftrittZuordnung('X with members of Alphaville', ['Alphaville'], AV), null);
  assert.equal(auftrittZuordnung('ROXXETTE - A Tribute to Roxette', [], band('Roxette')), null);
  assert.equal(auftrittZuordnung('The Miracle of Roxette feat. Roxette Experience', [], band('Roxette')), null);
  assert.equal(auftrittZuordnung('Alphavillenacht', [], AV), null, 'nur ganzes Wort');
});

test('Gleiche Regel für Ticketmaster, MusicBrainz-Termine und Festival-Seiten', async () => {
  const DM = band('Depeche Mode'), AV = band('Alphaville');
  const ev = (name, atts) => ({ name, url: 'https://tm/' + encodeURIComponent(name), dates: { start: { localDate: '2027-01-23', localTime: '20:00:00' }, status: { code: 'onsale' } },
    _embedded: { venues: [{ name: 'Halle', city: { name: 'Dresden' }, location: { latitude: '51.05', longitude: '13.74' } }], ...(atts ? { attractions: atts.map(name => ({ name })) } : {}) } });
  const tm = { _embedded: { events: [ev('Depeche Mode Winterlounge'), ev('Strangelove - The DEPECHE MODE Experience', ['Strangelove']),
    ev('Depeche Mode – Memento Mori', ['Depeche Mode']), ev('Depeche Mode Live 2027')] } };
  assert.deepEqual(tmParse(tm, DM).map(k => [k.titel, k.zuordnung]), [['Depeche Mode – Memento Mori', 'kuenstler'], ['Depeche Mode Live 2027', 'name']]);
  // MusicBrainz: verknüpft über die Künstler-ID, Tribute-Namen trotzdem raus (kein Detail-Abruf dafür)
  const urls = [];
  const http = { get: async url => { urls.push(url); return url.includes('/event?artist=') ? { events: [
    { id: 'a', name: 'Tribute to Depeche Mode', 'life-span': { begin: '2027-02-01' } },
    { id: 'b', name: 'Depeche Mode at Waldbühne', 'life-span': { begin: '2027-06-01' }, type: 'Concert' }] } : { relations: [] }; } };
  const r = await mbevents({ http, bands: [DM], config: {}, heute: '2026-11-08', ids: { mb: { 'Depeche Mode': 'mbid' } } });
  assert.deepEqual(r.konzerte.map(k => k.titel), ['Depeche Mode at Waldbühne']);
  assert.equal(urls.length, 2, 'Browse + 1 Detail (nicht für den Tribute-Abend)');
  // Festival-Seite: nur echte Programm-Erwähnung zählt
  const seite = { id: 'x', name: 'X', art: 'festival', url: 'https://x', stadt: 'Leipzig', lat: 51.34, lon: 12.37 };
  assert.deepEqual(seiteTreffer('<p>Samstag: Remode – Tribute to Depeche Mode · DEPECHE MODE PARTY ab 23 Uhr · Marian Gold (Alphaville) liest</p>', seite, [DM, AV]), []);
  assert.deepEqual(seiteTreffer('<p>Line-up: VNV NATION, DEPECHE MODE, Mesh · danach Depeche Mode Party</p>', seite, [DM, AV]).map(t => t.band), ['Depeche Mode']);
  assert.ok(nachgespielt('Silverblue Joyriders - Songs by Roxette', band('Roxette')));
  assert.ok(erwaehntEcht('mit ALPHAVILLE und Kim Wilde', AV));
});

test('Koordinaten: „Insel Usedom“ aus der Tabelle, sonst Postleitzahl, wenn Nominatim die Stadt nicht kennt', async () => {
  assert.deepEqual(await koordinaten('Insel Usedom', '', {}, null, '17424'), { lat: 53.9536, lon: 14.1647 });
  const urls = [];
  const http = { get: async url => { urls.push(url); return new URL(url).searchParams.get('postalcode') === '58455' ? [{ lat: '51.43', lon: '7.33' }] : []; } };
  const cache = { 'witten zentrum|': null }; // „nicht gefunden“ steht schon im Cache (wie „insel usedom|“ im echten geo.json)
  assert.deepEqual(await koordinaten('Witten-Zentrum', '', cache, http, '58455'), { lat: 51.43, lon: 7.33 });
  assert.equal(urls.length, 1);
  assert.equal(new URL(urls[0]).searchParams.get('countrycodes'), 'de');
  assert.deepEqual(cache['plz 58455|'], { lat: 51.43, lon: 7.33 });
  assert.deepEqual(await koordinaten('Witten-Zentrum', '', cache, http, '58455'), { lat: 51.43, lon: 7.33 });
  assert.equal(urls.length, 1, 'zweites Mal aus dem Cache');
  await koordinaten('Dornbirn-Nord', '', {}, http, '6850');
  assert.equal(new URL(urls.at(-1)).searchParams.get('countrycodes'), 'at,ch');
  assert.equal(await koordinaten('', '', {}, http, '6411 KC'), null, 'NL-Format: keine Suche');
});
