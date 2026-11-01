# MIX-A · Status (01.11.2026) – FERTIG GEBAUT, wartet auf Xanders Prüfung

Zweig `mix-assistent`, Arbeitsdatei `bau/helfer/MIXA/index.html` (App 4.30.0, VERSION unverändert), `patch.diff` gegen R-4300.

## Testläufe (Playwright + Chromium, `node tests/run-all.mjs`)
| Test | Ergebnis |
|---|---|
| mixa-klassen – Bass, Sequenz/Arp, Fläche/Pad, Lead, Drums, Gesang + Charakter, Songteile, Vorschlagsarten | grün (26/26) |
| mixa-vorschlag – Übernehmen, Zurück, ↶ ↷, Alle = 1 Schritt, Songteil +2/−1,5 dB hörbar, Speichern→Laden | grün |
| mixa-master – Video und GarageBand: −14,03 / −8,98 LUFS (±0,5), True-Peak −1,48 … −1,52 dBTP (16× gemessen), Zeitversatz 0 Samples, Vorher/Nachher | grün |
| mixa-bitgleich – Graph 4.30.0 = MIX-A (frisch, nach Analyse, nach Zurück, nach Auto-Master aus), Bass solo bitgleich, Durchgang bitgleich | grün |
| mixa-perf – Analysieren/Messen/Blätter/Übernehmen: keine Aufgabe ≥ 50 ms (0 Long-Tasks); Video mit allen Knoten 1,2× | grün |
| mixa-layout – 428×926, 926×428, 428×650, 375×667, 844×390 mit App-Schrift: im Bild, ≥ 44 px, nichts abgeschnitten | grün (Bilder `tests/bilder/`) |
| bau/tests/smoke.mjs, orch-mk-check.mjs | grün, keine Fehler |
| bau/tests/v3-mk2-wellen.mjs | **OFFEN** wie bei 4.30.0 selbst: private Bezugsdatei `dwgs-trace` ist nicht im Repo. MKD-Block, `sq-worklet-src`, `sq-md-src` byte-gleich zu R-4300. |

## Bekannt / offen
- Analyse = ein Offline-Durchlauf des Songs (wie Video): ≈ 0,35 × Songlänge (Chromium Desktop), auf dem iPhone länger; Fortschritt in %.
- Die Mischung von 4.30.0 ist selbst nicht bitgleich wiederholbar (siehe CHANGES); der erste Video-Render einer Sitzung hat in 4.30.0 eine 88-ms-Aufgabe (Aufwärmen), nicht von MIX-A.
- Fragen an Xander: siehe CHANGES.md.

Bitte prüfen: FX › MASTER → [MIX-ASSISTENT] → Analysieren, Vorschläge einzeln übernehmen/zurück; [AUTO-MASTER] → Ziel wählen, Messen, Übernehmen, Vorher/Nachher hören; danach Video bzw. GarageBand-Instrumental anhören.
