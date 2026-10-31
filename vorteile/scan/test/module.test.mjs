import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { leseRss } from '../lib/rss.mjs';
import { fristAus, grammAus, enthaelt } from '../lib/text.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import deals from '../module/deals.mjs';
import erleben from '../module/erleben.mjs';
import reisen, { abflugArt } from '../module/reisen.mjs';
import musik, { geizhalsPreis, merkePreis } from '../module/musik.mjs';
import nebenverdienst, { baUrl } from '../module/nebenverdienst.mjs';
import tests, { bewerteTest } from '../module/tests.mjs';
import praemien, { bewertePraemie, praemieAus, hakenAus, ausschlussGrund } from '../module/praemien.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const wunschliste = JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8'));
const holeText = macheFixtureAbruf(join(HIER, 'fixtures'), FIXTURE_KARTE);
const jetzt = new Date('2026-10-31T19:00:00Z');
const ctx = () => ({ holeText, cfg, wunschliste, zustand: {}, jetzt });
const titel = r => r.eintraege.map(e => e.titel);

test('jeder Eintrag hat Link und „So geht’s“', async () => {
  for (const fn of [deals, erleben, reisen, musik, nebenverdienst, tests, praemien]) {
    const r = await fn(ctx());
    assert.ok(r.eintraege.length > 0, fn.name);
    for (const e of r.eintraege) {
      assert.match(e.link, /^https:\/\//, e.titel);
      assert.ok(e.soGehts && e.soGehts.length > 10, e.titel);
      assert.ok(e.wert >= 0 && e.wert <= 100);
    }
  }
});

test('deals: Crunchips aus den Schnäppchen-Daten neu gerechnet, Technik-Preisfehler nicht doppelt, kaputter Feed meldet Fehler', async () => {
  const r = await deals(ctx());
  const c = r.eintraege.find(e => e.titel.startsWith('Lorenz Crunchips'));
  assert.equal(c.titel, 'Lorenz Crunchips bei Kaufland');
  assert.match(c.zeile, /10 Packungen für 4,40\s€ statt 19,90\s€ \(−78 %\)/);
  assert.match(c.zeile, /0,25\s€ pro 100 g statt 1,33\s€/);
  assert.equal(c.sofort, false, 'Schnäppchen-Wecker meldet selbst');
  assert.ok(!titel(r).some(t => /Soundbar/.test(t)));
  assert.ok(titel(r).some(t => /Waschmittel/.test(t)));
  assert.ok(!titel(r).some(t => /Coca-Cola|Alte Aktion/.test(t)));
  const h = r.eintraege.find(e => /Haribo/.test(e.titel));
  assert.match(h.soGehts, /Scondoo/);
  assert.ok(r.fehler.some(f => /Drogerie/.test(f)));
});

test('erleben: regionale Therme ja, Bayern nein, Stadtfest mit „Eintritt frei“', async () => {
  const t = titel(await erleben(ctx()));
  assert.ok(t.some(x => /Bad Schandau/.test(x)));
  assert.ok(!t.some(x => /Wörishofen/.test(x)));
  assert.ok(t.some(x => /Döbeln/.test(x)));
});

test('reisen: ab Leipzig ja, ab Frankfurt nein, Preisfehler sofort, Atom-Feed geht, Urlaubsguru-Ausfall gemeldet', async () => {
  const r = await reisen(ctx());
  const t = titel(r);
  assert.ok(t.some(x => /ab Leipzig/.test(x)));
  assert.ok(!t.some(x => /Frankfurt/.test(x)));
  assert.ok(!t.some(x => /Hotel in Berlin|Prag/.test(x)));
  assert.equal(r.eintraege.find(e => /Ostsee/.test(e.titel)).sofort, true);
  assert.ok(r.fehler.some(f => /Urlaubsguru/.test(f)));
  assert.equal(abflugArt('Flüge ab Dresden nach Rom', cfg.module.reisen), 'eigen');
  assert.equal(abflugArt('Flüge ab München nach Rom', cfg.module.reisen), 'fremd');
});

test('musik: MicroFreak unter Zielpreis sofort, Tasche aussortiert, Band-Aufruf mit Frist, Coverband/abgelaufen raus', async () => {
  const z = ctx();
  const r = await musik(z);
  const mf = r.eintraege.find(e => /MicroFreak/.test(e.titel));
  assert.equal(mf.extra.preis, 229);
  assert.equal(mf.sofort, true);
  assert.ok(!titel(r).some(t => /Tasche/.test(t)));
  const b = r.eintraege.find(e => /Stadtfest Leipzig/.test(e.titel));
  assert.equal(b.frist, '2026-11-20');
  assert.equal(b.sofort, true);
  assert.ok(!titel(r).some(t => /Coverband|Köln/.test(t)));
  assert.equal(z.zustand.musik['Arturia MicroFreak'].tiefst.p, 229);
});

test('musik: Tiefstpreis erst mit genug Historie, Geizhals-Preis lesen', () => {
  const z = {};
  for (let i = 10; i > 0; i--) merkePreis(z, 'X', 300 + i, new Date(Date.UTC(2026, 9, 31 - i)));
  const vorher = merkePreis(z, 'X', 299, new Date('2026-10-31T12:00:00Z'));
  assert.equal(vorher.tage, 10);
  assert.equal(vorher.tiefst.p, 301);
  assert.equal(geizhalsPreis('<script type="application/ld+json">{"offers":{"@type":"AggregateOffer","lowPrice":"499.00"}}</script>'), 499);
});

test('nebenverdienst: Homeoffice-Jobs ja, Außendienst nein, Duplikate einmal, Link zur Arbeitsagentur', async () => {
  const r = await nebenverdienst(ctx());
  assert.equal(r.eintraege.length, 2);
  assert.ok(r.eintraege.every(e => e.link.startsWith('https://www.arbeitsagentur.de/jobsuche/jobdetail/')));
  assert.match(r.eintraege.find(e => /Arabisch/.test(e.titel)).soGehts, /Arabisch/);
  const u = new URL(baUrl(cfg.module.nebenverdienst.ba, { was: 'Deutschlehrer', wo: 'Döbeln', umkreis: 50 }));
  assert.equal(u.searchParams.get('wo'), 'Döbeln');
  assert.equal(u.searchParams.get('angebotsart'), '1');
});

test('tests: Fallen und unattraktive Gewinnspiele raus', async () => {
  const t = titel(await tests(ctx()));
  assert.ok(t.some(x => /Kopfhörer/.test(x)));
  assert.ok(t.some(x => /Synthesizer für Leser/.test(x)));
  assert.ok(!t.some(x => /Gewinnspielservice|Auto|Shampoo/.test(x)));
  const m = cfg.module.tests;
  assert.equal(bewerteTest('Gewinnspiel: iPhone gewinnen, nur per SMS', m, cfg), null);
  assert.equal(bewerteTest('Probanden für klinische Studie gesucht, Produkttest', m, cfg), null);
});

test('praemien: Netto, Aufwand, Haken; sortiert nach € pro Stunde; Unseriöses raus; höchstens 1 Sofort', async () => {
  const r = await praemien(ctx());
  const t = titel(r);
  const k = r.eintraege.find(e => /Musterbank$/.test(e.titel));
  assert.equal(k.extra.praemie, 100, 'Geldeingang von 1.000 € ist Bedingung, nicht Prämie');
  assert.equal(k.extra.netto, 100);
  assert.equal(k.extra.aufwandMin, 45);
  assert.ok(k.extra.haken.includes('Schufa-Abfrage'));
  assert.ok(k.extra.haken.some(h => /Geldeingang 1\.000/.test(h)));
  assert.equal(k.sofort, true);
  assert.equal(r.eintraege.filter(e => e.sofort).length, 1, 'keine Push-Flut');
  assert.equal(r.eintraege.find(e => /Duschgel/.test(e.titel)).extra.praemie, 15);
  assert.equal(r.eintraege.find(e => /Payback für/.test(e.titel)).extra.netto, 20);
  assert.ok(!t.some(x => /Bitcoin|Casino|Umfragen|Depot|Netflix|passives|Musterbank Plus|Handytarif|Altes Konto|Kugelschreiber/.test(x)), t.join(' / '));
  assert.ok(t.some(x => /Strom\/Gas: Anbieter wechseln/.test(x)), 'gepflegte Liste');
  assert.ok(r.eintraege.filter(e => e.quelle === 'gepflegte Liste').every(e => !e.sofort), 'Liste nie als Push');
  const ps = r.eintraege.map(e => e.extra.proStunde);
  assert.deepEqual(ps, [...ps].sort((a, b) => b - a));
  assert.ok(r.fehler.some(f => /Wechselbonus/.test(f)), 'kaputter Feed gemeldet, Rest läuft');
});

test('praemien: Rechen- und Ausschluss-Regeln', () => {
  const m = cfg.module.praemien;
  assert.deepEqual(praemieAus('Bis zu 200 € Prämie'), { praemie: 200, bisZu: true });
  assert.equal(bewertePraemie('Girokonto: bis zu 200 € Prämie', m).praemie, 100, '„bis zu“ nur halb');
  const h = hakenAus('Kontoführung 2 € pro Monat, Laufzeit 12 Monate', 'konto', m);
  assert.equal(h.kosten, 24);
  assert.equal(bewertePraemie('Stromanbieter wechseln: 120 € Wechselbonus, Abschlag 80 € pro Monat, Laufzeit 12 Monate', m).netto, 120, 'Strom brauchst du sowieso');
  assert.equal(bewertePraemie('Gratis Probe, Versandkosten 4,95 €', m), null, 'Versand frisst Gratis-Probe');
  assert.equal(bewertePraemie('Gratis Kugelschreiber', m, { preisText: '2,99€' }), null, 'nicht gratis');
  assert.ok(bewertePraemie('Gratis Rucksack im Wert von 20 €', m, { preisText: '0€' }).sofort, 'gratis ohne Haken ab 10 €');
  assert.equal(bewertePraemie('Gratis Probe Shampoo', m, { preisText: '0€' }).sofort, false);
  assert.equal(bewertePraemie('Konto: 20 € Prämie', m).sofort, false, 'unter 25 € netto kein Push');
  for (const [text, grund] of [
    ['Krypto-Börse: 30 € Bonus', 'trading'], ['ETF-Depot: 50 € Prämie ab 1.000 € Einzahlung', 'trading'],
    ['Sportwetten: 100 € Wettbonus', 'gluecksspiel'], ['Probemonat gratis, danach kostenpflichtig', 'abofalle'],
    ['Network Marketing: 50 € Bonus pro Partner', 'schneeball'], ['Gratis-Handy gegen Vorkasse der Versandgebühr', 'vorkasse'],
    ['Freunde werben: lade dein Telefonbuch hoch und erhalte 10 €', 'fremdeDaten'], ['Bezahlte Umfragen: 5 € Bonus', 'umfrage'],
    ['Ratenkredit mit 100 € Prämie', 'kredit'],
  ]) assert.equal(ausschlussGrund(text, m), grund, text);
  assert.equal(ausschlussGrund('Freunde werben bei der Sparkasse: 50 € Prämie', m), null);
});

test('Helfer: Fristen, Mengen, Wortsuche, RSS', () => {
  assert.equal(fristAus('Bewerbungsschluss: 30.11.2026', jetzt), '2026-11-30');
  assert.equal(fristAus('Bewerben bis 15. Januar', jetzt), '2027-01-15');
  assert.equal(fristAus('Einsendeschluss 1.12.', jetzt), '2026-12-01');
  assert.equal(fristAus('ohne Datum', jetzt), null);
  assert.equal(grammAus('Crunchips 150 g +25 g gratis'), 150);
  assert.equal(grammAus('6 x 0,5 l'), 3000);
  assert.ok(enthaelt('Deutsche Bahn ICE', ['ice']));
  assert.ok(!enthaelt('Service', ['ice']));
  assert.equal(leseRss('<rss><channel><item><title>A &amp; B</title><link>https://x</link></item></channel></rss>')[0].titel, 'A & B');
  assert.throws(() => leseRss('<html>'));
});
