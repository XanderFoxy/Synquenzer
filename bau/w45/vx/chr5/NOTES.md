# CHR5 – Formanten bei großen Sprüngen (Fortsetzung CHR4 „2b“) · NOTES

**Ergebnis: nichts eingebaut.** `index.html` = `basis.html` (4.63.0, cmp gleich), kein CHR5-Markerblock, keine Haken. Grund: keiner der
Wege war „messbar besser und nirgends schlechter“; das Ziel (+400 ≤ 6 %, −500 ≤ 5 %) hängt vor allem an der Hülle im Noten-KERN, nicht am Rand.
Nach der Prüfung (Abschnitt „Prüfung“ unten) sind Zahlen, Ursachen und Vorschläge korrigiert; neue Mess-Skripte und ein Test `src/chr5-check.mjs`.

## Zahlen (Basis 4.63.0 = 4.60.0, `src/pruef-vorher.json`)
| Fall | Formant % | Übergang dB | Glätte | Ton ct (altes Maß) |
|---|---|---|---|---|
| weich / hart / natürlich | 2,43 / 2,58 / 2,67 | 3,15 / 4,02 / 3,30 | 1,11 / 1,19 / 1,00 | 1,9 / 2,1 / – |
| Chor +400 / −500 (G2 = G6 Chor-Weg) | 9,25 / 5,99 | 7,08 / 5,90 | 1,34 / 0,45 | 2,3 / 0,9 |

## Wo steckt der Fehler? (20-ms-Raster, `src/split.mjs`, Rahmen-Dateien `tmp/fr-*.txt` aus `fexp.mjs` "fr")
181 Rahmen, davon 46 Rand (±70 ms um Noten-Grenzen) = 11 an Strecken-Rändern + 35 an Noten-Grenzen IN einer Strecke (Legato, überbrücktes „t“), 135 Kern.
Strecken aus `P.curve`: 0,280–1,920 · 2,030–2,780 · 2,830–4,430 s.

| Fall · Hülle | gesamt | Rand (Strecken-Rand + Noten-Grenze) | Kern |
|---|---|---|---|
| +400 linear (heute) | 9,36 | 3,29 (1,08 + 2,21) | **6,07** |
| +400 Orakel (wahre Hülle) | 5,71 | 2,91 (1,06 + 1,85) | 2,80 |
| −500 linear (heute) | 6,01 | 1,87 (0,64 + 1,23) | **4,14** |
| −500 Orakel | 4,01 | 1,59 (0,67 + 0,92) | 2,41 |

- Obergrenzen +400: Rand perfekt (Orakel) 8,98 · Rand = 0 6,07 · Kern perfekt 6,09. −500: Rand perfekt 5,73 · Rand = 0 4,14 · Kern perfekt 4,28.
  → Für beide Ziele muss der KERN besser werden; der Rand bringt höchstens −0,38 (+400) bzw. −0,28 (−500) Punkte.
- (Erste Fassung hatte durch 182 statt 181 Rahmen geteilt und 45 Rand-Rahmen gezählt: 9,31 = 3,26 + 6,05 – Aussage gleich.)
- Kern +400: Vokale „o“/„e“, F1 liegt zwischen Teilton 1 und 2 → Band 300–1000 Hz 2–5 dB zu leise, +10…+31 % je Rahmen.
- Kern −500: größter Posten Note 5 „i“ (531 Hz) mit 1,20 von 4,14 Punkten: F1 300 Hz liegt UNTER dem neuen Teilton 1 (398 Hz) – darunter gibt es
  im Original keine Stützstelle (Prüfer, `pruef/vowel.mjs`).
- Rand im Einzelnen (`src/diag.mjs`): an Strecken-Anfängen fehlt die verschobene Stimme (Schutzzone G 15 ms + Blende; 2,87 s: Ziel-Kamm −10 dB,
  Original-Kamm +15 dB), im Legato (0,69 s) ist der Original-Abzug sauber, aber die verschobene Hülle im Gleitton 6 dB zu leise.

