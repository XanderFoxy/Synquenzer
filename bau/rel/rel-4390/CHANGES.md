## 4.39.0 — North-Pads, Spuren erreichen, Tipp wählt wieder, Stopp-Logik

- **North:** Jedes Pad hatte schon eigene Werte. Die Verwirrung kam von zwei Stellen: Bei Wellen ohne Spektrum (z. B. Kick „Rund“ = Sinus) stand im Feld nur „–“, obwohl der Regler sich bewegte → jetzt steht der Wert immer da, gedimmt mit „ohne Wirkung · A1“. Und **ALLE KANÄLE** blieb beim Pad-Wechsel an (dann wirkt jede Änderung auf alle Pads) → geht jetzt beim Wechsel des Pads aus. Kurze, trockene Kick: DECAY ~12–18, NOISE LVL 0, CLICK 0.
- **Untere Spuren erreichen:** Der Knopf [▲▼] im Drum-Spurkopf (Seite 1/2) reagierte seit 4.35 auf dem iPhone nicht – geht wieder.
- **Tipp auf den Spurnamen = wählen** (wie vor 4.35). Stumm nur über [M], Halten = Solo, Lautstärke erst bei eindeutig waagrechtem Wischen.
- **Stopp:** Globaler ■ setzt alle Spuren auf „kein Clip“ – danach startet ▶ auf einen Clip nur diesen. Spur-■ löst beim Loslassen aus (kein verschluckter Tipp mehr).
- **Drum-Schild:** Mit Menü → Harmonie → Drums mittransponieren zeigt der Drum-Kopf ⇅ statt 🔒. LATCH unverändert (global, gilt für alle folgenden Spuren; die Leiste ist bei offenem Editor verdeckt).
Getestet: Regeln, acorn, Rauchtest; Kern-Tests der Reparatur auf 4.35-Kopie.
