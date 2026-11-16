// MV8 (16.11.2026): Neuversuch nach Quellen-Fehler statt „gelaufen“. Anlass Lauf 43892154739: overpass-api.de 502,
// Ausweich-Server Zeitlimit -> Filialen behielten den letzten Stand (1468), galten aber als gelaufen -> nächster Versuch
// erst nach 168 h. Soll: 3 h, 6 h, 12 h, dann normaler Takt; Retry-After respektiert; Erfolg -> Takt und Zähler zurück.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { faelligkeit, modulFaellig, neuversuchWarteMs, verbucheModul, neuversuchNachtragen, neuversuchBereinigen, hostRuheBereinigen, NEUVERSUCH_STUFEN_STUNDEN, NEUVERSUCH_MAX_STUNDEN, main as faelligMain } from '../faellig.mjs';
import { lauf } from '../main.mjs';
import { macheAbruf } from '../lib/http.mjs';
import essen from '../module/essen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const FIX = await readFile(join(HIER, 'fixtures', 'overpass-filialen.json'), 'utf8');
const h = n => n * 3600e3;
const T0 = new Date('2026-11-16T09:00:00Z');
const plus = (t, std) => new Date(+new Date(t) + h(std));

// nur ein Modul an (Knaller aus, seine Märkte braucht filialen), ohne Pause zwischen den Overpass-Servern, keine Zusammenfassung
function nur(name, extra = {}) {
  const aus = Object.fromEntries(Object.keys(cfg.module).map(n => [n, { ...cfg.module[n], aktiv: false }]));
  return { ...cfg, ntfy: { ...cfg.ntfy, digestStunde: 99 }, module: { ...aus, [name]: { ...cfg.module[name], aktiv: true, ...extra } } };
}
const CF = nur('filialen', { pauseMs: 0 });
const overpassAus = async url => { const host = new URL(url).host; throw new Error(host === 'overpass-api.de' ? `HTTP 502 bei ${host}` : `Zeitüberschreitung bei ${host}`); };
const overpassDa = async () => FIX;

// ein Radar-Lauf wie im Workflow: erst die Vorprüfung, nur wenn fällig der Lauf (alle = false)
async function radarStart(c, stand, holeText, jetzt, { regelWache = false } = {}) {
  const f = faelligkeit(c, stand.zustand, jetzt);
  if (!f.faellig) return { f, gelaufen: false };
  const r = await lauf({ cfg: c, wunschliste: [], vorher: stand.aktuell, dateienVorher: stand.dateien, zustand: stand.zustand, holeText, jetzt, regelWache });
  stand.aktuell = r.aktuell;
  stand.dateien = { ...stand.dateien, ...r.dateien };
  return { f, gelaufen: true, r };
}
// Ausgangslage: Filialen liefen vor 200 h erfolgreich (Datei mit 1468-artigem Stand liegt vor), Radar läuft schon
async function ausgangslage() {
  const stand = { zustand: { gemeldet: {} }, aktuell: null, dateien: {} };
  const t = plus(T0, -200);
  const r = await lauf({ cfg: CF, wunschliste: [], zustand: stand.zustand, holeText: overpassDa, jetzt: t, regelWache: false });
  stand.aktuell = r.aktuell; stand.dateien = { ...r.dateien };
  assert.equal(stand.zustand.lauf.filialen, t.toISOString());
  assert.ok(stand.dateien.filialen?.maerkte, 'filialen.json da');
  return stand;
}

test('Regel: 3 h, 6 h, 12 h, dann normaler Takt – nie später als der Takt', () => {
  assert.deepEqual(NEUVERSUCH_STUFEN_STUNDEN, [3, 6, 12]);
  const woche = { intervallStunden: 168 };
  assert.deepEqual([1, 2, 3, 4, 5, 20].map(n => neuversuchWarteMs(woche, n) / h(1)), [3, 6, 12, 168, 168, 168]);
  const dreiStd = { intervallStunden: 3 }; // Essen, Filme, Remix …: Takt 3 h ist schon der Neuversuch
  assert.deepEqual([1, 2, 3, 4].map(n => neuversuchWarteMs(dreiStd, n) / h(1)), [3, 3, 3, 3]);
  const sechsStd = { intervallStunden: 6 };
  assert.deepEqual([1, 2, 3, 4].map(n => neuversuchWarteMs(sechsStd, n) / h(1)), [3, 6, 6, 6]);
  assert.equal(neuversuchWarteMs({ intervallStunden: 1 }, 1), h(1), 'stündliches Modul: nicht seltener als sein Takt');
});

