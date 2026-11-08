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

// Fassung 5: Produkte und feste Adressen der Seite = Wecker-Einstellungen (sonst erkennt die Seite andere Dinge als der Wecker)
const seiteKonst = (name, ende) => {
  const i = SEITE.indexOf(`const ${name} = `), j = SEITE.indexOf(ende, i);
  assert.ok(i >= 0 && j > i, `${name} fehlt`);
  return new Function(`${SEITE.slice(i, j + ende.length)}\nreturn ${name};`)();
};
test('Meine Produkte: STANDARD_PRODUKTE der Seite = schnaeppchen/watchlist.json (id, name, muss, nicht, sorte, andereSorten, sorteOffen)', async () => {
  const w = JSON.parse(await readFile(join(HIER, '..', '..', 'schnaeppchen', 'watchlist.json'), 'utf8'));
  const seite = seiteKonst('STANDARD_PRODUKTE', '\n];');
  const felder = p => Object.fromEntries(['id', 'name', 'muss', 'nicht', 'sorte', 'andereSorten', 'sorteOffen'].filter(k => p[k] != null).map(k => [k, p[k]]));
  assert.deepEqual(seite.map(felder), w.produkte.map(felder));
});
test('Feste Adressen (Auftritte, Remix, Unterricht): stehen so in vorteile/config.json (Titel, Link, Bewerbungsweg)', async () => {
  const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'vorteile', 'config.json'), 'utf8'));
  const seite = seiteKonst('FUNDORTE', '\n};');
  for (const b of ['auftritte', 'remix', 'unterricht']) {
    const conf = cfg.module[b].fundorte;
    assert.equal(seite[b].length, conf.length, b);
    for (const f of seite[b]) {
      const c = conf.find(x => x.link === f.link);
      assert.ok(c, `${b}: ${f.link} fehlt in der config`);
      assert.equal(f.titel, c.titel);
      assert.deepEqual(f.bewerbung ?? null, c.bewerbung ?? null, f.titel);
      assert.equal(f.typ, c.typ);
      assert.deepEqual(f.saison ?? null, c.saison ?? null, f.titel);
    }
  }
});

test('Geräte sind keine Filme: gleiche Regel in Seite (FILM_GERAET), filme.js (GERAET) und Radar (GERAET_TITEL)', async () => {
  const quelle = (text, name) => { const m = text.match(new RegExp(`const ${name} = (/.+/i);`)); assert.ok(m, name); return m[1]; };
  const radar = await readFile(join(HIER, '..', '..', 'vorteile', 'scan', 'module', 'filme.mjs'), 'utf8');
  const filmeJs = await readFile(join(HIER, '..', 'filme.js'), 'utf8');
  const r = quelle(radar, 'GERAET_TITEL');
  assert.equal(quelle(SEITE, 'FILM_GERAET'), r);
  assert.equal(quelle(filmeJs, 'GERAET'), r);
  const re = new Function(`return ${r}`)();
  // echte Titel der mydealz-Gruppe apple-tv vom 08.11.2026
  for (const g of ['Apple TV 4K (2026)', 'Apple TV 4K (4. Generation) 2026 Version AMAZON', 'Apple TV 4K 32GB HDR 1. Generation A1842 MQD22FD (Gebraucht)']) assert.equal(re.test(g), true, g);
  for (const f of ['Manta Manta (1991) für 3,99 €', 'Flash Gordon ~ 3,99€ | UHD digital | Apple TV', '[Apple TV/Prime Video] Evil Dead Burn in 4K mit Dolby Vision', 'Kingsglaive: Final Fantasy XV ~ 3,99€ | UHD digital | Apple TV']) assert.equal(re.test(f), false, f);
});
