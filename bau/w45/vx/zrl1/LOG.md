21:07 | load average: 0.51, 0.86, 0.67 | Start: index.html+basis.html aus rel-4740 kopiert
21:13 | load average: 0.45, 0.64, 0.64 | Node-Profil (mess/zr-node.mjs + prof.cjs): 20 s zerlegen 2,2 s, 3 min 15,2 s; Browser-Basis 20 s 1724/1948 ms (Last 0,3)
21:15 | load average: 0.23, 0.54, 0.61 | Browser-Basis 3 min 14027 ms, Renderer-RSS 384→392 MB; Sicherung index.vor-opt1.html
21:17 | load average: 1.44, 0.95, 0.75 | opt1 (magPair sqrt, medLine ersetzen, zPrep symmetrisch, REPET-Bytes, 3x3 vorab): Node 20 s 1,9-2,4 → 1,4-1,5 s, 3 min 15,2 → 9,4 s, Energien bitgleich
21:19 | load average: 1.54, 1.12, 0.84 | opt2 (Sortiernetz REPET, bassTrack4-Tabellen): Node 20 s 1,37 s (Basis 2,06), 3 min 9,2 s; bitgleich; Sicherung index.vor-opt2.html. Start Browser-A/B
21:21 | load average: 6.90, 3.27, 1.68 | zrl1-test Lauf 1 ALLE OK: 20 s Median 1306 vs 1938 ms (x1,48), 3 min 12250 vs 15150 ms (Last bis 6,4), SDR/Energie gleich, RSS max 395 MB. Start Regression (reg/run.sh, 2 Ströme)
21:29 | load average: 3.86, 6.11, 4.09 | Regression: spk5 24/24, spk6 26/26, fokus1 26/0, spk11b 17/0 (Kopie mit absolutem lib-Pfad), spk4 6 FEHLER → Basis-Lauf spk4 gestartet (basis-lauf/); Rauchtest errors [], topdefs 0/0, dupkeys 0
21:32 | load average: 3.08, 4.93, 3.96 | spk1 17/18 (Basis gleich: verfeinern-verbessert-ziel), spk11 41/0, spkfix 11/11; warte auf spk4-Basis
21:40 | load average: 0.68, 1.89, 2.87 | spk4 Basis 3 FEHLER (pflicht, verfeinern+1, ki1 quer) – Index zusätzlich a3-Nachbau (Last 9–10) + reg-spk2 (noten-erkannt): spk2-test direkt Index = Basis (je 27/30, gleiche 3 FEHLER, Noten 12/51 gleich); Klang-Probe bei Last 0,5 Text gleich, Zeiten 2329/1680/2495/2062 → 2066/1563/2259/2057 ms
21:40 | load average: 0.53, 1.79, 2.83 | NOTES.md fertig, Endfassung md5 d6b3289dcc42e242bc8465d69ee7bb5c, Abgabe
22:11 | load average: 0.43, 0.93, 1.84 | Nachbesserung Prüfung: Sicherung index.vor-pruef.html + NOTES.vor-pruef.md; Befund 1 medLine W=2h+1
22:13 | load average: 0.84, 0.94, 1.74 | medLine-Fix: medline-alle L=1..40 0/578665 abweichend (vorher 12990 bei geradem L); zr-node 20 s + 3 min Energie/SDR bitgleich zur Basis; Start zrl1-test RUNDEN3=2
