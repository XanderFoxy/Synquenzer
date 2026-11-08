// Echter Lauf vom 08.11.2026 01:49 UTC (Roh-Lauf 42435892574) – fixtures/echt-0811/: je Abruf URL, Status und Antwort wie
// aufgenommen (index.json; gekürzt nur WordPress-Feeds, Beatportal-Liste und Remotive-Beschreibungen, siehe index.json).
// Befunde aus diesem Lauf, jeder mit genau diesen Antworten nachgestellt:
//  1. Jobbörse v6 antwortet 200 mit Treffern, „unterricht“ zeigte nur die 5 Fundorte: leseBa kannte die v6-Felder nicht
//     (ergebnisliste, referenznummer, stellenangebotsTitel, firma, stellenlokationen[].adresse, breite/laenge).
//  2. Auftritte: 3 von 4 Funden (45–60 Tage alt) fielen nach dem Einsammeln über das 30-Tage-Fenster still raus;
//     Nachberichte („16 Bands … starten“, „Band-Contest: Rivers Collide beim METAL HAMMER PARADISE!“) zählten als Aufruf;
//     gigmit-Stadtseiten 404.
//  3. Remix: „Remix Cerrone’s “Love In C Minor” …“ (ohne das Wort Contest) fehlte, Beatportal-Liste ungenutzt,
//     derselbe Riot-Contest doppelt, EDM Identity 403.
//  4. Filme: „Apple TV 4K (2026)“ (Gerät) stand unter Filmen, alle echten 3,99-€-Filme fehlten (Händler „Apple TV Plus“).
//  5. Urlaubsguru 401 zählte als Fehler.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheAufnahmeAbruf } from '../lib/http.mjs';
import { leseBa } from '../lib/ba.mjs';
import { leseRss } from '../lib/rss.mjs';
import { enthaelt } from '../lib/text.mjs';
import unterricht, { ohneGender } from '../module/unterricht.mjs';
import nebenverdienst from '../module/nebenverdienst.mjs';
import auftritte, { bewerteAuftritt, terminVorbei } from '../module/auftritte.mjs';
import remix, { leseBeatportalListe, datiereListe, istRemixContest, kernWoerter, gleicherContest } from '../module/remix.mjs';
import { istAppleFilmDeal, preisJeFilm, preisWert } from '../module/filme.mjs';
import { sammleFeeds, GESPERRT_NEU_TAGE } from '../module/gemeinsam.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures', 'echt-0811');
const lies = n => readFile(join(FX, n), 'utf8');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const index = JSON.parse(await lies('index.json'));
const JETZT = new Date(index.erstellt); // 2026-11-08T01:49:28Z
const aufnahme = () => macheAufnahmeAbruf(FX, index);
const funde = l => l.filter(e => !e.extra?.fundort);
const nur = (...namen) => ({ ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: namen.includes(k) }])) });

// ---------------------------------------------------------------- 1. Unterricht / Jobbörse v6

