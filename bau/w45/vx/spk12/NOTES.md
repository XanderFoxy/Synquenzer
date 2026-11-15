# SPK12 – Werkzeugkasten Auswahl (Spektral) · Teil 1/3 (Plan-Schritte 1–3) + Teil 2/3 (4–6) + Teil 3/3 (7–9)

Bau: `python3 bau.py` = `basis.html` (Kandidat 4.68.0, unverändert) + `spk12-block.js` direkt nach `/* SPK11-END */`
+ 18 Haken-Zeilen (Teil 1/2: 16, Teil 3: +2, siehe unten) „SPK12“ (je eine **neue** Zeile mit typeof-Schutz; keine vorhandene Zeile umgeschrieben).
VERSION unverändert 4.68.0. Ein Block `/* SPK12-BEGIN */ … /* SPK12-END */` (Teil 1: 445 Zeilen, mit Teil 2: 751 Zeilen). diff Basis → Paket: 0 entfernte, 767 neue Zeilen (751 Block + 16 Haken).

## Haken-Liste (Anker → neue Zeile)
| # | Stelle | Zweck |
|---|---|---|
| 1 | Kern `selFn(d, sel)` 1. Zeile | `spk12SelFn(d, sel, selFn)` – nur wenn die Auswahl `op` −/∩, `inv` oder `wand` enthält, sonst null → alter Weg unverändert |
| 2 | Kern vor `return {on, stft, …, Z2}` | `spk12DspMake(Z2, {selFn, specInfo, specChunk, get, put})` → Ops `spk12zauber`, `spk12mask`, `spk12view` |
| 3 | `spk8WUrl(src, u)` 1. Zeile | `src += spk12SelFn + spk12Ras + spk12DspMake` (Text in den Spektral-Worker; Parameter, nicht die const-Zeile) |
| 4 | `spk1Build` nach spk2Pane | `spk12Pane` (Leiste Neu │ + │ − │ ∩ · Auswahl ▾ vorn in der Werkzeug-Optionsleiste; Toleranz/Grenze für Zauberstab; Halten auf Rechteck) |
| 5–6 | `spk1OvDraw` (nach 1. Zeile / nach `x.setLineDash([])`) | Ergebnis-Fläche aus dem Kern + Rand-Griffe |
| 7 | `spk1Gest` pointerdown | 2. Finger, während der 1. am Rand-Griff liegt → Weichheit (statt Zoom) |
| 8–11 | `spk1ToolDown/Move/Up` | Griff-Erkennung, Ziehen, Ende (ein ↶), Zauberstab-Tipp |
| 12 | `spk1SelDone` 1. Zeile | Kombinier-Modus ordnet die neue Form ein (+ / − / ∩) |
| 13 | `spk1ToolSet` Ende | Rechteck/Zauberstab-Platz, Hinweistext |
| 14 | `spk1UndoBtns` | ↶/↷ auch für Auswahl-Schritte freigeben |
| 15 | `spk1UndoRedo` | Auswahl-Schritt zuerst, solange danach keine Ebenen-Aktion kam |
| 16 | `spk1Tap` 1. Zeile | Knöpfe der neuen Leiste; Tipp nach Halten schlucken |

## Entscheidungen
- **Mengen-Rechnung (bit-genau):** Formen bekommen `op: 'sub' | 'and'` (ohne = dazu). Der Kern rechnet der Reihe nach in Uint8:
  dazu = max(a, b), ab = min(a, 255 − b), Schnitt = min(a, b), Umkehren = 255 − w, nur Frequenzen = im Zeitbereich 255 − w, sonst 0.
  Aufeinanderfolgende alte Formen ohne op bleiben **ein** Aufruf des alten selFn (gleiche Gewichte wie bisher, Radierer wie gehabt).
  Radierer-Pinsel im neuen Weg = Form mit op 'sub'.
- **Bedienung im vorhandenen Stil:** Kombinier-Modus als 4er-Zeile vorn in der vorhandenen Werkzeug-Optionsleiste (`.spk1-op`, scrollt
  waagrecht wie bisher), daneben „Auswahl ▾“ (Klappfenster wie „In Ebene ▾“). Die Aktionszeile der Auswahl (3×2 Knöpfe) ist voll –
  Umkehren/Wiederherstellen deshalb im Klappfenster „Auswahl ▾“ (sonst hätte sich die Höhe der Aktionszeile geändert).
