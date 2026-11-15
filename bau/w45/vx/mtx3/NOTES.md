# MTX3 – Noten auslagern + Drum-Spur aufteilen (Notizen, 15.11.2026)

index.html = basis.html (4.66.0) + Block `/* MTX3-BEGIN … MTX3-END */` direkt hinter `/* MTX-END */` + 7 Haken-Zeilen
(jede mit Kommentar `/* MTX3 … */` und `typeof`-Schutz, keine vorhandene Zeile geändert):

| Stelle | Haken |
|---|---|
| normTrack (nach `o.clips = …`) | `mtx3NormTr(t, o, def, pk, cl)` – tr.dvx additiv, aktive Einzelspur hält Drum-Clips |
| drumHit (2. Zeile) | `mtx3Hit(...)` – nur während mtx3Sched (sonst `undefined` → drumHit wie immer) |
| scheduleTrack (nach dem Drum-Zweig) | `mtx3Sched(i, clip, …)` – Einzelspur plant über scheduleDrums |
| cancelTrackFrom (nach ND4-Zeile) | `mtx3Cancel(i, t, 0)` |
| stopTrackNow (nach ND4-Zeile) | `mtx3Cancel(i, now, 1)` |
| openTrackSheet (nach mtxTrackSheet) | `mtx3TrackSheet(i, anchor)` |
| buildRoll (nach bb1RollHook) | `mtx3RollHook(t, s)` |

`block.js` im Ordner = der Block allein (zum Nachbauen / Mergen).

## Entscheidungen
1. **DRUMS bleibt.** Index 4 ist fest und es gibt genau eine Drum-Spur (V2a); Zusatzspuren 6–7 dürfen beim Laden nur Synth sein.
   „Quelle wird ersetzt“ heißt hier: DRUMS behält nur die nicht ausgelagerten Töne; die Einzelspuren stehen gruppiert direkt
   vor DRUMS (DRUMS bleibt unten). Höchstens 8 Spuren → so viele Töne wie Plätze frei (Standard-Projekt 2). Vorschlag im Blatt:
   HH ZU zuerst (Xanders Beispiel), dann SNARE, CLAP, HH OFFEN …; KICK bleibt auf DRUMS. Die Töne sind im Blatt per Tipp wählbar.
2. **Einzelspur = Synth-Spur mit `tr.dvx`** = {v Pad, gm, sn Klang-Name, src uid von DRUMS, p Pad-Werte (Diff), kit {gate, gateLvl,
   room, accent}, pk Kit-Name}. Ihre Clips sind Drum-Clips (Schritte, Chance, Wirbel, Akzent, Locks, Bedingungen JAM1, D1-Spuren,
   Saat bleibt gleich → gleiche Zufallsentscheidungen). Planung über scheduleDrums (MTX3.cur), jeder Schlag drumHit mit
   {P, Pof, strip} → eigener Kit-Bus je Spur/Kontext (ROOM/GATE mit den Impulsantworten von DRUMS, gleiche Länge) → eigene
   Spur-Kette. Start-Kanalwerte = DRUMS (sound.fx, tr.mix). Schläge tragen src 'mtx3' + track = Einzelspur: ■ / Neu-Planung
   von DRUMS lassen sie stehen, die eigenen Haken räumen sie.
3. **Synth draufpacken:** aktiv nur, solange der Klang-Name = tr.dvx.sn. Anderer Klang (Browser) → die Spur spielt die Noten mit
   dem Synth (GM-Tonhöhen); ↶ des Klangs holt den Drum-Ton zurück. Kein neuer Knopf dafür (sichtbar anders → erst Funk).
4. **Undo:** Aufteilen / Zusammenführen = ein Schritt Art 'sx14' (ganzer Stand). Auslagern = Gruppe (track + ux2-Reihenfolge +
   song + part + clip) wie mtxTrackDup; Kopieren in vorhandene Spur = Gruppe aus zwei clip-Schritten.
5. **Auslagern:** nur Synth-Spuren (nicht STIMME / Original / aktive Einzelspur). Neue Spur „<Quelle> · Teil“ = Spur-Kopie
   (Klang, FX, Mix) mit nur dem einen Clip (Länge, Tonart, Raster, Saat … wie Quelle), direkt unter der Quelle; Song-Einträge
   der Quelle mit dieser Szene + Teile-Slots gehen mit; läuft die Quelle, übernimmt die neue Spur Slot und Start (synchron).
   „In vorhandene Spur“: Noten hinter dem Ziel-Clip-Ende fallen weg (Hinweis). Schalter Verschieben │ Kopieren = uiPrefs.mtx3Copy.
6. Bedienung im vorhandenen Stil: [Auslagern ▾] in der Aktionsleiste des Noten-Editors (36 px wie die Leiste, Trefferfläche 52 px
   per ::after wie [Werkzeugkasten]); Blätter mit MTX-Kopf (✕ 44 px), Knöpfe ≥ 44 px, im Bild bei 428×926 / 926×428 / 926×370.
7. „Wo finde ich …?“: zwei Einträge (Noten auslagern, Drum-Spur aufteilen).

## Messung (mtx3-test.mjs, 51/51)
Song-Render nur DRUMS (Demo Szene 1 + 2), Math.random fest (die Drum-Stimmen würfeln den Rausch-Einsatz; Puffer vorher gebaut):
vorher ↔ vorher −129,6 dB (Probe), vorher ↔ aufgeteilt **−124,4 dB**, nach Laden −124,5 dB, nach Zusammenführen −125 dB.
HH-Pegel 0 → −35 dB (eigener Kanal wirkt).

## Offen
- MIDI-Export: Einzelspuren als eigene Spuren mit GM-Noten, aber auf ihrem Spur-Kanal mit Programmwechsel (nicht Kanal 10 wie PERC).
- Live spielen (Tastatur/Pads) auf einer Einzelspur nutzt den Synth-Klang (Platzhalter), nicht den Drum-Ton.
- Noten-Editor einer Einzelspur zeigt Tonhöhen statt Pad-Namen (rowName nur für PERC; Änderung der Optionszeile vermieden).
- Pads mit Quelle North (ND4) spielen auf der Einzelspur ihre Drum-Stimme; eigene Clips des Songs (song.own) werden nicht aufgeteilt.
- Akzent-Stärke der Einzelspur folgt dem DRUMS-Kit (drumHit liest drumKit().accent).
- Mehr als 2 Einzelspuren geht erst mit mehr Spur-Plätzen (MAX_T 8).
