// Deals, Reisen, Gewinnspiele und Preisfehler – gegen ECHTE Antworten vom 31.10.2026 17:39 UTC (Roh-Lauf 41225543359,
// test/fixtures/echt-1739/: Feeds gekürzt auf die betroffenen Einträge, Deal-Seiten gekürzt auf threadDetail).
// Genau die Fehler aus der Prüfung: Coupon doppelt abgezogen (Butter 1,24 € pro Packung), „10 Packungen“ ohne
// Mehrkauf-Aktion, UVP statt mydealz-Vergleichspreis, Amazon-Versand ohne Prime vergessen, „ab Montag, dem 02.11.26“
// nicht erkannt, „ab Leipzig/Dresden/Berlin“ erfunden, Ende von der Deal-Seite schon vorbei, aber noch gezeigt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abAus, endeAus, bestimmeEnde } from '../lib/ende.mjs';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { macheDealPruefer } from '../lib/mydealz.mjs';
import { parseAktion, couponImPreis, rechne, couponWo } from '../rechnen.mjs';
import deals, { versandFuer } from '../module/deals.mjs';
import reisen, { abflugOrt, preisZusatz, istAbPreis, preisProPersonAusText } from '../module/reisen.mjs';
import { artVon } from '../module/tests.mjs';
import { preisfehlerEintrag } from '../module/gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const lies = n => readFile(join(FX, n), 'utf8');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const JETZT = new Date('2026-10-31T17:39:00Z');
const nb = s => String(s).replace(/\s/g, ' ');

const abruf = () => macheFixtureAbruf(FX, [
  ['schnaeppchen-daten', '!fehler'],
  ['rss/gruppe/lebensmittel', 'echt-1739/mydealz-lebensmittel.xml'],
  ['rss/gruppe/drogerie', '!fehler'],
  ['rss/gruppe/preisfehler', '!fehler'],
  ['rss/gruppe/reisen', 'echt-1739/mydealz-reisen.xml'],
  ['urlaubspiraten', '!fehler'], ['urlaubsguru', '!fehler'], ['search?q=bahn', '!fehler'],
  ['-2862219', 'echt-1739/deal-2862219.html'], ['-2862136', 'echt-1739/deal-2862136.html'], ['-2862107', 'echt-1739/deal-2862107.html'],
  ['-2861776', 'echt-1739/deal-2861776.html'], ['-2861548', 'echt-1739/deal-2861548.html'], ['-2854033', 'echt-1739/deal-2854033.html'],
]);

const BUTTER = 'Bei EDEKA bekommt ihr die Président Meersalzbutter mit echten Meersalzkörnern vom 02.11. bis 07.11.2026 zum Angebotspreis von 2,49 € statt 4,99 €. ➡️ Zusätzlich gibt es einen Coupon mit 1 € Sofort-Rabatt beim Kauf eines Produkts aus dem Président-Sortiment Beispielrechnung: ➡️ Président Meersalzbutter (250 g): 2,49 € ➡️ 1 € Sofort-Rabatt mit dem Coupon abziehen = nur 1,49 € statt 4,99 €! ✅ Das entspricht nur 5,96 €/kg statt 19,96 €/kg. Der Coupon ist vom 01.10.2026 bis zum 10.01.2027 gültig.';

test('Coupon-Wert nur direkt am Coupon-Wort (echter Text 2862219: 1 €, nicht 2,49 €) und schon im Preis 1,49 €', () => {
  const a = parseAktion(BUTTER);
  assert.deepEqual(a.coupons, [{ art: 'markt', name: 'Coupon', wert: 1 }]);
  assert.equal(couponImPreis(BUTTER, 1.49, a.coupons[0]), true, '2,49 € − 1 € = 1,49 € (Deal-Preis)');
  assert.equal(couponImPreis('Butter 2,49 €, dazu Coupon 1 €', 2.49, { wert: 1 }), false);
  assert.deepEqual(parseAktion('0,50 € Cashback mit Scondoo').coupons, [{ art: 'cashback', name: 'Scondoo', wert: 0.5 }]);
  assert.deepEqual(parseAktion('Mit dem 1-€-Coupon zahlt ihr nur 0,99 €').coupons, [{ art: 'markt', name: 'Coupon', wert: 1 }]);
});

