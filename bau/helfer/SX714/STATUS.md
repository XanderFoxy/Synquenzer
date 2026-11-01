# SX714 – STATUS: fertig (wartet auf Xanders Okay)

Basis: bau/snapshots/R-4310.html (4.31.0) → bau/helfer/SX714/index.html, VERSION '4.31.0', patch.diff gegen R-4310.
Geänderte Stellen: „SX714“ (JS-Kommentare), CSS-Block `/* SX714-CSS-BEGIN */ … /* SX714-CSS-END */`, Präfixe sx7…/sx14….

## Tests (Playwright, Touch, 428×926 und 926×428; je < 2 min)
- `tests/sx7.mjs`: Schalter 44×44 (quer 44×56), Linie sichtbar; Wischen → 145–202 Schläge erklungen, 5 Blitze an Taktstrichen, Marke ▼ = Takt unter der Linie, ▶ startet dort (bar0 = Marke), Takt 1 erreichbar, 0 hängende Töne nach 0,9 s, kein Nachrollen; aus → Ansicht wieder normal. **grün**
- `tests/sx14.mjs`: 4 benannte Schritte; ↶ halten → Liste (Zeilen 44 px, „jetzt“); Sprung 2 zurück = genau Stand 2, ↷-Eintrag = wieder Stand 4; ＋ Schnappschuss „vor dem Umbau“ (15 KB bei 30-KB-Projekt), zweiter nur +1,7 KB (Verweise); Zurückholen = exakt der gemerkte Stand, 1 Undo-Schritt, ↶/↷ davon korrekt, Undo-/Redo-Listen bleiben; Speichern-Rundweg mit Feld gleich, ohne Feld Zeichen für Zeichen gleich. **grün**
- `bau/tests/smoke.mjs`: keine Fehler. `tests/check.mjs`: acorn 24 Skripte ohne Fehler, `live: true` 1×, verbotene Wörter 0, „MS 2000“ 1×, Version 4.31.0.
- Bildschirmfotos angesehen: Wischen hochkant, Leiste quer, Liste hochkant + quer.

## Bitte prüfen (iPhone)
1. Song-Ansicht: Lautsprecher an, langsam wischen – klingt jeder Schlag sauber kurz an (kein Stottern, nichts hängt nach)? Blitz am Taktstrich gut sichtbar?
2. Loslassen: steht ▼ dort, wo du willst, und startet ▶ da?
3. Hochkant: ist SCHLEIFE neben dem Lautsprecher noch gut lesbar (▶ SONG ist dafür 52 statt 76 px breit)?
4. ↶ halten → Liste: Sprung zu einem älteren Stand und mit ↷ wieder vor – passt alles?
5. Schnappschuss „vor dem Umbau“ merken, umbauen, zurückholen, dann ↶ – ist der Umbau wieder da?

## Hinweise
- Zurückholen eines Schnappschusses lädt den Stand wie „Version zurückholen“: laufender Song stoppt, offene Blätter schließen.
- Gesang-Aufnahmen (STIMME) klingen beim Mithören nicht mit (Audio, nicht schlagweise).
