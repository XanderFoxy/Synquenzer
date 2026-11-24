# The Wall v13 – Silben-Zielkarte (Haupt + Doppel)

Stand 24.11.2026 · Agent „zielkarte“ · Daten: `analyse/zielkarte.json` (286 Einträge: 143 Haupt, 143 Doppel) · Skripte `analyse/zk_*.py` · Bilder `analyse/bilder/par_*.png`

Alle Zeiten in Sekunden auf der Song-Achse (Takt n beginnt bei (n−1)·2 s). „T55+14,67“ = Takt 55, 14,67 Sechzehntel nach dem Taktstrich. „Spitze“ = Transienten-Spitze = steilste Stelle des Vokal-Einsatzes. Ziel = dorthin soll die Spitze; der Anlaut (Konsonant, bei see/sake auch der erste Vokal-Teil) bleibt in Originallänge links davon. Messung, kein Hör-Urteil.

## Kurz

- **see**: Im Original ist „see“ schon richtig – s ab 16tel 13, Vokal 1,35 16tel vor dem Takt, Akzent genau auf Takt 56 (110,00 s), exakt wie „sake“ in Strophe 1. v12 hat das s von 0,20 auf 0,42 s gedehnt und den Rest von „see“ um **+166 ms** nach hinten geschoben (Akzent 110,17). Ziel = Original (Verschiebung 0). Ursache: v10 (G4).
- **hypnotised** wird als **hyp-no-ti-sed** (4 Töne) gesungen. v12: no **+80 ms**, ti **+68 ms** gegenüber dem Original, n und t-Verschluss durch Stille ersetzt, Lücke ti→sed von 0,66 auf 0,56 s gestaucht. Ursache: schon die v6-Datei (no/ti +84 ms), v10 verdoppelt Stille vor „no“. Ziel: hyp 16 · no 22 · ti 26 · sed 32 (16tel ab Takt 57) = Xanders Rechnung (EV/ARE 0, ERY/WE 6, THING/HYP 16, WE/NO 22, DO/TIZED 32).
- **Zuordnung**: Xanders Paare und die Paare nach Takt/Akkord ergeben dieselben Ziele – alle acht Strophen-Phrasen benutzen dasselbe Raster 0/6/16/22/32/38/48 (mittlere Abweichung Silbe-für-Silbe 0,41 bzw. 0,42 16tel).
- **Refrains**: R1/R2/R3 liegen meist innerhalb ±0,4 16tel zusammen. Ziele nach Durchschnitt (Gleichstand → R3). „know“ und „It“ liegen in allen Refrains auf 20 bzw. 26 – nicht auf 22/28 wie bisher in lied.json angenommen.
- Haupt, 143 Silben: |v12 − Ziel| Median 16 ms, 90-% 58 ms, max 174 ms; 13 Silben > 60 ms, 5 > 100 ms. Nötige Verschiebung gegenüber dem Original: Median 26 ms, 90-% 64 ms, max 185 ms.
- Keine Warp-Marken (alle Cubasis-Clips Stretch 1,0, MusicalMode aus). Alle Timing-Fehler stecken in den bearbeiteten WAV-Dateien (v6 → v7 → v10/G4 → v11 → v12). v12-Lead kommt aus einer 128-kbit-MP3, zeitlich ohne Versatz.

## „there is so much more to see“ (Strophe 2, Zeile 2, ab Takt 53) – vollständig

Parallele: Strophe 1 „zombies living for Gods sake“ (gleiche Takte/Akkorde, Silbe für Silbe) bzw. nach Xander „in a world of sheep“ + „to see“ als Zusatz. Beide Wege: there 0 · is 6 · so 16 · much 22 · more 32 · to 38 · see 48 (Akzent).

