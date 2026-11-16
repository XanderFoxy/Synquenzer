// Mischpult 0.2 – messwerte-worker.js: misst eine Datei nach der anderen (fingerabdruck.js), getrennt vom Rechen-Worker,
// damit Mischen/Anhören frei bleiben. Nachricht {id, file, kontext} → Fortschritt {id, anteil} → {id, ok:true, ergebnis (JSON-Text)} | {id, ok:false, fehler, code}.
// Abbruch: {abbrechen: id}. Nach jeder Datei bleibt nichts im Speicher (nur das kleine Ergebnis geht zurück).
import { fingerabdruckDatei } from './fingerabdruck.js';

const laufend = new Map();
self.onmessage = async (e) => {
  const m = e.data || {};
  if (m.abbrechen != null) { const s = laufend.get(m.abbrechen); if (s) s.abgebrochen = true; return; }
  const sig = { abgebrochen: false }; laufend.set(m.id, sig);
  try {
    const d = await fingerabdruckDatei(m.file, { signal: sig, fort: (x) => postMessage({ id: m.id, anteil: Math.round(x * 1000) / 1000 }) });
    if (m.kontext) d.kontext = m.kontext;
    postMessage({ id: m.id, ok: true, ergebnis: JSON.stringify(d) });   // als Text: der Haupt-Faden muss nichts mehr umwandeln
  } catch (f) {
    postMessage({ id: m.id, ok: false, fehler: String((f && f.message) || f), code: (f && f.code) || null });
  } finally { laufend.delete(m.id); }
};
