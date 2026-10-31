// Der ganze Wecker gegen ECHTE Antworten vom 31.10.2026 (Roh-Mitschnitt, Lauf 41220218872, 16:33 UTC).
// Genau die Fehler, die Xander gesehen hat: Knoppers „24er“ mit „40 Stück“ (war ein 15er), Knoppers Minis als
// Schnitte, Großhandel (EDEKA Foodservice), Sammeldeal mit Kartoffel-Menge + Versand, uralter Preisfehler (RTX 5070).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheWiedergabe } from '../http.mjs';
import { scan, main } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const ECHT = join(HIER, 'fixtures', 'echt-2026-10-31');
const BASIS = join(HIER, '..', '..');
const cfg = JSON.parse(await readFile(join(BASIS, 'config.json'), 'utf8'));
const watchlist = JSON.parse(await readFile(join(BASIS, 'watchlist.json'), 'utf8'));
// Die marktguru-Startseite (mit den öffentlichen Web-Schlüsseln) ist absichtlich nicht im Repo -> Schlüssel per env
const env = { MARKTGURU_API_KEY: 'x', MARKTGURU_CLIENT_KEY: 'y' };
const JETZT = '2026-10-31T16:35:00Z';

function wiedergabe(patch = {}) {
  const hole = macheWiedergabe(ECHT);
  const abrufe = [];
  const holeText = async (url, opts) => { abrufe.push(url); const t = await hole(url, opts); return patch[url] ? patch[url](t) : t; };
  return { holeText, abrufe };
}
// Verlauf auf schnaeppchen-daten vom 31.10. 16:13 (mit den falschen Punkten)
const ALTER_VERLAUF = { version: 1, gruppen: {
  'choco-crossies': { basis: '100g', punkte: [{ tag: '2026-10-31', p: 1.89, shop: 'EDEKA Foodservice' }], tiefst: { p: 1.89, tag: '2026-10-31', shop: 'EDEKA Foodservice' } },
  'knoppers-schnitte': { basis: 'stueck', punkte: [{ tag: '2026-10-31', p: 0.07, shop: 'Kaufland' }], tiefst: { p: 0.07, tag: '2026-10-31', shop: 'Kaufland' } },
  'ben-jerrys': { basis: '100ml', punkte: [{ tag: '2026-10-31', p: 1.82, shop: 'PENNY' }], tiefst: { p: 1.82, tag: '2026-10-31', shop: 'PENNY' } },
} };

const lauf = async (jetzt = JETZT, extra = {}) => {
  const w = wiedergabe(extra.patch);
  const r = await scan({ cfg, watchlist: extra.watchlist || watchlist, history: extra.history ?? ALTER_VERLAUF, sent: {}, holeText: w.holeText, env, jetzt: new Date(jetzt) });
  return { ...r, abrufe: w.abrufe, karte: id => r.current.produkte.find(p => p.id === id) };
};

test('Echt: Knoppers = Kaufland 15 × 25 g für 2,79 € = 0,19 € pro Stück (nicht 40 Stück / 0,07 €)', async () => {
  const r = await lauf();
  const k = r.karte('knoppers-schnitte');
  assert.equal(k.name, 'Knoppers Schnitte');
  assert.equal(k.bestes.zeile, 'Storck Knoppers Milch-Haselnuss-Schnitte · 15 × 25 g · 2,79 € · 0,19 € pro Stück');
  assert.equal(k.bestes.titel, 'Storck Knoppers Milch-Haselnuss-Schnitte');
  assert.equal(k.bestes.shop, 'Kaufland');
  assert.equal(k.bestes.packung, '15 × 25 g');
  assert.deepEqual(k.bestes.menge, { gramm: 375, stueck: 15 });
  assert.equal(k.bestes.mengeSicher, true);
  assert.equal(k.bestes.mengeQuelle, 'grundpreis');
  assert.equal(k.bestes.einheitspreis, 0.186);
  assert.equal(k.bestes.preisVorher, null, 'marktguru liefert keinen Altpreis');
  assert.equal(k.bestes.bis, '2026-10-31T18:00:00Z', 'Kaufland endet um 19:00 deutscher Zeit');
  assert.deepEqual(k.weitere, [], 'Knoppers Minis (PENNY) sind ein anderes Produkt');
  assert.equal(k.normalQuelle, 'schaetzung');
  assert.equal(k.normalGeschaetzt, true);
  // geschätzter Normalpreis für DIESE Packungsgröße (15er-Familienpackung ca. 4,50 € = 0,30 €/Stück), nicht 0,38 €
  assert.equal(k.normalpreis, 0.3);
  assert.equal(k.normalJePackung, true);
  assert.equal(k.deal, true);
  assert.equal(k.grund, '38 % unter geschätztem Normalpreis');
  assert.deepEqual(k.tiefst, { status: 'unbekannt', text: 'Einziges gefundenes Angebot in deiner Nähe · Verlauf erst seit 1 Tag', heuteGuenstigstes: true, tage: 1, tiefst30: 0.186, anzahl: 1, anzahlSicher: 1 });
  assert.equal(r.current.produkte.filter(p => /knoppers/i.test(p.name)).length, 2, 'Schnitte + NussRiegel, kein „24er“/„5er“ mehr');
});

