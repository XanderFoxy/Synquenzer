# N8I134 — Nachtrag 8: I1a–I1c (+ I1f-Logik), I3 (Form-Kern, FORMCLEAN, I3c, I3d), I4c — auf 4.30.0

Basis: `bau/snapshots/R-4300.html` (App 4.30.0). Version **nicht** geändert. Arbeitsdatei `index.html` wird von `mk.mjs` erzeugt:
4.30.0 + 50 fest verankerte Stellen (jede muss genau einmal passen, sonst bricht der Bau ab) + die Quellen in `src/`.
`patch.diff` = `diff -u` gegen R-4300. Zweig `n8-i134`.

## Schritt für Schritt

### 1. Bau-Gerüst
- `mk.mjs`: baut aus R-4300 + Stellen + `src/*.js`. Worklet-Teile werden auf reines ASCII geprüft, kein Quelltext darf `</script` enthalten.
- Sicherung der Basis: `.sicherung/N8I134/R-4300.html`.

### 2. Baustein N (A.4) — `S.need`
- `KNOWN_NEED = ['lf', 'sr', 'st']`; `needCalc(p)` aus den Daten (S.sr/song.sr → `sr`; clip.st → `st`; l1f/l2f, S.sr.f, song.sr[].f → `lf`).
- Geschrieben wird `need` **nur in die gespeicherte Kopie** (`needWith` in `serializeProject` und `projectFileObj`); das offene Projekt bleibt
  unverändert (der Verlauf-Rekorder VC2a vergleicht es). `need` steht in `HIST.volatile` (abgeleitetes Feld, wie `ui`).
- `normalizeProject`: unbekannte Merkmale → `_newer.n`, `nvLockOf` sperrt dann mit dem vorhandenen Hinweisband (wie VO-R1).
- Projekt ohne neue Felder: kein `need`, JSON zeichengleich.

### 3. I1c Super-Regler-Kern
- **`SRCore`** (`src/srcore.js`): Kennlinien lin/exp/db/hdec/pow/bipow genau wie `toNorm`/`fromNorm`, Weg über `Z_k` (Ziel ohne Schlüssel wird
  übersprungen), Stufen mit Hysterese ±0,02, Glättung τ 20 ms mit Einrasten, Fahrt exakt (ab t1 genau x1), Endwert mit „Δ = 0 → Basis
  unverändert“ (bitgleich). Derselbe Quelltext steht im Haupt-Faden und im Worklet (eine Fassung).
- **Daten**: `S.sr` mit `srNorm` (klemmt, sortiert, ≤ 3 Ziele, Abstand ≥ 0,10, ≤ 64/256 Einträge, 4 Stellen, unbekannte Felder und `f`
  bleiben), `song.sr` mit `srSongNorm` (nur Normalisieren – das Merken im Song wartet auf Frage 4).
- **Adressen** (A.1): `srDesc`, `srGet`, `srSet` für flache Schlüssel, `fx.*`, `gfx.*`, `mk.*`, `fm6.ops.*`, `fmx.ops.*`, `fmx.edge.*`, `drum.<Slot>.<k>`.
- **Worklet** (`src/n8wk.js`, `dirigent-analog`): Nachricht `{sr: {tab, disc, x | ramp}}` bzw. `{sr: null}`; `B` = Basis, `P` = Endwert; ein
  `{set}` auf einen Tabellen-Schlüssel schreibt die Basis. Reihenfolge in `onMsg` nach A.3 (mkSong → lf → morphStop → morph → sr → set).
  Ohne Tabelle und ohne Morph läuft **kein** zusätzlicher Code (ein Feld-Vergleich je Quantum). Stufige Werte über die vorhandene
  30-ms-Stimmen-Überblendung, höchstens 1 Wechsel je 100 ms, ab Begrenzer-Stufe 2 zurückgestellt (`srDefer`).
- **Ein Sendeweg** (A.3): `E.set(…, ex)` trägt `sr`/`morph`/`lf` in derselben Nachricht wie `set` (Voll-Abgleich), `E.n8(m)` sendet sie allein.
- **Haupt-Faden**: Hand-Modell `R.sr`, `srHand` (eine Geste = ein Undo `'sr'`), `srDriveTo`/`srDriveStop` (Fahrt-Kern), `srAt(t)`,
  `heardAt(i, path, t)` (A.11), Spur-Werte (`fx.*`, `gfx.*` mit G4-Vorrang) über `trackFx`, FM-Operatoren über den 30-Hz-Patch, Drums je Schlag
  (`srDrumP` in `drumHit`), nativer Weg: neue Stimmen spielen den wirksamen Klang, klingende folgen in 16-ms-Stufen (`liveUpdate` mit Werten).
