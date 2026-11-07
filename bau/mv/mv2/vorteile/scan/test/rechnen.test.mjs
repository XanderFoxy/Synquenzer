import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAktion, rechne, bestesAngebot, vergleichePackungen, stapelCoupons } from '../rechnen.mjs';

test('Crunchips-Testfall: 2 Tüten für 0,88 €, 5× erlaubt, +25 g -> 10 Tüten für 4,40 €', () => {
  const r = rechne({
    shop: 'Kaufland', text: 'Lorenz Crunchips 2 Tüten für 0,88 € – max. 5x pro Kunde – jetzt +25 g gratis',
    gramm: 150, normalEinzelpreis: 1.99, normalGramm: 150,
  });
  assert.equal(r.aktion.art, 'buendel');
  assert.equal(r.aktion.limit, 5);
  assert.equal(r.packungen, 10);
  assert.equal(r.zahlen, 4.4);
  assert.equal(r.normalGesamt, 19.9);
  assert.equal(Math.round(r.ersparnis * 100), 78);
  assert.equal(r.gramm, 175);
  assert.equal(Math.round(r.pro100 * 100) / 100, 0.25);
  assert.equal(Math.round(r.normalPro100 * 100) / 100, 1.33);
  assert.ok(r.lohnt);
  assert.match(r.soGehts, /Kaufland.*5× „2 für 0,88\s€“.*10 Packungen.*4,40\s€/);
});

test('Kaufland-Aktion schlägt 0,99 € woanders', () => {
  const kaufland = rechne({ shop: 'Kaufland', text: '2 Tüten für 0,88 € max. 5x pro Kunde +25 g gratis', gramm: 150, normalEinzelpreis: 1.99 });
  const anders = rechne({ shop: 'Netto', text: 'Crunchips', einzelpreis: 0.99, gramm: 150, normalEinzelpreis: 1.99 });
  assert.equal(bestesAngebot([anders, kaufland]), kaufland);
});

test('Mehrkauf-Varianten werden erkannt', () => {
  assert.deepEqual(pick(parseAktion('Haribo 3 zum Preis von 2')), { art: 'mehrkauf', anzahl: 3, zahlen: 2 });
  assert.deepEqual(pick(parseAktion('2 für 1 auf alle Sorten')), { art: 'mehrkauf', anzahl: 2, zahlen: 1 });
  assert.deepEqual(pick(parseAktion('Zweite Packung gratis!')), { art: 'mehrkauf', anzahl: 2, zahlen: 1 });
  assert.equal(parseAktion('2. Artikel -50%').art, 'zweitesRabatt');
  assert.equal(parseAktion('Zweites zum halben Preis').rabatt, 0.5);
  assert.equal(parseAktion('Knoppers 8er 2,49 €').art, null);
  const r = rechne({ text: '3 für 2', einzelpreis: 1.5, gramm: 200, normalEinzelpreis: 1.5, maxPackungen: 6 });
  assert.equal(r.packungen, 6); assert.equal(r.zahlen, 6);
});

test('Limit in Stück begrenzt die Bündel', () => {
  const r = rechne({ text: '2 Stück für 3,00 € Abgabe max. 4 Stück pro Kunde', gramm: 100, normalEinzelpreis: 2.49 });
  assert.equal(r.packungen, 4);
  assert.equal(r.zahlen, 6);
});

test('Coupons stapeln: ein Markt-Coupon (der beste) + Cashback, Versand zählt mit', () => {
  const a = parseAktion('Crunchips 1,29 € | Kaufland Card Coupon 20 % | Coupon 0,10 € | Scondoo Cashback 0,50 € | Marktguru Cashback 0,30 €');
  assert.equal(a.coupons.length, 4);
  const s = stapelCoupons(a.coupons, 2.58);
  assert.deepEqual(s.map(c => c.name), ['Kaufland Card', 'Scondoo', 'Marktguru Cashback']);
  const r = rechne({ text: 'Lidl Plus Coupon 0,50 € Rabatt', einzelpreis: 3, versand: 4.95, gramm: 500, normalEinzelpreis: 3, maxPackungen: 1 });
  assert.equal(r.zahlen, 7.45);
  assert.equal(r.lohnt, false); // mit Versand teurer als normal
});

test('Aktion, die nicht günstiger ist, wird nicht empfohlen', () => {
  const r = rechne({ text: '2 Stück für 3,00 €', einzelpreis: 1.29, gramm: 100, normalEinzelpreis: 1.49 });
  assert.equal(r.lohnt, false);
  assert.match(r.soGehts, /Nur 1 Packung/);
});

test('Größere Packung, die pro 100 g teurer ist, wird markiert', () => {
  const v = vergleichePackungen([{ name: '150 g', preis: 1.19, gramm: 150 }, { name: 'XXL 250 g', preis: 2.29, gramm: 250 }]);
  assert.equal(v.beste.name, '150 g');
  assert.ok(v.alle.find(p => p.name === 'XXL 250 g').schlechter);
});

const pick = a => ({ art: a.art, anzahl: a.anzahl, zahlen: a.zahlen });
