// speicher.js – alles bleibt auf dem Gerät. Eigene Lieder und Audio in IndexedDB, kleine Werte (Stimmlage, Profil,
// Fortschritt, Einstellungen) in localStorage. Jeder Zugriff ist abgesichert: geht der Speicher nicht (privates Fenster,
// gesperrte Website-Daten), läuft die App mit einem Ersatz im Arbeitsspeicher weiter.

const DB_NAME = 'gesangstrainer';
const DB_VER = 1;
const PREFIX = 'gt.';
const ersatz = { lieder: new Map(), audio: new Map(), werte: new Map() };
let dbVersprechen = null;

function oeffne() {
  if (dbVersprechen) return dbVersprechen;
  dbVersprechen = new Promise((ok) => {
    try {
      if (!('indexedDB' in self)) return ok(null);
      const anf = indexedDB.open(DB_NAME, DB_VER);
      anf.onupgradeneeded = () => {
        const db = anf.result;
        if (!db.objectStoreNames.contains('lieder')) db.createObjectStore('lieder', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio');
      };
      anf.onsuccess = () => ok(anf.result);
      anf.onerror = () => ok(null);
      anf.onblocked = () => ok(null);
    } catch (e) { ok(null); }
  });
  return dbVersprechen;
}

async function vorgang(laden, modus, arbeit) {
  const db = await oeffne();
  if (!db) return arbeit(null);
  return new Promise((ok, fehler) => {
    try {
      const tx = db.transaction(laden, modus);
      const st = tx.objectStore(laden);
      const anf = arbeit(st);
      tx.oncomplete = () => ok(anf && 'result' in anf ? anf.result : undefined);
      tx.onerror = () => fehler(tx.error);
      tx.onabort = () => fehler(tx.error);
    } catch (e) { fehler(e); }
  });
}

/** Alle eigenen Lieder (ohne Audio), neueste zuerst. */
export async function lieder() {
  try {
    const alle = await vorgang('lieder', 'readonly', (st) => (st ? st.getAll() : null));
    const liste = alle || [...ersatz.lieder.values()];
    return liste.sort((a, b) => (b.erstellt || 0) - (a.erstellt || 0));
  } catch (e) { return [...ersatz.lieder.values()]; }
}

export async function lied(id) {
  try {
    const r = await vorgang('lieder', 'readonly', (st) => (st ? st.get(id) : null));
    return r || ersatz.lieder.get(id) || null;
  } catch (e) { return ersatz.lieder.get(id) || null; }
}

/** Speichert ein Lied. Gibt true zurück, wenn es dauerhaft gespeichert wurde (false = nur bis zum Neuladen). */
export async function speichereLied(l) {
  try {
    const db = await oeffne();
    if (!db) { ersatz.lieder.set(l.id, l); return false; }
    await vorgang('lieder', 'readwrite', (st) => st.put(l));
    return true;
  } catch (e) { ersatz.lieder.set(l.id, l); return false; }
}

export async function loescheLied(id) {
  ersatz.lieder.delete(id); ersatz.audio.delete(id);
  try {
    await vorgang('lieder', 'readwrite', (st) => st && st.delete(id));
    await vorgang('audio', 'readwrite', (st) => st && st.delete(id));
  } catch (e) { /* nichts */ }
}

export async function speichereAudio(id, blob) {
  try {
    const db = await oeffne();
    if (!db) { ersatz.audio.set(id, blob); return false; }
    await vorgang('audio', 'readwrite', (st) => st.put(blob, id));
    return true;
  } catch (e) { ersatz.audio.set(id, blob); return false; }
}

export async function ladeAudio(id) {
  try {
    const r = await vorgang('audio', 'readonly', (st) => (st ? st.get(id) : null));
    return r || ersatz.audio.get(id) || null;
  } catch (e) { return ersatz.audio.get(id) || null; }
}

// ---- kleine Werte ----
export function hole(schluessel, standard = null) {
  try {
    const roh = localStorage.getItem(PREFIX + schluessel);
    if (roh == null) return ersatz.werte.has(schluessel) ? ersatz.werte.get(schluessel) : standard;
    return JSON.parse(roh);
  } catch (e) { return ersatz.werte.has(schluessel) ? ersatz.werte.get(schluessel) : standard; }
}

export function merke(schluessel, wert) {
  ersatz.werte.set(schluessel, wert);
  try {
    if (wert == null) localStorage.removeItem(PREFIX + schluessel);
    else localStorage.setItem(PREFIX + schluessel, JSON.stringify(wert));
    return true;
  } catch (e) { return false; }
}

export const ladeStimme = () => hole('stimme', null);
export const speichereStimme = (s) => merke('stimme', s);
export const loescheStimme = () => merke('stimme', null);
export const ladeProfil = () => hole('profil', null);
export const speichereProfil = (p) => merke('profil', p);

/** Fortschritt: { '<liedId>': { teile: {<teil>: true}, stufen: {'<teil>:<n>': true} } } */
export function fortschritt(liedId) {
  const alle = hole('fortschritt', {}) || {};
  return alle[liedId] || { teile: {}, stufen: {} };
}
export function setzeFortschritt(liedId, art, schluessel, wert) {
  const alle = hole('fortschritt', {}) || {};
  const f = alle[liedId] || { teile: {}, stufen: {} };
  f[art] = f[art] || {};
  if (wert) f[art][schluessel] = true; else delete f[art][schluessel];
  alle[liedId] = f;
  merke('fortschritt', alle);
  return f;
}
