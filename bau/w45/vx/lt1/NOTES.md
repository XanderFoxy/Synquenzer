# LT1 – Long Tasks im Hauptfaden (Paket LT1, Basis 4.73.0 = rel-4730)

Ziel (OFFEN.md A2, SPK12 NOTES): keine Long Task > 50 ms bei
a) Kachel-Zeichnen nach großen Ansicht-Sprüngen, b) FFT-Größe 4096 ↔ 8192, c) Import-Ablegen.

## Verfahren
- `lt1-test.mjs <index> <basis>`: A/B im selben Lauf, je Lauf frischer Browser-Kontext, Reihenfolge abwechselnd (A,B / B,A),
  926×428 und 428×926, REPS=3. PerformanceObserver `longtask` + `long-animation-frame` (Skript-Zuordnung, erzwungenes Layout).
  Ausgabe je Lauf: alle Long Tasks > 50 ms, LoAF-Einträge, Last (loadavg); Ende: Median/Max der längsten Long Task je Lauf.
  - a: 90-s-Signal, 5 Ansicht-Sprünge per Skript (wie spk12-Tests), danach Canvas-Bild (md5 von toDataURL) A = B?
  - a2: wie a, aber vorher im Zoom (0–4 s) FFT 4096 → 8192 → die übrigen Kacheln liegen noch nicht auf der Grafik; dann 4 Sprünge.
  - b: FFT 4096 → 8192 → 4096 per Klick im Ansicht-Klappfenster (wie fft-probe), Bild nach dem Beruhigen A = B?
    Vor der Messung ein Klick in die Seite: der erste Tipp startet den Ton (`ensureAudio`, 55 ms JS, gehört nicht zu b).
  - c: Lied 96 BPM / 8 Takte (SONG aus nx1-test), `file()` → erkannt → gemessen nur `place('scenes')` (= Ablegen);
    Ergebnis A = B über Daten (bpm, Spuren, Szenen, Takes, Arten) und Raster-DOM (Text + Element-Klassen-Signatur).
- Ursache belegt mit `lt1-trace.mjs` (CDP-Spur, Haupt-Faden-Aufgaben > 40 ms mit Kind-Ereignissen) und CPU-Profil (`PROF=1`,
  bzw. `vx/nach/probe/probe-place.mjs` für c).

## Befunde (Ursache)
- **a/b sind keine Skript-Arbeit.** Spur (Basis, b): jede Long Task = `ProxyMain::BeginMainFrame → Commit → DoUpdateLayers →
  GLES2::ReadPixels → WaitForCmd/Finish` 47–94 ms. Im Kopflos-Chromium wird die WebGL-Leinwand bei Software-Compositing jedes
  Bild zurückgelesen; der Hauptfaden wartet dabei, bis die Grafik (SwiftShader, CPU) alle Befehle des Bildes abgearbeitet hat:
  Hochladen neuer Spektrum-Kacheln (je 1024 × 984 R8 + Mipmaps) und das Zeichnen der ganzen Fläche. JS je Bild nur 1–4 ms
  (spk1Frame/spk1GlDraw gemessen). LoAF meldet diese Aufgaben ohne Skript-Anteil (scripts leer, blockingDuration 0).
  → Auf einem Gerät mit GPU-Compositing gibt es dieses Zurücklesen nicht; die Grafik-Arbeit selbst bleibt aber und wird hier
  verkleinert, wo sie in einem Bild gebündelt ist.
- a ohne neue Kacheln (alle Texturen schon da): Long Tasks in A und B gleich häufig, abhängig nur von der Last – reines Zeichnen
  der Vollfläche in SwiftShader (kein Upload, `LT1.n = 0`). Ohne sichtbare Änderung (z. B. halbe Auflösung) nicht kleiner zu machen.
- b: beim FFT-Wechsel kommen die Kacheln vom Worker; die alte Schleife lädt jede sichtbare Kachel ohne Textur im selben Bild hoch
  (mehrere je Bild + Mipmaps). Mit LT1 höchstens eine je Bild (`LT1.n` zählt die verschobenen Bilder, 6–7 je Lauf).
  Spur nach LT1 (gleicher Ablauf, gleiche Maschine): GPU-Wartezeit je Bild 35 / 35 ms statt 54 / 74 / 50 / 53 / 93 ms.
- c ist Skript: `imp1Place` 49–75 ms am Stück (CPU-Profil): Schritt 34 ms (neue Spur „Original“ 13 ms – darin **buildGrid**,
  Take aus PCM 11 ms, normSong 7 ms, Verlauf 4 ms), dann **ein zweites buildGrid** 8–17 ms (mxApply → gl1MxFlat erzwingt Layout),
  Toast 6 ms, imp1Paint 3–8 ms. buildGrid lief also zweimal in derselben Aufgabe (restoreTrack und imp1Place-Ende).