- **Zauberstab** als Alternative auf dem Rechteck-Platz: Halten (480 ms) öffnet die Liste Rechteck │ Zauberstab, der Knopf zeigt danach
  das gewählte Werkzeug (Plan §5 „Halten auf ein Werkzeug öffnet die Liste“). Zusätzlich im Klappfenster „Auswahl ▾ → Zauberstab“.
- **Zauberstab-Kern:** Flood-Fill (4er-Nachbarn) im dB-Raster der Anzeige (Stücke `spk:<id>:v<N>:<ci>`, 984 Zeilen, Spalten Hop N/8),
  Start rastet auf den hellsten Punkt ±6 Zeilen; Bereich = zusammenhängend ≥ Startwert − Toleranz (dB). Zeitgrenze ± `lim` s
  (Standard 5). Stücke-Zwischenspeicher im Worker (6). Ergebnis = Läufe je Spalte (`cols`), im Kern als Raster mit Wachsen/Schrumpfen
  (binär, Zeilen und Spalten getrennt, gleitendes Fenster) und Weichheit (Kastenfilter); Raster-Speicher je Form-Schlüssel (6).
- **Toleranz/Grenze-Regler** rechnen den letzten Zauberstab neu (gleiche Stelle, gleicher op), ohne neuen ↶-Schritt.
- **Rand-Griffe** nur für Rechteck/Zeit/Frequenz/Harmonische/Zauberstab (nicht Pinsel – Malen am Rand soll malen). Griff-Zonen um die
  Balken (±36 px entlang, ±16 px quer) und Mitte (Radius 22) – sonst beginnt am Rand eine neue Form (Test hatte das gezeigt).
  Ein einzelnes Rechteck/Zeit/Frequenz: Rand ziehen bewegt nur diesen Rand; sonst Wachsen/Schrumpfen der ganzen Auswahl
  (abgezogene Formen und Formen vor einem Umkehren schrumpfen dabei – Dualität). Zwei Finger am Rand: auseinander = weicher
  (Schritte 0,25 je 30 px). Mitte ziehen = Form verschieben (Zeit und Tonhöhe), nicht den Klang.
- **↶ je Aktion:** eigener Stapel für Auswahl-Schritte (40); jeder Eintrag merkt den Undo-Stand des Kerns (nu|nr|Name). ↶/↷ nimmt den
  Auswahl-Schritt nur, wenn seitdem keine Ebenen-Aktion kam – sonst wie bisher den Kern-Schritt. Normales Ziehen im Modus „Neu“
  bleibt ohne ↶-Eintrag (wie vor SPK12).
- **Anzeige:** Bei − / ∩ / Umkehren / Zauberstab zeichnet die alte Overlay-Schleife die Formen nicht (Auswahl während des Zeichnens
  kurz ausgeblendet, danach sofort zurück), stattdessen die Ergebnis-Fläche aus dem Kern (Raster 2 px, Rand hell), Anfrage nur bei
  geänderter Ansicht/Auswahl, immer nur eine gleichzeitig. Reine alte Auswahl: Zeichnung wie bisher + Griffe.
- „Wiederherstellen“ = die zuletzt verworfene oder ersetzte Auswahl (Umschalten: nochmal tippen holt die andere zurück).
- Abbruch (pointercancel) mitten im Griff-Zug stellt die Form wie vorher her (Listener auf der Fläche, kein Haken in spk1ToolCancel).

## Messungen (spk12-test.mjs, alle 3 Größen: 98 OK / 0 FEHLER, `spk12-test.out` / `spk12-test.json`)
- Bit-genau (Kern-Masken, Base-Raster, weiche Kanten dabei): A∪B, A−B, A∩B mit Rechteck, Pinsel und Zauberstab, ¬A,
  nur-Frequenzen-umgekehrt, (A∪B)−P∩Z: je **0** Abweichungen (z. B. A−B 3 446 Zellen, 476 weich). Zauberstab wachsen ⊇,
  schrumpfen ⊆, weich hat Zwischenwerte.
- Touch: Rechteck → „+“ → zweites → „−“ → drittes = bit-genau max/min; ↶ → 2 Formen, ↷ → 3.
- Zauberstab, 3 min Audio (440 Hz + rosa Rauschen −20 dB), Tipp bei 90 s: Ton-Energie in der Maske **99,9 %**, Rauschfläche **0 %**
  (Base-Raster ± 5 s). Antwort Tipp → Auswahl **21–36 ms** (Kern 12–35 ms inkl. Laden der Stücke 5–32 ms) – Ziel < 150 ms.
