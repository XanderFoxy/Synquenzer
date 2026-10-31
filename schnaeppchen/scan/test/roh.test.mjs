// Roh-Mitschnitt: nur mit ROH_DIR, dann alles mitschreiben, Schlüssel schwärzen, nie pushen. Ohne ROH_DIR: keine Rohdateien.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../http.mjs';
import { macheMitschnitt, rohOrdner, schwaerzeUrl } from '../roh.mjs';
import { main } from '../main.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const JETZT = '2026-10-31T12:00:00Z';

// Netz-Ersatz: liefert die aufgezeichneten Antworten wie ein echter Server; zählt Abrufe und Pushes.
function netz() {
  const fix = macheFixtureAbruf(FIX);
  const n = { abrufe: 0, pushes: 0 };
  n.fetch = async (url, opts = {}) => {
    if (opts.method === 'POST') { n.pushes++; return new Response('ok'); }
    n.abrufe++;
    try {
      const typ = url.includes('api.marktguru') ? 'application/json' : url.includes('mydealz') ? 'application/rss+xml' : 'text/html';
      return new Response(await fix(url), { status: 200, headers: { 'content-type': typ } });
    } catch { return new Response('nicht gefunden', { status: 404 }); }
  };
  return n;
}

async function stumm(fn) {
  const log = console.log; console.log = () => {};
  try { return await fn(); } finally { console.log = log; }
}

test('Roh-Modus nur mit ROH_DIR oder --roh', () => {
  assert.equal(rohOrdner([], {}), null);
  assert.equal(rohOrdner([], { ROH_DIR: '' }), null);
  assert.equal(rohOrdner([], { ROH_DIR: '/tmp/x' }), '/tmp/x');
  assert.equal(rohOrdner(['--roh', '/tmp/y'], {}), '/tmp/y');
});

test('Normaler Lauf schreibt keine Rohdateien', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-norm-'));
  const n = netz();
  const echtesFetch = globalThis.fetch;
  globalThis.fetch = n.fetch;
  try {
    await stumm(() => main(['--data', join(dir, 'daten'), '--jetzt', JETZT], { DRY_RUN: '1' }, { fetchImpl: n.fetch, abruf: { pauseMs: 0 } }));
    assert.ok(n.abrufe > 5, 'Quellen wurden abgefragt');
    assert.deepEqual(await readdir(dir), ['daten']);
    assert.deepEqual((await readdir(join(dir, 'daten'))).sort(), ['current.json', 'history.json', 'sent.json']);
  } finally { globalThis.fetch = echtesFetch; await rm(dir, { recursive: true, force: true }); }
});

test('Roh-Modus: jede Antwort + Ergebnis gespeichert, kein Push', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-roh-'));
  const rohDir = join(dir, 'roh');
  const n = netz();
  const echtesFetch = globalThis.fetch;
  globalThis.fetch = n.fetch;
  try {
    // ohne DRY_RUN: der Roh-Modus muss selbst dafür sorgen, dass nichts gesendet wird
    const r = await stumm(() => main(['--data', join(dir, 'daten'), '--jetzt', JETZT], { ROH_DIR: rohDir }, { fetchImpl: n.fetch, abruf: { pauseMs: 0 } }));
    assert.ok(r.msgs.length > 0, 'es gäbe Pushes');
    assert.equal(n.pushes, 0, 'aber keiner wird gesendet');
    const index = JSON.parse(await readFile(join(rohDir, 'index.json'), 'utf8'));
    assert.equal(index.projekt, 'schnaeppchen');
    assert.equal(index.anzahl, n.abrufe);
    for (const a of index.abrufe.filter(x => x.datei)) assert.ok((await stat(join(rohDir, a.datei))).size > 0, a.datei);
    assert.ok(index.abrufe.some(a => a.url.startsWith('https://api.marktguru.de/') && a.datei.endsWith('.json')));
    assert.ok(index.abrufe.some(a => a.url.includes('mydealz.de/rss/gruppe/preisfehler') && a.datei.endsWith('.xml')));
    const aus = (await readdir(join(rohDir, 'ausgabe'))).sort();
    assert.deepEqual(aus, ['current.json', 'history.json', 'pushes.json', 'sent.json']);
    assert.equal(await readFile(join(rohDir, 'ausgabe', 'current.json'), 'utf8'), await readFile(join(dir, 'daten', 'current.json'), 'utf8'));
    assert.equal(JSON.parse(await readFile(join(rohDir, 'ausgabe', 'pushes.json'), 'utf8')).length, r.msgs.length);
  } finally { globalThis.fetch = echtesFetch; await rm(dir, { recursive: true, force: true }); }
});

test('Mitschnitt: Schlüssel geschwärzt, große Antworten gekürzt, Fehler vermerkt, Antwort bleibt lesbar', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'schn-mit-'));
  try {
    const roh = macheMitschnitt(dir, { projekt: 't', env: { KEEPA_KEY: 'GEHEIM-keepa-123' }, maxBytes: 50 });
    const f = roh.fetch(async url => {
      if (url.includes('tot')) throw new Error('kein Netz');
      return new Response(JSON.stringify({ key: 'GEHEIM-keepa-123', viel: 'x'.repeat(200) }), { headers: { 'content-type': 'application/json' } });
    });
    const r = await f('https://api.keepa.com/product?key=GEHEIM-keepa-123&domain=3');
    assert.equal((await r.json()).viel.length, 200, 'Aufrufer bekommt die volle Antwort');
    await assert.rejects(f('https://tot.example/'), /kein Netz/);
    const info = roh.abschluss();
    assert.equal(info.abrufe[0].url, 'https://api.keepa.com/product?key=***&domain=3');
    assert.equal(info.abrufe[0].gekuerzt, true);
    const inhalt = await readFile(join(dir, info.abrufe[0].datei), 'utf8');
    assert.equal(Buffer.byteLength(inhalt), 50);
    assert.ok(!inhalt.includes('GEHEIM'));
    assert.equal(info.abrufe[1].fehler, 'kein Netz');
    assert.equal(info.abrufe[1].datei, null);
    assert.ok(!JSON.stringify(info).includes('GEHEIM'));
    assert.equal(schwaerzeUrl('https://x/?apikey=abc&q=1&token=t'), 'https://x/?apikey=***&q=1&token=***');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
