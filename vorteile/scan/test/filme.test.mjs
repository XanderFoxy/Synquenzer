// Modul „filme“ (Apple TV / iTunes): Zuordnung, Preise, Horror, Tiefstpreis über mehrere Läufe, Pushes, Grenzen, Datei-Vertrag.
// Ohne Netz: alle Antworten aus test/fixtures (echtes Format der iTunes-Search-/Lookup-API, Legacy-Charts, mydealz-RSS).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { leseRss } from '../lib/rss.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { lauf, main } from '../main.mjs';
import filme, {
  namensWert, waehleTreffer, ausItunes, leseErgebnisse, leseCharts, staffelnAus, staffelInfo,
  merkeFilmPreis, preisLage, preisWert, istAppleFilmDeal, postenListe, sucheUrl,
  chartIndex, chartFilm, serienBegriffe, wikidataAbfrage, wikidataTeile, leseWikidata, wikidataKandidaten, englisch,
  suchName, jahrImTitel, qualiAbfrage, leseQuali, qualiWahl, qualiOk, genreGruppe, STANDARD as FILM_STANDARD, horrorText,
  horrorVerdacht, doppelTipp, filmPushTitel, kinderfilm, kinderGrund, kinderReihe, KINDER_GENRES, wikidataUrl,
  boxVon, komplettInfo, ueblichPreis, bewerte, externTiefst, serienChartUrl, lookupUrl, fremdStore, monatJahr,
} from '../module/filme.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
// Most Wanted und Reihen (28.11.2026) prüft filme-most.test.mjs – die Zahlen hier (Suchen, Abrufe, Reihenfolge) gelten für die
// Listen davor (Wunschliste, Serien, 80er, Disney), darum ohne die beiden neuen Abschnitte
const listen = (({ mostWanted, reihen, ...rest }) => rest)(JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8')));
const fix = async n => readFile(join(FIX, n), 'utf8');
const ergebnisse = async n => leseErgebnisse(await fix(n));
const JETZT = new Date('2026-11-07T12:00:00Z');
const tagPlus = n => new Date(JETZT.getTime() + n * 864e5);
const tagMinusTest = (tag, n) => new Date(Date.parse(`${tag}T12:00:00Z`) - n * 864e5).toISOString().slice(0, 10);

/** Fixture-Abruf mit Zähler; vorne = Zusatz-Karte (gewinnt vor FIXTURE_KARTE). */
function abruf(vorne = []) {
  const h = macheFixtureAbruf(FIX, [...vorne, ...FIXTURE_KARTE]);
  const z = { urls: [] };
  z.holeText = async url => { z.urls.push(url); return h(url); };
  z.apple = () => z.urls.filter(u => u.includes('itunes.apple.com')).length;
  z.suchen = () => z.urls.filter(u => u.includes('itunes.apple.com/search?')).length;
  return z;
}
const AKTION = [['itunes.apple.com/lookup?', 'itunes-lookup-aktion.json']];
const ctx = (holeText, zustand = {}, jetzt = JETZT, extra = {}) => ({ holeText, cfg, wunschliste: {}, zustand, jetzt, filmListen: listen, ...extra });
const alleTitel = d => Object.values(d.gruppen).flat();

test('Zuordnung: Shadow 1994 statt anderer Shadow-Filme, Go Trabi Go ≠ Teil 2, Manta Manta 1991 ≠ Zwoter Teil 2023, Mallrats', async () => {
  const shadow = await ergebnisse('itunes-search-shadow.json');
  assert.equal(waehleTreffer(shadow, listen.wunschliste[1])?.id, 'itunes:1440794321');
  // ohne den Film von 1994 in den Ergebnissen: kein Zufallstreffer (Shadow 2018, Shadow Man, Shadow in the Cloud)
  assert.equal(waehleTreffer(shadow.filter(r => r.trackId !== 1440794321), { titel: 'The Shadow', jahr: 1994 }), null);
  assert.equal(waehleTreffer(shadow.filter(r => r.trackId !== 1440794321), listen.wunschliste[1]), null);
  assert.equal(waehleTreffer(await ergebnisse('itunes-search-gotrabigo.json'), { titel: 'Go Trabi Go', jahr: 1991 }), null);
  assert.equal(waehleTreffer(await ergebnisse('itunes-search-manta.json'), { titel: 'Manta Manta', jahr: 1991 })?.id, 'itunes:1191234567');
  assert.equal(waehleTreffer(await ergebnisse('itunes-search-mallrats.json'), { titel: 'Mallrats', jahr: 1995 })?.id, 'itunes:286617745');
  // Fortsetzung, Doku und Neuverfilmung sind andere Filme
  const z = await ergebnisse('itunes-search-zukunft.json');
  assert.equal(waehleTreffer(z, { titel: 'Zurück in die Zukunft', jahr: 1985 })?.id, 'itunes:1000000101');
  assert.equal(waehleTreffer(z, { titel: 'Zurück in die Zukunft II', jahr: 1989 })?.id, 'itunes:1000000102');
  const k = await ergebnisse('itunes-search-koenig.json');
  assert.equal(waehleTreffer(k, { titel: 'Der König der Löwen', jahr: 1994 })?.id, 'itunes:1000000201');
  const g = await ergebnisse('itunes-search-ghostbusters.json');
  assert.equal(waehleTreffer(g, { titel: 'Ghostbusters – Die Geisterjäger', jahr: 1984 })?.id, 'itunes:1000000111');
  assert.equal(namensWert('Go Trabi Go 2 - Das war der wilde Osten', 'Go Trabi Go'), 0);
  assert.equal(namensWert('Manta Manta – Zwoter Teil', 'Manta Manta'), 0);
  assert.equal(namensWert('Manta Manta (1991)', 'Manta Manta'), 85);
  assert.equal(namensWert('Die Schöne und das Biest', 'Die Schoene und das Biest'), 100);
  assert.equal(namensWert('Blade Runner 2049', 'Blade Runner'), 0);
});

test('Staffeln: nur genau die Serie (kein „The Anime“), Staffel-Nummer, Ableger getrennt', async () => {
  const st = staffelnAus(await ergebnisse('itunes-search-rickandmorty.json'), { titel: 'Rick and Morty' });
  assert.equal(st.length, 8);
  assert.ok(!st.some(s => /Anime/.test(s.titel)));
  assert.deepEqual(staffelInfo('Star Trek: The Next Generation, Season 2 (Remastered)'), { serie: 'Star Trek: The Next Generation', nr: 2, zusatz: '(Remastered)' });
  const tng = staffelnAus(await ergebnisse('itunes-search-startrek-tng.json'), listen.serien.find(s => /nächste/.test(s.titel)));
  assert.deepEqual(tng.map(s => s.nr), [1, 2, 3], 'DS9 gehört nicht zu TNG');
});

test('Preisfelder: fehlen, 0, -1, Text; HD vor SD; Einzelobjekt statt Liste', async () => {
  assert.equal(preisWert(-1), null); assert.equal(preisWert(0), null); assert.equal(preisWert(undefined), null);
  assert.equal(preisWert('3.99000'), 3.99); assert.equal(preisWert('3,99 €'), 3.99);
  const d = ausItunes({ wrapperType: 'track', kind: 'feature-movie', trackId: 1, trackName: 'X', trackPrice: -1, trackHdPrice: 0, trackRentalPrice: 2.99, releaseDate: '1991-01-01T00:00:00Z' });
  assert.deepEqual([d.preisSd, d.preisHd, d.leihe, d.jahr], [null, null, 2.99, 1991]);
  const manta = ausItunes((await ergebnisse('itunes-search-manta.json'))[1]);
  assert.deepEqual([manta.preisSd, manta.preisHd], [null, 4.99]);
  assert.match(manta.bild, /\/200x200bb\.jpg$/);
  assert.doesNotMatch(manta.link, /uo=/);
  assert.deepEqual(leseErgebnisse('{"resultCount":1,"results":{"wrapperType":"track","kind":"feature-movie","trackId":5,"trackName":"Y"}}').length, 1);
  assert.deepEqual(leseErgebnisse('{"resultCount":0}'), []);
  assert.throws(() => leseErgebnisse('<html>'));
  // Charts: Einzelobjekt, leer, Einträge ohne id
  assert.equal(leseCharts(await fix('itunes-rss-thriller.json')).length, 1);
  assert.deepEqual(leseCharts(await fix('itunes-rss-leer.json')), []);
  const kom = leseCharts(await fix('itunes-rss-komoedie.json'));
  assert.ok(kom.length >= 4 && kom.every(e => e.id && e.titel));
  assert.equal(kom.find(e => /Kevin/.test(e.titel)).preis, 3.99);
  assert.throws(() => leseCharts('{"kein":"feed"}'));
});

test('Horror raus (Genre-ID 4408 und Genrename), mydealz nur Apple-Film-Aktionen', async () => {
  const z = abruf();
  const r = await filme(ctx(z.holeText));
  const t = alleTitel(r.datei);
  assert.ok(!t.some(x => /Exorzist|Halloween|Shadow in the Cloud|Horror/i.test(`${x.titel} ${x.genre}`)), 'kein Horror');
  const deals = leseRss(await fix('mydealz-itunes.xml')).filter(istAppleFilmDeal).map(x => x.titel);
  assert.equal(deals.length, 3);
  assert.ok(!deals.some(x => /Apple TV 4K|TV\+|Horror|Prime Video|Geschenkkarte/.test(x)), deals.join(' | '));
});

test('filme.json entspricht dem Vertrag (Gruppen, Felder, Typen, Sortierung)', async () => {
  const z = abruf();
  const r = await filme(ctx(z.holeText));
  const d = r.datei;
  assert.equal(d.version, 1);
  assert.ok(Number.isFinite(Date.parse(d.aktualisiert)));
  // „boxen“ seit 15.11.2026 hinten (ältere Seiten lassen sie weg)
  assert.deepEqual(Object.keys(d.gruppen), ['wunsch', 'fuer399', 'action', 'comedy', 'achtziger', 'disney', 'serien', 'angebot', 'neu', 'boxen']);
  assert.match(d.hinweis, /Tiefstpreis/);
  for (const [q, s] of Object.entries(d.status)) assert.ok(typeof s.ok === 'boolean' && Number.isInteger(s.anzahl) && Array.isArray(s.fehler), q);
  const zahlOderNull = v => v === null || (typeof v === 'number' && v > 0);
  for (const t of alleTitel(d)) {
    assert.match(t.id, /^(itunes:\d+|wunsch:[a-z0-9-]+|mydealz:.+|appletv:umc\.cmc\.[a-z0-9]+)$/, t.titel);
    assert.ok(['film', 'staffel', 'box'].includes(t.typ));
    assert.ok(typeof t.titel === 'string' && t.titel);
    for (const k of ['preis', 'preisSd', 'preisHd', 'leihe', 'vorher']) assert.ok(zahlOderNull(t[k]), `${t.titel} ${k}=${t[k]}`);
    assert.ok(t.tiefst === null || (zahlOderNull(t.tiefst.p) && /^\d{4}-\d\d-\d\d$/.test(t.tiefst.tag)));
    assert.ok(t.seit === null || /^\d{4}-\d\d-\d\d$/.test(t.seit));
    assert.ok(Number.isInteger(t.tage));
    assert.equal(typeof t.istTiefst, 'boolean'); assert.equal(typeof t.angebot, 'boolean');
    assert.ok(t.bild === null || /^https:\/\//.test(t.bild));
    assert.ok(t.link === null || /^https:\/\//.test(t.link));
    assert.ok(t.chart === null || Number.isInteger(t.chart));
    assert.ok(['Apple', 'mydealz'].includes(t.quelle));
    assert.ok(!Object.keys(t).some(k => k.startsWith('_')), 'keine internen Felder');
  }
  // Wunschliste: immer alle vier, Go Trabi Go fehlt im Store
  assert.deepEqual(d.gruppen.wunsch.map(t => t.titel), ['Mallrats', 'Shadow und der Fluch des Khan', 'Go Trabi Go', 'Manta Manta']);
  const trabi = d.gruppen.wunsch[2];
  assert.equal(trabi.fehlt, true); assert.equal(trabi.id, 'wunsch:go-trabi-go'); assert.equal(trabi.preis, null);
  for (const t of d.gruppen.wunsch) assert.equal(typeof t.unterZiel, 'boolean');
  assert.equal(d.gruppen.wunsch[3].unterZiel, true, 'Manta Manta 4,99 € ≤ Zielpreis');
  // Angebote: Filme ≤ 3,99 € (Apple) + mydealz-Aktionen; Wunsch/Kuratiertes vor Charts
  const ap = d.gruppen.angebot.filter(t => t.quelle === 'Apple');
  assert.ok(ap.length >= 4 && ap.every(t => t.typ === 'film' && t.preis <= 3.99 && t.angebot));
  assert.ok(d.gruppen.angebot.some(t => t.quelle === 'mydealz'));
  // Neu: nach Chartplatz, nur ≤ 18 Monate
  const neu = d.gruppen.neu;
  assert.ok(neu.length >= 5);
  assert.deepEqual(neu.map(t => t.chart), [...neu.map(t => t.chart)].sort((a, b) => a - b));
  assert.ok(neu.every(t => t.jahr >= 2025), neu.map(t => t.titel).join(', '));
  assert.ok(!neu.some(t => /Kevin|Stirb langsam|Manta Manta – Zwoter/.test(t.titel)), 'alte Filme nicht unter „neu“');
  // 80er / Disney: Angebot zuerst
  for (const g of ['achtziger', 'disney']) {
    const a = d.gruppen[g].map(t => t.angebot);
    assert.deepEqual(a, [...a].sort((x, y) => y - x), g);
  }
  // Serien: Staffeln mit Serie + Nummer, Angebote zuerst, Uncensored-Doppel nur einmal
  const se = d.gruppen.serien;
  // Apple-Staffeln mit Serie + Nummer (Komplett-Box: nr null); mydealz-Tipps: deine Serie am Namen erkannt (serie) oder „andere“
  assert.ok(se.every(t => t.typ === 'staffel' && (t.quelle === 'mydealz' ? (t.wunsch === false || !!t.serie) : t.serie && (Number.isInteger(t.nr) || t.komplett === true))));
  const tng17 = se.find(t => t.quelle === 'mydealz' && /Staffel 1 bis 7/.test(t.titel));
  assert.deepEqual([tng17?.wunsch, tng17?.serie], [true, 'Star Trek: Das nächste Jahrhundert'], 'mydealz-Staffeln deiner Serie stehen bei deiner Serie (Prüfer 15.11.), auch über 4,99 €');
  assert.equal(se.filter(t => t.serie === 'Rick and Morty' && t.nr === 3).length, 1);
  const sa = se.map(t => t.angebot);
  assert.deepEqual(sa, [...sa].sort((x, y) => y - x));
  assert.ok(se.find(t => /nächste Jahrhundert, Staffel 2/.test(t.titel)).angebot, 'TNG Staffel 2 für 9,99 € (nur SD) ist Angebot');
});

test('Tiefstpreis, vorher und Push über mehrere Läufe (jetzt-Parameter, wechselnde Preise)', async () => {
  const zustand = {};
  const normal = abruf(), aktion = abruf(AKTION);
  const titel = (r, g, re) => r.datei.gruppen[g].find(t => re.test(t.titel));
  // Tag 1–8: Normalpreis (Rick and Morty Staffel 2 für 19,99 €, Mallrats 7,99 €)
  let r;
  for (let i = 0; i < 8; i++) r = await filme(ctx(normal.holeText, zustand, tagPlus(i)));
  let rm2 = titel(r, 'serien', /Rick and Morty, Staffel 2$/);
  assert.deepEqual([rm2.preis, rm2.vorher, rm2.tiefst.p, rm2.seit, rm2.tage, rm2.istTiefst, rm2.angebot], [19.99, null, 19.99, '2026-11-07', 8, true, false]);
  assert.ok(!r.eintraege.some(e => /Rick and Morty/.test(e.titel)), 'gleichbleibender Preis -> kein Eintrag');
  // Tag 9: Aktion -> Staffel 9,99 € (neuer Tiefstpreis, sofort), Mallrats 3,99 € (Wunschfilm unter Ziel, sofort)
  r = await filme(ctx(aktion.holeText, zustand, tagPlus(8)));
  rm2 = titel(r, 'serien', /Rick and Morty, Staffel 2$/);
  assert.deepEqual([rm2.preis, rm2.vorher, rm2.tiefst, rm2.istTiefst, rm2.angebot], [9.99, 19.99, { p: 9.99, tag: '2026-11-15' }, true, true]);
  const se = r.datei.gruppen.serien;
  assert.ok(se.indexOf(rm2) < se.findIndex(t => !t.angebot), 'Angebote zuerst');
  const mall = titel(r, 'wunsch', /Mallrats/);
  assert.deepEqual([mall.preis, mall.vorher, mall.unterZiel, mall.istTiefst, mall.angebot], [3.99, 7.99, true, true, true]);
  const eMall = r.eintraege.find(e => /^Mallrats/.test(e.titel));
  assert.ok(eMall?.sofort, 'Wunschfilm zum Zielpreis -> sofort');
  assert.equal(eMall.kategorie, 'filme');
  assert.match(eMall.zeile, /Kaufen 3,99\s€ statt 7,99\s€/);
  assert.equal(eMall.link, 'https://itunes.apple.com/de/movie/mallrats/id286617745');
  const eRm = r.eintraege.find(e => /Rick and Morty, Staffel 2/.test(e.titel));
  assert.ok(eRm?.sofort, 'Staffel ≤ 9,99 € -> sofort');
  assert.ok(r.datei.gruppen.angebot.some(t => /Mallrats/.test(t.titel)), 'Wunschfilm für 3,99 € auch unter Angebote');
  // Tag 10: wieder Normalpreis -> vorher 9,99 €, Tiefstpreis bleibt, kein Tiefstpreis-Abzeichen
  r = await filme(ctx(normal.holeText, zustand, tagPlus(9)));
  rm2 = titel(r, 'serien', /Rick and Morty, Staffel 2$/);
  assert.deepEqual([rm2.preis, rm2.vorher, rm2.tiefst.p, rm2.istTiefst, rm2.angebot], [19.99, 9.99, 9.99, false, false]);
  assert.ok(!r.eintraege.some(e => /Rick and Morty|^Mallrats/.test(e.titel)), 'Preis gestiegen -> nichts melden');
  // Historie speichert nur Änderungen
  assert.deepEqual(zustand.filme.preise['itunes:1048590002'].h, [['2026-11-07', 19.99], ['2026-11-15', 9.99], ['2026-11-16', 19.99]]);
});

test('Historie: nur Änderungen, höchstens 400 Tage, Tiefstpreis erst nach 7 Tagen (über 3,99 €)', () => {
  const zf = {};
  for (let i = 0; i < 600; i++) {
    const tag = new Date(Date.UTC(2025, 0, 1) + i * 864e5).toISOString().slice(0, 10);
    merkeFilmPreis(zf, 'itunes:1', i % 10 < 5 ? 9.99 : 7.99, tag);
  }
  const v = zf.preise['itunes:1'];
  assert.ok(v.h.length <= 82, `Historie ${v.h.length}`);
  const letzter = new Date(Date.UTC(2025, 0, 1) + 599 * 864e5);
  const grenze = new Date(letzter.getTime() - 400 * 864e5).toISOString().slice(0, 10);
  assert.ok(v.h[0][0] < grenze && v.h[1][0] >= grenze, 'ältester Wert vor der Grenze bleibt als Ausgangswert, Rest ≤ 400 Tage');
  const z2 = {};
  merkeFilmPreis(z2, 'x', 5.99, '2026-11-01');
  let l = preisLage(z2.preise.x, 5.99, '2026-11-01');
  assert.equal(l.istTiefst, false, 'erster Tag, über 3,99 €');
  merkeFilmPreis(z2, 'x', 5.99, '2026-11-07');
  l = preisLage(z2.preise.x, 5.99, '2026-11-07');
  assert.equal(l.istTiefst, true, '7 Beobachtungstage');
  merkeFilmPreis(z2, 'y', 3.99, '2026-11-01');
  assert.equal(preisLage(z2.preise.y, 3.99, '2026-11-01').istTiefst, true, '≤ 3,99 € sofort');
});

test('Höflich: höchstens 25 Suchen und 45 Apple-Abrufe pro Lauf, Rest im nächsten Lauf, nicht Gefundenes erst nach 7 Tagen neu', async () => {
  const zustand = {};
  const z1 = abruf();
  await filme(ctx(z1.holeText, zustand));
  assert.ok(z1.suchen() <= 25, `Suchen ${z1.suchen()}`);
  assert.ok(z1.apple() <= 45, `Apple-Abrufe ${z1.apple()}`);
  const offen1 = postenListe(listen).filter(p => !zustand.filme.ids[p.key] || zustand.filme.ids[p.key].weiter != null).length;
  assert.ok(offen1 > 100);
  // zweiter Lauf am selben Tag: andere Titel, gefundene werden nicht neu gesucht
  const z2 = abruf();
  await filme(ctx(z2.holeText, zustand, new Date(JETZT.getTime() + 3 * 3600e3)));
  assert.ok(z2.suchen() <= 25 && z2.apple() <= 45);
  assert.ok(!z2.urls.some(u => u.includes('term=Mallrats') || u.includes('term=Go%20Trabi%20Go')), 'gemerkt bzw. erst nach 7 Tagen');
  assert.ok(z2.urls.some(u => u.includes('itunes.apple.com/lookup?') && u.includes('286617745')), 'Preise bekannter Titel per Lookup');
  // kleine Liste: Go Trabi Go nach 6 Tagen nicht, nach 7 Tagen wieder suchen
  const klein = { ...listen, wunschliste: [{ titel: 'Go Trabi Go', jahr: 1991 }], serien: [], achtziger: [], disney: [], mydealz: [] };
  const zk = {};
  const zaehle = async t => { const z = abruf(); await filme(ctx(z.holeText, zk, tagPlus(t), { filmListen: klein })); return z.urls.filter(u => u.includes('term=Go%20Trabi%20Go')).length; };
  assert.equal(await zaehle(0), 1);
  assert.equal(await zaehle(6), 0);
  assert.equal(await zaehle(7), 1);
  // Suchgrenze aus der config wirkt
  const z3 = abruf();
  await filme(ctx(z3.holeText, {}, JETZT, { cfg: { ...cfg, module: { ...cfg.module, filme: { ...cfg.module.filme, maxSuchen: 3 } } } }));
  assert.ok(z3.suchen() <= 3, `Suchen ${z3.suchen()}`);
});

test('Tote Quelle: Status meldet, alter Stand bleibt; Lookup-Ausfall zeigt die alten Preise', async () => {
  const zustand = {};
  const r1 = await filme(ctx(abruf().holeText, zustand));
  assert.equal(r1.datei.status['apple-charts'].ok, false, 'Kinder-&-Familie-Feed ist in der Fixture tot');
  assert.ok(r1.datei.status['apple-charts'].fehler.some(f => /Kinder/.test(f)));
  // nächster Lauf: Apple komplett tot -> Wunschfilme, Staffeln und Neues aus der alten Datei
  const tot = abruf([['itunes.apple.com', '!fehler'], ['tv.apple.com', '!fehler']]);
  const r2 = await filme(ctx(tot.holeText, zustand, tagPlus(1), { vorherDatei: r1.datei }));
  assert.equal(r2.datei.status['apple-preise'].ok, false);
  assert.equal(r2.datei.gruppen.wunsch.find(t => /Mallrats/.test(t.titel)).preis, 7.99);
  assert.equal(r2.datei.gruppen.serien.length, r1.datei.gruppen.serien.length);
  assert.equal(r2.datei.gruppen.neu.length, r1.datei.gruppen.neu.length);
  assert.ok(tot.apple() <= 10, `nach Fehlern nicht weiter hämmern: ${tot.apple()}`);
  assert.ok(!r2.eintraege.some(e => e.quelle === 'Apple TV'), 'aus altem Stand keine Pushes');
});

test('Einträge: höchstens 25, Apple-Link, Kategorie „Filme & Serien“; mydealz-Aktion mit Wunschfilm sofort', async () => {
  const r = await filme(ctx(abruf().holeText));
  assert.ok(r.eintraege.length <= 25);
  for (const e of r.eintraege) {
    assert.equal(e.kategorie, 'filme');
    assert.match(e.link, /^https:\/\/(itunes\.apple\.com|tv\.apple\.com|www\.mydealz\.de)\//);
    assert.ok(e.soGehts.length > 20);
  }
  const kult = r.eintraege.find(e => /Kultfilme/.test(e.titel));
  assert.ok(kult?.sofort, 'Manta Manta steht in der Aktion');
  assert.ok(!r.eintraege.find(e => /Disney & Pixar/.test(e.titel)).sofort);
  const { KATEGORIEN } = await import('../benachrichtigen.mjs');
  assert.equal(KATEGORIEN.filme, 'Filme & Serien');
  assert.match(sucheUrl('Rick and Morty', true), /media=tvShow&entity=tvSeason&limit=50/);
});

test('Modul nicht fällig -> keine neue Datei, alte filme.json bleibt; erster Filme-Lauf im laufenden Radar meldet nichts nach', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vorteile-filme-'));
  const log = console.log; console.log = () => {};
  try {
    await main(['--fixtures', '--data', dir, '--jetzt', '2026-11-07T12:00:00Z']);
    const pfad = join(dir, 'filme.json');
    const alt = await readFile(pfad, 'utf8');
    assert.equal(JSON.parse(alt).version, 1);
    // lauf ohne „alle“ eine Stunde später: filme (alle 3 h) nicht fällig -> keine Datei
    const zustand = JSON.parse(await readFile(join(dir, 'zustand.json'), 'utf8'));
    const z = abruf();
    const r = await lauf({ cfg, wunschliste: JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8')), filmListen: listen, vorher: JSON.parse(await readFile(join(dir, 'aktuell.json'), 'utf8')), zustand, holeText: z.holeText, jetzt: new Date('2026-11-07T13:00:00Z') });
    assert.equal(r.dateien.filme, undefined);
    assert.ok(r.aktuell.status.filme.uebersprungen);
    assert.ok(!z.urls.some(u => u.includes('itunes.apple.com')));
    assert.ok(r.aktuell.kategorien.filme.length > 0, 'alte Einträge bleiben');
    // main ohne Fixtures, Filme nicht fällig: Datei unverändert
    const netz = async url => { try { return new Response(await z.holeText(url)); } catch { return new Response('x', { status: 404 }); } };
    await main(['--data', dir, '--jetzt', '2026-11-07T13:00:00Z'], { DRY_RUN: '1' }, { fetchImpl: netz, abruf: { pauseMs: 0 } });
    assert.equal(await readFile(pfad, 'utf8'), alt);
    // Radar lief schon, Filme ist neu: nichts nachmelden
    const zp = join(dir, 'zustand.json');
    const zz = JSON.parse(await readFile(zp, 'utf8'));
    // neu = weder Lauf noch Neuversuch gemerkt (MV8: ein Fehlversuch mit Einträgen zählt als schon gelaufen)
    delete zz.lauf.filme; if (zz.neuversuch) delete zz.neuversuch.filme; zz.filme = {}; zz.gemeldet = { alt: '2026-11-01T00:00:00Z' }; zz.sofortTage = {};
    await writeFile(zp, JSON.stringify(zz));
    const r3 = await main(['--fixtures', '--data', dir, '--jetzt', '2026-11-07T19:00:00Z', '--modus', 'digest']);
    assert.ok(!r3.plan.sofort.some(s => s.e.kategorie === 'filme'));
    assert.ok(!(r3.plan.digest?.liste || []).some(e => e.kategorie === 'filme'));
    assert.notEqual(await readFile(pfad, 'utf8'), alt, 'gelaufen -> neue Datei');
  } finally { console.log = log; await rm(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- Ausweichwege (echter Lauf 07.11.2026: Filmsuche immer leer)
// Echte Antworten in fixtures/echt-0711 (leere Film-/Staffel-Suche, Staffel-Suchen, Lookup, Charts Komödie + Kinder & Familie),
// dazu Antworten im echten Format für die Ausweichwege: US-Store-Suche, Lookup DE der Kandidaten, Wikidata.
const ECHT = 'echt-0711';
const AUSWEICH = [
  ['query.wikidata.org/sparql', 'wikidata-ausweich.json'],
  ['term=Mallrats&country=us', 'itunes-search-us-mallrats.json'],
  ['term=The%20Shadow&country=us', 'itunes-search-us-shadow.json'],
  ['term=Back%20to%20the%20Future&country=us', 'itunes-search-us-backtothefuture.json'],
  ['term=Star%20Trek%3A%20The%20Next%20Generation&country=us', 'itunes-search-us-startrek-tng.json'],
  ['term=Star%20Trek%3A%20The%20Original%20Series&country=us', 'itunes-search-us-startrek-tos.json'],
  ['country=us', `${ECHT}/itunes-search-film-leer.json`],
  ['term=Rick%20and%20Morty&country=de&media=tvShow', `${ECHT}/itunes-search-rickandmorty.json`],
  ['term=Star%20Trek%3A%20Raumschiff%20Enterprise&country=de&media=tvShow', `${ECHT}/itunes-search-startrek-raumschiff-enterprise.json`],
  ['term=Star%20Trek%3A%20Enterprise&country=de&media=tvShow', `${ECHT}/itunes-search-startrek-enterprise.json`],
  ['media=tvShow', `${ECHT}/itunes-search-serie-leer.json`],
  ['itunes.apple.com/search?', `${ECHT}/itunes-search-film-leer.json`],
  ['genre=4404/json', `${ECHT}/itunes-rss-komoedie.json`],
  ['genre=4410/json', `${ECHT}/itunes-rss-kinder.json`],
  ['/rss/topmovies/', 'itunes-rss-leer.json'],
];
/** Abruf wie Apple: der Lookup liefert nur die angefragten Nummern (aus dem echten Lookup + den Kandidaten im deutschen Store). */
async function ausweichAbruf(vorne = [], karte = AUSWEICH, lookupDateien = [`${ECHT}/itunes-lookup.json`, 'itunes-lookup-ausweich.json']) {
  const alle = (await Promise.all(lookupDateien.map(ergebnisse))).flat();
  const h = macheFixtureAbruf(FIX, [...vorne, ...karte]);
  const z = { urls: [] };
  z.holeText = async url => {
    z.urls.push(url);
    if (url.includes('itunes.apple.com/lookup?') && !vorne.some(([teil]) => url.includes(teil))) {
      const ids = new URL(url).searchParams.get('id').split(',');
      const res = alle.filter(r => ids.includes(String(r.trackId ?? r.collectionId)));
      return JSON.stringify({ resultCount: res.length, results: res });
    }
    return h(url);
  };
  z.suchen = land => z.urls.filter(u => u.includes('itunes.apple.com/search?') && (!land || u.includes(`&country=${land}&`))).length;
  return z;
}
const CHARTS_ECHT = { neu: [{ id: 4404, name: 'Komödie' }], angebot: [{ id: 4410, name: 'Kinder & Familie' }], suche: [] };
const nurFilme = (wunschliste, achtziger = []) => ({ ...listen, wunschliste, serien: [], achtziger, disney: [], charts: CHARTS_ECHT, mydealz: [] });
const zukunft = listen.achtziger.filter(x => /^Zurück in die Zukunft( II)?$/.test(x.titel));
const schluesselVon = (titel, jahr) => postenListe({ wunschliste: [{ titel, jahr }] })[0].key;

test('Ausweichwege: echte leere DE-Suche -> US-Suche -> Lookup DE -> Treffer; Shadow 1994 (nicht 1940/2018), Manta Manta 1991 (nicht 2023); fehlt nur, wenn alle Wege leer', async () => {
  // echte Antwort: Filmsuche im deutschen Store leer
  assert.deepEqual(await ergebnisse(`${ECHT}/itunes-search-film-leer.json`), []);
  const zustand = {};
  const z = await ausweichAbruf();
  const r = await filme(ctx(z.holeText, zustand, JETZT, { filmListen: nurFilme(listen.wunschliste, zukunft) }));
  const ids = zustand.filme.ids;
  const w = r.datei.gruppen.wunsch;
  // US-Store: The Shadow (1994) – nicht das Serial von 1940, nicht „Shadow“ (2018), nicht „The Shadow Strays“
  assert.deepEqual(ids[schluesselVon('Shadow und der Fluch des Khan', 1994)], { id: 'itunes:1440794321', tag: '2026-11-07', weg: 'us' });
  assert.equal(w[1].titel, 'Shadow und der Fluch des Khan', 'deutsche Daten aus dem Lookup im deutschen Store');
  assert.match(w[1].link, /^https:\/\/itunes\.apple\.com\/de\/movie\//);
  assert.equal(ids[schluesselVon('Mallrats', 1995)].weg, 'us');
  // Wikidata: „Manta Manta“ 1991, nicht der Alias der Fortsetzung von 2023
  assert.deepEqual(ids[schluesselVon('Manta Manta', 1991)], { id: 'itunes:1191234567', tag: '2026-11-07', weg: 'wikidata' });
  assert.equal(w[3].jahr, 1991);
  // Beifang: die US-Suche nach „Back to the Future“ findet auch Teil II
  assert.equal(ids[postenListe({ achtziger: [zukunft[1]] })[0].key].id, 'itunes:1000000102');
  // Go Trabi Go: deutsch, kein englischer Titel; DE leer, Wikidata ohne Treffer, nicht in den Charts -> fehlt
  assert.equal(ids[schluesselVon('Go Trabi Go', 1991)].fehlt, '2026-11-07');
  assert.equal(w[2].fehlt, true);
  const s = r.datei.status['apple-suche'];
  assert.deepEqual(s.wege, { de: 0, us: 4, wikidata: 1, charts: 0 });
  assert.equal(s.anzahl, 5, 'auf der Seite: 5 neu gefunden');
  assert.deepEqual(s.nichtGefunden, ['Go Trabi Go']);
  // Suchweg „de“ ruht nach 4 leeren Antworten (Mallrats 1, Shadow 2, Go Trabi Go 1) – danach keine DE-Suche mehr
  assert.equal(z.suchen('de'), 4, z.urls.filter(u => u.includes('country=de&')).join('\n'));
  assert.deepEqual(s.ruhend, ['de-film']);
  assert.equal(zustand.filme.wege['de-film'].leer, 4);
  assert.ok(z.urls.some(u => u.includes('query.wikidata.org/sparql?format=json&query=')), 'Wikidata gefragt');
  assert.ok(r.datei.status['apple-suche'].ok, 'leere Antworten sind kein Fehler');
});

test('Weg „charts“ mit echten Antworten (07.11.2026): Manta Manta 1991 für 3,99 € statt „Zwoter Teil“ 2023, Zurück in die Zukunft aus Kinder & Familie', async () => {
  const zustand = {};
  const z = await ausweichAbruf([['query.wikidata.org/sparql', 'wikidata-leer.json'], ['country=us', `${ECHT}/itunes-search-film-leer.json`]]);
  const r = await filme(ctx(z.holeText, zustand, JETZT, { filmListen: nurFilme([{ titel: 'Manta Manta', jahr: 1991 }], [zukunft[0]]) }));
  const ids = zustand.filme.ids;
  assert.deepEqual(ids[schluesselVon('Manta Manta', 1991)], { id: 'itunes:524404062', tag: '2026-11-07', weg: 'charts' });
  const manta = r.datei.gruppen.wunsch[0];
  assert.deepEqual([manta.titel, manta.jahr, manta.preis, manta.preisHd, manta.unterZiel], ['Manta Manta', 1991, 3.99, 3.99, true]);
  assert.ok(!alleTitel(r.datei).some(t => t.id === 'itunes:1684919227' && r.datei.gruppen.wunsch.includes(t)), 'nicht die Fortsetzung');
  assert.equal(ids[postenListe({ achtziger: [zukunft[0]] })[0].key].id, 'itunes:592361446');
  assert.equal(r.datei.gruppen.achtziger.find(t => t.id === 'itunes:592361446').preis, 9.99, 'Preis aus dem Chart-Feed (nicht im Lookup)');
  assert.deepEqual(r.datei.status['apple-suche'].wege, { de: 0, us: 0, wikidata: 0, charts: 2 });
  const e = r.eintraege.find(x => /^Manta Manta \(1991\) für 3,99/.test(x.titel));
  assert.ok(e?.sofort, 'Wunschfilm zum Zielpreis -> sofort');
  // Charts-Abgleich unabhängig vom Lauf: Fortsetzung, Jahr und Untertitel
  const idx = chartIndex(leseCharts(await fix(`${ECHT}/itunes-rss-komoedie.json`)));
  assert.equal(chartFilm(idx, { titel: 'Manta Manta', jahr: 1991 }).id, 'itunes:524404062');
  assert.equal(chartFilm(idx, { titel: 'Manta Manta', jahr: 2023 }), null, 'Jahr passt nicht, Fortsetzung heißt anders');
  assert.equal(chartFilm(idx, { titel: 'Ghostbusters – Die Geisterjäger', jahr: 1984, auch: ['Ghostbusters'] }).id, 'itunes:532285804');
});

test('Suchweg ruht -> jeder Lauf eine Probe; repariert -> wieder aktiv, nicht Gefundenes sofort neu', async () => {
  const zustand = {};
  const film = titel => listen.achtziger.find(x => x.titel === titel);
  const mehr = [...zukunft, film('Ghostbusters II'), film('Stirb langsam')];
  await filme(ctx((await ausweichAbruf()).holeText, zustand, JETZT, { filmListen: nurFilme(listen.wunschliste, zukunft) }));
  assert.equal(zustand.filme.wege['de-film'].leer, 4);
  // Tag 2: neue Titel, Apple weiter kaputt -> genau eine Probe im deutschen Store, Weg ruht weiter
  const z1 = await ausweichAbruf();
  const r1 = await filme(ctx(z1.holeText, zustand, tagPlus(1), { filmListen: nurFilme(listen.wunschliste, mehr) }));
  assert.equal(z1.suchen('de'), 1, 'eine Probe');
  assert.deepEqual(r1.datei.status['apple-suche'].ruhend, ['de-film']);
  assert.equal(zustand.filme.ids[postenListe({ achtziger: [mehr[2]] })[0].key].weg, 'charts', 'Ghostbusters II (1990 im Chart) über die Charts');
  assert.ok(zustand.filme.ids[postenListe({ achtziger: [mehr[3]] })[0].key].fehlt, 'Stirb langsam: alle Wege leer');
  // Tag 3: Apple repariert (Suche liefert wieder) -> Probe mit Treffern, Weg aktiv, „wieder“ gemerkt
  const neu = [...mehr, film('Zurück in die Zukunft III')];
  const z2 = abruf();
  const r2 = await filme(ctx(z2.holeText, zustand, tagPlus(2), { filmListen: { ...nurFilme(listen.wunschliste, neu), charts: listen.charts } }));
  assert.deepEqual(r2.datei.status['apple-suche'].ruhend, []);
  assert.equal(zustand.filme.wege['de-film'].wieder, '2026-11-09');
  assert.equal(zustand.filme.ids[postenListe({ achtziger: [neu[4]] })[0].key].weg, 'de');
  // „fehlt“-Titel werden bei jedem Lauf kostenlos mit den Charts abgeglichen: Stirb langsam steht in den (Fixture-)Klassikern
  assert.equal(zustand.filme.ids[postenListe({ achtziger: [mehr[3]] })[0].key].weg, 'charts');
  // Tag 4: was vor der Reparatur „fehlt“ bekam, wird sofort neu gesucht (nicht erst nach 7 Tagen)
  assert.equal(zustand.filme.ids[schluesselVon('Go Trabi Go', 1991)].fehlt, '2026-11-07');
  const z3 = abruf();
  await filme(ctx(z3.holeText, zustand, tagPlus(3), { filmListen: { ...nurFilme(listen.wunschliste, neu), charts: listen.charts } }));
  assert.ok(z3.urls.some(u => u.includes('term=Go%20Trabi%20Go&country=de')), 'Go Trabi Go neu gesucht');
});

test('Serien: deutsche + englische Namen, US-Store + Lookup DE; Staffel-Doppel (DE-/EN-Name) nur einmal, günstigere Fassung', async () => {
  const sr = listen.serien.filter(s => /^(Rick and Morty|Star Trek: (Raumschiff Enterprise|Das nächste Jahrhundert|Enterprise))$/.test(s.titel));
  assert.equal(sr.length, 4);
  assert.deepEqual(serienBegriffe(sr[2]), ['Star Trek: Das nächste Jahrhundert', 'Star Trek: The Next Generation']);
  const zustand = {};
  const z = await ausweichAbruf([['query.wikidata.org/sparql', 'wikidata-leer.json']]);
  const r = await filme(ctx(z.holeText, zustand, JETZT, { filmListen: { ...nurFilme([]), serien: sr } }));
  const se = r.datei.gruppen.serien;
  // TNG: im deutschen Store unter keinem Namen gefunden (echte Antwort), über den US-Store + Lookup DE drei Staffeln
  assert.ok(z.urls.some(u => u.includes('term=Star%20Trek%3A%20Das%20n%C3%A4chste%20Jahrhundert&country=de')));
  assert.ok(z.urls.some(u => u.includes('term=Star%20Trek%3A%20The%20Next%20Generation&country=de')));
  assert.deepEqual(se.filter(t => t.serie === 'Star Trek: Das nächste Jahrhundert').map(t => t.nr).sort(), [1, 2, 3]);
  assert.ok(!se.some(t => /Deep Space/.test(t.titel)), 'DS9 gehört nicht zu TNG');
  const tng2 = se.find(t => t.serie === 'Star Trek: Das nächste Jahrhundert' && t.nr === 2);
  assert.deepEqual([tng2.preis, tng2.angebot], [9.99, true]);
  // TOS: Staffel 1 im deutschen Store zweimal (deutscher und englischer Name) -> ein Eintrag, die günstigere (19,99 € statt 29,99 €)
  const tos1 = se.filter(t => t.serie === 'Star Trek: Raumschiff Enterprise' && t.nr === 1);
  assert.equal(tos1.length, 1);
  assert.equal(tos1[0].preis, 19.99);
  assert.ok(zustand.filme.ids['serie:star-trek-raumschiff-enterprise'].ids.includes('itunes:648533852'), 'beide Nummern bleiben für die Preis-Historie');
  assert.ok(zustand.filme.ids['serie:star-trek-raumschiff-enterprise'].ids.includes('itunes:291000001'));
  assert.equal(se.filter(t => t.serie === 'Star Trek: Raumschiff Enterprise' && t.nr === 2).length, 1);
  // Rick and Morty aus der echten Staffel-Suche, ohne „The Anime“
  assert.deepEqual(se.filter(t => t.serie === 'Rick and Morty').map(t => t.nr).sort((a, b) => a - b), [1, 2, 4, 5, 6, 9]);
  // Star Trek: Enterprise: nur Treffer anderer Serien (TOS, Animated) -> nichts, nach allen Wegen „fehlt“
  assert.ok(zustand.filme.ids['serie:star-trek-enterprise'].fehlt);
  const s = r.datei.status['apple-suche'];
  assert.deepEqual([s.wege.de, s.wege.us], [2, 2]);
});

test('Offen statt „fehlt“: Wikidata oder der Lookup der Kandidaten gestört -> nächster Lauf noch einmal', async () => {
  const zustand = {};
  const trabi = schluesselVon('Go Trabi Go', 1991);
  const zw = await ausweichAbruf([['query.wikidata.org/sparql', '!fehler']]);
  const r = await filme(ctx(zw.holeText, zustand, JETZT, { filmListen: nurFilme([{ titel: 'Go Trabi Go', jahr: 1991 }]) }));
  assert.deepEqual(zustand.filme.ids[trabi], { weiter: 0, versucht: '2026-11-07' });
  assert.ok(r.datei.status['apple-suche'].fehler.some(f => /^Wikidata: HTTP 503/.test(f)));
  assert.equal(r.datei.gruppen.wunsch[0].fehlt, undefined, 'auf der Seite noch nicht „nicht im Store“');
  const z2 = await ausweichAbruf();
  await filme(ctx(z2.holeText, zustand, tagPlus(1), { filmListen: nurFilme([{ titel: 'Go Trabi Go', jahr: 1991 }]) }));
  assert.equal(zustand.filme.ids[trabi].fehlt, '2026-11-08');
  // Kandidat gefunden, aber der Lookup im deutschen Store fällt aus -> offen
  const z3 = await ausweichAbruf([['itunes.apple.com/lookup?', '!fehler']]);
  const z3z = {};
  await filme(ctx(z3.holeText, z3z, JETZT, { filmListen: nurFilme([listen.wunschliste[0]]) }));
  assert.deepEqual(z3z.filme.ids[schluesselVon('Mallrats', 1995)], { weiter: 0, versucht: '2026-11-07' });
});

test('Altes „fehlt“ (nur kaputte DE-Suche, ohne Marke) -> sofort mit allen Wegen; dauerhaft Offene blockieren die Runde nicht', async () => {
  // Zustand wie nach einem Lauf der alten Fassung (heute, 20:41 UTC): Mallrats „fehlt“ ohne „alle“
  const mall = schluesselVon('Mallrats', 1995);
  const zustand = { filme: { ids: { [mall]: { fehlt: '2026-11-07', n: 1 } } } };
  const z = await ausweichAbruf();
  await filme(ctx(z.holeText, zustand, JETZT, { filmListen: nurFilme([listen.wunschliste[0]]) }));
  assert.ok(z.urls.some(u => u.includes('term=Mallrats&country=us')), 'US-Weg probiert, nicht erst in 7 Tagen');
  assert.deepEqual(zustand.filme.ids[mall], { id: 'itunes:286617745', tag: '2026-11-07', weg: 'us' });
  // neues „fehlt“ trägt die Marke -> erst nach wiederholenTage wieder dran
  const leer = await ausweichAbruf([['query.wikidata.org/sparql', 'wikidata-leer.json'], ['country=us', `${ECHT}/itunes-search-film-leer.json`]]);
  const z2 = {};
  await filme(ctx(leer.holeText, z2, JETZT, { filmListen: nurFilme([{ titel: 'Go Trabi Go', jahr: 1991 }]) }));
  assert.deepEqual(z2.filme.ids[schluesselVon('Go Trabi Go', 1991)], { fehlt: '2026-11-07', n: 1, alle: 1 });
  // Wikidata dauerhaft gestört, maxNeueTitel 2: Lauf 2 nimmt die zwei noch nie Versuchten statt wieder dieselben zwei
  const vier = ['Eins', 'Zwei', 'Drei', 'Vier'].map((x, i) => ({ titel: `Probefilm ${x}`, jahr: 1981 + i })); // in keiner Quelle
  const z3 = {};
  const kaputt = () => ausweichAbruf([['query.wikidata.org/sparql', '!fehler']]);
  const lauf = async (jetzt) => filme({ ...ctx((await kaputt()).holeText, z3, jetzt, { filmListen: { ...nurFilme([], vier), charts: { ...CHARTS_ECHT, neu: [], angebot: [] } } }), cfg: { module: { filme: { maxNeueTitel: 2 } } } });
  await lauf(JETZT);
  const keys = postenListe({ achtziger: vier }).map(p => p.key);
  assert.deepEqual(keys.map(k => z3.filme.ids[k]?.versucht ?? null), ['2026-11-07', '2026-11-07', null, null]);
  await lauf(tagPlus(1));
  assert.deepEqual(keys.map(k => z3.filme.ids[k]?.versucht ?? null), ['2026-11-07', '2026-11-07', '2026-11-08', '2026-11-08']);
});

test('Wikidata: Abfrage (Name deutsch/englisch, P6398, Jahr), Aufteilung nach Adresslänge, tolerantes Lesen', async () => {
  const q = wikidataAbfrage(['Mallrats', 'Ralph reicht\'s', 'Die "Schöne"', 'Mallrats']);
  assert.match(q, /VALUES \?name \{ "Mallrats"@de "Mallrats"@en "Ralph reicht's"@de "Ralph reicht's"@en "Die \\"Schöne\\""@de/);
  assert.match(q, /wdt:P6398 \?itunes/);
  assert.equal((q.match(/"Mallrats"@de/g) || []).length, 1, 'doppelte Namen einmal');
  const teile = wikidataTeile(postenListe(listen).filter(p => !p.serie).slice(0, 25), 3500);
  assert.ok(teile.length >= 2 && teile.every(t => t.url.length <= 3500 || t.posten.length === 1), teile.map(t => t.url.length).join(','));
  assert.equal(teile.reduce((n, t) => n + t.posten.length, 0), 25);
  const zeilen = leseWikidata(await fix('wikidata-ausweich.json'));
  assert.deepEqual(zeilen.map(z => [z.id, z.jahr]), [['itunes:1191234567', 1991], ['itunes:1678901234', 2023], ['itunes:1000002301', 1992]], 'kaputte Nummer fällt weg, „id…“ wird gelesen');
  assert.deepEqual(wikidataKandidaten(zeilen, { titel: 'Manta Manta', jahr: 1991 }).map(k => k.id), ['itunes:1191234567']);
  assert.deepEqual(wikidataKandidaten(zeilen, { titel: 'Go Trabi Go', jahr: 1991 }), []);
  assert.deepEqual(leseWikidata('{"head":{},"results":{"bindings":[]}}'), []);
  assert.throws(() => leseWikidata('<html>Too Many Requests</html>'), /Wikidata/);
  assert.throws(() => leseWikidata('{"error":"x"}'), /bindings/);
  assert.equal(englisch({ titel: 'Manta Manta' }), null);
  assert.equal(englisch(listen.wunschliste[1]), 'The Shadow');
  assert.match(sucheUrl('The Shadow', false, 20, 'us'), /term=The%20Shadow&country=us&media=movie&entity=movie&limit=20$/);
  // jeder kuratierte Film ohne englischen Titel ist ein deutscher Film
  const ohne = postenListe(listen).filter(p => !p.serie && !p.item.en).map(p => p.item.titel);
  assert.deepEqual(ohne.sort(), ['Ballermann 6', 'Bang Boom Bang – Ein todsicheres Ding', 'Erkan & Stefan', 'Go Trabi Go', 'Manta Manta', 'Otto – Der Außerfriesische', 'Otto – Der Film', 'Schtonk!', 'Werner – Beinhart!', 'Werner – Das muss kesseln!!!']);
  assert.ok(postenListe(listen).filter(p => p.serie).every(p => p.item.en), 'jede Serie mit englischem Namen');
});

test('Apple-TV-Angebotsraum (Xander 08.11.2026): Raum-Links finden, Filme abgleichen (Wunsch/80er/Disney), Fortsetzung ≠ Teil 1', async () => {
  const { raumLinks, raumFilme, raumPreis, raumName, passtZuListe, slugVon } = await import('../lib/appletv.mjs');
  const start = await fix('appletv-filme.html');
  const l = raumLinks(start);
  assert.deepEqual(l.map(x => [x.slug, x.angebot]), [['filme-fur-3-99-eur', true], ['neu-im-kino', false], ['filme-der-woche', true]]);
  assert.equal(l[0].url, 'https://tv.apple.com/de/room/filme-fur-3-99-eur/edt.item.11111111-2222-3333-4444-555555555555');
  const raum = await fix('appletv-raum-399.html');
  assert.equal(raumName(raum), 'Filme für 3,99 €');
  assert.equal(raumPreis(raum), 3.99);
  const f = raumFilme(raum);
  assert.deepEqual(f.map(x => x.slug), ['zuruck-in-die-zukunft', 'zuruck-in-die-zukunft-ii', 'go-trabi-go', 'die-fabelhafte-welt-der-amelie', 'manta-manta', 'der-konig-der-lowen']);
  assert.equal(f[4].link, 'https://tv.apple.com/de/movie//umc.cmc.eee111', 'Link ohne Slug bleibt wie bei Apple (Titel aus dem Link-Text)');
  assert.equal(slugVon('Der König der Löwen'), 'der-konig-der-lowen');
  assert.equal(passtZuListe(f[0], { titel: 'Zurück in die Zukunft' }), true);
  assert.equal(passtZuListe(f[1], { titel: 'Zurück in die Zukunft' }), false, 'Teil II ist ein anderer Film');
  assert.equal(passtZuListe({ slug: 'back-to-the-future' }, { titel: 'Zurück in die Zukunft', en: 'Back to the Future' }), true);
  const z = abruf();
  const r = await filme(ctx(z.holeText));
  const st = r.datei.status['apple-tv-raeume'];
  assert.equal(st.ok, true);
  assert.ok(st.raeume.length >= 1 && st.raeume[0].preis === 3.99, JSON.stringify(st));
  assert.ok(st.abrufe <= 4);
  const ang = r.datei.gruppen.angebot.filter(t => t.id.startsWith('appletv:'));
  assert.ok(ang.some(t => t.titel === 'Go Trabi Go' && t.liste === 'wunsch' && t.preis === 3.99 && /tv\.apple\.com\/de\/movie\/go-trabi-go/.test(t.link)));
  assert.ok(ang.some(t => t.titel === 'Der König der Löwen' && t.liste === 'disney'));
  const trabi = r.eintraege.find(e => /Go Trabi Go/.test(e.titel) && e.extra?.raum);
  assert.ok(trabi, r.eintraege.map(e => e.titel).join(' | '));
  assert.equal(trabi.sofort, true, 'Wunschfilm im Angebotsraum = sofort');
  assert.match(trabi.zeile, /im Apple-TV-Raum „Filme für 3,99 €“ · auf deiner Wunschliste/);
  // jeder Raum-Film landet beim richtigen Listen-Eintrag (Teil II bei Teil II, nicht bei Teil I)
  for (const t of ang) assert.equal(slugVon(t.titel), t.link.split('/')[5] || slugVon(t.titel === 'Manta Manta' ? 'Manta Manta' : '?'), t.titel);
  assert.ok(ang.some(t => t.titel === 'Manta Manta' && t.link.endsWith('/movie//umc.cmc.eee111')), 'Film ohne Slug im Link über den Link-Text erkannt');
  assert.ok(!ang.some(t => /Amélie/.test(t.titel)), 'nicht auf deiner Liste -> kein Treffer');
  // Raum kaputt -> Status, Rest läuft
  const kaputt = abruf([['tv.apple.com', '!fehler']]);
  const r2 = await filme(ctx(kaputt.holeText));
  assert.equal(r2.datei.status['apple-tv-raeume'].ok, false);
  assert.ok(r2.datei.gruppen.wunsch.length === 4);
});

// ---------------------------------------------------------------- MV7 (14.11.2026): Übersicht nach Genres + Qualität
const QUALI = [['P6398%20%3Fkey', 'wikidata-qualitaet.json']];

test('Qualität: Apple-Titel säubern, Wikidata-Antwort lesen, passenden Film wählen (Name + Jahr, Wiederveröffentlichung)', () => {
  assert.equal(suchName('Charade (1963)'), 'Charade');
  assert.equal(suchName('Jungs Von Spinal Tap, Die'), 'Die Jungs Von Spinal Tap');
  assert.equal(suchName("THX 1138 (Director's Cut)"), 'THX 1138');
  assert.equal(suchName('The Outfit -- Verbrechen nach Maß'), 'The Outfit');
  assert.equal(suchName('Scary Movie (2026) Extended Cut'), 'Scary Movie');
  assert.equal(jahrImTitel('Meteor (1979)'), 1979);
  assert.equal(jahrImTitel('Dirty Harry'), null);
  const q = qualiAbfrage([{ nr: '123', name: 'Charade "X"' }]);
  assert.match(q, /wdt:P6398/); assert.match(q, /"@de\) \("123"/); assert.doesNotMatch(q, /mwapi/, "keine mwapi-Suche (HTTP 500 im echten Lauf)"); assert.match(q, /hint:optimizer "None"/); assert.match(q, /Q200092/); assert.match(q, /Q105584/);
  assert.match(q, /"Charade \\"X\\""/, 'Anführungszeichen sicher');
  const zeilen = leseQuali(JSON.stringify({ results: { bindings: [
    { key: { value: '1234567' }, weg: { value: 'name' }, item: { value: 'http://www.wikidata.org/entity/Q1' }, l: { value: '45' }, jahr: { value: '1971' }, rt: { value: '91%|8.1/10' }, lab: { value: 'Dirty Harry' } },
    { key: { value: '1234567' }, weg: { value: 'name' }, item: { value: 'http://www.wikidata.org/entity/Q2' }, l: { value: '2' }, jahr: { value: '2015' }, rt: { value: '' }, lab: { value: 'Dirty Harry (Band)' } },
    { key: { value: 'kaputt' }, l: { value: '9' } },
  ] } }));
  assert.equal(zeilen.length, 2);
  assert.deepEqual([zeilen[0].rt, zeilen[0].jahr, zeilen[0].item, zeilen[0].horror], [91, 1971, 'Q1', false]);
  // Apple-Datum 2014 = Wiederveröffentlichung -> älterer Film mit gleichem Namen
  assert.equal(qualiWahl(zeilen, { nr: '1234567', name: 'Dirty Harry', jahr: 2014 }).item, 'Q1');
  assert.equal(qualiWahl(zeilen, { nr: '1234567', name: 'Dirty Harry', jahr: 2014 }).jahr, 1971, 'Wikidata-Jahr kommt mit (Filmjahr statt Apple-Datum)');
  assert.equal(qualiWahl(zeilen, { nr: '1234567', name: 'Dirty Harry', jahr: 1960 }), null, 'kein Film vor 1960 mit dem Namen');
  assert.equal(qualiWahl(zeilen, { nr: '1234567', name: 'Ganz anderer Film', jahr: 1971 }), null, 'Name muss passen');
  assert.throws(() => leseQuali('<html>'), /Wikidata/);
});

test('Qualität: Urteil – Horror raus, gute Kritik oder bekannt bleibt, Ramsch raus, ohne Daten nur die Chart-Spitze', () => {
  const m = FILM_STANDARD;
  assert.equal(qualiOk({ l: 80, horror: true, rt: 95 }, {}, m), false, 'Horror nie');
  assert.equal(qualiOk({ l: 10, horror: false, rt: 92 }, {}, m), true, 'gute Kritik');
  assert.equal(qualiOk({ l: 20, horror: false, rt: 30 }, {}, m), false, 'schlechte Kritik, wenig bekannt');
  assert.equal(qualiOk({ l: 60, horror: false, rt: 23 }, {}, m), true, 'Blockbuster (Popcorn-Kino) bleibt');
  assert.equal(qualiOk({ l: 35, horror: false, rt: null }, {}, m), true, 'bekannt ohne Kritik');
  assert.equal(qualiOk({ l: 8, horror: false, rt: null }, { chart: 2 }, m), false, 'unbekannt -> raus, auch weit oben in den Charts');
  assert.equal(qualiOk({ l: 14, horror: false, rt: null }, { neu: true }, m), true, 'neuer Film: weniger Artikel reichen');
  assert.equal(qualiOk(null, { chart: 3 }, m), true, 'keine Daten: Chart-Spitze bleibt');
  assert.equal(qualiOk({ l: -1 }, { chart: 40 }, m), false, 'nicht gefunden, weit unten -> raus');
  assert.equal(genreGruppe('Action & Abenteuer'), 'action');
  assert.equal(genreGruppe('Science-Fiction und Fantasy'), 'action');
  assert.equal(genreGruppe('Thriller'), 'action');
  assert.equal(genreGruppe('Komödien'), 'comedy');
  assert.equal(genreGruppe('Kinder und Familie'), null);
});

test('Übersicht: Für 3,99 € · Action & Thriller · Comedy · 80er & Klassiker – Qualitätsfilter, Wunschliste oben, Kachel-Zusammenfassung', async () => {
  const zustand = {};
  const z = abruf(QUALI);
  const r = await filme(ctx(z.holeText, zustand));
  const g = r.datei.gruppen;
  const ids = k => g[k].map(t => t.id);
  const alle = alleTitel(r.datei);
  // Horror (Wikidata-Genre) und Unbekanntes (8 Wikipedia-Sprachen, keine Kritik) sind nirgends
  assert.ok(!alle.some(t => t.id === 'itunes:1800000001'), 'Horror laut Wikidata');
  assert.ok(!alle.some(t => t.id === 'itunes:1678901234'), 'Manta Manta – Zwoter Teil: zu unbekannt');
  assert.equal(r.datei.status.qualitaet.raus, 2);
  assert.equal(r.datei.status.qualitaet.gefunden, 4);
  // Für 3,99 €: nur ≤ 3,99 € (Apple) bzw. je Film (mydealz); gut Bewertetes mit Rotten Tomatoes
  const pate = g.fuer399.find(t => t.id === 'itunes:1000000601');
  assert.equal(pate.rt, 97); assert.equal(pate.bekannt, 120);
  assert.ok(g.fuer399.filter(t => t.quelle === 'Apple' && !String(t.id).startsWith('appletv:')).every(t => t.preis <= 3.99));
  // Action & Thriller / Comedy: Kauf ≤ 7,99 €, passendes Genre; Wunschliste vor dem Rest
  assert.ok(ids('action').includes('itunes:1800000014'), 'Top Gun: Maverick 4,99 €');
  assert.equal(g.action.find(t => t.id === 'itunes:1800000014').rt, 96);
  for (const k of ['action', 'comedy']) for (const t of g[k].filter(x => x.quelle === 'Apple')) assert.ok(t.preis <= 7.99 || (t.vorher && t.preis <= t.vorher * 0.7), `${k}: ${t.titel}`);
  assert.ok(g.comedy.every(t => t.quelle !== 'Apple' || /kom/i.test(t.genre)));
  assert.deepEqual(g.comedy.slice(0, 2).map(t => t.titel), ['Manta Manta', 'Mallrats'], 'Wunschfilme oben');
  // 80er & Klassiker: Liste + gute Klassiker aus den Charts, Angebote zuerst
  assert.ok(ids('achtziger').includes('itunes:1000000601'), 'Der Pate (1972) aus den Klassiker-Charts');
  const a = g.achtziger.map(t => t.angebot);
  assert.deepEqual(a, [...a].sort((x, y) => y - x));
  // Kachel: Zahl der Angebote + die drei besten (Wunsch zuerst)
  assert.ok(r.kurz.angebote >= 10, String(r.kurz.angebote));
  assert.equal(r.kurz.top.length, 3); assert.equal(r.kurz.top[0].titel, 'Manta Manta');
  assert.deepEqual(r.datei.kurz, r.kurz);
  // Qualität bleibt im Zustand: zweiter Lauf fragt Wikidata nicht noch einmal
  const z2 = abruf(QUALI);
  await filme(ctx(z2.holeText, zustand, tagPlus(1)));
  assert.equal(z2.urls.filter(u => u.includes('P6398%20%3Fkey')).length, 0, 'gemerkt');
  // Wikidata gestört: Chart-Spitze bleibt, Modul meldet keinen Fehler (nur Status)
  const z3 = abruf([['P6398%20%3Fkey', '!fehler']]);
  const r3 = await filme(ctx(z3.holeText, {}));
  assert.equal(r3.datei.status.qualitaet.ok, false);
  assert.ok(!r3.fehler.some(f => /Qualität/.test(f)));
  assert.ok(r3.datei.gruppen.fuer399.length >= 4);
});

test('Horror aus der Apple-Beschreibung (echte Texte 14.11.2026): klare Wörter, zwei schwache Zeichen, bildliche Dämonen nicht', () => {
  // echte Apple-Texte (Auszüge): Apple führt sie als „Thriller“ bzw. „Science-Fiction und Fantasy“
  const mids = 'Doch der anfänglich idyllische Eindruck der abgelegenen Gemeinschaft trügt … Sie bereiten sich auf ein besonderes Mittsommer-Ritual vor … nimmt eine unheimliche Wendung, die das sonnengeflutete Paradies bis in die Eingeweide erschüttert.';
  assert.equal(horrorText(mids, 'Thriller'), 2, 'Midsommar: Ritual + unheimlich + Eingeweide');
  assert.equal(horrorText('Mit Evil Dead Burn beginnt ein neues Kapitel dämonischen Chaos bei einem Familientreffen.', 'Science-Fiction und Fantasy'), 3);
  assert.equal(horrorText('Die junge FBI-Agentin Lee Harker entdeckt eine Reihe okkulter Hinweise in einem Serienmörder-Fall.', 'Thriller'), 3, 'Longlegs');
  assert.equal(horrorText('… durch Narben entstellt, verschmort und verstümmelt … die grauenvollen Entdeckungen … entfacht sich eine unnatürliche, bösartige Kraft.', 'Thriller'), 2, 'The Autopsy of Jane Doe');
  // kein Horror
  assert.equal(horrorText('Jane kämpft dabei auch gegen ihre inneren Dämonen, während Paul alles dafür tut, sie zu retten.', 'Action'), 0, 'Survive');
  assert.equal(horrorText('… muss er sich den Dämonen seiner Vergangenheit stellen …', 'Thriller'), 0, 'Shelter');
  assert.equal(horrorText('Die Geisterjäger kämpfen gegen Dämonen in New York.', 'Komödien'), 0, 'Komödie: Geister sind Spaß');
  assert.equal(horrorText('Horror! Während Tess sich nun mit fiesen Lehrern herumschlägt …', 'Science-Fiction und Fantasy'), 0, 'Ausruf');
  assert.equal(horrorText('Captain Barbossa und seine Crew von Untoten …', 'Action'), 1, 'Fluch der Karibik bleibt');
  assert.equal(horrorText('Eine Geschichte über Besessenheit – tödliche Obsession.', 'Thriller'), 1, 'Besessenheit = Obsession, ein Zeichen');
  assert.equal(horrorText(null), 0);
});

test('Ohne Wikidata (gestört): Horror-Verdacht aus der Beschreibung fliegt trotzdem raus, auch auf Platz 1 der Charts', async () => {
  const z = abruf([['P6398%20%3Fkey', '!fehler']]);
  const r = await filme(ctx(async (url, o) => {
    const t = await z.holeText(url, o);
    if (!/rss\/topmovies/.test(url)) return t;
    // Platz 1 jeder Chart-Liste bekommt einen Midsommar-Text
    const j = JSON.parse(t); const e = j?.feed?.entry;
    const erst = Array.isArray(e) ? e[0] : e; // Apple liefert bei einem Eintrag ein Einzelobjekt
    if (erst) erst.summary = { label: 'Ein Mittsommer-Ritual nimmt eine unheimliche Wendung.' };
    return JSON.stringify(j);
  }, {}));
  assert.equal(r.datei.status.qualitaet.ok, false);
  const alle = alleTitel(r.datei).filter(t => t.quelle === 'Apple');
  assert.ok(r.datei.gruppen.fuer399.length >= 1, 'Chart-Spitze ohne Verdacht bleibt');
  const platz1 = alle.filter(t => t.chart === 1 && !/kom(?:ö|oe)die/i.test(t.genre)); // Komödien prüft die Beschreibung nicht
  assert.deepEqual(platz1.map(t => `${t.titel} ${t.genre}`), [], 'Platz 1 mit Horror-Verdacht ist raus');
});

test('main: Kachel-Zusammenfassung der Filme landet in aktuell.json (status.filme.kurz)', async () => {
  const z = abruf(QUALI);
  const r = await lauf({ cfg, wunschliste: {}, filmListen: listen, vorher: null, zustand: {}, holeText: z.holeText, jetzt: JETZT, alle: true });
  assert.ok(r.aktuell.status.filme.kurz.angebote >= 10);
  assert.ok(Array.isArray(r.aktuell.status.filme.kurz.top));
});

test('Prüfer MV8: Horror-Verdacht mit einem schwachen Zeichen, wenn Wikidata den Film nicht kennt (Kraken, Flight 298)', () => {
  // echte Fälle 15.11.2026: „Kraken: Erwachen der Tiefe“ („Alptraum“, Apple: Thriller), „Flight 298“ („unheimliche“, Apple: Sci-Fi)
  assert.equal(horrorText('Was als Forschungsreise beginnt, wird zum Alptraum in der Tiefe.', 'Thriller'), 1);
  assert.equal(horrorVerdacht(1, { l: -1 }), true, 'Wikidata kennt ihn nicht + ein schwaches Zeichen -> raus');
  assert.equal(horrorVerdacht(1, { l: 40, horror: false }), false, 'bekannter Film (Fluch der Karibik: „Untote“) bleibt');
  assert.equal(horrorVerdacht(1, null), false, 'Wikidata gestört: ein Zeichen allein reicht nicht');
  assert.equal(horrorVerdacht(2, null), true);
  assert.equal(horrorVerdacht(2, { l: 30 }), false, 'Wikidata kennt ihn: dort entscheidet das Genre (Serenity)');
  assert.equal(horrorVerdacht(3, { l: 90 }), true);
  assert.equal(horrorVerdacht(0, { l: -1 }), false);
});

test('Prüfer MV8: mydealz-Tipp zu einem Film, der schon als Apple-Titel da ist, zählt nicht doppelt (Flow)', () => {
  assert.equal(doppelTipp('Flow ~ 3,99€ | UHD digital | Apple TV / Amazon Video', ['Charade (1963)', 'Flow']), true);
  assert.equal(doppelTipp('Charade für 3,99 € bei Apple TV', ['Charade (1963)']), true, 'Jahr im Apple-Titel stört nicht');
  assert.equal(doppelTipp('Dead Man ~ 3,99€ | HD digital | Johnny Depp | Apple TV', ['Flow']), false);
  assert.equal(doppelTipp('Up to 5 Filme für 9,99 €', ['Up']), false, 'Set bleibt');
  assert.equal(doppelTipp('Upgrade ~ 3,99€', ['Up']), false, 'nach dem Titel muss ein Trenner folgen');
  assert.equal(doppelTipp('Der Pate Trilogie für 9,99 €', ['Der Pate']), false, 'anderes Angebot (Trilogie)');
});

test('Prüfer MV8: Filmjahr von Wikidata statt Wiederveröffentlichung, Push-Titel ohne zweites Jahr', async () => {
  // Apple liefert „Der Pate“ mit Datum 2008 (Wiederveröffentlichung); Wikidata kennt 1972
  const umbau = (name, datum) => async (url, o) => {
    const t = await abruf(QUALI).holeText(url, o);
    if (!/itunes\.apple\.com/.test(url)) return t;
    return t.replace(/("trackName":")Der Pate(")/g, `$1${name}$2`).replace(/("im:name":\{"label":")Der Pate(")/g, `$1${name}$2`)
      .replace(/(1000000601[^}]*?"releaseDate":")1972-03-24[^"]*/g, '$12008-05-01T07:00:00Z')
      .replace(/("im:releaseDate":\{"label":")1972-03-24T00:00:00-08:00(")/g, '$12008-05-01T00:00:00-07:00$2');
  };
  const r = await filme(ctx(umbau('Der Pate', '2008'), {}));
  const pate = alleTitel(r.datei).find(t => t.id === 'itunes:1000000601');
  assert.ok(pate, 'Der Pate steht auf der Seite');
  assert.equal(pate.jahr, 1972, 'Wikidata-Jahr statt 2008');
  assert.ok(r.datei.gruppen.achtziger.some(t => t.id === 'itunes:1000000601'), 'mit dem echten Jahr ein Klassiker');
  for (const e of r.eintraege.filter(x => /Der Pate/.test(x.titel))) assert.match(e.titel, /^Der Pate \(1972\) für/);
  // Jahr schon im Apple-Titel: kein zweites („Scarface (1983) (1984)“); auch hier gewinnt das Jahr aus dem Titel
  const r2 = await filme(ctx(umbau('Der Pate (1972)', '2008'), {}));
  for (const t of alleTitel(r2.datei).filter(x => x.id === 'itunes:1000000601')) assert.equal(t.titel, 'Der Pate (1972)');
  // Push-Titel (Prüfer-Befund MV8 12): Jahr nur, wenn keins im Titel steht
  assert.equal(filmPushTitel({ titel: 'Charade (1963)', typ: 'film', jahr: 1963, preis: 3.99 }).replace(/\s/g, ' '), 'Charade (1963) für 3,99 €');
  assert.equal(filmPushTitel({ titel: 'Scarface (1983)', typ: 'film', jahr: 1984, preis: 3.99 }).replace(/\s/g, ' '), 'Scarface (1983) für 3,99 €');
  assert.equal(filmPushTitel({ titel: 'Dirty Harry', typ: 'film', jahr: 1971, preis: 3.99 }).replace(/\s/g, ' '), 'Dirty Harry (1971) für 3,99 €');
  assert.equal(filmPushTitel({ titel: 'Rick and Morty, Staffel 2', typ: 'staffel', jahr: 2015, preis: 9.99 }).replace(/\s/g, ' '), 'Rick and Morty, Staffel 2 für 9,99 €');
});

test('Prüfer MV8: Kachel-Zahl zählt nur echte Angebote (kein Normalpreis bis 7,99 € aus Action/Comedy)', async () => {
  const r = await filme(ctx(abruf(QUALI).holeText, {}));
  const g = r.datei.gruppen;
  const normal = [...g.action, ...g.comedy].filter(t => !t.angebot && t.preis > 3.99 && !g.wunsch.some(w => w.id === t.id && w.unterZiel));
  const echt = new Set([...g.fuer399, ...[...g.action, ...g.comedy, ...g.achtziger, ...g.disney, ...g.serien].filter(t => t.angebot || (t.typ === 'film' && t.preis != null && t.preis <= 3.99)), ...g.wunsch.filter(t => t.angebot || t.unterZiel)].map(t => t.id));
  // alte Zahl (bis 15.11.2026) bleibt als angeboteAlle
  assert.equal(r.kurz.angeboteAlle, echt.size);
  for (const t of normal) if (!g.fuer399.some(x => x.id === t.id)) assert.ok(!echt.has(t.id), t.titel);
  // Xander 16.11.2026 („nur die 3,99-€-Sachen, teurere müssen nicht rein“): die Kachel zählt einzelne Apple-Filme bis 3,99 €
  // aus allen Film-Bereichen + deine Wunschfilme unter Ziel – keine Staffeln, Boxen, mydealz-Tipps und nichts über 3,99 €
  const bis = t => t.typ === 'film' && t.preis != null && t.preis <= 3.994 && t.quelle !== 'mydealz';
  const neu = new Set([...[...g.fuer399, ...g.action, ...g.comedy, ...g.achtziger, ...g.disney, ...g.wunsch].filter(bis), ...g.wunsch.filter(t => t.preis != null && t.unterZiel)].map(t => t.id));
  assert.equal(r.kurz.angebote, neu.size);
  assert.ok(r.kurz.fuer399 <= r.kurz.angebote && r.kurz.fuer399 > 0);
  for (const t of r.kurz.top) assert.ok(t.preis <= 3.99 || g.wunsch.some(w => w.titel === t.titel && w.unterZiel), `Kachel: ${t.titel} ${t.preis}`);
});

// ---------------------------------------------------------------- Prüfer-Befund MV8 11 (15.11.2026): keine Kinderfilme unter „Neu“
// Apple-Chart „Kinder & Familie“ (4410) aus Einträgen der Komödien-Charts (gleiche Apple-Nummern): Freakier Friday (neu) und
// Kevin – Allein zu Haus (3,99 €). Wikidata kennt „Das Kanu des Manitu“ als Familienfilm (k). Sonst wie die Übersicht (QUALI).
async function kinderLauf(zustand = {}, jetzt = JETZT, { chart = true, wd = true } = {}) {
  const z = abruf(QUALI);
  const holeText = async (url, o) => {
    if (chart && url.includes('genre=4410/json')) {
      z.urls.push(url);
      const j = JSON.parse(await fix('itunes-rss-komoedie.json'));
      j.feed.entry = [].concat(j.feed.entry).filter(x => ['1800000003', '1000000401'].includes(x?.id?.attributes?.['im:id']))
        .map(x => ({ ...x, category: { attributes: { 'im:id': '4410', label: 'Kinder und Familie' } } }));
      return JSON.stringify(j);
    }
    if (wd && url.includes('P6398%20%3Fkey')) {
      z.urls.push(url);
      const j = JSON.parse(await fix('wikidata-qualitaet.json'));
      j.results.bindings.push({ key: { value: '1800000004' }, weg: { value: 'id' }, item: { value: 'http://www.wikidata.org/entity/Q444' },
        l: { value: '25' }, jahr: { value: '2025' }, k: { value: '1' }, rt: { value: '' }, lab: { value: 'Das Kanu des Manitu' } });
      return JSON.stringify(j);
    }
    return z.holeText(url, o);
  };
  return { r: await filme(ctx(holeText, zustand, jetzt)), z };
}
const quali = z => z.urls.filter(u => u.includes('P6398%20%3Fkey')).length;
const FREAKY = 'itunes:1800000003', KANU = 'itunes:1800000004', KEVIN = 'itunes:1000000401';

test('Prüfer MV8 11: Kinderfilm aus dem Chart „Kinder & Familie“ oder mit Wikidata-Kindergenre nicht unter „Neu“, Erwachsenen-Action bleibt', async () => {
  // ohne Kinder-Zeichen (Kinder-Chart gestört, Wikidata ohne k): beide stehen unter „Neu“ – Gegenprobe
  const { r: r0 } = await kinderLauf({}, JETZT, { chart: false, wd: false });
  const neu0 = r0.datei.gruppen.neu.map(t => t.id);
  assert.ok(neu0.includes(FREAKY) && neu0.includes(KANU), neu0.join(' '));
  assert.equal(r0.datei.status['apple-charts'].kinderNichtNeu, 0);

  const zustand = {};
  const { r } = await kinderLauf(zustand);
  const g = r.datei.gruppen, neu = g.neu.map(t => t.id);
  assert.ok(!neu.includes(FREAKY), 'Freakier Friday steht im Kinder-Chart');
  assert.ok(!neu.includes(KANU), 'Das Kanu des Manitu: Wikidata-Genre Familienfilm');
  for (const id of ['itunes:1800000011', 'itunes:1800000012', 'itunes:1800000021']) assert.ok(neu.includes(id), `Erwachsenen-Film bleibt: ${id}`);
  assert.deepEqual(neu, neu0.filter(id => id !== FREAKY && id !== KANU), 'sonst gleiche Reihenfolge');
  assert.equal(r.datei.status['apple-charts'].kinderNichtNeu, 2);
  // andere Bereiche bleiben wie sie sind: Kevin (Kinder-Chart, 3,99 €) weiter unter „Für 3,99 €“ und „Comedy“
  assert.ok(g.fuer399.some(t => t.id === KEVIN) && g.comedy.some(t => t.id === KEVIN));
  // (Reihenfolge kann sich ändern: Kevin hat im Kinder-Chart einen besseren Chartplatz – wie bisher bei jedem zweiten Chart)
  for (const k of ['fuer399', 'action', 'comedy', 'achtziger', 'disney']) assert.deepEqual(g[k].map(t => t.id).sort(), r0.datei.gruppen[k].map(t => t.id).sort(), k);
  // Flag k im Zustand (wie h): 1 = Kinderfilm, 0 = Wikidata kennt den Film ohne Kindergenre
  assert.equal(zustand.filme.quali['1800000004'].k, 1);
  assert.equal(zustand.filme.quali['1800000014'].k, 0, 'Top Gun: Maverick');
  assert.ok(!('k' in zustand.filme.quali['1800000011']), 'nicht gefunden (l = -1): kein Flag');
});

test('Prüfer MV8 11: Kinder-Erkennung – Chart, Apple-Genre, Wikidata; Abfrage mit Kinder-/Familienfilm; Antwort mit k lesen', () => {
  assert.equal(kinderfilm({ kinderChart: true, genres: ['Action'] }), true, 'Kinder-Chart reicht');
  assert.equal(kinderfilm({ genres: ['Kinder und Familie'] }), true);
  // Prüfer MV10 1: Animation allein ist kein Kinderfilm (Anime, „Felidae“ FSK 16, „Animatrix“, „Kingsglaive“)
  assert.equal(kinderfilm({ genres: [null, 'Animation'] }), false);
  assert.equal(kinderfilm({ genres: ['Anime'] }), false);
  assert.equal(kinderGrund({ kinderChart: 'reihe', genres: ['Action'] }), 'reihe');
  assert.equal(kinderGrund({ kinderChart: true }), 'kinder-chart');
  assert.equal(kinderGrund({ genres: ['Action', 'Kinder und Familie'] }), 'apple-genre');
  assert.equal(kinderGrund({ genres: ['Action'], q: { l: 3, kinder: true } }), 'wikidata');
  assert.equal(kinderGrund({ genres: ['Action'], q: { l: 3, kinder: false } }), null);
  assert.equal(kinderfilm({ genres: ['Action', 'Thriller', null], q: { l: 40, kinder: false } }), false, 'Erwachsenen-Action');
  assert.equal(kinderfilm({ genres: ['Action'], q: { l: 33, kinder: true } }), true, 'Vaiana: Apple sagt Action, Wikidata Familienfilm');
  assert.equal(kinderfilm({ genres: ['Action'], q: { l: 20, kinder: null } }), false, 'alter Zustand ohne k = unbekannt');
  assert.equal(kinderfilm(), false);
  // SPARQL: Genre (P136) oder eine Unterart (P279*) von Kinderfilm oder Familienfilm – nicht Animationsfilm (Prüfer MV10 1);
  // als BIND(IF(EXISTS …)) genau eine Zeile je Film, kein OPTIONAL, das spätere Blöcke vervielfacht (Prüfer MV10 4)
  assert.deepEqual(KINDER_GENRES, ['wd:Q2143665', 'wd:Q1361932']);
  const q = qualiAbfrage([{ nr: '123', name: 'Vaiana' }]);
  for (const qid of ['Q2143665', 'Q1361932']) assert.match(q, new RegExp(`BIND\\(IF\\(EXISTS \\{ \\?item wdt:P136 \\?kg \\. \\?kg wdt:P279\\* \\?kz \\. FILTER\\(\\?kz IN \\([^)]*wd:${qid}[^)]*\\)\\) \\}, 1, 0\\) AS \\?k0\\)`));
  assert.ok(!/OPTIONAL \{ \?item wdt:P136 \?kg/.test(q), 'kein OPTIONAL für Kinder');
  assert.ok(!/\?kz IN \([^)]*Q202866/.test(q), 'Animationsfilm zählt nicht');
  assert.match(q, /\(MAX\(\?k0\) AS \?k\)/);
  assert.match(q, /Q200092/, 'Horror bleibt');
  assert.ok(q.indexOf('?kg') < q.indexOf('wdt:P577'), 'je Film einmal, vor den (vielen) Erscheinungsdaten');
  // Adresse bleibt kurz genug für GET: 15 lange Namen (wie qualiJeAbfrage) mit Umlauten, Kinder-Teil kostet gut 200 Zeichen
  const lang = Array.from({ length: FILM_STANDARD.qualiJeAbfrage }, (_, i) => ({ nr: String(1800000000 + i), name: `Die fabelhafte Überraschung im Märchenwald – Teil ${i} (Extended)`.slice(0, 60) }));
  const url = wikidataUrl(qualiAbfrage(lang));
  const ohne = wikidataUrl(qualiAbfrage(lang).replace(/ \(MAX\(\?k0\) AS \?k\)/, '').replace(/BIND\(IF\(EXISTS \{ \?item wdt:P136 \?kg[^}]*\}, 1, 0\) AS \?k0\) /, ''));
  assert.ok(ohne.length < url.length - 100, 'Kinder-Teil wirklich entfernt');
  assert.ok(url.length - ohne.length < 300, String(url.length - ohne.length));
  assert.ok(url.length < 7000, String(url.length));
  // Antwort: k = 1 -> Kinderfilm; fehlt -> kein Kinderfilm; qualiWahl gibt es weiter
  const zeilen = leseQuali(JSON.stringify({ results: { bindings: [
    { key: { value: '6804104434' }, weg: { value: 'id' }, item: { value: 'http://www.wikidata.org/entity/Q1' }, l: { value: '33' }, k: { value: '1' }, lab: { value: 'Vaiana' } },
    { key: { value: '1880810604' }, weg: { value: 'id' }, item: { value: 'http://www.wikidata.org/entity/Q2' }, l: { value: '47' }, rt: { value: '95%' }, lab: { value: 'Der Astronaut' } },
  ] } }));
  assert.deepEqual(zeilen.map(z => z.kinder), [true, false]);
  assert.equal(qualiWahl(zeilen, { nr: '6804104434', name: 'Vaiana', jahr: 2026 }).kinder, true);
  assert.equal(qualiWahl(zeilen, { nr: '1880810604', name: 'Der Astronaut', jahr: 2026 }).kinder, false);
});

test('Prüfer MV8 11: alter Zustand ohne k läuft – kein Extra-Abruf, k kommt erst mit der regulären Erneuerung (qualiTage)', async () => {
  const zustand = {};
  await kinderLauf(zustand, JETZT, { chart: false });
  for (const q of Object.values(zustand.filme.quali)) delete q.k; // so sah der Zustand vor dem 15.11.2026 aus
  const vorher = JSON.stringify(zustand.filme.quali);
  // nächster Tag: alles noch frisch -> keine Wikidata-Abfrage, Kanu (k unbekannt) bleibt unter „Neu“, kein Fehler
  const { r: r1, z: z1 } = await kinderLauf(zustand, tagPlus(1), { chart: false });
  assert.equal(quali(z1), 0, 'kein Neu-Abfragen erzwungen');
  assert.equal(JSON.stringify(zustand.filme.quali), vorher);
  assert.ok(r1.datei.gruppen.neu.some(t => t.id === KANU), 'unbekannt ist kein Kinderfilm');
  assert.ok(!r1.fehler.some(f => /Qualität|Wikidata/.test(f)));
  // nach qualiTage: reguläre Erneuerung bringt k mit -> Kanu raus
  const { r: r2, z: z2 } = await kinderLauf(zustand, tagPlus(FILM_STANDARD.qualiTage + 1), { chart: false });
  assert.ok(quali(z2) >= 1);
  assert.equal(zustand.filme.quali['1800000004'].k, 1);
  assert.ok(!r2.datei.gruppen.neu.some(t => t.id === KANU));
});

// echtes Kinder-Chart vom 07.11.2026 (Woodwalkers, Schule der magischen Tiere 1–3, Vaiana, Vaiana 2 als „Kinder und Familie“);
// die neuen Teile (echte Apple-Nummern vom 15.11.2026, Datum ungefähr) stehen im Action-Chart, dazu Spider-Man als Gegenprobe.
// kinder = Kinder-Chart antwortet; extraKinder/extraNeu = zusätzliche Einträge [nr, name] im Kinder- bzw. Action-Chart.
const NEUE_TEILE = [['1862821715', 'Woodwalkers 2'], ['1834959566', 'Die Schule der magischen Tiere 4'], ['6804104434', 'Vaiana'], ['6793590242', 'Spider-Man: Brand New Day']];
const KINDER_TEILE = ['Woodwalkers 2', 'Die Schule der magischen Tiere 4', 'Vaiana'];
async function teileLauf(kinder, { zustand = {}, jetzt = JETZT, extraKinder = [], extraNeu = [], filmCfg = {} } = {}) {
  const z = abruf(QUALI);
  const dazu = (j, liste) => {
    const muster = [].concat(j.feed.entry)[0];
    j.feed.entry = [...[].concat(j.feed.entry), ...liste.map(([nr, name]) => ({ ...muster, 'im:name': { label: name },
      id: { label: `https://itunes.apple.com/de/movie/x/id${nr}?uo=2`, attributes: { 'im:id': nr } }, link: [{ attributes: { rel: 'alternate', href: `https://itunes.apple.com/de/movie/x/id${nr}?uo=2` } }],
      summary: { label: `${name}: Beschreibung aus dem Store.` }, 'im:releaseDate': { label: '2026-01-26T00:00:00-08:00' } }))];
    return JSON.stringify(j);
  };
  return filme(ctx(async (url, o) => {
    if (url.includes('genre=4410/json')) {
      if (!kinder) throw new Error('HTTP 503 bei itunes.apple.com');
      return extraKinder.length ? dazu(JSON.parse(await fix(`${ECHT}/itunes-rss-kinder.json`)), extraKinder) : fix(`${ECHT}/itunes-rss-kinder.json`);
    }
    const t = await z.holeText(url, o);
    if (!url.includes('genre=4401/json')) return t;
    return dazu(JSON.parse(t), [...NEUE_TEILE, ...extraNeu]);
  }, zustand, jetzt, { cfg: { ...cfg, module: { ...cfg.module, filme: { ...cfg.module?.filme, ...filmCfg } } } }));
}

test('Prüfer MV8 11: echte Fälle – Woodwalkers 2, Schule der magischen Tiere 4, Vaiana (Apple: „Action“) raus, weil frühere Teile im echten Kinder-Chart stehen', async () => {
  // Reihe = Titel ohne Folgenummer; Untertitel und Jahreszahlen zählen mit
  assert.equal(kinderReihe('Woodwalkers 2'), kinderReihe('Woodwalkers'));
  assert.equal(kinderReihe('Die Schule der magischen Tiere 4'), kinderReihe('Die Schule der magischen Tiere 3'));
  assert.equal(kinderReihe('Vaiana'), kinderReihe('Vaiana 2'));
  assert.equal(kinderReihe('Zurück in die Zukunft Teil II'), kinderReihe('Zurück in die Zukunft'));
  assert.notEqual(kinderReihe('Spider-Man: Brand New Day'), kinderReihe('Spider-Man: A New Universe'));
  assert.notEqual(kinderReihe('Blade Runner 2049'), kinderReihe('Blade Runner'));
  assert.notEqual(kinderReihe('Mortal Kombat II'), kinderReihe('Mortal Kombat Legends: Battle of the Realms'));
  const ohne = (await teileLauf(false)).datei.gruppen.neu.map(t => t.titel);
  for (const [, name] of NEUE_TEILE) assert.ok(ohne.includes(name), `ohne Kinder-Chart (und ohne gemerkte Reihen) unter „Neu“: ${name}`);
  const r = await teileLauf(true);
  const neu = r.datei.gruppen.neu.map(t => t.titel);
  assert.deepEqual(neu, ohne.filter(n => !KINDER_TEILE.includes(n)));
  assert.ok(neu.includes('Spider-Man: Brand New Day') && neu.includes('Mission: Impossible – The Final Reckoning'), 'Erwachsenen-Action bleibt');
  assert.equal(r.datei.status['apple-charts'].kinderNichtNeu, 3);
  assert.deepEqual(r.datei.status['apple-charts'].kinderNichtNeuTitel, KINDER_TEILE.map(n => `${n} (reihe)`).sort((a, b) => ohne.indexOf(a.replace(/ \(reihe\)$/, '')) - ohne.indexOf(b.replace(/ \(reihe\)$/, ''))));
});

test('Prüfer MV10 2: Kinder-Chart gestört – gemerkte Reihen halten die Kinderfilme 3 Tage aus „Neu“ (wie der Chart-Ersatz)', async () => {
  const zustand = {};
  const r0 = await teileLauf(true, { zustand });
  assert.equal(r0.datei.status['apple-charts'].kinderNichtNeu, 3);
  // im Zustand: Reihen aller Kinder-Chart-Titel (auch teure), nicht nur die gemerkten billigen Nummern
  const z = zustand.filme.charts['4410'];
  for (const r of ['woodwalkers', kinderReihe('Die Schule der magischen Tiere 3'), 'vaiana']) assert.ok(z.reihen.includes(r), r);
  assert.ok(z.reihen.length > z.ids.length, `${z.reihen.length} Reihen, ${z.ids.length} Nummern`);
  assert.ok(z.reihen.every(r => typeof r === 'string' && r), 'keine leere Reihe');
  assert.ok(JSON.stringify(z.reihen).length < 4000, 'klein genug für den Zustand');
  // Tag 1 und 3: Kinder-Chart antwortet nicht -> Ersatz aus dem Zustand, die drei bleiben draußen, Spider-Man bleibt drin
  for (const tage of [1, 3]) {
    const r = await teileLauf(false, { zustand, jetzt: tagPlus(tage) });
    const neu = r.datei.gruppen.neu.map(t => t.titel);
    for (const n of KINDER_TEILE) assert.ok(!neu.includes(n), `Tag ${tage}: ${n}`);
    assert.ok(neu.includes('Spider-Man: Brand New Day'));
    assert.equal(r.datei.status['apple-charts'].kinderNichtNeu, 3, `Tag ${tage}`);
    assert.ok(r.datei.status['apple-charts'].fehler.some(f => /4410|Kinder/.test(f)), 'Störung wird gemeldet');
  }
  // nach mehr als 3 Tagen gilt der alte Stand nicht mehr (wie bei allen Charts)
  const r4 = await teileLauf(false, { zustand, jetzt: tagPlus(4) });
  for (const n of KINDER_TEILE) assert.ok(r4.datei.gruppen.neu.some(t => t.titel === n), `Tag 4: ${n} wieder da`);
  // alter Zustand ohne Reihen (vor dieser Fassung): läuft wie bisher, kein Fehler
  const altZ = {};
  await teileLauf(true, { zustand: altZ });
  delete altZ.filme.charts['4410'].reihen;
  const ra = await teileLauf(false, { zustand: altZ, jetzt: tagPlus(1) });
  assert.ok(ra.datei.gruppen.neu.some(t => t.titel === 'Woodwalkers 2'));
});

test('Prüfer MV10 3/6: leere Reihe zählt nicht; kinderNichtNeu zählt nur, was sonst zu sehen gewesen wäre', async () => {
  // Titel ohne lateinische Buchstaben ergeben eine leere Reihe – darf nicht alle solchen Neu-Titel zum Kinderfilm machen
  assert.equal(kinderReihe('名探偵コナン'), '');
  const r = await teileLauf(true, { extraKinder: [['1900000001', '名探偵コナン']], extraNeu: [['1900000002', 'ドライブ・マイ・カー']] });
  const neu = r.datei.gruppen.neu.map(t => t.titel);
  assert.ok(neu.includes('ドライブ・マイ・カー'), neu.join(' · '));
  for (const n of KINDER_TEILE) assert.ok(!neu.includes(n), n);
  // gezählt wird nach maxNeu und Qualitätsfilter: maxNeu 4 zeigt ohne Regel 3 Erwachsenenfilme (einer fällt durch die
  // Qualität) -> 0, nicht 3; maxNeu 7 zeigte Woodwalkers 2 als einzigen Kinderfilm -> 1
  const ohne4 = (await teileLauf(false, { filmCfg: { maxNeu: 4 } })).datei.gruppen.neu.map(t => t.titel);
  assert.ok(ohne4.length >= 2 && !ohne4.some(n => KINDER_TEILE.includes(n)), ohne4.join(' · '));
  const r4 = await teileLauf(true, { filmCfg: { maxNeu: 4 } });
  assert.equal(r4.datei.status['apple-charts'].kinderNichtNeu, 0);
  assert.deepEqual(r4.datei.status['apple-charts'].kinderNichtNeuTitel, []);
  const ohne7 = (await teileLauf(false, { filmCfg: { maxNeu: 7 } })).datei.gruppen.neu.map(t => t.titel);
  assert.deepEqual(ohne7.filter(n => KINDER_TEILE.includes(n)), ['Woodwalkers 2']);
  const r7 = await teileLauf(true, { filmCfg: { maxNeu: 7 } });
  assert.equal(r7.datei.status['apple-charts'].kinderNichtNeu, 1);
  assert.deepEqual(r7.datei.status['apple-charts'].kinderNichtNeuTitel, ['Woodwalkers 2 (reihe)']);
});

// ---------------------------------------------------------------- Boxen, alle Serien, Knüller (Xander 15.11.2026)

test('Boxen: Film-Lookup nennt die Box (echte Antwort), der Box-Preis darin ist nur der Filmpreis und wird nie genommen', async () => {
  const [film] = await ergebnisse('itunes-lookup-box-film.json');
  assert.deepEqual(boxVon(film), { id: 'itunes:1652491062', name: 'Indiana Jones 4-Movie Collection', filme: 4 });
  const d = ausItunes(film);
  assert.equal(d.typ, 'film');
  assert.equal(d.id, 'itunes:733230994');
  assert.deepEqual(d.box, { id: 'itunes:1652491062', name: 'Indiana Jones 4-Movie Collection', filme: 4 });
  assert.equal(d.preisHd, 9.99, 'Filmpreis');
  // Einzelfilm ohne Box, „Box“ mit 1 Film, collectionId = trackId -> keine Box
  assert.equal(boxVon({ ...film, collectionId: undefined }), null);
  assert.equal(boxVon({ ...film, trackCount: 1 }), null);
  assert.equal(boxVon({ ...film, collectionId: film.trackId }), null);
  // Box-Lookup (Format angenommen, bis ein Roh-Lauf es zeigt): collection, keine Staffel
  const [box] = await ergebnisse('itunes-lookup-box.json');
  const b = ausItunes(box);
  assert.deepEqual([b.typ, b.id, b.filme, b.preisHd], ['box', 'itunes:1652491062', 4, 29.99]);
  assert.equal(ausItunes({ ...box, collectionType: 'Album' }), null, 'Musik-Album ist keine Film-Box');
  assert.equal(lookupUrl(['itunes:1652491062']), 'https://itunes.apple.com/lookup?id=1652491062&country=de');
  assert.equal(serienChartUrl(null), 'https://itunes.apple.com/de/rss/toptvseasons/limit=100/json');
});

test('Komplett-Boxen von Serien: „Die komplette Serie“, „The Complete Series“, „Staffeln 1-7“ – Staffel ohne Nummer', () => {
  assert.deepEqual(komplettInfo('Rick and Morty – Die komplette Serie'), { serie: 'Rick and Morty', nr: null, zusatz: 'komplett' });
  assert.deepEqual(komplettInfo('Star Trek: The Next Generation: The Complete Series'), { serie: 'Star Trek: The Next Generation', nr: null, zusatz: 'komplett' });
  assert.equal(komplettInfo('Breaking Bad, Staffeln 1-5').serie, 'Breaking Bad');
  assert.equal(komplettInfo('Rick and Morty, Staffel 2'), null);
  const d = ausItunes({ wrapperType: 'collection', collectionType: 'TV Season', collectionId: 5, collectionName: 'Futurama, Die komplette Serie', collectionPrice: 49.99, artistName: 'Futurama' });
  assert.deepEqual([d.typ, d.komplett, d.kuenstler], ['staffel', true, 'Futurama']);
});

test('Knüller-Regel: nur mit echtem Grund aus der eigenen Historie (≥ 30 % unter üblich nach ≥ 7 Tagen, frischer Tiefstpreis nach ≥ 14 Tagen, Box ≤ 2,50 € je Film, Staffel ≤ 9,99 € gesenkt)', () => {
  const tage = (start, liste) => { const zf = {}; let r; liste.forEach((p, i) => { r = merkeFilmPreis(zf, 'x', p, tagMinusTest(start, -i)); }); return r.v; };
  const lage = (v, p, t, typ = 'film') => ({ ...preisLage(v, p, t, { typ }), seit: v.seit });
  // 1) 8 Tage 19,99 €, dann 12,99 € (35 % weniger) -> Knüller
  let v = tage('2026-11-07', [...Array(8).fill(19.99), 12.99]);
  let b = bewerte(v, 12.99, '2026-11-15', lage(v, 12.99, '2026-11-15'));
  assert.equal(ueblichPreis(v, '2026-11-15'), 19.99);
  assert.deepEqual(b.ersparnis, { eur: 7, pct: 35, basis: 'üblich' });
  assert.equal(b.ueblich, 19.99);
  assert.equal(b.ueberTiefst, 0);
  assert.ok(b.nieSoGuenstig);
  assert.match(b.knueller.grund, /35 % unter dem üblichen Preis/);
  // 2) nur 20 % weniger -> kein Knüller (aber Ersparnis sichtbar)
  v = tage('2026-11-07', [...Array(8).fill(9.99), 7.99]);
  b = bewerte(v, 7.99, '2026-11-15', lage(v, 7.99, '2026-11-15'));
  assert.deepEqual([b.ersparnis.pct, b.knueller], [20, null]);
  // 3) zu kurz beobachtet (3 Tage): kein üblicher Preis, kein „so günstig wie nie“, kein Knüller trotz 50 %
  v = tage('2026-11-13', [19.99, 19.99, 9.99]);
  b = bewerte(v, 9.99, '2026-11-15', lage(v, 9.99, '2026-11-15'));
  assert.deepEqual([b.ueblich, b.ersparnis.basis, b.nieSoGuenstig, b.knueller], [null, 'zuletzt', false, null]);
  // 4) Staffel gesenkt auf 9,99 € -> Knüller auch nach kurzer Zeit (Regel wie der bisherige Serien-Push)
  b = bewerte(v, 9.99, '2026-11-15', lage(v, 9.99, '2026-11-15', 'staffel'), { typ: 'staffel' });
  assert.match(b.knueller.grund, /Staffel gesenkt auf 9,99/);
  // 5) Box: 4 Filme, gesenkt 14,99 -> 9,99 € = 2,50 € je Film -> Knüller; ungesenkt 9,99 € -> keiner
  v = tage('2026-11-13', [14.99, 14.99, 9.99]);
  b = bewerte(v, 9.99, '2026-11-15', lage(v, 9.99, '2026-11-15', 'box'), { typ: 'box', filme: 4 });
  assert.deepEqual([b.jeFilm, !!b.knueller], [2.5, true]);
  v = tage('2026-11-13', [9.99, 9.99, 9.99]);
  b = bewerte(v, 9.99, '2026-11-15', lage(v, 9.99, '2026-11-15', 'box'), { typ: 'box', filme: 4 });
  assert.deepEqual([b.jeFilm, b.knueller, b.ersparnis], [2.5, null, null]);
  // 6) Tiefstpreis schon lange (seit 20 Tagen dauerhaft) -> der Preis ist jetzt der übliche: kein „so günstig wie nie“, kein Knüller,
  //    ueblich = heutiger Preis (die Seite zeigt dann kein „statt“)
  v = tage('2026-10-17', [19.99, 19.99, 19.99, 19.99, 19.99, 19.99, 19.99, 19.99, 19.99, 19.99, ...Array(20).fill(14.99)]);
  b = bewerte(v, 14.99, '2026-11-15', lage(v, 14.99, '2026-11-15'));
  assert.deepEqual([b.nieSoGuenstig, b.knueller, b.ueblich, b.ersparnis, b.guenstig], [false, null, 14.99, null, false], 'der Preis gilt jetzt als üblich');
  // 7) über dem Tiefst: x € über Tiefst
  v = tage('2026-11-01', [9.99, 9.99, 4.99, ...Array(12).fill(7.99)]);
  b = bewerte(v, 7.99, '2026-11-15', lage(v, 7.99, '2026-11-15'));
  assert.deepEqual([b.ueberTiefst, b.nieSoGuenstig], [3, false]);
  assert.deepEqual(bewerte(v, null, '2026-11-15', lage(v, null, '2026-11-15')).knueller, null);
});

test('Allzeit-Tiefst von außen nur vollständig mit Quelle und https-Link (heute keine erlaubte Quelle -> null)', () => {
  assert.equal(externTiefst(null), null);
  assert.equal(externTiefst({ p: 4.99, tag: '2024-12-24' }), null, 'ohne Quelle');
  assert.equal(externTiefst({ p: 4.99, tag: '2024-12-24', quelle: 'X', url: 'http://x.de' }), null, 'ohne https');
  assert.deepEqual(externTiefst({ p: '4,99', tag: '2024-12-24', quelle: 'Beispielquelle', url: 'https://example.org/p/1' }), { p: 4.99, tag: '2024-12-24', quelle: 'Beispielquelle', url: 'https://example.org/p/1' });
});

// Mehr-Lauf-Abruf: Mallrats liegt (Testwert) in einer Box, Box- und Staffel-Preis je Lauf frei wählbar
const BOX = 1700000100, STAFFEL = 1700000001;
function boxAbruf({ box = 29.99, staffel = 19.99, boxFehler = false } = {}) {
  const z = abruf([['/rss/toptvseasons/', 'itunes-rss-tvseasons.json']]);
  const roh = z.holeText;
  z.holeText = async url => {
    if (url.includes('lookup?') && url.includes(String(BOX))) {
      z.urls.push(url);
      if (boxFehler) throw new Error('HTTP 503 bei itunes.apple.com');
      const j = JSON.parse(await fix('itunes-lookup-box.json'));
      Object.assign(j.results[0], { collectionId: BOX, collectionName: 'Testbox 4 Filme', collectionPrice: box, collectionHdPrice: box });
      return JSON.stringify(j);
    }
    if (url.includes('lookup?') && url.includes(String(STAFFEL))) {
      z.urls.push(url);
      const j = JSON.parse(await fix('itunes-lookup-staffel-pool.json'));
      Object.assign(j.results[0], { collectionPrice: staffel, collectionHdPrice: staffel });
      return JSON.stringify(j);
    }
    const text = await roh(url);
    if (!/itunes\.apple\.com\/(search|lookup)\?/.test(url) || !text.includes('286617745')) return text;
    const j = JSON.parse(text);
    for (const r of j.results || []) if (r.trackId === 286617745) Object.assign(r, { collectionId: BOX, collectionName: 'Testbox 4 Filme', trackCount: 4, collectionPrice: r.trackPrice, collectionHdPrice: r.trackHdPrice });
    return JSON.stringify(j);
  };
  return z;
}

test('Boxen und alle Serien über mehrere Läufe: Entdeckung ohne Extra-Abruf, Preis nur aus dem Box-Lookup, Knüller zuerst, Push nur Tageszusammenfassung', async () => {
  const zustand = {};
  let r, z;
  // Lauf 1: Box-Lookup gestört -> Box bekannt, aber ohne Preis (der Spiegelpreis aus dem Film-Datensatz zählt nicht)
  z = boxAbruf({ boxFehler: true });
  r = await filme(ctx(z.holeText, zustand, tagPlus(0)));
  assert.equal(zustand.filme.boxen[`itunes:${BOX}`].n, 'Testbox 4 Filme');
  assert.deepEqual(zustand.filme.boxen[`itunes:${BOX}`].filmIds, ['itunes:286617745']);
  assert.equal(zustand.filme.preise[`itunes:${BOX}`], undefined, 'kein Box-Preis aus dem Film-Datensatz');
  assert.deepEqual(r.datei.gruppen.boxen.filter(t => t.quelle === 'Apple'), []);
  assert.equal(r.datei.status['apple-boxen'].ok, false);
  // Läufe 2–8: Normalpreis 29,99 € (7,50 € je Film) -> nicht unter „Boxen“; Staffel der fremden Serie 19,99 € -> nicht unter „Serien“
  for (let i = 1; i < 8; i++) { z = boxAbruf(); r = await filme(ctx(z.holeText, zustand, tagPlus(i))); }
  assert.deepEqual(r.datei.gruppen.boxen.filter(t => t.quelle === 'Apple'), []);
  assert.ok(!r.datei.gruppen.serien.some(t => /Testserie/.test(t.titel)));
  assert.ok(z.urls.filter(u => u.includes(String(BOX))).length <= FILM_STANDARD.boxAbrufe);
  assert.ok(z.apple() <= FILM_STANDARD.maxAppleAbrufe, `Apple-Abrufe ${z.apple()}`);
  assert.ok(r.datei.gruppen.serien.length && r.datei.gruppen.serien.every(t => t.wunsch === true), 'nur deine Serien');
  // Lauf 9: Box 14,99 €, Staffel 9,99 €
  z = boxAbruf({ box: 14.99, staffel: 9.99 });
  r = await filme(ctx(z.holeText, zustand, tagPlus(8)));
  const box = r.datei.gruppen.boxen.find(t => t.id === `itunes:${BOX}`);
  assert.deepEqual([box.typ, box.preis, box.vorher, box.ueblich, box.filme, box.jeFilm, box.tiefstQuelle, box.extern, box.seit],
    ['box', 14.99, 29.99, 29.99, 4, 3.75, 'eigen', null, '2026-11-08']);
  assert.deepEqual(box.ersparnis, { eur: 15, pct: 50, basis: 'üblich' });
  assert.match(box.knueller.grund, /50 % unter dem üblichen Preis/);
  assert.equal(r.datei.gruppen.boxen[0].id, box.id, 'Knüller zuerst');
  const se = r.datei.gruppen.serien;
  const fremd = se.find(t => /Testserie, Staffel 1/.test(t.titel));
  assert.deepEqual([fremd.wunsch, fremd.preis, fremd.vorher, fremd.serie, fremd.nr, !!fremd.knueller], [false, 9.99, 19.99, 'Testserie', 1, true]);
  assert.ok(se.findIndex(t => t.wunsch === false) > se.findLastIndex(t => t.wunsch === true), 'deine Serien oben');
  const eBox = r.eintraege.find(e => e.extra?.filmId === box.id);
  assert.deepEqual([eBox?.sofort, eBox?.extra.gruppe], [false, 'boxen'], 'Box-Knüller nur in die Tageszusammenfassung');
  const eSt = r.eintraege.find(e => e.extra?.filmId === fremd.id);
  assert.deepEqual([eSt?.sofort, eSt?.extra.gruppe], [false, 'serien']);
  assert.ok(r.datei.kurz.angebote >= 2);
  assert.match(r.datei.hinweis, /kein Allzeit-Tiefst/);
  // alter Zustand ohne boxen/staffelPool und alte Titel ohne neue Felder: Lauf geht, nichts bricht
  const altZ = JSON.parse(JSON.stringify(zustand));
  delete altZ.filme.boxen; delete altZ.filme.staffelPool;
  r = await filme(ctx(boxAbruf().holeText, altZ, tagPlus(9)));
  assert.ok(Array.isArray(r.datei.gruppen.boxen));
});

test('Prüfer 15.11.: Knüller nie nach einem Kurz-Hoch, nie bei −5 %, nicht ewig; große Boxen brauchen eine echte Senkung', () => {
  const zfVon = (start, liste) => { const zf = {}; liste.forEach(([i, p]) => merkeFilmPreis(zf, 'x', p, tagMinusTest(start, -i))); return zf.preise.x; };
  const tage = (start, liste) => zfVon(start, liste.map((p, i) => [i, p]));
  const lage = (v, p, t, typ = 'film') => ({ ...preisLage(v, p, t, { typ }), seit: v.seit });
  const bw = (v, p, t, typ, filme = null) => bewerte(v, p, t, lage(v, p, t, typ), { typ, filme });
  // echte Historie aus zustand.json (itunes:1861874876): 08.11. 7,99 · 13.11. 13,99 · 15.11. 9,99 -> weder als Staffel noch als Box Knüller
  const echt = { h: [['2026-11-08', 7.99], ['2026-11-13', 13.99], ['2026-11-15', 9.99]], tiefst: { p: 7.99, tag: '2026-11-08' }, seit: '2026-11-08', zuletzt: '2026-11-15' };
  for (const [typ, filme] of [['staffel', null], ['box', 4], ['film', null]]) {
    const b = bw(echt, 9.99, '2026-11-15', typ, filme);
    assert.deepEqual([b.knueller, b.ueblich, b.ueberTiefst, b.ersparnis, b.nieSoGuenstig, b.guenstig], [null, 7.99, 2, null, false, false], typ);
  }
  // A) 20 Tage 9,99, ein Tag 12,99, wieder 9,99 -> kein Knüller, kein „statt 12,99“ (ueblich = 9,99), nicht „so günstig wie nie“
  let v = tage('2026-10-25', [...Array(20).fill(9.99), 12.99, 9.99]);
  let b = bw(v, 9.99, '2026-11-15', 'staffel');
  assert.deepEqual([b.knueller, b.ueblich, b.ersparnis, b.nieSoGuenstig], [null, 9.99, null, false]);
  // B) Dauer-Senkung: 10 Tage 19,99, dann 61 Tage 9,99 -> am 16.01.2027 kein Knüller, keine Ersparnis mehr
  v = tage('2026-11-06', [...Array(10).fill(19.99), ...Array(61).fill(9.99)]);
  b = bw(v, 9.99, '2027-01-15', 'staffel');
  assert.deepEqual([b.knueller, b.ersparnis, b.ueblich, b.guenstig], [null, null, 9.99, false]);
  // D) Box 4 Filme 29,99 -> 9,99 dauerhaft (91 Tage) -> kein Knüller mehr
  v = tage('2026-11-06', [...Array(3).fill(29.99), ...Array(91).fill(9.99)]);
  b = bw(v, 9.99, tagMinusTest('2026-11-06', -93), 'box', 4);
  assert.equal(b.knueller, null);
  // aber frisch: Box 29,99 (10 Tage) -> 9,99 heute = Knüller; nach 14 Tagen mit 9,99 (Senkung nicht mehr frisch, aber noch unter üblich): Regel 1
  v = tage('2026-11-01', [...Array(10).fill(29.99), 9.99]);
  assert.ok(bw(v, 9.99, '2026-11-11', 'box', 4).knueller);
  // C) große Box: 50 Filme 99,99 -> 94,99 (−5 %) -> kein Knüller trotz 1,90 € je Film
  v = tage('2026-11-01', [...Array(10).fill(99.99), 94.99]);
  b = bw(v, 94.99, '2026-11-11', 'box', 50);
  assert.deepEqual([b.jeFilm, b.ersparnis.pct, b.knueller, b.guenstig], [1.9, 5, null, false]);
  // −5 % / −9 %: Staffel 9,99 -> 9,49, 10,99 -> 9,99; Box 10,49 -> 9,99 -> kein Knüller
  v = zfVon('2026-11-01', [[0, 9.99], [11, 9.49]]);
  assert.equal(bw(v, 9.49, '2026-11-12', 'staffel').knueller, null);
  v = zfVon('2026-11-01', [[0, 10.99], [11, 9.99]]);
  assert.equal(bw(v, 9.99, '2026-11-12', 'staffel').knueller, null);
  v = zfVon('2026-11-01', [[0, 10.49], [11, 9.99]]);
  assert.equal(bw(v, 9.99, '2026-11-12', 'box', 4).knueller, null);
  // J/K) große, frische Senkung schon am 2. Tag (noch ohne üblichen Preis, aber auf den niedrigsten bisher gesehenen): Knüller
  v = tage('2026-11-15', [29.99, 9.99]);
  assert.match(bw(v, 9.99, '2026-11-16', 'box', 4).knueller.grund, /2,50\s€ je Film/);
  v = tage('2026-11-15', [12.99, 9.99]);
  assert.match(bw(v, 9.99, '2026-11-16', 'staffel').knueller.grund, /Staffel gesenkt auf 9,99/);
  // … aber nicht, wenn der Preis nur von einem Hoch zurückfällt (noch ohne üblichen): 7,99 -> 13,99 -> 9,99 in 3 Tagen
  v = tage('2026-11-13', [7.99, 13.99, 9.99]);
  assert.equal(bw(v, 9.99, '2026-11-15', 'staffel').knueller, null);
});

test('Prüfer 15.11.: Boxen/Staffeln aus fremden Stores nicht übernehmen; Push-Zeile „Tiefst seit …“ und „statt“ = üblicher Preis', () => {
  assert.equal(fremdStore({ country: 'DEU', currency: 'EUR', collectionViewUrl: 'https://itunes.apple.com/de/movie-collection/x/id1' }), false);
  assert.equal(fremdStore({ country: 'FRA', currency: 'EUR' }), true, 'Shrek Coffret 6 Films');
  assert.equal(fremdStore({ currency: 'JPY' }), true);
  assert.equal(fremdStore({ collectionViewUrl: 'https://itunes.apple.com/th/movie-collection/x/id1' }), true);
  assert.equal(fremdStore({ wrapperType: 'collection' }), false, 'ohne Angaben: nicht ablehnen');
  assert.equal(monatJahr('2026-11-07'), 'Nov. 2026');
});

test('Prüfer 15.11.: neu entdeckte Staffel ehrlich ohne Vergleich, Staffel deiner Serie aus den Charts bei deiner Serie, Box aus fremdem Store nicht', async () => {
  const umbau = (z, f) => { const roh = z.holeText; z.holeText = async url => f(url, await roh(url)); return z; };
  // 1) Testserie erstmals gesehen, gerade in den Charts, 9,99 € -> „neu entdeckt“ (kein Angebot, kein Knüller)
  let r = await filme(ctx(boxAbruf({ staffel: 9.99 }).holeText, {}, tagPlus(0)));
  const neu = r.datei.gruppen.serien.find(t => /Testserie/.test(t.titel));
  assert.deepEqual([neu?.wunsch, neu?.neuEntdeckt, neu?.angebot, neu?.knueller], [false, true, false, null]);
  assert.equal(r.datei.status['apple-serien'].neuEntdeckt, 1);
  // … 19,99 € beim ersten Fund: nicht zeigen
  r = await filme(ctx(boxAbruf({ staffel: 19.99 }).holeText, {}, tagPlus(0)));
  assert.ok(!r.datei.gruppen.serien.some(t => /Testserie/.test(t.titel)));
  // 2) dieselbe Staffel heißt „Star Trek: Deep Space Nine, Staffel 7“ (steht in deiner Liste) -> bei deiner Serie, nicht unter „Weitere“
  const ds9 = umbau(boxAbruf({ staffel: 19.99 }), (url, text) => url.includes(String(STAFFEL)) && url.includes('lookup?')
    ? text.replace(/"artistName": ?"Testserie"/, '"artistName":"Star Trek: Deep Space Nine"').replace(/Testserie, Staffel 1/g, 'Star Trek: Deep Space Nine, Staffel 7') : text);
  r = await filme(ctx(ds9.holeText, {}, tagPlus(0)));
  const t7 = r.datei.gruppen.serien.find(t => t.id === `itunes:${STAFFEL}`);
  assert.deepEqual([t7?.wunsch, t7?.serie, t7?.nr], [true, 'Star Trek: Deep Space Nine', 7]);
  assert.equal(r.datei.status['apple-serien'].deineAusCharts, 1);
  // 3) Box aus einem fremden Store (country FRA) -> nichts übernehmen, im Status gezählt
  const fra = umbau(boxAbruf({ box: 9.99 }), (url, text) => url.includes(String(BOX)) && url.includes('lookup?') ? text.replace('"DEU"', '"FRA"') : text);
  const zustand = {};
  r = await filme(ctx(fra.holeText, zustand, tagPlus(0)));
  assert.equal(r.datei.status['apple-boxen'].fremdLand, 1);
  assert.equal(zustand.filme.preise[`itunes:${BOX}`], undefined);
});

test('Prüfer 15.11.: Box ohne Senkung (je Film günstig) nicht „im Angebot“, gleich benannte Boxen nur einmal', async () => {
  const zustand = {};
  let r;
  for (let i = 0; i < 9; i++) r = await filme(ctx(boxAbruf({ box: 7.99 }).holeText, zustand, tagPlus(i))); // 2,00 € je Film, nie gesenkt
  assert.deepEqual(r.datei.gruppen.boxen.filter(t => t.quelle === 'Apple'), []);
  // zweite Box gleichen Namens, teurer -> nur die günstigere
  const z = boxAbruf({ box: 14.99 });
  const roh = z.holeText;
  z.holeText = async url => {
    const text = await roh(url);
    if (!url.includes('lookup?') || !url.includes(String(BOX))) return text;
    const j = JSON.parse(text);
    j.results.push({ ...j.results[0], collectionId: BOX + 1, collectionPrice: 19.99, collectionHdPrice: 19.99 });
    return JSON.stringify(j);
  };
  zustand.filme.boxen[`itunes:${BOX + 1}`] = { n: 'Testbox 4 Filme', filme: 4, seit: '2026-11-07', tag: '2026-11-15', filmIds: [] };
  zustand.filme.preise[`itunes:${BOX + 1}`] = { h: [['2026-11-07', 39.99]], tiefst: { p: 39.99, tag: '2026-11-07' }, seit: '2026-11-07', zuletzt: '2026-11-14' };
  for (let i = 0; i < 9; i++) zustand.filme.preise[`itunes:${BOX}`].h = [['2026-11-07', 29.99]];
  zustand.filme.preise[`itunes:${BOX}`].tiefst = { p: 29.99, tag: '2026-11-07' };
  r = await filme(ctx(z.holeText, zustand, tagPlus(9)));
  const boxen = r.datei.gruppen.boxen.filter(t => t.quelle === 'Apple');
  assert.deepEqual(boxen.map(t => [t.id, t.preis]), [[`itunes:${BOX}`, 14.99]]);
});

test('mydealz-Box-Tipps: „statt“ aus dem Text oder Vergleichspreis der Deal-Seite, sonst ohne (Xander 16.11.2026: echte Reduktion)', async () => {
  const z = abruf([
    ['rss/gruppe/apple-tv', 'mydealz-boxen.xml'],
    ['rss/gruppe/filme-serien', 'mydealz-boxen.xml'],
    ['itunes-mission-impossible-collection-2879002', 'mydealz-deal-box.html'],
    ['itunes-rambo-collection-2879003', '!fehler'],
  ]);
  const r = await filme(ctx(z.holeText, {}));
  const boxen = r.datei.gruppen.boxen.filter(t => t.quelle === 'mydealz');
  const b = n => boxen.find(t => t.titel.includes(n));
  // Text: „14,99 € statt 39,99 €“ -> −63 %, ohne Abruf der Deal-Seite
  assert.equal(b('Indiana').vorher, 39.99);
  assert.deepEqual(b('Indiana').ersparnis, { eur: 25, pct: 63 });
  assert.ok(!z.urls.some(u => u.includes('2879001')));
  // Deal-Seite: nextBestPrice 49,99 € -> −60 %
  assert.equal(b('Mission').vorher, 49.99);
  assert.equal(b('Mission').ersparnis.pct, 60);
  // Deal-Seite gestört -> kein „statt“ (die Seite zeigt den Tipp unter „ohne Vergleichspreis“)
  assert.equal(b('Rambo').vorher, null);
  assert.equal(b('Rambo').ersparnis, undefined);
  // interne Hilfsfelder nicht in der Datei
  assert.ok(!boxen.some(t => '_text' in t));
});

// ---------------------------------------------------------------- Apple-Sammlung „Filme für 3,99 €“ (Xander 16.11.2026)
test('Apple TV: Räume selbst finden – echte Startseite (Roh-Lauf 43793546633), Sammlungs-Links, Groß/klein der Nummer', async () => {
  const { raumLinks } = await import('../lib/appletv.mjs');
  const l = raumLinks(await fix('appletv-start-echt.html'));
  assert.equal(l.length, 16, l.map(x => x.slug).join(' '));
  assert.ok(l.every(x => !x.angebot), 'Stand 16.11.: auf tv.apple.com nur Apple-TV+-Räume, kein Angebotsraum');
  assert.ok(l.some(x => x.url === 'https://tv.apple.com/de/collection/top10-filme/uts.col.ChartsMovies.tvs.sbd.4000'), 'Sammlung, Nummer in Apples Schreibweise');
  assert.ok(l.some(x => x.url === 'https://tv.apple.com/de/room/filme/uts.room.movies-on-apple-tv'));
  // eine neue Aktions-Sammlung wird am Namen erkannt, egal unter welcher Adresse
  const neu = raumLinks('{"title":"Filme für 3,99 €","url":"https:\\/\\/tv.apple.com\\/de\\/collection\\/aktion\\/edt.col.12345678-aaaa-bbbb-cccc-1234567890ab"}');
  assert.deepEqual(neu.map(x => [x.angebot, x.url]), [[true, 'https://tv.apple.com/de/collection/aktion/edt.col.12345678-aaaa-bbbb-cccc-1234567890ab']]);
});

test('Chip „Für 3,99 €“: Apples Sammlung zuerst – alle Filme aus dem Raum mit Preis im Namen, Titel wie bei Apple, keine Doppelten', async () => {
  const r = await filme(ctx(abruf().holeText));
  const st = r.datei.status['apple-tv-raeume'];
  assert.ok(st.gesehen >= 1, JSON.stringify(st));
  const f = r.datei.gruppen.fuer399;
  const amelie = f.find(t => t.titel === 'Die fabelhafte Welt der Amélie');
  assert.ok(amelie, f.map(t => t.titel).join(' | '));
  assert.equal(amelie.preis, 3.99);
  assert.equal(amelie.raum, 'Filme für 3,99 €');
  assert.equal(amelie.quelle, 'Apple');
  const ausRaum = f.filter(t => t.raum);
  assert.ok(ausRaum.length >= 5, ausRaum.map(t => t.titel).join(' | '));
  assert.ok(f.findIndex(t => !t.raum) === -1 || f.findIndex(t => !t.raum) >= ausRaum.length, 'Sammlung steht vorn');
  assert.equal(new Set(f.map(t => t.id)).size, f.length, 'keine Doppelten');
  assert.equal(f.filter(t => /trabi/i.test(t.titel)).length, 1, 'Go Trabi Go nur einmal');
});