test('Echt: kein Großhandel, Sammeldeal nur mit eigenem Teil und ohne Versand, Ben & Jerry\'s ab Montag', async () => {
  const r = await lauf();
  const choco = r.karte('choco-crossies');
  assert.equal(choco.bestes, null, 'EDEKA Foodservice „NUR FÜR GROSSHÄNDLER“ zählt nicht');
  const bj = r.karte('ben-jerrys');
  // „465/4x100ml“: beide Packungen zum selben Preis -> beide genannt, Prozent mit der teureren (4 × 100 ml = 1,00 €/100 ml)
  assert.equal(bj.bestes.zeile, "Ben & Jerry's Eiscreme · 465 ml oder 4 × 100 ml · 3,99 € · 1,00 € pro 100 ml");
  assert.equal(bj.bestes.packung, '465 ml oder 4 × 100 ml');
  assert.equal(bj.grund, '33 % unter geschätztem Normalpreis');
  assert.equal(bj.bestes.startetSpaeter, true);
  assert.equal(bj.bestes.ab, '2026-11-01T23:00:00Z');
  const penny = bj.weitere[0];
  assert.equal(penny.titel, '[Penny] Ben Jerrys 3,49');
  assert.equal(penny.preis, 3.49, 'im Laden: keine 4,95 € Versand');
  assert.equal(penny.versand, 0);
  assert.equal(penny.mengeSicher, false, 'die 7,5 kg waren Kartoffeln');
  assert.equal(penny.ersparnis, null, 'keine Prozentangabe ohne sichere Menge');
  assert.equal(penny.deal, false);
  assert.equal(penny.zeile, '[Penny] Ben Jerrys 3,49 · 3,49 € · Menge unklar');
  assert.equal(penny.unsicher, false);
});

