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

## Schritt 2/3 (Blatt + Zerschneiden + Loop) – Stand
- Quelle: `ui.js` (sync.py hängt sie vor `IMP1-END` an). Einhänge-Zeilen (alle mit „IMP1“): normTrack (`track.orig` bleibt), scheduleTrack
  (`tr.orig` → `tkSched`, also die vorhandene Take-Wiedergabe), tkPlace (Original schweigt nicht unter der Song-Stimme), openRoll (Clip der Spur
  „Original“ → Blatt), va1Html/va1Tap (Export-Blatt: „Audio/MIDI importieren“ statt „MIDI importieren“), ggbPick (→ derselbe Wähler).
- Ein Wähler `imp1Pick(hint)` (`<input id="imp1In">` ohne accept): MIDI (MThd) → `va1MidiImport` + Tempo (FF 51) / Taktart (FF 58) aus der
  Datei, wenn das Projekt leer ist; Audio mit hint 'gesang' → `ggbImportBuf` wie bisher; sonst → Blatt. Dekodieren `ggbDecode`, Mono `ggbMono`
  (Take) + `imp1Mono` (Analyse), Analyse im Worker (`imp1Analyse`).
- Blatt `imp1Sheet()` (openPop mit Kopf ✕/Ablegen, Stil wie Export-Blatt): Tempo bekannt (Feld, vorweg) · Datei wählen · Erkennen;
  Canvas-Welle (Spitzen 1200 Spalten) mit Takt-/Schlag-Raster, farbigen Teilen (Gruppen-Farben --amber/--t1…), „1“-Marke (fein ziehen),
  Loop-Klammern (unten ziehen, Takt-Raster); Tempo − / + / ½× / 2× / Tippen; Taktart 2/4 3/4 4/4 6/8 12/8; Gesang/schwankend: Vorschlag
  „92 oder 46 / 184?“ als Knöpfe; Teile: Chips (umbrechend), Name, Zusammen ▸, Teilen (4er-Raster); Ziele; Loop. Ziehen zeichnet nur den
  Canvas neu (rAF), das Blatt wird erst beim Loslassen neu geschrieben.
- Daten: Teile `{name, ta (s im Audio), grp}` → in Song-Takten über `imp1Parts` (Anfang auf den nächsten Taktstrich; erster Teil ab Takt 0 inkl.
  Auftakt, letzter bis zum Ende). Song-Takt 0 = org = „1“ − k Takte (Auftakt). Take = ganzes Audio, Probe 0 = Song-Takt 0, `take.imp
  {bpm, ts, t1}` (tkExt().take hält es beim Normalisieren).
- Ziele (je ein ↶ über den ganzen Stand 'sx14'; eigene Undo-Einträge der benutzten Wege fallen weg):
  In Szenen zerschneiden → Spur „Original“ (neue Zusatzspur, sonst leere Zusatzspur), Teil i = Szene i (Clip mit `audio {take, in, out}`,
  len = Takte, ts), Song-Bahn der Spur in Reihenfolge + Ende, Song-Marken mit den Teil-Namen; mehr als 8 Teile oder Teile > 64 Takte →
  eigene Song-Clips (song.own). Als eine Spur → nur eigene Song-Clips (Szenen bleiben frei). Als Gesang → `ggbPlace` (STIMME-Spur, Song-Stück,
  ohne Export-Daten an Takt 0), Song so lang wie das Audio. Loop → freier Szenen-Platz der Spur „Original“, Clip = Loop-Bereich (spielt im Loop).
  Projekt-Tempo/-Taktart = erkannt (gerundet), wenn noch kein Audio im Projekt liegt; sonst bleibt das Tempo (Hinweis).
- Test `imp-test.mjs <index.html>` (Touch, Demo-Song 92 4/4 als WAV über den echten Datei-Wähler): ALLE OK.

## Offen / Grenzen
- Nur festes Tempo (Live-Aufnahmen mit Schwankung: `stabil` < 0,5 → `frage`); Teile nur auf dem 4-Takt-Raster ab der „1“ (Teile mit 2 Takten Versatz
  werden um 2 Takte verschoben gemeldet); 5/4, 7/8 nicht erkannt (nicht verlangt). Echte MP3s (Gesang mit Hall, Live-Schlagzeug) noch nicht geprüft.
