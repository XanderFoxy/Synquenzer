export const meta = {
  name: 'synq-484-kurzpruefung',
  description: 'Kurze Prüfung der zusammengebauten 4.84: Kern-Tests der drei Pakete + Rauchtest auf rel-4840/index.html',
  phases: [{ title: 'Prüfen' }],
}
const N = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu'
phase('Prüfen')
const r = await agent(`KURZE PRÜFUNG (Ziel ≤ 10 Minuten, keine Analysen, nur feststellen ob etwas kaputt ist) der zusammengebauten Synquenzer 4.84: ${N}/rel-4840/index.html (= Basis 4.83 ${N}/base/index.html + Pakete VL3, MLG3, KMP1, gebaut mit ${N}/rel-4840/bau.py; nicht ändern). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
1. Die Kern-Tests der Pakete laufen lassen, aber gegen rel-4840/index.html statt gegen ihre eigene index.html: ${N}/vl3/test.js, ${N}/mlg3/kern.js und ${N}/mlg3/quer.js, ${N}/kmp1/kern.js. Kopiere sie nach ${N}/rel-4840/pruef/ und passe nur den Pfad/Server-Ordner an (lege in den Server-Ordner eine version.json {"version":"4.84.0"}, damit kein 404 kommt).
2. Rauchtest: Datei per python3 -m http.server laden, Chromium (require('playwright')) hochkant 428×926 Touch: App bereit, ▶ und ■ tippen, ≡ öffnen, Klang-Editor einer Synth-Spur öffnen; 0 Seitenfehler, 0 console.error; angezeigte Version 4.84.0.
3. Statisch: keine doppelten Top-Level-Definitionen (function/const/let/class gleichen Namens zweimal auf oberster Ebene im selben Skript, auch in den stillen Blöcken <script type="text/plain" id="sq-…-src">) – nur NEUE gegenüber base zählen.
Schreibe ${N}/rel-4840/PRUEFUNG.md (x/y je Test). Wenn etwas rot ist: Ursache in 1–2 Sätzen und welches Paket.`, { label: 'kurzpruefung', phase: 'Prüfen', schema: { type: 'object', properties: { ok: { type: 'boolean' }, ergebnis: { type: 'string' }, rot: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'ergebnis'] } })
return r
