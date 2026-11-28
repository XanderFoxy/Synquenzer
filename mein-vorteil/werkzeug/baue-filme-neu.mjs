// Fixtures für die neuen Film-Bereiche der Seite (28.11.2026): test/fixtures/filme-neu/ = filme.json (Seiten-Fixture vom 07.11.
// plus mostWanted/reihen/advent/zusatz), filmkatalog.json, musikstore.json – mit den echten Radar-Modulen (vorteile/scan/module)
// aus nachgebauten Apple-Antworten (ausgedachte Titel und Preise). Aufruf: npm run fixtures:filme-neu
// (liegt absichtlich nicht unter test/, sonst führt `node --test` es aus)
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const MV = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..');
const R = join(MV, '..', 'vorteile', 'scan');
const { default: filme } = await import(join(R, 'module', 'filme.mjs'));
const { default: filmkatalog } = await import(join(R, 'module', 'filmkatalog.mjs'));
const { default: musikstore } = await import(join(R, 'module', 'musikstore.mjs'));
const { chartUrl, serienChartUrl } = await import(join(R, 'module', 'filme.mjs'));
const cfg = JSON.parse(await readFile(join(MV, '..', 'vorteile', 'config.json'), 'utf8'));
const OUT = join(MV, 'test', 'fixtures', 'filme-neu');
await mkdir(OUT, { recursive: true });

const bild = id => `https://is1-ssl.mzstatic.com/image/thumb/Video/v4/${id}/100x100bb.jpg`;
const film = (id, name, preis, jahr, extra = {}) => ({ wrapperType: 'track', kind: 'feature-movie', trackId: id, trackName: name, trackPrice: preis, trackHdPrice: preis, trackRentalPrice: 1.99, primaryGenreName: extra.genre || 'Abenteuer',
  releaseDate: `${jahr}-06-01T07:00:00Z`, artworkUrl100: bild(id), trackViewUrl: `https://itunes.apple.com/de/movie/x/id${id}?uo=4`, country: 'DEU', currency: 'EUR', ...extra });
const staffel = (id, serie, nr, preis, jahr) => ({ wrapperType: 'collection', collectionType: 'TV Season', collectionId: id, collectionName: `${serie}, Staffel ${nr}`, artistName: serie,
  collectionPrice: preis, collectionHdPrice: preis, trackCount: 22, primaryGenreName: 'Action & Abenteuer', releaseDate: `${jahr}-09-01T07:00:00Z`, artworkUrl100: bild(id),
  collectionViewUrl: `https://itunes.apple.com/de/tv-season/x/id${id}?uo=4`, country: 'DEU', currency: 'EUR' });

