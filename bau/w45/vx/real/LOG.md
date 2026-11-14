17:34 RV1 Start: real/index.html == basis5.html (cmp gleich). Datensatz: vocadito_1 (33.2 s, Noten A1 31 Stück, f0), _10 (9.1 s), _14 (12.2 s), alle mono 44.1 kHz.
17:39 rv1-test.mjs geschrieben (Import über Export-Blatt, Als Gesang, Analyse gegen notesA1, Text, Quant 1/8 Knack-Index, Verschieben ±60 ms, Chor Pop echt).
18:02 Lauf 1 (Basis 4.60, vocadito_1, 71 s): 15/25 OK. Zahlen: Import 115,7 BPM (roh 115,74, stabil 0,54), quelle 'mix' → KEINE Frage (FEHLER, echte tiefe Männerstimme 114–175 Hz gilt als Mix);
  Tempo-Treue der annotierten Einsätze Rang 3,3 % (beste 119). NX1 dehnt 115,7→116 (436 ms). Analyse 154 Stücke / 59 Noten, 3,2 s (Worker).
  Einsätze ±40 ms: 35/59 Stück-Anfang, 48/59 Vokal-Beginn; Präzision 52/154 Stücke an einer Note (Übersegmentierung); Tonhöhe 84/92 ±50 ct, Median 6 ct.
  Text: ohne Spracherkennung leer + Hinweis „im Marken-Editor Text wählen“. Quant 1/8: Sprung an 153 Schnitten max 0,059, 0 über 1,5× Quelle;
  Knack-Index (relativ) explodiert an Stille (Nenner 0) → Mess-Fehler; Anker-Raster max 127 ms (dichte Stücke, Vorgänger-Sperre).
  Links 60 ms: Ausklang 391 ms gleich bis 7e-5 (nicht bitgleich?); rechts: Dehnung 1,078, Ton −1 ct. Chor Pop echt 7,6 s: Versatz uni/oct-1 = Plan,
  st+2 32/40 ms statt 9/17, σ 16,7 ct (uni 5,2, oct-1 3,1); Formant 1,57/3,24/1,48 % in Plan-Richtung; Knack-Zählung relativ (Rest ×0,12 → Nenner klein) unbrauchbar.
18:14 Ursache Import-Befund: imp1Core teilt 48 kHz (Browser/Safari) auf 12 kHz, 44,1 kHz auf 11,025 kHz → Bass-Anteil (Band 30–120 Hz) echter Männerstimme
  0,026 (44,1k) bzw. 0,052 (48k) gegen Schwelle 0,03. Behoben (RV1, imp1Core): Gesang allein auch bei Bass < 15 % und ≥ 1,5 % leisen Rahmen (−30 dB).
  Node vorher→nachher bei 48 kHz: #1 mix 115,7 ohne Frage → gesang 118,6 + Frage (= 44,1k-Wert); #10 mix 114,4 → gesang 112 (= 44,1k); #14 gesang 132,6 (44,1k: 120,7, offen);
  Mischungen 92 4/4 / 120 3/4: leise Rahmen 0 % → unverändert mix 92/120.
