# VS4 · VS5a · VS5b – DSP-Kerne (eigenständig, getestet)

Parallel zu VS3 gebaut, damit der spätere Einbau von **Säubern** (VS4), **Marken & Scheiben** (VS5a) und **Dehnen** (VS5b) schnell geht. Die App selbst wurde nicht angefasst.
Die Module sind reine ES-Module ohne Abhängigkeiten und ohne DOM. Audio liegt überall als Float32Array vor. Puffer werden vorab angelegt, NaN- und Denormal-Schutz ist eingebaut, und die Ergebnisse sind deterministisch.

Tests laufen in Node 22 und brauchen keinen Browser: `node run-tests.mjs`. Das dauert etwa 2 Minuten und läuft komplett im Vordergrund. Das letzte Protokoll steht in `test-results.txt`. Ergebnis: **101 Prüfungen, alle grün.**

## API

### `clean.mjs` – VS4 Säubern
- `clean(mic, ref, sr, {amount, way, delay, noiseRange, tail, passes, relearn, learnSec, info})` → Float32Array. Das Ergebnis ist gleich lang wie der Eingang und zeitgleich zu ihm.
  - `amount` (SÄUBERN 0…1): Bei **0** kommt eine bitgleiche Kopie zurück. Ab 20 % ist das Signal voll nass. Der Boden liegt bei −6 … −24 dB, die Nachfilter-Stärke bei 0 … 1,5.
  - `way: 'notes'` ist der Noten-Weg. Er nutzt nur den Echo-Abzug, `info.way` lautet dann „1E“ (N7V-25). `'hear'` ist der Hör-Weg mit Echo-Abzug, Nachfilter, Wiener-Entrauschen und HP 80 Hz; offline ist der HP phasenfrei.
  - Die Kette: Laufzeit per GCC-PHAT bestimmen. Dann folgen zwei Läufe:
    - **1. Lauf** über die ersten 20 s: MDF lernt den Echo-Weg, dazu entstehen das Rauschprofil (leiseste 10 % der Rahmen oder `noiseRange`) und das Rest-Echo-Profil je Frequenz (Rahmen mit dem kleinsten Fehler/Echo-Verhältnis, also ohne Stimme).
    - **2. Lauf** mit warmem Filter und langsamem Nachlernen (`relearn` 0,1). Dadurch lernt das Filter die Stimme nicht mit, auch wenn sie in der Tonart der Begleitung singt.
  - `info` liefert `{delay, echoDb, hint:'Kopfhörer oder leiser', leak, ms}`.
- `new Cleaner(sr, o)` ist der Block-Verarbeiter für Worker oder Worklet. Er nimmt beliebige Blocklängen und legt in `process()` keine Speicher an.
  - Die Ausgabe ist um `.latency` verzögert (1023 Samples bei 48 kHz).
  - Weitere Methoden: `setAmount(a)` (20-ms-Rampe), `setDelay`, `setWay`, `setNoisePsd`, `setResidualProfile`, `exportState`/`importState` (Filter mitnehmen), `resetStreams`.
- Außerdem: `estimateDelay(mic, ref, sr)`, `nlms(mic, ref, taps, mu)` (Zeitbereich, nur Vergleich) und `srcText()`.

### `marks.mjs` – VS5a Marken & Scheiben
- `detectMarks(x, sr)` → `[{t, i, conf, src:'onset'|'start'|'pitch', word, voiced}]`.
  - Erkennung: SuperFlux (Vibrato-fest) plus Pegelanstieg.
  - Aktivität mit Hysterese: Boden (3-%-Perzentil) + 10 dB an, + 6 dB aus. Mindestabstand 70 ms.
  - Feinlage über die 1-ms-Hüllkurve (Pegel, sonst Höhen).
  - Stimmhaftigkeit per YIN auf etwa 12 kHz. Bei Bindung ohne Pegelanstieg setzt ein Tonwechsel ≥ 80 Cent eine Marke.
  - `word` bedeutet: davor liegen ≥ 120 ms Ruhe.
