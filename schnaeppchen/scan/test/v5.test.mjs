// Fassung 5 (Xander 08.11.2026: „Lachgummi-Softies, Knusperflocken XXL, Leckermäulchen, Exquisa-Quark … in jedem Bereich
// auf jeden Fall was finden … was das Nächste ist“):
// - Suchwörter, die in Prospekten wirklich stehen (nimm2 Lachgummi, HARIBO versch. Sorten) + andere Sorten ausschließen
// - neue Produkte (Zetti Knusperflocken, Leckermäulchen, Exquisa Quark/Frischkäse) mit Zuordnung an ECHTEN Prospekttiteln
// - kaufDA als zweite Prospekt-Quelle (Region Chemnitz bzw. bundesweit), echte Seite vom 31.10.2026 als Fixture
// - „zuletzt gesehen“ statt nur „Gerade kein Angebot“, mydealz-Merkliste über mehrere Läufe, marktguru-Folgeseiten
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { passt, sorteNurGenerisch } from '../text.mjs';
import { kaufda, kaufdaAngebot, leseKaufdaSeite, grundpreisAus, kaufdaSlug, kaufdaZeit } from '../sources/kaufda.mjs';
import { marktguru } from '../sources/marktguru.mjs';
import { ladeReferenz, zuletztGesehen } from '../referenz.mjs';
import { scan } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FIX = join(HIER, 'fixtures');
const BASIS = join(HIER, '..', '..');
const cfg = JSON.parse(await readFile(join(BASIS, 'config.json'), 'utf8'));
const watchlist = JSON.parse(await readFile(join(BASIS, 'watchlist.json'), 'utf8'));
const referenz = JSON.parse(await readFile(join(BASIS, 'referenzpreise.json'), 'utf8'));
const item = id => watchlist.produkte.find(p => p.id === id);
const HARIBO = await readFile(join(FIX, 'kaufda-haribo.html'), 'utf8');
const KNOPPERS_CHEMNITZ = await readFile(join(FIX, 'kaufda-chemnitz-knoppers.html'), 'utf8');

test('watchlist: die von Xander genannten Produkte sind drin, jedes mit Suchwort, kaufDA-Stichwort und Referenzpreisen', () => {
  for (const id of ['softys-fruchtmix', 'softys-rote-fruechte', 'zetti-knusperflocken', 'leckermaeulchen', 'exquisa-quark', 'exquisa-frischkaese']) {
    const p = item(id);
    assert.ok(p, id);
    assert.ok(p.suche?.length && p.kaufda?.length && p.muss?.length, id);
    assert.ok(referenz.produkte.some(r => r.id === id), `${id}: referenzpreise.json`);
  }
  // Kein Suchwort mehr, das in keinem Prospekt steht („Lachgummi Softys“, „Haribo Colorado“)
  const suchen = watchlist.produkte.flatMap(p => p.suche);
  assert.ok(!suchen.includes('Lachgummi Softys') && !suchen.includes('Haribo Colorado') && !suchen.includes('Haribo Tropi Frutti'));
  // breite Suchwörter werden geteilt: weniger Abrufe als Produkte
  assert.ok(new Set(suchen).size < watchlist.produkte.length);
});

