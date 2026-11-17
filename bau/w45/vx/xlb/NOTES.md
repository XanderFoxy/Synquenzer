# NOTES XLB – Spuren und Szenen bis 24 / 32 je Projekt (Fassung B vorbereiten)

Basis: `rel-4780/index.html` (Synquenzer 4.78.0, md5 68e92c0367cd63eda5a9da08ead8990d) → `basis.html` (unverändert).
Ergebnis: `index.html` (VERSION bleibt '4.78.0'), gebaut mit `python3 bau.py` aus basis.html + `src/block.js` + `src/block.css` + einzeiligen Haken.
Stand nach der Prüfung (17.11.): `index.html` md5 **ad25315ffa4e4ba08074903d8a6a59f3**, 9 573 218 Bytes (Basis 9 543 731, +29 487 = +0,31 %);
`bau.py` erzeugt genau diese Datei wieder. Fassung vor der Prüfung: `index.vor-pruef.html` (md5 018e17d4…), siehe Abschnitt „Prüfung“.
**Nur vorbereitet (Fassung B) – nichts veröffentlicht, nichts gepusht.**
Bauplan: `vx/cbpimp/ARCHITEKTUR.md` Variante A (BAUPLAN P1).

## Plan

- Ein Projekt hat so viele Spuren (6…24) und Szenen (8…32), wie es braucht. 8 Szenen / höchstens 8 Spuren bleibt der Standard und
  verhält sich wie 4.78 (Laden, Speichern, Format, need, ui, Aussehen der Matrix).
- Größer wird ein Projekt nur durch einen Import (XLA) oder durch ＋ Szene / ＋ Spur. Dann schreibt es Format 8 + need ['xl'];
  4.78 öffnet es nur gesperrt (vorhandene Sperre nvLockOf) und gibt die Original-Datei unverändert weiter.
- Matrix: weiter 4 (hochkant) bzw. 8 (quer) Spalten; Szenen in Bänken, [SZ] blättert durch alle Bänke, Spur-Seiten [▲▼] wie bisher.
- Audio: die Zusatzspuren 9–24 bekommen Kette und Engine erst bei Bedarf (leer → erst beim Wählen / ersten Ton; mit Inhalt → in
  Scheiben ≤ 6 ms nach dem Laden, vor dem ersten Ton sofort). Normale Projekte (≤ 8 Spuren) bauen alles sofort wie bisher.

## Änderung

Alle neue Logik steht im Block `/* XLB-BEGIN */ … /* XLB-END */` (JS, direkt nach `orderFor`) und im CSS-Block `/* XLB-BEGIN */`.
Außerhalb nur einzeilige Haken mit „XLB“ im Kommentar (bau.py nach der Prüfung: 108 Zeilen ersetzt, 8 davor, 21 danach eingefügt; jede an Zeilennummer +
Text der Basis gebunden). Kein anderer Paket-Block verändert.

### Stellen, die an MAX_T / N_SCN / einer festen 8 hingen

Datenkern / Format
- `MAX_T = 8 → 24` (Datenobergrenze). `N_SCN = 8` bleibt = Szenenzahl eines neuen Projekts (newProjectRaw); die echte Zahl ist `NS()`.
- `NS = () => N_SCN` → `S.scenes.length`. `emptyClips()` → `xlNsN()` (beim Laden die Szenenzahl der Datei, Kontext XLB.nn).
- `orderFor(n)`: Spuren 9–24 vor DRUMS (xlOrderFor). normalizeProject: `xlNormBegin/End/Fail` (Szenen 8…32 aus der Datei, alle
  Spuren gleich lang, Kontext zu), ui.sceneBank/trackBank > 1 nur im großen Projekt (xlNormUi), selS-Klemme, Szenen-Namen/Akkorde
  (slice N_SCN → xlNsN), Song-Einträge `slot` (29002, 37454, 83822), Clip-Herkunft `from.s / from.e.slot / prev.slot` (29047–29057),
  Teil-Slots (37428), Song-Ebenen (83373).
- Marken „S1…S32“ statt „S1…S8“: 29087, 37507 (rowSrcParse), 38566, 38589, 51962, 52045.
- `PROJECT_FORMAT_READ 7 → 8`, fmtOf: > 8 Spuren oder Szenen → Format 8. needCalc: + 'xl'; KNOWN_NEED + 'xl'.
- `projBars` zählt die Szenen des jeweiligen Projekts (52911). Gesang-Take in Szene (60488) klemmt auf NS().

