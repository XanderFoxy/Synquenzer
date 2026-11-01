# Stufe B1 – T1 Taktarten + SX11 leicht/voll + N8I134 (I1 Kern, I3 Mal-LFO, I4 Tipp-Summen)

Basis `bau/snapshots/R-4300.html` (4.30.0) → `bau/stage/B1/index.html`, Diff `stage.diff`. **VERSION bleibt `'4.30.0'`.**
Zusammengeführt mit `git merge-file` (3-Wege): erst SX11 + N8I134 (0 Konflikte), dann T1 dazu (3 Konflikte, alle „beide Seiten behalten“).

## Was die drei Pakete bringen (kurz)

### T1 Taktarten (Zweig `t1-taktarten`, Details `bau/helfer/T1/CHANGES.md`, `SPEC.md`)
- 4/4, 3/4, 2/4, 5/4, 6/8, 7/8, 12/8 je Song (Tempo-Fenster), je Songteil (Marken-Blatt [Taktart ▾]) und je Clip (Clip-Blatt), mit Betonung
  im Metronom/Einzähler, TAKT-Anzeige „Takt.Zählzeit“, Drum-Umrechnung, Schritte-Ansicht 8/12/14/20/24, MIDI `FF 58`, GarageBand-Vorzähler.
- Eine Taktkarte (`barBeat`, `barAt`, `barLen` …) für Takt ↔ Schlag; ohne Taktart-Feld exakt `Takt × 4`.
- Format: Projekte mit Taktart-Feld = Format 7, Lese-Grenze 7. Ohne Feld wie bisher.

### SX11 Teil-Fassungen leicht/voll (Zweig `sx11-varianten`, Details `bau/helfer/SX11/CHANGES.md`)
- Marken-Blatt: [Leicht] [Voll] [⧉ Variante] [Einfügen]; Vorschlag „leicht“ nach Spur-Rolle, ausgedünnte Drums als eigener Clip,
  im Lauf am nächsten Taktstrich, je Aktion 1 Undo-Schritt, `mark.vr` additiv (ohne Feld byte-gleich).

### N8I134 (Zweig `n8-i134`, Details `bau/helfer/N8I134/CHANGES.md`)
- I1 Super-Regler-Kern + weicher Szenenwechsel (`clip.st`, Morph im Worklet), NEIGEN-Logik – nur Test-API, Bedienung wartet auf Fragen 2–4.
- I3 Mal-LFO: 6. Form ✎ in der LFO-Form-Leiste, Form-Blatt, Bibliothek, Worklet-Tabelle, `l1f`/`l2f`.
- I4 Tipp-Summen-Kern (`tapNotes`). Baustein N: `need` aus den Daten, nur in der gespeicherten Kopie.

## Beim Zusammenführen gelöst / angepasst

| # | Stelle | Problem | Lösung |
|---|---|---|---|
| 1 | `normClip`, `cleanClip`, `marksNorm` | 3 Text-Konflikte (T1 `ts` ↔ N8 `st`, T1 `ts` ↔ SX11 `vr`) | beide Zeilen behalten (T1 zuerst; neue Felder gibt es nur in neuen Projekten, alte bleiben zeichengleich) |
| 2 | Test-API `SYNQUENZER.tkInfo` | T1 setzte `tkInfo` (Taktkarte) per `Object.assign` **über** den vorhandenen STIMME-Schlüssel `tkInfo` (TK_API) – brach `sx-kon` (Gesang/Chor) und alle STIMME-Tests in `bau/tests` | T1-Schlüssel heißt jetzt **`taktInfo`**; `tkInfo` ist wieder die STIMME-Abfrage. **Test-Anpassung:** `t1/t1-taktarten.mjs` ruft `Q.taktInfo(7)` statt `Q.tkInfo(7)` (2 Stellen) |
| 3 | `function stStart` (N8 I1a) | doppelter Top-Level-Name: N8 legte `stStart(i, clip, t0, t1, tBar)` neben die vorhandene STIMME-Aufnahme `stStart(opts)` im selben Skript-Block – die spätere Deklaration gewinnt, „● Singen“ hätte den Morph-Start aufgerufen (Fehler schon in N8I134 allein) | N8-Funktion heißt **`stMorphStart`** (2 Aufrufe in `stTick`) |
| 4 | `HIST` (Verlauf-Rekorder) | N8 hatte `unknown: new Set(),` versehentlich in den Zeilen-Kommentar geschoben → `HIST.unknown` fehlte; T1s neue Undo-Art `ts` ist dort unbekannt → Seitenfehler „reading 'add'“ bei jeder Taktart-Änderung | `unknown: new Set()` wieder Code; T1-Undo-Art registriert: `HIST.kind('ts', () => [[]])` (ganzes Projekt, wie der bisherige Rückfall) |
| 5 | SX11 `sx11ThinSeg`, Kanten-Bereinigung in `sx11Set` | SX11 rechnete Clip-Start `Takt × 4` – in Teilen ≠ 4/4 falsch (7/8: [Voll] gab nicht exakt den Stand zurück) | über die T1-Taktkarte: `barBeat(x0)`, `barBeat(n.bar)` (ohne Taktart-Feld = `× 4`, also unverändert) |
| 6 | SX11 Spur-Eintrag des dünnen Clips | Schlüssel-Reihenfolge `{bar, slot, own, ph}` ≠ `laneNorm` `{bar, slot, ph, own}` → Speichern nach Laden nicht zeichengleich, sobald eine Phase da ist (im 3/4-Song mit 4/4-Klängen häufig) | Eintrag in der Reihenfolge von `laneNorm` gebaut. (Dieselbe Reihenfolge hat `ownMake` schon in 4.30.0 – Bestand, nicht geändert) |
| 7 | Marken-Blatt quer, [Taktart ▾] aufgeklappt | T1 legt die 8 Taktart-Knöpfe in die feste 44-px-Zeile `.ms-bb`; ihre 2. Reihe lief über „Als neuen Teil konsolidieren“ (T1 allein) bzw. über die SX11-Fassung-Zeile (B1) | quer: aufgeklappte Taktart als eigene Zeile, 8 nebeneinander (`.ms-bb:has(> .t1ts)`); hochkant unverändert |
| 8 | VERSION, `  live: true,`, NO_SYNC, Format | – | VERSION `'4.30.0'`; `  live: true,` 1×; NO_SYNC von keinem Paket geändert; `PROJECT_FORMAT` 5, Lese-Grenze 7 (T1), `need` nur in der Datei (N8): passen zusammen (Datei mit Taktart + Form = Format 7 + `need: ["lf"]`; ohne neue Felder Format 5 ohne `need`) |

