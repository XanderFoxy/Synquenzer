# MLG2 – Protokoll

- Lauf 1 (angehalten): MLG1 auf R-4790 portiert (`apply.py`, Haken nach XLA-END), MLG1-Tests 33/33 grün (`mlg1-test.out`), Fotos MLG1.
- Lauf 2 (2026-11-17, auf Lauf 1 aufgebaut, knappes Budget – keine Extra-Messreihen, keine Song-Hörprobe):
  - EQ-Effekte der DAW-Spuren im Aufbau gefunden (Bus › Effects: Kennzahl, an, Werte Float64 als Base64). Modell gegen die 16 gemessenen
    K4a-Kurven geprüft: Frequenzgesetz 13·4200^n (0,96 dB) statt 20·1000^n (1,40 dB) gewählt (`cubasis/nachbau/mlg2/werk/modell.py`, privat).
  - `mlg2-block.js` + `mlg2-hooks.py`; MLG1-Leser gibt `id`/`fx` mit; Blatt-Zeile „EQ“; Hinweis-Haken nach dem Laden.
  - Erste Messung: Fit mit hart abgeschnittener Zielkurve wählte Shelf statt Low-Cut (Test fiel). Zielfunktion geändert: tiefe Bänder zählen
    nur, wenn die App dort zu laut ist → Restfehler 0,1–1,3 dB (eine Spur 3,2 dB: Low-Cut 2,5 kHz geht in der App nicht).
  - Messung echte Datei (Fenster B, n = 14): nur Klang 6,6 → Klang + EQ 5,0 dB; 15/15 Synth-Spuren mit Klang. Zwischen-Audio gelöscht.
  - Tests: mlg2-test 42/42, mlg1-core 33/33, mlg1 33/33; Pflicht ohne Befund; Startzeit Median 551 / 574 ms (3 Läufe).
