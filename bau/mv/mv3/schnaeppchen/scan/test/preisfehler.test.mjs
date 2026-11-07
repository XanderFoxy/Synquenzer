// Preisfehler: Deal-Seite lesen (echte Seiten vom 31.10.2026), Vorher-Preis aus Text, Prüfen mit Gedächtnis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leseDealSeite, vorherAusText, vorherJetzt, pruefeDealSeiten, leereDealseiten } from '../preisfehler.mjs';
import { leseRss } from '../rss.mjs';
import { parsePrice } from '../text.mjs';
import { nachricht, vorherJetztText } from '../notify.mjs';

const ECHT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'echt-2026-10-31');
const quelle = async name => readFile(join(ECHT, 'quellen', name), 'utf8');
const RTX = '029-www-mydealz-de-deals-zotac-gaming-geforce-rtx-5070-twin-edge-oc-nvidia-grafikkarte-12gb-28.html';
const LUMA = '027-www-mydealz-de-deals-moglicher-preisfehler-lumaland-outdoor-pop-up-pavillon-25-x-25-m-in-s.html';
const CAMEL = '030-www-mydealz-de-deals-preisfehler-camelbak-stash-belt-fur-099eur-vsk-bauchtasche-gurteltasc.html';

test('Deal-Seite (echt): abgelaufen, Ende, Preis, Vergleichspreis, Versand', async () => {
  assert.deepEqual(leseDealSeite(await quelle(RTX)), {
    abgelaufen: true, vielleichtAbgelaufen: false, bis: '2026-10-12T14:29:15.000Z', preis: 165, vergleichspreis: null, versand: null,
    temperatur: 74, haendler: 'MediaMarkt', veroeffentlicht: '2026-10-12T14:24:43.000Z',
  });
  const luma = leseDealSeite(await quelle(LUMA));
  assert.equal(luma.vergleichspreis, 96.99);
  assert.equal(luma.versand, 0);
  assert.equal(luma.bis, '2026-10-29T11:36:50.000Z', '10 Minuten nach dem Melden abgelaufen');
  const camel = leseDealSeite(await quelle(CAMEL));
  assert.deepEqual([camel.preis, camel.versand, camel.vergleichspreis], [6.98, 5.99, 11.99]);
  assert.equal(leseDealSeite('<html>Bitte bestätige, dass du kein Roboter bist</html>'), null);
  assert.equal(leseDealSeite('<script>window.__INITIAL_STATE__ = {kaputt</script>'), null);
});

test('Vorher-Preis aus dem Text (echter Preisfehler-Feed): Treffer und keine Fehltreffer', async () => {
  const items = leseRss(await quelle('006-www-mydealz-de-rss-gruppe-preisfehler.xml'));
  const v = teil => { const it = items.find(i => i.titel.includes(teil)); return vorherAusText(it.titel, it.beschreibung, parsePrice(it.preisText)); };
  assert.deepEqual(v('Lumaland'), { wert: 96.99, quelle: 'statt-Preis laut Deal-Text' });
  assert.deepEqual(v('Pelikan'), { wert: 14.82, quelle: 'UVP' });
  assert.deepEqual(v('Luhomfu'), { wert: 75.99, quelle: 'Normalpreis laut Deal-Text' }, 'nicht das „statt 165,99 €“ des Bücherregals');
  assert.deepEqual(v('intellinet'), { wert: 5.8, quelle: 'statt-Preis laut Deal-Text' });
  assert.equal(v('Allnet/SMS Flat Unlimited'), null, '„sonst 5,95 €“ sind Versandkosten');
  assert.equal(v('Promedia24'), null, '„statt 10%“ ist kein Preis');
  assert.equal(v('Electrolux'), null, '„Tiefster Preis“ ist der Dealpreis');
  assert.equal(v('RTX 5070'), null);
  assert.deepEqual(vorherJetzt(23.99, 96.99, 'x'), { preisVorher: 96.99, vorherQuelle: 'x', ersparnisEuro: 73, ersparnisProzent: 75 });
  assert.deepEqual(vorherJetzt(23.99, 20, 'x'), { preisVorher: null, vorherQuelle: null, ersparnisEuro: null, ersparnisProzent: null });
});

