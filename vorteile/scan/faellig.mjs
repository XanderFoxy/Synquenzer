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
import { erinnerungFaellig, wortNeu } from './lib/merken.mjs';

export const TOLERANZ_MS = 5 * 60e3; // ein Lauf darf bis zu 5 Min. früher kommen (Zeitpläne schwanken)
// Scheitert das Senden der Zusammenfassung (ntfy weg), bleibt digestTag offen. Damit nicht jeder der vielen Starts einen
// vollen Lauf mit Commit macht, gilt sie erst eine Stunde nach dem letzten Versuch (zustand.digestVersuch) wieder als fällig.
export const DIGEST_PAUSE_MS = 60 * 60e3;

// Neuversuch nach Quellen-Fehler (MV8, 16.11.2026; Anlass Lauf 43892154739: overpass-api.de 502, Ausweich-Server Zeitlimit,
// Filialen behielten den letzten Stand, galten aber als gelaufen -> nächster Versuch erst nach 168 h).
// Behält ein Modul wegen eines Quellen-Fehlers nur den letzten Stand (Fehler in r.fehler, alte Einträge behalten,
// r.letzterStand, Absturz), merkt sich der Radar NICHT den Lauf (zustand.lauf bleibt der letzte Erfolg), sondern
// zustand.neuversuch[name] = { ab, n, seit, retryAfterS? }: Neuversuch nach 3 h, beim 2. Fehlschlag in Folge nach 6 h,
// beim 3. nach 12 h, danach im normalen Takt – nie später als der normale Takt. Verlangt die Quelle per Retry-After mehr,
// gilt das (höchstens NEUVERSUCH_MAX_STUNDEN bzw. der normale Takt, wenn der länger ist) – aber nur, wenn der Bereich
// wirklich NUR den letzten Stand behält (nurLetzterStand). Hat er frische Einträge aus anderen Quellen (Teil-Fehler), hält ein
// Retry-After einer Teilquelle ihn höchstens bis zu seinem normalen Takt an (Gegenprüfung MV8, M1: ein mydealz-Feed mit
// Retry-After 24 h hätte sonst alle Deals 24 h angehalten); die Ruhe für den Host selbst hält zustand.hostRuhe (unten) ein.
// Erfolg -> normaler Takt, Zähler weg. Geprüft wird nur bei den Starts des Radar-Zeitplans (Vorprüfung) – nie öfter.
export const NEUVERSUCH_STUFEN_STUNDEN = [3, 6, 12];
export const NEUVERSUCH_MAX_STUNDEN = 24;
const MAX_MS = NEUVERSUCH_MAX_STUNDEN * 3600e3;
const taktMs = m => (m?.intervallStunden ?? 1) * 3600e3;
const istObjekt = v => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Wartezeit (ms) bis zum Neuversuch nach dem n-ten Fehlschlag in Folge (n ab 1), retryAfterMs = Wunsch der Quelle.
 * nurLetzterStand false (Teil-Fehler, frische Einträge da): Retry-After höchstens bis zum normalen Takt.
 */
export function neuversuchWarteMs(m, n, retryAfterMs = null, { nurLetzterStand = true } = {}) {
  const takt = taktMs(m);
  const stufen = NEUVERSUCH_STUFEN_STUNDEN;
  let warte = n >= 1 && n <= stufen.length ? Math.min(stufen[n - 1] * 3600e3, takt) : takt;
  if (Number.isFinite(retryAfterMs) && retryAfterMs > warte) warte = Math.min(retryAfterMs, nurLetzterStand ? Math.max(warte, MAX_MS) : takt);
  return warte;
}

