// Remix-Contests (Xander 07.11.2026): nur Synth-Pop/80er/Italo/Euro-Disco/Elektro/Dark Wave/New Wave, nur laufende,
// Frist deutsch und englisch, sofort nur bei Frist ≤ 14 Tage, nicht doppelt unter „Bands gesucht“, Fehler im Status.
// Alle Antworten sind Fixtures im echten Format (Google News RSS, WordPress-RSS) – kein Netz.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import musik, { remixContests, bewerteRemix, englischeFrist, googleNewsEn } from '../module/musik.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const wunschliste = JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8'));
const holeText = macheFixtureAbruf(join(HIER, 'fixtures'), FIXTURE_KARTE);
const JETZT = new Date('2026-11-07T12:00:00Z');
const r = cfg.module.musik.remix;

test('Remix-Contests: passende Genres ja, Hip-Hop/Metal/Schlager/Trap nein, Abgelaufenes und Altes nein', async () => {
  const { eintraege, fehler } = await remixContests({ holeText, cfg, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  const t = eintraege.map(e => e.titel);
  for (const ja of [/Synthpop duo/, /Italo disco label/, /Darkwave band/, /Synthie-Pop-Band/, /Elektro-Label/, /Euro Disco Revival/]) assert.ok(t.some(x => ja.test(x)), `${ja} fehlt: ${t.join(' | ')}`);
  for (const nein of [/Hip-hop/, /Metal band/, /Schlager/, /Trap Beat/, /winners announced/, /New wave legends/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen`);
  assert.equal(t.length, 6, t.join(' | '));
  for (const e of eintraege) {
    assert.equal(e.kategorie, 'musik');
    assert.equal(e.grund, 'Remix-Contest');
    assert.equal(e.extra.art, 'remix');
    assert.match(e.link, /^https:\/\//);
  }
});

test('Remix-Contests: Frist (deutsch und englisch), „mit Stems“, sofort nur bei Frist ≤ 14 Tage', async () => {
  const { eintraege } = await remixContests({ holeText, cfg, jetzt: JETZT });
  const e = re => eintraege.find(x => re.test(x.titel));
  const duo = e(/Synthpop duo/);
  assert.equal(duo.frist, '2026-11-20');
  assert.match(duo.zeile, /^Remix-Contest · mit Stems · Einsendeschluss 20\.11\.2026$/);
  assert.equal(duo.sofort, true, '13 Tage bis zum Einsendeschluss');
  const italo = e(/Italo disco/);
  assert.equal(italo.frist, '2026-12-31');
  assert.equal(italo.sofort, false, '54 Tage – nur Zusammenfassung');
  const de = e(/Synthie-Pop-Band/);
  assert.equal(de.frist, '2026-11-15');
  assert.equal(de.sofort, true);
  const dark = e(/Darkwave band/);
  assert.equal(dark.frist, null);
  assert.match(dark.zeile, /Einsendeschluss im Link/);
  assert.equal(dark.sofort, false, 'ohne Frist nie sofort');
  assert.ok(Date.parse(dark.sichtbarBis) - Date.parse(dark.datum) >= 29 * 864e5, 'ohne Frist bis zu 30 Tage sichtbar');
  assert.equal(e(/Euro Disco Revival/).frist, '2026-12-06');
});

test('Remix-Contests: Regeln einzeln (Genre, Ausschluss, Frist vorbei, Alter)', () => {
  const it = (titel, extra = {}) => ({ titel, beschreibung: '', datum: '2026-11-05T10:00:00Z', ...extra });
  assert.equal(bewerteRemix(it('Synthwave remix contest – stems inside'), r, JETZT).ok, true);
  assert.equal(bewerteRemix(it('Remix contest for the new Depeche Mode single'), r, JETZT).ok, true, 'Bandname zählt als Genre');
  assert.equal(bewerteRemix(it('Rock remix contest'), r, JETZT).grund, 'Genre passt nicht');
  assert.equal(bewerteRemix(it('Hip hop and electronic remix contest'), r, JETZT).grund, 'Hip-Hop/Metal/Schlager');
  assert.equal(bewerteRemix(it('Hip hop meets synthpop and 80s: remix contest'), r, JETZT).ok, true, 'mit zwei Genre-Treffern nicht „rein Hip-Hop“');
  assert.equal(bewerteRemix(it('Synthpop remix contest, deadline October 1'), r, JETZT).grund, 'Einsendeschluss vorbei');
  assert.equal(bewerteRemix(it('Synthpop remix contest', { datum: '2026-09-20T10:00:00Z' }), r, JETZT).grund, 'zu alt');
  assert.equal(bewerteRemix(it('Synthpop remix contest', { bis: '2026-11-08T22:59:59Z' }), r, JETZT).sofort, true);
  assert.equal(bewerteRemix(it('Synthpop remix contest im Bandcontest'), r, JETZT).ok, true);
  assert.equal(bewerteRemix(it('Synthpop Festival: Bands gesucht'), r, JETZT).grund, 'kein Remix-Contest');
});

test('Englische Fristen', () => {
  assert.equal(englischeFrist('Deadline: December 15, 2026', JETZT), '2026-12-15T22:59:59.000Z');
  assert.equal(englischeFrist('entries close 31 December 2026', JETZT), '2026-12-31T22:59:59.000Z');
  assert.equal(englischeFrist('Submissions close on Nov 30th', JETZT), '2026-11-30T22:59:59.000Z');
  assert.equal(englischeFrist('ends 3 Jan', JETZT), '2027-01-03T22:59:59.000Z', 'ohne Jahr: nächstes, wenn sonst > 2 Monate vorbei');
  assert.equal(englischeFrist('You may submit 5 remixes', JETZT), null);
  assert.equal(englischeFrist('Remix contest – trends of 2026', JETZT), null);
  assert.match(googleNewsEn('remix contest synthpop'), /^https:\/\/news\.google\.com\/rss\/search\?q=remix%20contest%20synthpop&hl=en-US&gl=US&ceid=US:en$/);
});

test('Remix-Contest mit „Bands gesucht“ steht nur unter Remix-Contests (nicht doppelt als Aufruf)', async () => {
  const res = await musik({ holeText, cfg, wunschliste, zustand: {}, jetzt: JETZT });
  const treffer = res.eintraege.filter(e => /remix-und-bands/.test(e.link));
  assert.equal(treffer.length, 1);
  assert.equal(treffer[0].grund, 'Remix-Contest');
  assert.equal(treffer[0].frist, '2026-11-25');
});

test('Remix-Contests: kaputte Quelle landet im Status, die anderen laufen weiter', async () => {
  const kaputt = async url => { if (url.includes('remixcomps')) throw new Error('HTTP 404'); return holeText(url); };
  const { eintraege, fehler } = await remixContests({ holeText: kaputt, cfg, jetzt: JETZT });
  assert.ok(fehler.some(f => /^RemixComps: HTTP 404/.test(f)), fehler.join(' | '));
  assert.equal(eintraege.length, 5);
});
