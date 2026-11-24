// Werkstatt 3 – verlauf.js
// Versionen-Verlauf („Zwiebelschichten"). Jede Bearbeitung (Auto-Durchlauf, jeder manuelle Zug) = eine Version.
// Gespeichert lokal in IndexedDB (nur auf diesem Gerät); ohne IndexedDB läuft alles nur im Speicher.
//
// Version = {id, nr, name, zeit, sr, dauer, x (Float32Array|null), noten, anker, spitzen, bericht, basis, …}
//   nr     = laufende Nummer (1, 2, 3 …), basis = id der Version, aus der sie entstand
//   x      = null nur, wenn sie wegen Speicherplatz ausgelagert ist (dann holt holen()/nachVorne() sie zurück)
//
// export function neu(name, daten)  → Version (sofort, synchron). daten = {x, sr, noten, anker, spitzen, bericht, …}
//                                     Die neue Version kommt nach vorne. Mehr als MAX → älteste fliegt raus
//                                     (nie die, die gerade vorne liegt).
// export function liste()           → [Version…] neueste zuerst (Index 0 = neueste). Flags: .vorne, .neueste
//                                     → für die schräg gestaffelten Schichten: oben/vorne = neueste.
// export function holen(id)         → Version | Promise<Version> (Promise nur, wenn x erst aus IndexedDB
//                                     nachgeladen werden muss) – mit await ist beides richtig. Unbekannt → null.
// export function nachVorne(id)     → Promise<Version>; wenn x im Speicher liegt, ist sie sofort (synchron) vorne.
// export function aktuell()         → Version, die gerade vorne liegt (oder null)
// export function neueste()         → jüngste Version;  zurNeuesten() → holt die jüngste wieder nach vorne
// export function schritt(r)        → eine Schicht älter (r=-1) / jünger (r=+1) nach vorne
// export function beobachten(fn)    → fn(liste, aktuell) bei jeder Änderung; gibt Abmelde-Funktion zurück
// export async function wiederherstellen() → lädt den gespeicherten Verlauf (z. B. nach Neuladen der Seite)
// export async function leeren()    → alles löschen (z. B. neue Datei)
// export function umbenennen(id, name), loeschen(id)
// export async function bereit()    → wartet, bis alle Speicher-Vorgänge erledigt sind
// export function info()            → {anzahl, max, imSpeicherMB, idb}
// export function speicherBudget(mb) → Obergrenze für Audio im Speicher ändern (Standard 320 MB)

import { spitzen as spitzenRechnen } from './io.js';

export const MAX = 20;
let BUDGET_BYTES = 320 * 1024 * 1024;     // so viel Audio bleibt höchstens im Speicher (iOS-sicher)
const SPITZEN_PRO_SEK = 100;
const DB_NAME = 'werkstatt3-verlauf', DB_VER = 1;

let versionen = [];      // chronologisch: älteste zuerst
let vorneId = null;
let zaehler = 0;
const hoerer = new Set();

// ---------------------------------------------------------------- IndexedDB (alles in try/catch)

let dbP = null, idbOk = !!globalThis.indexedDB, kette = Promise.resolve();

function db() {
  if (!idbOk) return Promise.resolve(null);
  if (dbP) return dbP;
  dbP = new Promise((res) => {
    try {
      const idb = globalThis.indexedDB;
      if (!idb) { idbOk = false; return res(null); }
      const rq = idb.open(DB_NAME, DB_VER);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('audio')) d.createObjectStore('audio');
        if (!d.objectStoreNames.contains('zustand')) d.createObjectStore('zustand');
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => { idbOk = false; res(null); };
      rq.onblocked = () => { idbOk = false; res(null); };
      setTimeout(() => { if (rq.readyState !== 'done') { idbOk = false; res(null); } }, 4000);
    } catch (e) { idbOk = false; res(null); }
  });
  return dbP;
}

