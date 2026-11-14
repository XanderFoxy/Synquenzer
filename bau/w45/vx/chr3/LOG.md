# CHR3 LOG

- 14.11. Start Auftrag 1/3 (geteilte Teiltöne): Arbeitskopie chr3/index.html = basis4.html (cmp gleich), mess → spk/mess verlinkt.
- Messung vorher (src/meas.mjs, Kern aus der Datei; v = Verfolgung, w = Welle YIN ±30 ct, dB = Pegel-Abstand; src/vorher.json):
  2T 100/100 w100/100 31/32 dB · 2Q w86,5/100 · 3TQ w100/99,5/**67,2** 24/28/29 dB · 4eng v98/64/78/63 w99/65/65/68 22/6/7/13 dB ·
  3Sin w100 · Robustheit: 3TQ-M2 (andere Melodie) w72/78/81 9/5/17 dB · 3TQ-Pegel (0,6/0,8) w87/67/67 25/1/29 dB · 3TSext 100 ·
  4eng-M2 w55/7/56/51 · 4eng-Vok w63/76/85/68 · Auto3 = 3, Auto2 = 2. Zeit 0,5–0,9 s.
- (1) Verfolgung: Verfeinern robust (gewichteter Median der Teilton-Schätzungen, nur passende Teiltöne zählen → kein Geist 337 Hz aus F4-Grundton + E5-Teiltönen) + schwache Kandidaten (0,1–0,2 × stärkster) nur als Lückenfüller, Auto-Zahl zählt sie nicht → fertig.
  4eng Verfolgung 98/64/78/63 → 100/100/100/100 %, Pegel 22/6/7/13 → 22/21/27/19 dB; 4eng-Vok 62–84 → 100 %; 3TQ-Pegel 86/67/94 → 100 %; 2Q Welle 86,5 → 100 %. Welle Unterstimme 3TQ weiter 67 %, 4eng S3/S4 67/81 % (geteilte Teiltöne, nächster Schritt).
- (1b) Verfolgung weiter: Kandidat verworfen, wenn der Median der Teilton-Schätzungen > 50 ct vom Gitter liegt; Grundton beim Abziehen ganz (sonst Geist darunter); Teilton 3…5 einer tieferen Stimme mit schwachem Grundton erkannt (Grundton + ≥ 2 Nicht-Vielfache nötig) → fertig.
  Verfolgung jetzt 100 % in ALLEN Fällen (3TQ-M2 84/84/98 → 100, 4eng-M2 72/7/74/76 → 100); Pegel 4eng-M2 13/−13/3/8 → 15/15/18/15 dB. Welle offen: 3TQ S3 67 %, 4eng S3/S4 67/81, 4eng-M2 S4 71, 4eng-Vok S4 70 (src/t1.json).
- (2) Hüllkurven-Modell je Stimme (Log-Pegel der ungeteilten Teiltöne über Log-Frequenz, ±2 Rahmen geglättet) → halb: 4eng S4 Welle 81 → 93 %, 3TQ-M2 S3 73 → 89, 4eng-M2 S3/S4 84/71 → 89/87, 4eng-Vok S4 70 → 91; aber 3TQ S3 / 4eng S3 bleiben 67,2 %.
  Befund: hohe Stimmen tasten die Formant-Hülle zu grob ab (D5 „e“: Teilton 2 liegt im Tal zwischen F1 und F2, Hülle schätzt 0,25 statt 0,03) → Oberstimme bekommt 86 % des geteilten Teiltons, G4-Teilton 3 fehlt → YIN springt auf 2·f0 (Noten G4 0,77–1,19 s, 3,27–4,19 s, F4 7,27–8,19 s).
  Nächster Weg: „gemeinsames Schicksal“ – die Spitze eines geteilten Teiltons folgt im Vibrato der Stimme, die ihn trägt (Schwerpunkt ≈ leistungsgewichtet) → Anteil über ±6 Rahmen schätzen.