## Versuche (alle verworfen, Skripte in `src/`)
| Weg | +400 F | −500 F | weich F | hart F (Ton) | Befund |
|---|---|---|---|---|---|
| Basis | 9,25 | 5,99 | 2,43 | 2,58 (2,1 ct) | |
| All-Pol-Hülle (DAP), Teilton-dB statt %: lin 4,78/6,20 dB | 4,62…6,9 dB | 6,7…8,4 dB | – | – | zu wenig Stützstellen, Pole falsch (`dap.mjs`, `pdbdap.mjs`) |
| G 3 ms allein (Prüfer) | 9,07 | 6,00 | 2,45 | 2,80 (3,0 ct) | Übergang 6,14/5,08 dB besser, hart schlechter |
| Strecken-Rand-Rahmen nehmen Hüllen-FORM des Kerns (EZ 30 ms), G 15 | 9,27 | 5,99 | 2,46 | 2,59 | wirkungslos (`fexp5.mjs`) – wirkt nur an Strecken-Rändern, nicht an Noten-Grenzen in Strecken |
| dasselbe + G 3 ms | 9,10 | 5,98 | 2,48 | 2,83 (3,0 ct) | gegen „G 3 ms allein“ leicht SCHLECHTER |
| + EZ 20 + Rampe 20 | 9,14 | 6,03 | 2,45 | 2,77, Gl 1,24 | hart schlechter |
| Hülle unter T1 mit Steigung T1→T2 (±6/±10 dB) | – | **6,17…6,67** | – | – | −500 schlechter (`fexp5b.mjs`) |
| G 3 ms nur bei Verschiebung ≥ 150 ct (Versatz 12 ms sonst) | 9,07 | 6,00 | **2,60** | 2,80 | Modell-Raster verschoben (`fexp5c.mjs`) |
| Hülle Betrag-linear (β 0,5/1) | 9,06/9,00 | 6,06/**6,24** | – | – | −500 schlechter (`fexp5d.mjs`) |
| G 5 ms (altes Modell-Raster, kleinerer Rand) | 9,09 | 5,83 | 2,36 | 2,65 (**2,8 ct**) | Ü 6,39/5,23 dB besser, aber hart Ton schlechter, −500 Knackser 0 → **1** (`hartursache.mjs`) |

### Woher kommt der hart-Anstieg bei kleinem G? (korrigiert, `src/hartursache.mjs`, `tmp/hartursache*.txt`)
Die erste Fassung nannte „die hart-Kurve am Noten-Anfang“ als Ursache – das war nicht geprüft und ist so FALSCH. Gemessen:
- Die Schutzzone G legt den Anfang A = Strecken-Anfang + G fest, und die 10-ms-Modellrahmen hängen an A. G 3 ms verschiebt also das Modell-Raster in
  der GANZEN Strecke um 12 ms (≡ 2 ms im 10-ms-Raster). Abtastung G 3…25 ms: hart F 2,54…2,86, weich 2,36…2,79. G 3 / 13 / 23 ms (gleiche
  Raster-Lage) geben alle 2,80…2,86 – die Raster-LAGE ist der große Posten, nicht der Rand.
- Das amtliche Formant-Maß rastert selbst mit 10 ms. Mittel über 4 Mess-Versätze (0 / 2,5 / 5 / 7,5 ms, „rasterfrei“):

  | Variante | hart amtlich | hart rasterfrei | weich amtlich | weich rasterfrei |
  |---|---|---|---|---|
  | Basis G 15 ms | 2,58 | **2,68** | 2,43 | 2,45 |
  | G 3 ms | 2,80 | 2,79 | 2,45 | 2,41 |
  | G 13 ms (Raster wie G 3, Rand wie G 15) | 2,83 | 2,86 | 2,63 | 2,56 |
  | G 5 ms (Raster wie G 15, Rand fast wie G 3) | 2,65 | 2,71 | 2,36 | 2,37 |
  | G 3 ms + hart-Kurve am Rand K 3 | 2,68 | 2,73 | – | – |
  | G 15 ms + K 3 | 2,55 | 2,66 | – | – |

- Zerlegung des amtlichen Anstiegs +0,22 (2,58 → 2,80): ≈ 0,10 Mess-Raster (die Basis liegt im amtlichen Raster günstig), ≈ 0,08 Modell-Raster,
  ≈ 0,03 der zusätzlich verschobene Rand, die hart-Kurve am Rand (K 3) macht rasterfrei nur −0,02…−0,06. Die Prüfer-Probe (Kurve erklärt ≈ die
  Hälfte) stimmt im amtlichen Raster (2,80 → 2,68); rasterfrei ist der Kurven-Anteil klein.
- Folge: Unterschiede im Formant-Maß unter ≈ 0,15 Punkten sind für hart/weich vom Raster nicht zu trennen (die chr2-Grenze hart +0,2 liegt nahe daran).

## Ton-Maß (korrigiert, `src/tonziel.mjs`, `tmp/tonziel-basis.txt`)
Das alte Maß (`measure` → tonRmsCt, aus CHR2/CHR3) vergleicht YIN der Ausgabe mit YIN des IDEALS und zählt nur |Abweichung| < 300 ct. Es sieht deshalb
weder Rahmen, die noch auf der Original-Höhe stehen (bei Sprüngen ≥ 300 ct), noch die −500/−300-Schlussnote (YIN irrt auf dem Ideal eine Oktave
nach oben). Neues Maß „Ziel-Ton“: alle stimmhaften Rahmen, Bezug = YIN des Ideals auf die Oktave der bekannten Ziel-Kurve gebracht (±100 ct), sonst
die Ziel-Kurve selbst; Klassen Treffer (< 50 ct, RMS nur darüber) / unverschoben (≈ −Verschiebung) / Oktave der Ausgabe / ohne Ton / sonst.

| Fall | alt ct (Rahmen) | Ziel-Ton Treffer | RMS ct | unverschoben | Ideal oktavkorrigiert |
|---|---|---|---|---|---|
| hart | 2,1 (682/726) | 92,4 % | 2,5 | – | 0 |
| weich | 1,9 (687/726) | 91,9 % | 1,9 | – | 0 |
| +400 | 2,3 (660/726) | 88,7 % | 1,5 | 7 (1,860–1,870 · 2,700 · 4,355–4,365 s) | 0 |
| −500 | 0,9 (**522**/726) | 89,3 % | **2,7** | 7 (dieselben Rahmen) | 139 |
| +100 / −100 | 11,7 / 9,3 | 90,8 / 90,5 % | 2,9 / 3,0 | 12 / 13 | 0 |
| +200 / −200 | 13,8 / 8,4 | 89,5 / 89,7 % | 2,6 / 2,3 | 13 / 15 | 0 / 14 |
| +300 / −300 | 12,0 / 13,2 | 88,8 / 89,3 % | 1,3 / 3,4 | 11 / 11 | 0 / 139 |

