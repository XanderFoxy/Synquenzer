# VX3 LOG

- 20:59 Start. index.html = basis.html = 4.64.0 (basis8.html). Lese VX2 NOTES/PRUEFUNG, analyze.mjs.
- 21:06 Sonde probe3.mjs (Kopie Prüfer-Sonde + Quelle) an 4.64.0: #1 12/31, #10 9/13, #14 7/18; A1 Anfang 45 Vokal 50 Präz 50/69 (= Auftrag). Node ev3.cjs rechnet 'vxa' an der App-Quelle bitgleich (kind/an/lead Δ 0).
- 21:09 Varianten in Node (ev3.cjs): über 1/2/3 gesungene Rahmen #1 19/21/22, #10 10/11/11, #14 17/18/18; Grenze 150 ms ab Vokal-Einsatz statt ab Marke #1 22→25; Lücke ≤3 stille Rahmen (#14 15→18). Gewählt: ≤3 Rahmen, Lücke 3, Marke im stimmlosen Rahmen zählt, 150 ms ab Vokal-Einsatz, Anker-Abstand ≤0,2 s. A1 Anfang 45→39 (Annotation = Vokal-Einsatz), Vokal 50→50, Präz 50→50, A2 Präz 56→57.
- 21:09 Block VX3 + 4 Haken (nx1RunG, wpWorker, wpCall, vx2AnLead) eingebaut; Node-Kern aus index.html = Variante (25/31, 11/13, 18/18).
- 21:10 App-Sonde VX3: #1 25/31, #10 11/13, #14 18/18 (vorher 12/9/7); A1 Anfang 39 Vokal 50 Präz 50; Stücke 69/32/35 gleich; Node-Kern = App bitgleich. vx2-test 14/14 (reg/vx2.txt).
- 21:12 rv1-test (reg/rv1.txt): 52/53, nur #10 Raster rot wie 4.64 (24/32; 4 gesperrt/3 Linie besetzt statt 3/4); Raster 67/69 · 24/32 · 30/35 gleich; Einsätze 39·50 (4.64 45·50) grün über Vokal; Präz 50/69 gleich; kein Knacken/Sprung.
- 21:15 vx1-test 61/61 (reg/vx1.txt), imp1-test ALLE OK (126 s) (reg/imp1.txt).
- 21:18 eigener Test vx3-test.mjs: Legato-Tonwechsel (synthetisch) bekam 35 ms Anlauf (Periodik am Tonwechsel kurz gestört → 2 'stimmlose' Rahmen). Echt-Läufe angesehen (dbg/runstat.cjs): Brücke zwischen zwei gesungenen Läufen ohne Verschluss nur mit ZCR ≥ 0,15 oder ≥ 3 dB leiser → fällt weg: #1 13,61 s (10 ms), #10 2,30 s (20 ms). Danach #1 24/31, #10 10/13, #14 18/18.
- 21:19 App-Sonde nach Legato-Schutz: #1 24/31, #10 10/13, #14 18/18; A1 Anfang 39 Vokal 50 Präz 50; A2 Präz 57 (56); Stücke 69/32/35 (reg/probe-analyze.txt). vx3-test 9/9 (reg/vx3.txt); gegen basis.html rot (Stücke 75 ms hinter dem Konsonanten-Beginn).
