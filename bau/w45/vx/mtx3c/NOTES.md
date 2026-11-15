# MTX3c – Einzelspuren von DRUMS: der Rest (Notizen, 15.11.2026)

index.html = basis.html (Kandidat 4.70.0, rel-4700) + Block `/* MTX3C-BEGIN … MTX3C-END */` direkt hinter `/* MTX3B-END */`
+ 15 Haken-Zeilen (je ein Einzeiler mit `/* MTX3C … */` und `typeof`-Schutz; keine vorhandene Zeile geändert, `diff` = nur `>`-Zeilen).
`block.js` = der Block allein, `ins.cjs` = baut index.html aus basis.html (Anker je Haken eindeutig geprüft, sonst Abbruch).
Sichtbar ändert sich nichts an Aussehen oder Bedienung (keine neuen Knöpfe, keine neuen Blätter).

| Stelle | Haken |
|---|---|
| beg1Sched (nach `const tg = …, role = …`) | `mtx3cBegSched` – Einzelspur von DRUMS gehört zur Band: ihre Clips nur außerhalb des Band-Fensters |
| beg1Emit (Drum-Zweig, vor `drumHit`) | `mtx3cBegHit` – Pad mit aktiver Einzelspur spielt über deren Kit-Bus/Kanal (MTX3.cur wie mtx3Voice) |
| beg1Pat (nach `used = …`) | `mtx3cBegUsed` – die Pads „deines Kits“ sind die von DRUMS und ihren Einzelspuren (sonst Ersatz-Pads) |
| beg1Alone (nach `keep = …`) | `mtx3cBegKeep` – „nur die Band“ behält die Einzelspuren mit DRUMS |
| beg1TgSync (nach der Hush-Zeile) | `mtx3cBegHush` – Drum-Ziel gewechselt/aus: Einzelspuren still wie DRUMS |
| beg1Scene (vor `if (!made.length)`) | `mtx3cBegScene` – ● Aufnahme der Band: Pads der Einzelspuren in deren Clip der neuen Szene |
| cancelTrackFrom / stopTrackNow (nach MTX3) | `mtx3cCancel` – Band-Schläge über Einzelspuren gehören zu DRUMS (■, Neu-Planung) |
| capture (FANG, nach der Drum-Saat) | `mtx3cFang` – Clip einer Einzelspur = Schläge ihres Pads (GM, 0,1, ein Schlag je Stelle, Saat, Bezug) |
| melNoteOn (vor `MEL.open.set`) | `mtx3cMelO` – Taste = Pad-Note (auch `nc` der Song-Aufnahme mit NOTEN) |
| melCommit (nach `const note = …`) | `mtx3cMelC` – Schrittlänge 0,1, zwei Tasten zugleich = ein Schlag (der lautere) |
| trackEco (2. Zeile) | aktive Einzelspur → kein ECO-Klang |
| gr2RemixDo (nach `if (!id) …`) | `mtx3cVer` – Pad ohne Einzelspur-Clip an dieser Stelle → Version der Einzelspur an derselben Stelle |
| gr1ABDo (vor `return n`) | `mtx3cAB` – B schaltet die Versionen der Einzelspuren wieder ein (A über die vorhandene Schleife) |
| gen3MxRemix (nach der Spur-Schleife) | `mtx3cMx` – Matrix-Remix: Pads ohne Einzelspur-Clip in der Quell-Szene → Clip der Einzelspur in der neuen Szene |

## Entscheidungen
1. **Begleiter live:** Ist DRUMS die Drum-Spur der Band, spielt jedes Pad mit aktiver Einzelspur über deren Kanal (Kit-Bus mit Raum/Gate
   von DRUMS, eigener Pegel/Pan/Effekte), die übrigen Pads über DRUMS. Die Clips der Einzelspuren schweigen im Band-Fenster wie die von
   DRUMS (vorher: lief die Wiedergabe schon, spielte HH ZU seinen Clip zur Band dazu = doppelte HH). „Nur die Band“ (Start aus dem
   Begleiter) behält die Einzelspuren mit DRUMS (nach SCHLUSS spielt DRUMS wieder ganz, mit HH); Drum-Ziel aus/gewechselt = still wie
   DRUMS. Stumme Einzelspur = ihr Pad schweigt. Die Band-Schläge über Einzelspuren tragen eine Marke (`h.b3c`), damit ■ und Neu-Planung
   von DRUMS sie mit räumen.
   Gefunden beim Messen: die Band nimmt die Pads „deines Kits“ aus dem ersten DRUMS-Clip – nach dem Aufteilen fehlten dort HH/SNARE, die
   Band spielte Ersatz-Pads (Muster anders als vor dem Aufteilen, Basis 4.70.0 gemessen). Jetzt zählen die Pads der Einzelspuren am selben
   Clip-Platz dazu: Band-Muster nach dem Aufteilen = vorher.
2. **● Aufnahme der Band:** die neue Szene bekommt für HH ZU einen eigenen Drum-Clip (Saat/Länge wie der DRUMS-Clip), DRUMS dort ohne HH.
   Ein ↶ (Gruppe der Aufnahme). ● AUTO (Song-Aufnahme) nimmt den Weg über dieselbe Szene; die Song-Zeile der Einzelspur folgt dabei der
   eingefügten Szene (nicht einzeln gemessen).
