# VS4 · VS5a · VS5b – DSP-Kerne (eigenständig, getestet)

Parallel zu VS3 gebaut, damit der spätere Einbau von **Säubern** (VS4), **Marken & Scheiben** (VS5a) und **Dehnen** (VS5b) schnell geht. Die App selbst wurde nicht angefasst.
Die Module sind reine ES-Module ohne Abhängigkeiten und ohne DOM. Audio liegt überall als Float32Array vor. Puffer werden vorab angelegt, NaN- und Denormal-Schutz ist eingebaut, und die Ergebnisse sind deterministisch.

Tests laufen in Node 22 und brauchen keinen Browser: `node run-tests.mjs`. Das dauert etwa 2 Minuten und läuft komplett im Vordergrund. Das letzte Protokoll steht in `test-results.txt`. Ergebnis: **112 Prüfungen, alle grün** (Stand VS5b-fix 27.10.).

## API

### `clean.mjs` – VS4 Säubern
- `clean(mic, ref, sr, {amount, way, delay, noiseRange, tail, passes, relearn, learnSec, info})` → Float32Array. Das Ergebnis ist gleich lang wie der Eingang und zeitgleich zu ihm.
  - `amount` (SÄUBERN 0…1): Bei **0** kommt eine bitgleiche Kopie zurück. Ab 20 % ist das Signal voll nass. Der Boden liegt bei −6 … −24 dB, die Nachfilter-Stärke bei 0 … 1,5.
  - `way: 'notes'` ist der Noten-Weg. Er nutzt nur den Echo-Abzug, `info.way` lautet dann „1E“ (N7V-25). `'hear'` ist der Hör-Weg mit Echo-Abzug, Nachfilter, Wiener-Entrauschen und HP 80 Hz; offline ist der HP phasenfrei.
  - Die Kette: Laufzeit per GCC-PHAT bestimmen. Dann folgen zwei Läufe:
    - **1. Lauf** über die ersten 20 s: MDF lernt den Echo-Weg, dazu entstehen das Rauschprofil (leiseste 10 % der Rahmen oder `noiseRange`) und das Rest-Echo-Profil je Frequenz (Rahmen mit dem kleinsten Fehler/Echo-Verhältnis, also ohne Stimme).
    - **2. Lauf** mit warmem Filter und langsamem Nachlernen (`relearn` 0,1). Dadurch lernt das Filter die Stimme nicht mit, auch wenn sie in der Tonart der Begleitung singt.
  - `info` liefert `{delay, echoDb, hint:'Kopfhörer oder leiser', leak, ms, pk, aec, learn}`.
  - VS4-fix: Rauschprofil je Frequenz nach oben begrenzt (Legato/gehaltene Töne sind kein Rauschen); Echo-Abzug nur bei klarem
    Echo-Weg (`o.minPk` 15, sonst `aec:'aus'`); `o.from` = Ergebnis erst ab hier, zweiter Lern-Versuch nur über die letzten 8 s.
- `new Cleaner(sr, o)` ist der Block-Verarbeiter für Worker oder Worklet. Er nimmt beliebige Blocklängen und legt in `process()` keine Speicher an.
  - Die Ausgabe ist um `.latency` verzögert (1023 Samples bei 48 kHz).
  - Weitere Methoden: `setAmount(a)` (20-ms-Rampe), `setDelay`, `setWay`, `setNoisePsd`, `setResidualProfile`, `exportState`/`importState` (Filter mitnehmen), `resetStreams`.
- Außerdem: `estimateDelay(mic, ref, sr)`, `nlms(mic, ref, taps, mu)` (Zeitbereich, nur Vergleich) und `srcText()`.

