# NPS – North auf der Perkussionsspur: jeder Kanal im Sounddesign, klassisches Gesicht

## Für Xander

- Seite NORTH sieht jetzt aus wie das Gerät: ein rotes Feld, oben das rote Ziffern-Display, darunter 12 schwarze Gummi-Pads. Ein Pad antippen wählt den Kanal und spielt ihn (oben antippen = laut, unten = leise). Das Display zeigt die Kanalnummer, daneben stehen Name und Programm.
- Unter den Pads sind die Tasten TONE · NOISE · CLICK · MIX · FX · HALL/ECHO. Jede öffnet die Platte direkt mit allen Reglern dieses Kanals. Oben rechts gibt es die große rote Taste „Platte“, wie bei der Drum-Spur. Programm ▾ geht weiterhin.
- So probierst du es aus: Synth-Spur ⋯ → North – Perkussionsspur. Dann KICK antippen, TONE drücken und DECAY drehen. Mit ↶ machst du es rückgängig, mit ✕ bist du wieder auf Seite NORTH.
- Auf der Platte (auch auf der Drum-Spur) sind die Kanal-Tasten und die Pads der Ansicht SPIEL jetzt schwarze Gummi-Schlagflächen. Sonst ist alles wie vorher.

## Technische Änderungen (nur `index.html`, Kürzel NPS)

**Platte (Block `sq-ndp-src`): Adapter statt Kopie**
- Die IIFE bekommt jetzt `G` mit den globalen md-Wegen der Drum-Spur: `(function (G) {` … `})({DRUM_T, MD_KIT_NAMES, ED, mdCurSl, mdCur, …, loadKit})`.
- Der Adapter-Block steht oben in der IIFE. Die Quelle ist `Q = {t, c}`, die Abfrage `QP()`. Diese Namen verdecken nur in der Platte die globalen: `ED` (ein Shim für dVoice), `DRUM_T`/`MD_KIT_NAMES` (`let`, beim Öffnen gesetzt), `mdCurSl`, `mdCur`, `mdIsSrc`, `mdUsed`, `mdSlot` (Lesesicht mit src 'md'), `mdKit`, `mdSet`, `mdScl`, `mdKitSet`, `mdLoadProgram`, `mdProgPop` (→ `percProgPop`), `mdList`, `mdTap`, `drumAudition`/`mdAudition` (→ `percHit`), `mdSoloApply` (`E.mute` am Knoten der Spur), `mdHeadSolo`, `mdFocus`, `mdEditEnd`, `drumSnd` (Lesesicht Kit), `soundEdited`, `kitId`, `loadKit`. Ohne Perkussionsspur ruft jeder davon unverändert `G.*` auf.
- Neue lokale Funktionen:
  - `qBind`/`qUnbind`: Quelle setzen bzw. lösen, MDE.sub merken, `o.sec` setzt Fokus und Rad, Seite NORTH wird nach ✕ neu gebaut.
  - `qTouch`: sndVer, dirty, `percEngineSync`.
  - `qSet` (ALLE KAN., relative PITCH), `qScl`, `qKitSet`, `qProg`, `qLoadKit`.
  - `qEdited`: „•“ hinter dem Kit, nach sndVer gecacht.
  - `qList` (Code-Listen), `qTap` (TAP).
  - `qMore` (⋯: Programm, Kit, Kanal kopieren/einfügen/Init, zurück).
- Kleine Eingriffe:
  - `open()` ruft `qBind(o)` auf, `close()` ruft `qUnbind(quiet)` auf.
  - `loop()` schließt die Platte, wenn die Spur kein North mehr spielt.
  - `chDown`: SHIFT + Kanal schaltet die Quelle nur auf der Drum-Spur um.
  - `morePop` springt auf der Perkussionsspur zu `qMore`.
  - Export `NDP.src()`, `NDP.seg {digit, paint}`, `NDP.css`.
- NDP-CSS-PLATTE (neue Regeln nach `.ndppad.dr`): `.ndpch .bank .ndpkey` und `.ndppad` sind schwarze Gummi-Pads (radial-gradient, Radius 12 px), dazu die Zustände `.dn`, `.sel`, `.foc` und `.sel.foc`, und `.ndppad.hit` (Aufhellen).

