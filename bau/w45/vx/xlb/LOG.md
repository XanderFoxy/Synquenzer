# LOG XLB (Spuren/Szenen bis 24/32, Fassung B vorbereiten)

- 21:37 UTC Start. Last 14.11 14.76 8.98. Basis rel-4780/index.html (4.78.0, md5 68e92c03) → basis.html + index.html kopiert. df: 4,2 GB frei.
- 22:02 UTC Code gelesen (MAX_T 51×, N_SCN 26×, feste 8er-Felder, Bänke, Song, Video, MIDI, Format/need, Undo/HIST). Entwurf: MAX_T = 24 (Kapazität),
  NS() = S.scenes.length, Normalisier-Kontext XLB.nn, Bänke als 4er-Gruppen, leere Spalten (＋ Szene), Ketten der Zusatzspuren bei Bedarf.
- 22:02 UTC bau.py + src/block.js + src/block.css → index.html (95 Zeilen ersetzt, 25 eingefügt + Block). topdefs 0/0, dupkeys 0, smoke []. Last 6.31 3.76 4.57.
  Normales Projekt: Fotos 428×926 / 926×428 / 320×568 byte-gleich zur Basis (md5 der PNG). 12×12 per API: Format 8, need [xl], alle clips 12 lang.
