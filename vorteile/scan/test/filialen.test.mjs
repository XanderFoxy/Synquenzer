// Modul filialen (Xander 16.11.2026: „nur Märkte, die wirklich in Döbeln sind … anhand von GPS … nur die Märkte, die für
// diese Gegend in Frage kommen“): Overpass-Abfrage, Zuordnung der Marken (mit Fallen: Scottie-Netto, ALDI SÜD, REWE To Go),
// Doppel (Gebäude + Punkt), nächste Filiale von Döbeln, Ausfall mit altem Stand; Knaller übernimmt die OSM-Filiale + nah.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import filialen, { overpassAbfrage, marktVon, leseFilialen, naechste, km, STANDARD } from '../module/filialen.mjs';
import { filialeAusOsm } from '../module/knaller.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = readFileSync(join(HIER, 'fixtures', 'overpass-filialen.json'), 'utf8');
const CFG = JSON.parse(readFileSync(join(HIER, '..', '..', 'config.json'), 'utf8'));
const IDS = CFG.module.knaller.maerkte.map(m => m.id);

test('Abfrage: Länder SN/TH/ST/BB im Rahmen, Marken über wikidata, brand und name', () => {
  const q = overpassAbfrage(IDS);
  assert.match(q, /area\["ISO3166-2"~"\^\(DE-SN\|DE-TH\|DE-ST\|DE-BB\)\$"\]->\.a/);
  assert.match(q, /Q41171373/); // Aldi Nord
  assert.match(q, /Q16968817/); // REWE
  assert.match(q, /\(area\.a\)\(50\.15,11\.6,51\.75,15\.1\)/);
  assert.match(q, /out center tags qt;$/);
  assert.ok(!/Q552652/.test(q), 'Scottie-Netto wird nicht gesucht');
});

test('Marken: eindeutig zugeordnet, Fallen bleiben draußen', () => {
  assert.equal(marktVon({ shop: 'supermarket', brand: 'Aldi Nord', name: 'Aldi Nord' }), 'aldi-nord');
  assert.equal(marktVon({ shop: 'supermarket', name: 'Marktkauf' }), 'marktkauf');
  assert.equal(marktVon({ shop: 'supermarket', name: 'PENNY Markt' }), 'penny');
  assert.equal(marktVon({ shop: 'supermarket', brand: 'REWE City', name: 'REWE City Dresden-Süd' }), 'rewe');
  assert.equal(marktVon({ shop: 'supermarket', brand: 'Netto Marken-Discount', name: 'Netto' }), 'netto');
  assert.equal(marktVon({ shop: 'supermarket', brand: 'Netto', 'brand:wikidata': 'Q552652', name: 'Netto' }), null, 'Scottie');
  assert.equal(marktVon({ shop: 'supermarket', name: 'Netto' }), null, '„Netto“ ohne Zusatz ist nicht eindeutig');
  assert.equal(marktVon({ shop: 'supermarket', brand: 'ALDI SÜD', 'brand:wikidata': 'Q41171672', name: 'ALDI SÜD' }), null);
  assert.equal(marktVon({ shop: 'convenience', brand: 'REWE To Go', name: 'REWE To Go' }), null);
  assert.equal(marktVon({ shop: 'supermarket', brand: 'EDEKA', 'brand:wikidata': 'Q701755', name: 'EDEKA Lidl-Straße' }), null);
  assert.equal(marktVon({ shop: 'kiosk', name: 'Penny Kiosk' }), null);
});

test('Lesen: Doppel zusammengelegt, Adresse, sortiert; nächste Filiale von Döbeln', () => {
  const f = leseFilialen(FIX, IDS);
  assert.equal(f['aldi-nord'].filter(x => x[2] === 'Grimmaische Straße 67, Döbeln').length, 1);
  assert.equal(f['aldi-nord'].filter(x => km({ lat: x[0], lon: x[1] }, { lat: 51.1265, lon: 13.139 }) < 0.06).length, 1, 'Gebäude + Punkt = eine Filiale');
  assert.equal(f.penny.filter(x => km({ lat: x[0], lon: x[1] }, { lat: 51.123, lon: 13.125 }) < 0.06).length, 1);
  const n = naechste(f, STANDARD.zentrum, 10);
  assert.ok(n.kaufland.km < 1 && n.kaufland.adresse === 'Schillerstraße 6, Döbeln');
  assert.ok(n.rewe.km > 10, `REWE ${n.rewe.km} km`);
  assert.equal(n.rewe.nah, 0);
  assert.ok(n['aldi-nord'].km <= 10 && n['aldi-nord'].nah >= 1);
});

test('Modullauf: Datei mit Quelle/Stand, kurz nennt die fernen Märkte; Ausfall behält den alten Stand', async () => {
  const jetzt = new Date('2026-11-16T10:00:00Z');
  const zustand = {};
  const r = await filialen({ holeText: async () => FIX, cfg: CFG, jetzt, zustand });
  assert.deepEqual(r.fehler, []);
  assert.equal(r.datei.quelle.lizenz, 'ODbL');
  assert.equal(r.datei.osmStand, '2026-11-16T10:00:00.000Z');
  assert.ok(r.datei.naechsteVomZentrum.rewe.km > 10);
  assert.match(r.kurz, /weiter weg: REWE \(nächste \d+,\d km\)/);
  assert.ok(!/Aldi Nord/.test(r.kurz.split('weiter weg')[1] || ''), 'Aldi Nord ist in der Nähe');
  const CFG0 = { ...CFG, module: { ...CFG.module, filialen: { ...CFG.module.filialen, pauseMs: 0 } } };
  const gefragt = [];
  const aus = await filialen({ holeText: async u => { gefragt.push(new URL(u).host); throw new Error('HTTP 504'); }, cfg: CFG0, jetzt, zustand, vorherDatei: r.datei });
  assert.deepEqual(gefragt, ['overpass-api.de', 'overpass.private.coffee'], 'bei Ausfall einmal die zweite Instanz');
  assert.deepEqual(aus.fehler, []);
  assert.ok(!aus.datei, 'keine neue Datei -> alte bleibt stehen');
  assert.match(aus.hinweise.join(' '), /OpenStreetMap: overpass-api.de: HTTP 504 · overpass.private.coffee: HTTP 504/);
  let n = 0;
  const zweite = await filialen({ holeText: async () => { if (!n++) throw new Error('HTTP 502'); return FIX; }, cfg: CFG0, jetzt, zustand: {} });
  assert.equal(zweite.datei.server, 'overpass.private.coffee');
  const leer = await filialen({ holeText: async () => '{"elements":[]}', cfg: CFG0, jetzt, zustand: {} });
  assert.match(leer.fehler.join(' '), /nur 0 Filialen/);
});

test('Knaller: OSM-Filiale, wenn kaufDA keine nennt', async () => {
  const r = await filialen({ holeText: async () => FIX, cfg: CFG, jetzt: new Date('2026-11-16T10:00:00Z'), zustand: {} });
  const f = filialeAusOsm(r.datei, 'rewe');
  assert.equal(f.quelle, 'OpenStreetMap');
  assert.equal(f.von, 'Döbeln');
  assert.ok(f.km > 10);
  assert.equal(filialeAusOsm(null, 'rewe'), null);
  assert.equal(filialeAusOsm(r.datei, 'unbekannt'), null);
});
