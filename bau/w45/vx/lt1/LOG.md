16:20 | load average: 6.06, 4.71, 3.81 | Ordner angelegt, index.html + basis.html = rel-4730, lt1-test.mjs geschrieben
16:26 | load average: 1.91, 3.64, 3.71 | Schritt 1 gebaut (Sicherung index.vor-lt1a.html): LT1-Block + 3 Haken (spk1GlDraw, imp1Place 2×)
16:29 | load average: 3.90, 3.45, 3.60 | Befund: b-Rest 55-64 ms im Test = erster Klick → ensureAudio (Ton-Start), nicht FFT; Test wärmt jetzt vor t0 an. Vollmessung gestartet (2 Größen parallel, REPS=3)
16:30 | load average: 5.67, 3.98, 3.77 | Regression gestartet (reg.sh, parallel zur Messung wegen Zeitlimit)
16:33 | load average: 7.06, 5.63, 4.47 | Schritt 2 (Sicherung index.vor-lt1b.html): lt1GlChunks + Haken in spk1GlDraw wieder entfernt (A/B unter Last ohne sicheren Gewinn, mehr Bilder > 50 ms); bleibt: c (2 Haken)
16:36 | load average: 10.84, 7.31, 5.23 | fokus1 7 FEHLER / fokus1k 1 FEHLER = nur Long-Task-Grenzen unter Last 7-8 (Endfassung, Spektral-Code = Basis); Gegenlauf auf basis.html eingereiht
16:45 | load average: 5.99, 5.66, 5.33 | Regression fertig (reg.log), Pflicht ok, NOTES.md fertig; Endfassung md5 88a53dabe895d842acfdff7ff26f1844
16:56 | load average: 5.51, 7.58, 6.70 | Nachbesserung gestartet (Prüfer-Befunde 1–4); Profil imp1Place 90 Takte
17:01 | load average: 2.67, 5.17, 5.93 | Schritt 3 (Sicherung index.vor-lt1c.html): Take im Leerlauf vorbereiten (lt1PreStart/lt1Take/lt1PreBuf/lt1StoreJobs) + 4 Haken (imp1Run, imp1Take, tkToBuffer, tkStore)
17:02 | load average: 3.98, 5.04, 5.82 | Probelauf s10 926x428: imp1Place 28 ms (basis 122), keine Long Task (basis 124), Audio-Puffer + Speicher-Stücke gleich; Vollauf A/B gestartet
17:07 | load average: 4.58, 6.03, 6.12 | A/B s1–s11 beide Größen: alle gleich (außer s8 Wiedergabe-Stand), Audio gleich; Nachlauf s3/s10 REPS=3 mit Scheiben-Messung (LT1.preMs) gestartet
17:12 | load average: 2.44, 3.97, 5.23 | Paket-Test c (REPS=3): index 0 Long Tasks in 6/6 Läufen (basis 3 von 6, max 81); s10 REPS=3: index 26–34 ms ohne Long Task (basis 94–137); 1 Vorbereitungs-Scheibe 87 ms (428x926 rep0) → Nachlauf mit Scheiben-Art
17:17 | load average: 7.12, 6.23, 5.90 | NOTES.md: Pflicht, Offen, Prüfung ergänzt; Endfassung md5 2a3260c23ee01950b1fac4a3d4223829; imp1/imp2 Endlauf läuft