- Hauptfaden: keine Long Task > 50 ms während Zauberstab/Griffe. Overlay-Zeichnen beim Rand-Ziehen p95 0,2–0,3 ms, max 1,1 ms;
  Frame-Abstand p95 16,8 ms (Ziel ≤ 16 ms je Bild – Rechenzeit, nicht der 60-Hz-Takt).
- Layout: Knöpfe Neu/+/−/∩ 44 × 50 (Trefferfläche mit ::after), „Auswahl ▾“ 75 × 50; Leiste und Klappfenster im Bild in allen 3 Größen,
  Klappfenster-Knöpfe ≥ 44 px.
- In Ebene mit Zauberstab-Auswahl: Ebene bekommt am Ton 255, eine Oktave+ darüber 0.
- Guide „Wo finde ich …?“ Eintrag `spk12`. Konsole ohne Fehler.

## Pflicht
topdefs 26 / 7615 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× ·
VERSION 4.68.0 unverändert · keine Marken-/Produktnamen (0 im Paket) · keine Emojis.
Regression (reg.sh → reg.log, Ausgaben in reg/): spk6 ALLES OK · spk5 ALLES OK 24 · spk1 1 FEHLER verfeinern-verbessert-ziel (= Basis) · spk8-seite 14/0 · spk11-test 38/3 (nur drums-auf-kit = bekannt offen in 4.68).

## Teil 2/3 (Plan-Schritte 4–6) – Transient, Ellipse, Lasso, Obertöne-Häkchen/Auto, folgt dem Ton
### Haken (Teil 2 ändert nur eigene SPK12-Zeilen, keine Basis-Zeile)
| # | Stelle | Änderung |
|---|---|---|
| 3 | `spk8WUrl` | Text in den Worker jetzt `[spk12SelFn, spk12Ras, spk12Fft, spk12Win, spk12Mag, spk12K2, spk12DspMake]` |
| 9 | `spk1ToolMove` | Bedingung entfällt: `spk12Move` entscheidet selbst (Griffe, Zauberstab, Ellipse, Lasso, Transient), sonst `false` → alter Weg |
| 11 | `spk1ToolUp` | statt nur Zauberstab: `spk12Up2` (Zauberstab-Tipp, Transient, zu kleines Lasso); Ellipse/Lasso laufen danach über den alten Weg `U.sel = [G.shape]; spk1SelDone` |

### Entscheidungen
- **Werkzeuge als Alternativen in der Werkzeugzeile (Plan §5 Bedienung):** Rechteck halten → Rechteck │ Ellipse │ Lasso │ Zauberstab,
  **Zeit halten → Zeit │ Transient** (Transient ist ein Zeit-Werkzeug). Der Knopf zeigt danach das gewählte Werkzeug (wie Zauberstab in Teil 1).
  Zusätzlich „Auswahl ▾ → Werkzeug“ (alle fünf). Kombinier-Modus Neu/+/−/∩ gilt für alle neuen Formen.
- **Ellipse** `{art:'ell', t0,t1,f0,f1,kt,kf}`: Ellipse im Raum Zeit × Cent, weiche Kante über den Radius (gleiche Kante-Regel wie Rechteck).
  **Lasso** `{art:'lasso', pts:[[t,f]…], Umriss t0…f1, kt,kf}`: Vieleck in Zeit × Cent; Kern schneidet je Rahmen (senkrecht) und je Bin
  (waagrecht) und speichert die Schnitte → harte Kante = gerade/ungerade-Regel, weiche Kante = min(Rampe Tonhöhe, Rampe Zeit).
  Beide bekommen Rand-Griffe; Lasso wächst vom Schwerpunkt weg. Beim Ziehen zeichnet SPK12 Ellipse/Lasso selbst (gestrichelt wie das Rechteck).
- **Transient** (Spektral-Fluss im Worker): STFT 1024/256 (5,8 ms), Pegel-bezogene Log-Verdichtung `20·log10(1 + γ·|X|)` (γ = 100/RMS),
  Fluss = Mittel der positiven Zunahme gegen den Rahmen 2 davor mit Max-Filter ±1 Bin (Vibrato/Pad zählen kaum), nur ab **Höhengrenze**
  (Regler „Höhen“ ab 20…5000 Hz, Standard 120 Hz). Spitze = Maximum ±5 Rahmen, über örtlichem Mittel (−100…+70 ms) + Schwelle
  (Regler „Empfindl.“ 1…10 → 6…0,6), Mindestabstand 46 ms. Tipp = nächster Schlag ±0,2 s, Ziehen = alle im Bereich.
  Maske je Schlag auf dem Base-Raster: Rahmen −1…+Länge (Regler 40…300 ms, Standard 120), Anteil über dem Grund vor dem Schlag
  (Minimum der Rahmen −5…−2, je Bin geglättet): 3 dB → 0, 12 dB → 255 → das stehende Pad bleibt draußen. Schlag-Marken oben am Rand.
  Regler rechnen den letzten Transient ohne neuen ↶-Schritt neu.
