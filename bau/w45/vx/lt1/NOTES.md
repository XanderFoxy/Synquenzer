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

## Änderung (Endstand nach Prüfung): Block `LT1-BEGIN … LT1-END` hinter FOKUS1-END (62 Zeilen, 109204–109265) + 6 Haken – nur c
(Teil 1 = zweites buildGrid weg, Haken 1–2; Teil 2 = Take im Leerlauf vorbereiten, Haken 3–6, nach Prüfer-Befund 1, siehe „Prüfung“)
| # | Stelle | Haken |
|---|---|---|
| 1 | `imp1Place` vor `imp1Step` (neue Zeile) | `if (typeof lt1GridMark === 'function') lt1GridMark();   /* LT1 */` |
| 2 | `imp1Place` Zeile `buildGrid(); svLayout()` (Zeile ergänzt) | `if (UI.heads && EL.grid && !(typeof lt1GridOk === 'function' && lt1GridOk())) buildGrid(); …   /* LT1 */` |
| 3 | `imp1Run` nach `c.st = 'fertig'` (neue Zeile) | `if (typeof lt1PreStart === 'function') lt1PreStart(c);   /* LT1 */` |
| 4 | `imp1Take` erste Zeile (neu) | `if (typeof lt1Take === 'function') { const id = lt1Take(c); if (id) return id; }   /* LT1 */` |
| 5 | `tkToBuffer` erste Zeile (neu) | `if (typeof lt1PreBuf === 'function') { const q = lt1PreBuf(pcm, sr); if (q) return q; }   /* LT1 */` |
| 6 | `tkStore` Zeile `const jobs = …` (Zeile ergänzt) | `const jobs = (typeof lt1StoreJobs === 'function' && lt1StoreJobs(pcm, chunks)) \|\| chunks.map(…)   /* LT1 */` |

- Teil 2 (`lt1PreStart/lt1Take/lt1PreBuf/lt1StoreJobs`): ist die Analyse fertig (Blatt offen, Tempo passt → kein Dehnen), werden die
  Take-Kopie ab Song-Takt 0 (wie imp1Take) und der AudioBuffer (wie tkToBuffer, `pcm[i] * (1 / 32767)`) per setTimeout-Kette in
  Scheiben ≤ ~6 ms vorbereitet. imp1Take nimmt sie nur, wenn Audio, Versatz (`round(org·sr)`) und Rate passen, sonst der alte Weg.
  tkToBuffer/tkStore erkennen nur genau diese Kopie (`LT1.use`, nur während tkAddPcmTake gesetzt); tkStore kopiert dann jedes
  1-MB-Stück erst beim Schreiben (die Kopie hält und ändert sonst niemand). Blatt zu / neue Datei → Vorbereitung verworfen (≤ 1 s).
  Speicher: dieselben Puffer wie beim Ablegen, nur früher; Spitze beim Ablegen kleiner (keine 17 MB Stück-Kopien auf einmal).

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
Runde 1 (16:2x–16:33, Last 4,5–7,6; index mit c-Änderung **und** dem verworfenen Kachel-Versuch), Runde 2 (c, Fassung vor der Prüfung, Last 7,4–8,9).
**Prüfer-Befund 2:** die index-Spalte von a, a2 und b stammt in **allen** Zeilen (beide Größen) aus Runde 1, also mit dem verworfenen
`lt1GlChunks` (Rohdaten: `LT1.n/gUp` gibt es nur in index.vor-lt1b.html). Für die Endfassung gibt es keine eigene a/b-Messung: ihr
Spektral-Code ist byte-gleich mit der Basis (diff) → a/b der Endfassung = basis-Spalte.

