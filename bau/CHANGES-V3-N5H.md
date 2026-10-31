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

## VC2a-fix

Version bleibt **4.25.0** (`APP_CODE` 4 025 000), Projektformat 5, `CLOUD.live: true` unverändert, kein Supabase-Aufruf
(am Server offen: `max_app ≥ 4025000`). Nur der Rekorder (Block VC2a) und vier Ein-Zeilen-Haken; nichts Sichtbares geändert.

### Was neu ist (Befunde der Abnahme, alle nachgestellt und behoben)
- **Eine Geste = ein Ereignis auch im normalen Tempo.** Nach einer Pause von ≥ 2 s lief der Abgleich (`histTimer`→`histSweep`)
  vor der Aufzeichnung der Geste: die Änderung landete als namenloses `proj`, das Gesten-Ereignis (↶, ↷, Einstellung, Hall,
  Kit, ＋ Spur, Spur entfernen, Klang zurücksetzen, Stimme-Take …) hatte einen leeren Patch. Jetzt zeichnet der Timer zuerst die
  wartenden Gesten auf (`histDrain`) und gleicht erst danach ab; der Abgleich wartet außerdem mindestens 250 ms (schreibt weiter
  höchstens alle 2 s).
- **`historyCheck()` erkennt wieder einen Weg am Rekorder vorbei** (Spec-Risiko, VL-R1). Der Abgleich merkt sich je Aufgabe, ob
  `markDirty` ohne Undo-Eintrag kam (rechtmäßiges `proj`, z. B. Tempo). Findet er eine Änderung ohne eine solche Geste (Daten
  direkt geändert, fehlende oder falsche `HIST.kind`), wird sie zwar weiter aufgezeichnet (der Verlauf bleibt vollständig), aber
  `historyCheck()` meldet `false` mit `{why:'Änderung am Rekorder vorbei', p:[…]}`. Jeder Aufruf der Test-API zählt dabei als
  eigener Abschnitt (Skripte rufen mehrere Gesten in einer Aufgabe).
- **MS-2000-Platte: Reglerkurve.** `knobStart`/`knobMove` melden wie `makeCtl` an den Rekorder (`histCurveStart`, `histCurve`):
  ein 2-s-Zug ergibt 1 Ereignis mit Kurve (15–17 Werte).
- **Automatische Tonart gehört zur Geste.** Was `applySceneKeys` (400 ms nach einer Noten-Geste, nach dem ORIGINAL oder sofort)
  an `key` der Clips der Szene und an eigenen Clips ändert, kommt als Folge-Änderung in das Ereignis der Geste (`histFollow`,
  höchstens 5 s danach; sonst ein eigenes `proj`). `historyState(k)` am Clip-Ereignis = Projekt nach der Geste.
- **REC fester Länge:** das Ereignis „Aufnahme“ (Undo-Eintrag beim REC-Start) wird erst nach dem Ende der Aufnahme und ihres
  Nachlaufs aufgezeichnet: `d` = der Clip mit den gespielten Noten und `q`; kein `proj` danach. Wird der leere Clip wieder
  entfernt („Nichts aufgenommen“), entsteht kein Ereignis. Sicherung: höchstens 120 s Wartezeit.
- **SINGEN an:** Der Rekorder schreibt auch bei offenem Mikrofon (Phase `live`) gebündelt alle 2 s; er wartet nur während
  Mikrofon-Start, Einmessen, Mikrofon-Ende und während einer Aufnahme. Ein Neuladen mit SINGEN an verliert keinen Verlauf mehr.
- Mehrere ↶ oder ↷ in einer Aufgabe (Skript): jedes Ereignis trägt seinen eigenen Patch (die wartenden Gesten werden vor dem
  nächsten ↶/↷ aufgezeichnet; bei Fingertipps ist die Warteschlange dann schon leer, kostet also nichts).

