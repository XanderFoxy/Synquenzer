# ND-P – North-Platte · Stand 01.11. (Basis R-4300, VERSION 4.30.0)

**Status: gebaut und maschinell geprüft – nicht fertig, bis Xander sie auf dem iPhone gesehen hat.**

## Tests (`tests/alle.sh`, Chromium + CDP-Touch)

| Test | Ergebnis | Stand |
|---|---|---|
| Regeln: VERSION, 1× `live: true,`, „MS 2000“ 1×, verbotene Wörter 0 (App, Tests, Doku), kein Emoji, Block erst beim Öffnen, keine Netz-/DB-Zugriffe | 20/20 | grün |
| Öffnen/Schließen 428×926 · 926×428 · 428×650: Kopf-Knopf + „North-Platte“-Knopf (echter Touch), alles im Bild, Treffer ≥ 44 px, kein waagrechtes Scrollen, keine Überlappung – in GERÄT, jeder Sektion normal + ZOOM, SPIEL; ✕, Esc, Drehen | 111/111 | grün |
| Sektionen: jeder der 32 Regler (beide Reihen, alle 5 Sektionen) ändert genau seinen Wert; Anzeige Platte = Zelle im North-Editor; Zoom, Mittelraste, Doppeltipp INIT, SHIFT, Rad fein (PITCH 0,1), RATE/BPM, TAP 4× 500 ms → 120 ♩ | 103/103 | grün |
| Spielen: Kanal-Taste hörbar (Ausgang −17 … −42 dBFS aus Stille) + wählt; Anschlag nach Tipp-Höhe; TRIG; Halten = Programm-Liste; SHIFT + Taste = Quelle (ein Undo); SOLO PART per Halten; PROG-Rad (deep-equal Werks-Programm, ein Undo); KIT-Rad; BANK; SPIEL-Pads | 25/25 | grün |
| Daten: Instrument-Wahl (alle 12 Pads North mit `MDX.roleProg`, ein Undo, Undo = deep-equal vorher); Geste = 1 Undo, ↶/↷ der Platte, Anzeige folgt; ALLE KANÄLE; `historyCheck()`; Datei speichern/laden + Neuladen deep-equal; Bibliothek; alte Dateien (mit/ohne North) Zeichen für Zeichen gleich wie R-4300; North-Offline-Render bitgleich | 18/18 | grün |
| Leistung: Start Hauptthread −1,6 % (A/A-Rauschen −2,5 %), Block 2,6 ms, Öffnen ohne lange Aufgabe, Drehen Ø 0,25 ms / max 1,1 ms je pointermove, 60 Bilder/s; mit 4× CPU-Bremse 95 % ≤ 2,2 ms (Spitze 4,9 ms) | 7/7 | grün |
| Rauchtests `bau/tests/smoke.mjs`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | 4/4 | grün |
| MK-Platte: vorhandene Tests `v3-qmkp-smoke/-44/-rahmen/-hit/-gest/-daten` gegen R-4300 und NDP – gleiches Ergebnis | 6/6 | grün |

Hinweise: Vorhandene North-Tests (`md2-ui`, `md4-*` aus der Spec) liegen nicht im Repo – der Abgleich mit dem North-Editor steckt
deshalb in `ndp-sektionen.mjs`. Startzeit: die Uhrzeit streut hier selbst bei derselben Datei um bis zu ± 7 %; geprüft wird die
Hauptthread-Arbeit (CDP), mit einer A/A-Kopie als Rauschmaß. Die 4,9-ms-Spitze unter 4× Bremse ist ein Einzelwert (Speicherbereinigung);
ohne Bremse (iPhone-12-Klasse) liegt das Maximum bei 1,1 ms.

Bilder: `tests/bilder/` – `platte-H/Q/K.png`, je Sektion normal + `-zoom`, `spiel-*.png`, `editor-kopf-*.png`, `editor-sound-*.png`.

## Bitte prüfen (iPhone)

1. Drum-Spur → Editor → rote Taste **● North** oben: werden alle Pads North, öffnet die Platte, wirkt sie wie ein Instrument?
2. **Kanal-Tasten** antippen: kommt der Schlag sofort, oben lauter als unten?
3. Einen **Regler** ziehen und das große **Rad** im Kreis drehen: fühlt sich das gerastet und richtig schnell an?
4. **TONE** zweimal tippen (ZOOM), dann wischen; **NOISE halten** (SOLO PART) – verständlich?
5. **Display** antippen (PROG), Rad drehen: wechselt das Programm des Kanals hörbar? ↶ holt es zurück?
6. Querformat drehen: alles lesbar, nichts verdeckt?
7. Die fünf Fragen in `CHANGES.md` (Kopf-Knopf neben NORTHI, Instrument-Wahl, Anschlag, Kits, Rot-Ton).
