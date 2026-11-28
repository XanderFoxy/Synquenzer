// Most Wanted, Reihen und Advent-Kalender im Modul „filme“ (Xander 28.11.2026). Ohne Netz: nachgebaute Apple-Antworten im echten
// Format (Lookup, Staffel-Suche), Wikidata leer, mydealz aus bzw. der nachgebaute Dezember-Feed (fixtures/mydealz-apple-tv-dezember.xml).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import filme, { postenListe } from '../module/filme.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const echt = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));

const LISTEN = {
  zielpreis: 4.99, staffelZiel: 9.99, wunschliste: [], serien: [], achtziger: [{ titel: 'Reihenfilm Eins', jahr: 1984, id: 1990100010 }], disney: [],
  mostWanted: {
    alarm: 3.99, staffelAlarm: 4.99,
    reihen: [{ name: 'Testreihe', filme: [
      { titel: 'Testfilm Eins', jahr: 1993, id: 1990100001 },
      { titel: 'Testfilm Zwei', jahr: 1997, id: 1990100002 },
      { titel: 'Testfilm Drei', jahr: 2001 }, // ohne Nummer, nirgends zu finden -> „nicht im Store“
    ] }],
    serien: [{ titel: 'Testserie Alt', jahr: 1985, bis: 1988 }],
  },
  reihen: { liste: [{ name: 'Andere Reihe', filme: [{ titel: 'Reihenfilm Eins', jahr: 1984, id: 1990100010 }, { titel: 'Reihenfilm Zwei', jahr: 1985, id: 1990100011 }] }] },
  charts: { neu: [{ id: 4404, name: 'Komödie' }], angebot: [], serien: false },
  mydealz: false, appleTv: { aktiv: false },
};
const film = (id, name, preis, jahr) => ({
  wrapperType: 'track', kind: 'feature-movie', trackId: id, trackName: name, trackPrice: preis, trackHdPrice: preis, primaryGenreName: 'Abenteuer',
  releaseDate: `${jahr}-06-01T07:00:00Z`, artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${id}/100x100bb.jpg`,
  trackViewUrl: `https://itunes.apple.com/de/movie/x/id${id}?uo=4`, country: 'DEU', currency: 'EUR',
});
const staffel = (id, name, preis, jahr) => ({
  wrapperType: 'collection', collectionType: 'TV Season', collectionId: id, collectionName: name, artistName: 'Testserie Alt',
  collectionPrice: preis, collectionHdPrice: preis, trackCount: 22, primaryGenreName: 'Action & Abenteuer', releaseDate: `${jahr}-09-01T07:00:00Z`,
  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${id}/100x100bb.jpg`, collectionViewUrl: `https://itunes.apple.com/de/tv-season/x/id${id}?uo=4`,
  country: 'DEU', currency: 'EUR',
});

function apple(preise) {
  const urls = [];
  const holeText = async url => {
    urls.push(url);
    if (url.includes('/rss/')) return JSON.stringify({ feed: {} });
    if (url.includes('query.wikidata.org')) return JSON.stringify({ results: { bindings: [] } });
    const u = new URL(url);
    const alle = [
      film(1990100001, 'Testfilm Eins', preise.eins, 1993), film(1990100002, 'Testfilm Zwei', preise.zwei, 1997),
      film(1990100010, 'Reihenfilm Eins', 7.99, 1984), film(1990100011, 'Reihenfilm Zwei', 3.99, 1985),
      staffel(1990100101, 'Testserie Alt, Staffel 1', preise.s1, 1985), staffel(1990100102, 'Testserie Alt, Staffel 2', 9.99, 1986),
      staffel(1990100109, 'Testserie Alt, Staffel 1', 1.99, 2016), // gleichnamige Neuauflage -> ausgeblendet
    ];
    if (u.pathname === '/lookup') { const ids = new Set(u.searchParams.get('id').split(',')); return JSON.stringify({ results: alle.filter(r => ids.has(String(r.trackId ?? r.collectionId))) }); }
    if (u.pathname === '/search' && u.searchParams.get('entity') === 'tvSeason' && /Testserie/.test(u.searchParams.get('term'))) return JSON.stringify({ resultCount: 3, results: alle.filter(r => r.wrapperType === 'collection') });
    if (u.pathname === '/search') return JSON.stringify({ resultCount: 0, results: [] });
    throw new Error(`unerwartet: ${url}`);
  };
  return { holeText, urls };
}
const lauf = (h, zustand, jetzt, extra = {}) => filme({ holeText: h, cfg, wunschliste: {}, zustand, jetzt: new Date(jetzt), filmListen: LISTEN, ...extra });

