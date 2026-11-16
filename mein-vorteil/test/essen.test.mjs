// Reiter „Essen“ (essen.js + essen.json): Daten-Schema (Quelle, Prüfdatum, Endedaten, Gratis-Regel, keine Emojis), tolerantes
// Lesen, Tageslogik mit festen Uhrzeiten (Berlin), Haken in index.html/sw.js und Browser-Tests (lazy, Unterreiter, Start-Kachel,
// Verweis auf Spartricks, neue Fassung, Layout 428 × 926 und 926 × 428). Fotos (deviceScaleFactor 2) nach $ESSEN_FOTOS,
// sonst $MV_SHOTS/essen bzw. ins Temp-Verzeichnis.
// Aufruf: cd mein-vorteil && npm test   (ohne Playwright laufen nur die statischen Prüfungen)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import vm from 'node:vm';

const HIER = dirname(fileURLToPath(import.meta.url));
const MV = join(HIER, '..');
const WURZEL = join(MV, '..');
const FIX = join(HIER, 'fixtures');
const FOTOS = process.env.ESSEN_FOTOS || join(process.env.MV_SHOTS || join(tmpdir(), 'mein-vorteil-shots'), 'essen');
const JETZT = '2026-11-15T10:00:00Z'; // So 15.11.2026, 11:00 Berliner Zeit
const ROH = readFileSync(join(MV, 'essen.json'), 'utf8');
const DATEN = JSON.parse(ROH);
const RUBRIKEN = ['ketten', 'pizza', 'ayce', 'xxl', 'lokal'];
const ARTEN = ['aktionstag', 'wochentag', 'dauerhaft', 'app', 'abholung', 'ayce', 'xxl'];
const REGIONEN = ['Döbeln', 'Leipzig', 'Dresden', 'Chemnitz', 'Sachsen', 'bundesweit'];
const PORTAL = /(^|\.)(mydealz\.de|monsterdealz\.de|dealdoktor\.de|sparwelt\.de)$/;
const CHIPS = ['heute', 'ketten', 'pizza', 'ayce', 'xxl', 'gratis'];
// Leiste: „Lokale“ und „Regelmäßig“ (Xander 16.11.2026) direkt hinter „Heute“
const ALLE_CHIPS = ['heute', 'lokale', 'regel', 'ketten', 'pizza', 'ayce', 'xxl', 'gratis'];
const LOK = JSON.parse(readFileSync(join(WURZEL, 'vorteile', 'essen.json'), 'utf8'));
const LOK_RADAR = readFileSync(join(FIX, 'essen-lokale-radar.json'), 'utf8');
const KONFIG = JSON.parse(readFileSync(join(WURZEL, 'vorteile', 'config.json'), 'utf8'));

function modul() {
  const speicher = {};
  const localStorage = { getItem: k => (k in speicher ? speicher[k] : null), setItem: (k, v) => { speicher[k] = String(v); } };
  const ctx = { window: {}, localStorage, Intl, Date, console, URL };
  vm.runInNewContext(readFileSync(join(MV, 'essen.js'), 'utf8'), ctx);
  return ctx.window.MeinVorteilEssen._intern;
}
const plain = x => JSON.parse(JSON.stringify(x));
const I = modul();
const N = I.normalisiere(DATEN);
const J = iso => I.jetztBerlin(Date.parse(iso));

