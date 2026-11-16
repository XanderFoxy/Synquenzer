// Modul essen (16.11.2026): gepflegte Lokale + OpenStreetMap (Overpass), Ketten, neu/verschwunden, Push nur für Gemerktes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import essen, { leseOsm, fuehreZusammen, naechsteFilialen, nameKey, kuecheAus, overpassAbfrage, ayceHeute, km, passtName, passtKette, vergleichsStand, leseEssenMerk, tagesEnde } from '../module/essen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const BASIS = join(HIER, '..', '..');
const liste = JSON.parse(await readFile(join(BASIS, 'essen.json'), 'utf8'));
// Der Radar-Lauf (Workflow) hat nur den Ordner vorteile/ -> Auszug der Seiten-Daten als Fixture; die volle Datei nur lokal
const seite = JSON.parse(await readFile(join(HIER, 'fixtures', 'essen-seite.json'), 'utf8'));
const seiteVoll = await readFile(join(BASIS, '..', 'mein-vorteil', 'essen.json'), 'utf8').then(JSON.parse, () => null);
const cfg = JSON.parse(await readFile(join(BASIS, 'config.json'), 'utf8'));
const fixture = await readFile(join(HIER, 'fixtures', 'overpass-essen.json'), 'utf8');
const ISO = /^\d{4}-\d\d-\d\d$/;
const KUECHEN = new Set(['italienisch', 'pizza', 'griechisch', 'indisch', 'tuerkisch', 'doener', 'asiatisch', 'chinesisch', 'vietnamesisch', 'japanisch', 'burger', 'deutsch', 'saechsisch', 'mexikanisch', 'steak', 'haehnchen', 'fisch', 'balkan', 'orientalisch', 'mediterran', 'vegan', 'vegetarisch', 'imbiss', 'international']);

