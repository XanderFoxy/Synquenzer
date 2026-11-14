# IMP1 – NOTIZEN

## Schritt 1/3 (Lesen + Erkennung) – Stand
- Block `IMP1-BEGIN … IMP1-END` direkt nach `/* ===== KF2-END ===== */` (keine Einhänge-Zeilen nötig, nichts sichtbar).
- `imp1Core()` (ohne DOM; Quelle auch als core.js für Node) läuft als Worker (`imp1Worker`, Blob → data:), Hauptfaden-Fallback.
  `imp1Analyse(AudioBuffer|Float32Array, sr, {bpm, gesang}, prog)`; Test: `window.__imp1.analyse(...)`, `.last()`, `.core()`.
- Ergebnis: `{ok, dauer, bpm (Viertel wie S.bpm), bpmRoh, puls, ts ('2/4','3/4','4/4','6/8','12/8'), alt [½×, 2×], quelle 'mix'|'gesang', frage,
  stabil (DP-Schläge im Raster ±50 ms), t1 (erste „1“, s), takt (s), schlag (s), start, ende, takte [s], teile [{name, a, b (Takt ab der 1), t0, t1, grp, e}], diag}`.

## Verfahren
- Herunterteilen auf ~11–12 kHz (Dreieck-Filter), STFT 512 (10 ms Raster): Spektralfluss je Band (30–120–300–800–2000–5000 Hz), Bänder
  gleich gewichtet; Bass-Hüllkurve (Bänder 0–1); Chroma aus 4096er-Fenster alle 80 ms.
- Tempo: Autokorrelation + Kamm (1/k-Gewichte bis 4×) × Vorliebe log-Gauß um 110 BPM (σ 0,9 Oktaven), 60–180; ½×: wenn auf dem halben Raster
  die Mitten < 30 % → halb; 2×: wenn die Mitten > 85 % → doppelt. Fein: Raster über den ganzen Song (±2,5 % in 0,05, dann ±0,06 in 0,005 BPM).
  Auf ganze Zahl, wenn < 0,2 entfernt.
- Schlag-Verfolgung: dynamische Programmierung (Ellis, α 100) → `stabil`; ausgegeben wird das konstante Raster (die App braucht festes Tempo).
- Taktart: Unterteilung ⅓/⅔ gegen ½ (h3 > 1,5·h2 und > 6 % der Schlag-Energie → zusammengesetzt); Gruppe 3 gegen 4 über die Wiederholung
  der Schlag-Merkmale (Chroma, Bass, Einsatz; Abstand 3+9 gegen 4+8); Dreier mit Akzent in der Takt-Mitte → 6/8 (bzw. 12/8);
  2 gegen 4 über Akkordwechsel (1-Schlag-Fenster) auch zur Takt-Mitte; 6/8 gegen 12/8: bei punktiertem Puls ≥ 70 nur mit deutlichen Wechseln 12/8.
- Erste „1“: Phase mit größtem (Bass-Einsatz + 1,5·Akkordwechsel + 0,5·Einsatz); erster solcher Schlag ab Musik-Anfang (−40 dB) − ½ Schlag.
- Teile: 4-Takt-Blöcke ab der „1“, Takt-Ähnlichkeit = 0,65·cos(Chroma zentriert) + 0,35·(1 − Klangfarben-Abstand); Block-Ähnlichkeit über die
  Diagonale; Gruppen ab 0,55; Läufe gleicher Blöcke = Teile; folgt Y immer auf X (und nur dort) → ein Teil; Hall-Ausklang (−30 dB unter dem 95-%-Pegel)
  zählt nicht als Takt; Rest < 2 Takte hängt am Teil davor. Namen: wiederholt + laut = Refrain n, zweite wiederholte Gruppe = Strophe n, weitere = Teil A…;
  einmalig vorn Intro, hinten Outro, in der Mitte Bridge.
- Gesang allein (Bass-Anteil < 3 %, oder `gesang: true`): Silben-Einsätze (Spitzen) → Raster-Treue |Σ w·e^(2πi t/P)| für Viertel + ½·Achtel,
  60–180 in 0,1, fein ±0,3 in 0,01; Phase aus dem Winkel; `quelle 'gesang'`, `frage: true`, Vorschlag `alt` (z. B. 92 → 46 / 184).

## Ergebnisse (13:0x)
- Node synthetisch (synth-test.mjs, Drums/Bass/Akkorde, 8 Teile Intro-S-R-S-R-B-R-Outro): 92 4/4, 120 3/4, 120 6/8, 128 4/4, 75 4/4,
  100 12/8, 110 2/4 → Tempo exakt (Roh ±0,02), Taktart richtig, erste 1 ±0,01 Takt, alle 7 Grenzen exakt (0 Takte Abweichung), Namen richtig;
  Gesang 92 / 120 → Tempo richtig, quelle gesang, frage, alt [46,184] / [60,240]. 9/9.
- App-Render (app-test.mjs, die App rendert eigene Songs mit vvRenderAudio, Analyse im Worker): 92 4/4 (148,7 s Audio, Render 27 s,
  Analyse 0,95 s), 120 3/4 (0,8 s), 120 6/8 (0,5–0,7 s): Tempo 92/120/120 (Roh 91,995/119,989/119,992), Taktart richtig, erste 1 bei 0,
  alle 7 Grenzen exakt, Namen Intro/Strophe 1/Refrain 1/Strophe 2/Refrain 2/Bridge/Refrain 3/Outro. Nur Melodie (Silben-Ersatz) 96 →
  96, quelle gesang, frage, alt [48,192]. ALLE OK.
- Tempo bekannt (bpm: 92 / 120) und Gesang erzwungen auf App-Render: gleiches Ergebnis.
- Gefundene/behobene Fehler beim App-Render: (1) Schlag knapp vor 0 fehlte im Raster → erste 1 einen Takt zu spät; (2) leise Hats in 6/8
  → Unterteilung nicht erkannt (Schwelle 25 % → 6 % der Schlag-Energie); (3) Hall-Ausklang als eigener Teil („Bridge 2“); (4) Phase der
  Takt-Akzente bezog sich auf die alte Raster-Phase (12/8 kippte zu 3/4).

## Offen / Grenzen
- Nur festes Tempo (Live-Aufnahmen mit Schwankung: `stabil` < 0,5 → `frage`); Teile nur auf dem 4-Takt-Raster ab der „1“ (Teile mit 2 Takten Versatz
  werden um 2 Takte verschoben gemeldet); 5/4, 7/8 nicht erkannt (nicht verlangt). Echte MP3s (Gesang mit Hall, Live-Schlagzeug) noch nicht geprüft.
- Schritt 2: ein Import-Weg (Audio + MIDI inkl. Tempo/Taktart aus der MIDI-Datei), Import-Blatt (Wellenform, Raster, Teile, BPM ±/Tippen/½×/2×,
  Taktart, „1“ ziehen), Ziele (Szenen / eine Spur / Gesang), Projekt-Tempo bzw. Dehnen. Schritt 3: Loop-Klammern, Tests, Fotos.
- Test-Dateien: synth-test.mjs (Node, synthetisch), app-test.mjs (Browser, App-Render; DUMP=1 schreibt dump-*.json für dump-test.mjs / known-test.mjs), sync.py (core.js + block-head/-tail → index.html).
