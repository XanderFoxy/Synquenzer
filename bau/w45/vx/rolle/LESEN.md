# VX1 Gesang-Notenrolle – Schritt 1: Lesen + Plan

Arbeitskopie: index.html (= Basis 4.54.1, 97562 Zeilen, unverändert). Zeilennummern = Basis.

## 0. Wichtiger Befund: Präfix „vx1“ ist schon belegt

Es gibt bereits ein älteres Paket VX1 (Lead stumm, Natürlich↔Hart, Marken-Editor-Auswahl/Schnitt):
`/* VX1-CSS-BEGIN */` 2699–2715, `/* VX1-BEGIN */` 68928–68971 (im G2-Kern), Haupt-Block `/* VX1-BEGIN */` 72591–73087
mit `VX1`, `vx1ChorOn`, `vx1T`, `vx1Snap`, `vx1Down/Move/End`, `vx1Paint`, `vx1PlaySel` (72890), `vx1Cut` (72981), `vx1WpUndone` …
→ Neue Namen bekommen das Präfix **`vx1r` / `VX1R`** (r = Rolle), damit topdefs „doppelt 0“ bleibt. Block-Rahmen wie verlangt
`/* VX1-BEGIN (Paket VX1 Gesang-Notenrolle) … */ … /* VX1-END */` direkt nach `/* KF1-END */` (Zeile 96377), Einhänge-Zeilen mit
Kommentar „VX1R“ (enthält „VX1“, aber unterscheidbar von den alten „VX1-C/-W/-P“-Zeilen). CSS als `/* VX1R-CSS-BEGIN … END */` hinter 2715.

## 1. Gelesene Stellen (Funktion → Zeile)

**Takes / STIMME (VS3)** – Kopf 58789–58805 (Datenmodell + innere API)
- `S.takes[id] = {sr, len, chunks, route, latMs, created, src, of?, marks?, warp?, lyrics?, ly?, pitch?, cl?, follow?}`
- `clip.audio = {take, in, out (s im Take), at (Schlag im Clip), gain, fadeIn, fadeOut, alt[]}`; STIMME-Clip = `{len, key, notes: [], audio}`;
  Song: `S.song.vox = [{id:'V1', bar, len, …audio}]`
- `tkExt()` 58806 (Haken take/audio/seg/proc/place), `tkNormTake` 58808, `tkNormAudio` 58834, `stimmeT` 58869, `tkBuffer` 58887,
  `tkPlayBuf` 58942, `tkHeard` 58950, `tkPeaks` 58951, `tkRef(r)` 59622 (r = {t,s} | {vox}), `tkSegs` 59626, `tkVoxAt` 59618,
  `tkSheet` 59657 (Tipp-Handler 59666–59688: `wp` → wpOpen 59678, `g2` → g2Open), `tkSheetPaint` 59694 (Knopf „✎ Marken & Timing …“ 59711,
  „Tonhöhe korrigieren“/„Chor“/„Effekte …“ 59714), Test-API `tkInject` 60359 (Take aus PCM in Szene s – für Tests).
- Abspielen: `tkStartSrc` 59251, `tkPlace` 59305 (place-Haken), `vpDefer` 59190 / `vpReady` (Pegel-Messung vor Planung).

**Tonhöhen-Analyse (VS2 / G2)**
- VS2-DSP-Kern `vsDspMake` 57740 (Worker + Hauptfaden). G2 nutzt ihn: `g2PitchMake` 68847 (`P.analyse`, `P.render` formanterhaltend),
  `g2Worker` 69151, `g2Run` 69164 (op 'an' → `{notes:[{t0,t1,m}], f0[], hop, n}`), `g2Call` 69179.
- `g2Analyse(id)` 69218 → `G2.an.get(id) = {key, notes, f0: Float32Array, hop (s), n}` (einmal je Take+Quelle, Worker, gecacht).
- Stimmlos: `g10gUnvoiced(id, A)` 72479 (kein f0 + Energie > Schwelle → Läufe [t0,t1]), `g10gHatch` 72492 (graue Schraffur).