test('Echt (mydealz 2861577): PENNY Ben & Jerry\'s 3,49 € nur mit App, ab Mo 2.11. – und die Karte sagt nicht „Einziges Angebot“', async () => {
  const r = await lauf();
  const bj = r.karte('ben-jerrys');
  const penny = bj.weitere[0];
  // „Ab Montag den 2.11. … Ben und Jerrys Eis für 3,49 Euro mit App bzw. 3,99 Euro ohne App.“
  assert.equal(penny.ab, '2026-11-01T23:00:00.000Z');
  assert.equal(penny.startetSpaeter, true);
  assert.equal(penny.nurMitApp, true);
  assert.equal(penny.preisOhneApp, 3.99);
  assert.equal(penny.hinweis, 'nur mit PENNY-App (ohne App 3,99 €)');
  assert.equal(penny.bis, null, 'kein Ende im Text');
  // Laden-Wochenangebot ohne Ende („ab Montag“): sichtbar bis Samstag dieser Woche, nicht nur 72 h (PENNY verkauft bis Sa)
  assert.equal(penny.sichtbarBis, '2026-11-07T22:59:00.000Z', 'Sa 7.11. 23:59 Berliner Zeit');
  // „Der reguläre Preis sind inzwischen 6,99 Euro“ (eigener Satz im Sammeldeal) = Vorher-Preis des Angebots
  assert.equal(penny.preisVorher, 6.99);
  assert.equal(penny.datum, '2026-10-30T09:33:39.000Z');
  // Tiefstpreis-Antwort zählt das billigere PENNY-Angebot mit
  assert.equal(bj.anzahlAngebote, 2);
  assert.equal(bj.tiefst.anzahl, 2);
  assert.equal(bj.tiefst.status, 'unbekannt');
  assert.equal(bj.tiefst.text, 'PENNY hat 3,49 € (mit App, ab Mo 2.11.) – Packungsgröße dort nicht sicher');
  assert.doesNotMatch(bj.tiefst.text, /Einziges/);
  // Do 5.11.: PENNY läuft noch -> die Antwort nennt es weiter (nicht „Einziges gefundenes Angebot“)
  const donnerstag = await lauf('2026-11-05T09:00:00Z');
  assert.equal(donnerstag.karte('ben-jerrys').weitere[0]?.shop, 'PENNY');
  assert.match(donnerstag.karte('ben-jerrys').tiefst.text, /^PENNY hat 3,49 € \(mit App\)/);
  // nach Samstag ist das PENNY-Angebot weg
  const sonntag = await lauf('2026-11-08T00:00:00Z');
  assert.deepEqual(sonntag.karte('ben-jerrys').weitere, []);
});

test('mydealz-Angebote für die Merkliste: „nur am Donnerstag 29.10.“ ist am 31.10. weg, ohne Ende höchstens 72 h', async () => {
  const LEBENSMITTEL = 'https://www.mydealz.de/rss/gruppe/lebensmittel';
  const item = (titel, tag) => `<item><pepper:merchant name="Lidl" price="2,22€"/><title><![CDATA[${titel}]]></title><description><![CDATA[<p>${titel}</p>]]></description><link>https://www.mydealz.de/deals/test-${tag}</link><pubDate>${tag}</pubDate></item>`;
  const patch = { [LEBENSMITTEL]: t => t.replace('<item>', item('[Lidl] Knoppers 15er Pack (375 g) für 2,22 € – nur am Donnerstag 29.10.!', 'Thu, 29 Oct 2026 08:00:00 +0100') + item('[Lidl] Knoppers 15er Pack (375 g) für 2,25 €', 'Tue, 27 Oct 2026 08:00:00 +0100') + '<item>') };
  const r = await lauf(JETZT, { patch });
  const k = r.karte('knoppers-schnitte');
  assert.ok(![k.bestes, ...k.weitere].some(o => o && /Lidl/.test(o.shop)), 'nur am 29.10. bzw. älter als 72 h -> nicht mehr da');
  // am 29.10. mittags war das erste noch gültig – mit Ende 29.10. 23:59
  const damals = await lauf('2026-10-29T12:00:00Z', { patch });
  const lidl = [damals.karte('knoppers-schnitte').bestes, ...damals.karte('knoppers-schnitte').weitere].find(o => o?.preis === 2.22);
  assert.equal(lidl.bis, '2026-10-29T22:59:59.000Z');
});

test('Echt: Verlauf neu (alte falsche Punkte weg), nur sichere und laufende Angebote kommen hinein', async () => {
  const r = await lauf();
  assert.equal(r.history.version, 2);
  assert.deepEqual(Object.keys(r.history.gruppen), ['knoppers-schnitte']);
  assert.deepEqual(r.history.gruppen['knoppers-schnitte'].punkte, [{ tag: '2026-10-31', p: 0.186, shop: 'Kaufland' }]);
  assert.ok(!JSON.stringify(r.current).includes('0.07'), 'nirgends mehr 0,07 €');
});

test('Echt: RTX 5070 (Preisfehler vom 12.10., längst abgelaufen) ist weg – ohne unnötigen Seitenabruf', async () => {
  const r = await lauf();
  assert.deepEqual(r.current.technik, []);
  assert.ok(!r.abrufe.some(u => u.includes('/deals/')), 'zu alt -> Deal-Seite gar nicht erst laden');
  assert.ok(!r.abrufe.some(u => u.includes('/rss/search')), 'tote mydealz-Suche wird nicht mehr abgefragt');
  assert.deepEqual(r.current.fehler, []);
});