- **Obertöne** (Werkzeug Harmonische → „Obertöne ▾“ in der Optionsleiste): Häkchen je Rang 1…K (Knöpfe 44 × 44), Alle │ Ungerade │
  Gerade │ Auto. **Master-Rang = vorhandener Regler „Obertöne“** (K, höchster Rang) – nicht doppelt gebaut. Form bekommt `hm` (Liste der
  angehakten Ränge); der Kern rechnet dann wie `selRaster` (gleiche Gewichte), nur ohne die abgehakten Ränge – ohne `hm` bleibt der
  alte Weg. Gemerkte Häkchen gelten auch für die nächste Harmonische. **Auto** (Worker): je Rang Spitze ±3 % gegen den Median
  zwischen den Rängen, gemittelt über 16 Punkte der Spur; Rang zählt bei ≥ 12 dB über dem Grund und höchstens 50 dB unter dem
  stärksten Rang → setzt `hm` und K (Regler wird mitgestellt); bleibt an für neue Harmonische, bis Alle/Ungerade/Gerade gewählt wird.
  Jede Häkchen-Aktion = ein ↶.
- **Folgt dem Ton** (Auswahl ▾ → „Folgt dem Ton“ / „Folgt nicht mehr“): Worker sucht im Umriss der Auswahl die stärkste deutliche
  Spitze (≥ 10 dB über der Nachbarschaft) als Bezug und verfolgt sie vor und zurück (Hop 512, ±80 Cent je Schritt). Unsichere Rahmen
  (Spitze < −30 dB unter Bezug oder < 12 dB Abstand zur Nachbarschaft) behalten die **letzte gute Stelle** (Rücksprung statt
  Abdriften), danach geht es dort weiter. Form `{art:'fol', src:[alte Auswahl], cur:[[t, r]…]}`: im Kern wird die Quell-Auswahl je
  Rahmen um r(t) = f(t)/f_Bezug verschoben (Bin k ← k / r). Ein ↶; „Folgt nicht mehr“ holt die Quell-Auswahl zurück.
- Ellipse/Lasso/Transient/folgt/Obertöne-mit-Häkchen laufen im Kern über `spk12K2` (Zwischenspeicher 8, Schlüssel + FNV-Prüfsumme des
  Form-Inhalts, weil der alte Regler „Obertöne“ und Griffe Formen an Ort und Stelle ändern); die
  Anzeige zeigt das Ergebnis aus dem Kern (wie Zauberstab). Auswahl ▾ Erweitern/Weicher wirkt nicht auf Transient/folgt (kein Effekt
  statt falscher Effekt).

### Messungen Teil 2 (`spk12-test2.mjs`, alle 3 Größen: 72 OK / 0 FEHLER, `spk12-test2.out` / `spk12-test2.json`; Fotos `fotos/t2-*`)
Testsignal 19 s im Seiten-Kontext: Pad (Akkorde mit 150 ms Anstieg, Wechsel auch im reinen Pad-Teil) + 16 Snare-Schläge 2,0…5,75 s
(Pegel 0,45…1), Ton 220 Hz mit 12 Obertönen, Ton 196 Hz mit 6 Obertönen, Gleitton 330 → 416 Hz mit Vibrato ±40 Cent und
120 ms Rausch-Lücke (Ton aus).
- **Transient** (Touch: Zeit halten → Transient, über 0,2–7,8 s ziehen): **16/16 Treffer, 0 im Pad, 0 falsche**, Abweichung 2–8 ms;
  Maske: Snare-Energie 80 %, Pad-Energie 7,9 %. Kern 106–132 ms für 8 s. Tipp auf einen Schlag → genau dieser (2,995 s); ↶ → wieder 16.
- **Ellipse** (Touch-Ziehen, Kante 30 %): Kern-Maske bit-genau gleich der Formel (0 Abweichungen, 7 945 Zellen, 362 weich).
- **Lasso** (Touch-Umfahren, 31 Punkte, harte Kante): Kern-Maske = Punkt-im-Vieleck: 0 Abweichungen bei 6 362 Zellen.
  Overlay-Zeichnen beim Umfahren p95 0,3 ms, max 0,3–0,6 ms (Ziel ≤ 16 ms).
