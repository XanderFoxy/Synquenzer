# STATUS G6+g (Zweig g6p-g)

**Stand:** fertig zum Zusammenführen, Abnahme durch Xander offen („Bitte prüfen“ unten). VERSION unverändert 4.25.2.

| Prüfung | Ergebnis |
|---|---|
| G6P-60 Farbe/Ziffer (36 Fälle inkl. Dezime „10“, Oktave unten „8“, Akkord-Rolle Gleichstand) | ✓ |
| G6P-60 Kontrast hell/dunkel ≥ 3 : 1 | ✓ dunkel min 6,03, hell min 4,48 |
| G6P-61 Lage: Start ± 1 px, Zeile = Ton (16 Schatten) | ✓ Δ 0,00 px |
| G6P-61 Pixel in Spurfarbe | ✓ 9/9 |
| G6P-61 Auge / Solo endet beim Schließen / Tipp öffnet Stimme (Lead grau) | ✓ |
| G6P-61 Wellen-Editor: farbige Linien | ✓ |
| G6P-62 Bildzeit 4 Stimmen, 32-s-Take, 256 Schatten: p95 Δ ≤ 2 ms | ✓ Δ ≈ 0,2 ms (Prüfrechner) |
| G6P-62 ohne Änderung: 0 Neuzeichnungen (80/80 Bild-Treffer); Zoomen/Scrollen: 0 Geometrie-Neuberechnungen | ✓ |
| v2 Stufen-Ton (C-Dur, Terz oben 8/8), v2-Spurfarben aus Rollen | ✓ |
| G6P-63 Lead −12,00 dB, Schalter aus ⇒ stumm, Ziel hörbar, andere stumm | ✓ |
| G6P-63 Aufnahme ersetzt Stimme (Pan/Pegel bleiben, `dblOff`, 1 Undo-Schritt) | ✓ |
| M-PLATZ 6 Formate (P1…L3): Treffer ≥ 44 × 44, keine Überbreite, nichts abgeschnitten, Leinwand-Höhe = Basis | ✓ |
| Ohne Chor: Noten- und Marken-Editor pixelgleich zur Basis | ✓ |
| Smoke (Start, keine Fehler) | ✓ |

Tests: `tests/g6pg.mjs` (G6P-60…63), `tests/platz.mjs` (6 Formate), `tests/ohnechor.mjs` (BASE=…/R-4252.html MINE=…/index.html), `tests/clip.mjs` (Vergleich Stärke-Zeile), `tests/smoke.mjs`.
Bildschirmfotos: `shots/` (g2-schatten, g2-chorstimme, g2-selbst-singen, g2-v2-4stimmen, wp-linien, platz-P1…L3, smoke).

**Gemessen nur am Prüfrechner (Chromium headless), nicht am iPhone.** Die Bildzeit am iPhone ist geschätzt (Ziel ≤ 2 × Prüfrechner).

**Abweichung zur Spec (zur Entscheidung):** Legende nur im Noten-Editor, nicht im Marken-Editor (zu wenig Höhe, siehe CHANGES).

## Bitte prüfen (Xander, ≈ 2 min)
1. STIMME-Clip → Chor „Dreistimmig“ → ♪ Tonhöhe öffnen: Siehst du die Chorstimmen farbig hinter deinen Noten (Terz rot, Quinte grün …)?
2. Oben in der Legende das Auge einer Stimme antippen → Schatten weg? S → nur diese Stimme klingt; Editor schließen → Solo aus?
3. Auf einen farbigen Schatten tippen → öffnet sich diese Stimme mit deinem Lead grau dahinter?
4. Chor-Blatt → „Selbst singen“ → Lead leise (−12 dB) hörbar, Stimme kräftig hervorgehoben; ● aufnehmen → ersetzt die Stimme?