test('Echt: Pushes – Knoppers mit Packung, geschätztem Normalpreis und Uhrzeit des Endes', async () => {
  const r = await lauf();
  assert.equal(r.msgs.length, 2);
  const k = r.msgs.find(m => m.title === 'Schnäppchen: Knoppers Schnitte');
  assert.equal(k.priority, 4, 'gegen einen nur geschätzten Normalpreis nie höchste Stufe');
  assert.equal(k.message, [
    '2,79 € bei Kaufland · 15 × 25 g',
    '0,19 € pro Stück – normal ca. 0,30 € (geschätzt)',
    '38 % unter geschätztem Normalpreis',
    'Einziges gefundenes Angebot in deiner Nähe · Verlauf erst seit 1 Tag',
    'gültig bis Sa 31.10. 19:00',
    'Storck Knoppers Milch-Haselnuss-Schnitte',
  ].join('\n'));
  assert.equal(k.click, 'https://www.marktguru.de/offers/25495632');
  const bj = r.msgs.find(m => m.title.includes('Ben'));
  assert.match(bj.message, /gilt ab Mo 2\.11\. bis Sa 7\.11\./);
  // marktguru: 3,99 € für 465 ml (Prospekt: 8,58 €/l) – gerechnet wird ehrlich mit 4 × 100 ml; beide stehen da
  assert.match(bj.message, /^1,00 € pro 100 ml \(bei 4 × 100 ml; 465 ml: 0,86 €\) – normal ca\. 1,50 € \(geschätzt\)$/m);
  const karte = r.karte('ben-jerrys').bestes;
  assert.deepEqual(karte.einheitspreisVarianten.map(v => [v.packung, Math.round(v.einheitspreis * 100) / 100]), [['4 × 100 ml', 1], ['465 ml', 0.86]]);
  assert.equal(r.karte('knoppers-schnitte').bestes.einheitspreisVarianten, null, 'nur eine Packung -> keine Varianten');
});

test('Echt: nach Ende des Kaufland-Angebots (18:01 UTC) ist es sofort weg', async () => {
  const vorher = await lauf();
  const r = await lauf('2026-10-31T18:01:00Z', { history: vorher.history });
  const k = r.karte('knoppers-schnitte');
  assert.equal(k.bestes, null);
  assert.equal(k.deal, false);
  assert.equal(k.tiefst.text, 'Gerade kein Angebot · zuletzt 0,19 € pro Stück am 31.10.');
  assert.equal(r.msgs.filter(m => m.title.includes('Knoppers')).length, 0);
});

test('Echt: Preisfehler mit Deal-Seite – vorher/jetzt aus mydealz, abgelaufen = raus', async () => {
  const wl = { ...watchlist, technik: { ...watchlist.technik, woerter: ['lumaland'] } };
  const LUMA = 'https://www.mydealz.de/deals/moglicher-preisfehler-lumaland-outdoor-pop-up-pavillon-25-x-25-m-in-schwarz-grau-inkl-seitenteil-tasche-heringe-amazon-prime-2861129';
  // So wie die Seite am 31.10. aussah: seit 29.10. 11:36 abgelaufen -> nicht zeigen
  const weg = await lauf('2026-10-29T11:30:00Z', { watchlist: wl });
  assert.deepEqual(weg.current.technik, []);
  assert.ok(weg.abrufe.includes(LUMA));
  // Dieselbe Seite, solange der Deal noch lief (isExpired false) -> zeigen, mit Vergleichspreis von mydealz
  const live = await lauf('2026-10-29T11:30:00Z', { watchlist: wl, patch: { [LUMA]: t => t.replace('"isExpired":true', '"isExpired":false') } });
  const [t] = live.current.technik;
  assert.equal(t.preis, 23.99);
  assert.equal(t.preisVorher, 96.99);
  assert.equal(t.vorherQuelle, 'Vergleichspreis laut mydealz');
  assert.equal(t.ersparnisEuro, 73);
  assert.equal(t.ersparnisProzent, 75);
  assert.equal(t.datum, '2026-10-29T11:26:13.000Z');
  assert.equal(t.shop, 'Amazon');
  assert.ok(t.bis > '2026-10-29T11:30:00Z');
  const m = live.msgs.find(x => x.click === LUMA);
  assert.equal(m.message.split('\n')[0], 'vorher 96,99 € → jetzt 23,99 € (−75 %)');
  // Ende laut Deal-Seite schon vorbei, aber (noch) nicht als abgelaufen markiert -> trotzdem weg, kein Push
  const ende = Date.parse(t.bis);
  const vorbei = await lauf(new Date(ende + 60e3).toISOString(), { watchlist: wl, patch: { [LUMA]: x => x.replace('"isExpired":true', '"isExpired":false') } });
  assert.deepEqual(vorbei.current.technik, []);
  assert.equal(vorbei.msgs.filter(x => x.click === LUMA).length, 0);
});

