# T1 Taktarten – Stand (Helfer-Zweig `t1-taktarten`)

**Bau fertig, Tests grün – wartet auf Xanders Prüfung am iPhone.** Ohne Xanders Okay nicht „fertig“.

## Tests (Playwright + Chromium, Touch)
| Test | Ergebnis |
|---|---|
| `tests/t1-taktarten.mjs` (T1-01 … T1-07, Touch im Tempo-Fenster) | 45/45 PASS |
| `tests/t1-bitgleich.mjs R-4300.html index.html` (T1-08, alte Songs) | 10/10 PASS |
| `tests/t1-layout.mjs` (6 Prüfmaße) | 30/30 PASS |
| `bau/tests/smoke.mjs` | grün (keine Fehler) |
| `bau/tests/orch-mk-check.mjs` | grün (4.30.0, initAm rms 0.0705 wie Basis) |
| `bau/tests/v3-mk2-wellen.mjs` | **OFFEN** – private Bezugsdatei `dwgs-trace` fehlt im Repo (auch auf der Basis OFFEN). Ersatz: Block `MKD` zeichengleich mit R-4300 geprüft. |

Aufruf (aus dem Repo): `node bau/helfer/T1/tests/t1-taktarten.mjs $PWD/bau/helfer/T1/index.html` usw.

## Bitte prüfen (iPhone)
1. BPM antippen → „Taktart des Songs“ → 3/4. Metronom an, ▶: Eins hoch, dann zwei normale Klicks; TAKT zeigt 1.1 … 1.3.
2. Dasselbe mit 6/8: hoch – leise – leise – normal – leise – leise.
3. Toast [Clips umrechnen]: Schlagzeug läuft danach in 3/4 (Bassdrum auf 1, Snare auf 2).
4. Song: Teil-Marke antippen → [Taktart ▾] → 7/8. Song-Lineal zeigt „7/8“ am Teil, Klick und Teile springen richtig.
5. Drum-Editor eines 3/4-Clips: 12 Schritte, gut zu treffen.
6. ↶ nach jeder Änderung: alles wie vorher. Altes Projekt öffnen: klingt genau wie vorher.

## Offen / bewusst nicht umgestellt (rechnen noch in 4/4-Takten, nur bei Taktart ≠ 4/4 spürbar)
- FANG-Längenregel N7-R1 im Song (`n7r1`, `fangBars`, `takeEndBar`, Song-Gedächtnis `memoryInfo`) – Takt-Grenzen über Transport-4/4.
- Akkord-Zeilen der Szenen (`row.len * 4`, Akkord-Raster ½ Takt), Teil-Akkorde „Für alle“ (`markChordAll` Zeilen-Teil).
- D1-Spurlängen (eigene Schrittzahl je Drum-Spur) bei Clips ≠ 4/4; beim Umrechnen eines Clips werden sie verworfen.
- Drum-Übersicht (12×16 Punkte) zeigt bei 20/24 Schritten nur die ersten 16.
- VS-Gesang→Noten (`vsApply`, `vsFang*` `start * 4`), G3-Vorlauf `G3_PRE_BARS * 4` (Dauer, unkritisch).
- TAKT-Leiste hat weiter 4 LEDs (3/4 zeigt 3 davon, ♪-Takte je Gruppe).
- Quer sind alle Knöpfe des Clip-Blatts seit 4.30.0 nur 34–36 px hoch (auch der neue [Taktart ▾]) – Bestand, nicht von T1.

## Fragen an Xander (nicht gebaut, Regel 27)
- Tempo bei 6/8/12/8 in punktierten Vierteln anzeigen? (heute ♩ = BPM wie GarageBand)
- Eigene Gruppierungen (7/8 als 3+2+2, 5/4 als 2+3) und weitere Taktarten (9/8, 5/8)?
- LFO/Pumpen-Zyklus „1 Takt der Taktart“ (I3 §4.9) – heute bleibt 1/1 = 4 Schläge.
- Dirigent/Server: Format 7 – prüfen, ob der Online-Wächter (`max_format`) Format 7 annimmt, bevor Taktarten-Projekte hochgeladen werden.
