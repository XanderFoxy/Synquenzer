// Enddaten, Preisfehler (vorher → jetzt) und Deal-Seiten – mit echten Antworten vom 31.10.2026 (test/fixtures/echt/).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { endeAus, endeAusFuer, abAus, berlinIso, berlinTag, bestimmeEnde, istVorbei, aufraeumen } from '../lib/ende.mjs';
import { leseDealSeite, temperaturAusTitel, altpreisAusText, preisAngaben, preisZeile, versandImPreis, macheDealPruefer, threadId } from '../lib/mydealz.mjs';
import { leseRss } from '../lib/rss.mjs';
import { parsePrice } from '../lib/text.mjs';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { sofortNachricht } from '../benachrichtigen.mjs';
import deals, { angebotOk } from '../module/deals.mjs';
import reisen from '../module/reisen.mjs';
import tests from '../module/tests.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const lies = n => readFile(join(FX, n), 'utf8');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const JETZT = new Date('2026-10-31T16:30:05Z'); // Zeitpunkt des echten Mitschnitts
const AM_29 = new Date('2026-10-29T19:00:00Z'); // HARBR (17:01), Faltpavillon (11:34), Lumaland (11:26) sind < 24 h alt

// Echte Feeds + echte Deal-Seiten (gekürzt auf threadDetail); laeuft = Lumaland als „noch nicht abgelaufen“
function echtAbruf({ laeuft = false } = {}) {
  return macheFixtureAbruf(FX, [
    ['raw.githubusercontent.com/XanderFoxy/Synquenzer/schnaeppchen-daten', 'schnaeppchen-current.json'],
    ['rss/gruppe/lebensmittel', 'echt/mydealz-lebensmittel.xml'],
    ['rss/gruppe/drogerie', '!fehler'],
    ['rss/gruppe/preisfehler', 'echt/mydealz-preisfehler.xml'],
    ['rss/gruppe/reisen', 'echt/mydealz-reisen.xml'],
    ['rss/gruppe/gewinnspiele', 'echt/mydealz-gewinnspiele.xml'],
    ['-2861305', 'echt/deal-2861305-harbr.html'],
    ['-2861134', 'echt/deal-2861134-faltpavillon.html'],
    ['-2861129', laeuft ? 'echt/deal-2861129-lumaland-laeuft.html' : 'echt/deal-2861129-lumaland-voll.html'],
    ['-2852994', 'echt/deal-2852994-rtx5070.html'],
    ['-2852900', 'echt/deal-2852900-camelbak.html'],
  ]);
}

test('Ende aus echtem Text: Datum, Uhrzeit, Jahresregel, Reisezeitraum zählt nicht', () => {
  const j = JETZT;
  assert.equal(endeAus('Gültigkeit: 31.10.2026, 10:00 Uhr bis 01.11.2026, 10:00 Uhr.', j).bis, '2026-11-01T09:00:00.000Z');
  assert.equal(endeAus('vom 02.11. bis 07.11.2026 zum Angebotspreis', j).bis, '2026-11-07T22:59:59.000Z');
  assert.equal(endeAus('Spooky Sale – bis 02.11. könnt ihr buchen', j).tag, '2026-11-02');
  assert.equal(endeAus('läuft die Aktion noch bis zum 08.11.2026 um 00:59', j).bis, '2026-11-07T23:59:00.000Z');
  assert.equal(endeAus('ab Freitag 06.11.2026 und kann bis Samstag 05.12.2026 genutzt werden', j).tag, '2026-12-05');
  assert.equal(endeAus('Teilnahmeschluss: 19.01.2027', j).tag, '2027-01-19');
  assert.equal(endeAus('Läuft bis 30.09.2026 (23:59 Uhr)', j).bis, '2026-09-30T21:59:00.000Z');
  assert.equal(endeAus('Aktionszeitraum vom 18.09. bis 27.09 bis 8.11.', j).tag, '2026-11-08', 'verlängert -> späteres Datum');
  assert.equal(endeAus('der Sale läuft nur noch bis zum 8. November', j).tag, '2026-11-08');
  assert.equal(endeAus('Bewerben bis 15. Januar', j).tag, '2027-01-15', 'ohne Jahr, > 2 Monate zurück -> nächstes Jahr');
  assert.equal(endeAus('bis 22.09.', j).tag, '2026-09-22', 'ohne Jahr, kürzlich vorbei -> dieses Jahr');
  assert.equal(endeAus('Flüge ab 16,99€ für Reisen bis zum 31.03. buchen. Reisezeitraum : von 01.11. bis 31.03.', j), null);
  assert.equal(endeAus('für den Zeitraum 13.11. bis 16.11.26 liegt laut Preisvergleich', j), null);
  assert.equal(endeAus('Kinder bis 14 Jahre, bis zu 1.000 € sparen, bis 23kg Gepäck', j), null);
  // schwaches „bis“ weit nach der Veröffentlichung = Reisezeitraum (Ryanair-Titel)
  assert.equal(endeAusFuer('Flüge von Berlin, Köln uvm bis 31.03. Oneway 16,99', '2026-10-30T09:00:44Z', j), null);
  assert.equal(endeAusFuer('Teilnahmeschluss: 19.01.2027', '2026-10-21T16:21:00Z', j).tag, '2027-01-19', 'starkes Signal gilt immer');
});

