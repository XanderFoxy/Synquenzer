// Dezember: Film des Tages (Xander 16.11.2026: „Im Dezember (1.–31.12.) den Weihnachts-/Adventskalender-Deal jeden Tag in die
// Benachrichtigungen, welcher Film heute der Preisknüller ist.“) – Fenster, Auswahl, nur einmal am Tag, frische Daten,
// Vorprüfung (faellig.mjs) und echter Lauf mit Datum-Vorgabe (--jetzt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adventFenster, tagesFilm, planeAdvent, verbucheAdvent, adventNachricht, istAppleLink } from '../benachrichtigen.mjs';
import { faelligkeit } from '../faellig.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(HIER, '..', '..', 'config.json'), 'utf8'));

const film = (id, titel, preis, extra = {}) => ({ id: `itunes:${id}`, typ: 'film', titel, jahr: 2001, preis, link: `https://itunes.apple.com/de/movie/x/id${id}`, bild: null, quelle: 'Apple', seit: '2026-11-20', vorher: null, ...extra });
const datei = (aktualisiert, gruppen, extra = {}) => ({ version: 1, aktualisiert, gruppen: { wunsch: [], fuer399: [], action: [], comedy: [], achtziger: [], disney: [], ...gruppen }, ...extra });

test('Fenster: nur 1.–31.12., ab 8 Uhr bis 21 Uhr (Berliner Zeit), einmal am Tag, nach einem Fehlversuch eine Stunde Pause', () => {
  const f = jetzt => adventFenster(cfg, {}, new Date(jetzt)).faellig;
  assert.equal(f('2026-11-30T09:00:00Z'), false, 'November');
  assert.equal(f('2026-12-01T06:30:00Z'), false, '07:30 Berlin – zu früh');
  assert.equal(f('2026-12-01T07:05:00Z'), true, '08:05 Berlin');
  assert.equal(f('2026-12-31T19:30:00Z'), true, '20:30 Berlin am 31.12.');
  assert.equal(f('2026-12-31T21:10:00Z'), false, '22:10 Berlin – keine Nacht-Nachricht');
  assert.equal(f('2027-01-01T09:00:00Z'), false, 'Januar');
  assert.equal(adventFenster(cfg, { advent: { tag: '2026-12-05' } }, new Date('2026-12-05T10:00:00Z')).faellig, false, 'heute schon');
  assert.equal(adventFenster(cfg, { advent: { tag: '2026-12-04' } }, new Date('2026-12-05T10:00:00Z')).faellig, true, 'gestern gesendet, heute wieder');
  assert.equal(adventFenster(cfg, { adventVersuch: '2026-12-05T09:30:00Z' }, new Date('2026-12-05T10:00:00Z')).faellig, false, 'Pause nach Fehlversuch');
  assert.equal(adventFenster({ ...cfg, ntfy: { ...cfg.ntfy, advent: false } }, {}, new Date('2026-12-05T10:00:00Z')).faellig, false, 'abschaltbar');
});

test('Auswahl: Apple-Countdown zuerst (auch 4,99 €), sonst heute gesenkter 3,99-€-Film, sonst bekanntester noch nicht gemeldeter', () => {
  const tag = '2026-12-05';
  const g = {
    fuer399: [
      film(1, 'Kleiner Film', 3.99, { bekannt: 8 }),
      film(2, 'Shrek', 3.99, { bekannt: 112, gross: 'kinohit' }),
      film(3, 'Heute Gesenkt', 3.99, { seit: tag, vorher: 9.99, bekannt: 40 }),
      film(4, 'Zu Teuer', 4.99, { seit: tag, vorher: 13.99 }),
      { ...film(5, 'mydealz-Tipp', 2.99), quelle: 'mydealz', seit: tag, vorher: 9.99 },
    ],
  };
  const cd = [{ id: 'itunes:9', titel: 'Wicked', jahr: 2024, preis: 4.99, link: 'https://itunes.apple.com/de/movie/wicked/id9', quelle: 'mydealz', tag }];
  assert.equal(tagesFilm(datei('x', g, { countdown: cd }), { tag }).titel, 'Wicked', 'Countdown');
  assert.equal(tagesFilm(datei('x', g, { countdown: cd }), { tag }).art, 'countdown');
  assert.equal(tagesFilm(datei('x', g, { countdown: [{ ...cd[0], tag: '2026-12-04' }] }), { tag }).titel, 'Heute Gesenkt', 'Countdown von gestern zählt nicht');
  const h = tagesFilm(datei('x', g), { tag });
  assert.equal(h.titel, 'Heute Gesenkt'); assert.equal(h.art, 'gesenkt'); assert.match(h.grund, /vorher 9,99 €/);
  const t = tagesFilm(datei('x', g), { tag, schon: ['itunes:3'] });
  assert.equal(t.titel, 'Shrek', 'große Produktion vor kleinem Film'); assert.equal(t.art, 'tipp');
  assert.equal(t.grund, 'Heute kein Apple-Tagesangebot gefunden · große Produktion für 3,99 € (Preis seit 20. Nov.)', 'Ersatz ehrlich als Tipp, mit „seit“');
  assert.equal(tagesFilm(datei('x', g), { tag, schon: ['itunes:3', 'itunes:2'] }).titel, 'Kleiner Film');
  assert.equal(tagesFilm(datei('x', g), { tag, schon: ['itunes:1', 'itunes:2', 'itunes:3'] }), null, 'nie über 3,99 €, nie ein mydealz-Tipp ohne Apple');
});

