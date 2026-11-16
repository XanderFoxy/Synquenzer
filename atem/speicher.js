// Atem – Speicher nur unter 'atem.v1.*' (KONZEPT §3.7). Nie localStorage.clear().
const P = 'atem.v1.';
export const STANDARD_EINST = { ton: 'klang', laut: 0.6, sekunden: false, musik: false, ansage: false, ruhig: false, figur: true, ansicht: 'seite', blumen: true, vorherNachher: false, geraet: false, laengen: {}, letzte: null, eigeneMusik: false, musikLaut: 0.5, musikName: null };
function lies(k, std) { try { const v = localStorage.getItem(P + k); return v == null ? std : JSON.parse(v); } catch { return std; } }
function schreib(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch { return false; } }
export const speicher = {
  einst: () => ({ ...STANDARD_EINST, ...lies('einst', {}) }),
  setzeEinst(teil) { const e = { ...speicher.einst(), ...teil }; schreib('einst', e); return e; },
  sicherheit: () => lies('sicherheit', { erst: null, lang_gesehen: {}, sperre_bis: null, kraft_zuletzt: null }),
  setzeSicherheit(teil) { const s = { ...speicher.sicherheit(), ...teil }; schreib('sicherheit', s); return s; },
  protokoll: () => lies('protokoll', []),
  eintrag(e) { const p = speicher.protokoll(); p.push(e); while (p.length > 3000) p.shift(); schreib('protokoll', p); return e; },
  messwerte: () => lies('messwerte', {}),
  messwert(id, w) { const m = speicher.messwerte(); (m[id] = m[id] || []).push(w); schreib('messwerte', m); return m; },
  training: () => lies('training', null),
  setzeTraining(t) { schreib('training', t); return t; },
  singen4w: () => lies('singen4w', null),
  setzeSingen4w(s) { schreib('singen4w', s); return s; },
  schluessel() { const k = []; try { for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (n && n.startsWith(P)) k.push(n); } } catch {} return k.sort(); },
  export(version) {
    const daten = {}; for (const k of speicher.schluessel()) { try { daten[k] = JSON.parse(localStorage.getItem(k)); } catch {} }
    return { app: 'atem', format: 1, version, erstellt: new Date().toISOString(), daten };
  },
  import(obj) {
    if (!obj || obj.app !== 'atem' || obj.format !== 1 || typeof obj.daten !== 'object') throw new Error('Keine Atem-Sicherung');
    for (const k of speicher.schluessel()) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(obj.daten)) if (k.startsWith(P)) localStorage.setItem(k, JSON.stringify(v));
  },
  async allesLoeschen() {   // Programm-Schale (atem-schale-*) bleibt: keine persönlichen Daten, App bleibt offline nutzbar
    try { const weg = []; for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (n && n.startsWith('atem.')) weg.push(n); } weg.forEach((n) => localStorage.removeItem(n)); } catch {}
    try { if (self.indexedDB) indexedDB.deleteDatabase('atem.v1.musik'); } catch {}   // 0.1.5 eigene Musik
    try { if (self.caches) for (const n of await caches.keys()) if (n.startsWith('atem-') && !n.startsWith('atem-schale-')) await caches.delete(n); } catch {}
  },
  async persist() { try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch {} return false; }
};