- **Obertöne „nur ungerade“** (Touch: Harmonische tippen → Obertöne ▾ → Ungerade): Energie der geraden Obertöne in der Maske
  **0,000 %** (Ziel ≤ 1 %), ungerade 98,1 %. Häkchen „3“ per Touch aus → hm ohne 3; ↶ → 3 wieder da.
- **Auto** auf dem 196-Hz-Ton (6 Obertöne): hm = 1…6, K = 6 (Rang 7 liegt 65 dB unter dem stärksten).
- Regler „Obertöne“ (Master-Rang) an einer Harmonischen mit Häkchen: K 16 → 8 nimmt Rang 9 heraus (0), Rang 7 bleibt (255), zurück
  auf 16 → Rang 9 wieder 255 (Kern-Zwischenspeicher hängt am Inhalt der Form, nicht nur am Schlüssel).
- **Folgt dem Ton** (Rechteck 300–365 Hz um den Anfang, Auswahl ▾ → Folgt dem Ton): Ton-Energie in der Maske **42,8 % → 99,7 %**;
  Verfolgung Median 2,3 Cent, in der Rausch-Lücke max 43 Cent (gehalten, 9 Rahmen), danach max 3,9 Cent; 119–140 ms; ↶ → Rechteck.
- Knöpfe: Obertöne ▾ 80 × 50 (Trefferfläche), Häkchen 44 × 44, Folgt dem Ton 106 × 44, Transient-Regler – alles im Bild in allen 3 Größen.
- Hauptfaden: keine Long Task > 50 ms bei den SPK12-Aktionen. (Ein Long Task 52–59 ms kam nur direkt nach dem Ansicht-Sprung, den
  der Test per Skript setzt – alter Zeichenweg der Spektrum-Kacheln, nicht SPK12; im Test ausgenommen und gezählt.)
- Guide-Eintrag `spk12` erweitert (Ellipse, Lasso, Transient, Obertöne ▾, Folgt dem Ton). Konsole ohne Fehler.

## Pflicht Teil 2 (Endstand)
topdefs 26 / 7642 / doppelt 0 / Syntaxfehler 0 (mit NODE_PATH=/opt/node-tools/node_modules) · dupkeys 0 · smoke errors [] (smoke.png) ·
„MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.68.0 unverändert · basis.html = rel-4680 · diff nur Zusätze (767) · keine Marken-/
Produktnamen (einziger Treffer „rx“ = SVG-Attribut der Ellipse) · keine Emojis (✓ als Text-Häkchen wie 79× in der Basis).
spk12-test (Teil 1) mit Teil-2-Bau: 98 OK / 0 FEHLER. Regression (reg.sh → reg.log, Ausgaben in reg/): spk6 ALLES OK · spk5 ALLES OK 24 ·
spk1 1 FEHLER verfeinern-verbessert-ziel (= Basis) · spk8-seite 14/0 · spk11 38/3 (nur drums-auf-kit = bekannt offen in 4.68) – gleich wie Teil 1.

## Teil 3/3 (Plan-Schritte 7–9) – Ähnliches mit Merkmalen + ‹ › Alle, Alle Ebenen abtasten, Auswahl merken, FFT ms / Hz
Bau jetzt **18 Haken** (16 + 2 neue), Block 912 Zeilen, diff Basis → Paket: 0 entfernte, 930 neue Zeilen (912 Block + 18 Haken). Quellen Teil 2 gesichert:
`spk12-block.teil2.js`, `bau.teil2.py`.
### Haken (Teil 3)
| # | Stelle | Zweck |
|---|---|---|
| 2 | Kern vor `return {on, stft, …}` (eigene Zeile geändert) | übergibt zusätzlich `soon, mixOf, block, BLK, tick, harmTrack, similar` an `spk12DspMake` |
| 17 | `spk1Call` 1. Zeile (neu) | `spk12CallSrc(op, a)`: „Ähnliche“ mit Merkmal → Op `spk12aehn`; „Alle Ebenen abtasten“ aus → `s12src` = aktive Ebene (harm → `spk12harm`, aehnlich → `spk12aehnB`); sonst `null` → alter Weg unverändert |
| 18 | `spk1ViewDd` nach dem FFT-Regler (neu) | `spk12FftTxt`: Text „4096 Punkte: 93 ms / 10,8 Hz“, folgt dem Regler (MutationObserver auf die Knopf-Klasse) |

