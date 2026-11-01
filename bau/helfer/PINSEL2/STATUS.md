# PINSEL2 – Stand

Geprüft (Chromium, Test-Rolle): Ein schnelles Wischen über 16 Spalten in 260 ms ändert nichts. Bei 3 Zielen mit Verweilen werden genau diese gesetzt, plus der Lauf A-G-F-E-D zwischen den letzten zwei Zielen. Dabei kommen 3 Ticks und es gibt 1 Undo, das alles zurücknimmt. Ein kurzer Tipp ändert nichts. `bau/tests/smoke.mjs` läuft ohne Fehler, und acorn findet keine doppelten Top-Level-Namen. Die Regeln sind erfüllt: `live: true,` steht 1×, die verbotenen Wörter 0×, „MS 2000“ 1×.

**Noch nicht auf dem iPhone gesehen – nicht fertig ohne dein Okay.**

## Bitte prüfen
1. Melodie öffnen, Pinsel wählen (steht auf „schmal“) und schnell quer durch die Melodie wischen. Bleibt alles, wie es war?
2. Den Finger kurz auf einer Note halten, dann auf einer anderen Tonhöhe. Ändert sich nur genau diese eine Note, mit Tick und Aufleuchten?
3. Fühlt sich 90 ms richtig an? Den Knopf „90 ms“ auf 60 oder 120 stellen und vergleichen.
4. Einen kurzen Lauf ziehen (Halt, gleichmäßig weiter, Halt). Sind die Noten dazwischen sauber in der Tonart?
5. Mitten im Pinseln einen zweiten Finger zum Zoomen dazunehmen. Wird nichts verändert, und ist Undo danach ein einziger Schritt?
