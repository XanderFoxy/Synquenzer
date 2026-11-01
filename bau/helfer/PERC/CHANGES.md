# PERC – Perkussionsspur (North auf einer Synth-Spur)

Basis: `bau/snapshots/R-4300.html` (4.30.0) → `bau/helfer/PERC/index.html`. VERSION bleibt `'4.30.0'`, Format bleibt 5 (nur additive Felder).
Alle geänderten Stellen tragen `// PERC` bzw. `PERC:`; neuer Code steht im Block `PERC (Xander 01.11.)` vor „housekeeping“, CSS zwischen
`/* PERC-CSS-BEGIN */ … /* PERC-CSS-END */`. Neue Namen beginnen mit `perc…` / `PERC…`. `patch.diff` = alles gegenüber R-4300 (36 geänderte Zeilen, Rest neu).

Xander (01.11.): „eine Spur wie eine Perkussionsspur zusätzlich zur Drumspur … mit North … sobald man auf North schaltet, soll automatisch
erkannt werden, dass die Spur von der Transponierung ausgenommen wird.“

## Was neu ist

1. **North als Klangerzeugung jeder Synth-Spur** (neue Engine `'north'`, keine neue Spur-Klasse).
   - Wählbar: Klang-Editor `⋯` → „North – Perkussionsspur“, Engine-Liste (Chip „VA ▾“ in schmalem Hochformat), MS-2000-Schnellmenü,
     API `setEngine(t, 'north')` / `setParam(t, 'engine', 'north')`. Auf einer North-Spur zeigt der Kopf den Chip „North ▾“ – darüber
     zurück auf VA / FM / WT / MS 2000.
   - Klang: `sound.p.nk = {kit, ch: [12 Programme], md: Kit-Effekte}` – dieselben North-Daten wie auf der Drum-Spur (`MDX.kits`,
     `MDX.progs`, eigene Programme der Bibliothek). Die flachen Synth-Werte bleiben im Klang: VA → North → VA ist verlustfrei (Test).
   - Ton: ein eigener `synq-md`-Knoten je North-Spur, Ausgang → Eingang der Spur (`trackIn`). Damit wirken **FX › SPUR** (Drive, Chorus,
     Hall-/Echo-Send, Lautstärke, Panorama, Pumpen, LFO-Spur-Routen) und die **Kit-Effekte** (Hall/Echo der Engine) wie bei jeder Spur.
     Native LFO-Routen des alten Synth-Klangs (Tonhöhe, Filter, Tremolo) wirken auf North nicht – nur die Spur-FX-Routen (§9.6).
2. **Belegung (entschieden):** Kanal = Tonklasse der Note, Reihenfolge der Drum-Pads:
   C KICK · C♯ SNARE · D RIM · D♯ CLAP · E HH ZU · F HH OFFEN · F♯ TOM TIEF · G TOM MITTE · G♯ TOM HOCH · A BECKEN · A♯ PERC · H SHAKER.
   Die Oktave **C4–H4** (MIDI 60–71 = Standard-Tastatur einer Synth-Spur) spielt die Kanäle wie programmiert; jede Oktave darüber /
   darunter verschiebt die Kanal-Tonhöhe um ±12 HT (höchstens ±48, Grenze der Engine) – gestimmte Toms, tiefe Effekte usw.
   Folgt die Spur doch (Schild aus), verschiebt eine Transposition nur die Tonhöhe des Kanals, **nie den Kanal** (Kick bleibt Kick).
3. **Automatisch „folgt nicht“:** Der Wechsel auf North setzt `tr.follow = false` und merkt den vorigen Wert in `tr.percF = {f}`
   (additiv). Transponierung, Akkord-Folgen, Teil-Transposition und „Eine Skala“ lassen die Spur aus (dieselbe Regel wie ⇅ fest).
   Der Wechsel zurück auf eine Synth-Engine stellt `follow` wieder her. Gilt für jeden Weg (Engine-Wahl, Bibliothek, Init, Undo).
   - Schild **„folgt nicht“** am Spurkopf (Querformat und niedrige Hochformate zweizeilig).
   - Abschaltbar: Schalter „folgt nicht / folgt“ auf der Seite NORTH (44 px, eigener Undo-Schritt `percf`); der bestehende
     ⇅-FEST-Knopf der Spurleiste wirkt ebenso.
   - **Ein Undo je Wechsel:** `soundSnapshot` trägt bei North-Spuren `pf {fo, f}` mit; bei allen anderen Spuren ist der Schnappschuss
     Zeichen für Zeichen der alte.
4. **Bearbeiten:** Klang-Editor mit Reitern **NORTH | FX**. NORTH: Kit ▾ (4 North-Kits + eigene North-Klänge), Schalter „folgt nicht“,
   12 Kanäle mit ▶ (Taste + Name, antippen = hören) und Programm ▾ (Kategorien + Eigene, wie auf der Drum-Spur). ‹ › blättern Kits,
   🎲 wählt je Kanal ein Programm derselben Kategorie, Init = erstes Kit. Rolle und LAUF zeigen **Kanal-Namen** statt Notennamen
   („KICK“, „KICK +1“, „SHAK. −1“). Die Drum-Spur ist unverändert (Test: Render bitgleich, Klang und Log gleich).