test('Zuordnung an echten Prospekttiteln (Kaufland/Lidl/Netto/REWE/Aldi 2026): Lachgummi, Haribo-Sorten', () => {
  const fm = item('softys-fruchtmix'), rot = item('softys-rote-fruechte'), col = item('haribo-colorado'), tro = item('haribo-tropi-frutti');
  // Kaufland KW 11: „STORCK Nimm2 Lachgummi … versch. Sorten“ – früher nie gefunden (Suche/muss „Softys“)
  const kl = 'STORCK Nimm2 Lachgummi versch. Sorten, ausgenommen Kassenartikel';
  assert.ok(passt(kl, fm) && passt(kl, rot));
  assert.ok(sorteNurGenerisch(kl, fm), 'Sorte nicht genannt');
  // Aldi KW 2: „nimm2 Lachgummi Softies“ ohne Sorte -> zählt (sorteOffen), REWE „Nimm 2 Lachgummi … je 250-g-Btl“ auch
  assert.ok(passt('Storck nimm2 Lachgummi Softies', fm) && passt('Storck nimm2 Lachgummi Softies', rot));
  assert.ok(passt('Nimm 2 Lachgummi versch. Sorten, je 250-g-Btl', fm));
  // eine andere Sorte ausdrücklich genannt -> nicht
  assert.ok(!passt('Storck nimm2 Lachgummi Funfari', fm));
  assert.ok(!passt('nimm2 Lachgummi Softies Rote Früchte 225 g', fm));
  assert.ok(passt('nimm2 Lachgummi Softies Rote Früchte 225 g', rot) && !sorteNurGenerisch('nimm2 Lachgummi Softies Rote Früchte 225 g', rot));
  assert.ok(!passt('nimm2 Lachgummi Minis', fm), 'Minis sind eine andere Packung');
  // Haribo: Kaufland „Color-Rado oder Phantasia“, Lidl „XXL Versch. Sorten. Je 340/300 g“
  assert.ok(passt('HARIBO Color-Rado oder Phantasia 1 kg', col) && !passt('HARIBO Color-Rado oder Phantasia 1 kg', tro));
  assert.ok(passt('HARIBO XXL Versch. Sorten. Je 340/300 g', col) && passt('HARIBO XXL Versch. Sorten. Je 340/300 g', tro));
  assert.ok(!passt('HARIBO Goldbären je 175 g', col), 'Goldbären „je 175 g“ ist kein Colorado');
  assert.ok(!passt('Haribo Goldbären Mix Minis 425 g', tro));
  assert.ok(passt('HARIBO Tropifrutti 175 g', tro) && !passt('HARIBO Tropifrutti 175 g', col));
  assert.ok(!passt('HARIBO Party-Box versch. Sorten 750-g-Dose', col));
});

test('Zuordnung an echten Prospekttiteln: Zetti Knusperflocken, Leckermäulchen, Exquisa Quark / Frischkäse', () => {
  const z = item('zetti-knusperflocken'), l = item('leckermaeulchen'), q = item('exquisa-quark'), f = item('exquisa-frischkaese');
  assert.ok(passt('Zetti Knusperflocken je 270-g-Btl', z));
  assert.ok(passt('Zetti Knusperflocken klassik, je 130-g-Btl.', z));
  assert.ok(!passt('Zetti Happz Kokos je 130-g-Pckg', z));
  assert.ok(passt('LECKER- MÄULCHEN Milch-Quark 150 g', l), 'Lidl schreibt es getrennt');
  assert.ok(passt('Frischli Leckermäulchen Vanille, je 6 x 50-g-Pckg', l));
  // Exquisa: Quark-Genuss ≠ Frischkäse ≠ Skyr/Quark-Joghurt-Creme ≠ Käsekuchen-Snack
  assert.ok(passt('EXQUISA Quark-Genuss', q) && !passt('EXQUISA Quark-Genuss', f));
  assert.ok(passt('Exquisa Quark Creme gekühlt, versch. Sorten', q));
  assert.ok(passt('EXQUISA Frischkäsezubereitung versch. Sorten, Magerstufe - Doppelrahmstufe', f) && !passt('EXQUISA Frischkäsezubereitung', q));
  assert.ok(passt('Exquisa Der Sahnige 65% Fett i.Tr., je 200-g-Becher', f));
  const skyr = 'EXQUISA Fitline Protein Skyr Vanille oder Zero Frischkäsezubereitung oder Quark-Joghurt-Creme, versch. Sorten';
  assert.ok(!passt(skyr, q) && !passt(skyr, f));
  assert.ok(!passt('EXQUISA Käsekuchen-Snack', q) && !passt('EXQUISA Käsekuchen-Snack', f));
  assert.ok(!passt('Exquisa Körniger Frischkäse 200 g', f), 'körniger Frischkäse ist ein anderes Produkt');
});