test('Echt (CAMELBAK 2852900): Versand steckt schon im Preis -> nicht noch einmal „zzgl. Versand“; Push-Titel nach Art', async () => {
  const wl = { ...watchlist, technik: { ...watchlist.technik, woerter: ['camelbak'] } };
  const CAMEL = 'https://www.mydealz.de/deals/preisfehler-camelbak-stash-belt-fur-099eur-vsk-bauchtasche-gurteltasche-laufgurt-gr-m-schwarz-2852900';
  const feed = (await readdir(join(ECHT, 'quellen'))).find(n => n.includes('camelbak'));
  assert.ok(feed, 'Fixture fehlt');
  const seite = await readFile(join(ECHT, 'quellen', feed), 'utf8');
  const PF = 'https://www.mydealz.de/rss/gruppe/preisfehler';
  const datum = seite.match(/"publishedAt":(\d+)/)[1] * 1000;
  const jetzt = new Date(datum + 2 * 36e5).toISOString();
  const item = `<item><pepper:merchant name="Amazon" price="6,98€"/><title><![CDATA[Preisfehler: CAMELBAK Stash Belt für 0,99€ + VSK]]></title><description><![CDATA[x]]></description><link>${CAMEL}</link><pubDate>${new Date(datum).toUTCString()}</pubDate></item>`;
  const patch = { [PF]: t => t.replace('<item>', item + '<item>'), [CAMEL]: () => seite.replace('"isExpired":true', '"isExpired":false').replace(/"endDate":\{[^}]*\}/, '"endDate":null') };
  const r = await lauf(jetzt, { watchlist: wl, patch });
  const t = r.current.technik.find(x => x.link === CAMEL);
  assert.ok(t, 'CAMELBAK fehlt');
  assert.equal(t.preis, 6.98);
  assert.equal(t.versand, 0);
  assert.equal(t.versandInklusive, true);
  const m = r.msgs.find(x => x.click === CAMEL);
  assert.match(m.title, /^Preisfehler\? /);
  assert.match(m.message, /inkl\. Versand/);
  assert.doesNotMatch(m.message, /\+ 5,99/);
});

test('Echt: CLI --wiedergabe rechnet einen Roh-Mitschnitt offline nach, ohne zu senden', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-wieder-'));
  const echtesFetch = globalThis.fetch;
  let gesendet = 0;
  globalThis.fetch = async () => { gesendet++; return new Response('ok'); };
  const log = console.log; console.log = () => {};
  try {
    const r = await main(['--wiedergabe', ECHT, '--data', dir, '--jetzt', JETZT], env);
    assert.equal(r.msgs.length, 2);
    assert.equal(gesendet, 0, 'Wiedergabe ist immer ein Probelauf');
    assert.deepEqual((await readdir(dir)).sort(), ['current.json', 'dealseiten.json', 'history.json', 'sent.json']);
    const c = JSON.parse(await readFile(join(dir, 'current.json'), 'utf8'));
    assert.equal(c.produkte.find(p => p.id === 'knoppers-schnitte').bestes.packung, '15 × 25 g');
  } finally { console.log = log; globalThis.fetch = echtesFetch; await rm(dir, { recursive: true, force: true }); }
});
