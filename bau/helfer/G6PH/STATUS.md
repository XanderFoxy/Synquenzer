# G6+h – Chor im Song und im Video · Stand 01.11.2026

**Basis:** `bau/snapshots/R-4252.html` (4.25.2). VERSION ist unverändert.
**Video-Teil:** eigener Patch `patch-video.diff` gegen `bau/snapshots/VIDSTAGE.html`. Geprüft wurde er auf `G-VID-zwischen.html` (4.26.0 mit G6 + VV), aufgebaut mit `tests/apply_g6ph.py --video`.
**Ergebnis:** alle G6+h-Abnahmen grün (28 ✓, 0 ✗, siehe `tests/ergebnis-g6ph-accept.txt`). Smoke ohne Fehler auf index.html, VIDSTAGE+Video-Patch und 4.26.0+G6+h+Video-Patch.

## Abnahmen

| Nr. | Ergebnis | Gemessen |
|---|---|---|
| G6P-70 | ✓ | `g6pSongPcs` trifft 48/48 Stellen (G–Em–C–D, dazu `song.mel`, hinter dem Song `null`). Song-Stimme Dreistimmig: 32/32 Chornoten sind Akkordtöne der Begleitung am Takt, Barbershop 48/48. Gospel gibt es erst mit G6+d; der Test gilt dann über dieselbe Schnittstelle. |
| G6P-71 | ✓ (verkürzt) | 40 Takte bei 160 BPM (60 s statt 3 min) mit 3 Chor-Stellen, Start ab leerem Chor-Cache: jede Stelle ist fertig, bevor sie erklingt. Kein langer Task während der Wiedergabe; ein Durchgang dauert ≈ 0,3 ms. **Gegenprobe** ohne Vorausrechnen (Stand 4.25.2): 0/3 Stellen sind rechtzeitig fertig. |
| G6P-72 | ✓ (ohne LU-Vergleich) | `g6pWaitAll` rechnet vor dem Render alles fertig (≈ 1,6 s ab leerem Cache), und der Ton enthält die Chor-Stelle. Zwei Renders: max \|Δ\| = 1 LSB. Ein vor dem Render aktives Solo ändert den Render nicht (≤ 1 LSB) und ist danach wieder aktiv. Die Gegenproben ohne Hold bzw. ohne Warten weichen um 12 603 bzw. 5 562 LSB ab. |
| G6P-73 | ✓ | Ein Stil auf der Song-Stimme ist **1** Undo-Schritt. Song + Chor-Spuren ergeben einen Gruppen-Schritt (`song` + `chorlanes`), ↶/↷ stellen beides her, und `S.fxBus` ist danach deep-equal. Speichern → Laden ist deep-equal. |

## Befunde und Grenzen (ehrlich)
- **Bitgleich im Video:** Schon **ohne** Chor weichen zwei Renders von 4.26.0 (`G-VID-zwischen`) um ±1 LSB (16 bit) voneinander ab. Das ist eine Eigenschaft von VV und nicht von G6+h. Der Chor fügt nichts hinzu, der Test prüft deshalb auf „≤ Grundlinie“. Gehört zur Video-Abnahme (VV).
- **Nicht gemessen:** G6P-72 „Chor/Lead-Abstand = live ± 0,2 LU“, weil kein Abgriff am Live-Ausgang gebaut ist. Das gehört zur Gesamt-Abnahme G6+i (M-LU, Live = Offline G6P-27).
- **G6P-71** lief verkürzt auf 60 s statt 3 min und mit v1-Chören. Die Vorrang-Warteschlange und die 48-MB-Grenze liefert G6+b. Bis dahin gilt die v1-LRU mit 24 Puffern; das Fenster reicht bis zum Ende des nächsten Teils und nicht weiter, damit nichts verdrängt wird.
- **Akkord-Abtastung:** Die Analyse setzt den Noten-Anfang oft einige ms vor den Einsatz. Deshalb wird die Begleitung ¼ Schlag nach dem erkannten Anfang gelesen (`G6P_PROBE`). Ohne das bekam ein Ton genau auf dem Akkordwechsel den alten Akkord (Test vorher 30/32).
- Die Abtastung gilt **nur für Song-Stimmen**, Szenen-Clips bleiben wie 4.25.2 (`g6HeardPcs` unverändert). Gezählt werden nur leitereigene Dreiklänge (v1-`g6Chord`, nach der Begleitung bewertet). Leiterfremde Begleit-Akkorde (Zwischendominanten) erkennt v1 nicht; das ist Sache von G6+b (`ch±n`).

