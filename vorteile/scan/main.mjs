#!/usr/bin/env node
// Vorteils-Radar: ruft die fälligen Module auf, führt Ergebnisse zusammen, schreibt aktuell.json und schickt Pushes.
// node scan/main.mjs [--data <ordner>] [--modus auto|digest|still] [--alle] [--fixtures] [--dry-run] [--jetzt <iso>] [--roh <ordner>]
// --roh / ROH_DIR: Roh-Mitschnitt (alle Quell-Antworten + Ergebnis in <ordner>), immer alle Module, immer ohne Push.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aufraeumen } from './lib/ende.mjs';
import { macheAbruf, macheFixtureAbruf } from './lib/http.mjs';
import { rohOrdner, macheMitschnitt } from './lib/roh.mjs';
import { tageBis } from './lib/text.mjs';
import { plane, verbuche, sende, KATEGORIEN, alsGemeldet } from './benachrichtigen.mjs';
import deals from './module/deals.mjs';
import erleben from './module/erleben.mjs';
import reisen from './module/reisen.mjs';
import musik from './module/musik.mjs';
import nebenverdienst from './module/nebenverdienst.mjs';
import tests from './module/tests.mjs';
import praemien from './module/praemien.mjs';
import filme from './module/filme.mjs';
import remix from './module/remix.mjs';
import auftritte from './module/auftritte.mjs';
import unterricht from './module/unterricht.mjs';
import { FIXTURE_KARTE } from './test/fixtures/karte.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const MODULE = { deals, erleben, reisen, musik, nebenverdienst, tests, praemien, filme, remix, auftritte, unterricht };
// Fundorte (Remix/Auftritte/Unterricht) haben kein Datum und bleiben immer stehen
const MAX_ALTER_TAGE = { deals: 7, erleben: 21, reisen: 5, musik: 30, nebenverdienst: 21, tests: 21, praemien: 14, filme: 3, remix: 45, auftritte: 60, unterricht: 30 };

