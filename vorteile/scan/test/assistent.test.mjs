// Auftritte + Deutschunterricht (Xander 08.11.2026: „in jedem Bereich auf jeden Fall was finden … was das Nächste ist …
// wo ich mich als Band bewerben kann … Xander Fox oder One Day in Rome?“). Orte/Entfernung, Bewerbungsweg, Fundorte,
// Jobbörse v6 mit Ausweich-Adressen, JSON-LD-Seiten, Remotive. Alles mit Fixtures im echten Format – kein Netz.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { ortAus, ortNach, distanzKm, DOEBELN } from '../lib/orte.mjs';
import { leseBa, macheBaSuche, baUrl, baWebUrl, BA_V6 } from '../lib/ba.mjs';
import { jsonldEvents } from '../lib/jsonld.mjs';
import { bewerbungAus, bewerbenAls, saisonInfo, fundortEintraege, pruefeFundorte, fundortePruefen } from '../module/assistent.mjs';
import auftritte, { auftrittTyp, bewerteAuftritt } from '../module/auftritte.mjs';
import unterricht, { unterrichtTyp } from '../module/unterricht.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const holeText = macheFixtureAbruf(FX, FIXTURE_KARTE);
const JETZT = new Date('2026-11-07T12:00:00Z');
const funde = l => l.filter(e => !e.extra?.fundort);

test('Orte: Entfernung ab Döbeln, erster Ort im Text, mehrdeutige Wörter (Halle, Essen) zählen nicht', () => {
  assert.equal(distanzKm(DOEBELN, DOEBELN), 0);
  const l = ortAus('Open Stage im Werk 2 Leipzig');
  assert.equal(l.ort, 'Leipzig');
  assert.ok(l.km > 45 && l.km < 60, String(l.km));
  assert.equal(ortAus('Bandcontest in Dresden, Finale in Leipzig').ort, 'Dresden');
  assert.equal(ortAus('Konzert in der Halle, danach Essen'), null);
  assert.equal(ortAus('Festival in Halle (Saale)').ort, 'Halle (Saale)');
  assert.equal(ortAus('Döbelner Kulturnacht'), null, 'nur ganze Wörter');
  assert.equal(ortAus('Stadtfest Döbeln').km, 0);
  assert.equal(ortNach('Leipzig').ort, 'Leipzig');
  assert.ok(ortNach('Hamburg').km > 300);
  assert.equal(ortNach('Kleinkleckersdorf'), null);
});

test('Bewerbungsweg: Mail > Formular > Seite; Name: Band-Slot = One Day in Rome, Solo/Remix = Xander Fox', () => {
  assert.deepEqual(bewerbungAus('Bewerbung per Mail an info@bandcontest-dresden.de', 'https://x.de'), { art: 'mail', ziel: 'info@bandcontest-dresden.de' });
  assert.deepEqual(bewerbungAus('Bewerbung über das Online-Formular', 'https://x.de/a'), { art: 'formular', ziel: 'https://x.de/a' });
  assert.deepEqual(bewerbungAus('Mehr Infos', 'https://x.de/b'), { art: 'seite', ziel: 'https://x.de/b' });
  assert.equal(bewerbungAus('an max@example.com', 'https://x.de').art, 'seite', 'Beispiel-Adressen zählen nicht');
  const k = cfg.kuenstler;
  assert.equal(bewerbenAls('stadtfest', k).name, 'One Day in Rome');
  assert.match(bewerbenAls('festival', k).warum, /Kontakt: Xander Fox/);
  assert.equal(bewerbenAls('openstage', k).name, 'Xander Fox');
  assert.equal(bewerbenAls('remix', k).name, 'Xander Fox');
  assert.equal(bewerbenAls('unterricht', k).name, 'Deutsch mit Xander');
});

test('Saison: Bewerbungsfenster (Jan–Mär) vs. jetzt', () => {
  assert.deepEqual(saisonInfo({ bewerbung: [1, 2, 3], termin: 'Mai' }, JETZT), { offen: false, text: 'Bewerbung meist Jan–Mär · Termin: Mai' });
  assert.equal(saisonInfo({ bewerbung: [9, 10, 11, 12, 1, 2], termin: 'Pfingsten' }, JETZT).offen, true);
  assert.equal(saisonInfo({ bewerbung: [9, 10, 11, 12, 1, 2] }, JETZT).text, 'jetzt bewerben');
  assert.equal(saisonInfo(null, JETZT).offen, true);
});

// JSON-LD-Seiten: in der config seit dem gigmit-404 (08.11.2026) leer – der Weg bleibt, hier mit der gigmit-Fixture geprüft
const mitSeiten = { ...cfg, module: { ...cfg.module, auftritte: { ...cfg.module.auftritte, seiten: [
  { name: 'gigmit Leipzig', url: 'https://gigmit.com/en/gigs/leipzig', stadt: 'Leipzig' }, { name: 'gigmit Dresden', url: 'https://gigmit.com/en/gigs/dresden', stadt: 'Dresden' },
] } } };