Feste 8er-Felder → MAX_T (24) bzw. XL_S (32)
- `AU.synth` (30004, Video 75110), `WKSET`, `WKFM`, `WKFM_AT` (30986/30996), `R.slot/cstart/pend/prev/own/lastNote/songOverride`
  (32949–32954), `cs` (33720), `CAP.last` (36518), `MODS_DIRTY` (43577), Video-Farben `--t1…--t24` (75334),
  `KEYC.cache` je Szene (36422, 52885 → XL_S).
- Unverändert, laufen jetzt bis 24 (prüfen jeweils AU.tracks[i] / i < NT()): Schleifen 30239 (mit Lazy-Haken), 30727, 30741, 32684,
  50614, 51975, 52853, 71471–71500 (G10J), 95453; `sr.ev` (34132/34254), `midiArrs` (54875); Pegel-Messer: `MTR_IN = MAX_T + 1` = 25
  ist nur noch die logische Größe; der echte Messer hat je Projekt 9 (wie 4.78) oder 25 Eingänge (Prüfung, siehe unten).

Engine / Wiedergabe
- `ensureAudio`: `if (!xlDefer(i)) buildTrack(i)` (30032); Ketten-Schleife überspringt aufgeschobene Zusatzspuren (nach 30239).
- `syncEngines`: Engines der Zusatzspuren einzeln in Aufgaben (xlDeferE) – vorher Long Task 448 ms beim Laden von 24 Spuren.
- Wecken vor dem ersten Ton: spawnVoice (nach 32010), scheduleTrack (nach 33295), selectTrack (nach 43102).
- cpuHeavyCheck: Hinweis auch ab 16 gleichzeitig spielenden Spuren (xlHeavy, vor 35788).

Matrix / Bedienung
- `sceneBankOf()` = Gruppe zu 4 Szenen (0/1 wie bisher, im großen Projekt bis 7); `trackBankOf()` beliebig viele Spur-Seiten.
- `MX.scenes = xlMxScenes()` (sichtbare Bank, 4 oder 8 Spalten), Schleifen N_SCN → NS() (36838/36840/36898/36915), Füllzellen
  bleiben 3 × (8 + 2) (36926, CHS 73145), `setSceneBank` klemmt (xlSbClamp), `setTrackBank` beliebig.
- `renderGrid`: andere Szenenzahl → buildGrid (nach 36812, nach 36951). Mehr Szenen als Spalten → [SZ] auch quer (nach 36881),
  Platz für [SZ] bei 8 Spalten (xlMxCorner nach 36883). Leere Spalten am Ende der letzten Bank (xlMxGhost nach 36857).
- [SZ]-Knopf: Beschriftung/Aria der sichtbaren/nächsten Bank (37066–37068), Tipp → nächste Bank (52228, 55362),
  Halten → Szenen-Blatt (xlSzDown vor 55316). Szene zeigen bei Wahl/Start (43108, 52062 → xlShowScene).
- Rand-Blättern beim Ziehen kennt alle Bänke/Seiten (96331, 96335, 96336), Duplikat-Hinweis „(SZ 9–12)“ (96500/96501).
- Szenen-Kopf-Blatt bekommt die Zeile „＋ Szene / Szene n entfernen“ (xlScnRow nach 96517).
- Spur-Blatt / Einstellungen: ＋ Spur von Hand bis 24 (35708, 35754, 52411 → xlCanAddT); Text „n von 24 Spuren“, „Spuren n/24“.
- Song-Editor: Spur-Seiten für > 8 Spuren (bankVp nutzt `Math.max(8, NT())`, 37250); Song/Video Spurbank `trackBankOf()` (78640).
- Video-Matrix: Bank der laufenden Szene (78645), Beschriftung bis NS() (78652), keine Köpfe hinter der letzten Szene (78655).
- Chor-Gruppe CHS: Schleifen N_SCN → NS() (73127, 73179, 73189).
- MIDI-Export: großes Projekt = alle Spuren als eigene MTrk (xlMidiT/xlMidiIdx; 54885–54933), Kanäle über das vorhandene midiCh.
  Normales Projekt unverändert (MIDI_T = 5, Standard-Spuren).
