# SYNQUENZER v3 – Nachtrag 5, Zweig H (Welle 1)

Zweig `n5-br-H` ab 4.23.0 (`vs-base-B.html`). Version **4.25.0** (`APP_CODE` 4 025 000). Projektformat bleibt **5** (nur das
optionale Hüllen-Feld `history` der Projektdatei kommt dazu). `CLOUD.live: true` unverändert. Kein Supabase-Aufruf.
**Am Server offen: `max_app ≥ 4025000`** (`update private.settings set max_app = greatest(max_app, 4025000);`, Xander selbst).

## VC2a — Verlauf-Rekorder (Spec: Nachtrag 1, Abschnitt „VC2a — Verlauf-Rekorder“, unverändert; Nachtrag 5 Welle 1)

### Was neu ist
- **Die App merkt sich jeden Schritt eines Projekts** (Ereignisse statt Video), damit später ein Zeitraffer (VC2b/VV4) zeigen kann,
  wie Sound und Song entstanden sind. Aufgezeichnet wird ab diesem Paket.
- **Abgriff an `undoPush`, `undo`, `redo`** (+ der Zusammenfass-Weg `mergeKey` in `pushUndo`/`pushSongUndo`): eine Geste = ein
  Ereignis `{t, u, z, d, c?, l}` – `t` ms seit Sitzungsbeginn, `u` Undo-Art, `z` Ziel (`{t, s, id, k, p:[Teilbaum-Pfade]}`),
  `d` JSON-Patch (RFC 6902: add/remove/replace) des Teilbaums **nach** der Geste, `c` Reglerkurve, `l` Beschriftung. Undo/Redo werden
  als angewendetes Ergebnis aufgezeichnet (`l` = „Rückgängig: …“ / „Wiederholt: …“). Ein Schritt, der den vorigen ersetzt
  (`UNDO.pop` → Gruppe mit ihm, z. B. „Audio folgt“, Take + Spur), bleibt ein Ereignis.
- **Reglerkurve:** jeder Regler/Fader (`makeCtl`) meldet beim Ziehen seinen Wert; 10 Hz, höchstens 50 Werte (längere Züge
  gleichmäßig auf 50 ausgedünnt). Die Kurve hängt nur am Schritt genau dieses Loslassens.
- **Kontext-Ereignisse ohne Daten (`u:'ctx'`):** Szenen-Start, Clip-Start (Tipp/`launchClip`), Teil-Start, ▶, ■, Hand-Träger
  (`T.onCommit`, nicht wenn eine Akkord-Zeile oder der Song den Träger setzt).
- **Keyframe** = ganzes Projekt (`serializeProject`) mit `format` 5 und `appVersion`: beim Öffnen (Start, Laden, Projekte),
  nach Import, Migration (Datei-Format < 5) und Neu, nach je 200 Ereignissen, nach „Verlauf an“ und „Verlauf löschen“.
- **Ablage:** eigene IndexedDB `synq-hist` (Stores `c` = Stücke, `m` = Übersicht je Projekt), Schlüssel `hist2:<projektId>:<n>`,
  Stücke von 30 Minuten, gzip über `CompressionStream` (sonst Text), gebündelt höchstens alle 2 s über `setTimeout`
  (kein `requestIdleCallback`), außerdem beim Verlassen der Seite. **Grenze 20 MB je Projekt:** erst werden die Reglerkurven
  halbiert, dann Ereignisse älterer Stücke verworfen (nur wenn danach noch ein Keyframe kommt); Keyframes bleiben.
- **Regel VL-R1:** `HIST.kind(name, getSubtree)` – angemeldet sind alle 14 Undo-Arten der App: `clip sound fx track set part kit
  song own mkin mkslot takes tflag group`. Datenändernde Gesten **ohne** Undo-Eintrag (Tempo, Name, Harmonie-Einstellungen, Mute …)
  findet ein **Abgleich** nach `markDirty` (höchstens alle 2 s, nie während ein Finger liegt oder aufgenommen wird) als Ereignis
  `u:'proj'` (angemeldet als Art `proj`, Teilbaum = Projekt). Ansichtsfelder im Projekt stehen in **`HIST.volatile`**:
  `['ui', 'settings.coach']`.
