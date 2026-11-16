// Modul „events“ (Ausflüge & Aktionen, 16.11.2026): Schema der Liste ausfluege.json, Datumslogik der Muster, Doppel,
// Vergangenes raus, Meldungen (Ort im Umkreis, Seriosität), Push-Regeln, eigene Datei events.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import events, { ARTEN, terminImJahr, naechsterTermin, ostern, ausListe, bewerteMeldung, ohneDoppel, seriositaet, fahrMinuten } from '../module/events.mjs';
import { ORTE } from '../lib/orte.mjs';
import { MODULE } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const ROH = readFileSync(join(HIER, '..', '..', 'ausfluege.json'), 'utf8');
const LISTE = JSON.parse(ROH);
const CFG = JSON.parse(readFileSync(join(HIER, '..', '..', 'config.json'), 'utf8'));

test('Schema ausfluege.json: Fassung, Stand, Pflichtfelder, https-Quelle, Prüfdatum, Orte bekannt, keine Emojis', () => {
  assert.equal(LISTE.version, 1);
  assert.match(LISTE.stand, /^\d{4}-\d\d-\d\d$/);
  assert.doesNotMatch(ROH, /\p{Extended_Pictographic}/u);
  const ids = new Set();
  for (const e of LISTE.eintraege) {
    assert.match(e.id, /^[a-z0-9-]{2,60}$/, e.id);
    assert.ok(!ids.has(e.id), `doppelt: ${e.id}`); ids.add(e.id);
    assert.ok(ARTEN.includes(e.art), `${e.id}: art`);
    assert.ok(e.titel.length >= 3 && e.titel.length <= 140, e.id);
    assert.match(e.quelle.url, /^https:\/\/[^/]+\.[^/]+/, `${e.id}: Quelle`);
    assert.ok(e.quelle.name, `${e.id}: Quellname`);
    assert.match(e.geprueft, /^\d{4}-\d\d-\d\d$/, `${e.id}: Prüfdatum`);
    assert.ok(e.wann?.length >= 3, `${e.id}: wann`);
    assert.ok(e.vorteil?.length >= 5, `${e.id}: Vorteil`);
    assert.ok(e.termine || e.muster || e.dauerhaft, `${e.id}: termine/muster/dauerhaft`);
    if (e.ort) assert.ok(ORTE[e.ort], `${e.id}: Ort ${e.ort} unbekannt`); else assert.ok(e.region, `${e.id}: ohne Ort braucht es region`);
    if (e.art === 'testen') assert.ok(['seriös', 'unseriös'].includes(e.serioes), `${e.id}: Seriosität`);
    for (const t of e.termine || []) assert.ok(t.ab <= t.bis, `${e.id}: ab <= bis`);
  }
  assert.ok(LISTE.eintraege.length >= 12);
  for (const a of ARTEN) assert.ok(LISTE.eintraege.some(e => e.art === a), `Art ${a} fehlt`);
});

test('Datumslogik: Muster (2. Samstag Mai, Sonntag um 18. Mai, Pfingstmontag, 2. Sonntag Sept., 3. Advent, letzter)', () => {
  assert.deepEqual(terminImJahr({ typ: 'wochentag', monat: 5, n: 2, wt: 6 }, 2026), { ab: '2026-05-09', bis: '2026-05-09' }); // Gratis-Comic-Tag 2026 (Quelle)
  assert.deepEqual(terminImJahr({ typ: 'wochentag', monat: 5, n: 2, wt: 6 }, 2025), { ab: '2025-05-10', bis: '2025-05-10' }); // 2025 (Quelle)
  assert.equal(terminImJahr({ typ: 'wochentag', monat: 5, n: 2, wt: 6 }, 2027).ab, '2027-05-08');
  assert.equal(terminImJahr({ typ: 'sonntagBis', monat: 5, tag: 18 }, 2027).ab, '2027-05-16'); // Museumstag 2027 (berlin.de)
  assert.equal(terminImJahr({ typ: 'sonntagBis', monat: 5, tag: 18 }, 2026).ab, '2026-05-17');
  assert.equal(terminImJahr({ typ: 'sonntagBis', monat: 5, tag: 18 }, 2025).ab, '2025-05-18');
  assert.equal(ostern(2026), '2026-04-05'); assert.equal(ostern(2027), '2027-03-28');
  assert.equal(terminImJahr({ typ: 'ostern', plus: 50 }, 2027).ab, '2027-05-17'); // Pfingstmontag
  assert.equal(terminImJahr({ typ: 'wochentag', monat: 9, n: 2, wt: 7 }, 2026).ab, '2026-09-13'); // Denkmaltag 2026
  assert.deepEqual(terminImJahr({ typ: 'advent', n: 3, tage: 2 }, 2026), { ab: '2026-12-12', bis: '2026-12-13' });
  assert.equal(terminImJahr({ typ: 'advent', n: 1 }, 2026).ab, '2026-11-29');
  assert.equal(terminImJahr({ typ: 'wochentag', monat: 12, n: -1, wt: 5 }, 2026).ab, '2026-12-25');
  assert.equal(terminImJahr({ typ: 'datum', monat: 6, tag: 21, dauer: 3 }, 2026).bis, '2026-06-23');
});

