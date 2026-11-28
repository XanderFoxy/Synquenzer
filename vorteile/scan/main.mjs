#!/usr/bin/env node
// Vorteils-Radar: ruft die fälligen Module auf, führt Ergebnisse zusammen, schreibt aktuell.json und schickt Pushes.
// node scan/main.mjs [--data <ordner>] [--modus auto|digest|still] [--alle] [--fixtures] [--dry-run] [--jetzt <iso>] [--roh <ordner>]
// --roh / ROH_DIR: Roh-Mitschnitt (alle Quell-Antworten + Ergebnis in <ordner>), immer alle Module, immer ohne Push.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aufraeumen } from './lib/ende.mjs';
import { macheAbruf, macheFixtureAbruf } from './lib/http.mjs';
import { macheRegelWache, agentAus, agbGrund, REGEL_TEXT, regelQuellen } from './lib/robots.mjs';
import { schnittstellenPausen, cacheAufraeumen } from './lib/schnittstellen.mjs';
import { rohOrdner, macheMitschnitt } from './lib/roh.mjs';
import { tageBis } from './lib/text.mjs';
import { modulFaellig, verbucheModul, neuversuchNachtragen, neuversuchBereinigen, hostRuheBereinigen, hostRuheMerken, hostRuheRest } from './faellig.mjs';
import { plane, verbuche, sende, KATEGORIEN, alsGemeldet, planeAdvent, verbucheAdvent } from './benachrichtigen.mjs';
import deals from './module/deals.mjs';
import erleben from './module/erleben.mjs';
import reisen from './module/reisen.mjs';
import musik from './module/musik.mjs';
import nebenverdienst from './module/nebenverdienst.mjs';
import tests from './module/tests.mjs';
import praemien from './module/praemien.mjs';
import filme from './module/filme.mjs';
import filmkatalog from './module/filmkatalog.mjs';
import musikstore from './module/musikstore.mjs';
import remix from './module/remix.mjs';
import auftritte from './module/auftritte.mjs';
import unterricht from './module/unterricht.mjs';
import knaller from './module/knaller.mjs';
import essen from './module/essen.mjs';
import filialen from './module/filialen.mjs';
import events from './module/events.mjs';
import auftraege from './module/auftraege.mjs';
import { FIXTURE_KARTE } from './test/fixtures/karte.mjs';
import { holeMerkliste, faelligeErinnerungen, erinnerungNachricht, verbucheErinnerung, wortNeu } from './lib/merken.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
// filialen vor knaller: der Knaller nimmt die frische Filial-Liste (nächste Filiale je Markt von Döbeln, wenn kaufDA keine nennt)
// filmkatalog/musikstore (28.11.2026) nach filme: die Chart-Adressen, die „filme“ schon geholt hat, sind im Lauf gemerkt (kein
// zweiter Abruf), und „filme“ hat seine Suchen vor ihnen (gemeinsame Obergrenze der Apple-Schnittstelle je Lauf)
export const MODULE = { deals, erleben, reisen, musik, nebenverdienst, tests, praemien, filme, musikstore, filmkatalog, remix, auftritte, unterricht, filialen, knaller, essen, events, auftraege };
// Fundorte (Remix/Auftritte/Unterricht) haben kein Datum und bleiben immer stehen
const MAX_ALTER_TAGE = { filialen: 30, essen: 1, knaller: 7, deals: 7, erleben: 21, reisen: 5, musik: 30, nebenverdienst: 21, tests: 21, praemien: 14, filme: 3, musikstore: 3, filmkatalog: 3, remix: 45, auftritte: 60, unterricht: 30, events: 14, auftraege: 21 };