- **Menü → Projekt → Verlauf:** `[An | Aus]` (Standard An, Gerätewert `histOn`) mit „Größe … KB/MB“; `Projektdatei [ohne Verlauf |
  mit Verlauf]` (Standard ohne, gilt für die Sitzung); `[Verlauf dieses Projekts löschen]` (zweistufig „Wirklich löschen?“ wie die
  anderen Lösch-Tasten des Menüs). Ohne IndexedDB: „Verlauf aus (Speicher nicht verfügbar)“.
- **Projektdatei:** mit [mit Verlauf] bekommt die Hülle das Feld `history` (`{v:1, chunks:[{s0,w0,w1,ne,thin,ev,kf:[…]}]}`,
  Inhalte gzip+Base64 bzw. Text). Prüfsumme `sum` und `format` bleiben unverändert (sie gelten nur dem Projekt). Der Import
  (Datei öffnen, ZIP, `importJSON`) übernimmt einen mitgelieferten Verlauf und setzt danach den Import-Keyframe.
- **Test-API (Nachtrag 1 Teil D):** `history()` → `{on, events, keyframes, bytes, avail, why}`, `historyCheck(o?)` (M-REKON ohne
  `HIST.volatile`; `{full:true}` = Gegenprobe über das volle `serializeProject`, `{detail:true}` = Befund), `historyVolatile()`,
  `historyState(k)`; `runtime().history = {on, events}`.
- Leistung: die Aufzeichnung läuft in einer eigenen kleinen Aufgabe direkt nach der Geste (`setTimeout 0`), verlängert also nie die
  Aufgabe der Geste; Klang und Wiedergabe werden nicht berührt.

### Abnahme
| ID | Ergebnis | Messung/Skript |
|---|---|---|
| VC2a-01 | ✓ | 100 Gesten über alle 14 Undo-Arten (direkt: track tflag group takes own mkin mkslot clip sound fx set part kit song), 10× Undo, 5× Redo, 52 Auswahlwechsel `selT`/`selS`: **genau 115 Daten-Ereignisse**, alle mit `u` und `z`, 0 `proj`-Ereignisse durch Auswahl. `dirigent-test/n5-h-01.mjs` |
| VC2a-02 | ✓ | `historyCheck() === true` nach dem Skript, direkt nach Spur-/Szenenwechsel, nach Neuladen (2 Keyframes), nach Import eines Format-3-Projekts (Keyframe `mig`, alle Keyframes `format` 5 / `appVersion` 4.25.0) und nach einer Geste danach. Gegenprobe voller Vergleich: false (aufgezeichnetes `ui.selT` 3, jetzt 5). `n5-h-01.mjs` |
| VC2a-03 | ✓ | 451 Ereignisse → 3 Keyframes (`open`, 2× nach 200), jeder mit `format` 5, `appVersion` 4.25.0 und ganzem Projekt; M-REKON inkl. Kette Keyframe→Ereignisse→Keyframe true. `n5-h-03.mjs` |
| VC2a-04 | ✓ | 1000 typische Ereignisse (40 % Reglerzug mit 8–19 Kurvenwerten, 20 % Noten, 10 % Drum-Schritt, 15 % Kontext, Effekt, Song-Akkord, Teil, Undo/Redo): **19,7 KB gzip** (roh 165 KB), mit den 4 Keyframes 37,3 KB. `n5-h-03.mjs` |
| VC2a-05 | ✓ | Je Geste (Hauptfaden, mit Wiedergabe und offenem Editor): Median 1,2–1,6 ms je Aufzeichnungs-Aufgabe (bis zu 3 Gesten), einzelne Geste 0,2–0,5 ms (`n5-h-prof.mjs`), längster Schritt 16 ms. PE1 (10 s Demo, Editor offen, je 3 Läufe): neu 59,9 fps, tick-p95 0,8 ms, 0/0/0 longtasks; 4.23.0 59,9 fps, 1,0 ms, 1/0/0. Keine longtask > 50 ms enthält einen Rekorder-Schritt. `n5-h-05.mjs` (`n5-h-05.out`) |
| VC2a-06 | ✓ | IndexedDB fehlt / Zugriff wirft / `open` wirft / `put` wirft: Clips, Undo/Redo, Wiedergabe normal, Menü „Verlauf aus (Speicher nicht verfügbar)“, `history().on` false, keine Fehlermeldung. `n5-h-06.mjs` |
| VC2a-07 | ✓ | Ohne Verlauf: Hülle bis auf `appVersion` gleich 4.23.0, `format` 5, `sum` gleich (1e0053fb), kein Feld `history` (auch über „Als Datei sichern“). Mit Verlauf (Menü-Tipp + Download, 25 KB): `sum` gleich; Import in frischem Browser → `historyCheck` true, 42 Ereignisse übernommen, 3 Keyframes. `n5-h-07.mjs` |
| VC2a-08 | ✓ | 2-s-Zug am Regler (60-Hz-Zeigerbewegung) in 390×844 und 844×390: genau 1 Ereignis `sound` mit 18 Kurvenwerten; 6-s-Zug → 1 Ereignis, Kurve 50 Werte. `n5-h-08.mjs` |
| VC2a-09 | ✓ | Undo-Arten aus dem Quelltext (`undoState`, `undoPush({kind…})`, `pushUndo`) = angemeldete Arten (14), keine unbekannte Art gesehen. `n5-h-01.mjs` |
| VC2a-10 | ✓ | Smoke ohne Fehler; Menü in 390×844, 375×667, 320×568, 844×390, 667×375, 926×428: 3 Zeilen, nichts abgeschnitten, Tasten ≥ 44 × 44, kein Layout-Sprung, An/Aus und Löschen per Fingertipp (`n5-h-menu.mjs`, Bilder `n5-h-menu-*.png`); Ansichten/Transport erzeugen keine Daten-Ereignisse (`n5-h-views.mjs`); 20-MB-Regel mit Test-Grenze: Kurven 30 → 15, dann Ereignisse verworfen, alle 7 Keyframes bleiben, M-REKON true; Kontext Szene/Clip/Hand/▶/■ (`n5-h-10.mjs`); Regression `v3-qa-grp-undo` und `v3-qa-gmk7-undo` mit 4.25.0 und 4.23.0 dasselbe Ergebnis (9/11 bzw. 10/15, die Fehlschläge gleich bei 4.23.0); Dateigröße +30 404 Bytes (≈ 29,7 KiB, Budget 30 KB). |

