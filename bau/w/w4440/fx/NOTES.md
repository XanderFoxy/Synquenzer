# FX1 – Fills und Breaks als eigene Ebene, frei platzierbar, Snare-Fehler

## 1. Für Xander

- **Snare-Fehler behoben:** Ein Tom-Fill nimmt dem Drum-Clip nur noch die Toms weg. Snare, Kick und Hats spielen im Überblendbereich weiter. Das gilt auch für deine alten Songs.
- **Ersetzen oder Mischen:** Tippe im Song auf den Fill-Chip. Im Blatt wählst du **Ersetzen | Mischen**. Bei Ersetzen legst du fest, was schweigen soll: **Alle**, **Nur Toms** (das, was der Fill selbst spielt) oder **Pads …** (einzeln). Ein Fill im Modus Mischen hat einen hellen Rahmen-Chip.
- **Frei setzen:** Öffne **◆ ÜBERGÄNGE** und tippe auf eine Kachel (Tom-Fill, Snare-Wirbel, Crash, unter Breaks: Drop, Stille). Tippe dann irgendwo in den Song, auch mitten in einen Takt. Vorne in der Kachel-Zeile stellst du das **Raster** ein (1/4 · 1/8 · 1/16 · frei). Wie bisher kannst du eine Kachel auch ziehen: An einer Teilgrenze rastet sie wie gewohnt ein, sonst landet sie frei.
- **Nachträglich bearbeiten:** Einen Chip ziehst du frei an eine andere Stelle. Am Griff rechts ziehst du die Länge. Im Blatt gibt es ◀ ▶ (um einen Rasterschritt verschieben) und Länge − / +. Mit **Noten …** öffnest du das Drum-Schritt-Raster mit den Pads und VEL/AKZ./CHANCE/WIRB./TIM./TUNE/DEC.
- So probierst du es aus: Leg einen Groove mit Snare auf 2 und 4 an und setz den Tom-Fill auf Takt 4. Mit ▶ SONG hörst du die Snare weiter. Stell den Fill auf **Ersetzen → Alle**: Dann ist der Groove still, so wie früher.

## 2. Technik (nur additiv, Format bleibt 5)

**Daten in `song.ue`** (UE-A/B §1.5, ergänzt):
- `at`: freier Start als Song-Schlag, dazu `a = 0`. Das gab es schon für Einwürfe, jetzt nutzen es alle Kinds.
- `mode`: `'ersetzt' | 'dazu'`. Die interne Schreibweise bleibt. `'ersetzen'` und `'mischen'` werden beim Normalisieren übernommen.
- `pads`: Liste von GM-Pads (nur bei Ersetzen). Fehlt die Liste, schweigen alle Pads (wie bisher). Bei einem Fill (k fill/tom/build) mit Ersetzen ohne `pads` setzt `fllNorm` die Pads der eigenen Noten. Das ist die **Migration bzw. der Fehler-Fix** beim Laden. Stopps (k crash) und Breaks bleiben ganz. „Alle“ in der Bedienung speichert ausdrücklich die 12 Pads.
- Ein Song ohne Übergänge und ein Song nur mit Becken-Stopp speichern byte-gleich wie in 4.42.0 (geprüft).

**Neuer Block `FX1-BEGIN … FX1-END`** (nach `UE_API`, vor `const SYNQUENZER`), Präfix `fll`:
- Daten: `fllNorm`, `fllPadSet`, `fllOwnPads`, `fllSnap`, `fllStepTo`, `fllWhere`, `fllPadsName`
- Bearbeiten (je 1 Undo): `fllPlace`, `fllMoveFree`, `fllNudge`, `fllLenStep`, `fllSetMode`, `fllSetPads`, `fllSetStop`, `fllGridCycle`
- Tipp-Setzen: `fllArm`, `fllDisarm`, `fllLsn` (gewählt endet mit jedem anderen Tipp), `fllBarPaint`, `fllSvTap`
- Ziehen: `fllDragFree`, `fllDrop`, `fllSvDraw` (Vorschau, Mischen gestrichelt), `fllChip`, `fllGripArm` (freie Fills: Länge nach Raster)
- Blatt: `fllSheetRows`, `fllSheetAct`
- Noten: `fllStepModel` (StepEditor-Modell auf die Noten der Ebene), `fllNotesOpen`, `fllNotesPaint`
- MIDI: `fllMidiMutes`, `fllMidiAdd`
- Vorlagen über `ueLibAdd`, ans Ende angehängt: `fx-tom-fill`, `fx-snare-wirbel`, `fx-crash` (Mischen), `fx-drop` (Break, Drums still), `fx-stille` (Break, alle außer STIMME)
- Bedienzustand `FLL` (Raster in localStorage `synq-fll-grid`, mit try/catch)

**Einhänge-Zeilen in bestehenden Funktionen** (alle mit `FX1` markiert):
- `ueNorm` (`fllNorm`), `ueBuild` (Fenster `[s, E, Pads]`), `ueMutes` (w[2] mitnehmen), `ueMutedAt(l, B, n)` (pad-genau)
- `scheduleDrums` und `d1Sched` (`nt.n` übergeben), `buildMidiSong` (3 Zeilen), `svTap` (1 Zeile)
- `uePaintBar`, `ueDragMove`, `ueDragBegin` (Hinweis „Noch keine Teilgrenze“ → nur noch ohne Song), `ueDragUp` (3 Stellen), `ueGripArm`, `ueSvDraw`, `ueChipsSync`, `ueChipSheet`/paint
- Test-API: `Object.assign(SYNQUENZER, FLL_API)` am Ende der Liste, vor `NO_SYNC`