### Entscheidungen der Bau-Leitung (umgesetzt)
- **LFO-Form-Leiste ≥ 44 px (N8I134 Befund 7):** Tasten 44 px breit (statt 40), Höhe 40/32/36 px bleibt sichtbar gleich, die Trefferfläche reicht per
  `::before` mittig auf 44 px (Muster `.seg.mkqeng`). Zeile, LFO-Seite und Synth-Blatt sind in allen drei Formaten gleich hoch wie 4.30.0.
  Den Platz gibt „S&H“ zurück: es war durch das neue 6. Feld ✎ nicht mehr letztes Feld, bekam dadurch 18 px Schrift und wurde 52 px breit – jetzt
  wieder 12 px wie in 4.30.0.
- **Tempo** bleibt ♩ = BPM (wie GarageBand), auch bei 6/8 und 12/8.
- **Eigene Gruppierungen** (7/8 als 3+2+2 …) kommen später.
- **LFO „1 Takt“ = 4 Schläge** vorerst, auch in 3/4 oder 7/8 (Takt-Sync 1/1 = 4 Schläge, Mal-LFO-Zyklen ebenso). Geprüft in `b1-zusammen` D.
- Alle anderen Fragen der Pakete: unverändert gelassen (siehe unten).

### Zusammenspiel (geprüft, `tests/b1/b1-zusammen.mjs`)
- **SX11 leicht in 3/4:** Die Hi-Hat-Regel „höchstens Achtel“ arbeitet auf der Clip-Zeit und folgt damit der Taktart: im 3/4-Takt 6 Achtel je Takt,
  im 7/8-Teil höchstens 7, alle auf dem Achtelraster ab Taktanfang; Kick/Snare gleich wie voll; der dünne Clip trägt die Taktart des Originals.
  Im 4/4-Song bleibt es bei 8 je Takt (SX11-Tests unverändert grün).
- **Konsolidieren eines leichten Teils im 3/4-Song:** klingt gleich, der neue Teil (4 Takte, dünne 3/4-Drums) hinten eingesetzt klingt wie der
  leichte Refrain, [Zurückholen] exakt.
- **N8-Morph** „1 Takt“/„2 Takte“ folgt dem laufenden Takt (`grid().beatsPerBar`: 3/6 Schläge in 3/4). **LFO-Zyklen** bleiben 4 Schläge je „Takt“
  (Entscheidung oben, so gelassen und notiert).
- **Speichern/Laden** mit Taktart + Fassung + gemalter Form: Format 7, `need: ["lf"]` nur in der Datei, alles deep-equal, erneut gespeichert
  zeichengleich.

### Bekannt, nicht geändert
- S0 `s0OffShift` (Marke vorne kürzen/teilen mit ausgeschalteten Spuren) rechnet die Phase noch in `Takt × 4` – betrifft nur Teile ≠ 4/4 mit
  S0/SX11-Auswahl, die man vorne kürzt. Gehört zu T1s Liste „rechnen noch in 4/4-Takten“.
- Marken-Blatt quer: ✕ (32 px) ragt schon in 4.30.0 4 px in die erste Knopf-Zeile.
- `sx11Held` hält den dünnen Clip bis „Taktstrich − 4 Schläge“; mit Takten bis 6 Schläge (12/8) unkritisch, da der Wechsel immer am nächsten Taktstrich liegt.
- Alle offenen Punkte der Pakete bleiben offen (T1 STATUS „Offen“, SX11 „Offene Punkte“, N8I134 „Offen / Abweichungen“ 1–9).

## Fragen an Xander
**T1** (Tempo ♩, Gruppierungen, LFO-Takt sind entschieden, siehe oben)
1. Dirigent/Server: Nimmt der Online-Wächter (`max_format`) Format 7 an, bevor Taktarten-Projekte hochgeladen werden?

**SX11** (unverändert offen)
2. Drum-Ausdünnung so richtig (offene Hi-Hat wird zur geschlossenen, statt ganz zu fehlen)?
3. Markierung „·L“ in der Taktleiste: so lassen oder ohne?
4. Eigene Taste „leicht, aber Drums voll“?

**N8I134** (gebaute Vorgaben unverändert, Bedienung wartet)
5. I1 Frage 2 (Super-Regler-Feld / Vormachen-Leiste), Frage 3 (V6a-Bedienung, Regler-Marke), Frage 4 (Fahrten im Song) – bis dahin nur Test-API.
6. I3: „Meine Formen“ (F5) nicht gebaut; Aufräum-Korpus nur 56 % (Treppe 8/16, Gate, Puls, Triller schwach) – Schwelle anpassen oder so lassen?

**B1**
7. LFO-Form-Leiste jetzt 6 × 44 px breit: passt das so am iPhone (Treffen, Optik von „S&H“ klein wie früher)?
