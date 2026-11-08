// Preis-Kontext aus referenzpreise.json + eigenem Verlauf: Regulär · Üblich im Angebot · Tiefst 12 Mon. · Jetzt
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladeReferenz, preisKontext, mengeAus, datumAus, ladenAus, verlaufEintraege, pushZeile } from '../referenz.mjs';
import { leereHistorie, eintragen } from '../history.mjs';

const BASIS = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = JSON.parse(readFileSync(join(BASIS, 'referenzpreise.json'), 'utf8'));
const watchlist = JSON.parse(readFileSync(join(BASIS, 'watchlist.json'), 'utf8'));
const cfg = JSON.parse(readFileSync(join(BASIS, 'config.json'), 'utf8'));
const refs = ladeReferenz(json, watchlist);
const JETZT = Date.parse('2026-10-31T16:35:00Z');
const kontext = (id, angebot = null, extra = {}) => preisKontext({ ref: refs[id], basis: refs[id].basis, angebot, jetztMs: JETZT, cfg, ...extra });

test('Packung aus dem Freitext: Grundpreise sind nie die Packung, Spannen = größere, Stück aus „8er“/„Riegel“/„5 × 40 g“', () => {
  assert.equal(mengeAus('340g (XXL-Beutel) = 0,438 €/100 g', '100g'), 340);
  assert.equal(mengeAus('110–150 g (kaufDA-Grundpreis 7,40–10,09 €/kg)', '100g'), 150);
  assert.equal(mengeAus('150/115 g, „−39 %“', '100g'), 150);
  assert.equal(mengeAus('3x175g (3 x 160-175 g, versch. Sorten)', '100g'), 525);
  assert.equal(mengeAus('465ml (laut marktguru gilt das Angebot auch für 4×100 ml)', '100ml'), 465);
  assert.equal(mengeAus('8er (200 g) = 0,349 €/Stück', 'stueck', 25), 8);
  assert.equal(mengeAus('15er (375 g, Big Pack) = 0,199 €/Stück', 'stueck', 25), 15);
  assert.equal(mengeAus('200 g (5 × 40 g), versch. Sorten', 'stueck', 40), 5);
  assert.equal(mengeAus('15 × 200 g Karton (75 Riegel) = 2,49 € je 5er', 'stueck', 40), 75);
  assert.equal(mengeAus('Choco Crossies oder Choclait Chips (Packung nicht angegeben)', '100g'), null);
});

test('Datum aus dem Freitext: früheste Angabe, Monat genügt, „Meldedatum unbekannt (abgerufen …)“ = undatiert', () => {
  assert.deepEqual(datumAus('2026-10-26 bis 2026-10-31'), { tag: '2026-10-26', genau: 'tag' });
  assert.deepEqual(datumAus('bis 2026-10-24 (KW 43)'), { tag: '2026-10-24', genau: 'tag' });
  assert.deepEqual(datumAus('2026-08 (Tag unbekannt)'), { tag: '2026-08-15', genau: 'monat' });
  assert.deepEqual(datumAus('Stand 12/2025: Netto-Prospekt vom 15.–20.12.2025'), { tag: '2025-12-15', genau: 'monat' });
  assert.deepEqual(datumAus('Okt 2026 (aktionspreis.de) / Meldedatum unbekannt'), { tag: '2026-10-15', genau: 'monat' });
  assert.deepEqual(datumAus('KW 41/2026 (2026-10-05 bis 2026-10-10)'), { tag: '2026-10-05', genau: 'tag' });
  assert.deepEqual(datumAus('ca. Mitte Januar 2026'), { tag: '2026-01-15', genau: 'monat' });
  assert.equal(datumAus('Meldedatum unbekannt (abgerufen 31.10.2026)'), null);
  assert.equal(datumAus('ohne Datum (älter)'), null);
  assert.equal(datumAus('unbekannt (abgelaufenes Angebot vor dem 31.10.2026)'), null);
});

