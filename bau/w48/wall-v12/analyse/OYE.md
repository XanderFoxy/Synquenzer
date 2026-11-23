# „Open your eyes“ → „Siehst du mich nicht“ (Zwischenteil, 23.11.2026)

Stelle: „Wach auf“ gesungen 215,5–216,7 s · „open your“ 218,0–219,8 s · **„Siehst du mich nicht“ gesprochen 219,85–221,4 s (3:39,9–3:41,4)**.
Skripte: analyse/oye/{lade,f0w,p1…p11,bau}.py.

## Wo „Open your eyes“ steckt (Rohspuren, projekt7/original)
- **Hauptstimme roh:** In Cubasis wurde der R1-Clip „open your eyes“ in den Zwischenteil kopiert (Korrelation zu R1 bei 0 ms: 0,84 / unter der Sprache 0,66). Das „eyes“ (As, MIDI 56,0) läuft **auf derselben Spur unter „Siehst du mich nicht“ weiter**, nur 6,6 dB unter dem Gesamtpegel.
- **KI-Ober/Unter:** Sie sind exakte Kopien von R2/R3 (r = 0,89 bei 0 ms). „open your eyes“ läuft von 218,3 bis 220,9 s mit −15 dBFS, also lauter als die Sprache (−25).
- **Terzen aus Haupt (Ober/Unter):** Terzen von „open your“. Ab 219,9 s enthalten sie zusätzlich die **um eine Terz verschobene Sprechstimme** (−20 bis −25 dBFS).
- **Gegengesang (Xanders):** Hier liegt eigenes Material, keine Kopie (r ≈ 0). Er singt von 220,0 bis 221,1 s Töne um F/Gb (−17 bis −24 dBFS) unter der Sprache.
- Doppel: an der Stelle stumm.

## Was in den Fassungen zu hören ist (Kamm-Messung auf der „eyes“-Tonhöhe, 219,80–221,45 s)
| Signal | „eyes“-Rest | Abstand zum Gesamtpegel |
|---|---|---|
| Hauptstimme roh | −26,0 dBFS | **−6,6 dB** (klar hörbar) |
| v10 Gesangsbus | −23,4 dBFS | **−6,9 dB** (klar hörbar) |
| **v11 Gesangsbus** | −45,5 dBFS | **−26,0 dB** (wie reine Sprechspur: −25,1) |
| Hauptstimme roh nach Abzug der R1-Kopie | −49,1 dBFS | **−21,9 dB** |

- **In v11 ist es schon erledigt**, weil „Open your eyes“ an der Quelle entfernt wurde.
  - Unter der Sprache steht keine gesungene Tonhöhe mehr über dem Sprachniveau (As/F/Gb/C je 0 bis +5 dB, in v10 bei As +14 bis +26 dB).
  - Auch Chor und Gegengesang sind dort stumm.
  - „open your“ vor der Sprache: Der v11-Bus liegt bei −43 dBFS, also Grundrauschen (zum Vergleich: „Wach auf“ −15).
- Ein zusätzlicher Kammfilter auf v11 ändert nur noch −31,6 dBFS gegen −11,8 dBFS Master, also nichts Hörbares mehr. „oye-nachher“ klingt deshalb praktisch wie „oye-vorher“.

## Für v12 (Neu-Mix aus den trockenen Spuren) muss es neu gemacht werden
- **(b) Hauptstimme:** Xanders Idee funktioniert. Die identische R1-Stelle (t − 128 s) dient als Vorlage. Sie wird als Betrag im Spektrum abgezogen (Zeit-Frequenz-Maske, Überabzug 1,6, Boden −22 dB, 30-ms-Blenden), und zwar nur im Bereich 219,5–221,75 s.
  - Ergebnis: Der „eyes“-Rest sinkt **um 23 dB** (−26,0 → −49,1 dBFS).
  - Die Sprache bleibt mit −27,2 dBFS so laut wie die v11-Sprechspur (−26,9).
  - „open your“ von 218,0 bis 219,8 s wird stumm geschaltet.
  - Ergebnis-Spur: analyse/oye/haupt_roh_bereinigt_217-222.npy (48 kHz, ab 217,0 s).
- **(a) Chor:**
  - Terzen aus Haupt, KI-Ober/Unter und Gegengesang werden **217,9–221,6 s stumm** geschaltet (30-ms-Blenden).
  - Der Chor auf „Wach auf“ (bis 217,1 s) bleibt.
  - Falls die Terzen dort neu gebaut werden, dann aus der bereinigten Hauptstimme, sonst verschieben sie die Sprechstimme mit.
  - Offene Frage an Xander: Unter der Sprache singt sein eigener Gegengesang Töne. Bisher ist er (wie in v11) raus. Soll er bleiben?

## Hörproben (je 213,8–225,8 s, 48 kHz/24 bit)
- analyse/oye-vorher.wav: v11-Master (Ist-Stand)
- analyse/oye-nachher.wav: v11 mit zusätzlichem Kammfilter auf der „eyes“-Tonhöhe. Kaum ein Unterschied, weil schon sauber.
- analyse/oye-v10.wav: v10, wo „eyes“ unter der Sprache noch deutlich zu hören ist (zum Vergleich)
- analyse/oye-roh-vorher.wav / oye-roh-nachher.wav: Hauptstimme trocken vor und nach dem Abzug der R1-Kopie (v12-Weg)
