# MAGIC – Magic Scale im Noten-Editor (Basis 4.26.1, VERSION unverändert)

## Neu
- **[Magic]** in der Werkzeugleiste des Noten-Editors (ROLLE) öffnet eine eigene Werkzeug-Zeile (`.prms`, Präfix `ms…`).
  Ohne [Magic] verhält sich der Editor genau wie 4.26.1 (Regressionstest gegen R-4261 identisch).
- **[Wischen]**: Finger wischt, jede Rasterzelle unter dem Finger bekommt eine Note (Raster wie gewählt, „frei“ = 1/16).
  Tonhöhe rastet nur auf erlaubte Töne der Tonart der Stelle, nächste Lage zur Fingerhöhe, mit Hysterese (kein Flackern).
  Schnelle Züge: übersprungene Zellen aus der Linie gefüllt. Zurück nach links = Noten des Zugs wieder weg.
  Vorhören kurz und leise (vorhandenes Vorhören, Anschlag 0,45). Ein Undo-Schritt je Wischzug.
- **Modi** [Tonart] [Terzen] [Terz+Quinte] (Terzen = Terzen-Kette ab dem ersten Ton; Terz+Quinte = Dreiklang auf dem ersten Ton).
- **Tonart**: [Auto: … ▾] = erkannte Tonart (Szenen-Clip: erkannte Clip-Tonart wie in der Kopfzeile; Song-Melodie: `songKeyAtBar`
  je Takt; eigener Clip: Clip-Tonart). Manuell: Auto / 12 Grundtöne / Dur / Moll – gilt, solange der Editor offen ist.
- **[Pause]**: Zelle(n) tippen/ziehen → dort beginnende Noten fallen weg, alles andere bleibt im Raster.
- **[Pause +]**: tippen = eine Zelle Pause einschieben, ziehen = mehrere; Nachfolgendes rückt im Raster, Clip wächst bis 64 Takte.
- **[Akkorde]**: Akkorderkennung (≥ 3 gemeinsam beginnende Noten, `Harmony.detectChord`), Namen als Schild über dem Akkord
  (nie über einem Akkordton). Akkord antippen = wählen; Bereich über Taktnummern (vorhandene Takt-Auswahl).
  [Umk. ▲] / [Umk. ▼] je Akkord (tiefster Ton +12 / höchster −12), [Glatt] = Umkehrungen mit kleinsten Stimmsprüngen.
- **Takt-Leiste halten (0,35 s) + ziehen** (nur bei offener Magic-Zeile): ab diesem Takt bzw. ab Bereichsanfang rückt alles im
  Raster mit (Ripple); nach links wird Überschriebenes entfernt; Clip wächst bei Bedarf. Ein Undo-Schritt. Gab es im Noten-Editor
  noch nicht; das Song-Verschieben ist nicht angefasst.

## Eingriffe in vorhandenen Code (klein, für den Merge)
- PianoRoll: 8 Haken-Zeilen, alle mit `/* MAGIC */` markiert (attach nach extraTools, promote, drag-case `'ms'`, mainUp, tap,
  draw, Lineal-onDrag, api.ms + destroy). Das Modul `G.MagicScale` steht als eigener `<script>` direkt nach PianoRoll; eigenes CSS
  (`#ms-css`), Grid-Zeile 6 nur bei `.pr.ms-on`.
- App: `msKey`/`msKeyName`/`msNoteNames` in den drei `PianoRoll.create`-Aufrufen (Szenen-Clip, Song-Melodie, eigener Clip; Drum = aus).
- Keine neuen Projektfelder, kein Klang geändert (Regel 28), keine Netzzugriffe.

## Entscheidungen (professionell gesetzt, Regel 30)
- „Wisch-Tempo/Schräge → Notenabstand“: umgesetzt als Schräge = Tonschritt je Zelle, Länge = Laufdauer, immer im Raster; ein schneller
  Zug lässt keine Löcher (Zellen aus der Linie gefüllt). Kein eigener Tempo-Modus.
- Wischen fügt hinzu (vorhandene Noten bleiben, gleiche Note an gleicher Stelle wird nicht verdoppelt).
- Pausen in zwei Werkzeugen: [Pause] (Lücke, Nachfolgendes bleibt stehen) und [Pause +] (einschieben, Nachfolgendes rückt im Raster).

## Fragen an Xander
1. Soll ein schneller Wischzug dünner setzen (z. B. Achtel statt Sechzehntel), also Tempo → Abstand zusätzlich zur Schräge?
2. Wischen über vorhandene Noten: hinzufügen (jetzt) oder den Lauf dort ersetzen?
3. Soll die manuell gewählte Tonart im Clip gespeichert werden (jetzt nur solange der Editor offen ist)?

## Tests (bau/helfer/MAGIC/tests, `sh tests/alle.sh`)
- ms-funktion: C-Dur/a-Moll/manuell D-Dur, Raster 1/16 und 1/8, schneller Zug, Zurückwischen, Terzen, Terz+Quinte, Pause, Pause +,
  Akkorderkennung C Am F G, ▲/▼ exakt (C E G → E G C → G C E), Glatt, Undo/Redo, Speichern/Laden, Ripple, Song-Melodie, Konsole.
- ms-layout: 428×926, 926×428, 390×844, 320×568 – Zeile ≥ 44 px, Seitenhöhe gleich, Tonart-Wahl; Bildrate beim Wischen 60 fps (p95 17 ms).
- ms-regress: alte Werkzeuge (✎, verschieben, ⌫, Lineal) R-4261 gegen MAGIC identisch. Rauchtest bau/tests/smoke.mjs: keine Fehler.
  Zusätzlich bau/tests/v3-qa-vs2reg-roll.mjs (Pfade angepasst) Basis gegen neu: gleich.
