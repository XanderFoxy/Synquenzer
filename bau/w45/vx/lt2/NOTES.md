# LT2 – restliche Long Tasks > 50 ms im Hauptfaden (Paket LT2, Basis 4.76.1 = rel-4761, VERSION bleibt '4.76.1')

Ziel (Auftrag): 0 Long Tasks > 50 ms bei Last < 4 in a) Kachel-Zeichnen nach Ansicht-Sprung, a2) Sprung nach FFT-Wechsel im Zoom,
b) FFT-Größe umschalten, c) Import-Ablegen, d) Fokus „Alles / Nur Rest / Nur Gefundenes“ umschalten. Ergebnis byte-gleich.

## Verfahren
- `lt2-test.mjs <index> <basis>` = Kopie von `vx/lt1/lt1-test.mjs` + **Fall d** (Fokus-Lied wie fokus1-test: Ton A 220 Hz + Ton B 311 Hz +
  Rauschen, A als Note in eine Ebene; dann per Tipp im Ansicht-Klappfenster Nur Rest → Alles → Nur Gefundenes → Alles, je Schritt bis
  `__fokus1.idle()` und alle Texturen da). A/B im selben Lauf, je Lauf frischer Browser-Kontext, Reihenfolge abwechselnd, 926×428 und 428×926.
  PerformanceObserver `longtask` (+ LoAF), Last (loadavg) je Lauf. Bildvergleich: a/a2/b `toDataURL`-md5 nach dem Beruhigen; d readPixels-
  Hash (FNV) des ganzen Bildes **je Fokus-Stufe** (rest/alles/gef/alles2). `TRACE=1` → CDP-Spur je Fokus-Schritt (Aufgaben > 40 ms mit Kindern).
- `lt2-gpu-probe.mjs <html> [WxH]`: Grafik-Kosten je Teil (je mit 1-px-readPixels als Zaun): Vollbild zeichnen, Kachel hochladen
  (mit/ohne Mipmaps), ganzes Bild zurücklesen, Shader-Varianten; für index zusätzlich Bild mit LT2 = Bild ohne LT2 in 7 Ansichten × 3 dB-Bereichen.
- `lt2-tint-probe.mjs <html>`: dasselbe mit Tönung (2 Ebenen).

## Ist-Messung VORHER (basis gegen basis, `vorher.out`, 05:17–05:23, Last 1,0–2,4 auf 4 Kernen; REPS 2 × 2 Läufe je Größe)
| Fall | 926×428 (längste je Lauf) | 428×926 | Läufe mit LT > 50 |
|---|---|---|---|
| a Ansicht-Sprünge | 0, 0, 0, 0 | 56, 0, 0, 0 | 1 / 8 |
| a2 Sprünge nach FFT-Wechsel | 0, 0, 53, 0 | 0, 0, 0, 0 | 1 / 8 |
| **b FFT 4096→8192→4096** | 60, 61, 138, 69 | 89, 68, 62, 59 | **8 / 8** (15 Aufgaben) |
| c Import-Ablegen | 0, 0, 0, 0 | 0, 0, 0, 0 | 0 / 8 |
| **d Fokus umschalten** (`dprobe.out`, `dtrace`) | 81 (rest 52, alles 81, alles2 81), 56, 73, 55 | – | **4 / 4** |

## Ursachen (Beleg)
1. **Alle verbliebenen Long Tasks in a/a2/b/d sind Grafik-Warten, kein Skript.** CDP-Spur (TRACE=1, Fall d, basis): jede Aufgabe > 40 ms =
   `ProxyMain::BeginMainFrame → Commit → LayerTreeHost::DoUpdateLayers → GLES2::ReadPixels → WaitForCmd/Finish` 30–65 ms; Skript im
   selben Bild 2–3 ms, Layout/Paint 3–7 ms. (Kopflos-Chromium mit Software-Compositing liest die WebGL-Leinwand je Bild zurück und wartet,
   bis die Grafik alle Befehle des Bildes erledigt hat – wie LT1 für a/b belegt.)
