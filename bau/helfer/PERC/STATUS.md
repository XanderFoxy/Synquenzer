# PERC – Status

Stand 01.11. · Basis R-4300 (4.30.0) · Zweig `perc-spur` · alle Tests: `bash bau/helfer/PERC/tests/alle.sh` → **FEHLER: 0**

Noch nicht auf einem iPhone gehört – „grün“ heißt: in Chromium gemessen, nicht von Xander abgenommen.

## Tests (Chromium headless, Playwright)

| Test | Ergebnis | Messwert |
|---|---|---|
| North auf Spur 6 (MELODIE) über ⋯ → North wählen | grün | 1 Undo-Schritt, Reiter NORTH, 12 Kanäle, Chip „North ▾“ |
| Noten → Kanäle (Tastatur, Schlag-Log + Worklet `state`) | grün | 60…71 → Kanal 1…12 (±0), 72 → KICK +12, 49 → SNARE −12; 9 Kanäle klingen |
| Akkord-Transposition (Träger Dm) + Eine Skala | grün | North 60/62/64/66 bleibt; Synth 4 → 62/64/65/67; Clip spielt Kanäle 1/3/5/7 |
| Schild „folgt nicht“ am Spurkopf | grün | sichtbar, innerhalb des Kopfes (3 Bildgrößen angesehen) |
| Zurückschalten stellt follow wieder her, Undo/Redo je Wechsel | grün | VA → North → VA verlustfrei (Klang-JSON gleich), Schild-Schalter = eigener Undo |
| Speichern/Laden | grün | deep-equal **und** zeichengleich; `p.nk`, `percF` bleiben |
| Bibliothek (sichern → VA → laden) | grün | Datensatz `engine: north`, gleicher Klang, follow wieder aus |
| MIDI-Export (Szene) | grün | Kanal 10, GM 36/38/42/49, kein Programmwechsel |
| Video-Offline-Render | grün | hörbar (Spitze 0,37, stumm = 0), 16 Schläge im Render-Log; zwei Renders ≤ 1 LSB gleich* |
| GarageBand-Export (WAV) | grün | Spitze 0,36; North-Spur stumm → 0 |
| Konsolidieren | grün | Render vor/nach ≤ 1 LSB gleich*, Spur bleibt North/folgt nicht |
| Rolle: Kanal-Namen | grün | KICK, SNARE, SHAK., KICK +1, SHAK. −1, SHAK. −2 |
| Alte Projekte zeichengleich (R-4300 ↔ PERC) | grün | 6 Stände (Demo, jede Engine, Drum-Spur mit North-Pads; laden, wechseln, Undo-Schnappschüsse) |
| North-Regression Drum-Spur | grün | `mdRender` bitgleich zu R-4300, Schlag-Log gleich, Klang gleich |
| Modul nur bei Bedarf | grün | Demo ▶ ohne North: `synq-md` idle, 0 Knoten |
| CPU | grün | 12 North-Pads ≈ 1,2–2,1 %; + eine North-Spur (16tel, 12 Kanäle) ≈ 3,9–6,1 % (Spitze ≤ 9,1 %) |
| Bildschirmfotos 428×926, 926×428, 428×650 | grün | `tests/bilder/`, alle Tasten der Seite NORTH ≥ 44 px, kein Querüberlauf |
| Rauchtests `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | grün | keine Fehler |
| Regeln | grün | 1× `  live: true,`, „MS 2000“ 1×, verbotene Wörter 0, VERSION 4.30.0 |

\* Synth-Spuren rendern schon in R-4300 nicht bitgleich (±1 LSB an ~12 Stellen, gemessen mit einer VA-Spur); die Drum-Spur mit
North-Pads ist bitgleich. Die North-Spur verhält sich wie jede Synth-Spur (eigener Spur-Kanal mit Hall-Send) – darum der Vergleich ≤ 1 LSB.

Vorhandene North-Tests: im Repo liegen keine (die ND-Tests sind auf den Helfer-Zweigen); stattdessen `north-regress.mjs` gegen R-4300.

## Bitte prüfen (iPhone, Kopfhörer)

1. Synth 4 → KLANG → `⋯` → „North – Perkussionsspur“: Schild „folgt nicht“ am Spurkopf? Akkord drücken: North-Spur bleibt, Synths gehen mit?
2. Tasten C4…H4 = KICK … SHAKER wie auf der Seite NORTH beschriftet? Oktave hoch/runter = derselbe Kanal höher/tiefer – klingt das brauchbar?
3. FX › SPUR (Hall, Echo, Drive, Pumpen) auf der North-Spur hörbar? Kit-Hall des Kits „Gestimmt“ / Echo von „Schräg“ hörbar?
4. Chip „North ▾“ → VA: der alte Synth-Klang ist wieder da und folgt wieder; ↶ nimmt den Wechsel in einem Schritt zurück?
5. Video aus einem Song mit North-Spur: klingt die Spur wie live?
6. Drum-Spur und North-Spur gleichzeitig (16tel): Aussetzer? (Chromium: +3–4 % Last; das iPhone kann anders sein.)

## Offen / bewusst nicht gemacht

- Ohne AudioWorklet (ECO / alte Browser) bleibt die North-Spur still (Hinweis), es gibt keinen Ersatzklang.
- Der Klang-Browser (Bibliothek) zeigt für North-Spuren nur eigene North-Klänge; Kits wählt man über Kit ▾ bzw. ‹ ›.
- Notenlänge: ein North-Schlag klingt nach seinem Programm aus (wie ein Drum-Pad); das Loslassen der Taste schneidet nicht ab.
- MIDI-Export: Oktav-Tonhöhe der Kanäle geht verloren (GM-Schlagzeug hat keine).
