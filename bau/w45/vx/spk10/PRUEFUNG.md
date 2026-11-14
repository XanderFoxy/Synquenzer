# SPK10 – Prüfung (unabhängig, skeptisch)

Geprüft: `spk10/index.html` gegen `spk10/basis.html` (4.64.0). Alles einzeln nacheinander gelaufen (Last 2–5). Nichts repariert.
Prüfer-Ordner: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk10-pruef`
(bitgleicher Nachbau `index.html`, `mess` als Verweis, eigene Fälle `messb/faelle/<neu>`, Mess-Kopie `messb/faelle8p.mjs` mit
`FALL=name@Bass,Pad1,Pad2,Trommeln`, Vergleich an/aus `vergleich.sh` → `v1…v5.txt/.jsonl`, Render `render10.mjs` + `pats*.json`,
Fehlersuche `blk-dbg.js`, Zeit im Block `blk-zeit.js`, Seite `seite-p.mjs` (`SPUREN=`), Regression `reg/*.out`, Misch-Probe `merge/`).

## Ergebnis in einem Satz
Die Zahlen des Bauers stimmen alle, Regression und Pflicht sind sauber. Aber der Gewinn (+3 in „ohne Pads“) verallgemeinert nicht.
Er entsteht, weil die Tonsuche am Rand ihres Suchfensters endet und dieser Rand zufällig auf G2 rundet.
In eigenen Fällen werden richtige Noten schlechter (G2 → G3), und reine Oktavfehler werden zu Fehlern in der Tonklasse.

## Befunde

### 1 [schwer] Richtige Noten kippen eine Oktave nach oben – Verschlechterung gegen 4.64 in einfachen Mischungen
Mit eigenen Mischungen (gleicher App-Synth, gleiche Pads und Trommeln, nur andere Pegel oder Linien) wurde jedes Ergebnis gegen `basis.html` gegengeprüft:
| Fall (Bass, Pad 1, Pad 2, Trommeln) | 4.64 | SPK10 | Note |
|---|---|---|---|
| Demo-Linie, nur Pad 2, ohne Trommeln (`demo@1,0,1,0`) | 32/32 · 0,970 | **31/32 · 0,939** | 1,38 s G2 (43) richtig → G3 (55) |
| G-Linie (Demo +7), Pads +3 dB, ohne Trommeln (`gdemo@1,1.4,1.4,0`) | 17/32 · 0,773 | **16/32 · 0,727** | 0,27 s 43 richtig → 55 |
| G-Linie, Pads +4 dB, mit Trommeln (`gdemo@1,1.6,1.6,1`) | 8/32 · 0,258 | **7/32 · 0,226** | 0,27 s 43 richtig → 55 |
- Ursache: Das Merkmal r richtiger G2-Noten fällt unter die Schwelle, wenn ein Pad G3 = 2·G2 trägt: −19,4 dB (`demo@1,0,1,0`, `gdemo@1,1.4,1.4,0`), −20,3 dB (`gdemo@1,1.6,1.6,1`).
  Knapp darüber liegen −19,0 (`demo@1,2.5,2.5,0`), −17,8 (`okt@1,2,2,1`), −17,7 (`gdemo@1,2,2,0`) und −17,6 (`demo@1,2,2,0`).
- Die Aussage im Bericht und in NOTES („richtige Noten in allen Fällen bis −16,6 dB, Rand 2,4 / 1,6 dB“) gilt nur für den Prüf-Satz.
  Gleichzeitig bleiben echte Oktavfehler bei −17,2 … −18,5 dB unerkannt: `chrom@1,0,0,1` −17,2, `dunkel200@1,0,0,1` −17,9/−18,4, `dunkel120@1,0,0,1` −18,5.
  Die beiden Verteilungen überlappen, die Schwelle −19 dB hat keinen Abstand.
- Wie steil die Kante ist, zeigt die Schwelle −15 dB im Prüf-Satz: Demo 29 → 28, okt 24 → 23, basspads 32 → 31, ohneraster 24 → 23. Der Bauer hat das bestätigt.
- Gesamtbild über 54 eigene Läufe (`v1…v5`):
  - Treffer 912 → 919 von 1732.
  - 10 Noten falsch → richtig, 3 richtig → falsch, 7 falsch → anders falsch.
  - 44 von 54 Läufen bleiben ganz ohne Änderung.

### 2 [mittel] Der Gewinn hängt am Rand der Tonsuche und an der Kick-Stimmung, nicht an einer echten Ton-Bestimmung
- Alle 10 Korrekturen in eigenen Läufen und alle 3 im Prüf-Satz starten auf 31/32 (G1/G♯1 ≈ 49–52 Hz, also im Bereich des Kick-Rests) und enden auf **43 (G2)**.
  Alle Änderungen über 54 Läufe: 32✗→43✓ 8×, 31✗→43✓ 2×, 31✗→42✗ 3×, 31✗→45✗ 3×, 32✗→45✗ 1×, 43✓→55✗ 3×.
- Die Kamm-Werte der Tonsuche um 2f sind flach. Grund: Spitze ±1 Bin bei 10,8-Hz-Bins, ein Halbton bei 98 Hz sind 5,8 Hz. Nachbar-Kandidaten haben oft **genau gleiche** Werte.
  Bei Gleichstand gewinnt der erste, also der tiefste Kandidat (`s > bs`) (`blk-dbg.js`):
  - bassdrums 3,47 s: f 52,46 → Kandidaten 96,2 / 99,0 Hz beide 587,98 → 96,2 Hz → rundet auf 43 ✓.
  - bassdrums 5,68 s: f 51,71 → 94,8 / 97,6 Hz beide 128,29 → 94,8 Hz → 42 ✗.
  - Demo nur Pad 1, 5,62 s: f 50,24 → Spitze am oberen Rand 109,6 Hz (567,5 gegen 528,5) → 45 ✗.
- Die drei gewonnenen Treffer in „ohne Pads“ sind also Rundungsglück: 2 · 52,46 Hz · 2^(−1,5/12) = 96,2 Hz → 43.
  Die Regel „Unter-Oktave erkannt → 2f“ trifft nur, wenn die Verfolgung auf dem Kick-Rest sitzt und die wahre Note nahe 2 × Kick liegt (G2/G♯2).
- Andere Linien ohne Pads: fdemo, adur, chrom, chromab, gdemo, walk, sech, hoch, lang. Dort gibt es **0 Änderungen**, obwohl je Lauf 4–14 Oktavfehler vorliegen (r −1,4 … −17,7 dB).
  Gewinne gibt es nur für die Demo-Linie und `okt` (beide mit G2 auf dem Kick):
  - ohne Pads: Demo 19 → 22, okt 22 → 25, hell 26 → 28, dunkel120 5 → 7, dunkel200 13 → 14;
  - Demo ohne Pads mit Trommeln +6 dB: 10 → 12.
- Ziel-Fälle unverändert (bestätigt): Lauf 8/32 · 0,216, 16tel 29/64 · 0,617, ohne Pads 22/32 (Ziel ≥ 24 nicht erreicht).

### 3 [mittel] Oktavfehler werden zu Fehlern in der Tonklasse
Suchfenster ±3 Vierteltöne (±1,5 Halbtöne) um 2f, danach auf MIDI gerundet. Am Rand (j = ±3) rundet das auf ±2 Halbtöne, und die Suche endet wegen der flachen Werte oft am Rand (Befund 2).
Noten, die vorher **nur in der Oktave** falsch waren (richtige Tonklasse G), werden zu A2 oder F♯2:
- `demo@1,1,0,1` (nur Pad 1): 5,62 s und 7,77 s G1 31 → A2 45 (wahr G2 43)
- `demo@1,1.6,0,1`: 5,62 s 31 → 45
- `dunkel200@1,0,0,1`: 5,62 s 31 → F♯2 42
- `demo@1,0,0,2` (Trommeln +6 dB): 1,34 s und 7,77 s 31 → 42
- Prüf-Satz bassdrums: 5,68 s 32 → 42 (vorher 11 Halbtöne daneben, jetzt 1, beides falsch)

Treffer und Präzision zählen das nicht, für Nachbau und Notenbild ist eine falsche Tonklasse aber schlimmer als eine falsche Oktave.

### 4 [leicht] In der Seite ist der Effekt kleiner, und kein Seiten-Test übt SPK10
- Eigener Seiten-Lauf (`seite-p.mjs`, `SPUREN=spur0,spur4` = Bass + Trommeln als WAV, Touch, Worker, 428×926 und 926×428):
  - 4.64: 23/32 · 0,767 (30 Noten)
  - SPK10: 24/32 · 0,800 (30 Noten)
  - beide 14/14 OK (↶/↷, Konsole [])

  Im Node-Fall „bassdrums“ mit demselben Material sind es 19 → 22. Der Gewinn hängt also auch an Pegel und Quantisierung. Der Lauf belegt immerhin, dass `spk10Okt` im Worker wirkt.
- `spk8-seite.mjs` nimmt die Demo. Dort ändert SPK10 keine Note, der Seiten-Test bemerkt SPK10 also nicht. `messb/worker10.mjs` prüft nur `typeof`.

### 5 [leicht] Regression nach dem Mischen
`spk8/messb/faelle8.mjs` misst ohne SPK10, und die Untergrenze für bassdrums (22 · 0,739) steht nur in der Kopie `spk10/messb/`.
Wer nach dem Mischen den alten Aufruf benutzt, prüft SPK10 nicht. Die Prüfer-Fälle aus Befund 1 und 3 sind noch in keinem Soll:
`demo@1,0,1,0`, `gdemo@1,1.4,1.4,0`, `demo@1,1,0,1`, `demo@1,0,0,2`, `okt@1,0,0,1`.

### 6 [leicht] Kommentar und Datenfeld
- Kopf-Kommentar im Block: „auf dem Original mit abgezogener Kick-Vorlage“. Tatsächlich gilt `kick: 0`, es wird nichts abgezogen.
- Umgestellte Noten behalten ihre Sicherheit, z. B. bassdrums 5,68 s 42 (falsch) mit Sicherheit 1,00.
- `q.o10 = 1` wird in `teil2.notes` gespeichert, aber nirgends benutzt (neues Feld ohne Anzeige).

### 7 [leicht] Läuft vor dem Leck-Schutz
`spk10Okt` arbeitet auf allen Roh-Noten: Demo 67, nach dem Leck-Schutz bleiben 36; 174 s: 595.
Der Leck-Schutz rechnet mit `T.f0` und nicht mit `q.m`, deshalb ergäbe ein Lauf danach dieselben Noten bei etwa halber Arbeit.
Die Kosten sind ohnehin klein (Befund „Zeit“ unten).

## Bestätigt (nachgemessen)
- **Bau**: `bau.py` baut `index.html` bitgleich nach. Diff = Block nach SPK8-END + Haken in bassNoten + Haken in spk8WUrl. VERSION 4.64.0.
- **Zahlen des Bauers**:
  - `faelle8 SOLL=1` (Kopie `spk10/messb`): 13 OK / 0 FEHLER.
    - bassdrums 22/32 · 0,759
    - unverändert: Demo 29/32 · 0,806, okt 24/32 · 0,686, lang 4/4 · 0,333, walk 8/32 · 0,216, sech 29/64 · 0,617, leise 16/32 · 0,50, hoch 13/32 · 0,448, laut 30/32 · 0,789, basspads 32/32 · 0,97, ohneraster 24/32 · 0,727, sr48 28/32 · 0,718, ohnebass 0 (28)
  - Vorher-Stand: Original `spk8/messb/faelle8.mjs` auf `basis.html` 13/13, bassdrums 19/32 · 0,655.
  - Kick-Abzug an (`kick:1`): gleiche Noten.
- **Zeit** (≤ 1,2× eingehalten):
  - `spk10Okt` selbst (`blk-zeit.js`): Demo 21–34 ms, Lauf 24–38 ms, 16tel 19–34 ms, bassdrums 8–9 ms, 48 kHz 19–36 ms, 174 s 182–305 ms. Das sind etwa 2–3 % von „Noten finden“.
  - Ganzer Schritt gepaart (Last 3–5, verrauscht):
    - Demo 1157/1323, 1058/1627, 1014/1123 ms
    - Lauf 1291/1173, 1274/1336, 1031/1136 ms
    - 174 s 8155/8462, 7964/7954, 7907/8799 ms
  - Speicher 174 s: 408,2 → 410,9 MB angelegt, maxRSS-Zuwachs gleich (126–137 MB).
- **Regression** (einzeln, Kopie im Prüfer-Ordner):
  - `spk8-seite` 14/14 (Demo 29/32 · 0,806, hochkant und quer, ↶/↷, Konsole [])
  - `spk5-test` ALLES OK · 24 · `spk5-fade-test` ALLES OK
  - `spk1-test` 17 OK / 1 FEHL verfeinern-verbessert-ziel 4,37 → 4,36 (bekannt)
  - `spk4-test` gegen basis5: **20 OK / 3 FEHLER**, genau die erwarteten (pflicht/Version, a2-verfeinern-plus-1db, reg-ki1 quer-428/quer-370/besser-als-klassisch).
    a3-nachbau-zeit diesmal OK (va2 2702→3073, fm 2265→2018, pad 2912→2796, lead 2846→2802 ms, Abstände gleich), damit ist die Last-Erklärung des Bauers bestätigt.
- **Pflicht**: topdefs Skripte 26 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke `errors []` (`spk10-pruef/smoke-pruef.png`) · „MS 2000“ 1× (Basis 1×) · „  live: true,“ 1× ·
  VERSION 4.64.0 · Markenwörter je Wort 0 = Basis · eingefügter Text und Paket-Texte ohne Marken-, Datensatz- oder Produktnamen.
- **Bedienung**: keine Änderung. Seite per Touch in 428×926 und 926×428 mit Demo und mit Bass + Trommeln: je 14/14, Konsole [].
- **Misch-Probe**: `git merge-file` SPK9 (basis7 → spk9) auf SPK10: 0 Konflikte (wie auf 4.64). Gemischte Datei: topdefs 0/0, faelle8 demo/bassdrums/walk = SPK10.

## Empfehlung
Nicht mit `o10.an = 1` ausliefern, solange Befund 1 offen ist. Netto bringt es +7 von 1732 Treffern, kostet aber 3 neue Fehler an richtigen Noten und erzeugt 6 Tonklassen-Fehler.
Wird es trotzdem gemischt, dann mit `an: 0` (bitgleich SPK8) oder nur zusammen mit den Prüfer-Fällen im Soll.
Messbare Ansatzpunkte (erst messen):
- nur umstellen, wenn f im Kick-Bereich liegt (< 55 Hz) und die Pad-Ebene bei 2f nichts trägt;
- Tonsuche nur ±0,5 Halbtöne um 2f und nur bei klarer Spitze (bester Kandidat deutlich über dem zweiten), sonst die Note lassen;
- Gleichstand nicht zugunsten des tiefsten Kandidaten auflösen.