| Silbe | Stimme | Anlaut ab | Vokal | **Spitze Original** | Raster Original | **v12** | Raster v12 | **Ziel** | Raster Ziel | v12 → Ziel | Original → Ziel | Regel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| there | Haupt | 103,984 | 103,984 | 104,012 | T53+0,10 | 103,996 | T52+15,97 | 104,000 | T53+0,00 | -4 ms | -12 ms | strophe1 |
| there | Doppel | 103,963 | 103,967 | 104,007 | T53+0,06 | — | — | 104,000 | T53+0,00 | — ms | -7 ms | strophe1 |
| is | Haupt | 104,554 | 104,732 | 104,746 | T53+5,97 | 104,749 | T53+5,99 | 104,750 | T53+6,00 | -1 ms | +4 ms | strophe1 |
| is | Doppel | 104,693 | 104,693 | 104,733 | T53+5,86 | — | — | 104,750 | T53+6,00 | — ms | +17 ms | strophe1 |
| so | Haupt | 105,899 | 106,077 | 106,117 | T54+0,94 | 106,002 | T54+0,02 | 106,000 | T54+0,00 | +2 ms | -117 ms | strophe1 |
| so | Doppel | 105,898 | 106,006 | 106,046 | T54+0,37 | — | — | 106,000 | T54+0,00 | — ms | -46 ms | strophe1 |
| much | Haupt | 106,708 | 106,774 | 106,784 | T54+6,27 | 106,725 | T54+5,80 | 106,750 | T54+6,00 | -25 ms | -34 ms | strophe1 |
| much | Doppel | 106,777 | 106,777 | 106,807 | T54+6,46 | — | — | 106,750 | T54+6,00 | — ms | -57 ms | strophe1 |
| more | Haupt | 107,885 | 107,955 | 107,989 | T54+15,91 | 107,993 | T54+15,94 | 108,000 | T55+0,00 | -7 ms | +11 ms | strophe1 |
| more | Doppel | 107,960 | 107,960 | 108,000 | T55+0,00 | — | — | 108,000 | T55+0,00 | — ms | +0 ms | strophe1 |
| to | Haupt | 108,693 | 108,743 | 108,783 | T55+6,26 | 108,742 | T55+5,94 | 108,750 | T55+6,00 | -8 ms | -33 ms | strophe1 |
| to | Doppel | 108,726 | 108,776 | 108,816 | T55+6,53 | — | — | 108,750 | T55+6,00 | — ms | -66 ms | strophe1 |
| see | Haupt | 109,633 | 109,819 | 110,001 | T56+0,01 | 110,167 | T56+1,33 | 110,000 | T56+0,00 | +167 ms | -1 ms | strophe1 |
| see | Doppel | 109,631 | 109,865 | 109,905 | T55+15,24 | — | — | 109,833 | T55+14,66 | — ms | -72 ms | strophe1 |

„see“: erster Vokal-Einsatz Original 109,833 (T55+14,67) → Ziel 109,832; in v12 110,002 (s davor ab 109,584 = 0,42 s s-Rauschen). „sake“ (S1) zum Vergleich: s ab 45,624, erster Vokal 45,822, Akzent 45,995.

## „Are we hypnotised“ (Strophe 2, Zeile 3, ab Takt 57) – vollständig

Parallelen: „everything we (~) do“ bzw. „in a world of (~) sheep“ – Strophe 1 hat auf Platz ~26 einen neuen Ton ohne neue Silbe (51,257 s / 59,289 s), daher Ziel „ti“ = 26.

| Silbe | Stimme | Anlaut ab | Vokal | **Spitze Original** | Raster Original | **v12** | Raster v12 | **Ziel** | Raster Ziel | v12 → Ziel | Original → Ziel | Regel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Are | Haupt | 111,946 | 111,966 | 112,006 | T57+0,05 | 112,000 | T57+0,00 | 112,000 | T57+0,00 | +0 ms | -6 ms | strophe1 |
| Are | Doppel | 111,997 | 111,997 | 112,007 | T57+0,06 | — | — | 112,000 | T57+0,00 | — ms | -7 ms | strophe1 |
| we | Haupt | 112,822 | 112,822 | 112,830 | T57+6,64 | 112,780 | T57+6,24 | 112,750 | T57+6,00 | +30 ms | -80 ms | strophe1 |
| we | Doppel | 112,755 | 112,755 | 112,795 | T57+6,36 | — | — | 112,750 | T57+6,00 | — ms | -45 ms | strophe1 |
| hyp | Haupt | 113,931 | 113,939 | 113,979 | T57+15,83 | 113,996 | T57+15,97 | 114,000 | T58+0,00 | -4 ms | +21 ms | strophe1 |
| hyp | Doppel | 113,986 | 113,990 | 114,026 | T58+0,21 | — | — | 114,000 | T58+0,00 | — ms | -26 ms | strophe1 |
| no | Haupt | 114,628 | 114,628 | 114,660 | T58+5,28 | 114,740 | T58+5,92 | 114,750 | T58+6,00 | -10 ms | +90 ms | strophe1 |
| no | Doppel | 114,661 | 114,661 | 114,691 | T58+5,53 | — | — | 114,750 | T58+6,00 | — ms | +59 ms | strophe1 |
| ti | Haupt | 115,310 | 115,312 | 115,352 | T58+10,82 | 115,420 | T58+11,36 | 115,250 | T58+10,00 | +170 ms | -102 ms | strophe1 |
| ti | Doppel | 115,319 | 115,319 | 115,359 | T58+10,87 | — | — | 115,250 | T58+10,00 | — ms | -109 ms | strophe1 |
| tised | Haupt | 115,932 | 116,012 | 116,016 | T59+0,13 | 115,982 | T58+15,86 | 116,000 | T59+0,00 | -18 ms | -16 ms | strophe1 |
| tised | Doppel | 115,965 | 116,001 | 116,009 | T59+0,07 | — | — | 116,000 | T59+0,00 | — ms | -9 ms | strophe1 |