## Schnittstellen zu den anderen Paketen (Platzhalter, beim Merge G6+i prüfen)
- **G6+a:** `chorlanes`-Undo-Art. Hier gibt es `g6pLanesSnap(t)`/`g6pLanesRestore(t, val)` als Platzhalter (JSON von `S.tracks[st].chor`) mit je einer Zeile in `undoState`/`undoApply`. Liefert G6+a eigene Funktionen, gilt dessen Fassung, und diese beiden fallen weg. Das Normalisieren der Spuren (`normTrack`/`tkNormProject`) kommt von G6+a.
- **G6+b:** Für v2-Chöre ruft das Vorausrechnen `g6pEnsure(a, prio)` auf (true = fertig: Stimmen + `gA`), solange die Funktion fehlt, über `typeof`. `g6pSongPcs(bar, beat)` (Set|null) ist die Begleitungs-Quelle für `ch±n`/`root-` auf Song-Stimmen. Für Song-Stimmen gilt `bar = v.bar`, `beat = Schlag + G6P_PROBE`.
- **G6+c:** Für die Dauer des Renders werden `G6P.solo`/`G6P.arm` ausgesetzt, falls `G6P` existiert. Heißt der Laufzeit-Zustand dort anders, muss `g6pRenderHold`/`g6pRenderRelease` angepasst werden.
- **G6+d/e/f:** Chor-Gesten auf Song-Stimmen laufen über `g6Edit` → `g6pSongEdit(r, label, fn)`. `fn(v)` darf `v.chor` und `S.tracks[st].chor` ändern; daraus wird ein Undo-Schritt.
- **Video (4.26.0):** `patch-video.diff` legt eine Hülle `vvRenderAudio` → `vvRenderAudio0` an (Hold/Release im `finally`) und fügt nach `vvTakesReady()` eine Zeile `g6pWaitAll({a, b}, {cancel})` ein. Fehlt der G6+h-Block, läuft der Render wie bisher (`typeof`).

## Dateien
- `index.html`: R-4252 + G6+h (Block `G6PH-BEGIN … G6PH-END` hinter `G6-END`, dazu 6 Haken).
- `patch.diff` (gegen R-4252.html), `patch-video.diff` (gegen VIDSTAGE.html).
- `tests/g6ph-accept.mjs` (G6P-70…73 mit Gegenproben), `tests/g6ph-lib.mjs` (Testdaten), `tests/apply_g6ph.py` (G6+h auf eine andere Basis, `--video`), `tests/smoke.mjs`, `tests/ergebnis-g6ph-accept.txt`.
- Aufruf: `python3 tests/apply_g6ph.py ../../snapshots/G-VID-zwischen.html /tmp/v.html --video && node tests/g6ph-accept.mjs $PWD/index.html /tmp/v.html` (Playwright über `node_modules/playwright` im Aufruf-Ordner).

## Bitte prüfen (am iPhone, nach dem Merge)
1. Song mit einer Song-Stimme über einem Teil mit Akkord-Begleitung → Chor-Blatt → [Dreistimmig]: Die Stimmen liegen auf den Akkorden der Begleitung (nicht nur leitereigen).
2. Song von vorn abspielen: Der Chor ist an jeder Stelle sofort da, ohne verspäteten Einsatz.
3. Solo auf einer Chorstimme lassen → Video machen: Im Video sind Lead und alle Stimmen zu hören, danach ist Solo wieder an.
