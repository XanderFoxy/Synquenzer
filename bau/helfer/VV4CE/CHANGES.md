# VV4CE — Video zeigt die echte App: Piano-Roll, Drum-Sequenzer, echte Modulationen (VV4-C + VV4-E)

Basis `bau/snapshots/R-4261.html` (App 4.26.1). `VERSION` unverändert `4.26.1`, Format 5 unverändert, `live: true` unverändert,
keine Netz- oder Datenbank-Zugriffe. Patch: `patch.diff` (diff -u gegen R-4261). Nur Video-Code; Klang, Regler und Projekte bleiben gleich (Regel 28).

## Was 4.26.0 schon erledigt hatte (nicht neu gebaut)
- V-B „Innenansicht nur mit echten Bewegungen“: ein Regler im VV3-Innenleben bewegt sich nur bei echter Modulation; LFO-„Oszilloskop“
  und Filterkurve sind weg. LFO-/Hüllkurven-Rechnung (VV3) ist exakt. Das bleibt so und wird hier weiterbenutzt.

## Neu
### VV4-C Piano-Roll-Bild und Drum-Sequenzer-Bild
- **Spur-Bild = Bild wie in der App.** Wo die Auto-Regie (und ein Eintrag „Spur …“) heute „Spur“ zeigt, kommt jetzt:
  - Synth-Spur → **Piano-Roll** im Look des Roll-Editors (`PianoRoll.draw`): Zeilen in/außerhalb der Skala, Grundton-Zeile in
    Spurfarbe, Rasterlinien (Takt/Schlag/Sechzehntel), Takt-Chips im Lineal, Tastenleiste, Noten mit Anschlag-Deckkraft und
    Notennamen, Laufstrich wie `.pr-ph` (grün, 2 px). **Klingende Noten sind umrandet** (Rahmen wie eine gewählte Note, `--sel`).
    Gezeigt werden die echten `clip.notes` des laufenden Clips; lange Clips blättern wie FOLGEN (Seite = ganze Takte).
  - Drum-Spur → **Drum-Sequenzer**: das Schritt-Raster der SCHRITTE-Seite (Instrument-Chips `.vchips.v12`, `.se-cell` mit
    Anschlag-Füllung und Akzent-Strich, Laufschritt mit weißem Rahmen `.ph`, 16×1 quer, 8×2 hochkant wie `.se-row`).
    Das gezeigte Instrument wechselt **zwischen Kick und Snare nur bei einem Treffer des anderen Instruments und höchstens 1× je
    Schlag** (auch wenn die Snare zusammen mit der Kick trifft). Darunter läuft die **Hi-Hat-Zeile** (HH ZU; hat der Clip nur
    offene Hi-Hat, HH OFFEN) mit. Ein Treffer leuchtet wie der Antipp-Blitz der App (`.se-cell.fl`: 3-px-Ring `--sel`, 0,2 s).
    D1-Spuren mit eigener Länge/Richtung laufen mit ihrem eigenen Schritt (`d1Pos`).
  - STIMME-Spur → unverändert die Wellenform (VV3).
- `vvDrawSpur` (seit VV3 abgehängt) ist wieder benutzt: es zeichnet jetzt das Roll-Bild im App-Look.
- Zeichner: `vvDrawRoll(g, t, rect, track)`, `vvDrawDrumSeq(g, t, rect, track)` (rect in Leinwand-Pixeln, t = Videozeit des
  letzten Renders; optional 5. Argument = ein anderes Render-Ergebnis).

### VV4-E Echte Modulationen
- **Nur bei echter Modulation** (Regel 2.1): `sound.mods` mit Stärke ≠ 0, Filter-HK-Intensität ≠ 0, Geräte-Patch mit Intensität ≠ 0,
  Mod-Sequenz, Vibrato nur mit Mod-Rad > 0. Keytrack, Anschlag→Filter, Analog-Zufall zählen nicht (sie bewegen nichts).
- **Automatisch:** hat die gezeigte Spur eine echte Modulation, steht neben der Roll (quer rechts, hochkant darunter) das
  Modulations-Bild. Ohne echte Modulation: nur die Roll, kein Regler im Bild.