const mitZeitlimit = (p, ms, name) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${name}: Zeitlimit`)), ms).unref())]);

/**
 * Ein kompletter Lauf ohne Dateizugriff (testbar).
 * filmListen = vorteile/filme.json, dateienVorher = { <modul>: alte eigene Datei } (z. B. filme.json des letzten Laufs).
 * Ergebnis „dateien“: eigene Dateien der Module, die in diesem Lauf gelaufen sind ({ filme: {...} } -> <data>/filme.json);
 * ein übersprungenes oder abgestürztes Modul liefert keine -> die alte Datei bleibt stehen.
 */
// schnittstellenCache: gemerkte Antworten der Programm-Schnittstellen nutzen (lib/schnittstellen.mjs) – nur echte Läufe (main),
// nicht Roh-Läufe (die sollen jede Antwort frisch mitschneiden) und nicht Tests
export async function lauf({ cfg, wunschliste, filmListen = null, essenListen = null, musikListe = null, dateienVorher = {}, vorher, zustand, holeText: holeRoh, env = {}, jetzt = new Date(), alle = false, log = () => {}, regelWache = true, schnittstellenCache = false, schnittstellen = undefined }) {
  const jetztMs = new Date(jetzt).getTime();
  zustand ||= {};
  if (!zustand.lauf || typeof zustand.lauf !== 'object' || Array.isArray(zustand.lauf)) zustand.lauf = {};
  // beschädigte Neuversuche/Host-Ruhen weg bzw. gekappt (Gegenprüfung MV8, N3), abgelaufene Host-Ruhen weg
  neuversuchBereinigen(cfg, zustand, new Date(jetztMs));
  hostRuheBereinigen(zustand, jetztMs);
  // Übergang MV8: Fehlversuch aus der Zeit vor der Neuversuch-Regel (als „gelaufen“ gemerkt) -> Neuversuch nachtragen
  const nachgetragen = neuversuchNachtragen(cfg, zustand, vorher);
  if (nachgetragen.length) log(`Neuversuch nachgetragen (alter Fehlversuch): ${nachgetragen.join(', ')}`);
  // Regel-Wache (MV6, 16.11.2026): JEDER Abruf eines Moduls geht erst durch Nutzungsbedingungen (abruf.agbVerbot: gar kein
  // Abruf) und robots.txt des Hosts (vor dem ersten Abruf je Host; verboten -> Quelle übersprungen + Hinweis, keine Störung).
  // Anlass: Bereich Unterricht las Reddit (robots.txt „Disallow: /“, HTTP 429) und Freelancer.com (AGB) ohne diese Prüfung.
  const holeText = regelWache === false ? holeRoh : macheRegelWache(holeRoh, {
    zustand, agent: agentAus(cfg.abruf?.userAgent) || 'meinvorteil-radar', jetzt: new Date(jetztMs),
    agbVerbot: cfg.abruf?.agbVerbot || [], robots: cfg.abruf?.robotsPruefen !== false, ausnahmen: cfg.abruf?.robotsAusnahmen || [],
    cache: schnittstellenCache, // Programm-Schnittstellen (MV7): Ausnahme von der robots-Regel nur für die Pfade in lib/schnittstellen.mjs
    ...(schnittstellen ? { schnittstellen } : {}), // nur Tests: [] = ohne Ausnahme (reine robots-Regel)
  });
  const wache = holeText.wache || null;
  // Retry-After je Modul (MV8): macheAbruf hängt den Wunsch der Quelle an den Fehler (e.retryAfterMs); behält das Modul
  // deswegen nur den letzten Stand, wartet der Neuversuch mindestens so lange (faellig.mjs, verbucheModul).
  // Ruhe je Host (Gegenprüfung MV8, M1/N1): Retry-After über abruf.retryAfterMaxMs (60 s) -> zustand.hostRuhe; bis dahin fragt
  // kein Modul diesen Host (auch nicht im selben Lauf), die übrigen Quellen eines Bereichs laufen normal weiter.
  // Eine Funktion für alle Module (wie wache.modul): gleiche holeText-Funktion = gemeinsamer Feed-Speicher (gemeinsam.mjs)
  const retryAfter = new Map();
  let modulJetzt = null;
  const t0Lauf = Date.now();
  const nun = () => jetztMs + (Date.now() - t0Lauf); // Lauf-Zeit + Dauer bis hier (Ruhe zählt ab der echten Antwort)
  const ruheAb = cfg.abruf?.retryAfterMaxMs ?? 60000;
  const merkeRa = (name, ms) => { if (name) retryAfter.set(name, Math.max(retryAfter.get(name) || 0, ms)); };
  const holeModul = Object.assign(async (url, opts) => {
    const name = modulJetzt;
    let host = null;
    try { host = new URL(url).host.toLowerCase(); } catch { /* keine Adresse: holeText meldet den Fehler */ }
    const rest = host ? hostRuheRest(zustand, host, nun()) : 0;
    if (rest > 0) {
      merkeRa(name, rest);
      throw Object.assign(new Error(`${host} bat um Pause (Retry-After) bis ${new Date(nun() + rest).toISOString().slice(0, 16).replace('T', ' ')} UTC`), { retryAfterMs: rest, hostRuhe: true });
    }
    try { return await holeText(url, opts); }
    catch (e) {
      if (Number.isFinite(e?.retryAfterMs) && e.retryAfterMs > 0) {
        merkeRa(name, e.retryAfterMs);
        if (host && e.retryAfterMs > ruheAb) hostRuheMerken(zustand, host, e.retryAfterMs, nun());
      }
      throw e;
    }
  }, { wache });
  const kategorien = {};
  const status = {};
  const dateien = {};
  const neueModule = [];
  // Gemerkte Wochen-Knaller und Produkte (lib/merken.mjs): Merkliste der Seite holen (ntfy-Thema) – jeder Lauf, VOR den Modulen
  // (22.11.2026): ein neu gemerktes Produkt sucht der Knaller so schon in diesem Lauf, nicht erst im nächsten 6-h-Takt
  const knallerAn = !!(cfg.module?.knaller && cfg.module.knaller.aktiv !== false);
  let merkStatus = null;
  if (knallerAn) {
    try { merkStatus = await holeMerkliste({ holeText, cfg, zustand, jetzt: new Date(jetztMs) }); } catch (e) { merkStatus = { ok: false, fehler: String(e?.message || e).slice(0, 120) }; }
  }
  for (const [name, fn] of Object.entries(MODULE)) {
    const m = cfg.module[name];
    // Prüfer R6 (Befund 1): gefundene Beiträge (keine Fundort-Links) von Hosts mit Nutzungsbedingungs-Verbot nicht aus dem
    // letzten Stand übernehmen – auch nicht, wenn das Modul diesmal nicht dran ist oder abstürzt
    const alt = (vorher?.kategorien?.[name] || []).filter(e => !(e?.extra?.gesuch && !e.extra.fundort && agbGrund(e.link, cfg.abruf?.agbVerbot || [])));
    if (!m || m.aktiv === false) { kategorien[name] = []; status[name] = { ok: true, aus: true }; continue; }
    const nv = zustand.neuversuch?.[name] || null;
    // gleiche Regel wie die Vorprüfung im Workflow (faellig.mjs); Knaller auch, wenn ein gemerktes Produkt noch nie gesucht wurde
    const faellig = alle || modulFaellig(m, zustand.lauf[name], jetztMs, nv) || (name === 'knaller' && !hostRuheRest(zustand, 'www.kaufda.de', jetztMs) && wortNeu(cfg, zustand, jetztMs));
    if (!faellig) {
      kategorien[name] = alt;
      status[name] = { ...(vorher?.status?.[name] || {}), uebersprungen: true };
      continue;
    }
    const t0 = Date.now();
    if (wache) wache.modul = name;
    modulJetzt = name;
    // noch nie gelaufen (kein Erfolg, kein Fehlversuch mit Einträgen): erster guter Lauf meldet nichts nach (keine Push-Flut)
    const nieGelaufen = !zustand.lauf[name] && (!nv || nv.neu === true);
    try {
      const filialenDatei = dateien.filialen || dateienVorher?.filialen || null;
      // Filme (28.11.2026): filme.json nennt die Zahlen von Katalog und Musik (letzter Stand), der Katalog liest die Boxen aus filme.json
      const filmeDatei = dateien.filme || dateienVorher?.filme || null;
      const katalogDatei = dateien.filmkatalog || dateienVorher?.filmkatalog || null;
      const musikDatei = dateien.musikstore || dateienVorher?.musikstore || null;
      const r = await mitZeitlimit(fn({ holeText: holeModul, cfg, wunschliste, zustand, env, jetzt, filmListen, essenListen, musikListe, filialenDatei, filmeDatei, katalogDatei, musikDatei, vorherDatei: dateienVorher?.[name] ?? null }), 240000, name);
      if (r.datei) dateien[name] = r.datei;
      // Regel-Sperren (AGB/robots.txt) sind keine Störung: aus den Fehlern in die Hinweise, je Host ein Satz
      const gesperrt = [...(wache?.jeModul.get(name)?.values() || [])].map(g => `${g.regel === 'agb' ? 'Nutzungsbedingungen' : 'robots.txt'} von ${g.host}: nicht gelesen – ${g.grund}`);
      r.fehler = (r.fehler || []).filter(f => !REGEL_TEXT.test(String(f)));
      r.hinweise = [...new Set([...gesperrt, ...(r.hinweise || []).filter(h => !gesperrt.some(g => String(h).includes(g)))])];
      // komplett kaputte Quelle -> alte Einträge behalten statt leere Liste (Remix/Auftritte/Unterricht: nur Fundorte
      // übrig und Fehler da = alle frischen Quellen tot -> alter Stand bleibt, statt nur die Fundorte zu zeigen)
      const nurFundorte = r.eintraege.length > 0 && r.eintraege.every(e => e.extra?.fundort);
      const kaputt = (!r.eintraege.length || nurFundorte) && r.fehler.length > 0 && alt.length > 0
        ? true : !r.eintraege.length && r.fehler.length > 0;
      // Fundorte immer frisch aus der config (Link-Prüfung, Saison, neue/gestrichene Adressen), nur die alten Funde bleiben.
      // Gesuche (Unterricht) nicht: die merkt sich gesuche.mjs selbst im Zustand und prüft sie jeden Lauf neu – ein alter
      // Fehltreffer (E-Mail-Vorlagen, 14.11.2026) bliebe sonst bis zu seinem Sichtbar-Ende stehen, wenn Remotive/News ausfallen
      kategorien[name] = kaputt && nurFundorte ? [...alt.filter(e => !e.extra?.fundort && !e.extra?.gesuch), ...r.eintraege] : kaputt ? alt : r.eintraege;
      // gesperrt (HTTP 401): Quelle still aus, zählt nicht als Fehler
      // zahl: eigene Datei statt Einträge (Filialen, Wochen-Knaller, Essen, Ausflüge) -> „1468 Filialen“ statt „0 gefunden“
      // quellen: je Host „Schnittstelle“ (Ausnahme, MV7) bzw. „gesperrt“ (AGB/robots.txt) – für die Quellen-Liste der Seite
      const quellen = regelQuellen(wache, name);
      // Module, die eine gesperrte Quelle schon selbst auslassen (Nebenverdienst: Freelancer.com), melden sie in r.regelSperren
      for (const h of [].concat(r.regelSperren || [])) if (typeof h === 'string' && quellen.length < 10 && !quellen.some(q => q.host === h)) quellen.push({ host: h, art: 'gesperrt' });
      status[name] = { ok: !r.fehler.length, anzahl: r.eintraege.length, ...(quellen.length ? { quellen } : {}), ...(r.zahl && Number.isFinite(r.zahl.n) ? { zahl: { n: r.zahl.n, wort: String(r.zahl.wort || '').slice(0, 30) } } : {}), fehler: r.fehler.slice(0, 10), ms: Date.now() - t0, stand: new Date(jetztMs).toISOString(), ...(r.hinweise?.length ? { hinweise: r.hinweise.slice(0, 10) } : {}), ...(r.gesperrt?.length ? { gesperrt: r.gesperrt.slice(0, 10) } : {}), ...(r.kurz ? { kurz: r.kurz } : {}) };
      if (nieGelaufen && zustand.gemeldet && !kaputt) neueModule.push(name);
      // Quellen-Fehler, nur letzter Stand (alte Einträge/alte Datei) -> Neuversuch statt „gelaufen“ (MV8, faellig.mjs).
      // r.letzterStand: das Modul behält selbst den letzten Stand und meldet das nur als Hinweis (Filialen, Essen-OSM)
      const fehlversuch = kaputt || r.fehler.length > 0 || r.letzterStand === true;
      // nur letzter Stand = nichts Frisches (kaputt, oder letzterStand ohne Einträge/Datei wie Filialen). Sonst (Teil-Fehler,
      // Essen mit altem OSM-Stand) hält ein Retry-After den Bereich höchstens bis zu seinem Takt an (Gegenprüfung MV8, M1)
      const nurLetzterStand = kaputt || (r.letzterStand === true && !r.eintraege.length && !r.datei);
      const nvNeu = verbucheModul(zustand, name, m, { ok: !fehlversuch, retryAfterMs: retryAfter.get(name), neu: nieGelaufen && kaputt, nurLetzterStand }, new Date(jetztMs));
      if (nvNeu) status[name].neuversuch = nvNeu.ab;
    } catch (e) {
      const msg = String(e.message || e);
      // ganz gesperrt (AGB/robots.txt): kein Fehler, aber auch keine alten Einträge aus dieser Quelle
      const quellen = regelQuellen(wache, name);
      const q = quellen.length ? { quellen } : {};
      if (REGEL_TEXT.test(msg)) {
        kategorien[name] = []; status[name] = { ok: true, anzahl: 0, fehler: [], hinweise: [msg.slice(0, 300)], ms: Date.now() - t0, ...q };
        verbucheModul(zustand, name, m, { ok: true }, new Date(jetztMs)); // Regel-Sperre ist keine Störung: normaler Takt
      } else {
        kategorien[name] = alt; status[name] = { ok: false, anzahl: 0, fehler: [msg], ms: Date.now() - t0, ...q };
        // Absturz/Zeitlimit: wie ein Quellen-Fehler -> Neuversuch (vorher: gar nichts gemerkt = jeder Start ein neuer Versuch)
        const ra = Math.max(retryAfter.get(name) || 0, Number.isFinite(e?.retryAfterMs) ? e.retryAfterMs : 0) || null;
        status[name].neuversuch = verbucheModul(zustand, name, m, { ok: false, retryAfterMs: ra, neu: nieGelaufen }, new Date(jetztMs)).ab;
      }
    }
    if (wache) wache.modul = null;
    modulJetzt = null;
    log(`${name}: ${status[name].ok ? 'ok' : 'FEHLER'} ${kategorien[name].length} Einträge ${(status[name].fehler || []).slice(0, 2).join(' | ')}${status[name].neuversuch ? ` – Neuversuch ab ${status[name].neuversuch}` : ''}`);
  }
  // Schnittstellen-Cache: Abgelaufenes raus, Größe begrenzen; Zahlen des Laufs (Abrufe/gemerkt je Host) in den Zustand
  cacheAufraeumen(zustand, jetztMs);
  if (wache?.schnittstelle.size) (zustand.schnittstellen ||= {}).lauf = Object.fromEntries([...wache.schnittstelle].map(([h, s]) => [h, { n: s.n, gemerkt: s.gemerkt, ...(s.regel ? { regel: s.regel.slice(0, 80) } : {}) }]));
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
  // Fällige Erinnerungen an Gemerktes planen – jeder Lauf, nicht nur, wenn das Modul knaller dran ist (Erinnerung „am Start-Tag
  // morgens“); frische Preise/Gültigkeit aus knaller.json (Knaller + Treffer der gemerkten Produkte)
  let erinnerung = null;
  if (knallerAn) {
    if (merkStatus && status.knaller) status.knaller.merken = merkStatus;
    const kn = dateien.knaller || dateienVorher?.knaller || null;
    const liste = faelligeErinnerungen({ zustand, cfg, jetzt: new Date(jetztMs), angebote: [...(kn?.angebote || []), ...(Array.isArray(kn?.merkTreffer) ? kn.merkTreffer : [])] });
    const namen = Object.fromEntries((cfg.module.knaller.maerkte || []).map(m => [m.id, m.name]));
    if (liste.length) erinnerung = { liste, msg: erinnerungNachricht(liste, cfg, namen) };
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
  return { aktuell, zustand, alleEintraege, dateien, erinnerung };
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
  const musikListe = await leseJson(join(basis, 'musik.json'), null); // Modul musikstore (28.11.2026)
  // Essen: gepflegte Lokale/Ketten (vorteile/essen.json) + Einträge der Seite (mein-vorteil/essen.json, für gemerkte AYCE-Tage)
  const essenListen = { liste: await leseJson(join(basis, 'essen.json'), null), seite: await leseJson(join(basis, '..', 'mein-vorteil', 'essen.json'), null) };
  const vorher = await leseJson(join(daten, 'aktuell.json'), null);
  const dateienVorher = { filme: await leseJson(join(daten, 'filme.json'), null), knaller: await leseJson(join(daten, 'knaller.json'), null), essen: await leseJson(join(daten, 'essen.json'), null), filialen: await leseJson(join(daten, 'filialen.json'), null), events: await leseJson(join(daten, 'events.json'), null), filmkatalog: await leseJson(join(daten, 'filmkatalog.json'), null), musikstore: await leseJson(join(daten, 'musikstore.json'), null) };
  const zustand = await leseJson(join(daten, 'zustand.json'), {});
  const fetchImpl = roh ? roh.fetch(test.fetchImpl) : test.fetchImpl;
  // Abstände der Programm-Schnittstellen (lib/schnittstellen.mjs) gelten zusätzlich zu abruf.pauseMsJeHost (größerer gewinnt)
  const holeText = fixtures ? macheFixtureAbruf(join(HIER, 'test', 'fixtures'), FIXTURE_KARTE) : macheAbruf({ ...cfg.abruf, pauseMsJeHost: schnittstellenPausen(cfg.abruf?.pauseMsJeHost), ...test.abruf }, fetchImpl);
  const jetzt = arg(args, '--jetzt') ? new Date(arg(args, '--jetzt')) : new Date();
  const modus = arg(args, '--modus') || env.MODUS || 'auto';

  let r;
  try { r = await lauf({ cfg, wunschliste, filmListen, essenListen, musikListe, dateienVorher, vorher, zustand, holeText, env, jetzt, alle: fixtures || !!rohDir || args.includes('--alle'), log: console.log, schnittstellenCache: !fixtures && !rohDir }); }
  catch (e) { roh?.abschluss({ absturz: String(e?.message || e) }); throw e; }
  // Runde 9: Hosts, die 429 meldeten und bei denen der Radar im Lauf selbst langsamer wurde (nur Protokoll, keine Daten)
  if (holeText.bremse?.size) console.log(`nach HTTP 429 gebremst: ${[...holeText.bremse].map(([h, ms]) => `${h} ${Math.round(ms / 1000)} s Abstand`).join(', ')}`);
  // Erster Lauf überhaupt: nichts nachmelden, nur einmal Bescheid geben (kein Push-Gewitter)
  const erstlauf = !zustand.gemeldet;
  const plan = plane({ eintraege: r.alleEintraege, zustand: r.zustand, cfg, jetzt, modus: erstlauf ? 'still' : modus });
  const ok = { sofort: [], digest: false };
  const token = env.NTFY_TOKEN;
  for (const s of plan.sofort) ok.sofort.push(await sende(s.msg, cfg, { dryRun, token }));
  if (plan.digest) ok.digest = await sende(plan.digest.msg, cfg, { dryRun, token });
  // Erinnerung an gemerkte Wochen-Knaller: ausdrücklich gewünscht -> eigenes Kontingent, nicht im Tageslimit der Sofort-Pushes
  let erinnert = false;
  if (r.erinnerung && !erstlauf && modus !== 'still') {
    erinnert = await sende(r.erinnerung.msg, cfg, { dryRun, token });
    if (erinnert && !dryRun) verbucheErinnerung(r.zustand, r.erinnerung.liste, jetzt);
  }
  if (erstlauf) {
    for (const e of r.alleEintraege) (r.zustand.gemeldet ||= {})[e.id] = r.aktuell.aktualisiert;
    r.zustand.gemeldet ||= {};
    await sende({ topic: cfg.ntfy.topic, title: 'Vorteils-Radar ist aktiv', message: `${r.alleEintraege.length} Vorteile gefunden. Ab jetzt: Seltenes sofort, der Rest einmal am Tag.`, click: cfg.seite, tags: ['sparkles'], priority: 3 }, cfg, { dryRun, token });
  }
  verbuche(r.zustand, plan, ok, jetzt);
  // Dezember: Film des Tages (einmal am Tag ab 8 Uhr; neueste filme.json – dieser Lauf oder der letzte, höchstens 12 h alt)
  const advent = planeAdvent({ datei: r.dateien?.filme || dateienVorher.filme, zustand: r.zustand, cfg, jetzt, modus: erstlauf ? 'still' : modus });
  const adventOk = advent?.msg ? await sende(advent.msg, cfg, { dryRun, token }) : false;
  verbucheAdvent(r.zustand, advent, adventOk, jetzt);

  await mkdir(daten, { recursive: true });
  await writeFile(join(daten, 'aktuell.json'), JSON.stringify(r.aktuell, null, 1) + '\n');
  await writeFile(join(daten, 'zustand.json'), JSON.stringify(r.zustand) + '\n');
  // eigene Dateien der Module (filme.json); nicht gelaufen -> alte Datei bleibt
  for (const [name, inhalt] of Object.entries(r.dateien || {})) await writeFile(join(daten, `${name}.json`), JSON.stringify(inhalt) + '\n');
  if (roh) {
    roh.ausgabe('aktuell.json', JSON.stringify(r.aktuell, null, 1) + '\n');
    roh.ausgabe('zustand.json', JSON.stringify(r.zustand) + '\n');
    for (const [name, inhalt] of Object.entries(r.dateien || {})) roh.ausgabe(`${name}.json`, JSON.stringify(inhalt) + '\n');
    roh.ausgabe('pushes.json', { sofort: plan.sofort.map(s => s.msg), digest: plan.digest?.msg || null, erinnerung: r.erinnerung?.msg || null, advent: advent?.msg || null, modus: erstlauf ? 'still' : modus });
    roh.abschluss({ dryRun: true, eintraege: r.alleEintraege.length, sofort: plan.sofort.length, digest: !!plan.digest });
    console.log(`Roh-Mitschnitt: ${roh.abrufe.length} Abrufe → ${roh.dir}`);
  }
  console.log(`${r.alleEintraege.length} Einträge, ${plan.sofort.length} Sofort-Pushes, Zusammenfassung: ${plan.digest ? plan.digest.liste.length + ' Einträge' : 'nein'}${dryRun ? ' (dry-run)' : ''} → ${daten}`);
  return { ...r, plan, ok, advent, adventOk };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
