# IMPK – Import/Begleiter-Kleinfehler · Basis 4.76.1 (VERSION bleibt '4.76.1')

Paket: `basis.html` = rel-4761 (md5 e4dc1b95…), `index.html` = Basis + IMPK (md5 siehe Ende). Bau reproduzierbar: `apply.mjs`
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
  `peaks` + (a) Spitze mit fallendem Pegel (Mittel 40 ms danach < ½ × 40 ms davor, aus `fe`) ist ein Ausklang: zählt nicht und sperrt nichts;
  (b) Lage per Parabel zwischen den Rahmen (±½ Rahmen). Haken: `const ons = impkPeaks(on, fps, fe);` (vorher `peaks(on, fps)`). `ons` benutzt
  nur der Gesang-Weg (Tempo-Suche, Feinsuche, Phase) – Mischungen/Bandaufnahmen rechnen bitgleich (imp2-node: alle Mix-Fälle zahlengleich).
- Block 2 vor `imp1Html`, 9 Zeilen: `impkAsk(c)` – gewähltes Tempo zuerst, dann die übrigen Kandidaten (erkannt, ½×, 2×), jeder ganze Wert
  nur einmal. Im Ausgangszustand (gewählt = erkannt) entsteht genau die alte Frage. Haken in `imp1Html` (typeof-geschützt).
- Block 3 hinter `BEG1-END`, 13 Zeilen: `impkClickOff(t)` (kein Klick ab dem Schlusstaktstrich des laufenden Begleiter-Laufs, gleiche
  Bedingung wie `beg1Sched`: `run.stopB`, `run.id === R.runId`); Hülle um `applyCarrierChange` (wie BEG1 `songRecEnd` umhüllt): neu
  angeschlagene Töne, die eine Band-Stimme (log.src „beg“, gleiche Spur + Clip-Note) ersetzen, bekommen „beg“. Ohne offenen Begleiter
  ruft die Hülle nur das Original. Haken: erste Zeile in `click()` nach `UI.vvOff`.
- Sichtbar: nichts an Aussehen/Bedienung; nur die falsche Frage „60 oder 60?“ heißt jetzt „60 oder 120?“ (#14 neu erkannt 120,3) bzw. „60 oder 121?“.

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
  Basis 174 Töne). C2 prüft jetzt: kein „clip“, Töne auf den Zwischen-Achteln gleich (60 gleich), Summe ±4. IMPK_LAUF4
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