test('kaufDA: echte Seite /Angebote/Haribo (31.10.2026) – Datenblock, Felder, Grundpreis nur eindeutig', () => {
  const s = leseKaufdaSeite(HARIBO);
  assert.equal(s.ort, 'Berlin');
  assert.equal(s.url, 'https://www.kaufda.de/Angebote/Haribo');
  assert.equal(s.items.length, 18);
  const lidl = s.items.map(o => kaufdaAngebot(o, { seite: s.url, ort: 'bundesweit (Berlin)' })).find(a => a.shop === 'Lidl');
  assert.equal(lidl.titel, 'HARIBO XXL');
  assert.equal(lidl.beschreibung, 'Versch. Sorten. Je 340/300 g');
  assert.equal(lidl.preis, 0.99);
  assert.equal(lidl.preisAlt, 1.49);
  assert.equal(lidl.vorherQuelle, 'Streichpreis im Prospekt');
  assert.equal(lidl.refPreis, null, '„1 kg = 2.91/3.30“ ist nicht eindeutig');
  assert.equal(lidl.gueltigBis, '2026-10-31T22:00:00.000Z');
  assert.equal(lidl.regional, true);
  assert.equal(lidl.quelle, 'kaufda');
  const rewe = kaufdaAngebot(s.items[0], { seite: s.url, ort: 'x' });
  assert.equal(rewe.titel, 'Haribo Fruchtgummi Minis');
  assert.deepEqual(rewe.refPreis, { preis: 7.16, einheit: 'kg' });
  assert.deepEqual(rewe.packMenge, { gramm: 250 }, '1,79 € ÷ 7,16 €/kg = 250 g, passt zu „250-g-Btl.“');
  assert.equal(rewe.packWiderspruch, false);
  assert.throws(() => leseKaufdaSeite('<html>keine Daten</html>'), /__NEXT_DATA__/);
});

test('kaufDA: Grundpreis-Formate, Stichwort, Zeit', () => {
  assert.deepEqual(grundpreisAus('(1 kg = 7.16)'), { preis: 7.16, einheit: 'kg' });
  assert.deepEqual(grundpreisAus('1 kg = 7.04'), { preis: 7.04, einheit: 'kg' });
  assert.deepEqual(grundpreisAus('€5.66/kg'), { preis: 5.66, einheit: 'kg' });
  assert.deepEqual(grundpreisAus('€ 5.71/1 kg'), { preis: 5.71, einheit: 'kg' });
  assert.deepEqual(grundpreisAus('1 l = 8,58'), { preis: 8.58, einheit: 'l' });
  assert.deepEqual(grundpreisAus('100 g = 0,99 €'), { preis: 0.99, einheit: '100g' });
  for (const s of ['1kg = 8,14/7,98/7,16', '1 kg = 5.21 - 4.76', '0.08 je Stück', '(1 kg = 3.05 - 4.95) / (1 kg = 2.71 - 4.40)**', '', null]) assert.equal(grundpreisAus(s), null, String(s));
  assert.equal(kaufdaSlug('Leckermäulchen'), 'Leckermaeulchen');
  assert.equal(kaufdaSlug("Ben & Jerry's"), 'Ben-Jerrys');
  assert.equal(kaufdaSlug('Choco Crossies'), 'Choco-Crossies');
  assert.equal(kaufdaZeit('2026-10-31T18:00:00.000+0000'), '2026-10-31T18:00:00.000Z');
  assert.equal(kaufdaZeit(''), null);
});

