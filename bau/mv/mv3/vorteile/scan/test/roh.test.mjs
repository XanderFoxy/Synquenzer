// Roh-Mitschnitt: nur mit ROH_DIR, dann alle Module, jede Antwort + Ergebnis, nie pushen. Ohne ROH_DIR: keine Rohdateien.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { rohOrdner } from '../lib/roh.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { main } from '../main.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const JETZT = '2026-10-31T19:00:00Z';

// Netz-Ersatz mit den aufgezeichneten Antworten; unbekannte URLs -> 404 (kein 5xx, sonst wartet der Wiederholversuch).
function netz() {
  const fix = macheFixtureAbruf(FIX, FIXTURE_KARTE);
  const n = { abrufe: 0, pushes: 0 };
  n.fetch = async (url, opts = {}) => {
    if (opts.method === 'POST') { n.pushes++; return new Response('ok'); }
    n.abrufe++;
    try { return new Response(await fix(url), { status: 200 }); }
    catch { return new Response('nicht gefunden', { status: 404 }); }
  };
  return n;
}

async function mitNetz(fn) {
  const n = netz();
  const log = console.log, echtesFetch = globalThis.fetch;
  console.log = () => {}; globalThis.fetch = n.fetch;
  try { return { n, r: await fn(n) }; } finally { console.log = log; globalThis.fetch = echtesFetch; }
}

test('Roh-Modus nur mit ROH_DIR oder --roh', () => {
  assert.equal(rohOrdner([], { ROH_DIR: '' }), null);
  assert.equal(rohOrdner([], { ROH_DIR: '/tmp/x' }), '/tmp/x');
});

test('Normaler Lauf schreibt keine Rohdateien', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vort-norm-'));
  try {
    const { n } = await mitNetz(n => main(['--data', join(dir, 'daten'), '--jetzt', JETZT, '--alle'], { DRY_RUN: '1' }, { fetchImpl: n.fetch, abruf: { pauseMs: 0 } }));
    assert.ok(n.abrufe > 5, 'Quellen wurden abgefragt');
    assert.deepEqual(await readdir(dir), ['daten']);
    assert.deepEqual((await readdir(join(dir, 'daten'))).sort(), ['aktuell.json', 'zustand.json']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('Roh-Modus: alle Module, jede Antwort + Ergebnis gespeichert, kein Push', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vort-roh-'));
  const rohDir = join(dir, 'roh');
  try {
    // ohne DRY_RUN und ohne --alle: der Roh-Modus erzwingt beides
    const { n, r } = await mitNetz(n => main(['--data', join(dir, 'daten'), '--jetzt', JETZT], { ROH_DIR: rohDir }, { fetchImpl: n.fetch, abruf: { pauseMs: 0 } }));
    assert.equal(n.pushes, 0, 'nichts gesendet');
    assert.ok(Object.values(r.aktuell.status).every(s => !s.uebersprungen), 'alle Module gelaufen');
    const index = JSON.parse(await readFile(join(rohDir, 'index.json'), 'utf8'));
    assert.equal(index.projekt, 'vorteile');
    assert.equal(index.anzahl, n.abrufe);
    for (const a of index.abrufe.filter(x => x.datei)) assert.ok((await stat(join(rohDir, a.datei))).size > 0, a.datei);
    assert.ok(index.abrufe.some(a => a.url.includes('schnaeppchen-daten') && a.datei.endsWith('.json')));
    assert.ok(index.abrufe.some(a => a.url.includes('rss/gruppe/preisfehler') && a.datei.endsWith('.xml')));
    assert.deepEqual((await readdir(join(rohDir, 'ausgabe'))).sort(), ['aktuell.json', 'pushes.json', 'zustand.json']);
    assert.equal(await readFile(join(rohDir, 'ausgabe', 'aktuell.json'), 'utf8'), await readFile(join(dir, 'daten', 'aktuell.json'), 'utf8'));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