### Entscheidungen
- **Ähnliches mit Merkmalen** (Werkzeug Ähnliche → neue Knöpfe in dessen Optionsleiste: „Merkmale ▾“ │ ‹ │ › │ Alle; die Aktionszeile
  der Auswahl ist voll, siehe Teil 1). Ohne Häkchen läuft „Ähnliche“ **unverändert** über den alten Kern (Haken gibt `null`).
  Mit Häkchen rechnet der Worker je Rahmen (N 4096, Hop 2048 – gleiches Raster wie „Ähnliche“) im Band des Beispiels:
  Pegel (dB), Tonalität (Anteil der Energie in Spitzen ≥ 13 dB über den Nachbarn ±3…6 Bins), Rauschen (spektrale Flachheit),
  Transient (Spektral-Fluss, pegelbezogen log. verdichtet). Wert je Lage = Anwesenheit (Rahmen für Rahmen höchstens ~15 dB leiser als
  das Beispiel, sonst → 0; legt die Lage auf die Hüllkurve) × je angehaktem Merkmal: tonal 1 − |ΔT|/0,35, Rauschen 1 − |ΔSF|/0,25,
  Pegel 1 − |Δ mittlerer Pegel|/10 dB, Transient = gewichtete Jaccard-Ähnlichkeit der Fluss-Folgen. Spitzen/Abstand wie der alte Kern;
  der Regler „Empfindlich“ filtert wie bisher (0,92 − 0,6 · Empf.). Merkmale ändern = Suche mit dem gleichen Beispiel neu (kein ↶,
  Einstellung). Merkmal-Raster je Band zwischengespeichert (4), blockweise mit Pausen (≤ 25 ms am Stück im Worker).
- **‹ › Alle:** Liste = Beispiel + Treffer über der Empfindlichkeit nach Zeit; › vom Gesamtbild aus springt zum nächsten nach dem
  Beispiel, ‹ zum vorigen, rundum. Auswahl = nur dieser Treffer, Beispiel und Treffer bleiben gemerkt; „Alle“ wählt wieder alle.
  **Je Schritt ein ↶** (der Eintrag merkt Beispiel/Treffer/Zeiger, ↶ stellt sie mit her).
- **Regionen-Liste** wird beim Öffnen eines Stücks vorab geholt; ist „Auswahl ▾“ beim Eintreffen offen, baut es sich neu auf.
- ‹ › Alle tragen die Klasse `spk12-an` (gleiches Aussehen wie Neu/+/−/∩), damit Teil-1-Messungen der Kombinier-Leiste unverändert bleiben.
- **Alle Ebenen abtasten** (Auswahl ▾ → Abtasten, Häkchen, Standard an = bisheriges Verhalten): aus → Zauberstab, Transient,
  Obertöne-Auto, Folgt dem Ton, Harmonische, Ähnliche (mit und ohne Merkmal) suchen nur im Klang der **aktiven Ebene**
  (Ebene „Original“ = alles). Der Worker rendert das Ebenen-Signal blockweise (`block` mit Mischung nur dieser Ebene, mono wie
  `d.mid`, Pause alle 25 ms) und hält 2 Stände (Schlüssel = Ebene + Versionen aller Ebenen); Anzeige-Raster für den Zauberstab
  dann nur im Speicher (eigener Schlüssel, nicht in IDB). „In Ebene“ schneidet weiter aus der aktiven Ebene (wie bisher) –
  zusammen ergibt das „im Original suchen, in der Ebene schneiden“ (an) bzw. „in der Ebene suchen und schneiden“ (aus).
  Einstellung bleibt über Stücke hinweg (Sitzung), kein ↶ (wie Neu/+/−/∩).
- **Auswahl merken:** Auswahl ▾ → Gemerkt: „Merken“ legt die ganze Auswahl (alle Formen samt +/−/∩, Weichheit, Zauberstab-Läufe …)
  als Region `{id, name, sel, b, mt}` in `d.meta.s12reg` ab (max. 64) → wird mit den übrigen Meta-Daten gespeichert, exportiert und
  importiert (Stück-Datei/Container). Name automatisch nach der ersten hinzufügenden Form + Nummer („Rechteck 1“, „Zauberstab 2“);
  Zeile = Name · Zeitbereich │ ✕. Antippen lädt (ein ↶), ✕ löscht (ein ↶), Merken ist ein ↶ (↶ nimmt die Region wieder heraus,
  auch im Dokument).
- **FFT-Text** nur als Textzeile unter dem vorhandenen Regler (Plan: „nur Text am vorhandenen Regler“): ms = Fensterlänge N/sr,
  Hz = sr/N.

