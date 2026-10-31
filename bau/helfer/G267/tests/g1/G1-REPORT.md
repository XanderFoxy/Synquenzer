# G1 – unabhängige Prüfung (Helfer G267, 31.10.2026)

Prüfling: Kopie `bau/helfer/G267/g1work/index.html` von `bau/vs/n5-br-G/index.html` (Version 4.25.0), unverändert.
Vergleich: `bau/werkzeug/vs-base-B.html` (4.23.0). Chromium 1243 headless, Playwright. Ausgaben in `tests/g1/out/`.

## Ergebnis

| ID | Ergebnis | Messung |
|---|---|---|
| G1-01 | ✓ | **Eigener Test bei 97 BPM, 1/16-Raster, ungerade Abstände** (0/+37/−23/+51/−58/+13/−41/0/+59/−7/+29/−53 ms), am Ausgang mitgeschnitten (Worklet), Kreuzkorrelation je Silbe. Echter Touch-Tipp [1/16] → Dehnen 100 %: **max 3,5 ms** neben dem Raster (12/12). Stärke 50 % (Maus-Klick auf den Regler): halber Abstand **max 2,0 ms**. Scheiben 50 %: max 2,0 ms. 1/8 Scheiben 100 %: max 3,5 ms. Die Messung ist kalibriert (Original gehört wie gesungen, max 0,2 ms). Gegenprobe 4.23.0, gleicher Test: 1/16-Tipp max **18,3 ms** daneben (Standard 70 %). Skript des Bauenden (120 BPM, 1/8): Editor 100 % max 3,4 ms, 50 % max 1,8 ms, Scheiben 3,4/1,7 ms, Song 3,4 ms, „Audio folgt“ 1/16 max 3,0 ms. |
| G1-02 | ✓ | Pixelvergleich (weiße Markenspalten gegen die gerechneten Rasterlinien): bei 97 BPM 1/16 **12/12** Marken auf der Linie (max 0,50 px), bei 1/8 ebenfalls 12/12 (max 0,50 px); 4.23.0: 3/12 (max 5 px). Animation beim Touch-Tipp **199 ms**, 11 Zwischenbilder; Regler 50 %: 173 ms; ↶: 182–197 ms; A/B „Original“: 183 ms hin, 183 ms zurück; Tipp sofort nach dem Öffnen (Marken noch nicht gesucht): 231 ms (alle ≤ 250). Meldung „12 Einsätze gerückt“ = Zahl der Karte (12). Skript des Bauenden in P1, P2, P3, L1, L2, XL: 14/14 auf der Linie, „14 Einsätze gerückt“, Wellenform blass/kräftig, Matrix-Zelle = gehörte Fassung (Abweichung 0,0011 gegen 0,795 zum Roh-Take), Song-Stimme 0,0000. Layout 844×390 und 320×568 nach dem Tipp: 23 Elemente des Blatts im Bild, keines verdeckt, Seite ohne Überlauf. |
| G1-03 | ✓ | **Undo über 6 Schritte** (1/16 Tipp → Regler 50 % → Scheiben → 1/8 → Regler 100 % → Marke ziehen): jeder Zwischenzustand mit Schnappschuss (5 von 6) ist nach ↶ deep-equal (Marken + Karte), der Klang ist hash-gleich (SHA-1 der gespielten Fassung); ganz zurück: keine Karte, Marken wie vorher, Klang = Roh-Take **bitgleich** (237 526 Samples); die gezeichneten Marken stehen wieder an der Quelle (0,000 px); ↷ ×6 → Endzustand deep-equal, Klang gleich. **Knacken mit Legato** (Schnitte mitten im klingenden Ton, 18 Schnitte): M-KLICK Dehnen 31,58 dB, Scheiben 23,06 dB gegen Original 30,74 dB; größter Sprung je Sample 0,149 bzw. 0,066 (Original 0,149). Skript des Bauenden: M-KLICK 12,19 dB gegen 11,99 dB, Ausgang 13,14 gegen 13,07 dB. |
| Smoke / Leistung | ✓ | `smoke.mjs`: keine Fehler. `n5-g-t3`: Zeichnen je Bild 1,4 ms, keine longtasks. `n5-g-t4`: synchroner Tipp Median 7,4 ms. Keine Konsolenfehler in allen Läufen. |

## Skripte (alle in `bau/helfer/G267/tests/g1/`)
- Vom Bauenden übernommen (nur Pfade angepasst): `n5-g-h.mjs`, `n5-g-t1.mjs` (→ `out/t1.out`, ALL OK), `n5-g-t2.mjs` (→ `out/t2.out`, 40 ✓, ALL OK), `n5-g-t3.mjs`, `n5-g-t4.mjs`, `n5-g-klick.mjs`, `smoke.mjs`, Hilfen `gs7-v3-vs5a-h.mjs`, `v3-qa-vs3-h.mjs`, `v3-vs5afix2-rec.mjs`, `../vs-dsp/test-signals.mjs`. `../node_modules` ist ein Link auf das vorinstallierte Playwright.
- Neu (unabhängig): `g1-indep.mjs` (97 BPM, 1/16 + 1/8, ungerade Abstände, Touch-Tipps, Regler per Maus, Pixel, Animation, Meldung, Undo-Kette mit Schnappschüssen, Legato-Knacken, Layout L1 844×390 und P3 320×568) → `out/indep.out` ALL OK; gegen 4.23.0 → `out/indep-vorher.out` (scheitert wie erwartet: 18,3 ms, 3/12 Marken, keine Animation/Meldung). `g1-indep2.mjs` (Tipp sofort nach dem Öffnen, A/B-Gleiten) → `out/indep2.out` ALL OK.
- Bilder: `out/indep-97-P1.png`, `out/indep-L1.png`, `out/indep-P3.png`, `out/ed-*-vorher/nachher.png`, `out/song-P1.png`.

## Mängel und Fixes
**Kein Mangel in G1 gefunden → keine `fix.diff`.**

Beobachtungen (kein G1-Fehler, zur Kenntnis):
1. Die Meldung zählt jede Marke mit Ziel ≠ Quelle, auch winzige Wege: die zwei auf dem Raster gesungenen Silben werden mitgezählt (Wege 1,4 und 1,5 ms, weil die erkannte Marke ~1,4 ms vor dem Raster liegt) → „12 Einsätze gerückt“, obwohl 10 hörbar rücken. Laut Changelog so gewollt (n = Ziel ≠ Quelle); eine Schwelle (z. B. ≥ 3 ms) wäre denkbar.
2. Bei offenem Marken-Blatt (P1 390×844) ist der ↶-Knopf `#bUndo` vom Blatt verdeckt; Undo geht über die API bzw. nach dem Schließen. Vorhanden schon vor G1.
3. Die Meldung (Toast, 58–92 px) liegt in P3/L1 kurz über dem Kopf des Blatts (Titel). Vorübergehend, nichts Bedienbares dauerhaft verdeckt.
4. Die `rb`-Chips haben einen größeren Treffbereich, der die untersten ~2 px der Wellenform überdeckt (elementFromPoint an der Canvas-Ecke trifft den Chip). Keine CSS-Änderung durch G1; vorbestehend.
5. Animation beim Tipp direkt nach dem Öffnen 231 ms (gemessen konservativ ab dem Bild vor der ersten Bewegung) – knapp unter 250 ms.
6. `n5-g-klick.mjs` meldet in digitaler Stille bis 43 dB „M-KLICK“, die Spitzen liegen aber bei −96…−101 dBFS (unhörbar) – wie im Changelog erklärt.
