export const meta = {
  name: 'synq-486-kurzpruefung',
  description: 'Kurze Prüfung 4.86: Sonden der 6 Pakete + Kern-Tests 4.84/4.85 + Rauchtest',
  phases: [{ title: 'Prüfen' }],
}
const N = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu'
phase('Prüfen')
return await agent(`KURZE PRÜFUNG (≤ 15 Minuten, keine Analysen) der Synquenzer 4.86: ${N}/rel-4860/index.html (= 4.85 + Pakete TON1, LT2, ZRL2, ARP2, GES2, VOX2 nacheinander, gebaut mit rel-4860/bau.py; nicht ändern). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
1. Die Kern-Tests/Sonden jedes Pakets (in ${N}/<paket>/, siehe dort STAND.md/CHANGES.md welche Datei der Kern-Test ist: ton1, lt2, zrl2, arp2, ges2, vox2) gegen rel-4860/index.html laufen lassen (Kopien nach ${N}/rel-4860/pruef/<paket>/, nur Pfad/Port/Server-Ordner anpassen; version.json {"version":"4.86.0"} in den Server-Ordner; 404 auf medien/abspann-logo.* ignorieren). Ein Ergebnis gilt als grün, wenn es dasselbe zeigt wie gegen die eigene Paket-Datei.
2. Kern-Tests 4.84/4.85 gegen rel-4860 (Kopien aus ${N}/rel-4850/pruef/).
3. Rauchtest hochkant 428×926 Touch: bereit, ▶/■, ≡ zeigt „4.86.0“, Klang-Editor auf, 0 Seitenfehler, 0 console.error.
4. Keine neuen doppelten Top-Level-Definitionen gegenüber ${N}/rel-4850/index.html (Werkzeug ${N}/rel-4840/pruef/doppelt.js).
Schreibe ${N}/rel-4860/PRUEFUNG.md (x/y je Punkt). Rot: Ursache in 1–2 Sätzen + welches Paket.`, { label: 'kurzpruefung-486', phase: 'Prüfen', schema: { type: 'object', properties: { ok: { type: 'boolean' }, ergebnis: { type: 'string' }, rot: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'ergebnis'] } })
