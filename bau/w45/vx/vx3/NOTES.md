# VX3 – Gesang-Editor an echtem Gesang: Konsonant-Anlauf · NOTES

Datei: `vx/vx3/index.html` = basis.html (4.64.0) + VX3. Block `/* ===== VX3-BEGIN … VX3-END ===== */` direkt nach `/* ===== VX2-END ===== */`.
Haken (je 1 Zeile, Kommentar `/* VX3 … */`, typeof-Schutz):
1. `nx1RunG` (Op 'vxa', Analyse-Kern) vor dem `return`: `vx3Lead(mk, {kind, env, rms, zcr}, an, …, lead)` überschreibt den Anlauf.
2. `wpWorker`: `vx3Lead.toString()` kommt mit in den Worker-Quelltext (sonst rechnete der Worker den alten Anlauf).
3. `wpCall` (erste Zeile): Schalter aus → Nachricht 'vxa' bekommt `vx3: false` (Worker und Hauptfaden-Rückfall rechnen dann wie 4.64).
4. `vx2AnLead` (VX2-Block) vor dem `return`: gleiche Rechnung `vx3Lead(mk, A, an, …, lead)`.
5. `vx1rQuant` (Prüfung, Befund 2) vor der Vorgänger-Sperre: `vx3Cut(…)` – bei der Sperre gibt zuerst der neue Teil des Anlaufs nach.
Diff zur Basis 97 Zeilen (nach der Prüfung; vorher 57). VERSION/CHANGES unberührt, nichts beim App-Start, keine sichtbare Änderung an Aussehen/Bedienung (nur andere Stück-Anfänge).
Test-API `window.__vx3`: `on(v)` (Schalter, leert VX1R.ana/VX2.res), `lead(...)`, `leadOf(id)` (Anlauf aus der App-Analyse nachrechnen).

## Entscheidungen
1. **Anlauf über den Vokal-Einsatz** (`vx3Lead`): von der Marke über ≤ 3 gesungene Rahmen (10 ms) zurück (Tonhöhen-Noten beginnen 10–30 ms im Vokal;
   30–39 ms brauchen wegen der Rahmen-Lage 3); mehr gesungen davor = Legato → kein Anlauf. Liegt die Marke selbst in einem stimmlosen Rahmen, zählt er mit.
   Danach ≤ 3 stille Rahmen (leise Behauchung nach dem Knall; nach der Prüfung nur, wenn vor dem Lauf Stille liegt), dann der stimmlose Lauf. Node-Varianten (ev3.cjs, App-Quelle): über 1/2/3 Rahmen #1 19/21/22, #10 10/11/11,
   #14 17/18/18; ohne Lücke (#14 15); nur eigene Rahmen + Lücke, kein Zurückgehen: #1 13, #14 11.
2. **Grenze 150 ms ab dem Vokal-Einsatz** (statt ab der Marke): #1 22 → 25. Gesamt-Anlauf ≤ 150 ms + (Marke − Vokal-Einsatz).
3. **Anker-Abstand ≤ 0,2 s**: Anlauf ≤ 0,199 − Anker-Abstand der Marke (vx1rCommit klemmt `an` auf 0,2 – sonst spränge der Anker beim ersten Bearbeiten).
   Greift bei den 3 Aufnahmen nie (lead + an > 0,2: 0), im synthetischen Test bis 0,1925.
4. **Legato-Schutz** (eigener Test zeigte es): am Tonwechsel ist die Periodik 2 Rahmen gestört → „stimmlos“. Ein Lauf ohne Verschluss zwischen zwei gesungenen
   Läufen zählt nur mit Rauschen (ZCR ≥ 0,15) oder ≥ 3 dB leiser als der Vokal danach. Fällt bei den Aufnahmen 2× weg (#1 13,61 s 10 ms, #10 2,30 s 20 ms;
   beide ZCR ≤ 0,03, −3/−1 dB = Tonwechsel), Konsonant #1 25 → 24, #10 11 → 10. Synthetischer Legato-Wechsel: vorher 35 ms Anlauf in den Vorgänger, jetzt 0.
