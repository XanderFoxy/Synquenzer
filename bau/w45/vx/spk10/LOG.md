# SPK10 – LOG
- 20:59 Start: Paket-Ordner geprüft (index.html = basis.html = 4.64.0), Mess-Skript faelle8.mjs + faelle/ + Soll nach spk10/messb kopiert.
- 21:04 Messung Merkmal r = ungerade (3f,5f) / gerade (2f,4f) Obertöne, kurzes Fenster 4096 auf Original − Kick: ohne Pads trennt es (Oktav-falsch −22…−24 dB, richtig −11…+3), mit Pads nicht (Demo richtige G2 −16/−13: Pad G3 = 2×G2; Lauf falsche −12…+1, Snare auf 3f/5f).
- 21:06 Gebaut: Regel thr −19 dB (nur bei deutlich fehlenden ungeraden Obertönen eine Oktave höher, Ton um 2f mit Kamm 1–6 im kurzen Fenster neu), Kick-Abzug aus (gleiches Ergebnis, schneller). bassdrums 19/32 · 0,655 → 22/32 · 0,759; demo/walk/okt/sech/leise/hoch/laut/basspads/ohneraster/sr48/lang gleich. Regression gestartet (reg.sh, nacheinander).
- 21:07 Versuch nd (Merkmal auf Original ohne Trommel-Ebene): Lauf-Oktavfehler weiter −12…+2 dB (Nachbarton-Obertöne, z. B. 5×G1 ≈ 3×E2), Demo 29→28, Zeit +40 % → verworfen, Block = v1.
- 21:09 Versuch rp (Ton ±2 Halbtöne je Note im kurzen Fenster neu, Kamm 2–6 bzw. 1–6): Lauf 8→7/2, Demo 29→26/20, okt 24→13/9 → verworfen (kurzes Fenster zu grob für Halbtöne unter 100 Hz, Pad-Teiltöne ziehen).