// ---- filme.json: Most Wanted (Reihe „Dino-Park“ 4 Teile, „Trabbi-Tour“ 2 Teile, Serien „Nachtfahrer“ 1982–1986 und „Lagunen-Team“)
const LISTEN = {
  zielpreis: 4.99, staffelZiel: 9.99, wunschliste: [{ titel: 'Dino-Park', jahr: 1993, id: 1991000001 }], serien: [], achtziger: [], disney: [],
  mostWanted: { alarm: 3.99, staffelAlarm: 4.99, reihen: [
    { name: 'Dino-Park', filme: [{ titel: 'Dino-Park', jahr: 1993, id: 1991000001 }, { titel: 'Dino-Park II: Die Insel', jahr: 1997, id: 1991000002 }, { titel: 'Dino-Park III', jahr: 2001, id: 1991000003 }, { titel: 'Dino-Welt', jahr: 2015 }] },
    { name: 'Trabbi-Tour', filme: [{ titel: 'Trabbi-Tour', jahr: 1991 }, { titel: 'Trabbi-Tour 2 – Der wilde Osten', jahr: 1992, id: 1991000012 }] },
  ], serien: [{ titel: 'Nachtfahrer', jahr: 1982, bis: 1986 }, { titel: 'Lagunen-Team', jahr: 1984, bis: 1986 }, { titel: 'Sternenreiter' }] },
  reihen: { liste: [{ name: 'Polizeischule', filme: [1, 2, 3, 4, 5, 6, 7].map(i => ({ titel: `Polizeischule ${i}`, jahr: 1983 + i, id: 1991000100 + i })) }] },
  charts: { neu: [{ id: 4404, name: 'Komödie' }], angebot: [], serien: false }, mydealz: false, appleTv: { aktiv: false },
};
const tag1 = { 1991000001: 7.99, 1991000002: 9.99, 1991000003: 5.99, 1991000012: 7.99 }, tag2 = { 1991000001: 3.99, 1991000002: 9.99, 1991000003: 3.99, 1991000012: 7.99 };
const s1 = { 1991000201: 9.99, 1991000202: 9.99, 1991000203: 9.99, 1991000204: 9.99 }, s2 = { 1991000201: 4.99, 1991000202: 9.99, 1991000203: 7.99, 1991000204: 9.99 };
function apple(p, sp) {
  return async url => {
    if (url.includes('/rss/')) return JSON.stringify({ feed: {} });
    if (url.includes('query.wikidata.org')) return JSON.stringify({ results: { bindings: [] } });
    const u = new URL(url);
    const alle = [
      ...Object.entries(p).map(([id, pr]) => film(Number(id), { 1991000001: 'Dino-Park', 1991000002: 'Dino-Park II: Die Insel', 1991000003: 'Dino-Park III', 1991000012: 'Trabbi-Tour 2 – Der wilde Osten' }[id], pr, { 1991000001: 1993, 1991000002: 1997, 1991000003: 2001, 1991000012: 1992 }[id], Number(id) === 1991000001 ? { collectionId: 1991000900, collectionName: 'Dino-Park 3-Film-Box', trackCount: 3 } : {})),
      ...[1, 2, 3, 4, 5, 6, 7].map(i => film(1991000100 + i, `Polizeischule ${i}`, i <= 2 ? 3.99 : 7.99, 1983 + i, { genre: 'Komödie' })),
      ...Object.entries(sp).map(([id, pr], i) => staffel(Number(id), 'Nachtfahrer', i + 1, pr, 1982 + i)),
      staffel(1991000209, 'Nachtfahrer', 1, 1.99, 2008),
      staffel(1991000301, 'Lagunen-Team', 1, 14.99, 1984), staffel(1991000302, 'Lagunen-Team', 2, 14.99, 1985),
    ];
    if (u.pathname === '/lookup') { const ids = new Set(u.searchParams.get('id').split(',')); return JSON.stringify({ results: alle.filter(r => ids.has(String(r.trackId ?? r.collectionId))) }); }
    if (u.pathname === '/search' && u.searchParams.get('entity') === 'tvSeason') { const t = u.searchParams.get('term'); return JSON.stringify({ results: alle.filter(r => r.wrapperType === 'collection' && t && r.artistName === t) }); }
    return JSON.stringify({ resultCount: 0, results: [] });
  };
}
const zf = {};
await filme({ holeText: apple(tag1, s1), cfg, wunschliste: {}, zustand: zf, jetzt: new Date('2026-11-20T10:00:00Z'), filmListen: LISTEN });
// Advent: drei Tage mit Tagesangebot (aus nachgebauten Countdown-Einträgen)
zf.filme.adventTage = { jahr: '2026', tage: {
  '2026-12-01': [{ id: 'itunes:1991000501', titel: 'Winterzauber', jahr: 2019, preis: 3.99, link: 'https://itunes.apple.com/de/movie/x/id1991000501', bild: bild(1991000501), quelle: 'mydealz' }],
  '2026-12-02': [{ id: 'mydealz:2899002', titel: 'Schneesturm', jahr: null, preis: 4.99, link: 'https://www.mydealz.de/deals/apple-tv-countdown-tag-2-2899002', bild: null, quelle: 'mydealz' }],
  '2026-12-04': [{ id: 'itunes:1991000504', titel: 'Lichterkette', jahr: 2021, preis: 3.99, link: 'https://itunes.apple.com/de/movie/x/id1991000504', bild: bild(1991000504), quelle: 'mydealz' }],
} };
const katalogKurz = { aktualisiert: '2026-12-04T09:00:00.000Z', zahlen: { filme399: 64, staffeln499: 6, filmeBekannt: 1830 } };
const musikKurz = { aktualisiert: '2026-12-04T08:00:00.000Z', zahlen: { alben: 5, songs: 4 } };
const r = await filme({ holeText: apple(tag2, s2), cfg, wunschliste: {}, zustand: zf, jetzt: new Date('2026-12-04T10:05:00Z'), filmListen: LISTEN, katalogDatei: katalogKurz, musikDatei: musikKurz });
// Basis: die bisherige Seiten-Fixture (07.11.2026) mit ihren Gruppen, dazu die neuen Felder dieses Laufs
const basis = JSON.parse(await readFile(join(MV, 'test', 'fixtures', 'filme.json'), 'utf8'));
const neu = { ...basis, aktualisiert: '2026-12-04T10:05:00.000Z', mostWanted: r.datei.mostWanted, reihen: r.datei.reihen, advent: r.datei.advent, zusatz: r.datei.zusatz,
  gruppen: { ...basis.gruppen, boxen: [{ id: 'itunes:1991000900', typ: 'box', titel: 'Dino-Park 3-Film-Box', jahr: 2018, genre: 'Action & Abenteuer', preis: 9.99, preisSd: 9.99, preisHd: 9.99, leihe: null, vorher: 24.99, tiefst: { p: 9.99, tag: '2026-12-03' }, seit: '2026-11-20', tage: 15, istTiefst: true, angebot: true, bild: bild(1991000900), link: 'https://itunes.apple.com/de/movie-collection/x/id1991000900', chart: null, quelle: 'Apple', ueblich: 24.99, ersparnis: { eur: 15, pct: 60, basis: 'üblich' }, filme: 3, jeFilm: 3.33 }] } };