5. **Überall gleich:** Speichern/Laden (deep-equal), Bibliothek (Klang mit `engine: 'north'` und `p.nk`), Video-Offline-Render und
   GarageBand-Export (eigener Knoten je North-Spur im Offline-Kontext mit Programmen als `processorOptions.init`, Quittung vor jedem
   Weiterrechnen wie die Drum-Spur seit 4.30.0; der Live-Zustand kommt unverändert zurück), Konsolidieren (Noten bleiben, Render gleich).
   **MIDI-Export:** eine North-Spur liegt auf Kanal 10 mit der GM-Note der Pad-Rolle (wie die Drum-Spur), ohne Programmwechsel –
   in GarageBand/DAW spielt sie also Schlagzeug. Die Oktav-Tonhöhe geht im MIDI verloren (GM kennt sie nicht).
6. **Leistung:** `synq-md` lädt nur, wenn ein Pad oder eine Spur North spielt (Test: Demo ▶ ohne North = Modul `idle`, 0 Knoten).
   Gemessen (Chromium headless, Xeon 2,8 GHz, 44,1 kHz; Last = Anteil der Echtzeit laut Engine): Drum-Spur mit 12 North-Pads im
   16tel-Muster ≈ 1,2–2,1 %; **dazu eine North-Spur mit 16teln über alle 12 Kanäle ≈ 3,9–6,1 % gesamt (+2,6–4,0 %)**, Spitze ≤ 9,1 %.
   Der CPU-Begrenzer (`MDX.setLim`) erreicht die neuen Knoten automatisch (sie stehen in `MDX.nodes`).

## Geänderte Stellen (Überblick)

| Bereich | Stelle |
|---|---|
| SQStore | `SYNTH_ENGINES` + `'north'`; `normSynthP` normalisiert `p.nk` (über `window.PERCN`) |
| Spur | `normTrack`: `percF` (additiv) |
| Labels | `ENG_OF`, `ENG_API`, `ENGINE_LABEL` + north; `soundLabel` zeigt „North · Kit“ |
| Audio | `syncEngine` → `percEngineSync`; `syncTrackChains`/`restoreTrack` geben Knoten frei; `ensureAudio`/Projektwechsel → `percBoot`; `rebuildNativeLfos` (nur Spur-FX-Routen) |
| Stimme | `spawnVoice`: North-Klang → `percVoice` (Stimmen-Hülle wie Worklet-Stimmen); `silenceAll` → `percSilence`; `tailKill` → `percPanic` |
| Folgen | `applySound` → `percFollowRule`; `soundSnapshot`/`restoreSoundSnapshot` (+pf); Undo-Art `percf` |
| Engine | `setEngineOf`/`setEngine` + north (verlustfrei, Standardblock wird wieder entfernt); `initSound`, `randomize` |
| Editor | `buildSynthEd` (NORTH/FX, Chip, ‹ › Kits), `fillSynthTab` → `percPage`, `edHeadRefresh` (Kit-Name), `engChip`, `openEdMore`, MS-2000-Schnellmenü |
| Raster | Spurkopf-Schild `percfb` |
| Rolle/LAUF | `PianoRoll` Option `rowName`; LAUF-Beschriftung |
| MIDI | `assembleMidi`, `buildMidi`, `buildMidiLog`, `buildMidiSong` |
| Video/GB | `vvSwapIn`/`vvSwapOut`/Flush → `percVvSave`/`percVvBoot`/`percVvRest`/`percVvFlush` |
| API | `percInfo`, `percLog`, `percLogClear`, `percQuery`, `percKit`, `percProgram`, `percFollow`, `percRow`, `percMap` |

## Zusammenspiel mit den parallelen Paketen

- **NORTHI** (North-Einträge in Kit-Browser/Instrumentliste, „Drums | North“): betrifft die Drum-Spur – PERC fasst den Kit-Browser
  nicht an. Kits/Programme liest PERC nur über `MDX.kits` / `MDX.progs` / `mdLibList()`.
- **NDP** (North-Platte im Geräte-Stil): die Seite NORTH der Perkussionsspur ist bewusst schlicht (`percPage`); kommt die Platte,
  kann `fillSynthTab` statt `percPage` die Platte für den Kanal zeigen – der Klang liegt dann in `sound.p.nk.ch[c]` (MDX-Form).
- **HARM** (Transponier-Standards): PERC nutzt nur `tr.follow` (+ `tr.percF`); jede Regel, die `follow === false` respektiert, lässt
  die North-Spur aus. Setzt HARM eigene Standards je Spur, bitte `percIs(tr)` als „folgt nicht“-Fall mitnehmen.