test('Fehler -> Neuversuch nach 3 h (Lauf-Zeit bleibt der letzte Erfolg); zweiter Fehler -> 6 h; Erfolg -> normaler Takt, Zähler zurück', () => {
  const m = { intervallStunden: 168 };
  const alt = plus(T0, -170).toISOString();
  const z = { lauf: { filialen: alt } };
  const nv1 = verbucheModul(z, 'filialen', m, { ok: false }, T0);
  assert.equal(z.lauf.filialen, alt, 'kein „gelaufen“ bei Quellen-Fehler');
  assert.deepEqual(nv1, { ab: plus(T0, 3).toISOString(), n: 1, seit: T0.toISOString() });
  assert.equal(modulFaellig(m, z.lauf.filialen, +plus(T0, 2.5), z.neuversuch.filialen), false, 'nach 2,5 h noch nicht');
  assert.equal(modulFaellig(m, z.lauf.filialen, +plus(T0, 3) - 4 * 60e3, z.neuversuch.filialen), true, '5 Min. Spielraum wie beim Takt');
  const t2 = plus(T0, 3);
  const nv2 = verbucheModul(z, 'filialen', m, { ok: false }, t2);
  assert.equal(nv2.n, 2);
  assert.equal(nv2.ab, plus(t2, 6).toISOString());
  assert.equal(nv2.seit, T0.toISOString(), 'erster Fehlschlag bleibt vermerkt');
  const t3 = plus(t2, 6);
  assert.equal(verbucheModul(z, 'filialen', m, { ok: true }, t3), null);
  assert.equal(z.lauf.filialen, t3.toISOString());
  assert.equal(z.neuversuch, undefined, 'Zähler weg');
  assert.equal(modulFaellig(m, z.lauf.filialen, +plus(t3, 167)), false, 'wieder Wochen-Takt');
  assert.equal(modulFaellig(m, z.lauf.filialen, +plus(t3, 168)), true);
  // nach dem Erfolg beginnt ein neuer Fehlschlag wieder bei 3 h
  assert.equal(verbucheModul(z, 'filialen', m, { ok: false }, plus(t3, 168)).ab, plus(t3, 171).toISOString());
});

test('Retry-After respektiert: länger als die Stufe -> länger, mit Obergrenze; kürzer -> Stufe', () => {
  const m = { intervallStunden: 168 };
  const z = {};
  assert.equal(verbucheModul(z, 'filialen', m, { ok: false, retryAfterMs: h(5) }, T0).ab, plus(T0, 5).toISOString());
  assert.equal(z.neuversuch.filialen.retryAfterS, 5 * 3600);
  delete z.neuversuch;
  assert.equal(verbucheModul(z, 'filialen', m, { ok: false, retryAfterMs: 120e3 }, T0).ab, plus(T0, 3).toISOString(), '2 Min. < 3 h');
  delete z.neuversuch;
  assert.equal(verbucheModul(z, 'filialen', m, { ok: false, retryAfterMs: h(500) }, T0).ab, plus(T0, NEUVERSUCH_MAX_STUNDEN).toISOString(), 'Obergrenze 24 h');
  // nach dem Rückfall auf den Takt (168 h) gilt der Takt als Obergrenze
  assert.equal(neuversuchWarteMs(m, 4, h(500)), h(168));
  assert.equal(neuversuchWarteMs(m, 4, h(30)), h(168), 'Takt länger als Retry-After');
  // kurzer Takt: Retry-After der Quelle geht vor (3-h-Modul, Quelle will 5 h Ruhe)
  assert.equal(neuversuchWarteMs({ intervallStunden: 3 }, 1, h(5)), h(5));
});

test('Lauf 43892154739 nachgestellt: Overpass 502 + Ausweich-Zeitlimit -> „letzter Stand“ wie bisher, Neuversuch nach 3 h statt 168 h', async () => {
  const stand = await ausgangslage();
  const vorher = stand.zustand.lauf.filialen;
  const { r } = await radarStart(CF, stand, overpassAus, T0);
  const st = r.aktuell.status.filialen;
  // Seite: unverändert „letzter Stand“ (keine neue Störungs-Optik)
  assert.equal(st.ok, true);
  assert.deepEqual(st.fehler, []);
  assert.match(st.zahl.wort, /Filialen \(letzter Stand\)/);
  assert.ok(st.zahl.n > 0);
  assert.ok(st.hinweise.includes('letzter Stand bleibt'));
  assert.equal(r.dateien.filialen, undefined, 'alte filialen.json bleibt');
  // Zeitplan: kein „gelaufen“, sondern Neuversuch
  assert.equal(stand.zustand.lauf.filialen, vorher);
  assert.equal(stand.zustand.neuversuch.filialen.ab, plus(T0, 3).toISOString());
  assert.equal(st.neuversuch, plus(T0, 3).toISOString());
  assert.deepEqual(faelligkeit(CF, stand.zustand, plus(T0, 2)).module, []);
  assert.equal(faelligkeit(CF, stand.zustand, plus(T0, 2)).naechstes.filialen, new Date(+plus(T0, 3) - 5 * 60e3).toISOString());
  assert.deepEqual(faelligkeit(CF, stand.zustand, plus(T0, 3)).module, ['filialen']);
  // Overpass wieder da -> frische Datei, normaler Takt
  const t2 = plus(T0, 3);
  const { r: r2 } = await radarStart(CF, stand, overpassDa, t2);
  assert.equal(r2.aktuell.status.filialen.zahl.wort, 'Filialen');
  assert.ok(r2.dateien.filialen?.maerkte);
  assert.equal(r2.aktuell.status.filialen.neuversuch, undefined);
  assert.equal(stand.zustand.lauf.filialen, t2.toISOString());
  assert.equal(stand.zustand.neuversuch, undefined);
  assert.deepEqual(faelligkeit(CF, stand.zustand, plus(t2, 167)).module, []);
});