- `quantizeMarks(times, {bpm, t0, grid, strength, swing, catch, minGap, detectGrid})` → `{times, grid, swing, moved}`.
  - Die Logik ist dieselbe wie bei `KeyDetect.quantize`/`quantizeNoteSet` der App: Ziel = runden auf das Raster, ungerade Schritte mit Swing, `t += (Ziel − t)·Stärke`.
  - Raster: 1/4, 1/8, 1/16, 1/8T, 1/16T, 1/32 oder `auto`.
  - Fangfenster ±40 % (C.5 Nr. 4). Die Reihenfolge bleibt immer erhalten.
  - `detectGrid` ist ein Nachbau von `KeyDetect.detectGrid`. In der App wird stattdessen `KeyDetect.detectGrid` übergeben.
- Zeitkarte: `makeWarp(src, dst, lenSrc, lenDst)` erzeugt `{v:1, src, dst}` in Sekunden, streng steigend. Dazu kommen `warpTime`, `warpInverse`, `warpIsIdentity`, `warpToJSON`, `warpFromJSON`.
- Modus „Scheiben“:
  - `sliceCuts(x, sr, onsets)` schneidet 3 ms vor jedem Einsatz am Nulldurchgang (±2 ms).
  - `renderSlices(x, sr, onsets, targets)` verschiebt nur. Eine Lücke füllt der Ausklang der vorigen Scheibe. Der Übergang dauert 5 ms, ist gleichleistungsgemäß und endet am Einsatz, deshalb bleiben Anschläge bitgleich.
- `assignLyrics(text, nMarks)` → `{labels, extra}` (Songtext „Lie-be ist …“, N7V-30). `srcText()`.

### `stretch.mjs` – VS5b Dehnen
- `stretch(x, sr, warp, {lock, xfade, win, search, minRatio, maxRatio, endAlign})` → `{y, warnings, segs}`.
  - Die ersten 20 ms nach jeder Marke bleiben bitgleich. Der Rest wird per WSOLA gedehnt: Fenster 40 ms, Suche ±12 ms (grob auf etwa 12 kHz, fein auf voller Rate).
  - Der letzte Rahmen ist auf die nächste Marke ausgerichtet.
  - Die Naht zur nächsten Marke ist eine 5-ms-Blende, die korrelationsabhängig gleichleistungs- oder gleichspannungsgemäß überblendet.
  - Faktor außerhalb 0,5–2,0: Der Abschnitt wird nur verschoben, dazu kommt eine Warnung.
  - Bei unveränderter Karte ist die Ausgabe bitgleich.
- `cacheKey(warp, o, takeId)` liefert einen FNV-1a-Schlüssel für den Render-Cache. `srcText()`.

## Testergebnisse (Node 22, Xeon-VM, synthetische Signale, nie am iPhone)

Testsignale: Gesang mit Formanten (a/e/i/o/u), Vibrato 5,5 Hz ±25 Cent, Konsonant-Stößen, Bindungen und Phrasenpausen. Playback aus Säge-Akkorden, Bass-Schlag und Klick über Lautsprecher-HP 250 Hz. Dazu ein Raum mit Laufzeit 40/80/120 ms und RT60 0,3 s sowie Hintergrundrauschen.

