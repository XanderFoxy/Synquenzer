export const meta = {
  name: 'synq-487-kurzpruefung',
  description: 'Kurze Prüfung 4.87: Kern-Tests der 9 Pakete + 4.84–4.86-Prüfungen + Rauchtest',
  phases: [{ title: 'Prüfen' }],
}
const N = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu'
phase('Prüfen')
return await agent(`KURZE PRÜFUNG (≤ 15 Minuten, keine Analysen) der Synquenzer 4.87: ${N}/rel-4870/index.html (= 4.86 + Pakete TON2, ZRL3, DRUM1, KE2, IMP4, TRP2, BM1, VOX3, IMPS nacheinander, gebaut mit rel-4870/bau.py; nicht ändern). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
1. Kern-Test jedes Pakets (in ${N}/<paket>/STAND.md steht, welche Datei; Pakete: ton2 zrl3 drum1 ke2 imp4 trp2 bm1 vox3 imps) gegen rel-4870/index.html laufen lassen (Kopien nach ${N}/rel-4870/pruef/<paket>/, nur Pfad/Port/Server-Ordner anpassen; version.json {"version":"4.87.0"} in den Server-Ordner; 404 auf medien/abspann-logo.* ignorieren). Grün = gleiches Ergebnis wie gegen die eigene Paket-Datei. Bei Zeitmessungen gilt die Richtung (schneller), nicht der genaue Wert.
2. Prüfungen der Vorversionen gegen rel-4870 (Kopien aus ${N}/rel-4860/pruef/ – dort liegen die Sonden von 4.84–4.86).
3. Rauchtest hochkant 428×926 Touch: bereit, ▶/■, ≡ zeigt „4.87.0“, Klang-Editor auf, 0 Seitenfehler, 0 console.error.
4. Keine neuen doppelten Top-Level-Definitionen gegenüber ${N}/rel-4860/index.html (${N}/rel-4840/pruef/doppelt.js).
Schreibe ${N}/rel-4870/PRUEFUNG.md (x/y je Punkt). Rot: Ursache in 1–2 Sätzen + welches Paket.`, { label: 'kurzpruefung-487', phase: 'Prüfen', schema: { type: 'object', properties: { ok: { type: 'boolean' }, ergebnis: { type: 'string' }, rot: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'ergebnis'] } })
