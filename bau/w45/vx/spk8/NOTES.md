# SPK8 – NOTES (Noten auf der Bass-Ebene · Verfeinern Bass)

Bau: `python3 bau.py` = `basis.html` (4.62.0, unverändert) + `spk8-block.js` direkt nach `/* ===== SPK4-END ===== */` (vor KF1-BEGIN;
SPK6 liegt nach NX1-END, SPK7 nach INT53D-END) + 2 Haken „SPK8“ (je eine Zeile, typeof-Schutz):
1. `spk1DspMake`: neue Zeile direkt nach dem SPK4-Haken: `if (Z2 && typeof spk8DspMake === 'function') spk8DspMake(Z2);` (muss nach SPK4 kommen,
   weil SPK8 dessen `Z2.ops.noten` umhüllt; braucht `Z2.magsLo/kickTpl/kickAt` aus SPK3).
2. `spk1Worker`: Zeile `const w = new Worker(…)` → `new Worker(typeof spk8WUrl === 'function' ? spk8WUrl(src, u) : u)`.
   Bewusst NICHT die `const src = …`-Zeile: die ändert SPK6 schon (`spk6DspMake.toString()` vorne) – zwei Änderungen in derselben oder
   in direkt benachbarten Zeilen ergeben beim `git merge-file` einen Konflikt (geprüft: Nachbarzeilen → Konflikt, eine unveränderte Zeile
   dazwischen → sauber). `spk8WUrl` hängt `spk8DspMake.toString()` als zweiten Blob-Teil an den Kern-Text (Funktions-Deklaration →
   im Worker schon beim `spk1DspMake(vsDspMake())` vorhanden), gibt die erste URL frei, Rückfall = alte URL.
VERSION/CHANGES unberührt. Hauptfaden-Rückfall (`SPK1.K = spk1DspMake(VSD)`) nimmt den Haken 1 automatisch mit.

## Auftrag 1 – „Noten finden“ auf der zerlegten Bass-Ebene
Ursache (Befund SPK4 bestätigt + genauer): die einstimmige Verfolgung (`trackF`, N 8192, auf der Ebene) bleibt bei 28–29 Hz hängen.
Rahmenweise nachgesehen (`messb/dbg8.mjs`): die Bass-Ebene ist fast ein Sinus (C3: 3. Oberton −110 dB unter dem Grundton), der Bass-Klang
hat eine Unter-Oktave (Stem: f/2 −8 dB), dazu Kick-Rest um 46–55 Hz und Pad-Leck (C3/E3/G3/C4) in der Ebene.
Weg (Kern `spk8DspMake`, umhüllt `Z2.ops.noten` nur für Ebenen mit `art === 'bass'`; Original, Original + Bass-Band, Pads, Gesang, Rest → wie vorher):
- Grundton-Verfolgung wie im Zerlegen: `track8` = Kopie von SPK4 `bassTrack4` (Viertelton-Raster 27–290 Hz, Grundton-Pflicht, Kick-Ausklang
  und Rauschen ohne deutliche Obertöne zählen nicht), N 16384, auf dem **Original** (`Z2.magsLo`) mit abgezogener **Kick-Vorlage**
  (`Z2.kickTpl/kickAt`, gleiche Vorlage wie Zerlegen). Unter-Oktave aus (`o8.sub 0`): eine Note meint den Hauptton.
- Die **Ebene** entscheidet, wo Noten sind: Anschläge (`onsetsOf` auf der Ebene), Pegel-Schwelle je Rahmen, Notengrenzen wie SPK2 (`segNotes`)
  – aber ohne dessen Oktav-Verdopplung (ungerade/gerade Obertöne): auf der fast sinusförmigen Ebene verdoppelte sie C3 → C4, E2 → E3.
- **Leck-Schutz je Note** (Median über die Note): cL = Pegel der Ebene auf dem Kamm (Obertöne 1–4) rel. 95-%-Quantil, cR = Ebene/Original
  auf demselben Kamm. Behalten wenn cL + cR ≥ −26 dB und cL ≥ −24 dB. Gemessen: echte Noten cL+cR −0,6 … −25,2; Kick-/Pad-Leck nach dem
  Bass-Ende −23 … −36 (`messb/dbg9.mjs`). Plateau: gS 24 → 28/32 · 82 %, 26 → 29/32 · 81 %, 28 (gL 22) → 29/32 · 76 %.