| Fall | Größe | basis Median / Max (Läufe > 50) | index Median / Max (Läufe > 50) | Bild/Ergebnis gleich |
|---|---|---|---|---|
| a Sprünge (alle Kacheln schon da) | 926×428 | 60 / 62 (3 von 3) | 72 / 79 (2 von 3) *verworfener Versuch* | ja (Canvas-md5) |
| a | 428×926 | 0 / 98 (1 von 3) | 71 / 88 (2 von 3) *verworfener Versuch* | ja |
| a2 Sprünge nach FFT-Wechsel im Zoom | 926×428 | 81 / 183 | 107 / 258 *verworfener Versuch* | ja |
| a2 | 428×926 | 126 / 126 | 68 / 114 *verworfener Versuch* | ja |
| b FFT 4096→8192→4096 | 926×428 | 166 / 258 (12 Aufgaben > 50) | 262 / 517 (18) *verworfener Versuch* | ja |
| b | 428×926 | 167 / 176 (13) | 93 / 137 (15) *verworfener Versuch* | ja |
| **c Ablegen** (Runde 1+2, je 6 Läufe) | 926×428 | **83 / 142** (5 von 6) | **57 / 70** (4 von 6) | ja (Daten + Raster-DOM) |
| **c** | 428×926 | 0 / 66 (2 von 6) | 0 / 67 (1 von 6) | ja |
| **c imp1Place-Dauer** | 926×428 | Median **70 ms** (40–139) | Median **49 ms** (34–68) | |
| **c imp1Place-Dauer** | 428×926 | Median **41 ms** (36–55) | Median **34,5 ms** (30–63) | |
| c Einzellauf in Ruhe (Last 2,1) | 926×428 | 58 (imp1Place 55 ms) | **0** (imp1Place 42 ms) | ja |

Lesart: a/b in A und B von der Last bestimmt (Grafik-Warten, kein Skript; a ohne Upload ist für A und B derselbe Code-Weg).
c: das zweite buildGrid fällt weg (−8…−20 ms je Ablegen, unter Last mehr); in Ruhe keine Long Task mehr, unter Last 7–9 auf
4 Kernen in 926×428 noch 53–70 ms (Basis 66–142).
Rohdaten: `lt1-test-926x428.out`, `lt1-test-428x926.out`, `lt1-test-a2.out`, `lt1-test-c-final.out` (+ .json), Spuren mit `lt1-trace.mjs`.
**Die c-Zeilen oben sind die Fassung vor der Prüfung (nur Teil 1, kurze 8-Takt-Datei).** Endfassung mit Teil 2 und langen Liedern:
Abschnitt „Prüfung“ (c: keine Long Task beim Ablegen in 6 von 6 Paket-Läufen; 3-min-Lied imp1Place ~27–34 ms statt ~135 ms).

## Regression (reg.sh → reg.log, Ausgaben in reg/)
**Berichtigt (Prüfer-Befund 3):** imp1 (16:33:48), imp2 (16:33:59) und spk12-3 Lauf 1 (16:31) liefen auf dem Zwischenstand mit
Kachel-Versuch (index.html endgültig erst 16:33:58). spk12-3 wurde als index2 auf der Fassung vor der Prüfung wiederholt (47/0),
imp1/imp2 hat der Prüfer auf ihr nachgeholt: imp1 „ALLE OK (156 s)“, imp2 „ALLE OK“. Die übrigen Zeilen = Fassung vor der Prüfung.
Nach Teil 2 (Endfassung) neu gelaufen: siehe „Prüfung“.
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


## Pflichtprüfungen (Endfassung nach Prüfung)
Endfassung `index.html` md5 **2a3260c23ee01950b1fac4a3d4223829** (Basis rel-4730 69f50c189dbab745ebdf81a415838208; Fassung vor der
Prüfung 88a53dabe895d842acfdff7ff26f1844 = index.vor-lt1c.html):
topdefs (NODE_PATH=/opt/node-tools/node_modules) „Skripte 26, Namen 7926, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ ·
smoke errors [] (smoke.png) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.73.0' unverändert ·
`git diff --no-index --stat`: 69 insertions(+), 2 deletions(-) = 67 neue Zeilen (Block 63 Zeilen 109204–109266 + 4 neue Haken-Zeilen)
und 2 ergänzte Zeilen (Haken 2 und 6). Keine sichtbare Änderung (Raster-DOM A = B).
(Berichtigt, Prüfer-Befund 4: die Fassung vor der Prüfung hatte 15 Block-Zeilen 109203–109217, 16 neue + 1 ergänzte Zeile – nicht 13/17.)