- **Vormachen-Kern** (ohne Oberfläche, Frage 2): `srCapture`/`srCapEnd` – Arbeitskopie spielt, nur geänderte Schlüssel werden Ziel, Klang danach
  deep-equal, eine Nachricht `{set: Basis, sr: Tabelle}`, ein Undo; Undo-Einträge des Vormachens werden beim Merken/Abbrechen entfernt.
- **Undo** `'sr'` (`undoState`/`undoApply`, Verlauf-Art `sr`), Mod-Übersicht (K1): Zeilen „Super-Regler“ und „Klangzustand ◆“, ✕ mit Undo.

### 4. I1a Klangzustände / weicher Szenenwechsel (Klang-Teil; Oberfläche wartet auf Frage 3)
- `clip.st` mit `stNorm` in `normClip`/`cleanClip` (Kopieren, Duplizieren tragen es mit; neue Clips haben keins).
- Worklet `{morph: {t0, t1, curve: 's', to, ln, disc, at}}` im Reglerraum (S-Kurve), `{morphStop}`; KZ6 „wer anfasst, übernimmt“ (Regler-Geste
  beendet den Morph für diesen Schlüssel). KZ1-Zeiten: Hand-Wechsel vom Tipp bis zum Taktstrich (mindestens 1 Schlag), Song 1 Schlag vorher,
  „1 Takt“/„2 Takte“ ab Taktstrich, „Sprung“ 5 ms. Clip ohne Zustand fährt zurück zum Grundklang (KZ5).
- Voll-Abgleich während eines Zustands: `set` mit den Zustandswerten, `morph` mit der Restzeit (A2). Knopf-Werte (`wkFlush`) eines gehaltenen
  Zustands bleiben Basis.
- I1b: Spur-Werte (`st.fx`), Drum-Zustände (`st.slots`) und nativer Weg über dieselben Haupt-Faden-Stufen.

### 5. I1f NEIGEN-Logik (aus i3-br-U übernommen)
- Erlaubnis im `click`, Sensor-Prüfung, Winkel ohne Kardan-Sprung, Daumen-Kupplung; Block `sq-sr-src` (lädt bei Bedarf). Jetzt an `R.sr.x` und
  `srHand(x, 'neigen', phase)` angebunden. Kein `haptic()` aus Sensor- oder Zieh-Ereignissen.

### 6. I3 Mal-LFO
- **Form-Kern** (`src/form.js`, vor SQStore geladen): `FORM.norm`, `FORM.eval` (Kanten als Rampen), `FORM.lib` (Pumpen, Gate, Triller als Kopie),
  `FORM.tab`, `FORM.hash`. `normSynthP` behält `l1f`/`l2f`; Form 5 ohne Tabelle → 1, ohne TAKT → 1/1. `PD.l1shape` 0–5.
- **Worklet Fall 5** (`src/lfwk.js`): Tabelle `{lf: [a1, a2]}` vor `set`, Auswertung wortgleich zur Haupt-Faden-Regel, freie Phase am **Song-Schlag**
  (mkSong), Form 5 ohne Tabelle = Dreieck + `lfMiss`. Die Tabelle reist mit jedem Voll-Abgleich/neuer Engine, sobald der Klang eine Form hat.
- **FORMCLEAN** (I3b, Block `sq-form-src`): Aufräumen nach §5.2 (aus i3-br-U), dazu: ein Ein-Tick-Sprung ≥ 100 im Malpuffer (senkrechter
  Fingerweg) gilt als Kante.
- **I3c Form-Blatt + LFO-Seite ✎** und **I3d Bibliothek** aus i3-br-U übernommen und auf 4.30.0 gesetzt (Platzhalter entfernt, echte Tabelle an das
  Worklet, Einwisch-Vorschau über `wkLf`).

### 7. I4c Tipp-Summen-Kern
- `tapNotes(tr, taps, o)` DOM-frei im VS2-Block (`pyin` und `segment` Zeichen für Zeichen gleich): Tipps ordnen (Prellen < 30 ms, eine Stimme),
  Suchfenster, Kern-Median, Tipp ohne Ton (Höhe vom Ton davor), zwei Töne in einem Tipp, Stimmung/Einrasten wie `segment`, Stimme ohne Tipp gezählt.
