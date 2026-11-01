# SX8 – Status: fertig gebaut, wartet auf Xanders Okay

Basis `bau/snapshots/R-4310.html` (4.31.0, VERSION unverändert). Code-Stellen mit `// SX8` bzw. `/* SX8-CSS-BEGIN */ … /* SX8-CSS-END */`.
Neue Namen: `sx8…`, `SX8_…`; Hilfsfunktion „Schläge je Takt“: `sx8Bpb()`.

## Tests (schlank)
- `tests/sx8-abnahme.mjs` (Playwright, CDP-Zwei-Finger-Touch, 428×926 und 926×428): **22/22 OK**
  – Geste = nur Transform (cellW bleibt bis zum Ende) · Zoom ×1,4 · Median 16,7 ms je Bild (≥ 59 Bilder/s)
  – max 192 px/Takt · min = ganzer Song + Farbblöcke · Griffe aus bei kleinem Zoom
  – Doppeltipp zwei Finger ⇄ ganzer Song · Zoom gemerkt (uiPrefs), nicht im Projekt
  – Mini-Karte beim weiten Ziehen einer Marke, weg danach · keine Seitenfehler
- `bau/tests/smoke.mjs`: keine Fehler.
- acorn: alle 20 Skripte parsen, keine doppelten Namen. `  live: true,` 1×, „MS 2000“ 1×, verbotene Wörter 0.
- Bildschirmfotos: `tests/sx8-P-schlaege.png`, `tests/sx8-P-bloecke.png`, `tests/sx8-L-minikarte.png`.

## Bitte prüfen (iPhone, Safari)
1. Zwei Finger im Song auseinander/zusammen: fühlt es sich flüssig an, bleibt der Takt unter den Fingern? Zoomt nie die ganze Seite?
2. Ganz raus: Teile als Farbblöcke mit Namen – lesbar? Ein Tipp in die Blöcke zoomt dorthin (ändert keine Zelle).
3. Doppeltipp mit zwei Fingern: ganzer Song ⇄ zurück.
4. Marke halten und weit ziehen: erscheint die Mini-Karte und landet die Marke dort, wo der Finger auf der Karte ist?
5. Projekt wechseln und zurück: ist der Zoom je Projekt wieder da?

Hinweis: Übergangs-Chips gibt es in R-4310 im Song-Fenster noch nicht als eigene Zeichnung; alles, was dort an `SV.cellW` hängt, skaliert mit.