## Änderung (Block `LT1-BEGIN … LT1-END` hinter FOKUS1-END, 26 Zeilen) + 3 Haken
| # | Stelle | Haken |
|---|---|---|
| 1 | `spk1GlDraw` vor der Kachel-Schleife (neue Zeile) | `if (typeof lt1GlChunks === 'function' && lt1GlChunks(U, G, hs, yT, yB)) return;   /* LT1 */` |
| 2 | `imp1Place` vor `imp1Step` (neue Zeile) | `if (typeof lt1GridMark === 'function') lt1GridMark();   /* LT1 */` |
| 3 | `imp1Place` Zeile `buildGrid(); svLayout()` (Zeile ergänzt) | `… && !(typeof lt1GridOk === 'function' && lt1GridOk())) buildGrid(); …   /* LT1 */` |

- `lt1GlChunks`: gleiche Schleife wie spk1GlDraw (gleiche Rechtecke, gleiche Reihenfolge, gleiche Texturen R8 + Mipmaps), aber
  höchstens `LT1.up = 1` neue Textur je Bild; fehlt danach noch eine sichtbare Kachel, zeichnet das nächste Bild weiter
  (`U.dg`, rAF). Gleiches Verfahren wie FOKUS1 für seine Fokus-Stücke („eine Textur je Bild – weniger lange Aufgaben“).
  Folge: nach FFT-Wechsel/Sprung füllt sich die Fläche über 1–3 Bilder statt in einem langen Bild (beim FFT-Wechsel war sie bisher
  ohnehin leer, bis die Kacheln vom Worker kommen). Endbild pixelgleich (Canvas-md5 A = B in allen Läufen).
- `lt1GridMark/lt1GridOk`: merkt `UI.cnw` vor dem Ablegen (buildGrid legt es jedes Mal neu an). Wurde das Raster im Ablegen schon
  passend gebaut (neue Spur „Original“: Kopf-Zahl = NT, alle Köpfe da), entfällt das zweite buildGrid; `UI.dirty.grid` ist gesetzt,
  renderGrid füllt Clips/Namen im nächsten Bild wie bei jeder Änderung (renderGrid baut selbst neu, wenn die Spurzahl nicht passt).
  Liegt die Spur „Original“ schon vor, bleibt alles wie bisher (UI.cnw unverändert → buildGrid läuft).
  Ergebnis gleich: Daten und Raster-DOM-Signatur A = B (`grid=515d7e97/859`, 7 Köpfe).

## Messungen (lt1-test.mjs; Last 4–6 auf 4 Kernen, andere Agenten + Regression liefen mit)
MESSTABELLE

## Regression (reg.sh → reg.log, Ausgaben in reg/)
REGRESSION

## Pflichtprüfungen
PFLICHT

## Offen
- a ohne neue Kacheln: das Zeichnen der Vollfläche selbst (SwiftShader, Software-Compositing zurücklesen) hält den Hauptfaden
  im Test 50–90 ms, je nach Last, in A und B gleich. Echter Weg: Spektrum-Zeichnen in einen Worker (OffscreenCanvas,
  `transferControlToOffscreen`) – dann wartet nie der Hauptfaden auf die Grafik. Großer Umbau (alle GL-Aufrufe, Tönung, FOKUS1,
  Kontextverlust) → offen gelassen, eigener Punkt.
- b: auch eine einzelne Kachel (1 MB + Mipmaps) kann unter Last > 50 ms Grafikzeit brauchen. Nächster Schritt ohne sichtbare
  Änderung: Kachel streifenweise hochladen (texStorage2D + texSubImage2D je 256 Zeilen pro Bild, Mipmaps am Ende) – nicht mehr
  im Zeitrahmen gebaut.
- c: Rest von imp1Place ~35–45 ms (Spur anlegen inkl. erstem buildGrid, Take aus PCM, normSong, Toast). Weiter teilen hieße das
  synchrone `place()` (Rückgabe, ein ↶) aufzubrechen oder buildGrid/Toast ins nächste Bild zu legen → Haken in restoreTrack,
  alle Aufrufer betroffen; offen.
- Nebenbefund: der erste Tipp einer Sitzung startet den Ton (`ensureAudio` → Drum-Puffer, Wellen, Hall) 55 ms am Stück – eigener
  Punkt für die Ladezeit-Liste (nicht a–c).
