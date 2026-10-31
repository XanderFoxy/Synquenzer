import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice, parseMenge, fuelleMenge, einheitspreis, passt, stueckPasst, norm, ohneGrundpreis, bestimmeMenge, packungText,
  istSammeldeal, sammelTeil, termTrifft, euroKurz, zeitpunktText } from '../text.mjs';

test('Preise lesen', () => {
  assert.equal(parsePrice('1,99 €'), 1.99);
  assert.equal(parsePrice('1.299,00€'), 1299);
  assert.equal(parsePrice('12.99'), 12.99);
  assert.equal(parsePrice('249€'), 249);
  assert.equal(parsePrice('ab 3,4'), 3.4);
  assert.equal(parsePrice(''), null);
});

test('Packungsgrößen lesen', () => {
  assert.deepEqual(parseMenge('Knoppers 24 x 25 g'), { gramm: 600, stueck: 24, ausMulti: true });
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

// --- echte Texte vom 31.10.2026 (marktguru, PLZ 04720) ---

test('Grundpreis ist nie die Packungsgröße', () => {
  assert.deepEqual(parseMenge('Knoppers 1 kg = 7,44'), {});
  assert.deepEqual(parseMenge('Haribo 175 g (100 g = 0,49 €)'), { gramm: 175 });
  assert.deepEqual(parseMenge('Haribo 175 g 2,79 €/kg'), { gramm: 175 });
  assert.deepEqual(parseMenge('Lorenz 150 g, Grundpreis: 1 kg = 7,40 €'), { gramm: 150 });
  assert.deepEqual(parseMenge('Crunchips 0,74 € pro 100 g, Beutel 150 g'), { gramm: 150 });
  assert.deepEqual(parseMenge('375 g = 2,79 €'), { gramm: 375 }, 'Packung = Preis ist kein Grundpreis');
  assert.deepEqual(parseMenge('super 1 l Flasche'), { ml: 1000 }, '„per“ nur als eigenes Wort');
  assert.ok(!ohneGrundpreis('1 kg = 7,44 €').includes('kg'));
});

test('Knoppers Kaufland: „je 15 St. = 375-g-Packg.“ = 15 Stück, 375 g (nicht 1 kg / 40 Stück)', () => {
  assert.deepEqual(parseMenge('Storck Knoppers Milch-Haselnuss-Schnitte mit knuspriger Waffel je 15 St. = 375-g-Packg.'), { gramm: 375, stueck: 15 });
  // so sah die Beschreibung früher aus (eigener Zusatz „0.375 1 kg“) – der Zusatz fällt jetzt in marktguruAngebot weg
  const item = { basis: 'stueck', stueckGramm: 25, standardStueck: 5 };
  const o = { quelle: 'marktguru', titel: 'Storck Knoppers Milch-Haselnuss-Schnitte', beschreibung: 'mit knuspriger Waffel je 15 St. = 375-g-Packg.',
    packMenge: { gramm: 375 }, refPreis: { preis: 7.44, einheit: 'kg' } };
  const m = bestimmeMenge(o, item);
  assert.deepEqual(m, { menge: { gramm: 375, stueck: 15 }, packung: '15 × 25 g', mengeSicher: true, mengeQuelle: 'grundpreis' });
  assert.equal(einheitspreis(2.79, m.menge, item), 0.186);
  assert.equal(euroKurz(0.186), '0,19 €');
});

test('Stückzahl nur aus ausdrücklichen Angaben oder sicherem Gewicht', () => {
  const item = { basis: 'stueck', stueckGramm: 25, standardStueck: 5 };
  // Gewicht sicher (Grundpreis), keine Stückzahl im Text -> 375 g / 25 g = 15
  assert.deepEqual(bestimmeMenge({ titel: 'Knoppers', beschreibung: 'versch. Sorten', packMenge: { gramm: 375 } }, item).menge, { gramm: 375, stueck: 15 });
  // gar nichts bekannt -> Vorgabe 5 Stück, aber unsicher (nie Alarm, keine Prozentangabe)
  const nix = bestimmeMenge({ titel: 'Knoppers', beschreibung: 'Aktion' }, item);
  assert.deepEqual(nix, { menge: { stueck: 5 }, packung: null, mengeSicher: false, mengeQuelle: 'vorgabe' });
  // Widerspruch: „5er“ aber 375 g -> unsicher
  assert.equal(bestimmeMenge({ titel: 'Knoppers 5er', beschreibung: '', packMenge: { gramm: 375 } }, item).mengeSicher, false);
  // Gewicht passt nicht zu ganzen Stücken (z. B. 200-g-Beutel Minis bei 25 g/Stück wäre 8 – passt; 210 g nicht)
  assert.equal(bestimmeMenge({ titel: 'Knoppers', beschreibung: '', packMenge: { gramm: 210 } }, item).mengeSicher, false);
  assert.equal(bestimmeMenge({ titel: 'Knoppers 24er-Pack, 600 g', beschreibung: '' }, item).packung, '24 × 25 g');
  // Quelle widerspricht sich selbst (volume ≠ Preis ÷ Grundpreis) -> unsicher, auch wenn der Text klar klingt
  assert.equal(bestimmeMenge({ titel: 'Knoppers', beschreibung: 'je 15 St. = 375-g-Packg.', packWiderspruch: true }, item).mengeSicher, false);
});

test('Ben & Jerry\'s „465/4x100ml“: 465 ml laut Grundpreis ODER 4 × 100 ml zum selben Preis – beide genannt', () => {
  const item = { basis: '100ml', standardMl: 465 };
  const m = bestimmeMenge({ quelle: 'marktguru', titel: "Ben & Jerry's Eiscreme", beschreibung: '465/4x100ml', packMenge: { ml: 465 },
    refPreis: { preis: 8.58, einheit: 'l' } }, item);
  assert.deepEqual(m, { menge: { ml: 465 }, packung: '465 ml oder 4 × 100 ml', mengeSicher: true, mengeQuelle: 'grundpreis', alternativ: { ml: 400, stueck: 4 } });
  assert.equal(einheitspreis(3.99, m.menge, item, { preis: 8.58, einheit: 'l' }), 0.86);
  assert.equal(einheitspreis(3.99, m.alternativ, item, null), 1, 'die 4 × 100 ml kosten 1,00 € pro 100 ml');
});

test('Sammeldeal (mehrere Produkte mit eigenem Preis): nur der eigene Teil, Menge unsicher', () => {
  const titel = '[Penny] Ben Jerrys 3,49 / Kartoffeln 7,5KG 4,44 / Zwiebeln 3KG 1,99 / Oatly Barista 1,79 / Die Ofenfrische 1,79 /';
  assert.equal(istSammeldeal(titel), true);
  assert.equal(istSammeldeal('Knoppers für 2,79 € statt 3,99 €'), false);
  assert.deepEqual(sammelTeil(titel, { muss: ['ben', 'jerry'] }), { titel: '[Penny] Ben Jerrys 3,49', preis: 3.49 });
  assert.equal(sammelTeil(titel, { muss: ['knoppers'] }), null);
  const m = bestimmeMenge({ quelle: 'mydealz', titel, beschreibung: '' }, { basis: '100ml', standardMl: 465 });
  assert.equal(m.mengeSicher, false, 'die 7,5 kg gehören zu den Kartoffeln');
  assert.equal(m.mengeQuelle, 'vorgabe');
});

test('Packung nie aus Vorgaben der Merkliste zusammengesetzt', () => {
  // nur Stückzahl im Text, Grundpreis vorhanden: Preis pro 100 g sicher (Grundpreis), Packung nur „5 Stück“
  const m = bestimmeMenge({ titel: 'Haribo Colorado', beschreibung: '5 Stück', refPreis: { preis: 4.9, einheit: 'kg' } }, { basis: '100g', standardGramm: 175 });
  assert.equal(m.packung, '5 Stück');
  assert.equal(m.mengeSicher, true);
  assert.equal(m.menge.gramm, 175);
});

test('Mehrdeutige Mengen ohne Grundpreis sind unsicher', () => {
  const m = bestimmeMenge({ quelle: 'mydealz', titel: 'Haribo Colorado 175 g / 360 g', beschreibung: '' }, { basis: '100g', standardGramm: 175 });
  assert.equal(m.mengeSicher, false);
});

test('Packung als Text', () => {
  assert.equal(packungText({ stueck: 15, gramm: 375 }), '15 × 25 g');
  assert.equal(packungText({ stueck: 4, ml: 400 }), '4 × 100 ml');
  assert.equal(packungText({ gramm: 1500 }), '1,5 kg');
  assert.equal(packungText({ ml: 465 }), '465 ml');
  assert.equal(packungText({ stueck: 5 }), '5 Stück');
  assert.equal(packungText({}), null);
});

test('Kurze Suchwörter nur am Wortanfang (Minis ≠ Schnitte, Eis ≠ Preis)', () => {
  assert.ok(termTrifft('Storck Knoppers Minis', 'mini'));
  assert.ok(termTrifft('Knoppers Eis Sandwich', 'eis'));
  assert.ok(!termTrifft('Knoppers zum Bestpreis', 'eis'));
  assert.ok(!termTrifft('Lebensmittel', 'ben'));
  const knoppers = { muss: ['knoppers'], nicht: ['nussriegel', 'riegel', 'mini', 'eis', 'bites'] };
  assert.ok(passt('Storck Knoppers Milch-Haselnuss-Schnitte mit knuspriger Waffel je 15 St. = 375-g-Packg.', knoppers));
  assert.ok(!passt('Storck Knoppers Minis Milch-Haselnuss Schnitten, je 200 g', knoppers), 'Minis sind ein anderes Produkt');
  assert.ok(!passt('Knoppers NussRiegel 5 x 40 g', knoppers));
  assert.ok(passt('Knoppers zum Bestpreis, 8 x 25 g', knoppers));
});

test('Zeitpunkt deutsch (Berliner Zeit)', () => {
  assert.equal(zeitpunktText('2026-10-31T18:00:00Z'), 'Sa 31.10. 19:00');
  assert.equal(zeitpunktText('2026-10-31T22:59:00Z'), 'Sa 31.10.');
  assert.equal(zeitpunktText('2026-11-01T23:00:00Z'), 'Mo 02.11.');
});