test('nächster Termin: laufend zählt, vorbei -> nächstes Jahr, feste Termine vor Muster', () => {
  const m = { muster: { typ: 'wochentag', monat: 5, n: 2, wt: 6 } };
  assert.equal(naechsterTermin(m, '2026-05-09').ab, '2026-05-09');
  assert.equal(naechsterTermin(m, '2026-05-10').ab, '2027-05-08');
  const f = { termine: [{ ab: '2026-11-24', bis: '2026-12-23' }] };
  assert.equal(naechsterTermin(f, '2026-12-01').ab, '2026-11-24'); // läuft gerade
  assert.equal(naechsterTermin(f, '2026-12-24'), null); // vorbei, kein Muster
});

test('Liste -> Termine: Vergangenes raus, Entfernung + Fahrzeit, Regelmäßig mit nächstem Termin', () => {
  const { termine, regelmaessig } = ausListe(LISTE, '2026-11-16');
  const leipzig = termine.find(t => t.id === 'weihnachtsmarkt-leipzig');
  assert.equal(leipzig.ab, '2026-11-24'); assert.ok(leipzig.km > 40 && leipzig.km < 70); assert.ok(leipzig.fahrMin >= 40);
  assert.equal(termine.find(t => t.id === 'weihnachtsmarkt-doebeln').ausMuster, true);
  assert.ok(regelmaessig.some(r => r.id === 'gratis-comic-tag' && r.naechster.ab === '2027-05-08'));
  assert.ok(regelmaessig.some(r => r.dauerhaft && r.art === 'testen'));
  const spaeter = ausListe(LISTE, '2026-12-28').termine;
  assert.ok(!spaeter.some(t => t.id === 'weihnachtsmarkt-leipzig'), 'vorbei = weg');
  assert.ok(spaeter.every(t => t.bis >= '2026-12-28'));
  assert.equal(fahrMinuten(0), 5); assert.equal(fahrMinuten(null), null);
});

const M = CFG.module.events;
const it = (titel, extra = {}) => ({ titel, beschreibung: '', link: 'https://example.org/' + encodeURIComponent(titel), datum: '2026-11-15T08:00:00Z', ab: null, bis: null, herkunft: 'LVZ', feedInfo: { art: 'fest' }, ...extra });

test('Meldungen: nur Ort im Umkreis, Art-Wort nötig, Testaufrufe mit Seriosität', () => {
  assert.ok(bewerteMeldung(it('Stadtfest in Waldheim am Wochenende'), 'fest', M, '2026-11-16'));
  assert.equal(bewerteMeldung(it('Stadtfest in München am Wochenende'), 'fest', M, '2026-11-16'), null, 'zu weit');
  assert.equal(bewerteMeldung(it('Gemeinderat Waldheim tagt'), 'fest', M, '2026-11-16'), null, 'kein Fest');
  assert.equal(bewerteMeldung(it('Museum Leipzig zeigt neue Schau'), 'gratis', M, '2026-11-16'), null, 'nicht gratis');
  assert.ok(bewerteMeldung(it('Eintritt frei im Museum Leipzig'), 'gratis', M, '2026-11-16'));
  const t = bewerteMeldung(it('Arturia sucht Betatester für neuen Synthesizer'), 'testen', M, '2026-11-16');
  assert.equal(t.musik, true); assert.equal(t.serioes, 'seriös');
  assert.equal(bewerteMeldung(it('Produkttester gesucht: Kopfhörer testen – nur 2 € Bearbeitungsgebühr'), 'testen', M, '2026-11-16').serioes, 'vorsicht');
  assert.equal(seriositaet('Testen und behalten, Vorkasse 5 €'), 'vorsicht');
  // vorbei
  assert.equal(bewerteMeldung(it('Stadtfest Waldheim', { ab: '2026-09-01T10:00:00Z', bis: '2026-09-02T20:00:00Z' }), 'fest', M, '2026-11-16'), null);
});

