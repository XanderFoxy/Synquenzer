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
- (2b) Gemeinsames Schicksal (Spitze des geteilten Teiltons gegen die Vibrato-Bahnen beider Stimmen, ±6 Rahmen, f0 je Rahmen aus ungeteilten Spitzen) → Anteil; sonst Hülle → halb:
  3TQ S3 Welle 67,2 → 98,3 %, 4eng S3/S4 67/93 → 99,4/95,5 %, 3TQ-M2 S3 89 → 92; Rückgang 4eng-M2 S4 87 → 77, 4eng-Vok S4 91 → 83 (prüfen).
- (2c) Versuche: Schwerpunkt nur bei naher Lage (< 0,7 σ) schätzen, Anteil aber für alle Rahmen des Paars; Entmischen im Rahmen (2×2) brachte nichts → verworfen. Schwerpunkt mit Hülle verrechnet (Gewicht sd : k=1).
- (3) Oktav-Schutz (Welle muss auf ihrer Tonhöhe klingen): tragen Nicht-Vielfache von 2 bzw. 3 unter Teilton 1–12 < 15 % der Leistung, holt die Stimme mehr von ihren geteilten Nicht-Vielfachen aus dem Anteil der Partner-Stimme (Summe bleibt), tief → hoch → fertig.
  Messung (src/meas.mjs, Kern core3.js): 3TQ Welle 100/100/100 %, 29/28/29 dB · 4eng 100/100/100/98,9 %, 25/25/27/17 dB · 2T/2Q/3Sin/3TSext 100 % · 3TQ-Pegel 100/100/99,7 · 4eng-Vok 100/100/100/97,4 · 3TQ-M2 100/93/93 · 4eng-M2 100/100/93/82 (11 dB) · Verfolgung überall 100 % · Auto 3/2 richtig · Zeit 0,6–1,3 s (vorher 0,5–0,9).
- (4) Kern in die Datei (src/apply3.py: chr2Core ← src/core3.js, Kopf-Hinweis, Block CHR3-BEGIN/END nach /* CHR2-END */, nur Kommentar); Pflicht: topdefs doppelt 0/Syntax 0, dupkeys 0, smoke errors [] (smoke-1.png), MS 2000 1×, live: true 1×, VERSION 4.59.0 gleich → fertig.
- (5) Test chr3-test.mjs (Kopie chr2-test, Tuning-Vergleich auf Basis 4.59 angepasst: Knackser „nicht mehr“, Basis hat den Fix schon) → ALLE OK (82) (src/run2.txt; run1: 77/82, die 5 = Vergleich gegen Basis mit schon 0 Knacksern). App-Weg (Worker, Takes-Blatt › Trennen 3): Welle 100/100/100 %, 29/28/29 dB, Summe = Original −78 dB.
- (6) Langer Take 56,6 s (src/lang.mjs): 3 Stimmen 3,1 → 4,3 s, 4 Stimmen 4,5 → 5,9 s, Heap 7 → 17–19 MB (linear, Fenster-Summen mit zwei Zeigern) → fertig.
- (7) Stimmführung: Zuordnung hoch → tief / Kreuzen nur mit Grund unverändert; gemessen 0 falsch zugeordnete Rahmen in allen 12 Fällen (src/diag.mjs) → fertig. NOTES.md → fertig. Ende Auftrag 1/3.
- 14.11. Start Auftrag 2/3 (Formanten bei großen Verschiebungen): Ziel Formant ≤ 4 %, Übergang ≤ 4 dB, Anlauf ≤ 20 ms.
- (1) Befund (src/fdiag*.mjs, Basis-Messung src/tm2-vorher.json): Rest x − Modell im Vokal −28 dB (Teiltöne −40 dB, Hauptteil > 7 kHz + Hauch) – kein großer
  „Tonhöhen-Geist“ im ruhigen Teil. Formant-Fehler hat zwei Ursachen: (a) Hülle zwischen den Teiltönen: Formant liegt zwischen zwei Teiltönen (z. B. „e“ 433 Hz:
  F1 530 Hz zwischen T1/T2), die lineare Log-Interpolation verfehlt die Spitze um bis 12 dB; Orakel mit wahrer Hülle: +400 9,3 → 5,8 %, −500 6,0 → 4,1 %;
  (b) Ränder/Übergänge: Strecken-Rand (Schutzzone 15 ms + Rampe 10 ms = Original-Tonhöhe, LSD 15–19 dB) und Legato-Vokalwechsel (Rest-Spitze −8 dB, LSD 9–12).
  Anlauf −500 = 50 ms kommt NICHT vom Anlauf: in Note 8 („e“ 247 Hz) springt YIN im IDEAL auf 2·f0 (T2 = F1), die Ausgabe nicht (T2 zu schwach = Ursache a).
