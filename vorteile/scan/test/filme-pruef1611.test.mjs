// Nachbesserung nach den Prüfer-Befunden vom 16.11.2026 (Spur Filme): Countdown-Tag = Tag des mydealz-Beitrags, „Adventure“ ist
// kein Advent, zugeordnete Tipps melden den Apple-Link, Listen-Filme in den Charts bekommen Wikidata-Daten, keine Meldung über 3,99 €.
// Ohne Netz: Fixture-Abrufe wie in filme.test.mjs, dazu ein nachgebauter mydealz-Feed (Fälle des Prüfers).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import filme, { COUNTDOWN_WORT, istCountdownTipp, mdFilmTitel, qualiKandidatIds } from '../module/filme.mjs';
import { planeAdvent } from '../benachrichtigen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const listen = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
const h = macheFixtureAbruf(FIX, [['rss/gruppe/apple-tv', 'mydealz-apple-tv-dezember.xml'], ...FIXTURE_KARTE]);
const lauf = jetzt => filme({ holeText: url => h(url), cfg, wunschliste: {}, zustand: {}, jetzt: new Date(jetzt), filmListen: listen });

test('Countdown-Wort nur als ganzes Wort: „Adventure“, „Adventszeit“, „2. Advent“ sind kein Countdown', () => {
  for (const t of ['Apple TV Countdown Tag 5: Wicked ~ 4,99€', 'iTunes Adventskalender – Wicked', 'Apple-TV-Advent: Wicked', 'Film des Tages: Wicked', 'Tagesangebote bei Apple TV'])
    assert.ok(COUNTDOWN_WORT.test(t), t);
  for (const t of ["Bill & Ted's Excellent Adventure ~ 3,99€", 'Adventure Time: Staffel 1 ~ 9,99€', 'Filme für die Adventszeit', 'Zum 2. Advent: Harry Potter 8 Filme', 'Montag 5: Wicked'])
    assert.ok(!COUNTDOWN_WORT.test(t), t);
  assert.equal(mdFilmTitel('Adventure Time: Staffel 1 ~ 9,99€'), 'Adventure Time: Staffel 1');
  assert.equal(mdFilmTitel('Apple TV Countdown Tag 4: Wicked ~ 4,99€ | UHD digital | Apple TV'), 'Wicked');
  assert.equal(mdFilmTitel("Bill & Ted's Excellent Adventure ~ 3,99€ | UHD digital | Apple TV"), "Bill & Ted's Excellent Adventure");
  // Beschreibung zählt nur mit „heute“/„Tag N“ vor dem Countdown-Wort
  assert.ok(istCountdownTipp('Gladiator II ~ 4,99€', 'Tag 5 im Apple TV Countdown: Gladiator II'));
  assert.ok(!istCountdownTipp('Kevin ~ 3,99€', 'passt in die Adventszeit. Der Apple-Countdown läuft übrigens auch.'));
});

test('Lauf am 05.12. 08:10: Countdown-Tag = Tag des Beitrags; der Countdown von gestern wird nie „Film des Tages“', async () => {
  const r = await lauf('2026-12-05T07:10:00Z');
  const cd = r.datei.countdown || [];
  const wicked = cd.find(c => /Wicked/.test(c.titel)), glad = cd.find(c => /Gladiator/.test(c.titel));
  assert.equal(wicked?.tag, '2026-12-04', 'Beitrag vom 04.12. 09:30');
  assert.equal(glad?.tag, '2026-12-05', 'Beitrag vom 05.12. 06:40 („Tag 5 im Apple TV Countdown“ in der Beschreibung)');
  assert.ok(!cd.some(c => /Adventure|Kevin/.test(c.titel)), 'Adventure/Adventszeit/normaler Deal sind kein Countdown');
  // Push am 05.12.: Gladiator II (heute), nie Wicked (gestern) – auch nicht am 06.12. aus derselben Datei
  const p = planeAdvent({ datei: r.datei, zustand: {}, cfg, jetzt: new Date('2026-12-05T07:20:00Z') });
  assert.match(p.msg.title, /^Film des Tages · 5\. Dez\.: Gladiator II/);
  assert.match(p.msg.message, /mydealz/, 'bei Apple nicht eindeutig gefunden: der Text sagt ehrlich, wohin der Link führt');
  const morgen = planeAdvent({ datei: { ...r.datei, aktualisiert: '2026-12-06T06:00:00Z' }, zustand: {}, cfg, jetzt: new Date('2026-12-06T07:20:00Z') });
  assert.equal(morgen.msg, null, '06.12. 08:20: kein Countdown von heute -> bis 12 Uhr warten, nichts Veraltetes');
  assert.equal(morgen.warten, true);
});

test('Zugeordneter mydealz-Tipp: Meldung führt in die TV-App (Apple-Link), keine zweite Meldung mit mydealz-Link', async () => {
  const r = await lauf('2026-12-05T07:10:00Z');
  const kevin = r.eintraege.filter(e => /Kevin/.test(e.titel));
  assert.ok(kevin.length >= 1, 'Kevin wird gemeldet');
  assert.ok(kevin.every(e => /apple\.com\//.test(e.link)), kevin.map(e => e.link).join(', '));
  assert.ok(!r.eintraege.some(e => /mydealz\.de\/deals\/kevin/.test(e.link)), 'kein mydealz-Link für den zugeordneten Tipp');
  const k = r.datei.gruppen.fuer399.find(t => /Kevin/.test(t.titel));
  assert.ok(k?.tipp?.link, 'auf der Seite mit Vermerk „Tipp von mydealz“');
  // nicht zugeordneter Tipp bleibt ein Tipp (mit mydealz-Link), über 3,99 € keine Meldung
  assert.ok(!r.eintraege.some(e => e.quelle === 'mydealz' && (e.preise?.preis ?? 0) > 3.99), 'keine mydealz-Meldung über 3,99 €');
});

test('Wikidata-Kandidaten: Listen-Filme bis maxPreis auch, wenn sie in den Charts stehen (Kindergarten Cop, Manta Manta)', () => {
  const preise = { 'itunes:kc': 3.99, 'itunes:mm': 3.99, 'itunes:teuer': 9.99, 'itunes:chart': 3.99, 'itunes:liste': 4.99, 'itunes:tipp': 3.99 };
  const ids = qualiKandidatIds({
    chartIds: ['itunes:chart', 'itunes:kc', 'itunes:mm', 'itunes:teuer'],
    listenIds: new Set(['itunes:kc', 'itunes:mm', 'itunes:teuer', 'itunes:liste']),
    tippIds: new Set(['itunes:tipp', 'itunes:chart']),
    preisVon: id => preise[id] ?? null, maxPreis: 4.99,
  });
  assert.deepEqual(ids, ['itunes:chart', 'itunes:kc', 'itunes:mm', 'itunes:liste', 'itunes:tipp']);
  assert.ok(!ids.includes('itunes:teuer'), 'Listen-Film über 4,99 € braucht keine Daten (steht ohnehin, Filter nur unter den günstigen)');
});