## Offen
- **a/b nicht erreicht (Long Tasks > 50 ms bleiben, in A und B gleich):** Ursache ist kein Skript, sondern das Warten des Hauptfadens
  auf die Grafik beim Zurücklesen der WebGL-Leinwand (Software-Compositing im Test, SwiftShader auf der CPU): Zeichnen der
  Vollfläche (1852 × 856 px, Mipmap-Textur + Farbtabelle) und Hochladen neuer Kacheln (1 MB + Mipmaps). Kleiner wird das nur
  - mit dem Spektrum-Zeichnen in einem Worker (OffscreenCanvas, `transferControlToOffscreen`): dann wartet nie der Hauptfaden.
    Großer Umbau (alle GL-Aufrufe, Tönung, FOKUS1-Stücke, Kontextverlust, CPU-Rückfall) → offen, eigener Punkt (Profi-Weg).
  - oder mit sichtbaren Änderungen (z. B. halbe Auflösung während der Bewegung) → erst Funk.
  Der Versuch „eine Textur je Bild“ ist gemessen und verworfen (siehe oben). Auf echten Geräten mit GPU-Compositing liest der
  Browser die Leinwand nicht zurück; dort ist die Wartezeit nicht im Hauptfaden – Messung auf dem iPhone wäre der nächste Beleg.
- c Rest: imp1Place hat noch ~25–35 ms am Stück (neue Spur „Original“ inkl. erstem buildGrid, normSong, Verlauf, Toast, imp1Paint),
  unter Last 8 auch 55–68 ms; danach gelegentlich ein Bild > 50 ms (Raster/Song neu zeichnen). Weiter teilen hieße das synchrone
  `place()` (Rückgabe, ein ↶) aufzubrechen oder buildGrid in restoreTrack zu verschieben (alle Aufrufer betroffen) → offen.
- c nicht vorbereitet (alter Weg, Zeiten wie Basis): Gesang (`vox`, eigener Take-Weg – Vorbereitung läuft, wird nicht genommen), Audio
  wird ans Projekt-Tempo gedehnt (nx1; legt sofort nach dem Dehnen ab), „1“/Tempo im Blatt von Hand verschoben (Versatz passt nicht),
  Ablegen schneller als die Vorbereitung (3 min ≈ 0,1–0,3 s nach „fertig“).
- Vorbereitung: Scheiben im Median ~8 ms, aber in 2 von 26 Läufen (Last 7–9) eine Scheibe 87 bzw. 106 ms (Füll-Schleife; vermutlich
  Speicher/Planer unter Last – die Schleife prüft die Zeit alle 131072 Proben). Liegt in der Pause zwischen „fertig“ und dem Tipp,
  nicht im Tipp; dieselbe Arbeit steckt in der Basis im Ablegen selbst (94–287 ms).
- Nebenbefund: der erste Tipp einer Sitzung startet den Ton (`ensureAudio` → Drum-Puffer, Wellen, Hall) 55 ms am Stück – eigener
  Punkt für die Ladezeit-Liste (nicht a–c).
- Nebenbefund: LoAF (`long-animation-frame`) meldet die Grafik-Warte-Aufgaben ohne Skript-Anteil; für a/b ist die CDP-Spur
  (`lt1-trace.mjs`) der Beleg, nicht LoAF.

## Prüfung (unabhängiger Prüfer, Befunde → Nachbesserung 16:56–17:20)
| # | Befund (Schwere) | Ergebnis | Zahl |
|---|---|---|---|
| 1 | Ziel c nur für die 8-Takt-Datei; bei 3-min-Lied imp1Place 140–450 ms in A und B (mittel) | **behoben** (Teil 2: Take im Leerlauf vorbereiten) | s10 (90 Takte, 3 min): imp1Place Median **27 / 34 ms** (index, 428×926 / 926×428, n = 8 / 7) statt **134 / 137 ms** (basis); Long Task beim Ablegen index 0 von 8 / 3 von 7 (71, 172, 60 bei Last ~8), basis 8 von 8 / 7 von 7 (max 284 / 215) |
| 2 | index-Spalte a/a2/b durchweg mit verworfenem lt1GlChunks, nur teilweise gekennzeichnet (klein) | **behoben** | alle 6 Zeilen gekennzeichnet; Endfassung a/b = basis (Spektral-Code byte-gleich) |
| 3 | „Regression (Endfassung)“: imp1/imp2/spk12-3 Lauf 1 liefen auf dem Zwischenstand (klein) | **behoben** | reg.log + Regression-Abschnitt berichtigt; Prüfer-Nachlauf imp1 ALLE OK (156 s), imp2 ALLE OK; nach Teil 2 neu (s. u.) |
| 4 | Zählfehler Block/Diff (klein) | **behoben** | vorher 15 Block-Zeilen, 16 neue + 1 ergänzte; jetzt 63 / 67 + 2 (Pflichtprüfungen) |