const mitZeitlimit = (p, ms, name) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${name}: Zeitlimit`)), ms).unref())]);

/**
 * Ein kompletter Lauf ohne Dateizugriff (testbar).
 * filmListen = vorteile/filme.json, dateienVorher = { <modul>: alte eigene Datei } (z. B. filme.json des letzten Laufs).
 * Ergebnis „dateien“: eigene Dateien der Module, die in diesem Lauf gelaufen sind ({ filme: {...} } -> <data>/filme.json);
 * ein übersprungenes oder abgestürztes Modul liefert keine -> die alte Datei bleibt stehen.
 */
export async function lauf({ cfg, wunschliste, filmListen = null, dateienVorher = {}, vorher, zustand, holeText, env = {}, jetzt = new Date(), alle = false, log = () => {} }) {
  const jetztMs = new Date(jetzt).getTime();
  zustand ||= {};
  zustand.lauf ||= {};
  const kategorien = {};
  const status = {};
  const dateien = {};
  const neueModule = [];
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
      const r = await mitZeitlimit(fn({ holeText, cfg, wunschliste, zustand, env, jetzt, filmListen, vorherDatei: dateienVorher?.[name] ?? null }), 240000, name);
      if (r.datei) dateien[name] = r.datei;
      // komplett kaputte Quelle -> alte Einträge behalten statt leere Liste (Remix/Auftritte/Unterricht: nur Fundorte
      // übrig und Fehler da = alle frischen Quellen tot -> alter Stand bleibt, statt nur die Fundorte zu zeigen)
      const nurFundorte = r.eintraege.length > 0 && r.eintraege.every(e => e.extra?.fundort);
      const kaputt = (!r.eintraege.length || nurFundorte) && r.fehler.length > 0 && alt.length > 0
        ? true : !r.eintraege.length && r.fehler.length > 0;
      // Fundorte immer frisch aus der config (Link-Prüfung, Saison, neue/gestrichene Adressen), nur die alten Funde bleiben
      kategorien[name] = kaputt && nurFundorte ? [...alt.filter(e => !e.extra?.fundort), ...r.eintraege] : kaputt ? alt : r.eintraege;
      // gesperrt (HTTP 401): Quelle still aus, zählt nicht als Fehler
      status[name] = { ok: !r.fehler.length, anzahl: r.eintraege.length, fehler: r.fehler.slice(0, 10), ms: Date.now() - t0, stand: new Date(jetztMs).toISOString(), ...(r.hinweise?.length ? { hinweise: r.hinweise.slice(0, 10) } : {}), ...(r.gesperrt?.length ? { gesperrt: r.gesperrt.slice(0, 10) } : {}) };
      if (!zustand.lauf[name] && zustand.gemeldet && !kaputt) neueModule.push(name);
      zustand.lauf[name] = new Date(jetztMs).toISOString();
    } catch (e) {
      kategorien[name] = alt;
      status[name] = { ok: false, anzahl: 0, fehler: [String(e.message || e)], ms: Date.now() - t0 };
    }
    log(`${name}: ${status[name].ok ? 'ok' : 'FEHLER'} ${kategorien[name].length} Einträge ${(status[name].fehler || []).slice(0, 2).join(' | ')}`);
  }
  // Enddaten: was vorbei ist (bis/sichtbarBis), fliegt raus – auch Übernommenes; gleicher Link nur in einer Kategorie
  aufraeumen(kategorien, new Date(jetztMs));

  // abgelaufene Fristen und zu alte Einträge raus, sortieren
  for (const [name, liste] of Object.entries(kategorien)) {
    kategorien[name] = liste
      .filter(e => !(e.frist && tageBis(e.frist, new Date(jetztMs)) < 0))
      // bekanntes Ende in der Zukunft geht vor dem Alter (Audius-Contest vom 17.09. mit Einsendeschluss 01.12., Lauf 08.11.2026)
      .filter(e => !e.datum || (e.bis && Date.parse(e.bis) >= jetztMs) || (jetztMs - Date.parse(e.datum)) / 864e5 <= (MAX_ALTER_TAGE[name] ?? 21))
      .sort((a, b) => (b.extra?.sortWert ?? b.wert) - (a.extra?.sortWert ?? a.wert))
      .slice(0, 40);
  }
  // Neues Modul in einem laufenden Radar: beim ersten Lauf nichts nachmelden (keine Push-Flut), nur auf der Seite zeigen
  for (const name of neueModule) alsGemeldet(zustand, kategorien[name], new Date(jetztMs));
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
  return { aktuell, zustand, alleEintraege, dateien };
}

function arg(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
async function leseJson(pfad, fallback) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return fallback; } }

// test: { fetchImpl, abruf } nur für Tests (eigenes fetch, z. B. ohne Pause)
export async function main(args = process.argv.slice(2), env = process.env, test = {}) {
  const fixtures = args.includes('--fixtures');
  const rohDir = rohOrdner(args, env);
  // Roh-Modus ist immer ein Probelauf: keine Pushes (der Workflow schreibt dann auch nichts auf den Daten-Zweig)
  const dryRun = fixtures || !!rohDir || args.includes('--dry-run') || env.DRY_RUN === '1';
  const roh = rohDir ? macheMitschnitt(rohDir, { projekt: 'vorteile', env }) : null;
  const basis = resolve(HIER, '..');
  const daten = resolve(arg(args, '--data') || env.VORTEILE_DATA || join(basis, 'data'));
  const cfg = JSON.parse(await readFile(join(basis, 'config.json'), 'utf8'));
  if (env.NTFY_TOPIC) cfg.ntfy.topic = env.NTFY_TOPIC;
  const wunschliste = JSON.parse(await readFile(join(basis, 'wunschliste.json'), 'utf8'));
  const filmListen = await leseJson(join(basis, 'filme.json'), null);
  const vorher = await leseJson(join(daten, 'aktuell.json'), null);
  const dateienVorher = { filme: await leseJson(join(daten, 'filme.json'), null) };
  const zustand = await leseJson(join(daten, 'zustand.json'), {});
  const fetchImpl = roh ? roh.fetch(test.fetchImpl) : test.fetchImpl;
  const holeText = fixtures ? macheFixtureAbruf(join(HIER, 'test', 'fixtures'), FIXTURE_KARTE) : macheAbruf({ ...cfg.abruf, ...test.abruf }, fetchImpl);
  const jetzt = arg(args, '--jetzt') ? new Date(arg(args, '--jetzt')) : new Date();
  const modus = arg(args, '--modus') || env.MODUS || 'auto';

  let r;
  try { r = await lauf({ cfg, wunschliste, filmListen, dateienVorher, vorher, zustand, holeText, env, jetzt, alle: fixtures || !!rohDir || args.includes('--alle'), log: console.log }); }
  catch (e) { roh?.abschluss({ absturz: String(e?.message || e) }); throw e; }
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
  // eigene Dateien der Module (filme.json); nicht gelaufen -> alte Datei bleibt
  for (const [name, inhalt] of Object.entries(r.dateien || {})) await writeFile(join(daten, `${name}.json`), JSON.stringify(inhalt) + '\n');
  if (roh) {
    roh.ausgabe('aktuell.json', JSON.stringify(r.aktuell, null, 1) + '\n');
    roh.ausgabe('zustand.json', JSON.stringify(r.zustand) + '\n');
    for (const [name, inhalt] of Object.entries(r.dateien || {})) roh.ausgabe(`${name}.json`, JSON.stringify(inhalt) + '\n');
    roh.ausgabe('pushes.json', { sofort: plan.sofort.map(s => s.msg), digest: plan.digest?.msg || null, modus: erstlauf ? 'still' : modus });
    roh.abschluss({ dryRun: true, eintraege: r.alleEintraege.length, sofort: plan.sofort.length, digest: !!plan.digest });
    console.log(`Roh-Mitschnitt: ${roh.abrufe.length} Abrufe → ${roh.dir}`);
  }
  console.log(`${r.alleEintraege.length} Einträge, ${plan.sofort.length} Sofort-Pushes, Zusammenfassung: ${plan.digest ? plan.digest.liste.length + ' Einträge' : 'nein'}${dryRun ? ' (dry-run)' : ''} → ${daten}`);
  return { ...r, plan, ok };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
