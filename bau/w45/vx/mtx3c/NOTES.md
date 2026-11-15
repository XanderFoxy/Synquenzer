# MTX3c – Einzelspuren von DRUMS: der Rest (Notizen, 15.11.2026)

index.html = basis.html (Kandidat 4.70.0, rel-4700) + Block `/* MTX3C-BEGIN … MTX3C-END */` direkt hinter `/* MTX3B-END */`
+ 14 Haken-Zeilen (je ein Einzeiler mit `/* MTX3C … */` und `typeof`-Schutz; keine vorhandene Zeile geändert, `diff` = nur `>`-Zeilen).
`block.js` = der Block allein, `ins.cjs` = baut index.html aus basis.html (Anker je Haken eindeutig geprüft, sonst Abbruch).
Sichtbar ändert sich nichts an Aussehen oder Bedienung (keine neuen Knöpfe, keine neuen Blätter).

| Stelle | Haken |
|---|---|
| beg1Sched (nach `const tg = …, role = …`) | `mtx3cBegSched` – Einzelspur von DRUMS gehört zur Band: ihre Clips nur außerhalb des Band-Fensters |
| beg1Emit (Drum-Zweig, vor `drumHit`) | `mtx3cBegHit` – Pad mit aktiver Einzelspur spielt über deren Kit-Bus/Kanal (MTX3.cur wie mtx3Voice) |
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
- FANG (4 Doppelgriffe auf HH ZU): 4 Schläge GM 42 / 0,1 / Saat. Melodie-Spur (3 Doppelgriffe): 3 Schläge GM 42 / 0,1.
- Klang-Editor HH ZU in allen drei Größen: ECO-Schild aus, VA-Knopf ohne ECO, `trackEco` false (Basis: Schild an, true).
- Zeit: Song-Remix mit Einzelspuren 2 ms (4 Takte); der Begleiter-Haken prüft je Band-Schlag 2–3 Spuren (kein Planer-Mehraufwand messbar).