- (2) Versuche (src/fexp.mjs, Bausteine src/hull.mjs): Schutzzone G 15 → 0 ms: Übergang 7,08 → 5,99 / 5,90 → 4,98 dB, Korrektur weich 3,15 → 2,68, Knackser 0
  (max 0,2 dB); Glätte weich 1,11 → 1,34 (prüfen). Hülle kubisch (Hermite) mit Steigung je Teilton aus dem Vibrato (Ridge, nur Kern derselben Note):
  Hüllen-Fehler an den neuen Teiltönen etwa halbiert (z. B. „e“ T1 −10,2 → −5,8 dB, „i“ −500 −12 → −8,4), Formant in ruhigen Rahmen 27 → 5–17 %,
  ABER Ausreißer: Lautstärke-Verlauf (Ausklingen) korreliert mit dem Vibrato → alle Steigungen +5 → Spitze +12 dB. Nächster Schritt: Zeit-Trend
  (1, t, t²) aus der Regression herausrechnen + leise Rahmen (−6 dB) auslassen.
- (3) Regression mit Zeit-Trend (1, t, t²) + Pegel-Maske −1,7 dB + Noten-Ende −60 ms (src/hull.mjs SLOPE lv 0,2 e1 0,06): Steigungen in ruhigen Noten
  richtig (T1–T8 „e“/„i“ ±0,3 der wahren), Ausreißer weg. Messung (tune-meas-Maß, nur G2): +400 Formant 9,25 → 8,18 %, LSD ruhig 4,06 → 3,79;
  −500 Formant 5,99 → 7,28 (ohne Fortsetzung unter T1: 6,77) = RÜCKSCHRITT: F1-Band „e“ (433 → 324 Hz) +3…6 dB zu laut (Hermite-Spitze zu breit,
  ρ ≈ 0,5 an T1 = halbe Steigung beim Fortsetzen). Korrektur weich 2,43 → 2,48 % (gleich). → NICHT eingebaut.
- (4) Anlauf −500 = 50 ms ist ein Mess-Fehler von tune-meas: Note 8 („e“ 247 Hz) – YIN im IDEAL springt auf 494 Hz (T2 = F1), die Ausgabe liegt ab
  Notenbeginn auf 246,9–247,0 Hz = Ziel (src/fdiag5.mjs) → gegen die bekannte Ziel-Kurve gemessen 0 ms in allen 4 Noten.
- Stand Ende Auftrag 2/3 (Zeit aus, ~60 min): Datei index.html UNVERÄNDERT (Stand 1/3, Pflicht-Prüfungen von 1/3 gelten). Offen → Auftrag 2b:
  Ränder G 0 ms (Glätte weich 1,11 → 1,34 klären) und Hülle −500 (F1-Spitze zu breit) – Messung direkt an den Teiltönen statt Cepstrum-Schwerpunkt.
- 14.11. Start Auftrag 3/3 (Test): LOG/NOTES gelesen; Datei index.html seit 1/3 unverändert (cmp folgt).
- (1) chr2-test.mjs (Original aus chr/, Kopie chr3/chr2-test.mjs, Basis basis2 = 4.57 ohne Knackser-Fix) auf chr3/index.html: ALLE OK (82) in 115 s (src/run3-chr2.txt); CHR2 3/3 war 72/82 – die 10 FEHLER (3 St. Unterstimme Welle 67 %, 4 St. eng Verfolgung/Welle/Pegel) alle weg → fertig.
- (2) chr3-Prüfungen Formant/Übergang/Anlauf (src/chr3-pruef.mjs + src/chr3-pruef-eval.mjs, Basis src/pruef-basis4.json, Datei src/pruef-chr3.json, Bewertung src/pruef-eval.txt): ALLE OK (27), offen 8 = Chor ±400/−500 Formant 9,25/5,99 % und Übergang 7,08/5,90 dB (Ziel 4 %/4 dB; G2/G6 unverändert = Basis, bitgleich gemessen). Anlauf gegen die Ziel-Kurve 0 ms in allen Chor-Fällen (tune-meas −500: 50 ms = YIN-Sprung im Ideal), hart 10 ms (≤ 20). Knackser 0. → fertig (Formant/Übergang Chor offen, Auftrag 2b).