await writeFile(join(OUT, 'filme.json'), JSON.stringify(neu, null, 1) + '\n');

// ---- filmkatalog.json: 5 Genres, 64 Filme für 3,99 €, 6 Staffeln für 4,99 €
const GEN = [[4401, 'Action & Abenteuer', 22], [4404, 'Komödie', 18], [4410, 'Kinder & Familie', 12], [4416, 'Thriller', 8], [4406, 'Drama', 6]];
const charts = {};
let id = 1992000000;
const ein = (i, name, preis, g, gn, art = 'movie') => ({ 'im:name': { label: name }, 'im:price': { label: `${preis} €`, attributes: { amount: String(preis), currency: 'EUR' } }, 'im:rentalPrice': { label: '1,99 €', attributes: { amount: '1.99', currency: 'EUR' } },
  'im:image': [{ label: `https://is1-ssl.mzstatic.com/image/thumb/Video/v4/${i}/170x170bb.jpg`, attributes: { height: '170' } }], id: { label: `https://itunes.apple.com/de/${art}/x/id${i}?uo=2`, attributes: { 'im:id': String(i) } },
  link: [{ attributes: { rel: 'alternate', href: `https://itunes.apple.com/de/${art}/x/id${i}?uo=2` } }], category: { attributes: { 'im:id': String(g), label: gn } }, 'im:releaseDate': { label: `${1980 + (i % 40)}-05-01T00:00:00-07:00` }, summary: { label: 'Ein Film.' } });
const WORT = ['Sturm', 'Nacht', 'Flucht', 'Spur', 'Insel', 'Jagd', 'Code', 'Grenze', 'Stadt', 'Fluss', 'Funke', 'Echo'];
for (const [g, gn, n] of GEN) {
  const e = [];
  for (let i = 0; i < n + 3; i++) { id++; e.push(ein(id, `${WORT[i % WORT.length]} ${gn.split(' ')[0]} ${i + 1}`, i < n ? 3.99 : 9.99, g, gn)); }
  charts[[4401, 4404, 4410].includes(g) ? chartUrl(g) : chartUrl(g, 200)] = e;
}
const sEin = [];
for (let i = 0; i < 8; i++) { id++; sEin.push(ein(id, `Serie ${WORT[i]}, Staffel ${1 + (i % 3)}`, 2.99, 4001, 'Drama', 'tv-season')); }
charts[serienChartUrl(4001, 200)] = sEin;
const sIds = sEin.map(e => Number(e.id.attributes['im:id']));
const kat = async url => {
  if (url.includes('/rss/')) { const k = Object.keys(charts).find(x => x === url); return JSON.stringify({ feed: k ? { entry: charts[k] } : {} }); }
  const u = new URL(url);
  if (u.pathname === '/lookup') {
    const ids = u.searchParams.get('id').split(',').map(Number);
    if (u.searchParams.get('entity') === 'movie') return JSON.stringify({ results: ids.includes(1991000900) ? [film(1991000001, 'Dino-Park', 3.99, 1993, { collectionId: 1991000900, collectionName: 'Dino-Park 3-Film-Box', trackCount: 3 }), film(1991000002, 'Dino-Park II: Die Insel', 9.99, 1997, { collectionId: 1991000900, collectionName: 'Dino-Park 3-Film-Box', trackCount: 3 }), film(1991000003, 'Dino-Park III', 3.99, 2001, { collectionId: 1991000900, collectionName: 'Dino-Park 3-Film-Box', trackCount: 3 })] : [] });
    return JSON.stringify({ results: ids.filter(x => sIds.includes(x)).map((x, i) => staffel(x, `Serie ${WORT[sIds.indexOf(x)]}`, 1 + (sIds.indexOf(x) % 3), sIds.indexOf(x) < 6 ? 4.99 : 12.99, 2015)) });
  }
  throw new Error(url);
};
const kl = { charts: { neu: [{ id: 4401, name: 'Action & Abenteuer' }, { id: 4404, name: 'Komödie' }], angebot: [{ id: 4410, name: 'Kinder & Familie' }], breit: { limit: 200, filme: [{ id: 4416, name: 'Thriller' }, { id: 4406, name: 'Drama' }], serien: [{ id: 4001, name: 'Drama' }] }, serien: false } };
const rk = await filmkatalog({ holeText: kat, cfg, zustand: {}, jetzt: new Date('2026-12-04T09:00:00Z'), filmListen: kl, filmeDatei: neu });
await writeFile(join(OUT, 'filmkatalog.json'), JSON.stringify(rk.datei, null, 1) + '\n');