test('Listen: Most Wanted und Reihen werden Posten mit gleichem Schlüssel wie die übrigen Listen', () => {
  const p = postenListe(echt);
  const most = p.filter(x => x.gruppe === 'most');
  assert.equal(most.filter(x => !x.serie).length, 22, 'Jurassic Park 7 + Go Trabi Go 2 + Star Trek 13');
  assert.equal(most.filter(x => x.serie).length, 13);
  assert.ok(most.every(x => x.serie || x.reihe), 'jeder Film kennt seine Reihe');
  // gleicher Titel = gleicher Schlüssel = eine Apple-Nummer (Go Trabi Go steht auf der Wunschliste, Jurassic Park in der 80er-Liste)
  const key = (g, t) => p.find(x => x.gruppe === g && x.item.titel === t)?.key;
  assert.equal(key('most', 'Go Trabi Go'), key('wunsch', 'Go Trabi Go'));
  assert.equal(key('most', 'Jurassic Park'), key('achtziger', 'Jurassic Park'));
  assert.equal(p.find(x => x.gruppe === 'most' && x.serie && /Raumschiff Enterprise/.test(x.item.titel)).key, p.find(x => x.gruppe === 'serien' && /Raumschiff Enterprise/.test(x.item.titel)).key);
  assert.equal(p.filter(x => x.gruppe === 'reihe').length, 7, 'Police Academy 1–7');
  // Go Trabi Go 2 gibt es (1992) – steht ehrlich mit Hinweis in der Liste
  assert.ok(echt.mostWanted.reihen.find(r => r.name === 'Go Trabi Go').filme.some(f => f.jahr === 1992 && /Go Trabi Go 2/.test(f.titel)));
  // ohne die neuen Abschnitte: dieselben Posten wie vorher (Reihenfolge Wunsch, Serien, 80er/Disney)
  const alt = postenListe({ ...echt, mostWanted: undefined, reihen: undefined });
  assert.ok(!alt.some(x => x.gruppe === 'most' || x.gruppe === 'reihe'));
});