function tx(stores, modus, arbeit) { // → Promise<Ergebnis|null>, scheitert nie
  return db().then((d) => d && new Promise((res) => {
    try {
      const t = d.transaction(stores, modus);
      let erg;
      const r = arbeit(t, (v) => { erg = v; });
      t.oncomplete = () => res(erg === undefined ? (r === undefined ? true : r) : erg);
      t.onerror = t.onabort = () => res(null);
    } catch (e) { res(null); }
  })).catch(() => null);
}

function einreihen(f) { // Speicher-Vorgänge strikt nacheinander
  kette = kette.then(f, f).catch(() => null);
  return kette;
}

function metaVon(v) {
  const m = {};
  for (const k in v) if (k !== 'x' && k !== 'vorne' && k !== 'neueste' && k !== 'gesichert') m[k] = v[k];
  return m;
}

function sichern(v) {
  if (!idbOk) return;
  einreihen(async () => {
    const ok = await tx(['meta', 'audio', 'zustand'], 'readwrite', (t) => {
      t.objectStore('meta').put(metaVon(v));
      if (v.x) t.objectStore('audio').put(v.x, v.id);
      t.objectStore('zustand').put(vorneId, 'vorne');
    });
    if (ok) { v.gesichert = true; auslagern(); }
  });
}

function zustandSichern() {
  if (!idbOk) return;
  const id = vorneId;
  einreihen(() => tx(['zustand'], 'readwrite', (t) => t.objectStore('zustand').put(id, 'vorne')));
}

function entfernenGespeichert(ids) {
  if (!idbOk || !ids.length) return;
  einreihen(() => tx(['meta', 'audio'], 'readwrite', (t) => {
    for (const id of ids) { t.objectStore('meta').delete(id); t.objectStore('audio').delete(id); }
  }));
}

// Audio älterer Versionen aus dem Speicher nehmen, wenn es sicher in IndexedDB liegt.
function auslagern() {
  if (!idbOk) return;
  let summe = 0;
  const neu = versionen[versionen.length - 1];
  for (let i = versionen.length - 1; i >= 0; i--) {
    const v = versionen[i];
    if (!v.x) continue;
    const wichtig = v.id === vorneId || v === neu;
    if (!wichtig && v.gesichert && summe + v.x.byteLength > BUDGET_BYTES) { v.x = null; continue; }
    summe += v.x.byteLength;
  }
}

async function audioLaden(v) {
  const x = await tx(['audio'], 'readonly', (t, setze) => {
    const rq = t.objectStore('audio').get(v.id);
    rq.onsuccess = () => setze(rq.result || null);
  });
  if (x instanceof Float32Array) v.x = x;
  else if (x && x.buffer) v.x = new Float32Array(x.buffer);
  return v;
}

// ---------------------------------------------------------------- Öffentliche Schnittstelle

function finde(id) { return versionen.find((v) => v.id === id) || null; }

function melden() {
  const l = liste(), a = aktuell();
  for (const fn of hoerer) { try { fn(l, a); } catch (e) { console.error(e); } }
}

export function neu(name, daten = {}) {
  const sr = daten.sr || 48000;
  const x = daten.x || null;
  const v = Object.assign({}, daten, {
    id: 'v' + Date.now().toString(36) + '-' + (++zaehler).toString(36),
    nr: (versionen.length ? versionen[versionen.length - 1].nr : 0) + 1,
    name: name || ('Version ' + ((versionen.length ? versionen[versionen.length - 1].nr : 0) + 1)),
    zeit: Date.now(),
    sr,
    x,
    dauer: x ? x.length / sr : (daten.dauer || 0),
    noten: daten.noten || null,
    anker: daten.anker || null,
    spitzen: daten.spitzen || (x ? spitzenRechnen(x, sr, SPITZEN_PRO_SEK) : null),
    spitzenProSek: daten.spitzen ? (daten.spitzenProSek || null) : SPITZEN_PRO_SEK,
    bericht: daten.bericht || null,
    basis: daten.basis !== undefined ? daten.basis : vorneId,
  });
  versionen.push(v);
  vorneId = v.id;
  const weg = [];
  while (versionen.length > MAX) {
    const i = versionen.findIndex((w) => w.id !== vorneId);
    weg.push(versionen.splice(i, 1)[0].id);
  }
  entfernenGespeichert(weg);
  sichern(v);
  melden();
  return v;
}

