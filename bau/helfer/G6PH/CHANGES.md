# CHANGES G6+h (Chor im Song und im Video) – gegen R-4252 (4.25.2)

## Neu (Block `G6PH-BEGIN … G6PH-END`, direkt hinter `G6-END`)
- `g6pSongPcs(bar, beat)` / `g6pSongPcsAt(songBeat)`: liefert die Tonklassen der Begleitung an einer Song-Stelle, aus Song-Bahnen (Szenen-Clips in Phase über `laneOriginAt`, eigene Clips `song.own`) und `song.mel`. Ausgenommen sind STIMME, MELODIE, Drums und stumme Spuren; hinter dem Song-Ende kommt `null`.
- `g6pVoxPcs(r, beat)`: Song-Stimme → Begleitung am Takt, abgetastet ¼ Schlag nach dem erkannten Noten-Anfang (`G6P_PROBE`).
- Vorausrechnen im Song: `g6pSongTick` (Haken im Song-Takt, nur bei einem neuen Takt, gerechnet außerhalb des Takts) → `g6pPrefetch`. Das Fenster `g6pHorizon` reicht vom laufenden Takt bis zum Ende des nächsten Teils (Marken), mindestens 8 Takte; im Loop geht es am Loop-Anfang weiter. Angestoßen werden zuerst die Lead-Fassung (`g6pLeadReady`: Take geladen, G2/Zeitkarte, VS-P gemessen, stabil), dann die Stimmen (`g6pWant`: v1 `g6Buf`, v2 `g6pEnsure`). Neuer Versuch alle 250 ms, solange etwas fehlt. Im Offline-Render ruht das Vorausrechnen.
- `g6pSongEdit(r, label, fn)`: Eine Chor-Geste auf einer Song-Stimme ergibt ein Undo. Ändern sich auch die Chor-Spuren (`S.tracks[st].chor`), wird daraus `{kind: 'group', items: [song, chorlanes]}`.
- Undo-Art `chorlanes` (`g6pLanesSnap`/`g6pLanesRestore`, Platzhalter bis G6+a).
- Video: `g6pWaitAll({a, b}, {cancel, timeout})` wartet, bis Lead-Fassungen, Chor-Puffer und Auto-Pegel aller Stellen im Bereich fertig sind; ohne Chor kehrt es sofort zurück. `g6pRenderHold`/`g6pRenderRelease` setzen Solo und „Selbst singen“-Scharf (v1 `G6`, v2 `G6P`, falls vorhanden) für den Render aus und stellen sie danach wieder her, auf den Live-Knoten neu angewandt.
- Test-API: `g6pSongPcs`, `g6pHorizon`, `g6pAhead`, `g6pReady`, `g6pWaitAll`, `g6pHold`, `g6pRelease`, `g6phInfo`, `g6pPcsOf`.

## Geändert (Haken)
- `g6HeardPcs`: Song-Stimme → `g6pVoxPcs` (bisher `null`, also nur leitereigene Dreiklänge). Szenen-Clips bleiben unverändert.
- `g6Edit`: Der Zweig für Song-Stimmen läuft über `g6pSongEdit`; ohne Chor-Spuren verhält er sich wie bisher (ein `pushSongUndo`).
- `undoState`/`undoApply`: je eine Zeile `chorlanes`.
- `songTickInner`: eine Zeile `g6pSongTick` nach `g3SongTick` (nur im ersten Durchgang).
- `Object.assign(SYNQUENZER, G6PH_API)`.

## Video-Patch (`patch-video.diff`, gegen VIDSTAGE.html)
- `vvRenderAudio` wird zur Hülle (Hold → `vvRenderAudio0` → Release im `finally`).
- Nach `await vvTakesReady()` folgt `g6pWaitAll({a, b}, {cancel: () => VV.cancel})`. Ist der Chor nicht fertig (Zeitlimit 3 min), erscheint ein Toast, und der Render läuft trotzdem.

## Regel 28
Normalisieren, Speichern und Format sind unverändert. Alte Projekte laden zeichengleich und klingen gleich: Gespeicherte `iv` werden nie neu berechnet, und die neue Begleitungs-Quelle wirkt nur beim nächsten Tipp auf einen Stil einer Song-Stimme.