test('kaufDA-Quelle: Stadt Chemnitz zuerst, ohne Stadtseite einmal bundesweit, unbekanntes Stichwort = Hinweis statt Störung', async () => {
  const abrufe = [];
  const seiten = {
    'https://www.kaufda.de/Chemnitz/Angebote/Knoppers': KNOPPERS_CHEMNITZ,
    'https://www.kaufda.de/Angebote/Haribo': HARIBO,
  };
  const holeText = async url => { abrufe.push(url); if (seiten[url]) return seiten[url]; throw new Error('HTTP 404 bei www.kaufda.de'); };
  const wl = { produkte: [{ id: 'a', kaufda: ['Knoppers'] }, { id: 'b', kaufda: ['Haribo'] }, { id: 'c', kaufda: ['Gibtsnicht'] }] };
  const r = await kaufda({ holeText, cfg, watchlist: wl });
  assert.equal(abrufe[0], 'https://www.kaufda.de/Chemnitz/Angebote/Knoppers');
  // Haribo: Chemnitz 404 -> bundesweit; Chemnitz hat Seiten (Knoppers), also bleibt die Stadt für die nächsten Stichwörter
  assert.deepEqual(abrufe.slice(1), ['https://www.kaufda.de/Chemnitz/Angebote/Haribo', 'https://www.kaufda.de/Angebote/Haribo', 'https://www.kaufda.de/Chemnitz/Angebote/Gibtsnicht', 'https://www.kaufda.de/Angebote/Gibtsnicht']);
  assert.deepEqual(r.fehler, []);
  assert.match(r.hinweis, /ohne kaufDA-Seite: Gibtsnicht/);
  const kn = r.angebote.filter(a => /knoppers/i.test(a.titel));
  assert.ok(kn.length >= 5 && kn.every(a => a.region === 'Chemnitz'));
  const hb = r.angebote.filter(a => /haribo/i.test(a.titel));
  assert.ok(hb.length >= 10 && hb.every(a => a.region === 'bundesweit (Berlin)'));
  // Penny „Knoppers Riegel … Nur mit App“ -> nurMitApp
  assert.equal(kn.find(a => a.shop === 'Penny' && a.preis === 1.49).nurMitApp, true);
  // erstes Stichwort geraten (gibt es weder in Chemnitz noch bundesweit): die Stadt bleibt für die anderen Stichwörter an
  const abrufe2 = [];
  const r2 = await kaufda({ holeText: async url => { abrufe2.push(url); return holeText(url); }, cfg, watchlist: { produkte: [{ id: 'g', kaufda: ['Gibtsnicht'] }, { id: 'a', kaufda: ['Knoppers'] }] } });
  assert.deepEqual(abrufe2, ['https://www.kaufda.de/Chemnitz/Angebote/Gibtsnicht', 'https://www.kaufda.de/Angebote/Gibtsnicht', 'https://www.kaufda.de/Chemnitz/Angebote/Knoppers']);
  assert.ok(r2.angebote.length >= 5 && r2.angebote.every(a => a.region === 'Chemnitz'));
  // Stadt ohne Seiten (Stadt-404, bundesweit da, noch keine Stadtseite gesehen): danach gleich bundesweit
  const abrufe3 = [];
  await kaufda({ holeText: async url => { abrufe3.push(url); return holeText(url); }, cfg, watchlist: { produkte: [{ id: 'b', kaufda: ['Haribo'] }, { id: 'g', kaufda: ['Gibtsnicht'] }] } });
  assert.deepEqual(abrufe3, ['https://www.kaufda.de/Chemnitz/Angebote/Haribo', 'https://www.kaufda.de/Angebote/Haribo', 'https://www.kaufda.de/Angebote/Gibtsnicht']);
  // alles kaputt -> Fehler der Quelle
  await assert.rejects(kaufda({ holeText: async () => { throw new Error('Zeitüberschreitung bei www.kaufda.de'); }, cfg, watchlist: wl }), /Zeitüberschreitung/);
});

const leererFeed = '<?xml version="1.0"?><rss version="2.0"><channel><title>x</title></channel></rss>';
const MG_LEER = '{"totalResults":0,"results":[]}';
function netz({ kaufdaSeiten = {}, mydealz = {}, marktguru = {} } = {}) {
  const abrufe = [];
  const holeText = async url => {
    abrufe.push(url);
    const u = new URL(url);
    if (u.host === 'www.kaufda.de') { if (kaufdaSeiten[u.pathname]) return kaufdaSeiten[u.pathname]; throw new Error('HTTP 404 bei www.kaufda.de'); }
    if (u.host === 'api.marktguru.de') return marktguru[u.searchParams.get('q')] || MG_LEER;
    if (u.host === 'www.mydealz.de') return mydealz[u.pathname] || leererFeed;
    throw new Error(`kein Netz: ${url}`);
  };
  return { holeText, abrufe };
}
const env = { MARKTGURU_API_KEY: 'x', MARKTGURU_CLIENT_KEY: 'y' };

