# SX126 – Song-Ende ausblenden · Klinge · Form-Vorlage

Basis: `bau/snapshots/R-4300.html` (App 4.30.0). VERSION bleibt `'4.30.0'`. Format bleibt 5, nur additive Felder.
Spec: `spec/konzept-schnitt-uebergaenge-video.md`, Abschnitte SX1, SX2, SX6.

## SX1 Song-Ende ausblenden

**Bedienung**
- Marken-Blatt des **letzten Teils** (die Marke ganz hinten): Zeile `AUSBLENDEN AM ENDE [aus] [2] [4] [8 Takte]`.
- Blatt „Video“: Zeile `AUSBLENDEN [aus] [2] [4] [8 Takte]` mit Hinweis „Auswahl-Ende“ bzw. „Song-Ende“.
  Hochkant liegt sie über den Knöpfen, quer unter der Vorschau (wie „Abspann“), damit die Bedienspalte nicht rollt.
- Jeder Tipp ist 1 Undo („Ausblenden am Ende: 4 Takte“ / „Ausblenden aus“). Derselbe Wert noch einmal ändert nichts.

**Daten:** `song.fade = {out: Schläge}` (1 … 256). Gespeichert als Schläge, angezeigt in Takten über die Hilfsfunktion
`sx1Bpb()` (= `grid().beatsPerBar`, die einzige Stelle für „Schläge je Takt“; T1 Taktarten muss nur `grid()` ändern).
Ohne Wert fehlt das Feld ganz; alte Projekte laden und speichern Zeichen für Zeichen gleich.

**Klang:** eine Rampe am Master. Neuer Knoten `AU.M.fade` (GainNode) in `FX.Master` zwischen `pre` und `ceil`.
Ohne Ausblenden steht er auf genau 1 (×1 ist bitgenau, gemessen: Master-Kette bitgleich zu R-4300).
Weil er vor `ceil` liegt, hören alle bestehenden Abgriffe das Ausblenden mit (Meter, „Song als Audio“, Mikro-Referenz),
ohne dass eine davon geändert werden musste.
- Planung in `sx1Tick()` (aus `tick()`): Ende = Song-Ende, im Video-/WAV-Render das Ende des Bereichs (`R.songPlay.sx1End`),
  in der Video-Vorschau einer Auswahl deren Ende. Ändert sich Tempo, Wert oder Ende, wird neu geplant (nur fallend).
  Schleife an oder Song-Aufnahme: kein Ausblenden.
- Kurve: bis zum letzten Schlag weich auf −36 dB (−36·u²), im letzten Schlag zügig auf −62 dB, dann 0.
  So hört Musik mit Spitzen zwischen 0 und −24 dBFS erst im letzten Schlag auf, über −60 dBFS zu liegen.
- Live: Am Song-Ende (oder bei ■ mitten im Ausblenden) wird es ganz still, Hall und Echo werden abgeschnitten
  (`tailKill`, sie lägen sonst voll laut hinter dem Ende), nach 0,75 s steht der Knoten wieder auf 1. Ein Neustart in dieser
  Pause stellt sofort auf 1. ■ vor dem Beginn der Rampe: sofort 1, nichts wird abgeschnitten.
- Offline (Video, WAV-Export „Mit GarageBand“): die Rampe bleibt stehen, der Ausklang ist still → der Video-Ton endet am
  Bereichsende (`tail` = 0).

**Mit dem Abspann-Logo:** Die Musik blendet bis zum Ende des Songs bzw. der Auswahl aus; genau dort beginnt der Abspann
(Abdunkeln, Logo setzt bei 50 % ein, 0,5 s Schwarz). Der Abspann ist still wie bisher. Videolänge = Song + Abspann
(ohne Ausklang, weil keiner mehr hörbar ist). Gemessen im fertigen MP4: letzter Schlag < −70 dBFS, Abspann −139 … −240 dBFS.

## SX2 Klinge

- In einer **geöffneten** Marke (Taktnummern sichtbar) auf einen **inneren** Taktstrich tippen (±12 px): Ein rundes Messer
  (SVG, 44 × 44 px) erscheint unter der Taktleiste am Strich. Tipp darauf teilt. Tipp woanders oder Rollen über den Rand: weg.
  An den Kanten eines Teils erscheint nie ein Messer (dort liegt der UE-Chip).
