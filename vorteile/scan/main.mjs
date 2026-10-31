#!/usr/bin/env node
// Vorteils-Radar: ruft die fälligen Module auf, führt Ergebnisse zusammen, schreibt aktuell.json und schickt Pushes.
// node scan/main.mjs [--data <ordner>] [--modus auto|digest|still] [--alle] [--fixtures] [--dry-run] [--jetzt <iso>]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheAbruf, macheFixtureAbruf } from './lib/http.mjs';
import { tageBis } from './lib/text.mjs';
import { plane, verbuche, sende, KATEGORIEN } from './benachrichtigen.mjs';
import deals from './module/deals.mjs';
import erleben from './module/erleben.mjs';
import reisen from './module/reisen.mjs';
import musik from './module/musik.mjs';
import nebenverdienst from './module/nebenverdienst.mjs';
import tests from './module/tests.mjs';
import { FIXTURE_KARTE } from './test/fixtures/karte.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const MODULE = { deals, erleben, reisen, musik, nebenverdienst, tests };
const MAX_ALTER_TAGE = { deals: 7, erleben: 21, reisen: 5, musik: 30, nebenverdienst: 21, tests: 21 };

const mitZeitlimit = (p, ms, name) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${name}: Zeitlimit`)), ms).unref())]);

/** Ein kompletter Lauf ohne Dateizugriff (testbar). */
export async function lauf({ cfg, wunschliste, vorher, zustand, holeText, env = {}, jetzt = new Date(), alle = false, log = () => {} }) {
  const jetztMs = new Date(jetzt).getTime();
  zustand ||= {};
  zustand.lauf ||= {};
  const kategorien = {};
  const status = {};
  for (const [name, fn] of Object.entries(MODULE)) {
    const m = cfg.module[name];
    const alt = vorher?.kategorien?.[name] || [];
    if (!m || m.aktiv === false) { kategorien[name] = []; status[name] = { ok: true, aus: true }; continue; }
    const zuletzt = zustand.lauf[name] ? Date.parse(zustand.lauf[name]) : 0;
    const faellig = alle || jetztMs - zuletzt >= (m.intervallStunden ?? 1) * 3600e3 - 5 * 60e3;
    if (!faellig) {
      kategorien[name] = alt;
      status[name] = { ...(vorher?.status?.[name] || {}), uebersprungen: true };
      continue;
    }
    const t0 = Date.now();
    try {
      const r = await mitZeitlimit(fn({ holeText, cfg, wunschliste, zustand, env, jetzt }), 240000, name);
      // komplett kaputte Quelle -> alte Einträge behalten statt leere Liste
      const kaputt = !r.eintraege.length && r.fehler.length > 0;
      kategorien[name] = kaputt ? alt : r.eintraege;
      status[name] = { ok: !r.fehler.length, anzahl: r.eintraege.length, fehler: r.fehler.slice(0, 10), ms: Date.now() - t0, stand: new Date(jetztMs).toISOString() };
      zustand.lauf[name] = new Date(jetztMs).toISOString();
    } catch (e) {
      kategorien[name] = alt;
      status[name] = { ok: false, anzahl: 0, fehler: [String(e.message || e)], ms: Date.now() - t0 };
    }
    log(`${name}: ${status[name].ok ? 'ok' : 'FEHLER'} ${kategorien[name].length} Einträge ${(status[name].fehler || []).slice(0, 2).join(' | ')}`);
  }
  // abgelaufene Fristen und zu alte Einträge raus, sortieren
  for (const [name, liste] of Object.entries(kategorien)) {
    kategorien[name] = liste
      .filter(e => !(e.frist && tageBis(e.frist, new Date(jetztMs)) < 0))
      .filter(e => !e.datum || (jetztMs - Date.parse(e.datum)) / 864e5 <= (MAX_ALTER_TAGE[name] ?? 21))
      .sort((a, b) => b.wert - a.wert)
      .slice(0, 40);
  }
  const alleEintraege = Object.values(kategorien).flat();
  const aktuell = {
    version: 1,
    aktualisiert: new Date(jetztMs).toISOString(),
    ort: cfg.ort,
    namen: KATEGORIEN,
    sofort: alleEintraege.filter(e => e.sofort).sort((a, b) => b.wert - a.wert).map(e => e.id),
    kategorien,
    status,
  };
  return { aktuell, zustand, alleEintraege };
}

function arg(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
async function leseJson(pfad, fallback) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return fallback; } }

export async function main(args = process.argv.slice(2), env = process.env) {
  const fixtures = args.includes('--fixtures');
  const dryRun = fixtures || args.includes('--dry-run') || env.DRY_RUN === '1';
  const basis = resolve(HIER, '..');
  const daten = resolve(arg(args, '--data') || env.VORTEILE_DATA || join(basis, 'data'));
  const cfg = JSON.parse(await readFile(join(basis, 'config.json'), 'utf8'));
  if (env.NTFY_TOPIC) cfg.ntfy.topic = env.NTFY_TOPIC;
  const wunschliste = JSON.parse(await readFile(join(basis, 'wunschliste.json'), 'utf8'));
  const vorher = await leseJson(join(daten, 'aktuell.json'), null);
  const zustand = await leseJson(join(daten, 'zustand.json'), {});
  const holeText = fixtures ? macheFixtureAbruf(join(HIER, 'test', 'fixtures'), FIXTURE_KARTE) : macheAbruf(cfg.abruf);
  const jetzt = arg(args, '--jetzt') ? new Date(arg(args, '--jetzt')) : new Date();
  const modus = arg(args, '--modus') || env.MODUS || 'auto';

  const r = await lauf({ cfg, wunschliste, vorher, zustand, holeText, env, jetzt, alle: fixtures || args.includes('--alle'), log: console.log });
  // Erster Lauf überhaupt: nichts nachmelden, nur einmal Bescheid geben (kein Push-Gewitter)
  const erstlauf = !zustand.gemeldet;
  const plan = plane({ eintraege: r.alleEintraege, zustand: r.zustand, cfg, jetzt, modus: erstlauf ? 'still' : modus });
  const ok = { sofort: [], digest: false };
  const token = env.NTFY_TOKEN;
  for (const s of plan.sofort) ok.sofort.push(await sende(s.msg, cfg, { dryRun, token }));
  if (plan.digest) ok.digest = await sende(plan.digest.msg, cfg, { dryRun, token });
  if (erstlauf) {
    for (const e of r.alleEintraege) (r.zustand.gemeldet ||= {})[e.id] = r.aktuell.aktualisiert;
    r.zustand.gemeldet ||= {};
    await sende({ topic: cfg.ntfy.topic, title: 'Vorteils-Radar ist aktiv', message: `${r.alleEintraege.length} Vorteile gefunden. Ab jetzt: Seltenes sofort, der Rest einmal am Tag.`, click: cfg.seite, tags: ['sparkles'], priority: 3 }, cfg, { dryRun, token });
  }
  verbuche(r.zustand, plan, ok, jetzt);

  await mkdir(daten, { recursive: true });
  await writeFile(join(daten, 'aktuell.json'), JSON.stringify(r.aktuell, null, 1) + '\n');
  await writeFile(join(daten, 'zustand.json'), JSON.stringify(r.zustand) + '\n');
  console.log(`${r.alleEintraege.length} Einträge, ${plan.sofort.length} Sofort-Pushes, Zusammenfassung: ${plan.digest ? plan.digest.liste.length + ' Einträge' : 'nein'}${dryRun ? ' (dry-run)' : ''} → ${daten}`);
  return { ...r, plan, ok };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