- Undo: eigene Art 'xls' (Snapshot Szenenzahl + Clips + Bank; HIST.kind), ein ↶ je ＋ Szene / Szene entfernen.
- Guide-Eintrag „Mehr Szenen und Spuren“ (xlGuide), Hilfe-Zeile „MEHR SZENEN UND SPUREN …“ (nach 52507).

Grenze der bisherigen Wege (Entscheidung)
- MTX3 Einzelspuren, MTX Spur duplizieren, SPK11 Spektral→Szenen, MTX3b: im normalen Projekt weiter höchstens 8 Spuren
  (`xlTLim()` = 8), im großen Projekt 24 (96560, 96832, 96841, 96989, 97006, 97049, 97280, 97566/97567, 108163, 108266, `canAddTrack`).
  So macht kein bisheriger Weg ein Projekt still zum großen (need 'xl'); groß wird es nur durch Import oder ＋ Spur / ＋ Szene.

### Abfrage für XLA (Import)

```
maxTracks()  → 24        // MAX_T
maxScenes()  → 32        // XL_S
xlRoom()     → {maxT: 24, maxS: 32, std: 8, nt, ns, freeT, freeS, xl}   // nt/ns des offenen Projekts, xl = größer als 8×8
```
XLA baut sein Projekt-Objekt mit bis zu 24 Spuren / 32 Szenen (jede Spur `clips.length` = Szenenzahl) und lädt es über den normalen
Weg (`parseProjectFile` / `switchProject`); normalizeProject übernimmt die Szenenzahl der Datei (geklemmt 8…32). Zusätzlich im
Test-Zugang: `SYNQUENZER.xl` = {room, max, addScene, remScene, setScenes, bank, next, sheet, lazy, wake, engQ, pend, tLim, canAdd, dormant}.

### Neue Bedienung (im vorhandenen Stil)

- Matrix, letzte Bank nicht voll: leere Spalten (gestrichelt, blass), die erste mit Kopf-Knopf „＋ Szene“ (≥ 44 px).
- [SZ] tippen: nächste Bank (1–4 → 5–8 → 9–12 … → 1–4). [SZ] halten: Szenen-Blatt mit allen Bänken, ＋ Szene, ＋ Spur,
  „Szene n entfernen“ (nur die letzte, wenn sie leer und im Song unbenutzt ist).
- Szenen-Kopf halten: vorhandenes Blatt + Zeile ＋ Szene. ■ einer Spur halten: Spur-Blatt mit ＋ Spur (bis 24).
- Normale Projekte (8 Szenen) sehen die Matrix wie 4.78: keine leeren Spalten, [SZ] hochkant wie bisher, quer kein [SZ].

## Tests

`node xlb-test.mjs <index> <basis> <fotoordner>` → **64 OK / 0 FEHLER** (fotos/xlb-test.json, Log mess/xlb-test.log).
- T1 A/B: 9 Altprojekte (5 Dateien aus dirigent-test + demo/init/3-4-Takt/8 Spuren) in 4.78 und XLB geladen und gespeichert:
  Projekt-JSON und Projekt-Datei **bitgleich**, Format 5/7 wie vorher, kein need, Matrix wie 4.78.
- ＋ Szene / ＋ Spur über 8: need ['xl'], ↶ genau wie vorher, ↷ genau wieder.
- T2/T3 24 × 32: Format 8, need [xl], 32 Clips je Spur, Song-Szenen bis 32, Marken S12/S31, DRUMS zuletzt; Speichern → Laden gleich;
  Szene 10 spielt (Noten von Spuren ≥ 9), Szenen-Wechsel 10 → 8 → 31; alle Ketten da; MIDI: Szene/alle Szenen 25 MTrk, Song alle
  Spuren mit Noten; Szene 32 entfernen nur leer + unbenutzt.
- Ketten bei Bedarf: 4 leere Zusatzspuren ohne Kette, die anderen in Scheiben; schlafende Spur wählen / neuer Clip → Kette sofort,
  spielt ab dem ersten Ton.
- T4/T5 Gesten per Touch (CDP), iPhone 12 Pro Max hochkant 428×926 und quer 926×428, 12 Spuren × 10 Szenen: [SZ] tippen/halten,
  leere Spalten mit ＋ Szene (≥ 44 px, kein waagrechtes Rollen), Clip in Spur 11 / Szene 9 tippen, ＋ Szene + ↶, Bank-Blatt,
  Szenen-Kopf 9 halten, Szene 9 duplizieren → 10, [▲▼] alle Spur-Seiten (DRUMS sichtbar), ■ halten an Spur 11 → ＋ Spur,
  Rand-Blättern, Song-Editor zeigt alle 12 Spuren und setzt per Tipp eine Szene in Spur 11, Mix-&-Master-Blatt mit 12 Spuren,
  Video-Matrix zeigt Bank 9–12; Konsole ohne Fehler.
