// „Auf Amazon ansehen“: Suchwörter aus Produktnamen und Angebotstiteln (Mengen, Preise, Shopnamen raus),
// Link ohne Partner-Tag, Preisvergleich nur mit einem echten Amazon-Angebot aus den Daten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { amazonSuchwort, amazonLink, amazonVergleich, istAmazon } from '../lib/amazon.mjs';

test('Suchwort: Mengen („200 g“, „6x“, „24er-Pack“, „4 × 100 ml“) und Preise raus', () => {
  const faelle = [
    ['Haribo Goldbären 200 g', 'Haribo Goldbären'],
    ['Haribo Goldbären 200g', 'Haribo Goldbären'],
    ['Coca-Cola Zero 6x 1,5 l', 'Coca-Cola Zero'],
    ['Coca-Cola Zero 6 x 1,5l', 'Coca-Cola Zero'],
    ['Red Bull x24', 'Red Bull'],
    ['Knoppers 24er Pack (24 x 25 g) für 6,49 € (Prime Spar-Abo)', 'Knoppers'],
    ['Knoppers 5er-Pack', 'Knoppers'],
    ['Storck Knoppers Milch-Haselnuss-Schnitte 15 × 25 g', 'Storck Knoppers Milch-Haselnuss-Schnitte'],
    ["Ben & Jerry's Eiscreme 465 ml oder 4 × 100 ml", "Ben & Jerry's Eiscreme"],
    ['Pringles 6 x 185 g', 'Pringles'],
    ['Nivea Duschgel 250ml – 3 für 2', 'Nivea Duschgel'],
    ['Milka Schokolade 100 g je 0,79 € versch. Sorten', 'Milka Schokolade'],
    ['Persil Color 20 WL', 'Persil Color'],
  ];
  for (const [ein, aus] of faelle) assert.equal(amazonSuchwort(ein), aus, ein);
});

test('Suchwort: Shopnamen, Klammern und Prospekt-Wörter raus; Marken mit Ziffern bleiben', () => {
  const faelle = [
    ['[Kaufland] Haribo Goldbären 175g für 0,88€ (Angebot ab 3.11.)', 'Haribo Goldbären'],
    ['[Kaufland | Xtra] Ben & Jerry\'s Eis - verschiedene Sorten', "Ben & Jerry's Eis"],
    ['Knoppers Schnitte bei Kaufland (Prospekt Chemnitz)', 'Knoppers Schnitte'],
    ['Lorenz Crunchips bei Netto Marken-Discount', 'Lorenz Crunchips'],
    ['ABGELAUFEN Lorenz Crunchips', 'Lorenz Crunchips'],
    ['Aldi Süd: Lindt Excellence 70 %', 'Lindt Excellence'],
    ['nimm2 Lachgummi Softies Fruchtmix (gelbe Tüte)', 'nimm2 Lachgummi Softies Fruchtmix'],
    ['Exquisa Quark (Quark-Genuss / Quark Creme)', 'Exquisa Quark'],
    ['Lorenz Crunchips X-Cut', 'Lorenz Crunchips X-Cut'],
    ['Zetti Knusperflocken XXL', 'Zetti Knusperflocken XXL'],
    ['Müller Milchreis Klassik', 'Müller Milchreis Klassik'], // Müller ist auch eine Marke
  ];
  for (const [ein, aus] of faelle) assert.equal(amazonSuchwort(ein), aus, ein);
  for (const leer of ['', null, undefined, '200 g', 'bei Netto Marken-Discount', '[Lidl] 0,99 €']) assert.equal(amazonSuchwort(leer), '', String(leer));
});

test('Link: nur amazon.de-Suche, sauber kodiert, kein Partner-Tag; ohne Suchwort kein Link', () => {
  assert.equal(amazonLink('Haribo Goldbären 200 g'), 'https://www.amazon.de/s?k=Haribo+Goldb%C3%A4ren');
  assert.equal(amazonLink("Ben & Jerry's Eis (alle Sorten)"), 'https://www.amazon.de/s?k=Ben+%26+Jerry%27s+Eis');
  assert.equal(amazonLink('200 g'), null);
  const l = amazonLink('Knoppers Schnitte bei Kaufland');
  assert.equal(new URL(l).host, 'www.amazon.de');
  assert.deepEqual([...new URL(l).searchParams.keys()], ['k']);
  assert.doesNotMatch(l, /tag=|ref=|linkCode/);
  // höchstens 8 Wörter
  assert.equal(amazonSuchwort('a1 b2 c3 d4 e5 f6 g7 h8 i9 j10').split(' ').length, 8);
});

test('Vergleich: je Einheit bei sicheren Mengen, sonst nur gleiche Packung, sonst keiner', () => {
  const kaufland = { shop: 'Kaufland', preis: 1.49, packung: '5 × 25 g', mengeSicher: true, einheitspreis: 0.298 };
  const amazon = { shop: 'Amazon', preis: 10.48, packung: '24 × 25 g', mengeSicher: true, einheitspreis: 0.437 };
  assert.deepEqual(amazonVergleich(kaufland, amazon), { urteil: 'guenstiger', basis: 'einheit' });
  assert.deepEqual(amazonVergleich({ ...kaufland, einheitspreis: 0.5 }, amazon), { urteil: 'teurer', basis: 'einheit' });
  assert.deepEqual(amazonVergleich({ ...kaufland, einheitspreis: 0.439 }, amazon), { urteil: 'gleich', basis: 'einheit' });
  // Menge unsicher, aber gleiche Packung -> Packungspreis
  assert.deepEqual(amazonVergleich({ preis: 0.99, packung: '225 g', mengeSicher: false }, { preis: 1.22, packung: '225 g', mengeSicher: false }), { urteil: 'guenstiger', basis: 'packung' });
  // Menge unsicher und andere Packung -> kein Urteil (nur der Preis)
  assert.equal(amazonVergleich({ preis: 3.49, packung: null, mengeSicher: false }, amazon), null);
  assert.equal(amazonVergleich(kaufland, null), null);
  assert.equal(istAmazon('Amazon.de (Prime)'), true);
  assert.equal(istAmazon('Kaufland'), false);
});
