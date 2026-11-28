// Modul „filmkatalog“ (28.11.2026): alle Filme für 3,99 € und Staffeln für 4,99 € je Genre, Katalog über mehrere Läufe,
// Boxen in die Box-Liste von „filme“, Box-Inhalte. Ohne Netz: Chart- und Lookup-Antworten im echten Format (nachgebaut).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import filmkatalog, { katalogGenres, merkePreisK, KATALOG } from '../module/filmkatalog.mjs';
import { chartUrl, serienChartUrl } from '../module/filme.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg0 = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const echt = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
const mitCfg = k => ({ ...cfg0, module: { ...cfg0.module, filmkatalog: { ...cfg0.module.filmkatalog, ...k } } });

const LISTEN = {
  charts: {
    neu: [{ id: 4401, name: 'Action & Abenteuer' }], angebot: [{ id: 4410, name: 'Kinder & Familie' }], horror: [4408],
    serien: [{ id: null, name: 'Alle Serien' }],
    breit: { limit: 200, filme: [{ id: 4406, name: 'Drama' }, { id: 4408, name: 'Horror' }], serien: [{ id: 4001, name: 'Drama' }] },
  },
};
const eintrag = (id, name, preis, genreId, genre, art = 'movie') => ({
  'im:name': { label: name }, 'im:price': { label: `${preis} €`, attributes: { amount: String(preis), currency: 'EUR' } },
  'im:image': [{ label: `https://is1-ssl.mzstatic.com/image/thumb/x/${id}/170x170bb.jpg`, attributes: { height: '170' } }],
  id: { label: `https://itunes.apple.com/de/${art}/x/id${id}?uo=2`, attributes: { 'im:id': String(id) } },
  link: [{ attributes: { rel: 'alternate', href: `https://itunes.apple.com/de/${art}/x/id${id}?uo=2` } }],
  category: { attributes: { 'im:id': String(genreId), label: genre } }, 'im:releaseDate': { label: '2010-05-01T00:00:00-07:00' }, summary: { label: 'Ein Film.' },
});
const film = (id, name, preis, extra = {}) => ({
  wrapperType: 'track', kind: 'feature-movie', trackId: id, trackName: name, trackPrice: preis, trackHdPrice: preis, primaryGenreName: 'Action',
  releaseDate: '2010-05-01T07:00:00Z', artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${id}/100x100bb.jpg`,
  trackViewUrl: `https://itunes.apple.com/de/movie/x/id${id}?uo=4`, country: 'DEU', currency: 'EUR', ...extra,
});
const staffel = (id, name, preis) => ({
  wrapperType: 'collection', collectionType: 'TV Season', collectionId: id, collectionName: name, artistName: name.split(',')[0],
  collectionPrice: preis, collectionHdPrice: preis, trackCount: 10, primaryGenreName: 'Drama', releaseDate: '2015-01-01T07:00:00Z',
  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${id}/100x100bb.jpg`, collectionViewUrl: `https://itunes.apple.com/de/tv-season/x/id${id}?uo=4`, country: 'DEU', currency: 'EUR',
});
const BOX = 1990200777;
const LOOKUP = {
  1990200001: film(1990200001, 'Alpha', 3.99, { collectionId: BOX, collectionName: 'Alpha 3-Film-Box', trackCount: 3 }),
  1990200002: film(1990200002, 'Beta', 9.99), 1990200004: film(1990200004, 'Kind', 3.99), 1990200005: film(1990200005, 'Drama Eins', 3.99),
  1990200021: film(1990200021, 'Alpha 2', 5.99, { collectionId: BOX, collectionName: 'Alpha 3-Film-Box', trackCount: 3 }),
  1990200022: film(1990200022, 'Alpha 3', 3.99, { collectionId: BOX, collectionName: 'Alpha 3-Film-Box', trackCount: 3 }),
  1990200101: staffel(1990200101, 'Serie Eins, Staffel 1', 4.99), 1990200102: staffel(1990200102, 'Serie Zwei, Staffel 3', 14.99),
  1990200103: staffel(1990200103, 'Serie Drei, Staffel 2', 4.99),
};
function abruf({ charts, lookup = LOOKUP, fehler = () => null } = {}) {
  const urls = [];
  const holeText = async url => {
    urls.push(url);
    const f = fehler(url); if (f) throw f;
    if (url.includes('/rss/')) {
      const k = Object.keys(charts).find(x => url === x);
      return JSON.stringify({ feed: k ? { entry: charts[k] } : {} });
    }
    const u = new URL(url);
    if (u.pathname === '/lookup') {
      const ids = u.searchParams.get('id').split(',');
      if (u.searchParams.get('entity') === 'movie') {
        const res = [];
        for (const b of ids) if (Number(b) === BOX) res.push({ wrapperType: 'collection', collectionType: 'Movie Bundle', collectionId: BOX, collectionName: 'Alpha 3-Film-Box', collectionPrice: 9.99, trackCount: 3, country: 'DEU', currency: 'EUR' }, lookup[1990200001], lookup[1990200021], lookup[1990200022]);
        return JSON.stringify({ results: res });
      }
      return JSON.stringify({ results: ids.map(i => lookup[i]).filter(Boolean) });
    }
    throw new Error(`unerwartet: ${url}`);
  };
  return { holeText, urls };
}
const CHARTS1 = {
  [chartUrl(4401)]: [eintrag(1990200001, 'Alpha', 3.99, 4401, 'Action & Abenteuer'), eintrag(1990200002, 'Beta', 9.99, 4401, 'Action & Abenteuer'), eintrag(1990200003, 'Grusel', 2.99, 4408, 'Horror')],
  [chartUrl(4410)]: [eintrag(1990200004, 'Kind', 3.99, 4410, 'Kinder & Familie'), eintrag(1990200001, 'Alpha', 3.99, 4410, 'Kinder & Familie')],
  [chartUrl(4406, 200)]: [eintrag(1990200005, 'Drama Eins', 3.99, 4406, 'Drama')],
  [serienChartUrl(null)]: [eintrag(1990200103, 'Serie Drei, Staffel 2', 3.49, 4001, 'Drama', 'tv-season')],
  [serienChartUrl(4001, 200)]: [eintrag(1990200101, 'Serie Eins, Staffel 1', 2.99, 4001, 'Drama', 'tv-season'), eintrag(1990200102, 'Serie Zwei, Staffel 3', 1.99, 4001, 'Drama', 'tv-season')],
};
const lauf = (h, zustand, jetzt, extra = {}) => filmkatalog({ holeText: h, cfg: extra.cfg || cfg0, zustand, jetzt: new Date(jetzt), filmListen: extra.listen || LISTEN, filmeDatei: extra.filmeDatei || null, vorherDatei: extra.vorherDatei || null });