test('Doppel: gleiche Meldung zweimal, gleicher Ort+Tag, Meldung zu einem Listen-Eintrag', () => {
  const a = { id: 'n-1', art: 'fest', titel: 'Stadtfest Waldheim mit Feuerwerk', ort: 'Waldheim', ab: '2027-06-05', herkunft: 'radar' };
  const b = { id: 'n-2', art: 'fest', titel: 'Stadtfest Waldheim mit Feuerwerk – LVZ', ort: 'Waldheim', ab: '2027-06-05', herkunft: 'radar' };
  const c = { id: 'n-3', art: 'fest', titel: 'Großes Programm zum Fest in Waldheim', ort: 'Waldheim', ab: '2027-06-05', herkunft: 'radar' };
  const d = { id: 'n-4', art: 'fest', titel: 'Striezelmarkt Dresden öffnet', ort: 'Dresden', ab: '2026-11-25', herkunft: 'radar' };
  const aus = ohneDoppel([a, b, c, d], ['striezelmarkt']);
  assert.deepEqual(aus.map(x => x.id), ['n-1']);
});

const RSS = items => `<?xml version="1.0"?><rss><channel>${items.map(([t, d]) => `<item><title>${t}</title><link>https://news.example/${encodeURIComponent(t)}</link><pubDate>${d}</pubDate><description>${t}</description><source url="https://lvz.de">LVZ</source></item>`).join('')}</channel></rss>`;

test('Lauf: Datei events.json, Push nur Gratis morgen (nah) + seriöser Musiktest, Kurzfassung für die Kachel', async () => {
  const liste = { eintraege: [...LISTE.eintraege, { id: 'test-gratis-morgen', art: 'gratis', titel: 'Freier Eintritt Burg Mildenstein', ort: 'Leisnig', termine: [{ ab: '2026-11-17', bis: '2026-11-17' }], wann: 'einmalig', vorteil: 'Eintritt frei', quelle: { name: 'Test', url: 'https://example.org/burg' }, geprueft: '2026-11-16' }] };
  const holeText = async url => {
    const q = decodeURIComponent(url);
    if (q.includes('Betatester')) return RSS([['Elektron sucht Betatester für neuen Synthesizer - Amazona', 'Sun, 15 Nov 2026 10:00:00 GMT']]);
    if (q.includes('Produkttester')) return RSS([['Produkttester gesucht Kopfhörer – Gebühr 9,99 € - Blog', 'Sun, 15 Nov 2026 10:00:00 GMT']]);
    if (q.includes('Stadtfest Döbeln')) return RSS([['Weihnachtsmarkt und Fest in Roßwein am 28. November - LVZ', 'Sat, 14 Nov 2026 10:00:00 GMT']]);
    if (q.includes('Mitmachaktion')) throw new Error('HTTP 503');
    return RSS([]);
  };
  const r = await events({ holeText, cfg: CFG, jetzt: new Date('2026-11-16T09:00:00Z'), ausfluege: liste });
  assert.equal(r.datei.version, 1);
  assert.equal(r.datei.stand, '2026-11-16');
  assert.ok(r.datei.termine.length >= 10);
  assert.ok(r.datei.termine.every(t => t.quelle?.url && t.stand), 'jede Angabe mit Quelle + Stand');
  assert.ok(r.datei.termine.every(t => !t.bis || t.bis >= '2026-11-16'), 'nichts Vergangenes');
  const sort = r.datei.termine.filter(t => t.ab).map(t => t.ab);
  assert.deepEqual(sort, [...sort].sort(), 'nach Datum');
  assert.ok(r.datei.termine.some(t => t.herkunft === 'radar' && t.ort === 'Roßwein'));
  assert.ok(r.datei.regelmaessig.length >= 8);
  assert.equal(r.fehler.length, 1);
  const titel = r.eintraege.map(e => e.titel);
  assert.ok(titel.includes('Morgen gratis: Freier Eintritt Burg Mildenstein'));
  assert.ok(titel.some(x => x.startsWith('Produkttest Musiktechnik: Elektron')));
  assert.ok(!titel.some(x => /Kopfhörer/.test(x)), 'Vorsicht-Test nie als Push');
  assert.ok(r.eintraege.every(e => e.sofort && e.kategorie === 'events'));
  assert.equal(r.eintraege.length, 2, 'sonst keine Pushes');
  assert.ok(r.kurz.top.length >= 1 && r.kurz.top[0].ab >= '2026-11-16');
  // Feeds alle tot: Meldungen vom letzten Lauf bleiben
  const tot = await events({ holeText: async () => { throw new Error('HTTP 503'); }, cfg: CFG, jetzt: new Date('2026-11-16T21:00:00Z'), ausfluege: liste, vorherDatei: r.datei });
  assert.ok(tot.datei.termine.some(t => t.herkunft === 'radar' && t.ort === 'Roßwein'));
});

test('Radar kennt das Modul (main.mjs, config, Kategorie-Name)', async () => {
  assert.equal(typeof MODULE.events, 'function');
  assert.equal(M.aktiv, true);
  assert.ok(M.intervallStunden >= 6);
  const { KATEGORIEN } = await import('../benachrichtigen.mjs');
  assert.equal(KATEGORIEN.events, 'Ausflüge & Aktionen');
});
