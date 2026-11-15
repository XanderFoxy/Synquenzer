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