test('Scan mit kaufDA: Haribo Colorado bekommt die Region als Angebot – mit Hinweis, ohne Push, nicht im Verlauf', async () => {
  const n = netz({ kaufdaSeiten: { '/Angebote/Haribo': HARIBO } });
  const r = await scan({ cfg, watchlist, history: null, sent: {}, holeText: n.holeText, env, jetzt: new Date('2026-10-30T12:00:00Z') });
  const q = r.current.quellen.find(x => x.name === 'kaufda');
  assert.equal(q.ok, true);
  assert.match(q.hinweis, /keine kaufDA-Seite für Chemnitz/);
  const col = r.current.produkte.find(p => p.id === 'haribo-colorado');
  // Kaufland „Party-Box“ (Dose), Minis, Chamallows, Weihnachtsbeutel, METRO, Müller, Action, Netto Scottie zählen nicht
  const alle = [col.bestes, ...col.weitere].filter(Boolean);
  assert.ok(alle.length >= 1);
  assert.ok(alle.every(a => ['Lidl', 'Penny', 'REWE', 'EDEKA', 'Kaufland'].includes(a.shop)), alle.map(a => a.shop).join());
  const lidl = alle.find(a => a.shop === 'Lidl');
  assert.equal(lidl.preis, 0.99);
  assert.equal(lidl.regional, true);
  assert.equal(lidl.region, 'bundesweit (Berlin)');
  assert.equal(lidl.sorteUnklar, true);
  assert.equal(lidl.hinweis, 'Prospekt bundesweit (Berlin) – in Döbeln prüfen · Sorte nicht genannt („versch. Sorten“)');
  assert.equal(lidl.deal, false, 'Region ist nie ein Push');
  assert.ok(!r.msgs.some(m => /Haribo/i.test(m.title)));
  assert.equal(col.anzahlRegion, alle.length);
  assert.match(col.tiefst.text, /in der Region/);
  assert.equal(r.history.gruppen['haribo-colorado'], undefined, 'Region kommt nicht in den eigenen Verlauf');
  // Penny „HARIBO Fruchtgummi Versch. Sorten 340 g“ startet erst am 2.11. -> „ab …“
  const penny = alle.find(a => a.shop === 'Penny' && a.preis === 1.29);
  assert.equal(penny.startetSpaeter, true);
});

test('Scan: dasselbe Angebot bei marktguru (Döbeln) und kaufDA -> nur Döbeln, Döbeln ist immer die Hauptkarte', async () => {
  const mgLidl = JSON.stringify({ totalResults: 1, results: [{
    id: 99, advertisers: [{ name: 'Lidl' }], brand: { name: 'HARIBO' }, product: { name: 'XXL' }, description: 'Versch. Sorten. Je 340/300 g',
    price: 0.99, referencePrice: 3.3, volume: 0.3, unit: { shortName: 'kg' }, validityDates: [{ from: '2026-10-25T23:00:00Z', to: '2026-10-31T22:00:00Z' }] }] });
  const n = netz({ kaufdaSeiten: { '/Angebote/Haribo': HARIBO }, marktguru: { Haribo: mgLidl } });
  const r = await scan({ cfg, watchlist, history: null, sent: {}, holeText: n.holeText, env, jetzt: new Date('2026-10-30T12:00:00Z') });
  const col = r.current.produkte.find(p => p.id === 'haribo-colorado');
  assert.equal(col.bestes.shop, 'Lidl');
  assert.equal(col.bestes.quelle, 'marktguru');
  assert.equal(col.bestes.regional, false);
  assert.ok(![col.bestes, ...col.weitere].some(a => a.shop === 'Lidl' && a.regional), 'kaufDA-Doppel weg');
  assert.ok(col.weitere.some(a => a.regional), 'Region steht darunter');
});