### Abnahme
| ID | Ergebnis | Messung/Skript |
|---|---|---|
| Befund 1 (VC2a-01 im Benutzer-Tempo) | ✓ | `PAUSE=2100` (2 Läufe) und `PAUSE=2500 node n5-h-ab-01paced.mjs`: **115 Daten-Ereignisse**, 0 `proj`, `historyCheck` true (vorher 155/160, 40/45 `proj`). Die 6 Ereignisse mit leerem Patch sind Gesten ohne Datenänderung (`clipDel1` setzt einen leeren Slot leer, Undo-Eintrag ohne Änderung) – bei Pause 0 genauso (`n5-h-fx-noop.mjs`). `n5-h-ab-race.mjs`: 7/7 Gesten je 1 Ereignis mit Patch; `n5-h-ab-race2.mjs` (↶ per Finger): 1 Ereignis „Rückgängig: Teil … gespeichert“ mit Patch. |
| Befund 2 (historyCheck kann nicht scheitern) | ✓ | `n5-h-ab-02gate.mjs` (2 Läufe): (a) `S.bpm = 97` ohne Geste → `{ok:false, why:'Änderung am Rekorder vorbei', p:['bpm','tracks/1']}`; (b) `HIST.kinds.set('sound', () => [])` + `setSound` → false mit `p:['tracks/2']`. Rechtmäßige Wege bleiben true (`n5-h-01.mjs`, Tempo mit SINGEN, Abläufe unten). |
| Befund 3 (VC2a-08 MS 2000) | ✓ | `n5-h-ab-08mk.mjs`: 7/7 Züge an `f.cut`, `f.res`, `mix.o2`, `a.pan` → je 1 Ereignis `sound` mit `c` 15–17 Werten. |
| Befund 4 (Tonart = 2. Ereignis) | ✓ | `n5-h-ab-roll2.mjs` (6 Fingertipps im Piano-Roll): 0 von 6 Gesten mit > 1 Daten-Ereignis, die Tonart steht im Ereignis „Note“. `n5-h-ab-key.mjs`: 6/6 `setClip` je 1 Ereignis. `n5-h-fx-keystate.mjs` (2 Läufe, je 3 Tonart-Wechsel): 1 Ereignis, `historyState(k)` = Projekt nach der Geste. `n5-h-mu2-switch2.mjs`: Clip „Clip“ enthält `key/root 10`, kein `proj`. |
| Befund 5 (Pause ≥ 2 s, Finger) | ✓ | `n5-h-mu2-race.mjs 3000`: 6/6 Gesten OK (der 7. Schritt „Reglerzug KLANG“ findet im Skript den Regler nicht – kein Gesten-Schritt, Undo 4→4); `n5-h-mu2-race2.mjs 3000` und `4000`: 17/17 OK. `n5-h-mu2-flow.mjs 390x844` und `844x390`: alle OK, 6× ↶ und 6× ↷ je eigenes Ereignis mit Patch (Ausnahme „Song gesetzt“ d0 – schon die Geste selbst ändert nichts). |
| Befund 6 (SINGEN, Neuladen) | ✓ | `n5-h-mu2-micreload.mjs mic 20000`: 12 Ereignisse vor und **12 nach** dem Neuladen (vorher 0). `n5-h-mu2-micflush.mjs mic`: IndexedDB `ne` 14 nach 18 s (vorher 0), die 6 Tempo-Wechsel als `proj`. |
| Befund 7 (REC: leerer Clip + `proj`) | ✓ | `n5-h-mu2-fangbase.mjs`: 1 Ereignis `clip` „Aufnahme“ mit Noten 60/64/67 und `q`, kein `proj` mit den Noten (das `proj settings` davor ist `setRecOptions`, eine Einstellung ohne Undo). `n5-h-mu2-flow.mjs` (beide Lagen): REC → 1 Ereignis „Aufnahme“. |
| VC2a-01/02/09 | ✓ | `n5-h-01.mjs` ALLE BESTANDEN (115 Daten-Ereignisse, M-REKON nach Skript, nach Auswahlwechsel, nach Neuladen, nach Format-3-Import, Gegenprobe false, VL-R1 14 = 14). |
| VC2a-03/04 | ✓ | `n5-h-03.mjs` ALLE BESTANDEN. |
| VC2a-05 | ✓ (A/B unter Last) | Rechner während der Messung voll belegt (Load 12–18 auf 4 Kernen durch die Geschwister-Zweige; dabei fiel auch 4.23.0 auf 26–51 fps), daher A/B gegen den Stand vor dem Fix im selben Lauf (`n5-h-fx-05ab.mjs`, je 3 Läufe Gesten-Szenario): Aufzeichnungs-Aufgabe Median vorher 1,0 / 1,6 / 3,0 ms, nachher 1,1 / 0,8 / 3,1 ms; längste vorher 19,8–29,4 ms, nachher 7,8–12,6 ms; Rekorder-Anteil in longtasks 0,0–0,2 ms. `n5-h-05.mjs` zeigt unter dieser Last FAIL auch für die Grenzwerte, die 4.23.0 dort ebenso verfehlt; **auf ruhigem Rechner wiederholen** (`node n5-h-05.mjs`). |
| VC2a-06/07 | ✓ | `n5-h-06.mjs` (12 PASS), `n5-h-07.mjs` (5 PASS) ALLE BESTANDEN. |
| VC2a-08 | ✓ | `n5-h-08.mjs` ALLE BESTANDEN (2-s-Zug 17 Werte in 390×844 und 844×390, 6-s-Zug 50 Werte); ein paralleler Lauf unter Last hatte zu wenige Zeigerbewegungen (13 in 2 s) und wurde allein wiederholt. |
| VC2a-10 | ✓ | Smoke ohne Fehler (`dirigent-test/fx/smoke.png`); `n5-h-10.mjs`, `n5-h-menu.mjs` (6 Größen) ALLE BESTANDEN; `n5-h-views.mjs` 0 Daten-Ereignisse, check true. Regression `v3-qa-gmk7-undo` 10/15 (wie vorher und wie 4.23.0); `v3-qa-grp-undo` 7/11 – die zwei zusätzlichen Fehlschläge (8 Takte Wiedergabe nach Neuladen/Datei gleich) zeigen unter der gleichen Last auch der Stand vor dem Fix (`VC2a.html`: 7/11, dieselben Abweichungen im `noteLog`), es sind Aussetzer durch die Rechnerlast. |