### Abweichungen
- **Test-API `history()`:** Der Name gehörte bisher „Ältere Versionen“ (`projHistory`). Nach Nachtrag 1 Teil D ist `history()` jetzt
  der Rekorder-Stand; „Ältere Versionen“ heißt in der Test-API `projHistory()`. Die alte Probe `v3-mk0rg2-store.mjs` ruft noch
  `history()` und muss auf `projHistory()` umgestellt werden (Probe veraltet, App richtig; nicht still angepasst).
- **`proj` als Art für Daten-Änderungen ohne Undo-Eintrag:** Statt jede solche Geste einzeln zu suchen und anzumelden, fängt der
  Abgleich sie (Spec-Liste nennt `proj`). Ereignis `u:'proj'`, `z.p` = geänderte Teile (z. B. `bpm`, `settings`, `tracks/3`).
  Spätere Pakete können eigene Arten mit `HIST.kind` dazunehmen.
- **`HIST.volatile` startet mit `['ui', 'settings.coach']`**: `settings.coach` ist „Hinweis schon gezeigt“ (wird beim ersten
  Reglerzug ins Projekt geschrieben) – ein Ansichtsfeld wie `ui`; sonst wäre ein Reglerzug zwei Ereignisse (VC2a-08).
- **Kontext:** auch der Teil-Start (`launchPart`) wird als Kontext aufgezeichnet (Teile ersetzen beim Spielen die Szenen).
- **`mkslot`** (Programmspeicher) liegt in der Bibliothek des Geräts, nicht im Projekt: das Ereignis hat einen leeren Patch.
- Die Aufzeichnung läuft nicht in einer Microtask, sondern in einer eigenen Aufgabe direkt danach (`setTimeout 0`), damit der Rekorder
  nie eine Geste über 50 ms verlängert.