## Die 30 auffälligsten Stellen (v12 gegen Ziel)

Sortiert nach |v12 − Ziel|. Doppel nur dort, wo es in v12 hörbar ist (Refrain, Tag, Outro).

| # | Stelle | Silbe | Stimme | Original | v12 | Ziel | v12 → Ziel | Raster v12 → Ziel | Woher (Messung) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | R2 Z13 | is | doppel | 138,665 | 138,684 | 138,500 | +184 ms | T70+5,47 → T70+4,00 | Doppel so gesungen (v12 = Doppel-Original +19 ms, zur Haupt +81 ms) |
| 2 | S1 Z2 | world | haupt | 50,185 | 50,174 | 50,000 | +174 ms | T26+1,39 → T26+0,00 | so gesungen (v12 = Original -11 ms); Ziel nach Muster |
| 3 | R1 Z4 | It | doppel | 67,383 | 67,420 | 67,250 | +170 ms | T34+11,36 → T34+10,00 | Doppel so gesungen (v12 = Doppel-Original +37 ms, zur Haupt +83 ms) |
| 4 | S2 Z10 | ti | haupt | 115,352 | 115,420 | 115,250 | +170 ms | T58+11,36 → T58+10,00 | Bearbeitung: v6 +84 ms |
| 5 | S2 Z9 | see | haupt | 110,001 | 110,167 | 110,000 | +167 ms | T56+1,33 → T56+0,00 | Bearbeitung: v10 +178 ms |
| 6 | R1 Z7 | eyes | doppel | 91,892 | 91,835 | 92,000 | -165 ms | T46+14,68 → T47+0,00 | v12-Doppel -57 ms gegen Doppel-Original |
| 7 | R2 Z12 | It | doppel | 131,368 | 131,396 | 131,250 | +146 ms | T66+11,17 → T66+10,00 | Doppel so gesungen (v12 = Doppel-Original +28 ms, zur Haupt +77 ms) |
| 8 | R1 Z4 | know | doppel | 66,581 | 66,627 | 66,500 | +127 ms | T34+5,02 → T34+4,00 | v12-Doppel +46 ms gegen Doppel-Original |
| 9 | R3 Z23 | low | doppel | 242,499 | 242,498 | 242,625 | -127 ms | T122+3,98 → T122+5,00 | Doppel so gesungen (v12 = Doppel-Original -1 ms, zur Haupt -3 ms) |
| 10 | R2 Z13 | see | doppel | 136,100 | 136,117 | 136,000 | +117 ms | T69+0,94 → T69+0,00 | Doppel so gesungen (v12 = Doppel-Original +17 ms, zur Haupt +37 ms) |
| 11 | R1 Z5 | is | haupt | 74,576 | 74,613 | 74,500 | +113 ms | T38+4,90 → T38+4,00 | so gesungen (v12 = Original +37 ms); Ziel nach Muster |
| 12 | S1 Z0 | to | haupt | 34,047 | 34,112 | 34,000 | +112 ms | T18+0,90 → T18+0,00 | Bearbeitung: v7 +58 ms |
| 13 | R1 Z5 | is | doppel | 74,595 | 74,605 | 74,500 | +105 ms | T38+4,84 → T38+4,00 | Doppel so gesungen (v12 = Doppel-Original +10 ms, zur Haupt +19 ms) |
| 14 | R1 Z7 | eyes | haupt | 91,893 | 91,900 | 92,000 | -100 ms | T46+15,20 → T47+0,00 | so gesungen (v12 = Original +7 ms); Ziel nach Muster |
| 15 | S2 Z8 | we | haupt | 97,988 | 97,906 | 98,000 | -94 ms | T49+15,24 → T50+0,00 | Bearbeitung: v6 -59 ms |
| 16 | R3 Z22 | see | doppel | 232,067 | 232,092 | 232,000 | +92 ms | T117+0,74 → T117+0,00 | Doppel so gesungen (v12 = Doppel-Original +25 ms, zur Haupt +17 ms) |
| 17 | R2 Z13 | be | doppel | 139,603 | 139,590 | 139,500 | +90 ms | T70+12,72 → T70+12,00 | Doppel so gesungen (v12 = Doppel-Original -13 ms, zur Haupt +65 ms) |
| 18 | R3 Z21 | all | doppel | 228,030 | 228,086 | 228,000 | +86 ms | T115+0,69 → T115+0,00 | v12-Doppel +56 ms gegen Doppel-Original |
| 19 | R3 Z21 | It | doppel | 227,275 | 227,334 | 227,250 | +84 ms | T114+10,67 → T114+10,00 | v12-Doppel +59 ms gegen Doppel-Original |
| 20 | S1 Z0 | li | haupt | 41,963 | 41,925 | 42,000 | -75 ms | T21+15,40 → T22+0,00 | so gesungen (v12 = Original -38 ms); Ziel nach Muster |
| 21 | S2 Z11 | to | haupt | 124,040 | 124,073 | 124,000 | +73 ms | T63+0,58 → T63+0,00 | so gesungen (v12 = Original +33 ms); Ziel nach Muster |
| 22 | S1 Z3 | we | haupt | 58,737 | 58,679 | 58,750 | -71 ms | T30+5,43 → T30+6,00 | Bearbeitung: v6 -58 ms |
| 23 | R2 Z13 | hind | doppel | 140,076 | 140,070 | 140,000 | +70 ms | T71+0,56 → T71+0,00 | Doppel so gesungen (v12 = Doppel-Original -6 ms, zur Haupt +71 ms) |
| 24 | R1 Z7 | your | doppel | 91,335 | 91,324 | 91,255 | +69 ms | T46+10,59 → T46+10,04 | Doppel so gesungen (v12 = Doppel-Original -11 ms, zur Haupt +65 ms) |
| 25 | S2 Z8 | Why | haupt | 95,977 | 95,934 | 96,000 | -66 ms | T48+15,47 → T49+0,00 | Bearbeitung: v10 -40 ms |
| 26 | ZT Z18 | see | haupt | 200,064 | 200,064 | 200,000 | +64 ms | T101+0,51 → T101+0,00 | so gesungen (v12 = Original +0 ms); Ziel nach Muster |
| 27 | R2 Z13 | Can’t | doppel | 135,570 | 135,563 | 135,500 | +63 ms | T68+12,50 → T68+12,00 | Doppel so gesungen (v12 = Doppel-Original -7 ms, zur Haupt +63 ms) |
| 28 | R1 Z5 | see | haupt | 72,054 | 72,061 | 72,000 | +61 ms | T37+0,48 → T37+0,00 | so gesungen (v12 = Original +7 ms); Ziel nach Muster |
| 29 | R2 Z13 | see | haupt | 136,063 | 136,060 | 136,000 | +60 ms | T69+0,48 → T69+0,00 | so gesungen (v12 = Original -3 ms); Ziel nach Muster |
| 30 | R1 Z4 | all | doppel | 68,037 | 68,058 | 68,000 | +58 ms | T35+0,46 → T35+0,00 | Doppel so gesungen (v12 = Doppel-Original +21 ms, zur Haupt +11 ms) |