| Prüfung | Soll | Ist |
|---|---|---|
| SÄUBERN 0 % (N7V-24) | bitgleich | bitgleich (auch NaN/negativ) |
| Laufzeit-Schätzung 40/80/120 ms | ±1 ms | exakt |
| Echo-Minderung in Pausen, 0/+6 dB Übersprechen | ≥ 15 dB | Noten-Weg 19,4–21,1 dB; Hör-Weg 21,3–24,5 dB |
| Echo-Minderung beim Singen (Rest = alles außer Stimme, Noten-Weg) | ≥ 15 dB | 15,2–20,7 dB |
| Stimme im Pegel (Projektion) | < 1 dB | Noten-Weg −0,05 … −0,17 dB; Hör-Weg −0,21 … −0,36 dB |
| +6 dB mit Sättigung (N7V-22) | SDR ≥ 10 dB | 13,4 dB |
| 0 dB mit Einmessen (N7V-21) | SDR ≥ 15 dB | 24,9 dB |
| Rauschboden, SÄUBERN 25/50/100 % | ≥ 10 dB bei 100 % | 10,5 / 15,0 / 23,6 dB; Stimme −0,04 dB |
| Kein Gate (N7V-23) | SDR ≥ 20 dB, keine 50-ms-Lücke < −40 dB | 39,7 dB, 0 ms |
| Block: Latenz, Rampe, nach Rampe 0 %, NaN, Denormal, Allokation | – | exakt 1023; klickfrei; bitgleich; endlich; nicht langsamer; 3 KB Heap über 1500 Blöcke (GC-Rauschen) |
| Marken, SNR 35 / 20 dB (4 Lieder, 177 Silben inkl. 9 Bindungen) | ≥ 90 % in ±30 ms, 0 in Stille | 100 % / 100 %; Median 0,9 / 3,0 ms; 0 Zusatz-Marken; 0 in Stille |
| Nur Rauschen, Stille, 50-Hz-Brumm | 0 Marken | 0 |
| Quantisieren 100 % / 50 % (N7V-26) | ±1 Sample / halber Weg | 0 Samples / 0 Samples; Reihenfolge, Fangfenster, Kollision, 1/8T, Swing, Auto (1/8, 1/8T), t0 ok |
| Scheiben, Klickfolge (N7V-27) | Spitze ±0,1 dB, Anschläge bitgleich | 0,0000 dB, 42/42 bitgleich, Schnitt 3 ms ±2 ms 42/42 |
| Dehnen, Klickfolge mit Ton (N7V-28), 70 % und 100 % | 20 ms bitgleich, Länge je Scheibe ±1 ms | 48/48; ≤ 2 Samples; Gesamtlänge exakt; Verhältnis-Fehler 0,01 % |
| Einsätze im Ergebnis (unabhängig erkannt) | ±5 ms am Ziel | ≤ 3,7 ms |
| Tonhöhe bei Faktor 0,55 … 1,9 (110/196/330 Hz) | < 5 Cent | 0,65 / 0,58 / 0,09 Cent |
| Klicks (max. Sprung Ausgabe/Eingang) | ≤ Eingang | 1,00003 (Rechentoleranz; Prüfgrenze +0,01 dB) |
| Faktor 2,5 / 0,35 (N7V-29) | nur verschoben + Warnung | ja, 2 Warnungen, Inhalt bitgleich |
| Identität, Determinismus, Cache-Schlüssel, `srcText()` | – | alles bitgleich bzw. stabil |

**Rechenzeit für 60 s bei 48 kHz:**
- Säubern offline (zwei Läufe): 3,7–3,8 s, das sind 6,2–6,4 % Echtzeit.
- Säubern als Block-Verarbeiter in einem Lauf: 2,5 s (4,2 %).
- Marken: 1,26 s (2,1 %).
- Quantisieren und Scheiben: 4 ms.
- Dehnen: 0,53 s (0,9 %).

## Einbau in die App

