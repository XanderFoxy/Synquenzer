// Feinschliff – Inhalte laden, erst wenn sie gebraucht werden (JSON unter daten/). Jede Datei wird je Sitzung nur einmal geholt.
const cache = new Map();
export function lade(pfad) {
  if (!cache.has(pfad)) {
    cache.set(pfad, fetch('daten/' + pfad).then((r) => { if (!r.ok) throw new Error(pfad + ' ' + r.status); return r.json(); })
      .catch((e) => { cache.delete(pfad); throw e; }));
  }
  return cache.get(pfad);
}
export const ladeIndex = () => lade('index.json');
export const BEREICH_DATEIEN = ['grammatik', 'hoeren', 'lesen', 'themen', 'wortschatz'];
// Liste eines Bereichs aus dem Index (leere Liste, wenn der Bereich noch keine Dateien hat)
export async function liste(bereich) { try { const i = await ladeIndex(); return i.bereiche?.[bereich] || []; } catch { return []; } }
// Wortschatz-Art aus dem Dateinamen: fremdwoerter, redewendungen, nomen-verb, rektion, genus
export function wortArt(id) {
  const s = String(id).toLowerCase();
  if (s.includes('genus')) return 'genus';
  if (s.includes('rektion')) return 'rektion';
  if (s.includes('nomen-verb') || s.includes('nvv')) return 'nomen-verb';
  if (s.includes('redewend') || s.includes('wendung')) return 'redewendungen';
  return 'fremdwoerter';
}
// Nur auf Wunsch („Alles offline speichern“ in Mehr): alle JSON-Dateien aus dem Index und optional die Hördateien holen.
export async function allesVorladen({ audio = false } = {}) {
  const i = await ladeIndex(); let n = 0;
  for (const b of BEREICH_DATEIEN) for (const e of i.bereiche?.[b] || []) {
    try {
      const d = await lade(e.datei); n++; if (e.uebungen_datei) { await lade(e.uebungen_datei); n++; }
      if (audio && d.audio) for (const p of audioPfade(d.audio)) { const r = await fetch(p).catch(() => null); if (r?.ok) { await r.arrayBuffer(); n++; break; } }
    } catch { /* später erneut */ }
  }
  for (const s of Object.values(i.sammlungen || {})) { try { await lade(s.datei); n++; } catch { /* optional */ } }
  try { await lade('ressourcen.json'); await lade('vorlagen.json'); } catch { /* optional */ }
  return n;
}
// Audio-Pfad aus hoeren/<id>.json: zuerst relativ zu daten/hoeren/, dann zu daten/, dann zur App.
export const audioPfade = (a) => ['daten/hoeren/' + a, 'daten/' + a, a];
