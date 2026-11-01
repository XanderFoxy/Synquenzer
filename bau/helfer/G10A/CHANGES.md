# G10a – Einsingen fertig (Nachtrag 9, §2.1)

Basis: `bau/snapshots/R-4300.html` (App 4.30.0). VERSION bleibt `'4.30.0'`. Projektformat bleibt 5, **keine neuen Projektfelder**.
Alle neuen Namen mit Präfix `g10a…` (JS), CSS-Block zwischen `/* G10A-CSS-BEGIN */` und `/* G10A-CSS-END */`, JS-Block
„G10a — Einsingen fertig“ direkt vor `const G8_API`. Jede geänderte alte Stelle trägt `// G10a`.

## Was, wie

### G10a-1 Hörmuschel-Erkennung
- `stCalEnd` (volles Einmessen) ruft `g10aEar(prof, route, res)`: Weg „speaker“ und `gainDb < −26 dB` → `prof.speaker.ear = true`, sonst wird das Feld entfernt.
  Nur Geräteprofil (localStorage `synq-stimme-v1`), nicht im Projekt.
- `stProf` liest `ear` beim Start mit (nur `true`, sonst fehlt das Feld – ein altes Profil bleibt so, wie es war).
- 🎤-Blatt: Weg-Knopf heißt dann „🔈 Hörmuschel?“, darunter die Zeile „Musik leise aus der Hörmuschel – Kabel-Kopfhörer einstecken“ (`.g10a-ear`). Der H6-Hinweis im Overlay bleibt.
- Sitzungsart: bleibt `par` (= `play-and-record`). Das Ergebnis des Gerätetests B-3 liegt noch nicht vor → offene Frage unten.

### G10a-2 Gesang beim ersten Song-Durchgang
- `songRecBegin` (Song-Takt 1 erreicht) → `g10aSongVoxBegin(sr)`: mit bereitem 🎤 (`ST.on`, Phase nicht start/off, `tkAudioOk()`, Ringpuffer)
  `sr.vox = {passes: [{a: 0, T: sr.startBeat}]}`, `tkQ('song', true)`, `g8Begin(sr)` – nicht über `tkSongBegin` (wie in der Spec).
- `songRecEnd`: vor `pushSongUndo` `g10aSongVoxCommit` (= `sr.mode='over'`, `sr.from=0`, `tkSongCommit(sr, song.bars, 0)`), danach `tkSongUndoFix(sr, true)` → **ein** Undo
  für Song + STIMME-Spur + Take. Abbruch (vor Takt 1 / < ¼ Schlag) → `g10aSongVoxDrop`: kein Take, G8-Strom verworfen.
- H8-Toast entfällt. Ist 🎤 an, aber noch nicht bereit, kommt „🎤 noch nicht bereit – der Gesang wird nicht aufgenommen“ (H2-Text).
- Endmeldung: „Song: 8 Takte · Stimme“.

### G10a-3 Pegel in der Aufnahme-Leiste
- `recLaneFrame` → `g10aLvl(...)`: bei einem Gesangs-Take (`rec.vox` und 🎤 an) liegt über der Noten-Fläche ein Balken (`.g10a-lvl`, Element einmal angelegt),
  `ST.lvl` −60…0 dB → `transform: scaleX(k)` (nur transform, kein Layout), höchstens 15 Bilder/s. Übersteuern (`ST.pk > −1 dBFS`) färbt ihn rot (700 ms Halten), der
  Text der Leiste endet dann auf „· zu laut“. Strich bei −18 dB. Die Noten-Zeichnung entfällt während des Gesangs-Takes (spart Arbeit).
- Text: „AUFNAHME · Takt n/… · Stimme“. Ohne 🎤 bleibt die Leiste wie bisher.

### G10a-4 Letztes Wort über dem Ende
- `tkVoiceTake` (REC und FANG) merkt sich Take → Spur/Szene (`g10aPostWatch`). Wenn G3 den Ausklang gemessen hat (`g3TakePost` → `g10aPostCheck`), und das Stück genau bis
  zum Clip-Ende reicht und `post.sec > ⅓ Takt` (Takt über `g10aBpb()`), erscheint der Toast „Letztes Wort ragt über das Ende – Clip +1 Takt? [Ja]“.
- [Ja] → `clip.len + 1`, `audio.out = post.out + post.sec` (höchstens Take-Ende), ein Undo „Clip +1 Takt“. Bei Clips mit 64 Takten keine Frage.

