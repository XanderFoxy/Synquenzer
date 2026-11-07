# LF1 – LAUF wie ein Lauflicht + Spielweisen auf Abruf (Arbeitskopie w4440/lauf, Basis 4.42.0)

## 1. Für Xander
- **Schritt aus/an:** Im LAUF einen gesetzten Schritt antippen – er wird schraffiert und gedimmt und schweigt, die Note bleibt. Nochmal tippen = wieder an. (Löschen jetzt: wischen wie bisher, oder langer Druck → Löschen.)
- **Schritt-Menü:** Lange auf einen Schritt drücken: Wirbel 2×/3×/4×, Transponieren (−12 … +12), Chance 100/75/50/25 %, Slide, Akzent, „Hier starten“. Die Effekte stehen klein unten im Schritt (z. B. 3×, +7, 50%).
- **Richtung:** Oben rechts in der LAUF-Leiste der Pfeil-Knopf [→ ▾]: vorwärts, rückwärts, hin und her, Zufall (Muster 1–99, klingt jedes Mal gleich) und der Startschritt. Ein kleines Dreieck zeigt den Start.
- **Spielweisen:** In der ROLLE in der unteren Leiste [Spielweise]: Akkord (oder Auswahl) wählen → Gitarre ab / ab-auf / Folk / Riff, Glissando, Harfe Arpeggio/Glissando, Glockengeläut, Mandoline-Tremolo, Alberti-Bass, Pizzicato. Strum-Zeit 5–40 ms. Ausprobieren und wechseln geht, jedes Mal vom Original aus; ↶ geht schrittweise zurück.

## 2. Technik
Neuer Code als Block `/* ===== LF1 BEGIN … LF1 END ===== */` direkt hinter `laufFrame` (JS) und hinter den LAUF-CSS-Regeln (CSS). Alle Namen mit Präfix `lf1` / `LF1`.

**Datenfelder (additiv, Format unverändert):**
- Note (Synth): `off: true` (Schritt aus), `rt: 2..4` (Wirbel), `tp: ±1..24` (Halbtöne), `pb: .05..99` (Chance; fehlt = 100 %).
- Clip: `lf = {dir?: 'rev'|'pend'|'rnd', st?: Startschritt, seed?: 1..99 (nur rnd), g?: '1/8'|'1/16T'|'1/32' (Schrittlänge; 1/16 = fehlt)}`; nur Abweichungen von „vorwärts ab Schritt 1“, sonst fehlt `lf`.
- Slide = die vorhandene BINDUNG (Überlappung 1/64); bei Richtung ≠ vorwärts wird die Bindung in Spielfolge neu gebildet. Akzent = vorhandenes v = 1.

**Einhänge-Zeilen in bestehendem Code (je mit `LF1`):**
- SQStore `NOTE_EXTRA` (+off, rt, tp, pb), `NOTE_X` (+off, rt, tp, pb), `normNoteExtras` (1 Zeile → `lf1NoteNorm`), `normClip` (1 Zeile → `lf1NormLf`), `cleanClip` (1 Zeile).
- `scheduleTrack`: Zeile `const cs …, LF = lf1Win(…), L = LF ? 1e9 : clipB(clip) …` + `for (const nt of LF || clip.notes)`. Ohne LF1-Felder ist `LF = null` → exakt der alte Weg.
- Exporte: `buildMidi` (Szene), `buildMidiSong` und `vvkScore` (Video-Partitur): `for (const nt of lf1Pass(c, Durchgang) || c.notes)`.
- Video-Bilder: `vvRoll`, `vv4RollIn` überspringen `off`-Noten. PianoRoll zeichnet `off`-Noten gedimmt (1 Zeile).
- StepEditor `up()`: neue Option `opts.tapOff` (vor dem Akzent/Bindung-Zweig, `if` → `else if`); nur der LAUF gibt sie, Drums unverändert.
- `buildLauf`: `tapOff`, `lf1Deco(...)` in `decorate`, `lf1LaufAttach(t, s, E, bar, per)` nach `ED.lauf = …`.
- `laufFrame`: Lauflicht zeigt bei Richtung/Start den wirklich spielenden Schritt (`lf1PhK`).
- PianoRoll: `opts.extraActs` (1 Zeile nach „Legato“); `buildRoll` übergibt [Spielweise] (nicht auf Perkussionsspur).
- Test-API: `Object.assign(SYNQUENZER, LF1_API)` vor `NO_SYNC`.

**Funktionen (Block):** `lf1NoteNorm`, `lf1NormLf`, `lf1Plan` (Cache je Clip, Signatur über Notenfelder), `lf1Build`, `lf1Pos` (fwd/rev/pend = ALT 1 des Arpeggiators: Enden einmal, Periode 2T−2 / rnd = `DrumSeq.rand01(seed, Schritt)`), `lf1Ev`/`lf1Emit` (stumm weg, Chance per `rand01(seed, Durchgang/Schritt, t, n)`, Wirbel: Wiederholungen 80 %, Transponieren), `lf1Win` (Scheduler), `lf1Pass` (Exporte), `lf1PhK`, `lf1TapOff`, `lf1Deco`, `lf1Edit`, `lf1SetLf`, `lf1StepDo`, `lf1Hold` (480 ms, 8 px), `lf1StepRender/Pop`, `lf1DirRender/Do/Pop`, `lf1DirUpd`, `lf1LaufAttach`, `lf1Chords` (Anschlag ± 1/16 Schlag = Akkord; Einzelnote → Dreiklang der Clip-Tonart), `lf1Gen` (11 Spielweisen), `lf1SwSession/Apply/Render/Pop`.
**CSS:** `.lf1off` (Schraffur, gedimmt, Name durchgestrichen), `.lf1b` (Effekt-Marke), `.lf1s` (Start-Dreieck), `.lbar .lf1dir` (46×36, Trefferfläche +6 px oben/unten), `.pop.lf1pop` + `.lf1r/.lf1q/.lf1t/.lf1t3/.lf1ms/.lf1sw/.lf1dirs/.lf1hint`.
**Test-API:** `lf1Events(t, s, p)`, `lf1Step(t, s, k, a, v)`, `lf1Dir(t, s, patch)`, `lf1Style(t, s, id, {ms, idx})`, `lf1Styles()`, `lf1StepMenu(k)`, `lf1DirMenu()`, `lf1SwMenu()`, `lf1Info()`.