test('Jobbörse v6 (echte Antwort „Deutschlehrer“, Döbeln 50 km): Felder gelesen – Titel, Firma, Ort, Koordinaten, km, Datum', async () => {
  const st = leseBa(await lies('ba-v6-deutschlehrer-doebeln.json'));
  assert.equal(st.length, 2, 'maxErgebnisse 2');
  const m = st.find(x => x.refnr === '10001-1003619793-S');
  assert.equal(m.titel, 'Deutschlehrer (m/w/d) an einem Montessori-Gymnasium');
  assert.equal(m.arbeitgeber, 'Montessori-Verein Chemnitz e.V.');
  assert.equal(m.ort, 'Chemnitz', '„Chemnitz, Sachsen“ ohne Land');
  assert.equal(m.plz, '09130');
  assert.deepEqual([m.lat, m.lon], [50.833773, 12.959226]);
  assert.equal(m.km, 35, 'entfernung der Umkreissuche');
  assert.equal(m.datum, '2026-10-30', 'jüngstes von Veröffentlichung (28.08.) und Änderung (30.10.)');
  assert.equal(m.seit, '2026-08-28');
  // v6 filtert „veroeffentlichtseit“ nicht: auch Anzeigen von 2023 kommen zurück (Facette alle = 25)
  const daf = leseBa(await lies('ba-v6-daf.json'));
  assert.equal(daf.length, 25);
  assert.ok(daf.some(x => x.seit === '2023-10-18'));
  assert.equal(daf.find(x => x.refnr === '11858-SDE-126477-STA-S').externeUrl, 'https://www.stellenanzeigen.de/job/detail/SDE-126477/?utm_source=bundesagentur&utm_medium=unpaid-partner&utm_campaign=000', 'externeURL (v6-Schreibweise)');
  assert.equal(ohneGender('Lehrkraft (m/w/d) Deutsch Sekundarstufe I und II'), 'Lehrkraft Deutsch Sekundarstufe I und II');
  assert.equal(ohneGender('Sprachlehrkräfte für Deutsch als Zweitsprache (m/w/div)'), 'Sprachlehrkräfte für Deutsch als Zweitsprache');
});

