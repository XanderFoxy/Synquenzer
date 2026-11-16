// Mischpult 0.1 – render-worker.js: Rechen-Worker (ES-Modul). Hält das offene Projekt; alle Durchläufe laufen hier (KONZEPT C.3).
// Start: new Worker(new URL('./render-worker.js', import.meta.url), {type: 'module'})
// Nachrichten (alle mit id): siehe SCHNITTSTELLE.md. Fortschritt: {id, teil, anteil}. Ergebnis: {id, ok: true, ergebnis} | {id, ok: false, fehler, code}.
// Abbruch: {abbrechen: id} → die laufende Rechnung endet mit {id, ok:false, code:'abgebrochen'}; danach ist alles wie vorher.
import { Projekt, pruefeDatei, VERSION } from './ablauf.js';
import { merkmaleKlein, ROLLEN_ANZEIGE } from './analyse.js';
import { lesBereich, lesStuecke } from './wav.js';

let projekt = null;

/** Wellenbild für die Rollen-Seite: 160 kurze Fenster (je 2048 Proben) statt der ganzen Datei – schnell, wenig Speicher. 0..1 (Wurzel). */
async function welle({ file, kopf }, n = 160) {
  const w = new Float32Array(n), len = Math.min(2048, kopf.frames); let mx = 1e-9;
  if (kopf.frames <= 60 * kopf.sr) {   // kurze Datei: einmal in großen Stücken lesen (weniger Lese-Aufrufe), genaue Spitzen
    for await (const s of lesStuecke(file, kopf)) for (let i = 0; i < s.L.length; i++) { const b = Math.min(n - 1, ((s.pos + i) * n / kopf.frames) | 0), a = Math.max(Math.abs(s.L[i]), Math.abs(s.R[i])); if (a > w[b]) w[b] = a; }
    for (let b = 0; b < n; b++) if (w[b] > mx) mx = w[b];
  } else
  for (let b = 0; b < n; b++) {
    const st = Math.min(Math.max(0, kopf.frames - len), Math.floor((b + 0.5) * kopf.frames / n - len / 2));
    const s = await lesBereich(file, kopf, Math.max(0, st), len); let p = 0;
    for (let i = 0; i < s.L.length; i++) { const a = Math.abs(s.L[i]), c = Math.abs(s.R[i]); if (a > p) p = a; if (c > p) p = c; }
    w[b] = p; if (p > mx) mx = p;
  }
  for (let b = 0; b < n; b++) w[b] = Math.sqrt(w[b] / mx);
  return w;
}
const laufend = new Map();

async function bearbeite(m) {
  const sig = { abgebrochen: false }; laufend.set(m.id, sig);
  const fort = f => postMessage({ id: m.id, teil: f.teil, anteil: Math.round(f.anteil * 1000) / 1000 });
  const opt = { signal: sig, onFortschritt: fort };
  switch (m.auftrag) {
    case 'version': return { version: VERSION, rollen: ROLLEN_ANZEIGE };
    case 'oeffnen': {
      projekt = await Projekt.oeffne(m.files, m.optionen || {});
      const spuren = [];
      for (let k = 0; k < projekt.spuren.length; k++) spuren.push({ ...projekt.spuren[k], welle: await welle(projekt.quellen[k]) });
      return { song: projekt.song, sr: projekt.sr, laengeS: +(projekt.frames / projekt.sr).toFixed(2), spuren, hinweise: projekt.hinweise, fehler: projekt.fehler };
    }
    case 'mischen': { // Schritt 3: Analyse + Vormischung + Master-Plan + Nachmessen
      projekt.album = m.album || null;
      const z = await projekt.mischenUndMastern({ rollen: m.rollen, eingriff: m.eingriff || 'mittel', ziel: m.ziel || 'streaming', ...opt });
      return { ...z, merkmale: projekt.merkmale.map(merkmaleKlein), uebersicht: projekt.uebersicht };
    }
    case 'einstellen': { // Ziel/Eingriff/Rolle/Hauptsache/So lassen geändert (Rückgängig = alter Zustand noch einmal)
      if (m.rollen) projekt.rollen = m.rollen.map(r => ({ rolle: r.rolle, hauptsache: !!r.hauptsache, solassen: !!r.solassen, ...(r.aus ? { aus: true } : {}) }));
      projekt.album = m.album || null;   // Album: gemeinsame Kurve + Lautheits-Versatz (ruhiger Song)
      const P = await projekt.nachmesse(m.eingriff || 'mittel', m.ziel || 'streaming', opt);
      return projekt.zusammenfassung(m.eingriff || 'mittel', m.ziel || 'streaming', P);
    }
    case 'texte': { // „was gemacht wird“ je Eingriff für andere Rollen – nur die Entscheidung (schnell, synchron), Zustand bleibt unverändert
      const alt = projekt.rollen;
      if (m.rollen) projekt.rollen = m.rollen.map(r => ({ rolle: r.rolle, hauptsache: !!r.hauptsache, solassen: !!r.solassen, ...(r.aus ? { aus: true } : {}) }));
      try { return Object.fromEntries((m.eingriffe || ['sanft', 'mittel', 'kraeftig']).map(e => [e, projekt.plan(e).spuren.map(ps => ps.texte || [])])); } finally { projekt.rollen = alt; }
    }
    case 'vorher': return await projekt.vorherWav(opt);
    case 'schreiben': {
      projekt.album = m.album || null;
      const r = await projekt.schreibe({ eingriff: m.eingriff, ziel: m.ziel, song: m.song || projekt.song, zaehler: m.zaehler || 1, ...opt });
      const aus = { master: r.master, instr: r.instr, rezept: { name: r.rezept.name, text: r.rezept.text, blob: r.rezept.blob, json: r.rezept.json }, messung: r.messung, pruefung: r.pruefung };
      if (m.zip) aus.zip = r.zip();
      return aus;
    }
    case 'pruefen': return await pruefeDatei(m.file, { ziel: m.ziel || 'streaming', ...opt });
    case 'schliessen': projekt = null; return { ok: true };
    default: throw Object.assign(new Error('unbekannter Auftrag: ' + m.auftrag), { code: 'auftrag' });
  }
}

self.onmessage = async e => {
  const m = e.data || {};
  if (m.abbrechen != null) { const s = laufend.get(m.abbrechen); if (s) s.abgebrochen = true; return; }
  try {
    if (!projekt && !['oeffnen', 'pruefen', 'version'].includes(m.auftrag)) throw Object.assign(new Error('kein Projekt offen'), { code: 'kein-projekt' });
    const ergebnis = await bearbeite(m);
    postMessage({ id: m.id, ok: true, ergebnis });
  } catch (err) {
    postMessage({ id: m.id, ok: false, fehler: String(err && err.message || err), code: err && (err.code || (err.abgebrochen ? 'abgebrochen' : null)) || null });
  } finally { laufend.delete(m.id); }
};