/**
 * Ergebnis eines Modul-Laufs verbuchen. ok = Quellen da (auch leer) -> zustand.lauf[name] = jetzt, Neuversuch weg.
 * ok false = nur letzter Stand / Quellen-Fehler -> zustand.lauf bleibt, zustand.neuversuch[name] = { ab, n, seit, retryAfterS? }
 * (neu: true = Modul hat noch nie Einträge geliefert, sein erster guter Lauf meldet nichts nach). Rückgabe: Neuversuch oder null.
 * nurLetzterStand false = Teil-Fehler mit frischen Einträgen (Retry-After dann höchstens bis zum Takt, neuversuchWarteMs).
 * Ein Fehlversuch VOR dem gemerkten Neuversuch (manueller Lauf „alle“) zählt keine Stufe hoch (Gegenprüfung MV8, N2): n bleibt,
 * der Neuversuch rückt nur nach hinten (Stufe ab jetzt, nie früher als bisher).
 */
export function verbucheModul(zustand, name, m, { ok, retryAfterMs = null, neu = false, nurLetzterStand = true } = {}, jetzt = new Date()) {
  const jetztMs = new Date(jetzt).getTime();
  const iso = new Date(jetztMs).toISOString();
  if (!istObjekt(zustand.lauf)) zustand.lauf = {};
  if ('neuversuch' in zustand && !istObjekt(zustand.neuversuch)) delete zustand.neuversuch; // kaputter Zustand (N3)
  if (ok) {
    zustand.lauf[name] = iso;
    if (zustand.neuversuch) {
      delete zustand.neuversuch[name];
      if (!Object.keys(zustand.neuversuch).length) delete zustand.neuversuch;
    }
    return null;
  }
  const alt = istObjekt(zustand.neuversuch?.[name]) ? zustand.neuversuch[name] : null;
  const altN = Number.isInteger(alt?.n) && alt.n > 0 ? Math.min(alt.n, 99) : 0;
  const altAb = typeof alt?.ab === 'string' ? Date.parse(alt.ab) : NaN;
  const vorzeitig = altN > 0 && Number.isFinite(altAb) && jetztMs < altAb - TOLERANZ_MS;
  const n = vorzeitig ? altN : Math.min(altN + 1, 99);
  const ra = Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? retryAfterMs : null;
  const seit = typeof alt?.seit === 'string' && Number.isFinite(Date.parse(alt.seit)) ? alt.seit : iso;
  let abMs = jetztMs + neuversuchWarteMs(m, n, ra, { nurLetzterStand });
  if (vorzeitig) abMs = Math.max(abMs, altAb);
  const nv = { ab: new Date(abMs).toISOString(), n, seit, ...(ra ? { retryAfterS: Math.round(ra / 1000) } : {}), ...(neu || (vorzeitig && alt.neu === true) ? { neu: true } : {}) };
  (zustand.neuversuch ||= {})[name] = nv;
  return nv;
}

/**
 * Gemerkte Neuversuche prüfen (Gegenprüfung MV8, N3: beschädigter Zustand). Kein einfaches Objekt -> weg; Eintrag ohne
 * lesbares ab -> weg (normaler Takt); ab weiter als max(Takt, 24 h) in der Zukunft -> gekappt; n außerhalb 1–99 -> 1.
 * Vorprüfung (main unten) und lauf() rufen es vor allem anderen auf.
 */
export function neuversuchBereinigen(cfg, zustand, jetzt = new Date()) {
  if (!zustand || !('neuversuch' in zustand)) return;
  const nv = zustand.neuversuch;
  if (!istObjekt(nv)) { delete zustand.neuversuch; return; }
  const jetztMs = new Date(jetzt).getTime();
  for (const [name, e] of Object.entries(nv)) {
    const ab = istObjekt(e) && typeof e.ab === 'string' ? Date.parse(e.ab) : NaN;
    if (!Number.isFinite(ab)) { delete nv[name]; continue; }
    const grenze = jetztMs + Math.max(taktMs(cfg?.module?.[name]), MAX_MS);
    if (ab > grenze) e.ab = new Date(grenze).toISOString();
    if (!(Number.isInteger(e.n) && e.n >= 1 && e.n <= 99)) e.n = 1;
  }
  if (!Object.keys(nv).length) delete zustand.neuversuch;
}

