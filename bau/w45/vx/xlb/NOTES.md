# NOTES XLB – Spuren und Szenen bis 24 / 32 je Projekt (Fassung B vorbereiten)

Basis: `rel-4780/index.html` (Synquenzer 4.78.0, md5 68e92c0367cd63eda5a9da08ead8990d) → `basis.html` (unverändert).
Ergebnis: `index.html` (VERSION bleibt '4.78.0'), gebaut mit `python3 bau.py` aus basis.html + `src/block.js` + `src/block.css` + einzeiligen Haken.
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
Außerhalb nur einzeilige Haken mit „XLB“ im Kommentar (bau.py: 96 Zeilen ersetzt, 7 davor, 19 danach eingefügt; jede an Zeilennummer +
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
  50614, 51975, 52853, 71471–71500 (G10J), 95453; `sr.ev` (34132/34254), `midiArrs` (54875); Pegel-Messer `MTR_IN = MAX_T + 1` = 25
  Eingänge, Master = Eingang 24 (48066–48173, Video 75440–78302 nutzen dieselbe Zahl).

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

@@REG@@

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

Startzeit (Seite laden bis bereit, je 3 Läufe, Median): @@START@@

Grenzen (für Fassung B):
- Höchstens 24 Spuren / 32 Szenen je Projekt (Daten), 4 bzw. 8 sichtbare Spalten, 8 Szenen-Bänke à 4.
- Ab 16 gleichzeitig spielenden Spuren erscheint der vorhandene „Viel Last“-Hinweis; der CPU-Begrenzer der App regelt wie bisher.
- Leere Zusatzspuren kosten nichts (keine Kette, keine Engine), bis sie gewählt werden oder einen Ton bekommen.

## Offen

1. Farben der Spuren 9–24 wiederholen die Farben 1–8 (`--t9 = --t1` …). Eigene Farben = sichtbare Änderung → Vorschlag im Funk.
2. Live-Grenze 16 oder 24 Spuren erst nach dem iPhone-Lauf (messung.html) festlegen; ggf. Hinweis/Begrenzung im ＋ Spur.
3. Pegel-Messer hat jetzt immer 25 Eingänge (vorher 9): im Video-Rendering ≈ +2,9 MB je Minute Messwerte; lässt sich auf NT()+1
   kürzen, wenn es stört.
4. „Szene duplizieren“ ohne freie Szene macht das Projekt nicht größer (wie 4.78: keine freie Szene → aus). ＋ Szene zuerst.
5. Tasten 1–4 (Bluetooth-Tastatur) starten weiter Szene 1–4 wie in 4.78; Szenen 5–32 nur per Tipp (nicht geändert).
6. MIX-A / MX1 / MX3 mit 24 Eingängen in WebKit (iPhone) nicht geprüft (Chromium ok).
7. Stems/ZIP mit 24 Spuren: Größe nicht gemessen (je Spur eine WAV wie bisher).
8. MIDI: Spuren ab 15 teilen sich Kanal 16 (vorhandenes midiCh); jede Spur bleibt eine eigene MIDI-Spur.
9. XLA-Import an maxTracks()/maxScenes() anschließen (XLA-Block nicht angefasst).
