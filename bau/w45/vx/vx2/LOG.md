# VX2 – LOG (Gesang-Editor an echtem Gesang: Stücke = Noten/Silben)

19:09 Start. vx2/index.html == basis.html == vx/basis6.html (4.62.0, cmp gleich). NOTES/LOG von RV1 gelesen (Übersegmentierung: #1 150 Stücke / 59 Noten, 37 % an einer Note; Raster #1 94/150, #10 31/56, #14 45/69).
19:12 Node-Diagnose (dbg/feat-node.cjs: Erkennung, Op 'vxa', G2-Tonhöhe aus index.html; dbg/eval0.cjs): #1 roh 213 Marken, Noten getroffen 41/59, Präzision 20 %;
  Tonhöhen-Noten (G2) 59 Noten, getroffen 50/59, Präzision 85 %. Erkennungs-Marken, die nicht an einer G2-Note liegen: 140, davon nur 3 an einer annotierten Note.
  Pegel-Tal mit 1-ms-Hülle unbrauchbar (Perioden-Welligkeit 7–13 dB auch im Vokal) → 30-ms-Pegel: fast alle < 6 dB (2 Fehlalarme, 1 echte Note 5,7 dB).
19:16 Kern dbg/vx2-core.js (vx2Pick, vx2AnLead) + dbg/eval.cjs (Stücke wie vx1rPieces): roh 213 → 60 Stücke, Präz 26 % → 85 %, Anfang 35 → 43, Vokal 46 → 50 (von 59);
  Einrasten an Erkennungs-Marken: ±20 ms besser als 60/30 ms (Anfang 39) und als gar nicht (42). Anker/Anlauf auf dem Hauptfaden = Op 'vxa' bitgenau (max Δ 0, alle 3 Aufnahmen), 12–16 ms.
19:17 VX2-Block nach NX1-END eingebaut + Haken (1 Zeile) in vx1rAnalyse. topdefs 0/0, dupkeys 0.
19:19 rv1-test #1 (run1.txt): 60 Stücke (vorher 150), an Note 52/60 = 87 % (vorher 51/150 = 34 %), Einsätze Anfang 45 / Vokal 49 von 59 (vorher 38 / 47), Raster 58/60 (94/150).
  NEU: 2 Knack- und 1 Sprung-Befund (Schnitte 34, 38).
19:21 Diagnose mit Puffer-Dump (Test-Kopie vx2/rv1-test.mjs, RV1_DUMP; dbg/q-1.json): Ausgang 5,4 ms vor Schnitt 34 = Quelle 36 ms vor dem Stück (Korrelation 0,99,
  2. Ableitung Quelle 0,126 ≥ Ausgang 0,115) – Konsonant im Ausklang des Vorgängers, der (gedehnt) bis an den Schnitt spielt. Bezugsfenster des Tests (±20 ms um
  Stück-Anfang und um die ungedehnte Vorgänger-Stelle) erfasst ihn nicht. Schnitt 38 ebenso (Quelle letzte 60 ms 0,076 ≥ Ausgang 0,020). Kein neuer Knackser.
  Versuch „Stimm-Beginn“ (Marke auf den Beginn des gesungenen Laufs ≤ 60 ms vor der Note, damit der Konsonant als Anlauf zum Stück gehört): Node Anfang 43 → 41,
  Vokal 50 → 50 – nicht messbar besser, nicht eingebaut (Weg in NOTES).
19:25 Lauf 2, alle 3 Aufnahmen (run2.txt, rv1-nachher.json): 48/53 OK. #1 60 Stücke, Raster 58/60 OK; #10 28 Stücke, Raster 20/28 (FEHLER, vorher 31/56); #14 32 Stücke, Raster 28/32 OK.
  Knack/Sprung nach Test-Bezug #1 2/1, #10 0/1, #14 0/0 – mit Bezug inkl. Ausklang des Vorgängers (INFO „VX2-Bezug“) überall 0/0.
  #14 Stück 23 rechts FEHLER (d2 0,0114 gegen Bezug 0,0055): Dump (Einzellauf #14) – Ausgang 5,5 ms vor der Naht = Quelle 30,8 ms vor dem Stück (Korrelation 1,000,
  Quelle 0,027 ≥ Ausgang) → derselbe Bezugs-Fehler; im Einzellauf #14 war die Prüfung OK. #14 allein: Chor σ 11,2 / Formant −1,0 % FEHLER – Basis 4.62.0 gleich (σ 11,1 / −0,96 %), nicht VX2.
