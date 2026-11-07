// MV2 (07.11.2026): nur krasse Preisfehler, Gewinnspiele ohne Kauf, Geld-zurück/Cashback auch aus mydealz Lebensmittel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheDealPruefer } from '../lib/mydealz.mjs';
import { preisfehlerEintrag } from '../module/gemeinsam.mjs';
import { bewerteTest } from '../module/tests.mjs';
import praemien from '../module/praemien.mjs';
import { krass, KRASS_STANDARD } from '../lib/krass.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const AM_29 = new Date('2026-10-29T19:00:00Z');

test('Preisfehler im Radar: Lumaland (−75 %, 73 € gespart) bleibt, CAMELBAK (−42 %) fliegt raus', async () => {
  const luma = await readFile(join(FX, 'echt', 'deal-2861129-lumaland-laeuft.html'), 'utf8');
  const it = { titel: 'Möglicher Preisfehler: Lumaland Pavillon', link: 'https://www.mydealz.de/deals/x-2861129', datum: '2026-10-29T11:26:13Z', preisText: '23,99€', beschreibung: '', feed: 'mydealz Preisfehler' };
  const pruefer = macheDealPruefer({ holeText: async () => luma, jetzt: AM_29 });
  const r = await preisfehlerEintrag(it, { kategorie: 'deals', pruefer, jetzt: AM_29, krass: cfg.module.deals.preisfehlerKrass });
  assert.ok(r.eintrag, r.grund);
  assert.equal(r.eintrag.extra.krass, '75 % unter dem Vorher-Preis');
  const camel = await readFile(join(FX, 'echt', 'deal-2852900-camelbak.html'), 'utf8');
  const datum = new Date(Number(camel.match(/"publishedAt":\s*(\d+)/)[1]) * 1000);
  const jetzt = new Date(datum.getTime() + 36e5);
  const laeuft = camel.replace(/"isExpired":\s*true/, '"isExpired": false').replace(/"endDate":\s*\{[^}]*\}/, '"endDate": null');
  const r2 = await preisfehlerEintrag({ titel: '(Preisfehler) CAMELBAK Stash Belt für 0,99€ + VSK', link: 'https://www.mydealz.de/deals/x-2852900', datum: datum.toISOString(), preisText: '6,98€', beschreibung: '', feed: 'mydealz Preisfehler' },
    { kategorie: 'deals', pruefer: macheDealPruefer({ holeText: async () => laeuft, jetzt }), jetzt, krass: cfg.module.deals.preisfehlerKrass });
  assert.equal(r2.eintrag, undefined);
  assert.match(r2.grund, /^nicht krass: nur 42 %/);
});

test('Preisfehler-Grenzen im Radar gleich dem Standard (wie der Schnäppchen-Wecker)', () => {
  const { _hinweis, ...k } = cfg.module.deals.preisfehlerKrass;
  assert.deepEqual(k, { ...KRASS_STANDARD });
  assert.equal(krass({ titel: 'Mario Kart World (Switch 2)', preis: 39, preisVorher: 49 }).ok, false);
  assert.equal(krass({ titel: 'Hisense 55" 4K TV', preis: 35 }).ok, true);
});

test('Gewinnspiele: mit Kaufpflicht (Kassenbon, beim Kauf) raus, ohne Kauf bleibt', () => {
  const m = cfg.module.tests;
  assert.ok(bewerteTest('Gewinnspiel Leipzig: Konzert Tickets gewinnen – einfach Kommentar schreiben', m, cfg));
  assert.equal(bewerteTest('Gewinnspiel Leipzig: Konzert Tickets gewinnen – Kassenbon hochladen', m, cfg), null);
  assert.equal(bewerteTest('Gewinnspiel Leipzig: beim Kauf eines Aktionsprodukts Konzert Tickets gewinnen', m, cfg), null);
});

test('Cashback: mydealz Lebensmittel zählt nur mit Geld-zurück/Cashback-Aktionen (nurArten)', async () => {
  const feed = `<?xml version="1.0"?><rss xmlns:pepper="x"><channel><title>Lebensmittel</title>
<item><pepper:merchant name="Kaufland" price="1,99€"/><title><![CDATA[Haribo Goldbären gratis testen – Geld zurück bis 30.11.2026]]></title><description><![CDATA[Kaufen, Kassenbon hochladen, 1,99 € zurück.]]></description><link>https://www.mydealz.de/deals/haribo-gzg-1</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
<item><pepper:merchant name="Lidl" price="0,99€"/><title><![CDATA[Lidl Plus: Crunchips für 0,99 € – 10 Extra-Punkte]]></title><description><![CDATA[Mit Lidl Plus.]]></description><link>https://www.mydealz.de/deals/crunchips-lidl-2</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
</channel></rss>`;
  const holeText = async url => {
    if (url.includes('rss/gruppe/lebensmittel')) return feed;
    if (url.includes('rss/gruppe/freebies')) return '<rss><channel></channel></rss>';
    throw new Error('HTTP 404');
  };
  const r = await praemien({ holeText, cfg, jetzt: new Date('2026-11-07T12:00:00Z') });
  const t = r.eintraege.map(e => e.titel);
  assert.ok(t.some(x => /Haribo Goldbären gratis testen/.test(x)), t.join(' / '));
  assert.equal(r.eintraege.find(e => /Haribo/.test(e.titel)).extra.art, 'gzg');
  assert.ok(!t.some(x => /Lidl Plus: Crunchips/.test(x)), 'Extrapunkte aus dem Lebensmittel-Feed sind keine Cashback-Aktion');
});