// Ruhe je Host (Gegenprüfung MV8, M1/N1): verlangt ein Server per Retry-After mehr als abruf.retryAfterMaxMs (60 s; kürzer
// wartet macheAbruf selbst), fragt KEIN Modul ihn vor Ablauf wieder – auch nicht im selben Lauf und auch nicht ein anderes
// Modul (Filialen und Essen teilen sich overpass-api.de). zustand.hostRuhe = { <host>: ISO-Ende }, höchstens 24 h.
// Ein Bereich mit frischen Einträgen aus anderen Quellen läuft dabei im normalen Takt weiter, nur dieser Host ruht.
export function hostRuheBereinigen(zustand, jetztMs) {
  if (!zustand || !('hostRuhe' in zustand)) return;
  const r = zustand.hostRuhe;
  if (!istObjekt(r)) { delete zustand.hostRuhe; return; }
  for (const [host, bis] of Object.entries(r)) {
    const b = typeof bis === 'string' ? Date.parse(bis) : NaN;
    if (!Number.isFinite(b) || b <= jetztMs) delete r[host];
    else if (b > jetztMs + MAX_MS) r[host] = new Date(jetztMs + MAX_MS).toISOString();
  }
  if (!Object.keys(r).length) delete zustand.hostRuhe;
}

/** Ruhe für host bis jetztMs + retryAfterMs (höchstens 24 h) merken; eine längere gemerkte Ruhe bleibt. */
export function hostRuheMerken(zustand, host, retryAfterMs, jetztMs) {
  if (!host || !Number.isFinite(retryAfterMs) || retryAfterMs <= 0) return;
  if (!istObjekt(zustand.hostRuhe)) zustand.hostRuhe = {};
  const bis = jetztMs + Math.min(retryAfterMs, MAX_MS);
  const alt = Date.parse(zustand.hostRuhe[host] || '');
  if (!(Number.isFinite(alt) && alt >= bis)) zustand.hostRuhe[host] = new Date(bis).toISOString();
}

/** Restliche Ruhe (ms) für host, 0 = darf gefragt werden */
export function hostRuheRest(zustand, host, jetztMs) {
  const b = istObjekt(zustand?.hostRuhe) && typeof zustand.hostRuhe[host] === 'string' ? Date.parse(zustand.hostRuhe[host]) : NaN;
  return Number.isFinite(b) && b > jetztMs ? b - jetztMs : 0;
}

/**
 * Übergang (MV8): Läufe vor dieser Regel haben einen Fehlversuch als „gelaufen“ gemerkt – zustand.lauf[name] ist dann genau
 * status[name].stand des Laufs, der nur den letzten Stand behielt (ok false oder Hinweis „letzter Stand“). Fehlt dazu ein
 * Neuversuch, wird er nachgetragen (1. Fehlschlag zur Zeit dieses Laufs -> ab = Lauf + 3 h). Neue Läufe merken einen
 * Fehlversuch nie als Lauf, daher greift das nur einmal. Vorprüfung (main unten) und lauf() rufen es gleich auf.
 * Rückgabe: Namen der nachgetragenen Module.
 */
export function neuversuchNachtragen(cfg, zustand, aktuell) {
  const nachgetragen = [];
  if (!zustand?.lauf || !aktuell?.status) return nachgetragen;
  for (const [name, st] of Object.entries(aktuell.status)) {
    const m = cfg?.module?.[name];
    if (!m || m.aktiv === false || !st || st.aus || zustand.neuversuch?.[name]) continue;
    if (typeof st.stand !== 'string' || zustand.lauf[name] !== st.stand || !Number.isFinite(Date.parse(st.stand))) continue;
    const nurLetzterStand = st.ok === false || (Array.isArray(st.hinweise) && st.hinweise.some(h => /letzter Stand/.test(String(h))));
    if (!nurLetzterStand) continue;
    verbucheModul(zustand, name, m, { ok: false }, new Date(st.stand));
    nachgetragen.push(name);
  }
  return nachgetragen;
}