test('Ohne Deal-Seite: der niedrigste Vergleichswert aus dem Text (ROTH: „statt knapp 21 €“, nicht UVP 26,99 €)', async () => {
  const { leseRss } = await import('../lib/rss.mjs');
  const { altpreisAusText } = await import('../lib/mydealz.mjs');
  const it = leseRss(await lies('echt-1739/mydealz-lebensmittel.xml')).find(x => /ROTH/.test(x.titel));
  const text = `${it.titel} ${it.beschreibung}`;
  assert.deepEqual(altpreisAusText(text, 9.99), { preis: 26.99, quelle: 'UVP laut Deal-Text' }, 'Preisfehler: Reihenfolge wie bisher');
  assert.deepEqual(altpreisAusText(text, 9.99, { niedrigster: true }), { preis: 21, quelle: 'Preis vorher laut Deal-Text' });
});

test('Ohne Mehrkauf-Aktion genau 1 Packung; mit echter Aktion weiter Vorrat (3 für 2)', () => {
  const r = rechne({ text: 'ROTH Tee-Adventskalender für 9,99 €', einzelpreis: 9.99, normalEinzelpreis: 20.99, maxPackungen: 10 });
  assert.equal(r.packungen, 1);
  assert.equal(r.zahlen, 9.99);
  const a = rechne({ text: 'Haribo 3 zum Preis von 2', einzelpreis: 1, normalEinzelpreis: 1, maxPackungen: 6 });
  assert.equal(a.packungen, 6);
  // mydealz-Preis ist der Endpreis: Coupon nur als Hinweis, nie ein niedrigerer Preis pro Packung als der Deal
  const c = rechne({ aktion: parseAktion(BUTTER), text: BUTTER, einzelpreis: 1.49, normalEinzelpreis: 4.99, couponsImPreis: true, couponAbgezogen: true });
  assert.equal(c.zahlen, 1.49);
  assert.equal(c.proPackung, 1.49);
  // im Laden steht 2,49 € am Regal: vorrechnen, und dass der Coupon nötig ist
  assert.deepEqual(c.schritte.map(nb), ['Regalpreis 2,49 € − 1,00 € Coupon = 1,49 €', 'Coupon an der Kasse zeigen – ohne Coupon zahlst du 2,49 €']);
});

test('Echt 17:39: Butter 1 Packung für 1,49 € (−70 %), ROTH mit Vergleichspreis von mydealz und Versand ohne Prime, Bonne Maman ab Montag', async () => {
  const r = await deals({ holeText: abruf(), cfg, zustand: {}, jetzt: JETZT });
  const e = n => r.eintraege.find(x => n.test(x.titel));
  const butter = e(/Président/);
  assert.equal(nb(butter.zeile), 'ab Mo 2.11. · 1 Packung für 1,49 € statt 4,99 € (−70 %)', 'Datum wie auf der Seite');
  assert.equal(butter.ersparnisProzent, 70, 'Zeile und Daten sagen dasselbe');
  assert.deepEqual(butter.extra.schritte.map(nb), ['Regalpreis 2,49 € − 1,00 € Coupon = 1,49 €', 'Coupon an der Kasse zeigen – ohne Coupon zahlst du 2,49 €']);
  assert.doesNotMatch(nb(butter.zeile + butter.soGehts), /10 Packungen|1,24|2,49|−75/);
  const roth = e(/ROTH/);
  // nextBestPrice 20,99 € (mydealz) statt UVP 26,99 €; 9,99 € ist ein Prime-Preis -> ohne Prime + 3,99 € Versand
  assert.equal(nb(roth.zeile), '1 Packung für 13,98 € statt 20,99 € (−33 %)');
  assert.deepEqual([roth.preis, roth.preisVorher, roth.vorherQuelle, roth.ersparnisProzent], [13.98, 20.99, 'Vergleichspreis laut mydealz', 33]);
  assert.deepEqual(roth.extra.schritte.map(nb), ['1 Packung zu je 9,99 €', 'plus 3,99 € Versand (ohne Prime)']);
  assert.doesNotMatch(nb(roth.zeile + roth.soGehts), /10 Packungen|99,90|269,90|−63/);
  const bm = e(/Bonne Maman/);
  assert.equal(bm.ab, '2026-11-01T23:00:00.000Z', '„ab Montag, dem 02.11.26“');
  assert.equal(nb(bm.zeile), 'ab Mo 2.11. · 1 Packung für 2,00 € statt 2,99 € (−33 %)');
  assert.equal(bm.vorherQuelle, 'Vergleichspreis laut mydealz');
  // Ende laut Deal-Seite schon vorbei (isExpired noch false) -> nicht zeigen, auch wenn der Text länger klingt
  const h = abruf();
  const vorbei = async (url, o) => { const t = await h(url, o); return url.includes('-2862107') ? t.replace(/"endDate": \{[^}]*\}/, `"endDate": {"timestamp": ${Date.parse('2026-10-31T17:00:00Z') / 1000}}`) : t; };
  const r2 = await deals({ holeText: vorbei, cfg, zustand: {}, jetzt: JETZT });
  assert.ok(!r2.eintraege.some(x => /Bonne Maman/.test(x.titel)));
  assert.ok(r2.eintraege.some(x => /Président/.test(x.titel)));
});

