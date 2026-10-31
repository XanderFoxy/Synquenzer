# Helfer G3 + G8 — Vorlauf/Ausklang beim Einsingen · Lange Aufnahmen

Basis: `bau/werkzeug/vs-base-B.html` (App 4.23.0, Format 5). Datei: `bau/helfer/G3G8/index.html`. Die VERSION-Zeile ist **nicht**
geändert (setzt der Dirigent). Format bleibt 5 – nur additive Felder; ein Projekt ohne die neuen Felder lädt unverändert.
Spec: `spec/dirigent-spec-v3-nachtrag-5.md`, Abschnitte „G3“, „G3 ergänzt: Einstieg aus dem Loop, Auftakt“ (Nr. 5, G3-06) und „G8“.
Kein Supabase-Aufruf, kein alert/confirm/prompt, keine Marken-Namen.

## Was neu ist

### G3 — Vorlauf und Ausklang beim Einsingen
1. **Der Take behält bis 2 Takte Anlauf und 1 Takt Ausklang** (aus dem Ringpuffer; vorher 0,25 s davor, nichts danach). Klammer, Länge
   und Raster des Clips bleiben gleich. Hörbar ist davon nur, was wirklich gesungen wurde: Pegel über dem Grundrauschen (10 %-Wert
   + 10 dB, höchstens 24 dB unter dem Gesang, mindestens −50 dBFS), ohne Pause > ¾ Schlag (0,35 … 1 s) bis an den Clip-Rand.
   Das steht am Take: `take.pre = {in, sec}` und `take.post = {out, sec}` (additiv). Es gilt für jedes Stück, das genau an dieser
   Take-Stelle beginnt bzw. endet – ein gekürztes Stück (Song-Schnitt, Ersetzen) hat deshalb keinen Anlauf/Ausklang mehr.
   Der Ausklang wird einen Takt nach dem Clip-Ende gelesen; erst danach wird der Take gespeichert (der Clip klingt sofort).
2. **Szene:** die Schleife bleibt in der Klammer; der Anlauf klingt nur beim **Einstieg** des Clips (Start am Taktstrich – der
   Anlauf beginnt vorher; beim Start aus dem Stand mit Einzähler im Einzähler), nie bei Wiederholungen. Anlauf und erster Durchgang
   sind **ein** Stück (kein Schnitt am Taktstrich). Wird der Einstieg zurückgenommen (anderer Clip, Stopp), blendet der Anlauf aus.
3. **Song:** Anlauf vor dem Teil, Ausklang nach dem Teil (wenn der Clip dort mit einem vollen Durchgang endet), für Szenen-Clips in
   den Spuren und für die Song-Stimme (`song.vox`, Punch mit 🎤). Benachbarte Teile überlappen (beide klingen).
   Gezeichnet als **kleines Schwänzchen** (Keil in der Spurfarbe, ¼ der Zeilenhöhe) vor bzw. nach dem Teil.
   **Verschieben/Tauschen eines Teils** nimmt die Song-Stimme des Teils mit (vorher ging sie verloren), samt Anlauf/Ausklang.
4. Blenden 5 ms an allen Rändern (über die vorhandenen VS3-Blenden); Übergang Ausklang ↔ Ende des Durchgangs als 5-ms-Überblendung.
5. **Einstieg aus dem laufenden Loop (G3 Nr. 5):** der Clip beginnt am Takt des ersten Worts auf bzw. nach dem Taktstrich. Ein Einsatz
   in der zweiten Takthälfte (ab Schlag 2¾, gleiche ¼-Schlag-Toleranz wie FANG) ist Auftakt zum nächsten Takt; was davor gesungen
   wurde (≤ 2 Takte) ist Vorlauf. Gilt für **Stimme-FANG** und **● REC mit 🎤** (neuer Clip, Länge „auto“). Der MELODIE-Clip bekommt
   die Auftakt-Noten als `clip.pre = [{t < 0, d, n, v}]` (additiv); sie klingen wie der Audio-Vorlauf nur beim Einstieg und im Song
   vor dem Teil (Schwänzchen auf der MELODIE-Zeile).