export function liste() {
  const n = versionen[versionen.length - 1];
  const l = versionen.slice().reverse();
  for (const v of l) { v.vorne = v.id === vorneId; v.neueste = v === n; }
  return l;
}

export function holen(id) {
  const v = finde(id);
  if (!v) return null;
  if (v.x || !idbOk) return v;
  return audioLaden(v);
}

export async function nachVorne(id) {
  const v = finde(id);
  if (!v) return null;
  if (!v.x && idbOk) await audioLaden(v);
  vorneId = v.id;
  auslagern();
  zustandSichern();
  melden();
  return v;
}

export function aktuell() { return finde(vorneId); }
export function neueste() { return versionen[versionen.length - 1] || null; }
export function zurNeuesten() { const v = neueste(); return v ? nachVorne(v.id) : Promise.resolve(null); }

export function schritt(r) {
  const i = versionen.findIndex((v) => v.id === vorneId);
  const j = Math.max(0, Math.min(versionen.length - 1, i + (r < 0 ? -1 : 1)));
  return versionen[j] ? nachVorne(versionen[j].id) : Promise.resolve(null);
}

export function beobachten(fn) { hoerer.add(fn); return () => hoerer.delete(fn); }

export function umbenennen(id, name) {
  const v = finde(id);
  if (!v) return null;
  v.name = String(name);
  if (idbOk) einreihen(() => tx(['meta'], 'readwrite', (t) => t.objectStore('meta').put(metaVon(v))));
  melden();
  return v;
}

export function loeschen(id) {
  const i = versionen.findIndex((v) => v.id === id);
  if (i < 0) return false;
  versionen.splice(i, 1);
  if (vorneId === id) { vorneId = versionen.length ? versionen[versionen.length - 1].id : null; zustandSichern(); }
  entfernenGespeichert([id]);
  melden();
  return true;
}

export async function leeren() {
  versionen = []; vorneId = null;
  if (idbOk) await einreihen(() => tx(['meta', 'audio', 'zustand'], 'readwrite', (t) => {
    t.objectStore('meta').clear(); t.objectStore('audio').clear(); t.objectStore('zustand').clear();
  }));
  melden();
}

export async function wiederherstellen() {
  const d = await db();
  if (!d) return liste();
  const erg = await tx(['meta', 'zustand'], 'readonly', (t, setze) => {
    const out = { meta: [], vorne: null };
    const a = t.objectStore('meta').getAll();
    a.onsuccess = () => { out.meta = a.result || []; };
    const b = t.objectStore('zustand').get('vorne');
    b.onsuccess = () => { out.vorne = b.result || null; };
    setze(out);
  });
  if (!erg || !erg.meta.length) return liste();
  const schon = new Set(versionen.map((v) => v.id));
  const dazu = erg.meta.filter((m) => !schon.has(m.id)).map((m) => Object.assign(m, { x: null, gesichert: true }));
  versionen = dazu.concat(versionen).sort((a, b) => a.zeit - b.zeit || a.nr - b.nr);
  for (const v of versionen) { const z = /-([0-9a-z]+)$/.exec(v.id); if (z) zaehler = Math.max(zaehler, parseInt(z[1], 36)); }
  if (!finde(vorneId)) vorneId = finde(erg.vorne) ? erg.vorne : (versionen.length ? versionen[versionen.length - 1].id : null);
  const weg = [];
  while (versionen.length > MAX) { const i = versionen.findIndex((w) => w.id !== vorneId); weg.push(versionen.splice(i, 1)[0].id); }
  entfernenGespeichert(weg);
  const v = aktuell();
  if (v && !v.x) await audioLaden(v);
  melden();
  return liste();
}

export function speicherBudget(mb) { BUDGET_BYTES = Math.max(1, mb) * 1048576; auslagern(); }

export function bereit() { return kette.then(() => true); }

export function info() {
  let b = 0; for (const v of versionen) if (v.x) b += v.x.byteLength;
  return { anzahl: versionen.length, max: MAX, imSpeicherMB: Math.round(b / 1048576), idb: idbOk };
}
