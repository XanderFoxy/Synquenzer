#!/usr/bin/env node
// Fälligkeit (MV7, 14.11.2026): GitHub startet geplante Läufe nur alle paar Stunden (gemessen 31.10.–14.11.2026:
// 53 von 335 stündlichen Läufen = 16 %). Der Wecker hat deshalb viele Zeitpläne zu krummen Minuten; jeder Start fragt
// zuerst hier nach, ob überhaupt etwas zu tun ist – sonst endet er nach Sekunden ohne Abruf und ohne Daten-Commit.
// Dieselbe Regel nutzt main.mjs (lauf), damit Vorprüfung und echter Lauf nie verschieden entscheiden.
// node scan/faellig.mjs --data <ordner> [--jetzt <iso>]  -> JSON auf stdout, faellig=true|false in $GITHUB_OUTPUT
import { readFile, appendFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { berlin, adventFenster } from './benachrichtigen.mjs';

export const TOLERANZ_MS = 5 * 60e3; // ein Lauf darf bis zu 5 Min. früher kommen (Zeitpläne schwanken)
// Scheitert das Senden der Zusammenfassung (ntfy weg), bleibt digestTag offen. Damit nicht jeder der vielen Starts einen
// vollen Lauf mit Commit macht, gilt sie erst eine Stunde nach dem letzten Versuch (zustand.digestVersuch) wieder als fällig.
export const DIGEST_PAUSE_MS = 60 * 60e3;

/** Ist das Modul `name` jetzt dran? m = cfg.module[name], zustand.lauf[name] = letzter erfolgreicher Lauf (ISO). */
export function modulFaellig(m, zuletztIso, jetztMs) {
  if (!m || m.aktiv === false) return false;
  const zuletzt = zuletztIso ? Date.parse(zuletztIso) : 0;
  if (!Number.isFinite(zuletzt)) return true;
  return jetztMs - zuletzt >= (m.intervallStunden ?? 1) * 3600e3 - TOLERANZ_MS;
}

/**
 * Was ist in diesem Lauf zu tun? { module: [namen], digest: bool, erstlauf: bool, faellig: bool, naechstes: {name: iso} }
 * digest: die tägliche Zusammenfassung ist dran (ab digestStunde Berliner Zeit, einmal am Tag) – auch ohne fälliges Modul.
 */
export function faelligkeit(cfg, zustand, jetzt = new Date()) {
  const jetztMs = new Date(jetzt).getTime();
  const lauf = zustand?.lauf || {};
  const module = [];
  const naechstes = {};
  for (const [name, m] of Object.entries(cfg.module || {})) {
    if (!m || m.aktiv === false) continue;
    if (modulFaellig(m, lauf[name], jetztMs)) module.push(name);
    else naechstes[name] = new Date(Date.parse(lauf[name]) + (m.intervallStunden ?? 1) * 3600e3 - TOLERANZ_MS).toISOString();
  }
  const erstlauf = !zustand?.gemeldet;
  const { tag, stunde } = berlin(new Date(jetztMs));
  const versuch = Date.parse(zustand?.digestVersuch || '');
  const digest = !erstlauf && stunde >= (cfg.ntfy?.digestStunde ?? 18) && zustand?.digestTag !== tag
    && !(Number.isFinite(versuch) && jetztMs - versuch < DIGEST_PAUSE_MS);
  // Dezember: Film des Tages (ab 8 Uhr, einmal am Tag) – auch ohne fälliges Modul (nimmt dann die filme.json des letzten Laufs)
  const advent = !erstlauf && adventFenster(cfg, zustand, new Date(jetztMs)).faellig;
  return { module, digest, advent, erstlauf, faellig: erstlauf || digest || advent || module.length > 0, naechstes };
}

async function leseJson(pfad, fallback) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return fallback; } }

export async function main(args = process.argv.slice(2), env = process.env) {
  const arg = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const basis = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const cfg = JSON.parse(await readFile(join(basis, 'config.json'), 'utf8'));
  const daten = resolve(arg('--data') || env.VORTEILE_DATA || join(basis, 'data'));
  const zustand = await leseJson(join(daten, 'zustand.json'), null);
  const aktuell = await leseJson(join(daten, 'aktuell.json'), null);
  const jetzt = arg('--jetzt') ? new Date(arg('--jetzt')) : new Date();
  const f = faelligkeit(cfg, zustand || {}, jetzt);
  // keine Daten (neuer Zweig, kaputte Datei) -> immer laufen
  if (!zustand || !aktuell) f.faellig = true;
  console.log(JSON.stringify({ ...f, zuletzt: aktuell?.aktualisiert || null }));
  if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `faellig=${f.faellig}\nmodule=${f.module.join(',')}\n`);
  return f;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