/** Frühester Zeitpunkt (ms), ab dem das Modul wieder dran ist: Neuversuch (falls gemerkt) vor normalem Takt; 0 = sofort */
export function naechsterLaufMs(m, zuletztIso, neuversuch = null) {
  const ab = typeof neuversuch?.ab === 'string' ? Date.parse(neuversuch.ab) : NaN;
  if (Number.isFinite(ab)) return ab - TOLERANZ_MS;
  const zuletzt = zuletztIso ? Date.parse(zuletztIso) : 0;
  if (!Number.isFinite(zuletzt)) return 0;
  return zuletzt + taktMs(m) - TOLERANZ_MS;
}

/**
 * Ist das Modul `name` jetzt dran? m = cfg.module[name], zustand.lauf[name] = letzter erfolgreicher Lauf (ISO),
 * neuversuch = zustand.neuversuch[name] (nach Quellen-Fehler, geht dem normalen Takt vor).
 */
export function modulFaellig(m, zuletztIso, jetztMs, neuversuch = null) {
  if (!m || m.aktiv === false) return false;
  return jetztMs >= naechsterLaufMs(m, zuletztIso, neuversuch);
}

/**
 * Was ist in diesem Lauf zu tun? { module: [namen], digest: bool, erstlauf: bool, faellig: bool, naechstes: {name: iso} }
 * digest: die tägliche Zusammenfassung ist dran (ab digestStunde Berliner Zeit, einmal am Tag) – auch ohne fälliges Modul.
 */
export function faelligkeit(cfg, zustand, jetzt = new Date()) {
  const jetztMs = new Date(jetzt).getTime();
  const lauf = zustand?.lauf || {};
  const nv = zustand?.neuversuch || {};
  const module = [];
  const naechstes = {};
  for (const [name, m] of Object.entries(cfg.module || {})) {
    if (!m || m.aktiv === false) continue;
    if (modulFaellig(m, lauf[name], jetztMs, nv[name])) module.push(name);
    // 22.11.2026: neu gemerktes Produkt (Seite), noch nie gesucht -> Knaller gleich (wie main.lauf), außer kaufDA hat Ruhe verlangt
    else if (name === 'knaller' && !hostRuheRest(zustand || {}, 'www.kaufda.de', jetztMs) && wortNeu(cfg, zustand || {}, jetztMs)) module.push(name);
    else naechstes[name] = new Date(naechsterLaufMs(m, lauf[name], nv[name])).toISOString();
  }
  const erstlauf = !zustand?.gemeldet;
  const { tag, stunde } = berlin(new Date(jetztMs));
  const versuch = Date.parse(zustand?.digestVersuch || '');
  const digest = !erstlauf && stunde >= (cfg.ntfy?.digestStunde ?? 18) && zustand?.digestTag !== tag
    && !(Number.isFinite(versuch) && jetztMs - versuch < DIGEST_PAUSE_MS);
  // gemerkter Wochen-Knaller gilt ab heute und ist noch nicht erinnert -> laufen (sonst käme die Erinnerung erst mit dem
  // nächsten fälligen Modul)
  const erinnerung = !erstlauf && erinnerungFaellig(cfg, zustand || {}, new Date(jetztMs));
  // Dezember: Film des Tages (ab 8 Uhr, einmal am Tag) – auch ohne fälliges Modul (nimmt dann die filme.json des letzten Laufs)
  const advent = !erstlauf && adventFenster(cfg, zustand, new Date(jetztMs)).faellig;
  return { module, digest, erinnerung, advent, erstlauf, faellig: erstlauf || digest || erinnerung || advent || module.length > 0, naechstes };
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
  if (zustand) { // wie lauf(): beschädigte Einträge weg, alter Fehlversuch -> Neuversuch (nur gelesen, nicht geschrieben)
    neuversuchBereinigen(cfg, zustand, jetzt);
    neuversuchNachtragen(cfg, zustand, aktuell);
  }
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
