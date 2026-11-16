# LOG XLA (DAW-Projekt öffnen, Fassung A, Schritt 1)
- 21:37 UTC Start, Basis rel-4780 (md5 68e92c03), Last: 14.42 14.81 9.03, Platte frei 4.1G
- 21:51 Kern xla-core.js (aus Prototyp, markenfrei, + Wahl Song/Szenen/Beides, Spurwahl, Rollen, MELODIE-Platz, Namen/alias, Worker-Anschluss) – Node 31/31, Last: 2.16 4.38 6.41
- 22:00 Block xla-block.js + 7 Haken eingebaut (apply.py), topdefs/dupkeys/Rauchtest ok, Probelauf ok; xla-test.mjs geschrieben, Last: 3.08 2.51 4.30
- 22:02 xla-test 1. Lauf 43/44 (Rückfall-Test hielt den alten Worker), Wiedergabe-Prüfung ab Takt 5 verschärft, Meldung bei kaputter Datei einfacher; Last: 5.90 3.64 4.54
- 22:10 Long Tasks: Verlauf-Rekorder kennt 'xla' (kein Diff des ganzen Projekts), Passt in Schritten (vvYield) + Song-Ansicht im selben Schritt wie der Wechsel → 0 Long Tasks in 6 Läufen; Last: 5.50 5.41 5.19