## 3. Tests
- `lf1-test.mjs` (Playwright, Touch per CDP): **49/49 OK** – Tipp Schritt 3 aus (Note bleibt, gedimmt), langer Druck öffnet Menü ohne Änderung, Knöpfe ≥ 44 px, Wirbel 3 = 3 Schläge (Ereignisse und Noten-Log live), +12, Chance 50 % deterministisch, Noten-Log ohne den stummen Schritt, je Aktion ein ↶, rückwärts / hin und her / Zufall-Reihenfolge, Start bei Schritt 5 (+ Dreieck), live-Log = Ereignisse (Start, Wirbel, +7, Chance), MIDI = gespielte Ereignisse, Speichern/Laden gleich (serialize → importJSON), alter Clip ohne neue Felder spielt wie bisher (`lf1Events = null`), quer: Richtungs-Blatt im Bild, Strum auf C-Dur gestaffelt (15 ms, nur C/E/G), Wechsel rechnet vom Original, alle 11 Spielweisen gültig, Undo zurück zum Akkord, 390×844 / 375×667 / 844×390 / 926×370 ohne Überlauf, ✕ sichtbar, keine Konsolenfehler. Log: `lf1-test.log`.
- Zusatz (Song): `buildMidiSong` und `vvkScore` mit LF1-Clip: 32 → 36 Noten (−1 stumm, +2 Wirbel je Takt), beide gleich.
- Pflicht: topdefs 0 Syntaxfehler, 0 doppelt (Namen 4951 → 4991, alle `lf1…`/`LF1…`); smoke errors []; Marken 0, „MS 2000“ 1×, `  live: true,` 1×.
- Fotos: `lf1-p-lauf.png` (hochkant: Schritt 3 aus, 3×/+7/50 %, Start-Dreieck, [→ ▾]), `lf1-p-menue.png` (Schritt-Menü), `lf1-l-richtung.png` (quer: Richtung), `lf1-l-spielweise.png` (quer: Spielweise in der ROLLE).

## 4. Offen / Risiken
- **Bedienung geändert (gewollt):** Tipp auf einen gesetzten LAUF-Schritt löscht ihn nicht mehr, sondern schaltet ihn aus (Xanders Wunsch). Löschen: Wischen (wie bisher), Menü „Löschen“ oder „Leeren“. In AKZENT/BINDUNG bleibt Tipp = Merker umschalten.
- [Richtung ▾] sitzt am Ende der LAUF-Werkzeugleiste (die Aktionszeile ist mit ◀ ▶ schon voll). Auf 428 px passt alles (auch „Takt 1/4 ▾“); auf 390 px mit mehrtaktigem Clip ist der Knopf erst nach Wischen der Leiste sichtbar (19 px zu breit).
- „Hin und her“ = ALT 1 (Enden einmal, wie der Arpeggiator der MS 2000-Platte und das Drum-Pendel); der Schrittzähler läuft ab Clip-Start durch, ein 16er-Lauf ist also erst nach 30 Schritten wieder am Anfang. Die Richtung gilt in der Schrittlänge, in der sie gesetzt wurde (`lf.g`).
- Slide = BINDUNG: gleitet hörbar nur mit LEGATO-Modus oder Glide > 0 im Klang (wie bisher die BINDUNG); kein eigener Glide-Wert je Schritt.
- Transponieren klingt durch „Eine Skala“/Träger wie jede Clip-Note (ein chromatischer Ton kann eingerastet werden). Auf der Perkussionsspur ist Transponieren im Menü ausgeblendet.
- Die Clip-Kacheln der Matrix und die Tonart-Erkennung zählen stumme Schritte noch mit; die ROLLE zeigt sie gedimmt, ändert sie aber nicht.
- Spielweisen: erster Schnitt mit festen Mustern (Viertel/Achtel, 4/4-Raster ab Akkordbeginn); keine Taktart-Anpassung (3/4, 6/8), keine Humanisierung, Muster nicht editierbar. Neue Noten ersetzen die Auswahl (sonst den ganzen Clip). Nicht für eigene Song-Clips/Song-Melodie (nur Szenen-Clips der Synth-Spuren).
- Merge: Einhänge-Zeilen berühren `scheduleTrack`, `buildMidi`/`buildMidiSong`/`vvkScore` (gleiche Zeile 2×), StepEditor `up()`, PianoRoll-Aktionszeile, `NOTE_EXTRA`/`NOTE_X` – wenn andere Pakete dieselben Zeilen ändern, von Hand zusammenführen.
