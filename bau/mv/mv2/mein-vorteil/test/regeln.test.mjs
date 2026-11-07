// Gleiche Regeln überall (ohne Browser): die Seite hat die Krypto-Zonen und die Preisfehler-Regeln eingebaut –
// sie müssen Wort für Wort bzw. Fall für Fall gleich sein wie krypto/zonen.mjs und die krass.mjs der beiden Wecker.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as krassSchn from '../../schnaeppchen/scan/krass.mjs';
import * as krassVort from '../../vorteile/scan/lib/krass.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const SEITE = await readFile(join(HIER, '..', 'index.html'), 'utf8');
const block = (text, a, b) => { const i = text.indexOf(a), j = text.indexOf(b); assert.ok(i >= 0 && j > i, `${a} … ${b} fehlt`); return text.slice(i, j + b.length); };

test('Krypto-Zonen: Block in der Seite = krypto/zonen.mjs (ohne „export “)', async () => {
  const modul = await readFile(join(HIER, '..', '..', 'krypto', 'zonen.mjs'), 'utf8');
  const m = block(modul, '// <krypto-zonen>', '// </krypto-zonen>').replace(/^export /gm, '');
  const s = block(SEITE, '// <krypto-zonen>', '// </krypto-zonen>');
  assert.equal(s, m);
});

test('Preisfehler-Regeln: Seite entscheidet wie beide Wecker (krass.mjs), Grenzen gleich', async () => {
  assert.equal(await readFile(join(HIER, '..', '..', 'schnaeppchen', 'scan', 'krass.mjs'), 'utf8'), await readFile(join(HIER, '..', '..', 'vorteile', 'scan', 'lib', 'krass.mjs'), 'utf8'));
  const code = block(SEITE, '// --- Krasse Preisfehler', '// --- Text-Regeln');
  const seite = new Function(`${code}\nreturn { krass, istSpiel, geraetAb, KRASS_STANDARD };`)();
  assert.deepEqual({ ...seite.KRASS_STANDARD }, { ...krassSchn.KRASS_STANDARD });
  const faelle = [
    ['Hisense 55" 4K UHD Smart TV', 35, null], ['Hisense 55" 4K UHD Smart TV', 35, 399], ['Mario Kart World (Switch 2)', 39, 49],
    ['Donkey Kong Bananza – Nintendo Switch 2 Spiel', 0.99, 69.99], ['Donkey Kong Bananza – Nintendo Switch 2 Spiel', 1, null],
    ['Zelda – Switch 2 Edition', 9.99, 79.99], ['Zelda – Switch 2 Edition', 1.49, 79.99], ['Zelda – Switch 2 Edition', 1.99, 69.99],
    ['Lumaland Pop-Up Pavillon', 23.99, 96.99], ['CAMELBAK Stash Belt', 6.98, 11.99], ['Samsung 55" QLED TV', 199, 499],
    ['USB-Stick 64 GB', 2, 9], ['Duschgel 6er-Pack', 1, 15], ['Samsung Galaxy S25 Hülle', 1, null], ['Amazon Fire TV Stick 4K', 19, null],
    ['Zotac RTX 5070 Grafikkarte', 165, null], ['PlayStation 5 Slim Digital', 44, null], ['Irgendwas', 3, null], ['TV', null, 300],
    ['Hogwarts Legacy [PS5]', 1.2, null], ['Xbox Wireless Controller', 3, 59.99], ['LG OLED TV Wandhalterung', 5, null],
  ];
  for (const [titel, preis, preisVorher] of faelle) {
    const e = { titel, preis, preisVorher };
    const a = seite.krass(e), b = krassSchn.krass(e), c = krassVort.krass(e);
    assert.deepEqual(a, b, `Seite ≠ Schnäppchen-Wecker: ${titel} ${preis}/${preisVorher}`);
    assert.deepEqual(b, c);
  }
});

test('Spiele nur ≈ 1 €, 4K-TV für 35 € drin (Xander 07.11.2026)', () => {
  const { krass } = krassSchn;
  assert.equal(krass({ titel: 'Hisense 55" 4K TV', preis: 35 }).ok, true);
  assert.equal(krass({ titel: 'Mario Kart World (Switch 2)', preis: 39, preisVorher: 49 }).ok, false);
  assert.equal(krass({ titel: 'Mario Kart World (Switch 2)', preis: 9.99, preisVorher: 79.99 }).ok, false);
  assert.equal(krass({ titel: 'Mario Kart World (Switch 2)', preis: 0.99, preisVorher: 79.99 }).ok, true);
});