// ---- musikstore.json: 2 Synthpop-, 1 Metal-Künstler (ausgedacht)
const KS = [{ name: 'Die Pulsare', genre: 'Synthpop' }, { name: 'Neonfabrik', genre: 'Synthpop' }, { name: 'Eisenfaust', genre: 'Heavy Metal' }, { name: 'Unbekannt XY', genre: 'Heavy Metal' }];
const KID = { 'Die Pulsare': 1993000001, Neonfabrik: 1993000002, Eisenfaust: 1993000003 };
const alb = (cid, aid, a, n, p) => ({ wrapperType: 'collection', collectionType: 'Album', collectionId: cid, collectionName: n, artistId: aid, artistName: a, collectionPrice: p, trackCount: 11, releaseDate: '1987-04-01T08:00:00Z', artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/Music/${cid}/100x100bb.jpg`, collectionViewUrl: `https://music.apple.com/de/album/x/${cid}?uo=4`, country: 'DEU', currency: 'EUR' });
const sng = (tid, aid, a, n, p) => ({ wrapperType: 'track', kind: 'song', trackId: tid, trackName: n, artistId: aid, artistName: a, collectionName: 'Best of', trackPrice: p, releaseDate: '1987-04-01T08:00:00Z', artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/Music/${tid}/100x100bb.jpg`, trackViewUrl: `https://music.apple.com/de/album/x/1?i=${tid}&uo=4`, country: 'DEU', currency: 'EUR' });
const zm = {};
const musikAbruf = preise => async url => {
  const u = new URL(url);
  if (u.host === 'query.wikidata.org') return JSON.stringify({ results: { bindings: [] } });
  if (u.pathname === '/search') { const t = u.searchParams.get('term'); return JSON.stringify({ results: KID[t] ? [{ wrapperType: 'artist', artistName: t, artistId: KID[t] }] : [] }); }
  const aid = Number(u.searchParams.get('id')), a = Object.keys(KID).find(k => KID[k] === aid);
  if (u.searchParams.get('entity') === 'album') return JSON.stringify({ results: [alb(aid * 10 + 1, aid, a, 'Leuchtfeuer', 4.99), alb(aid * 10 + 2, aid, a, 'Kaltes Herz', preise[aid] ?? 9.99), alb(aid * 10 + 3, aid, a, 'Live in Döbeln', 10.99)] });
  return JSON.stringify({ results: [sng(aid * 10 + 6, aid, a, 'Signal', 0.69), sng(aid * 10 + 7, aid, a, 'Frequenz', 0.69), sng(aid * 10 + 8, aid, a, 'Rauschen', 1.29)] });
};
const ml = { kuenstler: KS };
let v = null;
v = (await musikstore({ holeText: musikAbruf({}), cfg, zustand: zm, jetzt: new Date('2026-12-03T08:00:00Z'), musikListe: ml })).datei;
v = (await musikstore({ holeText: musikAbruf({ 1993000001: 5.99 }), cfg, zustand: zm, jetzt: new Date('2026-12-04T08:00:00Z'), musikListe: ml, vorherDatei: v })).datei;
await writeFile(join(OUT, 'musikstore.json'), JSON.stringify(v, null, 1) + '\n');
console.log('filme', Object.keys(neu), 'katalog', rk.datei.zahlen, 'musik', v.zahlen);