### G10a-5 Anlauf am Song-Anfang
- `g10aLeadBeats(song, bar0)`: nur ab Takt 1; hat ein STIMME-Clip in Takt 1 (Spur nicht stumm, Stück beginnt am Take-Anfang) oder ein `song.vox`-Stück in Takt 1
  einen Anlauf (`g3PreOf > 0`), dann `ceil(Anlauf / Schlag)` Schläge, höchstens 2 Takte.
- `songPlayStart` setzt `G10A.leadB`; `startTransport` (Zweig ohne Einzähler) beginnt dann bei Schlag `−leadB`, **ohne Klicks** (`R.countIn` bleibt aus), die Takt-Anzeige
  zeigt 1.1. Takt 1 = Schlag 0 wie bisher (`songPlay.off = 0`). Ohne Anlauf: `leadB = 0` → genau wie 4.30.0.
- Offline-Render (`vvRenderAudio0`, für Video und WAV): derselbe Vorlauf; das Ergebnis beginnt mit dem Vorlauf (`r.lead` s), `vvStateAt` zeigt bis Takt 1 den Anfang.
  Nur bei Bereich ab Takt 1.
- Auch ● SONG ohne Vorzähler ab Takt 1 auf einem Song mit Anlauf startet so (derselbe Weg über `songPlayStart`).

### Hilfsfunktion Taktarten
`g10aBpb()` = `grid().beatsPerBar` (heute 4). Alle neuen Rechnungen (⅓ Takt, Leiste, höchstens 2 Takte Vorlauf) gehen darüber.

## Daten
- Projekt: nichts Neues. Geschrieben werden nur vorhandene Felder (`song.vox`, `S.takes`, `clip.len`, `clip.audio.out`).
- Geräteprofil `synq-stimme-v1`: neues optionales Feld `prof.speaker.ear: true` (fehlt sonst).
- Laufzeit: `R.g10aLead` (Schläge des letzten Vorlaufs), `G10A` (Zustand), `r.lead` im Render-Ergebnis.
- Test-API (alle mit `g10a`): `g10aInfo`, `g10aCalSim` (Attrappe Einmessen), `g10aLvlLog`, `g10aPostCheck`, `g10aPostGrow`, `g10aWatch`, `g10aTestSeg`, `g10aBpb`.

## Überholte Test-Erwartungen
- **H-70** (H8): „Mit 🎤 an kommt der Toast“ gilt nicht mehr – mit bereitem 🎤 wird der Gesang jetzt aufgenommen (kein Toast). Mit 🎤 an, aber noch nicht bereit, kommt der H2-Text.
- Tests, die ▶ SONG auf einem Song mit G3-Anlauf in Takt 1 starten und `R.startTime − jetzt = 0,06 s` bzw. `schedBeat = 0` erwarten: jetzt um den Vorlauf später. Ohne Anlauf unverändert.
- Video/WAV eines Songs mit Anlauf in Takt 1: `dur` ist um den Vorlauf länger, Video-Zeit 0 = Anfang des Vorlaufs (`r.lead`).

## Beim Zusammenführen beachten
- Hotfix 4.30.1 baut Blattköpfe/Transport um: Berührt `startTransport` (eine Zeile im Zweig ohne Einzähler) und `songPlayStart` (letzte Zeile `play()`).
- G10c (Takes) / G10e (Warp): `tkVoiceTake` hat eine neue Zeile nach `const seg = …`; `g3TakePost` eine neue Zeile nach dem `post`-Messen.
- Chor-Spuren: `g10aLeadBeats` betrachtet nur STIMME-Spuren (`tr.stimme`) und `song.vox`.

## Fragen an Xander
1. **Sitzungsart (H6/B-3):** Welche Variante spielt beim Singen laut über den unteren Lautsprecher (`?stsess=par|auto|none`)? Bis dahin bleibt `par` Standard.
2. **Schwelle −26 dB:** Passt sie auf deinem iPhone (Hörmuschel ≈ −31 dB, unterer Lautsprecher?). Wert „Lautsprecher im Mikro … dB“ nach „Einmessen“ ablesen.
3. **Auftakt-Noten (Synth) in Takt 1:** Der stille Vorlauf gilt laut Spec nur für Audio-Anlauf (`g3PreOf`). Sollen auch Auftakt-Noten eines MELODIE-Clips in Takt 1 einen Vorlauf bekommen?
4. **Anlauf länger als 2 Takte** (möglich bis 2 Takte + Vorrolle): dann klingt er wie bisher nicht (G3 lässt ihn ganz weg, statt ihn zu kürzen). Kürzen statt weglassen?
5. Nebenbefund (nicht geändert): `stProf` macht aus `floorDb: null` beim Neustart `0` (`isFinite(+null)`). Soll das mit dem nächsten Hotfix korrigiert werden?
