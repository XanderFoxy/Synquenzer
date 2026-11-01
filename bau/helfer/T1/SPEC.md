# T1 Taktarten – Spec (Helfer-Paket, Basis App 4.30.0 = `bau/snapshots/R-4300.html`)

Freigabe: Xander 31.10. ~17:35 („3/4, 6/8, 5/4, 7/8 …; Raster, Metronom, Quantisieren, Gesang, Video ziehen mit“), Paket T1 „JA“.
Vorgaben aus: Nachtrag 8 A.15, §4.2, §4.9 (I3), Nachtrag 9 („nie die Zahl 4 direkt“), Konzept Schnitt/Übergänge („Schläge statt 16tel;
der Takt kommt immer aus den Marken“), `typische-fehler.md` (bes. 8, 9, 26–28).

## 1. Grundsatz

- **Die Zeit-Einheit bleibt der Schlag = Viertelnote.** `S.bpm` bleibt Viertel je Minute (wie Logic/GarageBand). Alle gespeicherten
  Beat-Positionen (`song.carrier`, `song.xp`, `song.mel`, Video-Regie, Takes, Übergänge, `song.sr`, Clip-Noten `t`/`d`) bleiben in Schlägen.
- **Takt-Indizes bleiben Takt-Indizes** (`lanes[].bar`, `marks[].a/len`, `loop.a/b`, `song.bars`, Clip `len`). Neu ist nur, wie viele
  Schläge ein Takt hat. Die Umrechnung Takt ↔ Schlag läuft überall über **eine** Taktkarte (§3), nie über die Zahl 4.
- **Alte Projekte (ohne Taktart-Feld) = 4/4, bitgleich** (Regel 28): Jede Rechnung über die Taktkarte liefert für 4/4 exakt dieselbe
  Gleitkommazahl wie vorher `x * 4` (alle Taktlängen sind Vielfache von ½ Schlag, also exakt darstellbar). Ein Projekt ohne Taktart
  schreibt beim Speichern **kein** neues Feld (JSON zeichengleich).

## 2. Taktarten

| Taktart | Schläge (♩) je Takt | Zählzeit | Zählzeiten | Betonung (2 = Eins, 1 = Gruppe/Schlag, 0 = Zwischen) | Gruppen |
|---|---|---|---|---|---|
| 4/4 | 4 | ♩ | 4 | 2 1 1 1 | 1+1+1+1 |
| 3/4 | 3 | ♩ | 3 | 2 1 1 | 1+1+1 |
| 2/4 | 2 | ♩ | 2 | 2 1 | 1+1 |
| 5/4 | 5 | ♩ | 5 | 2 1 1 1 1 | 3+2 |
| 6/8 | 3 | ♪ | 6 | 2 0 0 1 0 0 | 3+3 |
| 7/8 | 3,5 | ♪ | 7 | 2 0 1 0 1 0 0 | 2+2+3 |
| 12/8 | 6 | ♪ | 12 | 2 0 0 1 0 0 1 0 0 1 0 0 | 3+3+3+3 |

Datenwert: Zeichenkette `'3/4'` usw.; nur diese sieben Werte, alles andere = Feld fehlt (= 4/4).

## 3. Daten (nur additiv)

| Feld | Bedeutung | fehlt = |
|---|---|---|
| `S.ts` | Taktart des Songs (gilt für Szenen, Song und alle Teile ohne eigene Taktart) | 4/4 |
| `song.marks[i].ts` | Taktart eines Songteils (der Takte `a … a+len−1`) | Taktart des Songs |
| `clip.ts` | Taktart, in der der Clip gebaut ist: Clip-Länge in Schlägen = `len × Schläge(ts)` | 4/4 |

- `S.ts`/`m.ts`/`c.ts` = `'4/4'` werden nicht gespeichert (gelöscht), damit 4/4 nie ein neues Feld erzeugt.
- `normalizeProject`, `marksNorm`, `normClip`, Kopieren/Einfügen/Duplizieren (tiefe Kopie), Undo-Schnappschüsse (Projekt, Song, Clip)
  tragen die Felder mit. Speichern → Laden ist deep-equal.

