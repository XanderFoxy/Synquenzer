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

## Änderung (Endstand): Block `LT1-BEGIN … LT1-END` hinter FOKUS1-END (13 Zeilen) + 2 Haken – nur c
| # | Stelle | Haken |
|---|---|---|
| 1 | `imp1Place` vor `imp1Step` (neue Zeile) | `if (typeof lt1GridMark === 'function') lt1GridMark();   /* LT1 */` |
| 2 | `imp1Place` Zeile `buildGrid(); svLayout()` (Zeile ergänzt) | `if (UI.heads && EL.grid && !(typeof lt1GridOk === 'function' && lt1GridOk())) buildGrid(); …   /* LT1 */` |

- `lt1GridMark/lt1GridOk`: merkt `UI.cnw` vor dem Ablegen (buildGrid legt es jedes Mal neu an). Wurde das Raster im Ablegen schon
  passend gebaut (neue Spur „Original“ → restoreTrack → buildGrid; Kopf-Zahl = NT, alle Köpfe da), entfällt das zweite buildGrid;
  `UI.dirty.grid` ist gesetzt, renderGrid füllt Clips/Namen im nächsten Bild wie bei jeder Änderung (renderGrid baut selbst neu,
  wenn die Spurzahl nicht passt). Liegt die Spur „Original“ schon vor, läuft buildGrid wie bisher (UI.cnw unverändert).
  Ergebnis gleich in allen Läufen: Daten (bpm 96, 7 Spuren, 8 Szenen, 1 Take, Spur-Arten, lastPlace-Felder) und Raster-DOM-Signatur
  (Text + Klassen aller 859 Elemente, `grid=515d7e97/859`) A = B.
- **Verworfen (gebaut, gemessen, wieder entfernt, Sicherung `index.vor-lt1b.html`):** `lt1GlChunks` – höchstens eine neue
  Kachel-Textur je Bild in spk1GlDraw (wie FOKUS1). Spur in Ruhe: GPU-Wartezeit je Bild 35/35 ms statt 54–93 ms. Im A/B unter
  Last 5–8 aber kein sicherer Gewinn (b 926×428 schlechter, 428×926 besser) und **mehr** Bilder > 50 ms (18 statt 12, 15 statt 13),
  weil jedes zusätzliche Bild die ganze Fläche neu zeichnet. Ohne Beleg nicht ausgeliefert.

## Messungen (lt1-test.mjs; Last 4–6 auf 4 Kernen, andere Agenten + Regression liefen mit)
Long Task = längste Long Task je Lauf (0 = keine > 50 ms); „Ablegen“ = Dauer von imp1Place selbst (performance.now).
Runde 1 (16:2x–16:33, Last 4,5–7,6; index mit c-Änderung **und** dem verworfenen Kachel-Versuch), Runde 2 (c, Endfassung, Last 7,4–8,9).

| Fall | Größe | basis Median / Max (Läufe > 50) | index Median / Max (Läufe > 50) | Bild/Ergebnis gleich |
|---|---|---|---|---|
| a Sprünge (alle Kacheln schon da) | 926×428 | 60 / 62 (3 von 3) | 72 / 79 (2 von 3) | ja (Canvas-md5) |
| a | 428×926 | 0 / 98 (1 von 3) | 71 / 88 (2 von 3) | ja |
| a2 Sprünge nach FFT-Wechsel im Zoom | 926×428 | 81 / 183 | 107 / 258 | ja |
| a2 | 428×926 | 126 / 126 | 68 / 114 (rep1/2 schon Endfassung) | ja |
| b FFT 4096→8192→4096 | 926×428 | 166 / 258 (12 Aufgaben > 50) | 262 / 517 (18) | ja |
| b | 428×926 | 167 / 176 (13) | 93 / 137 (15) | ja |
| **c Ablegen** (Runde 1+2, je 6 Läufe) | 926×428 | **83 / 142** (5 von 6) | **57 / 70** (4 von 6) | ja (Daten + Raster-DOM) |
| **c** | 428×926 | 0 / 66 (2 von 6) | 0 / 67 (1 von 6) | ja |
| **c imp1Place-Dauer** | 926×428 | Median **70 ms** (40–139) | Median **49 ms** (34–68) | |
| **c imp1Place-Dauer** | 428×926 | Median **41 ms** (36–55) | Median **34,5 ms** (30–63) | |
| c Einzellauf in Ruhe (Last 2,1) | 926×428 | 58 (imp1Place 55 ms) | **0** (imp1Place 42 ms) | ja |

Lesart: a/b in A und B von der Last bestimmt (Grafik-Warten, kein Skript; a ohne Upload ist für A und B derselbe Code-Weg).
c: das zweite buildGrid fällt weg (−8…−20 ms je Ablegen, unter Last mehr); in Ruhe keine Long Task mehr, unter Last 7–9 auf
4 Kernen in 926×428 noch 53–70 ms (Basis 66–142).
Rohdaten: `lt1-test-926x428.out`, `lt1-test-428x926.out`, `lt1-test-a2.out`, `lt1-test-c-final.out` (+ .json), Spuren mit `lt1-trace.mjs`.