**Tuning (G2/G6/G10g)**
- `m.pitch = {mode:'soft'|'hard', str, q, key, notes:[{t0,t1,m,to?,s?,e?,sh?,nq?}], v:2, nat}`; Ziel `g2Target` 69129 (= … + n.sh).
- `g2Plan` 69130, `g2Proc` 69137 (Kette: `tkExt().proc` = [wpProc, g2Proc, …SÄUBERN…] – Zeile 69146: Zeitkarte über Tonhöhe).
- Ändern: `g2Edit(id,label,fn,r)` 69247 (legt pitch aus Analyse an, `g2NormPitch`, ein Undo 'takes', `g2After`), `g2NoteShift` 69275,
  `g2Split` 69276, `g2Join` 69286, `g2Undone` 69290. G2-Editor `g2Open` 69307 / `g2Paint` 69380 / `g2Gest` 69454 (Vorbild für
  Wellenform, f0-Kurve, Schraffur, Silben `lyG2Syl`). G6-Chor: `g6NoteShift`, Stimmen `x.a.chor.voices`.

**Zeitkarte (VS5 / wpSwitch / vpDefer)**
- `WP` 61677, `WP_GRIDS` 61679, `wpNormMarks` 61682 (Marke `{t, conf, word?, user?, src?}`), `wpNormWarp` 61696
  (`m.warp = {mode:'slice'|'stretch', grid, res, strength, swing, bpm, t0, map:{v,src[],dst[]}, wo?, qr?}`), Normalisier-Haken 61706.
- `wpProc/wpPlay` 61714/61727 (Render-Cache je Karte+Quelle), `wpRun` 61754 (Worker-Ops det/stretch/slice), `wpWorker` 61759
  (Quelle = toString von vsMarksMake + vsStretchMake + wpRun + g9Make + g9Run), `wpCall` 61772 (Rückfall Hauptfaden), `wpRender` 61792
  (Modus-Weiche 61799–61814), `wpSwitch` 61886 (Fassungswechsel beim Abspielen mit Kurven-Überblendung), `wpReady` 61930,
  `wpDetect` 61935, `wpMarks` 61958, `wpT0(id,a)` 61968 (Take-Sekunde auf Schlag 0), `wpQuant` 61980 (quantizeMarks → g10eFine →
  makeWarp), `wpAfter` 61997, `wpEdit` 62003 (ein Undo 'takes' + Requant), `wpMarkAdd/Move/Del` 62019–62034, `wpSetQ` 62035,
  `wpSetMode` 62048, `wpLyr` 62071, `wpUndone` 62073 (↶↷ 'takes' → Editoren folgen), `wpOpen` 62122 (Marken-Editor).
- Kern `vsMarksMake` 61138: `detectMarks` 61194, `quantizeMarks` 61371, `makeWarp` 61402, `warpTime` 61415, `sliceCuts` 61424 (Schnitt
  3 ms vor der Marke am Nulldurchgang), `renderSlices` 61441 (nach links: 5-ms-Überblendung; nach rechts: Lücke mit Schleife gefüllt),
  `vsStretchMake` 61503 (WSOLA, erste 20 ms je Marke bitgleich, 0,5–2,0).
- G10e-Feinregeln `g10eFine` 62987 (Q-Bereich, nur Wortanfänge, Tonwechsel-Marken folgen).

**Spracherkennung / Silben (G9)**
- Take: `m.ly = {s (gepackte Silben an Marken), lang, src}` oder alt `m.lyrics` (VS5b). Je Marke: `g9LabelsOf(id, mk).labels[k]` 5762,
  sonst `wpLyr(id).labels[k]` 62071. `silben()` 5465 (Wort-Zeiten → Silben), `g9Ctx` 5588, `g9MarkHook` (Silben folgen Marken).
- Erkennen: `g9RecSheet(anchor)` 6303 (braucht WP.ed im Text-Modus, `g9On` 5790), `g9AutoQueue(id)` 6488, `G9.rec` (Andock-Stelle).

**VOX2 / alter VX1-W (Markieren/Schneiden)** – VOX2 93347–93764 (Kopf erklärt alle Einhänge-Zeilen; Griffe im ROLLE-Lineal
`vx2Grips`/`vx2GripAt`), alter VX1-W im Marken-Editor: `vx1Down/Move/End` 72765–72804, `vx1PlaySel` 72890, `vx1Cut` 72981.