19:27 Basis 4.62.0 (run0-basis.txt, rv1-vorher.json): 48/53 – FEHLER #1 Einsätze (Anfang 38, Vokal 47 = 79,7 %), #1 Präzision 51/150, Raster #1 94/150, #10 31/56, #14 45/69; Knack/Sprung 0.
19:29 vx1-test (rolle/vx1-test.mjs, reg/vx1.txt): ERGEBNIS 61/61 – alles OK.
19:31 imp1-test (imp/imp1-test.mjs, reg/imp1.txt): ALLE OK (48), 119 s.
19:33 Pflicht: topdefs Skripte 26, doppelt 0, Syntaxfehler 0 · dupkeys 0 · smoke errors [] (smoke.png) · „MS 2000“ 1× (= Basis) · „^  live: true,“ 1× (= Basis) · VERSION 4.62.0 ·
  Markenwörter: keine im Block (Zählung = Basis) · keine Datensatz-/Produktnamen in App, Tests, Notizen unter vx2 · basis.html unverändert · Diff zur Basis 95 Zeilen (Block + 1 Haken-Zeile).
  Tests nacheinander, nie parallel. Puffer-Dumps (*.f32) gelöscht.

## Prüfung (unabhängiger Prüfer, 20:20) – Pflicht und Läufe, einzeln nacheinander
- Pflicht index.html: topdefs Skripte 26, doppelt 0, Syntaxfehler 0 · dupkeys 0 · smoke errors [] (pruef/smoke-pruef.png) · „MS 2000“ 1× (= Basis) · „^  live: true,“ 1× (= Basis) · VERSION 4.62.0 · Markenwörter je Wort = Basis, 0 im Block · keine Datensatz-/Produktnamen unter vx2 (auch nicht in pruef/).
- Regression: vx1-test 61/61 (pruef/reg-vx1.txt) · imp1-test ALLE OK (48) (pruef/reg-imp1.txt) · rv1-test offiziell VX2 49/53, Basis 48/53 (pruef/run-vx2-a.txt, run-basis-a.txt).
- Befunde: PRUEFUNG.md (2 schwer, 2 mittel, 4 leicht).

## Prüfer-Befunde beheben (Auftrag VX2-P)
20:18 PRUEFUNG.md gelesen (2 schwer, 2 mittel, 4 leicht). Vorher-Stand gesichert: fix/index.v1.html (= index.html vor der Behebung), dbg/vx2-core.v1.js.
20:20 Befund 1 nachgestellt in Node (fix/eval2.cjs: Anfang/Vokal/Präzision + verloren/zusammen wie der Prüfer, gegen A1 und A2; fix/ftab.cjs Merkmal-Tabelle):
  VX2 v1 A1 verloren 5, zusammen 4; A2 Vokal 52/64, verloren 8, zusammen 8; nur-A2-Silben 5/13 (Erkennung roh 10/13).
  Merkmale der 11 Kandidaten an echten Silben: sicherer Einsatz (conf ≥ 0,6), Pegel-Tal 2,5–6 dB, Nulldurchgänge im Tal < Vokal (Nasal/Lateral);
  die 120 Kandidaten ohne Note: kein einziger mit conf ≥ 0,6 + Tal ≥ 2 dB + weniger Nulldurchgänge.
20:22 Regel „stimmhafter Konsonant“ in vx2Pick (fix/vx2-core.js): A1 verloren 5 → 4, zusammen 4 → 3; A2 Vokal 52 → 57/64, verloren 8 → 2, zusammen 8 → 2,
  nur-A2-Silben 5 → 9/13; #10 29 → 30, #14 30 → 33 Stücke. Tal-Schwelle 2 dB (2,5: A2 verloren 3; 3: 4). Rest (A1 8,03/10,25/13,14/22,21 s) = späte/frühe
  Tonhöhen-Noten, an denen A1 und A2 sich selbst um 40–100 ms unterscheiden – nicht angefasst.
20:23 Befunde 2/3: VX2-Marken nur noch Sicht des Gesang-Editors (VX2.res, vx2Mk), WP.det bleibt; nicht mit Songtext (m.lyrics/m.ly) oder gespeicherten
  Marken; SPK5-R im VX2-Weg (Quelle gewechselt → neu messen, ≤ 2×), Haken in vx1rAnalyse gibt die gemessene Quelle zurück. 2 neue Haken-Zeilen
  (vx1rPieces, vx1rCommit: vx2Mk statt wpMarks). sync.py-Anker angepasst (idempotent geprüft). topdefs 0/0, dupkeys 0. Node „check“: Kern = Op 'vxa' (Δ 0, #1/#10/#14).
20:26 Neuer Test vx2-test.mjs (Befunde 2/3/6/7, Weg „erkannte Marken + VX2“ ohne gespeicherte Marken): fix 14/14 OK; gegen fix/index.v1.html 10/14 –
  die 4 FEHLER sind genau Befund 2 (Marken 9 → 6 app-weit; Text Fall A/B springt) und Befund 3 (Analyse auf alter Quelle) → fix/vx2-test-v1.txt.
