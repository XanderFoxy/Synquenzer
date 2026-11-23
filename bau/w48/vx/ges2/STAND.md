# GES2 Stand
- Start: Code gefunden: Stufensuche = segment() in vsDspMake (Worker-Text via toString!), Gesang-Editor = vx2Pick/vx2AnLead/vx3Lead.
- Plan: (1) Glätten Gleiten+Vibrato in segment (Block innerhalb vsDspMake), (2) Anlauf, (3) Marken.
- apply.py + seg-block.js gebaut (Block GES2-SEG in vsDspMake vor segment, 1 Haken vor minF). Kern-Test 17/18 -> 18/18 (Noten 56 -> 53, Soll 53).
- Anlauf lagefest / Konsonant über stimmhafte Rahmen: nicht angefasst (VX3 macht Letzteres schon bis 3 Rahmen).
- FERTIG: index.html (md5 siehe apply-Ausgabe), Pflicht-Prüfungen ok, Laden 428×926 + 926×428 ohne Fehler.
- Nicht gebaut: Anlauf lagefest (Rückwärtssuche am 1-ms-Pegel in vx3Lead), Konsonant-Anlauf (VX3 kann schon 3 stimmhafte Rahmen), eigene Marken-Regel (weniger Marken kommen nur über weniger G2-Noten).