test('Berliner Zeit und Beginn („ab“)', () => {
  assert.equal(berlinIso(2026, 10, 31, 19, 0, 0), '2026-10-31T18:00:00.000Z', 'Winterzeit');
  assert.equal(berlinIso(2026, 7, 1), '2026-07-01T21:59:59.000Z', 'Sommerzeit');
  assert.equal(berlinTag('2026-10-31T23:30:00Z'), '2026-11-01');
  assert.equal(abAus('[Penny] Ab Montag den 2.11. im Laden', JETZT), '2026-11-01T23:00:00.000Z');
  assert.equal(abAus('vom 02.11. bis 07.11.2026', JETZT), '2026-11-01T23:00:00.000Z');
  assert.equal(abAus('Flüge ab 16,99 € und ab 17.99€', JETZT), null);
});

test('bestimmeEnde: Feld vor Text, Anzeigefenster ohne Ende, Preisfehler höchstens 24 h', () => {
  const e1 = bestimmeEnde({ bis: '2026-10-31T18:00:00Z', text: 'bis 30.11.2026', datum: JETZT, jetzt: JETZT });
  assert.deepEqual([e1.bis, e1.bisQuelle, e1.sichtbarBis], ['2026-10-31T18:00:00.000Z', 'feld', '2026-10-31T18:00:00.000Z']);
  const e2 = bestimmeEnde({ datum: '2026-10-22T08:00:38Z', art: 'nachricht', jetzt: JETZT });
  assert.deepEqual([e2.bis, e2.sichtbarBis], [null, '2026-11-05T08:00:38.000Z'], 'Google News: 14 Tage, Ende unbekannt');
  const e3 = bestimmeEnde({ text: 'bis 30.11.2026', datum: '2026-10-31T10:00:00Z', art: 'preisfehler', jetzt: JETZT });
  assert.equal(e3.sichtbarBis, '2026-11-01T10:00:00.000Z');
  assert.equal(istVorbei({ bis: '2026-10-31T18:00:00Z' }, new Date('2026-10-31T18:00:01Z')), true);
  assert.equal(istVorbei({ bis: null, sichtbarBis: null }, JETZT), false);
  const e4 = bestimmeEnde({ ab: '2026-11-01T23:00:00Z', bis: '2026-11-07T22:59:00Z', jetzt: JETZT });
  assert.equal(e4.ab, '2026-11-01T23:00:00.000Z', 'Beginn in der Zukunft bleibt');
  assert.equal(bestimmeEnde({ ab: '2026-10-28T23:00:00Z', jetzt: JETZT }).ab, null, 'Beginn vorbei -> egal');
});

