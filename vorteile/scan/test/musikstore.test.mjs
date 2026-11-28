// Modul „musikstore“ (28.11.2026): Alben bis 4,99 € / Songs 0,69 € bekannter Künstler, Künstlernummer per Suche (sonst Wikidata
// P2850), reihum je Lauf einige Künstler, eigene Preis-Historie („gesenkt“). Ohne Netz: Antworten im Format der iTunes-API (nachgebaut).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import musikstore, { waehleKuenstler, albenAus, songsAus, nameNorm, suchUrl, albenUrl, songsUrl, kuenstlerAbfrage, leseKuenstlerWikidata } from '../module/musikstore.mjs';
import { schnittstelleFuer } from '../lib/schnittstellen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg0 = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const liste0 = JSON.parse(await readFile(join(HIER, '..', '..', 'musik.json'), 'utf8'));
const mitCfg = k => ({ ...cfg0, module: { ...cfg0.module, musikstore: { ...cfg0.module.musikstore, ...k } } });

const KUENSTLER = [
  { name: 'Testpop', genre: 'Synthpop' },
  { name: 'TMD', genre: 'Synthpop', suche: 'Test Manoeuvres in the Dark', auch: ['Test Manoeuvres in the Dark'] },
  { name: 'Testmetal', genre: 'Heavy Metal' },
];
const ID = { Testpop: 1990300001, 'Test Manoeuvres in the Dark': 1990300002, Testmetal: 1990300003 };
const album = (id, artistId, artist, name, preis, n = 10, extra = {}) => ({ wrapperType: 'collection', collectionType: 'Album', collectionId: id, collectionName: name, artistId, artistName: artist,
  collectionPrice: preis, trackCount: n, releaseDate: '1990-03-19T08:00:00Z', artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/Music/${id}/100x100bb.jpg`,
  collectionViewUrl: `https://music.apple.com/de/album/x/${id}?uo=4`, country: 'DEU', currency: 'EUR', ...extra });
const song = (id, artistId, artist, name, preis) => ({ wrapperType: 'track', kind: 'song', trackId: id, trackName: name, artistId, artistName: artist, collectionName: 'Album',
  trackPrice: preis, releaseDate: '1990-03-19T08:00:00Z', artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/Music/${id}/100x100bb.jpg`, trackViewUrl: `https://music.apple.com/de/album/x/1?i=${id}&uo=4`, country: 'DEU', currency: 'EUR' });

function abruf({ preise = {}, sucheLeer = [], wikidata = null } = {}) {
  const urls = [];
  const holeText = async url => {
    urls.push(url);
    const u = new URL(url);
    if (u.host === 'query.wikidata.org') return JSON.stringify(wikidata || { results: { bindings: [] } });
    if (u.pathname === '/search') {
      const t = u.searchParams.get('term');
      if (sucheLeer.includes(t) || !ID[t]) return JSON.stringify({ resultCount: 0, results: [] });
      return JSON.stringify({ resultCount: 2, results: [{ wrapperType: 'artist', artistType: 'Artist', artistName: `${t} Tribute Band`, artistId: 1 }, { wrapperType: 'artist', artistType: 'Artist', artistName: t, artistId: ID[t] }] });
    }
    if (u.pathname === '/lookup') {
      const id = Number(u.searchParams.get('id')), name = Object.keys(ID).find(k => ID[k] === id);
      const kopf = { wrapperType: 'artist', artistId: id, artistName: name };
      if (u.searchParams.get('entity') === 'album') return JSON.stringify({ results: [kopf,
        album(id * 10 + 1, id, name, 'Großes Album', preise[`${name}:a1`] ?? 4.99),
        album(id * 10 + 2, id, name, 'Teures Album', preise[`${name}:a2`] ?? 9.99),
        album(id * 10 + 3, id, name, 'Hit - Single', 1.29, 2),
        album(id * 10 + 4, id, name, 'Karaoke Hits made famous by X', 4.99),
        album(id * 10 + 5, 42, 'Various Artists', 'Sampler', 3.99, 20),
      ] });
      if (u.searchParams.get('entity') === 'song') return JSON.stringify({ results: [kopf, song(id * 10 + 6, id, name, 'Hit', 0.69), song(id * 10 + 7, id, name, 'Ballade', 1.29)] });
    }
    throw new Error(`unerwartet: ${url}`);
  };
  return { holeText, urls };
}
const lauf = (h, zustand, jetzt, extra = {}) => musikstore({ holeText: h, cfg: extra.cfg || cfg0, zustand, jetzt: new Date(jetzt), musikListe: extra.liste || { kuenstler: KUENSTLER }, vorherDatei: extra.vorherDatei || null });

test('Liste und Adressen: bekannte Künstler mit Genre-Spalte; Suche nur über die Schnittstelle /search, Alben/Songs über /lookup', () => {
  assert.ok(liste0.kuenstler.length >= 20);
  assert.ok(liste0.kuenstler.some(k => k.name === 'Depeche Mode') && liste0.kuenstler.some(k => k.name === 'OMD'));
  assert.deepEqual([...new Set(liste0.kuenstler.map(k => k.genre))].sort(), ['Heavy Metal', 'Synthpop']);
  assert.ok(schnittstelleFuer(suchUrl('Depeche Mode')), 'Künstlersuche = Programm-Schnittstelle (lib/schnittstellen.mjs)');
  assert.match(albenUrl(123), /\/lookup\?id=123&entity=album&limit=\d+&country=de$/);
  assert.match(songsUrl(123), /\/lookup\?id=123&entity=song&limit=25&country=de$/);
  assert.equal(nameNorm('Motörhead'), 'motorhead'); assert.equal(nameNorm('AC/DC'), 'ac dc'); assert.equal(nameNorm('The Human League'), 'human league');
  // nie ein Zufallstreffer
  assert.equal(waehleKuenstler([{ wrapperType: 'artist', artistName: 'Depeche Mode Tribute', artistId: 1 }], { name: 'Depeche Mode' }), null);
  assert.deepEqual(waehleKuenstler([{ wrapperType: 'artist', artistName: 'Orchestral Manoeuvres In the Dark', artistId: 7 }], { name: 'OMD', auch: ['Orchestral Manoeuvres in the Dark'] }), { id: 7, name: 'Orchestral Manoeuvres In the Dark' });
});

test('Alben/Songs lesen: Singles, EPs, Karaoke und fremde Sampler fallen weg; Apples Reihenfolge = Rang', () => {
  const k = { name: 'Testpop', id: 1990300001 };
  const res = [album(1, 1990300001, 'Testpop', 'A', 4.99), album(2, 1990300001, 'Testpop', 'B - EP', 3.99, 5), album(3, 1990300001, 'Testpop', 'C - Single', 1.29, 1), album(4, 9, 'Various Artists', 'D', 3.99, 20), album(5, 1990300001, 'Testpop', 'E', 7.99, 12, { country: 'USA', currency: 'USD' })];
  assert.deepEqual(albenAus(res, k).map(a => [a.titel, a.preis, a.rang]), [['A', 499, 1]]);
  assert.deepEqual(songsAus([song(9, 1990300001, 'Testpop', 'Hit', 0.69), { wrapperType: 'track', kind: 'music-video', trackId: 8, trackName: 'Video' }], k).map(s => s.titel), ['Hit']);
  // Wikidata-Ausweichweg: Abfrage und tolerantes Lesen, mehrdeutige Namen fallen weg
  assert.match(kuenstlerAbfrage(['Depeche Mode', 'Motörhead']), /"Depeche Mode"@en "Depeche Mode"@de "Motörhead"@en/);
  assert.match(kuenstlerAbfrage(['x']), /wdt:P2850/);
  const m = leseKuenstlerWikidata(JSON.stringify({ results: { bindings: [{ name: { value: 'Depeche Mode' }, id: { value: '148662' } }, { name: { value: 'Doppel' }, id: { value: '1' } }, { name: { value: 'Doppel' }, id: { value: '2' } }] } }));
  assert.equal(m.get('depeche mode'), 148662); assert.equal(m.has('doppel'), false);
});

test('Lauf: Künstler per Suche (auch mit eigenem Suchbegriff), Alben bis 4,99 €, Songs 0,69 €; Senkung eines teuren Albums zählt; reihum mit letztem Stand', async () => {
  const zustand = {};
  const cfg = mitCfg({ maxKuenstler: 2 });
  const a = abruf();
  const r1 = await lauf(a.holeText, zustand, '2026-11-28T10:00:00Z', { cfg });
  assert.deepEqual(r1.fehler, []);
  assert.equal(zustand.musikstore.k.TMD.id, 1990300002, 'eigener Suchbegriff, Apple-Name als „auch“');
  assert.ok(a.urls.some(u => u.includes('term=Test%20Manoeuvres%20in%20the%20Dark')));
  const d1 = r1.datei;
  assert.deepEqual(d1.alben.map(x => [x.kuenstlerListe, x.titel, x.preis]), [['Testpop', 'Großes Album', 4.99], ['TMD', 'Großes Album', 4.99]], 'nur 2 Künstler je Lauf, kein Single/Karaoke/Sampler, kein 9,99-€-Album');
  assert.deepEqual(d1.songs.map(x => [x.kuenstlerListe, x.titel, x.preis]), [['Testpop', 'Hit', 0.69], ['TMD', 'Hit', 0.69]]);
  assert.equal(d1.alben[0].genre, 'Synthpop'); assert.match(d1.alben[0].bild, /200x200bb\.jpg$/); assert.doesNotMatch(d1.alben[0].link, /uo=/);
  assert.equal(d1.zahlen.kuenstler, 3); assert.equal(d1.zahlen.gefunden, 3);
  // zweiter Lauf: Testmetal ist dran (am längsten nicht geprüft); Testpop/TMD bleiben mit ihrem Stand von gestern
  const r2 = await lauf(abruf().holeText, zustand, '2026-11-29T10:00:00Z', { cfg, vorherDatei: d1 });
  assert.deepEqual(r2.datei.alben.map(x => x.kuenstlerListe).sort(), ['TMD', 'Testmetal', 'Testpop']);
  assert.deepEqual(zustand.musikstore.r.Testmetal, Math.round(Date.parse('2026-11-29T00:00:00Z') / 864e5));
  // dritter Lauf: das teure Album von Testpop auf 5,99 € gesenkt (−40 %) -> steht als „gesenkt“ vorn, obwohl über 4,99 €
  const r3 = await lauf(abruf({ preise: { 'Testpop:a2': 5.99 } }).holeText, zustand, '2026-11-30T10:00:00Z', { cfg, vorherDatei: r2.datei });
  const g = r3.datei.alben.find(x => x.titel === 'Teures Album');
  assert.ok(g, 'gesenktes Album dabei');
  assert.equal(g.gesenkt, true); assert.equal(g.vorher, 9.99); assert.equal(g.preis, 5.99); assert.equal(r3.datei.alben[0].titel, 'Teures Album');
  // Stand zu alt: ein Künstler, der seit über frischTage nicht geprüft wurde, fällt aus der Datei (nichts Veraltetes)
  const alt = await lauf(abruf().holeText, structuredClone(zustand), '2026-12-09T10:00:00Z', { cfg: mitCfg({ maxKuenstler: 0 }), vorherDatei: r3.datei });
  assert.deepEqual(alt.datei.alben, []);
});

test('Nicht gefunden: Suche leer -> Wikidata (P2850); sonst ehrlich „nicht gefunden“, neue Suche erst nach einer Pause', async () => {
  const zustand = {};
  const wikidata = { results: { bindings: [{ name: { value: 'Testmetal' }, id: { value: '1990300003' } }] } };
  const a = abruf({ sucheLeer: ['Testpop', 'Testmetal'], wikidata });
  const r = await lauf(a.holeText, zustand, '2026-11-28T10:00:00Z');
  assert.equal(zustand.musikstore.k.Testmetal.id, 1990300003); assert.equal(zustand.musikstore.k.Testmetal.weg, 'wikidata');
  assert.ok(zustand.musikstore.k.Testpop.fehlt);
  assert.deepEqual(r.datei.status.musik.nichtGefunden, ['Testpop']);
  assert.ok(r.datei.kuenstler.find(k => k.name === 'Testpop').gefunden === false);
  // nächster Lauf: keine neue Suche nach Testpop (Pause)
  const b = abruf();
  await lauf(b.holeText, zustand, '2026-11-29T10:00:00Z');
  assert.ok(!b.urls.some(u => u.includes('term=Testpop')));
});