- `vsAnalyse` hängt `A.secOfH` und `A.tips` (aus `TIP.ring`) an; `vsNotesOf` nimmt dann die Tipp-Noten (gleiche Form, je Analyse zwischengespeichert),
  ohne Tipps unverändert. Zählzeile im Ergebnis-Blatt („4 Noten · aus 4 Tipps · …“).
- `TIP.ring` füllt bis zur Tippfläche (I4a) nur die Test-API `SYNQUENZER.tip.feed`.

### 8. Test-API (nur Tests)
`SYNQUENZER.sr` (get, set, target, drop, clear, capture, keep, cancel, drive, stop, eff, path, desc, tab, msg, del, need, eng, probe, log, neigen),
`SYNQUENZER.st` (get, set, run, at), `SYNQUENZER.form` (wie i3-br-U, `info().lfMiss`), `SYNQUENZER.tip` (feed, clear, info, notes, line).
Worklet-Haken `{srProbe}`/`{moProbe}` (= `__srProbe`/`__morphProbe`) und `{n8q}` (Zustand des Kerns).

## Tests (alle mit Playwright + Chromium, Touch; Skripte in `tests/`)
| Skript | Inhalt | Ergebnis |
|---|---|---|
| `bau/tests/smoke.mjs` | Start ohne Fehler | grün |
| `bau/tests/orch-mk-check.mjs` | Version 4.30.0, Init-AM-Pegel, placePart, 12 MK-Tasten | grün |
| `bau/tests/v3-mk2-wellen.mjs` | MK2-12 | **OFFEN** wie schon bei 4.30.0: Bezugsdaten `bau/dwgs-trace` fehlen am Bau-Ort (Ausgabe „Bezug am Bau-Ort fehlt“, Ausgang 2) |
| `n8-core.mjs` | Regel 28, Kennlinien (10 001 Punkte, Abweichung 0), srNorm 1000×, Weg, Worklet-Endwert, Glättung, Einrasten, Undo, Speichern/Laden, Sperre, Vormachen-Kern, Szenen-Morph, Form-Tabelle, nativer Weg, Drums, eine Notenquelle, stufige Werte mit Hysterese | 44/44 grün |
| `n8-regel28.mjs` | 4.30.0 gegen N8I134: Engine-Nachrichten, Projekt-JSON, MIDI, MS-2000-Render, North-Render, Chor-Gruppe, Silben (G9), VV4, Video-Render, GarageBand-WAV, Konsolidieren | grün |
| `n8-layout.mjs` | 428×926 / 926×428 / 428×650: Start, Synth-Editor, Menü wie 4.30.0; keine waagrechte Scrollleiste | grün |
| `i3c-ui.mjs` | ✎, Form-Blatt, Strich/Abbruch/Tipp, Bibliothek, Undo, Maße in 3 Formaten | grün |
| `i3-korpus.mjs` | Aufräumen: Korpus, Rampen, Treppen, Übermalen, Zeit, Raster | **Korpus 56 % (Ziel ≥ 90 %)**, Rest siehe STATUS |
| `i4c-tapnotes.mjs` | I4-21 … I4-26, I4-32 in Node | grün |
| `i1f-math-node.mjs`, `i1f-neigen.mjs` | NEIGEN | 15/15, 33/33 |

Marken-Prüfung (A.14) über den Diff: 0 Treffer. „MS 2000“ in der App genau 1×. Zeile `  live: true,` genau 1×. Keine Datenbank-Zugriffe.

## Fragen an Xander (gebaute Vorgaben, D.2)
I1 F2 NEIGEN: Stellung bleibt · F4: ohne wartenden Wechsel keine Fahrt · F5: ein Super-Regler je Projekt · F6: kein MORPH-Schieber ·
I3 F1 keine Form auf Bedienplatten · F2 Kurve über die ganze Fahrt · F3 Bibliothek wie beschrieben · F4 Kopie · F5 „Meine Formen“ nicht gebaut ·
I4 F1 Zählzeile im Ergebnis-Blatt · F2 Tipp ohne Ton = Höhe des Tons davor · F3 Notenlänge = Fingerlänge.
Nicht gebaut, weil sie auf Antworten warten (A.9 c): Super-Regler-Feld (Frage 2), V6a-Bedienung und Regler-Marke (Frage 3), Fahrten im Song (Frage 4).