// --- Daten-Schema ------------------------------------------------------------------------------------------------------
test('Schema essen.json: Fassung, Stand, Pflichtfelder, https-Quellen, Prüfdatum, Endedaten, Gratis nur ohne Kauf, keine Emojis', () => {
  assert.equal(DATEN.version, 1);
  assert.match(DATEN.stand, /^\d{4}-\d\d-\d\d$/);
  assert.ok(DATEN.hinweis.length > 40);
  assert.doesNotMatch(ROH, /\p{Extended_Pictographic}/u, 'keine Emojis');
  const ids = new Set();
  for (const e of DATEN.eintraege) {
    const wo = e.id;
    assert.match(e.id, /^[a-z0-9-]{2,60}$/, wo);
    assert.ok(!ids.has(e.id), `doppelte id ${e.id}`); ids.add(e.id);
    assert.ok(RUBRIKEN.includes(e.rubrik), `${wo}: rubrik ${e.rubrik}`);
    assert.ok(ARTEN.includes(e.art), `${wo}: art ${e.art}`);
    assert.ok(typeof e.titel === 'string' && e.titel.length >= 3 && e.titel.length <= 140, `${wo}: titel`);
    assert.ok(typeof e.wann === 'string' && e.wann.length >= 3, `${wo}: wann fehlt`);
    assert.ok(e.kette || e.ort, `${wo}: kette oder ort`);
    assert.ok(Array.isArray(e.region) && e.region.every(r => REGIONEN.includes(r)), `${wo}: region`);
    assert.match(e.geprueft, /^\d{4}-\d\d-\d\d$/, `${wo}: geprüft am`);
    assert.ok(e.geprueft <= DATEN.stand, `${wo}: geprüft nach dem Stand`);
    assert.ok(['ja', 'pruefen'].includes(e.sicher), `${wo}: sicher`);
    assert.equal(typeof e.gratis, 'boolean', `${wo}: gratis`);
    assert.ok(Array.isArray(e.quellen) && e.quellen.length >= 1 && e.quellen.length <= 3, `${wo}: Quellen`);
    for (const q of e.quellen) {
      assert.ok(typeof q.name === 'string' && q.name.length >= 3, `${wo}: Quellenname`);
      assert.match(q.url, /^https:\/\/[^\s"<>]+$/, `${wo}: ${q.url}`);
      assert.match(new URL(q.url).hostname, /^[a-z0-9.-]+\.[a-z]{2,}$/, wo);
    }
    if (e.sicher === 'ja') assert.ok(e.quellen.some(q => !PORTAL.test(new URL(q.url).hostname)), `${wo}: „belegt“ nur mit Deal-Portalen`);
    if (e.gratis) assert.doesNotMatch(`${e.titel} ${e.bedingung}`, /beim Kauf|ab \d+ ?€|MBW|Mindestbestell|\bAbo\b|Kassenbon/i, `${wo}: gratis nur ohne Kauf/Abo`);
    else assert.doesNotMatch(e.titel, /\bgratis\b/i, `${wo}: „gratis“ im Titel nur, wenn ohne Kauf gratis`);
    if (e.nurHinweis) assert.ok(!e.wochentage && !e.zeit, `${wo}: Muster ohne festen Wochentag/Uhrzeit (nie „heute“)`);
    if (e.art === 'aktionstag' && !e.nurHinweis) assert.match(e.bis || '', /^\d{4}-\d\d-\d\d$/, `${wo}: Aktionstag ohne Ende`);
    for (const f of ['ab', 'bis']) if (f in e) assert.match(e[f], /^\d{4}-\d\d-\d\d$/, `${wo}: ${f}`);
    if (e.ab && e.bis) assert.ok(e.ab <= e.bis, `${wo}: ab nach bis`);
    if (e.wochentage) assert.ok(e.wochentage.length && e.wochentage.every(w => Number.isInteger(w) && w >= 1 && w <= 7), `${wo}: wochentage`);
    if (e.zeit) { assert.ok(e.zeit.von || e.zeit.bis, wo); for (const f of ['von', 'bis']) if (e.zeit[f]) assert.match(e.zeit[f], /^\d\d:\d\d$/, wo); assert.ok(e.zeit.text, wo); }
    if (e.ort) { // Lokal in der Region: km, Adresse, Stand der Quelle; nie „sicher“, weil nicht von der eigenen Seite des Lokals
      assert.ok(Number.isInteger(e.km) && e.km > 0 && e.km < 80, `${wo}: km`);
      assert.ok(e.adresse && e.quelleStand, `${wo}: Adresse/Quellen-Stand`);
      assert.equal(e.sicher, 'pruefen', wo);
    }
  }
  assert.ok(DATEN.eintraege.length >= 40, `${DATEN.eintraege.length} Einträge`);
  assert.equal(N.eintraege.length, DATEN.eintraege.length, 'die Seite liest jeden Eintrag');
  // genau ein Eintrag ist ohne Kauf gratis (IKEA-Family-Heißgetränk), und der ist belegt
  assert.deepEqual(DATEN.eintraege.filter(e => e.gratis).map(e => [e.id, e.sicher]), [['ikea-heissgetraenk', 'ja']]);
  // Döbeln ehrlich: dort nichts gefunden, mit Quelle
  assert.match(DATEN.doebeln.text, /In Döbeln selbst .*kein All-you-can-eat/);
  assert.match(DATEN.doebeln.quellen[0].url, /^https:\/\//);
  // Spartricks-Themen nicht doppeln: Geburtstag-Einträge gibt es hier nicht, Verweise zeigen auf echte Spartricks-Karten
  const sp = JSON.parse(readFileSync(join(MV, 'spartricks.json'), 'utf8'));
  assert.equal(DATEN.eintraege.filter(e => /geburtstag/i.test(`${e.id} ${e.titel}`)).length, 0);
  for (const e of DATEN.eintraege.filter(x => x.spartricks)) assert.ok(sp.tipps.some(t => t.id === e.spartricks.id && t.bereich === e.spartricks.chip), `${e.id}: Verweis ${e.spartricks.id}`);
});

test('essen.js liest tolerant: ohne Quelle, http-Link, doppelte id, fremde Rubrik, kaputte Felder fliegen raus', () => {
  const gut = { id: 'gut', rubrik: 'ketten', art: 'app', kette: 'X', titel: 'Gut', wann: 'immer', quellen: [{ name: 'Q', url: 'https://example.org/a' }], geprueft: '2026-11-15', sicher: 'ja', gratis: false };
  const n = I.normalisiere({
    version: 1, stand: '2026-11-15', eintraege: [
      gut, { ...gut }, { ...gut, id: 'ohne', quellen: [] }, { ...gut, id: 'http', quellen: [{ name: 'Q', url: 'http://example.org' }] },
      { ...gut, id: 'rubrik', rubrik: 'quatsch' }, { ...gut, id: 'ohne-datum', geprueft: 'gestern' }, null, 'x',
      { ...gut, id: 'wt', wochentage: [0, 3, 3, 9, 'x'], zeit: { von: '25:00', bis: '14:00', text: 'bis 14 Uhr' }, region: ['Mond'], sicher: 'vielleicht', gratis: 'ja' },
    ],
  });
  assert.deepEqual(plain(n.eintraege.map(e => e.id)), ['gut', 'wt']);
  const wt = n.eintraege[1];
  assert.deepEqual(plain(wt.wochentage), [3]);
  assert.deepEqual(plain(wt.zeit), { von: null, bis: '14:00', text: 'bis 14 Uhr' });
  assert.deepEqual(plain(wt.region), ['bundesweit']);
  assert.equal(wt.sicher, 'pruefen');
  assert.equal(wt.gratis, false, 'gratis nur bei true');
  assert.equal(I.normalisiere(null).eintraege.length, 0);
  assert.equal(I.normalisiere({ eintraege: 'x' }).eintraege.length, 0);
});

// --- Tageslogik (feste Uhrzeiten, Berliner Zeit) -------------------------------------------------------------------------
const ids = l => plain(l.map(x => (x.e || x).id));
test('Heute So 15.11. 11:00: Brunch läuft, McSundae kommt morgen, Subway-Sub BBQ Rib, nichts Abgelaufenes', () => {
  const j = J(JETZT);
  assert.deepEqual(plain(j), { iso: '2026-11-15', wt: 7, min: 660 });
  const t = I.heuteTeile(N, j);
  for (const id of ['l-cafe-bubu-brunch', 'l-shiki', 'peterpane-family-sunday']) assert.ok(ids(t.heute).includes(id), `${id} fehlt heute`);
  assert.equal(t.heute.find(x => x.e.id === 'l-cafe-bubu-brunch').s, 'jetzt');
  // Naumanns: nur einzelne Sonntage belegt (zuletzt 13.09.) -> nie „heute“, nur „Kommt immer wieder“
  assert.ok(!ids(t.heute).includes('l-naumanns-brunch'), 'Naumanns nicht als „läuft“');
  assert.ok(ids(I.liste(N, 'ayce', j.iso).hinweise).includes('l-naumanns-brunch'));
  assert.ok(!ids(t.heute).includes('mcd-flashback-mcsundae'));
  assert.deepEqual(plain(t.bald.slice(0, 2).map(x => [x.e.id, x.tag])), [['mcd-flashback-mcsundae', '2026-11-16'], ['mcd-flashback-cheeseburger', '2026-11-23']]);
  assert.ok(t.bald.some(x => x.e.id === 'ikea-julbord' && x.tag === '2026-12-10'), 'Julbord am 10.12.');
  assert.ok(ids(t.morgen).includes('dd-play-off'), 'Mo: Play Off Spare-Rib-Buffet');
  const sub = t.taeglich.find(e => e.id === 'subway-sub-des-tages');
  assert.equal(sub.plan[j.wt], 'BBQ Rib');
  const alle = [...t.heute.map(x => x.e), ...t.bald.map(x => x.e), ...t.morgen, ...t.taeglich, ...Object.values(t.woche).flat()];
  assert.ok(alle.every(e => !e.nurHinweis), 'nurHinweis nie unter Heute');
  assert.ok(alle.every(e => !e.bis || e.bis >= j.iso), 'nichts mit Ende vor heute');
  assert.ok(!alle.some(e => e.id === 'pizzahut-unlimited'), 'Pizza Hut Unlimited (Ende 13.11.) weg');
  // Woche: feste Tage, nicht täglich
  assert.ok(ids(t.woche[2]).includes('dd-lindenschaenke'));
  assert.ok(ids(t.woche[3]).includes('c-miramar-schnitzeltag'));
});

test('Heute So 15.11. 15:00: Brunch heute vorbei, nächster So 22.11.; abends „ab 18 Uhr“ ohne „läuft“; Pause ist nicht „läuft“', () => {
  const j = J('2026-11-15T14:00:00Z');
  const t = I.heuteTeile(N, j);
  const br = t.heute.find(x => x.e.id === 'l-cafe-bubu-brunch');
  assert.equal(br.s, 'vorbei');
  assert.equal(I.naechsterTag(br.e, j.iso), '2026-11-22');
  assert.equal(t.heute[t.heute.length - 1].s, 'vorbei', 'vorbei steht unten');
  const my = N.eintraege.find(e => e.id === 'l-mykonos');
  assert.equal(I.heuteStatus(my, j), 'spaeter');
  assert.equal(I.heuteStatus(my, J('2026-11-15T18:30:00Z')), 'offen', 'nur „ab 18 Uhr“ bekannt: kein „läuft“');
  assert.equal(I.heuteStatus(my, J('2026-11-15T22:59:00Z')), 'offen', 'auch nicht um 23:59');
  const mo = N.eintraege.find(e => e.id === 'l-monchi-vegan'); // Mi 12–15:30 und 16:30–21 Uhr
  assert.equal(I.heuteStatus(mo, J('2026-11-18T12:00:00Z')), 'jetzt');
  assert.equal(I.heuteStatus(mo, J('2026-11-18T15:00:00Z')), 'spaeter', 'Pause 15:30–16:30');
  assert.equal(I.heuteStatus(mo, J('2026-11-18T15:45:00Z')), 'jetzt');
  const pp = N.eintraege.find(e => e.id === 'peterpane-mittag'); // Mo–Fr bis 17 Uhr
  assert.equal(I.heuteStatus(pp, J('2026-11-16T10:00:00Z')), 'offen');
  assert.equal(I.heuteStatus(pp, J('2026-11-16T16:30:00Z')), 'vorbei');
});

test('Aktionstage: Mo 16.11. McSundae heute, Fr 20.11. vorbei (Cheeseburger ab Mo 23.11.), 25.11. beide weg', () => {
  const mo = I.heuteTeile(N, J('2026-11-16T10:00:00Z'));
  assert.ok(ids(mo.heute).includes('mcd-flashback-mcsundae'));
  assert.equal(mo.heute[0].e.id, 'mcd-flashback-mcsundae', 'belegter Aktionstag zuerst');
  const fr = I.heuteTeile(N, J('2026-11-20T10:00:00Z'));
  assert.ok(!ids(fr.heute).includes('mcd-flashback-mcsundae'));
  assert.ok(!ids(fr.bald).includes('mcd-flashback-mcsundae'));
  assert.equal(fr.bald[0].e.id, 'mcd-flashback-cheeseburger');
  assert.ok(!ids(fr.heute).includes('ikea-fisk-freitag'), 'FISK Friday nur bis 31.08. belegt: nicht unter Heute');
  assert.ok(ids(I.liste(N, 'ketten', '2026-11-20').hinweise).includes('ikea-fisk-freitag'), 'FISK Friday unter „Kommt immer wieder“');
  const sp = I.liste(N, 'ketten', '2026-11-25');
  assert.ok(!ids(sp.l).some(id => id.startsWith('mcd-flashback')), 'abgelaufene Flashback-Deals nicht mehr in der Liste');
  // Aktionstag ohne Ende: nie aktuell
  const ohneEnde = { ...N.eintraege.find(e => e.id === 'mcd-flashback-mcsundae'), bis: null };
  assert.equal(I.giltAm(ohneEnde, '2026-11-16'), false);
  assert.equal(I.naechsterTag(ohneEnde, '2026-11-15'), null);
});

test('Start-Kachel: nur belegte, höchstens 2 Zeilen; So „ab Mo 16.11.“ + gratis, Mo „heute · bis Do 19.11.“ + Cheeseburger, Fr Cheeseburger; veraltet raus', () => {
  const a = I.kachelAuszug(DATEN);
  assert.ok(JSON.stringify(a).length < 25000, 'Auszug klein');
  assert.ok(a.e.length >= 5 && a.e.every(e => DATEN.eintraege.find(x => x.id === e.id).sicher === 'ja'), 'nur sicher belegte');
  const so = I.kachelZeilen(a, Date.parse(JETZT));
  assert.equal(so.length, 2);
  assert.deepEqual(plain(so[0]), ["McDonald's: McSundae für 1 €", 'ab Mo 16.11. · nur App', false], 'Klammer „(… nur App)“ fällt auf der schmalen Kachel weg');
  // Abwechslung: höchstens ein „ab …“, dann was heute ohne Kauf gratis ist
  assert.deepEqual(plain(so[1]), ['Gratis Heißgetränk bei jedem Besuch (IKEA Family)', 'gratis ohne Kauf', false]);
  const dez = I.kachelZeilen(a, Date.parse('2026-12-01T10:00:00Z'));
  assert.match(dez[0][0], /Heißgetränk/, 'ohne Aktionstag: dauerhaft gratis');
  assert.equal(dez[0][1], 'gratis ohne Kauf');
  const mo = I.kachelZeilen(a, Date.parse('2026-11-16T10:00:00Z'));
  assert.deepEqual(plain(mo[0]).slice(1), ['heute bis Do 19.11. · nur App', true]);
  assert.deepEqual(plain(mo[1]), ["McDonald's: Cheeseburger für 1 €", 'ab Mo 23.11. · nur App', false], 'Mo: Aktionstag heute, dann der nächste');
  const fr = I.kachelZeilen(a, Date.parse('2026-11-20T10:00:00Z'));
  assert.match(fr[0][0], /Cheeseburger/);
  assert.equal(fr[0][1], 'ab Mo 23.11. · nur App');
  assert.match(fr[1][0], /Heißgetränk/);
  // Prüfdatum älter als 45 Tage: nicht auf die Kachel
  const alt = { ...a, e: a.e.map(e => ({ ...e, geprueft: '2026-09-01' })) };
  assert.deepEqual(plain(I.kachelZeilen(alt, Date.parse(JETZT))), []);
});

test('Unterreiter: jeder laufende Eintrag ist erreichbar; Pizza-Muster nur unter „Kommt immer wieder“; Region nach km', () => {
  const h = '2026-11-15';
  const gezeigt = new Set();
  const zahl = {};
  for (const c of CHIPS.slice(1)) { const { l, hinweise } = I.liste(N, c, h); zahl[c] = l.length; for (const e of [...l, ...hinweise]) gezeigt.add(e.id); }
  for (const e of N.eintraege) if (!e.bis || e.bis >= h) assert.ok(gezeigt.has(e.id), `${e.id} in keinem Unterreiter`);
  assert.ok(!gezeigt.has('pizzahut-unlimited'));
  const pz = I.liste(N, 'pizza', h);
  assert.deepEqual(ids(pz.hinweise), ['dominos-abhol-muster', 'freddyfresh-abhol-muster']);
  assert.ok(N.eintraege.find(e => e.id === 'freddyfresh-abhol-muster').region.includes('Döbeln'), 'Freddy Fresh: Filiale in Döbeln');
  assert.match(DATEN.doebeln.text, /Freddy Fresh/);
  const ay = plain(I.liste(N, 'ayce', h).l.filter(e => e.km != null).map(e => e.km));
  assert.deepEqual(ay, [...ay].sort((a, b) => a - b), 'All-you-can-eat nach km');
  const gr = I.liste(N, 'gratis', h).l;
  assert.deepEqual(ids(gr).slice(0, 5), ['ikea-heissgetraenk', 'ikea-family-november', 'ikea-kindermenue-november', 'mcd-flashback-mcsundae', 'mcd-flashback-cheeseburger'], 'Gratis-Tage: erst was ohne Kauf gratis ist, dann laufende Aktionstage, dann die nächsten nach Datum');
  for (const c of CHIPS.slice(1)) assert.ok(zahl[c] >= 2, `${c}: ${zahl[c]}`);
});

test('Haken: index.html (Leiste nach Deals, eigene Seite, Skript erst beim Öffnen, Kachel), sw.js (essen.js, neue Cache-Fassung)', () => {
  const html = readFileSync(join(MV, 'index.html'), 'utf8');
  const leiste = html.match(/<div class="breite sprung-zeile"[^>]*>([\s\S]*?)<\/div>/)[1];
  // seit 16.11.2026 steht „Woche“ zwischen Deals und Essen
  assert.match(leiste, /<span class="t">Deals<\/span><span class="n"><\/span><\/a>\s*<a href="#woche" data-reiter="woche" class="f-woche">[\s\S]*?<\/a>\s*<a href="#essen" data-reiter="essen" class="f-essen"><svg class="ic" aria-hidden="true"><use href="#ic-essen"\/><\/svg><span class="t">Essen<\/span><span class="n"><\/span><\/a>/);
  assert.match(html, /<symbol id="ic-essen" viewBox="0 0 24 24">/);
  assert.match(html, /\.f-essen \{ --f: #[0-9a-f]{6}; --f-hell: #[0-9a-f]{6}; --f-hell2: #[0-9a-f]{6}; \}/);
  assert.match(html, /<section id="p-essen" class="reiter-seite breite f-essen" aria-labelledby="h-essen" hidden>/);
  assert.match(html, /<div id="i-essen"><p class="leer">Lade Essen …<\/p><\/div>/);
  assert.doesNotMatch(html, /<script[^>]+src="essen\.js"/, 'kein festes Skript-Tag');
  assert.match(html, /essSkript\.src = 'essen\.js'/);
  assert.match(html, /REITER_START\.essen = starteEssen;/);
  assert.match(html, /REITER_NEU\.essen = /);
  assert.match(html, /const KACHEL_REIHE = \['deals', 'woche', 'essen',/);
  assert.match(html, /if \(b === 'essen'\) return essenKachel\(\);/);
  assert.match(html, /const EIGENE_SEITE = new Set\(\['filme', 'essen'\]\)/);
  assert.doesNotMatch(html, /\.ess-/, 'kein Essen-CSS in der Seite');
  assert.doesNotMatch(html, /fetch\(\s*['"`][^'"`]*essen\.json/, 'die Startseite holt die Daten nie selbst (lazy)');
  assert.doesNotMatch(readFileSync(join(MV, 'essen.js'), 'utf8'), /https?:\/\/(?!example)[^'"`\s]*\.(js|css)\b|googletagmanager|analytics|gtag\(|<script/i, 'keine fremden Skripte, kein Tracking');
  assert.doesNotMatch(readFileSync(join(MV, 'essen.js'), 'utf8'), /\p{Extended_Pictographic}/u, 'keine Emojis als Grafik');
  const sw = readFileSync(join(MV, 'sw.js'), 'utf8');
  assert.match(sw, /addAll\(\[SEITE, 'filme\.js', 'spartricks\.js', 'essen\.js',/);
  assert.match(sw, /rest === 'essen\.js'/);
  assert.match(sw, /const CACHE = 'mein-vorteil-4'/); // 16.11.2026: woche.js
  assert.doesNotMatch(sw, /essen\.json'/, 'Daten nicht im Worker');
  assert.match(readFileSync(join(MV, 'README.md'), 'utf8'), /Reiter „Essen“/);
});

// --- Browser ---------------------------------------------------------------------------------------------------------------
let pw = null;
try { pw = createRequire(import.meta.url)('playwright'); } catch { /* nicht installiert */ }
const ohnePw = pw ? false : 'Playwright nicht installiert';
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server, basis, browser;
const abrufe = [];
let essInhalt = null;

before(async () => {
  if (!pw) return;
  server = createServer(async (rq, rs) => {
    let pfad = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (pfad.endsWith('/')) pfad += 'index.html';
    if (/\/essen\.(js|json)$/.test(pfad)) abrufe.push(pfad.split('/').pop());
    if (essInhalt != null && pfad.endsWith('/essen.json')) { rs.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' }); rs.end(essInhalt); return; }
    const datei = normalize(join(WURZEL, pfad));
    if (!datei.startsWith(WURZEL)) { rs.writeHead(403); rs.end(); return; }
    try {
      const inhalt = await readFile(datei);
      rs.writeHead(200, { 'content-type': TYP[extname(datei)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      rs.end(inhalt);
    } catch { rs.writeHead(404); rs.end('nicht gefunden'); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  basis = `http://localhost:${server.address().port}`;
  browser = await pw.chromium.launch();
  await mkdir(FOTOS, { recursive: true });
});
after(async () => { await browser?.close(); await new Promise(r => (server ? server.close(r) : r())); });

const DATEI = {
  'schnaeppchen-daten/schnaeppchen/data/current.json': 'schnaeppchen-current.json',
  'vorteile-daten/vorteile/data/aktuell.json': 'vorteile-aktuell.json',
  'konzerte-daten/konzerte/data/konzerte.json': 'konzerte-konzerte.json',
  'konzerte-daten/konzerte/data/releases.json': 'konzerte-releases.json',
  'konzerte-daten/konzerte/data/status.json': 'konzerte-status.json',
};
async function oeffne({ breite = 428, hoehe = 926, pfad = '/mein-vorteil/#essen', jetzt = JETZT, foto = false, radar = null, uhrLaeuft = false, lokale = null } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: foto ? 2 : 1, isMobile: true, hasTouch: true,
    locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block',
  });
  const fremd = [], merkPosts = [];
  // Merkliste (Stern) geht an das ntfy-Thema der Seite – mitschreiben statt senden
  await ctx.route('https://ntfy.sh/**', route => { merkPosts.push({ url: route.request().url(), method: route.request().method(), body: route.request().postData() }); return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{}' }); });
  await ctx.route('https://raw.githubusercontent.com/**', async route => {
    const rest = new URL(route.request().url()).pathname.replace(/^\/XanderFoxy\/Synquenzer\//, '');
    const kopf = { 'access-control-allow-origin': '*' };
    if (lokale && rest === 'vorteile-daten/vorteile/data/essen.json') return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: lokale });
    if (!DATEI[rest]) return route.fulfill({ status: 404, headers: kopf, body: '' });
    if (radar && rest.endsWith('/aktuell.json')) { const d = JSON.parse(readFileSync(join(FIX, 'vertrag', DATEI[rest]), 'utf8')); radar(d); return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: JSON.stringify(d) }); }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: kopf, body: readFileSync(join(FIX, 'vertrag', DATEI[rest])) });
  });
  await ctx.route(/^https:\/\/(api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)\//, route => {
    const u = new URL(route.request().url()), cors = { 'access-control-allow-origin': '*' };
    const json = b => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(b) });
    if (u.host === 'api.coingecko.com') return json({ bitcoin: { eur: 60000, eur_24h_change: 1 }, ethereum: { eur: 2000, eur_24h_change: -1 } });
    if (u.host === 'api.crypto.com') { const i = u.searchParams.get('instrument_name'); return json({ code: 0, result: { data: [{ i, a: i === 'BTC_EUR' ? '60000' : '2000', c: '0.01' }] } }); }
    return route.fulfill({ status: 404, headers: cors, body: '' });
  });
  await ctx.route(/^https:\/\/(?!raw\.githubusercontent\.com|ntfy\.sh\/|api\.coingecko\.com|api\.crypto\.com|api\.exchange\.coinbase\.com)/, route => { fremd.push(route.request().url()); return route.fulfill({ status: 204, body: '' }); });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', e => fehler.push(String(e)));
  if (uhrLaeuft) await page.clock.install({ time: new Date(jetzt) }); else await page.clock.setFixedTime(new Date(jetzt));
  await page.goto(basis + pfad);
  await page.waitForFunction(() => !/lädt|Lade/.test(document.getElementById('stand').textContent), null, { timeout: 10000 });
  if (pfad.endsWith('#essen')) await essDa(page);
  return { ctx, page, fehler, fremd, merkPosts };
}
const essDa = page => page.waitForFunction(() => document.querySelector('#p-essen .ess-chips, #p-essen .ess-leer') && !/Lade Essen/.test(document.getElementById('p-essen').textContent), null, { timeout: 10000 });
const nbsp = s => s.replace(/[  ]/g, ' ');
async function waehle(page, k) {
  await page.locator(`.ess-chips [data-ess-chip="${k}"]`).click();
  await page.waitForFunction(k => document.getElementById('ess-liste')?.getAttribute('aria-labelledby') === 'ess-c-' + k, k);
}
async function pruefeLayout(page, wo) {
  const r = await page.evaluate(() => {
    const zuKlein = [], raus = [];
    for (const el of document.querySelectorAll('#p-essen button, #p-essen a[href], #p-essen summary, #p-essen [role="tab"]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[hidden]') || el.closest('details:not([open]) > :not(summary)')) continue;
      if (b.height < 44 || b.width < 44) zuKlein.push(`${el.tagName} „${el.textContent.trim().slice(0, 30)}“ ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    for (const el of document.querySelectorAll('#p-essen .ess-karte, #p-essen .ess-woche, #p-essen .ess-doebeln')) {
      const b = el.getBoundingClientRect();
      if (b.width && (b.left < -0.5 || b.right > innerWidth + 0.5)) raus.push(`${el.className} ${Math.round(b.left)}–${Math.round(b.right)}`);
    }
    return { zuKlein, raus, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth };
  });
  const vw = page.viewportSize().width;
  assert.deepEqual(r.zuKlein, [], `${wo}: Tippflächen unter 44 px`);
  assert.deepEqual(r.raus, [], `${wo}: Karte ragt raus`);
  assert.ok(r.sw <= vw && r.bw <= vw, `${wo}: seitliches Scrollen (${r.sw}/${r.bw} > ${vw})`);
}

test('Lazy: Startseite holt weder essen.js noch essen.json; erst der Reiter (#essen), danach Kachel mit bestem Treffer', { skip: ohnePw }, async () => {
  abrufe.length = 0;
  const { ctx, page, fehler, fremd } = await oeffne({ pfad: '/mein-vorteil/', foto: true });
  await page.waitForTimeout(3500);
  assert.deepEqual(abrufe, [], 'beim Start nichts davon geholt – auch nicht im Leerlauf');
  assert.equal(await page.evaluate(() => !!document.getElementById('ess-stil') || 'MeinVorteilEssen' in window), false);
  const kachel = page.locator('#kacheln a[data-sprung="essen"]');
  assert.match(nbsp(await kachel.innerText()), /Essen[\s\S]*Gratis-Tage, Aktionen, Buffets/);
  await kachel.screenshot({ path: join(FOTOS, 'kachel-essen-erst.png') });
  await kachel.click();
  await essDa(page);
  assert.equal(new URL(page.url()).hash, '#essen');
  assert.equal(await page.locator('main').isHidden(), true);
  assert.equal(await page.locator('.sprung a[data-reiter="essen"]').getAttribute('aria-current'), 'true');
  assert.equal(await page.locator('#ort-name').innerText(), 'Essen');
  assert.deepEqual(abrufe, ['essen.js', 'essen.json']);
  const sp = await page.evaluate(async () => ({
    auszug: (localStorage.getItem('mein-vorteil-essen-kachel') || '').length,
    ablage: await caches.open('mv-essen').then(c => c.keys()).then(k => k.map(r => new URL(r.url).pathname)),
  }));
  assert.ok(sp.auszug > 300 && sp.auszug < 25000, `Auszug ${sp.auszug} Zeichen`);
  assert.deepEqual(sp.ablage, ['/mein-vorteil/essen.json']);
  for (const ab of ['deals', 'mehr']) {
    await page.locator(`.sprung a[data-ziel="${ab}"]`).click();
    await page.waitForFunction(() => document.getElementById('p-essen').hidden && !document.querySelector('main').hidden);
    await page.locator('.sprung a[data-reiter="essen"]').click();
    await page.waitForFunction(() => !document.getElementById('p-essen').hidden);
  }
  assert.equal(abrufe.filter(a => a === 'essen.json').length, 1, 'nur der Reiter, einmal');
  await page.locator('.sprung a[data-ziel="start"]').click();
  await page.waitForFunction(() => /McSundae/.test(document.querySelector('#kacheln a[data-sprung="essen"]').textContent));
  assert.equal(await kachel.locator('li').count(), 2);
  assert.match(nbsp(await kachel.innerText()), /McSundae für 1 €\s*ab Mo 16\.11\. · nur App[\s\S]*Heißgetränk[^\n]*\s*gratis ohne Kauf/);
  // hochkant: die Zeile unter dem Titel (wann · Bedingung) passt ganz in die Kachel; Titel kürzt wie überall mit „…“
  const abgeschnitten = await kachel.locator('li span').evaluateAll(es => es.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
  assert.deepEqual(abgeschnitten, [], 'Kachel-Zeile abgeschnitten');
  await kachel.screenshot({ path: join(FOTOS, 'kachel-essen.png') });
  await page.screenshot({ path: join(FOTOS, 'start-mit-essen-hoch.png') });
  await page.reload();
  await page.waitForFunction(() => /McSundae/.test(document.querySelector('#kacheln a[data-sprung="essen"]')?.textContent || ''));
  assert.equal(abrufe.filter(a => a === 'essen.json').length, 1, 'Start nach Neuladen holt nichts');
  assert.deepEqual(fremd, [], 'keine fremden Adressen geladen');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Unterreiter, Heute-Logik, Karten mit Quelle + geprüft, Layout (${lage} ${breite} × ${hoehe})`, { skip: ohnePw }, async () => {
    const { ctx, page, fehler, fremd } = await oeffne({ breite, hoehe, foto: true });
    assert.deepEqual(await page.locator('.ess-chips [data-ess-chip]').evaluateAll(b => b.map(x => x.dataset.essChip)), ALLE_CHIPS);
    assert.deepEqual((await page.locator('.ess-chips [data-ess-chip]').allInnerTexts()).map(t => t.replace(/\d+$/, '').trim()), ['Heute', 'Lokale', 'Regelmäßig', 'Fastfood & Ketten', 'Pizza & Abholen', 'All-you-can-eat', 'XXL & Challenges', 'Gratis-Tage']);
    const heute = nbsp(await page.locator('#ess-liste').innerText());
    assert.match(heute, /Heute, So 15\.11\./);
    assert.match(heute, /Café Bubu – Sonntags-Frühstücksbuffet[\s\S]*heute 10–14 Uhr · läuft/);
    assert.doesNotMatch(heute, /Naumanns/, 'nur einzelne Sonntage belegt: nicht unter Heute');
    assert.doesNotMatch(heute, /ab 18 Uhr · läuft/, 'ohne Ende kein „läuft“');
    assert.doesNotMatch(heute, /Stand undatiert/);
    assert.match(heute, /Als Nächstes[\s\S]*McSundae für 1 €[\s\S]*Mo 16\.11\. – Do 19\.11\. · in 1 Tag/);
    assert.match(heute, /Morgen, Mo 16\.11\.:[^\n]*Play Off/);
    assert.match(heute, /Die Woche/);
    assert.match(heute, /Döbeln: In Döbeln selbst/);
    assert.doesNotMatch(heute, /Pizza Hut/, 'abgelaufen (13.11.)');
    assert.doesNotMatch(heute, /Mega Pizza Woche/, 'Muster nicht unter Heute');
    // jede Karte: Quelle-Link (neuer Tab, ohne Referrer) und „geprüft am“
    const ohne = await page.locator('#ess-liste .ess-karte').evaluateAll(ks => ks.filter(k => !k.querySelector('.ess-fuss a[href^="https://"]') || !/geprüft 15\.11\.2026/.test(k.querySelector('.ess-stand')?.textContent || '')).map(k => k.id));
    assert.deepEqual(ohne, [], 'jede Karte mit Quelle und „geprüft am“');
    assert.deepEqual([...new Set(await page.locator('#p-essen a[target]').evaluateAll(as => as.map(a => `${a.target} ${a.rel}`)))], ['_blank noopener noreferrer']);
    await page.screenshot({ path: join(FOTOS, `essen-heute-${lage}.png`) });
    await pruefeLayout(page, `${lage} Heute`);
    // Täglich aufklappen: Subway heute BBQ Rib
    await page.locator('.ess-auf > summary').first().click();
    assert.match(nbsp(await page.locator('#ess-subway-sub-des-tages').innerText()), /bitte vor Ort prüfen[\s\S]*Heute: BBQ Rib/);
    await pruefeLayout(page, `${lage} Täglich offen`);
    for (const c of CHIPS.slice(1)) {
      await waehle(page, c);
      const t = nbsp(await page.locator('#ess-liste').innerText());
      assert.ok(await page.locator('#ess-liste .ess-karte').count() >= 2, `${c} fast leer`);
      if (c === 'ketten') assert.match(t, /McSundae für 1 €[\s\S]*nur mit App[\s\S]*belegt/);
      if (c === 'pizza') { assert.match(t, /Abhol-Pizza zum halben Preis: gerade keine laufende Aktion/); assert.match(t, /Kommt immer wieder \(2\)/); }
      if (c === 'ayce') {
        const km = await page.locator('#ess-liste > .ess-karte .ess-region').allInnerTexts(); // ohne „Kommt immer wieder“
        const z = km.map(s => Number((s.match(/(\d+) km/) || [])[1])).filter(Number.isFinite);
        assert.deepEqual(z, [...z].sort((a, b) => a - b), 'nach km');
        assert.match(t, /Julbord[\s\S]*IKEA Restaurant[\s\S]*Do 10\.12\./);
      }
      if (c === 'xxl') { assert.match(t, /Ess-Challenge: gerade keine laufende/); assert.match(t, /Feste Tagesessen in der Region/); }
      if (c === 'gratis') {
        assert.match(t, /Ohne Kauf gratis\s*Gratis Heißgetränk[\s\S]*gratis ohne Kauf[\s\S]*Tage mit Sonderpreis \(beim Kauf\)\s*Family-Preise/, 'das echte Gratis zuerst');
        assert.match(t, /Kindermenü: Stoff-Panda \+ Götterspeise dazu \(beim Kauf, IKEA Family\)/);
      }
      await pruefeLayout(page, `${lage} ${c}`);
      if (c !== 'xxl') await page.screenshot({ path: join(FOTOS, `essen-${c}-${lage}.png`) });
    }
    assert.deepEqual(fremd, []);
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

test('Gratis-Tage → „Geburtstag gratis ›“ öffnet Spartricks im Chip Geburtstag; „Ausführlich in Spartricks ›“ springt zur Karte', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne();
  await waehle(page, 'gratis');
  await page.locator('#ess-liste [data-ess-spar="geburtstag"]').click();
  await page.waitForFunction(() => location.hash === '#spartricks' && document.querySelector('#sp-c-geburtstag')?.getAttribute('aria-selected') === 'true', null, { timeout: 10000 });
  // zurück zu Essen, Karte mit Verweis: IKEA-Heißgetränk -> Spartricks „Gratis & Proben“, Karte im Bild
  await page.locator('.sprung a[data-reiter="essen"]').click();
  await page.locator('#ess-ikea-heissgetraenk [data-ess-spar]').click();
  await page.waitForFunction(() => document.querySelector('#sp-c-gratis')?.getAttribute('aria-selected') === 'true');
  const b = await page.locator('#sp-ikea-heissgetraenk').boundingBox();
  assert.ok(b && b.y >= 0 && b.y < page.viewportSize().height, 'Spartricks-Karte im Bild');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Neue Fassung oder kaputte Datei: „Seite neu laden“ statt „nicht erreichbar“; Montag zeigt McSundae unter Heute', { skip: ohnePw }, async () => {
  try {
    essInhalt = JSON.stringify({ ...DATEN, version: 2 });
    let { ctx, page, fehler } = await oeffne();
    assert.match(nbsp(await page.locator('#p-essen').innerText()), /neue Fassung der Essen-Liste – bitte die Seite neu laden/);
    assert.deepEqual(fehler, []);
    await ctx.close();
    essInhalt = '{"version":1,"eintraege":[{kaputt';
    ({ ctx, page, fehler } = await oeffne());
    assert.match(nbsp(await page.locator('#p-essen').innerText()), /Essen-Datei ist gerade fehlerhaft/);
    assert.deepEqual(fehler, []);
    await ctx.close();
  } finally { essInhalt = null; }
  const { ctx, page, fehler } = await oeffne({ jetzt: '2026-11-16T10:00:00Z' });
  const t = nbsp(await page.locator('#ess-liste').innerText());
  assert.match(t, /Heute, Mo 16\.11\.[\s\S]*McSundae für 1 €[\s\S]*heute · bis Do 19\.11\./);
  assert.match(t, /Peter's Pause[\s\S]*?heute bis 17 Uhr(?! · läuft)/, 'nur Ende bekannt: kein „läuft“');
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Radar „Aktuell“: Einträge der Kategorie essen nur im Reiter (Chip Aktuell, „vom Radar – bitte prüfen“), nicht unter „Mehr“; Abgelaufenes fehlt', { skip: ohnePw }, async () => {
  const radar = d => {
    d.kategorien.essen = [
      { id: 'ess-radar-1', kategorie: 'essen', titel: 'Burger King: 2 Whopper für 7 € mit App-Coupon', zeile: 'nur mit App · bis So 22.11.', link: 'https://www.mydealz.de/deals/test-ess-radar-1', quelle: 'mydealz', datum: '2026-11-15T07:00:00.000Z', bis: '2026-11-22T22:59:59.000Z' },
      { id: 'ess-radar-alt', kategorie: 'essen', titel: 'Abgelaufener Pizza-Deal', zeile: 'vorbei', link: 'https://www.mydealz.de/deals/test-ess-radar-alt', quelle: 'mydealz', datum: '2026-11-10T07:00:00.000Z', bis: '2026-11-14T22:59:59.000Z' },
    ];
  };
  const { ctx, page, fehler, fremd } = await oeffne({ radar });
  assert.deepEqual(await page.locator('.ess-chips [data-ess-chip]').evaluateAll(b => b.map(x => x.dataset.essChip)), [...ALLE_CHIPS, 'aktuell']);
  assert.match(nbsp(await page.locator('[data-ess-chip="aktuell"]').innerText()), /Aktuell\s*1/);
  await waehle(page, 'aktuell');
  const t = nbsp(await page.locator('#ess-liste').innerText());
  assert.match(t, /2 Whopper für 7 €[\s\S]*vom Radar – bitte prüfen[\s\S]*bis 22\.11\.2026/);
  assert.doesNotMatch(t, /Abgelaufener Pizza-Deal/);
  assert.equal(await page.locator('#ess-liste a[href="https://www.mydealz.de/deals/test-ess-radar-1"]').getAttribute('rel'), 'noopener noreferrer');
  await pruefeLayout(page, 'Aktuell');
  await page.locator('.sprung a[data-ziel="mehr"]').click();
  await page.waitForFunction(() => !document.querySelector('main').hidden);
  assert.doesNotMatch(await page.locator('main').textContent(), /Whopper für 7 €/, 'nicht noch einmal unter „Mehr“ (auch nicht eingeklappt)');
  assert.deepEqual(fremd, []);
  assert.deepEqual(fehler, []);
  await ctx.close();
});

test('Mitternacht bei offener Seite: Start-Kachel springt von „ab Mo 16.11.“ auf „heute bis Do 19.11.“', { skip: ohnePw }, async () => {
  const { ctx, page, fehler } = await oeffne({ jetzt: '2026-11-15T22:58:00Z', uhrLaeuft: true }); // So 23:58 Berlin
  const nicht404 = [];
  page.on('response', r => { if (r.status() === 404) { const u = r.url(); if (/essen\.(js|json)/.test(u)) nicht404.push(u); } });
  await page.locator('.sprung a[data-ziel="start"]').click();
  const text = () => page.evaluate(() => document.querySelector('#kacheln a[data-sprung="essen"]').textContent.replace(/[\u00a0\u202f]/g, ' '));
  await page.waitForFunction(() => /ab Mo 16\.11\./.test(document.querySelector('#kacheln a[data-sprung="essen"]').textContent));
  await page.clock.runFor(3 * 60000); // Mo 00:01 – das 30-s-Intervall merkt den neuen Tag
  await page.waitForFunction(() => /heute bis Do 19\.11\./.test(document.querySelector('#kacheln a[data-sprung="essen"]').textContent), null, { timeout: 5000 })
    .catch(async () => assert.fail(`Kachel nach Mitternacht alt: ${await text()}`));
  assert.match(await text(), /McSundae für 1 €\s*heute bis Do 19\.11\. · nur App/);
  assert.deepEqual(fehler.filter(f => !/status of 404/.test(f)), [], 'nur die 404 der absichtlich fehlenden Radar-Dateien');
  assert.deepEqual(nicht404, [], 'essen.js/essen.json nie 404');
  await ctx.close();
});

// --- Lokale um Döbeln + Regelmäßig (16.11.2026) ------------------------------------------------------------------------------
test('Lokale: Liste lesen, Küche/Umkreis/Bewertung/AYCE/XXL filtern, „Beste zuerst“ zieht wenige Stimmen zur Mitte', () => {
  const L = I.normLokale(LOK);
  assert.ok(L.lokale.length >= 12 && L.ketten.length >= 5);
  assert.equal(I.normLokale({ lokale: [{ id: 'xy', name: 'Ohne Quelle', bewertungen: [{ wert: 5, anzahl: 3, url: 'http://unsicher.de' }] }] }).lokale[0].bew.length, 0, 'nur https-Bewertungen');
  assert.equal(I.normLokale({ x: 1 }), null);
  const j = J('2026-11-16T11:00:00Z');
  const alle = [...L.lokale, ...I.lokaleAusEintraegen(N, j.iso)];
  const F = { kueche: '', km: 30, bew: 0, offen: false, ayce: false, xxl: false, merk: false, sort: 'beste' };
  const name = l => plain(l.map(x => x.name));
  const beste = I.filtereLokale(alle, F, j, new Set());
  assert.ok(beste.every(x => x.km <= 30), 'Standard bis 30 km');
  assert.equal(beste[0].name, 'Bürgergarten Döbeln', '4,8 bei 1.582 Stimmen ganz oben');
  assert.ok(name(beste).indexOf('Jin Hai') > name(beste).indexOf('Al Dente'), '4,0 bei 4 Stimmen nicht vor 4,6 bei 510');
  assert.deepEqual(name(I.filtereLokale(alle, { ...F, kueche: 'italienisch' }, j, new Set())), ['La Gioia', 'Al Dente', 'Pizza Franco', 'Freddy Fresh Pizza & Burger', 'Khindas Pizzeria']);
  assert.ok(I.filtereLokale(alle, { ...F, bew: 4.5 }, j, new Set()).every(x => x.bew.length && Math.max(...x.bew.map(b => b.anzahl)) > 0));
  assert.ok(!name(I.filtereLokale(alle, { ...F, bew: 4.5 }, j, new Set())).includes('Freddy Fresh Pizza & Burger'), 'Hauptbewertung = die mit den meisten Stimmen (3,6 bei 401)');
  const ay = I.filtereLokale(alle, { ...F, ayce: true }, j, new Set());
  assert.ok(ay.length >= 10 && ay.every(x => x.ayce && x.km <= 70), 'All-you-can-eat: bis 70 km (Chemnitz, Dresden, Leipzig)');
  assert.ok(!name(ay).some(n => /Naumanns/.test(n)), 'nur „Kommt immer wieder“: nicht als Lokal');
  assert.deepEqual(name(I.filtereLokale(alle, { ...F, xxl: true, sort: 'nah' }, j, new Set())).slice(0, 2).sort(), ['Bürgergarten Döbeln', 'KL17']);
  assert.deepEqual(name(I.filtereLokale(alle, { ...F, merk: true }, j, new Set(['doe-namaste']))), ['Namaste']);
  const nah = I.filtereLokale(alle, { ...F, sort: 'nah', km: 70 }, j, new Set()).map(x => x.km);
  assert.deepEqual(nah, [...nah].sort((a, b) => a - b));
  // Ketten-Aktionen zeigen auf echte Einträge
  const ids = new Set(DATEN.eintraege.map(e => e.id));
  for (const k of L.ketten) for (const a of k.aktionen) assert.ok(ids.has(a), `${k.id}: ${a}`);
});

test('Öffnungszeiten (OSM): Ruhetag, später, offen über Mitternacht, Unbekanntes ohne Status', () => {
  const p = I.oeffnungPlan('Tu-Su 11:30-14:00,17:00-22:00; Mo off; PH off');
  assert.equal(I.oeffnungJetzt(p, J('2026-11-16T11:00:00Z')).text, 'heute Ruhetag');
  assert.equal(I.oeffnungJetzt(p, J('2026-11-17T10:00:00Z')).text, 'heute ab 11:30 Uhr');
  assert.equal(I.oeffnungJetzt(p, J('2026-11-17T12:00:00Z')).text, 'offen bis 14 Uhr');
  assert.equal(I.oeffnungJetzt(p, J('2026-11-17T21:30:00Z')).s, 'vorbei');
  assert.equal(I.oeffnungJetzt(I.oeffnungPlan('Fr-Sa 18:00-02:00'), J('2026-11-21T00:30:00Z')).text, 'offen bis 2 Uhr', 'Sa 1:30 noch vom Freitag');
  assert.equal(I.oeffnungJetzt(I.oeffnungPlan('24/7'), J('2026-11-17T03:00:00Z')).s, 'offen');
  assert.equal(I.oeffnungPlan('Mo-Fr 11:00-22:00; Jan off'), null);
  assert.equal(I.oeffnungPlan('sunrise-sunset'), null);
  assert.deepEqual(Object.keys(I.oeffnungPlan('Mo,We,Fr-Su 11:00-21:00')).map(Number), [1, 3, 5, 6, 7]);
});

test('Regelmäßig: je Wochentag die festen Muster (Mi Play Off, Monchi, Schnitzeltag; So Shiki, Café Bubu), fast tägliche einmal', () => {
  const L = I.normLokale(JSON.parse(LOK_RADAR));
  const r = I.regelTage(N, L, J('2026-11-16T11:00:00Z'));
  assert.equal(r.tage.length, 7);
  assert.equal(r.tage[0].iso, '2026-11-16');
  const tag = iso => r.tage.find(t => t.iso === iso).z.map(x => x.was).join(' | ');
  assert.match(tag('2026-11-18'), /Play Off[\s\S]*Monchi Vegan[\s\S]*Miramar – Schnitzeltag/);
  assert.match(tag('2026-11-22'), /Shiki[\s\S]*Café Bubu/);
  assert.match(tag('2026-11-16'), /Subway: Sub des Tages – Italian B\.M\.T\./);
  assert.doesNotMatch(tag('2026-11-19'), /Mythos|Peter's Pause|Kartoffelhaus/, 'fast täglich nicht in jeder Zeile');
  assert.ok(r.immer.some(e => /Mythos Palace/.test(e.titel)) && r.immer.some(e => /Kartoffelhaus/.test(e.titel)));
  assert.deepEqual(plain(r.tage[0].zu), ['Al Dente'], 'Ruhetag aus OpenStreetMap (Mo off)');
  // Prüfer B5: OSM lässt Ruhetage meist weg – nicht genannte Tage sind zu (wie „heute Ruhetag“ an der Karte)
  const ohneOff = { ...L, lokale: [{ ...L.lokale.find(l => l.id === 'doe-al-dente'), oeffnung: 'Tu-Su 11:30-14:00,17:00-22:00' }] };
  const r2 = I.regelTage(N, ohneOff, J('2026-11-16T11:00:00Z'));
  assert.deepEqual(plain(r2.tage[0].zu), ['Al Dente'], 'Mo fehlt in den Öffnungszeiten = Ruhetag');
  assert.deepEqual(plain(r2.tage[1].zu), []);
  assert.equal(I.oeffnungJetzt(I.oeffnungPlan('Tu-Su 11:30-14:00,17:00-22:00'), J('2026-11-16T11:00:00Z')).text, 'heute Ruhetag');
  // weitere Lokale kommen knapp ohne id: id aus der OSM-Kennung (Stern/Anker bleiben stabil)
  assert.deepEqual(plain(L.weitere.map(w => w.id)).sort(), ['osm-node-1003', 'osm-node-1006', 'osm-way-2001']);
  assert.equal(I.normLokale({ lokale: [], weitere: [{ name: 'Ohne Kennung' }, { name: 'Böse', osm: 'node/1"><x' }] }).weitere.length, 0);
});

for (const [breite, hoehe, lage] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  test(`Lokale + Regelmäßig im Browser: Filter, Merken, Karte/Apple-Karten, Ketten, Layout (${lage})`, { skip: ohnePw }, async () => {
    abrufe.length = 0;
    const { ctx, page, fehler, fremd, merkPosts } = await oeffne({ breite, hoehe, foto: true, jetzt: '2026-11-17T12:00:00Z', lokale: LOK_RADAR }); // Di 13:00 Berlin
    assert.deepEqual(merkPosts, [], 'ohne Gemerktes nichts an ntfy');
    await waehle(page, 'lokale');
    await page.waitForSelector('#ess-liste .ess-lok');
    let t = nbsp(await page.locator('#ess-liste').innerText());
    assert.match(t, /Alle Küchen[\s\S]*Italienisch & Pizza[\s\S]*bis 30 km[\s\S]*Heute offen/);
    assert.match(t, /Öffnungszeiten OpenStreetMap, Stand 16\.11\.2026/);
    const erste = page.locator('#ess-liste .ess-lok').first();
    assert.match(nbsp(await erste.innerText()), /Bürgergarten Döbeln[\s\S]*4,8[\s\S]*1\.582 Stimmen[\s\S]*Restaurant Guru[\s\S]*Stand 16\.11\.2026[\s\S]*Leute sagen:/);
    const ad = nbsp(await page.locator('#ess-lok-doe-al-dente').innerText());
    assert.match(ad, /offen bis 14 Uhr/);
    assert.match(ad, /Öffnungszeiten: Di–So 11:30–14:00,17:00–22:00 · Mo Ruhetag/);
    assert.match(await page.locator('#ess-lok-doe-al-dente .ess-fuss a').first().getAttribute('href'), /^https:\/\/www\.openstreetmap\.org\/\?mlat=51\.12152&mlon=13\.11841/);
    assert.match(await page.locator('#ess-lok-doe-al-dente .ess-fuss a', { hasText: 'Apple Karten' }).getAttribute('href'), /^https:\/\/maps\.apple\.com\/\?q=Al%20Dente&ll=51\.12152,13\.11841/);
    assert.match(t, /Neu bei OpenStreetMap: Testhof Neu/);
    await page.screenshot({ path: join(FOTOS, `essen-lokale-${lage}.png`) });
    await pruefeLayout(page, `${lage} Lokale`);
    // Küche
    await page.locator('[data-ess-f="kueche"][data-ess-v="italienisch"]').click();
    const it = await page.locator('#ess-liste .ess-lok[data-ess-lok] .ess-titel').allInnerTexts();
    assert.ok(it.length >= 5 && it.every(x => /Gioia|Dente|Franco|Freddy|Khindas/.test(x)), it.join(' | '));
    await page.locator('[data-ess-f="bew"][data-ess-v="4.5"]').click();
    assert.deepEqual((await page.locator('#ess-liste .ess-lok[data-ess-lok] .ess-titel').allInnerTexts()).map(x => x.split(' · ')[0]), ['La Gioia', 'Al Dente', 'Pizza Franco']);
    await page.locator('[data-ess-f="kueche"][data-ess-v=""]').click();
    await page.locator('[data-ess-f="bew"][data-ess-v="4.5"]').click();
    // Heute offen (Di 13:00): Al Dente ja (11:30–14), Testhof Neu nein (Mi–So)
    await page.locator('[data-ess-f="offen"]').click();
    t = (await page.locator('#ess-liste .ess-lok[data-ess-lok] .ess-titel').allInnerTexts()).join(' | ');
    assert.match(t, /Al Dente/);
    assert.doesNotMatch(t, /Testhof Neu/);
    await page.locator('[data-ess-f="offen"]').click();
    // All-you-can-eat: bis 70 km, Chemnitz/Dresden/Leipzig
    await page.locator('[data-ess-f="ayce"]').click();
    t = nbsp(await page.locator('#ess-liste').innerText());
    assert.match(t, /bis 70 km \(All-you-can-eat\/XXL/);
    assert.match(t, /ESPITAS[\s\S]*Chemnitz · 33 km/);
    await page.screenshot({ path: join(FOTOS, `essen-lokale-ayce-${lage}.png`) });
    await pruefeLayout(page, `${lage} Lokale AYCE`);
    await page.locator('[data-ess-f="ayce"]').click();
    // bis 70 km: ehrlich sagen, dass OSM-Lokale nur bis 30 km reichen (Prüfer B1)
    await page.locator('[data-ess-f="km"][data-ess-v="70"]').click();
    assert.match(nbsp(await page.locator('#ess-liste .ess-standzeile').first().innerText()), /bis 70 km \(Lokale bis 30 km, weiter weg nur All-you-can-eat und XXL\)/);
    await page.locator('[data-ess-f="km"][data-ess-v="30"]').click();
    // Merken: Stern, bleibt nach Neuladen, Filter „Gemerkt“
    const stern = page.locator('#ess-lok-doe-namaste .ess-merk');
    await stern.click();
    assert.equal(await stern.getAttribute('aria-pressed'), 'true');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('mein-vorteil-essen-gemerkt'))), ['doe-namaste']);
    // Prüfer B3: der Stern geht als Liste an den Radar (ntfy-Thema wie vorteile/config.json module.essen.merkThema)
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('mein-vorteil-essen-gemerkt-gesendet') || '{}').offen === false);
    assert.equal(merkPosts.length, 1);
    assert.equal(merkPosts[0].method, 'POST');
    assert.equal(merkPosts[0].url, `https://ntfy.sh/${KONFIG.module.essen.merkThema}`);
    assert.deepEqual(JSON.parse(merkPosts[0].body), { v: 1, essen: ['doe-namaste'] });
    await page.locator('[data-ess-f="merk"]').click();
    assert.deepEqual(await page.locator('#ess-liste .ess-lok[data-ess-lok] .ess-titel').allInnerTexts(), ['Namaste · Indisches Restaurant']);
    assert.match(nbsp(await page.locator('#ess-liste').innerText()), /Erinnerung per Push am All-you-can-eat- oder Aktionstag eines gemerkten Lokals/);
    await page.locator('[data-ess-f="merk"]').click();
    // Ketten in der Nähe
    await page.locator('#ess-liste details.ess-auf > summary', { hasText: 'Ketten in der Nähe' }).click();
    const dom = nbsp(await page.locator('#ess-kette-kette-dominos').innerText());
    assert.match(dom, /Domino's[\s\S]*nächste: Freiberg · 2[78] km[\s\S]*keine Lieferung nach Döbeln/);
    assert.match(dom, /Aktionen:[\s\S]*Abhol-Pizza/);
    assert.match(nbsp(await page.locator('#ess-kette-kette-kfc').innerText()), /nächste: Chemnitz/);
    // Prüfer B2: Filiale ohne Ort in OSM -> kein Ort aus der gepflegten Liste (dort Dresden/Leipzig), Hinweis statt falscher Adresse
    const ph = nbsp(await page.locator('#ess-kette-kette-pizzahut').innerText());
    assert.match(ph, /nächste: 44 km/);
    assert.doesNotMatch(ph, /Leipzig|Dresden/);
    assert.match(ph, /Filiale: Pizza Hut \(Adresse fehlt in OpenStreetMap – siehe Karte\)/);
    assert.match(await page.locator('#ess-kette-kette-pizzahut .ess-fuss a').first().getAttribute('href'), /mlat=51\.04476&mlon=13\.73691/);
    await pruefeLayout(page, `${lage} Ketten`);
    await page.locator('#ess-kette-kette-dominos [data-ess-chip="pizza"]').click();
    await page.waitForFunction(() => document.getElementById('ess-liste')?.getAttribute('aria-labelledby') === 'ess-c-pizza');
    // Regelmäßig
    await waehle(page, 'regel');
    t = nbsp(await page.locator('#ess-liste').innerText());
    assert.match(t, /Di 17\.11\. · heute[\s\S]*Lindenschänke/);
    assert.match(t, /Mi 18\.11\.[\s\S]*All-you-can-eat[\s\S]*Play Off[\s\S]*Monchi Vegan/);
    assert.match(t, /Mo 23\.11\.[\s\S]*Ruhetag[\s\S]*Al Dente/);
    assert.match(t, /Fast täglich \(\d+\)/);
    await page.screenshot({ path: join(FOTOS, `essen-regel-${lage}.png`) });
    await pruefeLayout(page, `${lage} Regelmäßig`);
    // nach Neuladen: Stern und Filter gemerkt, Lokale aus der Radar-Datei
    await page.reload();
    await essDa(page);
    await waehle(page, 'lokale');
    await page.waitForSelector('#ess-lok-doe-namaste');
    assert.equal(await page.locator('#ess-lok-doe-namaste .ess-merk').getAttribute('aria-pressed'), 'true');
    assert.equal(merkPosts.length, 1, 'nach Neuladen kein zweites Senden (letzte Meldung jünger als 6 h)');
    assert.ok(!abrufe.includes('../vorteile/essen.json'));
    assert.deepEqual(fremd.filter(u => !/^https:\/\/raw\.githubusercontent\.com/.test(u)), []);
    assert.deepEqual(fehler, []);
    await ctx.close();
  });
}

test('Lokale ohne Radar-Datei: gepflegte Liste (../vorteile/essen.json), ohne Öffnungszeiten-Versprechen; offline danach aus der Ablage', { skip: ohnePw }, async () => {
  abrufe.length = 0;
  const { ctx, page, fehler } = await oeffne({ jetzt: '2026-11-17T12:00:00Z' });
  await waehle(page, 'lokale');
  await page.waitForSelector('#ess-liste .ess-lok');
  const t = nbsp(await page.locator('#ess-liste').innerText());
  assert.match(t, /15 von \d+ Lokalen · bis 30 km/);
  assert.match(t, /Öffnungszeiten folgen mit dem nächsten Radar-Lauf/);
  assert.doesNotMatch(t, /offen bis|Ruhetag/);
  assert.ok(abrufe.filter(a => a === 'essen.json').length >= 2, 'Seiten-essen.json + ../vorteile/essen.json');
  await ctx.setOffline(true);
  await page.evaluate(() => { localStorage.setItem('mein-vorteil-essen-chip', JSON.stringify('lokale')); });
  await page.reload().catch(() => {});
  await ctx.setOffline(false);
  assert.deepEqual(fehler.filter(f => !/status of 404/.test(f)), [], 'nur die 404 der (noch) fehlenden Radar-Datei');
  await ctx.close();
});