test('aufraeumen: Vorbei raus (auch Übernommenes), gleicher Link nur in der spezielleren Kategorie', () => {
  const k = {
    deals: [
      { id: 'a', link: 'https://x/harbr', titel: 'Preisfehler Hotel', bis: null, sichtbarBis: '2026-11-01T00:00:00Z' },
      { id: 'b', link: 'https://x/alt', titel: 'Knoppers', bis: '2026-10-31T18:00:00Z', sichtbarBis: '2026-10-31T18:00:00Z' },
      { id: 'c', link: 'https://x/rtx', titel: 'RTX 5070 Preisfehler', grund: 'Preisfehler', datum: '2026-10-12T14:24:43Z' }, // Altbestand ohne sichtbarBis
    ],
    reisen: [{ id: 'd', link: 'https://x/harbr', titel: 'Preisfehler Hotel', bis: null, sichtbarBis: '2026-11-01T00:00:00Z' }],
  };
  aufraeumen(k, new Date('2026-10-31T18:30:00Z'));
  assert.deepEqual(k.deals.map(e => e.id), []);
  assert.deepEqual(k.reisen.map(e => e.id), ['d']);
});

test('Deal-Seite (echt): abgelaufen, Vergleichspreis, Versand, Ende', async () => {
  const voll = leseDealSeite(await lies('echt/deal-2861129-lumaland-voll.html'));
  assert.deepEqual([voll.id, voll.preis, voll.vergleichspreis, voll.abgelaufen, voll.ende, voll.haendler],
    ['2861129', 23.99, 96.99, true, '2026-10-29T11:36:50.000Z', 'Amazon']);
  const rtx = leseDealSeite(await lies('echt/deal-2852994-rtx5070.html'));
  assert.deepEqual([rtx.preis, rtx.vergleichspreis, rtx.abgelaufen, rtx.ende], [165, null, true, '2026-10-12T14:29:15.000Z']);
  const cb = leseDealSeite(await lies('echt/deal-2852900-camelbak.html'));
  assert.deepEqual([cb.preis, cb.vergleichspreis, cb.versand], [6.98, 11.99, 5.99]);
  assert.equal(versandImPreis('(Preisfehler) CAMELBAK Stash Belt für 0,99€ + VSK', cb), true, '0,99 + 5,99 = 6,98');
  assert.equal(leseDealSeite('<html>Captcha</html>'), null);
  assert.equal(threadId('https://www.mydealz.de/deals/preisfehler-harbr-hotel-ludwigsburg-07-08122026-1-nacht-2861305'), '2861305');
});

test('Temperatur nur aus dem Titel-Präfix (Hot-Feed); Titel ohne Präfix', () => {
  assert.deepEqual(temperaturAusTitel('196° - [edeka] Président Meersalzbutter'), { titel: '[edeka] Président Meersalzbutter', temperatur: 196 });
  assert.deepEqual(temperaturAusTitel('Preisfehler: 4K Blu-ray'), { titel: 'Preisfehler: 4K Blu-ray', temperatur: null });
  const it = leseRss('<rss><channel><item><title>109° - Flug für 19 €</title><link>https://x</link></item></channel></rss>')[0];
  assert.deepEqual([it.titel, it.temperatur], ['Flug für 19 €', 109]);
});

test('Altpreis aus echtem Preisfehler-Feed: richtige Treffer, keine Versand-/Prozent-Falschtreffer', async () => {
  const items = leseRss(await lies('echt/mydealz-preisfehler.xml'));
  const alt = teil => { const it = items.find(i => i.titel.includes(teil)); return altpreisAusText(`${it.titel} ${it.beschreibung}`, parsePrice(it.preisText))?.preis ?? null; };
  assert.equal(alt('Lumaland'), 96.99);
  assert.equal(alt('Alpholz'), 9999);
  assert.equal(alt('The Howling'), 54);
  assert.equal(alt('Luhomfu'), 75.99, '„statt 165,99 €“ gehört zum Bücherregal');
  assert.equal(alt('Mobiclinic'), 115.55);
  assert.equal(alt('intellinet'), 5.8);
  assert.equal(alt('Pelikan'), 14.82);
  for (const t of ['O2 Netz, Sim Only: Allnet/SMS Flat Unlimited', 'Promedia24', 'Electrolux', 'RTX 5070', 'HARBR']) assert.equal(alt(t), null, t);
});