test('Most Wanted: im Store? Preis, Tiefst, Alarm; Staffeln der gemeinten Serie (Neuauflage ausgeblendet); Push nur zum Alarm-Preis', async () => {
  const zustand = {};
  const a = apple({ eins: 3.99, zwei: 9.99, s1: 4.99 });
  const r1 = await lauf(a.holeText, zustand, '2026-11-28T10:00:00Z');
  const mw = r1.datei.mostWanted;
  assert.ok(mw, 'mostWanted in filme.json');
  assert.equal(mw.alarm, 3.99); assert.equal(mw.staffelAlarm, 4.99);
  const [eins, zwei, drei] = mw.reihen[0].filme;
  assert.equal(eins.titel, 'Testfilm Eins'); assert.equal(eins.preis, 3.99); assert.equal(eins.imStore, true); assert.equal(eins.unterAlarm, true);
  assert.equal(eins.reihe, 'Testreihe'); assert.match(eins.link, /^https:\/\/itunes\.apple\.com\/de\//);
  assert.equal(zwei.preis, 9.99); assert.equal(zwei.unterAlarm, false);
  assert.equal(drei.imStore, false, 'alle Wege leer -> nicht im Store'); assert.equal(drei.fehlt, true); assert.equal(drei.preis, null);
  const s = mw.serien[0];
  assert.equal(s.titel, 'Testserie Alt'); assert.equal(s.imStore, true);
  assert.deepEqual(s.staffeln.map(t => [t.nr, t.preis]), [[1, 4.99], [2, 9.99]], 'Staffel 1 von 2016 (1,99 €) gehört zur Neuauflage');
  assert.equal(s.ausgeblendet, 1);
  assert.deepEqual(s.guenstigste, { id: 'itunes:1990100101', nr: 1, preis: 4.99 });
  assert.equal(s.unterAlarm, true);
  // Pushes: Film zum Alarm-Preis und Staffel zum Alarm-Preis sofort; der teure Film nicht
  const sofort = r1.eintraege.filter(e => e.sofort).map(e => e.grund);
  assert.ok(sofort.includes('Most Wanted zum Alarm-Preis'), sofort.join(', '));
  assert.ok(sofort.includes('Most Wanted: Staffel zum Alarm-Preis'));
  assert.ok(!r1.eintraege.some(e => /Testfilm Zwei/.test(e.titel)));
  // Most-Wanted-Film für 3,99 € steht auch unter „Für 3,99 €“ (vorn wie die Wunschliste)
  assert.equal(r1.datei.gruppen.fuer399[0]?.id, 'itunes:1990100001');
  // Reihen (Sammlung/Boxen): beide Teile, ohne Alarm
  assert.deepEqual(r1.datei.reihen.map(x => [x.name, x.filme.map(f => f.preis)]), [['Andere Reihe', [7.99, 3.99]]]);
  assert.ok(!('alarm' in r1.datei.reihen[0].filme[0]));
  // Zusatz-Dateien: ohne Katalog/Musik nur die Dateinamen
  assert.deepEqual(r1.datei.zusatz, { katalog: { datei: 'filmkatalog.json' }, musik: { datei: 'musikstore.json' } });

  // nächster Tag: Testfilm Zwei auf 3,99 € gesenkt -> Alarm, Tiefst 3,99 €, vorher 9,99 €
  const b = apple({ eins: 3.99, zwei: 3.99, s1: 4.99 });
  const r2 = await lauf(b.holeText, zustand, '2026-11-29T10:00:00Z', { katalogDatei: { aktualisiert: '2026-11-29T09:00:00Z', zahlen: { filme399: 312, staffeln499: 41, filmeBekannt: 2140 } } });
  const z2 = r2.datei.mostWanted.reihen[0].filme[1];
  assert.equal(z2.preis, 3.99); assert.equal(z2.unterAlarm, true); assert.equal(z2.vorher, 9.99); assert.equal(z2.tiefst.p, 3.99);
  assert.ok(r2.eintraege.some(e => e.sofort && /Testfilm Zwei/.test(e.titel)));
  assert.deepEqual(r2.datei.zusatz.katalog, { datei: 'filmkatalog.json', filme399: 312, staffeln499: 41, bekannt: 2140, stand: '2026-11-29T09:00:00Z' });
});

test('Advent: jedes gesehene Tagesangebot bleibt den ganzen Dezember im Kalender (Tag = Tag des Beitrags), im November kein Kalender', async () => {
  const h = macheFixtureAbruf(FIX, [['rss/gruppe/apple-tv', 'mydealz-apple-tv-dezember.xml'], ...FIXTURE_KARTE]);
  const zustand = {};
  const nov = await filme({ holeText: url => h(url), cfg, wunschliste: {}, zustand: {}, jetzt: new Date('2026-11-28T10:00:00Z'), filmListen: { ...echt, mostWanted: undefined } });
  assert.equal(nov.datei.advent, undefined, 'November ohne Tagesangebote: kein Kalender');
  const r = await filme({ holeText: url => h(url), cfg, wunschliste: {}, zustand, jetzt: new Date('2026-12-05T07:10:00Z'), filmListen: echt });
  const t = r.datei.advent?.tage || {};
  assert.deepEqual(Object.keys(t).sort(), ['2026-12-04', '2026-12-05']);
  assert.match(t['2026-12-04'][0].titel, /Wicked/); assert.match(t['2026-12-05'][0].titel, /Gladiator/);
  assert.ok(t['2026-12-05'][0].link.startsWith('https://'));
  // ein Lauf ohne neue Beiträge (Feed leer) vergisst die Tage nicht
  const leer = macheFixtureAbruf(FIX, [['rss/gruppe/apple-tv', 'itunes-rss-leer.json'], ['rss/gruppe/', 'itunes-rss-leer.json'], ...FIXTURE_KARTE]);
  const r2 = await filme({ holeText: url => leer(url), cfg, wunschliste: {}, zustand, jetzt: new Date('2026-12-07T09:00:00Z'), filmListen: echt });
  assert.deepEqual(Object.keys(r2.datei.advent.tage).sort(), ['2026-12-04', '2026-12-05']);
  assert.equal(r2.datei.advent.jahr, '2026');
  // neues Jahr: Kalender beginnt leer
  const r3 = await filme({ holeText: url => leer(url), cfg, wunschliste: {}, zustand, jetzt: new Date('2027-01-02T09:00:00Z'), filmListen: echt });
  assert.equal(r3.datei.advent, undefined);
});