## Regression (reg.sh → reg.log, Ausgaben in reg/)
Alle mit der Endfassung (Spektral-Code = Basis, nur imp1Place geändert), außer spk12-3 Lauf 1 (Zwischenstand mit Kachel-Versuch).
| Test | index | Basis-Gegenlauf | Bemerkung |
|---|---|---|---|
| spk12-test (Teil 1) | 98 OK / 0 | – | |
| spk12-test2 | 72 OK / 0 | – | |
| spk12-test3 (inkl. hauptfaden-ohne-long-task) | 47 / 0 (Zwischenstand) · **47 / 0 (Endfassung)** | – | in 926×370 diesmal keine 52 ms |
| fokus1-kern-test | 25 / 1 (Last 7,6) · **26 / 0** (Wiederholung, Last 6,8) | 26 / 0 | Fehler war „3min keine long tasks“ max 51 ms |
| fokus1-test | 44 / 7 (Last 8,3) · 44 / 7 (Last 6,0) | **47 / 4** (Last 3,6) | alle Fehler = `longtasks<=50` beim Fokus-Umschalten bzw. Grundlast; gleiche Art auf der Basis → vorbestehend, lastabhängig (Grafik-Warten wie a/b; Code-Weg identisch zur Basis) |
| spk6-test | ALLES OK 26 | – | |
| spk5-test | ALLES OK 24 | – | 1. Lauf brach ab: Testdaten `mess/` fehlten im Paketordner → Verweis auf `vx/r4730/mess`, dann OK |
| imp1-test | ALLE OK 48 | – | Import inkl. Ablegen |
| imp2-node (realvox/imp2rs) | ALLE OK 8 | – | |
| spkfix-test | ALLES OK 11 | – | |


## Pflichtprüfungen
Endfassung `index.html` md5 88a53dabe895d842acfdff7ff26f1844 (Basis rel-4730 69f50c189dbab745ebdf81a415838208):
topdefs (NODE_PATH=/opt/node-tools/node_modules) „Skripte 26, Namen 7921, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ ·
smoke errors [] (smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.73.0' unverändert · diff Basis → Paket: 17 neue Zeilen,
1 geänderte (Haken 2) – 13 Zeilen Block + 1 neue Haken-Zeile + 1 ergänzte Zeile. Keine sichtbare Änderung (Raster-DOM A = B).

## Offen
- **a/b nicht erreicht (Long Tasks > 50 ms bleiben, in A und B gleich):** Ursache ist kein Skript, sondern das Warten des Hauptfadens
  auf die Grafik beim Zurücklesen der WebGL-Leinwand (Software-Compositing im Test, SwiftShader auf der CPU): Zeichnen der
  Vollfläche (1852 × 856 px, Mipmap-Textur + Farbtabelle) und Hochladen neuer Kacheln (1 MB + Mipmaps). Kleiner wird das nur
  - mit dem Spektrum-Zeichnen in einem Worker (OffscreenCanvas, `transferControlToOffscreen`): dann wartet nie der Hauptfaden.
    Großer Umbau (alle GL-Aufrufe, Tönung, FOKUS1-Stücke, Kontextverlust, CPU-Rückfall) → offen, eigener Punkt (Profi-Weg).
  - oder mit sichtbaren Änderungen (z. B. halbe Auflösung während der Bewegung) → erst Funk.
  Der Versuch „eine Textur je Bild“ ist gemessen und verworfen (siehe oben). Auf echten Geräten mit GPU-Compositing liest der
  Browser die Leinwand nicht zurück; dort ist die Wartezeit nicht im Hauptfaden – Messung auf dem iPhone wäre der nächste Beleg.
- c unter hoher Last: imp1Place hat noch ~30–50 ms am Stück (neue Spur „Original“ inkl. erstem buildGrid ~13 ms, Take aus PCM
  ~11 ms, normSong ~7 ms, Verlauf ~4 ms, Toast ~6 ms, imp1Paint 3–8 ms). Weiter teilen hieße das synchrone `place()` (Rückgabe,
  ein ↶) aufzubrechen oder buildGrid in restoreTrack zu verschieben (alle Aufrufer betroffen) → offen.
- Nebenbefund: der erste Tipp einer Sitzung startet den Ton (`ensureAudio` → Drum-Puffer, Wellen, Hall) 55 ms am Stück – eigener
  Punkt für die Ladezeit-Liste (nicht a–c).
- Nebenbefund: LoAF (`long-animation-frame`) meldet die Grafik-Warte-Aufgaben ohne Skript-Anteil; für a/b ist die CDP-Spur
  (`lt1-trace.mjs`) der Beleg, nicht LoAF.
