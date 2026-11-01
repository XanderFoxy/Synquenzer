# SX8 – Pinch-Zoom im Song (App 4.31.0, Basis R-4310)

- **Zwei Finger zoomen** im Song-Fenster: von „Schläge sehen“ (192 px je Takt, Schlag-Linien) bis „ganzer Song“.
  Der Punkt zwischen den Fingern bleibt unter den Fingern. Während der Geste wird das Bild nur verschoben/gestreckt,
  neu gezeichnet am Ende (flüssig, 60 Bilder/s).
- **Ganz weit draußen** (unter 10 px je Takt) werden die Teile zu **Farbblöcken mit Namen** (Teil-Farbe, sonst Amber).
  Taktzahlen stehen dann nur noch jede 2./4./8. …
- **Doppeltipp mit zwei Fingern** = ganzer Song. Noch einmal = zurück zum Zoom davor (oder 36 px).
- **Mini-Karte**: Marke (oder Block) halten und weit ziehen → unten (oder oben, wenn der Finger unten ist) erscheint der ganze
  Song mit den Teilen, dem sichtbaren Rahmen und der Einfüge-Linie. Finger auf die Karte → die Ansicht gleitet dorthin, die
  Marke landet an dem Takt.
- **Zoom bleibt je Projekt** (UI-Einstellung im Gerät, nicht in der Projekt-Datei).
- Mitskalieren: Marken, Lineal, Abspiel-Linie, Schleife, Zellen, Glas-Kacheln, Video-Streifen, Gesangs-Wellen, Blöcke, Akkord-Chips.
- Trefferflächen: Schleifen-Griffe verschwinden, wenn die Schleife schmaler als 36 px ist (statt winzig). Schmale Marken
  treffen mit 44 px um ihre Mitte. Unter 20 px je Takt wird keine Zelle mehr per Tipp geändert – ein Tipp zoomt dorthin (36 px).
- Teil-Name im Lineal bleibt am linken Rand sichtbar, auch wenn der Teil links aus dem Bild ragt.
- Projekt-Format 5 unverändert, alte Projekte Zeichen für Zeichen gleich.