- Undo/Speicher wie SPK2 (ein ↶ „Noten finden“, bestätigte Noten bleiben), Antwort `einstimmig: true, mehrstimmig: false, bass8: true`.
  SPK5 „Noten aller Ebenen“ (Noten-Ansicht) holt `Z.ops.noten` zur Laufzeit → nimmt den neuen Weg mit.

### Messung (Demo 20 s, Node = Kern aus der Datei; `messb/bn8.mjs`, Wertung wie `spk4/messb/bassnot.mjs` ±70 ms + gleicher Ton)
| Schritt | Treffer / 32 | Präzision (gef.) |
|---|---|---|
| vorher (4.62.0, trackF auf der Ebene) | 0 | 0 (69) |
| bassTrack4-Kopie auf der Ebene | 14 | 0,29 (49) |
| + ohne Oktav-Verdopplung | 21 | 0,43 (49) |
| + Kick-Vorlage von der Ebene (Anteil 1 / 0,3) | 24 / 25 | 0,59 / 0,57 |
| Verfolgung auf dem Original + Kick-Vorlage (wie Zerlegen) | 29 | 0,43 (67 – Leck nach dem Bass-Ende) |
| **+ Leck-Schutz (gebaut)** | **29 (90,6 %)** | **0,806 (36)** |
SPK3-Wertung (`messb/noten8.mjs` = Kopie `spk3/messk/noten3.mjs` + spk8DspMake, TEIL=bass, eins-zu-eins):
bass_ebene 0/32 · 0 → **29/32 · 0,806**; orig_bassband 14/32 → 14/32 (Noten bitgleich, `messb/orig-alt.json` = `orig-neu.json`);
Überall finden fair 0,821/0,793 → gleich; SDR zerlegt 4,37 → 4,37. Pads (mehrstimmig) laufen nicht durch SPK8 (art ≠ bass).
Zeit Noten finden Bass-Ebene: erst 1,13–1,38 → 1,54–1,62 s (Node, Ebene mit FFT 16384) bzw. Seite 1393 → 1858–1924 ms; dann Ebene über
das SPK3-Unterabtasten (`Z2.magsLo` auf der Ebene, FFT 4096 bei gleicher Auflösung, `o8.dec`) → gleiche Noten, Node 0,98–1,19 s, Seite 1393 → 1408 ms
(Korrektur nach der Prüfung: gepaart gegen die Basis gemessen ist SPK8 **nicht schneller**, sondern +5–10 % (Basis 1,02–1,04 s, SPK8 1,07–1,15 s); innerhalb der 1,3×-Regel)
(Original-Tiefband und Kick-Vorlage kommen aus dem Zwischenspeicher des Zerlegens).
Verworfen: Verfolgung auf der Ebene (max 25/32 · 0,57); Oktav-Verdopplung aus SPK2 (C3 → C4); Gesamtpegel der Ebene als Schwelle
(eDb 15: 29/32 · 0,81, aber 15 dB unter dem lautesten Ton schneidet leise Bass-Stellen in anderen Stücken ab – Kamm-Leck-Schutz misst Anteil statt nur Pegel).

## Auftrag 2 – Verfeinern Bass (Ziel ≥ +0,5 dB über Zerlegen 4,37, Zeit ≤ 1,3×) – NICHT erreicht, nichts eingebaut
- Gemessen (`messb/x4.mjs AVG=…`, Haken nur im Mess-Text): Verfeinern-Anteil gemittelt mit dem Zerlegen-Anteil (0,5 / 0,7 / geometrisch):
  4,37 → 4,37 (±0). Zerlegen (lowSplit4) und Verfeinern (lowSplit4 trust) liefern fast dieselbe Maske – ein Mittel bringt nichts.
- Obergrenze bleibt das Kamm-Modell: SPK4-Oracle (Ton + Teiltonpegel vom Stem, bw 2) = 5,00 dB → +0,5 (≥ 4,87) verlangt fast ideale
  Teiltonpegel. Der Pegelfehler kommt aus Pad-Teiltönen, die genau auf Bass-Obertönen liegen (C3/G3 = 2./3. Oberton von C2) und dem
  Kick-Rest um 50–65 Hz (Bass-Unter-Oktave 49 Hz liegt im Kick).
- Weg (nicht in 40 min machbar): Teiltonpegel per kleinster Quadrate je Rahmen gegen drei Vorlagen – Bass-Kamm (Breite bw), Kick-Vorlage
  (kickTpl) und Pad-Teiltöne aus der mehrstimmigen Pad-Verfolgung (SPK4 polyNoten, jetzt verfügbar) – mit Glättung über die Note.
  Erwartung realistisch +0,2 … +0,4 (Hälfte des Oracle-Abstands); erst messen, dann bauen.

