// Remix-Contests (Xander 07./08.11.2026): eigene Kategorie „remix“, Genre zählt extra, ohne Genre-Wort trotzdem drin
// („lieber 10 passende als 0“), raus nur reine Hip-Hop/Metal/Schlager/Trap-Contests, nur laufende, Frist deutsch/englisch,
// sofort nur bei passender Frist ≤ 14 Tage, nicht doppelt unter Auftritte, Fehler im Status, Fundorte immer da.
// Alle Antworten sind Fixtures im echten Format (Google News RSS, WordPress-Suchfeed, Audius-JSON) – kein Netz.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import remix, { bewerteRemix, englischeFrist, googleNewsEn, leseAudius, wpSucheUrl } from '../module/remix.mjs';
import auftritte from '../module/auftritte.mjs';
import { bewerteRemix as alterImport } from '../module/musik.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const holeText = macheFixtureAbruf(join(HIER, 'fixtures'), FIXTURE_KARTE);
const JETZT = new Date('2026-11-07T12:00:00Z');
const r = cfg.module.remix;
const funde = l => l.filter(e => !e.extra?.fundort);

test('Remix: Genres passen oder sind offen; Hip-Hop/Metal/Schlager/Trap, Entschiedenes und Altes nein', async () => {
  const { eintraege, fehler } = await remix({ holeText, cfg, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  const t = funde(eintraege).map(e => e.titel);
  for (const ja of [/Synthpop duo/, /Italo disco label/, /Darkwave band/, /Synthie-Pop-Band/, /Elektro-Label/, /Euro Disco Revival/, /Phantogram/, /Neon Hearts/, /Paper Boats/, /Glass City/]) assert.ok(t.some(x => ja.test(x)), `${ja} fehlt: ${t.join(' | ')}`);
  for (const nein of [/Hip-hop/, /Metal band/, /Schlager/, /Trap Beat/, /winners announced/, /New wave legends/, /Old Song/, /Block/, /Interview/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen`);
  assert.equal(t.length, 10, t.join(" | "));
  for (const e of eintraege) {
    assert.equal(e.kategorie, 'remix');
    assert.match(e.link, /^https:\/\//);
    assert.ok(['formular', 'mail', 'seite'].includes(e.extra.bewerbung.art));
    assert.equal(e.extra.bewerbenAls.name, 'Xander Fox');
  }
  const phantogram = eintraege.find(e => /Phantogram/.test(e.titel));
  assert.equal(phantogram.extra.passt, false, 'ohne Genre-Wort: offen');
  assert.match(phantogram.zeile, /offen – dein Synth-Pop-Remix geht auch/);
  assert.equal(phantogram.sofort, false, 'offene Contests nie sofort');
  assert.equal(eintraege.find(e => /Synthpop duo/.test(e.titel)).extra.passt, true);
});

test('Remix: Frist (deutsch, englisch, Audius-Feld), „mit Stems“, sofort nur bei Frist ≤ 14 Tage, extra.frist = ISO', async () => {
  const { eintraege } = await remix({ holeText, cfg, jetzt: JETZT });
  const e = re => eintraege.find(x => re.test(x.titel));
  const duo = e(/Synthpop duo/);
  assert.equal(duo.frist, '2026-11-20');
  assert.equal(duo.extra.frist, '2026-11-20T22:59:59.000Z');
  assert.match(duo.zeile, /^Remix-Contest · passt zu deinem Stil · mit Stems · Einsendeschluss 20\.11\.2026$/);
  assert.equal(duo.sofort, true, '13 Tage bis zum Einsendeschluss');
  const italo = e(/Italo disco/);
  assert.equal(italo.frist, '2026-12-31');
  assert.equal(italo.sofort, false, '54 Tage – nur Zusammenfassung');
  assert.equal(e(/Synthie-Pop-Band/).frist, '2026-11-15');
  const dark = e(/Darkwave band/);
  assert.equal(dark.frist, null);
  assert.match(dark.zeile, /Einsendeschluss im Link/);
  assert.equal(dark.sofort, false, 'ohne Frist nie sofort');
  assert.equal(e(/Euro Disco Revival/).frist, '2026-12-06');
  const audius = e(/Neon Hearts/);
  assert.equal(audius.link, 'https://audius.co/nightdrive/neon-hearts');
  assert.equal(audius.bisQuelle, 'feld');
  assert.equal(audius.extra.eingereicht, 12, 'Einreichungen aus related.entry_counts (echtes Format)');
  assert.match(audius.titel, /von Nightdrive/);
  // läuft ohne Ende (end_date null, mit status=active geliefert): bleibt, auch wenn der Contest älter als 30 Tage ist
  const offen = e(/Glass City/);
  assert.ok(offen, 'offener Audius-Contest ohne Ende fehlt');
  assert.match(offen.titel, /^Remix-Contest: Glass City – open remix contest von Coldwave$/);
  assert.equal(offen.extra.eingereicht, 7);
  assert.equal(offen.frist, null);
});

test('Audius: Adresse fragt nur laufende Contests ab (status=active)', () => {
  assert.match(cfg.module.remix.audius.url, /^https:\/\/api\.audius\.co\/v1\/events\/remix-contests\?status=active&/);
});

test('Remix: Fundorte stehen immer da (SKIO, Beatportal, delamar, Remix64) – unter den Funden', async () => {
  const { eintraege } = await remix({ holeText, cfg, jetzt: JETZT });
  const f = eintraege.filter(e => e.extra.fundort);
  assert.ok(f.length >= 4);
  assert.ok(f.some(e => /skiomusic\.com/.test(e.link)) && f.some(e => /delamar\.de/.test(e.link)));
  const sw = e => e.extra.sortWert;
  const besterFundort = Math.max(...f.map(sw));
  const besterFund = Math.max(...funde(eintraege).map(sw));
  assert.ok(besterFund > besterFundort, 'frische Contests vor den Fundorten');
  assert.ok(f.every(e => e.datum === null && e.sichtbarBis === null), 'Fundorte laufen nie ab');
  // auch wenn alle Quellen tot sind: der Bereich ist nie leer
  const tot = async () => { throw new Error('HTTP 503 bei x'); };
  const leer = await remix({ holeText: tot, cfg, jetzt: JETZT });
  assert.ok(leer.eintraege.length >= 4);
  assert.ok(leer.fehler.length >= 5);
});

test('Remix: Regeln einzeln (Genre offen/passend, Ausschluss, Frist vorbei, Alter)', () => {
  const it = (titel, extra = {}) => ({ titel, beschreibung: '', datum: '2026-11-05T10:00:00Z', ...extra });
  assert.equal(bewerteRemix(it('Synthwave remix contest – stems inside'), r, JETZT).passt, true);
  assert.equal(bewerteRemix(it('Remix contest for the new Depeche Mode single'), r, JETZT).passt, true, 'Bandname zählt als Genre');
  const rock = bewerteRemix(it('Rock remix contest'), r, JETZT);
  assert.equal(rock.ok, true);
  assert.equal(rock.passt, false);
  assert.equal(bewerteRemix(it('Rock remix contest'), { ...r, genreNoetig: true }, JETZT).grund, 'Genre passt nicht');
  assert.equal(bewerteRemix(it('Hip hop and electronic remix contest'), r, JETZT).grund, 'Hip-Hop/Metal/Schlager');
  assert.equal(bewerteRemix(it('Hip hop meets synthpop and 80s: remix contest'), r, JETZT).ok, true, 'mit zwei Genre-Treffern nicht „rein Hip-Hop“');
  assert.equal(bewerteRemix(it('Synthpop remix contest, deadline October 1'), r, JETZT).grund, 'Einsendeschluss vorbei');
  assert.equal(bewerteRemix(it('Synthpop remix contest', { datum: '2026-09-20T10:00:00Z' }), r, JETZT).grund, 'zu alt');
  assert.equal(bewerteRemix(it('Synthpop remix contest', { bis: '2026-11-08T22:59:59Z' }), r, JETZT).sofort, true);
  assert.equal(bewerteRemix(it('Rock remix contest', { bis: '2026-11-08T22:59:59Z' }), r, JETZT).sofort, false, 'offen: nur Zusammenfassung');
  assert.equal(bewerteRemix(it('Synthpop Festival: Bands gesucht'), r, JETZT).grund, 'kein Remix-Contest');
  assert.equal(alterImport, bewerteRemix, 'alter Import aus musik.mjs geht weiter');
});

test('Englische Fristen, Such-Adressen', () => {
  assert.equal(englischeFrist('Deadline: December 15, 2026', JETZT), '2026-12-15T22:59:59.000Z');
  assert.equal(englischeFrist('entries close 31 December 2026', JETZT), '2026-12-31T22:59:59.000Z');
  assert.equal(englischeFrist('Submissions close on Nov 30th', JETZT), '2026-11-30T22:59:59.000Z');
  assert.equal(englischeFrist('ends 3 Jan', JETZT), '2027-01-03T22:59:59.000Z', 'ohne Jahr: nächstes, wenn sonst > 2 Monate vorbei');
  assert.equal(englischeFrist('You may submit 5 remixes', JETZT), null);
  assert.equal(englischeFrist('Remix contest – trends of 2026', JETZT), null);
  assert.match(googleNewsEn('remix contest synthpop'), /^https:\/\/news\.google\.com\/rss\/search\?q=remix%20contest%20synthpop&hl=en-US&gl=US&ceid=US:en$/);
  assert.equal(wpSucheUrl('https://edmidentity.com/', 'remix contest'), 'https://edmidentity.com/?s=remix+contest&feed=rss2');
});

test('Audius: tolerant lesen – ohne Track-Link weglassen, Ende als ISO', () => {
  const l = leseAudius({ data: [{ event_type: 'remix_contest', entity_id: 'X', end_date: '2026-12-01T00:00:00Z' }, { event_type: 'remix_contest', track: { title: 'A', permalink: '/u/a', genre: 'Electronic' }, end_date: '2026-12-02' }, { event_type: 'other', entity_id: 'Y' }] });
  assert.equal(l.length, 1);
  assert.equal(l[0].link, 'https://audius.co/u/a');
  assert.match(l[0].bis, /^2026-12-02T/);
  assert.match(l[0].beschreibung, /Genre: Electronic/);
});

test('Remix-Contest mit „Bands gesucht“ steht nur unter Remix (nicht doppelt unter Auftritte)', async () => {
  const rx = await remix({ holeText, cfg, jetzt: JETZT });
  const au = await auftritte({ holeText, cfg, jetzt: JETZT });
  assert.equal(rx.eintraege.filter(e => /remix-und-bands/.test(e.link)).length, 1);
  assert.equal(rx.eintraege.find(e => /remix-und-bands/.test(e.link)).frist, '2026-11-25');
  assert.equal(au.eintraege.filter(e => /remix-und-bands/.test(e.link)).length, 0);
});

test('Remix: kaputte Quelle landet im Status, die anderen laufen weiter', async () => {
  const kaputt = async url => { if (url.includes('edmidentity') || url.includes('audius')) throw new Error('HTTP 526'); return holeText(url); };
  const { eintraege, fehler } = await remix({ holeText: kaputt, cfg, jetzt: JETZT });
  assert.ok(fehler.some(f => /^EDM Identity „remix contest“: HTTP 526/.test(f)), fehler.join(' | '));
  assert.ok(fehler.some(f => /^Audius: HTTP 526/.test(f)), fehler.join(' | '));
  assert.equal(funde(eintraege).length, 5, funde(eintraege).map(e => e.titel).join(" | ")); // nur noch Google News
});