**Taktkarte** (`tkMap`): für jeden Song-Takt `b` die Taktart (`m.ts` der Marke, die `b` enthält, sonst `S.ts`), den Anfang in
Song-Schlägen (Präfix-Summe) und die Länge. Hinter dem letzten Takt läuft die Song-Taktart weiter. Funktionen:
`barBeat(b)`, `barLen(b)`, `tsAtBar(b)`, `barAt(beat)` (Takt, in dem ein Song-Schlag liegt), `nextBarLine(beat)`.
Ohne jedes Taktart-Feld (Normalfall) liefern sie direkt `b * 4` usw. (kein Aufbau, keine Allokation; Performance).
Die Karte wird bei jeder Änderung (markDirty, Undo/Redo, Laden) neu gebaut, sonst gecacht.

## 4. Folgen

1. **Raster:** `grid().beatsPerBar` = Schläge des aktuell gespielten Takts (Szenen: `S.ts`; Song: Takt unter dem Abspielpunkt).
   Taktgrenzen für Clip-Start/-Stopp, Aufnahme-Start, Teil-Sprung, FANG: nächster Taktstrich nach Taktkarte. Quantisieren
   (1/4 … 1/32) bleibt in Schlägen (Rasterweite unverändert); die Taktstriche im Editor kommen aus der Clip-Taktart.
2. **Lineal:** Song-Ansicht zeichnet je Takt eine Zelle wie bisher (gleiche Breite je Takt), die Taktnummer und – wenn ≠ 4/4 –
   die Taktart am Beginn jedes Wechsels („3/4“). Clip-Editor/Piano-Roll: Taktstriche alle `Schläge(c.ts)`, Gruppenstriche
   (6/8: alle 1,5 Schläge, 7/8: 2+2+3 Achtel) dünn. Lineal-Tipp auf eine Taktzahl wählt diesen Takt (wie bisher).
3. **Metronom / Vorzähler / Einzähler:** ein Klick je **Zählzeit** (♩ bzw. ♪) nach §2, Betonung 2 = 1760 Hz (wie heute die Eins),
   1 = 1100 Hz (wie heute), 0 = 1100 Hz mit halbem Pegel. Klickzeit sample-genau `b2t(Taktbeginn + k × Zählzeit)`. 4/4 = exakt die
   alten Klicks. Einzähler „1 Takt“/„2 Takte“ = 1/2 Takte der Taktart am Startpunkt (z. B. 3/4 → 3 Schläge).
4. **Drum-Pattern:** Schritte bleiben 1/16 (0,25 Schlag); Schritte je Takt = Schläge × 4 (3/4 = 12, 6/8 = 12, 7/8 = 14, 5/4 = 20,
   12/8 = 24, 2/4 = 8). Umrechnung beim Ändern der Clip-Taktart (§5).
5. **Arpeggiator / Sequencer:** laufen in Schlägen (Rate 1/8 usw. unverändert). Neustart „pro Takt“ (Transposer `change: 'bar'`)
   nutzt `grid().beatsPerBar`.
6. **Chor / Gesang:** Takes und Teile bleiben in Schlägen bzw. Takt-Indizes; Vorlauf/Anlauf in Takten (`G3_PRE_BARS`) und
   Takt-Rechnungen über die Taktkarte.
7. **Video-Regie:** Schnitte auf Taktgrenzen nutzen die Taktkarte (Taktstriche aus den Marken).
8. **GarageBand-Export:** Vorzähler-Klick im WAV mit dem Betonungsmuster des ersten Takts (wie das Metronom).
9. **Konsolidieren / Blöcke:** Blöcke hängen an Takt-Indizes; Schlag-Werte innerhalb eines Blocks über `barBeat`. Ein Block nimmt
   die Taktart seines Teils mit (`ts` am Block/Teil-Abschnitt), Einsetzen setzt sie wieder.
10. **MIDI-Export:** Time-Signature-Meta `FF 58 04 nn dd cc bb` bei Tick 0 (Song-Taktart) und bei jedem Taktart-Wechsel
    (Tick = `barBeat(b) × PPQ`); `cc` = 24 (♩) bzw. 36 (punktierte ♩ bei 6/8, 12/8), `bb` = 8. Marken-Texte an `barBeat(m.a)`.
    Clip-Export: Taktart des Clips.
11. **Takt-Anzeige** (Takt/Schlag in Kopf/Song, „Takt 3, Schlag 2“): über die Taktkarte.

## 5. Taktart ändern (Bedienung)