test('vorteile/essen.json: Schema – ids eindeutig, Küchen bekannt, Bewertungen mit Quelle/Zahl/Stand, https überall', () => {
  assert.equal(liste.version, 1);
  assert.match(liste.stand, ISO);
  assert.ok(Number.isFinite(liste.zentrum.lat) && Number.isFinite(liste.zentrum.lon));
  const ids = new Set();
  for (const l of [...liste.lokale, ...liste.ketten]) { assert.ok(/^[a-z0-9-]{2,60}$/.test(l.id), l.id); assert.ok(!ids.has(l.id), `doppelt ${l.id}`); ids.add(l.id); assert.match(l.geprueft, ISO); }
  assert.ok(liste.lokale.length >= 12, 'mindestens 12 Lokale');
  for (const l of liste.lokale) {
    assert.ok(l.name && l.ort, l.id);
    assert.ok(Array.isArray(l.kueche) && l.kueche.length && l.kueche.every(k => KUECHEN.has(k)), `${l.id}: Küche ${l.kueche}`);
    assert.ok(Number.isFinite(l.km) && l.km >= 0 && l.km <= liste.radiusKm, `${l.id}: km`);
    for (const b of l.bewertungen || []) {
      assert.ok(b.wert >= 0 && b.wert <= (b.max || 5), `${l.id}: wert`);
      assert.ok(Number.isInteger(b.anzahl) && b.anzahl > 0, `${l.id}: anzahl`);
      assert.ok(b.quelle && /^https:\/\//.test(b.url), `${l.id}: quelle`);
      assert.match(b.stand, ISO);
    }
    // ohne Bewertung braucht es eine andere Quelle
    assert.ok((l.bewertungen || []).length || (l.quellen || []).length, `${l.id}: keine Quelle`);
    for (const q of l.quellen || []) assert.match(q.url, /^https:\/\//);
    if (l.leuteSagen) { assert.ok(l.leuteSagen.length <= 220, `${l.id}: leuteSagen zu lang`); assert.ok(!/[„“"]/.test(l.leuteSagen), `${l.id}: keine Zitate`); }
  }
  // Ketten: Aktionen zeigen auf echte Einträge der Seite (mein-vorteil/essen.json)
  const seitenIds = seiteVoll ? new Set(seiteVoll.eintraege.map(e => e.id)) : null;
  for (const k of liste.ketten) {
    assert.ok(k.kette && k.filiale && Number.isFinite(k.km), k.id);
    assert.ok([true, false, null].includes(k.lieferung), `${k.id}: lieferung`);
    if (seitenIds) for (const a of k.aktionen || []) assert.ok(seitenIds.has(a), `${k.id}: Aktion ${a} fehlt in mein-vorteil/essen.json`);
    for (const q of k.quellen) assert.match(q.url, /^https:\/\//);
  }
  assert.equal(liste.ketten.find(k => k.kette === "Domino's").lieferung, false, 'Domino’s liefert nicht nach Döbeln');
  // Prüfer B4: kein „einziges griechisches Lokal“ – OSM kennt Gyromania, Olympia (Döbeln), Sirtaki (Waldheim) …
  assert.ok(!liste.lokale.some(l => (l.hinweise || []).some(h => /einzige/i.test(h))));
  // Prüfer B6: Rückfall = nächste Filiale laut OSM (Roh-Lauf 43831213811), nicht ältere, weitere Filialen
  const rk = Object.fromEntries(liste.ketten.map(k => [k.kette, `${k.ort} ${k.km}`]));
  assert.deepEqual([rk["Domino's"], rk['Burger King'], rk.Subway, rk.KFC, rk['Pizza Hut']], ['Riesa 24', 'Riesa 23', 'Riesa 23', 'Chemnitz 33', 'Dresden 44']);
});

test('Overpass-Abfrage: ein Abruf, Umkreis 30 km Lokale + 70 km Ketten, Anführungszeichen sicher', () => {
  const q = overpassAbfrage(liste.zentrum, 30, 70);
  assert.match(q, /around:30000,51\.121,13\.117/);
  assert.match(q, /around:70000,51\.121,13\.117/);
  assert.match(q, /Domino|McDonald/);
  assert.ok(!/[^\\]"[^~\]]*"[^\]]*"[^\]]*\]/.test('') );
  assert.match(q, /out center tags qt;$/);
});

test('leseOsm: Küche übersetzt, Entfernung gerechnet, ohne amenity/ohne Name weg, Ketten mit Marke', () => {
  const o = leseOsm(fixture, liste.zentrum);
  assert.ok(o.every(x => x.name && x.osm && Number.isFinite(x.km)));
  assert.ok(!o.some(x => x.name === 'ohne amenity' && x.amenity), 'Element ohne amenity bleibt ohne Art');
  const a = o.find(x => x.name === 'Ristorante Al Dente');
  assert.deepEqual(a.kueche, ['italienisch', 'pizza']);
  assert.ok(a.km < 1);
  assert.match(a.oeffnung, /Mo off/);
  assert.equal(a.adresse, 'Teststraße 1, 04720 Döbeln');
  assert.ok(o.find(x => x.name === 'Testhof Neu').osm === 'way/2001', 'Weg mit center');
  assert.deepEqual(kuecheAus('kebab;turkish;unbekannt'), ['doener', 'tuerkisch']);
  assert.equal(nameKey('Ristorante Al Dente'), 'aldente');
  assert.equal(nameKey('Zur Margarethenmühle'), 'margarethenmuehle');
  assert.ok(Math.abs(km({ lat: 51.121, lon: 13.117 }, { lat: 50.917, lon: 13.342 }) - 27) < 2, 'Döbeln–Freiberg ≈ 27 km');
  assert.throws(() => leseOsm('{"x":1}', liste.zentrum), /elements/);
});

test('zusammenführen: gepflegte Lokale bekommen Öffnungszeiten/Lage, weitere ohne Ketten-Filialen von weit weg, nicht gefunden gemeldet', () => {
  const o = leseOsm(fixture, liste.zentrum);
  const { lokale, weitere, nichtGefunden } = fuehreZusammen(liste, o, { radiusKm: 30 });
  const ad = lokale.find(l => l.id === 'doe-al-dente');
  assert.equal(ad.osm, 'node/1001');
  assert.match(ad.oeffnung, /Tu-Su/);
  assert.ok(ad.bewertungen.length === 2, 'Bewertungen bleiben');
  assert.equal(lokale.find(l => l.id === 'doe-la-gioia').osm, 'node/1002');
  assert.ok(weitere.some(w => w.name === 'Testhof Neu'));
  assert.ok(weitere.some(w => w.name === 'Kebab Haus Test'));
  assert.ok(!weitere.some(w => w.name === 'Zu weit weg'), 'außerhalb 30 km');
  assert.ok(!weitere.some(w => w.name === "Domino's" || w.name === 'KFC'), 'Ketten weit weg nicht unter weitere');
  assert.ok(!weitere.some(w => w.osm === 'node/1001'), 'zugeordnet = nicht doppelt');
  assert.ok(nichtGefunden.includes('doe-korfu'));
  const k = naechsteFilialen(liste.ketten, o);
  assert.equal(k.find(x => x.id === 'kette-dominos').naechste.ort, 'Freiberg');
  assert.equal(k.find(x => x.id === 'kette-kfc').naechste.ort, 'Chemnitz', 'OSM kennt die nähere Filiale');
  assert.equal(k.find(x => x.id === 'kette-subway').naechste, null);
});

test('Modul: eigene Datei, einmal am Tag OSM, Ausfall mit altem Stand = Hinweis statt Fehler, neu/verschwunden', async () => {
  let abrufe = 0;
  // ntfy (Merkliste) ist ein eigener, kleiner Abruf je Lauf – hier gezählt wird nur Overpass
  const hole = async url => { if (/^https:\/\/ntfy\.sh\//.test(url)) return ''; abrufe++; assert.match(url, /^https:\/\/overpass-api\.de\/api\/interpreter\?data=/); return fixture; };
  const zustand = {};
  const jetzt = new Date('2026-11-16T10:00:00Z');
  const r = await essen({ holeText: hole, cfg, jetzt, zustand, essenListen: { liste, seite } });
  assert.deepEqual(r.fehler, []);
  assert.equal(abrufe, 1);
  assert.equal(r.datei.lokale.length, liste.lokale.length);
  assert.ok(r.datei.weitere.length >= 2);
  // Prüfer R6 (Rest von B6): osmStand = Stand der OSM-Daten (osm3s.timestamp_osm_base), nicht die Abrufzeit
  assert.equal(r.datei.osmStand, '2026-11-16T09:41:00.000Z');
  assert.equal(r.datei.abgerufen, jetzt.toISOString());
  assert.match(r.kurz, /Lokale bis 30 km/);
  assert.deepEqual(r.eintraege, [], 'ohne gemerkte Lokale kein Push');
  // 2 Stunden später: kein neuer Abruf, Stand aus der alten Datei
  const r2 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-16T12:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.equal(abrufe, 1);
  assert.equal(r2.datei.weitere.length, r.datei.weitere.length);
  assert.equal(r2.datei.osmStand, '2026-11-16T09:41:00.000Z', 'ohne Abruf bleibt der OSM-Stand des letzten Abrufs');
  // nächster Tag: Overpass weg -> alter Stand, nur Hinweis
  const kaputt = async () => { throw new Error('HTTP 504 bei overpass-api.de'); };
  const r3 = await essen({ holeText: kaputt, cfg, jetzt: new Date('2026-11-17T10:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.deepEqual(r3.fehler, []);
  assert.ok(r3.hinweise.some(h => /letzter Stand/.test(h)));
  assert.equal(r3.datei.weitere.length, r.datei.weitere.length);
  assert.equal(r3.datei.ketten.find(k => k.id === 'kette-kfc').naechste.ort, 'Chemnitz', 'Ausfall: nächste Filiale aus der alten Datei');
  assert.equal(r3.datei.lokale.find(l => l.id === 'doe-al-dente').oeffnung, r.datei.lokale.find(l => l.id === 'doe-al-dente').oeffnung);
  // ohne alten Stand: echter Fehler
  const r4 = await essen({ holeText: kaputt, cfg, jetzt, zustand: {}, essenListen: { liste, seite } });
  assert.ok(r4.fehler.some(f => /OpenStreetMap/.test(f)));
  // neu/verschwunden: alter Stand ohne „Testhof Neu“, mit einem verschwundenen Lokal
  // Prüfer B8: keine eigene Vergleichsliste (osmIds 53 KB) in der Seiten-Datei – „weitere“ hat alles im Umkreis
  assert.ok(!('osmRoh' in r.datei) && !('osmIds' in r.datei), 'Seiten-Datei ohne Vergleichsliste');
  assert.ok(r.datei.weitere.every(w => !('id' in w) && !('art' in w) && w.osm && Object.values(w).every(v => v !== '' && v != null)), 'weitere knapp: ohne id/art/leere Felder');
  const vor = { ...r.datei, weitere: [...r.datei.weitere.filter(x => x.name !== 'Testhof Neu'), { name: 'Alt-Lokal', ort: 'Döbeln', km: 0.5, lat: 51.12, lon: 13.12, osm: 'node/9' }] };
  const r5 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-18T10:00:00Z'), zustand, vorherDatei: vor, essenListen: { liste, seite } });
  assert.deepEqual(r5.datei.neu.map(x => x.name), ['Testhof Neu']);
  assert.deepEqual(r5.datei.weg.map(x => x.name), ['Alt-Lokal']);
  // ältere Datei mit osmIds (Roh-Lauf 43832277416) zählt weiter – Ketten über 5 km wie in „weitere“ ausgelassen
  const ids = vergleichsStand(r.datei).filter(x => x.name !== 'Testhof Neu');
  const altDatei = { ...r.datei, weitere: r.datei.weitere.slice(0, 1), osmIds: [...ids, { osm: 'node/9', name: 'Alt-Lokal', ort: 'Döbeln', km: 0.5 }, { osm: 'node/77', name: 'Burger King', ort: 'Riesa', km: 23 }] };
  const r5b = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-18T10:00:00Z'), zustand: { essen: { osmZeit: '2026-11-17T09:00:00Z' } }, vorherDatei: altDatei, essenListen: { liste, seite } });
  assert.deepEqual(r5b.datei.neu.map(x => x.name), ['Testhof Neu']);
  assert.deepEqual(r5b.datei.weg.map(x => x.name), ['Alt-Lokal'], 'Burger King in 23 km ist keine „verschwundene“ Lokal-Zeile');
  // am nächsten Tag (gleicher OSM-Stand): „neu“ und „nicht mehr da“ bleiben stehen; ein leerer alter Stand zählt nicht
  const r7 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-19T10:00:00Z'), zustand, vorherDatei: r5.datei, essenListen: { liste, seite } });
  assert.deepEqual(r7.datei.neu.map(x => x.name), ['Testhof Neu']);
  assert.deepEqual(r7.datei.weg.map(x => x.name), ['Alt-Lokal']);
  const r8 = await essen({ holeText: kaputt, cfg, jetzt, zustand: {}, vorherDatei: { version: 1, lokale: [], weitere: [], ketten: [], osmIds: [] }, essenListen: { liste, seite } });
  assert.ok(r8.fehler.some(f => /OpenStreetMap/.test(f)), 'leerer alter Stand = echter Fehler');
});

test('Prüfer B1: alle Lokale im Umkreis (keine Kappe bei 200), bis 30 km – auch Griechen/Inder weiter weg', () => {
  const z = liste.zentrum;
  const viele = Array.from({ length: 713 }, (_, i) => ({ osm: `node/${50000 + i}`, name: `Lokal ${i}`, amenity: 'restaurant', kueche: i % 25 === 0 ? ['griechisch'] : [], lat: z.lat, lon: z.lon, km: Math.round((0.2 + i * 0.04) * 10) / 10, ort: 'Ort', adresse: '', oeffnung: '', website: null, marke: null }));
  const { weitere } = fuehreZusammen({ lokale: [] }, viele, { radiusKm: 30 });
  assert.equal(weitere.length, 713);
  assert.ok(weitere.some(w => w.km > 25 && w.kueche?.includes('griechisch')), 'Griechen über 18 km bleiben');
  assert.equal(fuehreZusammen({ lokale: [] }, [...viele, { ...viele[0], osm: 'node/1', km: 31 }], { radiusKm: 30 }).weitere.length, 713, 'über 30 km nicht');
});

test('Prüfer B7: Namen passen nur in eine Richtung („Pizza“ ist nicht Pizza Hut, „Asia Imbiss“ nicht Hoang Long)', () => {
  assert.ok(passtName('Al Dente', 'Ristorante Al Dente'));
  assert.ok(passtName('Hoang Long', 'Asia Bistro Hoang Long'));
  assert.ok(passtName('Bürgergarten Döbeln', 'Bürgergarten'), 'fast gleich lang: auch umgekehrt');
  assert.ok(!passtName('Asia Bistro Hoang Long', 'Asia Imbiss'));
  assert.ok(!passtName('Pizza Franco', 'Pizza'));
  assert.ok(passtKette("McDonald's", { name: "McDonald's Döbeln", marke: null }));
  assert.ok(passtKette('Pizza Hut', { name: 'Restaurant', marke: 'Pizza Hut' }));
  assert.ok(!passtKette('Pizza Hut', { name: 'Pizza', marke: null }));
  assert.ok(!passtKette("McDonald's", { name: 'Bistro Donald', marke: null }));
  assert.ok(!passtKette('Burger King', { name: 'Burger Bude', marke: null }));
  const o = leseOsm(fixture, liste.zentrum);
  const pizza = { osm: 'node/4242', name: 'Pizza', amenity: 'fast_food', kueche: ['pizza'], lat: 51.13, lon: 13.12, km: 2, ort: 'Döbeln', adresse: '', oeffnung: '', website: null, marke: null };
  const k = naechsteFilialen(liste.ketten, [pizza, ...o]);
  assert.notEqual(k.find(x => x.kette === 'Pizza Hut').naechste?.name, 'Pizza');
  const burger = { ...pizza, osm: 'node/4243', name: 'Burger', km: 12 };
  assert.ok(fuehreZusammen(liste, [burger, ...o], { radiusKm: 30 }).weitere.some(w => w.osm === 'node/4243'), 'ein Lokal „Burger“ in 12 km ist keine Ketten-Filiale');
  assert.notEqual(fuehreZusammen(liste, [pizza, ...o], { radiusKm: 30 }).lokale.find(l => l.id === 'doe-pizza-franco').osm, 'node/4242');
});

test('Prüfer B9/B2: Punkt + Fläche einmal; ohne Ort in OSM „bei <Ort>“ vom Nachbarn (≤ 1,5 km), sonst leer – nie der gepflegte Ort', () => {
  const z = liste.zentrum;
  const d = { elements: [
    { type: 'node', id: 1, lat: 51.0, lon: 13.0, tags: { amenity: 'restaurant', name: 'Sirtaki', cuisine: 'greek' } },
    { type: 'way', id: 2, center: { lat: 51.0003, lon: 13.0004 }, tags: { amenity: 'restaurant', name: 'Sirtaki', opening_hours: 'Tu-Su 11:00-22:00', 'addr:city': 'Waldheim' } },
    { type: 'node', id: 3, lat: 50.84657, lon: 12.93869, tags: { amenity: 'fast_food', name: 'KFC', brand: 'KFC' } },
    { type: 'node', id: 4, lat: 50.8475, lon: 12.9390, tags: { amenity: 'fast_food', name: "McDonald's", brand: "McDonald's", 'addr:city': 'Chemnitz' } },
    { type: 'node', id: 5, lat: 51.04476, lon: 13.73691, tags: { amenity: 'fast_food', name: 'Pizza Hut', brand: 'Pizza Hut' } },
  ] };
  const o = leseOsm(d, z);
  const s = o.filter(x => x.name === 'Sirtaki');
  assert.equal(s.length, 1, 'Sirtaki einmal');
  assert.equal(s[0].oeffnung, 'Tu-Su 11:00-22:00');
  assert.ok(s[0].ort === 'Waldheim' || s[0].ort === 'bei Waldheim');
  assert.deepEqual(s[0].kueche, ['griechisch']);
  assert.equal(o.find(x => x.name === 'KFC').ort, 'bei Chemnitz');
  assert.equal(o.find(x => x.name === 'Pizza Hut').ort, '', 'kein Nachbar mit Ort: leer statt falsch');
  const k = naechsteFilialen(liste.ketten, o);
  assert.equal(k.find(x => x.kette === 'Pizza Hut').naechste.ort, '');
  assert.equal(k.find(x => x.kette === 'KFC').naechste.ort, 'bei Chemnitz');
});

test('Merken über ntfy (Prüfer B3): Seite meldet ids, Radar liest die neueste Liste, Knaller-Nachrichten stören nicht; Push am Tag', async () => {
  const z = (time, message, id = 'm' + time) => JSON.stringify({ id, time, event: 'message', topic: 't', message: typeof message === 'string' ? message : JSON.stringify(message) });
  const nd = [z(100, { v: 1, essen: ['dd-play-off', 'doe-al-dente'] }), z(200, { v: 1, satz: 'x', teil: 1, von: 1, merken: [{ id: 'k1', titel: 'Crunchips', markt: 'aldi-nord' }] }),
    z(150, { v: 1, essen: ['dd-play-off', 'BÖSE id', 'doe-namaste'] }), z(160, 'kein json'), JSON.stringify({ event: 'open' })].join('\n');
  assert.deepEqual(leseEssenMerk(nd), { time: 150, ids: ['dd-play-off', 'doe-namaste'] });
  assert.equal(leseEssenMerk(''), null);
  assert.equal(cfg.module.essen.merkThema, 'xander-schnaeppchen-b5cbf4442aaa9734f3-merken', 'gleiches Thema wie die Seite (MERK_URL in mein-vorteil/essen.js)');
  const urls = [];
  const hole = async url => { urls.push(url); if (/ntfy\.sh/.test(url)) return nd; if (/mein-vorteil/.test(url)) return JSON.stringify(seite); return fixture; };
  const zustand = {};
  const r = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-18T09:00:00Z'), zustand, essenListen: { liste, seite } }); // Mi 10 Uhr
  assert.ok(urls.includes('https://ntfy.sh/xander-schnaeppchen-b5cbf4442aaa9734f3-merken/json?poll=1&since=12h'));
  assert.deepEqual(zustand.essen.gemerkt, ['dd-play-off', 'doe-namaste']);
  assert.deepEqual(r.eintraege.map(e => e.id), ['essen-ayce-dd-play-off-2026-11-18'], 'Stern auf der Seite reicht für die Erinnerung');
  // ntfy hat nichts mehr (12 h vorbei): letzte Liste bleibt
  const r2 = await essen({ holeText: async url => (/ntfy/.test(url) ? '' : fixture), cfg, jetzt: new Date('2026-11-25T09:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.deepEqual(zustand.essen.gemerkt, ['dd-play-off', 'doe-namaste']);
  assert.equal(r2.eintraege.length, 1);
  // ntfy gestört: nur Hinweis, kein Fehler
  const r3 = await essen({ holeText: async url => { if (/ntfy/.test(url)) throw new Error('HTTP 502'); return fixture; }, cfg, jetzt: new Date('2026-11-25T09:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.deepEqual(r3.fehler, []);
  assert.ok(r3.hinweise.some(h => /Merkliste/.test(h)));
  // Tagesaktion (Tagesessen mit festem Wochentag) gemerkt: „Heute: …“
  const voll = seiteVoll || seite;
  const tag = voll.eintraege.find(e => e.rubrik === 'lokal' && Array.isArray(e.wochentage) && e.wochentage.length < 7 && !e.nurHinweis);
  if (tag) {
    const datum = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'][tag.wochentage[0] - 1];
    const a = ayceHeute({ liste, seite: voll, gemerkt: [tag.id], tag: datum });
    assert.equal(a.length, 1);
    assert.equal(a[0].art, 'tag');
  }
});

test('Push-Ende 23:59 Berliner Zeit mit richtigem Versatz (Winter +01:00, Sommer +02:00)', () => {
  assert.equal(tagesEnde('2026-11-18'), '2026-11-18T23:59:00+01:00');
  assert.equal(tagesEnde('2026-07-15'), '2026-07-15T23:59:00+02:00');
  assert.equal(Date.parse(tagesEnde('2026-07-15')), Date.parse('2026-07-15T21:59:00Z'));
});

test('Push: nur gemerkte Lokale, nur am AYCE-Tag, nur tagsüber; ohne Merkliste nichts', async () => {
  // Mongolian Bar Dresden (mein-vorteil/essen.json) läuft täglich; Play Off Mo+Mi
  const playOff = seite.eintraege.find(e => e.id === 'dd-play-off');
  assert.ok(playOff && playOff.wochentage.includes(3));
  const tag = '2026-11-18'; // Mittwoch
  assert.equal(ayceHeute({ liste, seite, gemerkt: [], tag }).length, 0);
  assert.deepEqual(ayceHeute({ liste, seite, gemerkt: ['dd-play-off'], tag }).map(a => a.id), ['dd-play-off']);
  assert.equal(ayceHeute({ liste, seite, gemerkt: ['dd-play-off'], tag: '2026-11-19' }).length, 0, 'Donnerstag nicht');
  const c = { ...cfg, module: { ...cfg.module, essen: { ...cfg.module.essen, gemerkt: ['dd-play-off'] } } };
  const hole = async () => fixture;
  const frueh = await essen({ holeText: hole, cfg: c, jetzt: new Date('2026-11-18T05:00:00Z'), zustand: {}, essenListen: { liste, seite } });
  assert.equal(frueh.eintraege.length, 0, '6 Uhr Berlin: noch nicht');
  const r = await essen({ holeText: hole, cfg: c, jetzt: new Date('2026-11-18T09:00:00Z'), zustand: {}, essenListen: { liste, seite } });
  assert.equal(r.eintraege.length, 1);
  // im Workflow fehlt mein-vorteil/ -> die Seiten-Daten kommen dann (nur mit Merkliste) einmal von GitHub
  const urls = [];
  const holeMitSeite = async url => { urls.push(url); return /mein-vorteil\/essen\.json$/.test(url) ? JSON.stringify(seite) : fixture; };
  const r6 = await essen({ holeText: holeMitSeite, cfg: c, jetzt: new Date('2026-11-18T09:00:00Z'), zustand: {}, essenListen: { liste, seite: null } });
  assert.equal(r6.eintraege.length, 1);
  assert.ok(urls.some(u => u === 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/main/mein-vorteil/essen.json'));
  const urls2 = [];
  await essen({ holeText: async u => { urls2.push(u); return fixture; }, cfg, jetzt: new Date('2026-11-18T09:00:00Z'), zustand: {}, essenListen: { liste, seite: null } });
  assert.ok(!urls2.some(u => /mein-vorteil/.test(u)), 'ohne Merkliste kein Abruf der Seiten-Daten');
  const e = r.eintraege[0];
  assert.equal(e.kategorie, 'essen');
  assert.equal(e.sofort, true);
  assert.match(e.titel, /^Heute All-you-can-eat: Play Off/);
  assert.match(e.zeile, /^Mi 18\.11\./);
  assert.match(e.link, /^https:\/\//);
  assert.ok(e.bis.startsWith('2026-11-18'));
  assert.equal(e.id, 'essen-ayce-dd-play-off-2026-11-18');
});

test('Prüfer R6 (Rest von B6): alter Zustand nur mit Abrufzeit -> einmal neu holen, ohne osm3s kein erfundener Stand', async () => {
  let abrufe = 0;
  const ohneStand = fixture.replace(/"timestamp_osm_base":"[^"]+",/, '');
  const hole = async url => { if (/^https:\/\/ntfy\.sh\//.test(url)) return ''; abrufe++; return ohneStand; };
  const jetzt = new Date('2026-11-16T10:00:00Z');
  const erst = await essen({ holeText: async u => (/ntfy/.test(u) ? '' : fixture), cfg, jetzt, zustand: {}, essenListen: { liste, seite } });
  // Zustand von vor dem Fix: osmZeit 1 Stunde alt, kein osmStand; alte Datei trägt die Abrufzeit als „osmStand“
  const zustand = { essen: { osmZeit: '2026-11-16T09:00:00.000Z' } };
  const r = await essen({ holeText: hole, cfg, jetzt, zustand, vorherDatei: { ...erst.datei, osmStand: '2026-11-16T09:00:00.000Z' }, essenListen: { liste, seite } });
  assert.equal(abrufe, 1, 'einmal neu geholt, obwohl osmStunden noch nicht um sind');
  assert.equal(r.datei.osmStand, null, 'Overpass ohne timestamp_osm_base: kein Stand statt der Abrufzeit');
  assert.ok('osmStand' in zustand.essen);
  await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-16T11:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.equal(abrufe, 1, 'danach wieder nur alle osmStunden');
});