- Reglerzüge über 5 s: die 50 Werte verteilen sich gleichmäßig über den ganzen Zug (die Dauer steht nicht im Ereignis).

### Fragen an Xander
1. Soll „Verlauf an/aus“ für **alle** Projekte gelten (so gebaut, Gerätewert) oder je Projekt?
2. Soll die Wahl „Projektdatei [mit Verlauf]“ gemerkt werden (gebaut: gilt bis zum Neuladen, Standard ohne)?
3. Wenn ein Projekt unter „Projekte“ gelöscht wird: soll sein Verlauf mit gelöscht werden? (gebaut: bleibt, bis „Verlauf dieses
   Projekts löschen“ im offenen Projekt).

### iPhone (Xander)
1. Menü → Projekt: Zeilen „Verlauf [An | Aus] Größe …“, „Projektdatei [ohne Verlauf | mit Verlauf]“, „Verlauf dieses Projekts
   löschen“ sind zu sehen und gut zu treffen (hochkant und quer).
2. Ein paar Regler drehen, Noten setzen, ↶ ↷ – nichts ruckelt oder knackt, die Größe wächst nach ein paar Sekunden (Menü neu öffnen).
3. „mit Verlauf“ wählen → „Als Datei sichern“ → Datei wieder öffnen: Projekt kommt wie vorher.
4. In der Claude-App: falls dort kein Speicher erlaubt ist, steht „Verlauf aus (Speicher nicht verfügbar)“, sonst läuft alles wie immer.

### Für das Zusammenführen (Funktionen/Blöcke)
- **Neuer Block** direkt nach `redo()`: `/* ---------- VC2a Verlauf-Rekorder … */` mit `var HIST` und allen `hist…`-Funktionen
  (`histPush histMerge histDirty histDrain histCapture histCtx histHand histCurveStart histCurve histSweep histKeyframe histFlush
  histWrite histCompact histInit histOpen histClose histBoot histFileIn histFileAdd histExport histAdopt histVerify historyCheck
  historyState histInfo histSetOn histClear histMenu` …).
- **Ein-Zeilen-Haken:** `undoPush` (`histPush(e)`), `pushUndo` und `pushSongUndo` (Merge-Zweig `histMerge(top)`), `undo`/`redo`
  (`histPush(u|r, 'undo'|'redo')`), `markDirty` (`histDirty()`), `applyProject` (Anfang `histClose()`, Ende `histOpen(p, !!mig)`),
  `boot` (`histBoot()`), `newProject` (`HIST.mark.set(p, 'new')`), `launchScene`, `launchClip`, `slotTap`, `launchPart`,
  `startTransport`, `stop` (`histCtx(…)`), nach `T.onCommit = …` ein Wickler mit `histHand`, `makeCtl` (pointerdown
  `histCurveStart()`, pointermove `histCurve(get())`), `openMenu` (`histMenu(s1, row)`), `saveFile` (`await histFileAdd(…)`),
  `onFilePicked` und `importJSON` (`histFileIn`), `runtimeInfo` (`history`), Test-API (`history`, `historyCheck`, `historyVolatile`,
  `historyState`; alte Zeile `history: () => projHistory()` → `projHistory`), CSS eine Zeile nach `.mval{…}`
  (`#menu .mhist .seg button{min-height:44px;min-width:44px}`), `VERSION`.
- **VL-R1 für spätere Pakete (auch die Geschwister-Zweige V und G):** jede neue Undo-Art → `HIST.kind('art', e => [[pfad…]])`;
  jedes neue Ansichts-/Laufzeitfeld im Projekt → `HIST.volatile.push('feld')` und hier eintragen; nach dem eigenen Test-Skript
  `SYNQUENZER.historyCheck()` === true. Beim Zusammenführen mit VV2 (`song.video`, Undo wie Song) und G1/G2 prüfen, ob neue
  Undo-Arten dazukamen (`n5-h-01.mjs` Punkt VC2a-09 meldet sie).
- Proben: `dirigent-test/n5-h-01.mjs`, `-03`, `-05`, `-06`, `-07`, `-08`, `-10`, `-menu`, `-views`, Hilfen `n5-h-lib.mjs`.
- Schnappschuss: `synq-snapshots/VC2a.html`.
