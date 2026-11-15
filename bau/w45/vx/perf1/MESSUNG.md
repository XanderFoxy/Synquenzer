# PERF1 – Messung: vom Laden bis bedienbar (4.69.0, Kandidat rel-4690)

Gemessen am 15.11. an `basis.html` = `index.html` (unverändert, `cmp` gleich). Nichts an der App geändert.

## Aufbau der Messung

- Browser-Automat mit DevTools-Protokoll, Chromium, Bildschirm 428×926, Pixelfaktor 3, Touch, mobil.
- **CPU-Drosselung 4×** als grobe Näherung für das Telefon; zum Vergleich ungedrosselt (1×). Die Rechner-CPU war während der
  Messung mit anderen Läufen belegt (Last ~2–4,5 auf 4 Kernen), deshalb alle Werte als **Median aus 3 Läufen**, alle Läufe
  nacheinander. Die Werte bei 4× liegen eher zu hoch (das Telefon hat einen schnellen Einzelkern); die Werte bei 1× liegen
  eher zu niedrig. Das Telefon liegt dazwischen.
- Seite über einen lokalen Server, **ohne Netz-Drosselung**: die Zeiten unten sind reine Rechenzeit. Die Netzzeit steht in
  Abschnitt 1 extra.
- „bereit“ = `#app` verliert die Klasse `loading` (Ende von `boot()`, Oberfläche bedienbar).
- „Tippen“ = echter Touch auf ▶ (`#bPlay`), sobald die App bereit ist (erste Eingabe startet auch Audio).
- Werkzeuge: `mess/start.mjs` (Läufe), `mess/spur.cjs` (Trace + CPU-Profil → Blöcke), `mess/groesse.cjs` (Netz-Größe),
  `mess/oben.cjs` (statische Liste der Start-Anweisungen), `mess/anteil.cjs` (Kommentar-Anteil, Block-Größen),
  `mess/kompil.cjs` (Übersetzungszeit original / ohne Kommentare / ohne Spektral-Blöcke), `mess/zusammen.cjs` (Mediane),
  `mess/serie.sh` (ganze Reihe). Rohdaten: `mess/d4-*.json`, `mess/d1-*.json`, `mess/d4-spur.ausw1/2.json`.

## 1. Netz-Größe

| Teil | roh | gzip -6 | brotli 5 | brotli 11 |
|---|---:|---:|---:|---:|
| ganze Datei | 8,80 MB (9 007 463 B) | **2,93 MB** | 2,53 MB | 2,14 MB |
| Haupt-Skript (1 Stück) | 6,54 MB | 2,20 MB (75 %) | 1,88 MB | 1,60 MB |
| Worklet-Quellen (9× `text/plain`) | 1,22 MB | 0,42 MB | 0,38 MB | 0,34 MB |
| kleine Skripte (23) | 0,60 MB | 0,20 MB | 0,19 MB | 0,17 MB |
| CSS (1) | 0,43 MB | 0,10 MB | 0,09 MB | 0,08 MB |

Größte Worklet-Texte: `sq-worklet-src` 412 K, `sq-mk-src` 301 K, `sq-bm-src` 166 K, `sq-g9-src` 103 K.
Haupt-Skript: 6 657 951 Zeichen, davon **16,5 % Kommentare** (1,10 M Zeichen) + 0,2 M Einrückung. 13 113 Zeichen außerhalb
Latin-1 → die Engine hält die ganze Quelle als 2-Byte-Text (~13 MB Quelltext-Speicher).
Ohne Kommentare/Einrückung: Haupt-Skript gzip 2,26 → **1,71 MB** (−0,55 MB).

Der Server der Online-Seite war aus dieser Umgebung nicht erreichbar (Proxy 403). Annahme nach bekanntem Verhalten: gzip
(kein brotli), `Cache-Control: max-age=600` + ETag. Übertragung je neuer Fassung also **~2,9 MB** (bei 20 Mbit/s ≈ 1,2 s,
bei 5 Mbit/s ≈ 4,7 s).