## Raster-Muster

**Strophen** (16tel ab Takt 1 jeder 4-Takt-Phrase, Median aller acht Phrasen, Haupt):

| Silbe in der Phrase | 1 | 2 | 3 | 4 | (Bindung) | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Ziel | 0 | 6 | 16 | 22 | 26 | 32 | 38 | 48 |
| Median gemessen | -0,04 | 6,26 | 16,14 | 22,02 | 26,31 | 32,2 | 38,23 | 47,98 |

**Refrains** (16tel ab dem Takt der 2. Silbe; Haupt R1 / R2 / R3 → Ziel):

| Zeile | Silben-Ziele | Abweichende Stellen |
|---|---|---|
| Z1 „We claim we know it all“ | We -4 · claim 0 · we 16 · know 20 · It 26 · all 32 | claim: 0,22/0,24/-0,33 → 0 |
| Z2 „Can’t see who is behind this wall“ | Can’t -4 · see 0 · Who 16 · is 20 · be 28 · hind 32 · this 44 · wall 48 | is: 20,61/20,67/20,22 → 20 (unsicher); this: 43,35/44,03/44,16 → 44 |
| Z3 „Don’t wait, follow the light“ | Don’t -4 · wait 0 · fol 16 · low 21 · the 28 · light 32 | low: 20,94/21,46/20,02 → 21 (unsicher); the: 28,18/28,26/27,72 → 28 |
| Z4 „wake up open your eyes“ | wake -4 · up 0 · o 16 · pen 22 · your 28 · eyes 32 | wake: -4,59/-4,07/-4,18 → -4; eyes: 31,14/31,86/31,43 → 32 (unsicher) |