3. **FANG / Melodie-Spur:** FANG war in 4.70.0 schon richtig (der Tastatur-Weg von MTX3b schreibt den Fang-Puffer mit der Pad-Note) –
   der Haken sichert es (ein Schlag je Stelle, Bezug wie DRUMS, Saat). Die Melodie-Spur im Song ([● MEL.] und ● SONG mit NOTEN) speicherte
   die Tastentonhöhe und die Haltedauer (Basis: 62/65, 0,15–0,18 Schläge, 6 Noten bei 3 Doppelgriffen) – jetzt GM 42, 0,1, 3 Schläge.
4. **ECO:** `trackEco` meldete für eine aktive Einzelspur ECO-Klang, weil sie absichtlich keine Synth-Engine hat (MTX3 M5). Jetzt kein
   Schild, kein ECO auf dem VA-Knopf, kein ECO-Hinweis beim Tipp. Mit anderem Klang (Synth-Modus) gilt wieder die normale Anzeige.
5. **Stil-Muster in einer Szene ohne Einzelspur-Clip** (MTX3b ließ das Pad dort auf DRUMS): Song-Remix (GR2, Stil-Muster und Stil %) legt
   an dieser Stelle eine Version der Einzelspur an (gleiche Szene, Stil, Quelle; Saat/Länge wie DRUMS; Stil-Muster ohne D1-Spur), die
   Song-Zeile der Einzelspur spielt sie genau dort. Bedingung: die Zeile der Einzelspur steht dort auf derselben Szene und spielt nichts
   (sonst bleibt das Pad auf DRUMS, wie bisher). A/B: A schaltet sie mit ab, B wieder ein. Zusammenführen holt sie zurück nach DRUMS
   (MTX3b-Weg). Matrix-Remix: Clip der Einzelspur in der neuen Szene. Alles im selben ↶ wie der Remix.

## Messung (mtx3c-test.mjs, Touch über CDP, 428×926 / 926×428 / 926×370, neu ↔ basis)
- Stil-Muster italo, Song Szene 1 (2 Takte, HH) + Szene 2 (2 Takte, ohne HH): Bezug ohne Aufteilen kick 16 · hatC 64 · hatO 16 · snare 8 ·
  clap 8. **Neu:** hatC 64 alle auf HH ZU, DRUMS 0, Doppel 0, Summen-Audio −119,7 dB zum Bezug, 1 ↶. **Basis:** DRUMS 32 / HH ZU 32.
- A/B: A = Stand nach dem Aufteilen, B = Remix-Stand (hatC 64 auf HH ZU). ↶ = Stand vor dem Remix.
- Matrix-Remix aus Szene 2: neue Szene `4:clap/hatO/kick 6:hatC 7:snare`, Saat HH ZU = DRUMS; ↶ leert alle.
- Begleiter, 2 Takte, 150 BPM: Band-HH 16 → **neu** 16 auf HH ZU / 0 auf DRUMS, **Basis** 16 auf DRUMS. Clip von HH ZU in der Band: 0 Töne.
  Nach ■: 0 geplante Band-Schläge übrig.
- Band-Muster der Drums (B.pattern) vor ↔ nach dem Aufteilen: **neu gleich**, **Basis anders** (Ersatz-Pads).
- ● Aufnahme der Band → Szene 3: `4:clap/kick 6:hatC` (HH ZU eigener Clip), ↶ leert beide. „Nur die Band“: HH ZU behält wie DRUMS den
  Platz (0/0); Drum-Ziel aus → beide −1.
- Zusammenführen nach dem Remix: hatC 64 zurück auf DRUMS, Treffer je Pad wie ohne Aufteilen, Summe −119,7 dB, ↶ = wieder aufgeteilt.
- FANG (4 Doppelgriffe auf HH ZU): 4 Schläge GM 42 / 0,1 / Saat. Melodie-Spur (3 Doppelgriffe): 3 Schläge GM 42 / 0,1.
- Klang-Editor HH ZU in allen drei Größen: ECO-Schild aus, VA-Knopf ohne ECO, `trackEco` false (Basis: Schild an, true).
- Zeit: Song-Remix mit Einzelspuren (4 Takte) 2 / 2 / 18 ms in drei Läufen → **Median 2 ms** (18 ms unter Last 8–9 auf 4 Kernen). Der
  Begleiter-Haken prüft je Band-Schlag 2–3 Spuren (eine Schleife über höchstens 8 Spuren, kein eigener Planer-Schritt).