### G8 — Lange Aufnahmen
1. **Song (● SONG mit 🎤) ohne Zeitgrenze:** während der Aufnahme läuft die Stimme in Stücken (PCM16, 1 MB = 524 288 Samples) aus dem
   Ringpuffer in den Audio-Store (alle 0,5 s nachgelesen; beim Lautsprecher-Weg auch die VS4-Referenz). Ist die Aufnahme länger als der
   Ringpuffer, besteht der Take aus diesen Stücken (gleiche Schlüssel `<take>:<k>` wie VS3) – der Anfang bleibt erhalten. Kürzere
   Aufnahmen gehen den bisherigen Weg (VS3), die mitgeschriebenen Stücke werden danach gelöscht. Bei einer Schleife zählt wie bisher
   die letzte Runde (der Strom beginnt mit jeder Runde neu). **Restzeit** (freier Speicher laut `navigator.storage.estimate()`, alle
   10 s; Arbeitsspeicher-Grenze 480 MB) erscheint nur, wenn < 2 min: Toast „🎤 noch m:ss Aufnahmezeit“ alle 10 s; bei 0 endet die
   Aufnahme mit „Speicher knapp – Aufnahme beendet“ (der Take bis dahin bleibt).
2. **Szene-Clips und FANG bis 64 Takte** (Noten und Gesang): Clip-Länge 1 … 64 (Normalisieren, Clip-Editor ×2/Länge/Ziehen,
   Länge ×2/÷2), ● REC „auto“ endet spätestens nach 64 Takten, **„Länge“ zusätzlich 16, 32 und 64** (Aufnahme-Blatt und Menü),
   FANG (Tasten) nimmt die Phrase bis 64 Takte (Rückblick 64 Takte, Notenpuffer 16 384), Stimme-FANG ebenso (Rückblick 64 Takte,
   Länge 1/2/4/…/64). Der **Ringpuffer** hält beim Einschalten des Mikrofons 64 Takte + 4 Takte beim aktuellen Tempo
   (120 … 300 s; 120 BPM → 140 s). Eine Szene mit langem Clip wird als Teil so lang wie ihr Clip (bis 64).

## Abnahme (Chromium 1243 headless, Mikro-Attrappe im selben AudioContext wie VS2/VS3; Skripte in `tests/`)