test('Genres: dieselben Adressen wie Modul „filme“ (Hauptgenres Top 100, breite Genres Top 200), Horror nie', () => {
  const { genres } = katalogGenres(echt);
  const filme = genres.filter(g => g.art === 'film');
  assert.ok(filme.some(g => g.url === chartUrl(4404) && g.quelle === 'haupt'));
  assert.ok(filme.some(g => g.url === chartUrl(4406, 200) && g.quelle === 'breit'), 'Drama: Adresse der breiten Suche');
  assert.ok(!genres.some(g => g.id === 4408), 'kein Horror');
  assert.ok(genres.some(g => g.art === 'staffel' && g.id === null && g.url === serienChartUrl(null)));
  assert.ok(genres.some(g => g.art === 'staffel' && g.url === serienChartUrl(4003, 200)));
  assert.equal(new Set(genres.map(g => g.key)).size, genres.length);
  // Preis-Historie: Senkung merkt vorher/Tiefst
  const o = {}; merkePreisK(o, 999, 100); merkePreisK(o, 399, 101);
  assert.deepEqual([o.p, o.v, o.tp, o.tt, o.h, o.ps, o.k], [399, 999, 399, 101, 999, 101, 101]);
  assert.equal(KATALOG.filmMax, 3.99); assert.equal(KATALOG.staffelMax, 4.99);
});

