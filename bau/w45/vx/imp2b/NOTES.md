# IMP2B – IMP2 ohne Chor-/rv1-Rückschritt? · NOTES

Paket: `basis.html` = 4.66.0 (ohne IMP2, unverändert), `index.html` = 4.66.0 + IMP2 (**unverändert gelassen**, sha256 a4d6e9ef…).
imp1Core in `index.html` ist zeichengleich mit `vx/imp2/index.html` (sha256 des Kerns 89e25b1d…) – IMP2 hier = IMP2 dort.
Arbeitsdateien: `work/` (Sonden, Nachrechnungen, Läufe). Neue Test-Kopie: `vx/chr3/chr2-test-imp2b.mjs` (Original `chr2-test.mjs` unverändert).

## Kurz
- ~~imp1Core wird NUR vom Import benutzt~~ **Korrektur (Prüfung M2):** auch die Spektral-Seite nimmt ihr Takt-Raster daraus (`spk1Grid` → `imp1Analyse`), s. „Prüfung“ unten. Import: Worker + Hauptfaden. Chor, Takes, Gesang-Editor rechnen nichts mit IMP2-Code. Beide
  Rückschritte kommen ausschließlich über das **Ergebnis** des Imports (Tempo → Projekt-Tempo → Dehnen/Lage des Takes). „IMP2 begrenzen“
  ist also schon so: es gibt keinen anderen Weg, der IMP2 benutzt.
- (1) Chor: der Chor rechnet in Basis und IMP2 **genau den Plan** (Versatz je Kopie auf die Probe). Die 3 FEHLER sind Mess-Fehler von
  chr2-test (nachgewiesen, s. u.) → korrigierte Kopie: **82/82 auf index.html und basis.html**.
- (2) rv1: die 3 zusätzlichen FEHLER sind **bitgleich** in der Basis, sobald die Basis denselben Take bekommt (gleiches Tempo/t1).
  Ursache = Gesang-Editor (VX1R/VX2/VX3: Marken, Quantisieren, Verschieben) reagiert auf 5 ms Take-Lage bzw. auf das (richtige) 121er-Raster.
  Der Test misst dabei richtig (echtes Knacken, echter Raster-/Ausklang-Befund) → keine Test-Anpassung, **in IMP2B nicht behebbar**.
- Folge: IMP2 bleibt draußen (rv1 mit IMP2 4/53 statt 1/53). Nichts eingebaut, index.html unverändert.

## (1) Chor – Ursache belegt
Sonde `work/chr-probe.mjs` (= chr2-test Abschnitt 2a/2b, schreibt Puffer + Import-Daten), Läufe `work/probe-basis.*`, `work/probe-index.*`:

| | Basis 4.66 | 4.66 + IMP2 |
|---|---|---|
| Import der Test-WAV (synthetisch, Wahrheit 120 BPM, 44,1 kHz; App dekodiert auf 48 kHz) | 120,4 (roh 120,39), t1 0,234 | 120,5 (roh 120,54), t1 0,243 |
| Projekt-Tempo `Math.round(c.bpm)` | 120 | **121** |
| NX1 dehnt den Take ans Projekt-Tempo | q 1,0033 (414 176 Proben) | q **0,9959** (411 094) |
| Take-Länge / Vorlauf | 498 907 / 2,000 s | 494 685 / 1,983 s |
| tatsächlicher Versatz echt gegen ohne (erste Probe ≠ 0, 48 kHz) | 6/12/9/17/15/16 ms | **6/12/9/17/15/16 ms** (= Plan) |

Node-Gegenprobe `work/lead-tempo.mjs` (imp1Core aus der Datei, dieselbe WAV): Basis 44,1 kHz **120,55**, Basis 48 kHz 120,39; IMP2 44,1 und
48 kHz **120,54** → IMP2 liefert bei 48 kHz genau den Basis-Wert von 44,1 kHz (das ist sein Zweck). Dass 120,5 auf 121 rundet, ist Zufall der
Schätzung: der Gesang-Weg findet bei dieser konsonantenlosen Vokal-Melodie 17 Einsätze, davon 5 um −73…−82 ms und 5 Ausklang-Spitzen
(`work/lead-ons.mjs`) – Basis und IMP2 liegen beide 0,4–0,5 BPM daneben.