test('Auftritte: nah + bald zuerst, Sieger-Berichte und reine Bühnen-News raus, Frist/Ort/km/Bewerbung je Eintrag', async () => {
  const { eintraege, fehler } = await auftritte({ holeText, cfg: mitSeiten, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  const f = funde(eintraege);
  const t = f.map(e => e.titel);
  for (const ja of [/Open Stage im Werk 2/, /Bandcontest in Dresden/, /Hamburg: Hafenfest/, /Stadtfest Leipzig sucht/, /Synth Night at Distillery/]) assert.ok(t.some(x => ja.test(x)), `${ja} fehlt: ${t.join(' | ')}`);
  for (const nein of [/Siegerband/, /neue Bühne am Markt/, /Coverband/, /Köln/, /Remix-Wettbewerb/, /Summer Open Air/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen`);
  const e = re => eintraege.find(x => re.test(x.titel));
  const os = e(/Open Stage im Werk 2/);
  assert.equal(os.extra.typ, 'openstage');
  assert.equal(os.extra.ort, 'Leipzig');
  assert.equal(os.frist, '2026-11-25');
  assert.equal(os.extra.bewerbenAls.name, 'Xander Fox');
  const dd = e(/Bandcontest in Dresden/);
  assert.deepEqual(dd.extra.bewerbung, { art: 'mail', ziel: 'info@bandcontest-dresden.de' });
  assert.equal(dd.extra.typ, 'bandcontest');
  assert.equal(dd.extra.bewerbenAls.name, 'One Day in Rome');
  assert.equal(dd.extra.frist, '2026-12-15T22:59:59.000Z');
  const hh = e(/Hamburg: Hafenfest/);
  assert.equal(hh.extra.bewerbung.art, 'formular');
  assert.ok(hh.extra.km > 300);
  assert.ok(dd.extra.sortWert > hh.extra.sortWert, 'Dresden vor Hamburg');
  assert.equal(hh.sofort, false, 'weit weg und ohne Genre: kein Sofort-Push');
  const gig = e(/Synth Night/);
  assert.equal(gig.extra.typ, 'gig');
  assert.equal(gig.link, 'https://www.gigmit.com/gigs/synth-night-at-distillery-leipzig-99901');
  assert.equal(gig.extra.termin, '2026-12-12T20:00:00+01:00');
  for (const x of eintraege) {
    assert.equal(x.kategorie, 'auftritte');
    assert.ok(['formular', 'mail', 'seite'].includes(x.extra.bewerbung.art));
    assert.ok('ort' in x.extra && 'km' in x.extra && 'frist' in x.extra);
  }
});

test('Auftritte: Fundorte immer da – Döbeln/Leipzig mit km, WGT per Mail, auch wenn alle Quellen tot sind', async () => {
  const tot = async () => { throw new Error('HTTP 503 bei x'); };
  const { eintraege, fehler } = await auftritte({ holeText: tot, cfg, jetzt: JETZT });
  assert.ok(fehler.length > 5);
  assert.ok(eintraege.length >= 6, 'nie „da gibt es nichts“');
  const kn = eintraege.find(e => /Kulturnacht/.test(e.titel));
  assert.equal(kn.extra.km, 0);
  assert.equal(kn.extra.saisonOffen, false);
  assert.match(kn.zeile, /Döbeln · 0 km · .*Bewerbung meist Jan–Mär · Termin: Mai/);
  const wgt = eintraege.find(e => /Wave-Gotik/.test(e.titel));
  assert.deepEqual(wgt.extra.bewerbung, { art: 'mail', ziel: 'bewerbung@wave-gotik-treffen.de' });
  assert.equal(wgt.extra.saisonOffen, true);
  assert.match(wgt.zeile, /jetzt bewerben/);
  assert.equal(wgt.extra.bewerbenAls.name, 'One Day in Rome');
  const sph = eintraege.find(e => /SPH/.test(e.titel));
  assert.equal(sph.extra.km, null);
  assert.match(sph.zeile, /^deutschlandweit/);
  // in der Bewerbungszeit (WGT, Nov) vor einem Fundort außerhalb (Kulturnacht) trotz größerer Entfernung
  assert.ok(wgt.extra.sortWert > kn.extra.sortWert - 15);
});

test('Auftritte: Regeln einzeln', () => {
  const m = cfg.module.auftritte;
  const it = (titel, beschreibung = '') => ({ titel, beschreibung, datum: '2026-11-05T10:00:00Z' });
  assert.equal(auftrittTyp('Open Mic im Café'), 'openstage');
  assert.equal(auftrittTyp('Nachwuchswettbewerb für Bands'), 'bandcontest');
  assert.equal(auftrittTyp('Fête de la Musique: Musiker gesucht'), 'stadtfest');
  assert.equal(bewerteAuftritt(it('Bands gesucht für Stadtfest'), m, JETZT).ok, true);
  assert.equal(bewerteAuftritt(it('Coverband gesucht für Firmenfeier'), m, JETZT).ok, undefined);
  assert.equal(bewerteAuftritt(it('Stadtfest: Programm steht'), m, JETZT).grund, 'kein Aufruf');
  assert.equal(bewerteAuftritt(it('Bandcontest: Lokalmatadoren holen den Titel', 'Die Band hat gewonnen'), m, JETZT).ok, undefined);
});

test('JSON-LD: ItemList mit MusicEvents, kaputter Block übersprungen', async () => {
  const html = await readFile(join(FX, 'gigmit-leipzig.html'), 'utf8');
  const ev = jsonldEvents(html, 'https://gigmit.com/en/gigs/leipzig');
  assert.equal(ev.length, 2);
  assert.deepEqual([ev[0].name, ev[0].stadt, ev[0].ort], ['Synth Night at Distillery – opener wanted', 'Leipzig', 'Distillery']);
  assert.deepEqual(jsonldEvents('<html></html>'), []);
});

test('Jobbörse: v6 zuerst, bei 403 die Ausweich-Adresse (und in diesem Lauf nicht mehr v6), Felder tolerant', async () => {
  const ba = cfg.module.unterricht.ba;
  const s = { was: 'Deutschlehrer', wo: 'Döbeln', umkreis: 50 };
  assert.match(baUrl(ba, s), /^https:\/\/rest\.arbeitsagentur\.de\/jobboerse\/jobsuche-service\/pc\/v6\/jobs\?was=Deutschlehrer&wo=D%C3%B6beln&umkreis=50&angebotsart=1/);
  assert.ok(!baUrl(ba, { was: 'x', arbeitszeit: 'ho' }).includes('arbeitszeit'), 'v6: kein Homeoffice-Filter');
  assert.ok(baUrl(ba, { was: 'x', arbeitszeit: 'ho' }, ba.ausweich[0]).includes('arbeitszeit=ho'));
  assert.equal(BA_V6, ba.api);
  const gefragt = [];
  const fake = async (url, opts) => {
    gefragt.push(url.split('?')[0]);
    assert.equal(opts.headers['X-API-Key'], 'jobboerse-jobsuche');
    if (url.includes('/v6/')) throw new Error('HTTP 403 bei rest.arbeitsagentur.de');
    return readFile(join(FX, 'ba-v6-deutschlehrer.json'), 'utf8');
  };
  const suche = macheBaSuche(fake, ba);
  const a = await suche(s);
  const b = await suche(s);
  assert.equal(a.api, ba.ausweich[0]);
  assert.equal(a.stellen.length, 3);
  assert.equal(b.stellen.length, 3);
  assert.deepEqual(gefragt.filter(u => u.includes('/v6/')).length, 1, 'v6 nach 403 nicht nochmal');
  const st = leseBa({ jobs: [{ referenznummer: 'R1', stellenangebotsTitel: 'Lehrkraft DaZ', arbeitsorte: [{ ort: 'Leipzig' }], homeofficemoeglich: true }] });
  assert.deepEqual([st[0].refnr, st[0].titel, st[0].ort, st[0].homeoffice], ['R1', 'Lehrkraft DaZ', 'Leipzig', true]);
  assert.match(baWebUrl(s), /^https:\/\/www\.arbeitsagentur\.de\/jobsuche\/suche\?angebotsart=1&was=Deutschlehrer&wo=D%C3%B6beln&umkreis=50$/);
  await assert.rejects(macheBaSuche(async () => { throw new Error('HTTP 403 bei x'); }, ba)(s), /HTTP 403/);
});

test('Unterricht: Jobbörse (Döbeln, Leipzig, online), Remotive (nur Lehr-Stellen in Europa), News (nicht „Deutschland“), Fundorte', async () => {
  const { eintraege, fehler } = await unterricht({ holeText, cfg, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  const t = funde(eintraege).map(e => e.titel);
  for (const ja of [/Dozent Deutsch als Zweitsprache/, /Nachhilfelehrer Deutsch/, /Deutschlehrer online/, /Freelance Online German Teacher/, /VHS Mittelsachsen sucht Lehrkräfte/, /Sprachpaten gesucht/]) assert.ok(t.some(x => ja.test(x)), `${ja} fehlt: ${t.join(' | ')}`);
  for (const nein of [/Bürokraft/, /Customer Support/, /German Tutor – Y/, /Wirtschaft wächst/, /Außendienst/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen`);
  const e = re => eintraege.find(x => re.test(x.titel));
  const doz = e(/Dozent Deutsch als Zweitsprache/);
  assert.equal(doz.extra.typ, 'integrationskurs');
  assert.equal(doz.extra.ort, 'Döbeln');
  assert.equal(doz.extra.km, 0);
  assert.equal(doz.link, 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1200000001-S');
  const online = e(/Deutschlehrer online/);
  assert.equal(online.extra.online, true);
  assert.equal(online.extra.ort, 'online');
  const vhs = e(/VHS Mittelsachsen/);
  assert.equal(vhs.extra.ort, 'Döbeln');
  assert.equal(vhs.frist, '2026-11-30');
  assert.equal(vhs.sofort, true, 'nah + Frist in 23 Tagen');
  assert.ok(eintraege.filter(x => x.extra.fundort).length >= 5);
  assert.ok(eintraege.every(x => x.kategorie === 'unterricht' && x.extra.bewerbenAls.name === 'Deutsch mit Xander'));
});

test('Fundorte: Link-Prüfung nur auf GitHub, höchstens einmal am Tag, tote Links nach 2 Fehlern markiert', async () => {
  assert.equal(fundortePruefen({}, {}), false);
  assert.equal(fundortePruefen({}, { GITHUB_ACTIONS: 'true' }), true);
  assert.equal(fundortePruefen({ fundortePruefen: false }, { GITHUB_ACTIONS: 'true' }), false);
  const liste = [{ titel: 'A', link: 'https://a.example/' }, { titel: 'B', link: 'https://b.example/', ort: 'Leipzig' }];
  const zustand = {};
  let n = 0;
  const hole = async url => { n++; if (url.includes('b.example')) throw new Error('HTTP 404 bei b.example'); return 'ok'; };
  const t1 = new Date('2026-11-07T08:00:00Z'), t2 = new Date('2026-11-08T08:00:00Z');
  const p1 = await pruefeFundorte(liste, { holeText: hole, zustand, name: 'x', jetzt: t1, an: true });
  assert.equal(n, 2);
  assert.match(p1.hinweise[0], /„B“: HTTP 404/);
  await pruefeFundorte(liste, { holeText: hole, zustand, name: 'x', jetzt: t1, an: true });
  assert.equal(n, 2, 'gleicher Tag: kein neuer Abruf');
  const p3 = await pruefeFundorte(liste, { holeText: hole, zustand, name: 'x', jetzt: t2, an: true });
  const e = fundortEintraege(liste, { kategorie: 'auftritte', jetzt: t2, pruefung: p3.pruefung });
  assert.equal(e[1].extra.linkOk, false);
  assert.match(e[1].zeile, /Link gerade nicht erreichbar/);
  assert.equal(e[0].extra.linkOk, undefined);
});

test('Alle frischen Quellen tot -> alte Funde bleiben, Fundorte frisch aus der config; ohne alten Stand: Fundorte', async () => {
  const { lauf } = await import('../main.mjs');
  const nur = name => ({ ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === name }])) });
  const tot = async () => { throw new Error('HTTP 503 bei news.google.com'); };
  const alt = { titel: 'Alter Bandcontest', link: 'https://news.google.com/rss/articles/alt?oc=5', kategorie: 'auftritte', wert: 60, datum: '2026-11-01T10:00:00.000Z', bis: '2026-12-01T22:59:59.000Z', sichtbarBis: '2026-12-01T22:59:59.000Z', extra: { ort: 'Leipzig', km: 57 } };
  // gestrichene Adresse aus dem alten Stand darf nicht ewig stehen bleiben
  const altFundort = { titel: 'Gestrichene Adresse', link: 'https://example.org/weg', kategorie: 'auftritte', wert: 45, datum: null, extra: { fundort: true, ort: 'Leipzig', km: 57 } };
  const r = await lauf({ cfg: nur('auftritte'), wunschliste: {}, vorher: { kategorien: { auftritte: [alt, altFundort] } }, zustand: {}, holeText: tot, jetzt: JETZT, alle: true });
  const titel = r.aktuell.kategorien.auftritte.map(e => e.titel);
  assert.ok(titel.includes('Alter Bandcontest'), titel.join(' | '));
  assert.ok(!titel.includes('Gestrichene Adresse'), 'alter Fundort bleibt stehen');
  const fundorte = r.aktuell.kategorien.auftritte.filter(e => e.extra?.fundort);
  assert.equal(fundorte.length, cfg.module.auftritte.fundorte.length, 'Fundorte frisch aus der config');
  assert.equal(r.aktuell.status.auftritte.ok, false);
  const r2 = await lauf({ cfg: nur('auftritte'), wunschliste: {}, vorher: null, zustand: {}, holeText: tot, jetzt: JETZT, alle: true });
  assert.ok(r2.aktuell.kategorien.auftritte.length >= 6 && r2.aktuell.kategorien.auftritte.every(e => e.extra.fundort));
});