**Noten-Editor der Instrumente (PianoRoll)** – Modul 20834–22255, `create(root, model, opts)` 20909
- Aufbau 20914–20921: Kopfleiste `.pr-bar`, `.pr-corner`, Lineal `cR`, Tastatur `cK`, Haupt `cM`, Anschlag `cV`, Aktionsleiste `.pra`.
- Werkzeuge 20925–20961 (✎ ⬚ ⇕ ⌫ Pinsel, Raster 20945, ♪, Nur Leitertöne, Schritt, ⤢, extraTools, ↶ ↷); Aktionen 20965–… (Teilen 20982,
  Verbinden 20983, ▲▼ Stufe, ±12, Spiegeln …, Dupl.).
- `clip()/L()/tkB/isBarL/scaleOf` 21149–21159 (opts.tk = eigene Takt-Abbildung, wie Song-Melodie), `hitNote` 21191 (Zone 'end' = Länge),
  `draw()` 21218 (Zeilen/Raster 21222–21238, Noten 21243–21256 mit `opts.noteDeco(x, nt, r)` 21255, `opts.syl` 21260, Tastatur 21268–21282,
  Lineal 21284–…), Gesten `promote` 21593 (Länge-Zone 21605, Verschieben 21609 mit Achsen-Sperre), `drag` 21626, Fall move 21633 (Verschieben-Raster
  **relativ**: `q = round(dB/g)*g` 21652), Pinch 21726, Lineal-Scroller (Länge-Griff 21785), `tap` 21708, `splitNotes` 21462,
  `joinNotes` 21476, API 22221 (refresh, playhead, select, destroy).
- Modell-Schnittstelle (`rollModel` 50315): `getClip, begin, end(changed,label), revert, undo, redo, canUndo, canRedo, audition(n,v,d)`.
- `openRoll(t,s)` 50337 (STIMME → `tkSheet` 50340), `buildRoll` 50363 (Weiche own/mel 50364), `closeRoll` 50478, `rollFrame` 50483
  (Laufstrich), `rollHeadUpdate` 50421, `ROLLP` 50362. Quantisier-Blatt `openQuantSheet` 51526 (EL.qSheet, Klassen qh/qb/qchips/qrow/qact).
- Alle Aktionsknöpfe laufen über `act(label, fn)` 21554 → `model.begin()` … `model.end(ok, label)`; ↶ ↷ über `model.undo/redo` +
  `afterExternal`. Undo-Art 'takes' (34826/34861): `S.takes = JSON.parse(before)` → `wpUndone()` → Editoren folgen.

**Song-Fenster** – `svTap` 40631: STIMME-Zeile mit Song-Stimme → `tkSheet({vox})` (40654); eigener Clip → `openOwnRoll`; sonst songCycle.
**Clip-Matrix** – Ein Tipp auf einen Clip startet/stoppt ihn (`slotTap` 43044, GarageBand-Regel, auch bei Instrumenten); den Editor
öffnet bei allen Spuren derselbe Weg `openRoll(t,s)`: ✎-Taste 55272, Clip-Blatt „✎ Bearbeiten“ 51642, Toasts, Guide. Heute leitet
`openRoll` die STIMME-Spur ins Takes-Blatt um (50340) → genau dort einhängen, dann öffnet der Gesang-Clip denselben Editor wie ein Instrument.

