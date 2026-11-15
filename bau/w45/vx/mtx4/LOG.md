# MTX4 LOG

- 05:00 Start; basis.html/index.html aus rel-4680 kopiert (d51aae93).
- 05:11 Block block.js + 3 Haken (scheduleTrack, renderGrid, openClipSheet) eingesetzt.
- 05:14 mtx4-test.mjs geschrieben, erster Lauf.
- 05:15 Lauf 1: 55/57 – quer war [Mehrere wählen] 36/34 px hoch (Blatt-Stil quer); wie [Werkzeugkasten ▾] auf 44 px gesetzt.
- 05:17 Lauf 2/3: 57/57 (Long-Task-Messung erst nach dem Start der Wiedergabe: 0 ab den Aktionen).
- 05:17 Foto-Prüfung: quer lag die Leiste über dem Blatt „In Tonart einpassen“ → Blatt neben die Leiste (mtx4PopPlace), Test prüft jetzt Überlappung.
- 05:20 Test ergänzt: Speicherstand bit-gleich (Unterschied kam nur vom Halten = selectSlot, wie immer).
- 05:21 Endlauf mtx4-test 58/58 (test-ergebnis.txt); topdefs 0/0, dupkeys 0, smoke errors [], MS 2000 1×, live: true 1×, VERSION 4.68.0. NOTES.md geschrieben. Teil 1 fertig.
- 05:22 Teil 2 Start.
- 05:31 Plan gelesen (Schritt 4: Länge ×2/÷2, Versionen, ↶). Entscheidung: Länge = vorhandenes clipLength (wie ½/×2 im Clip-Blatt); Versionen = SX9 (v1 = Szenen-Clip neu, vorher → vN).
- 05:29 Block Teil 2 (mtx4Len, mtx4Vers, Leiste ÷2/×2, Guide) + Test-Abschnitte geschrieben; Lauf 1.
- 05:33 Lauf 1: 79/81 – (a) Test nahm feste Clip-Längen an (jetzt aus dem Stand davor), (b) Test-Song nicht normalisiert (loop.b 0→1 durch restoreSong; Test-Artefakt, jetzt einmal normalisiert).
- 05:37 Lauf 3: 80/81 – Unterschied nur in auto-Tonarten anderer Clips der Szene (Szenen-Tonart folgt nach 400 ms); Test wartet jetzt 800 ms.