test('Versand: Amazon ohne Prime unter 39 € kostet 3,99 €, im Laden nichts, Deal-Seite hat Vorrang', () => {
  assert.deepEqual(versandFuer({ shop: 'Amazon', preis: 9.99, text: '(Prime)' }, cfg), { versand: 3.99, hinweis: 'ohne Prime' });
  assert.deepEqual(versandFuer({ shop: 'Amazon', preis: 49, text: '' }, cfg), { versand: 0, hinweis: '' });
  assert.deepEqual(versandFuer({ shop: 'Kaufland', preis: 2, info: { lokal: true } }, cfg), { versand: 0, hinweis: '' });
  assert.deepEqual(versandFuer({ shop: 'Amazon', preis: 9.99, info: { versand: 4.99 } }, cfg), { versand: 4.99, hinweis: '' });
});

test('Beginn: „ab Montag, dem 02.11.26“ und „Ab Montag den 2.11.“ (echte Sätze); „nur am Donnerstag 29.10.“ ist ein Ende', () => {
  assert.equal(abAus('Hallo zusammen, ab Montag, dem 02.11.26 gibt es das große Bonne Maman Konfitüren Glas für 2,-€.', JETZT), '2026-11-01T23:00:00.000Z');
  assert.equal(abAus('Ab Montag den 2.11. hat Penny wieder wenig wirklich lohnenden Angebote.', JETZT), '2026-11-01T23:00:00.000Z');
  assert.equal(endeAus('[Lidl] Knoppers 15er Pack (375 g) für 2,22 € – nur am Donnerstag 29.10.!', JETZT).bis, '2026-10-29T22:59:59.000Z');
});

test('Reisen (echt): nur der gefundene Flughafen, „pro Strecke“/„oneway“/„für 2 Personen“ am Preis, „statt“ wenn bekannt', async () => {
  const r = await reisen({ holeText: abruf(), cfg, zustand: {}, jetzt: JETZT });
  const z = n => nb(r.eintraege.find(x => n.test(x.titel)).zeile);
  assert.equal(z(/SAS Sale/), 'ab 49,00 € pro Strecke · ab Berlin');
  // „Flüge ab 17€“ (Titel) bzw. „Flüge ab 16,99€“ (Text): ein Ab-Preis, kein fester Flug für 16,99 €
  assert.equal(z(/Ryanair/), 'ab 16,99 € oneway · ab Berlin');
  assert.equal(z(/Eisenstadt/), 'ab 109,00 € für 2 Personen statt 233,00 € · −53 %', 'Titel: „ab 54,50€ p.P.“');
  assert.doesNotMatch(r.eintraege.map(e => e.zeile).join(' '), /Leipzig\/Dresden\/Berlin/);
  const m = cfg.module.reisen;
  assert.equal(abflugOrt('Flüge ab LEJ nach Mallorca', m), 'Leipzig');
  assert.equal(abflugOrt('Hotel in Dresden', m), null, 'ohne Flug kein Abflug');
  assert.equal(preisZusatz('Flüge ab 49€/Strecke', '', 49), 'pro Strecke');
  assert.equal(istAbPreis('Hotel für 99€', 'Zimmer für 99 €', 99), false);
  // Urlaubspiraten (echter Text 31.10.): Preis nur in der Beschreibung
  assert.equal(preisProPersonAusText('Ihr bezahlt gerade mal 985 € p.P. für 10 Nächte inklusive Flügen.'), 985);
  assert.equal(preisProPersonAusText('ab 1.299 € pro Person'), 1299);
  assert.equal(preisProPersonAusText('Hotel mit 4 Sternen'), null);
});

