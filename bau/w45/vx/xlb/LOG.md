# LOG XLB (Spuren/Szenen bis 24/32, Fassung B vorbereiten)

- 21:37 UTC Start. Last 14.11 14.76 8.98. Basis rel-4780/index.html (4.78.0, md5 68e92c03) → basis.html + index.html kopiert. df: 4,2 GB frei.
- 22:02 UTC Code gelesen (MAX_T 51×, N_SCN 26×, feste 8er-Felder, Bänke, Song, Video, MIDI, Format/need, Undo/HIST). Entwurf: MAX_T = 24 (Kapazität),
  NS() = S.scenes.length, Normalisier-Kontext XLB.nn, Bänke als 4er-Gruppen, leere Spalten (＋ Szene), Ketten der Zusatzspuren bei Bedarf.
- 22:02 UTC bau.py + src/block.js + src/block.css → index.html (95 Zeilen ersetzt, 25 eingefügt + Block). topdefs 0/0, dupkeys 0, smoke []. Last 6.31 3.76 4.57.
  Normales Projekt: Fotos 428×926 / 926×428 / 320×568 byte-gleich zur Basis (md5 der PNG). 12×12 per API: Format 8, need [xl], alle clips 12 lang.
- 22:13 UTC xlb-test.mjs gebaut; nach Test-Korrekturen (Test-Artefakte: UI-Zustand zwischen Läufen, unnormalisierte Clips, Seite der Spur) 64 OK / 0 FEHLER. Code-Fix: ↶ von ＋ Szene stellt auch die Bank wieder her. Last 2.56 4.16 4.76.
- 22:21 UTC Messung Chromium (mess.mjs): 8/16/24 Spuren live Worklet-Last 0,11–0,17 / 0,22 / 0,30–0,33 (3er-Akkorde auf jeder Achtel, 26/58/90 Stimmen), Leerlauf ≤ 0,012.
  Erste Fassung: Long Task 448 ms beim Laden von 24 Spuren (alle Engines auf einmal, wenn das Worklet bereit ist) → Engines der Zusatzspuren einzeln in Aufgaben (xlDeferE) → 286 ms (8 Spuren: 185).
- 22:21 UTC Startzeit: zuerst +130 ms (DCL) gegenüber 4.78. Halbierung der Haken-Bereiche: Ursache emptyClips → xlNsN mit try/catch auf S im TDZ (viele Ausnahmen beim Start).
  Fix: Merker XLB.sOk nach „let S = demoProject();“ (eine Haken-Zeile) → parse+exec wieder wie Basis (372–411 vs 341–415 ms). Last 4.59 4.68 4.77.
- 23:09 UTC Neustart der Maschine (uptime 1 min) – Arbeit fortgesetzt. Last 3.10 1.22 0.46. df: 3.9G frei.
- 23:13 UTC (vor 2. Unterbrechung) Endfassung (md5 018e17d4, bau.py reproduzierbar): xlb-test 64 OK / 0 FEHLER, probe-render (Video-Ton Spur 11) OK,
  Bildvergleich normales Projekt 428×926 / 926×428 / 320×568 byte-gleich, messung.html-Lauf Chromium 0,12 / 0,25 / 0,38, 0 Aussetzer.
- 23:28 UTC Fortsetzung. Last 1.20 0.52 0.75. df: 3.7G frei. bau.py → gleiche md5 018e17d4.
- 23:29 UTC Pflicht: topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [], „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter wie Basis, keine Emojis. Last 1.2.
- 23:31 UTC Startzeit (3 Läufe Pflicht, Last 6): ready 858 / 893 ms; 5 Läufe 647 / 672; 9 Läufe mit wechselnder Reihenfolge (Last 4–5) 672 / 631,
  Hauptfaden-Skriptzeit (CDP ScriptDuration) 104 / 103 ms → kein messbarer Unterschied.
- 23:33 UTC Regression Matrix/Song/Mixer/MIDI gestartet (reg/lauf.sh, Kopien der Tests in reg/t, nacheinander, nice -n 10). Last 4.
- 23:49 UTC Regression XLB fertig: mtx3 51/51, mtx3b 87/87, mtx3c 26/26, mtx4 117/118 (P2 Long Task 62 ms), mtx 91/92, teil1 61/61,
  clip1 109/109, trp1 81/81, mx2 34/34, mix3 20 OK/3 FEHLER + Abbruch. Last 1.5–4.9.
- 23:55 UTC A/B auf 4.78 für die nicht grünen: mix3 und mtx exakt dieselben Urteile, mtx4 115/118 (Last 6–9) → kein Rückschritt.
- 23:57 UTC midi-ab.mjs: MIDI-Export 9 Altprojekte × 10 Dateien = 90/90 bitgleich zu 4.78. Last 8.9. Fotos der Regression gelöscht (Platte 3,3 GB frei).
- 23:59 UTC NOTES/LOG fertig. index.html md5 018e17d4 (unverändert seit 22:34), Basis 68e92c03 unverändert. Paketordner 22 MB. df 3,3 GB frei.
