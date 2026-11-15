# VOXR1F – Gesang reinigen: Klicks + Raumton (15.11.2026, 16:18–)

Basis: basis.html = rel-4730/index.html (4.73.0). index.html = basis + Änderungen **nur im Block VOXR1-BEGIN…END** (Kern `vr1Make`),
Kommentar-Kennung `VOXR1F`. **Kein neuer Haken**, außerhalb des Blocks bitgleich zu basis.html, VERSION bleibt 4.73.0, nichts Sichtbares.
Sicherungen: index.vor-start.html (= basis), index.vor-klick.html, index.vor-erkennung.html, index.vor-raumton.html.
Werkzeuge (w/): `qc.mjs` (Klick- und Raumton-Teil des Entwickler-Tests, gleicher Code, mit Details; Optionen per CO=/RO= JSON),
`kroom.mjs` + `kroom-dump.mjs` (Raumton-Teil des Prüfer-Kerns mit dessen exakten Löchern), `prof.mjs` (Band > 2 kHz um einen Klick, 0,25-ms-Schritte),
`dbg.mjs` (warum ein Klick nicht erkannt wird), `gap.mjs` (Pegel/Höhenanteil/Oktaven um die Raumton-Lücken), `fp2.mjs` (Ereignisliste um eine Zeit).

## Verfahren

### Klick-Reparatur (`click`, neu `clickSpan`)
Befund (prof.mjs, Take A Klick 18, 38 dB über der Pause): die erkannte Spanne begann 0,6 ms vor dem Klick und endete 0,6 ms vor seinem Ende –
die Erkennung hört auf, wo das Band unter 20 % der Spitze fällt. Der Ausklang blieb stehen **und** war Randwert der LSAR-Interpolation
→ Füllung 6–8 dB über dem Rauschboden. Bei Klick 4 (6,844 s) blieb zudem der Teil des Klicks an der Filterflanke 1,5–2,5 kHz im Tiefband
stehen (LSAR rechnet nur das Band > 1,5 kHz neu).
1. `clickSpan`: Band > 1,5 kHz in 0,25-ms-Rahmen gegen den Median der Umgebung (links 1–12 ms, rechts 3–12 ms); verlängern, solange ein Rahmen
   > 4,8 dB (3×) darüber liegt – rechts ≤ 2 ms, links ≤ 0,5 ms, gesamt ≤ 8 ms, **nur für Funde ≤ 3 ms** (längere = Geräusche des Takes wie bisher).
2. Starker Klick (Band > 1,5 kHz im Fund > 20 dB über der Umgebung): Bandgrenze 700 Hz statt 1,5 kHz (Grundton/erste Obertöne bleiben unberührt).
3. Deckel: Füllung (Band über der Grenze) nie lauter als +3 dB über der Umgebung.
4. Gemeldete Spanne = ersetzte Spanne (floor/ceil auf 0,1 ms; vorher Rundung auf 0,1 ms – konnte die ±2-Proben-Toleranz knapp verfehlen).
Schalter: `{span: 0}`, `{lowF: 0}`, `{cap: 0}`, Feinwerte spanK/spanR/spanL/spanMax/lowH/capK.

### Klick-Erkennung (`clickScan`, VOXR1F-BIG)
Befund (dbg.mjs): Klick 6,844 s (Take A, Pause, 38,6 dB über der Umgebung) fiel durch den Nachbar-Test – 26–28 ms später setzt die Stimme ein,
drei lautere Spitzen im ±25-ms-Fenster. Neu: liegt die Spitze > 30× (≈ 30 dB) über dem Median der Umgebung, reicht der Nachbar-Test im engen
Fenster ±12 ms (Stimmlippen-Pulse ab 85 Hz kommen dort mindestens zweimal). `{big: 0}` = wie vorher.
Nicht gelöst: 3 Klicks auf gesungenen Vokalen (5,17 s 6,8 dB / 23,0 s 4,4 dB / 19,8 s 1,9 dB über der Umgebung im Band > 2 kHz; Spitze nur
1,7–1,8× über den Stimmlippen-Pulsen, Schwelle 2,28).