test('Preisangaben und Push-Text: „vorher X € → jetzt Y € (−Z %)“, sonst ohne Altpreis', () => {
  const p = preisAngaben({ preis: 23.99, preisVorher: 96.99, vorherQuelle: 'Vergleichspreis laut mydealz' });
  assert.deepEqual(p, { preis: 23.99, preisVorher: 96.99, vorherQuelle: 'Vergleichspreis laut mydealz', ersparnisEuro: 73, ersparnisProzent: 75 });
  assert.equal(preisZeile(p).replace(/\s/g, ' '), 'vorher 96,99 € → jetzt 23,99 € (−75 %)');
  const ohne = preisAngaben({ preis: 165, preisVorher: null });
  assert.equal(preisZeile(ohne).replace(/\s/g, ' '), 'jetzt 165,00 € (Preis vorher unbekannt)');
  assert.equal(preisAngaben({ preis: 10, preisVorher: 9 }).preisVorher, null, 'Altpreis nicht höher -> null');
});

test('Deal-Prüfer: höchstens N Abrufe pro Lauf, Ergebnis gemerkt, abgelaufen bleibt abgelaufen', async () => {
  let n = 0;
  const holeText = async url => { n++; return lies(url.includes('2861129') ? 'echt/deal-2861129-lumaland-laeuft.html' : 'echt/deal-2861305-harbr.html'); };
  const zustand = {};
  const p = macheDealPruefer({ holeText, zustand, jetzt: AM_29, max: 2 });
  assert.equal((await p.pruefe('https://www.mydealz.de/deals/a-2861129')).info.abgelaufen, false);
  assert.equal((await p.pruefe('https://www.mydealz.de/deals/b-2861305')).info.abgelaufen, true);
  assert.equal((await p.pruefe('https://www.mydealz.de/deals/c-2861000')).status, 'nichtGeprueft', 'Limit erreicht');
  assert.equal((await p.pruefe('https://www.urlaubspiraten.de/x')).status, 'keineSeite');
  assert.equal(n, 2);
  // nächster Lauf 1 Stunde später: abgelaufen aus dem Merker, laufender Preisfehler wird neu geprüft
  const p2 = macheDealPruefer({ holeText, zustand, jetzt: new Date(AM_29.getTime() + 3600e3), max: 5 });
  assert.equal((await p2.pruefe('https://www.mydealz.de/deals/b-2861305')).ausCache, true);
  await p2.pruefe('https://www.mydealz.de/deals/a-2861129', { neuNachStunden: 0.75 });
  assert.equal(n, 3);
});

test('echte Daten 31.10. 16:30: kein abgelaufener Preisfehler mehr (vorher 3 als Sofort-Push markiert)', async () => {
  const ctx = { holeText: echtAbruf(), cfg, zustand: {}, jetzt: JETZT };
  const d = await deals(ctx);
  assert.ok(!d.eintraege.some(e => e.preisfehler), d.eintraege.map(e => e.titel).join(' / '));
  const pres = d.eintraege.find(e => /Président/.test(e.titel));
  assert.equal(pres.bis, '2026-11-07T22:59:59.000Z');
  assert.equal(pres.ab, '2026-11-01T23:00:00.000Z');
  assert.match(pres.zeile, /^ab 02\.11\.2026 · /);
  const r = await reisen(ctx);
  assert.ok(!r.eintraege.some(e => /HARBR/.test(e.titel)));
  assert.equal(r.eintraege.find(e => /SAS Sale/.test(e.titel)).bis, '2026-11-02T22:59:59.000Z');
  assert.equal(r.eintraege.find(e => /Ryanair/.test(e.titel)).bis, null, '„bis 31.03.“ ist der Reisezeitraum');
});