- Marken-Blatt: `[Bei Takt …]` (neben „Als neuen Teil konsolidieren“, sonst eigene Zeile) klappt eine Reihe Taktnummern
  auf („B ab Takt 2 3 4 …“, je 44 px, waagrecht wischbar); ein Tipp teilt dort.
- Ergebnis: „Refrain A | Refrain B“ (Toast mit Rückgängig). Ein zweites Teilen von „Refrain B“ ergibt „Refrain B | Refrain C“.
  Die Kurzform in der Taktleiste behält den Buchstaben („REF A“, „REF B“) – kleine Ergänzung in `partShortForm`.
- Nur die Marken ändern sich (`marksCut(song, n, n, true)`, S0-`mark.off` wandert mit) → klingt gleich
  (Noten-Log vorher = nachher, Pegel je Schlag ≤ 0,05 dB = Zufallsstreuung). 1 Undo.
- API: `SYNQUENZER.sx2Split(id, takt)` (Takt-Index 0-basiert, an dem B beginnt) → `{a, b}` oder `false`.

## SX6 Form-Vorlage

- Leerer Song („Noch kein Song.“) → `[Aus Vorlage …]` → Liste mit Form, Takten und Dauer beim aktuellen Tempo:
  - **Synthpop 84**: Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Bridge 4 · Refrain 8 · Outro 4 (52 Takte)
  - **Ballade**: Intro 4 · Strophe 8 · Pre 4 · Refrain 8 · Strophe 8 · Pre 4 · Refrain 8 · Bridge 8 · Refrain 8 · Outro 4 (64)
  - **Club**: Intro 8 · Aufbau 8 · Drop 16 · Break 8 · Aufbau 8 · Drop 16 · Outro 8 (72)
  - **Kurz fürs Video**: Intro 2 · Strophe 4 · Refrain 8 · Outro 2 (16)
- Legt leere Takte mit benannten Marken an (keine Clips, kein Klang). 1 Undo zurück zum leeren Song.
- Bei einem Song mit Inhalt: keine Vorlage (Hinweis), nichts ändert sich.
- API: `sx6Templates()`, `sx6Apply(k)`.

## Geänderte Altstellen (alle mit `// SX126`)
`FX.Master` (Knoten `fade`, Verkabelung), `normSong` (`sx1Norm`), `tick` (`sx1Tick`), `songPlayEnd` (`sx1End`),
`vvRenderAudio0` + `vvPrevStart` (Ende des Bereichs), `vvOpen`/`vvFit`/`vvSync` (Zeile „Ausblenden“), `openMarkSheet`
(Haken `sx126MarkSheetPaint`), `svTap` (Haken `sx2RulerTap`), `svDraw` (`sx2Place`), `buildSongView` (`sx6EmptyBtn`),
`partShortForm` (Buchstabe A/B bleibt), API-Liste. Neuer Code im Block `SX126-BEGIN … SX126-END`, CSS im Block
`SX126-CSS-BEGIN … SX126-CSS-END`.

## Offene Fragen (für Xander)
1. **Abspann:** Heute endet das Ausblenden am Song-/Auswahl-Ende, der Abspann (Logo) danach ist still. Soll die Musik
   stattdessen unter dem Logo weiterlaufen und erst mit dem Video-Ende ausgeblendet sein? (Dann müsste der Render über das
   Auswahl-Ende hinaus weiterspielen.)
2. **Hälften und Teil-Vorlage:** Die Hälften sind freie Marken (ohne Teil-Vorlage, daher amber statt Teilfarbe). Sonst würde
   „Auf alle übertragen“ / Teil-Vorlage ändern jede Hälfte wieder auf volle Länge aufziehen. Teilfarbe behalten gewünscht?
   (Kommt mit SX15 „Farbe für alle Marken“ von selbst.)
3. **Ausblenden live bei Schleife:** Mit eingeschalteter Schleife hat der Song kein Ende → kein Ausblenden. Gewollt?
4. **Video-Blatt hochkant 428 × 650:** Die neue Zeile macht die Vorschau 56 px niedriger (164 → 108 px).
5. **Tempowechsel mitten im Ausblenden** wird neu geplant (fällt nur); Taktarten (T1) brauchen nur `grid().beatsPerBar`.
