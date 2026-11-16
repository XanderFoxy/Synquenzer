# LOG SPKK
- 05:25:48 Start, Last: 1.13 1.43 1.22 2/198 15799
- 05:27:44 spkfix-test auf Basis 4.76.1: 11/11 OK (alle 6 A8-Punkte erledigt). Sonde p-finden. Last: 1.60 1.49 1.26 4/283 19401
- 05:29:13 p-finden Basis rot (196→54/53/55, 146,83→48/49, 329,63→64/63, 233,08→58/57 zerhackt); Block SPKK spkkF0 + 2 Haken; Fenster ±2 Bins. Last: 2.57 1.82 1.40 2/273 21918
- 05:31:40 Fassung 2 (Spitzen aus den Spektren der Suche, keine FFT dazu). Pflicht statisch grün, smoke errors [], finden9 Basis=Index. spkk-test läuft. Last: 3.41 2.76 1.84 7/307 25279
- 05:32:20 spkk-test 17/17 OK (49 s); Tempo finden 60 s Basis 1539 → Index 1448 ms; Pflicht: topdefs 26/0/0, dupkeys 0, smoke errors [], MS 2000 1×, live:true 1×, VERSION 4.76.1, diff 0 <, 34 >. md5 804c037b. Ende. Last: 2.86 2.71 1.87 2/287 25967
- 05:33:04 Regression Spur B (Ausschnitt) gestartet: reg/runb.sh i (Index) und b (Basis) parallel, Kopien der Tests in reg/<v>/. Last: 2.52 2.66 1.89 1/294 26689
- 05:34:40 p-worker-finden (echter Worker): Basis 196 → 54/53/55, Index → 55; Zeit im Rauschen (Index 136/251/337 ms, Basis 82/181/138 ms bei Last 5–10). In spkk-test aufgenommen. Last: 9.53 4.85 2.74 9/537 30085
- 05:35:15 Regression Teil 1: spk6k, spk6, spk9u, spk9poly, spk9f grün und gleich Basis; spk8s/spk10s/spk5 brauchen mess/ → Teil 2 (runb2.sh) gestartet. Last: 6.01 4.49 2.70 9/296 30643
- 05:38:25 Regression Teil 2: spk8s 14/0, spk10s 16/0, spk5 24/24 – Index = Basis. spkk-test 18/18 (mit Worker-Sonde). Pflicht erneut: siehe pflicht.log. md5 804c037b. Ende. Last: 5.67 4.87 3.17 1/289 3221