## Regression (nacheinander, reg/)
Lauf 1 (b81da832, 13 Haken): mtx3b 87/87 · mtx3 51/51 · mtx3p.ab469 21/21 · beg1 57/59 · smoke errors [].
Lauf 2 (74e6ad79, +Hush): mtx3c 26/26 · beg1 57/59 · **beg1 auf basis.html 58/59** (abgebrochen nach dem Befund „Ersatz-Pads“).
Lauf 3 = Endfassung (97c7758e, 15 Haken): **mtx3c 27/27 · mtx3b 87/87 · mtx3 51/51 · mtx3p.ab469 21/21 · smoke errors []** · beg1 55/59
(Last 8–9: zwei Zeitprüfungen – „Ein Finger“ Em erst auf Schlag 13 statt 12, „Aufnahme = Live“ 185 = 185 Töne, aber 1,77 ↔ 1,75 –
in Lauf 1 und 2 grün). **Wiederholung auf der Endfassung (Last 4,6): beg1 57/59** – dieselben zwei wie unten, die Zeitprüfungen grün.
beg1, immer rot und nicht von MTX3C: „Prüfung 5 – 5/4 ohne passenden Stil“ (rot auch auf basis.html: seit GEN4 gibt es 5/4-Stile, die
Erwartung stammt von davor). Rot nur durch das Paket: „jede neue Zeile außerhalb des BEG1-Blocks trägt BEG1“ – die Prüfung vergleicht
gegen basis.html und zählt die MTX3C-Zeilen mit (Herkunftsprüfung des BEG1-Pakets, kein Fehler).
Pflicht (Endfassung): topdefs 26 Skripte / 0 doppelt / 0 Syntax · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „^  live: true,“ 1× ·
VERSION 4.70.0 · diff basis→index: 0 `<`, 202 `>` · block.js = Block in index.html.

## Funk (nichts sichtbar anders)
Keine neuen Knöpfe, Blätter oder Größen. Hörbar/inhaltlich anders: Begleiter-HH kommt über den Kanal von HH ZU (Pegel/Effekte der
Einzelspur wirken auf die Band), Stil-Muster legt in Szenen ohne HH-ZU-Clip eine HH-ZU-Version an, Melodie-Spur auf einer Einzelspur
speichert Schläge. ECO-Schild bei Einzelspuren weg.

## Offen
- GEN4 (Stil auf Szene / alles) und GR1-Grundmuster in einer Szene ohne Einzelspur-Clip: das Pad bleibt dort auf DRUMS (wie MTX3b).
- ● AUTO (Song-Aufnahme mit der Band): die Song-Zeile der Einzelspur in den neuen Band-Szenen nicht einzeln gemessen.
- Drum-Ziel der Band mitten im Lauf von „aus“ auf DRUMS: im schon geplanten Fenster (Vorlauf) kann der Clip von HH ZU noch einmal klingen.
- Aus MTX3b weiter offen: Schritt-Editor der Einzelspur ohne FOLGEN/PL1-Locks/D1-Länge-Werkzeuge (Funk-Vorschlag), MIDI-Export wie MTX3,
  mehr als 2 Einzelspuren nur mit mehr Spur-Plätzen (MAX_T 8).

## Nachbesserung nach der Prüfung (15.11.2026, Endfassung 2bb7fe29)
Befunde aus PRUEFUNG.md, alles nur im MTX3C-Block (Haken-Zeilen unverändert, 15; diff zur Basis 0 `<`, 203 `>`):
1. **`mtx3cMelC` ohne `markDirty()`** – behoben: legt ein Doppelgriff in der Melodie-Spur (`curMel`) zwei Tasten zu einem Schlag zusammen
   (der lautere bleibt), wird das Projekt wie in `melCommit` mit `markDirty()` als geändert markiert (Sichern-Hinweis/Autosave).
   Take-Noten einer Song-Aufnahme (`o.sr`) bleiben wie in `melCommit` bei `UI.dirty.song` (die Aufnahme markiert beim Ende).
2. **`mtx3cBegSched` ohne Schnitt am Band-Ende** – behoben: dieselbe Zeile wie DRUMS (`run.tEnd`, `run.cutE`, `cutTrackAt` einmal je Spur),
   die Fenster (vor t0 / nach tEnd) bleiben wie vorher.
3. beg1-Herkunftsprüfung zählt die MTX3C-Zeilen – bekannt, kein Fehler (unverändert).

Messung `mtx3c-fix.mjs` (Seite, 428×926): Doppelgriff Melodie-Spur → 1 Schlag, v 0,9, markDirty 1× · Doppelgriff Take-Noten → v 0,7,
markDirty 0× · einzelne Taste → Haken false (melCommit legt ab) · Band-Ende → genau ein Schnitt bei tEnd (Spur 6, 4,2857 s), Fenster
[2,4] / null / [8,9] / [9,10] · Konsole leer. **Endfassung 5/5, Vorfassung 97c7758e 3/5** (die zwei Befunde).
Regression nacheinander (reg/run4.sh, Last ≤ 2,2): mtx3c-fix 5/5 · mtx3c 27/27 · beg1 57/59 (Prüfung 5 = auch Basis rot; Herkunftsprüfung
BEG1-Paket) · mtx3b 87/87 · smoke errors []. Pflicht: topdefs 26 / 0 doppelt / 0 Syntax · dupkeys 0 · „MS 2000“ 1× · „^  live: true,“ 1× ·
VERSION 4.70.0. Sichtbar ändert sich nichts.