## 2. Start – Kennzahlen (Median, ms ab Navigation)

| Kennzahl | 4× gedrosselt | 1× |
|---|---:|---:|
| Antwort vollständig (lokal) | 548 | 179 |
| erste Darstellung (Gerüst mit `.loading`) | **448** | 144 |
| HTML fertig gelesen (domInteractive) | 2 166 | 496 |
| DOMContentLoaded | 2 358 | 543 |
| **bereit** (Oberfläche bedienbar) | **2 570** | **598** |
| load | 2 843 | 696 |
| lange Aufgaben bis bereit | 6 | 1 |
| längste Aufgabe (= Haupt-Skript übersetzen + Rumpf) | **1 224** | 216 |
| Sperrzeit bis bereit (Summe über 50 ms) | 1 619 | 166 |
| Speicher JS nach Start (nach GC) | 6,9 MB | 6,9 MB |
| DOM-Knoten / Listener | 1 822 / 431 | gleich |

## 3. Erstes Tippen und erstes Abspielen (▶ sofort nach „bereit“)

| Kennzahl | 4× | 1× |
|---|---:|---:|
| Eingabe-Verzögerung (bis der Handler läuft) | 17 | 8 |
| Verarbeitung pointerdown (Audio starten + ▶) | 308 | 127 |
| **erste Antwort auf dem Bildschirm** | **368** | **152** |
| lange Aufgaben in 8 s danach | 3 | 1 |
| Sperrzeit in 8 s danach | 425 | 78 |
| Speicher JS nach Abspielen (nach GC) | 8,9 MB | 8,7 MB |

Die App ist bei „bereit“ wirklich frei (Verzögerung < 20 ms). Die erste Antwort kostet die Audio-Einrichtung im Tipp selbst.

## 4. Wohin die Zeit geht (Trace + CPU-Profil, 4×, 2 Läufe; Trace macht alles ~25 % langsamer)

**Fenster Start (Navigation → bereit), Selbstzeit je Arbeit:**

| Arbeit | ms (Lauf 1) |
|---|---:|
| Haupt-Skript übersetzen (`v8.compile` 925 ms: Vor-Parsen 570, Parsen 321, Bytecode ~250) | **925** |
| Haupt-Skript Rumpf ausführen (`v8.run`) | 397 |
| HTML lesen (ParseHTML 476) + Text dekodieren 9 MB (266) | **742** |
| Layout 214, Style 146, CSS lesen 100, Text-Formen 87 | 547 |
| kleine Skripte (23 Stück zusammen) | ~130 |

**JS beim Start nach Funktion (inklusiv, ms, Lauf 1 / Lauf 2):**

| Funktion (Zeile, Block) | ms |
|---|---:|
| Haupt-Skript-Rumpf (Z 27566) | 384 / 355 |
| `init` (Z 108668) | 229 / 262 |
| – `buildGrid` → `mxApply` → `gl1MxFlat` (GL1, Z 82976) | 103/145 → 74/103 → 65/96 |
| – `renderPartBar` (grid) | 54 / 44 |
| erstes Bild `uiFrame` (frame loop) | 295 / 165 |
| – `kbLayout` → `fitModeLabels` → `stModeFit` (Messen von Text) | 129 / 16 |
| `demoProject` (Rumpf: `let S = demoProject()` Z 32938; in `init` noch einmal) | 86 / 79 |
| `lktBuild` (I2a, Adress-Tabelle, oben) | 42 / 57 |
| `BM_FACTORY` / Werksklänge (BM7, zwei sofort laufende Funktionen Z 27981, Z 28041) | 61 / 83 |
| `jam2Guide` (JAM2, Hilfe-Einträge, oben) | 17 / 9 |
| SP1, V4a/MAGIC, GEN4, UI1, ORI, GR2, GEN3, SND1, MK1 (oben) | je 5–15 |

