// Nur krasse Preisfehler (Xander 07.11.2026): „4K-Fernseher für 35 €“ ja, „Switch-2-Spiel 49 → 39 €“ nein.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { krass, istSpiel, geraetAb, KRASS_STANDARD } from '../krass.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const ja = (titel, preis, preisVorher = null, r) => assert.equal(krass({ titel, preis, preisVorher }, r).ok, true, `${titel} ${preis}/${preisVorher} sollte drin sein`);
const nein = (titel, preis, preisVorher = null, r) => assert.equal(krass({ titel, preis, preisVorher }, r).ok, false, `${titel} ${preis}/${preisVorher} sollte raus`);

test('krass: Xanders Beispiele', () => {
  ja('Hisense 55" 4K UHD Smart TV für 35 €', 35); // ohne Vorher-Preis: Fernseher kosten ab ca. 200 €
  ja('Hisense 55" 4K UHD Smart TV für 35 € statt 399 €', 35, 399);
  nein('Mario Kart World (Switch 2) für 39 €', 39, 49); // Spiel im Angebot – kein Preisfehler
  ja('Donkey Kong Bananza – Nintendo Switch 2 Spiel für 0,99 €', 0.99, 69.99); // praktisch geschenkt
  ja('Donkey Kong Bananza – Nintendo Switch 2 Spiel für 1 €', 1); // ohne Vorher-Preis auch
  nein('Zelda Tears of the Kingdom – Switch 2 Edition', 9.99, 79.99); // −88 %: für Spiele zählt nur ≈ 1 €
  ja('Zelda Tears of the Kingdom – Switch 2 Edition', 1.49, 79.99); // ≈ 1 €
  nein('Zelda Tears of the Kingdom – Switch 2 Edition', 1.99, 69.99); // −97 %, aber 1,99 € ist nicht ≈ 1 €
  ja('Zelda Tears of the Kingdom – Switch 2 Edition', 1.59, 89.99); // −98 %
  nein('Zelda Tears of the Kingdom – Switch 2 Edition', 29.99, 79.99); // −62 %: nur Angebot
  nein('Pokémon Legends Z-A (Switch 2)', 4.99, 69.99, { spielMaxEuro: 2, spielMinProzent: 95 });
});

test('krass: Grenzen ≥ 75 % UND ≥ 20 € gespart; absurd billig; Zubehör und Unbekanntes raus', () => {
  ja('Lumaland Pop-Up Pavillon', 23.99, 96.99); // −75 %, 73 € (echter Fall 29.10.)
  nein('CAMELBAK Stash Belt', 6.98, 11.99); // −42 %
  nein('Samsung 55" QLED TV', 199, 499); // −60 % – Angebot, kein Preisfehler
  ja('Samsung 55" QLED TV', 29.99, 499);
  nein('USB-Stick 64 GB', 2, 9); // −78 %, aber nur 7 € gespart
  ja('Duschgel 6er-Pack', 1, 15); // absurd: 1 € statt 15 €
  nein('Samsung Galaxy S25 Hülle für 1 €', 1); // Zubehör ohne Vorher-Preis
  nein('Amazon Fire TV Stick 4K', 19); // Stick ist kein Fernseher
  nein('Zotac RTX 5070 Grafikkarte', 165); // 165 € ist für eine Grafikkarte nicht krass
  ja('Apple AirPods Pro 2 Preisfehler', 19);
  ja('PlayStation 5 Slim Digital für 44 €', 44);
  ja('Nintendo Switch 2 Konsole + Mario Kart World Bundle', 35);
  nein('Irgendwas ohne Vorher-Preis', 3);
  assert.deepEqual(krass({ titel: 'TV', preis: null, preisVorher: 300 }), { ok: false, grund: 'Preis unbekannt' });
  assert.equal(krass({ titel: 'Hisense 4K TV', preis: 35 }).grund, 'Fernseher kosten sonst ab ca. 200 €');
  assert.equal(krass({ titel: 'Hisense 4K TV', preis: 35 }).normalAb, 200);
});

test('krass: Spiel oder Gerät?', () => {
  for (const t of ['Mario Kart World (Switch 2)', 'Hogwarts Legacy [PS5]', 'EA Sports FC 26 PS5', 'Nintendo Switch 2 Spiel Kirby', 'Cyberpunk 2077 Switch 2 Edition']) assert.equal(istSpiel(t), true, t);
  for (const t of ['PlayStation 5 Slim Digital', 'Nintendo Switch 2 Konsole + Mario Kart World Bundle', 'Xbox Wireless Controller', 'Brettspiel Catan', 'Samsung 4K TV']) assert.equal(istSpiel(t), false, t);
  assert.equal(geraetAb('LG OLED TV 65 Zoll').ab, 200);
  assert.equal(geraetAb('LG OLED TV Wandhalterung'), null);
});

test('krass: Grenzen stehen in der config (preisfehler.krass) und gleichen dem Standard', async () => {
  const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
  const { _hinweis, ...k } = cfg.preisfehler.krass;
  assert.deepEqual(k, { ...KRASS_STANDARD });
});