2. **Was die Grafik je Bild kostet** (`lt2-gpu-probe`, 926×428 → Leinwand 1244×584, Last ~2):
   | Teil | ms |
   |---|---|
   | Vollbild mit dem Spektrum-Shader (ohne Tönung, nl = 0) | **16–28** (Median ~19) |
   | dasselbe Bild, Shader **ohne** den Tönungs-Zweig | **9–10** |
   | nur Kachel-Textur abtasten (Mipmaps) | 6–7 · nur Füllen 2 |
   | eine Kachel hochladen 1024×984 R8 **+ Mipmaps** | 8–10 (ohne Mipmaps 0,5–1,5) |
   | ganzes Bild zurücklesen | 3–4 |
   → Der Tönungs-Zweig `if(nl>0){…}` kostet die Software-Grafik ~8–10 ms je Vollbild, **auch wenn er nicht genommen wird** (nl = 0);
   das ist fast die Hälfte des Zeichnens.
3. **b (FFT-Wechsel)**: spk1SpecLoad leert das Spektrum, die Stücke kommen nach und nach vom Worker; spk1GlDraw lädt in einem Bild **jede**
   sichtbare neue Kachel hoch (je ~9 ms) → bei mehreren gleichzeitig angekommenen Stücken 60–140 ms am Stück.
4. **d (Fokus)**: Nur Rest / Nur Gefundenes: FOKUS1 lädt schon höchstens eine Kachel je Bild; je Bild also ~9 ms Hochladen + Vollbild
   (Tönung aus → bisher trotzdem der volle Shader) + Zurücklesen. „Alles“: ein Vollbild mit Tönung.
5. c (Import-Ablegen): bei Last < 4 keine Long Task (8/8 Läufe 0; LT1/LT1B haben imp1Place auf ~25 ms gebracht) – kein Handlungsbedarf.

## Änderung: Block `LT2-BEGIN … LT2-END` hinter LT1-END + 2 einzeilige Haken in spk1GlDraw
| # | Stelle | Haken |
|---|---|---|
| 1 | spk1GlDraw, 1. Zeile (Zeile ergänzt) | `const G = typeof lt2G === 'function' ? lt2G(U) : U.gl, gl = G.gl, …   /* LT2: … */` |
| 2 | spk1GlDraw, Kachel-Schleife (Zeile ergänzt) | `if (!c.tex) { if (typeof lt2Up === 'function' && lt2Up(U)) continue; c.tex = G.tex(…); }   /* LT2: … */` |

- **Teil 1 – Programm ohne Tönungs-Zweig** (`lt2G`, `lt2Make`, `LT2_FS0`): ist keine Tönung aktiv (nl = 0: keine Ebenen, Fokus „Nur Rest“, während
  Fokus-Stücke nachkommen, FFT-Aufbau …), zeichnet spk1GlDraw mit einem zweiten Programm: derselbe Vertex-Shader, derselbe Fragment-Shader
  bis vor `if(nl>0)`, dann `o=vec4(c,1.0);` – also genau der Rechenweg, den das Original bei nl = 0 nimmt. Übersetzt wird beim ersten Zeichnen
  per setTimeout **nach** dem Bild (dieses Bild noch mit dem Original), je Grafik-Kontext in einer WeakMap; gleiche Attribut-Stelle
  (`bindAttribLocation`) → VAO bleibt gültig. Mit Tönung: Original-Programm. Fehler beim Übersetzen → `LT2.err`, alter Weg.
- **Teil 2 – Aufbau-Phase: höchstens eine neue Kachel je Bild** (`lt2Frame`, `lt2Up`, `LT2_DONE`): solange ein Spektrum aufgebaut wird
  (neues `U.spec` aus spk1SpecLoad, bis zum ersten vollständigen Bild nach dem Rechnen), lädt spk1GlDraw je Bild nur eine neue Kachel; die
  übrigen bleiben ein Bild länger Hintergrund – genau wie Stücke, die noch nicht gerechnet sind (beim FFT-Wechsel/Öffnen ist die Fläche ohnehin
  dunkel und füllt sich stückweise) – und das nächste Bild wird sofort angefordert. Danach (Ansicht-Sprung, Zoom, Ziehen) wie bisher alle im
  selben Bild: **keine Lücken beim Bewegen**. Während FOKUS1 eigene Stücke eintauscht: alter Weg (FOKUS1 taktet selbst).