test('Läden: Döbelner Ketten zählen; Aldi Süd, Wasgau, Netto mit dem Scottie, Großhandel nie', () => {
  assert.equal(ladenAus('Kaufland (Döbeln, PLZ 04720)').rang, 1);
  assert.equal(ladenAus('Netto Marken-Discount').kette, 'Netto Marken-Discount');
  assert.equal(ladenAus('EDEKA / Marktkauf').kette, 'EDEKA');
  assert.equal(ladenAus('Globus').rang, 2);
  for (const s of ['Aldi Süd (statt 2,49 €)', 'Wasgau (nicht in Döbeln)', 'Netto mit dem Scottie (Netto Stavenhagen)', 'EDEKA Foodservice (Großhandel)', 'Metro Cash & Carry', 'Tesco Irland (NUR VERGLEICH)']) {
    assert.equal(ladenAus(s).rang, 9, s);
  }
  assert.equal(ladenAus('Kaufland (vermutlich Preis mit Kaufland Card)').app, true);
  assert.equal(ladenAus('Netto Marken-Discount (ohne App; Vorher-Preis/UVP 2,49 €)').app, false);
  assert.equal(ladenAus('Penny (UVP im Prospekt, kein Regalpreis)').uvp, true);
  assert.equal(ladenAus('Aldi Nord (Döbeln): SCHÄTZUNG').schaetzung, true);
});

test('Alle Produkte (auch die neuen vom 08.11.): ohne Angebot immer Üblich + Tiefst + Regulär mit Quelle – nie „unbekannt“', () => {
  assert.equal(Object.keys(refs).length, watchlist.produkte.length);
  for (const item of watchlist.produkte) {
    const k = kontext(item.id);
    assert.ok(k.regulaer?.pack > 0 && k.regulaer.quelle, `${item.id}: Regulär`);
    assert.ok(k.ueblich?.pack > 0 && k.ueblich.quelle, `${item.id}: Üblich`);
    assert.ok(k.tiefst12?.pack > 0 && k.tiefst12.shop && k.tiefst12.monat && k.tiefst12.quelle, `${item.id}: Tiefst`);
    assert.ok(k.tiefst12.pack <= k.ueblich.pack + 0.005, `${item.id}: Tiefst ≤ üblich`);
    assert.match(k.zeile, /^Gerade kein Angebot · Üblich [\d,]+ € · Tiefst [\d,]+ € \([^,]+, \S+ 20\d\d\) · je /, item.id);
    assert.doesNotMatch(JSON.stringify(k), /unbekannt/i, item.id);
  }
});

test('Ben & Jerry\'s: nur 465-ml-Becher, nur Döbelner Ketten (Wasgau 3,49 € zählt nicht), Lidl 3,99 € ist ein Deal', () => {
  const k = kontext('ben-jerrys', { preis: 3.99, menge: 465, shop: 'Lidl' });
  assert.equal(k.zeile, 'Jetzt 3,99 € · Regulär 6,99 € · Üblich im Angebot 4,22 € · Tiefst 12 Mon. 3,79 € (EDEKA, Aug. 2026)');
  assert.deepEqual([k.regulaer.shop, k.regulaer.monat, k.regulaer.stand], ['Lidl', 'Okt. 2026', ''], 'Regulär aus dem Laden des Angebots');
  // Netto 4,44 · Globus 4,99 · EDEKA 3,99 · EDEKA 3,79 (Wasgau, Aldi Süd, undatierte und angekündigte nicht)
  assert.equal(k.ueblich.anzahl, 4);
  assert.equal(k.ersparnis, 0.429);
  assert.equal(k.deal, true);
  assert.equal(k.stufe, 'gut');
  assert.equal(pushZeile(k), 'Tiefst 12 Mon. 3,79 € (EDEKA, Aug. 2026) · üblich 4,22 € · statt regulär 6,99 € (−43 %)');
  // 4,49 € (PENNY-Preis ohne Rabatt) ist teurer als üblich -> kein Deal, aber Prozent gegen regulär
  const teurer = kontext('ben-jerrys', { preis: 4.49, menge: 465, shop: 'Penny' });
  assert.equal(teurer.deal, false);
  assert.equal(teurer.stufe, 'normal');
  assert.equal(teurer.regulaer.shop, 'Penny');
  // ≤ üblich, aber mehr als 10 % über dem Tiefst (3,79 € × 1,1 = 4,17 €) -> kein Deal
  assert.equal(kontext('ben-jerrys', { preis: 4.19, menge: 465, shop: 'Kaufland' }).deal, false);
  assert.equal(kontext('ben-jerrys', { preis: 4.17, menge: 465, shop: 'Kaufland' }).deal, true);
});