test('Unterricht (echter Lauf): 7 echte Stellen um Döbeln VOR den Fundorten – Titel, Arbeitgeber, Ort, km, Link zur Stelle, Datum', async () => {
  const { eintraege, fehler } = await unterricht({ holeText: aufnahme(), cfg, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  const f = funde(eintraege);
  assert.equal(f.length, 7, f.map(e => e.titel).join(' | '));
  assert.ok(f.every(e => e.quelle === 'Jobbörse der Arbeitsagentur'), 'Remotive: 12 fremde Stellen (Customer Service, Developer …) – keine davon');
  for (const e of f) {
    assert.match(e.link, /^https:\/\/www\.arbeitsagentur\.de\/jobsuche\/jobdetail\/\d{5}-[\w.-]+-S$/);
    assert.ok(e.extra.arbeitgeber && e.extra.ort && e.extra.km != null && e.datum, e.titel);
    assert.ok(e.extra.km <= 80, `${e.titel}: ${e.extra.km} km`);
    assert.doesNotMatch(e.titel, /\(m\/w\/d\)/);
  }
  const miqr = f.find(e => e.extra.refnr === '10001-1003587012-S');
  assert.equal(miqr.titel, 'Dozent DaF/DaZ, Lehrkraft allg. Integrationskurse');
  assert.equal(miqr.extra.arbeitgeber, 'MIQR GmbH');
  assert.equal(miqr.extra.ort, 'Döbeln');
  assert.ok(miqr.extra.km <= 3);
  assert.equal(miqr.extra.typ, 'integrationskurs');
  assert.equal(miqr.datum, '2026-11-04T00:00:00.000Z');
  assert.match(miqr.zeile, /^Integrations-\/Sprachkurs · MIQR GmbH · Döbeln · \d km · online seit 24\.08\.2026$/);
  assert.equal(miqr.link, 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10001-1003587012-S');
  const titel = f.map(e => e.titel).join(' | ');
  for (const ja of [/Montessori-Gymnasium/, /Deutsch Sekundarstufe/, /BAMF-Zulassung/, /Saalfeld und Pößneck/, /Alphabetisierungskurse/, /Integrationskursen/]) assert.match(titel, ja);
  for (const nein of [/Verkäufer/, /Maschinenbediener/, /Servicetechniker/, /Willkommensmanager/, /Job-Coach/, /Chemieingenieur/, /Installateur/]) assert.doesNotMatch(titel, nein);
  // echte Stellen vor jedem Fundort
  const minStelle = Math.min(...f.map(e => e.extra.sortWert));
  const maxFund = Math.max(...eintraege.filter(e => e.extra.fundort).map(e => e.extra.sortWert));
  assert.ok(minStelle > maxFund, `${minStelle} > ${maxFund}`);
  // Anzeigefenster ab dem Lauf (die Jobbörse zeigt nur offene Stellen), nicht ab der Veröffentlichung
  const gera = f.find(e => /Saalfeld/.test(e.titel));
  assert.equal(gera.datum, '2026-10-14T00:00:00.000Z');
  assert.ok(Date.parse(gera.sichtbarBis) > JETZT.getTime());
});

test('Unterricht im ganzen Lauf: nach dem Aufräumen stehen die Stellen oben, dann die Fundorte', async () => {
  const { lauf } = await import('../main.mjs');
  const r = await lauf({ cfg: nur('unterricht'), wunschliste: {}, vorher: null, zustand: {}, holeText: aufnahme(), jetzt: JETZT, alle: true });
  const l = r.aktuell.kategorien.unterricht;
  assert.equal(r.aktuell.status.unterricht.ok, true);
  assert.equal(l.length, 12);
  assert.ok(l.slice(0, 7).every(e => !e.extra.fundort) && l.slice(7).every(e => e.extra.fundort), l.map(e => e.titel).join(' | '));
});

test('Nebenverdienst (echte v6-Antworten): keine Vollzeitstelle, kein Schwedisch-Übersetzer, „Textil“ ist kein Text', async () => {
  const st = leseBa(await lies('ba-v6-uebersetzer-englisch.json'));
  assert.equal(st[0].titel, 'Übersetzer für Content - Schwedisch (m/w/d)');
  assert.equal(st[0].nurVollzeit, true);
  assert.equal(st[0].homeoffice, true);
  const { eintraege, fehler } = await nebenverdienst({ holeText: aufnahme(), cfg, jetzt: JETZT });
  assert.deepEqual(fehler, []);
  assert.deepEqual(eintraege.map(e => e.titel), [], 'nichts davon passt zu Xander');
});

// ---------------------------------------------------------------- 2. Auftritte

test('Auftritte (echter Lauf): echte Aufrufe – Bernburg (Mitteldeutschland) zuerst, Nachberichte und Vergangenes raus', async () => {
  const { eintraege, fehler } = await auftritte({ holeText: aufnahme(), cfg, jetzt: JETZT });
  assert.deepEqual(fehler, [], 'keine gigmit-Stadtseiten mehr (404)');
  const f = funde(eintraege).sort((a, b) => b.extra.sortWert - a.extra.sortWert);
  assert.deepEqual(f.map(e => e.titel.replace(/ - [^-]+$/, '').slice(0, 40)), ['Musiker gesucht - wer möchte bei Band-We', 'Kottgeisering wird 1200: Langer Countdow']);
  const bb = f[0];
  assert.equal(bb.extra.ort, 'Bernburg');
  assert.ok(bb.extra.km > 100 && bb.extra.km < 140, String(bb.extra.km));
  assert.equal(bb.extra.typ, 'bandcontest');
  assert.equal(bb.extra.bewerbenAls.name, 'One Day in Rome');
  assert.equal(bb.datum, '2026-09-24T07:00:00.000Z');
  assert.ok(Date.parse(bb.sichtbarBis) > JETZT.getTime(), '45 Tage alt, Fenster 60 Tage (wie gesucht)');
  const t = f.map(e => e.titel).join(' | ');
  for (const nein of [/Running for the Best/, /METAL HAMMER/, /Gartenträumelounge/, /Open Mic Night im Oktober/, /Comedy/, /Fastnachtssong/, /Landespopfestival/]) assert.doesNotMatch(t, nein);
  const gig = eintraege.filter(e => e.quelle === 'gigmit');
  assert.equal(gig.length, 1);
  assert.equal(gig[0].link, 'https://www.gigmit.com/de');
  assert.match(gig[0].zeile, /Link prüfen$/);
  assert.equal(gig[0].extra.linkPruefen, true);
  assert.ok(!eintraege.some(e => /gigmit\.com\/en\/gigs/.test(e.link)), 'keine toten Stadt-Links');
});

test('Remix im ganzen Lauf: alle 5 Audius-Contests – auch der vom 17.09. mit Einsendeschluss 01.12. (Ende vor Alter)', async () => {
  const { lauf } = await import('../main.mjs');
  const r = await lauf({ cfg: nur('remix'), wunschliste: {}, vorher: null, zustand: {}, holeText: aufnahme(), jetzt: JETZT, alle: true });
  const l = r.aktuell.kategorien.remix;
  assert.equal(r.aktuell.status.remix.ok, true);
  assert.equal(l.filter(e => e.quelle === 'Audius').length, 5);
  const alt = l.find(e => /The song\/pop contest/.test(e.titel));
  assert.equal(alt.frist, '2026-12-01');
  assert.ok(l.some(e => /Cerrone/.test(e.titel)) && l.some(e => /Phantogram/.test(e.titel)));
});

test('Auftritte im ganzen Lauf: Bernburg übersteht das Aufräumen (vorher: 30-Tage-Fenster)', async () => {
  const { lauf } = await import('../main.mjs');
  const r = await lauf({ cfg: nur('auftritte'), wunschliste: {}, vorher: null, zustand: {}, holeText: aufnahme(), jetzt: JETZT, alle: true });
  assert.equal(r.aktuell.status.auftritte.ok, true);
  assert.equal(funde(r.aktuell.kategorien.auftritte).length, 2);
});

test('Auftritte: Regeln an echten Titeln', () => {
  const m = cfg.module.auftritte;
  const it = (titel, datum = '2026-11-01T10:00:00Z') => ({ titel, beschreibung: titel, datum });
  assert.equal(bewerteAuftritt(it('16 Bands beim Bandwettbewerb „Running for the Best" starten mit Gratis-Fortbildung - Merkur'), m, JETZT).grund, 'kein Aufruf');
  assert.equal(bewerteAuftritt(it('Band-Contest: Rivers Collide beim METAL HAMMER PARADISE! - Metal Hammer'), m, JETZT).grund, 'kein Aufruf');
  assert.equal(bewerteAuftritt(it('Gartenträumelounge: Open Stage vor Saisonabschluss - „Re:Turn“, DJ Jeff und „Freaks on Fire“ gestalten das Finale - Sächsische'), m, JETZT).ok, undefined);
  assert.equal(bewerteAuftritt(it('JamboJam Comedy Stand-Up Comedy OpenMic im Jamboree in Leipzig am 12.11.2026 - Sachsen-Net'), m, JETZT).ok, undefined);
  assert.equal(bewerteAuftritt(it('Kottgeisering wird 1200: Langer Countdown gestartet – Feuerwehr sucht unbekannte Bands - Merkur'), m, JETZT).ok, true);
  assert.equal(terminVorbei('Steinhaus Bautzen: Open Mic Night im Oktober 2026', JETZT), true);
  assert.equal(terminVorbei('Open Mic im November 2026', JETZT), false);
  assert.equal(terminVorbei('Horror Nights am 29.10.2026 in Leipzig', JETZT), true);
  assert.equal(terminVorbei('Bands gesucht für den 12.12.2026', JETZT), false);
  assert.equal(bewerteAuftritt(it('Bands gesucht: Open Stage am 29.10.2026 in Leipzig'), m, JETZT).grund, 'Termin vorbei');
});

test('Auftritte: „sucht/suchen“ nur als ganzes Wort – „gut besucht“, „besuchen“ sind Nachberichte, kein Aufruf', async () => {
  const m = cfg.module.auftritte;
  const it = titel => ({ titel, beschreibung: titel, datum: '2026-11-01T10:00:00Z' });
  // Vorher („sucht|suchen“ als Teilwort): alle vier standen unter „Frische Ausschreibungen“ mit „Bewerben“
  for (const t of [
    'Stadtfest Döbeln gut besucht: Bands und DJs sorgen für Stimmung - Sächsische.de',
    'Tausende besuchen Rock-Open-Air mit fünf Bands in Riesa - LVZ',
    'Kulturnacht: Rund 3000 Gäste besuchten Bands und Künstler in der Innenstadt - DNN',
    'Volles Haus: Viele Fans besuchen Konzert von drei Nachwuchsbands - Freie Presse',
    'Band versucht Comeback beim Stadtfest Döbeln - Sächsische',
  ]) assert.equal(bewerteAuftritt(it(t), m, JETZT).grund, 'kein Aufruf', t);
  assert.equal(bewerteAuftritt(it('Bandcontest Leipzig: Bands gesucht – Anmeldung bis 15.12.2026 - LVZ'), m, JETZT).ok, true);
  assert.equal(bewerteAuftritt(it('Döbeln: Stadtfest-Team sucht Bands für 2027 - Sächsische'), m, JETZT).ok, true);
  assert.equal(bewerteAuftritt(it('Wir suchen Bands und Solokünstler für die Kulturnacht - DNN'), m, JETZT).ok, true);
  // echte Antwort „Bands gesucht“ (Nr. 69): Kottgeisering („Feuerwehr sucht unbekannte Bands“) bleibt drin
  const kott = leseRss(await lies('news-bands-gesucht.xml')).find(x => /Kottgeisering/.test(x.titel));
  assert.equal(bewerteAuftritt(kott, m, JETZT).ok, true);
  // echte Antworten mit „besuchen“, „versuchen“, „Alkoholsucht“ (mydealz Nr. 8 Freizeitpark, Nr. 46 Apple TV):
  // das Aufrufwort trifft nur noch das ganze Wort „sucht“ (Toys-for-fun, Mohnblumenberg)
  const such = m.aufrufWoerter.filter(w => /(^|\|)=?such/.test(w));
  assert.deepEqual(such, ['=sucht|=suchen']);
  const treffer = async datei => leseRss(await lies(datei)).filter(x => enthaelt(`${x.titel} ${x.beschreibung || ''}`, such)).map(x => x.titel.slice(0, 24));
  const fp = leseRss(await lies('mydealz-freizeitpark.xml'));
  assert.equal(fp.filter(x => /\bbesuchen\b/i.test(`${x.titel} ${x.beschreibung}`)).length, 3, 'Serengeti-Park, Taunus Wunderland, Disneyland');
  assert.deepEqual(await treffer('mydealz-freizeitpark.xml'), ['Toys-for-fun KOSMOS EXIT']);
  assert.deepEqual(await treffer('mydealz-apple-tv.xml'), ['Der Mohnblumenberg ~ 3,9']);
  // Unterricht hatte dasselbe Teilwort („Sprachcafé gut besucht“ zählte als Gesuch)
  const u = cfg.module.unterricht;
  assert.equal(enthaelt('Sprachcafé Döbeln gut besucht – Deutschkurs für Geflüchtete', u.gesuchtWoerter), false);
  assert.equal(enthaelt('Volkshochschule sucht Lehrkräfte für Deutschkurse', u.gesuchtWoerter), true);
});

// ---------------------------------------------------------------- 3. Remix

test('Remix (echter Lauf): Audius + Cerrone (Beatportal, ohne „Contest“ im Titel) + Phantogram (Beatportal-Liste), Riot nur einmal', async () => {
  const { eintraege, fehler } = await remix({ holeText: aufnahme(), cfg, jetzt: JETZT });
  assert.deepEqual(fehler, [], 'EDM Identity (403) ist raus');
  const f = funde(eintraege);
  const t = f.map(e => e.titel);
  assert.equal(f.filter(e => e.quelle === 'Audius').length, 5);
  const cerrone = f.find(e => /Cerrone/.test(e.titel));
  assert.ok(cerrone, t.join(' | '));
  assert.equal(cerrone.extra.passt, true, 'Cerrone = Euro-Disco');
  const ph = f.find(e => /Phantogram Launch “Funeral Pyre” Remix Contest/.test(e.titel));
  assert.ok(ph, t.join(' | '));
  assert.equal(ph.link, 'https://www.beatportal.com/articles/1707024-phantogram-launch-funeral-pyre-remix-contest-with-1-000-prize');
  assert.equal(ph.datum, cerrone.datum, 'höchstens so alt wie Cerrone (steht darüber)');
  assert.match(ph.zeile, /neu auf Beatportal/);
  assert.equal(f.filter(e => /True Damage/.test(e.titel)).length, 1, 'gleicher Contest aus zwei Artikeln');
  assert.ok(f.some(e => /SoundBridge/.test(e.titel)));
  for (const nein of [/Pete Soul/, /Zorza/, /Hometown Remix/, /Olivia Rodrigo/, /HOFA/, /Larry Ohh/, /Abbey Road/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen (Gewinner, alt oder kein Contest)`);
  // Stil vorne: alle „passt“-Contests vor den offenen
  const sw = e => e.extra.sortWert;
  assert.ok(Math.min(...f.filter(e => e.extra.passt).map(sw)) > Math.max(...f.filter(e => !e.extra.passt).map(sw)));
  assert.ok(!cfg.module.remix.wordpress.some(w => /edmidentity/.test(w.basis)));
});

test('Remix: Beatportal-Liste nur mit datiertem Anker, Reihenfolge belegt; Aufruf-Muster und Doppelte', async () => {
  const karten = leseBeatportalListe(await lies('beatportal-remix-contests-gekuerzt.html'));
  assert.deepEqual(karten.slice(0, 3).map(k => k.id), [1707024, 1699075, 1678336]);
  const anker = [{ titel: 'Remix Cerrone’s “Love In C Minor” for Its 50th Anniversary - Beatportal', datum: 'Wed, 28 Oct 2026 16:00:00 GMT' }];
  assert.deepEqual(datiereListe(karten, anker).map(x => x.titel), ['Phantogram Launch “Funeral Pyre” Remix Contest With $1,000 Prize']);
  assert.deepEqual(datiereListe(karten, []), [], 'ohne Anker: nichts raten');
  assert.deepEqual(datiereListe([karten[1], karten[0]], anker), [], 'IDs nicht fallend -> Reihenfolge nicht belegt');
  const r = cfg.module.remix;
  assert.equal(istRemixContest('Remix Cerrone’s “Love In C Minor” for Its 50th Anniversary', r), true);
  assert.equal(istRemixContest('Remix “Time Machine” to win tickets to the GRAMMY Awards', r), true);
  assert.equal(istRemixContest('Remix Launches Desktop Game-Making App and Scavenger Hunt With 1 Bitcoin Prize', r), false);
  assert.equal(istRemixContest('Washington Capitals unveil special ‘Hometown Remix’ jersey', r), false);
  assert.equal(gleicherContest(kernWoerter('Riot Games and SoundCloud launch remix contest for True Damage’s Worlds anthem - Inven Global'), kernWoerter('SoundCloud, Riot Games Launch Remix Contest With True Damage - Hits Daily Double')), true);
  assert.equal(gleicherContest(kernWoerter('Remix-Contest: Amnesia von ALICIAMUSIC'), kernWoerter('Remix-Contest: mellow. Remixes! von PIXO')), false);
});

test('Remix: Magazin-Suchfeeds antworten 200, aber der jüngste Contest-Artikel ist 165 Tage alt -> zu Recht nichts', async () => {
  for (const n of ['wp-rekkerd-gekuerzt.xml', 'wp-attackmagazine-gekuerzt.xml', 'wp-dancingastronaut-gekuerzt.xml']) {
    const neuester = Math.max(...leseRss(await lies(n)).map(it => Date.parse(it.datum)));
    assert.ok((JETZT - neuester) / 864e5 > 160, n);
  }
});

// ---------------------------------------------------------------- 4. Filme

test('Filme (echte mydealz-Gruppe apple-tv): Geräte raus, echte Kauf-Filme rein (Händler „Apple TV Plus“), höchstens 4,99 € je Film', async () => {
  const items = leseRss(await lies('mydealz-apple-tv.xml'));
  const ja = t => items.filter(it => it.titel.startsWith(t)).map(istAppleFilmDeal);
  for (const geraet of ['Apple TV 4K (2026)', 'Apple TV 4K (4. Generation) 2026 Version AMAZON', 'Apple TV 4K 32GB HDR 1. Generation']) assert.deepEqual(ja(geraet), [false], geraet);
  for (const film of ['Flash Gordon ~ 3,99€', 'Bill & Teds verrückte Reise', 'Kingsglaive: Final Fantasy XV', 'Timecop ~ 3,99€', 'Leaving Las Vegas (1995)', 'Cable Guy - Die Nervensäge (1996)', 'Der Mann, der vom Himmel fiel']) assert.deepEqual(ja(film), [true], film);
  const apple = items.find(it => it.titel === 'Apple TV 4K (2026)');
  assert.equal(apple.shop, 'voelkner');
  assert.match(apple.beschreibung, /Lieblingsserien und Filme/, 'darum kam das Gerät vorher als „Film“ durch');
  const rambo = items.find(it => /^Rambo Collection/.test(it.titel));
  assert.equal(Math.round(preisJeFilm(rambo.titel, preisWert(rambo.preisText)) * 100) / 100, 2.68);
  assert.equal(preisJeFilm('Flash Gordon ~ 3,99€', 3.99), 3.99);
  assert.equal(istAppleFilmDeal({ titel: 'Apple TV+ 3 Monate gratis', shop: 'Apple', beschreibung: 'Serien und Filme' }), false, 'Abo bleibt draußen');
});

// ---------------------------------------------------------------- 5. Urlaubsguru 401

test('Urlaubsguru 401: kein Fehler, Status „gesperrt“; danach eine Woche nicht mehr gefragt', async () => {
  const { lauf } = await import('../main.mjs');
  const gefragt = [];
  const hole = aufnahme();
  const zaehlend = async (url, o) => { gefragt.push(url); return hole(url, o); };
  const zustand = {};
  const r = await lauf({ cfg: nur('reisen'), wunschliste: {}, vorher: null, zustand, holeText: zaehlend, jetzt: JETZT, alle: true });
  assert.equal(r.aktuell.status.reisen.ok, true, JSON.stringify(r.aktuell.status.reisen));
  assert.deepEqual(r.aktuell.status.reisen.fehler, []);
  assert.deepEqual(r.aktuell.status.reisen.gesperrt, ['Urlaubsguru: gesperrt seit 08.11.2026 (HTTP 401)']);
  assert.equal(gefragt.filter(u => /urlaubsguru/.test(u)).length, 1);
  const zwei = new Date(JETZT.getTime() + 2 * 864e5);
  const r2 = await lauf({ cfg: nur('reisen'), wunschliste: {}, vorher: r.aktuell, zustand, holeText: zaehlend, jetzt: zwei, alle: true });
  assert.equal(gefragt.filter(u => /urlaubsguru/.test(u)).length, 1, 'gesperrt: nicht jeden Lauf neu fragen');
  assert.deepEqual(r2.aktuell.status.reisen.gesperrt, ['Urlaubsguru: gesperrt seit 08.11.2026 (HTTP 401)']);
  // nach einer Woche einmal neu versuchen; antwortet die Quelle wieder, ist die Sperre weg
  const spaeter = new Date(JETZT.getTime() + (GESPERRT_NEU_TAGE + 1) * 864e5);
  const geht = await sammleFeeds(async () => '<rss><channel></channel></rss>', [{ name: 'Urlaubsguru', url: 'https://www.urlaubsguru.de/feed/' }], { jetzt: spaeter, zustand });
  assert.deepEqual([geht.fehler, geht.gesperrt], [[], []]);
  assert.deepEqual(zustand.gesperrt, {});
  // andere Fehler bleiben Fehler
  const kaputt = await sammleFeeds(async () => { throw new Error('HTTP 503 bei x'); }, [{ name: 'X', url: 'https://x.example/feed' }], { jetzt: JETZT, zustand: {} });
  assert.deepEqual(kaputt.fehler, ['X: HTTP 503 bei x']);
});
