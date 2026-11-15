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

## Prüfung MTX3-P (Behebung der Prüfer-Befunde, 15.11.)
Block neu (gleicher Marker, `block.js` = Block), außerhalb des Blocks jetzt 26 Haken-/Änderungszeilen (vorher 7), alle mit `typeof`-Schutz:
neue Einzeiler in ueBuild, undo, redo, spawnVoice, syncEngine, openEditor, jam2Groups, gr2Role, snd1Roles; Inline-Zusätze in gen4Roles,
svShort, midiCh, Programmwechsel (assembleMidi), int54MidiClips (2), va1MidiSong (3), va1MidiClip.

| Befund | Entscheidung |
|---|---|
| S1 | Neue Spur bekommt die ganze Song-Zeile der Quelle: Einträge mit Szene s (mit re/ph) bleiben, jeder Wechsel (andere Szene, eigener Clip) wird Stopp. Teile: `{s}` → `{s}`, andere Szene → aus, „bleibt“ bleibt (der alte Vergleich `slots[t] === s` traf nie). |
| S2 | ueBuild-Haken: alle Fenster von DRUMS („ersetzt“, FX1-Pad-Fenster, Stopp-Listen) gelten auch für jede Einzelspur; nach Aufteilen/Zusammenführen/↶ wird neu gebaut. Gilt damit auch für MIDI (fllMidiMutes). |
| S3 | Pads mit Quelle MD_NAME werden nicht aufgeteilt (Knopf im Blatt grau mit „MD_NAME · bleibt“, Hinweiszeile; Kit nur aus solchen Pads → Grund statt Aufteilen). Wird ein Pad erst später umgestellt, spielt sein Schlag über DRUMS (richtiger Klang). |
| S4 | Ziel ohne Clip: Matrix startet das Ziel mit der Quelle (wenn es schweigt), Song-Zeile bekommt Start/Stopp genau dort, wo die Quelle die Szene spielt und das Ziel schweigt (sonst Hinweis „spielt dort schon einen anderen Clip“), Teile ebenso. Alles im selben ↶. |
| M1 | Aufteilen/Zusammenführen sind jetzt ↶-Gruppen (Spuren + Reihenfolge + Song + Teile + DRUMS-Clips) statt ganzer Stand → kein applyProject, die Wiedergabe läuft weiter; nach ↶/↷ spielen wiederhergestellte Spuren sofort mit (undo/redo-Haken). Bedienung unverändert. |
| M2 | [Auslagern ▾] rückt mit gewählten Noten direkt hinter die Auswahl-Anzeige („3 Noten · Auslagern ▾ · ▲ Stufe …“), ohne Auswahl steht er wie bisher hinten; ist die Leiste gewischt, bleibt sie stehen. „Wo finde ich …?“ öffnet den Noten-Editor und zeigt den Knopf. Sichtbar anders nur mit Auswahl – im Funk zur Bestätigung vorschlagen (Alternative: fest vorn). |
| M3 (Teil) | Pad-Werte folgen DRUMS live (Kit-Wechsel, Pad-Editor von DRUMS, Song-Regler) → der Drum-Ton ist über DRUMS änderbar; Tastatur auf der Einzelspur spielt den Drum-Ton; Klang-Editor der Einzelspur sagt einmal, woher der Ton kommt, mit [Pad öffnen]. Drum-Schritt-Editor für Einzelspuren = Funk-Vorschlag (sichtbar anders). |
| M4 | Knopf im Spur-Blatt bleibt tippbar (blass) und sagt den Grund; Blatt nennt die Grenze (höchstens 8 Spuren, übrige Töne bleiben auf DRUMS). |
| M5 | Busse je Kontext gemerkt (kein Neubau nach Offline-Render), alte Busse werden abgebaut (1,5 s Nachklang); aktive Einzelspur ohne Synth-Engine; Bus zieht DRUMS-Kit (Raum-IR, Gate, Pegel, Pad-Streifen) beim nächsten Schlag nach. Planer-Kosten je Einzelspur bleiben (eigener Kanal). |
| M6 | mxRole 'drums' beim Aufteilen; Perform-Gruppen zählen Einzelspuren zu DRUMS; GEN4 bietet nur „aus“, GR2/SND1 lassen Einzelspuren in Ruhe. |
| M7 | MIDI: Kanal 10, kein Programmwechsel, keine Träger-/Rückungs-Verschiebung der Drum-Noten. |
| L1 / L2 | Hinweiszeilen: Drive/Kompressor von DRUMS wirken danach je Spur; Mono-Klang verliert beim Auslagern das gemeinsame Legato. |
| L3 | über den undo/redo-Haken behoben. |
| L4 | Zusammenführen legt je Pad und Stelle nur einen Schlag (Locks ohne Doppel). |
| L6 | Song-Ansicht: Spurname (HH ZU) statt SYN n. Umblättern quer nicht geändert (offen). |

### Funk-Vorschläge (sichtbar anders, nicht gebaut)
1. Einzelspur im Noten-Editor als Drum-Editor (Schritte, Chance, Wirbel, Akzent, Locks, Pad-Namen) statt Klavierrolle; „▲ Stufe/+12“ dort aus.
2. [Auslagern ▾] dauerhaft vorn in der Aktionsleiste statt nur mit Auswahl.
3. Im Drum-Editor „gewählte Schritte → eigene Spur“ (L7).

### Offen
- L5: im Synth-Modus gehen beim Laden die Drum-Felder (Wirbel …) verloren (normClip 'synth').
- L6 quer: neue Einzelspuren liegen auf Spur-Seite 2, es wird nicht umgeblättert.
- L7 (s. Vorschlag 3).
- Remix (GR2/GEN4) erzeugt auf DRUMS wieder alle Pads → mit Einzelspuren doppelte HH; Vorschlag: vor dem Remix zusammenführen oder Remix verteilt.
- Aufnahme über die Tastatur auf einer Einzelspur speichert die Tonhöhe der Taste (nicht die Pad-Note).
- Klang-Editor einer aktiven Einzelspur zeigt „ECO“ (keine Engine) – nur Anzeige.
