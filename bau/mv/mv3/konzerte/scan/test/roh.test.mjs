// Roh-Mitschnitt: nur mit ROH_DIR, dann jede Antwort + Ergebnis, Schlüssel geschwärzt, nie pushen. Ohne ROH_DIR: keine Rohdateien.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ticketmaster from '../sources/ticketmaster.mjs';
import { lauf } from '../run.mjs';

const FX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const jetzt = new Date('2026-10-31T12:00:00Z');
const GEHEIM = 'GEHEIM-tm-123456';

function netz() {
  const n = { abrufe: 0, pushes: 0 };
  n.fetch = async (url, opts = {}) => {
    if (opts.method === 'POST') { n.pushes++; return new Response('ok'); }
    n.abrufe++;
    if (url.includes('ticketmaster')) return new Response(fs.readFileSync(path.join(FX, 'tm-alphaville.json')), { headers: { 'content-type': 'application/json' } });
    return new Response('[]', { headers: { 'content-type': 'application/json' } });
  };
  return n;
}
// echte Ticketmaster-Quelle, aber nur zwei Bands (Mindestabstand pro Host hält den Test sonst auf)
const quellen = [['ticketmaster', ctx => ticketmaster({ ...ctx, bands: ctx.bands.filter(b => ['Alphaville', 'Roxette'].includes(b.name)) })]];

async function stumm(fn) {
  const log = console.log; console.log = () => {};
  try { return await fn(); } finally { console.log = log; }
}
const dateien = d => fs.readdirSync(d, { recursive: true }).filter(f => fs.statSync(path.join(d, f)).isFile()).sort();

test('Normaler Lauf schreibt keine Rohdateien', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-norm-'));
  try {
    const n = netz();
    await stumm(() => lauf({ env: { DATA_DIR: dir, TM_KEY: GEHEIM, NTFY_TOPIC: 't' }, fetchImpl: n.fetch, jetzt, quellen }));
    assert.equal(n.abrufe, 2);
    assert.deepEqual(dateien(dir), ['geo.json', 'gesehen.json', 'ids.json', 'konzerte.json', 'releases.json', 'status.json'].map(f => path.join('konzerte', 'data', f)));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('Roh-Modus: jede Antwort + Ergebnis gespeichert, Schlüssel geschwärzt, kein Push', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-roh-'));
  const rohDir = path.join(dir, 'roh');
  try {
    const n = netz();
    const env = { DATA_DIR: path.join(dir, 'daten'), TM_KEY: GEHEIM, NTFY_TOPIC: 't', ROH_DIR: rohDir };
    await stumm(() => lauf({ env, fetchImpl: n.fetch, jetzt, quellen })); // Erstlauf: Willkommens-Push wäre fällig
    const r = await stumm(() => lauf({ env: { ...env, DATA_DIR: path.join(dir, 'daten2') }, fetchImpl: n.fetch, jetzt, quellen }));
    assert.equal(n.pushes, 0, 'nichts gesendet');
    assert.equal(r.erg.erstlauf, true);
    const index = JSON.parse(fs.readFileSync(path.join(rohDir, 'index.json'), 'utf8'));
    assert.equal(index.projekt, 'konzerte');
    assert.ok(index.anzahl >= 2);
    assert.ok(index.abrufe.every(a => a.url.includes('apikey=***') && a.status === 200 && a.datei.endsWith('.json')));
    for (const f of dateien(rohDir)) assert.ok(!fs.readFileSync(path.join(rohDir, f), 'utf8').includes(GEHEIM), f);
    assert.deepEqual(fs.readdirSync(path.join(rohDir, 'ausgabe')).sort(), ['geo.json', 'gesehen.json', 'ids.json', 'konzerte.json', 'pushes.json', 'releases.json', 'status.json']);
    const pushes = JSON.parse(fs.readFileSync(path.join(rohDir, 'ausgabe', 'pushes.json'), 'utf8'));
    assert.match(pushes[0].titel, /aktiv/);
    assert.equal(fs.readFileSync(path.join(rohDir, 'ausgabe', 'konzerte.json'), 'utf8'), fs.readFileSync(path.join(dir, 'daten2', 'konzerte', 'data', 'konzerte.json'), 'utf8'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