- Verworfen (gemessen): Programm mit fester Ebenen-Zahl für die Tönung (nl = 2): byte-gleich, aber nicht schneller (Median 41 vs 31 ms,
  `lt2-tint-probe`) → nicht eingebaut.
- Diff gegen basis: siehe „Pflicht“. Keine sichtbare Änderung (Endbilder byte-gleich, Bedienung gleich).

## Messung NACHHER
**Grafik-Probe (gleiches Gerät, Last ~2, index):** Vollbild ohne Tönung mit LT2 **10–14 ms** statt 14–22 ms mit dem Original-Programm
(`drawLt2` / `drawOrigProg`); **Bild gleich in 21 / 21 Fällen** (7 Ansichten × 3 dB-Bereiche, readPixels-Hash LT2 an/aus).

**A/B `nach.out`** (index md5 febbfca4…, basis = rel-4761, abwechselnd, REPS 3 je Größe; 05:26–05:36; Last 1,3–2,6 bis ~05:30, danach
3–9,7, weil Regression und fremde Agenten parallel liefen). Je Lauf längste Long Task (0 = keine > 50 ms), in Klammern Anzahl Aufgaben > 50:
| Fall | Größe | basis | index | Bild/Ergebnis gleich |
|---|---|---|---|---|
| a Ansicht-Sprünge | 926×428 | 0, 0, 0 (0) | 0, 0, 0 (0) | ja |
| a | 428×926 | 0, 0, 0 (0) | 0, 0, 0 (0) | ja |
| a2 Sprünge nach FFT-Wechsel | 926×428 | 0, 0, 60 (1) | 0, 0, 0 (0) | ja |
| a2 | 428×926 | 0, 0, 56 (2) – Last 7,7 | 0, 0, 86 (2) – Last 5,5 | ja |
| **b FFT 4096→8192→4096** | 926×428 | **62, 104, 75 (9)** | **0** (Last 2,6), 115 (Last 5,2), 60 (Last 5,9) **(6)** | ja |
| **b** | 428×926 | **131, 88, 94 (12)** – Last 6–9,7 | **88, 0, 0 (5)** – Last 6,5–9 | ja |
| **d Fokus umschalten** | 926×428 | 0, **76, 70 (6)** – Last 2,8–4,4 | **0, 0, 63 (1)** – Last 3,1–5 | ja (je Stufe rest/alles/gef/alles2) |
| d | 428×926 | 71, 86, 67 (11) – Last 5–5,7 | 86, 0, 87 (7) – Last 4,6–6 | ja |
Einzelprobe b in Ruhe (`probe-b`, Last 1,0–1,3): index **0** / basis 60. Zähler index: b je Lauf 20 Kacheln einzeln hochgeladen, 19–28 Bilder
mit ausgelassener Kachel (`skip`), `mk` 1 (Programm einmal übersetzt), `err` leer; d: nT 6–7 Bilder mit Tönung (Original-Programm), 11–12 ohne.

**A/B `nach2.out`** (b und d, REPS 2, 05:37–05:40, gleiche md5):
| Fall | Größe | basis | index | gleich |
|---|---|---|---|---|
| b | 926×428 (Last 4,8–5,6) | 100, 127 (6 Aufgaben > 50) | 53, 61 (3) | ja |
| b | 428×926 (Last 3,1–5,2) | 61, 69 (5) | **0, 0 (0)** | ja |
| d | 926×428 (Last 4,9–5,2) | 106, 93 (13) | 64, 63 (4) | ja |
| d | 428×926 (Last 2,5–2,9) | 54, 0 (1) | 0, 52 (1) | ja |

