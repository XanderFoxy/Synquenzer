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
    assert.match(t.id, /^(itunes:\d+|wunsch:[a-z0-9-]+|mydealz:.+)$/, t.titel);
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
  const tot = abruf([['itunes.apple.com', '!fehler']]);
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
    assert.match(e.link, /^https:\/\/(itunes\.apple\.com|www\.mydealz\.de)\//);
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
