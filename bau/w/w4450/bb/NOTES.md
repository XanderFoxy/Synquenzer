# BB1 – „Brot und Butter“-Werkzeugkasten

## Für Xander

- Halte einen Clip gedrückt, dann siehst du **[Werkzeugkasten ▾]**. In der ROLLE steht **[Werkzeugkasten]** direkt neben [Spielweise]. Dort findest du 39 fertige Standardfiguren. Sie sind nach Rolle sortiert (Bass, Sequenz/Arp, Akkord-Stabs, Pads, Lead-Füller, Drums-Füller) und nach Genre (Disco-Pop, Eurodance, Synth-Pop, New Jack Swing, House, Detroit, Hi-NRG, Italo).
- Wenn du eine Figur antippst, hörst du sie sofort mit deinen Akkorden: mit der Akkord-Zeile, sonst mit den Akkorden aus den Noten der Szene. Steht der Transport, laufen die anderen Clips leise mit. Läuft der Clip gerade, hörst du die Figur direkt im Lauf. Sie ist dabei nur ausgeliehen: Mit ✕ ist dein Original sofort wieder da.
- **[Einsetzen]** schreibt die Figur als **neue Version** (im Song v2 …) oder als **neuen Clip**. Das Original bleibt in beiden Fällen erhalten. Wenn du willst, ersetzt die Figur stattdessen **diesen Clip**. Jedes Einsetzen ist ein Schritt ↶.
- **[mit Klang]** legt einen passenden Klang auf die Spur und stellt das Echo gleich mit ein. Beim Disco-Bass ist das zum Beispiel ein kurzer Bass mit Echo auf 1/8 punktiert: So entstehen die Sechzehntel im Offbeat. Ohne [mit Klang] spielt die Figur mit deinem eigenen Klang. Die 6 neuen Klänge findest du auch im Klang-Browser unter „Werkzeugkasten“.

## Technik

- **Zwei Blöcke, nur eingefügt** (704 Zeilen dazu, 0 Zeilen geändert; `diff basis.html index.html` zeigt nur `>`):
  - `BB1-SND-BEGIN … BB1-SND-END` direkt nach `/* SP1-END */`: `BB1_SND` mit 6 VA-Werksklängen, ids `f-bb-*`, Rolle `wkz` „Werkzeugkasten“. Sie stehen in FACTORY, FACTORY_BY_ID und SYNTH_LIB (vor INIT), dazu kommt `BROLES.push` am Ende, alles im Muster von SP1.
  - `BB1-BEGIN … BB1-END` direkt nach `/* GR1-END */`, plus die Zeile `Object.assign(SYNQUENZER, {bb1: BB1_API})`. Das Test-API ist ein Objekt und wird deshalb nicht umhüllt.
- **Einhänge-Zeilen** (je 1 neue Zeile):
  - `openClipSheet`: `bb1ClipSheet(g, t, s, clip, reopen);` unter `gr1ClipSheet`.
  - `buildRoll`: `bb1RollHook(t, s);` unter der `ED.laufBtn`-Zeile. Der Knopf wird per DOM hinter [Spielweise] eingefügt, `extraActs` wird nicht angefasst.
- **Quelle der Blöcke:** `w4450/bblab/bb1-snd.js` und `bb1-block.js`. `bblab/apply.mjs` baut daraus `index.html` = `basis.html` + Blöcke + 2 Zeilen.
- **Figuren (`BB1_FIG`, 39 Stück):**
  - Aufteilung: Bass 10, Stabs 8, Sequenz 6, Pads 4, Lead 5, Drums 6.
  - Muster in Sechzehnteln (`'Schritt Länge Ton Anschlag|…'`) mit diesen Tönen: R, O, 5, 3, 7, a0… (Akkordtöne), s0… (Leiterstufen) und C (Akkord, Varianten `stack`, `v7`, `v9`).
  - Pads werden je Akkord-Abschnitt gebaut (`seg`: Bewegung, Vorhalt 4–3, breit).
  - Drums-Füller nutzen die Fill-Vorlagen von UE_LIB (`p-snare-lauf`, `p-tom-kurz`) bzw. eigene Schritte (`last`, `each`, `first`, `build`).
- **Bausteine aus anderen Paketen:**
  - Swing und Tempo-Hinweis aus GR1 (`gr1Style`, `gr1SwT`).
  - Akkorde aus HM1 (`hm1Chord`, `hm1Prof`, `hm1Pcs`, `hm1Deg`, `hm1SegAt`) bzw. aus der Akkord-Zeile der Szene.
  - Folgt die Spur der Akkord-Zeile, entsteht das Grundmuster auf Stufe I: Die Zeile bildet es ab, wie bei HM1-Glätten. Die Vorschau bildet es per `T.mapEvent` ab.