## Zuordnung „are we hypnotized“ ↔ „everything we do believe“

Xander nennt „are we hypnotized“ ↔ „everything we do believe“ (EV/ARE, ERY/WE, THING/HYP, NO/WE, TIZED/DO) und „there is so much more to see“ ↔ „in a world of sheep“. Nach Takt und Akkord liegen die Zeilen anders: „there is so much more to see“ steht über Ab–Fm wie „zombies living for Gods sake“, „are we hypnotised“ über Bbm–Gb wie „in a world of sheep“, „what does it need to realise“ wie „everything we do believe“. Mathematisch ist es egal: alle acht 4-Takt-Phrasen beider Strophen benutzen dasselbe Silben-Raster 0 / 6 / 16 / 22 / 32 / 38 / 48 (16tel ab Takt 1 der Phrase; gemessene Mediane -0,0 / 6,3 / 16,1 / 22,0 / (26,3) / 32,2 / 38,2 / 48,0). Mittlere Abweichung Silbe-für-Silbe: Xanders Paare 0,41 16tel, Takt/Akkord-Paare 0,42 16tel – praktisch gleich. Beide Zuordnungen ergeben deshalb dieselben Ziele: ARE 0, WE 6, HYP 16, NO 22, TIZED 32 – genau Xanders Rechnung (EV 0, ERY 6, THING 16, WE 22, DO 32). Am Audio singt er „hyp-no-ti-sed“ mit vier Tönen: „ti“ ist ein eigener Ton mit t-Anlaut (115,35 s), „-sed“ mit dem s ab 115,93 s und dem Vokal auf 116,0 (= sein „TIZED auf DO“). Strophe 1 hat an derselben Stelle (Platz ~26) ebenfalls einen neuen Ton ohne neue Silbe (51,26 s „of~“, 59,29 s „we~“) – deshalb Ziel „ti“ = 26.

## Woher die v12-Fehler kommen

