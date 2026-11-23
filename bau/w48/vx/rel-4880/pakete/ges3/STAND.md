# GES3 Stand
- Start 17:0x. Code: Gesang→Noten = vsNotesOf (VSD.segment, t0 = Rahmen*hop + 12 ms), Marken = detectMarks in vsMarksMake (Worker, Op 'det' über wpDetect/vxr2Det).
- Plan: (A) ges3Onset nach segment in vsNotesOf: Einsatz-Noten auf die echte Onset-Probe (A.x). (B) ges3Echt in detectMarks: 'onset'-Marken in durchgehend stimmhaftem Vokal ohne Tonhöhen-Sprung, ohne tiefes Pegel-Tal und ohne Klangfarben-Wechsel fallen weg – nur für Takes ab GES3_AB (neu).
- Gebaut: apply.py + on-block.js + mk-block.js; Kern-Test kern-test.cjs (A: Fehler 4,1→1,5 ms, Lage-Streuung 9→0,4 ms; B: Fehlmarken 44→3, Treffer 18/18). Nächstes: GES2-Test, Pflicht, Laden.
- FERTIG. Ausgang index.html (md5 siehe apply-Ausgabe, zuletzt 2ea13a3af2cf74b7c5db7a97aa39a555). Bau: python3 apply.py <eingang 4.87.0> <ausgang> (on-block.js, mk-block.js).
- Kern-Test-Datei: kern-test.cjs (node kern-test.cjs <vorher.html> <nachher.html>), Ergebnis nachher.txt. Browser: load-test.cjs <port>. Hilfen: dbg.cjs/dbg-run.cjs/sine-test.cjs (nur Fehlersuche).
- Pflicht: MS 2000 1×, "  live: true," 1×, Sperrzahlen 0×, doppelt.js neu [] , Markenwörter = Basis, Emoji 0; Laden 428×926 + 926×428 ohne Fehler; Worker-Op 'det' mit g3 4→2 / 5→2 Marken, ohne g3 unverändert.
- GES2-Kern-Test auf dem Ausgang: 18/18, 53 Noten (Soll 53).
- Grenzen: Marken-Regel greift nur für Takes mit created ≥ 23.11.2026 17:00 UTC (GES3_AB); Rest 3 Fehlmarken (Vibrato+unregelmäßiges Tremolo, tiefer Vokal 6 Hz, Legato-Gleiten). Einsatz-Verfeinerung nur Gesang→Noten (vsNotesOf, by 'einsatz', Pegel-Anstieg ≥ 15 dB); Gesang-Editor-Noten (G2) und Tipp-Noten unverändert. Konsonant-Silben: Einsatz = Vokalbeginn (wie bisher), mittl. Fehler dort 2,0 → 2,9 ms, aber lagefest.