test('Lauf: alle Filme ≤ 3,99 € je Genre (auch mehrere Genres), Staffeln ≤ 4,99 € (Preis vom Lookup, nicht vom Chart), Box in die Box-Liste', async () => {
  const zustand = {};
  const a = abruf({ charts: CHARTS1 });
  const r = await lauf(a.holeText, zustand, '2026-11-28T10:00:00Z');
  const d = r.datei;
  assert.deepEqual(r.fehler, []);
  assert.deepEqual(d.filme.map(t => t.titel).sort(), ['Alpha', 'Alpha 3', 'Drama Eins', 'Kind']);
  const alpha = d.filme.find(t => t.titel === 'Alpha');
  assert.deepEqual(alpha.genres.sort(), [4401, 4410]);
  assert.equal(alpha.preis, 3.99); assert.match(alpha.link, /^https:\/\/itunes\.apple\.com\/de\/movie\//); assert.match(alpha.bild, /200x200bb/);
  assert.ok(!d.filme.some(t => t.titel === 'Grusel'), 'Horror nie');
  assert.ok(!d.filme.some(t => t.titel === 'Beta'), '9,99 € nicht');
  // Staffeln: Chart sagt 2,99/1,99 € (unzuverlässig), Lookup 4,99/14,99 € -> nur Serie Eins und Serie Drei
  assert.deepEqual(d.staffeln.map(t => [t.titel, t.preis]).sort(), [['Serie Drei, Staffel 2', 4.99], ['Serie Eins, Staffel 1', 4.99]]);
  assert.equal(d.staffeln.find(t => t.titel.startsWith('Serie Eins')).serie, 'Serie Eins');
  assert.equal(d.staffeln.find(t => t.titel.startsWith('Serie Eins')).nr, 1);
  // Genre-Spalten mit Zahl und Katalog-Größe
  const g = Object.fromEntries(d.genres.map(x => [`${x.art}${x.id}`, x.n]));
  assert.equal(g.film4401, 1, 'Action: Alpha (Alpha 3 kennt der Radar nur aus der Box – ohne Genre, steht unter „Alle“)');
  assert.equal(g.film4410, 2); assert.equal(g.film4406, 1); assert.equal(g.staffel4001, 2);
  // Box: in die Box-Liste von „filme“ (dort Preis/Angebot) und Inhalt mit den einzelnen Teilen
  assert.ok(zustand.filme.boxen[`itunes:${BOX}`], 'Box entdeckt');
  assert.deepEqual(d.boxInhalt[`itunes:${BOX}`].map(t => [t.titel, t.preis]), [['Alpha', 3.99], ['Alpha 2', 5.99], ['Alpha 3', 3.99]]);
  assert.equal(d.zahlen.filme399, 4); assert.equal(d.zahlen.staffeln499, 2);
  assert.ok(d.zahlen.filmeBekannt >= 6);
  assert.equal(r.zahl.n, 4); assert.match(d.hinweis, /Vollständig nur so weit/);
  assert.ok(!a.urls.some(u => /\/search/.test(u)), 'keine Suche');
});

test('Katalog über Läufe: aus den Charts gefallener Film bleibt mit frischem Lookup-Preis; fehlt er mehrfach, fliegt er raus; Preis zu alt = nicht gezeigt', async () => {
  const zustand = {};
  await lauf(abruf({ charts: CHARTS1 }).holeText, zustand, '2026-11-28T10:00:00Z');
  // nächster Tag: Action-Chart zeigt nur noch Beta; Alpha kommt per Lookup (3,99 €), Kind fehlt im Store (Lookup leer)
  const charts2 = { ...CHARTS1, [chartUrl(4401)]: [eintrag(1990200002, 'Beta', 9.99, 4401, 'Action & Abenteuer')], [chartUrl(4410)]: [] };
  const ohneKind = { ...LOOKUP }; delete ohneKind[1990200004];
  const cfg = mitCfg({ fehltNach: 2 });
  const r2 = await lauf(abruf({ charts: charts2, lookup: ohneKind }).holeText, zustand, '2026-11-29T10:00:00Z', { cfg });
  assert.ok(r2.datei.filme.some(t => t.titel === 'Alpha'), 'Alpha bleibt (Lookup)');
  assert.equal(zustand.filmkatalog.f['1990200004'].n, 1, 'Kind fehlte einmal');
  const r3 = await lauf(abruf({ charts: charts2, lookup: ohneKind }).holeText, zustand, '2026-11-30T10:00:00Z', { cfg });
  assert.equal(zustand.filmkatalog.f['1990200004'], undefined, 'nach zweimal Fehlen raus');
  assert.ok(!r3.datei.filme.some(t => t.titel === 'Kind'));
  // Beta auf 3,99 € gesenkt (Chart): vorher 9,99 €, Tiefst 3,99 €
  const charts4 = { ...charts2, [chartUrl(4401)]: [eintrag(1990200002, 'Beta', 3.99, 4401, 'Action & Abenteuer')] };
  const r4 = await lauf(abruf({ charts: charts4, lookup: { ...ohneKind, 1990200002: film(1990200002, 'Beta', 3.99) } }).holeText, zustand, '2026-12-01T10:00:00Z', { cfg });
  const beta = r4.datei.filme.find(t => t.titel === 'Beta');
  assert.equal(beta.vorher, 9.99); assert.equal(beta.tiefst.p, 3.99); assert.equal(beta.seit, '2026-12-01');
  // Preis zu alt (Apple tagelang gestört): nichts Veraltetes auf der Seite
  const tot = abruf({ charts: {}, fehler: () => new Error('HTTP 503 bei itunes.apple.com') });
  const r5 = await lauf(tot.holeText, zustand, '2026-12-05T10:00:00Z', { cfg, vorherDatei: r4.datei });
  assert.equal(r5.letzterStand, true, 'alles gestört -> letzter Stand');
  assert.equal(r5.datei.gestoert, true);
  const r6 = await lauf(tot.holeText, structuredClone(zustand), '2026-12-05T10:00:00Z', { cfg });
  assert.deepEqual(r6.datei.filme, [], 'ohne letzten Stand: keine Preise älter als frischTage');
});

test('Höflich: gemerkte Adressen von „filme“ zuerst, höchstens neueCharts weitere; Obergrenze je Lauf beendet die Charts ohne Störung', async () => {
  const zustand = { filme: { breit: { g: { f4406: { t: '2026-11-28T10:00:00.000Z' } } } } };
  const a = abruf({ charts: CHARTS1 });
  const r = await lauf(a.holeText, zustand, '2026-11-28T10:00:00Z', { cfg: mitCfg({ neueCharts: 0 }) });
  const geholt = a.urls.filter(u => u.includes('/rss/'));
  assert.ok(geholt.includes(chartUrl(4406, 200)), 'Drama: „filme“ hat die Adresse in diesem Lauf geholt (gemerkt)');
  assert.ok(!geholt.includes(serienChartUrl(4001, 200)), 'Serien Drama: von „filme“ nicht geholt, neueCharts 0 -> nicht');
  assert.equal(r.datei.status.katalog.chartsNeu, 0);
  // Obergrenze der Apple-Schnittstelle erreicht: kein Fehler, Rest im nächsten Lauf
  const voll = abruf({ charts: CHARTS1, fehler: u => (u.includes('/rss/') && u.includes('4410') ? new Error('Apple iTunes (Charts + Suche): höchstens 60 Abrufe je Lauf – Rest im nächsten Lauf') : null) });
  const r2 = await lauf(voll.holeText, {}, '2026-11-28T10:00:00Z');
  assert.deepEqual(r2.fehler, []);
  assert.ok(voll.urls.filter(u => u.includes('/rss/')).length <= 3, 'nach der Obergrenze kein weiterer Chart');
});

test('Kurzprüfung 28.11.2026: Titel fehlt im Lookup oder hat keinen Kaufpreis mehr -> nicht mehr als frischer 3,99-€-Preis gezeigt', async () => {
  const zustand = {};
  await lauf(abruf({ charts: CHARTS1 }).holeText, zustand, '2026-11-28T10:00:00Z');
  // nächster Tag: Kind und Drama Eins nicht mehr in den Charts; Lookup: Kind fehlt ganz, Drama Eins nur noch zum Leihen
  // dazu „Nur im Chart“: heute mit Preis im Chart, aber der Lookup kennt ihn nicht -> Chart-Preis gilt, kein „fehlt“
  const charts2 = { ...CHARTS1, [chartUrl(4410)]: [eintrag(1990200001, 'Alpha', 3.99, 4410, 'Kinder & Familie'), eintrag(1990200009, 'Nur im Chart', 3.99, 4410, 'Kinder & Familie')], [chartUrl(4406, 200)]: [] };
  const lk = { ...LOOKUP, 1990200005: { ...film(1990200005, 'Drama Eins', 3.99), trackPrice: undefined, trackHdPrice: undefined, trackRentalPrice: 1.99 } };
  delete lk[1990200004];
  const r = await lauf(abruf({ charts: charts2, lookup: lk }).holeText, zustand, '2026-11-29T10:00:00Z');
  const titel = r.datei.filme.map(t => t.titel);
  assert.ok(!titel.includes('Kind'), 'fehlt im Store -> nicht „frisch geprüft“');
  assert.ok(!titel.includes('Drama Eins'), 'kein Kaufpreis -> alter Preis nicht als aktuell');
  assert.ok(titel.includes('Alpha'));
  assert.equal(zustand.filmkatalog.f['1990200005'].np, 1);
  assert.ok(titel.includes('Nur im Chart'), 'heute im Chart mit Preis = im Store');
  assert.equal(zustand.filmkatalog.f['1990200009'].n, 0);
  // wieder zu kaufen: zählt sofort wieder
  const r2 = await lauf(abruf({ charts: { ...charts2, [chartUrl(4406, 200)]: [eintrag(1990200005, 'Drama Eins', 3.99, 4406, 'Drama')] } }).holeText, zustand, '2026-11-30T10:00:00Z');
  assert.ok(r2.datei.filme.some(t => t.titel === 'Drama Eins'));
  assert.equal(zustand.filmkatalog.f['1990200005'].np, undefined);
});