| ID | Ergebnis | Messung |
|---|---|---|
| G3-01 | ✓ | Auftakt (2 × 659 Hz) ½ Takt vor Takt 1, ● REC Länge 2: Take-Anlauf `pre.sec` 1,03 s, `in` 4,25 s (2 Takte + 0,25 s), Take 1 Takt länger als `out`; Klammer 2 Takte; MELODIE `pre` = 2 Noten (t −2 / −1). Einstieg am Taktstrich: 659 Hz vor dem Strich **−23,2 dB**, vor der Wiederholung **−78,2 dB**; genau ein Anlauf im Plan; Übergang Anlauf → Clip 2. Differenz 0,0023 (kein Knack); MELODIE spielt beim Einstieg 2 Auftakt-Noten (`g3-accept.mjs A`) |
| G3-02 | ✓ | Teil mit STIMME-Clip (Takt 10): Schwänzchen gezeichnet (18,5 px STIMME, 18 px MELODIE), Anlauf vor dem Teil −23,3 dB (davor Stille); Teil an den Anfang verschoben → Eintrag Takt 2, Schwänzchen mit, Anlauf −23,2 dB. Song-Stimme (Punch Takt 5–6, Anlauf 1,03 s): hörbar −23,2 dB, gezeichnet; Teil (Takt 5–8) ans Ende verschoben → Song-Stimme Takt 9 mit gleichem Take/`in`, Anlauf dort −23,2 dB, an der alten Stelle −200 dB (`B`) |
| G3-03 | ✓ | Teil A (392 Hz über das Clip-Ende, Ausklang 0,55 s) + Teil B (Anlauf 1,03 s) direkt dahinter: vor dem Strich A −20,6 dB und Anlauf B −24,5 dB, nach dem Strich Ausklang A −20,6 dB und B −24,6 dB, danach Ausklang aus (−66,7 dB); größte 2. Differenz über alle Ränder 0,0029 (Töne allein ≈ 0,003) (`C`) |
| G3-04 | ✓ | Projekt trägt Take `pre`/`post` und MELODIE `pre`; Undo nimmt Take samt Anlauf zurück; Redo deep-equal; Speichern → Neuladen deep-equal (`D`) |
| G3-05 | ✓ | Song-Ansicht P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428: Anlauf 18,5 px, Ausklang 9,9 px, Auftakt-Noten 18 px, alle im Bild, Seitengröße unverändert, kein waagrechtes Rollen; Bilder `tests/out/g3-*-song*.png` (`g3-lay.mjs`) |
| G3-06 | ✓ | Laufender 4-Takt-Loop, Auftakt ½ Takt vor Takt 5: **● REC** (ab Takt 4, Länge auto, Ende Takt 9) und **Stimme-FANG** → MELODIE und STIMME 4 Takte, beginnen bei Takt 5 (cstart 16, FANG start 4), erste Note A4 auf 0, Auftakt 2 × E5 als Vorlauf, Take-Anlauf 1,03 s; beim Einstieg −23,3 dB hörbar, im Song vor dem Teil −23,2 dB, Schwänzchen auf STIMME und MELODIE (`F`) |
| G8-01 | ✓ | Song-Aufnahme **5 min** (300 s, Ringpuffer 150 s) mit 🎤: Take aus 26 mitgeschriebenen Stücken, 303,5 s im Speicher, 31 Stichproben (Sek. 0 … 299) mit richtiger Tonhöhe, **300/300 Ton-Strecken ohne Loch** (kleinster 20-ms-Pegel −15,1 dB), keine lange Aufgabe > 50 ms, Take 2,1 s nach dem Ende fertig (`g8-accept.mjs A`, Ausgabe `tests/out/g8-A.out`). Stück-Weg erzwungen bei 24 s: gleich, Neuladen bitgleich (`S`) |
| G8-02 | ✓ | ● REC Länge **32** und **64** (240 BPM) mit Gesang: MELODIE 32/64 Takte (32/64 Noten, letzte im letzten Takt), STIMME 32,000/64,000 s; beide Clips ab Schlag 8; 2. Durchgang der STIMME phasengleich (0,00 ms), Ton des Takts im 2. Durchgang hörbar (−26 dB); Speichern → Laden deep-equal, danach starten beide zusammen (`B`) |
| G8-03 | ✓ | Tasten-FANG einer 24-Takt-Phrase → 32-Takt-Clip (48 Noten); Stimme-FANG 24 Takte → MELODIE und STIMME 32 Takte (`C`) |
| G8-04 | ✓ (Maß) | siehe unten |
| Restzeit | ✓ | Speicher-Schätzung vorgegeben (150 s): bei > 2 min keine Anzeige, darunter „🎤 noch 1:59 Aufnahmezeit“, bei 0 „Speicher knapp – Aufnahme beendet“, Take bis dahin gespeichert (`R`) |
| Länge 16/32/64 | ✓ | Aufnahme-Blatt in allen 6 Formaten: AUTO 1 2 4 8 16 32 64, nichts abgeschnitten, kein waagrechtes Rollen, Tipp auf 64 wirkt (Tastenhöhe siehe Befunde) (`g8-lay.mjs`) |

**G8-04 – Speicher/CPU, iPhone-Maß (Rechnung aus den Messungen, 48 kHz):** Audio-Store 96 kB/s (0,1 MB/s; Lautsprecher-Weg + Referenz + gesäuberte Fassung ≈ 0,29 MB/s) → 5 min ≈ 29 MB. Arbeitsspeicher während der Aufnahme: die Stücke (2 B/Sample) ≈ 0,1 MB/s (5 min: 25 × 1 MB gemessen bei 44,1 kHz); am Ende der Take als Float-Puffer 4 B/Sample (5 min ≈ 58 MB), die Stücke werden danach frei. Ringpuffer 4,67 B/Sample: 120 BPM → 140 s ≈ 31 MB (vorher 120 s ≈ 27 MB), höchstens 300 s ≈ 67 MB. CPU: Nachlesen alle 0,5 s (≈ 24 000 Samples, Zeitkarte je Sample) – im Test keine lange Aufgabe; der Float-Puffer wird am Ende in Scheiben ≤ 8 ms gebaut. Stimme-FANG / ● REC über 64 Takte: die Auswertung (Worker) braucht 5 s (64 s Audio, Chromium) – so lange bleibt der neue Take wie bisher stumm, danach setzt er phasengleich ein. Am iPhone nicht gemessen.