**CSS-Block `FX1-BEGIN … FX1-END`** gleich hinter dem UE-B-CSS: `.fll-grid`, `.ue-tile.fll-arm`, `.ue-chip.fll-mix`, `.ue-chip.fll-free`, `.ue-ghost.fll-free`, `.fll-rows/.fll-pos/.fll-at/.fll-pg`, `.fllsheet …`

**Test-API:** `fllPlace`, `fllMove`, `fllNudge`, `fllLen`, `fllMode`, `fllPads`, `fllStop`, `fllGrid`, `fllSnap`, `fllArm`, `fllArmed`, `fllNotes`, `fllNotesInfo`, `fllMidi`

**Video:** Der Ton im Video kommt aus demselben Scheduler (Offline-Render), deshalb ist die Ebene pad-genau drin. Freie Fills lösen über `vv4UeWin` (`at`) auch den Schnitt auf den Drum-Sequenzer aus. Der Render bleibt deterministisch: kein neuer Zufall.

## 3. Tests und Ergebnis

`fx1-test.mjs` (Playwright, Touch, 428×926 und 926×428) liefert **25/25 OK**, siehe `fx1-test.log`:
- **Tom-Fill über Takt 4, Mischen:** Snare auf 13 und 15 im Noten-Log (Offline-/Video-Render), 16 Tom-Treffer.
- **Ersetzen (Standard = nur Toms):** Snare und Kick bleiben.
- **Ersetzen = Alle:** Der Groove schweigt im Bereich (Gegenprobe des alten Verhaltens).
- **MIDI-Export:** Mischen ergibt +16 Noten, Ersetzen-Alle ergibt +16 − 12.
- **Altes Projekt (Tom-Wirbel ohne Pads an der Kante):** Wird beim Laden zu Toms, die Snare bleibt. Der Becken-Stopp schweigt weiter ganz.
- **Tipp auf die Kachel „Snare-Wirbel“, dann Tipp in die Drum-Zeile bei Takt 4 · Schlag 3,5 (Raster 1/8):** Ergibt `at = 14.5`. Klingt ab 14,5, die Hats laufen weiter. „Gewählt“ endet danach.
- **Chip frei ziehen (Raster 1/4) und Griff rechts:** Länge 2 → 6 Schläge.
- **Blatt hochkant und quer:** Alle Tasten ≥ 44 px, ✕ sichtbar, nichts läuft über. Mischen per Tipp ist 1 Undo-Schritt, Undo funktioniert, ▶ geht einen Rasterschritt weiter.
- **Noten-Raster (quer):** Ein Tipp schaltet den Schritt um, Tasten ≥ 44 px, ✕ frei.
- **Speichern → Laden:** `song.ue` bleibt gleich (at, pads, mode, notes).
- **Leiste unten:** Gleiche Höhe wie in 4.42.0 (120 px), ✕ im Bild. Konsole ohne Fehler.

Pflichtprüfungen:
- topdefs: 26 Skripte, 0 doppelt, 0 Syntaxfehler
- smoke: errors []
- Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×

Fotos:
- `fx1-hochkant-leiste.png` (gewählte Kachel)
- `fx1-hochkant-blatt.png` (Blatt mit Pads …)
- `fx1-quer-noten.png` (Noten-Raster)
- `fx1-quer-blatt.png`

Patch gegen basis: `fx1.diff`. Werkzeuge in `tools/`.

## 4. Offen / Risiken

- **Klangänderung bei alten Songs:** Absicht, das ist der Fehler-Fix. Auch der alte **Snare-Lauf** ersetzt jetzt nur noch die Snare: Kick und Hats laufen unter dem Lauf weiter. Wer es wie früher will, stellt im Blatt **Ersetzen → Alle** ein. Becken-Stopp und Breaks klingen unverändert. Bitte Xander kurz bestätigen lassen.
- **„Im Drum-Clip“ (Szenen-Clip):** Nicht gebaut. Die Ebene lebt im Song, auch mitten im Clip bzw. Takt. Eine Fill-Ebene *im* Szenen-Clip würde bei jeder Wiederholung erklingen, also Frage an Xander: gewünscht?
- **Inhalt als Clip-Ref:** Nicht gebaut, die Ebene hat eigene Noten. Eine Live-Referenz auf einen Drum-Clip bräuchte eine Neuberechnung bei jeder Clip-Änderung. Möglicher nächster Schritt: „Aus Clip übernehmen“ (kopieren) im Noten-Blatt.
- **Video-Bild:** Die Drum-Sequenzer-Ansicht im Video zeigt die Schritte des Clips, nicht die der Fill-Ebene. Der Ton ist drin, der Schnitt auch. Die Fill-Schritte im Bild kommen später, sonst Konflikt mit dem Paket VREG.
- **Merge-Stellen:** `ueDragUp`, `ueChipSheet`, `buildMidiSong` (VA könnte dort auch ändern) und `svTap`. Es sind nur kurze Zusatzzeilen, sie stehen in `tools/hooks.cjs`.
- Ein freier Fill, der genau auf einer Teilgrenze liegt, kann beim Ersetzen/Zusammenfassen eines Teils (`ueReanchor`) wieder an die Kante gehängt werden. Die Position bleibt gleich, das ist bestehendes Verhalten.
- Beim Ziehen am Griff zeigt der Chip ungerade Längen als „1.5 T“ (bestehendes `ueLenTxt`). Das Blatt zeigt „6 Schläge“.
