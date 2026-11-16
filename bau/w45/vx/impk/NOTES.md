# IMPK – Import/Begleiter-Kleinfehler · Basis 4.76.1 (VERSION bleibt '4.76.1')

Paket: `basis.html` = rel-4761 (md5 e4dc1b9599eef2656308cb990e407f37), `index.html` = Basis + IMPK (md5 c0ac5b118bf3564d08a2c897dc2d5de4). Bau reproduzierbar: `apply.mjs`
(basis.html + `block-tempo.js`, `block-ui.js`, `block-beg.js` → index.html, jede Ersetzung genau einmal).
Test: `node impk-test.mjs <index> <basis>`. Sonden: `lead-ons.mjs` (Einsätze), `tempo-raten.mjs` (Kopie aus imp2b/pruef), `etikett-sonde.mjs`.

## Ist-Messung VORHER (Basis 4.76.1)
1. **Gesang-Tempo** (`lead-ons.mjs`, Lead-Stimme aus chr2-test, Wahrheit 120 BPM): 17 Einsätze, davon **10 mehr als 40 ms daneben** –
   5 liegen −73…−82 ms *vor* dem Ton (= Ende des vorigen Tons), 5 im Ausklang/Vibrato des Schlusstons. Ergebnis 120,54 → Projekt **121**.
   `tempo-raten.txt` (14 Vokal-Melodien 96–140 BPM × 4 Raten): Projekt-Tempo richtig **13/14** (22/44/96 kHz) bzw. **12/14** (48 kHz),
   |Fehler| 0,16–0,20 BPM, |t1| 25–28 ms, Spanne über die Raten bis 0,33 BPM.