- T2b: 4.78 öffnet ein 24 × 32-Projekt gesperrt und gibt die Original-Datei weiter. Klemme 8…32. xlTLim-Grenzen.
- Fotos: `fotos/xlb-bank-{hochkant,quer}.png`, `xlb-blatt-…`, `xlb-song-…`, `messung-chromium.png` (keine Songtitel, nur Testdaten).
- Normales Projekt sieht aus wie 4.78: Bildschirmfotos 428×926, 926×428, 320×568 byte-gleich zur Basis (md5 der PNG).

**Regression Matrix / Song / Mixer / MIDI** (`reg/lauf.sh`, Kopien der Tests in `reg/t`, nacheinander, nice -n 10; Logs `reg/o-neu/*.log`,
A/B-Logs `reg/o-basis/*.log`, Übersicht `reg/neu.txt`, `reg/basis.txt`; Fotos danach gelöscht):

| Test | Bereich | XLB | 4.78 (A/B) | Urteil |
|---|---|---|---|---|
| mtx3 | Matrix: Einzelspuren, MIDI je Einzelspur | 51/51 | – | grün |
| mtx3b | Matrix: Einzelspuren-Rest, Tastatur, Laden | 87/87 | – | grün |
| mtx3c | Matrix | 26/26 | – | grün |
| mtx4 | Matrix: mehrere Clips, ↶ ↷ | 117/118 (P2: ein Long Task 62 ms bei „+1 (64 Versionen)“, synchron 9 ms) | 115/118 (gleiche Zeitgrenzen, Last 6–9) | BEKANNT (Zeitgrenze unter Last, in der 4.78-Regression genauso) |
| mtx (MTX-1…5, 4.55) | Matrix: Rand-Blättern, Szene/Spur duplizieren, Blätter | 91/92 | 91/92, gleiche Prüfungen | gleich (die eine Prüfung erwartet den alten 4.49-Fehler in der Vergleichsdatei) |
| teil1 | Song: Teile, Lineal, Teil → Szene | 61/61 | – | grün |
| clip1 | Song/Matrix: Auswahl als Clip | 109/109 | – | grün |
| trp1 | Song: Abschnitt transponieren, MIDI | 81/81 | – | grün |
| mx2 | Mixer: MIX-Blatt, Seitenkette, Kanalzug | 34/34 | – | grün |
| mix3 (4.49) | Mixer: Mix & Master, Chor | 20 OK / 3 FEHLER, Abbruch bei Prüfung 10 | genau dieselben Urteile und derselbe Abbruch | gleich (Test älter als die heutige Bedienung) |
| midi-ab.mjs | MIDI-Export alter Projekte | **90/90 Dateien bitgleich** (9 Projekte × Szene 1–8 / alle / Song) | Referenz | grün |

→ **Kein Rückschritt gefunden.** Zusätzlich die Pflicht (siehe Messung/Startzeit): topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [],
„MS 2000“ 1×, „  live: true,“ 1×, Markenwörter je Wort gleich oft wie in der Basis, keine Emojis.

## Messung

Chromium hier (4 geteilte CPUs, Fremdlast 2–7) – `mess.mjs` → `mess/chromium.json`, `mess/chromium2.json`:

| Spuren | Laden (switchProject) | ensureAudio | Ketten in Scheiben | Long Task beim Laden | Worklet-Last live | Leerlauf | Bild P95 |
|---|---|---|---|---|---|---|---|
| 8  | 19–22 ms | 68–106 ms | – | 185–210 ms (wie 4.78) | 0,11–0,17 | ≤ 0,007 | 20 ms |
| 16 | 22–34 ms | 21–47 ms | 8 Spuren, 4–13 ms gesamt | 205 ms | 0,22 | ≤ 0,008 | 19–21 ms |
| 24 | 25–49 ms | 33–91 ms | 16 Spuren, 5–12 ms gesamt | 286 ms (vorher 448) | 0,30–0,33 | ≤ 0,012 | 20 ms |