### Messungen Teil 3 (`spk12-test3.mjs`, Touch über CDP, alle 3 Größen; `spk12-test3.out` / `spk12-test3.json`; Fotos `fotos/t3-*`)
Testsignal 24 s: Töne 440 Hz (5 Obertöne, Anstieg 150 ms) bei 1/3/5/7 s und −12 dB bei 9/11 s, Rausch-Stöße 300–3000 Hz
(Anstieg 250 ms) bei 13…20,5 s, 8 Snare-Schläge bei 2/4/6/8/10/12/22/23 s, Grundrauschen −70 dB. Beispiel-Band 250–3500 Hz.
(Für „Ähnliches“ nennt §5 keine Zahl – Abnahme hier selbst gesetzt: Beispiel + Merkmal → alle der gleichen Art, keine andere.)
**47 OK / 0 FEHLER** (Kern-Prüfungen einmal, Bedienung je Größe):
- **Tonal** (Beispiel Ton 1,0–1,5 s): Treffer 3/5/7/9/11 s (alle 5), 0 Rauschen, 0 Snare, 0 sonst. Kern 130–200 ms für 24 s (inkl. Merkmal-Raster).
- **Tonal + Pegel**: nur 3/5/7 s; die −12-dB-Töne (9/11 s) fallen heraus, 0 andere.
- **Rauschen** (Beispiel Rausch-Stoß 13 s): alle 5 übrigen Stöße (Lage −0,07…−0,06 s), 0 Ton, 0 Snare.
- **Transient** (Beispiel Snare 2,0–2,15 s): alle 7 übrigen Schläge (±0,02 s), 0 Ton, 0 Rauschen (Stöße mit weichem Anstieg).
- **Ohne Häkchen** geht der Aufruf unverändert an den alten Kern (Haken liefert `null`).
- **Touch:** Ähnliche → Merkmale ▾ → Tonal, Beispiel ziehen → 5 Treffer + Beispiel, nur Töne; › → 2,97 s, › → 4,97 s, ‹ → 2,97 s,
  Alle → 6, ↶ → wieder Treffer 2,97 s mit gemerkten Treffern, › danach → 4,97 s.
- Knöpfe Merkmale ▾ 83 × 50, ‹ › Alle 44 × 50 (Trefferfläche), Häkchen im Klappfenster 57–82 × 44 – im Bild in allen 3 Größen.
- **Merken** (Touch: Rechteck − Rechteck, Auswahl ▾ → Merken): Region „Rechteck 1“, Auswahl gleich; Speichern + Schließen + Öffnen
  **identisch** (JSON), Export + Import **identisch**; Laden per Touch nach dem Wiederöffnen: Auswahl gleich, Maske **bit-genau**
  (0 Abweichungen bei 78 195 Zellen, weiche Kante 0,3). ↶ nach Laden → vorige Auswahl; Merken → 2 Regionen, ↶ → 1 (auch im Dokument),
  ↷ → 2. Zeile „Rechteck 1 · 2,5–6,5 s“ 148 × 44, ✕ 44 × 44.
- **Alle Ebenen abtasten** (Ton bei 1 s in Ebene „X“ verschoben): an + aktive Ebene Rest → Zauberstab findet den Ton (414 Zellen);
  aus + Rest → 0 Zellen bei 1 s, 416 bei 3 s; aus + X → 414 bei 1 s, 0 bei 3 s; Ähnliche in X → 0 Treffer; Harmonische bei 3 s:
  in X 0 Punkte, im Rest 22; wieder an → X findet den Ton bei 3 s. Ebenen-Signal 24 s im Worker 0,32–0,57 s (einmal je Ebenen-Stand).
- **FFT-Text:** „4096 Punkte: 93 ms / 10,8 Hz“, nach Tipp auf 8192 → „8192 Punkte: 186 ms / 5,4 Hz“, im Bild.
- Hauptfaden: keine Long Task > 50 ms bei den SPK12-Aktionen; ausgenommen und gezählt: 1–2 nach dem Ansicht-Sprung des Tests bzw. beim
  Neuaufbau der Spektrum-Kacheln nach FFT-Wechsel (alter Weg, 51–68 ms). Konsole ohne Fehler.
- Fotos: `fotos/t3-merkmale-*`, `t3-aehnlich-*`, `t3-merken-*`, `t3-abtasten-*`, `t3-fft-*` (je 3 Größen).

## Pflicht Teil 3 (Endstand)
PFLICHT_T3