test('Kein Neuversuch öfter als der Zeitplan: stündliche Radar-Starts, Overpass 48 h weg -> Versuche bei 0, 3, 9, 21 h, dann Wochen-Takt', async () => {
  const stand = await ausgangslage();
  const versuche = [];
  let abrufe = 0;
  const zaehlend = async url => { abrufe++; return overpassAus(url); };
  for (let std = 0; std <= 48; std++) {
    const { gelaufen } = await radarStart(CF, stand, zaehlend, plus(T0, std));
    if (gelaufen) versuche.push(std);
  }
  assert.deepEqual(versuche, [0, 3, 9, 21]);
  assert.equal(abrufe, 8, 'je Versuch höchstens zwei Overpass-Server');
  assert.equal(stand.zustand.neuversuch.filialen.n, 4);
  assert.equal(stand.zustand.neuversuch.filialen.ab, plus(T0, 21 + 168).toISOString(), 'nach drei Stufen: normaler Takt');
  // auch die Vorprüfung (faellig.mjs) sagt dazwischen „nichts zu tun“ – kein voller Lauf, kein Commit
  assert.equal(faelligkeit(CF, stand.zustand, plus(T0, 30)).faellig, false);
  // stündliches Modul: Neuversuch nach 1 h (sein Takt), nicht schon beim nächsten Start nach 20 Min.
  const z = { lauf: {} };
  verbucheModul(z, 'deals', { intervallStunden: 1 }, { ok: false }, T0);
  assert.equal(modulFaellig({ intervallStunden: 1 }, z.lauf.deals, +T0 + 20 * 60e3, z.neuversuch.deals), false);
  assert.equal(modulFaellig({ intervallStunden: 1 }, z.lauf.deals, +plus(T0, 1), z.neuversuch.deals), true);
});

test('Retry-After der Quelle (HTTP 429, 4 h) kommt über macheAbruf und Regel-Wache bis in den Neuversuch; die Drosselung bleibt', async () => {
  const stand = await ausgangslage();
  const abrufe = [];
  const fetchImpl = async url => {
    if (new URL(url).pathname === '/robots.txt') return new Response('', { status: 404 }); // keine robots.txt = alles erlaubt
    abrufe.push(new URL(url).host);
    if (new URL(url).host === 'overpass-api.de') return new Response('rate limited', { status: 429, headers: { 'retry-after': String(4 * 3600) } });
    return new Response('busy', { status: 504 });
  };
  const holeText = macheAbruf({ pauseMs: 0, wiederholMs: 0, timeoutMs: 5000, userAgent: 'test' }, fetchImpl);
  await assert.rejects(holeText('https://overpass-api.de/api/interpreter?data=x'), e => e.retryAfterMs === h(4) && /HTTP 429 bei overpass-api\.de/.test(e.message));
  assert.equal(abrufe.length, 1, 'Retry-After > 60 s: keine Wiederholung in diesem Lauf (wie MV7)');
  abrufe.length = 0;
  await radarStart(CF, stand, holeText, T0, { regelWache: true });
  assert.deepEqual(abrufe, ['overpass-api.de', 'overpass.private.coffee', 'overpass.private.coffee'], '504 ohne Retry-After: eine Wiederholung wie bisher');
  assert.equal(stand.zustand.neuversuch.filialen.ab, plus(T0, 4).toISOString(), '4 h statt 3 h');
  assert.equal(stand.zustand.neuversuch.filialen.retryAfterS, 4 * 3600);
  assert.deepEqual(faelligkeit(CF, stand.zustand, plus(T0, 3)).module, [], 'nach 3 h noch Ruhe, die Quelle wollte 4 h');
  assert.deepEqual(faelligkeit(CF, stand.zustand, plus(T0, 4)).module, ['filialen']);
});