(Last: jede Spur spielt einen 3-Ton-Akkord auf jeder Achtel, 26/48–58/90 Stimmen; Begrenzer nie aktiv.)
- buildGrid 24 × 32 (768 Zellen, ≈ 8,2 k Elemente): 13–15 ms hochkant/quer; Bank wechseln 1,6–3,1 ms; renderGrid ≤ 0,1 ms.
- Speicher (JS-Heap) 22–28 MB, kein Unterschied 8/24 erkennbar.
- Erster Lauf 24 Spuren: 5 Long Tasks 53–67 ms während des Spielens; im zweiten Lauf keine (Fremdlast).
- `messung.html` (eigene Seite, 426 KB, nichts gespeichert, nichts nachgeladen): echtes Klang-Programm der App (sq-worklet-src) und
  4 Werksklänge (Analog Bass, FM Pluck, Analog Fläche, Analog Lead), je Spur die Kette wie buildChain, 8 → 16 → 24 Spuren je 20 s,
  2 Stimmen je Spur auf jeder Achtel. Chromium hier: Last 0,14 / 0,30 / 0,44 (max 0,17 / 0,34 / 0,51), 0 Aussetzer, Bild 17–19 ms,
  Pegel-Messer mit 25 Eingängen ok → „bis 24 Spuren“. **Nur vorbereitet, nicht veröffentlicht.**
- iPhone 12 Pro Max: **GESCHÄTZT** (nicht gemessen) Faktor 1–2 der Chromium-Last → 24 Spuren ≈ 0,44–0,9, also an den
  Begrenzer-Schwellen 0,45 / 0,60. 16 Spuren ≈ 0,3–0,6. Sicher erst nach Xanders Lauf mit messung.html.

Startzeit (Seite laden bis bereit, je 3 Läufe, Median): Basis 4.78 → XLB, „App bereit“ (BOOT.done) ab Navigation, Chromium hier,
  Fremdlast 4–6 (`startzeit.mjs` / `startzeit2.mjs`, `mess/startzeit-ende.json`, `mess/startzeit2.json`, `mess/startzeit3.json`):
  - 3 Läufe (Pflicht, Last 6): 858 → 893 ms (Läufe 858/724/873 → 966/893/734, streut ± 120 ms).
  - 5 Läufe: 647 → 672 ms; Hauptfaden-Skriptzeit (CDP ScriptDuration) 103 → 93 ms, Aufgaben-Zeit 640 → 658 ms.
  - 9 Läufe, Reihenfolge wechselnd: 672 → 631 ms; ScriptDuration 104 → 103 ms; Aufgaben-Zeit 657 → 627 ms.
  → **kein messbarer Unterschied** (die Streuung ist größer als jede Differenz; die Skriptzeit ist gleich). Die erste Fassung war
  +130 ms (TDZ-Ausnahmen in xlNsN beim Start) – behoben mit dem Merker XLB.sOk. Datei +26,8 KB (9 543 731 → 9 570 550 Bytes, +0,28 %).
  Beim Start läuft vom Block nur: Konstanten, XLB-Objekt, xlNsN (ohne Ausnahme), xlApi (Objekt mit Pfeilen). Ketten der Zusatzspuren
  entstehen erst bei Bedarf.

Grenzen (für Fassung B):
- Höchstens 24 Spuren / 32 Szenen je Projekt (Daten), 4 bzw. 8 sichtbare Spalten, 8 Szenen-Bänke à 4.
- Ab 16 gleichzeitig spielenden Spuren erscheint der vorhandene „Viel Last“-Hinweis; der CPU-Begrenzer der App regelt wie bisher.
- Leere Zusatzspuren kosten nichts (keine Kette, keine Engine), bis sie gewählt werden oder einen Ton bekommen.

## Offen

