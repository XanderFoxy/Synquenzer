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
} from '../module/filme.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const listen = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
const fix = async n => readFile(join(FIX, n), 'utf8');
const ergebnisse = async n => leseErgebnisse(await fix(n));
const JETZT = new Date('2026-11-07T12:00:00Z');
const tagPlus = n => new Date(JETZT.getTime() + n * 864e5);

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
  assert.deepEqual(Object.keys(d.gruppen), ['wunsch', 'angebot', 'neu', 'achtziger', 'serien', 'disney']);
  assert.match(d.hinweis, /Tiefstpreis/);
  for (const [q, s] of Object.entries(d.status)) assert.ok(typeof s.ok === 'boolean' && Number.isInteger(s.anzahl) && Array.isArray(s.fehler), q);
  const zahlOderNull = v => v === null || (typeof v === 'number' && v > 0);
  for (const t of alleTitel(d)) {
    assert.match(t.id, /^(itunes:\d+|wunsch:[a-z0-9-]+|mydealz:.+|appletv:umc\.cmc\.[a-z0-9]+)$/, t.titel);
    assert.ok(['film', 'staffel'].includes(t.typ));
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
  assert.ok(se.every(t => t.typ === 'staffel' && t.serie && Number.isInteger(t.nr)));
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
    delete zz.lauf.filme; zz.filme = {}; zz.gemeldet = { alt: '2026-11-01T00:00:00Z' }; zz.sofortTage = {};
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
  assert.equal(r.datei.gruppen.achtziger[0].preis, 9.99, 'Preis aus dem Chart-Feed (nicht im Lookup)');
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
