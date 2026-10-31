import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice, parseMenge, fuelleMenge, einheitspreis, passt, stueckPasst, norm } from '../text.mjs';

test('Preise lesen', () => {
  assert.equal(parsePrice('1,99 €'), 1.99);
  assert.equal(parsePrice('1.299,00€'), 1299);
  assert.equal(parsePrice('12.99'), 12.99);
  assert.equal(parsePrice('249€'), 249);
  assert.equal(parsePrice('ab 3,4'), 3.4);
  assert.equal(parsePrice(''), null);
});

test('Packungsgrößen lesen', () => {
  assert.deepEqual(parseMenge('Knoppers 24 x 25 g'), { gramm: 600, stueck: 24 });
  assert.deepEqual(parseMenge('je 150-g-Beutel'), { gramm: 150 });
  assert.deepEqual(parseMenge('465-ml-Becher'), { ml: 465 });
  assert.deepEqual(parseMenge('1,5 l Flasche'), { ml: 1500 });
  assert.equal(parseMenge('Knoppers 24er-Pack').stueck, 24);
  assert.equal(parseMenge('4 x 5er Knoppers').stueck, 20);
  assert.equal(parseMenge('NussRiegel 5 Stück').stueck, 5);
});

test('Knoppers: 24er gegen 4×5er pro Stück fair verglichen', () => {
  const item = { basis: 'stueck', stueckGramm: 25 };
  const gross = einheitspreis(7.99, fuelleMenge(parseMenge('Knoppers 24er-Pack 600 g'), item), item);
  const klein = einheitspreis(4 * 1.49, fuelleMenge(parseMenge('4 x 5er Knoppers'), item), item);
  assert.equal(gross, 0.333);
  assert.equal(klein, 0.298);
  assert.ok(klein < gross);
  // only grams known -> pieces from grams per piece
  assert.equal(einheitspreis(2.0, fuelleMenge(parseMenge('Knoppers 125 g'), item), item), 0.4);
});

test('Grundpreis der Quelle hat Vorrang (pro kg -> pro 100 g)', () => {
  assert.equal(einheitspreis(1.11, { gramm: 150 }, { basis: '100g' }, { preis: 7.4, einheit: 'kg' }), 0.74);
  assert.equal(einheitspreis(4.99, { ml: 465 }, { basis: '100ml' }, null), 1.07);
});

test('Standardmenge, wenn nichts im Text steht', () => {
  const m = fuelleMenge({}, { basis: '100g', standardGramm: 150 });
  assert.equal(m.gramm, 150);
  assert.equal(m.geschaetzt, true);
});

test('Zuordnung zu Produkten', () => {
  const xcut = { muss: ['crunchips', 'x cut|xcut'] };
  const classic = { muss: ['crunchips'], nicht: ['x cut', 'xcut'] };
  assert.ok(passt('Lorenz Crunchips X-Cut Paprika', xcut));
  assert.ok(!passt('Lorenz Crunchips X-Cut Paprika', classic));
  assert.ok(passt('Lorenz Crunchips Paprika 150 g', classic));
  const rot = { muss: ['lachgummi', 'softys'], sorte: ['rote fruechte|rote frucht'] };
  const gelb = { muss: ['lachgummi', 'softys'], sorte: ['fruchtmix'], nicht: ['rote fruechte'] };
  assert.ok(passt('nimm2 Lachgummi Softys Rote Früchte', rot));
  assert.ok(!passt('nimm2 Lachgummi Softys Rote Früchte', gelb));
  assert.ok(passt('nimm2 Lachgummi Softys versch. Sorten', gelb), 'generische Angebote passen auf jede Sorte');
  assert.ok(passt("Ben & Jerry's Cookie Dough 465 ml", { muss: ['ben', 'jerry'] }));
  assert.equal(norm('Kopfhörer & Co.'), 'kopfhoerer und co.');
});

test('Stückzahl-Grenzen (24er vs 5er)', () => {
  const gross = { stueckMin: 15, stueckGramm: 25 };
  const klein = { stueckMax: 14, stueckGramm: 25 };
  assert.ok(stueckPasst({ stueck: 24 }, gross));
  assert.ok(!stueckPasst({ stueck: 5 }, gross));
  assert.ok(stueckPasst({ stueck: 5 }, klein));
  assert.ok(stueckPasst({ gramm: 600 }, gross));
  assert.ok(!stueckPasst({}, gross));
  assert.ok(stueckPasst({}, klein));
});
