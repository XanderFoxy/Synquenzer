# ND-P – die North-Platte (Basis R-4300 = 4.30.0, VERSION bleibt `4.30.0`)

Xander (01.11.): „Ich wollte North als Extra-Instrument wie bei den Synthesizern, so dass es auch nach North aussieht und sich nach North anfühlt.“

North hat jetzt ein eigenes Instrument-Gesicht: eine Platte im Geräte-Stil, die über dem Drum-Editor liegt – so wie die
MK-Platte zu den Synth-Spuren gehört. Kein Logo, kein Herstellername, keine kopierten Grafiken; sichtbar steht nur „North“ (aus `MD_NAME`).

## Gestaltung (warum es so aussieht)

**Front.** Kräftig rot mit leichtem Lichtschein oben links, zwei Schrauben in den Ecken, oben links der Schriftzug *North* (kursiv, mit
einem kurzen Strich dahinter – eigene Marke aus CSS, kein Logo), rechts der Name des Kits. Alles, was man lesen muss, steht auf
**schwarzen Beschriftungsfeldern** (wie bedruckte Folienfelder auf einem Gerät), die Tasten sind schwarze Gummitasten mit einer
**LED-Leiste**, die Regler schwarze Kappen mit weißem Strich und einem hellen Wertbogen außen.

**Wert-Display.** Drei Stellen **Siebensegment** in Rot (SVG-Segmente, unbeleuchtete Segmente schimmern schwach wie bei echten
Anzeigen). Gezeigt wird die Geräte-Schreibweise: `45.0`, `E1`, ` 28`, `L9`, `-5`, `A6`, `h5`. Was nicht in drei Stellen passt (127,5,
BPM-Zeiten), zeigt die Ganzzahl mit Punkt, der Text darunter sagt es genau. Neben dem Display drei Lämpchen **WERT · PROG · KIT** =
was das Rad gerade tut. Darunter ein **Textstreifen** (zwei Zeilen): Sektion · Parameter · Kanal, dann Wert und die deutsche
Bedeutung aus dem North-Editor („28 · 320 ms“, „b1 · Bandpass 6 dB“, „Dynamic Decay: leise 92 ms, voll = DECAY“).

**Das Rad.** Ein großer Dreh-Encoder mit Riffelrand und Fingermulde. Drehen mit dem Finger im Kreis, **Rasten alle 15°** (jede Raste
ein Schritt, kurzes Ticken), schnell drehen = 4 Schritte je Raste, mit SHIFT fein (PITCH in 0,1). Das Rad gehört immer dem zuletzt
berührten Parameter – wie am Gerät.

**Sektionen.** Fünf Sektions-Tasten mit LED: **TONE · NOISE · CLICK · MIX · FX** und, abgesetzt, **HALL / ECHO** (Kit-Effekte, eigene
Sektion). Darunter die **Regler-Reihe** der gewählten Sektion: je Spalte ein Bedien-Paar wie am Gerät (obere/untere Beschriftung,
§1.3–§1.10): TONE 5 Paare (SPECTRA/WAVE · FREQ/DYN FILTER · DECAY/MODE · BEND/TIME · PITCH/SCL PRE), NOISE 3, CLICK 1, MIX·FX 5
(NOISE LVL/TONE LVL · CH LEVEL/PAN · EQ FREQ/EQ GAIN · DIST/TYPE · REVERB/DELAY), HALL·ECHO 2 (REVERB TYPE/COLOR · RATE bzw. BPM/FEEDBACK)
plus die Tasten **RATE|BPM** und **TAP**. Das LED-Punkt im Namensfeld zeigt, welche Reihe der Regler gerade dreht; im Feld steht auch
der Wert. Regler ohne Wirkung (SPECTRA bei A1, EQ FREQ bei GAIN 0 …) sind grau mit „–“ – wie im Editor.

**Funktions-Tasten.** **SHIFT** · **ALLE KAN.** (Edit All) · **SOLO PART** · **TRIG ▶** (als gezeichnetes Dreieck).

