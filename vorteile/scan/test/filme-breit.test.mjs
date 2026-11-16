// Breite Suche (Xander 16.11.2026): Top 200 je Genre (Filme und Staffeln) nur ZUSÄTZLICH zum bisherigen Weg.
// Beleg: dieselben Läufe ohne und mit breiter Suche – jeder bisherige Treffer bleibt (0 verloren), neue kommen dazu.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import filme, { STANDARD, chartUrl, serienChartUrl } from '../module/filme.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const cfg0 = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const listen = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
const JETZT = new Date('2026-11-07T12:00:00Z');
const tagPlus = n => new Date(JETZT.getTime() + n * 864e5);
const ohneBreit = (() => { const l = structuredClone(listen); delete l.charts.breit; return l; })();
const mitCfg = filmCfg => ({ ...cfg0, module: { ...cfg0.module, filme: { ...cfg0.module.filme, ...filmCfg } } });

// Drama-Chart (4406, neu in der breiten Suche): zwei billige Filme, ein teurer, einer nur zum Leihen billig, einer Horror
const FILME = [
  { id: 1990000001, name: 'Breit Drama Eins', kauf: 3.99, leihe: 3.99, genre: 'Drama' },
  { id: 1990000002, name: 'Breit Drama Zwei', kauf: 1.99, leihe: null, genre: 'Drama' },
  { id: 1990000003, name: 'Breit Teuer', kauf: 9.99, leihe: 4.99, genre: 'Drama' },
  { id: 1990000004, name: 'Breit Nur Leihen', kauf: 13.99, leihe: 3.99, genre: 'Drama' },
  { id: 1990000005, name: 'Breit Grusel', kauf: 2.99, leihe: null, genre: 'Horror' },
  { id: 1990000006, name: 'Breit Unbekannt', kauf: 1.99, leihe: null, genre: 'Drama', unbekannt: true },
];
const STAFFEL = { id: 1990000101, name: 'Breitserie, Staffel 1', serie: 'Breitserie' };
const eintrag = (f, preis) => ({
  'im:name': { label: f.name }, 'im:price': { label: `${preis} €`, attributes: { amount: String(preis), currency: 'EUR' } },
  ...(f.leihe ? { 'im:rentalPrice': { label: `${f.leihe} €`, attributes: { amount: String(f.leihe), currency: 'EUR' } } } : {}),
  'im:image': [{ label: `https://is1-ssl.mzstatic.com/image/thumb/x/${f.id}/170x170bb.jpg`, attributes: { height: '170' } }],
  id: { label: `https://itunes.apple.com/de/movie/x/id${f.id}?uo=2`, attributes: { 'im:id': String(f.id) } },
  link: [{ attributes: { rel: 'alternate', href: `https://itunes.apple.com/de/movie/x/id${f.id}?uo=2` } }],
  category: { attributes: { 'im:id': f.genre === 'Horror' ? '4408' : '4406', label: f.genre || 'Drama' } },
  'im:releaseDate': { label: '2012-05-01T00:00:00-07:00' }, summary: { label: 'Ein ruhiger Film.' },
});
const film = f => ({
  wrapperType: 'track', kind: 'feature-movie', trackId: f.id, trackName: f.name, trackPrice: f.kauf, trackHdPrice: f.kauf,
  ...(f.leihe ? { trackRentalPrice: f.leihe, trackHdRentalPrice: f.leihe } : {}), primaryGenreName: f.genre, releaseDate: '2012-05-01T07:00:00Z',
  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${f.id}/100x100bb.jpg`, trackViewUrl: `https://itunes.apple.com/de/movie/x/id${f.id}?uo=4`,
  country: 'DEU', currency: 'EUR',
});
const staffel = preis => ({
  wrapperType: 'collection', collectionType: 'TV Season', collectionId: STAFFEL.id, collectionName: STAFFEL.name, artistName: STAFFEL.serie,
  collectionPrice: preis, collectionHdPrice: preis, trackCount: 8, primaryGenreName: 'Drama', releaseDate: '2020-01-01T07:00:00Z',
  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/x/${STAFFEL.id}/100x100bb.jpg`, collectionViewUrl: `https://itunes.apple.com/de/tv-season/x/id${STAFFEL.id}?uo=4`,
  country: 'DEU', currency: 'EUR',
});