2. **Import-Blatt nach ½×** (impk-test B, echte Aufnahme #14): Start „121 oder 60?“ [121* | 60]; nach ½× **„60 oder 60?“ mit zwei gleichen
   Knöpfen, beide markiert** [60* | 60*]; ein Tipp ändert nichts mehr – das erkannte Tempo ist nur noch über „2×“ erreichbar.
3. **Begleiter-Rest** (in 4.76.1 nachgemessen):
   - Klick nach SCHLUSS: **noch vorhanden** – mit Metronom kommt auf der Eins hinter dem Schlusstakt 1 Klick (Schlag 12,00; 120 und 157 BPM).
   - Etikett beim Akkordwechsel: **noch vorhanden**, wenn der Akkord zwischen den Schlägen kommt (Wechsel am Schlag): `etikett-sonde.mjs`
     zählt src „clip“ statt „beg“ auf den Band-Spuren: Auto 2, Akkorde 8, Fläche 2, Arp 4 Töne (je Lauf, mit und ohne laufende Szene);
     bei Wechsel am Takt 0. Wechsel genau auf dem Schlag (impk-test Lauf 1, Fläche) zeigte 0 – deshalb prüft der Test jetzt Wechsel bei 3,3/5,8/7,45/9,9.
   - ● AUTO über einen vorhandenen Song: **noch vorhanden** – zweite Aufnahme über den Song: live 54 Band-Töne in Takt 2–3, der Song spielt
     danach 27 (Basis und neu gleich). Nicht geändert, siehe Offen.

## Ursachen (mit Beleg)
1. Gesang-Weg in `imp1Core.analyse`: `peaks(on, fps)` nimmt jede Spitze der Fluss-Hüllkurve. Am Ende eines Tons (Pegel fällt in 30 ms, Leck
   im 46-ms-Fenster) entsteht eine positive Fluss-Spitze ~70 ms vor dem nächsten Einsatz. Die 80-ms-Sperre (`i - last < fps*.08`) verwirft
   dann den **echten** Einsatz, gezählt wird das Tonende. Beleg: `lead-ons.mjs` – 1,177 s statt 1,25 s (−73 ms), 2,175 statt 2,25, 5,168/5,677/6,176
   (−82/−73/−74 ms); nach dem Filter liegen genau diese Töne bei −4…−7 ms. Die Rayleigh-Raster-Treue wird von den verschobenen Einsätzen
   auf ein leicht schnelleres Raster gezogen (+0,4…0,5 BPM). Die reine Parabel-Verfeinerung (IMP2B-Versuch) half nicht, weil die falschen
   Einsätze 70 ms und nicht Bruchteile eines Rahmens daneben liegen.
2. `imp1Html`: die Vorschläge `r.alt` (½×, 2×) gehören zum **erkannten** Tempo; nach ½× ist das gewählte Tempo selbst ½× → beide Knöpfe 60,
   beide „on“ (|v − c.bpm| < 0,01).
3. Begleiter:
   - Klick: der Metronom-Planer (`t1Clicks`/`tktClickRun`/Schleife im Takt-Planer → `click()`) liegt außerhalb von `beg1Sched`; BEG1 kürzt
     nur das Planfenster der Spuren auf `run.stopB`, der Klick auf `stopB` ist bei 0,1–0,2 s Vorlauf schon geplant, bevor der Stopp-Zeitgeber feuert.
   - Etikett: `applyCarrierChange` sagt neu geplante (Fall `v.start ≥ eff`) bzw. gerade angeschlagene (≤ 120 ms) Töne ab und schlägt sie über
     `spawnClipVoice` neu an – das setzt src „clip“; BEG1 setzt „beg“ nur in `beg1Emit`.
   - ● AUTO über Song: `beg1SongPre` gilt ausdrücklich nur ohne `sr.over` (Aufnahme in einen neuen Song).

## Änderungen (nur in eigenen Blöcken + 3 einzeilige Haken mit „IMPK“)
Diff: +48/−2 Zeilen, +4 440 Byte. `diff basis.html (index ohne IMPK-Blöcke)` = genau die 3 Haken-Zeilen.
- Block 1 `IMPK-BEGIN … IMPK-END` **in imp1Core** (läuft damit auch im Worker, `imp1Core.toString()`), 23 Zeilen: `impkPeaks(o, fps, fe)` =
  `peaks` + (a) Spitze mit fallendem Pegel (Mittel 40 ms danach < ½ × 40 ms davor, aus `fe`), **auf die binnen 100 ms eine stärkere Spitze folgt**,
  ist ein Ausklang: zählt nicht und sperrt nichts (Nachbesserung nach Prüfung, siehe „Prüfung“; vorher ohne die Bedingung „stärkere Spitze folgt“);
  (b) Lage per Parabel zwischen den Rahmen (±½ Rahmen). Haken: `const ons = impkPeaks(on, fps, fe);` (vorher `peaks(on, fps)`). `ons` benutzt
  nur der Gesang-Weg (Tempo-Suche, Feinsuche, Phase) – Mischungen/Bandaufnahmen rechnen bitgleich (imp2-node: alle Mix-Fälle zahlengleich).
- Block 2 vor `imp1Html`, 10 Zeilen: `impkAsk(c)` – (nach Prüfung) dieselbe Vorschlagsliste wie die Basis (½×, 2× des erkannten Tempos); nur ein
  Vorschlag, der auf das gewählte Tempo rundet, wird durch das erkannte Tempo ersetzt, jeder ganze Wert einmal. Ausgangszustand, +, −, Tippen: Frage
  wie die Basis. Haken in `imp1Html` (typeof-geschützt).
- Block 3 hinter `BEG1-END`, 13 Zeilen: `impkClickOff(t)` (kein Klick ab dem Schlusstaktstrich des laufenden Begleiter-Laufs, gleiche
  Bedingung wie `beg1Sched`: `run.stopB`, `run.id === R.runId`); Hülle um `applyCarrierChange` (wie BEG1 `songRecEnd` umhüllt): neu
  angeschlagene Töne, die eine Band-Stimme (log.src „beg“, gleiche Spur + Clip-Note) ersetzen, bekommen „beg“. Ohne offenen Begleiter
  ruft die Hülle nur das Original. Haken: erste Zeile in `click()` nach `UI.vvOff`.
- Sichtbar: nichts an Aussehen/Bedienung; nur Fragen mit zwei gleichen Knöpfen ändern sich: nach ½× „60 oder 60?“ → „60 oder 120?“ (#14 neu erkannt 120,3)
  bzw. „60 oder 121?“, nach 2× bei 84 „168 oder 42 / 168?“ → „168 oder 42 / 84?“ (gleiche Zahl Knöpfe).

## Messung NACHHER
1. Tempo: `lead-ons` 16 Einsätze, alle 12 Töne −4…−7 ms (übrig: 4 schwache Vibrato-Spitzen im Schlusston), 119,95 → **120**.
   `tempo-raten.txt`: Projekt-Tempo richtig **14/14 bei allen vier Raten**, |Fehler| **0,02 BPM**, |t1| **7,1 ms**, Spanne max **0,02 BPM** (vorher 0,33).
   Echte Aufnahmen (impk-test A3, imp2-node): #1 118,62 → 118,61 (Annotation 119, bleibt richtig), #10 112,13 → 112,06 (Projekt 112, Stabilität
   0,82 → 0,88), #14 120,64 → **120,33** (Projekt 121 → **120**, Stabilität 0,64 → 0,68; Wahrheit unbekannt). Mischungen 92/120 3/4/120 6/8/m96: gleich.
2. Import-Blatt: Start „120 oder 60?“ [120* | 60] (alte Formel am selben Ergebnis), nach ½× **„60 oder 120?“ [60* | 120]**, Tipp auf 120 → zurück
   zur Startfrage. Foto `impk-blatt-nachher.png` (Basis: `impk-blatt-vorher.png`).
3. Begleiter: Klick hinter SCHLUSS 1 → **0** (120 und 157 BPM, Stopp weiter am Taktstrich 12,00–12,04, 0 Töne dahinter). Etikett (`etikett-sonde`):
   „clip“ 2/8/2/4 → **0** in allen 16 Lagen, Summe der Band-Töne gleich (90/102/90/105). Klang gleich (impk-test C2: dieselben Töne Spur/Tonhöhe/Schlag).

## Tests
Alle Läufe an `index.html` (md5 c0ac5b11…), Logs im Paketordner. Test-Kopien in `reg/` (Fotos landen in `reg/fotos`, nichts in fremden Ordnern).
- **impk-test.mjs** (A Tempo · B Import-Blatt · C Begleiter · D Konsole): Lauf 1 9/10 (B1 maß gegen die Basis-Frage, die wegen des neuen
  Tempos 120 statt 121 lautet – Prüfung auf „alte Formel am selben Ergebnis“ umgestellt), Lauf 2/3 8/10 (C2: Zahl und Lage der beim Wechsel
  neu angeschlagenen Töne hängen am echten Finger-Zeitpunkt; die Basis streut selbst 192/194, `c2-streuung.mjs`; Lauf 3 lief neben beg1/rv1 →
  Basis 174 Töne). C2 prüft jetzt: kein „clip“, Töne auf den Zwischen-Achteln gleich (60 gleich), Summe ±4. **Lauf 4 (Endstand, `impk-test-4.log`): OK IMPK 10/10** (C1 Klick 1 → 0 bei 120/157 BPM; C2 „clip“ 12 → 0, Summe 192 → 192, 60 Achtel-Töne gleich).
- **beg1-test** (Kopie, `b1/basis.html` = Basis, `b1/neu/index.html` = IMPK): **57/59** (Auftrag: Basis 57/59; eigener Basislauf b0: 58/59).
  FEHLER 1 = Prüfung 5 (5/4 ohne Stil, Hinweis-Text) – derselbe Fehler mit demselben Text im Basislauf `beg1-vorher.log`.
  FEHLER 2 = „Eigener Block BEG1 … jede Zeile außerhalb trägt BEG1“ – zählt die 36 IMPK-Zeilen außerhalb des BEG1-Blocks (Test vergleicht
  gegen die Basis ohne IMPK; in r4760 aus demselben Grund 575 Zeilen). Alle Begleiter-Prüfungen (SCHLUSS 1, Ziel-Spur 2, ✕ 3, ↶ 4, ● AUTO 6) OK.
- **imp1-test** (Kopie `reg/imp1-test.mjs`): **ALLE OK (48)**, 120 s.
- **imp2-node** (realvox/imp2rs, alle Raten): **ALLE OK** wie Basis; Mischungen zahlengleich, #10/#14 Spanne 0,00/0,01 BPM (vorher 0,00/0,05).
- **rv1-test** (Kopie `reg/rv1-test.mjs`, Original-Prüfungen): **52/53** (r4760: 53/53). Der FEHLER: „#14 Stück 31 60 ms nach links:
  Ausklang des Vorgängers bitgleich“ (Abweichung bei 349 ms). Ursache wie in IMP2B (c) belegt: der Test vergleicht mit der Fassung nach ↶,
  in der der Vorgänger gedehnt war; #14 bekommt jetzt Projekt-Tempo 120 statt 121 und damit andere Schnitte. Gegenprobe: **Basis** mit
  demselben Tempo/t1 (`reg/rv1s-test.mjs`, RV1_ONLY=14 RV1_BPM=120.33 RV1_T1=0.676 → `reg-rv1s-basis-14.log`): NX1 q 1,0025 / 586 959 Proben
  wie IMPK und **derselbe FEHLER Stück 31 links, diffBeiMs 349** → Funktion von (Tempo, t1), nicht vom IMPK-Code.
- **rv1-test-imp2b** (rv1k, die korrigierte Kopie, vergleicht zusätzlich mit der ungedehnten Quelle): **ALLE OK 53**.
- Sonden: `tempo-raten.txt` (Basis vs IMPK, 14 Fälle × 4 Raten), `lead-ons.mjs`, `etikett-sonde.mjs` (16 Lagen Basis/IMPK).
- **Pflicht** (`pflicht.log`): topdefs Skripte 26, Namen 7990 (+2: impkAsk, impkClickOff), doppelt 0, Syntaxfehler 0 · dupkeys 0 doppelte
  Schlüssel · smoke `title SYNQUENZER errors []` (`smoke.png`) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.76.1' · Markenwörter: keine
  Änderung gegen die Basis · keine Emojis/Produktnamen in neuen Texten.

## Offen
1. **● AUTO über einen vorhandenen Song nimmt die Band nicht mit** (gemessen: 54 live → 27 im Song). Das ist der eigene Weg `songRecStartOver`
   mit Durchgängen, Einfügen/Ersetzen/Overdub – die BEG1-Hülle (`beg1SongPre`) schließt `sr.over` ausdrücklich aus. Ein Nachbau ist kein
   Kleinfehler (Song-Spuren je Modus schreiben, ↶-Gruppe) und passt nicht in 45 Minuten. Weg: wie bei einem neuen Song Band-Takte → Szene(n)
   (`beg1Scene`), dann im Aufnahme-Bereich die Song-Spuren der Ziel-Spuren je Modus setzen (`opInsert`/Ersetzen-Kern), alles im ↶-Schritt der Aufnahme.
2. #14 (frei gesungen, keine Annotation) wechselt das Projekt-Tempo 121 → 120 (roh 120,64 → 120,33). Die Frage „120 oder 60?“ bleibt; ob 120
   oder 121 richtiger ist, lässt sich ohne Annotation nicht sagen (Stabilität spricht leicht für die neue Schätzung). rv1 siehe Tests.
3. Vokal-Melodien mit Vibrato im langen Schlusston erzeugen weiter 3–4 schwache Spitzen (Gewicht 6–7 gegen 20–57 der Einsätze) – harmlos.
4. **rv1-Original 52/53** (r4760: 53/53): der eine FEHLER (#14 Stück 31 links, Bezug „Fassung nach ↶“) entsteht aus dem neuen #14-Tempo (120 statt 121)
   und ist mit der Basis bei gleichem Tempo/t1 zahlengleich nachgestellt; die korrigierte Kopie rv1k ist 53/53. Entscheidung beim Zusammenführen:
   rv1k (vx/imp2b/fix/rv1-test-imp2b.mjs) als Abnahme nehmen – wie in IMP2B schon vorgeschlagen – oder IMPK-Tempo ohne #14-Wechsel nicht übernehmen.

## Prüfung (Nachbesserung 06:44–07:2x, Sicherung `index.vor-pruef.html` = c0ac5b11…, Blöcke `block-tempo.vor-pruef.js`/`block-ui.vor-pruef.js`)
Bau weiter nur über `apply.mjs` (basis.html + 3 Blöcke). Begleiter-Block `block-beg.js` unverändert (byte-gleich im index). Außerhalb der Blöcke
weiter genau die 3 Haken-Zeilen mit „IMPK“ (`diff basis.html` gegen index ohne IMPK-Blöcke, `pv/ohne-bloecke.diff`).

**Befund 1 (mittel) – Ausklang-Filter verwirft Einsätze leiserer Töne nach lauteren: BESTÄTIGT, behoben.**
- Nachgeprüft mit der Prüfer-Sonde (Kopie `pv/tempo-eigen.mjs`), `gap+alt 80` mit Entscheidungs-Dump (`pv/diag.html`, `pv/te-diag.mjs`):
  die Spitzen der leiseren Töne liegen 30–38 ms *vor* dem Ton (Ende des lauteren Vorgängers, ea/eb 0,08–0,31) – die Basis nahm genau dieses
  Tonende als Ersatz-Einsatz. IMPK strich sie, der eigentliche Einsatz des leiseren Tons kam aber nicht zurück, weil die gestrichene Spitze im
  ±50-ms-Maximum-Test weiter sperrte → nur Vibrato-Spitzen blieben, Tempo kippte auf 2×.
- Varianten gemessen (beide Prüfer-Sätze, lead-ons): Lücken-Kriterium (min. Energie 60 ms danach < 0,1/0,2 × davor) **half nicht** (gleich
  schlecht wie vorher, die Tonenden haben echte Lücken); „gestrichene Rahmen sperren nicht“ (fm50/fm35) 1–5 Fälle schlechter;
  **„stärkere Spitze binnen 100 ms folgt“: 0 schlechter** in beiden Sätzen → übernommen (Prüfer-Vorschlag 2). Logik im Block `block-tempo.js`:
  eine Spitze mit fallendem Pegel wird nur gestrichen, wenn binnen 100 ms eine stärkere folgt (genau der Ausgangsfall: Tonende 70 ms vor dem
  nächsten Einsatz); sonst bleibt sie wie in der Basis. Parabel-Verfeinerung (b) unverändert.
- Messung nachher: lead-ons 120,54 (Basis) → **120,24** → Projekt 120 (vor Prüfung 119,95; beide richtig). Echte Aufnahme #1 gegen Annotation
  (`pv/echt-sf.log`): getroffen A1 40/59, A2 49/64 = **wie Basis (kein Einsatz verloren**; vor Prüfung 39/59), falsche Einsätze 91 → 84 bzw. 82 → 75
  (vor Prüfung 78/68). #1 118,61, #10 112,06, #14 120,33 (unverändert gegen die Fassung vor der Prüfung).
- Neuer Test **`impk-tempo-test.mjs`** (Prüfer-Fälle + langsamer Satz 66–92 BPM, Abnahme: kein Fall schlechter als die Basis):
  Endfassung `impk-tempo-test-p.log` (+ `-p-rest.log`), Fassung vor Prüfung `impk-tempo-test-alt.log` zum Gegenbeweis – Zahlen unter „Tests (Prüfung)“.

**Befund 2 (mittel) – impkAsk ändert die Frage auch nach +, −, Tippen: BESTÄTIGT, behoben.**
- Nachgeprüft: vor Prüfung „122 oder 121 / 60?“ bzw. „85 oder 84 / 42 / 168?“ (ein Knopf mehr als die Basis) – sichtbare, nicht verlangte Änderung.
- Jetzt (Prüfer-Vorschlag): Basis-Liste bleibt, nur ein Vorschlag, der auf das gewählte Tempo rundet, wird durch das erkannte Tempo ersetzt,
  jeder ganze Wert einmal. Start/+/−/Tippen = Basis; nach ½× „60 oder 121?“, nach 2× bei 84 „168 oder 42 / 84?“; nie mehr Knöpfe als die Basis.
- Neuer Test **`impk-frage-test.mjs`** (8 Tempi × bis 7 Zustände): Endfassung **ALLE OK (144)**; Fassung vor Prüfung **50 FEHLER** (fängt den Befund).

**Befund 3 (klein) – rv1-Original 52/53 (#14 Stück 31 links): BESTÄTIGT als Test-Bezugsfrage, nicht als Code-Fehler; nicht geändert.**
- #14 bekommt mit IMPK weiter roh 120,33 → Projekt 120 (Basis 121); der Bauer hat mit der Basis bei gleichem Tempo/t1 denselben FEHLER
  nachgestellt (`reg-rv1s-basis-14.log`). Die korrigierte Abnahme rv1k (vergleicht zusätzlich mit der ungedehnten Quelle) ist 53/53.
  Entscheidung beim Zusammenführen bleibt (Offen 4).

## Tests (Prüfung) – Endfassung index.html md5 d89d27f427f5d13d358903e3ed553585
Fortsetzung 07:41–08:2x nach Abbruch des ersten Nachbesserungs-Laufs (Maschine neu gestartet; Logs in `f2/`). Fremdlast durch parallel
laufende Pakete: Last 16–29 auf 4 Kernen während fast aller Browser-Läufe.
- **Bau**: `apply.mjs` erzeugt index.html byte-gleich (md5 d89d27f4…, `f2/index.rebuild.html`). Ohne die 3 IMPK-Blöcke gegen basis.html:
  5 Zeilen (2 alt, 3 neu), alle neuen tragen „IMPK“ (`f2/ohne-bloecke.diff`). Hinweis: die Zeile „Zeilen anders ohne Bloecke: 81168“ in
  `pflicht-p.log` stammt aus einem zeilenweisen Vergleich ohne Ausrichtung und ist falsch; maßgeblich ist der diff.
- **impk-frage-test.mjs**: ALLE OK (144); Fassung vor Prüfung 50 FEHLER. Geändert sind nur Zustände, in denen die Basis zwei gleiche Knöpfe
  zeigt (15 von 49 Zuständen, `f2/frage-f2.log`), nie mehr Knöpfe als die Basis.
- **impk-tempo-test.mjs** (Prüfer-Fälle, 11 Tempi 66–150 × 9 Arten = 99): **ALLE OK – 0 schlechter, richtig 66/99 gegen Basis 63/99**, besser:
  punkt 118, punkt 132, synk 132; |Fehler| 0,796 → 0,047 BPM, |t1| 16,9 → 12,7 ms (`f2/tempo-test-f2.log`, ein Lauf, kein Abbruch).
  (Die 33 Fälle mit ½×/2× sind langsame Legato-/Punkt-Fälle, die Basis und IMPK gleich auf 2× schätzen – Bestand der Basis, nicht IMPK.)
- **lead-ons**: Basis 10 von 17 Einsätzen > 40 ms daneben, 120,54 → IMPK 5 (nur Vibrato-Spitzen im Schlusston), alle 12 Töne −4…−7 ms, **120,24 → Projekt 120**.
- **echt-ons** (Prüfer-Sonde, echte Aufnahme #1 gegen Annotation, an der Endfassung): getroffen A1 40/59, A2 49/64 = **Basis (kein Einsatz verloren)**,
  falsche Einsätze 91 → 84 bzw. 82 → 75, Tempo 118,62 → 118,61 (`f2/echt-ons-f2.log`).
- **tempo-raten**: nach 900 s wegen Fremdlast abgebrochen (11 von 14 Fällen): Projekt-Tempo richtig Basis 39/44 → IMPK **44/44**, Spanne über die
  Raten max 0,33 → 0,06 BPM (`f2/tempo-raten-f2-summe.txt`). Alle 14 Fälle bei 44,1 kHz deckt impk-test A1 ab (13/14 → 14/14).
- **impk-test.mjs**: Lauf f2 (Last 23–28) 8/10 – A, B, C1, D grün; C2 „clip“ 8 → 0 grün im Kern, aber der **Summen-Vergleich zweier getrennter
  Echtzeit-Läufe war nicht lastfest** (Finger kam bis 0,24 Schlag zu spät: Wechsel bei 6,04 statt 5,8; dann schlägt applyCarrierChange je nach
  Zeitpunkt andere Töne neu an – Basis selbst 179/184/189/193 Töne in vier Läufen). **Test ergänzt** (Sicherung `f2/impk-test.vor-f2.mjs`):
  C2 zählt jetzt je Lauf die von applyCarrierChange neu angeschlagenen Töne (spawnClipVoice innerhalb des Wechsels; Zweig „zusätzlicher Anschlag
  bei eff“ getrennt) – Etikett-Prüfung: alle Wechsel-Anschläge „beg“, kein „clip“; Klang-Prüfung: Summe ohne die zusätzlichen Wechsel-Anschläge
  ±4 und Zwischen-Achtel gleich, ausgenommen die Achtel bis 0,3 Schlag hinter einem Wechsel (3,5 / 7,5 – hängen am Finger-Zeitpunkt).
  **Lauf f2c (Last 16–20): OK IMPK 10/10** – C1 Klick hinter SCHLUSS 1 → 0 (120 und 157 BPM, Stopp 12,02/12,05), C2 Wechsel-Anschläge Basis 10
  „clip“ → IMPK 10 „beg“, Summe ohne zusätzliche 185 → 186, 50 Zwischen-Achtel gleich (`f2/impk-test-f2c.log`).
- **beg1-test** A/B gleichzeitig (gleiche Last, Basis = `b0/neu`, IMPK = `b1/neu`), Runde 1: **Basis 54/59, IMPK 51/59** (`f2/beg1-B-f2.log`,
  `f2/beg1-I-f2.log`). Bei beiden: Aufnahme = Live, Prüfung 5 (Bestand der Basis), Prüfung 6 ● AUTO. Nur Basis: Begleiter aus, FILL. Nur IMPK:
  „Eigener Block BEG1“ (zählt die 39 IMPK-Zeilen außerhalb des BEG1-Blocks – erwartet, wie im ersten Bericht), CPU (Spitze 44,9 ms), Ein Finger,
  Prüfung 6 ↶ und Speichern/Laden (diese drei hatte die Basis im Prüfer-Lauf unter Last ebenfalls bzw. sind zeitkritisch). „Ein Finger“ zählt
  alle Quellen außer „retune“ – das IMPK-Etikett kann es nicht ändern; der Fehler ist ein F-Ton bei 12,00, der schon klang, als der Finger für
  Em zu spät kam. Ohne Fremdlast war beg1 vor der Prüfung 57/59 (nur Prüfung 5 + Block-Zählung). Runde 2 siehe unten.
- **imp1-test** ALLE OK (48), **imp2-node** ALLE OK (Mischungen zahlengleich), **rv1** 52/53 (der bekannte Bezugs-FEHLER #14 Stück 31 links),
  **rv1k** ALLE OK 53 – Läufe 07:00–07:19 an derselben Endfassung (`reg-imp1-p.log`, `imp2n-p.log`, `reg-rv1-p.log`, `reg-rv1k-p.log`; rechnen
  ohne Echtzeit, Last ändert die Zahlen nicht).
- **Pflicht** (Endfassung, `f2/pflicht-f2.log`): topdefs Skripte 26, Namen 7990, doppelt 0, Syntaxfehler 0 · dupkeys 0 · smoke `title SYNQUENZER
  errors []` (`f2/smoke-f2.png`) · „MS 2000“ 1× (Basis 1) · „^  live: true,“ 1× · VERSION '4.76.1' · Markenwörter gleich der Basis · 3 IMPK-Blöcke
  ohne Emoji/Bildzeichen.

## Offen (Stand Prüfung)
1. ● AUTO über einen vorhandenen Song nimmt die Band nicht mit (unverändert, siehe Offen 1 oben) – eigenes Paket.
2. rv1-Original 52/53 (#14 Stück 31 links, Bezug „Fassung nach ↶“, mit der Basis bei gleichem Tempo/t1 zahlengleich nachgestellt); rv1k 53/53.
   Entscheidung beim Zusammenführen: rv1k als Abnahme nehmen oder #14-Tempowechsel 121 → 120 nicht übernehmen.
3. Zeitkritische Browser-Prüfungen (beg1, impk-test C) streuen unter Fremdlast in Basis und IMPK; ein beg1-Lauf ohne Fremdlast steht für die
   Endfassung noch aus (vor der Prüfung ohne Last: 57/59 = Basis-Stand).
4. tempo-raten vollständig (alle 14 Fälle × 4 Raten) an der Endfassung bei niedriger Last wiederholen (Teil: 44/44).