- **Lage der Stimmen:**
  - Bass: Grundton A1…H2, stimmführend am vorigen Grundton.
  - Stabs: ab F3, Pads ab D3, Umkehrung jeweils mit kürzestem Weg. Unten liegt keine Sekunde.
  - Sequenz: ab G3. Lead: ab D4.
- **Ziele beim Einsetzen** (`bb1Targets`):
  - `ver`: SX9-Version im `song.own`, nur an den Stellen, an denen v1 spielte (`sx9Set`).
  - `neu`: `hm1Free`, Tonart `src: 'user'`. Bei einem Grundmuster kommt die Akkord-Zeile in eine freie Szene mit.
  - `hier`: Noten ersetzen. `lf`, `q` und Drum-`lanes` fallen weg.
  - Ein Undo pro Einsetzen: `clip`, `song` oder `group` mit `sound` und `fx`.
- **Länge:** Ein kurzer Clip wächst bei `neu`/`hier` auf die Länge der Akkorde (Vielfaches, höchstens 16 Takte).
- **Vorschau:**
  - Transport steht: eigene Pumpe, 0,25 s vorausgeplant, mit den Kontext-Clips; sie läuft höchstens etwa 16 s.
  - Der Clip läuft: Die Noten werden getauscht und neu geplant, ohne `markDirty` und ohne Undo. Stopp, ✕ oder Einsetzen tauschen zurück.
  - Ein anderer Clip läuft: Die Figur startet ab dem nächsten Taktstrich, ohne Kontext.
- **Daten:** Es gibt keine neuen Projekt-Felder. Alte Projekte laden und speichern sich byte-gleich (getestet gegen `basis.html`).

## Tests

- **`bb/bb1-test.mjs`: 55/55 OK** (Protokoll `bb/bb1-test.log`). Geprüft wird:
  - Je Kategorie über C | Am | F | G: Grundtöne, Akkordtöne und Lage stimmen; der Galopp-Rhythmus 0 · ½ · ¾; der NJS-Swing (+0,06 Schlag).
  - Ziele: Neuer Clip, neue Version (v2 an allen 4 Takten, v1 unverändert) und Diesen Clip, jeweils mit Undo und Redo.
  - [mit Klang]: Klang und Echo 1/8 punktiert in einer Undo-Gruppe.
  - Speichern und Laden.
  - Grundmuster unter der Akkord-Zeile.
  - Vorschau im Kontext, im Lauf (Original exakt zurück) und aufs nächste Taktende.
  - Blatt hochkant und quer: Tasten ≥ 44 px, ✕ sichtbar.
  - ROLLE-Knopf (Trefferfläche 52 px) und Browser-Chip.
  - Altes Projekt aus der Basis.
- **Pegel der neuen Klänge:**
  - Trocken: −18,0 … −18,6 LUFS, Spitze ≤ −1,5 dBFS.
  - Im Song-Render: −20 … −22,7 LUFS, Spitze ≤ −5,8 dBFS. Keiner ist stumm, keiner übersteuert.
- **Pflichtprüfungen:**
  - `topdefs`: 0 Syntaxfehler, 0 doppelte Namen.
  - `smoke.mjs`: errors [] (`bb/smoke.png`).
  - Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×.
- **Gegenproben der anderen Pakete:** GR1 30/30, LF1 49/49. SP1 23/24: Dessen Test erwartet seinen Chip als letzten in BROLES, dort steht jetzt „Werkzeugkasten“. HM1 bricht ab, auf der Basis genauso (siehe unten).
- **Fotos:** `bb/bb1-p-blatt.png` (hochkant), `bb/bb1-l-blatt.png` (quer), `bb/bb1-p-rolle.png` (ROLLE).

## Offen / Hinweise

- **Befund in der Basis (nicht BB1):** In `buildRoll` steht `extraActs` doppelt, HM1 und LF1 setzen den Schlüssel je einmal. Das LF1-Objekt gewinnt. Folgen:
  - [Harmonie] fehlt in der ROLLE ganz. Der HM1-Test bricht auf `basis.html` ab.
  - [Spielweise] erscheint zweimal: Der zweite Knopf am Ende der Leiste bekommt keine Noten und meldet nur „Erst Noten oder Akkorde setzen“.
  - Lösung: Beide Listen zu einem `extraActs` zusammenführen und in `PianoRoll` die zwei Schleifen trennen, zum Beispiel HM1-Einträge mit `end: true` nur in der zweiten Schleife.
- SP1-Test: Die Prüfung „Chip am Ende“ sollte „hinter Init“ heißen, weil mehrere Pakete Chips anhängen.
- „Neue Version“ gibt es nur, wenn der Clip im Song vorkommt (SX9-Versionen leben im Song). Die Matrix spielt weiter v1. Ohne Song ist „Neuer Clip“ voreingestellt.
- Echo ist ein gemeinsamer Bus: [mit Klang] ändert Teilung und Rückkopplung für alle Spuren mit Echo-Send (ein Undo).