test('„Gerade kein Angebot“ ist nie leer: zuletzt gesehen aus Verlauf bzw. Recherche', async () => {
  const refs = ladeReferenz(referenz, watchlist);
  const z = zuletztGesehen(null, refs['exquisa-quark'], '100g');
  assert.deepEqual([z.pack, z.packung, z.shop, z.monat, z.eigen], [1.49, '500 g', 'Lidl', 'Aug. 2026', false]);
  const n = netz();
  const r = await scan({ cfg, watchlist, history: null, sent: {}, holeText: n.holeText, env, jetzt: new Date('2026-11-08T12:00:00Z') });
  for (const p of r.current.produkte) {
    assert.equal(p.bestes, null, p.id);
    assert.match(p.tiefst.text, /^Gerade kein Angebot · zuletzt (gesehen )?[\d,]+ € \(.+\) bei .+/, p.id);
  }
  assert.equal(r.current.produkte.find(p => p.id === 'exquisa-quark').tiefst.text, 'Gerade kein Angebot · zuletzt gesehen 1,49 € (500 g) bei Lidl, Aug. 2026');
});

test('mydealz-Merkliste: ein Laden-Deal bleibt sichtbar, auch wenn er aus dem Feed gerutscht ist – bis zu seinem Ende', async () => {
  const deal = `<?xml version="1.0"?><rss version="2.0" xmlns:pepper="http://www.pepper.com/rss"><channel><title>x</title><item>
    <title><![CDATA[[Penny] Exquisa Quark-Genuss 500 g für 1,29 € ab Montag 9.11.]]></title>
    <link>https://www.mydealz.de/deals/penny-exquisa-quark-genuss-2870001</link>
    <description><![CDATA[<p>Ab Montag den 9.11. gibt es bei Penny den Exquisa Quark-Genuss 500 g für 1,29 Euro, bis Samstag 14.11.</p>]]></description>
    <pubDate>Sat, 07 Nov 2026 18:00:00 +0100</pubDate><pepper:merchant name="Penny" price="1,29€" /></item></channel></rss>`;
  const n1 = netz({ mydealz: { '/rss/new': deal } });
  const r1 = await scan({ cfg, watchlist, history: null, sent: {}, holeText: n1.holeText, env, jetzt: new Date('2026-11-08T12:00:00Z') });
  const q1 = r1.current.produkte.find(p => p.id === 'exquisa-quark');
  assert.equal(q1.bestes.shop, 'Penny');
  assert.equal(q1.bestes.preis, 1.29);
  assert.equal(r1.merkliste.items.length, 1);
  assert.ok(Date.parse(r1.merkliste.items[0].merkBis) >= Date.parse('2026-11-14T22:00:00Z'));
  // Nächster Lauf: Feed leer (Deal ist rausgerutscht) -> aus der Merkliste
  const n2 = netz();
  const r2 = await scan({ cfg, watchlist, history: r1.history, sent: r1.sent, merkliste: r1.merkliste, holeText: n2.holeText, env, jetzt: new Date('2026-11-10T12:00:00Z') });
  const q2 = r2.current.produkte.find(p => p.id === 'exquisa-quark');
  assert.equal(q2.bestes?.shop, 'Penny');
  assert.equal(r2.merkliste.items.length, 1);
  // Nach dem Ende: weg, auch aus der Merkliste
  const r3 = await scan({ cfg, watchlist, history: r2.history, sent: r2.sent, merkliste: r2.merkliste, holeText: netz().holeText, env, jetzt: new Date('2026-11-15T12:00:00Z') });
  assert.equal(r3.current.produkte.find(p => p.id === 'exquisa-quark').bestes, null);
  assert.equal(r3.merkliste.items.length, 0);
  // Technik-Preisfehler kommen nie aus der Merkliste
  assert.deepEqual(r2.current.technik, []);
});

