# FOK3 LOG
- 02:19:40 Start, Last 7.30 6.58 5.17. basis.html = index.html = rel-4760 (md5 b23d02dd…)
- 02:26:36 Kern + Anzeige eingebaut (apply.py, apply2.py), Last 5.32
- 02:29:02 fok3-test.mjs geschrieben, erster Lauf startet, Last 1.89
- 02:31:51 Lauf 1 (v1) zeigt: örtliche Änderung bekam Näherung für alle 16 Stücke (Schätzung nach id:ver zu grob) → v2: Streifen-Kennung je Inhalt + Entscheidung je Stück (> 40 ms). Long Tasks viele (Texturen 2× hochgeladen?) – Vergleich basis abwarten. Last 3.14
- 02:32:16 Lauf 2 (v2) gestartet; Regressionskette A (kern, spk6, spkfix, spk5, spk12×3) parallel als Kopie in reg/
- 02:35:35 v3: Nachreichen als EIN Auftrag mit Liste (keine Wartezeit je Stück auf den Hauptfaden), neu planen nur bei neu sichtbaren genäherten Stücken (≤ alle 250 ms). Lauf 3 startet. Lauf 2 (v2): 10/10 Hashes gleich v6, m3 (↶) genau 2827 vs 1594 ms → Anlass für v3. Last 4.48
- 02:35:53 Kette B (smoke, fok2-test LANG=0, fokus1-test LONG=0 CPU=0, kern v3, spkfix) parallel gestartet
