# CHR4 LOG

- 14.11. Start Auftrag 1/2 (Formanten bei großen Verschiebungen): Arbeitskopie chr4/index.html = basis5.html (4.60.0, cmp gleich), mess → spk/mess verlinkt.
- (0) Messung vorher (src/chr3-pruef.mjs = Kopie aus chr3, TMFILE=chr4/index.html, src/pruef-vorher.json): weich Formant 2,43 % · Übergang 3,15 dB · Glätte 1,11 ·
  hart 2,58/4,02/1,19 · natürlich 2,67/3,30/1,00 · Chor +400 9,25 %/7,08 dB · Chor −500 5,99 %/5,90 dB (G2 und Chor-Weg gleich), Knackser 0, Anlauf Ziel 0/10 ms. 21 s.
- (1) Hüllen-Fehler direkt je neuem Teilton in dB (src/pdb.mjs: exakte Teilton-Pegel der Prüfstimme, Fehler an kk = h·r gegen die wahre Hülle,
  leistungsgewichteter RMS / Mittel der lauten / max): linear +400 4,78/2,10/10,9 dB, −500 6,20/2,24/12,1 dB. Größter Posten = erster neuer
  Teilton: F1 liegt zwischen T1 und T2 (+400: „e“ 432 Hz −10,9 dB) bzw. unter T1 (−500: kk = 0,75, „i“ −12,1 / „e“ +7,5 dB).
  Reine Interpolation ohne neue Information hilft nicht: Keys-Kubik 5,06/6,31, Lanczos-2 4,82/5,99, Lanczos-3 4,84/5,91 → verworfen.
- (2) Werte + Steigungen (src/pdb2.mjs, Steigung EXAKT = bestes denkbares Vibrato): Hermite +400 4,78 → 2,14 dB, −500 6,20 → 4,04 dB (mit
  Fortsetzung unter T1). Im Rendern (src/fexp2.mjs, os = Orakel-Steigung): +400 Formant 9,25 → 6,76 %, −500 5,99 → 6,00 % (gleich);
  mit der Vibrato-Schätzung (CHR3-Baustein) 8,18 / 7,28 %. Orakel-Hülle (CHR3 „or“): 5,79 / 4,08 %; Orakel + Schutzzone 0: 5,28 / 3,80 %.
  Befund: selbst die WAHRE Hülle erreicht +400 ≤ 5 % nicht – der Rest steckt in den Rand-Rahmen (je Rahmen-Liste src/fexp „fr“: ruhige Rahmen ±5 %,
  Noten-Ränder/Legato −17…−34 %, Band 300–1000 Hz dort +4…+12 dB zu laut: 0,63 / 0,67–0,71 / 1,67 / 1,89 / 2,07–2,11 / 2,87 / 3,13–3,17 / 3,57 / 3,67 s).
- (3) Ränder (src/fexp2.mjs G/rmp, lineare Hülle; je +400 | −500 | weich):
  G 15 ms/R 10 (Basis) F 9,25|5,99|2,43 Ü 7,08|5,90|3,15 Gl w 1,11 K 0 · G 0/R 10: 8,82|5,79|2,49, Ü 5,99|4,98|2,68, Gl w 1,34 ·
  G 5/R 10: Ü 6,39|5,23|2,92, Gl w 1,14, aber Knackser −500 1 (20 dB) · G 7,5/R 15: Ü 6,70|5,54|2,96, Gl +400 1,19 · G 10/R 10: Gl w 1,40 (!) ·
  **G 2,5/R 20: F 9,06|6,07|2,48, Ü 6,36|5,32|2,95, Gl w 1,10, K 0** = bester Kandidat (Übergang −0,6…−0,7 dB, Glätte gleich, −500 Formant +0,08).
  Glätte springt nicht stetig mit G (1,10…1,40) → einzelne YIN-Sprünge am Rand, nicht die Schutzzone an sich.
- Stand Ende Auftrag 1/2 (Zeit aus, ~45 min): index.html UNVERÄNDERT (= basis5, cmp gleich → Pflicht-Prüfungen der veröffentlichten 4.60.0 gelten).
  Ziel (+400/−500 ≤ 5 %, Übergang ≤ 5 dB) mit Hülle allein nicht erreichbar (Orakel 5,79 %). Nächster Schritt (2b): Rand-Rahmen –
  (a) warum Band 300–1000 Hz an Noten-Rändern +4…12 dB (Modell-Rand, apGate, Legato-Vokalwechsel?) mit fdiag an 2,87 s / 3,15 s klären;
  (b) dann G 2,5 ms + Rampe 20 ms (G2 model/render + G6 modelRuns/renderMulti gleich) einbauen; (c) Hülle: Hermite nur mit verlässlicher
  Steigung (ρ ≥ 0,5), unter T1 fortsetzen – bringt +400 bis −2,5 %-Punkte, −500 erst nach den Rändern prüfen.
- 14.11. 17:47 Start Auftrag 2/2 (Test): index.html = basis5 (cmp gleich). Entscheidung: Rand-Kandidat G 2,5 ms + Rampe 20 ms erst als Variante (tmp/) über alle 5 Fälle + Nachbarwerte prüfen; nur übernehmen, wenn nirgends schlechter (Knackser 0, Glätte ≤ Basis + 0,05).
- (A1) Varianten Rand (chr3-pruef, alle 5 Fälle, tmp/pruef-*.json): Übergang überall besser (−0,2…−0,7 dB), aber hart Formant 2,58 → 2,77…2,93 %, hart Glätte 1,19 → 1,23…1,40; G 3 ms/R 20 am ausgewogensten (hart F +0,19, Gl +0,04, natürlich Gl +0,06). Prüfe Nachbarn G 3,5/4 ms.
- (A2) Eingebaut in index.html: G 3 ms (G2 model + G6 modelRuns), RMP 20 ms (G2 render + G6 renderMulti), 2 Kommentare „CHR4“. Grund: Nachbarn G 2…4 ms stabil (Übergang −0,2…−0,7 dB, Knackser 0), G 3 ms bester Ausgleich.
- (A3) chr2-Grenzen gegen basis2 (F ≤ +0,2 %, Glätte ≤ +0,05, LSD ≤ +0,05): v30 hart F 2,77 > 2,74 und natürlich Gl 1,06 > 1,05 → würde FEHLER geben; G 3/R 10: Chor Ü −0,9/−0,8 dB, Gl ok, aber hart F 2,80. Prüfe G 3,5/4 mit R 10; sonst zurück auf basis5.
- (A4) Kein Rand-Wert hält alle chr2-Grenzen (G 3,5/R 10: hart F 2,78; G 4/R 10: natürlich Gl 1,14, +400 LSD ruhig): hart-Formant steigt bei kleinem G stets (2,74…2,93 statt 2,58). Entscheidung: index.html zurück auf basis5 (cmp gleich), Zahlen in NOTES für 2b. Weiter mit Tests.
