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

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const wunschliste = JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8'));
const holeText = macheFixtureAbruf(join(HIER, 'fixtures'), FIXTURE_KARTE);
const jetzt = new Date('2026-10-31T19:00:00Z');
const ctx = () => ({ holeText, cfg, wunschliste, zustand: {}, jetzt });
const titel = r => r.eintraege.map(e => e.titel);

test('jeder Eintrag hat Link und „So geht’s“', async () => {
  for (const fn of [deals, erleben, reisen, musik, nebenverdienst, tests]) {
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