test('Plan: einmal am Tag, nur mit frischen Daten (≤ 12 h), still = nichts; Nachricht mit Tag, Preis und Link in die TV-App', () => {
  const g = { fuer399: [film(2, 'Shrek', 3.99, { bekannt: 112, gross: 'kinohit' })] };
  const jetzt = new Date('2026-12-05T11:30:00Z'); // 12:30 Berlin: der Ersatz-Tipp ist dran
  const p = planeAdvent({ datei: datei('2026-12-05T09:00:00Z', g), zustand: {}, cfg, jetzt });
  assert.equal(p.tag, '2026-12-05');
  assert.equal(p.msg.title, 'Film-Tipp · 5. Dez.: Shrek (2001) für 3,99 €', 'Ersatz heißt nicht „Film des Tages“');
  assert.equal(p.msg.click, 'https://itunes.apple.com/de/movie/x/id2');
  assert.match(p.msg.actions[1].url, /mein-vorteil\/#filme$/);
  assert.equal(p.msg.actions[0].label, 'In der TV-App öffnen');
  assert.equal(planeAdvent({ datei: datei('2026-12-05T09:00:00Z', g), zustand: {}, cfg, jetzt, modus: 'still' }), null);
  const alt = planeAdvent({ datei: datei('2026-12-04T19:00:00Z', g), zustand: {}, cfg, jetzt });
  assert.equal(alt.msg, null, 'Daten 16,5 h alt: nichts senden, was vielleicht nicht mehr gilt');
  // senden -> gemerkt; zweiter Lauf am selben Tag schickt nichts; am nächsten Tag ein anderer Film
  const z = {};
  verbucheAdvent(z, p, true, jetzt);
  assert.deepEqual(z.advent.ids, ['itunes:2']);
  assert.equal(z.advent.art, 'tipp');
  assert.equal(planeAdvent({ datei: datei('2026-12-05T11:00:00Z', g), zustand: z, cfg, jetzt: new Date('2026-12-05T13:00:00Z') }), null);
  const g2 = { fuer399: [...g.fuer399, film(7, 'Charade', 3.99, { bekannt: 51 })] };
  assert.equal(planeAdvent({ datei: datei('2026-12-06T10:00:00Z', g2), zustand: z, cfg, jetzt: new Date('2026-12-06T11:10:00Z') }).film.titel, 'Charade');
  // Fehlversuch: Pause, kein Tag erledigt
  const z2 = {};
  verbucheAdvent(z2, p, false, jetzt);
  assert.ok(z2.adventVersuch && !z2.advent);
  // im neuen Jahr zählen die alten Filme nicht mehr
  const z3 = { advent: { tag: '2026-12-31', jahr: '2026', ids: ['itunes:2'] } };
  assert.equal(planeAdvent({ datei: datei('2027-12-01T10:00:00Z', g), zustand: z3, cfg, jetzt: new Date('2027-12-01T11:00:00Z') }).film.titel, 'Shrek');
  assert.equal(adventNachricht({ titel: 'Charade (1963)', jahr: 1963, preis: 3.99, link: 'https://itunes.apple.com/de/movie/x/id7', grund: 'g', art: 'countdown' }, '2026-12-24', cfg).title, 'Film des Tages · 24. Dez.: Charade (1963) für 3,99 €');
});

test('Zeiten (Prüfer 16.11.): Countdown ab 8 Uhr sofort, Ersatz erst ab 12 Uhr, Countdown nach dem Ersatz kommt hinterher', () => {
  const tag = '2026-12-05';
  const g = { fuer399: [film(2, 'Shrek', 3.99, { bekannt: 112, gross: 'kinohit' })] };
  const cd = [{ id: 'itunes:9', titel: 'Wicked', jahr: 2024, preis: 4.99, link: 'https://itunes.apple.com/de/movie/wicked/id9', quelle: 'mydealz', tag }];
  // 08:10 Berlin, nur der Ersatz: warten (eine Stunde Pause, kein Tag erledigt)
  const w = planeAdvent({ datei: datei('2026-12-05T06:00:00Z', g), zustand: {}, cfg, jetzt: new Date('2026-12-05T07:10:00Z') });
  assert.equal(w.msg, null); assert.equal(w.warten, true);
  const z = {};
  verbucheAdvent(z, w, false, new Date('2026-12-05T07:10:00Z'));
  assert.ok(z.adventVersuch && !z.advent, 'Warten: Pause, kein Tag erledigt');
  assert.equal(adventFenster(cfg, z, new Date('2026-12-05T07:40:00Z')).faellig, false, 'in der Pause kein eigener Lauf');
  assert.equal(adventFenster(cfg, z, new Date('2026-12-05T08:15:00Z')).faellig, true, 'eine Stunde später wieder nachsehen');
  // 09:40 Berlin: der Countdown ist da -> sofort
  const c = planeAdvent({ datei: datei('2026-12-05T08:35:00Z', g, { countdown: cd }), zustand: {}, cfg, jetzt: new Date('2026-12-05T08:40:00Z') });
  assert.equal(c.msg.title, 'Film des Tages · 5. Dez.: Wicked (2024) für 4,99 €');
  // 12:10 Berlin ohne Countdown: Ersatz-Tipp; danach (15:10) erscheint der Countdown doch noch -> kommt hinterher, einmal
  const z2 = {};
  const e = planeAdvent({ datei: datei('2026-12-05T10:00:00Z', g), zustand: z2, cfg, jetzt: new Date('2026-12-05T11:10:00Z') });
  assert.equal(e.film.art, 'tipp');
  verbucheAdvent(z2, e, true, new Date('2026-12-05T11:10:00Z'));
  assert.equal(adventFenster(cfg, z2, new Date('2026-12-05T13:00:00Z')).faellig, false, 'nach dem Ersatz kein eigener Lauf mehr – die Filme-Läufe sehen nach');
  assert.equal(planeAdvent({ datei: datei('2026-12-05T13:00:00Z', g), zustand: z2, cfg, jetzt: new Date('2026-12-05T14:10:00Z') }), null, 'ohne Countdown nichts Zweites');
  const n = planeAdvent({ datei: datei('2026-12-05T13:00:00Z', g, { countdown: cd }), zustand: z2, cfg, jetzt: new Date('2026-12-05T14:10:00Z') });
  assert.equal(n.film.titel, 'Wicked'); assert.equal(n.nachtrag, true);
  verbucheAdvent(z2, n, true, new Date('2026-12-05T14:10:00Z'));
  assert.equal(z2.advent.art, 'countdown'); assert.deepEqual(z2.advent.ids, ['itunes:2', 'itunes:9']);
  assert.equal(planeAdvent({ datei: datei('2026-12-05T13:00:00Z', g, { countdown: cd }), zustand: z2, cfg, jetzt: new Date('2026-12-05T15:10:00Z') }), null, 'nur einmal');
  // ein Zustand von vor dieser Regel (ohne art) gilt als erledigt
  assert.equal(adventFenster(cfg, { advent: { tag, ids: [] } }, new Date('2026-12-05T10:00:00Z')).offen, false);
});

test('Countdown ohne Apple-Link (bei Apple nicht eindeutig gefunden): Text und Knopf sagen ehrlich „mydealz“', () => {
  const tag = '2026-12-05';
  const cd = [{ id: 'mydealz:1', titel: 'Wicked', jahr: null, preis: 4.99, link: 'https://www.mydealz.de/deals/apple-tv-countdown-tag-5-wicked-1', quelle: 'mydealz', tag }];
  const f = tagesFilm(datei('x', {}, { countdown: cd }), { tag });
  assert.equal(f.apple, false);
  const m = adventNachricht(f, tag, cfg);
  assert.match(m.message, /mydealz-Tipp/); assert.doesNotMatch(m.message, /die TV-App zeigt den Film/);
  assert.equal(m.actions[0].label, 'mydealz-Tipp öffnen');
  // gibt es zwei Countdown-Einträge, gewinnt der mit Apple-Link
  const zwei = [...cd, { ...cd[0], id: 'itunes:9', link: 'https://itunes.apple.com/de/movie/wicked/id9' }];
  assert.equal(tagesFilm(datei('x', {}, { countdown: zwei }), { tag }).id, 'itunes:9');
  assert.ok(istAppleLink('https://tv.apple.com/de/movie/x/umc.cmc.1')); assert.ok(!istAppleLink('https://www.mydealz.de/deals/x'));
  assert.ok(!istAppleLink('https://apple.com.mydealz.de/x'));
});

test('Vorprüfung: im Dezember ab 8 Uhr ist ein Lauf fällig, auch wenn kein Modul dran ist', () => {
  const lauf = Object.fromEntries(Object.keys(cfg.module).map(k => [k, '2026-12-05T06:50:00Z']));
  const z = { gemeldet: {}, lauf, digestTag: '2026-12-04' };
  assert.equal(faelligkeit(cfg, z, new Date('2026-12-05T06:55:00Z')).faellig, false, '07:55 Berlin: nichts');
  const f = faelligkeit(cfg, z, new Date('2026-12-05T07:05:00Z'));
  assert.equal(f.advent, true); assert.equal(f.faellig, true);
  assert.equal(faelligkeit(cfg, { ...z, advent: { tag: '2026-12-05' } }, new Date('2026-12-05T07:20:00Z')).faellig, false, 'schon gesendet');
  assert.equal(faelligkeit(cfg, { ...z, lauf }, new Date('2026-11-20T07:05:00Z')).advent, false, 'November');
});

test('Echter Lauf mit Datum-Vorgabe (--jetzt 05.12. 08:30): Push „Film des Tages“ (Countdown) aus der filme.json des letzten Laufs, Zustand gemerkt', async () => {
  const { main } = await import('../main.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'advent-'));
  const lauf = Object.fromEntries(Object.keys(cfg.module).map(k => [k, '2026-12-05T07:00:00Z'])); // nichts fällig
  await writeFile(join(dir, 'zustand.json'), JSON.stringify({ gemeldet: {}, lauf, digestTag: '2026-12-05' }));
  await writeFile(join(dir, 'aktuell.json'), JSON.stringify({ version: 1, aktualisiert: '2026-12-05T07:00:00Z', kategorien: {}, status: {} }));
  const cd = [{ id: 'itunes:9', titel: 'Wicked', jahr: 2024, preis: 4.99, link: 'https://itunes.apple.com/de/movie/wicked/id9', quelle: 'mydealz', tag: '2026-12-05' }];
  await writeFile(join(dir, 'filme.json'), JSON.stringify(datei('2026-12-05T07:00:00Z', { fuer399: [film(2, 'Shrek', 3.99, { bekannt: 112, gross: 'kinohit' })] }, { countdown: cd })));
  const fetchImpl = async url => { throw new Error(`kein Abruf erwartet: ${url}`); }; // kein Modul fällig
  const zeilen = [];
  const log = console.log; console.log = x => zeilen.push(String(x));
  try {
    const r = await main(['--data', dir, '--jetzt', '2026-12-05T07:30:00Z'], { NTFY_TOPIC: 'test-topic', DRY_RUN: '1' }, { fetchImpl });
    assert.equal(r.adventOk, true);
    assert.equal(r.advent.msg.title, 'Film des Tages · 5. Dez.: Wicked (2024) für 4,99 €');
  } finally { console.log = log; }
  assert.ok(zeilen.some(z => /\[dry-run\] ntfy: Film des Tages/.test(z)), 'Probelauf: nichts wirklich gesendet');
  const z = JSON.parse(await readFile(join(dir, 'zustand.json'), 'utf8'));
  assert.equal(z.advent.tag, '2026-12-05');
  assert.deepEqual(z.advent.ids, ['itunes:9']);
});
