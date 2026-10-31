// Enddaten im Konzert-Alarm: vergangene Konzerte und beendete Vorverkäufe raus, Festival-Termin von der Seite,
// MusicBrainz-Ausfall einer Band löscht ihre alten Einträge nicht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { berlinIso, berlinKurz, macheHttp } from '../lib.mjs';
import { tmParse, tmVorverkauf } from '../sources/ticketmaster.mjs';
import { seiteTreffer, terminAusSeite, htmlZuText } from '../sources/seiten.mjs';
import { verarbeite, vorverkaufZeile } from '../kern.mjs';
import { lauf } from '../run.mjs';

const FX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const fj = n => JSON.parse(fs.readFileSync(path.join(FX, n), 'utf8'));
const ALPHA = { name: 'Alphaville', land: 'DE' };
const CONFIG = { zuhause: { lat: 51.1194, lon: 13.1186 }, pushRadiusKm: 200, listenRadiusKm: 400, releaseFensterTage: 120, releaseListeTage: 365 };

test('Berliner Zeit: Ende des Konzerttags, Push-Format', () => {
  assert.equal(berlinIso('2026-10-31'), '2026-10-31T22:59:59.000Z');
  assert.equal(berlinIso('2027-06-06'), '2027-06-06T21:59:59.000Z');
  assert.equal(berlinIso('2027-03-14', '20:00'), '2027-03-14T19:00:00.000Z');
  assert.equal(berlinKurz('2026-11-02T09:00:00Z'), '02.11. 10:00');
});

test('Ticketmaster: bis = letzter Konzerttag, Vorverkäufe gelesen', () => {
  const k = tmParse(fj('tm-vorverkauf.json'), ALPHA);
  assert.deepEqual(k.map(x => x.bis), ['2026-10-31T22:59:59.000Z', '2027-04-10T21:59:59.000Z', '2027-05-16T21:59:59.000Z']);
  assert.deepEqual(k[1].vorverkauf.map(v => v.name), ['Fanclub-Vorverkauf', 'Magenta-Vorverkauf', 'Allgemeiner Vorverkauf']);
  assert.deepEqual(tmVorverkauf(undefined), []);
  // alte Fixture ohne sales: leere Liste, bis trotzdem gesetzt
  const alt = tmParse(fj('tm-alphaville.json'), ALPHA);
  assert.equal(alt[0].bis, '2027-03-14T22:59:59.000Z');
  assert.deepEqual(alt[0].vorverkauf, []);
});

test('Konzert nach dem Konzerttag vorbei, beendeter Vorverkauf raus, laufender/kommender im Push', () => {
  const konzerte = tmParse(fj('tm-vorverkauf.json'), ALPHA);
  // 31.10. 20:00 Berlin: das Konzert heute läuft noch, Fanclub-Vorverkauf ist vorbei, Magenta kommt
  const e = verarbeite({ konzerte, releases: [], gesehen: { konzerte: {}, releases: {} }, config: CONFIG, heute: '2026-10-31', jetzt: '2026-10-31T19:00:00.000Z' });
  assert.equal(e.konzerte.length, 3);
  const dd = e.konzerte.find(k => k.stadt === 'Dresden');
  assert.deepEqual(dd.vorverkauf.map(v => v.name), ['Magenta-Vorverkauf', 'Allgemeiner Vorverkauf']);
  const push = e.pushes.find(p => /Alter Schlachthof/.test(p.text));
  assert.match(push.text, /Magenta-Vorverkauf ab 02\.11\. 10:00 Uhr/);
  // nach Mitternacht (Berlin) ist das Konzert von heute vorbei
  const e2 = verarbeite({ konzerte: tmParse(fj('tm-vorverkauf.json'), ALPHA), releases: [], gesehen: null, config: CONFIG, heute: '2026-10-31', jetzt: '2026-10-31T23:00:00.000Z' });
  assert.ok(!e2.konzerte.some(k => k.ort === 'Haus Auensee'));
  // Altbestand ohne bis: aus dem Datum ergänzt
  const e3 = verarbeite({ konzerte: [{ quelle: 'ticketmaster', band: 'Alphaville', datum: '2026-11-20', stadt: 'Leipzig', lat: 51.34, lon: 12.37, link: 'https://x' }], releases: [], gesehen: null, config: CONFIG, heute: '2026-10-31' });
  assert.equal(e3.konzerte[0].bis, '2026-11-20T22:59:59.000Z');
  assert.equal(vorverkaufZeile([{ name: 'VVK', ab: '2026-10-01T00:00:00Z', bis: '2026-11-04T22:59:00Z' }], '2026-10-31T12:00:00Z'), 'VVK läuft bis 04.11. 23:59 Uhr');
});