test('Knoppers: 15er vs. 8er getrennt; Kaufland 2,79 € (15er) ist kein Deal, weil 2,49 € mit Card das 12-Monats-Tief ist', () => {
  const k = kontext('knoppers-schnitte', { preis: 2.79, menge: 15, shop: 'Kaufland' });
  assert.equal(k.zeile, 'Jetzt 2,79 € · Regulär 3,49 € · Üblich im Angebot 2,79 € · Tiefst 12 Mon. 2,49 € (Kaufland mit Card, Okt. 2026)');
  assert.equal(k.regulaer.stand, 'Meldung ohne Datum');
  assert.equal(k.deal, false);
  assert.equal(k.stufe, 'ueblich');
  const acht = kontext('knoppers-schnitte', { preis: 1.49, menge: 8, shop: 'Kaufland' });
  assert.equal(acht.zeile, 'Jetzt 1,49 € · Regulär 2,79 € · Üblich im Angebot 1,59 € · Tiefst 12 Mon. 1,49 € (Kaufland, Sep. 2026)');
  assert.equal(acht.regulaer.shop, 'REWE', 'kein Kaufland-Regalpreis; Netto 2,49 € ist eine UVP -> REWE/EDEKA 2,79 €');
  assert.equal(acht.ueblich.anzahl, 4, 'REWE „nur für Berlin, nicht für Döbeln“ zählt nicht');
  assert.equal(acht.deal, true);
  assert.equal(acht.stufe, 'tiefst');
  // 24er: kein recherchierter Wert dieser Packung aus Döbeln -> umgerechnet über den Preis pro Stück (so markiert)
  const karton = kontext('knoppers-schnitte', { preis: 4.49, menge: 24, shop: 'Netto Marken-Discount' });
  assert.equal(karton.ueblich.umgerechnet, true);
  assert.equal(karton.tiefst12.umgerechnet, true);
});

test('Eigener Verlauf zählt mit (nur gleiche Packung): neuer Tiefstpreis aus Döbeln schlägt die Recherche', () => {
  const h = leereHistorie();
  eintragen(h, 'ben-jerrys', '100ml', { p: 0.73, shop: 'Kaufland', m: 465, pp: 3.39 }, Date.parse('2026-10-20T10:00:00Z'));
  eintragen(h, 'ben-jerrys', '100ml', { p: 0.5, shop: 'Kaufland', m: 100, pp: 0.5 }, Date.parse('2026-10-21T10:00:00Z')); // andere Packung
  eintragen(h, 'ben-jerrys', '100ml', { p: 0.6, shop: 'Kaufland' }, Date.parse('2026-10-22T10:00:00Z')); // alter Punkt ohne Packung
  const verlauf = verlaufEintraege(h.gruppen['ben-jerrys'], '100ml');
  assert.equal(verlauf.length, 2, 'Punkt ohne Packung zählt nicht');
  const k = kontext('ben-jerrys', { preis: 3.99, menge: 465, shop: 'Lidl' }, { verlauf });
  assert.deepEqual([k.tiefst12.pack, k.tiefst12.shop, k.tiefst12.monat, k.tiefst12.quelle], [3.39, 'Kaufland', 'Okt. 2026', 'eigener Verlauf']);
  assert.equal(k.ueblich.anzahl, 5);
  assert.equal(k.deal, false, '3,99 € > 3,39 € × 1,1');
  // 7 Tage dieselbe Aktion = 1 Angebot (nicht 7)
  const h2 = leereHistorie();
  for (let d = 0; d < 7; d++) eintragen(h2, 'g', '100ml', { p: 0.73, shop: 'Kaufland', m: 465, pp: 3.39 }, Date.parse('2026-10-19T10:00:00Z') + d * 864e5);
  assert.equal(verlaufEintraege(h2.gruppen.g, '100ml').length, 1);
});