test('Gilt für alle Module: Absturz, ganz kaputte Quelle (alte Einträge bleiben) und Teil-Fehler -> Neuversuch; Regel-Sperre und Erfolg -> Takt', async () => {
  const c = nur('erleben'); // 6 h
  assert.equal(c.module.erleben.intervallStunden, 6);
  const alt = [{ id: 'erleben-alt', kategorie: 'erleben', titel: 'Alt', link: 'https://x.test/alt', wert: 50, datum: plus(T0, -2).toISOString() }];
  const vorher = { kategorien: { erleben: alt }, status: { erleben: { ok: true, anzahl: 1, stand: plus(T0, -7).toISOString() } } };
  const z = { gemeldet: {}, lauf: { erleben: plus(T0, -7).toISOString() } };
  // alle Feeds tot -> kaputt -> alte Einträge bleiben, Neuversuch 3 h
  const r = await lauf({ cfg: c, wunschliste: [], vorher, zustand: z, holeText: async () => { throw new Error('HTTP 503 bei x.test'); }, jetzt: T0, regelWache: false });
  assert.equal(r.aktuell.kategorien.erleben.length, 1, 'letzter Stand bleibt');
  assert.equal(r.aktuell.status.erleben.ok, false, 'Störungs-Anzeige wie bisher');
  assert.equal(z.lauf.erleben, plus(T0, -7).toISOString());
  assert.equal(z.neuversuch.erleben.ab, plus(T0, 3).toISOString());
  // zweiter Fehlschlag in Folge -> 6 h (= Takt)
  await lauf({ cfg: c, wunschliste: [], vorher: r.aktuell, zustand: z, holeText: async () => { throw new Error('HTTP 503 bei x.test'); }, jetzt: plus(T0, 3), regelWache: false });
  assert.equal(z.neuversuch.erleben.ab, plus(T0, 9).toISOString());
  // Absturz des Moduls (wirft) -> ebenfalls Neuversuch statt „jeder Start ein neuer Versuch“
  const MODULE = (await import('../main.mjs')).MODULE;
  const echt = MODULE.erleben;
  try {
    MODULE.erleben = async () => { throw Object.assign(new Error('kaputt (Test)'), { retryAfterMs: h(5) }); };
    const z2 = { gemeldet: {}, lauf: {} };
    const r2 = await lauf({ cfg: c, wunschliste: [], vorher, zustand: z2, holeText: overpassDa, jetzt: T0, regelWache: false });
    assert.equal(r2.aktuell.status.erleben.ok, false);
    assert.equal(r2.aktuell.kategorien.erleben.length, 1);
    assert.equal(z2.neuversuch.erleben.ab, plus(T0, 5).toISOString(), 'Retry-After am Absturz zählt');
    assert.equal(z2.neuversuch.erleben.neu, true, 'nie gelaufen: erster guter Lauf meldet nichts nach');
    // Regel-Sperre (robots.txt/Nutzungsbedingungen) ist keine Störung -> normaler Takt, Zähler weg
    MODULE.erleben = async () => { throw new Error('robots.txt von x.test: nicht gelesen – Disallow: /'); };
    await lauf({ cfg: c, wunschliste: [], vorher, zustand: z2, holeText: overpassDa, jetzt: plus(T0, 5), regelWache: false });
    assert.equal(z2.lauf.erleben, plus(T0, 5).toISOString());
    assert.equal(z2.neuversuch, undefined);
    // Teil-Fehler: frische Einträge aus den anderen Quellen, eine Quelle gestört -> Neuversuch, frische Einträge gezeigt
    const frisch = { id: 'erleben-neu', kategorie: 'erleben', titel: 'Neu', link: 'https://x.test/neu', wert: 60, datum: T0.toISOString() };
    MODULE.erleben = async () => ({ eintraege: [frisch], fehler: ['Feed B: HTTP 502'] });
    const z3 = { gemeldet: {}, lauf: { erleben: plus(T0, -7).toISOString() } };
    const r3 = await lauf({ cfg: c, wunschliste: [], vorher, zustand: z3, holeText: overpassDa, jetzt: T0, regelWache: false });
    assert.deepEqual(r3.aktuell.kategorien.erleben.map(e => e.id), ['erleben-neu']);
    assert.equal(z3.neuversuch.erleben.ab, plus(T0, 3).toISOString());
    // alles gut -> Takt, Zähler zurück
    MODULE.erleben = async () => ({ eintraege: [frisch], fehler: [] });
    await lauf({ cfg: c, wunschliste: [], vorher, zustand: z3, holeText: overpassDa, jetzt: plus(T0, 3), regelWache: false });
    assert.equal(z3.lauf.erleben, plus(T0, 3).toISOString());
    assert.equal(z3.neuversuch, undefined);
  } finally { MODULE.erleben = echt; }
});

test('Neues Modul, erster Lauf scheitert ganz: der erste gute Lauf meldet nichts nach (keine Push-Flut)', async () => {
  const c = nur('erleben');
  const MODULE = (await import('../main.mjs')).MODULE;
  const echt = MODULE.erleben;
  const e = { id: 'erleben-x', kategorie: 'erleben', titel: 'X', link: 'https://x.test/x', wert: 90, sofort: true, datum: T0.toISOString() };
  try {
    const z = { gemeldet: { alt: plus(T0, -48).toISOString() }, lauf: {} };
    MODULE.erleben = async () => ({ eintraege: [], fehler: ['HTTP 503'] });
    await lauf({ cfg: c, wunschliste: [], vorher: { kategorien: { erleben: [{ ...e, id: 'erleben-alt' }] } }, zustand: z, holeText: overpassDa, jetzt: T0, regelWache: false });
    assert.equal(z.neuversuch.erleben.neu, true);
    MODULE.erleben = async () => ({ eintraege: [e], fehler: [] });
    await lauf({ cfg: c, wunschliste: [], vorher: null, zustand: z, holeText: overpassDa, jetzt: plus(T0, 3), regelWache: false });
    assert.ok(z.gemeldet['erleben-x'], 'als gemeldet vermerkt statt nachgemeldet');
  } finally { MODULE.erleben = echt; }
});