**Kanal-Tasten.** Die 12 Kanäle der App in **zwei Bänken** zu 6 (1–6: KICK … HH OF, 7–12: TOM T … SHAK.). Hochformat 428×650: eine
Bank + Taste **BANK** (LED rot = 1–6, gelb = 7–12); hohes Hochformat 428×926: beide Bänke übereinander; Querformat: beide Bänke
nebeneinander. LED: hell = gewählt, gedimmt = Kanal spielt North, aus = Drum-Stimme; beim Anschlag blitzt sie weiß. Bei ALLE KANÄLE
tragen alle North-Kanäle einen gelben Rahmen.

**Kopf (48 px).** ✕ · ↶ · ↷ · Song ▶/■ · (Querformat: North + Kit) · **GERÄT | SPIEL** · ⋯.

**SPIEL-Ansicht.** 12 große Pads (3×4 hoch, 6×2 quer) auf der roten Front, je Pad Kanal + Programmname, darüber Display und Streifen.
Anschlag nach Tipp-Höhe: oben laut (1,0), unten leise (0,35).

## Bedienung (fühlt sich an wie ein Gerät)

| Element | Tipp | Ziehen / Drehen | Halten (0,6 s) | mit SHIFT |
|---|---|---|---|---|
| Kanal-Taste | wählen **und sofort anschlagen** (Anschlag nach Tipp-Höhe) | – | Programm-Liste dieses Kanals (DRUM SELECT) | Quelle umschalten Drum ↔ North (ein Undo) |
| Regler | aufs Rad legen (Display zeigt ihn) · **2× = INIT** | senkrecht = Wert, seitlich weg = fein, Mittelraste bei ± Werten | bei Codes (WAVE, MODE, TYPE …): Liste | fein (¼) |
| Name über/unter dem Regler | Regler auf diese Reihe | – | – | – |
| Sektions-Taste | Sektion wählen · **nochmal = ZOOM** | im Zoom: wischen = nächste Sektion | **SOLO PART** für diesen Teil | – |
| Rad | Liste (WAVE …, Programme, Kits) | Rasten 15°, schnell = ×4 | – | fein (PITCH 0,1) |
| Display | Modus WERT → PROG → KIT | – | Liste des Modus | – |
| PROG / KIT | Rad wählt Programm des Kanals / North-Kit (ein Undo je Dreh-Geste, Vorhören beim Loslassen) | | | |
| SHIFT | einrasten (LED rot) | – | solange gehalten: alle Regler auf der unteren Reihe (LED gelb) | |

**ZOOM** = beide Reihen der Sektion als eigene Regler (10 Regler bei TONE), wischen links/rechts = nächste Sektion, die
Sektions-Taste leuchtet gelb; nochmal tippen = zurück.

## Instrument-Wahl („North wie bei den Synths“)

* **Kopf-Knopf „● North“ im Drum-Editor** (rote Taste in Zeile 1, wie die Engine-Taste bei Synth-Spuren). Tipp: spielen noch Pads
  die Drum-Stimme, gehen **alle Pads auf Quelle North mit dem Programm ihrer Rolle** (`MDX.roleProg`, Mono-Gruppe und Dynamik-Kurve
  bleiben am Kanal) – **ein** Undo, Toast mit [Rückgängig] – und die Platte öffnet sich. Spielen schon alle North, öffnet sie direkt.
  Die LED der Taste leuchtet, wenn das ganze Kit North spielt.
* **Knopf „North / PLATTE“** in Zeile E der SOUND-Seite eines North-Pads.
* In der Platte: ⋯ → Programm ▾, Kanal ▸ (Kopieren/Einfügen/Tauschen/Init/Programm sichern – die Funktionen des Editors),
  Quelle dieses Pads, „Alle Pads North“, Zum Editor.

## Daten – keine zweite Datenhaltung