- Die 8–14 ct des alten Maßes bei ±100…300 sind die unverschobenen Strecken-Enden; im neuen Maß stehen sie als Zahl „unverschoben“, das RMS der
  Treffer liegt bei 1,3–3,4 ct. „Ton ±1 ct“ erreicht die Basis in keinem Chor-Fall; −500 ist jetzt messbar (2,7 ct über alle Noten).
- Rest „ohne Ton“ 34–53 und „sonst“ 13–25 Rahmen: Ränder, an denen YIN auf der Ausgabe nichts findet bzw. Gleittöne; der YIN-Boden (Ideal gegen
  Ziel-Kurve) liegt bei 90 % Treffern, für −500/−300 wegen der Oktave bei 71 %.

## Nächster Weg (Vorschlag)
1. **Hüllen-Gedächtnis je Vokal** (nur für +400 sinnvoll, unsichtbar): Rahmen nach Hüllen-Form gruppieren, Teilton-Pegel aller Rahmen einer Gruppe mit
   ANDERER Grundfrequenz als Stützstellen sammeln. Im Prüf-Take (`src/vokale.mjs`): „a“ 330/392/397 Hz, „o“ 400/483 Hz, „e“ 432/330 Hz, „i“ 531 Hz
   (nur 1×). Obergrenze (Prüfer, exakte Pegel): +400 4,88 → 3,29 dB, −500 6,22 → 4,28 dB; CHR4s Hermite mit 4,04 dB brachte für −500 beim Rendern
   nichts (6,00 %) → **für −500 kein Gewinn zu erwarten**.
2. **−500 braucht einen eigenen Weg** (F1 unter dem neuen Teilton 1, „i“ nur einmal): Idee „Vokal-Vorwissen“ (Hüllen-Vorlagen typischer Vokale füllen
   die Hülle unter dem alten Teilton 1, wenn F2/F3 zur Vorlage passen). Nicht gemessen; auf dem synthetischen Take wäre die Probe geschönt (die Stimme
   ist aus genau solchen Vorlagen gebaut) → nur mit echten Aufnahmen prüfbar.
3. **Rand/Übergang:** Modell-Raster von G entkoppeln (Raster bleibt an der alten Lage, nur der Rand wird kleiner = Probe „G 5 ms“): Übergang
   7,08 → 6,39 / 5,90 → 5,23 dB, aber hart Ton 2,1 → 2,8 ct und ein Knackser bei −500 → erst diese beiden lösen. Unsichtbar (keine Bedienung).
   Eine hart-Kurve, die am Strecken-Rand den Noten-Median nimmt (K 2…3), ändert HÖRBAR, wie „hart“ einrastet (Schleifer 20–30 ms nicht
   eingerastet) → **nur als Vorschlag für den Funk (CLAUDE.md Regel 3), nicht einfach bauen**; der Gewinn ist rasterfrei ohnehin klein (−0,02…−0,06).