test('Push-Text Preisfehler: „vorher X € → jetzt Y € (−Z %)“, sonst ohne Vorher-Preis', () => {
  const cfg = { ntfy: { topic: 't' }, seite: 'https://x/' };
  const mit = { typ: 'technik', titel: 'Lumaland Pavillon', shop: 'Amazon', preis: 23.99, preisVorher: 96.99, ersparnisProzent: 75,
    vorherQuelle: 'Vergleichspreis laut mydealz', datum: '2026-10-29T11:26:13.000Z', link: 'https://www.mydealz.de/deals/x-2861129' };
  assert.equal(vorherJetztText(mit), 'vorher 96,99 € → jetzt 23,99 € (−75 %)');
  const m = nachricht(mit, cfg, Date.parse('2026-10-29T11:30:00Z'));
  assert.equal(m.message, 'vorher 96,99 € → jetzt 23,99 € (−75 %)\nbei Amazon · vorher = Vergleichspreis laut mydealz · gemeldet vor 4 Min.\nLumaland Pavillon');
  assert.equal(m.click, mit.link);
  const ohne = nachricht({ ...mit, preis: 165, preisVorher: null, ersparnisProzent: null, vorherQuelle: null, titel: 'RTX 5070', shop: 'MediaMarkt' }, cfg, Date.parse('2026-10-29T13:26:13Z'));
  assert.equal(ohne.message.split('\n')[0], 'jetzt 165,00 € · Vorher-Preis unbekannt');
  assert.match(ohne.message, /gemeldet vor 2 Std\./);
  // Titel nach Art: gemeldeter Preisfehler vs. großer Technik-Rabatt (wie auf der Seite)
  assert.match(nachricht({ ...mit, preisfehler: true }, cfg).title, /^Preisfehler\? Lumaland/);
  assert.match(nachricht({ ...mit, preisfehler: false }, cfg).title, /^Technik-Deal: Lumaland/);
});

test('Deal-Seiten prüfen: abgelaufen gemerkt, laufende neu geprüft, Fehler nicht gemerkt, Grenze pro Lauf', async () => {
  const seiten = {
    'https://m/deals/a-1': await quelle(RTX), // abgelaufen
    'https://m/deals/b-2': (await quelle(LUMA)).replace('"isExpired":true', '"isExpired":false'), // läuft
  };
  let abrufe = [];
  const holeText = async url => { abrufe.push(url); if (!seiten[url]) throw new Error('HTTP 403 bei m'); return seiten[url]; };
  const t0 = Date.parse('2026-10-31T12:00:00Z');
  const links = ['https://m/deals/a-1', 'https://m/deals/b-2', 'https://m/deals/c-3', 'https://m/deals/d-4'];
  const r1 = await pruefeDealSeiten(links, { holeText, cache: leereDealseiten(), jetztMs: t0, max: 3 });
  assert.equal(r1.abrufe, 3, 'höchstens 3 pro Lauf');
  assert.equal(r1.ergebnisse.get('https://m/deals/a-1').abgelaufen, true);
  assert.equal(r1.ergebnisse.get('https://m/deals/b-2').abgelaufen, false);
  assert.equal(r1.ergebnisse.get('https://m/deals/c-3').ok, false);
  assert.equal(r1.ergebnisse.get('https://m/deals/d-4'), undefined, 'diesmal nicht geprüft');
  assert.deepEqual(Object.keys(r1.cache.seiten).sort(), ['https://m/deals/a-1', 'https://m/deals/b-2'], 'Fehler werden nicht gemerkt');
  // 30 Minuten später: nichts Neues abrufen außer den ungeprüften/fehlerhaften
  abrufe = [];
  await pruefeDealSeiten(links, { holeText, cache: r1.cache, jetztMs: t0 + 30 * 6e4, max: 3 });
  assert.deepEqual(abrufe, ['https://m/deals/c-3', 'https://m/deals/d-4']);
  // 50 Minuten später: der laufende Deal wird erneut geprüft (könnte inzwischen abgelaufen sein), der abgelaufene nie mehr
  abrufe = [];
  await pruefeDealSeiten(links.slice(0, 2), { holeText, cache: r1.cache, jetztMs: t0 + 50 * 6e4, max: 3 });
  assert.deepEqual(abrufe, ['https://m/deals/b-2']);
  // nach 8 Tagen ist das Gedächtnis aufgeräumt
  const r4 = await pruefeDealSeiten([], { holeText, cache: r1.cache, jetztMs: t0 + 9 * 864e5 });
  assert.deepEqual(r4.cache.seiten, {});
});