## Pflicht / Regression (Endstand, Ergebnisse auch in LOG.md)
topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a2.png`) · „MS 2000“ 1× · „  live: true,“ 1× · VERSION 4.62.0 unverändert ·
keine neuen Namen/Markenwörter (Block nur Fachtext).
- `spk4-test.mjs index.html basis6.html` (Stand vor `o8.dec`; dec ändert nur den Bass-Ebenen-Weg, den spk4-test nicht lädt): 17 OK / 6 FEHLER, alle erwartet:
  a1-mehrstimmig-gemisch-besser und a3-unison-pad-besser (Vergleich gegen basis6, die SPK4 schon enthält: 8/28 = 8/28, 0,96 = 0,96),
  a2-verfeinern-plus-1db (bekannt, −0,01), a3-nachbau-zeit/„abstaendeGleich“ (FM im Basis-Lauf 2,7 statt 2,06 – Last; Klang-Probe allein
  basis → SPK8: alle Abstände und Texte gleich, `spk3-klang-probe.json`), reg-spk3-test 14/17 (verfeinern-plus-1db, regression-spk2-test
  bekannt; nachbau-abstaende-besser = gleicher Code wie Basis), reg-ki1-test quer-428/quer-370 (erwartet) + besser-als-klassisch-demo (vorbestehend).
  OK u. a.: Pflicht, Pads allein 24/28 = 24/28, Original + Bass-Band 14/32 = 14/32, Zerlegen Bass 4,37, Drums/Tonal gleich, Überall finden 0,793,
  Rest aufteilen, spk4-ui 8/8, spk2-test 28/30 (bekannt), spk1 17/18 (bekannt), vx1 61/61.
- `spk5-test.mjs` (Endstand): ALLES OK · 24 Prüfungen.
- `spk1-test.mjs` (Endstand, mess/ als Verweis neben der Datei): 17 OK / 1 FEHLER verfeinern-verbessert-ziel 4,37 → 4,36 (bekannt seit SPK4 A2).
- `spk8-seite.mjs` (Endstand, Worker): 4/4 – Zerlegen im Worker, Noten finden auf der Bass-Ebene 29/32 · Präz 0,806, Text „36 Noten in Bass ·
  einstimmig“, ein ↶ (danach 0 Noten), Konsole []; Foto `fotos/90-noten-bass-ebene.png` (vorher: `…basis.png`, 69 Noten, 0 Treffer). Seite: `spk8-seite.mjs <abs index.html>` (Zerlegen im Worker → Bass-Ebene → Noten ▾ → Noten finden,
Treffer/Präzision, Text „einstimmig“, ein ↶, Konsole).

## Prüfung (Nachbesserung zu PRUEFUNG.md: 0 schwer, 1 mittel, 7 leicht)
Neu im Block (alles in SPK8-BEGIN/END, Haken unverändert; Schalter in `Z2.o8`, alte Werte = alter Weg): `cut`, `kCh`, `cf 12`, `mrg 3`;
`fMax 290`, `minS 0,1`, `kM 1` nur als Mess-Schalter (Werte wie vorher). Mess-Skript `messb/faelle8.mjs` (Prüf-Fälle des Prüfers fest aufgenommen:
Basslinien in `messb/faelle/`, mit dem App-Synth gerendert; dazu leise/laut/ohne Pads/ohne Trommeln/ohne Raster/48 kHz/174 s/Auswahl), Kurzlauf `messb/sweep8.sh`.
Vorher-Stand des Blocks: `messb/spk8-block.vorher.js`; Ergebnisse `messb/f8-vorher.jsonl` → `messb/f8-nachher.jsonl`.

| Befund | Stand | vorher → nachher |
|---|---|---|
| 1 [mittel] 70/70 nur Demo | **teilweise**: Prüf-Fälle fest im Test, liegende Töne zusammengefasst (`mrg`), Ursache gemessen; Oktavfehler NICHT behoben (kein Weg ohne Verschlechterung gefunden) | demo 29/32 · 0,806 = gleich; okt 24/32 · 0,667 → 0,686; lang 4/4 · 0,235 (17 Noten) → 0,333 (12); walk 8/32 · 0,216, sech 29/64 · 0,617, leise 16/32 · 0,50, ohne Pads 19/32 · 0,655, hoch 13/32 · 0,448 = gleich; laut 30/32, ohne Trommeln 32/32 · 0,97, ohne Raster 24/32, 48 kHz 28/32 = gleich |
| 2 [leicht] > 290 Hz | nicht eingebaut (gemessen schlechter) | `fMax 400`: hoch 13/32 → 11/32, D4/E4 weiter 0 (Pads C3–C4 überdecken, alles fällt eine Oktave) |
| 3 [leicht] Sicherheit fast immer 1 | **behoben** | Sicherheit = Abstand zum Leck-Schutz (0,3 + 0,7 × dB über der Schwelle / 12, höchstens alter Wert). Mittel richtig/falsch: demo 1,00/1,00 → 0,96/0,83 · okt 1,00/1,00 → 0,94/0,70 · leise 1,00/0,97 → 0,90/0,71 · ohne Pads 1,00/0,92 → 1,00/0,81 · ohne Bass (nur Fehlnoten) → 0,69; Ausnahme hoch 0,85/0,90 |
| 4 [leicht] kleine Auswahl langsam | **behoben** (`cut`: Ebene nur im Bereich unterabtasten, Versatz Vielfaches von 16 → Noten bitgleich) | 4 s in 174 s: 553–582 → 445–512 ms (Basis 319–390); Noten innen 12/15 gleich |
| 5 [leicht] Speicher | **verbessert** (`kCh`: Kick-Vorlage stückweise je 256 Rahmen statt eines F×K-Felds, Noten bitgleich) | 174 s, maxRSS-Zuwachs bei Noten finden: 152 → 132 MB (Basis 118) |
| 6 [leicht] „Node schneller“ | **korrigiert** (Text oben) | gepaart +5–10 % |
| 7 [leicht, vorbestehend] Meldung „Zerlegt: …“ verdeckt Bass-Noten | **nicht gebaut – Vorschlag** (sichtbare Änderung an SPK5-Code → erst im Funk vorschlagen) | Vorschlag: beim Tippen auf „Noten finden“ die SPK5-Meldung schließen (wie ✕) oder sie nach oben an den Rand der Spektral-Fläche setzen |
| 8 [leicht] Lücken im Seiten-Test | **behoben** | `spk8-seite.mjs`: Zerlegen per Knopf + Klappfenster, Bass-Ebene antippen, hochkant 428×926 und quer 926×428, ↶ prüft Text „Rückgängig: Noten finden“ und Ebenen 3 → 3, ↷ bringt 36 Noten, Sicherheit gestuft: **14/14 OK** (vorher 4/4, nur hochkant/API) |

Befund 1 genauer (gemessen, `messb/dbg10.mjs`, `dbg12.mjs`):
- Ohne Trommeln 32/32 · 0,97, mit Trommeln ohne Pads 19/32 → Hauptursache ist der Kick-Rest unter 60 Hz im Original nach Abzug der Vorlage
  (konstant ~43–47 dB bei 25–55 Hz, nur 3–8 dB unter dem Bass-Grundton). Für einen Ton f liefert dieser Rest bei f/2 einen scheinbaren Grundton,
  die Grundton-Pflicht (φ 0,8) greift dann nicht mehr. Dazu kommt das Zeitfenster: N 16384 ≈ 370 ms gegen 268-ms-Noten (Lauf) bzw. 134 ms (16tel).
- Versucht, nicht eingebaut (jeweils andere Fälle schlechter):
  Kick-Vorlage ×2: ohne Pads 19 → 22/32, aber demo 29 → 28, okt 24 → 18, sech 29 → 24 · ×4: ohne Pads 24/32, demo 23, okt 14 ·
  FFT 8192: demo 23, okt 13, sech 20 · kürzeste Note 60 ms (`minS`): keine Änderung ·
  Oktave je Note aus Pegel 2f/f (Original und Ebene): trennt nur 4 von 8 falschen Noten im Lauf, gleiche Werte bei richtigen E2/C3 der Demo → zu riskant.
- Weg (nächster Auftrag, erst messen): Kick-Rest je Schlag statt fester Vorlage schätzen (kleinste Quadrate gegen Vorlage + Bass-Kamm, wie in
  Auftrag 2 notiert) und die Oktave je Note mit einem kurzen Fenster (4096 auf dem Tiefband, nur Obertöne 2–6) gegen f/2 und 2f entscheiden;
  Ziel: Lauf ≥ 20/32 ohne Demo-Verlust. Die Prüf-Fälle liegen dafür fest in `faelle8.mjs`.
- Ehrliche Aussage: 70 %/70 % gilt für die Demo-Basslinie (und laut/ohne Trommeln/48 kHz); bei anderen Linien mit Trommeln 25–75 % Treffer.
  Gegenüber der Basis (0–3 %) überall besser, nirgends schlechter.