**Blöcke, die beim Start Arbeit tun, obwohl ihre Seite zu ist:** BM7/BM6 (Werksklänge der Bit Mask gebaut), I2a (Adress-
Tabelle), JAM2 (Hilfe), GEN3/GEN4/GR2/SND1 (Stil-Tabellen), SP1, UI1, ORI – zusammen ~200 ms bei 4× (~45 ms bei 1×).
**Ohne messbare Start-Arbeit (< 3 ms), kosten nur Bytes und Übersetzen:** Spektral (SPK*, 575 K Code im Haupt-Skript),
Video (VD/VID/VV), Import (IMP 75 K), Gesang (VX 114 K, VOX, CHR), KI. Die Worklet-Quellen (1,22 MB) tun beim Start keine
JS-Arbeit; sie kosten nur Dekodieren/Lesen des HTML (~14 % der Bytes).

Übersetzungszeit (V8 allein, ungedrosselt, Median 7): original 121 ms, **ohne Kommentare 121 ms** (Kommentare kosten beim
Übersetzen nichts), **ohne SPK-Blöcke 110 ms** (−10 %). Übersetzen hängt am Code, nicht an Kommentaren; Bytes/Netz/HTML-Lesen
hängen an beidem.

**Fenster Leerlauf (bereit → Tippen, ~6 s, nichts läuft):** Hauptthread **17–19 % belegt** (4×). Fast alles die Bildschleife;
davon `renderPartBar` 130–193 ms: liest jedes Bild `clientWidth` (erzwingt Layout) und baut eine Signatur aus allen Teilen.

**Fenster erstes Abspielen (Tippen → +8 s):** Hauptthread **~85 % belegt** (4×).
- Ebenen-Abgleich des Compositors (`PaintArtifactCompositor::Update`) **2,2–2,3 s**, Malen 0,5 s, Style 0,33 s.
- JS: Planer `tick` 711–842 ms; darin `drumBufs` **208–214 ms** beim ersten Schlag – die Trommel-Klänge werden erst gebaut,
  wenn ▶ schon gedrückt ist (die Audio-Umgebung entsteht erst mit dem ersten Tipp); `renderPartBar` 294–302 ms;
  Pegel `mtrFrame` 125–162 ms; `ensureAudio` 154–181 ms.
- Längste Aufgabe beim Tipp 404–559 ms.

## 5. Service-Worker und Aktualisierung (Code gelesen: `sw.js` der Online-Seite, VW-Block)

- `index.html`: Netz zuerst (über den Browser-Cache), nach 3 s ohne Antwort die gespeicherte Kopie. Jeder kalte Start wartet
  also mindestens eine Rückfrage beim Server (304), bei schwachem Netz bis zu 3 s.
- Neue Fassung: VW findet sie über `version.json`, löscht `synq-app-*`, lädt `?v=<Fassung>`. Diese Adresse ist neu für den
  Browser-Cache → **volle ~2,9 MB**.
- **Danach lädt das Telefon dieselbe Fassung noch einmal:** der nächste Start vom Home-Bildschirm fragt die normale Adresse
  (`./`); deren Browser-Cache-Eintrag ist noch die alte Fassung (anderes ETag) → wieder volle ~2,9 MB. Also **je Fassung
  zweimal ~2,9 MB** und zweimal ein ganzer Start.
- Nebenbefund (zu prüfen am Gerät): ist der alte Eintrag der normalen Adresse noch frisch (< 10 min), liefert der Browser-Cache
  ohne Rückfrage die **alte** Fassung; VW lädt dann erneut (höchstens 2 Versuche je 5 min).

## 6. Pflicht

`pflicht.log`: topdefs 26 Skripte, 7607 Namen, 0 doppelt, 0 Syntaxfehler · dupkeys 0 · Rauchtest errors [] · „MS 2000“ 1× ·
„live: true,“ 1× · VERSION '4.69.0' · index.html = basis.html.
