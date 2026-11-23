# TPFL – Test-Pflege gegen 4.90.0 (App unverändert)

Die App (4.90.0, md5 a23eefd7ac3f52251e5bc881f1de4628) bleibt bitgleich. Repariert wurden drei Kern-Tests, die gegen 4.90 falsch rot waren oder wackelten.
Vor jeder Änderung liegt eine Kopie `*.bak` neben der Datei.

| Test | Problem gegen 4.90 | Reparatur | vorher | nachher |
|---|---|---|---|---|
| `imp4/imp4-test.cjs` T6 | erwartete für „Lead“ noch den alten Bericht „eigenes Delay 1/8 → Projekt-Echo 1/4. (eins für alle Spuren)“ | erwartet jetzt „Lead · Klang aus der DAW · eigenes Echo 1/8 \| 1/16 wie in der DAW · n übernommen“ (Text seit CMD3); der alte Text gilt jetzt als Fehler. Dazu optionale Ordner `[basis] [neu]` (Standard basis/neu wie bisher, Foto nur beim Standard). | 8/9 (T6 rot) | 9/9 |
| `arpg/arpg-test.cjs` A2 | Projektdatei 4.88 ↔ 4.90 unterschied sich nur in `"appVersion":"4.88.0"` ↔ `"4.90.0"` | `appVersion` wird vor dem Vergleich entfernt (wie Prüfsumme/Kennungen) | 26/27 (A2 rot) | 27/27 |
| `dse/test/kern-dse.cjs` „Render: Lock hörbar“ | Abstand mit ↔ ohne Lock im Gesamtmix (Kick + HH) gegen feste Grenze −30 dB: gemessen −28,8 / −29,7 / −30,7 dB → 1 von 3 Läufen rot | Maß auf die HH-Spur allein (Kick für diese Renders stumm): mit ↔ ohne > −15 dB, mit ↔ mit < −60 dB; Gesamtmix bleibt als Info und mit ↔ mit < −60 dB | 2/3 Läufe grün | 3/3 grün (−5,7 / −4,8 / −6,2 dB) |

## Warum das DSE-Maß wackelte
Die HH-Spur trägt nur −24 dB der Energie im Gesamtmix (`hhAnteil` −23,8 … −24,5 dB), die zwei Kick-Schläge fast alles. Der Lock-Unterschied der HH
(−5 … −6 dB bezogen auf die HH selbst) erscheint im Mix darum bei ≈ −29 … −31 dB – genau an der alten Grenze. Die HH-Klänge (Rauschen) und der Kick
ändern sich von Lauf zu Lauf leicht (Spitze 0,353 … 0,389), deshalb ±1 dB. Innerhalb eines Laufs ist der Render bitgleich (mit ↔ mit −138 … −305 dB),
ein Mittel über 3 Renders im selben Lauf hätte nichts gebracht.

## Gegenprobe
`ohne-lock.py` baut aus 4.90 eine Prüffassung ohne hörbare Lock-Wirkung (Tune-Lock in `DrumSeq.lockParams` und `mdHit` abgeschaltet; nur zur Prüfung,
liegt in `srv/olock/`). Der reparierte DSE-Test ist dort rot: HH mit ↔ ohne −305,6 dB („FEHLER 1/23“, alles andere grün).

## Läufe (Ausgaben)
- vorher (unveränderte Tests): `vorher/imp4-vorher.out`, `vorher/arpg-vorher.out`, `vorher/dse-vorher-1..3.out`
- nachher: `nachher/imp4-nachher.out`, `nachher/arpg-nachher.out`, `nachher/dse-nachher-1..3.out`, `nachher/dse-ohnelock.out`