Jede Bedienung geht über die Wege des North-Editors: `mdSet` (inkl. ALLE KANÄLE, PITCH relativ), `mdScl`, `mdKitSet`, `mdTap`,
`mdLoadProgram`, `mdSetSrc`, `loadKit`; Undo über `soundSnapshot(DRUM_T)` beim Aufsetzen und `commitSound` beim Loslassen (**ein
Schritt je Geste**), Listen über `mdList` / `mdProgPop` (die Popover des Editors). Gespeichert wird nur, was der Editor speichert
(`slot.md`, `p.md`); Plattenzustand (Sektion, Zoom, Bank, SHIFT, Rad-Modus) ist Ansicht und wird nie gespeichert. ALLE KANÄLE und
SOLO PART enden mit dem Schließen (Regel 6), wie beim Editor. Bibliothek: eigene Programme (`mdp`) erscheinen im PROG-Rad nach den
Werks-Programmen.

## Technik

* **Block `sq-ndp-src`** (`<script type="text/plain">`, Muster `sq-mk-src`): wird erst beim ersten Öffnen ausgewertet (`ndpLoad`,
  ≈ 2 ms), setzt dann auch das Platten-CSS ein. Im Haupt-CSS steht nur der Block `/* NDP-CSS-BEGIN */ … /* NDP-CSS-END */` mit drei
  Regeln (Kopf-Knopf, PLATTE-Knopf, Hauptschirm verdecken).
* Die Platte ist ein eigenes Vollbild (`#ndp`, z-index 52 – unter Popover/Toast), der Hauptschirm darunter wird nicht gemalt
  (`#app.ndpon{visibility:hidden}`), damit 60 Bilder/s beim Drehen bleiben. Neuzeichnen nur, wenn sich Zähler ändern (Undo, Daten,
  Kanal, Transport) – ein Zeichenketten-Vergleich je Bild.
* Hoch-/Querformat: Raster mit zwei Aufteilungen, Reglergröße und Rad aus dem freien Platz (eine Messung je Aufbau), Drehen baut neu.
* Beim allerersten Öffnen ohne laufendes Audio startet `ensureAudio()` im Tipp (iOS), die Platte baut im nächsten Bild – zwei
  getrennte Aufgaben statt einer langen.
* Geänderte Stellen der App (alle mit `// NDP`): Kopf-Knopf in `buildDrumEd`, PLATTE-Knopf in `pageMdSound`, `closeSheets`
  schließt auch die Platte, Funktionen `ndpLoad/ndpOpen/ndpClose/ndpChoose/ndpHeadKey`, Test-API `ndpOpen/ndpClose/ndpInfo/ndpView/ndpChoose/ndpLoadMs`.
* Quellen des Pakets: `quelle/` (`ndp.css`, `ndp-platte.css`, `ndp-block.js`, `ndp-main.js`, `bau.py` baut `index.html` aus R-4300).

## Zusammenspiel mit NORTHI (Zweig north-instrument)

NORTHI baut North-Einträge in Kit-Browser/Instrumentliste und den Schalter „Drums | North“. Die Platte braucht davon nichts und
fasst diese Stellen nicht an. Beim Zusammenführen: der Schalter „North“ von NORTHI kann `ndpChoose()` (Instrument-Wahl, ein Undo)
und `ndpOpen()` aufrufen; dann kann mein Kopf-Knopf entfallen oder zum reinen „Platte“-Knopf werden (eine Zeile in `buildDrumEd`).

## Fragen an Xander

1. **Kopf-Knopf:** Soll „● North“ im Drum-Editor bleiben, wenn NORTHI den Schalter „Drums | North“ bringt – oder soll dann nur noch
   der Schalter die Platte öffnen?
2. **Instrument-Wahl:** Pads, die schon North spielen, behalten ihr Programm; nur Drum-Pads bekommen das Rollen-Programm. Oder sollen
   bei „North wählen“ **alle** 12 Pads auf ihr Rollen-Programm zurück?
3. **Anschlag der Kanal-Tasten:** nach Tipp-Höhe (oben laut, unten leise) – oder fest 0,8 wie ▶ im Editor?
4. **Rad im Modus KIT:** wählt nur die North-Kits. Sollen auch deine eigenen Kits mit North-Pads dabei sein?
5. **Farbe:** Rot wie jetzt (hsl 355°/78 %/41 %) – oder dunkler/heller? Die Platte im Bild: `tests/bilder/platte-H.png`, `platte-Q.png`.