- **Wahl:** Bild-Zeile „Video“ → [Spur …] → neue Zeile **[Modulation]** mit den Spuren, die eine echte Modulation haben
  (Eintrag `{a, b, v: 'mod', t}` in `song.video`, 1 Undo-Schritt; `vvDirSet(a, b, 'mod', t)` lehnt eine Spur ohne echte Modulation ab).
- **Gezeigt werden nur App-Elemente:** die App-Regler (`makeCtl`: Bogen r 22, Kappe, Zeiger, Wertzeile) der Ziele mit
  **Mod-Ring `.kmr`** (r 26,5, Farbe der Quelle, Überstand `.kmx` zu 35 %) und **Live-Punkt `.kdg`**, dazu die
  **K1-Mod-Übersicht** (Kopf „Modulationen · Spur“, Zeilen „Quelle → Ziel“ mit Stärke und ✕-Feld, Reihenfolge = `k1Mods`).
  Geräte-Engine: die Geräte-Platte der App (VV3, Regler mit Mod-Bogen) + K1-Übersicht.
- Live-Punkt = Reglerwert + Σ Stärke/Ring-K × Quelle(t); Quellen aus der VV3-Rechnung (LFO-Phase mit Sync/Retrig/Fade,
  Hüllkurven, Anschlag, Taste, Mod-Rad) – dieselbe Formel wie `makeCtl.anim`.
- Weg aus dem Spur-Bild (gibt es in der App so nicht): die VV3-Panels „REGLER“, „EG · HÜLLKURVE (AMP)“, „EG 1/2“, „MOD SEQUENCE“,
  „CUTOFF“, „ALGORITHMUS“/„OPERATOR-PEGEL“ und die 12 Drum-Pads. Sie bleiben nur noch für die VV3-Test-API (`vv3Probe`/`vv3Png`)
  erhalten, damit alte Tests unverändert laufen.
- Zeichner: `vvDrawMod(g, t, rect, track)` (ohne echte Modulation: das Spur-Bild).

### Sonde (2.1 Nr. 4)
- `VV4.probe.els` listet jedes gezeichnete Element mit seinem App-Gegenstück (z. B. „Laufschritt → StepEditor .se-cell.ph“,
  „Mod-Ring → .knob .kmr / .kmx“). Test-API: `SYNQUENZER.vv4Probe(kind, i, t, fmt)`, `vv4Png`, `vv4HasMod`, `vv4SpurKind`,
  `vv4DrumSw`, `vv4Log`.

## Geänderte Stellen (alles im Video-Teil)
`VV_DIRV` (+ 'mod'), `vvDirSame`, `vvDirNorm`, `vvDirOf`, `vvDirSet`, `vvDirRow`, `vvDirTap` (Zeile [Modulation]), `vvCuts`
(Einträge 'mod' wie 'spur'), `vvDrawStripe` (Farbe der Spur), `vvDrawSpur`, `vvDrawView`, `vvDrawShot` (9:16 Kamera: Spur-/Mod-Bild
hochkant), `vv2Api.vvShot` ('mod:t'), CSS eine Zeile (`.vvsp + h4` Abstand, damit die 44-px-Trefferflächen frei bleiben),
neuer Block `VV4CE` hinter `VV3-END`, `Object.assign(SYNQUENZER, vv4Api())`.

## Regel 26 (überholte Erwartungen)
- Bildvergleiche, die das VV3-Innenleben als Spur-Bild im fertigen Video erwarten, sind durch VV4-C absichtlich überholt (das
  Spur-Bild ist jetzt Roll / Drum-Sequenzer). `n5-v-vv2-01` vergleicht über `vvShot` und bleibt grün.

## Fragen an Xander
- Keine Entscheidung offen. Vorschlag (nicht gebaut, VV4-B/D): eigene Wahl [Piano-Roll]/[Drum-Sequenzer] im Bild-Menü und
  „erster Auftritt eines Clips → Piano-Roll“ gehören in die Pakete Bild-Menü und Auto-Regie 2.