Ausgaben der Läufe: `dirigent-test/fx/*.out`. Neue Proben: `n5-h-fx-01dbg.mjs`, `n5-h-fx-stray.mjs`, `n5-h-fx-cnt.mjs`,
`n5-h-fx-noop.mjs`, `n5-h-fx-keystate.mjs`, `n5-h-fx-05ab.mjs`.

### Abweichungen
- **Budget:** Der Fix kostet +3,9 KB; VC2a liegt damit bei +34 325 Bytes gegenüber 4.23.0 (Budget +30 KB).
- **Erkennung „am Rekorder vorbei“ ist eine Regel je Aufgabe:** Ändert eine einzige Aufgabe Daten mit Undo-Eintrag *und* ohne
  (außerhalb der Test-API, z. B. ein künftiges Paket, das in einem Handler beides tut), wird der Teil ohne Undo als Umweg gemeldet
  – das ist gewollt (VL-R1: solche Gesten melden ihren Teilbaum an). Umgekehrt bleibt ein Umweg unentdeckt, wenn im selben
  2-s-Fenster eine rechtmäßige Änderung ohne Undo (Tempo …) lag. Der Befund gilt bis zum nächsten Öffnen eines Projekts.
- Gehaltene Aufnahme-Ereignisse bekommen als `t` den Zeitpunkt ihrer Aufzeichnung (Ende der Aufnahme), damit die Ereignisse
  zeitlich geordnet bleiben; eine Reglerkurve fällt bei ihnen weg.

### Fragen an Xander
- keine

### iPhone (Xander)
1. 🎤 SINGEN an, ein paar Noten setzen, 5 s warten, Seite neu laden: Menü → Projekt → Verlauf zeigt eine Größe über 4 KB.
2. MS 2000-Platte: einen Regler 2 s drehen – nichts ruckelt; mit ↶ ↷ normal.
3. Nach einer Pause ↶ tippen – alles wie gewohnt (die Aufzeichnung ist unsichtbar).

### Für das Zusammenführen (Funktionen/Blöcke)
- **Block VC2a:** `HIST` (neue Felder `lastData held fp fpQ tkD tkP tkQ legit stray`), `histPush`, `histDirty`, neu `histTk`,
  `histTkEnd`, `histApiWrap`, `histHold`, `histFollow`, `histFollowNow`, `histProj`; geändert `histDrain(force)`, `histBusy`
  (SINGEN nur außerhalb `live`), `histCapture` (`lastData`, leerer entfernter Eintrag), `histSweep` (Umweg-Erkennung),
  `histSoon` (≥ 250 ms), `histTimer` (erst Gesten, nie während gehalten), `histDrainNow` (erzwingt), `histOpen` (Rücksetzen),
  `histVerify` (meldet Umwege).
- **Ein-Zeilen-Haken:** `knobStart` (`histCurveStart()`), `knobMove` (`histCurve(get(d))` nach `setv`), `applySceneKeys`
  (`histFollow(…)` in `if (changed)`), `undo`/`redo` (erste Zeile `if (HIST && HIST.q.length) histDrain();`), vor
  `window.SYNQUENZER = SYNQUENZER` die Zeile `histApiWrap(SYNQUENZER);`.
- **VL-R1 für spätere Pakete:** `historyCheck()` kann jetzt wirklich false werden – eine neue Datenänderung ohne Undo braucht
  `markDirty()` (dann `proj`) oder eine eigene `HIST.kind`; eine neue Undo-Art mit falschem Teilbaum fällt auf.
- Schnappschuss: `synq-snapshots/VC2a-fix.html`.
