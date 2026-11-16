# LOG teil1
23:40 Start, Basis rel-4750 (rel-4760 fehlt), Last 1.15 1.80 2.45
23:47 Block TEIL1 + Haken eingebaut, Last 0.74 1.13 1.95
23:49 Test teil1-test.mjs geschrieben, erster Lauf 428x926, Last 4.89 2.73 2.44
23:53 Fixes: Teste Streifen bei 13 px (Chrome-Touch-Anpassung zum Regler), spk11Seg Pegel jede 16. Probe; Lauf 3 Größen, Last 4.33 4.30 3.28
23:56 Streifen greift keine Loop-Klammer mehr; Pegel jede 32. Probe; Long-Task-Fenster im Test. Last 3.09 3.98 3.34
23:58 mess/ (Demo-Stems) aus fokus1 kopiert, spk2-loop-test wird am Ende von Strom B wiederholt. Last 12.78 6.67 4.37
00:00 teil1Sync: Neu-Zuschnitt nur noch über den ResizeObserver (spart 1 volles Neuzeichnen je Umschalten). Last 13.74 8.76 5.34
00:00 Regression läuft (spk11 41/0, fokus1-kern 26/0, imp1 ALLE OK), NOTES-Entwurf. Last 12.32 8.87 5.48
00:07 Ende: teil1-test 59 OK / 2 (T1 Zeitziel unter Last), Regression grün außer fokus1-test Long-Task-Schwellen (wie im FOKUS1-Release-Lauf), Rauchtest ok, md5 7fcf0543. Last 5.37 8.53 6.74
00:11 A/B spk2-loop-test gestartet, Probe wird geschrieben, Last 3.81 6.26 6.25
00:13 Probe 428 fertig (Kopf abgeschnitten, Still-Meldung, bg ok), spk2-loop A/B je 18 OK, Last 3.74 5.67 6.04
00:14 Probe 926x428/428x926: keine Überdeckung im Streifen; 3. Tipp auf denselben Teil zoomt nicht mehr hinein (alle 3 Größen). Last 2.84 4.73 5.65
00:16 Auftakt-Probe: Loop-Zeile 'Takt 0–4', Blatt 'Takt 1–4', Szene ohne Vorlauf-Takt; spk11 A/B läuft. Last 4.87 4.86 5.62
00:18 spk11 A/B 41/0 beide. Ende Prüfung: 7 Befunde (2 mittel, 5 klein), Paketdateien unverändert (md5 7fcf0543). Last 7.54 5.70 5.81
00:19 Nachbesserung Start (Prüfer-Befunde 1–7), Last 6.18 5.62 5.79
00:25 Nachbesserung eingebaut (B1 Fokus 1,3×, B3 Pack+Zähler, B4 Auftakt, B5 Kopf, B7 Status, F selHit). Last 1.55 3.36 4.74
00:29 Nachtest 428 11/0, Auftakt 4/0; gestartet: Nachtest quer, teil1-test, spk11, spk11b. Last 2.32 2.82 4.28
00:30 Befund aus dem Nachtest: Kopf-Span quer wieder sichtbar (display:flex schlug display:none) → quer ausgeblendet; Läufe neu gestartet (Nachtest quer, teil1-test, spk11). Last 9.51 5.89 5.26
00:31 Nachtest quer 22/0 (Endfassung 7d47c214); spk11b gestartet. Last 10.31 6.96 5.68