test('marktguru: breite Suchwörter mit mehr als 48 Treffern -> Folgeseite (offset), jedes Angebot einmal', async () => {
  const roh = i => ({ id: i, advertisers: [{ name: 'Kaufland' }], brand: { name: 'HARIBO' }, product: { name: `Sorte ${i}` }, price: 1, validityDates: [{}] });
  const abrufe = [];
  const holeText = async url => {
    abrufe.push(url);
    const off = Number(new URL(url).searchParams.get('offset'));
    const alle = Array.from({ length: 60 }, (_, i) => roh(i + 1));
    return JSON.stringify({ totalResults: 60, results: alle.slice(off, off + 48) });
  };
  const wl = { produkte: [{ suche: ['Haribo'] }, { suche: ['Haribo'] }] };
  const r = await marktguru({ holeText, cfg, watchlist: wl, env });
  assert.equal(abrufe.length, 2);
  assert.match(abrufe[1], /offset=48/);
  assert.equal(r.angebote.length, 60);
});

test('kaufDA nur alle 3 Stunden (quellen-cache.json); bei Ausfall bis 24 h der letzte Stand – mit Hinweis', async () => {
  const seiten = { '/Angebote/Haribo': HARIBO };
  let kaputt = false;
  const n = netz({ kaufdaSeiten: seiten });
  const hole = async url => { if (kaputt && url.includes('kaufda')) throw new Error('Zeitüberschreitung bei www.kaufda.de'); return n.holeText(url); };
  const kd = () => n.abrufe.filter(u => u.includes('kaufda.de')).length;
  const lauf = (jetzt, quellenCache) => scan({ cfg, watchlist, history: null, sent: {}, quellenCache, holeText: hole, env, jetzt: new Date(jetzt) });
  const r1 = await lauf('2026-10-30T12:00:00Z', { version: 1, quellen: {} });
  const nach1 = kd();
  assert.ok(nach1 >= 10, 'erster Lauf fragt kaufDA');
  assert.ok(r1.quellenCache.quellen.kaufda?.ergebnis.angebote.length >= 10);
  // 1 Stunde später: kein kaufDA-Abruf, dieselben Angebote, Hinweis „Stand vor 60 Min.“
  const r2 = await lauf('2026-10-30T13:00:00Z', r1.quellenCache);
  assert.equal(kd(), nach1);
  const q2 = r2.current.quellen.find(q => q.name === 'kaufda');
  assert.match(q2.hinweis, /Stand vor 60 Min\., neu alle 3 Std\./);
  assert.equal(r2.current.produkte.find(p => p.id === 'haribo-colorado').bestes.shop, 'Lidl');
  // 3 Stunden nach dem Abruf: wieder frisch
  const r3 = await lauf('2026-10-30T15:00:00Z', r2.quellenCache);
  assert.ok(kd() > nach1);
  // kaufDA fällt aus: letzter Stand (bis 24 h) mit Fehlerhinweis statt leerer Karte
  kaputt = true;
  const r4 = await lauf('2026-10-30T19:00:00Z', r3.quellenCache);
  const q4 = r4.current.quellen.find(q => q.name === 'kaufda');
  assert.equal(q4.ok, true);
  assert.match(q4.fehler[0], /Zeitüberschreitung .* letzter Stand vor 4 Std\. gezeigt/);
  assert.equal(r4.current.produkte.find(p => p.id === 'haribo-colorado').bestes.shop, 'Lidl');
  // neue Stichwörter in der watchlist -> Zwischenspeicher gilt nicht mehr
  kaputt = false;
  const vorher = kd();
  const wl = { ...watchlist, produkte: [...watchlist.produkte, { id: 'neu', name: 'Neu', suche: ['Neu'], kaufda: ['Neu'], muss: ['neu'], basis: '100g' }] };
  await scan({ cfg, watchlist: wl, history: null, sent: {}, quellenCache: r4.quellenCache, holeText: hole, env, jetzt: new Date('2026-10-30T19:30:00Z') });
  assert.ok(kd() > vorher);
});
