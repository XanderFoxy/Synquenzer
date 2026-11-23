export const meta = {
  name: 'synq-485-kurzpruefung',
  description: 'Kurze Prüfung 4.85: Sonden ENT1B/C/D + Rauchtest auf rel-4850/index.html',
  phases: [{ title: 'Prüfen' }],
}
const N = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu'
phase('Prüfen')
return await agent(`KURZE PRÜFUNG (≤ 10 Minuten, keine Analysen) der Synquenzer 4.85: ${N}/rel-4850/index.html (= 4.84 + Pakete ENT1B, ENT1C, ENT1D, gebaut mit rel-4850/bau.py; nicht ändern). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
1. Die Sonden der Pakete gegen rel-4850/index.html laufen lassen (Kopien nach ${N}/rel-4850/pruef/, nur Pfad/Server-Ordner anpassen; version.json {"version":"4.85.0"} in den Server-Ordner): ${N}/ent1b/probe.js, ${N}/ent1c/sonde.js, ${N}/ent1d/sonde.js (+ sonde2.js falls vorhanden). Bekannte harmlose 404 auf medien/abspann-logo.* im Testserver ignorieren.
2. Zusätzlich die 4.84-Kern-Tests kurz gegen rel-4850 (Kopien aus ${N}/rel-4840/pruef/{vl3,mlg3,kmp1}/, Pfad anpassen).
3. Rauchtest hochkant 428×926 Touch: bereit, ▶/■, ≡ zeigt „4.85.0“, Klang-Editor auf, 0 Seitenfehler, 0 console.error.
4. Keine neuen doppelten Top-Level-Definitionen gegenüber ${N}/rel-4840/index.html (Werkzeug ${N}/rel-4840/pruef/doppelt.js wiederverwenden).
Schreibe ${N}/rel-4850/PRUEFUNG.md (x/y je Punkt).`, { label: 'kurzpruefung-485', phase: 'Prüfen', schema: { type: 'object', properties: { ok: { type: 'boolean' }, ergebnis: { type: 'string' }, rot: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'ergebnis'] } })
