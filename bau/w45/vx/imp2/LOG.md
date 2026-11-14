# IMP2 – LOG (Tempo unabhängig von der Abtastrate)

- 20:58 Start. Paket-Ordner vx/imp2: index.html = basis.html (4.63.0). Gelesen: real/NOTES.md (Befund 4), imp/NOTES.md, imp1Core (down: k = floor(sr/11000) → 44,1k: 11 025 Hz, 48k/96k: 12 000 Hz, Dreieck-Filter).
- 20:59 Node-Prüfung imp2-node.mjs (imp1Core aus der Datei auf dieselben Stücke bei 22,05/44,1/48/96 kHz, mit ffmpeg-soxr umgerechnet, Audio liegt
  außerhalb von vx unter realvox/imp2rs). Basis (node-vorher.txt): App-Renders 92 4/4 · 120 3/4 · 120 6/8 · MP3 · Melodie 96 überall gleich und richtig;
  #10 gleich (112); #14 120,7 (22,05k/44,1k) gegen 132,6 (48k/96k); #1 118,6 (bis 48k) gegen 119,7 (96k, Box-Filter 8). FEHLER 2 Gruppen.
  Wichtig: die App dekodiert Importe immer auf 48 kHz (ggbDecode, GGB_SR 48000) → im Browser-Test gilt die 48k-Spalte; 44,1k kommt über Takes (m.sr) / SPK1.
