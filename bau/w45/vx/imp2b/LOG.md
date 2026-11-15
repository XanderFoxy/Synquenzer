# IMP2B – LOG

- 00:54 Start. Gelesen: vx/imp2 NOTES/LOG/block.js/apply.mjs, iso-befund (chr-full2.log gegen chr-spk9only.log), chr2-test Mess-Teil, Chor-Code
  (chr2RealPlan, renderMulti, g6pRun: Versatz = copyWithin um ms), Import-Ablage (imp1Place → nx1ImpView/NX1-Dehnen → ggbPlace, imp1Geo).
  imp1Core wird nur vom Import benutzt. index.html = basis.html + IMP2 (72 Zeilen Unterschied), imp1Core = vx/imp2/index.html.
- 01:00 Sonde work/chr-probe.mjs (chr2-test 2a/2b + Puffer-Dump) auf basis/index, nacheinander: Basis 120,4 → Projekt 120, NX1 q 1,0033;
  IMP2 120,5 → Projekt **121**, NX1 q 0,9959; Take 498 907 vs 494 685 Proben. Versatz echt/ohne (erste Probe ≠ 0) in beiden = Plan 6/12/9/17/15/16 ms.
  NaN: Rahmen s 94 501 ganz in digitaler Stille (x1 = x2 = n1 = n2 = 0 → 0/0), nur IMP2.
- 01:01 Node work/lead-tempo.mjs: Basis 44,1k 120,55 / 48k 120,39; IMP2 44,1k und 48k 120,54 (= Basis bei 44,1k). work/lead-ons.mjs: 17 Einsätze,
  10 davon daneben (−73…−82 ms, Ausklang) → Schätzung 0,4–0,5 BPM zu hoch in beiden.