## Offen (Teil 3/3 und Rest)
- Teil 3: Regionen haben einen automatischen Namen („Rechteck 1“); Umbenennen per Eingabe fehlt (die Spektral-Seite hat noch kein
  Namensfeld – eigenes kleines Feld wäre sichtbar neu → erst Funk).
- Teil 3: „Alle Ebenen abtasten“ aus rendert die aktive Ebene einmal (Test 24 s: 0,3–0,6 s im Worker); bei 3 min ≈ 3–5 s ohne
  Fortschrittsanzeige (Hauptfaden frei). Noten-Werkzeuge (SPK2 „Überall finden“) und Zerlegen/Verfeinern bleiben beim Original.
- Teil 3: Merkmale wirken nur im Band des Beispiels (Zeit-Beispiel = 20 Hz…16 kHz); „Tonal“ findet auch Töne anderer Höhe im Band
  (gewollt: „ähnliche Art“) – wer gleiche Tonhöhe will, lässt die Häkchen aus (alter Weg = Frequenzbild).
- Teil 3: Ein Long Task beim Umschalten der FFT-Größe (51 ms, Neuaufbau der Spektrum-Kacheln, alter Weg) – im Test ausgenommen und
  gezählt, gehört zur Ladezeit-Liste wie der Ansicht-Sprung.
- Transient über sehr lange Bereiche (3 min ziehen) rechnet im Worker linear (~ 15 ms je Sekunde Audio, also ~ 3 s); Hauptfaden frei,
  aber ohne Fortschrittsanzeige – bei Bedarf blockweise mit Zwischenstand.
- Transient-Maske nutzt das Base-Raster (4096/1024): sehr dichte Schläge (< 4 Rahmen ≈ 93 ms Abstand) teilen sich den Grund-Rahmen.
- „Folgt dem Ton“ verfolgt eine Spitze (Grundton oder stärkster Teilton im Umriss); bei zwei gleich starken Tönen im Umriss gewinnt
  der stärkere. Rand-Griffe sind für Transient/folgt aus (die Form ist kein Kasten).
- Ein Long Task (52–59 ms) direkt nach großen Ansicht-Sprüngen gehört zum alten Kachel-Zeichnen (nicht SPK12) – eigener Punkt für
  die Ladezeit-Liste.
- Transient-Fläche wirkt unruhig (viele kleine Inseln mit hellem Rand, weil die Maske weich und fein ist); ruhiger wäre nur Füllung
  ohne Rand bei Transient – sichtbar anders → erst Funk.
- Die Listen beim Halten (Rechteck/Zeit) werden per Touch bedient (Test tippt sie an), ihre Maße sind nicht eigens gemessen
  (mbtn ≥ 44 px wie im Klappfenster).
- Pinsel in + / − / ∩: Beim Aufsetzen leert der alte Pinsel-Code eine nicht-weiche Auswahl; sie erscheint erst beim Loslassen wieder
  (Ergebnis stimmt, nur während des Malens unsichtbar) – Haken in spk1ToolDown wäre eine Änderung im alten Pinsel-Zweig.
- Wachsen einer kombinierten Auswahl ist parametrisch (je Form, mit Dualität für − und Umkehren), keine echte Dilatation des Ergebnisses.
- Zauberstab-Rand auf einem hellen Ton kaum sichtbar (weiße Fläche auf weißem Grat) – evtl. dunkle Kontur (sichtbar → erst Funk).
- Halten auf Rechteck zeigt keine Markierung am Knopf (Aussehen bewusst unverändert) – Guide und „Auswahl ▾ → Zauberstab“ als Weg.
- iPhone-Messung (Safari, A14) fehlt; Desktop-Werte oben × ~3 lägen weiter unter 150 ms.
- Funk: Paket ist „kurz ankündigen“ – Teil 3 sichtbar neu: „Merkmale ▾ │ ‹ │ › │ Alle“ beim Werkzeug Ähnliche, in Auswahl ▾ die
  Gruppen „Gemerkt“ (Merken, Regionen) und „Abtasten“, Textzeile „… ms / … Hz“ unter dem FFT-Regler. Davor: – sichtbar neu sind die 4er-Zeile + „Auswahl ▾“ in der Werkzeug-Optionsleiste und die Griffe;
  Teil 2: Halten auf Rechteck/Zeit zeigt Ellipse, Lasso, Transient; „Obertöne ▾“ bei Harmonische; „Folgt dem Ton“ in Auswahl ▾;
  kleine Schlag-Marken oben am Rand bei einer Transient-Auswahl.