Warum chr2-test dann rot wird (Nachrechnung des Mess-Teils an den echten Puffern: `work/ana2.mjs` = Zeilen 126–159 des Tests unverändert →
gibt exakt dieselben Zahlen wie der Browser-Lauf, inkl. NaN; `work/ana2fix.mjs` = korrigiert; `work/lag2.mjs` = Schätzer-Varianten + Mutation):
1. **Falsche Abtastrate**: die Kopien-Puffer haben 48 kHz (Take-Rate), der Test rechnet mit SR = 44 100 → jeder Versatz × 1,088
   (Basis-Werte 6,5/6 · 13,5/12 · 18,5/17 liegen nahe Plan × 48/44,1 = 6,5 · 13,06 · 18,5 – **Korrektur L4:** „genau“ stimmt bei 13,5 gegen 13,06 nicht).
2. **Mehrdeutiger Schätzer**: Hüllkurve nur 5 ms geglättet; bei der tiefen Stimme (oct-1, 131–196 Hz, Periode 5–7,6 ms) bleibt die
   Perioden-Welligkeit, die Kreuzkorrelation hat Gipfel im Abstand einer Periode, Unterschied r < 0,002 (IMP2 Kopie 5: 10,8 ms r 0,9789 ·
   17,9 ms r 0,9774). Mutation (echte Kopie künstlich +8 ms): alter Schätzer liest +4,0 / +12,2 ms (IMP2) bzw. +9,2…10,2 (Basis, ×1,088).
3. **NaN** = 0/0: ein Formant-Rahmen (s = 94 501, im Vorlauf vor dem ersten Ton) liegt ganz in digitaler Stille (alle vier Fenster 0),
   die YIN-Prüfung schaut 40 ms nach vorn und sieht schon den Ton → `centroid` 0, `(0−0)/0` = NaN vergiftet den Mittelwert. In der Basis fällt
   wegen anderem Vorlauf (erste Probe ≠ 0 bei 96 769 gegen 95 545, **25,5 ms** – Korrektur L4, vorher „17 ms“) kein Rahmen genau dorthin.

Korrektur (nur Mess-Teil, Kopie `vx/chr3/chr2-test-imp2b.mjs`, Begründung im Kopf): SR = sampleRate des Puffers **für Versatz und Ausrichtung** (Korrektur L3: YIN und Formant-Band rechnen weiter mit 44 100, Band real 326–3 809 statt 300–3 500 Hz – für das Verhältnis harmlos); Hüllkurve 20 ms; stiller
Rahmen zählt nicht. Alle Grenzen und übrigen Prüfungen zeichengleich. Mutation +8 ms jetzt 7,4…8,4 ms (Basis und IMP2).

| chr2-Messung | Basis alt | IMP2 alt | Basis korrigiert | IMP2 korrigiert |
|---|---|---|---|---|
| Versatz gemessen/Plan | 6,5/6 13,5/12 9,7/9 18,5/17 16,5/15 17/16 | 6,7/6 13,5/12 9,7/9 18,7/17 **11,7/15 22,4/16** | 6/6 12,1/12 8,9/9 16,7/17 15,1/15 15,8/16 | 6/6 12,1/12 9,2/9 17,2/17 15,6/15 15,4/16 |
| Formant uni · st+2 · oct-1 (ohne) | 3,13 (0,4) · 3,02 (−0,04) · 1,8 (0,1) % | **NaN** · **NaN** · 1,12 (NaN) % | 3,11 (0,4) · 3,01 (−0,04) · 1,8 (0,1) % | 3,19 (0,37) · 2,79 (−0,1) · 2,01 (0,16) % |
| Ergebnis | 82/82 | 3 FEHLER | **82/82** (`work/chr2fix-basis.txt`) | **82/82** (`work/chr2fix-index.txt`) |

