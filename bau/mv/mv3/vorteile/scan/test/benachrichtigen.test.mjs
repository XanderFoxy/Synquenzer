import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { plane, verbuche, berlin } from '../benachrichtigen.mjs';
import { main } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const e = (id, sofort, wert = 50, titel = `Titel ${id}`) => ({ id, kategorie: 'reisen', titel, zeile: 'z', soGehts: 's', link: `https://x/${id}`, wert, sofort });
const abends = new Date('2026-10-31T18:30:00Z'); // 19:30 in Berlin
const mittags = new Date('2026-10-31T11:00:00Z');

test('Berlin-Zeit', () => { assert.deepEqual(berlin(abends), { tag: '2026-10-31', stunde: 19 }); });

test('Sofort höchstens maxSofortProTag, Rest in die Zusammenfassung', () => {
  const liste = [e('a', true, 90), e('b', true, 80), e('c', true, 70), e('d', true, 60), e('f', false, 40)];
  const p = plane({ eintraege: liste, zustand: { gemeldet: {} }, cfg, jetzt: abends });
  assert.deepEqual(p.sofort.map(s => s.e.id), ['a', 'b', 'c']);
  assert.deepEqual(p.digest.liste.map(x => x.id), ['d', 'f']);
  assert.match(p.sofort[0].msg.message, /So geht's: s/);
  assert.equal(p.sofort[0].msg.click, 'https://x/a');
});

test('Zusammenfassung nur einmal am Tag und erst ab digestStunde', () => {
  const z = { gemeldet: {} };
  assert.equal(plane({ eintraege: [e('x', false)], zustand: z, cfg, jetzt: mittags }).digest, null);
  const p = plane({ eintraege: [e('x', false)], zustand: z, cfg, jetzt: abends });
  assert.ok(p.digest);
  verbuche(z, p, { sofort: [], digest: true }, abends);
  assert.equal(plane({ eintraege: [e('x', false), e('y', false)], zustand: z, cfg, jetzt: new Date('2026-10-31T20:00:00Z') }).digest, null);
});

test('Dedupe: gemeldet bleibt gemeldet, gleicher Titel aus zweiter Quelle zählt mit, Tageslimit über mehrere Läufe', () => {
  const z = { gemeldet: {} };
  const p1 = plane({ eintraege: [e('a', true, 90, 'Flug für 19 €'), e('a2', true, 80, 'Flug für 19 €')], zustand: z, cfg, jetzt: mittags });
  assert.equal(p1.sofort.length, 1);
  verbuche(z, p1, { sofort: [true], digest: false }, mittags);
  const p2 = plane({ eintraege: [e('a', true), e('a3', true, 50, 'Flug für 19 €'), e('b', true), e('c', true), e('d', true)], zustand: z, cfg, jetzt: mittags });
  assert.deepEqual(p2.sofort.map(s => s.e.id), ['b', 'c']);
});

test('Fehlgeschlagener Push gilt nicht als gemeldet', () => {
  const z = { gemeldet: {} };
  const p = plane({ eintraege: [e('a', true)], zustand: z, cfg, jetzt: mittags });
  verbuche(z, p, { sofort: [false], digest: false }, mittags);
  assert.equal(plane({ eintraege: [e('a', true)], zustand: z, cfg, jetzt: mittags }).sofort.length, 1);
});

test('Gesamtlauf mit Fixtures: Erstlauf still, zweiter Lauf meldet nur Neues', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vorteile-'));
  const log = console.log; console.log = () => {};
  try {
    const r1 = await main(['--fixtures', '--data', dir, '--jetzt', '2026-10-31T19:00:00Z']);
    assert.equal(r1.plan.sofort.length, 0);
    assert.ok(r1.alleEintraege.length >= 10);
    const a = JSON.parse(await readFile(join(dir, 'aktuell.json'), 'utf8'));
    assert.deepEqual(Object.keys(a.kategorien), ['deals', 'erleben', 'reisen', 'musik', 'nebenverdienst', 'tests', 'praemien']);
    assert.ok(a.sofort.length > 0);
    assert.equal(a.status.reisen.ok, false);
    const r2 = await main(['--fixtures', '--data', dir, '--jetzt', '2026-10-31T20:00:00Z']);
    assert.equal(r2.plan.sofort.length, 0, 'alles schon bekannt');
    assert.equal(r2.plan.digest, null);
    // Prämien sortiert nach Netto pro Stunde Aufwand
    const pr = a.kategorien.praemien.map(e => e.extra.proStunde);
    assert.deepEqual(pr, [...pr].sort((x, y) => y - x));
  } finally { console.log = log; }
});

test('Neues Modul in laufendem Radar: erster Lauf meldet nichts nach (keine Push-Flut)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vorteile-'));
  const log = console.log; console.log = () => {};
  try {
    await main(['--fixtures', '--data', dir, '--jetzt', '2026-10-31T19:00:00Z']);
    // so tun, als hätte es das Prämien-Modul vorher nicht gegeben
    const zp = join(dir, 'zustand.json');
    const z = JSON.parse(await readFile(zp, 'utf8'));
    delete z.lauf.praemien; z.gemeldet = {}; z.digestTag = '2026-10-31';
    const { writeFile } = await import('node:fs/promises');
    await writeFile(zp, JSON.stringify(z));
    const r = await main(['--fixtures', '--data', dir, '--jetzt', '2026-10-31T20:00:00Z', '--modus', 'digest']);
    assert.ok(!r.plan.sofort.some(s => s.e.kategorie === 'praemien'));
    assert.ok(!(r.plan.digest?.liste || []).some(e => e.kategorie === 'praemien'));
  } finally { console.log = log; }
});