- **Song-Taktart:** Song-Blatt (⋯ des Songs) → Zeile „Taktart“ mit 7 Knöpfen (≥ 44 px). Gilt für Szenen und alle Teile ohne
  eigene Taktart. Ein Schritt im Undo.
- **Teil-Taktart:** Marken-Blatt (Tipp auf eine Teil-Marke) → „Taktart“: [wie Song] + 7 Knöpfe. Toast „Für alle ‚Strophe‘“ (wie
  bei Akkorden). Ein Schritt im Undo.
- **Song-Daten mitnehmen:** Ändert sich die Länge eines Takts, rutschen alle Schlag-Positionen dahinter mit (Träger, Teil-Transposition,
  Melodie, Video-Regie, Takes, Übergänge, Fahrten), so dass jedes Ereignis im selben Takt an derselben Stelle (Schlag-Abstand zum
  Taktbeginn) bleibt. Ereignisse, die im kürzeren Takt keinen Platz mehr haben, fallen weg (Noten) bzw. rücken auf den nächsten
  Taktstrich (Träger/Transposition). Undo bringt alles zurück.
- **Clip-Taktart:** Clip-Blatt → „Taktart“ (zeigt die Taktart des Clips). Neue Clips (Aufnahme, leere Zelle) bekommen die Taktart,
  die an ihrer Stelle gilt. Wechsel = Umrechnung Takt für Takt: jeder Takt behält seine Noten an derselben Stelle; was über den
  neuen Takt hinausgeht, fällt weg; ist der neue Takt länger, wird der Rest mit der **zweiten Hälfte** des alten Takts aufgefüllt
  (4/4 → 5/4: Schlag 5 = Schlag 3; Backbeat-Muster bleibt Backbeat). 4/4 → 6/8/12/8 (Achtel-Gefühl): Achtel-Positionen werden
  auf die Zählzeiten verteilt (Schlag k der ♩-Takte → Achtel-Gruppe k), d. h. Bassdrum auf 1 bleibt auf 1, Snare auf 2/4 landet
  auf Gruppe 2 (Zählzeit 4 in 6/8). Ein Undo-Schritt.
- Beim Ändern der **Song-Taktart** fragt ein Toast: [Clips umrechnen] (alle Szenen-Clips ohne eigene andere Taktart) – sonst
  bleiben die Clips wie sie sind (polymetrisch, Klang unverändert, Regel 28).

## 6. Abnahme (Tests in `tests/`)

- T1-01 je Taktart: Metronom-Klicks offline gerendert (`OfflineAudioContext` über die App-Klickfunktion) → Klick-Abstände
  sample-genau = Zählzeit, Betonung (1760 Hz) genau auf jeder Eins.
- T1-02 Raster/Lineal: `grid().beatsPerBar`, `barBeat`, Taktstriche im Clip-Editor und in der Song-Ansicht je Taktart.
- T1-03 Wechsel im Song: Teil in 3/4 zwischen 4/4-Teilen → Taktkarte, Klicks, Clip-Starts auf den richtigen Schlägen.
- T1-04 Drum-Pattern-Umrechnung (4/4 → 3/4, 6/8, 5/4, 7/8 und zurück).
- T1-05 Undo/Redo je Aktion genau ein Schritt; Speichern → Laden deep-equal.
- T1-06 MIDI-Export enthält `FF 58` mit richtigen Werten und Ticks.
- T1-07 Video/GarageBand: Klickmuster des Vorzählers, Taktgrenzen der Regie.
- T1-08 Alte Songs bitgleich: ohne Taktart sind Projekt-JSON, Taktkarte (`x*4`) und Offline-Render zeichengleich zu 4.30.0.
- Regressions: `bau/tests/smoke.mjs`, `orch-mk-check.mjs`, `v3-mk2-wellen.mjs`.

## 7. Nicht in T1 (Fragen an Xander, nicht gebaut – Regel 27)

- Tempo in punktierten Vierteln für 6/8/12/8 anzeigen (heute ♩ = bpm).
- Eigene Gruppierungen (z. B. 7/8 als 3+2+2, 5/4 als 2+3) und weitere Taktarten (9/8, 5/8 …).
- Form-Zyklen „1 Takt der Taktart“ für LFO/Pumpen (I3 §4.9) – Formen bleiben in Schlägen.
