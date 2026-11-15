16:20 | load average: 6.06, 4.71, 3.81 | Ordner angelegt, index.html + basis.html = rel-4730, lt1-test.mjs geschrieben
16:26 | load average: 1.91, 3.64, 3.71 | Schritt 1 gebaut (Sicherung index.vor-lt1a.html): LT1-Block + 3 Haken (spk1GlDraw, imp1Place 2×)
16:29 | load average: 3.90, 3.45, 3.60 | Befund: b-Rest 55-64 ms im Test = erster Klick → ensureAudio (Ton-Start), nicht FFT; Test wärmt jetzt vor t0 an. Vollmessung gestartet (2 Größen parallel, REPS=3)
16:30 | load average: 5.67, 3.98, 3.77 | Regression gestartet (reg.sh, parallel zur Messung wegen Zeitlimit)
16:33 | load average: 7.06, 5.63, 4.47 | Schritt 2 (Sicherung index.vor-lt1b.html): lt1GlChunks + Haken in spk1GlDraw wieder entfernt (A/B unter Last ohne sicheren Gewinn, mehr Bilder > 50 ms); bleibt: c (2 Haken)
16:36 | load average: 10.84, 7.31, 5.23 | fokus1 7 FEHLER / fokus1k 1 FEHLER = nur Long-Task-Grenzen unter Last 7-8 (Endfassung, Spektral-Code = Basis); Gegenlauf auf basis.html eingereiht
16:45 | load average: 5.99, 5.66, 5.33 | Regression fertig (reg.log), Pflicht ok, NOTES.md fertig; Endfassung md5 88a53dabe895d842acfdff7ff26f1844
16:56 | load average: 5.51, 7.58, 6.70 | Nachbesserung gestartet (Prüfer-Befunde 1–4); Profil imp1Place 90 Takte