1. Der Quelltext kommt ohne Build-Werkzeug hinein: `srcText()` liefert `(function factory(){…})()`. Das lässt sich als `const VsClean = …;` in einen `<script>`-Block der Einzeldatei kopieren oder per Blob in den Worker geben: `new Worker(URL.createObjectURL(new Blob(['const VsClean=' + text + ';' + workerCode])))`.
2. Säubern läuft im Worker (C.2 Nr. 5, keine Netzaufrufe):
   - Eingang ist der Roh-Take, die Referenz ist das aufgenommene eigene Playback (`AU.M.ceil`).
   - Der Aufruf ist `VsClean.clean(take, ref, sr, {amount, info})`. Das Ergebnis bei SÄUBERN 0 % ist der Roh-Take selbst, A/B ist damit trivial.
   - Mit `info.hint` zeigt die App den Hinweis „Kopfhörer oder leiser“.
   - Der Noten-Weg (VS2) bekommt `{way: 'notes'}`.
   - Für live gibt es `Cleaner` mit festen Blöcken; die Latenz steht in `.latency`.
3. Marken entstehen beim Take-Ende im Worker mit `detectMarks`. Die Marken des Marken-Editors (N2-VS5a-01) sind reine Daten `{t, conf, word}`.
4. Das Quantisieren nutzt `quantizeMarks(times, {bpm: S.bpm, t0: takeStartSec, grid, strength, swing, detectGrid: KeyDetect.detectGrid})`. Daraus entsteht `makeWarp(...)`, das als `take.warp = warpToJSON(w)` ins Projekt geht (Format 4, additiv).
5. Für das Rendern im Worker gilt:
   - Scheiben: `renderSlices`.
   - Dehnen: `stretch`. Der Cache läuft über `cacheKey(warp, opts, take.id)`.
   - Stärke 0 % oder Undo ergibt eine Identitätskarte, also das bitgleiche Original.
6. **Größe:** Der rohe `srcText` ist 26 / 23 / 8 KB groß, ohne Kommentare und Einrückung 20,8 / 19,5 / 6,3 KB, gzip 6,9 / 6,8 / 2,3 KB. Das Budget von VS4 (+25 KB) ist knapp, deshalb beim Einbau Kommentare entfernen.

## Bekannte Grenzen und offene Punkte

- Alles ist nur synthetisch gemessen. Echte Stimmen, Räume und das iPhone fehlen noch; die CPU am iPhone ist ungemessen (N7V-15 sinngemäß).
- Echo-Abzug:
  - Er ist linear. Bei Sättigung (lautes Handy nah am Mikro) bleibt etwa SDR 13 dB.
  - Schnelle Wege-Änderungen während des Takes werden wegen des langsamen Nachlernens (0,1) nur träge verfolgt.
  - Die Laufzeit muss unter 1 s liegen (`maxDelay`).
- Das Rest-Echo-Profil braucht Rahmen ohne Stimme in den ersten 20 s; ohne solche Rahmen fällt es auf die Leck-Schätzung zurück.
- Marken:
  - Unter etwa 12 dB SNR entstehen viele Zusatz-Marken (gemessen: rund 100 auf 177 Silben).
  - Bindungen ohne Pegelanstieg werden über den Spektralfluss gefunden; sehr weiche Tonwechsel unter 80 Cent nicht.
  - Ein Take ohne jede ruhige Stelle (< 3 % Ruhe) hat keinen Bodenwert, dann kommen kaum Marken.
- Dehnen:
  - Bei streng periodischem Dauerton ist an der Naht vor einer Marke ein Phasensprung unvermeidbar, weil die Marke fest und bitgleich bleibt. Gemessen: ≤ 3,2 dB Einbruch für weniger als 10 ms. Bei Gesang verdeckt der folgende Einsatz das.
  - Abschnitte kürzer als 60 ms werden nur verschoben.
- Scheiben: Die Lücke wird mit dem gespiegelten Ende der vorigen Scheibe gefüllt, das ausgeblendet wird. Ein echter natürlicher Ausklang ist bei stark verschobenen langen Lücken nicht vorhanden.
- Noch nicht gebaut sind UI und App-Teile: Marken-Editor, A/B-Schalter, Undo, „Audio folgt“, Songtext-Anzeige und Worker-Verdrahtung. Die P1-Option aus VS5b (nachladbarer höherwertiger Stretcher) fehlt ebenfalls.