5. **Kern und vx2AnLead gleich**: dieselbe Funktion an beiden Stellen; Worker = Hauptfaden-Rückfall = `leadOf` bitgleich (vx3-test), Op 'vxa' = Gesang-Editor
   bitgleich (vx2-test Prüfung 7), Node-Kern aus index.html = App (Δ kind/an/lead 0).

## Zahlen vorher (4.64.0) → nachher (App-Sonde dbg/probe3.mjs + dbg/analyze.mjs = Prüfer-Maß; reg/probe-analyze.txt)
| Messung | vorher | nachher | Ziel |
|---|---|---|---|
| Konsonant beim Stück #1 | 12/31 | **24/31** | ≥ 16 ✔ |
| Konsonant beim Stück #10 | 9/13 | **10/13** | ≥ 9 ✔ |
| Konsonant beim Stück #14 | 7/18 | **18/18** | ≥ 12 ✔ |
| Stücke mit Anlauf #1 · #10 · #14 | 10 · 8 · 4 | 23 · 12 · 15 | – |
| Stückzahl #1 · #10 · #14 | 69 · 32 · 35 | 69 · 32 · 35 | gleich ✔ |
| Raster 1/8 (rv1) | 67/69 · 24/32 · 30/35 | 67/69 · 24/32 · 30/35 | gleich ✔ (#10: 4 gesperrt/3 besetzt statt 3/4) |
| Präzision A1 (rv1) | 50/69 | 50/69 | gleich ✔ (A2 56 → 57) |
| #1 Vokal-Beginn ±40 ms (A1 · A2) | 50/59 · 56/64 | 50/59 · 56/64 | gleich |
| #1 Stück-Anfang ±40 ms (A1 · A2) | 45/59 · 51/64 | **39/59 · 46/64** | ≥ 80 % ✘ (s. u.) |
| #1 Noten ohne Grenze (A1 · A2) | 4 · 1 | 4 · 1 | gleich |
| rv1-test | 52/53 (nur #10 Raster) | 52/53 (nur #10 Raster) | – |
| Konsonant am Vokal nach Quantisieren 1/8 (#1 · #10 · #14) | 8/9 · 2/2 · 1/3 | **9/9 · 2/2 · 2/2** | – |

**„Anfang ≥ 80 %“ ist mit dem Anlauf nicht erreichbar, es sinkt zwangsläufig.** Die Annotation A1 markiert den Vokal-Einsatz (Tonhöhe): die schon in 4.64
verfehlten „Konsonant-Anläufe“ liegen −115…−177 ms vor der Note bei Vokal-Beginn ±40 ms. Jeder Konsonant > 40 ms, der jetzt richtig zum Stück kommt, schiebt
den Stück-Anfang aus dem ±40-ms-Fenster: die 6 verlorenen Treffer (+23 → −59, −8 → −50, −10 → −130, +7 → −145, +22 → −70, +2 → −161 ms; in der ersten Fassung stand hier falsch −135/−141) sind genau solche
Stellen, Vokal-Beginn bleibt dort getroffen. Kein Treffer kam hinzu: die späten Fehlgriffe (+49/+79/+97/+99 ms) sind Tonhöhen-Grenzen/verlorene Silben
(Pick, nicht Anlauf). rv1 prüft max(Anfang, Vokal) und bleibt grün (50/59 = 85 %). Den Konsonanten abzutrennen, um „Anfang“ zu heben, widerspräche
der Festlegung (Konsonant gehört zum Stück) – wie schon in der VX2-Prüfung (Befund 4).

## Tests (einzeln nacheinander)
- `vx3-test.mjs` (neu) 9/9 (reg/vx3.txt): Marken 25 ms im Vokal → Stück am Konsonanten (±12 ms; erste ms über der Schwelle), Konsonant beim Stück,
  Legato-Tonwechsel ohne Anlauf, Vokal-Beginn ±15 ms, Worker = Hauptfaden = leadOf bitgleich, Festschreiben (an ≤ 0,2, Anker/Anfang ≤ 0,05 ms), Schalter
  aus = Stücke an den Marken (4.64), wieder an = gleich. Gegen basis.html 6/9 rot (reg/vx3-basis.txt: Stücke 75 ms hinter dem Konsonanten-Beginn).
- vx2-test 14/14 (reg/vx2.txt) · rv1-test 52/53, nur #10 Raster wie 4.64 (reg/rv1.txt, reg/rv1.json) · vx1-test 61/61 (reg/vx1.txt) · imp1-test ALLE OK 48 (reg/imp1.txt).
- Pflicht s. LOG.md.

## Offen / Weg
1. ~~Konsonant nach dem Quantisieren~~ nachgemessen (Prüfer-Maß kons.mjs, Kreuzkorrelation Quelle → gerenderter Ausgang nach 1/8, reg/kons-quant.txt):
   #1 vorher 8/9 am Vokal, 1 um 28 ms getrennt → **9/9**; #10 2/2 → 2/2; #14 vorher 1/3 (3,15 s weggeschnitten, 6,12 s 52 ms getrennt) → **2/2** am Vokal.
2. Rest-Fehlgriffe Konsonant: #1 7, #10 3 – meist Grenzfälle des Maßes (Konsonant-Beginn unter der halben Pegel-Schwelle, 1–2 ms nach dem Rahmen-Beginn;
   Konsonant 160 ms > 150 ms; Vorgänger + 40 ms).
3. Längere Anläufe machen die Vorgänger-Sperre beim Quantisieren häufiger (#10 ein Stück „gesperrt“ statt „Linie besetzt“, Raster-Zahl gleich). Bei sehr
   schnellen Noten könnte das Raster dadurch sinken – Weg wie VX2 Offen 2 (1/16 oder Triolen bei Kollision vorschlagen).
4. „Anfang“-Maß: Vorschlag, im rv1-Bericht „Anfang“ gegen den Konsonanten-Beginn der Annotation zu messen oder nur Vokal-Beginn zu werten.

## Dateien
- `dbg/probe3.mjs` (Kopie Prüfer-Sonde + Quelle abziehen, QUANT=1 mit Quantisieren), `dbg/analyze.mjs` (Prüfer-Maß, unverändert kopiert),
  `dbg/ev3.cjs` (Node: Op 'vxa' aus index.html an der App-Quelle, Varianten, Maße), `dbg/runstat.cjs` (Merkmale der Anlauf-Läufe), `dbg/vx3-block.js` (erster Block-Entwurf),
  `dbg/dump/*.json` (Sonden-Daten; Puffer *.f32 gelöscht).

## Prüfung (Nachbesserung nach PRUEFUNG.md, 6 Befunde)
Je Befund nachgestellt (Prüfer-Skripte `pruef/synth3.mjs`, `dbg/probe-det.mjs` = Kopie `pruef/probe-det.mjs`, `dbg/indep.mjs` = Kopie `pruef/indep.mjs`,
Node `dbg/ev3.cjs` mit Maß „Stücke < 60 ms“), behoben, Test in `vx3-test.mjs` ergänzt. Läufe: `nach/`. Alles nur im VX3-Block plus EIN neuer Haken
(`vx1rQuant`, Ein-Zeiler mit typeof-Schutz). Aussehen/Bedienung unverändert, keine neuen Knöpfe.

| Befund | Ergebnis |
|---|---|
| 1 MITTEL Ziel „Anfang ≥ 80 %“ | **nicht behebbar ohne die Festlegung zu brechen** (Konsonant gehört zum Stück, Annotation = Vokal-Einsatz). Zahlen im Bericht korrigiert (−145/−161 ms). Anfang 39 → 40/59 (A1). Vorschlag zur Entscheidung: Ziel gegen Vokal-Beginn messen (rv1 wertet schon max(Anfang, Vokal) = 50/59 = 85 %) oder gegen den Konsonant-Beginn. |
| 2 MITTEL Vorgänger-Sperre bei schnellen Silben | **behoben**: P1 (Anlauf nie in den Einsatz des Vorgängers: Grenze auch Anker des Vorgängers + 30 ms, = Sperre beim Quantisieren) + P5 `vx3Cut` (greift die Sperre doch, gibt zuerst der neue Teil des Anlaufs nach – höchstens bis zum Stück-Anfang nach 4.64; Anker bleibt auf dem Raster; ein ↶). Prüfer-Fall D (12 Silben 1/16, 120 BPM): Raster 7·10·11 → **9·11·12**/12 (= 4.64), gesperrt 2·1·1 → **0**. #10 (rv1): gesperrt 4 → **3** (= 4.64), Raster 24/32 gleich. |
| 3 LEICHT Konsonant oft nur geteilt | **teils behoben**: P2 Knall – ein stiller Rahmen – Behauchung gilt als ein Konsonant (#1 10,12 s jetzt ganz: Anlauf 42 → 60 ms). Unabhängiges Prüfer-Maß: ganz 8 → **9**, geteilt 9 → **8**, Vorgänger 1 → 1 (4.64: 5 · 4 · 9). Klargestellt: „Konsonant beim Stück 24/31 · 10/13 · 18/18“ ist das Maß mit den App-Rahmen, nicht „ganz am Vokal“. Offen: 150-ms-Grenze kappt 3 lange Konsonanten (#1 6,44/28,27/30,66 s), #14 12,095 s (leise Rahmen „gesungen“, unklar). |
| 4 LEICHT 50-ms-Reststücke | **behoben**: P1 (s. o.; #10 3,42 s: Stück 5 behält seinen Einsatz, 3,42–3,53 s statt 3,42–3,47 s), P4 (bliebe vom Vorgänger nur ein Rest < 80 ms, gilt der Anlauf nach 4.64; #1 Stück 58 wieder 27,80–27,94 s), P6 (liegt die Marke davor im selben Konsonanten – erkannte Marke am Konsonanten –, gilt 4.64). Stücke < 60 ms 1·2·0 → **0·1·0** (4.64 0·2·0; das #10-Stück 7,71 s gab es schon in 4.64). Weg der erkannten Marken (VX2 aus): A1 Präzision 48 → **51**/150 (= 4.64), Anfang 35 → **39** (4.64 38), A2 Präz 62 (= 4.64), Konsonant beim Stück 18 · 10 · 15 bleibt (4.64 16 · 8 · 12). |
| 5 LEICHT Lücken-Regel | **behoben**: P3 – stille Rahmen zwischen Lauf und Vokal werden nur überbrückt, wenn vor dem Lauf Stille liegt (Knall nach Verschluss); liegt davor Gesang, ist es der Ausklang des Vorgängers → kein Anlauf. Legato-/Lückenprüfung jetzt am ganzen Lauf (ohne Grenzen), sonst rutschte ein von der Grenze gekappter Lauf durch (#10 2,30 s). Prüfer-Fall B (10/15/25 ms still): Atem im Stück 65 → **0** ms. Kommentar „Verschluss vor p/t/k“ korrigiert. In den Aufnahmen griff die Lücke nur nach Stille → unverändert. |
| 6 LEICHT Grenze Anker-Abstand 0,2 s | **bewusst belassen** (Abwägung des Prüfers: Teilung im Rauschen statt Anker-Sprung). Jetzt im Block-Kommentar und hier als Teilung benannt. Prüfer-Fall A unverändert (Stück 38–42 ms im Konsonanten, Anker springt beim Festschreiben nicht, vx3-test „Festschreiben“). Greift in den Aufnahmen nie. |

Zahlen 4.64 → VX3 (Prüfung) → **nachgebessert** (App-Sonde `dbg/probe3.mjs`, Maß `dbg/analyze.mjs`, `dbg/kons.mjs`; `nach/probe-analyze.txt`, `nach/kons-quant.txt`, `nach/det-analyze.txt`):
| Messung | 4.64 | VX3 | nachgebessert |
|---|---|---|---|
| Konsonant beim Stück #1 · #10 · #14 | 12 · 9 · 7 | 24 · 10 · 18 | **24 · 10 · 18** |
| Stücke mit Anlauf | 10 · 8 · 4 | 23 · 12 · 15 | 22 · 12 · 15 |
| #1 A1 Anfang · Vokal · Präz | 45 · 50 · 50 | 39 · 50 · 50 | **40 · 50 · 50** |
| #1 A2 Anfang · Vokal · Präz | 51 · 56 · 56 | 46 · 56 · 57 | 46 · 56 · 56 |
| Stücke < 60 ms | 0 · 2 · 0 | 1 · 2 · 0 | **0 · 1 · 0** |
| Raster 1/8 (rv1) | 67 · 24 · 30 | 67 · 24 · 30 | 67 · 24 · 30 |
| #10 gesperrt (rv1) | 3 | 4 | **3** |
| Konsonant am Vokal nach 1/8 | 8/9 · 1/1 · 1/3 | 9/9 · 2/2 · 3/3 | 9/9 · 1/1 · 3/3 (#10: 7,76 s wird nicht mehr verschoben, Stellen 2 → 1) |
| erkannte Marken: A1 Präz · Anfang | 51 · 38 | 48 · 35 | **51 · 39** |
| erkannte Marken: Konsonant beim Stück | 16 · 8 · 12 | 18 · 10 · 15 | 18 · 10 · 15 |
| Prüfer-Fall B: Atem im Stück | 0 | 65 ms | **0** |
| Prüfer-Fall D: Raster (30/50/70 ms Konsonant) | 9 · 11 · 12 | 7 · 10 · 11 | **9 · 11 · 12** |
| unabhängig: ganz · geteilt · Vorgänger | 5 · 4 · 9 | 8 · 9 · 1 | **9 · 8 · 1** |

Verworfen (Weg): (a) `vx3Cut` bis zur Marke vor dem Anlauf – #10 Raster 24 → 25/32, gesperrt 2, aber der Konsonant 7,76 s wurde dabei weggeschnitten
(Konsonant am Vokal #10 2/2 → 1/2, schlechter als 4.64) → begrenzt auf den Stück-Anfang nach 4.64. (b) P4 ohne Rückfall (Anlauf 0) – nahm einen
4.64-Anlauf weg (#10 7,855 s, Konsonant nach 1/8 weg) → Rückfall auf 4.64. (c) P4 gemessen ab der Marke statt ab dem Stück-Anfang des Vorgängers –
nahm schnellen Silben jeden Anlauf (Fall D 12 → 6) → ab dem Stück-Anfang.

Tests (einzeln nacheinander, `nach/`): **vx3-test 15/15** (neu: Befund 5, Befund 3, Befund 4 ×2, Befund 2 ×2; an der Fassung vor der Nachbesserung
`dbg/index-vor-p.html` 11/15, die 4 Befund-Prüfungen rot) · vx2-test 14/14 · rv1-test 52/53 (nur #10 Raster, wie 4.64: 3 gesperrt, 4 besetzt, 1 frei) ·
vx1-test 61/61 · imp1-test ALLE OK (48). Pflicht s. LOG.md.
Testsignal im alten vx3-test geändert: das Rauschen endete 12 ms vor dem Vokal (Fensterform) – nach P3 ist „Lauf nach Gesang, Stille, Vokal“ der
Ausklang des Vorgängers; jetzt geht der Konsonant ohne Stille in den Vokal über (wie gesungen). Alte Fassung: `dbg/vx3-test-vor-p.mjs`.

Offen: Befund 1 (Entscheidung Ziel/Maß). `vx3Cut` ändert die festgeschriebene Marke (bis ↶): wird danach gröber quantisiert, bleibt der
Konsonant-Anfang dieses Stücks beim Vorgänger (höchstens bis zum Stand 4.64). 150-ms-Grenze bei langen Konsonanten (3 Stellen #1).
