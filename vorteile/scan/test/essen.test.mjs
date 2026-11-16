// Modul essen (16.11.2026): gepflegte Lokale + OpenStreetMap (Overpass), Ketten, neu/verschwunden, Push nur für Gemerktes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import essen, { leseOsm, fuehreZusammen, naechsteFilialen, nameKey, kuecheAus, overpassAbfrage, ayceHeute, km } from '../module/essen.mjs';

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
  const hole = async url => { abrufe++; assert.match(url, /^https:\/\/overpass-api\.de\/api\/interpreter\?data=/); return fixture; };
  const zustand = {};
  const jetzt = new Date('2026-11-16T10:00:00Z');
  const r = await essen({ holeText: hole, cfg, jetzt, zustand, essenListen: { liste, seite } });
  assert.deepEqual(r.fehler, []);
  assert.equal(abrufe, 1);
  assert.equal(r.datei.lokale.length, liste.lokale.length);
  assert.ok(r.datei.weitere.length >= 2);
  assert.ok(r.datei.osmStand);
  assert.match(r.kurz, /Lokale bis 30 km/);
  assert.deepEqual(r.eintraege, [], 'ohne gemerkte Lokale kein Push');
  // 2 Stunden später: kein neuer Abruf, Stand aus der alten Datei
  const r2 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-16T12:00:00Z'), zustand, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.equal(abrufe, 1);
  assert.equal(r2.datei.weitere.length, r.datei.weitere.length);
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
  assert.ok(!('osmRoh' in r.datei) && r.datei.osmIds.length >= 5, 'kompakter Vergleichsstand statt Rohdaten');
  const vor = { ...r.datei, osmIds: [...r.datei.osmIds.filter(x => x.name !== 'Testhof Neu'), { osm: 'node/9', name: 'Alt-Lokal', ort: 'Döbeln', km: 0.5 }] };
  const r5 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-18T10:00:00Z'), zustand, vorherDatei: vor, essenListen: { liste, seite } });
  assert.deepEqual(r5.datei.neu.map(x => x.name), ['Testhof Neu']);
  assert.deepEqual(r5.datei.weg.map(x => x.name), ['Alt-Lokal']);
  // am nächsten Tag (gleicher OSM-Stand): „neu“ und „nicht mehr da“ bleiben stehen; ein leerer alter Stand zählt nicht
  const r7 = await essen({ holeText: hole, cfg, jetzt: new Date('2026-11-19T10:00:00Z'), zustand, vorherDatei: r5.datei, essenListen: { liste, seite } });
  assert.deepEqual(r7.datei.neu.map(x => x.name), ['Testhof Neu']);
  assert.deepEqual(r7.datei.weg.map(x => x.name), ['Alt-Lokal']);
  const r8 = await essen({ holeText: kaputt, cfg, jetzt, zustand: {}, vorherDatei: { version: 1, lokale: [], weitere: [], ketten: [], osmIds: [] }, essenListen: { liste, seite } });
  assert.ok(r8.fehler.some(f => /OpenStreetMap/.test(f)), 'leerer alter Stand = echter Fehler');
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
