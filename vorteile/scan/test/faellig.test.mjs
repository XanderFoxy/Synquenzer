// MV7 Aktualität (14.11.2026): Fälligkeit je Bereich, Vorprüfung im Workflow, Zeitplan-Datei, Remotive-Abstand.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { faelligkeit, modulFaellig, main as faelligMain } from '../faellig.mjs';
import { lauf } from '../main.mjs';
import unterricht from '../module/unterricht.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const h = n => n * 3600e3;

test('Intervalle: Deals stündlich, Gesuche/Filme/Remix/Auftritte höchstens 3 h', () => {
  const m = cfg.module;
  assert.equal(m.deals.intervallStunden, 1);
  for (const n of ['unterricht', 'filme', 'remix', 'auftritte']) assert.ok(m[n].intervallStunden <= 3, `${n}: ${m[n].intervallStunden} h`);
  assert.ok(m.unterricht.gesuche.aktiv !== false, 'Gesuche hängen am Bereich unterricht');
  assert.ok(m.unterricht.remotive.intervallStunden >= 6, 'Remotive bittet um wenige Abrufe am Tag');
});

test('modulFaellig: Abstand mit 5 Min. Spielraum, kaputtes Datum = fällig, aus = nie', () => {
  const jetzt = Date.parse('2026-11-14T12:00:00Z');
  const m = { intervallStunden: 3 };
  assert.equal(modulFaellig(m, null, jetzt), true, 'nie gelaufen');
  assert.equal(modulFaellig(m, new Date(jetzt - h(2.9)).toISOString(), jetzt), false);
  assert.equal(modulFaellig(m, new Date(jetzt - h(3) + 4 * 60e3).toISOString(), jetzt), true, '4 Min. zu früh zählt');
  assert.equal(modulFaellig(m, 'kaputt', jetzt), true);
  assert.equal(modulFaellig({ aktiv: false }, null, jetzt), false);
  assert.equal(modulFaellig({}, new Date(jetzt - h(1)).toISOString(), jetzt), true, 'ohne Angabe stündlich');
});

test('faelligkeit: nichts dran -> faellig false; Deals nach 1 h; Zusammenfassung ab 18 Uhr Berlin einmal am Tag', () => {
  const jetzt = new Date('2026-11-14T12:00:00Z'); // 13 Uhr in Berlin
  const lauf = Object.fromEntries(Object.keys(cfg.module).map(n => [n, new Date(jetzt - 10 * 60e3).toISOString()]));
  const z = { gemeldet: {}, lauf, digestTag: '2026-11-14' };
  let f = faelligkeit(cfg, z, jetzt);
  assert.deepEqual(f.module, []);
  assert.equal(f.faellig, false);
  assert.ok(f.naechstes.deals > jetzt.toISOString());

  f = faelligkeit(cfg, { ...z, lauf: { ...lauf, deals: new Date(jetzt - h(1)).toISOString() } }, jetzt);
  assert.deepEqual(f.module, ['deals']);
  assert.equal(f.faellig, true);

  const abends = new Date('2026-11-14T17:30:00Z'); // 18:30 Berlin
  const lauf2 = Object.fromEntries(Object.keys(cfg.module).map(n => [n, new Date(abends - 10 * 60e3).toISOString()]));
  assert.equal(faelligkeit(cfg, { gemeldet: {}, lauf: lauf2, digestTag: '2026-11-13' }, abends).digest, true);
  assert.equal(faelligkeit(cfg, { gemeldet: {}, lauf: lauf2, digestTag: '2026-11-14' }, abends).faellig, false);
  assert.equal(faelligkeit(cfg, { lauf: lauf2 }, abends).faellig, true, 'erster Lauf überhaupt');
});