- Offen aus Schritt 2: Audio passend dehnen (vsStretchMake), wenn das Projekt schon Audio hat und das Tempo abweicht bzw. das erkannte Tempo
  krumm ist (S.bpm ist ganzzahlig: 91,6 → 92, je Teil setzt der Clip am Taktstrich neu an, Abweichung bleibt im Teil); Wiedergabe nur mono
  (Takes sind mono); Matrix-Zelle der Spur „Original“ zeigt (noch) keine eigene Welle; echte MP3s nicht geprüft; Guide-Eintrag fehlt.
- Test-Dateien: synth-test.mjs (Node, synthetisch), app-test.mjs (Browser, App-Render; DUMP=1 schreibt dump-*.json für dump-test.mjs / known-test.mjs), sync.py (core.js + block-head/-tail → index.html).

## Schritt 3/3 (Test) – Ergebnis
- `imp1-test.mjs <index.html>` (Touch, echter Datei-Wähler, 3 Browser-Seiten nacheinander, ~125 s): **ALLE OK (48 OK)**. Regression `imp-test.mjs`: ALLE OK.
  Fotos: `fotos/imp1t-*` (erkannt, Szenen, Loop, Gesang-Frage; Blatt Song / Gesang-Frage je 428×926, 926×428, 926×370).
- Geprüft: die App rendert 3 Songs (92 4/4 148,7 s, 120 3/4, 120 6/8; Intro S R S R Bridge R Outro) + Melodie allein (96) → WAV;
  MP3 (ffmpeg libmp3lame 192k), M4A (aac) und AIFF per ffmpeg. WAV 3/4, 6/8, 4/4 und MP3: Tempo, Taktart, alle 8 Grenzen 0 ms, Namen richtig.
  M4A im Test-Chromium lesbar (96 4/4). AIFF kann das Test-Chromium nicht dekodieren (Safari kann es) → klare Meldung geprüft.
- In Szenen zerschneiden: Spur „Original“, Szene 1–8 in Reihenfolge, Ausschnitt-Start = Teil-Anfang 0 ms (Grenze ±10 ms), Länge = Takte,
  Proben bitgleich zur Datei, Song-Ablauf 0:0 4:1 … 52:7 57:Ende, Marken mit Namen, Projekt 92/4/4, ein ↶. Song ab Teil 3 spielt sofort den Ausschnitt.
- ↶ nach dem Zerschneiden: ganzer Stand gleich wie vorher (sx14State identisch, Tempo zurück); ↷ bringt alles. MIDI: ↶ nimmt Tempo/Taktart/Clips zurück.
- Loop-Klammern per Finger Takt 13–14 → Loop-Clip; Matrix: Start auf dem Taktstrich (Phase 0,00 ms), Wiederholung 5217,4 ms = 2 Takte, immer ab Takt 13; ein ↶.
- Speichern/Laden (Projektdatei) und Container (ZIP Projekt + Audio) in frischem Speicher: Audio bitgleich, Spur/Clips/Raster da, Szene spielt im Takt
  (nach frischem Laden steigt der Take ~34 ms später an der laufenden Stelle ein – vorhandenes Verhalten der Take-Wiedergabe, bleibt synchron).
- Gesang allein: „Aus Gesang geschätzt – 96 oder 48 / 192?“ mit 3 Knöpfen; Antippen setzt das Raster. Tempo vorweg (96 getippt) wird genommen,
  „Erkennen“ mit 46 nimmt 46. Maße: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung (Knöpfe, Felder, Welle, Zeilen) in allen 3 Größen.
- Behoben in Schritt 3: (1) Tempo vorweg eingetragen → keine Rückfrage mehr (`frage` nur ohne Vorgabe; Blatt fragt nur bei `r.frage`).
  (2) „Als Loop in die Matrix“ bei 8 Teilen (alle 8 Szenen der Spur belegt) meldete „Keine freie Szene“ → jetzt kommt der Loop in die Szene seines Teils,
  der Song behält den ganzen Teil als eigenen Song-Clip (ein ↶ für alles).
- Hinweis: die App schließt Blätter beim Drehen (globales resize → closePop, vorhandenes Verhalten); das Import-Blatt behält seinen Stand und öffnet gleich wieder.
- Pflicht (Endstand): topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [], MS 2000 1×, „  live: true,“ 1×, Markenwörter = Basis, VERSION 4.54.1 unverändert.
- Offen (unverändert aus Schritt 2): Dehnen bei abweichendem Projekt-Tempo, Wiedergabe mono, eigene Welle in der Matrix-Zelle, echte MP3s mit Live-Tempo, Guide-Eintrag.