### Raumton (`room`)
Befund (gap.mjs): In den Entwickler-Lücken 2/3/5 (Take A) hat das Original **in** der Lücke 3–9 dB mehr Höhen (4–8 kHz) als die 60 ms direkt
daneben (Luft/Atem mitten in der Pause) – aus der Nachbarschaft nicht ableitbar. Der gelernte Raumton ist noch dunkler (Farbe 5,5–10 dB).
1. Klangfarbe (gebaut, gemessen, **Vorgabe AUS**, Schalter `{ton: 30}`): Fenster mit Gesangsrest (stärkster Bin 100–1500 Hz > 30× Median
   dieser Bins) zählen nicht; von den rauschartigen die nahe der Lücke (≤ 100 ms), darüber der Median je Terzband wie VOXR1D-RT.
   Abwägung (Farbe im Ziel ±4 dB, beide Varianten mit der Pegel-Änderung): Entwickler 2/5 vs 2/5 (Werte mit ton 30 besser: [1,7, 4,2, 6,2, 2,3, 5,9]
   vs [2,1, 4,8, 6,3, 2,3, 6,7]), Prüfer-Kern 4/4 vs 4/4, kern3 9/24 vs 8/24, kern2 6/28 vs 9/28 → Summe 21 vs 23 → aus. Mit Vorgabe 0 rechnet
   die Farbe genau wie VOXR1D-RT.
2. Pegel: liegt der Raumton direkt an der Lücke (3 Rahmen je Seite) über dem Median von weiter weg, zählt er – höchstens +2 dB darüber
   (VOXR1D-RP deckelte nur nach oben). `{up: 0}` = wie vorher.

## Messtabelle (vorher = basis 4.73.0, nachher = Endfassung)
| Messung (Ziel) | vorher | nachher |
|---|---|---|
| Entwickler: Klicks Take A gefunden (≥ 18/20) | 16 (d1 23 / d2 4) | **17** (d1 24 / d2 3) – Ziel knapp verfehlt |
| Entwickler: Klicks A/B/C neue Fehlalarme | 0 / 0 / 0 | 0 / 0 / 0 |
| Entwickler: Überstand > 2 kHz nach Reparatur A / B / C (≤ 3 dB) | 7,5 / 3,2 / 2,9 | **2,6 / 0,5 / 1,2** |
| Entwickler: Klick-Abzug Median A / B / C (Info, höher = besser) | 10,9 / 4,3 / 6,9 dB | 13,2 / 3,7 / 6,9 dB |
| Entwickler: Raumton Pegel je Lücke ±3 dB | FEHLER (Lücke 3: −4,1) | **OK** (max −2,7) |
| Entwickler: Raumton Farbe ±4 dB | [2,1, 4,8, 6,3, 2,3, 6,7] | [2,1, 4,8, 6,3, 2,3, 6,7] (unverändert, FEHLER; mit {ton: 30} [1,7, 4,2, 6,2, 2,3, 5,9]) |
| Prüfer-Kern Klicks B@44 / C@48 | 19 / 20, fehl 0, bitgleich | 19 / 20, fehl 0, bitgleich |
| Prüfer-Kern Raumton Farbe C@48 / C@44 | [3,3, 3,5] / [3,8, 1,8] | [3,3, 3,5] / [3,8, 1,8] (OK, unverändert; mit {ton: 30} [3,0, 1,4] / [2,5, 1,9]) |
| Prüfer-Kern Raumton Pegel C@48 / C@44 | [0,3, −1,9] / [0,3, −1,8] | [2,3, 0,1] / [2,3, 0,2] |
| Prüfer-Kern gesamt (kern.mjs) | 56/60 | **56/60** (gleiche 4 FEHLER: „5 Lücken“ C48/C44/B48 – Prüfer findet nur 2/0 Pausen; sauberer A@48 Plopps) |
| Entwickler-Test gesamt (einzeln, A/B, Last 5–7) | 76/83 | **80/83** (offen: Klicks A 17/20, Raumton-Farbe, App-Worker 3-min-Zeit – auch Basis FEHLER) |
| 3-min-Kette Node (tm.mjs, abwechselnd, Median je Lauf) | 5762 / 6038 ms | 5931 / 6320 ms (+3…+5 %); Entwickler-Test 5184 → 5228 ms; Prüfer-Kern ×3 19,7 s (OK) |
| Abnahme kern2 gesamt / Klicks | 41/62; B@48 18/20, fehl 0 | 41/62; B@48 19/20, fehl 1 (≤ 1 erlaubt; auch ohne BIG) |
| Abnahme kern3 (Raumton v2) gesamt / Pegel / Farbe | 29/50; 14/24; 8/24 | 29/50; 14/24 (C näher an 0); 8/24 |
| Abnahme kern2 Raumton v1 Pegel / Farbe im Ziel | 9/28; 9/28 | **14/28**; 9/28 |