test('echte Daten 29.10. 19:00: abgelaufene Preisfehler raus (Deal-Seite), laufender mit vorher → jetzt und Push-Text', async () => {
  const zustand = {};
  const ctx = { holeText: echtAbruf({ laeuft: true }), cfg, zustand, jetzt: AM_29 };
  const d = await deals(ctx);
  const pf = d.eintraege.filter(e => e.preisfehler);
  assert.equal(pf.length, 1, 'HARBR und Faltpavillon sind laut Deal-Seite abgelaufen');
  assert.match(pf[0].titel, /^Möglicher Preisfehler: Lumaland/);
  const l = pf[0];
  assert.deepEqual([l.preis, l.preisVorher, l.vorherQuelle, l.ersparnisEuro, l.ersparnisProzent], [23.99, 96.99, 'Vergleichspreis laut mydealz', 73, 75]);
  assert.equal(l.datum, '2026-10-29T11:26:13.000Z');
  assert.equal(l.sichtbarBis, '2026-10-30T11:26:13.000Z', 'höchstens 24 h');
  assert.equal(l.sofort, true);
  const msg = sofortNachricht(l, cfg);
  assert.match(msg.message.replace(/\s/g, ' '), /^vorher 96,99 € → jetzt 23,99 € \(−75 %\)/);
  // Reisen nutzt dieselbe (gemerkte) Deal-Seite: HARBR abgelaufen
  const r = await reisen(ctx);
  assert.ok(!r.eintraege.some(e => /HARBR/.test(e.titel)));
  assert.ok(Object.keys(zustand.dealSeiten).length >= 3);
});

test('echte Gewinnspiele: Teilnahmeschluss in der Zukunft bleibt (auch wenn alt), vorbei fliegt raus', async () => {
  const t = await tests({ holeText: echtAbruf(), cfg: { ...cfg, module: { ...cfg.module, tests: { ...cfg.module.tests, news: [], feeds: [cfg.module.tests.feeds[1]] } } }, zustand: {}, jetzt: JETZT });
  const items = leseRss(await lies('echt/mydealz-gewinnspiele.xml'));
  const ends = items.map(it => endeAusFuer(`${it.titel} ${it.langtext}`, it.datum, JETZT));
  assert.ok(items.every(it => it.beschreibung.length <= 800), 'Kurztext für Preis-Analyse bleibt kurz');
  const pingui = items.findIndex(it => /Pingui/.test(it.titel));
  assert.equal(ends[pingui].tag, '2027-01-19');
  const sponties = items.findIndex(it => /Sponties/.test(it.titel));
  assert.equal(ends[sponties].tag, '2026-09-30');
  // Einträge im Modul: keiner ist vorbei
  for (const e of t.eintraege) assert.ok(!istVorbei(e, JETZT), e.titel);
});

test('Schnäppchen-Angebote: vorbei, unsichere Menge und Großhandel werden nicht gerechnet', () => {
  const j = Date.parse('2026-10-31T18:30:00Z');
  assert.equal(angebotOk({ shop: 'Kaufland', gueltigBis: '2026-10-31T18:00:00Z', mengeSicher: true }, j), false, 'Kaufland-Knoppers endet 19:00 Berlin');
  assert.equal(angebotOk({ shop: 'PENNY', gueltigBis: '2026-11-01T22:59:00Z', mengeSicher: false }, j), false);
  assert.equal(angebotOk({ shop: 'EDEKA Foodservice', titel: 'Choco Crossies', gueltigBis: '2026-11-04T22:59:00Z' }, j), false);
  assert.equal(angebotOk({ shop: 'Lidl', titel: 'Ben & Jerry\'s', beschreibung: '465/4x100ml', gueltigBis: '2026-11-07T22:59:00Z', mengeSicher: true }, j), true);
  // altes Format (Produktion bis 31.10.): ohne mengeSicher/packung -> unsicher, keine „10 Packungen … (−87 %)“-Zeile mehr
  assert.equal(angebotOk({ shop: 'PENNY', titel: 'Knoppers', gueltigBis: '2026-11-01T22:59:00Z', menge: { stueck: 40, gramm: 1000 } }, j), false);
  assert.equal(angebotOk({ shop: 'Lidl', titel: 'Knoppers 8er', gueltigBis: '2026-11-01T22:59:00Z', packung: '8 × 25 g', menge: { stueck: 8 } }, j), true);
});