Lesart: Bei Last < 4 ist **b** jetzt ohne Long Task (vorher 8 / 8 Läufe mit 59–138 ms), **d** in 926×428 ohne bzw. mit einer (63 ms, Last 3);
a/a2 waren bei Last < 4 schon in der Basis fast frei und bleiben es. Über Last 4 bleiben Long Tasks in A und B, im Index weniger
(b 11 statt 21 Aufgaben > 50, d 8 statt 17). c (Import) unverändert 0 bei Last < 4 (vorher-Lauf).

## Tests (Regression = Kopien in `reg/`, Ausgaben `reg/*.log`, Ablauf `reg/reg.log`; index md5 febbfca4…)
| Test | index (LT2) | Vergleich 4.76.0 (r4760) | Bemerkung |
|---|---|---|---|
| spk12-test3 (inkl. hauptfaden-ohne-long-task, 3 Größen) | **47 / 0** | 47 / 0 | |
| fokus1-kern-test | **26 / 0** | 26 / 0 | |
| fok2-test (A/B gegen rel-4750) | **21 OK / 0** | OK | |
| spk12-test | **98 / 0** | 98 / 0 | Last 3,4–4,4 |
| spk12-test2 | **72 / 0** | 72 / 0 | |
| spk6-test | **ALLES OK** | OK | |
| spk1-test | 17 OK, 1 FEHLER `verfeinern-verbessert-ziel` | **derselbe** FEHLER | vorbestehend (Noten-Verfeinerung, nicht Zeichnen) |
| fokus1-test (LONG=0, ohne 3-min-Teil) | **47 OK / 3 FEHLER** | 44 / 7 (mit 3-min-Teil) | alle 3 = `umschalten-* longtasks<=50` in 926×428 bei **Last 5,5–9** (fremde Agenten + eigene Läufe); 428×926 alle drei Umschalten jetzt OK (4.76.0: FEHLER); Bild-/Byte-Prüfungen OK (alles-byte-gleich, endstand-byte-gleich, original-unberuehrt, CPU-Rückfall) |
| spk5-test | **ALLES OK · 24 Prüfungen** | OK | 1. Lauf ohne Hilfsdatei lib.mjs → mit Kopie nachgeholt (reg2.sh) |
| spkfix-test | **ALLES OK 11 Prüfungen** | OK | brauchte Kopien von sonde/*.mjs und spk7/lib.mjs |
| lt2-test a/a2/b/d | Bild/Ergebnis gleich in **allen** 48 + 16 Läufen | | |

## Pflicht (`pflicht.out`, index md5 **febbfca4bf95421608593fa7e5cebfef**, basis rel-4761 e4dc1b9599eef2656308cb990e407f37)
topdefs „Skripte 26, Namen 7996, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ · smoke `title SYNQUENZER errors []` (smoke.png) ·
„MS 2000“ 1× (= basis) · „^  live: true,“ 1× (= basis) · VERSION '4.76.1' unverändert · Markenwörter (Liste wie bisher) 176 = basis 176 ·
`git diff --no-index --stat`: **52 insertions(+), 2 deletions(-)** = Block 50 Zeilen (109972–110021, nur neue Logik) + 2 ergänzte Haken-Zeilen in
spk1GlDraw (Kennung „LT2“ im Kommentar). Diff: `lt2.diff`. Keine Oberflächen-Texte, keine sichtbare Änderung am Endbild/Bedienung.

## Offen
- **Ziel bei Last < 4 erreicht für b (0 in den Läufen unter Last 4), a, a2, c; d fast** (926×428 1 Lauf mit 63 ms bei Last 3,1). Der Rest
  ist das Vollbild **mit Tönung** (Ebenen vorhanden, Fokus „Alles“ / Ende „Gefundenes“): Original-Programm 30 ms (2 Ebenen) + Zurücklesen
  + Layout. Programm mit fester Ebenen-Zahl gemessen und verworfen (nicht schneller). Weiter nur mit: Tönung in eine eigene, kleinere
  Textur vorab mischen (Bild ändert sich in den letzten Bits → erst prüfen) oder Zeichnen im Worker (OffscreenCanvas – großer Umbau, LT1-Offen).
- Über Last 4: Long Tasks bleiben in A und B (Grafik-Warten skaliert mit der CPU-Last), im Index etwa halb so viele.
- Alle Messungen im Kopflos-Chromium mit Software-Grafik; auf dem iPhone (GPU-Compositing) gibt es das Zurücklesen nicht, die Grafikarbeit
  selbst wird durch Teil 1 aber auch dort kleiner. Byte-Gleichheit nur hier geprüft (gleicher Rechenweg im Shader; ein anderer
  Shader-Übersetzer könnte theoretisch anders runden – nicht am Gerät geprüft).
- Teil 2 macht den Aufbau beim FFT-Wechsel/Öffnen stückweiter (je Bild eine neue Kachel statt alle in einem langen Bild) – Zwischenbilder
  wie beim normalen Nachkommen der Stücke, Endbild gleich. Falls Xander das sichtbar anders findet: `LT2.on = false` schaltet beides ab.
- a2 nach Sprung in noch nie gesehene Bereiche lädt wie bisher alle neuen Kacheln im selben Bild (bewusst, sonst Lücken beim Bewegen);
  Vorab-Hochladen unsichtbarer Kacheln im Leerlauf hieße mehr Grafik-Speicher → erst Funk.

## Prüfung (06:21–, Befunde des Prüfers nachgeprüft und behoben; Sicherung `index.vor-pruef.html` = febbfca4…)
Endfassung `index.html` md5 **47b4ffc8800ac6b042908f3353d58dfb** (VERSION '4.76.1' unverändert). Änderungen nur im Block LT2-BEGIN…END
(`lt2-pruef.diff`: +9/−7 gegen die Sicherung; gegen basis jetzt +54/−2 = Block 52 Zeilen + die 2 Haken wie bisher, `lt2.diff`).
Last während der ganzen Prüfung 14–29 (fremde Agenten) → Long-Task-Zahlen nur als A/B im selben Lauf lesbar.

| # | Befund (Prüfer) | nachgeprüft | Änderung |
|---|---|---|---|
| 1 | Teil 1: `V.G = Object.assign({}, G, …)` ist eine Momentaufnahme; spk1TintLoad löscht danach G.ta/G.tb und setzt neue → V.G bindet gelöschte Texturen, WebGL INVALID_OPERATION in jedem Bild ohne Tönung (mittel) | **bestätigt**: Gegenprobe Fall G (lt2p-test) auf der Sicherung: 24 Warnungen „bindTexture: attempt to use a deleted object“, gl.getError() 1282 in 3 von 7 Stufen, V.G.ta ≠ G.ta; basis 0. Bilder trotzdem gleich (Shader ohne Tönung liest ta/tb nicht) | `V.G = Object.assign(Object.create(G), {p, u})` – erbt gl/vao/tex/lut/ta/tb immer aktuell von G. Einzige Schreibstelle auf G-Felder ist spk1TintLoad (auf U.gl = G selbst) → kommt an. Danach: 0 Meldungen, getError 0 in allen 7 Stufen, V.G.ta === G.ta |
| 2 | Teil 2: feste Rate „eine Kachel je Bild“ – auf schneller Grafik kommt das volle Bild beim FFT-Rückwechsel später als bisher (16 Kacheln ≥ 16 Bilder) (klein) | **bestätigt** (Fall R „langsam“ = alte feste Rate: Rückwechsel 16 Bilder, 15 davon mit zurückgestellten Kacheln) | Rate folgt der Bildfolge (wie FOKUS1 mit F.gap): wurde in einem Bild etwas zurückgestellt, misst das nächste Bild den Abstand; < 22 ms (Grafik hält mit) → k verdoppeln bis 16, sonst halbieren bis 1. Uhr `LT2.now` (für den Test austauschbar). Schnelle Grafik: 1→2→4→8→16 = nach ≤ 4 Bildern nichts mehr zurückgestellt; langsame Grafik (hier im Kopflos-Chromium, echter Takt): k bleibt 1 wie bisher |
| 3 | „CLAUDE“ ohne Groß/Klein 35 → 36 (Kommentar „CLAUDE.md Vorrang 1“) (klein) | **bestätigt**; zusätzlich „webgl“ ohne Groß/Klein 5 → 6 (Kommentar „WebGL-Leinwand“) | Kommentar „Projektregeln Vorrang 1“, „Grafik-Leinwand“ → claude 35 = basis, webgl 5 = basis; alle anderen geprüften Wörter gleich |

### Neuer Test `lt2p-test.mjs <index> <basis>` (A/B, frischer Kontext je Lauf; Ausgabe `lt2p-test.out`, `lt2p-test.json`)
- **Fall G** (Befund 1): Fokus-Lied mit Ebene wie p3/fokus1-test, per Tipp Nur Rest → Alles → Nur Gefundenes → Alles, Ebenen-Farben aus,
  neue Tönung (spk1TintLoad) an, dann aus; je Stufe Bild erzwingen, gl.getError(), readPixels-Hash. Zählt **alle** WebGL-Konsolenmeldungen
  (auch Warnungen; der Treiber-Hinweis „GPU stall due to ReadPixels“ vom readPixels des Tests selbst wird getrennt gezählt).
- **Fall R** (Befund 2): 180-s-Stück, ganze Ansicht (16 Kacheln), FFT 4096 → 1024 (neu gerechnet) → 4096 (schon gerechnet); LT2-Uhr vorgetäuscht
  „schnell“ (+16 ms je Bild) / „langsam“ (+50 ms) / „echt“; je Bild Zahl der hochgeladenen und zurückgestellten Kacheln; Endbild-Hash gegen basis.
- Ergebnis Endfassung: **ALLES OK · 12 Prüfungen** (Last 14–16). Gegenprobe Fall G auf `index.vor-pruef.html`: **3 FEHLER** (Meldungen 24,
  getError 1282, Erben) → der Test erkennt Befund 1 (`neg/lt2p-test-G-vorpruef.out`).

| Fall R (Rückwechsel auf 4096, 16 Kacheln) | Bilder mit Hochladen | davon mit zurückgestellten Kacheln | Kacheln je Bild | komplett |
|---|---|---|---|---|
| index „schnell“ (Bildabstand 16 ms) | 5 | 4 | 1, 2, 4, 8, 1 | 333 ms |
| index „langsam“ (50 ms) = alte feste Rate | 16 | 15 | je 1 | 662 ms |
| index „echt“ (Kopflos, Software-Grafik, Last 14) | 16 | 15 | je 1 (k blieb 1) | 645 ms, Long Tasks 1× 57 ms |
| basis | 2 | – | 4, 12 | 495 ms, Long Tasks 2× max 324 ms |
Erstes Rechnen (4096 → 1024): Stücke kommen langsamer als die Bilder → in keinem Modus etwas zurückgestellt, je Bild 1 Kachel (wie basis).
Endbilder in allen Modi byte-gleich basis (7eb53ee5 / 1420d956), keine GL-Fehler.

### Regression (Endfassung 47b4ffc8; Kopien in `reg/`, Abläufe `reg/reg3.log`, `reg/reg4.log`, `reg/reg5.log`; Last 11–29)
Wegen der hohen Last (fremde Agenten) jeder Test mit Long-Task-Prüfung **A/B gleichzeitig** (index und basis parallel, gleiche Last):
| Test | index | basis (gleiche Last) | Bemerkung |
|---|---|---|---|
| lt2p-test (neu, G + R) | **ALLES OK 12** | – (A/B im Test) | Gegenprobe auf der Sicherung: 3 FEHLER (Befund 1) |
| spk12-test3 | 44 / 3 (`r-spk12c-index.log`; 1. Lauf Last 28: 44 / 3) | 44 / 3 | alle 3 = hauptfaden-ohne-long-task (Bedienung Ähnliche/Abtasten/Merken) in beiden |
| fokus1-test (LONG=0) | 44 / 6 (2 Läufe gleich) | 44 / 6 | alle 6 = umschalten-* longtasks<=50 in beiden; alle Byte-/Bild-Prüfungen OK |
| fok2-test (gegen rel-4750) | 19 / 2 (1. Lauf Last 22: 18 / 3) | 18 / 3 | nur zeit-*-Long-Tasks und abbruch-Zeit (Worker) – in basis ebenso; Byte-Prüfungen OK |
| fokus1-kern-test | **26 / 0** | | |
| spk6-test | **ALLES OK** | | |
| spk5-test | **ALLES OK · 24** | | |
| spkfix-test | **ALLES OK 11** | | |
| lt2-test a2/b/d (REPS 1, beide Größen) | Ergebnis/Bild gleich **6 / 6** | | Long Tasks bei Last 11–17 in A und B (Einzelläufe) |
| lt2-test a2/b 926×428 (REPS 2, Last 5–10, `reg/r2-lt2-a2b.log`) | **b: 0, 0** (0 Aufgaben > 50) · a2: 82, 0 (2) · Bild gleich | b: 89, 89 (3) · a2: 88, 156 (6) | echte Uhr: b je Lauf 20 Kacheln einzeln, k blieb 1 |

### Pflicht (`pflicht-pruef.out`, Endfassung 47b4ffc8800ac6b042908f3353d58dfb)
topdefs „Skripte 26, Namen 7996, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ · smoke `title SYNQUENZER errors []`, Bild
`smoke.png` 5ce4b405… = basis (1. smoke-Lauf bei Last 12 anderes Bild `smoke-pruef-lauf1.png`; Wiederholung index, basis und Sicherung je
5ce4b405 → Zeitpunkt der Aufnahme unter Last, nicht der Code) · „MS 2000“ 1× (= basis) · „^  live: true,“ 1× (= basis) · VERSION '4.76.1' ·
Markenwörter ohne Groß/Klein (claude, anthropic, openai, chatgpt, gemini, google, apple, iphone, ipad, microsoft, amazon, spotify, youtube,
instagram, tiktok, whatsapp, facebook, korg, roland, yamaha, moog, ableton, logic, cubase, webgl) alle = basis · Diff gegen basis +54/−2, nur Block
LT2 + die 2 Haken (Kennung „LT2“) · keine Oberflächen-Texte, keine sichtbare Änderung an Endbild/Bedienung.

### Offen (nach der Prüfung)
- Fall d (Fokus umschalten) bleibt wie vom Bauer benannt bei Last um 3–5 nicht ganz unter 50 ms (Vollbild **mit** Tönung). Unverändert.
- Teil 2 auf schneller Grafik jetzt k 1→2→4→8→16 (nach ≤ 4 Bildern nichts mehr zurückgestellt; Rückwechsel im vorgetäuschten 16-ms-Takt
  333 ms bis vollständig, basis 495 ms). Auf langsamer Grafik (Kopflos/Software, alte Geräte) baut sich das Bild beim FFT-Wechsel weiter
  stückweise auf (je Bild eine Kachel, dafür ohne lange Hänger). Das ist sichtbar anders als vorher → nach CLAUDE.md Regel 3 im Funk ansprechen
  (`LT2.on = false` schaltet beides ab). Am echten iPhone nicht gemessen: ob der Bildabstand dort < 22 ms bleibt, zeigt erst das Gerät.
- k bleibt über Spektren hinweg erhalten (Geräte-Eigenschaft): wird ein schnelles Gerät plötzlich langsam (Wärme), kann das erste Aufbau-Bild
  bis zu k Kacheln laden (höchstens wie basis), danach halbiert sich k.
- Long-Task-Prüfungen in spk12c/fokus1/fok2 scheitern bei Last ≥ 11 in index **und** basis gleich (A/B parallel); bei niedriger Last nicht
  erneut gelaufen außer lt2-test a2/b (Last 5–10) und fok2 (2. Lauf, s. reg5.log).