1. Farben der Spuren 9–24 wiederholen die Farben 1–8 (`--t9 = --t1` …). Eigene Farben = sichtbare Änderung → Vorschlag im Funk.
2. Live-Grenze 16 oder 24 Spuren erst nach dem iPhone-Lauf (messung.html) festlegen; ggf. Hinweis/Begrenzung im ＋ Spur.
3. ~~Pegel-Messer hat immer 25 Eingänge~~ → erledigt in der Prüfung: normal 9 Eingänge wie 4.78, nur mit mehr als 8 Spuren 25.
4. „Szene duplizieren“ ohne freie Szene macht das Projekt nicht größer (wie 4.78: keine freie Szene → aus). ＋ Szene zuerst.
5. Tasten 1–4 (Bluetooth-Tastatur) starten weiter Szene 1–4 wie in 4.78; Szenen 5–32 nur per Tipp (nicht geändert).
6. MIX-A / MX1 / MX3 mit 24 Eingängen in WebKit (iPhone) nicht geprüft (Chromium ok).
7. Stems/ZIP mit 24 Spuren: Größe nicht gemessen (je Spur eine WAV wie bisher).
8. MIDI: Spuren ab 15 teilen sich Kanal 16 (vorhandenes midiCh); jede Spur bleibt eine eigene MIDI-Spur.
9. XLA-Import an maxTracks()/maxScenes() anschließen (XLA-Block nicht angefasst).
10. Die neue sichtbare Bedienung (leere Spalten mit ＋ Szene, [SZ] halten = Szenen-Blatt, ＋ Spur bis 24, Guide-Eintrag) ist laut Auftrag
    freigegeben (generelles OK 16.11.); vor der Auslieferung trotzdem im Funk kurz mit Fotos (`fotos/xlb-*.png`) zeigen – CLAUDE.md Regel 3.
11. mtx4 P2 (Long Task > 50 ms bei 64 dichten Clips) ist eine Zeitgrenze, die auch 4.78 unter Last reißt – auf dem iPhone nicht gemessen.
12. mix3-test (4.49) bricht in 4.78 und XLB gleich ab (Bedienung seither geändert) – Mixer ist über mx2 (34/34), xlb-test (Mix-&-Master
    mit 12 Spuren) abgedeckt; ein aktueller Mixer-Test für 24 Spuren fehlt noch (MIX-A/MX1/MX3 mit 24 Eingängen, siehe 6).

## Prüfung (17.11., Nachbesserung nach dem Prüfer)

Sicherung vorher: `index.vor-pruef.html` (md5 018e17d45b501310c1a4f8a78c48cb0b), `bau.vor-pruef.py`, `src.vor-pruef/`, `xlb-test.vor-pruef.mjs`.
Alle drei echten Befunde des Prüfers nachgeprüft (mit eigenen Tests auf der alten Fassung nachgestellt) und behoben. Die drei übrigen
Prüfer-„Fehler“ (newProjectRaw ohne normalizeProject, 2× Mixer-Namenszählung) sind keine Fehler der App – bestätigt: alle Aufrufer von
newProjectRaw normalisieren danach (xlNormFail / normalizeProject), Track-Fabriken nutzen absichtlich die Szenenzahl des offenen Projekts.

| # | Befund (Schwere) | nachgeprüft | Behebung |
|---|---|---|---|
| 1 | Song-Editor: Blöcke der Spuren 9–24 ohne Farbe (hoch) | echt: `SV.cols` hatte 8 Farben, Spur 9/10 Pixel [11,12,15] | Haken Z. 37263: `SV.cols` = alle `MAX_T` Farben (`--t1…--t24`). Wirkt auch in Glas-Ansicht, Gesang-Take-Zeile, G3-Schweif, Video-Spurfarben, Song-Leiste. |
| 2 | Pegel-Messer immer 25 Eingänge → Video-Speicher ×2,7 auch im normalen Projekt (mittel) | echt: 25 Eingänge, 51 Werte je Fenster | Eingänge je Projekt: `xlMtrN()` = 9 (≤ 8 Spuren, wie 4.78) oder 25. Speicher je Messer mit eigener Breite (`mtrStore(cap, n)`, `Q.w`), Master immer letzter Eingang; außen heißt er weiter `k = MAX_T` (`xlMtrK` in `mtrAt` rechnet um, Spuren ohne Eingang → leer). `mtrTap` nur für Spuren mit Eingang; `mixaMoveTaps` verbindet den Master mit `n − 1`. Wechselt die Spurzahl über/unter 8, baut `mtrFrame` den Live-Messer einmal neu (`xlMtrRe`: alter Knoten aus + getrennt). Video-Render nimmt die Zahl des Projekts. |
| 3 | „Szene n entfernen“ lässt Song-Marke „Sn“ verwaist zurück (klein) | echt: Szene 9 mit Marke S9 entfernt, Marke „Szene 9“ blieb | `xlScnRemWhy` zählt auch Song-Marken `part = 'Sn'` und die laufende/wartende Akkord-Zeile (`R.row` / `R.rowPend`) als „benutzt“ → verweigert, Knopf im Szenen-Blatt fehlt. Zusätzlich: `R.lastScene` hinter der letzten Szene wird gelöscht. |

