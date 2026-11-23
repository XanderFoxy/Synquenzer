# GES3 Stand
- Start 17:0x. Code: Gesang→Noten = vsNotesOf (VSD.segment, t0 = Rahmen*hop + 12 ms), Marken = detectMarks in vsMarksMake (Worker, Op 'det' über wpDetect/vxr2Det).
- Plan: (A) ges3Onset nach segment in vsNotesOf: Einsatz-Noten auf die echte Onset-Probe (A.x). (B) ges3Echt in detectMarks: 'onset'-Marken in durchgehend stimmhaftem Vokal ohne Tonhöhen-Sprung, ohne tiefes Pegel-Tal und ohne Klangfarben-Wechsel fallen weg – nur für Takes ab GES3_AB (neu).
- Gebaut: apply.py + on-block.js + mk-block.js; Kern-Test kern-test.cjs (A: Fehler 4,1→1,5 ms, Lage-Streuung 9→0,4 ms; B: Fehlmarken 44→3, Treffer 18/18). Nächstes: GES2-Test, Pflicht, Laden.
