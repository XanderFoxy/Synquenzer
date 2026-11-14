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
Zeit Noten finden Bass-Ebene (Node): 1,13–1,38 s → 1,35–1,58 s (+20 %; N 16384 für Ebene + Original-Tiefband, Kick-Vorlage aus dem Zwischenspeicher).
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

## Pflicht / Regression
siehe LOG.md (Uhrzeiten, Zahlen). Seite: `spk8-seite.mjs <abs index.html>` (Zerlegen im Worker → Bass-Ebene → Noten ▾ → Noten finden,
Treffer/Präzision, Text „einstimmig“, ein ↶, Konsole).
