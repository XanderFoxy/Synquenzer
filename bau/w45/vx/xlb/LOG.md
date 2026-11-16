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