- 01:02 rv1-test index (work/rv1-index.txt): 4/53, 112 s. 01:06 rv1-test basis (work/rv1-basis.txt): 1/53 (nur #10 Raster), 106 s.
- 01:04 work/ana2.mjs (Mess-Teil des Tests unverändert an den Puffern) = Browser-Zahlen exakt (inkl. NaN); work/lag2.mjs: SR-Fehler (×1,088),
  Nebengipfel im Abstand der Periode (r-Unterschied < 0,002), Mutation +8 ms alt +4,0/+12,2 → mit SR 48k + 20 ms Glättung 7,4…8,4 ms;
  work/ana2fix.mjs (korrigiert): Basis und IMP2 ALLE OK.
- 01:09 Kopie vx/chr3/chr2-test-imp2b.mjs (Original unverändert, Begründung im Kopf). Erster Lauf brach ab (Kommentar verschluckte Code) → korrigiert.
- 01:15 chr2-test-imp2b: index ALLE OK (82) 110 s (work/chr2fix-index.txt) · basis ALLE OK (82) 108 s (work/chr2fix-basis.txt).
- 01:16–01:17 Gegenproben gleiche Take-Lage (work/rv1s-test.mjs, RV1_T1): Basis #10 t1 0,388 → 31 Stücke, Knacken 4,05, Raster 24/31 = IMP2;
  Basis #14 120,6 + t1 0,686 → Raster 31/37, Stück 35 links Abw. 0,1086 bei 346 ms = IMP2; IMP2 #10 t1 0,383 → 32 Stücke, kein Knacken = Basis.
  → rv1-Rückschritt kommt aus dem Gesang-Editor (VX), nicht aus IMP2-Code; Test misst richtig. Nicht in IMP2B behebbar → nichts eingebaut.
- 01:19 Regression + IMP2-Tests + Pflicht an index.html (unverändert), nacheinander: work/reg.sh → work/reg/*.txt.
- 01:21 Endstand (work/reg/, nacheinander, an index.html unverändert, sha256 a4d6e9ef…): imp1-test ALLE OK (48) 122 s · vx1-test 61/61 ·
  vx2-test 14/14 · vx3-test 15/15 · IMP2-eigene: imp2-node.mjs ALLE OK (22,05/44,1/48/96 kHz: #14 Spanne 0,05, #1/#10/Renders 0,00–0,01 BPM) ·
  fft-test ALLE OK (6) · krumm-test ALLE OK (37) · sweep schlechteste Sperre −51,7 dB.
  Pflicht: topdefs Skripte 26, Namen 7474, doppelt 0, Syntaxfehler 0 · dupkeys 0 doppelte Schlüssel · smoke title SYNQUENZER errors []
  (work/reg/smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.66.0 (= Basis) · Markenwörter: neue Wörter gegenüber basis.html nur
  Fachwörter des IMP2-Blocks (u. a. „Kaiser“ = Fensterform, wie in IMP2 geprüft), keine Marke · keine Datensatz-/Produktnamen in neuen Dateien
  (NOTES/LOG, work/*.mjs/*.sh, chr3/chr2-test-imp2b.mjs; Audiodateien werden per Muster gefunden).
  chr2-test Original an index.html bleibt 3 FEHLER (iso-befund), Kopie chr2-test-imp2b 82/82 (index und basis). rv1-test 4/53 (index) vs 1/53 (basis).
  Kein Code eingebaut (kein IMP2B-Block): rv1 ist ohne Eingriff in den Gesang-Editor nicht ≥ 52/53 zu bekommen.

## Prüfung (unabhängig, nichts repariert) – Befunde: PRUEFUNG.md, Läufe: pruef/out/
- 01:22 Start Prüfung. index.html sha256 a4d6e9ef… / basis.html 51da4b6b… unverändert; imp1Core index = vx/imp2 (89e25b1d…), Diff nur in imp1Core.
- 01:26–01:41 pruef/lauf.sh nacheinander: Pflicht · chr2 Original index 3 FEHLER (zahlengleich) / basis 82 · chr2-test-imp2b index 82 / basis 82 ·
  rv1 index 4/53 / basis 1/53 (zeilengleich mit IMP2B) · imp1 ALLE OK (48) 131 s · vx1 61/61 · vx2 14/14 · vx3 15/15 · imp2-node index ALLE OK
  (basis: #14 Spanne 11,87, #1 1,10 BPM) · fft ALLE OK (6) · krumm ALLE OK (37) · sweep −51,7 dB.
- 01:42–01:52 pruef/lauf2.sh: tempo-raten (14 synth. Fälle × 4 Raten: Projekt-Tempo richtig bei 48 kHz Basis 14/14, IMP2 12/14) · synth. rv1
  (Import → Editor → Quantisieren → Chor): IMP2 61/61, Basis 2/61 (Chor-Messung) · Gegenprobe Basis #10 t1 0,388: Knacken 3,93 (IMP2B: 4,05), 2× wiederholt.
- 01:53–01:58 Sonden: imp2Down 48k gegen 44,1k −70 dB, Tempo kippt trotzdem (Schätzer unstetig); Mutation Versatz-Schätzer der Kopie ±0,7 ms; NaN-Rahmen s 94 501.
- Pflicht (index.html, 02:01): topdefs Skripte 26, Namen 7474, doppelt 0, Syntaxfehler 0 · dupkeys 0 doppelte Schlüssel · smoke title SYNQUENZER errors []
  (pruef/out/smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.66.0 (= Basis) · neue Wörter nur IMP2-Fachwörter/Bezeichner, keine Marke ·
  keine Datensatz-/Produktnamen in neuen Dateien (IMP2B + pruef/).
- 02:01 PRUEFUNG.md geschrieben: S1 (rv1 4/53, Ziel verfehlt), M1 (48-kHz-Projekt-Tempo Vokal 12/14 statt 14/14), M2 (spk1Grid nutzt imp1Core), M3 (rv1-Chor-Messung), L1–L4.

## IMP2B-FIX (Prüfer-Befunde beheben) – Bau `fix/block.js` + `fix/apply.mjs` → `fix/index.html`, Läufe `fix/out/`, Dumps `fix/dbg/`
- 02:02 Start. PRUEFUNG.md/NOTES/LOG gelesen, rv1-Fehlerzeilen (#10 Knacken Schnitt 13, #10/#14 Raster „frei daneben“, #14 Stück 35 links) eingegrenzt.
- 02:04 Dump-Lauf `fix/rv1d-test.mjs` (= work/rv1s-test.mjs, RV1_DUMP) #10/#14 an index.html (IMP2): Zahlen = Prüfer (Knacken 4,05 an Schnitt 13).
- 02:06 `fix/hyb-sim.mjs` (nx1RunG + vsStretchMake aus der Datei, Node) rechnet den App-Render bitgleich nach (max. Abweichung 0). Ursache #10:
  Stück 12 (79 ms) liegt 0,75 ms vor einem nahtlosen Nachfolger → „Lücke“ → WSOLA dehnt 37 ms Vokal um 1,13× → Knacken. Fix imp2bGap (Lücke ≤ 2 ms
  nicht dehnen, Quelle läuft durch, Überblendung im Vorlauf): Verhältnis 4,06 → 0,87, #14 unverändert (bitgleich).
- 02:07 `fix/move-sim.mjs` #14 Stück 35 links: Vorgänger 34 ist im Quantisier-Stand GEDEHNT (Lücke 32 ms), nach dem Verschieben keine Lücke → Quelle
  ungestaucht, abgeschnitten (richtig). rv1 vergleicht mit der gedehnten Fassung nach ↶ → kann nie bitgleich sein (erste Abweichung 206 ms vor dem Schnitt).
- 02:08 `fix/raster-sim.mjs`: „frei daneben“ #14 Stück 15 / #10 Stück 3 = gleiches Muster: Nachfolger bekommt die gemeinsame Linie, das zurückgesetzte
  Stück sperrt ihn mit seinem Einsatz 10 bzw. 3,7 ms von der Linie. Fix imp2bYield (nicht eingerastetes k−1 gibt ≤ 15 ms nach).
- 02:09 Test-Kopie `fix/rv1-test-imp2b.mjs` (Bau `fix/mk-rv1copy.mjs`): Chor-Messung (envOf 20 ms, stiller Formant-Rahmen zählt nicht) + Verschieben
  links auch gegen die ungedehnte Quelle. Lauf #10/#14 an fix/index.html: Knacken 0,89, Raster beide „frei daneben 0“, #14 links OK.
- 02:10–02:14 Versuch M1 (Gesangs-Spitzen zwischen Rahmen interpolieren, `fix/tempo-raten-x.mjs`): 112A 112,27 → 112,28 – bringt nichts, abgebrochen, nicht eingebaut.
- 02:14 Kette `fix/lauf.sh` gestartet (nacheinander). Pflicht an fix/index.html: topdefs Skripte 26, Namen 7476, doppelt 0, Syntaxfehler 0 · dupkeys 0 ·
  smoke title SYNQUENZER errors [] · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.66.0 · neue Wörter gegenüber index.html nur Fachwörter/Bezeichner
  (imp2bGap, imp2bYield, Ableitung, Kleinst, eingerastetes …), keine Marke · keine Datensatz-/Produktnamen in neuen Dateien.
- 02:16 rv1-test ORIGINAL an fix/index.html: **FEHLER 1/53** (vorher 4/53; einzig #14 Stück 35 links = Bezug gedehnte Fassung).
- 02:18 rv1-Kopie: Glättung im Fenster-Median lagMed verschlechterte #1 (18/6 …) → `fix/lagmed-sim.mjs` an #10-Puffern: Original-lagMed trifft 5/6,
  jede Glättung 6–8 ms daneben → zurückgenommen (nur envOf/Rückfall 20 ms + NaN-Fix bleiben). Kopie-Läufe danach neu.
- 02:14–02:28 Kette fix/lauf.sh an fix/index.html (nacheinander, fix/out/zeit.txt): rv1 ORIGINAL 1/53 · chr2 Original 3 FEHLER (unverändert, Ursache Test,
  Projekt-Tempo 121) · chr2-test-imp2b ALLE OK (82) · synth. Takes (pruef/syn, RV1_ONLY=1,2,3) ALLE OK 61 · imp1 ALLE OK (48) 118 s · vx1 61/61 · vx2 14/14 ·
  vx3 15/15 · imp2-node ALLE OK (#14 Spanne 0,05, #1/#10 0,00) · fft ALLE OK (6) · krumm ALLE OK (37) · sweep −51,7 dB.
- 02:28–02:31 rv1-Kopie (lagMed wie Original) neu: fix/index.html **ALLE OK 53** · basis.html FEHLER 1/53 (nur #10 Raster – die Kopie verdeckt nichts).
- 02:31 index.html (IMP2, a4d6e9ef…) → index-imp2.html; fix/apply.mjs baut daraus fix/index.html; **index.html = fix/index.html** (sha 9f414c75…),
  basis.html unverändert (51da4b6b…). 02:33 NOTES.md (Abschnitt „Prüfung – IMP2B-FIX“, Korrekturen L1/L3/L4/M2 im Text) geschrieben.