**Speichern** – `saveFile` 53035 (.json ohne Audio), Container `tkExportZip` 60200 → `tkZipBytes` 60193 (projekt.json + takes/*.wav + manifest),
`tkUsedIds` 60205 (inkl. Chor-Takes), `va1BoxSave` 75727, Öffnen `onFilePicked` 53048 → `tkImportZip`. VX1-Daten liegen nur als
Felder in `S.takes` (kein neues Audio) → im Container automatisch enthalten.

## 1b. Bau-Entscheidung Editor

Der Gesang-Editor ist **dieselbe PianoRoll** (`PianoRoll.create`) im selben Blatt (EL.rollSheet, R.editor 'roll', ED.rollAt = {t,s,vx:1}
bzw. {vox,vx:1}) – kein eigener Canvas-Editor. Damit sind Tastatur links, Lineal mit Takt-Chips, Raster (1/4 … 1/16T, aus), Pinch-Zoom,
Scrollen, Achsen-Sperre beim Ziehen, ⬚-Auswahl/Mehrfachwahl, Teilen/Verbinden, ↶ ↷ und Laufstrich 1:1 dieselben. Die Stücke sind
virtuelle Noten eines Modells `vx1rModel(r)`; gezeichnet wird über das vorhandene `opts.noteDeco` (Welle, Kurve, Anker, Silbe).
Nötige PianoRoll-Eingriffe nur über `opts.audio` (ohne opts bitgleich): Werkzeuge kürzen, keine Länge/kein Zeichnen, Raster absolut am
Anker, Teilen/Verbinden an das Modell. Raster-Namen: PianoRoll `aus` ↔ Zeitkarte `off`, sonst gleich ('1/4','1/8','1/8T','1/16','1/16T','1/32').

## 2. Datenmodell der Stücke

Ein **Stück k** = Abschnitt zwischen Marke k und Marke k+1 (Quelle: `wpMarks(id)`, Erkennung `wpDetect` inkl. Tonwechsel-Marken src 'pitch').
Abgeleitet (nicht gespeichert, im Editor je Take gecacht, Schlüssel = Marken + Quell-Puffer):
- `cut` = Schnitt (sliceCuts-Regel: ≤ 3 ms vor der Marke am Nulldurchgang), `end` = nächster cut,
- `an` = Anker-Abstand = Zeit des lautesten Hüllkurven-Spitzenwerts in [Marke, Marke + 120 ms] − Marke (Hüllkurve 2,5 ms, Worker),
- `m` = Median der f0 (G2.an) über die gesungenen Rahmen des Stücks → Zeile (gerundet), Kurve = f0 im Stück,
- `uv` = stimmlose Läufe im Stück (`g10gUnvoiced`, ggf. + Nulldurchgangsrate aus derselben Worker-Analyse),
- `tx` = Silbe aus `g9LabelsOf`/`wpLyr` (Index k), sonst leer.
Gespeichert (additiv, alte Projekte unverändert, Normalisieren über Haken):
- an der Marke: `an` (Anker-Abstand s, 0…0,12; beim ersten Bearbeiten für alle Marken festgeschrieben) und `vd` (eigenes Ziel der Marke,
  Sekunden in Zeitkarten-Zeit; nur bei Hand verschobenen/ausgewählt quantisierten Stücken),
- `m.warp.mode = 'hybrid'` (Schneiden/Dehnen; alte Fassungen spielen es als 'slice'),
- Tonhöhe: `m.pitch.notes[].sh` (G2; Notengrenzen werden an Stück-Grenzen geteilt, damit ein Stück allein rückt).
Virtuelle Noten für die PianoRoll: `{t: Schlag(cut), d: Schläge(cut→end), n: round(m), v: 1, _k: k}` im Clip-Raster
(Schlag = at + (Ziel-Zeit − in)/spb; Song-Stimme: ab v.bar mit opts.tk); `getClip()` = `{len, key, ts, notes}` des echten Clips.

## 3. Wie die Wiedergabe der Änderungen läuft

Kette je Take beim Abspielen: `tkPlayBuf` → `tkExt().proc` = **wpProc (Zeitkarte)** über **g2Proc (Tonhöhe)** über SÄUBERN/G4 → Roh-Take.
- Zeit: Marken (`vd`, `an`) → `wpQuant` (Haken: im Modus 'hybrid' Anker statt Marke rastern, `vd` überschreibt) → `m.warp.map` →
  `wpAfter` → `wpPlay` → `wpRender` (Worker, neue Op 'hyb') → `WP.cache` → `wpResync` = `wpSwitch` (Überblendung im Lauf) bzw.
  `vpDefer`/`vpPump` → `clResync`. Der Editor zeichnet während des Ziehens nur verschoben (keine Neuberechnung je Bewegung); gerendert wird
  einmal beim Loslassen.
- Tonhöhe: `m.pitch` → `g2After` → `g2Proc` rendert im G2-Worker (formanterhaltend), danach Zeitkarte darüber.
- Ein Undo je Aktion: `undoPush({kind:'takes', before: JSON.stringify(S.takes), label})`; ↶↷ → `wpUndone` (+ VX1R-Haken) und `g2Undone`.
- Hybrid-Render (Op 'hyb', in vx1r-Funktion, die in den Worker-Quelltext kommt): je Stück j Quelle [cut_j, cut_j+1) an Ziel D_j;
  Platz ≤ Länge (Nachfolger nach links): Ausklang am Nachfolger-Schnitt abgeschnitten, Ausblende 10–30 ms gleiche Leistung + 5–10 ms
  Überblendung; Platz > Länge (Lücke): nur der Vokal-Teil ab Anker + 20 ms per `VSX.stretch` bis 1,5× gedehnt, Rest Stille mit Ausblende;
  Einsatz [cut, Anker + 20 ms] bitgleich. Ausgabe gleiche Länge wie der Take (wie renderSlices).

## 4. Wo eingehängt wird (je eine Zeile, Kommentar „VX1R“)

1. `openRoll` 50340: STIMME-Clip mit Audio → `vx1rOpen({t,s})`, sonst wie bisher `tkSheet`.
2. `buildRoll` 50364: `if (ED.rollAt && ED.rollAt.vx) return vx1rBuild();` (Neuaufbau bei Drehen/Rebuild).
3. `rollFrame` 50483: Laufstrich für `ED.rollAt.vx` (Take-Zeit → Clip-Schlag); `rollHeadUpdate`: Kopftext für vx.
4. `svTap` 40654 bleibt (Tipp → Takes-Blatt); `tkSheetPaint` 59711: neuer erster Knopf „✎ Bearbeiten“ (data-a="vx1r"), `tkSheet` 59678:
   `if (d.a === 'vx1r') { closePop(); vx1rOpen(rr); return; }` – „Marken & Timing …“ und „Tonhöhe korrigieren“ bleiben.
5. PianoRoll (alle über `opts.audio`, ohne opts unverändert): Werkzeuge kürzen nach dem Aufbau (eine Zeile nach 20990), Länge-Zone aus
   (21605), Raster absolut am Anker (21652), Länge-Griff im Lineal aus (21785), Teilen/Verbinden an `opts.audio.split/join` (20982/20983).
   Zeichnen der Stücke über vorhandenes `opts.noteDeco` (kein Eingriff).
6. Zeitkarte: `wpNormMarks` 61682 (an/vd behalten), `wpNormWarp` 61696 ('hybrid' behalten), `wpRun` 61754 (Ops 'hyb'/'vxa'),
   `wpWorker` 61762 (+ vx1rRun.toString()), `wpRender` 61814 (Modus 'hybrid' → Nachricht), `wpQuant` 61985 + 61988/61989 (Anker + vd),
   `wpSetQ` 62035 (Raster im Marken-Editor löscht vd), `wpUndone` 62074 (`vx1rUndone()`).
7. Speichern: `saveFile` 53035 – nach dem Sichern einer .json mit Gesang ein Hinweis „Gesang nur im Container“ mit Knopf „Mit Audio
   sichern“ (`va1BoxSave`); sonst nichts.
8. CSS: `.pr.vx1r` (Anschlag-Leiste aus, ausgeblendete Knöpfe `.vx1rx{display:none!important}` – draw() setzt `hidden` sonst zurück).

## 5. Teilschritte

**Schritt 2 – Kern (ohne Bedienung)**
- 2a Block VX1-BEGIN/END nach KF1-END anlegen, `VX1R`-Zustand, Normalisier-Haken (an, vd, 'hybrid'), Test-API `vx1r…` in SYNQUENZER.
- 2b Analyse-Op 'vxa' (Worker): Hüllkurve 2,5 ms, Anker je Marke (Spitze in 120 ms), Nulldurchgangsrate je 10 ms; Cache je Take+Quelle.
- 2c Stücke ableiten `vx1rPieces(id, a)` (cut/end/an/m/uv/tx) aus Marken + G2.an + G9; Abbildung Take-Zeit ↔ Clip-Schlag (Szene/Song).
- 2d Hybrid-Render Op 'hyb' (Schneiden links mit Ausblende, Dehnen rechts ≤ 1,5×, Einsätze fest, Überblendungen) + wpRender-Weiche;
  Node-/Browser-Messung: kein Knacken (Sprung ≤ Schwelle), Einsatz bitgleich, Länge gleich.
- 2e wpQuant-Haken: Anker auf Raster, vd überschreibt; Commit-Hülle `vx1rCommit(id,label,fn)` (ein Undo, Requant, wpAfter, g2After).
- Pflicht: topdefs, dupkeys, smoke; LOG.

**Schritt 3 – Editor**
- 3a `vx1rOpen/vx1rBuild/vx1rClose`: PianoRoll in EL.rollSheet mit `vx1rModel(r)` (virtueller Clip, begin/end/revert, undo/redo global),
  Kopf wie buildRoll (Titel „STIMME · Szene n“ / „Song · Takt …“, ✕, folChip), Mitte = Median-Tonhöhe.
- 3b PianoRoll-Haken `opts.audio` (Werkzeuge kürzen: bleiben ⬚ Raster Leitertöne ⤢ ↶ ↷ + „Quant.“ „A/B“ „Takes …“; Aktionen ▲▼ Stufe,
  ±12, Teilen, Verbinden; keine Länge, kein Zeichnen; Anschlag-Leiste aus).
- 3c Zeichnen über `noteDeco`: Stück-Körper (Spurfarbe), Vor-Anker-Teil heller, stimmlos schraffiert, Wellenform aus Hüllkurve, f0-Kurve,
  Anker = kräftige senkrechte Linie, Silbe klein unten rechts vom Anker (nie darüber). Alles aus Caches, kein Neuaufbau je Bild.
- 3d Gesten → Daten: waagrecht = vd (Raster absolut am Anker, „aus“ = frei), senkrecht = G2 sh (Grenzen teilen), frei = beides in EINEM
  Undo; Tipp = wählen/Mehrfachwahl (⬚), Vorhören des Stücks (gehörte Fassung) und Tastatur-Ton.
- 3e Teilen = Marke an der Stelle (`wpMarkAdd`-Logik + G2-Teilung), Verbinden = Marke(n) dazwischen weg; je ein Undo.
- 3f QUANT.-Blatt im Stil von openQuantSheet (EL.qSheet: Raster-Chips, Stärke 0–100 %, Abbrechen/Anwenden; Auswahl oder alle; Vorschau
  nur als Bild), „Text erkennen“: Silben vorhanden → nichts; sonst Marken-Editor im Text-Modus + `g9RecSheet` (vorhandener Weg).
- Pflicht + Fotos hochkant 428×926, quer 926×428 / 926×370 (✕ sichtbar, nichts springt, Tasten ≥ 44 px); LOG.

**Schritt 4 – Zugänge, Speichern, Test**
- 4a Einhängen openRoll/buildRoll/rollFrame/rollHeadUpdate; Takes-Blatt „✎ Bearbeiten“ (Song-Stimme und Szene); Chor-/Takes-/Marken-Wege
  bleiben erreichbar (Knopf „Takes …“ im Editor).
- 4b ↶↷ (wpUndone/g2Undone), Projekt laden mit offenem Editor, Takt-/Tempo-Wechsel, Clip gelöscht → Editor zu.
- 4c Speichern: .json-Hinweis + Container-Rundlauf (ZIP sichern → öffnen → Marken/vd/hybrid/pitch gleich, Wiedergabe bitgleich).
- 4d Test `vx1r-test.mjs` (Muster beg1-test.mjs; Takes über `tkInject` mit synthetischem Gesang: Silben mit Konsonant-Rauschen + Vokal):
  Anker-Lage, Einrasten am Anker (Anschwung vor dem Taktstrich), Hybrid links/rechts (kein Knacken, Dehnung ≤ 1,5×, Einsatz bitgleich),
  Tonhöhe ±1 (G2), ein Undo je Aktion, alte Projekte bitgleich (Basis vs. neu: Takes ohne VX1-Felder spielen gleich), Matrix-Tipp/✎ und
  Song-Weg öffnen denselben Editor, Fotos, CPU beim Ziehen (keine Renders während der Geste), Pflichtwörter (MS 2000 1×, live: true 1×).

## 6. Risiken / offen

- 77 Stellen lesen `ED.rollAt` (Laufstrich, Folgen, Guide, Tastatur-Schritt): in Schritt 3 alle mit `ED.rollAt.vx` prüfen (vx wie own/mel
  behandeln); Tastatur-Schritteingabe für vx aus.
- Ein Take kann in mehreren Clips/alt/Song liegen: Zeitkarte gilt je Take (wie bisher) – der Editor zeigt das aktive Stück (a.take).
- Marken-Editor zeigt Modus 'hybrid' nicht als eigenen Chip – dort nur anzeigen „Schneiden/Dehnen“ (Schritt 4).
- Ohne Worker (Claude-App) laufen 'vxa'/'hyb' über den wpCall-Rückfall im Hauptfaden (stückweise, Messung in Schritt 4).