Ursache Befund 1 (CPU-Profil, 90 Takte, `vx/nach/probe/probe-place.mjs … 120 90`): imp1Place 107 ms, davon imp1Take 69 ms =
tkToBuffer (Int16 → AudioBuffer) 35 ms + tkStore (alle 1-MB-Stücke sofort kopieren) 21 ms + Kopie ab Song-Takt 0 12 ms.
Teil 2 nimmt genau diese Arbeit aus dem Tipp (Vorbereitung im Leerlauf in Scheiben, Stück-Kopien erst beim Schreiben).

Messung Endfassung (`lt1-imp-ab.mjs` = Prüfer-Skript p-imp.mjs + Audio-Vergleich: AudioBuffer-Hash und gespeicherte Stücke je Take
über tkPcm, Vorbereitungs-Treffer; A/B abwechselnd, STOP=1; Last 1,8–9,3; Rohdaten `ab/*.out|json`):
| Fall | Größe | index imp1Place Median (Spanne) · Long Task > 50 beim Ablegen | basis | Ergebnis A = B |
|---|---|---|---|---|
| s10 90 Takte 3 min | 428×926 (n 8) | 27 (26–36) · 0 von 8 | 134 (94–275) · 8 von 8, max 284 | ja (Daten, Raster ↶/↷, Audio) |
| s10 | 926×428 (n 7) | 34 (28–68) · 3 von 7 (71/172/60, Last 8) | 137 (101–211) · 7 von 7, max 215 | ja |
| s11 64 Takte 48 kHz Spur | 926×428 (n 4) | 28 (25–33) · 0 von 4 | 130 (86–284) · 4 von 4 | ja |
| s6 48 Takte | 428×926 (n 5) | 34 (25–57) · 1 von 5 (61) | 69 (56–147) · 5 von 5 | ja |
| s3 Loop 16 Takte | beide (n 8) | 25 / 36,5 · 3 von 8 (235/106+158/56, erste Runde unter Last) | 46,5 / 49,5 · 4 von 8 | ja |
| s1, s2, s4, s5, s7, s8, s9, s11 (je 1) | beide | s1 31/43, s2 33/49, s4 41/46, s5 19/13, s7 56/39, s8 34/36, s9 10/9, s11 40 | s1 89/57, s2 74/39, s4 48/81, s5 19/74, s7 33/39, s8 60/54, s9 11/8, s11 96 | ja; s8 nur ↶-Raster ≠ (Wiedergabe-Stand, schwankt auch zwischen zwei Läufen derselben Datei, Prüfer p-imp-s8) |
Vorbereitung genommen (`LT1.preHit`) in allen Fällen außer s4 (Gesang: eigener Weg) und s9 2. Import (gedehnt) – dort alter Weg, gleich.
Audio: AudioBuffer-Hash und gespeicherte PCM-Stücke in jedem Lauf A = B (z. B. s10 `8688000:48000:c0c075aa` / `83b614ff`).

Paket-Test `lt1-test.mjs` ONLY=c REPS=3 (8 Takte, Endfassung, Last 3,8–5,3; `lt1-test-c-pruef.out`):
c 926×428 basis median 52 max 68 (2× > 50) | index **0 / 0 (0×)**; c 428×926 basis 0 / 81 (1×) | index **0 / 0 (0×)**; Ergebnis gleich.
imp1Place index 23–43 ms, basis 36–66 ms.

Regression nach Teil 2: imp2 ALLE OK (ab/imp2-c.out), imp1 ALLE OK 148 s (ab/imp1-c.out), spk6 ALLES OK 26, spk5 ALLES OK 24
(reg.log); Endfassung (mit Messzeile preMs/preK): imp1/imp2 siehe reg.log `index-final`. Spektral-Tests (spk12-1/2/3, fokus1, fokus1k,
spkfix) nicht neu: Teil 2 ändert keinen Spektral-Code; tkToBuffer/tkStore-Haken greifen nur während lt1Take (`LT1.use`).