**Regression / Rauchtest:** siehe „Nachtest“.

## Abweichungen / Auslegung (begründet)
- **„Hörbar ist, was gesungen wurde“:** der Take hält immer bis 2 Takte / 1 Takt, *klingen* (und gezeichnet werden) nur der gesungene
  Anlauf / Ausklang, der ohne Pause an den Clip-Rand reicht. Sonst liefe vor jedem Einstieg 2 Takte Raumrauschen (bzw. beim Lautsprecher
  das Übersprechen) mit, und das „kleine Schwänzchen“ wäre immer 2 Takte lang.
- **Overdub und spätere Runden einer Song-Schleife haben keinen Anlauf** (davor liegt die vorige Runde, nicht ein Auftakt).
- **Ausklang nur im Song** (Spec Nr. 3). In der Szene klingt er nicht – siehe Fragen.
- **Auftakt-Regel (Nr. 5):** Einsatz ab der zweiten Takthälfte (Schlag 2¾ mit der ¼-Schlag-Toleranz von FANG) = Auftakt. Bei
  Stimme-FANG gilt sonst die Länge 1/2/4/…/64 wie bisher; würde die Zweierpotenz den Auftakt-Takt in den Clip holen, beginnt der Clip
  trotzdem am Takt des ersten Worts und ist so lang wie die Phrase (z. B. 3 Takte). Bei ● REC mit fester Länge bleibt der Anfang der
  Aufnahme (sonst würde der Clip kürzer als die gewählte Länge); Gesang vor dem Anfang ist trotzdem Vorlauf.
- **Teil verschieben/tauschen nimmt die Song-Stimme mit** (vorher: VS3-Lücke „Teil-Kopien nehmen song.vox nicht mit“) – nötig für
  „Verschieben eines Teils nimmt Anlauf/Ausklang mit“. Kopieren/Wiederholen eines Teils ist unverändert (siehe Fragen).
- **G8 Stück-Weg nur bei langen Aufnahmen:** solange der Ringpuffer den Anfang noch hält, bleibt der geprüfte VS3-Weg (identische
  Takes für alle bisherigen Tests); die mitgeschriebenen Stücke werden dann verworfen.
- **Ringpuffer** wächst mit dem Tempo (64 Takte + 4), höchstens 300 s (≈ 67 MB bei 48 kHz); bei sehr langsamem Tempo reicht ein
  64-Takte-FANG deshalb nicht ganz zurück (der Take beginnt dann später, wie bisher bei > 2 min).
- **Teile (P1…P8, „Ein Teil hat höchstens 16 Takte“) bleiben bei 16** – G8 nennt nur Szene-Clips und FANG. Eine Szene als Teil
  (`sceneChunk`) wird so lang wie ihr längster Clip (bis 64), sonst würde ein langer Clip im Song abgeschnitten.

## Fragen an Xander
1. **Ausklang in der Szene:** Soll der Ausklang auch klingen, wenn ein Clip in der Szene endet (Wechsel zu einem anderen Clip oder
   Stopp am Clip-Ende)? Gebaut ist er nur im Song (Spec Nr. 3).
2. **Auftakt-Grenze:** Ab der zweiten Takthälfte zählt ein erster Einsatz als Auftakt zum nächsten Takt. Passt das, oder soll schon
   ein Einsatz auf Schlag 2 bzw. erst auf Schlag 4 als Auftakt gelten?
3. **● REC mit fester Länge** (z. B. 4 Takte) und Auftakt *innerhalb* der Aufnahme: soll der Clip dann einen Takt später beginnen und
   die Aufnahme entsprechend einen Takt länger laufen? Heute bleibt der Anfang der Aufnahme.
4. **Teil kopieren / ×n wiederholen:** soll die Song-Stimme mitkommen (wie jetzt beim Verschieben)?
5. **Teile länger als 16 Takte** (eigene Teile P1…P8, FANG TEIL): auch bis 64?
6. **Restzeit-Anzeige:** jetzt als Toast „🎤 noch m:ss Aufnahmezeit“ alle 10 s (nur < 2 min). Lieber fest in der TAKT-Anzeige?
   Arbeitsspeicher-Grenze 480 MB (≈ 28 min bei 48 kHz) – passt das fürs iPhone?
