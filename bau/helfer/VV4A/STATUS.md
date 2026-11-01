# VV4-A Status

**Stand:** fertig gebaut und getestet (Chromium/Playwright). **Noch nicht von Xander am iPhone geprüft.**

## Testzahlen (`sh tests/run-all.sh perf`)
| Test | Ergebnis |
|---|---|
| `vv4a-render.mjs webcodecs` – 4 Takte 9:16 [Ganze App], MP4 1080×1920, Ton, 5 Einzelbilder, Tasten je Bild, 7 Bereiche nicht leer, Konsole | 10/10 |
| `vv4a-render.mjs recorder` – dasselbe über den MediaRecorder-Echtzeit-Weg (iPhone-Weg) | 10/10 |
| `vv4a-kb-live.mjs` – VV4-05: Tasten hell/gedrückt + Träger-Anzeige = laufende App, 20 Zeitpunkte über 8 Takte (ORIGINAL, F, G, Am) | 20/20 |
| `vv4a-layout.mjs` – VV4-04: 8 Bereiche, 30 Knöpfe, 20 Zellen ±2 pt zu `getBoundingClientRect` (428×761), Teil-Leiste im Song verdeckt, Sonde 56/56 mit App-Gegenstück | 43/43 |
| `vv4a-alt.mjs` – alte Formate (16:9 Song/Matrix/Auto, 9:16 Kamera/Balken, Spur-Bild) pixelgleich zu R-4261 | 36/36 Bilder |
| `vv4a-ui.mjs` – Video-Blatt in 8 Größen (428×926, 926×428, 428×761, 390×844, 375×667, 320×568, 844×390, 667×375): ≥ 44 pt, nichts abgeschnitten, rollt nicht, Wahl greift | 40/40 |
| `vv4a-layer.mjs` – Tempo-Puffer ändert das Bild nicht (≤ 41 Kanten-Pixel > 2/255) | 7/7 |
| `vv4a-perf.mjs` – VV4-06: 3-min-Song (183 s) 9:16 [Ganze App] | **2,43× Echtzeit** (Ziel ≥ 1,5×) |
| Rauchtests `bau/tests` (smoke, v3-mk8-smoke, v3-mk8b-smoke, v3-qa-mk5reg-smoke) | 4/4 ohne Fehler |
| Alte Video-Abnahmen `bau/tests`, je Basis R-4261 und neu gelaufen | **gleiches Ergebnis wie die Basis** (abn-01, 02, 04, 06, 09, vv2-01, vv2-03). Schon in der Basis rot und neu genauso: abn-04 `matrixRange` Takt 4–5, vv2-03 `monoton` (Blende). Nicht lauffähig, in beiden gleich: vv2-02 (braucht eine Vor-VV2-Datei aus einer anderen Sitzung), vv2-05 (Testskript-Fehler Z. 25) |

**Zeit je Sekunde Video** (183-s-Song, WebCodecs, Chromium-Rechner): [Ganze App] 412 ms (Bild im Mittel 12,6 ms, längstes 98 ms);
[Kamera] zum Vergleich 302 ms (7,1 ms). Kurzer 4-Takt-Bereich: 779 ms/s (Fixkosten Ton-Render). Recorder-Weg: Echtzeit.

**Regeln:** keine neuen Markennamen; „MS 2000“ 1×; `  live: true,` 1×; VERSION 4.26.1 unverändert; kein Netz, keine Datenbank.

## Beispielbilder (`bilder/`)
- `video-takt2-matrix-F.png` – Einzelbild aus dem MP4: Träger F (+5), Taste F gedrückt.
- `video-takt4-matrix-G-xp.png` – Einzelbild aus dem MP4: Träger G, Teil-Transposition +2 → D gedrückt, Geister-Punkte.
- `vvDrawApp-song-takt4.png` – Song-Schnitt (Teile als gelbe Köpfe, Laufband).
- `vvDrawApp-matrix-takt6-Am.png` – Matrix, Träger Am.
- `blatt-428x926.png`, `blatt-926x428.png` – Video-Blatt mit [Ganze App].

## Offene Punkte
- Fragen an Xander: siehe CHANGES.md (xp als gedrückte Taste, Modusleiste immer TRANSP., Teil-Leiste im Song, 428×761 statt 926, Spur-Schnitt → Matrix).
- Am iPhone (Safari, iOS 18.7, MediaRecorder-Weg) noch nicht geprüft: Schriften im Video, Tempo, Logo.
- Längstes Einzelbild 98 ms (Blende bei Schnitt bzw. erstes Bild eines Puffers) – offline unkritisch, Echtzeit-Weg zeichnet nur 30 Bilder/s.
- Song-Raster im Bild ist die VV1-Zeichnung (`vvDrawSong`), nicht die Live-Leinwand der Song-Ansicht (die hängt an `SV`); Spalten/Beschriftung weichen
  um wenige pt von der App ab (Bereich selbst ±2 pt).
- Matrix-Spurseite: wie die App (`UI.trackBank`); Szenen-Bank folgt den spielenden Clips (wie VV1), Punkt am SZ-Knopf, wenn verdeckt etwas spielt.
