import test from 'node:test';
import assert from 'node:assert/strict';
import { leereHistorie, eintragen, statistik, median, aufraeumen } from '../history.mjs';
import { referenz, bewerte, versandkosten, technikBewertung, altpreisAus } from '../deals.mjs';

const cfg = {
  deal: { rabattMin: 0.25, tiefstpreisMinPunkte: 10, tiefstpreisMinRabatt: 0.1, historieMinTage: 5, normalpreisFensterTage: 56, technikRabattMin: 0.6 },
  versand: { amazonPrime: false, amazonKostenlosAb: 39, amazonKosten: 3.99, standardKosten: 4.95 },
};
const T0 = Date.parse('2026-09-01T12:00:00Z');

test('Median', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
});

test('Historie: Normalpreis = Median der letzten 8 Wochen, Tiefstpreis', () => {
  const h = leereHistorie();
  for (let d = 0; d < 70; d++) eintragen(h, 'g', '100g', { p: d < 14 ? 0.5 : 1.0, shop: 'A' }, T0 + d * 864e5);
  eintragen(h, 'g', '100g', { p: 0.9, shop: 'A' }, T0 + 69 * 864e5); // same day -> keeps the lower one
  const s = statistik(h, 'g', 56, T0 + 69 * 864e5);
  assert.equal(s.normal, 1.0);
  assert.equal(s.tiefst.p, 0.5);
  assert.equal(h.gruppen.g.punkte.length, 70);
  aufraeumen(h, 30, T0 + 69 * 864e5);
  assert.equal(h.gruppen.g.punkte.length, 31);
  assert.equal(h.gruppen.g.tiefst.p, 0.5, 'Tiefstpreis bleibt nach dem Aufräumen erhalten');
});

test('Referenz: Schätzung bis genug Historie da ist', () => {
  const item = { normalpreis: 1.6 };
  assert.deepEqual(referenz(item, { normal: 1.2, tage: 2 }, cfg), { p: 1.6, quelle: 'schaetzung' });
  assert.deepEqual(referenz(item, { normal: 1.2, tage: 9 }, cfg), { p: 1.2, quelle: 'historie' });
  assert.deepEqual(referenz({ ...item, normalpreisFest: true }, { normal: 1.2, tage: 9 }, cfg), { p: 1.6, quelle: 'fest' });
});

test('Deal-Entscheidung', () => {
  const stats = { tiefst: { p: 0.9 }, punkte: 20 };
  assert.equal(bewerte({ einheitspreis: 1.2 }, { p: 1.6 }, stats, cfg).deal, true);   // 25 %
  assert.equal(bewerte({ einheitspreis: 1.3 }, { p: 1.6 }, stats, cfg).deal, false);  // 19 %
  const tief = bewerte({ einheitspreis: 0.9 }, { p: 1.1 }, stats, cfg);               // 18 %, but historical low
  assert.equal(tief.deal, true);
  assert.match(tief.grund, /Tiefstpreis/);
  assert.equal(bewerte({ einheitspreis: 0.9 }, { p: 1.1 }, { tiefst: { p: 0.9 }, punkte: 3 }, cfg).deal, false, 'zu wenig Verlauf');
});

test('Versandkosten', () => {
  assert.equal(versandkosten({ online: false, preis: 1 }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 6.49, titel: 'Knoppers' }, cfg), 3.99);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 45, titel: 'x' }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Otto', preis: 5, titel: 'x versandkostenfrei' }, cfg), 0);
  assert.equal(versandkosten({ online: true, shop: 'Otto', preis: 5, titel: 'x' }, cfg), 4.95);
  assert.equal(versandkosten({ online: true, shop: 'Amazon', preis: 5, versand: 0, titel: 'x' }, cfg), 0);
});

test('Technik-Preisfehler', () => {
  const technik = { woerter: ['tv', 'ps5', 'playstation', 'kopfhoerer'] };
  assert.equal(altpreisAus('für 29,99 € statt 499 €'), 499);
  assert.equal(technikBewertung({ titel: 'Samsung QLED TV für 29,99 € statt 499 €', preis: 29.99 }, technik, cfg).deal, true);
  assert.equal(technikBewertung({ titel: 'Sony Kopfhörer für 249 €', beschreibung: 'UVP 419 €', preis: 249 }, technik, cfg), null);
  assert.equal(technikBewertung({ titel: 'PlayStation 5 für 44 €', preis: 44, preisfehlerFeed: true }, technik, cfg).deal, true);
  assert.equal(technikBewertung({ titel: 'Tchibo Kaffee statt 30 € nur 5 €', preis: 5 }, technik, cfg), null, 'keine Technik');
  assert.equal(technikBewertung({ titel: 'Tvorog Quark', preis: 1 }, technik, cfg), null, 'kurze Wörter nur als ganzes Wort');
});