7. **Erste Song-Aufnahme mit 🎤** (● SONG auf leerem Song) nimmt die Stimme weiterhin nicht auf (VS3-Lücke, G8 nennt sie nicht).
   Soll sie?

## Befunde (nicht geändert, schon in der Basis 4.23.0)
- Aufnahme-Blatt „Länge“/„Quantisieren“/„Einzähler“: die Segment-Tasten sind 32–40 px hoch (P1 40, P2 36, P3 34, quer 32;
  Breite 40–44). Gemessen auf `vs-base-B.html` genauso (`tests/g8-lay.mjs` gegen die Basis). Die drei neuen Tasten 16/32/64 haben
  dieselbe Größe; nichts abgeschnitten, kein waagrechtes Rollen.
- `v3-vs2-accept` A: die Vorbedingung „Stimme rechtzeitig geplant“ des Prüfskripts schwankt (−12 … +2,6 ms) – auf der Basis und hier,
  je nach Lauf; kein App-Verhalten.

## Für das Zusammenführen (geänderte Funktionen / Blöcke)
Neue Blöcke (am Stück, vor `function voicesInfo()`): **`/* G3 … */`** (Konstanten `G3_*`, `G3`, `g3*`-Funktionen, `tkExt().take`-Normalisierung, `G3_API`) und **`/* G8 … */`** (`G8_*`, `G8`, `g8*`, `G8_API`). Nach `Object.assign(SYNQUENZER, TK_API)` zwei Zeilen `G3_API`, `G8_API`.

Ein-Zeilen-Haken / geänderte Zeilen (alle mit `/* G3 */` bzw. `/* G8 */` markiert):
- `tick()` (nach `recTick`): `g3Tick`. `songTickInner` (nach `tkVoxTick`): `g3SongTick`. `svDraw` (nach `tkSvDraw`): `g3SvDraw`.
- `tkVoxTick`: Schleife `v0` → `g3VoxSeg`, `sb` mit `g3pb`. `tkCutAt`: Ausnahme `aud.g3e`.
- `tkMakeTake`: erste Zeile G8-Haken; Zeile `pre/F0/Fe/n` (2 Takte / 1 Takt); `fill`: `g3TakePre`, `store()` (mit `TK.pend.delete`) erst nach `g3TakePost`.
- `tkVoiceTake`: `G3.noPre` bei Overdub; Clip-Länge 64. `tkSongCommit`: `G3.noPre` bei späterer Runde. `tkSongBegin`: `g8Begin`. `tkSongWrap`: `g8Wrap`.
- `tkNormSeg` (`at` bis 256), `tkNormVox` (`len` bis `SONG_MAX_BARS`), `TK_API.tkInject` (Länge 64).
- `normClip` (Länge 64, `pre`), `cleanClip` (`pre`), `songWrite` (`g3VoxWrite`), `markAction` move/swap (`vox` im Chunk), `sceneChunk` (64).
- `vsFangDone` (Auftakt-Regel, 64, `g3`), `vsPhrase` (256), `vsFang` (`E − 260`), `vsRecBegin` (`g3fix`), `vsRecEnd` (Auswertung 2 Takte früher), `vsRecDone` (`rs`), `vsApply` (`g3ApplyPre`).
- `recTick` (auto bis 256 Schläge), `recClose` (64), `capture()` (`maxBars: 64`), Notenpuffer `CAP.buf` 16 384.
- Clip-Editor: `duplicate`, `setLen`, `lenDrag` (64); Länge ×2/÷2 (64).
- `recLength`: Normalisieren der Einstellungen, `setRecOptions`, `popRecOpts` (Segment), Menü „Aufnahme · Länge“: 16/32/64.
- `stRing` (Länge `g8RingSec`), Mikro-Start: Ringpuffer neu, wenn zu kurz.

**Überschneidung mit VS-L** (16-Takte-Takes, `recLength 16`): dieselben Zeilen in `tkVoiceTake`/`vsRecDone`/`vsFangDone` (16 → hier 64) und die
`recLength`-Listen (hier schon 16, 32, 64). Beim Zusammenführen die G8-Werte (64, Liste bis 64) nehmen.