test('Schnäppchen-Daten nach neuem Datenvertrag: bis mit Uhrzeit, ab in der Zukunft, Packung, Normalpreis geschätzt', async () => {
  const cur = {
    produkte: [{
      id: 'ben-jerrys', name: 'Ben & Jerry\'s', basis: '100ml', normalpreis: 1.5, normalQuelle: 'schaetzung',
      bestes: {
        shop: 'Lidl', titel: 'Ben & Jerry\'s Eis', packung: '465 ml', preis: 3.99, preisVorher: null, menge: { ml: 465 }, mengeSicher: true,
        mengeQuelle: 'grundpreis', gueltigAb: '2026-11-01T23:00:00Z', gueltigBis: '2026-11-07T22:59:00Z', link: 'https://www.marktguru.de/offers/25478997',
      },
      weitere: [{ shop: 'EDEKA Foodservice', titel: 'Ben & Jerry\'s', preis: 1.0, menge: { ml: 465 }, mengeSicher: true, gueltigBis: '2026-11-07T22:59:00Z', link: 'https://x/fs' }],
    }],
    technik: [],
  };
  const holeText = async url => (url.includes('schnaeppchen-daten') ? JSON.stringify(cur) : '<rss><channel></channel></rss>');
  const r = await deals({ holeText, cfg, zustand: {}, jetzt: JETZT });
  const e = r.eintraege[0];
  assert.equal(e.titel, 'Ben & Jerry\'s bei Lidl', 'Großhandel nicht gewählt, obwohl billiger');
  assert.deepEqual([e.bis, e.bisQuelle, e.ab, e.frist], ['2026-11-07T22:59:00.000Z', 'feld', '2026-11-01T23:00:00.000Z', '2026-11-07']);
  assert.match(e.zeile, /^ab 02\.11\.2026 · \d+ Packungen à 465 ml für/);
  assert.match(e.zeile, /Normalpreis geschätzt$/);
  assert.equal(e.preisVorher, null);
});

test('Preisfehler ohne lesbare Deal-Seite oder älter als 24 h: nicht zeigen, unlesbar wird gemeldet', async () => {
  const { FIXTURE_KARTE } = await import('./fixtures/karte.mjs');
  const r = await deals({ holeText: macheFixtureAbruf(FX, FIXTURE_KARTE), cfg, zustand: {}, jetzt: new Date('2026-10-31T19:00:00Z') });
  const t = r.eintraege.map(e => e.titel);
  assert.ok(t.some(x => /Waschmittel/.test(x)), 'Deal-Seite sagt: läuft');
  assert.ok(!t.some(x => /Kaffeevollautomat|Alte Kamera/.test(x)));
  assert.ok(r.fehler.some(f => /Deal-Seite nicht lesbar.*Kaffeevollautomat/.test(f)));
  assert.ok(!r.fehler.some(f => /Alte Kamera/.test(f)), 'zu alt ist kein Fehler');
  const w = r.eintraege.find(e => /Waschmittel/.test(e.titel));
  assert.deepEqual([w.preis, w.preisVorher, w.vorherQuelle, w.ersparnisProzent], [4.99, 24.99, 'Preis vorher laut Deal-Text', 80]);
});

test('Preisfehler „vielleicht abgelaufen“ (isMaybeExpired) wird nicht gezeigt', async () => {
  const { preisfehlerEintrag } = await import('../module/gemeinsam.mjs');
  const seite = (await lies('echt/deal-2861129-lumaland-laeuft.html')).replace('"isMaybeExpired": false', '"isMaybeExpired": true');
  assert.ok(seite.includes('"isMaybeExpired": true'));
  const it = { titel: 'Preisfehler: Pavillon', link: 'https://www.mydealz.de/deals/x-2861129', datum: '2026-10-29T11:26:13Z', preisText: '23,99€', beschreibung: '', feed: 'mydealz Preisfehler' };
  const pruefer = macheDealPruefer({ holeText: async () => seite, jetzt: AM_29 });
  const r = await preisfehlerEintrag(it, { kategorie: 'deals', pruefer, jetzt: AM_29 });
  assert.equal(r.eintrag, undefined);
  assert.match(r.grund, /vielleicht abgelaufen/);
});
