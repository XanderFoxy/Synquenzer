// Kaninchenbau – Speicher. Alles bleibt auf diesem Gerät: localStorage (sofort) + Sicherheitskopie in IndexedDB. Nichts wird gesendet.
// Jeder Zugriff in try/catch: im privaten Fenster oder bei gesperrtem Speicher läuft die App weiter (nur ohne Merken).
// Fassung 0.1 schrieb 'kaninchenbau.v1' – der Inhalt wird beim ersten Start übernommen (Lernen-Teil) und bleibt unverändert liegen.
// Der Ursprung xanderfoxy.github.io wird mit anderen Apps geteilt: nur eigene Schlüssel, nie localStorage.clear().
import { AESTE } from './inhalt.js';

const KEY = 'kaninchenbau.v2', ALT = 'kaninchenbau.v1', FILTER = ['kaninchenbau.filter', 'kaninchenbau.antwFilter'];
const DB = 'kaninchenbau', STORE = 'zustand';
export const FORMAT = 2;
let ok = true, idbOk = true;
// 0.2.1: Die IndexedDB-Kopie wird erst wieder geschrieben, wenn die alte beim Start gelesen ist (sonst konnte ein Umsteiger
// mit 0.1-Daten die Kopie seiner 0.2-Antworten überschreiben, wenn 'kaninchenbau.v2' fehlte oder nicht schreibbar war).
let tor = Promise.resolve();
export function torSetzen(p) { tor = Promise.resolve(p).catch(() => null); }

export const leerLernen = () => ({ profil: null, lauf: null, stufen: {}, quiz: null, letztes: null });
export const leerWesen = () => ({ antw: {}, runde: null, runden: 0, ideen: [], defrag: null, laenge: 8, weg: [] });
export const leer = () => ({ v: FORMAT, thema: 'auto', lernen: leerLernen(), wesen: leerWesen(), migriert: null, stand: 0 });

const istAst = (id) => typeof id === 'string' && Object.hasOwn(AESTE, id);
const istAntw = (a) => a && typeof a === 'object' && Object.values(a).every((w) => w === 0 || w === 1);
const zahl = (x, d = 0) => (Number.isFinite(x) ? x : d);
const text = (x, max) => String(x ?? '').slice(0, max);

// Lernen-Teil (Format von 0.1, unverändert)
function normalLernen(z) {
  const n = leerLernen();
  if (!z || typeof z !== 'object') return n;
  if (z.profil && Array.isArray(z.profil.aeste)) n.profil = { aeste: z.profil.aeste.filter(istAst), antw: istAntw(z.profil.antw) ? z.profil.antw : {}, datum: String(z.profil.datum || '') };
  if (n.profil && !n.profil.aeste.length) n.profil = null;
  if (z.lauf && istAntw(z.lauf.antw)) n.lauf = { antw: z.lauf.antw };
  if (z.stufen && typeof z.stufen === 'object') {
    for (const [ast, st] of Object.entries(z.stufen)) {
      if (!istAst(ast) || !st || typeof st !== 'object') continue;
      n.stufen[ast] = {};
      for (const s of ['1', '2', '3']) {
        const e = st[s]; if (!e) continue;
        const beste = Math.max(0, Math.min(3, e.beste | 0));
        n.stufen[ast][s] = { beste, versuche: Math.max(1, e.versuche | 0), geschafft: beste >= 2 };
      }
    }
  }
  const q = z.quiz;
  if (q && istAst(q.ast) && [1, 2, 3].includes(q.stufe) && Array.isArray(q.ok) && Array.isArray(q.seiten)) {
    n.quiz = { ast: q.ast, stufe: q.stufe, ok: q.ok.map(Boolean).slice(0, 3), seiten: q.seiten.map((s) => (s ? 1 : 0)).slice(0, 3), offen: q.offen === 0 || q.offen === 1 ? q.offen : null };
  }
  const l = z.letztes;
  if (l && istAst(l.ast) && [1, 2, 3].includes(l.stufe)) n.letztes = { ast: l.ast, stufe: l.stufe, richtig: l.richtig | 0, neu: !!l.neu, ersterMal: !!l.ersterMal, aufgenommen: !!l.aufgenommen };
  return n;
}

// „Dein Wesen“: Antworten, laufende Runde, Ideen-Notizen
const ID = /^[a-z]-[a-z]+-\d{1,3}$/;
function normalWesen(w) {
  const n = leerWesen();
  if (!w || typeof w !== 'object') return n;
  if (w.antw && typeof w.antw === 'object') {
    for (const [id, a] of Object.entries(w.antw)) {
      if (!ID.test(id) || !a || typeof a !== 'object' || !Number.isInteger(a.w) || a.w < -1 || a.w > 9) continue;
      const t = zahl(a.t, Date.now());
      n.antw[id] = { w: a.w, t, t0: zahl(a.t0, t) };
    }
  }
  const r = w.runde;
  if (r && Array.isArray(r.ids)) {
    const ids = r.ids.filter((id) => typeof id === 'string' && ID.test(id)).slice(0, 30);
    n.runde = { ids, i: Math.max(0, Math.min(ids.length, r.i | 0)), n: Math.max(3, Math.min(20, r.n | 0 || 8)), bereich: typeof r.bereich === 'string' ? r.bereich.slice(0, 20) : null,
      saat: (r.saat >>> 0) || 1, start: zahl(r.start, Date.now()), anteil0: zahl(r.anteil0, 0), fertig: !!r.fertig, gefeiert: !!r.gefeiert };
  }
  n.runden = Math.max(0, w.runden | 0);
  if (Array.isArray(w.ideen)) n.ideen = w.ideen.filter((x) => x && typeof x.text === 'string' && x.text.trim()).slice(0, 300)
    .map((x, i) => ({ id: text(x.id || 'i' + i, 30), text: text(x.text, 280), t: zahl(x.t, Date.now()) }));
  if (w.defrag && Number.isFinite(w.defrag.t)) n.defrag = { t: w.defrag.t, n: Math.max(0, w.defrag.n | 0) };
  if ([5, 8, 12].includes(w.laenge)) n.laenge = w.laenge;
  if (Array.isArray(w.weg)) n.weg = w.weg.filter((x) => typeof x === 'string').slice(0, 50).map((x) => x.slice(0, 30));
  return n;
}

