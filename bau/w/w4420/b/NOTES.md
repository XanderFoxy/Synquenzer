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