Pflicht (Endfassung md5 ec3ca89fdc4baf2f9fbf9b0e3479f6a5): topdefs „Skripte 26, Namen 7918, doppelt 0, Syntaxfehler 0“, dupkeys „0 doppelte Schlüssel“,
smoke errors [], „MS 2000“ 1×, „^  live: true,“ 1×, VERSION '4.73.0', außerhalb des VOXR1-Blocks bitgleich zu basis.html.
Regression: vx1 61/61, vx2 14/14, vx3 15/15, chr2 82/82 (ALLE OK).
Tempo: die erste Endfassung rechnete bei starken Klicks die LSAR doppelt (+5…+14 %); behoben (Entscheidung vor der LSAR), Ausgabe bitgleich
(3-min-Kette FNV 679d4930 vor/nach dem Fix). Rest-Kosten +3…+5 % (größere Lücken in der LSAR, Tonal-Prüfung der Raumton-Fenster).

## Abwägungen (gemessen, verworfen)
- Nachbar-Fenster der Erkennung 18–22 ms statt 25 ms: A 17 gefunden, aber neue Fehlalarme (A 1, B 1–3) → verworfen, stattdessen BIG.
- Spanne auch für lange Funde verlängern: C bekam im 2. Durchgang eine neue Stelle (7,164 s) → nur Funde ≤ 3 ms.
- Schwelle 6 dB statt 4,8 dB: B bleibt 3,2 dB; 3 dB (2×): B −0,1 dB, aber mehr Interpolation über Gesang. Gewählt 4,8 dB.
  Preis (Fassung ec3ca89f): der Klick-Abzug (Fehler gegen den sauberen Take, **höher = besser**) **sank** in B (Median 4,3 → 3,7 dB) und bei vielen
  Prüfer-Klicks (z. B. C48 #15 8,6 → 1,4 dB) – also **klangtreuer schlechter**, dort wurde sauberer Höhen-Inhalt mitersetzt. Behoben in VOXR1F-P
  (siehe „Prüfung“): Verlängerung nur noch in rauschartiger Umgebung, Bezug Mittel statt Median.
- Ganzes Band per LSAR ersetzen (Klick in Pause): A 9,4 dB → verworfen; Tiefband-LSAR griff bei 6,844 s nicht (Tiefband nur 2× über der Umgebung) → 700-Hz-Grenze.
- Raumton: Leistungsmittel der rauschartigen Fenster (Take A Farbe Lücke 5 4,3, aber Prüfer C 5,8/6,5 – bricht den Prüfer-Kern), gelernter Raumton
  (alle 5,5–10 dB), nur 30–50 ms daneben (Lücke 1 4,7), Pegel bis +3 dB (Prüfer C +3,3) → verworfen.

## Haken
Keine neuen Haken. Alle Änderungen in `vr1Make` (VOXR1-Block): `clickScan` (BIG), neue Funktion `clickSpan`, `click`, `room`.
Nach der Prüfung (VOXR1F-P): zusätzlich `lsar` (Band-Cholesky, bitgleich) – ebenfalls im VOXR1-Block, weiterhin kein Haken, außerhalb des Blocks bitgleich zu basis.html.

## Offen
- Klicks Take A 17/20: drei Klicks auf gesungenen Vokalen (1,9–6,8 dB über der Umgebung). Ansatz: Puls-synchroner Vergleich (Spitze gegen die Spitzen
  eine Periode davor/danach) statt „zweitgrößter Nachbar“.
- Raumton-Farbe Take A Lücken 2/3/5 (4,8 / 6,3 / 6,7 dB): das Original hat dort mehr Höhen als jede Nachbarschaft; ohne eine Annahme „Pausen-Mitte
  heller“ nicht erreichbar (wäre auf den Test zugeschnitten). Die Fenster-Wahl ({ton: 30}) half dort und im Prüfer-Kern, schadete aber kern2
  (B/A48) – bleibt als Schalter für einen späteren Versuch (z. B. nur wählen, wenn der Nahbereich rauschartig UND leiser als die Lücke ist).
- Nach der Prüfung: Überstand Take B 3,2 dB (= basis) an einer Stelle, die schon im sauberen Take 4,6 dB herausragt – nur mit Klangverlust
  an anderen Klicks zu drücken (siehe „Prüfung“). Raumton-Zuschlag +2 dB lässt eine schon falsche Lücke (kern2 A@48 10,73 s) 2 dB schlechter.
- Klick-Füllung zu leise in den Höhen (Rauschen in Nachbar-Farbe ergänzen) nicht gebaut: senkt den Überstand nicht und erhöht den Fehler gegen sauber.

## Endlauf (Kette 3, Endfassung md5 ec3ca89fdc4baf2f9fbf9b0e3479f6a5, Last 6,5 → 11,8)
kern 55/60 – die Inhalts-Prüfungen gleich wie Basis (56/60), zusätzlich FEHLER nur die 3-min-Zeit (Median 13,0 s bei Last ≈ 10–12; derselbe Rechenweg
bestand in Kette 2 mit 19,7 s ×3 und im A/B gegen Basis +3…+5 %). dev 78/83 (Zeit-Prüfungen unter Last; einzeln bei Last 5–7: 80/83 gegen Basis 76/83).
smoke errors [], vx1 61/61, vx2 14/14, vx3 15/15, chr2 82/82. Die 3-min-Ausgabe ist mit Kette 2 bitgleich (FNV 679d4930).

## Prüfung (Befunde des unabhängigen Prüfers zu ec3ca89f → Nachbesserung VOXR1F-P, 17:12–)
Sicherungen: index.vor-pruef.html (= ec3ca89f), index.vor-lsar.html, index.vor-k4.html, index.vor-med.html. Werkzeug: `w2/abzug.mjs` (Klick-Abzug A/B aus den
INFO-Zeilen; gibt für ec3ca89f genau die Prüfer-Zählung 22 schlechter / 7 besser wieder). Änderungen nur im VOXR1-Block, Kennung `VOXR1F-P`, kein Haken.

Was geändert wurde:
1. `clickSpan`: Verlängerung nur in **rauschartiger** Umgebung (Mittel der 0,25-ms-Rahmen ≤ 2× Median; über Gesang ist das Mittel durch die
   Stimmlippen-Pulse viel größer) – sonst alte Spanne **ohne** Deckel und ohne 700-Hz-Grenze (wie basis). `{nz: 0}` = ohne Prüfung.
2. Bezug für Ausklang-Schwelle, Deckel und 700-Hz-Entscheidung = **Mittel** der Umgebung statt Median (`{ref: 0}` alt). Der Median-Bezug war die Ursache
   des „Ausfalls“ bei B@48 2,745 s: Deckel 2× Median ≪ mittlere Energie gepulster Höhen → Füllung weit unter der Nachbarschaft.
3. Ausklang-Schwelle 4× (6 dB) über dem Mittel statt 3× über dem Median (`spanK`).
4. BIG (Erkennung): nur wenn die Rahmen-Spitzen ±12 ms rauschartig sind (Mittel ≤ 1,2× Median, `{bq: 0}` alt). Take A 6,844 s (Pause) bleibt gefunden.
5. Tempo: `lsar` mit Band-Cholesky (Normalmatrix ist ein Band der Halbbreite p): nur Nullen ausgelassen, gleiche Summen in gleicher Reihenfolge →
   **bitgleich** (3-min-Kette FNV vor/nach gleich; basis + nur Band-LSAR = basis a3cf361; Schnelltest basis gleich), Aufwand m·p² statt m³.
   Dazu: Umgebungs-Median im Klick-Test nur einmal rechnen (bitgleich, FNV 88e05011).

| Befund (Schwere) | Ergebnis | Zahl (basis → ec3ca89f → Endfassung) |
|---|---|---|
| 1 BIG-Fund kern2 B@48 2,7448 s schädlich repariert (mittel) | **behoben** | Abzug 0 → −8,8 → **0** (Stelle wird wie in basis nicht angefasst; B@48 18 → 19 → 18/20 gefunden – die Zählverbesserung fällt weg, weil sie Klang kostete). Mit Bezug Mittel allein wäre sie −6,4 dB geblieben, daher zusätzlich die BIG-Prüfung. |
| 2 Klangtreue der Reparatur schlechter (mittel) | **behoben** | Klick-Abzug (höher = besser) kern + kern2: schlechter > 1 dB / besser 22 / 7 → **1 / 0** (übrig: kern2 B@48 #12 −1,0 → −2,2, war schon in basis negativ). Mittel je Take: kern B44 8,85 → 8,34 → **8,85**, C48 9,51 → 8,62 → **9,50**, kern2 B@44 9,29 → 9,06 → **9,29**, B@48 5,00 → 4,37 → **4,93**, C@44 6,89 → 6,50 → **6,89**, C@48 5,82 → 5,76 → **5,82**. Entwickler-Test Abzug-Median A/B/C 10,9/4,3/6,9 → 13,2/3,7/6,9 → **13,2/4,2/6,9**. |
| 3 Neuer Fehltreffer kern2 B@48 4,1027 s (mittel) | **behoben** | fehl [] → [4,1027] → **[]** |
| 4 Tempo +4…+9 %, Klick-Schritt +30 % (mittel) | **behoben** | slice.mjs (Klick-Schritt, beide Reihenfolgen, Median je Lauf): 1602 vs 1233 ms (+30 %) → **1253/1273 vs 1343/1175 ms (−7…+8 %, Rauschen)**; Kette 4008 vs 3577 → **3589/3451 vs 3602/3631 ms**; tm.mjs 3-min (wie Prüfer-Kern): **6429/6387 vs 6218/6204 ms (+3 %, Last 5,7)**. Klicks in der 3-min-Kette 231 → **226 = basis**. |
| 5 Raumton +2 dB verschlechtert schlechtesten Fall (klein) | **abgewiesen (gemessen)** | up 2: kern2 Pegel im Ziel 9 → **14/28**, schlechteste Lücke A@48 10,73 s 4,6 → **6,6 dB** (war schon außerhalb), Entwickler Lücke 3 −4,1 → −2,1 (OK). up 1 (Prüfer-Vorschlag): kern2 12/28, A@48 5,6 dB, Entwickler −3,1 (**FEHLER**). up 1,5: Entwickler −2,6. → up 2 bleibt; schlechtester Fall in der Messtabelle genannt. |
| 6 Irreführende Richtung „sinkt“ (klein) | **behoben** | NOTES (Abwägungen, Messtabelle): „Klick-Abzug (höher = besser) sank → klangtreuer schlechter“. |

Preis / Abwägung (gemessen):
- **Ziel 2 Take B wieder verfehlt:** Überstand B 0,5 → **3,2 dB** (= basis). Die Stelle (B 0,809 s, Klick auf tonalem Abschnitt) ragt schon im
  **sauberen** Take 4,6 dB aus ihrer Umgebung; 0,5 dB ging nur mit Median-Bezug, und genau der kostete in kern2 Klangtreue (B44 #5 12 → 8,8,
  #17 8,5 → 1,3, B48 #4 10,2 → 5,7, #17 5,8 → 2,1 dB). Varianten: nz 1,5 (Median) B 3,2 / A-Abzug 10,9; spanK 1,5 (Mittel) B −0,1, aber B-Abzug 3,7.
  Take A bleibt 2,6 dB (OK), C 1,2 dB.
- Gefunden Take A bleibt 17/20 (BIG-Fund 6,844 s bleibt; Ziel ≥ 18 weiter verfehlt).
- Längere Spanne in rauschartiger Umgebung: Rahmen > 6 dB über dem Mittel; die Reste-Kosten liegen bei 1 Klick (kern2 B@48 #12).

Messtabelle Endfassung (Befund-Spalte = ec3ca89f):
| Messung | basis | ec3ca89f | Endfassung |
|---|---|---|---|
| Entwickler Klicks A gefunden / Überstand A·B·C | 16; 7,5/3,2/2,9 | 17; 2,6/0,5/1,2 | **17; 2,6/3,2/1,2** |
| Entwickler Klicks neue Fehlalarme A/B/C | 0/0/0 | 0/0/0 | **0/0/0** |
| Prüfer-Kern (kern.mjs) | 56/60 | 56/60 | siehe Endlauf |
| kern2 / Klicks B@48 / fehl B@48 | 41/62; 18; [] | 41/62; 19; [4,1027] | **41/62; 18; []** |
| kern3 | 29/50 | 29/50 | **29/50** |
| Raumton Entwickler Pegel / schlechteste kern2-Lücke | FEHLER (−4,1) / 4,6 | OK / 6,6 | **OK (−2,1) / 6,6** |