test('Festival-Termin von der echten NCN-Startseite (03.–05.09.2027) als datum/bis', () => {
  const html = fs.readFileSync(path.join(FX, 'echt', 'ncn-startseite.html'), 'utf8');
  assert.deepEqual(terminAusSeite(htmlZuText(html), '2026-10-31'), { von: '2027-09-03', bis: '2027-09-05' });
  assert.equal(terminAusSeite(htmlZuText(html), '2027-09-06'), null, 'vorbei -> kein Termin');
  assert.equal(terminAusSeite('News 19.09.2025 – Ticketvorverkauf Start 13.09.2025', '2026-10-31'), null, 'Einzeldaten zählen nicht');
  const t = seiteTreffer(html + ' Line-up: ALPHAVILLE ', { id: 'ncn', name: 'NCN', art: 'festival', url: 'https://www.ncn-festival.de/', stadt: 'Deutzen', lat: 51.105, lon: 12.429 }, [ALPHA], '2026-10-31');
  assert.equal(t[0].datum, '2027-09-03');
  assert.equal(t[0].bis, '2027-09-05T21:59:59.000Z');
  assert.match(t[0].status, /03\.09\.2027 bis 05\.09\.2027/);
});

test('HTTP: MusicBrainz 503 wird öfter wiederholt als andere Server', async () => {
  let n = 0;
  const http = macheHttp({ fetchImpl: async () => (++n < 5 ? { ok: false, status: 503 } : { ok: true, status: 200, json: async () => ({ ok: 1 }) }), schlafen: async () => {} });
  assert.deepEqual(await http.get('https://musicbrainz.org/ws/2/x'), { ok: 1 });
  assert.equal(n, 5);
  n = 0;
  await assert.rejects(() => http.get('https://api.deezer.com/x'), /HTTP 503/);
  assert.equal(n, 3);
});

test('Gesamtlauf: fällt eine Band bei einer Quelle aus, bleiben ihre alten Einträge (Plastic Autumn bei MusicBrainz 503)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-band-'));
  const log = console.log; console.log = () => {};
  try {
    const rel = band => ({ quelle: 'musicbrainz', band, titel: `${band} Album`, typ: 'Album', datum: '2026-06-25', angekuendigt: false, link: `https://mb/${band}` });
    const gut = async ctx => ({ releases: ctx.bands.map(b => rel(b.name)) });
    const env = { DATA_DIR: dir, NTFY_TOPIC: 't', DRY_RUN: '1' };
    const jetzt = new Date('2026-10-31T12:00:00Z');
    await lauf({ env, jetzt, quellen: [['musicbrainz', gut]] });
    const teilweise = async ctx => ({ releases: ctx.bands.filter(b => b.name !== 'Plastic Autumn').map(b => rel(b.name)), fehler: ['Plastic Autumn: HTTP 503 musicbrainz.org'] });
    const r = await lauf({ env, jetzt, quellen: [['musicbrainz', teilweise]] });
    assert.ok(r.erg.releases.some(x => x.band === 'Plastic Autumn'), 'alter Eintrag bleibt');
    assert.equal(r.status.musicbrainz.ok, false);
  } finally { console.log = log; }
});
