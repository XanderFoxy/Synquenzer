# CHANGES – Paket PINSEL (Melodie-Pinsel), Basis R-4261 (App 4.26.1, VERSION unverändert)

Alles Neue trägt das Präfix **mp** und steht zwischen `MP-BEGIN … MP-END` bzw. hinter `/* MP */`. Einzeiler sind am Ende markiert.
`patch.diff` = `diff -u bau/snapshots/R-4261.html bau/helfer/PINSEL/index.html` (20 Stücke, nur Einfügungen außer 4 Zeilen, s. u.).

## Neu
### Piano-Roll (Block 5, `PianoRoll.create`) – gilt in Szenen-Clip, eigenem Song-Clip und Song-Melodie
- **[Pinsel]** (Werkzeugleiste, eigene Gruppe hinter ✎ ⬚ ⌫): Finger malt über einen Lauf, Noten im Einzugsbereich folgen der
  Fingerhöhe mit weichem Abfall (`w = ½(1+cos(πd/R))`), gerastet in die Tonart der Stelle und mit dem Anfang auf das Raster;
  Breite [schmal] [mittel] [breit] = R 0,5 / 1 / 2 Schläge; [Tonart: Auto | …] mit Wahl Grundton + Modus (nur Sitzung);
  leises Vorhören (0,35) der Note unter dem Finger; Band + Linie zeigen Breite und Höhe; ein Undo „Pinsel“ pro Zug; Tippen = Pinselpunkt.
- **Block-Werkzeuge** (Aktionsleiste, eigene Gruppe hinter Teilen/Verbinden): [Umkehren ↕] (Stufen-Spiegelung um die Achse,
  in Tonart gerastet), [Achse: 1. Note | Mitte], [Krebs ↔] (rückwärts im Bereich), [Tauschen ⇆] (Hälften des Bereichs tauschen).
  Bereich = Lineal-Takte, sonst Auswahl, sonst ganzer Clip; je Tipp ein Undo.
- **[Mithören]** (Werkzeugleiste): Leiste in der Aktionsleiste mit Spur-Chips, [Ohne Drums], [Alle ab], [Fertig].
- Querformat: der Kopf-Titel behält die Breite ohne Pinsel-Gruppe (Mindestbreite, je Kopfbreite einmal gemessen).
- Test-Haken `rollApi().mp` (state, keyAt, panel, setWidth, setAxis, setKey).

### App
- `mpRollOpts(t, id, keyAt)` an die drei `PianoRoll.create` (je eine Zeile `mp: …`): Tonart der Stelle
  (Szenen-Clip: `shownClipKey`; Melodie/eigener Clip: `songKeyAtBar`) und die Mithören-Funktionen.
- Mithören-Modul `MPL` / `mpTick()` / `mpListenInfo()` (vor „V0b FOLGEN“): ausgenommene Spuren bekommen einen eigenen Gain
  zwischen `A.post` und `A.cut` (erst angelegt, wenn eine Spur ausgenommen wird; Rampe 20 ms); `mpTick()` je Bild im Frame-Loop
  (nur bei Änderung wirksam). Schließen des Editors (jeder Weg) = alle Pegel 1. Song-JSON, `tr.mute`, Undo unberührt.
- `SYNQUENZER.mpListen()` (Test-Haken).

## Geänderte bestehende Zeilen (für den Merge wichtig)
0. CSS-String der Piano-Roll: die letzte Zeile `@keyframes prRun{…}` endet nicht mehr mit `` `; ``, die mp-Regeln hängen dahinter.
1. `const label = k => ({… marquee: null})[k];` → zusätzlich `mpBrush: 'Pinsel'`.
2. `mainUp`: `gst = null; render();` → `gst = null; MB = null; render();`
3. `abort`: `gst = null;` → `gst = null; MB = null;`
4. Toolbar: die Gruppe wird hinter `const tb = {draw, select, erase};` eingefügt (eigenes `sep`); in `promote`, `drag`, `tap`
   je eine Zeile/Case `mpBrush` am Anfang; in `draw()` je eine Zeile `mpHostFix()`, `mpDraw(x, C)`, `mpRender()`.
Alles andere sind reine Einfügungen. Für „Magic Scale“: Ihre Werkzeuge bitte als eigene Gruppe daneben; `E.tool`-Werte
anderer Präfixe stören den Pinsel nicht (er reagiert nur auf `'mpBrush'`).

## Unverändert (geprüft, `tests/t-alt.mjs`)
▲/▼ Stufe, ±12, Spiegeln, Umdrehen, Teilen, Verbinden, Legato, Dupl., Takte ±, ✎ Tippen, Note ziehen, ⌫ Wischen, Undo-Zähler:
Ergebnis in R-4261 und PINSEL identisch. Keine Klang-/DSP-Änderung (Regel 28): der Mithören-Gain wird nur für ausgenommene
Spuren angelegt und steht sonst auf 1 (Multiplikation mit 1 = bitgleich).

## Fragen an Xander
1. **Tauschen**: „zwei gewählte Abschnitte“ ist umgesetzt als die zwei Hälften des im Lineal markierten Bereichs
   (z. B. Takte 1–2 → 1 ↔ 2, Takte 1–4 → 1–2 ↔ 3–4). Möchtest du stattdessen zwei getrennte Abschnitte frei wählen (A merken, B wählen)?
2. **Pinsel und Zeit**: berührte Noten rasten mit dem Anfang auf das Raster (bei einem schon gerasterten Lauf ändert sich nichts).
   Soll der Pinsel die Zeit gar nicht anfassen?
3. **Mithören gemerkt**: pro Clip für die Sitzung (nicht im Projekt, damit der Song unverändert bleibt). Soll es mit dem Projekt gespeichert werden?
4. **Mithören je Spur**: man wählt Spuren; es spielt jeweils der Clip, der dort gerade läuft. Reicht das, oder einzelne Clips einer Spur?
