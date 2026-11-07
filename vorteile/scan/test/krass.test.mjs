// MV2 (07.11.2026): nur krasse Preisfehler, Gewinnspiele ohne Kauf, Prämien & Freunde werben aus, Geld-zurück/Cashback
// (mydealz Lebensmittel + Suchen) jetzt im Modul deals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheDealPruefer } from '../lib/mydealz.mjs';
import { preisfehlerEintrag } from '../module/gemeinsam.mjs';
import { bewerteTest } from '../module/tests.mjs';
import deals from '../module/deals.mjs';
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

test('Prämien & Freunde werben sind aus (Strom, Bank, Konto, Freunde werben)', () => {
  assert.equal(cfg.module.praemien.aktiv, false);
  assert.deepEqual(cfg.module.deals.cashback.arten, ['gzg', 'cashback']);
});

test('Cashback im Modul deals: nur Geld-zurück/Cashback-Aktionen, keine Extrapunkte, keine Freunde-werben-/Konto-Prämien', async () => {
  const feed = `<?xml version="1.0"?><rss xmlns:pepper="x"><channel><title>Lebensmittel</title>
<item><pepper:merchant name="Kaufland" price="1,99€"/><title><![CDATA[Haribo Goldbären gratis testen – Geld zurück bis 30.11.2026]]></title><description><![CDATA[Kaufen, Kassenbon hochladen, 1,99 € zurück.]]></description><link>https://www.mydealz.de/deals/haribo-gzg-1</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
<item><pepper:merchant name="Lidl" price="0,99€"/><title><![CDATA[Lidl Plus: Crunchips für 0,99 € – 10 Extra-Punkte]]></title><description><![CDATA[Mit Lidl Plus.]]></description><link>https://www.mydealz.de/deals/crunchips-lidl-2</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
</channel></rss>`;
  const konto = `<?xml version="1.0"?><rss xmlns:pepper="x"><channel><title>Suche</title>
<item><title><![CDATA[Freunde werben bei Ökostrom Muster: 50 € Prämie für dich]]></title><description><![CDATA[Für jeden geworbenen Neukunden 50 € Prämie.]]></description><link>https://www.mydealz.de/deals/freunde-3</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
<item><title><![CDATA[Girokonto mit 100 € Neukundenprämie]]></title><description><![CDATA[Geldeingang 1.000 € nötig.]]></description><link>https://www.mydealz.de/deals/konto-4</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
<item><pepper:merchant name="Shoop" price=""/><title><![CDATA[Cashback 5 € auf Kopfhörer bei Shoop]]></title><description><![CDATA[5 € Cashback über Shoop, gültig bis 20.11.2026.]]></description><link>https://www.mydealz.de/deals/cashback-5</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>
</channel></rss>`;
  const holeText = async url => {
    if (url.includes('rss/gruppe/lebensmittel')) return feed;
    if (url.includes('Geld%20zur')) return konto;
    if (url.includes('schnaeppchen-daten')) return '{"produkte":[],"technik":[]}';
    if (/rss/.test(url)) return '<rss><channel></channel></rss>';
    throw new Error('HTTP 404');
  };
  const r = await deals({ holeText, cfg, jetzt: new Date('2026-11-07T12:00:00Z'), zustand: {} });
  const cb = r.eintraege.filter(e => e.grund === 'cashback');
  const t = cb.map(e => e.titel);
  assert.ok(t.some(x => /Haribo Goldbären gratis testen/.test(x)), t.join(' / '));
  const h = cb.find(e => /Haribo/.test(e.titel));
  assert.equal(h.extra.art, 'gzg');
  assert.equal(h.kategorie, 'deals');
  assert.equal(h.sofort, false, 'Cashback nur in der Zusammenfassung');
  assert.equal(h.bis, '2026-11-30T22:59:59.000Z');
  assert.match(h.zeile, /^Geld zurück: 1,99\s€$/);
  assert.equal(r.eintraege.filter(e => e.link === h.link).length, 1, 'nicht noch einmal als normaler Deal');
  assert.ok(!t.some(x => /Lidl Plus: Crunchips/.test(x)), 'Extrapunkte aus dem Lebensmittel-Feed sind keine Cashback-Aktion');
  assert.ok(!t.some(x => /Freunde werben|Girokonto/.test(x)), 'Prämien sind raus');
  assert.ok(t.some(x => /Cashback 5 € auf Kopfhörer/.test(x)), 'Cashback aus der Suche');
});