4. **Ziele und Maße neu festlegen, bevor das nächste Paket die Ziele angeht:** +400 ≤ 6 % liegt nur 0,2 über dem Orakel (5,79 amtlich, 5,71 im
   20-ms-Raster) → Vorschlag: Ziel als Anteil der Lücke linear → Orakel, z. B. halbe Lücke: +400 ≤ 7,5 % (9,25 → 5,79), −500 ≤ 5,0 % (5,99 → 4,08; das alte
   −500-Ziel ist also schon „halbe Lücke“, nur fehlt dafür der Weg); Formant rasterfrei messen (Mittel der
   4 Versätze, `formantAt` in `hartursache.mjs`); Ton mit „Ziel-Ton“ (Treffer-Anteil, RMS der Treffer, Zahl unverschobener Rahmen) statt tonRmsCt.
5. **Einbau-Regel:** Der G6-Chor-Weg (`modelRuns`/`renderMulti`) hat eine eigene Kopie der Strecken-/Schutzzonen-/Raster-Logik (G steht 2× in der
   Datei). Alle Versuche hier änderten nur den G2-Code; ein Einbau muss beide Stellen ändern und mit `chr3-pruef` (Zeilen „Chor-Weg“) G2 = G6 zeigen.

## Tests (index.html = basis.html)
| Prüfung | Ergebnis |
|---|---|
| Pflicht | topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · smoke errors [] (`smoke-nach.png`) · MS 2000 1× · „  live: true,“ 1× · VERSION 4.63.0 · Markenwörter = Basis · keine Marken-/Datensatz-/Produktnamen |
| chr5-check (neu, B1–B8) | ALLE OK (19 Zeilen), 40 s (`reg/chr5-check.txt`) |
| chr2-test (gegen vx/basis2.html) | ALLE OK (82), 112 s (`reg/chr2-nach.txt`; vorher `reg/chr2.txt` 127 s) |
| vx1-test | 61/61, 32 s (`reg/vx1-nach.txt`) |
| spk6-test (gleiche Kopie in `reg/spk6-lauf`) | ALLES OK (26), 33 s (`reg/spk6-nach.txt`) |
| chr3-pruef | `reg/chr3-pruef-nach.json` = `src/pruef-vorher.json` (cmp) |

## Prüfung (Befunde aus PRUEFUNG.md und was daraus wurde)
| # | Befund | Stand | Nachweis |
|---|---|---|---|
| 1 (mittel) | −500 ≤ 5 % nicht untersucht | **behoben** (untersucht): Aufteilung −500 6,01 = 1,87 + 4,14, Orakel 4,01 = 1,59 + 2,41; nur der Kern führt unter 5 %; „i“ (1×, F1 unter T1) ist der größte Posten; Vorschlag 1 hilft −500 nicht, eigener Weg 2 als Idee, Ziele neu (Punkt 4) | `split.mjs`, `vokale.mjs`, chr5-check B1 |
| 2 (mittel) | hart-Ursache nicht geprüft | **behoben**: gemessen – Modell-Raster und Mess-Raster tragen den Anstieg, Rand +0,03, Kurve klein; NOTES korrigiert; Kurven-Änderung als hörbar markiert (Regel 3, nur Funk-Vorschlag) | `hartursache.mjs`, chr5-check B2 |
| 3 (mittel) | Ton-Maß blind für große Sprünge | **behoben** (neues Maß neben dem alten, `tmlib.mjs` unverändert, damit chr2/chr3-Zahlen vergleichbar bleiben): zählt alle 726 Rahmen, findet 7 unverschobene Rahmen (+400) und die −500-Schlussnote | `tonziel.mjs`, chr5-check B3 |
| 4 (leicht) | fexp5 nur an Strecken-Rändern | **behoben** (benannt + beziffert): Noten-Grenzen in Strecken +400 2,21 vs. Strecken-Ränder 1,08; perfekter Rand höchstens −0,38 / −0,28 | `split.mjs`, chr5-check B4 |
| 5 (leicht) | 182 statt 181 Rahmen, 45 statt 46 | **behoben**: 9,36 = 3,29 + 6,07, Orakel 5,71 = 2,91 + 2,80 (NOTES, LOG-Vermerk) | chr5-check B5 |
| 6 (leicht) | LOG-Uhrzeiten ausgedacht | **behoben**: Einträge (0)–Ende nach Dateizeiten korrigiert (alte Zeit vermerkt); Nacharbeit nur mit `date` | LOG.md |
| 7 (leicht) | Tonhöhen ungenau, „i“ fehlt | **behoben**: o 400/483, e 432/330, i 531 Hz (1×) | `vokale.mjs`, chr5-check B7 |
| 8 (leicht) | Versuche nur am G2-Code | **behoben als Regel** (nichts eingebaut, also nichts mitzuändern): Einbau-Regel Punkt 5, Test zählt die 2 Stellen | chr5-check B8 |

Offen: −500 ≤ 5 % hat weiter keinen belegten Weg; +400 ≤ 6 % braucht eine Kern-Hülle fast wie das Orakel; die neuen Ziele und Maße (Punkt 4) muss der
Auftraggeber festlegen.