## (2) rv1 – Ursache belegt
Läufe (einzeln nacheinander): `work/rv1-basis.txt` 1/53 (nur #10 Raster) · `work/rv1-index.txt` 4/53.

| | Basis | IMP2 |
|---|---|---|
| #10 Tempo / t1 | 112 / 0,383 | 112 / **0,388** → Take 5 ms anders gelegt |
| #10 Stücke · Knacken · Raster | 32 · 1,0 · 24/32 | 31 · **4,05 (Schnitt 13, um 1 ms verschoben)** · 24/31 |
| #14 Tempo / Projekt / t1 | 132,6 / 133 / 0,779 | **120,6 / 121** / 0,686 (richtig, s. vx/imp2/NOTES) |
| #14 Stücke · Raster · Verschiebe-Stück links | 35 · 34/35 OK · Stück 25 OK | 37 · **31/37 (frei daneben 1)** · Stück 35: Ausklang ab 346 ms (36 ms vor dem Schnitt, Grenze 31) ungleich |

Gegenprobe mit gleicher Take-Lage (`work/rv1s-test.mjs` = Kopie von vx/imp2/fix/rv1t-test.mjs + `RV1_T1`: erkannter Taktanfang vorweg):
- Basis #10 mit t1 0,388 (`work/rv1s-basis-10-t388.txt`): **31 Stücke, Knacken an Schnitt 13, Raster 24/31** – gleiche Fehlerart wie IMP2. **Korrektur L1:** nicht zahlengleich wiederholbar (Prüfer 2×: Verhältnis 3,93 / d2 0,1435 statt 4,05 / 0,1102).
- Basis #14 mit Tempo 120,6 + t1 0,686 (`work/rv1s-basis-14-b1206.txt`): NX1 q 0,99669 / 583 559 Proben wie IMP2, **37 Stücke, Raster 31/37,
  Stück 35 links Abweichung 0,1086 bei 346 ms** – zahlengleich mit IMP2.
- IMP2 #10 mit t1 0,383 (`work/rv1s-index-10-t383.txt`): **32 Stücke, kein Knacken, Raster 24/32** – zahlengleich mit der Basis.
(Bei `RV1_ONLY=10` läuft der Chor-Teil an #10 statt #1; diese Chor-Zeilen gehören nicht zum Vergleich.)

Damit: die Fehlerliste ist eine feste Funktion von (Tempo, t1) des Imports; der Gesang-Editor macht daraus Knacken/Raster/Ausklang.
Die rv1-Prüfungen messen richtig (Knacken = 2. Ableitung 4× größer als irgendwo in ±20 ms Quelle; Raster/Ausklang = tatsächliche Lage) –
keine Test-Kopie. ~~Die Auswahl „Stück nach Index“ ist hier nicht die Ursache (#14: dieselbe Silbe, s. vx/imp2/NOTES Befund 2).~~ **Korrektur L4:** der Beleg „dieselbe Silbe“ stammt aus Läufen auf 4.63; in 4.66 verschiebt die Basis Stück 25, IMP2 Stück 35 – den Schluss deckt die Gegenprobe RV1_BPM=120,6. **Korrektur nach Prüfung:** „Test misst richtig“ gilt für Knacken und Raster; beim Verschieben links misst der Test gegen eine gedehnte Fassung (s. „Prüfung“ unten).

## Zahlen vorher → nachher (dieses Paket)
- chr2-test (Original): Basis 82/82, IMP2 3 FEHLER (unverändert, Ursache Test). Kopie mit korrigierter Messung: Basis 82/82, IMP2 **82/82**.
- rv1-test: Basis 1/53, IMP2 4/53 (unverändert; Ursache Gesang-Editor, bitgleich nachgestellt).
- Code: keine Änderung (kein IMP2B-Block) – keine Verbesserung von rv1 ohne Eingriff in VX1R/VX2/VX3 möglich, der ausdrücklich nicht zu IMP2B gehört.
- Regression/IMP2-Tests/Pflicht an index.html: s. LOG.md (Endstand).

## Offen / Vorschläge
1. **VX (Gesang-Editor) robust gegen Take-Lage** – eigener Auftrag, Voraussetzung für IMP2: (a) Marken (wpDetect) kippen bei 5 ms
   Vorlauf 32 → 31 Stücke (#10); (b) Quantisieren: Schnitt mit 1 ms Verschiebung erzeugt Knacken (2. Ableitung 0,110 gegen 0,027; #10,
   Schnitt 13, Take wie IMP2); (c) Raster „frei daneben“ (gleicher Fehlertyp wie #10 schon in 4.65/4.66, mit 121er-Raster auch #14);
   (d) Verschieben links: Ausklang des Vorgängers nur bis 36 statt 31 ms vor dem Schnitt bitgleich (#14 Stück 35, Vorgänger −111 ms quantisiert).
   Nachstellen ohne IMP2: `RV1_T1=0.388 RV1_ONLY=10` bzw. `RV1_BPM=120.6 RV1_T1=0.686 RV1_ONLY=14` mit `work/rv1s-test.mjs` auf basis.html.
2. chr2-test: Kopie `chr2-test-imp2b.mjs` statt Original als Abnahme übernehmen (oder die drei Korrekturen im Original nachziehen – Entscheidung CHR).
3. Gesang-Tempo bei Vokal-Melodien ohne Konsonanten 0,4–0,5 BPM zu hoch (Basis wie IMP2); bei x,5 kippt das Projekt-Tempo (`Math.round`).
   Vorschlag für später: Einsatz-Spitzen im Gesang-Weg zwischen Rahmen interpolieren und Ausklang-Spitzen (Pegel fällt) verwerfen.
