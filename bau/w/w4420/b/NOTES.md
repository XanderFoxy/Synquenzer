# MA1 – Modulation an jedem Regler sichtbar

**Für Xander:** Der Punkt am Regler zeigt jetzt immer die Summe aller Quellen, die auf diesen Regler wirken – auch wenn du gerade im Modulier-Modus einer anderen Quelle bist (vorher stand z. B. Resonanz mit LFO 2 still, solange LFO 1 gewählt war). Die Hüllkurve 2 schlägt bei jeder Note sichtbar an und fällt zurück. Auf der MS 2000-Platte bekommen die Ziel-Regler der PATCH-Wege (Cutoff, Pan, Pegel, Rauschen, Steuer 1, Osz 2 Fein, LFO 2 Tempo) denselben Bogen mit Punkt wie die anderen Regler.

## Ursachen (gefunden)
- Mod-Modus (§9.3): `makeCtl.anim` rechnete nur die Wege der gewählten Quelle (`act` = gefilterte `routes`); ein Regler, der nur von einer anderen Quelle moduliert wird, hatte keinen Punkt und keine Bewegung.
- Regler, die gebaut wurden, bevor die Worklet-Engine der Spur da war, hielten Wege außerhalb der nativen Teilmenge (LFO → Pitch/Cutoff/Amp/Pan) für „nicht hörbar“ und bewegten sich nicht (Cutoff ja, Resonanz nein) – möglicher zweiter Weg zum selben Bild.
- MS 2000-Platte (MKUI): gar keine Modulationsanzeige an den Reglern.
- WT (nativ): LFO → Resonanz ist dort wirklich nicht hörbar → bleibt schraffiert („nur mit Worklet“), das ist richtig.

## Technisch
- `makeCtl`: neue Liste `ma1H` = alle gehörten Wege des Ziels (auch im Mod-Modus); `anim()` summiert sie (ein Ausschlag), `k.hasMod`, Klasse `mlv` (CSS `.knob.mlv .kdg` / `.fader.mlv .fdot`), `--mc` bleibt gesetzt. Ring/Bogen-Logik im Mod-Modus unverändert.
- `modFrame`: wechselt `trackOnWorklet(i)`, werden die Regler einmal neu bewertet (`k.update()`).
- MKUI-Block `MA1` (`ma1Frame`, Einhängezeile am Ende von `frame()`): PATCH 1–4 des gezeigten Timbres, Quelle × INT/63 × Spanne (W-18, = `MK_PSPAN`), Werte aus `mkScope` (jüngste Stimme des Timbres: EG 1/2, LFO 1/2, Anschlag, Keytrack), ≤ 30 fps, SVG-Bogen + Punkt nur an Reglern mit Weg; Worklet-`scope()` liefert zusätzlich `vel`.
- Werte = die der DSP (Worklet-Scope der Fokus-Stimme, 30 Hz); WT/FX-Regler: native LFO-Phase wie bisher.
- Nicht drin (nächster Schritt): Bit-Mask-Panel, SPIEL-Ansicht der Platte, MOD-SEQUENCE-Anteil an PATCH-INT, Ziel Tonhöhe (kein Regler); ohne frischen Worklet-Scope bleiben Hüllkurven bei 0 (nur LFO nativ).

## Tests
- `ma1-test.mjs` (Analog: LFO 1 → Cutoff, LFO 2 → Resonanz, Hüllk. 2 → Cutoff; Mod-Modus LFO 1; Platte: PATCH LFO 1 → CUTOFF, EG 1 → PAN): 8/8 grün, keine Konsolenfehler. Fotos `ma1-analog.png`, `ma1-modmodus.png`, `ma1-platte.png`.
- topdefs: 0 Syntaxfehler, 0 doppelt (4871 Namen wie Basis). smoke: errors []. Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1.

## Gegenprüfung (MA1-GP)
- Für Xander: Auf der MS 2000-Platte bewegt sich der Punkt jetzt auch mit dem MOD-Rad und dem PITCH-Rad, wenn ein PATCH-Weg sie als Quelle nutzt (vorher stand er dort still).
- Fehler behoben: `ma1Frame` las das Mod-Rad aus `mk().mw` (gibt es nicht → immer 0) und Bend fest als 0. Jetzt `mkWheelVal(P.i, 'mod' | 'bend')` wie die Räder der Platte (0..1 bzw. −1..1, = `modw`/`bend` im Worklet). Eine Zeile + ein Ausdruck, Kürzel MA1.
- Geprüft und in Ordnung: Normal-Modus verhält sich wie die Basis (nur der Mod-Modus ist neu); später Motor (Engine weg/wieder da, Editor offen) → Resonanz wird ohne Neuaufbau wieder hörbar; Weg löschen/Undo; Platte: SPIEL-Reiter entfernt die Bögen, zurück genau einer; INT 0/Undo; DUAL mit Timbre 2; Vocoder ohne Bögen; Stop → Punkt aus; `frame()` ≈ 0,002 ms; Video-Zeichnung (VV4 `vv4Knob`) liest eigene Daten, unberührt. Basis unverändert (md5 = w4410/basis.html).
- Tests: `ma1-gp-test.mjs` 11/11 (J = MOD-Rad; ohne Fix rot), `ma1-test.mjs` 8/8, topdefs 0/0 (4871 Namen), smoke errors [], Markenwörter 0, „MS 2000“ 1, „  live: true,“ 1.
- Rest-Risiken: Mod-Modus zeigt jetzt bewegte Punkte auch an Reglern anderer Quellen (Punkt = Summe, Bogen = nur die gewählte Quelle → Punkt kann außerhalb des Bogens liegen). Sehr kurze Hüllkurven (< ~60 ms) kann der 30-Hz-Scope verpassen. Bit-Mask-Seite noch ohne Anzeige. Quelle BEND trägt auf der Platte die Farbe „Zufall“ (es gibt keine eigene Farbe).