- **Warp-Marken**: Keine. In The-Wall-v6.cbp, The-Wall-v7.cbp und der v8-Projektdatei (148 Clips) haben alle Gesangs-Clips Stretch 1,0, Pitch 1,0, MusicalMode aus; v6/v7 sind je ein durchgehender Clip ab 0 s. Alle Timing-Änderungen stecken in den WAV-Dateien selbst.
- **v6-Bearbeitung**: projekt/Gesang-Platzhalter-3.wav („getunt v6“) ist zeitlich schon bearbeitet: hypnotised no/ti +84 ms, sed −98 ms; Strophe 2 Zeile 1 („we just feel“) −50…−70 ms; mehrere Strophe-1-Silben −40…−80 ms.
- **v7**: Haupt-3-trocken-v7: v7-04 „Are we hypnotised silbenweise auf die Plätze von In a world of sheep gerückt“; weitere Schnitte (lied.json schnitte, quelle v7: 75 Sprünge).
- **v10/G4**: Haupt-3_g4 (v10): Strophe 2 Zeilen 2+3 neu geschnitten (16 Schnitte), „see“ s von 191 auf 408 ms verlängert (+166…+177 ms für den Rest von „see“), „so“ −115 ms, Stille vor „no“ verdoppelt.
- **MP3**: v12-Lead = v11-Haupt aus 128-kbit-MP3 (wall/roh/ende.npy). Zeitlich kein Versatz messbar (unbearbeitete Stellen ±10 ms zum Original), aber schlechtere Klangquelle – für v13 aus dem 24-bit-Original neu schneiden.
- **see**: „see“ (S2) ist im Original genau wie „sake“ (S1, gleiche Stelle): s ab 16tel 13 (109,63 / 45,62), Vokal setzt 1,35 16tel vor dem Takt ein (109,83 / 45,83), kurzer Einbruch, Akzent genau auf dem Taktstrich (110,00 / 46,00). Das ist schon Xanders Muster – Ziel = Original (Verschiebung 0). v12 hat das s auf ~0,43 s verlängert (Anfang 109,58), den ersten Vokal-Teil durch Rauschen ersetzt und den ganzen Rest von „see“ um +166 ms nach hinten geschoben (Akzent 110,17); danach wird bei 111,13 s ein Stück ausgelassen. Ursache: v10 („s etwa 0,2 s länger, damit der Vokal genau auf dem Schlag kommt“, Haupt-3_g4), unverändert in v11/v12.
- **hypnotised**: Original: hyp 113,98 (15,8) · no 114,66 (21,3) · ti 115,35 (26,8) · sed 116,02 (32,1). v12: hyp 114,00 · no 114,74 (+80) · ti 115,42 (+68) · sed 115,98 (−34). Schon die v6-Datei (projekt/Gesang-Platzhalter-3.wav, „getunt v6“) hat no und ti um +84 ms verschoben und sed um −98 ms; v7 („silbenweise auf die Plätze von In a world of sheep gerückt“) und v10/G4 haben das beibehalten und zusätzlich vor „no“ 3×24 ms Stille verdoppelt – das n ist in v12 durch Stille ersetzt (114,63–114,72), ebenso der t-Verschluss von „ti“ (115,36–115,40). Ziel: hyp 16 (114,00, +21 ms), no 22 (114,75, +90 ms – der Vokal liegt damit da, wo v12 ihn hat, aber MIT dem originalen n davor ab 114,66), ti 26 (115,25, −102 ms), sed 32 (116,00, −16 ms). Die hörbare Schieflage in v12 kommt also vor allem von „ti“ (1,1–1,4 16tel später als die Töne an derselben Stelle in Strophe 1), vom fehlenden n und von der gestauchten Lücke ti→sed (Original 0,66 s, v12 0,56 s).

## Unsicher / offen

- world (S1) Ziel 16 statt eigen 17,5
- ti Ziel 26 (Alternative 27 = nächstes 16tel des Originals)
- is (Refrain) 20 vs. 21
- low (Refrain) 21 vs. 20
- eyes (Refrain) 32 vs. 31
- Tag-Rhythmus
- Doppel-Silben mit > 70 ms Abstand zur Haupt (Notiz am Eintrag) – Messung oder echte Abweichung?
- Akzent-Wahl bei your/the R3
- Strophe 1 ist Vorbild. Nur „world“ (S1, 17,5) und „thing“ (16,7) weichen selbst vom Muster aller acht Phrasen (16) ab; Ziel 16 nach Mehrheit. „world“ wird dadurch um −185 ms verschoben (w-Anlaut beginnt dann vor dem Takt) – unsicher, Alternative: 17 (nur aufs nächste 16tel).
- Tag nach Refrain 2 („o-pen your eyes“ mit pen/your auf 3/6 statt 6/12) und „Wach auf“ im Zwischenteil (auf auf 4-und, Haupt und Doppel gleich) behalten ihren eigenen Rhythmus, nur auf das nächste 16tel. Gesprochene Zwischenteil-Wörter sind nicht in der Karte.
- Je Silbe Rasterplatz in R1/R2/R3 (Haupt), Ziel = Durchschnitt gerundet; liegt der Durchschnitt genau zwischen zwei 16teln (±0,1) -> R3. Auffällig: die Silbe auf Schlag 2 (know/is/low) liegt in allen Refrains 40–110 ms nach Schlag 2: know 20,4 -> 20; is 20,5 (genau Mitte) -> R3 = 20; low 20,8 -> 21 (2e). „It“ liegt in allen drei Refrains auf 26 (3-und), nicht auf 28 wie in lied.json/ziel_s angenommen; „know“ auf 20, nicht 22. „eyes“ (Zeile 4) 31,1/31,9/31,4 – genau zwischen 31 und 32; Ziel 32 (Taktstrich), weil Outro und Tag „eyes“ auf dem Taktstrich singen (Ausnahme von der Rundungsregel, unsicher).