function abruf({ staffelPreis = 19.99 } = {}) {
  const h = macheFixtureAbruf(FIX, FIXTURE_KARTE);
  const z = { urls: [] };
  z.holeText = async (url, o) => {
    z.urls.push(url);
    if (url.includes('/rss/topmovies/') && url.includes('genre=4406')) return JSON.stringify({ feed: { entry: FILME.map(f => eintrag(f, f.kauf)) } });
    if (url.includes('/rss/toptvseasons/') && url.includes('genre=4001')) return JSON.stringify({ feed: { entry: [{ ...eintrag({ ...STAFFEL, genre: 'Drama' }, staffelPreis), 'im:rentalPrice': undefined }] } });
    if (/\/rss\/top(movies|tvseasons)\/limit=200\/genre=/.test(url) && !/genre=44(0[13]|04|1[036])\//.test(url)) return JSON.stringify({ feed: {} });
    // Qualität (Wikidata) der neuen Titel: bekannt und gut bewertet – außer „Breit Unbekannt“ (kein Eintrag)
    if (url.includes('query.wikidata.org') && url.includes('19900000')) {
      const bindings = FILME.filter(f => url.includes(String(f.id)) && !f.unbekannt).map(f => ({ key: { value: String(f.id) }, weg: { value: 'id' }, item: { value: `http://www.wikidata.org/entity/Q${f.id}` }, l: { value: '40' }, jahr: { value: '2012' }, rt: { value: '90 %' }, lab: { value: f.name } }));
      return JSON.stringify({ results: { bindings } });
    }
    if (url.includes('itunes.apple.com/lookup?') && url.includes('19900001')) {
      const ids = new Set(new URL(url).searchParams.get('id').split(','));
      return JSON.stringify({ results: [...FILME.map(film), staffel(staffelPreis)].filter(r => ids.has(String(r.trackId ?? r.collectionId))) });
    }
    return h(url, o);
  };
  z.apple = () => z.urls.filter(u => u.includes('itunes.apple.com')).length;
  return z;
}
const ctx = (holeText, zustand, jetzt, filmListen, cfg = cfg0) => ({ holeText, cfg, wunschliste: {}, zustand, jetzt, filmListen });
const ids = g => (g || []).map(t => t.id);

test('breite Suche: Adressen (Top 200 je Genre, Filme und Staffeln), bisherige Adresse unverändert', () => {
  assert.equal(chartUrl(4406, 200), 'https://itunes.apple.com/de/rss/topmovies/limit=200/genre=4406/json');
  assert.equal(chartUrl(4404), 'https://itunes.apple.com/de/rss/topmovies/limit=100/genre=4404/json');
  assert.equal(serienChartUrl(4001, 200), 'https://itunes.apple.com/de/rss/toptvseasons/limit=200/genre=4001/json');
  assert.ok(listen.charts.breit.filme.length >= 15 && listen.charts.breit.serien.length >= 10);
  assert.ok(!listen.charts.breit.filme.some(g => g.id === 4408), 'Horror nie');
});

test('breite Suche: alle bisherigen Treffer bleiben (0 verloren), neue Filme ≤ 3,99 € (Kauf) zusätzlich, Leihen zählt nicht, Horror nie, ≤ 40 Apple-Abrufe', async () => {
  for (const filmCfg of [{}, { maxGruppe: 2, maxAngebot: 3 }]) { // auch mit knappen Kappen: kein neuer Treffer verdrängt einen alten
    const cfg = mitCfg(filmCfg);
    const a = abruf(), b = abruf();
    const ra = await filme(ctx(a.holeText, {}, JETZT, ohneBreit, cfg));
    const rb = await filme(ctx(b.holeText, {}, JETZT, listen, cfg));
    for (const [g, liste] of Object.entries(ra.datei.gruppen)) {
      const nachher = new Set(ids(rb.datei.gruppen[g]));
      const verloren = ids(liste).filter(id => !nachher.has(id));
      assert.deepEqual(verloren, [], `Gruppe ${g} (${JSON.stringify(filmCfg)}): verloren ${verloren}`);
    }
    const f399 = ids(rb.datei.gruppen.fuer399);
    assert.ok(f399.includes('itunes:1990000001') && f399.includes('itunes:1990000002'), `neu in „Für 3,99 €“: ${f399}`);
    assert.ok(!f399.includes('itunes:1990000003') && !f399.includes('itunes:1990000004'), 'teuer bzw. nur Leihen 3,99 € gehört nicht dazu');
    assert.ok(!f399.includes('itunes:1990000006'), 'neuer Chart-Titel ohne Wikidata-Daten: nicht (Platz im Nischen-Genre zählt nicht)');
    assert.ok(!Object.values(rb.datei.gruppen).flat().some(t => t.id === 'itunes:1990000005'), 'Horror nie');
    const t = rb.datei.gruppen.fuer399.find(x => x.id === 'itunes:1990000001');
    assert.equal(t.preis, 3.99); assert.equal(t.leihe, 3.99); assert.ok(t.bild && t.link);
    assert.ok(b.apple() <= STANDARD.breitGesamtMax, `Apple-Abrufe ${b.apple()}`);
    const st = rb.datei.status['apple-breit'];
    assert.ok(st.ok && st.charts > 0 && st.filme >= 2, JSON.stringify(st));
    assert.equal(ra.datei.status['apple-breit'].charts, 0, 'ohne charts.breit: aus');
    // bisheriger Weg unverändert: dieselben Abrufe in derselben Reihenfolge, bevor die breite Suche beginnt
    const ersterBreit = b.urls.findIndex(u => /limit=200/.test(u));
    assert.deepEqual(b.urls.slice(0, ersterBreit).filter(u => u.includes('itunes.apple.com')), a.urls.filter(u => u.includes('itunes.apple.com')));
  }
});

test('breite Suche: Staffel nur mit echter Senkung gegenüber dem selbst gesehenen Chart-Preis (eigene Historie)', async () => {
  const nurSerien = structuredClone(listen);
  nurSerien.charts.breit.filme = [];
  const zustand = {};
  let r = await filme(ctx(abruf({ staffelPreis: 19.99 }).holeText, zustand, JETZT, nurSerien));
  assert.ok(!r.datei.gruppen.serien.some(t => t.id === `itunes:${STAFFEL.id}`), 'erster Blick: kein Vergleich, kein Angebot');
  assert.deepEqual(zustand.filme.breit.p[String(STAFFEL.id)].slice(0, 3), [1999, 1999, 0]);
  // nächster Tag: 9,99 € (Chart und Lookup) -> 50 % unter dem zuletzt gesehenen Preis
  r = await filme(ctx(abruf({ staffelPreis: 9.99 }).holeText, zustand, tagPlus(1), nurSerien));
  const t = r.datei.gruppen.serien.find(x => x.id === `itunes:${STAFFEL.id}`);
  assert.ok(t, 'gesenkte Staffel unter „Serien“');
  assert.equal(t.preis, 9.99); assert.equal(t.vorher, 19.99); assert.equal(t.angebot, true); assert.equal(t.wunsch, false);
  assert.equal(t.ersparnis.pct, 50);
  // krummer Chart-Preis (Season-Pass) zählt nicht als Vergleich
  const z2 = {};
  await filme(ctx(abruf({ staffelPreis: 17.94 }).holeText, z2, JETZT, nurSerien));
  assert.equal(z2.filme.breit.p[String(STAFFEL.id)], undefined);
});

// Beleg aus echten Läufen (gleicher Daten-Stand): Roh-Lauf auf main ohne breite Suche gegen Roh-Lauf mit breiter Suche.
// Jeder bisherige Treffer ist nachher noch da – ein Verlust wäre nur erlaubt, wenn die Quelle den Eintrag selbst nicht mehr
// hat (dann steht der Grund in „verloren“).
test('Beleg echte Läufe: alter Treffer-Satz vollständig erhalten, neue Treffer zusätzlich', async () => {
  const b = JSON.parse(await readFile(join(FIX, 'filme-breit-beleg.json'), 'utf8'));
  let neu = 0;
  for (const [g, x] of Object.entries(b.gruppen)) {
    const nachher = new Set(x.nachherIds);
    const erklaert = new Set(x.verloren.filter(v => v.grund).map(v => v.id));
    const fehlt = x.vorherIds.filter(id => !nachher.has(id) && !erklaert.has(id));
    assert.deepEqual(fehlt, [], `Gruppe ${g}: ohne Grund verloren`);
    assert.equal(x.nachherIds.length, new Set(x.nachherIds).size, `Gruppe ${g}: keine Doppel`);
    neu += x.neu.length;
  }
  assert.ok(b.gruppen.fuer399.neu.length > 0 && neu > 0, 'neue Treffer');
  assert.ok(b.abrufe.nachher <= STANDARD.breitGesamtMax, `Apple-Abrufe ${b.abrufe.nachher}`);
  assert.ok(b.gruppen.fuer399.neu.every(t => t.preis != null && t.preis <= STANDARD.angebotPreis), '„Für 3,99 €“ nur mit Kaufpreis ≤ 3,99 €');
});
