# IMP2 – LOG (Tempo unabhängig von der Abtastrate)

- 20:58 Start. Paket-Ordner vx/imp2: index.html = basis.html (4.63.0). Gelesen: real/NOTES.md (Befund 4), imp/NOTES.md, imp1Core (down: k = floor(sr/11000) → 44,1k: 11 025 Hz, 48k/96k: 12 000 Hz, Dreieck-Filter).
- 20:59 Node-Prüfung imp2-node.mjs (imp1Core aus der Datei auf dieselben Stücke bei 22,05/44,1/48/96 kHz, mit dem Kommandozeilen-Umrechner in hoher Güte umgerechnet, Audio liegt
  außerhalb von vx unter realvox/imp2rs). Basis (node-vorher.txt): App-Renders 92 4/4 · 120 3/4 · 120 6/8 · MP3 · Melodie 96 überall gleich und richtig;
  #10 gleich (112); #14 120,7 (22,05k/44,1k) gegen 132,6 (48k/96k); #1 118,6 (bis 48k) gegen 119,7 (96k, Box-Filter 8). FEHLER 2 Gruppen.
  Wichtig: die App dekodiert Importe immer auf 48 kHz (ggbDecode, GGB_SR 48000) → im Browser-Test gilt die 48k-Spalte; 44,1k kommt über Takes (m.sr) / SPK1.
- 21:07 Block IMP2 in imp1Core (nach down(), läuft so im Worker mit) + Haken 1. Zeile in down(). Erst 1 Stufe (Kaiser 50 dB, 140 Abgriffe bei 48k):
  Kennlinie gleich, aber 515 ms/180 s → 2 Stufen (→ 22 050 Hz breit, dann Halbband → 11 025 Hz): 220 ms; schrittweise Phase + 2er-Schleife: 175 ms (alt 35 ms).
  40/35 dB getestet: kaum schneller, Kennlinie je Rate bis 0,3 dB verschieden → verworfen, 50 dB bleibt. resp.mjs: Durchlass bis 5 kHz ±0,1 dB bei 22,05/44,1/48/96k,
  6 kHz −40 dB, ab 7 kHz ≤ −49 dB (alt: Dreieck, 5 kHz −5…−6 dB, 7 kHz −10…−13 dB, je Rate anders).
- 21:07 imp2-node.mjs nachher (node-nachher.txt): ALLE OK – #14 120,6 bei allen Raten (Spanne 0,05), #1 118,6 (0,00), #10 112,13 (0,00), Renders gleich+richtig.
  Unabhängige Einsätze aus der Tonhöhe (pitchons.mjs + fitcurve.mjs): an #1 geeicht (beste 119,5 = Annotation 119); #14: 120,6 Rang 0,8 % (mit ½×), 132,6 Rang 59 % → 132,6 (alt, 48k) war falsch.
  #10: 112 Rang 76 % (Tonhöhe) / 53 % (Modell-Noten) – bei allen Raten gleich, aber wohl nicht richtig (Rest-Befund, nicht abtastraten-bedingt).
- 21:19 imp1-test (vx/imp): ALLE OK (48), 124 s (run-imp1.txt).
- rv1-test: Basis heute 48/53 (run-rv1-basis.txt), IMP2 45/53 (run-rv1.txt). +1: #1 „Einsätze ≥ 80 %" jetzt OK (Basis 38/59 → OK). −4: Verschieben links/rechts
  an anderen Stücken (#10 Stück 47 statt 30, #14 Stück 52 statt 55). Ursache: neues Tempo/t1 (#14 132,6 → 120,6; #10 t1 0,383 → 0,388) → imp1Take legt den Take
  ab Takt 0 an (Auftakt = Stille) → Take um einige ms verschoben → Marken (wpDetect) anders (#10 56 → 58, #14 69 → 66 Stücke) → Test wählt andere Stücke.
  Gegenprobe RV1_K: #10 Stück 30 mit IMP2 links+rechts OK (run-rv1-k10-30.txt); #14 Stück 55 FEHLER (anderes Stück als in der Basis). Fehler liegen im
  Gesang-Editor-Verschieben (Ausklang 31 ms vor dem Schnitt nicht bitgleich, #10 Ton −27 ct gegen Grenze 25, #14 Dehnung 1,61 gegen 1,55) – nicht im Import.
- vx1-test (rolle): 61/61 (run-vx1.txt).
- 21:19 Pflicht (Endstand): topdefs Skripte 26, doppelt 0, Syntax 0 · dupkeys 0 · smoke errors [] (smoke.png) · „MS 2000" 1× · „^  live: true," 1× ·
  VERSION 4.63.0 · keine Markenwörter im Unterschied zu basis.html · keine Datensatz-/Produktnamen unter vx/imp2.
- 22:10 PRÜFUNG (unabhängig, nichts repariert; Befunde in PRUEFUNG.md, Skripte/Läufe in pruef/). Pflicht an index.html: topdefs Skripte 26, Namen 7459, doppelt 0,
  Syntaxfehler 0 · dupkeys 0 doppelte Schlüssel · smoke errors [] (pruef/smoke.png) · „MS 2000" 1× (Basis 1×) · „^  live: true," 1× · VERSION 4.63.0 (= Basis) ·
  Markenwörter: Zählung je Wort = Basis bis auf „Kaiser" 4 → 6 (Fenster-Name „Kaiser-Sinc", Basis hat schon „Kaiser-Fenster"; keine Marke) · keine Datensatz-Namen
  unter vx/imp2 (Prüf-Skripte finden Dateien per Muster); Name der Umrechner-Bibliothek in NOTES.md Z. 31 und LOG.md Z. 4 (Befund 6). Regression einzeln nacheinander: imp1-test ALLE OK (48, 135 s,
  pruef/reg-imp1.txt) · rv1-test Basis 48/53, IMP2 45/53 (pruef/rv1-basis-1.txt, rv1-imp2-1.txt; = Bauer) · vx1-test 61/61 (pruef/reg-vx1.txt).
- 22:26 FIX-Auftrag (Prüfer-Befunde 1–6) Start: Befunde gelesen (PRUEFUNG.md), Plan: 1 Bedingung in imp2Rs, 5 Übergang Stufe 1, 4 Laufzeit, 2/3/6 Notizen + Test.
- 22:28 Befund 1 behoben: imp2Rs schrittweise nur bei ganzzahliger Rate mit voller Tabelle (`st = exact && P === P0`), sonst je Probe gerundet. Test fix/krumm-test.mjs (down-Pegel/Klick bei 22,05/32/44,1/48/96 kHz + 0,5/−0,3/0,001/… Hz; Analyse #1/#10/#14/92 4/4 bei sr+δ): vorher FEHLER 37/37, nachher ALLE OK (37) (fix/krumm-vorher.txt, fix/krumm-nachher.txt).
- 22:31 Befund 5 + 4 gebaut: Stufe 1 Übergang 5 000…16 025 Hz (fc 10 512,5, df 11 025 statt 11 025/12 050); reelle FFT imp2Spec (Haken 1. Zeile in spec()). fix/fft-test.mjs: Betrag gleich bis 1e-13, Analyse von 7 Stücken zeichengleich (alle Felder außer ms), Zeit 92 4/4 148 s 874 → 544 ms.
