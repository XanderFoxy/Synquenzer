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
(wird unten eingetragen)

## Tests
(wird unten eingetragen)

## Pflicht
(wird unten eingetragen)

## Offen
(wird unten eingetragen)