Haken neu (alle mit „XLB“ im Kommentar, an Zeilennummer + Text gebunden, bau.py Abschnitt „Prüfung (XLB-P)“): 37263, 48069, 48071, 48087 (davor),
48088, 48091, 48092, 48101 (danach), 48104, 48107, 48111, 48115, 48162 (danach), 66972. Neue Block-Funktionen: `xlMtrN`, `xlMtrK`, `xlMtrRe`,
`xlMarkUsed`; Test-Zugang `SYNQUENZER.xl.mtr()`, `.remWhy()`. Kein anderer Paket-Block angefasst. Diff-Prüfung: 108 Zeilen ersetzt, 27 eingefügt
(außerhalb des Blocks), 0 gelöscht, 0 ohne Kennung.

Tests (alle nacheinander, nice -n 10; Last 2–7):
- `xlb-test.mjs` um **T6** ergänzt (14 Prüfungen): Pixel Spur 9/10 in Kästchen- und Glas-Ansicht; Messer live 9 Eingänge (A/B 4.78 = 9),
  über 8 Spuren 25 mit Pegel auf Spur 9 + Master, zurück 9; Video-Render normal 19 Werte je Fenster wie 4.78 (1,5 MB/min, gleich), groß 51 mit
  Pegel Spur 9 + Master; Szene entfernen mit Marke / wartender Akkord-Zeile verweigert, ohne erlaubt + ↶. Konsole jeweils ohne Fehler.
- Gegenprobe: dieselben T6-Prüfungen auf `index.vor-pruef.html` → 10 FEHLER (die Befunde sind damit bestätigt), auf der neuen Fassung 14/14.
- **xlb-test gesamt: 78 OK / 0 FEHLER** (64 alte + 14 neue; `mess/xlb-test-p.log`, `mess/voll/xlb-test.json`), darin Touch-Gesten
  hochkant 428×926 und quer 926×428.
- Regression `reg/lauf.sh … pruef mx2 mtx teil1 mix3`: mx2 34/34, teil1 61/61, mtx 91/92 und mix3 20/3 + Abbruch – Urteile Zeile für Zeile
  gleich wie vor der Prüfung (und wie 4.78). midi-ab 90/90 bitgleich. probe-render (Video-Ton Spur 11) OK. Bildvergleich normales Projekt
  428×926 / 926×428 / 320×568 byte-gleich zu 4.78.
- Pflicht: topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [], „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter je Wort wie Basis, keine
  neuen Emojis (nur das vorhandene ✕ im Schließen-Knopf).

Startzeit (3 Läufe je Seite, abwechselnd, Median „bereit“ / Skriptzeit; `mess/startzeit-pruef-*.json`, Last ≈ 2):
- 4.78 → XLB-P: 625 → 646 ms (Läufe 593/625/673 → 631/654/646), Skriptzeit 98 → 95 ms.
- XLB vor Prüfung → XLB-P: 600 → 589 ms, Skriptzeit 102 → 89 ms.
→ kein messbarer Unterschied; beim Start läuft vom neuen Code nichts (Messer-Prüfung erst im rAF, ein Vergleich je Bild).

Fotos für Xander (iPhone 12 Pro Max, deviceScaleFactor 2, nur Testdaten; `fotos-xlbp.mjs`): `fotos/xlbp-song-hochkant.png` (12 Spuren, alle
in Farbe), `fotos/xlbp-matrix-quer.png` (Szenen 9–10 + ＋ Szene), `fotos/xlbp-blatt-hochkant.png` ([SZ] gehalten → Szenen-Blatt). Die
älteren Fotos des Bauers liegen in `fotos-bauer/` (xlb-song-* zeigen noch den Farbfehler). Kurzbeschreibung: `KURZ.md`.

Offen nach der Prüfung: Punkte 1, 2, 4–12 oben bleiben (Punkt 3 erledigt). Wichtig für die Auslieferung: Punkt 10 – die neue sichtbare
Bedienung vorher im Funk mit den Fotos zeigen (CLAUDE.md Regel 3); das „generelle OK vom 16.11.“ steht nur im Auftrag.

