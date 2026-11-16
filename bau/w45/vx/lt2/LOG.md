05:16 Start, Last 0.23 0.64 0.81
05:23 LT2-Block eingebaut (Programm ohne Tönungs-Zweig), Probe: 21/21 Ansichten byte-gleich, Zeichnen 10–14 statt 14–22 ms; Last 1.68 1.63 1.24
05:26 Teil 2 (eine neue Kachel je Bild beim Aufbau) eingebaut; Probe b: index 0 / basis 60 ms, Bild gleich; A/B-Lauf nach.out gestartet (a,a2,b,d, REPS=3), Last 1.23 1.41 1.22
05:28 Tönungs-Probe (nl=2): Programm mit fester Ebenen-Zahl byte-gleich, aber nicht schneller (41 vs 31 ms Median) → verworfen; Last 1.93 1.57 1.29
05:29 Pflicht (topdefs 0/0, dupkeys 0, smoke [], MS 2000 1×, live 1×, Marken 176=176) ok; Diff +52/−2 (Block 50 Zeilen 109972–110021 + 2 Haken-Zeilen); Last 5.19 2.57 1.66
05:37 A/B nach.out fertig (Last 1,3–9,7; ab 05:31 Regression + fremde Agenten parallel). Regression 1: spk12c 47/0, fokus1k 26/0, fok2 21/0, spk12 98/0, spk12b 72/0, spk6 OK, fokus1 (LONG=0) 47/3 (nur longtasks 926x428 bei Last 5,5–9); spk1/spk5/spkfix fehlten Testdateien → reg2.sh. A/B nach2 (b,d) gestartet; Last 5.34 4.69 2.97
05:40 nach2 (b,d) fertig: b 428x926 index 0/0 vs basis 61/69, b 926x428 53/61 vs 100/127 (Last ~5), d 926x428 64/63 vs 106/93; Bilder gleich. Regression spk1 (wie 4.76.0), spk5 OK 24, spkfix OK 11. NOTES fertig. Last 2.12 3.70 2.95
06:21 Prüfung Start (Befunde des Prüfers), Last 9.58 10.53 8.39
06:24 Sicherung index.vor-pruef.html (febbfca4…); 3 Änderungen im LT2-Block (Object.create, Rate k nach Bildfolge, Kommentar); topdefs/dupkeys 0; Last 7.28 8.73 8.10
06:26 Kommentar „WebGL-Leinwand“ → „Grafik-Leinwand“ (webgl ohne Groß/klein 6 → 5 = basis); Endfassung md5 47b4ffc8…; Tests neu gestartet; Last 26.83 14.36 10.13
06:34 lt2p-test (G+R) ALLES OK 12 Prüfungen (Last 14–16); Gegenprobe Fall G auf index.vor-pruef: 3 FEHLER (24 WebGL-Warnungen, getError 1282) → Test greift; Last 14.05 16.73 13.46
06:45 NOTES Prüfung geschrieben; Regression A/B: spk12c 44/3 = basis 44/3, fokus1 44/6 = basis 44/6, fok2 19/2 vs basis 18/3, fokus1k 26/0, spk6/spk5/spkfix OK, lt2-test Bilder 8/8 gleich, a2/b bei Last 5–10 index b 0/0 vs basis 89/89; Last 4.90 11.96 13.62
