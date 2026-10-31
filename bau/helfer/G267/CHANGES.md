# CHANGES – Helfer G267 (Nachtrag 5: G1-Prüfung, G2, G6, G7)

Grundlage: Kopie `bau/vs/n5-br-G/index.html` (App 4.23.0 + G1, Versionszeile 4.25.0 unverändert). Basis für den 3-Wege-Merge:
`bau/werkzeug/vs-base-B.html`. Format bleibt 5 (nur additive Felder). Kein Supabase-Aufruf.

## G1 – unabhängige Prüfung (kein Code geändert)

G1 war gebaut, aber nicht unabhängig geprüft. Prüfung durch einen getrennten Prüf-Lauf (eigene Skripte, andere Werte als der
Bauende: 97 BPM, 1/16, ungerade Abstände, echte Touch-Tipps, Undo-Kette über 6 Schritte, Legato-Schnitte). Bericht:
`tests/g1/G1-REPORT.md`.

| ID | Ergebnis | Messung |
|---|---|---|
| G1-01 | ✓ | 97 BPM/1/16, Touch-Tipp, Dehnen 100 %: gehörte Einsätze max **3,5 ms** neben dem Raster (12/12); 50 %: halber Abstand max 2,0 ms; Scheiben 50 % 2,0 ms. Gegenprobe 4.23.0: 18,3 ms. Skript des Bauenden (120 BPM, 1/8): 3,4 / 1,8 ms, Song 3,4 ms, „Audio folgt“ 3,0 ms |
| G1-02 | ✓ | Pixel: 12/12 Marken auf der Linie (max 0,50 px; 4.23.0: 3/12); Animation 173–231 ms (≤ 250); Meldung „12 Einsätze gerückt“ = Zahl der Karte; Matrix-Zelle/Song = gehörte Fassung; 844×390 und 320×568 nichts abgeschnitten |
| G1-03 | ✓ | ↶ über 6 Schritte: Marken + Karte deep-equal, Klang hash-gleich; ganz zurück bitgleich zum Roh-Take (237 526 Samples); ↷ ×6 deep-equal. Legato-Schnitte: M-KLICK 31,6 / 23,1 dB gegen Original 30,7 dB |
| Smoke | ✓ | keine Fehler, Zeichnen 1,4 ms/Bild, Tipp Median 7,4 ms |

Abweichungen: keine. **Kein Fix nötig.**

### Fragen an Xander (G1)
1. Die Meldung „n Einsätze gerückt“ zählt auch Marken, die nur 1–2 ms rücken (auf dem Raster gesungen). Soll erst ab z. B. 3 ms gezählt werden?
2. Bei offenem Marken-Editor im Hochformat (390×844) verdeckt das Blatt den ↶-Knopf (schon vor G1 so). Soll der Editor ein eigenes ↶ bekommen?

### Für das Zusammenführen (G1)
Nichts – G1-Code unverändert. Tests: `tests/g1/` (Pfade auf `bau/helfer/G267/index.html`; `tests/node_modules` = Link auf Playwright, nicht im Repo).
