# T1 Taktarten – Änderungen gegenüber 4.30.0 (`bau/snapshots/R-4300.html`)

VERSION bleibt `4.30.0` (der Dirigent vergibt die Nummer). Diff: `patch.diff`. Spec: `SPEC.md`.

## Neu
- **Taktarten** 4/4, 3/4, 2/4, 5/4, 6/8, 7/8, 12/8 mit Betonungsmuster (6/8 3+3, 7/8 2+2+3, 5/4 3+2, 12/8 3+3+3+3).
- **Je Song** (`S.ts`), **je Songteil** (`song.marks[].ts`), **je Clip** (`clip.ts`). Fehlt das Feld = 4/4 (alte Projekte unverändert).
- **Taktkarte** (`tkMap`, `barBeat`, `barAt`, `barLen`, `tsAtBar`, `barRound`, `barCeil`, `barFrac`; Transport: `tBarFloor`, `tBarNext`,
  `tTsAt`): einzige Stelle für Takt ↔ Schlag. Ohne Taktart-Feld liefert sie exakt `x * 4` (kein Aufbau, keine Allokation).
- **Bedienung:** Tempo-Fenster (Tipp auf BPM) → „Taktart des Songs“ (7 Knöpfe ≥ 44 px) mit Toast [Clips umrechnen];
  Teil-Blatt → [Taktart ▾] → [wie Song] + 7 Knöpfe, Toast „Für alle ‚Strophe‘“; Clip-Blatt → [Taktart 4/4 ▾] mit Umrechnung.
  Song-Ansicht zeigt die Taktart am Wechsel im Lineal (klein, gelb, links im Takt).
- **Metronom / Einzähler / H4-Vorzähler:** ein Klick je Zählzeit (♩ bzw. ♪), Eins 1760 Hz, Schlag/Gruppe 1100 Hz, Zwischen-Achtel
  1100 Hz mit halbem Pegel; Einzähler 1/2 Takte der Taktart am Start. TAKT-Anzeige „Takt.Zählzeit“, LED je Schlag/Gruppe.
- **Raster:** `grid().beatsPerBar` = Schläge des laufenden Takts; Clip-Start/Stopp, Aufnahme-Start, Teil-Sprung, [↩ SONG] auf den
  Taktstrichen der Taktart. Song-Abspielen, Schleife, Sprung, Ende, Einfügen/Überschreiben, Träger, Teil-Transposition, Melodie,
  Song-Stimme (Takes), G3-Anlauf/Ausklang, G5, G6+-Chor-Abfrage, eigene Clips, Konsolidieren/Blöcke über die Taktkarte.
- **Taktart ändern verschiebt nichts:** Träger, Transposition und Melodie bleiben an ihrem Takt (gleicher Abstand zum Taktbeginn);
  was im kürzeren Takt keinen Platz hat: Noten fallen weg, Träger/Transposition rücken auf den nächsten Taktstrich. Ebenso beim
  Verschieben/Einfügen von Takten (`songShift`, `songWrite`). Je Aktion genau ein Undo-Schritt (neue Undo-Art `ts` für die
  Song-Taktart samt Song und Clips).
- **Drum-Pattern-Umrechnung** (`t1ConvClip`, SPEC §5): gleiche Art = Stelle bleibt / zweite Hälfte füllt auf; ♩ ↔ 6/8/12/8 =
  Schlag → Gruppe mit ternärer Verteilung; 4/4 → 6/8 → 4/4 = Original. Schritte-Ansicht: 8/12/14/20/24 Schritte je Takt,
  Spalten so, dass jede Zelle ≥ 44 px ist; Akzent-Zellen an Schlag-/Gruppenanfängen; Muster/Euklid unverändert in 16tel.
- **Clip-Editor (Piano-Roll):** Taktstriche, Takt-Chips, Loop-Bereich, Länge ziehen, Positionsanzeige nach Clip-Taktart; die
  Song-Melodie-Rolle nach der Taktkarte. Mäusekino (VV4) zeichnet Taktstriche der Clip-Taktart.
- **Aufnahme / FANG:** neuer Clip bekommt die Taktart seiner Stelle; Länge in Takten dieser Taktart; FANG in der Song-Taktart.
- **MIDI-Export:** `FF 58` bei Tick 0 und bei jedem Wechsel (Song), je Szene (Szenen-Export), Song-Taktart (Mitschnitt);
  `cc` 24 (♩), 36 (punktierte ♩: 6/8, 12/8), 12 (♪: 7/8). Marken-Texte an den Taktstrichen der Taktkarte. 4/4 = Bytes wie bisher.
- **GarageBand-Export:** Vorzähler = Takte der Taktart des ersten Takts, Klicks mit demselben Betonungsmuster wie das Metronom.
- **Video:** Länge/Fortschritt in Schlägen der Taktkarte; Regie bleibt in Takten (Taktgrenzen aus den Marken).
- **Format:** Projekte mit Taktart-Feld = Format 7, Lese-Grenze 7 (ältere Fassungen sperren statt still 4/4). Ohne Feld: wie bisher.
- **Test-API:** `tsList`, `setSongTs`, `setMarkTs`, `setClipTs`, `tkInfo`, `tsDef`, `convClip`.

## Unverändert (Regel 28)
- Alte Songs/Klänge: Projekt-JSON zeichengleich, jedes geplante Ereignis (Stimme, Drum, Klick) sample-gleich (`tests/t1-bitgleich.mjs`).
- Wellen-Datenblock `MKD` zeichengleich, „MS 2000“ 1×, `  live: true,` 1×, keine Markenwörter, VERSION 4.30.0.

## Test-Erwartungen, die sich ändern (Regel 26)
- Tests, die `PROJECT_FORMAT_READ === 6` erwarten, sehen jetzt 7.
