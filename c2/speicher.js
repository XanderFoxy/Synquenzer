// Feinschliff – lokaler Speicher. Alles bleibt auf dem Gerät (localStorage), jeder Zugriff abgesichert:
// In privaten Fenstern oder bei gesperrtem Speicher läuft die App mit einem Speicher im Arbeitsspeicher weiter.
const P = 'fs1:';
const mem = new Map();
const lesen = (k) => { try { return localStorage.getItem(P + k); } catch { return null; } };
export const speicher = {
  lies(k, std) {
    if (mem.has(k)) return mem.get(k);
    let v = std; const r = lesen(k);
    if (r != null) { try { v = JSON.parse(r); } catch { v = std; } }
    if (v && typeof v === 'object' && std && typeof std === 'object' && !Array.isArray(std)) v = { ...std, ...v };
    mem.set(k, v); return v;
  },
  schreib(k, v) { mem.set(k, v); try { localStorage.setItem(P + k, JSON.stringify(v)); } catch { /* nur im Arbeitsspeicher */ } },
  aendere(k, std, fn) { const v = this.lies(k, std); const n = fn(v) ?? v; this.schreib(k, n); return n; },
  // Sichern/Laden als Datei (iPhone: Safari und Home-Bildschirm-App haben getrennte Speicher)
  export() { const d = {}; try { for (const k of Object.keys(localStorage)) if (k.startsWith(P)) d[k.slice(P.length)] = JSON.parse(localStorage.getItem(k)); } catch { /* nur Arbeitsspeicher */ } for (const [k, v] of mem) if (!(k in d)) d[k] = v; return { app: 'feinschliff', stand: 1, zeit: new Date().toISOString(), daten: d }; },
  import(o) { if (!o || o.app !== 'feinschliff' || typeof o.daten !== 'object') throw new Error('falsches Format'); let n = 0; for (const [k, v] of Object.entries(o.daten)) { this.schreib(k, v); n++; } return n; },
  // Der Wünsche-Kanal (Gerätekennung, Entwürfe, Wartendes) bleibt: sonst wären die eigenen Nachrichten an Claude nicht mehr sichtbar
  allesLoeschen() { for (const k of [...mem.keys()]) if (k !== 'walkie') mem.delete(k); try { Object.keys(localStorage).filter((x) => x.startsWith(P) && x !== P + 'walkie').forEach((x) => localStorage.removeItem(x)); } catch { /* egal */ } },
};
// Datum als lokaler Tagesschlüssel JJJJ-MM-TT (nicht UTC: der Lerntag endet um Mitternacht vor Ort)
export const tag = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const tagPlus = (t, n) => { const [j, m, d] = t.split('-').map(Number); return tag(new Date(j, m - 1, d + n)); };
export const tageZwischen = (a, b) => { const [j1, m1, d1] = a.split('-').map(Number), [j2, m2, d2] = b.split('-').map(Number); return Math.round((Date.UTC(j2, m2 - 1, d2) - Date.UTC(j1, m1 - 1, d1)) / 864e5); };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const mische = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