**Hauptskript (PERC-Bereich)**
- `ndpOpen(o)`: Mit `o.perc` geht der Aufruf an `percPlateOpen` (eine Zeile). Die Test-API `ndpOpen({perc: t, c, sec})` funktioniert damit gleich.
- Neu nach `percProgPop`:
  - `PERC_SECS`.
  - `percHit(i, c, vel)`: Schlag mit Anschlag.
  - `percPlateOpen(i, o)`: öffnet die Platte für die Spur. Der Synth-Editor bleibt darunter, Audio startet im Tipp.
  - `percPlate(pg, i, nk, top)`: baut Seite NORTH mit rotem Feld, Siebensegment + Streifen, 12 Pads, Sektionen, Programm ▾ und der roten Taste „Platte“ im Kopf.
- `percPage`: Eine Zeile ruft `percPlate` auf. Die alte Liste bleibt nur als Rückfall, falls der Platten-Block nicht lädt.
- CSS-Block `NPS-CSS` nach `PERC-CSS-END`: `.percplate`, `.percdisp`, `.percpads` (4×3 hochkant, 12×1 quer), `.percsecs`, `.percprg`, `.percplt`. Die Seite scrollt innen (`.pg.percpg.pan-y`). Quer bei wenig Höhe ist der Hinweis ausgeblendet.
- Datenformat, VERSION und CHANGES sind unverändert. Nur 3 bestehende Zeilen wurden geändert (IIFE-Kopf, IIFE-Aufruf, `chDown`), alles andere ist eingefügt.

## Getestet

- Das Skript ist `nps-test.mjs`: `node nps-test.mjs <index.html> <ordner>`. Alle 29 Prüfungen sind ok:
  - Seite NORTH: Display und 12 Pads sind da. Ein Pad wählt den Kanal und schlägt (oben laut, unten leise, im Schlag-Log).
  - Die Sektion TONE öffnet die Platte für die Perkussionsspur, Kanal KICK.
  - DECAY ziehen ändert `nk.ch[0].mDec`. Das gibt genau einen Undo-Schritt, und das Programm geht an den Knoten (`PERC.st[0].sent[0]`).
  - ↶ stellt den Wert zurück und sendet ihn neu. Die Drum-Spur bleibt dabei unberührt.
  - HALL·ECHO ändert `nk.md`. Die Kanal-Taste SNARE ist eine schwarze Schlagfläche und wählt Kanal 2. Ein SPIEL-Pad schlägt.
  - ✕ führt zurück auf Seite NORTH, dort ist derselbe Kanal gewählt.
  - Rückschritt-Probe Drum-Platte: Öffnen, Quelle Drum, DECAY gibt einen Undo-Schritt, Schließen. Alles ok.
  - Quer: Seite und Platte passen ohne Abschneiden. Alle Ziele sind ≥ 44 px, es gibt keine Konsolenfehler.
- Einzeln geprüft, ohne Fehler:
  - ALLE KAN. ändert alle 12 Kanäle mit 1 Undo. SOLO PART läuft.
  - LISTE: WAVE und MODE.
  - ⋯ Kopieren/Einfügen/Init, PROG-Liste, KIT-Liste, TAP ×4 (BPM-Modus), RATE/BPM.
  - Ein Wechsel der Spur weg von North schließt die Platte.
  - Die Drum-Platte stellt danach MDE.sub wieder her.
- Die vorhandene Drum-Platten-Probe `einpflegen/s438-tools/kern.mjs` liefert für Basis und neu die identische Ausgabe.
- Pflicht-Prüfungen:
  - `topdefs`: 0 Syntaxfehler, doppelt 0 (Basis ebenfalls 0; +4 neue Namen).
  - Smoke: errors [].
  - Verbotene Wörter: 0. „MS 2000“ = 1, `  live: true,` = 1.
  - Der Platten-Block besteht `node --check`.
- Fotos:
  - `nps-seite-hochkant.png` und `nps-seite-quer.png`
  - `nps-platte-hochkant.png` und `nps-platte-quer.png`
  - `nps-platte-spiel-hochkant.png`
  - `nps-drum-platte-hochkant.png`
  - `smoke.png`
