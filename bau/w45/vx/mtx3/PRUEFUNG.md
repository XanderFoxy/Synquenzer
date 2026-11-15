# MTX3 – Prüfung (unabhängig, skeptisch)

Geprüft: `mtx3/index.html` gegen `mtx3/basis.html` (4.66.0). Nichts repariert. Alle Läufe nacheinander (Rechner-Last 2–8, andere Läufe aktiv).
Prüfer-Ordner: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/mtx3-pruef`
(`t/touch.mjs` Touch-Ablauf, `t/play3.mjs` 3-min-Echtzeit, `t/render*.mjs` / `t/probe*.mjs` Render- und Code-Sonden, `t/hhdup.mjs`,
`t/cpu.mjs`, Regression `reg/`, Fotos `fotos/`, Ergebnisse `touch.log`, `play3-*.json`, `cpu.log`).

## Ergebnis in einem Satz
Die Zahlen des Bauers stimmen (eigener Test 51/51, Summe −124,7 dB im Standard-Kit, Regression wie Basis), aber nur für den
geprüften Weg. Vier schwere Fehler: Auslagern lässt die neue Spur im Song weiterlaufen, Drum-Fills schalten die Einzelspuren nicht
stumm, North-Kits klingen nach dem Aufteilen anders, und „In vorhandene Spur“ lässt Noten verstummen. Dazu stoppt ↶ beim Aufteilen
die Musik.

## Befunde

### S1 [schwer] Auslagern „In neue Spur darunter“: Neue Spur spielt im Song nach dem Abschnitt weiter
- **Ursache:** Block Zeile 94994, `S.song.lanes[j] = lanes[t].filter(e => e.slot === s)`. Der Filter wirft die Stopp- und
  Wechsel-Einträge der Quelle weg, also läuft der Teil-Clip bis zum Song-Ende.
- **Song Szene 1 (2 Takte) + Szene 2 (2 Takte), Synth 1 (Szene 2 leer):**
  - Quell-Zeile `[0:0, 2:−1]`, neue Zeile `[0:0]`.
  - Pegel in Takt 3/4: vorher −57 / −102 dB, nachher −26,7 / −26,7 dB. Der Bass spielt dort, wo vorher Stille war.
- **Synth 2 (Szene 2 hat einen eigenen Clip):** Takt 3/4 −25,0 / −25,2 → −21,4 / −21,8 dB. Die Teil-Noten aus Szene 1 liegen über Szene 2.
- **3 min Echtzeit-Song** (Szene 1/2 im Wechsel): Synth-1-Noten 351 → 471, das sind +120 (+34 %) falsche Noten.
- **Warum der eigene Test das nicht sieht:** `mtx3-test` vergleicht mit demselben Filter (`lane === lane0`) und spielt nur Szene 1.

### S2 [schwer] Drum-Übergänge (Fill „ersetzt“) schalten die Einzelspuren nicht stumm
- **Ursache:** `ueBuild` legt die „ersetzt“-Fenster nur für `e.t` an, also Spur 4 (Zeile 80376). Dasselbe gilt für FX1-Pad-Fenster und
  `e.stop`-Listen.
- **Folge:** HH und Snare spielen ihren Groove unter dem Fill weiter.
- **Messung:** Song 2+2 Takte, Werks-Fill „Snare-Lauf“ (Standard-Modus ersetzt) auf der Kante, Render vorher ↔ aufgeteilt:
  - gesamt **−16,5 dB**
  - Fill-Takt **−13,4 dB**
  - Ziel ist ≤ −60 dB. Ohne Fill: −124 dB.
- **Reichweite:** Betroffen ist jeder Song mit Fills oder Übergängen (GR2/GEN3-Genre-Fills, Übergangs-Blatt).

### S3 [schwer] North-Kits: Einzelspur spielt eine andere Stimme
- **Ursache:** `drumHit` überspringt mit `o.P` den North-Weg (`!(o && o.P) && mdPlays`, Zeile 32248). Die Einzelspur spielt deshalb die
  DrumSynth-Ersatzstimme.
- **Messung:** Render vorher ↔ aufgeteilt (Standard-Vorschlag HH ZU + SNARE, mit Chance/Wirbel/Akzent), alle 11 Werks-Kits:

| Kit | North-Pads | vorher ↔ aufgeteilt | zusammengeführt |
|---|---|---|---|
| 808 / 909 / Rom Pop / Gated 84 / FM Labor / Disko 85 / Resonanz-Perc | 0 | −137,9 / −136 / −121,4 / −120 / −136,1 / −128,1 / −134,8 dB | −124 … −146 dB |
| Fell & Holz / Modell-Analog / Gestimmt / Schräg | 12 | **+2,8 / +0,4 / −0,8 / +2,3 dB** | −300 dB |

- „Schräg“ nur mit Kick und HH ZU: −20,3 dB.
- Der Knopf ist bei North-Kits aktiv, und es gibt keinen Hinweis.
- Die NOTES sagen „kann anders klingen“. Gemessen klingt der Ton ganz anders: Bei 4 von 11 Werks-Kits ist die Differenz lauter als das Signal.

### S4 [schwer] „In vorhandene Spur …“ (Verschieben): Noten verstummen, ohne Hinweis
- **Fall:** Das Ziel hat in dieser Szene keinen Clip (Knopf „neuer Clip“, z. B. Synth 4 oder Melodie).
- **Matrix (per Touch, Szene 1 läuft):**
  - Zielspur startet nicht (`R.slot[3] = −1`).
  - 0 Noten-Log-Einträge in 2,2 s, obwohl 3 Noten verschoben wurden.
  - Die Quelle hat 5 Noten.
- **Song:** Die Ziel-Zeile bleibt `[]`, kein Song-Eintrag wird ergänzt. Render der Bass-Summe −24,8 → −26,3 dB, 3 von 8 Noten sind weg.
- **Ursache:** Zeile 95003 legt nur den Clip an, ohne Slot und ohne Song-Zeile. „Spielt darunter wie ein Layer“ gilt für diesen Weg nicht.

### M1 [mittel] ↶/↷ beim Aufteilen und Zusammenführen stoppt die Wiedergabe
- **Ursache:** Art `sx14` geht über `sx14Put` → `applyProject`, also den ganzen Stand.
- **Per Touch 428×926:**
  - Matrix spielt, ■ halten → aufteilen: läuft weiter, 0 doppelte Schläge.
  - ↶-Taste: `playing:false`. ↷: ebenso.
- **Vergleich:** ↶ von Auslagern läuft weiter (Editor-Taste ↶/↷, je ein Schritt).

### M2 [mittel] [Auslagern ▾] ist schwer zu finden
- **Lage:** Der Knopf liegt in der unteren Aktionsleiste bei x = 1125 von 1897 px Laufbreite. Er rückt auch mit Auswahl nicht nach vorn.
- **Wischen nötig:** hochkant 3×, quer (926×428 / 926×370) 1×.
- **„Wo finde ich …?“:** „Noten auslagern“ hat kein „Zeig es mir“-Ziel (`go()` → false).
- **Zum Vergleich:** Undo im Noten-Editor braucht dort ebenfalls 2 Wischer zur ↶-Taste (Bestand). Nach Auslagern gibt es keinen
  Toast-↶, das ist im Editor so gewollt.

### M3 [mittel] Eine Einzelspur lässt sich nicht als Drum-Spur bearbeiten
- **Noten-Editor:**
  - Er ist die Klavierrolle mit Tonhöhen (F♯2) statt Pad-Namen (Foto `fotos/p-einzelspur-editor.png`).
  - Chance, Wirbel, Akzent und Locks sind nicht erreichbar.
  - „▲ Stufe“ und „+12“ machen aus der HH einen anderen Drum-Ton.
  - Die Tastatur spielt den Platzhalter-Synth (Init Analog).
- **Klang-Editor:**
  - Er zeigt den VA-Synth „HH ZU · Rom Pop“ (Foto `fotos/p-einzelspur-klang.png`).
  - Alle Regler sind wirkungslos, solange der Name bleibt: Render nach Reglerwechsel −124,5 dB, also unverändert. Das ist eine Falle.
- **Kit-Wechsel auf DRUMS:** Er ändert die Einzelspur nicht. Mit DRUMS = 909 bleibt die HH „Rom Pop“ (Render identisch, −300 dB).
- **Drum-Ton:** Der Ton der Einzelspur ist nirgends änderbar, nur über Zusammenführen → ändern → wieder aufteilen.

### M4 [mittel] Nur so viele Töne wie freie Plätze
- **Standard-Projekt:** 6 benutzte Töne, davon 2 aufteilbar.
- **Projekt mit 8 Spuren:**
  - [In Einzelspuren aufteilen] ist grau, ohne Grund im Blatt.
  - Ein Tipp tut nichts, es kommt kein Hinweis.
- **Folge:** „Automatisch in einzelne Einzelspuren“ ist nur zum Teil erfüllt. Der Bauer hat das offengelegt (DRUMS fest, `MAX_T` 8).

### M5 [mittel] Leistung (Priorität 1) und Knoten-Leck
- **Je Einzelspur dauerhaft:**
  - eine leer mitlaufende Synth-Engine (`AU.synth` 11110100 → 11110111)
  - ein eigener Kit-Bus mit 2 Faltungen
  - ein eigener Planer-Lauf
- **Messung bei 2 Einzelspuren (Last 6–8, je 2 Läufe):**
  - Planer-Zeit live 5,4–5,5 → 6,9–9,8 ms/s (+27 … 77 %)
  - Planer-Aufrufe 4 750 → 6 380 (+34 %)
  - Offline-Render des Projekts (16 Takte) 7,6 s → 9,4–9,6 s (+23 %)
- **Leck:**
  - Je Offline-Render (Video, Mix-Messung) und Weiterspielen entstehen 2 neue Live-Faltungen je Einzelspur. Die alten werden nie getrennt.
  - Gemessen: 3 Renders → 7 → 19 erzeugt, 1 getrennt. Nach ↶/↷ 23.
  - Ursache: `mtx3Bus` baut bei neuem `ctx`/`dvx` neu, ohne den alten Bus abzubauen (Zeile 94778).

### M6 [mittel] Rollen erkennen die Einzelspuren nicht als Drums
- **Mix-Rollen (`mx2Roles`):** HH ZU = „bass“, SNARE = „lead“.
- **Perform-Stumm-Gruppen:**
  - HH ZU in BASS, SNARE in REST.
  - „NUR DRUMS“ und „OHNE DRUMS“ erfassen die Einzelspuren nicht.
- **GEN4:** bietet Synth-Rollen an (bass/comp/pad/seq/lead).

### M7 [mittel] MIDI-Export folgt nicht
- Die Einzelspuren liegen auf Kanal 7/8 mit Programmwechsel. Note-On je Kanal: DRUMS ch 10 → 12, HH ch 7 → 12, Snare ch 8 → 4.
- In einer DAW spielt die HH als Melodie-Instrument (F♯2).
- Der Bauer hat das offengelegt; der Auftrag verlangt „MIDI-Export folgen“.

### L1 [leicht] „Summe gleich“ gilt nur ohne nichtlineare Kanäle
- **Drive 0,6 auf DRUMS:** vorher ↔ aufgeteilt −12 dB, weil der Drive jetzt je Spur wirkt statt auf der Summe. Für MIX-A-Kompressor gilt dasselbe Prinzip.
- Das ist physikalisch so, wird aber nirgends gesagt.

### L2 [leicht] Auslagern ändert bei Mono- oder Stimmen-begrenzten Klängen die Summe (inhärent)
- **Die neue Spur selbst klingt exakt wie die Quelle:** gleiche Noten allein auf der Quelle ↔ allein auf der neuen Spur
  −300 / −111 / −115 dB, Raster-Lage gleich, Versatz 0.
- **Summe:**
  - FM-Pluck: Hüllkurve ≤ 0,35 dB.
  - Moog-Bass (Poly 1): −3,9 dB, Hüllkurve bis 10 dB, weil zwei Mono-Stimmen statt Legato.
  - Rom-Fläche (Stimmen-Grenze): Hüllkurve bis 6,4 dB.
- Es gibt keinen Hinweis im Blatt.

### L3 [leicht] ↷ von Auslagern während der Wiedergabe
Die wiederhergestellte Spur startet nicht mit (`R.slot[6] = −1`). Ihre Noten bleiben bis zum nächsten Szenenstart stumm.

### L4 [leicht] Einzelspur duplizieren und dann zusammenführen
Das Duplikat nimmt `tr.dvx` mit, deshalb landen die HH-Noten doppelt in DRUMS (10 → 20).

### L5 [leicht] Synth-Modus und Speichern/Laden
Speichern/Laden verliert die Drum-Felder: Der Wirbel `r:3` ist danach weg. Der Rückweg zum Drum-Ton ist dann nicht mehr gleich.

### L6 [leicht] Anzeige
- **Song-Ansicht:** Die Einzelspuren heißen „SYN 5 / SYN 6“ statt „HH ZU / SNARE“ (Foto `fotos/p-song-ansicht.png`).
- **Quer (926×428 / 926×370):** Die neuen Spuren liegen nach dem Aufteilen auf Spur-Seite 2, nicht im Bild. Es wird nicht umgeblättert,
  nur der Toast erscheint (Foto `fotos/q-einzelspuren-926x428.png`).

### L7 [leicht] Kein Weg aus dem Drum-Editor
Xanders wörtlicher Weg „Hi-Hats auswählen → eigene Spur“ fehlt im Drum-Editor (Schritte): dort gibt es kein Auslagern. Ersatz ist die
Ton-Wahl im Blatt „DRUMS aufteilen“.

## Bestätigt (stimmt)
- **Bedienweg Aufteilen per Touch in allen drei Größen:**
  - ■ DRUMS halten → Spur-Blatt → Blatt „DRUMS aufteilen“.
  - Vorschlag HH ZU + SNARE, „DRUMS behält: KICK, CLAP, HH OF, PERC“.
  - Die Blätter liegen ganz im Bild, der Haupt-Knopf ist erreichbar.
- **Auslagern per Touch:**
  - Clip halten → ✎ Bearbeiten → ⬚ → 3 Noten antippen → [Auslagern ▾] → [In neue Spur darunter].
  - Spur „Synth 1 · Teil“ direkt darunter, 3 Noten, gleicher Slot und Start.
  - Noten-Log auf den alten Notenplätzen (1 / 2,5 / 3,5).
  - ↶/↷ über die Editor-Tasten: je ein Schritt, Musik läuft weiter.
- **Aufteilen während der Wiedergabe:** läuft weiter, 0 doppelte Schläge, HH nur noch auf der Einzelspur.
- **Eigener Kanal:** Wisch-Lautstärke ändert nur die HH-Spur (0,85 → 0,58, DRUMS bleibt 0,85).
- **Speichern und echtes Neuladen der Seite:** Einzelspuren, `tr.dvx` und Noten bleiben und sind aktiv.
- **Standard-Kit:** Summe −124,7 dB (eigener Test), Zusammenführen −127,7 dB, Chance/Wirbel/Akzent gleich (gleiche Saat).
- **3 min Echtzeit-Song, Basis ↔ aufgeteilt (HH ZU + Teil-Spur):**
  - keine Konsolenfehler
  - nach dem Stopp 0 Schläge und 0 Stimmen, Nachklang −83 dB
  - Drum-Schläge je Ton gleich (±2 durch Laufzeit-Lage)
  - 0 Doppelschläge
  - Knackser-Kandidaten 3 705 ↔ 3 723 (gleich, Messverfahren grob)
  - Pegel-Profil je 10 s innerhalb 0,4 dB
- **Uhr-Drift:** im aufgeteilten Lauf −0,27 s gegen +0,02 s in der Basis. Wiederholungen (50 s, HH je Takt) zeigen einzelne fehlende
  Schläge in Basis **und** MTX3 bei Last 7–8. Das ist Rechner-Last, nicht MTX3 zuzuordnen.

## Regression (einzeln, nacheinander; `mtx3-pruef/reg/`)
- **Rauchtest:** `errors []`
- **vx1-test:** 61/61
- **imp1-test:** ALLE OK (134 s)
- **mtx-test:** 91/92. Die eine FEHLER-Zeile ist der Vergleich mit Basis 4.49.1, wie beim Bauer.
- **ux2-test und ux2-test-nie:** Logs **byte-gleich** mit basis.html. ux2: 22 OK, 5 FAIL + Abbruch. nie: 26 OK, 1 FAIL.
- **mtx3-test (Bauer):** 51/51

## Pflichtprüfungen (index.html)
- **topdefs:** Skripte 26 / doppelt 0 / Syntaxfehler 0
- **dupkeys:** 0
- **smoke:** `errors []`
- **Zählungen:** „MS 2000“ genau 1×, `^  live: true,` genau 1×, VERSION 4.66.0
- **Markenwörter je Wort = Basis.** Einziger Mehr-Treffer ist „Push“ +3 = `undoPush`, ein Code-Name.
  - 0 Marken in Block, Test, NOTES, LOG und Prüfer-Dateien.
  - Ausnahme: Das Log des alten mtx-tests gibt den Bestands-Knopftext des Spur-Blatts mit einer Marke wieder. Das betrifft auch
    `mtx3/reg/mtx.log` des Bauers (1×). In der Prüfer-Kopie ist die Stelle geschwärzt.
- **Grafik und Namen:** keine Emojis (nur ✕ ■ ▾ ↶ → wie im Bestand), keine Namen echter Personen oder Bands.
- **Block:** `block.js` ist identisch mit dem Block in index.html. Außerhalb des Blocks gibt es nur die 7 Haken-Zeilen.

## Empfehlung
- **So nicht ausliefern:** S1–S4 ergeben hörbar falsche Ergebnisse in normalen Songs (Fills, mehrere Szenen, North-Kits, vorhandene Spur).
- **Vor Auslieferung beheben:**
  - S1: die ganze Song-Zeile der Quelle kopieren, mit Stopps und Wechseln.
  - S2: „ersetzt“- und Stopp-Fenster von DRUMS auf die Einzelspuren übertragen.
  - S3: Aufteilen bei North-Pads sperren oder die North-Stimme mitnehmen.
  - S4: Zielspur starten und die Song-Zeile ergänzen, oder einen Hinweis zeigen.
- **Ändert die Bedienung, also erst im Funk vorschlagen:** M1 (↶ ohne Stopp) und M3 (Drum-Bearbeitung der Einzelspur).
