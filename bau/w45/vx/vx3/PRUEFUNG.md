# VX3 – unabhängige Prüfung (Gesang-Editor an echtem Gesang: Konsonant-Anlauf)

Geprüft: `vx/vx3/index.html` (4.64.0 + VX3) gegen `vx/vx3/basis.html` (= `vx/basis8.html`, 4.64.0, md5 gleich). Nichts repariert.
Alle Läufe einzeln nacheinander (Last 2,4–5,1 bei 4 Kernen). Eigene Skripte, Läufe, Fotos: `vx/vx3/pruef/`.
Zeiten in s sind Take-Zeiten. Aufnahmen #1 (33 s, Noten-Annotationen A1 = 59 und A2 = 64 Noten, dazu eine f0-Spur), #10, #14.

## Kurzurteil
- Die Zahlen des Bauers stimmen, nachgemessen mit eigener Sonde und dem Prüfer-Maß: Konsonant beim Stück #1 12 → 24/31, #10 9 → 10/13,
  #14 7 → 18/18; Stücke 69/32/35, Raster 67/69 · 24/32 · 30/35, Präzision A1 50/69 (A2 56 → 57), Vokal-Beginn 50/59, Anfang 45 → 39/59.
- Unabhängig bestätigt (f0-Annotation von #1): alle 23 Anläufe liegen vor dem Vokal-Beginn der eigenen Note; kein Anlauf reicht in den gesungenen Vokal
  davor (0/23; 4.64: 1/10 – 13,61 s, den VX3 korrekt entfernt). Inhalt der Anläufe: 1557 ms stimmlos, 177 ms stimmhaft (nur Vokal-Einsatz der eigenen Note).
- Keine neuen Knackser (alle auffälligen Nähte sind Einsätze in der Quelle, gleicher Wert), keine Zeitverluste, Bedienung unverändert,
  Regression grün wie beim Bauer.
- Kein schwerer Befund. Zwei mittlere: Ziel „Anfang ≥ 80 %“ verfehlt (wie angekündigt, Begründung stimmt) und weniger Raster-Treffer in schnellen
  Passagen (Vorgänger-Sperre, synthetisch gemessen). Dazu vier leichte.

## Befunde

### 1. MITTEL – Ziel „Anfang ≥ 80 %“ verfehlt (66 %); Begründung stimmt, zwei Zahlen im Bericht falsch
- #1 gegen A1: Anfang 45 → **39/59 (66 %)**, gegen A2 51 → 46/64. Der Auftrag erwartete einen Anstieg.
- Nachgeprüft je Note: 6 Treffer gegen A1 verloren (5 gegen A2), **0 gewonnen**; an allen 6 bleibt der Vokal-Beginn getroffen (−20…+1 ms);
  der Stück-Anfang liegt jetzt am Konsonanten:
  | Note | 4.64 | VX3 | Vokal-Beginn VX3 |
  |---|---|---|---|
  | 2,43 s | +23 | −59 | +1 |
  | 10,19 s | −8 | −50 | −13 |
  | 20,63 s | −10 | −130 | −20 |
  | 22,13 s | +7 | **−145** (Bericht: −135) | −5 |
  | 27,92 s | +22 | −70 | −10 |
  | 28,44 s | +2 | **−161** (Bericht: −141) | −11 |
- rv1 bleibt grün, weil es max(Anfang, Vokal) = 50/59 wertet. Das Ziel ist mit „Konsonant gehört zum Stück“ gegen eine Vokal-Annotation nicht erreichbar.
  Entscheidung nötig: Ziel streichen oder gegen Vokal-Beginn bzw. Konsonant-Beginn messen.

### 2. MITTEL – Schnelle Silben: weniger Anker auf dem Raster (Vorgänger-Sperre greift öfter)
- Der Bauer nennt es nur als Möglichkeit („könnte“). Gemessen (eigener Test `pruef/synth3.mjs`, Fall D): 12 Silben im 1/16-Raster bei 120 BPM
  (125 ms je Silbe), ±25 ms daneben gesungen, Marken 20 ms im Vokal, Quantisieren 1/16:
  | Konsonant | 4.64 auf dem Raster | VX3 auf dem Raster | VX3 gesperrt |
  |---|---|---|---|
  | 30 ms | 9/12 | **7/12** | 2 |
  | 50 ms | 11/12 | **10/12** | 1 |
  | 70 ms | 12/12 | **11/12** | 1 |
- Ursache: `vx1rQuant` lässt ein Stück nie vor Anker des Vorgängers + 30 ms beginnen. Mit Anlauf beginnt das Stück um den Konsonanten früher,
  der Anker-Abstand wächst um den Anlauf; bei 125 ms Silben reicht schon ein Abstand > 95 ms für die Sperre.
- Echte Aufnahmen: Raster-Zahl gleich (#10 24/32), aber dort schon 3 → 4 gesperrt (rv1 offiziell, beide Fassungen nacheinander gemessen).
- Das Paket-Ziel „Raster nicht schlechter“ gilt damit nur für die drei Aufnahmen, nicht für schnelle Passagen.

### 3. LEICHT – Das Konsonant-Maß ist zum neuen Anlauf fast deckungsgleich; unabhängig gemessen wird der Konsonant oft nur teilweise mitgenommen
- Das Prüfer-Maß (analyze.mjs) nutzt dieselben Rahmen-Klassen der App und dieselbe Lücken-Regel (≤ 3 stille Rahmen) wie `vx3Lead`.
  Die Sprünge auf 24/31 und 18/18 sind daher zum Teil durch die Bauweise vorgegeben.
- Eigenes Maß ohne die App-Klassen (`pruef/indep.mjs`): stimmhaft = f0-Annotation (#1) bzw. eigene Periodik auf voller Abtastrate (#10, #14);
  Konsonant = Pegel über 2 % Spitze und Hochton-Anteil (> 2,5 kHz) ≥ 0,35, ≥ 15 ms, vor ≥ 80 ms Gesang. 18 Konsonanten in allen drei Aufnahmen:
  | | 4.64 | VX3 |
  |---|---|---|
  | ganz beim Stück | 5 | 8 |
  | geteilt (Stück beginnt im Konsonanten) | 4 | **9** |
  | beim Vorgänger | 9 | **1** |
- Die Richtung stimmt also (Vorgänger 9 → 1). Aber die Hälfte ist nur geteilt, der Schnitt liegt 15–50 ms nach dem Konsonant-Beginn
  (15 ms kann Fenster-Unschärfe des Maßes sein). Neu geteilt mit > 15 ms:
  - #1 10,12 s: Verschluss-Knall (1 Rahmen), dann 1 stiller Rahmen, dann Behauchung. Nur die Behauchung kommt mit (Stück 10,143 s).
    Stille innerhalb des Konsonanten beendet den Lauf, die Lücken-Regel gilt nur zwischen Konsonant und Vokal.
  - #10 3,42 s: Grenze Vorgänger + 40 ms (siehe Befund 4).
  - #14 12,095 s: leise Rahmen davor als „gesungen“ eingestuft. Das ist nicht eindeutig.
  - Drei Stellen werden von der 150-ms-Grenze gekappt (#1 6,44 / 28,27 / 30,66 s, 160–190 ms lang).
- Ein Schnitt im Rauschen ist klanglich harmlos. Die Bericht-Zahlen „24/31, 18/18“ sollten aber nicht als „Konsonant ganz am Vokal“ gelesen werden.

### 4. LEICHT – Neue 50-ms-Reststücke durch die Grenze „Vorgänger + 40 ms“
- Wenn der Anlauf bis an die Grenze reicht, bleibt vom Vorgänger ein Stück von 40 ms plus dessen Rest:
  - #1 Stück 58 (Tonsprung 27,80 s): 4.64 27,80–27,94 s (142 ms) → VX3 **27,80–27,85 s (50 ms)**: 30 ms Vokal + 20 ms Konsonant der nächsten Silbe.
    Der Konsonant 27,83–27,91 s ist dabei geteilt.
  - #10 Stück 5: 3,42–3,552 s (132 ms) → **3,42–3,47 s (50 ms)**: nur der Konsonant-Anfang; der Rest des Konsonanten geht mit Stück 6.
- Stücke unter 60 ms: 4.64 0 · 2 · 0, VX3 1 · 2 · 0 (#10 hatte schon ein 50-ms-Stück).
- Weg der erkannten Marken (VX2 aus, z. B. Take mit Songtext, `pruef/probe-det.mjs`): 3 Stücke werden zu reinen Konsonant-Stücken ohne Vokal-Beginn
  (#1 20,49 / 21,99 / 28,28 s). Der Anlauf des Folgestücks nimmt dort Vokal-Einsatz und Konsonant-Ende mit.
  Folge: A1-Präzision 51 → 48/150, Anfang 38 → 35. Konsonant beim Stück in diesem Weg aber besser: 16 → 18/31, 8 → 10/13, 12 → 15/18.

### 5. LEICHT – Lücken-Regel: Ausklang des Vorgängers wandert zur nächsten Silbe, wenn diese mit Vokal beginnt
- `vx3Lead` überspringt ≤ 3 stille Rahmen zwischen stimmlosem Lauf und Vokal. Der Kommentar nennt das „Verschluss vor p/t/k“.
  Der Verschluss eines p/t/k liegt aber VOR dem Knall, nicht zwischen Behauchung und Vokal. Mit Lücke wird zudem der Legato-Schutz übersprungen.
- Eigener Fall B (`synth3.mjs`): Vokal 1 endet mit 70 ms stimmlosem Ausklang (Endkonsonant/Ausatmen), 10/15/25 ms Stille, Vokal 2 ohne Konsonant
  (Marke 25 ms im Vokal). VX3: Anlauf 100/105/115 ms, **65 ms des Ausklangs von Silbe 1 gehören jetzt zu Silbe 2**. 4.64: 0 ms.
  Beim Quantisieren wandert der Endkonsonant mit der nächsten Silbe (z. B. „Haus | am“ → „Hau | sam“).
- In den drei Aufnahmen griff die Lücke 6× (#1 3, #14 3). Jedes Mal lag Stille VOR dem stimmlosen Lauf, also ein Knall nach Verschluss.
  Dort gibt es also keinen Beleg für den Fehler. Im Deutschen (Knacklaut vor Wörtern mit Vokal am Anfang) ist das Muster aber häufig.

### 6. LEICHT – Grenze „Anker-Abstand ≤ 0,2 s“ teilt lange Konsonanten bei spätem Anker
- Eigener Fall A: 130 ms Konsonant, weicher Einsatz (110 ms Anstieg, Anker spät).
  - Marken 25 ms im Vokal: VX3 Stück beginnt **38–42 ms nach dem Konsonant-Beginn** (Anlauf 113–117 ms, Anker-Abstand 199 ms).
    4.64: ganzer Konsonant beim Vorgänger.
  - Marken am Vokal-Einsatz: VX3 wieder 38–42 ms im Konsonanten, Anker bleibt beim Festschreiben.
    4.64 nahm den ganzen Konsonanten mit, **verschob aber den Anker beim ersten Bearbeiten um −37 bis −41 ms** (Klemmen in `vx1rCommit`).
    VX3 beseitigt diesen Sprung.
- In den drei Aufnahmen greift die Grenze nie (größtes Anlauf + Anker 0,198 s bei #1 28,44 s, knapp darunter).
- Abwägung: Teilung im Rauschen statt Anker-Sprung. Vertretbar, aber im Bericht nicht als Teilung benannt.

## Bestätigt / ohne Befund
- **Zahlen** (eigene Sonde `pruef/probe.mjs` mit Quantisieren, `pruef/analyze.txt`; Basis und VX3 an derselben Quelle, bitgleich):
  | Messung | 4.64 | VX3 |
  |---|---|---|
  | Konsonant beim Stück #1 · #10 · #14 | 12/31 · 9/13 · 7/18 | 24/31 · 10/13 · 18/18 |
  | Stücke mit Anlauf | 10 · 8 · 4 | 23 · 12 · 15 |
  | A1 Anfang · Vokal · Präzision (#1) | 45 · 50 · 50 | 39 · 50 · 50 |
  | A2 Anfang · Vokal · Präzision | 51 · 56 · 56 | 46 · 56 · 57 |
  | verloren (A1 · A2) | 4 · 1 | 4 · 1 |
  | Konsonant am Vokal nach Quantisieren 1/8 (kons.mjs) | 8/9 · 1/1 · 1/3 | 9/9 · 2/2 · 3/3 |
- **Kern = App:** Node-Kern aus index.html an der App-Quelle gibt dieselben Anläufe wie die App (69/69, 32/32, 35/35).
  `vx3-test` zeigt Worker = Hauptfaden = `leadOf`, bitgleich.
- **Weggenommene 4.64-Anläufe:** nur 13,61 s (#1, Legato, Annotation: 168 ms gesungen davor) und 2,30 s (#10). Im Weg der erkannten Marken
  dazu 13,847 s: eine Marke in Stille nach dem Ausklang, 37 ms Anlauf in den Ausklang. Auch das war in 4.64 falsch, VX3 entfernt es.
- **Legato mit Pegel-Senke** (eigener Fall C, Tonwechsel 330 → 196 Hz): bei Senke 0/2 dB kein Anlauf. Bei 4/6 dB 35 ms Anlauf, das Stück
  beginnt dann 10 ms vor dem Tonwechsel statt 25 ms danach. Das liegt eher näher an der Grenze, kein Befund.
- **Knackser:** eigener Knack-Index nach Quantisieren 1/8 (`pruef/naht3.txt`): auffällig #1 1 → 3, #14 5 → 6, #10 2 → 2. Bei allen neuen
  Nähten hat die Quelle am Stück-Anfang dieselbe 2. Ableitung (Index gleich, r = 1,00 rechts der Naht). Das sind Konsonant-Einsätze der Quelle,
  keine Schnitt-Knackser. rv1: Knacken/Sprung 0 auffällig in beiden. #10 d2/Sprung max 0,10/0,13 → 0,19/0,22, Quelle steigt mit (0,30 → 0,37).
- **Zeiten** (unter Last, Einzelläufe): erste Analyse #1 3152 / 3270 ms, #10 1458 / 1416, #14 1405 / 1410 (4.64 / VX3). Kalt #1 1119–1125 / 1174–1284.
  Quantisieren gerendert rv1 #1 684 / 666, #10 262 / 175, #14 174 / 223 ms. `vx3Lead` selbst 2–36 µs je Lauf.
- **Touch, #10, hochkant 428×926 und quer 926×428** (`pruef/ui.mjs`, Fotos `pruef/fotos/ui-*`), 4.64 und VX3 gleich:
  - Song › Gesang-Block › ✎ Bearbeiten: 32 Stücke nach 972 / 1063 ms (4.64 1083 / 983).
  - Quant. › 1/8 › Anwenden: ein ↶.
  - Quer: Stück ziehen, ein ↶, Anker auf dem Raster, ↶ nimmt zurück.
  - Hochkant: Ziehen am 17 px breiten Stück löst in beiden Fassungen nicht aus (Testgrenze).
  - 10 Knöpfe, keine Überlappung, kein waagrechtes Scrollen, keine Konsolenfehler.
  - Einziger sichtbarer Unterschied: Der Anlauf wird schraffiert am Stück gezeigt.
- **Nahtstellen anderer Pakete:** SPK10 (auch 4.64) ändert 101587–101649, VX3 101966 ff. Keine Überschneidung. SPK9/CHR5/IMP2 berühren die vier Haken nicht.

## Regression (einzeln nacheinander, `pruef/reg/`)
- vx2-test 14/14 · rv1-test 52/53, nur #10 Raster (24/32, 4 gesperrt, 3 besetzt, 1 frei daneben; 4.64 gleich mit 3/4/1) ·
  vx1-test 61/61 · imp1-test ALLE OK (48, 124 s) · vx3-test 9/9 (gegen 4.64 6/9).

## Pflichtprüfungen (vx/vx3/index.html)
- topdefs: Skripte 26, Namen 7471, doppelt 0, Syntaxfehler 0 · dupkeys: 0 doppelte Schlüssel · smoke: errors [] (`pruef/smoke-pruef.png`).
- „MS 2000“ 1× (4.64 1×) · „^  live: true,“ 1× (4.64 1×) · VERSION '4.64.0' unverändert.
- Markenwörter je Wort gleich wie in der Basis, keins gestiegen, 0 im VX3-Block.
- Diff zur Basis 57 neue Zeilen, 1 ersetzt (wpWorker).
- Datensatz- und Produktnamen unter `vx/vx3`: 0, auch in `pruef/`. App 0 (Basis 0).
  Unter `vx/` außerhalb von VX3 stehen weiter die vorbestehenden Treffer in `spk3/NOTES.md`, `spk3/LOG.md` und `ki/LOG.md`.