test('Coupon: wo es ihn gibt, nur wenn der Text es im Coupon-Satz sagt', () => {
  assert.equal(couponWo('Den Coupon gibt es in der EDEKA-App.'), 'gibt es in der EDEKA-App');
  assert.equal(couponWo(BUTTER), '', 'echter Text 2862219 sagt nicht, wo');
  const t = 'Butter für 2,49 €. Mit dem 1-€-Coupon zahlt ihr nur 1,49 €. Den Coupon gibt es in der EDEKA-App.';
  const r = rechne({ aktion: parseAktion(t), text: t, einzelpreis: 1.49, normalEinzelpreis: 4.99, couponsImPreis: true, couponAbgezogen: true });
  assert.equal(nb(r.schritte[1]), 'Coupon (gibt es in der EDEKA-App) an der Kasse zeigen – ohne Coupon zahlst du 2,49 €');
});

test('Ticket-Verlosungen ohne Teilnahmeschluss: höchstens 6 Tage (DOK Leipzig vom 18.10. ist am 31.10. weg)', () => {
  const it = { titel: '2×2 Tickets für DOK Leipzig 2026 gewinnen - urbanite.net', beschreibung: '', feedInfo: { url: 'https://news.google.com/rss/search?q=x' } };
  assert.equal(artVon(it, { art: 'gewinnspiel' }), 'gewinnspielTicket');
  assert.equal(artVon({ ...it, titel: 'Produkttester gesucht: Kopfhörer' }, { art: 'test' }), 'nachricht');
  const e = bestimmeEnde({ datum: '2026-10-18T07:00:00Z', art: 'gewinnspielTicket', jetzt: JETZT });
  assert.equal(e.sichtbarBis, '2026-10-24T07:00:00.000Z');
});

test('Preisfehler: Ende laut Deal-Seite vorbei, aber nicht als abgelaufen markiert -> weg; ohne Datum -> weg; Versand im Preis', async () => {
  const jetzt = new Date('2026-10-31T16:35:00Z');
  const seite = (await lies('echt/deal-2852900-camelbak.html')).replace('"isExpired": true', '"isExpired": false');
  assert.ok(seite.includes('"isExpired": false'));
  const mitEnde = (ts, pub) => seite.replace(/"endDate": \{[^}]*\}/, `"endDate": {"timestamp": ${ts}}`).replace(/"publishedAt": \d+/, `"publishedAt": ${pub}`);
  const it = { titel: '(Preisfehler) CAMELBAK Stash Belt für 0,99€ + VSK', link: 'https://www.mydealz.de/deals/x-2852900', datum: '2026-10-31T10:00:00Z', preisText: '6,98€', beschreibung: '', feed: 'mydealz Preisfehler' };
  // Ende 14:00 UTC, jetzt 16:35 UTC, isExpired false -> nicht zeigen (vorher: geschätztes Ende datum+24 h)
  let pruefer = macheDealPruefer({ holeText: async () => mitEnde(Date.parse('2026-10-31T14:00:00Z') / 1000, Date.parse(it.datum) / 1000), jetzt });
  let r = await preisfehlerEintrag(it, { kategorie: 'deals', pruefer, jetzt });
  assert.equal(r.eintrag, undefined);
  assert.equal(r.grund, 'abgelaufen');
  // ohne lesbares Datum: nie ein Fenster -> nicht zeigen
  r = await preisfehlerEintrag({ ...it, datum: '' }, { kategorie: 'deals', pruefer, jetzt });
  assert.equal(r.grund, 'ohne Datum');
  // Ende in der Zukunft: zeigen; Versand steckt schon im Preis -> versand 0, versandInklusive
  pruefer = macheDealPruefer({ holeText: async () => mitEnde(Date.parse('2026-10-31T20:00:00Z') / 1000, Date.parse(it.datum) / 1000), jetzt });
  r = await preisfehlerEintrag(it, { kategorie: 'deals', pruefer, jetzt });
  assert.ok(r.eintrag, r.grund);
  assert.equal(r.eintrag.extra.versand, 0);
  assert.equal(r.eintrag.extra.versandInklusive, true);
  assert.match(nb(r.eintrag.zeile), /^vorher 11,99 € → jetzt 6,98 € \(−42 %\) inkl\. Versand/);
});