export function normal(z) {
  const n = leer();
  if (!z || typeof z !== 'object') return n;
  if (z.v === 1) {                                     // Fassung 0.1: alles gehört zum Lernen-Teil
    n.lernen = normalLernen(z);
    n.migriert = { von: '0.1', t: Date.now() };
  } else {
    n.lernen = normalLernen(z.lernen);
    n.wesen = normalWesen(z.wesen);
    if (z.migriert && typeof z.migriert === 'object') n.migriert = { von: text(z.migriert.von, 10), t: zahl(z.migriert.t, 0) };
  }
  if (['auto', 'hell', 'dunkel'].includes(z.thema)) n.thema = z.thema;
  n.stand = zahl(z.stand, 0);                          // Zeit der letzten Änderung (0.2.1), zum Vergleich mit der Kopie
  return n;
}

// Liefert { z, quelle: 'v2' | 'v1' | 'leer' }. Die IndexedDB-Kopie wird asynchron mit idbLaden() geholt.
export function laden() {
  try {
    const t = localStorage.getItem(KEY);
    if (t) { const z = JSON.parse(t); if (z && z.v === FORMAT) return { z: normal(z), quelle: 'v2' }; }
    const a = localStorage.getItem(ALT);
    if (a) { const z = JSON.parse(a); if (z && z.v === 1) return { z: normal(z), quelle: 'v1' }; }
  } catch { ok = false; }
  return { z: leer(), quelle: 'leer' };
}

let idbTimer = 0, idbLetzt = '';
export function sichern(z) {
  z.stand = Date.now();
  const s = JSON.stringify(z);
  try { localStorage.setItem(KEY, s); ok = true; } catch { ok = false; }
  clearTimeout(idbTimer); idbTimer = setTimeout(() => idbSchreiben(s), 400);
  return ok;
}
// Sofort in die IndexedDB schreiben (z. B. beim Verlassen der Seite)
export function sicherJetzt(z) { clearTimeout(idbTimer); return idbSchreiben(JSON.stringify(z)); }

function idbOeffnen() {
  return new Promise((res, rej) => {
    let r; try { r = indexedDB.open(DB, 1); } catch (e) { rej(e); return; }
    r.onupgradeneeded = () => { r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('blockiert'));
  });
}
async function idbSchreiben(s) {
  await tor;
  if (s === idbLetzt) return true;
  try {
    const db = await idbOeffnen();
    await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(s, 'v2'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
    db.close(); idbLetzt = s; idbOk = true; return true;
  } catch { idbOk = false; return false; }
}
export async function idbLaden(ms = 2500) {
  let uhr = 0;
  const zuLange = new Promise((res) => { uhr = setTimeout(() => res(null), ms); });   // hängt open() (manche private Fenster), nicht ewig warten
  try { return await Promise.race([idbLesen(), zuLange]); } finally { clearTimeout(uhr); }
}
async function idbLesen() {
  try {
    const db = await idbOeffnen();
    const s = await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readonly'); const g = tx.objectStore(STORE).get('v2'); g.onsuccess = () => res(g.result); g.onerror = () => rej(g.error); });
    db.close();
    if (typeof s !== 'string') return null;
    const z = JSON.parse(s); if (!z || z.v !== FORMAT) return null;
    idbLetzt = s; return normal(z);
  } catch { return null; }
}

export async function loeschen() {
  clearTimeout(idbTimer); idbLetzt = '';
  for (const k of [KEY, ALT, ...FILTER]) { try { localStorage.removeItem(k); } catch { /* egal */ } }
  try { await new Promise((res) => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); }); } catch { /* egal */ }
}
export const speicherOk = () => ok;
export const kopieOk = () => idbOk;
// Hat ein Zustand überhaupt Inhalt (Antworten, Ideen, Gänge)?
export const hatInhalt = (z) => !!z && (Object.keys(z.wesen.antw).length > 0 || z.wesen.ideen.length > 0 || !!z.lernen.profil || Object.keys(z.lernen.stufen).length > 0);
export const groesse = (z) => JSON.stringify(z).length;

// Bitte an den Browser, den Speicher nicht bei Platzmangel zu räumen (iPhone: wirkt vor allem als Home-Bildschirm-App).
export function dauerhaft() { try { navigator.storage?.persist?.().catch(() => {}); } catch { /* egal */ } }

// ---------- Sicherung als Datei ----------
export function sicherung(z, auswertung) {
  return { app: 'kaninchenbau', format: FORMAT, erstellt: new Date().toISOString(), hinweis: 'Deine Antworten aus dem Kaninchenbau. Nur für dich – bewahre die Datei gut auf.', daten: z, auswertung };
}
export function ausSicherung(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Diese Datei ist keine Kaninchenbau-Sicherung.');
  const z = obj.app === 'kaninchenbau' ? obj.daten : obj;            // auch der reine Zustand (v1 oder v2) geht
  if (!z || typeof z !== 'object' || ![1, 2].includes(z.v)) throw new Error('Diese Datei ist keine Kaninchenbau-Sicherung.');
  return normal(z);
}