test('Ältere Referenzwerte (> 90 Tage) bekommen ein „Stand …“; Tiefst immer mit Händler und Monat', () => {
  // Haribo XXL im Mai 2027: das letzte Lidl-Angebot (Okt. 2026) ist älter als 90 Tage
  const k = preisKontext({ ref: refs['haribo-colorado'], basis: '100g', angebot: { preis: 1.29, menge: 340, shop: 'Netto Marken-Discount' }, jetztMs: Date.parse('2027-05-01T10:00:00Z'), cfg });
  assert.match(k.regulaer.stand, /^Stand /);
  assert.equal(k.regulaer.shop, 'Netto Marken-Discount');
  assert.match(k.tiefst12.monat, /20\d\d$/);
  // November 2026: Netto-Regalpreis vom Dez. 2025 ist alt, Lidl-Preis vom Okt. 2026 nicht
  const jetzt = kontext('haribo-colorado', { preis: 0.99, menge: 340, shop: 'Lidl' });
  assert.equal(jetzt.regulaer.stand, '');
  assert.equal(kontext('haribo-colorado', { preis: 1.29, menge: 340, shop: 'Netto Marken-Discount' }).regulaer.stand, 'Stand Dez. 2025');
});

test('Crunchips X-Cut: keine Döbelner Werte recherchiert -> Action (mit Quelle) statt „unbekannt“', () => {
  const k = kontext('crunchips-xcut', { preis: 1.49, menge: 130, shop: 'REWE' });
  assert.deepEqual([k.regulaer.shop, k.regulaer.quelle], ['Action', 'action.com']);
  assert.equal(k.tiefst12.shop, 'Action');
  assert.ok(k.ueblich.recherche, 'üblich: recherchierter Wert (zu wenige Angebote)');
});

test('Prüfer-Funde: Grundpreis statt Packungspreis, UVP aus Stand/Quelle, Mo–Sa-Aktion einmal, nicht für Döbeln', () => {
  // 400 ml für 3,79 € = 0,95 €/100 ml ist NICHT das Tief (465 ml für 3,79 € = 0,815 €/100 ml)
  const klein = kontext('ben-jerrys', { preis: 3.79, menge: 400, shop: 'EDEKA' });
  assert.equal(klein.tiefst12.pack, 3.26, 'Tief umgerechnet auf 400 ml');
  assert.equal(klein.tiefst12.umgerechnet, true);
  assert.equal(klein.neuesTief, false);
  assert.equal(klein.deal, false);
  assert.equal(kontext('haribo-colorado', { preis: 0.99, menge: 300, shop: 'Lidl' }).stufe === 'tiefst', false, '300 g für 0,99 € ist teurer als 340 g für 0,99 €');
  // „von kaufDA als UVP markiert“ steht nur in der Quelle -> als UVP beschriftet
  const nuss = kontext('knoppers-nussriegel', { preis: 1.69, menge: 5, shop: 'REWE' });
  assert.equal(nuss.regulaer.uvp, true);
  // Netto Mo–Sa täglich gescannt = 1 Aktion; Kaufland Do–Mi ebenso
  const h = leereHistorie();
  for (let d = 0; d < 6; d++) eintragen(h, 'g', '100g', { p: 0.489, shop: 'Netto Marken-Discount', m: 225, pp: 1.1 }, Date.parse('2026-10-26T10:00:00Z') + d * 864e5);
  for (let d = 0; d < 7; d++) eintragen(h, 'g', '100g', { p: 0.391, shop: 'Kaufland', m: 225, pp: 0.88 }, Date.parse('2026-10-15T10:00:00Z') + d * 864e5);
  assert.equal(verlaufEintraege(h.gruppen.g, '100g').length, 2);
  assert.equal(ladenAus('REWE (bei marktguru nur für Berlin 10115, nicht für Döbeln 04720 gelistet)').rang, 9);
  assert.equal(ladenAus('REWE (mit App zusätzlich 0,10 € REWE Bonus)').app, false);
});