test('Essen: OpenStreetMap weg, alter Stand bleibt -> letzterStand, Neuversuch im 3-h-Takt (wie bisher), nie später', async () => {
  const liste = JSON.parse(await readFile(join(HIER, '..', '..', 'essen.json'), 'utf8'));
  const seite = JSON.parse(await readFile(join(HIER, 'fixtures', 'essen-seite.json'), 'utf8'));
  const fixture = await readFile(join(HIER, 'fixtures', 'overpass-essen.json'), 'utf8');
  const hole = async url => (/^https:\/\/ntfy\.sh\//.test(url) ? '' : fixture);
  const zk = {};
  const r = await essen({ holeText: hole, cfg, jetzt: T0, zustand: zk, essenListen: { liste, seite } });
  assert.equal(r.letzterStand, undefined);
  const kaputt = async url => { if (/^https:\/\/ntfy\.sh\//.test(url)) return ''; throw new Error('HTTP 504 bei overpass-api.de'); };
  const r2 = await essen({ holeText: kaputt, cfg, jetzt: plus(T0, 24), zustand: zk, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.deepEqual(r2.fehler, []);
  assert.equal(r2.letzterStand, true);
  const m = cfg.module.essen;
  const z = { lauf: {} };
  assert.equal(verbucheModul(z, 'essen', m, { ok: false }, T0).ab, plus(T0, m.intervallStunden).toISOString());
  assert.equal(verbucheModul(z, 'essen', m, { ok: false }, plus(T0, 3)).ab, plus(T0, 3 + m.intervallStunden).toISOString(), 'zweiter Fehlschlag: nicht später als der Takt');
  // ohne Abruf (OSM erst nach osmStunden wieder dran) kein letzterStand
  const r3 = await essen({ holeText: kaputt, cfg, jetzt: plus(T0, 1), zustand: zk, vorherDatei: r.datei, essenListen: { liste, seite } });
  assert.equal(r3.letzterStand, undefined);
});

test('faellig.mjs (Workflow-Vorprüfung) liest zustand.neuversuch: vor dem Neuversuch „nichts zu tun“, danach fällig', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'neuversuch-'));
  const log = console.log; console.log = () => {};
  try {
    const lauf = Object.fromEntries(Object.keys(cfg.module).map(n => [n, plus(T0, -0.1).toISOString()]));
    lauf.filialen = plus(T0, -200).toISOString(); // nach Takt längst fällig – der Neuversuch geht vor
    const zustand = { gemeldet: {}, lauf, digestTag: '2026-11-16', neuversuch: { filialen: { ab: plus(T0, 3).toISOString(), n: 1, seit: T0.toISOString() } } };
    await writeFile(join(dir, 'zustand.json'), JSON.stringify(zustand));
    await writeFile(join(dir, 'aktuell.json'), JSON.stringify({ aktualisiert: T0.toISOString() }));
    const f1 = await faelligMain(['--data', dir, '--jetzt', plus(T0, 0.5).toISOString()], {});
    assert.equal(f1.module.includes('filialen'), false);
    assert.equal(f1.naechstes.filialen, new Date(+plus(T0, 3) - 5 * 60e3).toISOString());
    const f2 = await faelligMain(['--data', dir, '--jetzt', plus(T0, 3).toISOString()], {});
    assert.ok(f2.module.includes('filialen'));
    // kaputter Eintrag -> normaler Takt (hier: fällig)
    await writeFile(join(dir, 'zustand.json'), JSON.stringify({ ...zustand, neuversuch: { filialen: { ab: 'kaputt' } } }));
    assert.ok((await faelligMain(['--data', dir, '--jetzt', plus(T0, 0.5).toISOString()], {})).module.includes('filialen'));
  } finally { console.log = log; await rm(dir, { recursive: true, force: true }); }
});

test('Übergang: Daten-Zweig vom 16.11. 15:03 (Fehlversuch als „gelaufen“ gemerkt) -> Neuversuch nachgetragen, Filialen nach 3 h statt 168 h', async () => {
  // echter Stand (vorteile-daten, Lauf 43892154739): lauf.filialen = status.filialen.stand, Hinweis „letzter Stand bleibt“
  const stand = '2026-11-16T15:03:04.186Z';
  const laufZeiten = Object.fromEntries(Object.keys(cfg.module).map(n => [n, stand]));
  const aktuell = { aktualisiert: stand, status: {
    filialen: { ok: true, anzahl: 0, zahl: { n: 1468, wort: 'Filialen (letzter Stand)' }, fehler: [], stand, hinweise: ['OpenStreetMap: overpass-api.de: HTTP 502 bei overpass-api.de · overpass.private.coffee: Zeitüberschreitung bei overpass.private.coffee', 'letzter Stand bleibt'] },
    essen: { ok: true, anzahl: 0, fehler: [], stand, hinweise: ['OpenStreetMap: HTTP 502 bei overpass-api.de', 'OpenStreetMap gerade nicht erreichbar – letzter Stand'] },
    deals: { ok: true, anzahl: 3, fehler: [], stand },
    remix: { ok: true, anzahl: 2, fehler: [], stand: '2026-11-16T12:00:00.000Z', uebersprungen: true, hinweise: ['letzter Stand bleibt'] }, // Lauf-Zeit passt nicht -> nichts
  } };
  const z = { gemeldet: {}, lauf: { ...laufZeiten }, digestTag: '2026-11-16' };
  assert.deepEqual(neuversuchNachtragen(cfg, z, aktuell), ['filialen', 'essen']);
  assert.equal(z.neuversuch.filialen.ab, '2026-11-16T18:03:04.186Z');
  assert.equal(z.neuversuch.essen.ab, '2026-11-16T18:03:04.186Z', 'Essen: 3 h = sein Takt, wie bisher');
  assert.deepEqual(neuversuchNachtragen(cfg, z, aktuell), [], 'nur einmal');
  // Vorprüfung auf den echten Dateien
  const dir = await mkdtemp(join(tmpdir(), 'neuversuch-alt-'));
  const log = console.log; console.log = () => {};
  try {
    await writeFile(join(dir, 'zustand.json'), JSON.stringify({ gemeldet: {}, lauf: laufZeiten, digestTag: '2026-11-16' }));
    await writeFile(join(dir, 'aktuell.json'), JSON.stringify(aktuell));
    assert.equal((await faelligMain(['--data', dir, '--jetzt', '2026-11-16T17:00:00Z'], {})).module.includes('filialen'), false);
    assert.ok((await faelligMain(['--data', dir, '--jetzt', '2026-11-16T18:00:00Z'], {})).module.includes('filialen'), 'ab 18:03 (5 Min. Spielraum)');
  } finally { console.log = log; await rm(dir, { recursive: true, force: true }); }
  // lauf() trägt genauso nach und versucht Filialen dann wirklich (Overpass wieder da)
  const z2 = { gemeldet: {}, lauf: { filialen: stand } };
  const r = await lauf({ cfg: CF, wunschliste: [], vorher: aktuell, zustand: z2, holeText: overpassDa, jetzt: new Date('2026-11-16T18:10:00Z'), regelWache: false });
  assert.equal(r.aktuell.status.filialen.zahl.wort, 'Filialen');
  assert.equal(z2.lauf.filialen, '2026-11-16T18:10:00.000Z');
  assert.equal(z2.neuversuch, undefined);
});

// ---- Gegenprüfung MV8: M1 (Retry-After einer Teilquelle), N1 (Ruhe je Host), N2 (manuelle Läufe), N3 (kaputter Zustand) ----
const nahe = (iso, soll, text) => { const d = Date.parse(iso) - +soll; assert.ok(d >= 0 && d < 5000, `${text}: ${iso} statt ${new Date(+soll).toISOString()}`); };
const fehler429 = (host, std) => Object.assign(new Error(`HTTP 429 bei ${host}`), { retryAfterMs: h(std) });

test('M1 Regel: Teil-Fehler mit frischen Einträgen -> Retry-After höchstens bis zum Takt; nur letzter Stand -> bis 24 h', () => {
  assert.equal(neuversuchWarteMs({ intervallStunden: 1 }, 1, h(24), { nurLetzterStand: false }), h(1), 'stündliches Modul bleibt stündlich');
  assert.equal(neuversuchWarteMs({ intervallStunden: 3 }, 1, h(10), { nurLetzterStand: false }), h(3), 'Essen: 3-h-Takt');
  assert.equal(neuversuchWarteMs({ intervallStunden: 168 }, 1, h(10), { nurLetzterStand: false }), h(10), 'unter dem Takt gilt Retry-After');
  assert.equal(neuversuchWarteMs({ intervallStunden: 1 }, 1, h(24)), h(24), 'nur letzter Stand: Quelle will 24 h Ruhe');
  assert.equal(neuversuchWarteMs({ intervallStunden: 168 }, 1, h(500)), h(24));
});

test('M1: Ein Feed antwortet 429 + Retry-After 24 h, die anderen liefern -> Bereich läuft im Takt weiter, nur dieser Host ruht', async () => {
  const c = nur('deals'); // stündlich
  assert.equal(c.module.deals.intervallStunden, 1);
  const MODULE = (await import('../main.mjs')).MODULE;
  const echt = MODULE.deals;
  const abrufe = [];
  let aDa = false;
  const hole = async url => {
    const host = new URL(url).host;
    abrufe.push(host);
    if (host === 'a.test' && !aDa) throw fehler429(host, 24);
    return 'ok';
  };
  try {
    MODULE.deals = async ({ holeText, jetzt }) => {
      const eintraege = []; const fehler = [];
      for (const u of ['https://a.test/feed', 'https://b.test/feed']) {
        try { await holeText(u); eintraege.push({ id: `deals-${new URL(u).host}-${+new Date(jetzt)}`, kategorie: 'deals', titel: u, link: u, wert: 10, datum: new Date(jetzt).toISOString() }); }
        catch (e) { fehler.push(String(e.message)); }
      }
      return { eintraege, fehler };
    };
    const stand = { zustand: { gemeldet: {} }, aktuell: null, dateien: {} };
    const { r } = await radarStart(c, stand, hole, T0);
    assert.deepEqual(abrufe, ['a.test', 'b.test']);
    assert.equal(r.aktuell.kategorien.deals.length, 1, 'frischer Eintrag aus b.test gezeigt');
    assert.equal(stand.zustand.neuversuch.deals.ab, plus(T0, 1).toISOString(), 'nach 1 h (Takt) wieder – nicht erst nach 24 h');
    nahe(stand.zustand.hostRuhe['a.test'], plus(T0, 24), 'a.test ruht 24 h');
    assert.equal(stand.zustand.hostRuhe['b.test'], undefined);
    // stündliche Starts über 30 h: deals läuft jede Stunde, a.test wird erst nach 24 h wieder gefragt
    const laeufe = [];
    const aJe = [];
    for (let std = 1; std <= 30; std++) {
      if (std === 24) aDa = true;
      abrufe.length = 0;
      const { gelaufen } = await radarStart(c, stand, hole, plus(T0, std));
      if (gelaufen) laeufe.push(std);
      assert.ok(abrufe.includes('b.test'), `b.test bei ${std} h`);
      if (abrufe.includes('a.test')) aJe.push(std);
    }
    assert.equal(laeufe.length, 30, 'jede Stunde ein Lauf (Takt 1 h)');
    // die Ruhe zählt ab der echten Antwort (Lauf-Zeit + Millisekunden) -> bei genau 24 h ggf. noch Ruhe
    assert.deepEqual(aJe.filter(x => x !== 24), [25, 26, 27, 28, 29, 30], 'a.test vor 24 h nie gefragt');
    assert.equal(stand.zustand.hostRuhe, undefined, 'abgelaufene Ruhe aufgeräumt');
    assert.equal(stand.zustand.neuversuch, undefined, 'a.test wieder da -> Erfolg, Zähler weg');
  } finally { MODULE.deals = echt; }
});

test('N1: Ruhe gilt je Host für alle Module – auch im selben Lauf (zwei Bereiche teilen sich einen Server)', async () => {
  const c = nur('erleben');
  c.module.musik = { ...cfg.module.musik, aktiv: true };
  const MODULE = (await import('../main.mjs')).MODULE;
  const echt = { erleben: MODULE.erleben, musik: MODULE.musik };
  const abrufe = [];
  const hole = async url => { const host = new URL(url).host; abrufe.push(host); if (host === 'x.test') throw fehler429(host, 2); return 'ok'; };
  const modul = (name, urls) => async ({ holeText, jetzt }) => {
    const eintraege = []; const fehler = [];
    for (const u of urls) {
      try { await holeText(u); eintraege.push({ id: `${name}-${new URL(u).host}`, kategorie: name, titel: u, link: u, wert: 10, datum: new Date(jetzt).toISOString() }); }
      catch (e) { fehler.push(String(e.message)); }
    }
    return { eintraege, fehler };
  };
  try {
    MODULE.erleben = modul('erleben', ['https://x.test/a']);
    MODULE.musik = modul('musik', ['https://x.test/b', 'https://y.test/b']);
    const z = { gemeldet: {} };
    const r = await lauf({ cfg: c, wunschliste: [], zustand: z, holeText: hole, jetzt: T0, regelWache: false });
    assert.deepEqual(abrufe, ['x.test', 'y.test'], 'musik fragt x.test im selben Lauf nicht noch einmal');
    assert.match(r.aktuell.status.musik.fehler[0], /x\.test bat um Pause \(Retry-After\)/);
    assert.equal(r.aktuell.status.musik.ok, false, 'Anzeige wie bei jedem Quellen-Fehler');
    nahe(z.hostRuhe['x.test'], plus(T0, 2), 'Ruhe 2 h');
    // erleben: nichts Frisches, alte Einträge gab es nicht -> nur letzter Stand -> Retry-After 2 h < Stufe 3 h
    assert.equal(z.neuversuch.erleben.ab, plus(T0, 3).toISOString());
    // musik: frisch aus y.test -> Teil-Fehler, Neuversuch 3 h (Stufe), Retry-After bis höchstens zum Takt
    assert.equal(z.neuversuch.musik.ab, plus(T0, 3).toISOString());
  } finally { Object.assign(MODULE, echt); }
});

test('M1 Essen: Overpass will 10 h Ruhe -> Essen bleibt im 3-h-Takt (Pushes laufen weiter), Overpass wird erst nach 10 h wieder gefragt', async () => {
  const liste = JSON.parse(await readFile(join(HIER, '..', '..', 'essen.json'), 'utf8'));
  const seite = JSON.parse(await readFile(join(HIER, 'fixtures', 'essen-seite.json'), 'utf8'));
  const fixture = await readFile(join(HIER, 'fixtures', 'overpass-essen.json'), 'utf8');
  const c = nur('essen');
  const essenListen = { liste, seite };
  let overpass = 0;
  let osmDa = true;
  const hole = async url => {
    if (/^https:\/\/ntfy\.sh\//.test(url)) return '';
    if (new URL(url).host === 'overpass-api.de') { overpass++; if (!osmDa) throw fehler429('overpass-api.de', 10); }
    return fixture;
  };
  const stand = { zustand: { gemeldet: {} }, aktuell: null, dateien: {} };
  const start = async t => {
    const f = faelligkeit(c, stand.zustand, t);
    if (!f.faellig) return false;
    const r = await lauf({ cfg: c, wunschliste: [], essenListen, vorher: stand.aktuell, dateienVorher: stand.dateien, zustand: stand.zustand, holeText: hole, jetzt: t, regelWache: false });
    stand.aktuell = r.aktuell; stand.dateien = { ...stand.dateien, ...r.dateien };
    return true;
  };
  assert.ok(await start(plus(T0, -30)));
  assert.equal(overpass, 1);
  osmDa = false;
  assert.ok(await start(T0));
  assert.equal(overpass, 2);
  const st = stand.aktuell.status.essen;
  assert.ok(st.hinweise.some(x => /letzter Stand/.test(x)), 'Seite: „letzter Stand“ wie bisher');
  assert.equal(stand.zustand.neuversuch.essen.ab, plus(T0, 3).toISOString(), 'nicht 10 h');
  nahe(stand.zustand.hostRuhe['overpass-api.de'], plus(T0, 10), 'Overpass ruht 10 h');
  // stündliche Starts: Essen läuft alle 3 h, Overpass erst ab 10 h wieder
  const laeufe = [];
  for (let std = 1; std <= 12; std++) {
    if (std === 10) osmDa = true;
    if (await start(plus(T0, std))) laeufe.push(std);
  }
  assert.deepEqual(laeufe, [3, 6, 9, 12]);
  assert.equal(overpass, 3, 'zwischen 0 und 10 h kein Overpass-Abruf, bei 12 h einer');
  assert.equal(stand.zustand.neuversuch, undefined, 'OSM wieder da -> normaler Takt');
});

test('N2: Manuelle Läufe „alle“ kurz hintereinander zählen keine Stufe hoch; der nächste fällige Fehlschlag schon', async () => {
  const stand = await ausgangslage();
  for (const min of [0, 10, 20, 30]) {
    const t = new Date(+T0 + min * 60e3);
    const r = await lauf({ cfg: CF, wunschliste: [], vorher: stand.aktuell, dateienVorher: stand.dateien, zustand: stand.zustand, holeText: overpassAus, jetzt: t, alle: true, regelWache: false });
    stand.aktuell = r.aktuell;
  }
  const nv = stand.zustand.neuversuch.filialen;
  assert.equal(nv.n, 1, 'vier Starts in 30 Min. = weiter 1. Stufe');
  assert.equal(nv.seit, T0.toISOString());
  assert.equal(nv.ab, plus(new Date(+T0 + 30 * 60e3), 3).toISOString(), '3 h ab dem letzten Versuch');
  const { gelaufen } = await radarStart(CF, stand, overpassAus, plus(T0, 3.5));
  assert.ok(gelaufen);
  assert.equal(stand.zustand.neuversuch.filialen.n, 2);
  assert.equal(stand.zustand.neuversuch.filialen.ab, plus(T0, 9.5).toISOString());
  // vorzeitiger Fehlschlag zieht einen späteren Neuversuch nie nach vorn
  const z = { lauf: {}, neuversuch: { filialen: { ab: plus(T0, 20).toISOString(), n: 3, seit: T0.toISOString() } } };
  assert.equal(verbucheModul(z, 'filialen', { intervallStunden: 168 }, { ok: false }, plus(T0, 1)).ab, plus(T0, 20).toISOString());
  assert.equal(z.neuversuch.filialen.n, 3);
});

test('N3: Beschädigter Zustand (neuversuch/hostRuhe als Text, Liste, null, Zahl, ferne Zukunft) -> kein Absturz, nie ohne Obergrenze gesperrt', async () => {
  for (const kaputt of ['kaputt', [], null, 5, { filialen: null }, { filialen: 'x' }, { filialen: { ab: 123 } }, { filialen: [] }]) {
    const z = { gemeldet: {}, lauf: { filialen: plus(T0, -200).toISOString() }, neuversuch: kaputt, hostRuhe: kaputt };
    const r = await lauf({ cfg: CF, wunschliste: [], zustand: z, holeText: overpassAus, jetzt: T0, regelWache: false });
    assert.equal(r.aktuell.status.filialen.uebersprungen, undefined, `${JSON.stringify(kaputt)}: Filialen laufen (Takt längst um)`);
    assert.equal(z.neuversuch.filialen.n, 1, JSON.stringify(kaputt));
    assert.equal(z.neuversuch.filialen.ab, plus(T0, 3).toISOString());
    assert.ok(z.hostRuhe === undefined || (typeof z.hostRuhe === 'object' && !Array.isArray(z.hostRuhe)));
    // Vorprüfung ebenso
    assert.ok(faelligkeit(CF, { lauf: { filialen: plus(T0, -200).toISOString() }, neuversuch: kaputt, gemeldet: {} }, T0).module.includes('filialen'));
  }
  // ab weit in der Zukunft / n unsinnig -> gekappt auf max(Takt, 24 h)
  const z = { neuversuch: { filialen: { ab: '2099-01-01T00:00:00Z', n: 1e9 }, deals: { ab: '2099-01-01T00:00:00Z', n: 2 }, weg: { n: 1 } } };
  neuversuchBereinigen(cfg, z, T0);
  assert.equal(z.neuversuch.filialen.ab, plus(T0, 168).toISOString(), 'Filialen: Takt 168 h');
  assert.equal(z.neuversuch.filialen.n, 1);
  assert.equal(z.neuversuch.deals.ab, plus(T0, NEUVERSUCH_MAX_STUNDEN).toISOString(), 'stündlich: 24 h');
  assert.equal(z.neuversuch.weg, undefined);
  const zr = { hostRuhe: { 'a.test': '2099-01-01T00:00:00Z', 'b.test': plus(T0, -1).toISOString(), 'c.test': 7 } };
  hostRuheBereinigen(zr, +T0);
  assert.deepEqual(zr.hostRuhe, { 'a.test': plus(T0, NEUVERSUCH_MAX_STUNDEN).toISOString() });
  // lauf() schreibt die gekappte Zeit in den Zustand (Daten-Zweig) -> danach läuft die Frist wirklich ab
  const zl = { gemeldet: {}, lauf: { filialen: plus(T0, -1).toISOString() }, neuversuch: { filialen: { ab: '2099-01-01T00:00:00Z', n: 1, seit: T0.toISOString() } } };
  const rl = await lauf({ cfg: CF, wunschliste: [], zustand: zl, holeText: overpassAus, jetzt: T0, regelWache: false });
  assert.equal(rl.aktuell.status.filialen.uebersprungen, true);
  assert.equal(zl.neuversuch.filialen.ab, plus(T0, 168).toISOString());
  assert.deepEqual(faelligkeit(CF, zl, plus(T0, 168)).module, ['filialen']);
  // Vorprüfung auf Dateien mit kaputtem Eintrag: ferne Zukunft wird gekappt statt ewig gesperrt
  const dir = await mkdtemp(join(tmpdir(), 'neuversuch-kaputt-'));
  const log = console.log; console.log = () => {};
  try {
    const lauf0 = Object.fromEntries(Object.keys(cfg.module).map(n => [n, plus(T0, -0.1).toISOString()]));
    await writeFile(join(dir, 'zustand.json'), JSON.stringify({ gemeldet: {}, lauf: lauf0, digestTag: '2026-11-16', neuversuch: { deals: { ab: '2099-01-01T00:00:00Z', n: 1 } } }));
    await writeFile(join(dir, 'aktuell.json'), JSON.stringify({ aktualisiert: T0.toISOString() }));
    assert.equal((await faelligMain(['--data', dir, '--jetzt', T0.toISOString()], {})).naechstes.deals, new Date(+plus(T0, 24) - 5 * 60e3).toISOString());
    await writeFile(join(dir, 'zustand.json'), JSON.stringify({ gemeldet: {}, lauf: lauf0, digestTag: '2026-11-16', neuversuch: 'kaputt' }));
    assert.ok((await faelligMain(['--data', dir, '--jetzt', plus(T0, 1).toISOString()], {})).module.includes('deals'));
  } finally { console.log = log; await rm(dir, { recursive: true, force: true }); }
});