test('faellig.mjs (Workflow-Vorprüfung): schreibt faellig=… nach GITHUB_OUTPUT, ohne Daten immer fällig', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'faellig-'));
  try {
    const out = join(dir, 'out.txt');
    const log = console.log; console.log = () => {};
    try {
      let f = await faelligMain(['--data', join(dir, 'leer')], { GITHUB_OUTPUT: out });
      assert.equal(f.faellig, true);
      const jetzt = '2026-11-14T12:00:00Z';
      const lauf = Object.fromEntries(Object.keys(cfg.module).map(n => [n, new Date(Date.parse(jetzt) - 60e3).toISOString()]));
      await writeFile(join(dir, 'zustand.json'), JSON.stringify({ gemeldet: {}, lauf, digestTag: '2026-11-14' }));
      await writeFile(join(dir, 'aktuell.json'), JSON.stringify({ aktualisiert: jetzt }));
      f = await faelligMain(['--data', dir, '--jetzt', jetzt], { GITHUB_OUTPUT: out });
      assert.equal(f.faellig, false);
    } finally { console.log = log; }
    assert.match(readFileSync(out, 'utf8'), /^faellig=true\n[\s\S]*faellig=false\n/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('lauf und Vorprüfung entscheiden gleich: nicht fällige Bereiche behalten Stand und Einträge', async () => {
  const jetzt = new Date('2026-11-14T12:00:00Z');
  const vorLauf = new Date(jetzt - h(2)).toISOString();
  const aus = Object.fromEntries(Object.keys(cfg.module).map(n => [n, { aktiv: false }]));
  const c = { ...cfg, module: { ...aus, remix: { ...cfg.module.remix }, deals: { ...cfg.module.deals } } };
  const zustand = { gemeldet: {}, lauf: { remix: vorLauf, deals: vorLauf } };
  const vorher = { kategorien: { remix: [{ id: 'r1', titel: 'Alt', link: 'https://x.test/r1', wert: 50 }] }, status: { remix: { ok: true, anzahl: 1, stand: vorLauf } } };
  const erwartet = faelligkeit(c, zustand, jetzt).module;
  assert.deepEqual(erwartet, ['deals'], 'remix (3 h) nach 2 h noch nicht dran');
  const holeText = async () => { throw new Error('offline (Test)'); };
  const r = await lauf({ cfg: c, wunschliste: [], vorher, zustand: structuredClone(zustand), holeText, jetzt });
  assert.equal(r.aktuell.status.remix.uebersprungen, true);
  assert.equal(r.aktuell.status.remix.stand, vorLauf, 'Stand des letzten echten Laufs bleibt sichtbar');
  assert.equal(r.aktuell.kategorien.remix.length, 1);
  assert.ok(!r.aktuell.status.deals.uebersprungen, 'deals ist gelaufen');
});

test('Remotive: höchstens alle 6 h echt abfragen, dazwischen gemerkte Treffer', async () => {
  const m = cfg.module.unterricht;
  const url = m.remotive.urls[0];
  const job = { url: 'https://remotive.com/remote-jobs/x/german-teacher-1', title: 'German Teacher (remote)', category: 'Education', company_name: 'Lingo', candidate_required_location: 'Europe', publication_date: '2026-11-13T10:00:00', job_type: 'part_time' };
  let abrufe = 0;
  const holeText = async u => { if (u === url) { abrufe++; return JSON.stringify({ jobs: [job, { url: 'https://remotive.com/y', title: 'Sales Manager', category: 'Sales' }] }); } throw new Error('aus (Test)'); };
  const c = { ...cfg, module: { ...cfg.module, unterricht: { ...m, gesuche: { ...m.gesuche, aktiv: false }, suchen: [], ba: { ...m.ba, suchen: [] }, fundorte: [] } } };
  const zustand = {};
  const t0 = new Date('2026-11-14T06:00:00Z');
  const r1 = await unterricht({ holeText, cfg: c, jetzt: t0, zustand, env: {} });
  assert.equal(abrufe, 1);
  assert.ok(r1.eintraege.some(e => e.link === job.url));
  assert.equal(zustand.quellen.remotive[url].jobs.length, 1, 'nur passende Stellen gemerkt');
  const r2 = await unterricht({ holeText, cfg: c, jetzt: new Date(+t0 + h(3)), zustand, env: {} });
  assert.equal(abrufe, 1, 'nach 3 h kein neuer Abruf');
  assert.ok(r2.eintraege.some(e => e.link === job.url), 'gemerkte Stelle bleibt sichtbar');
  await unterricht({ holeText, cfg: c, jetzt: new Date(+t0 + h(6)), zustand, env: {} });
  assert.equal(abrufe, 2, 'nach 6 h wieder echt');
  await unterricht({ holeText, cfg: c, jetzt: new Date(+t0 + h(7)), zustand, env: { ROH_DIR: '/tmp/x' } });
  assert.equal(abrufe, 3, 'Roh-Mitschnitt fragt immer echt');
});

// Die Workflow-Datei liegt außerhalb von vorteile/ (im Actions-Lauf nicht ausgecheckt -> dort übersprungen)
const WF = join(HIER, '..', '..', '..', '.github', 'workflows');
const wfDa = existsSync(join(WF, 'vorteile.yml'));
test('Zeitplan-Datei: gültige Cron-Zeilen zu krummen Minuten, Vorprüfung, Wächter, bekannte Workflow-Namen', { skip: !wfDa && 'Workflow-Datei nicht ausgecheckt' }, () => {
  const text = readFileSync(join(WF, 'vorteile.yml'), 'utf8');
  assert.doesNotMatch(text, /\t/, 'keine Tabs in YAML');
  const crons = [...text.matchAll(/^\s+- cron: '([^']+)'/gm)].map(x => x[1]);
  assert.ok(crons.length >= 4, `${crons.length} Zeitpläne`);
  const minuten = new Set();
  for (const c of crons) {
    const f = c.trim().split(/\s+/);
    assert.equal(f.length, 5, c);
    assert.match(f[0], /^\d{1,2}$/, `Minute einzeln: ${c}`);
    const min = Number(f[0]);
    assert.ok(min >= 0 && min <= 59 && min % 30 !== 0, `krumme Minute: ${c}`);
    assert.deepEqual(f.slice(1), ['*', '*', '*', '*'], `stündlich: ${c}`);
    assert.ok(!minuten.has(min), `doppelt: ${c}`);
    minuten.add(min);
  }
  const sortiert = [...minuten].sort((a, b) => a - b);
  const luecke = Math.max(...sortiert.map((m, i) => (sortiert[(i + 1) % sortiert.length] - m + 60) % 60 || 60));
  assert.ok(luecke <= 15, `größte Lücke zwischen den Minuten ${luecke}`);
  // workflow_run nennt nur Workflows, die es gibt (Name aus der Zeile name: der anderen Dateien)
  const namen = readdirSync(WF).filter(f => /\.ya?ml$/.test(f)).map(f => readFileSync(join(WF, f), 'utf8').match(/^name:\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, ''));
  const wr = text.match(/workflow_run:\s*\n\s+workflows:\s*\[([^\]]+)\]/);
  assert.ok(wr, 'workflow_run vorhanden');
  for (const n of wr[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''))) assert.ok(namen.includes(n), `Workflow „${n}“ gibt es`);
  assert.doesNotMatch(wr[1], /krypto/i);
  // Vorprüfung vor den Tests, Abruf und Speichern hängen daran
  const i = s => text.indexOf(s);
  assert.ok(i('scan/faellig.mjs') > 0 && i('scan/faellig.mjs') < i('npm test'));
  assert.equal((text.match(/steps\.faellig\.outputs\.faellig != 'false'/g) || []).length, 3);
  assert.match(text, /actions: write/);
  assert.match(text, /gh workflow run "\$1"/);
  assert.doesNotMatch(text, /secrets\.(?!NTFY_TOPIC|NTFY_TOKEN)\w+/, 'kein neues Geheimnis');
  // ${{ … }} sauber geschlossen
  assert.equal((text.match(/\$\{\{/g) || []).length, (text.match(/\}\}/g) || []).length);
});
