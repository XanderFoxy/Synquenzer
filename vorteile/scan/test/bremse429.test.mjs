// Runde 9 (17.11.2026): HTTP 429 = „zu viele Abrufe“ -> der Radar bremst bei genau diesem Host für den Rest des Laufs selbst.
// Anlass: Läufe 43970348817 (16.11. 22:28) und 44004388489 (17.11. 02:37) – Google News antwortete mitten im Lauf 429 ohne
// Retry-After, die eine Wiederholung nach 3 s ebenso; Erleben bzw. Remix galten als gestört (Neuversuch), obwohl der nächste
// Abruf Sekunden später wieder 200 bekam.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheAbruf } from '../lib/http.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));

// Abstände klein (Millisekunden statt Sekunden), Verhältnisse wie in config.json
const ABRUF = { pauseMs: 20, wiederholMs: 10, timeoutMs: 2000, userAgent: 'x', wiederhol429Ms: 200, bremse429MaxMs: 120 };

test('429 ohne Retry-After: Wiederholung erst nach wiederhol429Ms, danach doppelter Abstand nur bei diesem Host (höchstens bremse429MaxMs)', async () => {
  const z = [];
  let n = 0;
  const hole = macheAbruf(ABRUF, async url => {
    const host = new URL(url).host;
    z.push([host, Date.now()]);
    if (host === 'news.example' && ++n === 1) return new Response('zu schnell', { status: 429 });
    return new Response('ok');
  });
  assert.equal(await hole('https://news.example/rss/search?q=1'), 'ok');
  const [[, a], [, b]] = z;
  assert.ok(b - a >= 190, `Wiederholung nach ${b - a} ms (soll ≥ 200 ms)`);
  assert.equal(hole.bremse.get('news.example'), 40, 'Abstand 20 -> 40 ms');
  // nächster Abruf beim gebremsten Host: mindestens 40 ms Abstand; anderer Host: nicht gebremst
  await hole('https://news.example/rss/search?q=2');
  const c = z.at(-1)[1];
  assert.ok(c - b >= 38, `gebremster Abstand ${c - b} ms`);
  assert.equal(hole.bremse.has('andere.example'), false);
  const t0 = Date.now();
  await hole('https://andere.example/x');
  assert.ok(Date.now() - t0 < 150, 'andere Hosts warten nicht auf die Bremse');
});

test('429 mehrmals: Abstand verdoppelt sich bis zur Obergrenze, bleibt der Fehler, kommt er wie bisher als „HTTP 429 bei …“', async () => {
  let n = 0;
  const hole = macheAbruf(ABRUF, async () => { n++; return new Response('zu schnell', { status: 429 }); });
  await assert.rejects(hole('https://news.example/a'), /HTTP 429 bei news\.example/);
  assert.equal(n, 2, 'genau eine Wiederholung');
  assert.equal(hole.bremse.get('news.example'), 80, '20 -> 40 -> 80');
  await assert.rejects(hole('https://news.example/b'), /HTTP 429/);
  assert.equal(hole.bremse.get('news.example'), 120, 'höchstens bremse429MaxMs');
  await assert.rejects(hole('https://news.example/c'), /HTTP 429/);
  assert.equal(hole.bremse.get('news.example'), 120);
});

test('429 mit Retry-After: der längere Wunsch gewinnt; 5xx bremst nicht', async () => {
  const z = [];
  const hole = macheAbruf({ ...ABRUF, retryAfterMaxMs: 5000 }, async () => {
    z.push(Date.now());
    return z.length === 1 ? new Response('später', { status: 429, headers: { 'retry-after': '1' } }) : new Response('ok');
  });
  assert.equal(await hole('https://ra.example/x'), 'ok');
  assert.ok(z[1] - z[0] >= 950, `Retry-After 1 s eingehalten (${z[1] - z[0]} ms)`);
  let m = 0;
  const h5 = macheAbruf(ABRUF, async () => (++m === 1 ? new Response('kaputt', { status: 502 }) : new Response('ok')));
  const t0 = Date.now();
  assert.equal(await h5('https://fuenf.example/x'), 'ok');
  assert.ok(Date.now() - t0 < 150, '502: Wiederholung nach dem normalen Abstand, keine 429-Wartezeit');
  assert.equal(h5.bremse.size, 0);
});

test('Ohne Pausen (pauseMs 0, Tests) und ohne die Werte in der Konfiguration bremst nichts – Verhalten wie vorher', async () => {
  for (const abruf of [{ ...ABRUF, pauseMs: 0, wiederholMs: 0 }, { pauseMs: 20, wiederholMs: 10, timeoutMs: 2000, userAgent: 'x' }]) {
    let n = 0;
    const hole = macheAbruf(abruf, async () => (++n === 1 ? new Response('zu schnell', { status: 429 }) : new Response('ok')));
    const t0 = Date.now();
    assert.equal(await hole('https://news.example/x'), 'ok');
    assert.ok(Date.now() - t0 < 150, `keine lange Wartezeit (${Date.now() - t0} ms)`);
    assert.equal(hole.bremse.size, 0);
  }
});

test('config.json: echte Läufe warten nach 429 20 s und bremsen bis höchstens 15 s Abstand (unter dem Zeitlimit des Laufs)', () => {
  assert.equal(cfg.abruf.wiederhol429Ms, 20000);
  assert.equal(cfg.abruf.bremse429MaxMs, 15000);
  assert.ok(cfg.abruf.wiederhol429Ms < cfg.abruf.timeoutMs * 2, 'Wiederholung nicht länger als zwei Zeitlimits');
});
