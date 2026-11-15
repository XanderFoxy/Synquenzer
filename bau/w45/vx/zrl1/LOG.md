21:07 | load average: 0.51, 0.86, 0.67 | Start: index.html+basis.html aus rel-4740 kopiert
21:13 | load average: 0.45, 0.64, 0.64 | Node-Profil (mess/zr-node.mjs + prof.cjs): 20 s zerlegen 2,2 s, 3 min 15,2 s; Browser-Basis 20 s 1724/1948 ms (Last 0,3)
21:15 | load average: 0.23, 0.54, 0.61 | Browser-Basis 3 min 14027 ms, Renderer-RSS 384→392 MB; Sicherung index.vor-opt1.html
21:17 | load average: 1.44, 0.95, 0.75 | opt1 (magPair sqrt, medLine ersetzen, zPrep symmetrisch, REPET-Bytes, 3x3 vorab): Node 20 s 1,9-2,4 → 1,4-1,5 s, 3 min 15,2 → 9,4 s, Energien bitgleich
21:19 | load average: 1.54, 1.12, 0.84 | opt2 (Sortiernetz REPET, bassTrack4-Tabellen): Node 20 s 1,37 s (Basis 2,06), 3 min 9,2 s; bitgleich; Sicherung index.vor-opt2.html. Start Browser-A/B
21:21 | load average: 6.90, 3.27, 1.68 | zrl1-test Lauf 1 ALLE OK: 20 s Median 1306 vs 1938 ms (x1,48), 3 min 12250 vs 15150 ms (Last bis 6,4), SDR/Energie gleich, RSS max 395 MB. Start Regression (reg/run.sh, 2 Ströme)