### `marks.mjs` – VS5a Marken & Scheiben
- `detectMarks(x, sr)` → `[{t, i, conf, src:'onset'|'start'|'pitch', word, voiced}]`.
  - Erkennung: SuperFlux (Vibrato-fest) plus Pegelanstieg.
  - Aktivität mit Hysterese: Boden (3-%-Perzentil) + 10 dB an, + 6 dB aus. Mindestabstand 70 ms.
  - Feinlage über die 1-ms-Hüllkurve (Pegel, sonst Höhen). VS5a-fix: bei harten Anschlägen (50 % der Spitze in ≤ 3 ms) danach `fine()` – Marke auf dem ersten Sample des Anstiegs (vorher 2–3 ms davor).
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
  - ~~Der letzte Rahmen ist auf die nächste Marke ausgerichtet.~~ VS5b-Einbau: `endAlign` ist jetzt standardmäßig **aus**; die letzten Rahmen werden auch dann gesucht, wenn das Suchfenster hinter dem Abschnittsende läge (im letzten erlaubten Stück, ±24 ms). Einbruch an Nähten 110/196/330 Hz: 0,58/0,92/0,35 dB statt 1,94/3,24/0,19 dB; Klickfolge auf Ton mit Achtel-Abschnitten: 2,1 statt 5,4 dB.
  - VS5b-Einbau: Bei stiller Vorlage (digitale Stille) bleibt die Suche an der natürlichen Stelle (vorher holte der erste Treffer Ausklang-Reste in die Stille; QA-Satz „b“: M-KLICK 51,5 → 21,4 dB, Original 32,8 dB).
  - VS5b-Einbau: Die Lücke hinter einem nur verschobenen Abschnitt füllt eine Schleife wie bei `renderSlices` (vorher Spiegelung mit Ausblendung: 47,6 dB Loch, jetzt 0,03 dB).
  - ~~Die Naht zur nächsten Marke ist eine 5-ms-Blende, die korrelationsabhängig gleichleistungs- oder gleichspannungsgemäß überblendet.~~
  - VS5b-fix (`VERSION 'vs5b-stretch-5'`): Die Naht zur nächsten Marke ist eine 5-ms-Kosinus-Blende. Sie darf bis 12 ms vor der Marke liegen (dahinter läuft die Quelle unverändert in die Marke); gewählt wird die Lage mit dem lautesten leisesten 5-ms-Fenster. Fehlende Energie gleicht eine Glocke (G ≤ 4) aus, ohne steilere Flanken als der Eingang. Die festen 24 ms der vorigen Scheibe bleiben unberührt. Vorher: bis −7,8 dB Loch im 5-ms-Fenster (M-EINBRUCH) bei 44,1 kHz. Angeschnittene WSOLA-Suchfenster werden auf volle Breite 2Δ gebracht.
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
| M-EINBRUCH (5-ms-Fenster, 44,1 kHz, Klicks auf Ton 202/180 Hz, 70/100 %; VS5b-fix) | ≤ 3 dB | −0,78 … −1,08 dB (Original −0,20 / −1,07; alter Kern −5,7 … −6,5) |
| Faktor 2,5 / 0,35 (N7V-29) | nur verschoben + Warnung | ja, 2 Warnungen, Inhalt bitgleich |
| Identität, Determinismus, Cache-Schlüssel, `srcText()` | – | alles bitgleich bzw. stabil |

**Rechenzeit für 60 s bei 48 kHz:**
- Säubern offline (zwei Läufe): 3,7–3,8 s, das sind 6,2–6,4 % Echtzeit.
- Säubern als Block-Verarbeiter in einem Lauf: 2,5 s (4,2 %).
- Marken: 1,26 s (2,1 %).
- Quantisieren und Scheiben: 4 ms.
- Dehnen: 0,54 s (0,9 %; VS5b-fix mit Lage-Suche der Naht).

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
  - Bei streng periodischem Dauerton ist an der Naht vor einer Marke ein Phasensprung unvermeidbar, weil die Marke fest und bitgleich bleibt (seit VS5b-fix durch Lage-Suche und Energie-Ausgleich ohne Pegelloch: M-EINBRUCH ≤ −1,1 dB). Gemessen: ≤ 3,2 dB Einbruch für weniger als 10 ms (seit dem VS5b-Einbau ohne feste Endausrichtung: ≤ 0,92 dB; mit Achtel-Abschnitten 2,1 dB). Bei Gesang verdeckt der folgende Einsatz das.
  - Abschnitte kürzer als 60 ms werden nur verschoben.
- Scheiben (geändert beim Einbau von VS5a, 26.10.): Die Lücke füllt eine Schleife aus dem Ende der vorigen Scheibe (Länge = Periode mit der besten Korrelation, 5–40 ms); die Naht je Runde blendet ≤ 2 ms von der Fortsetzung in den Schleifenanfang, der Übergang zum Einsatz ist korrelationsabhängig (gleichspannungs- bzw. gleichleistungsgemäß). Vorher: Spiegelung mit Kosinus-Ausblendung → bei gehaltenem Gesang bis −17 dB Loch und ein Knick an jeder Umkehr (M-KLICK +35 dB bei reinem Ton). Danach: gesungene Noten kein zusätzliches Loch (≤ 0,3 dB gegenüber dem Original); bei streng periodischem Dauerton bleibt an einer Lücke ein Phasensprung (gemessen −4,4 dB / M-KLICK 6,8 dB an 1 von 12 Schnitten), weil der Anschlag bitgleich an fester Stelle bleibt – wie beim Dehnen. `node run-tests.mjs`: alle grün.
- Marken-Feinlage: harte Klicks liegen systematisch 2,0 ms vor dem echten Einsatz (Hüllkurve mit ±3-ms-Fenster); quantisiert landen Klick-Einsätze damit 2,0 ms nach der Rasterlinie (N7S-51: ±2 ms – an der Grenze).
- App-Einbau: VS5a (Marken-Editor, Scheiben, Audio folgt) und VS5b (Dehnen, Songtext, Render-Cache) sind in `vs-br-VS5/index.html` gebaut. Die P1-Option aus VS5b (nachladbarer höherwertiger Stretcher) fehlt.
