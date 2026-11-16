# XLA – DAW-Projekt (.cbp) öffnen · Fassung A (8 Spuren × 8 Szenen) · Schritt 1 von 2: Import-Kern + Import-Blatt

Basis `rel-4780/index.html` (4.78.0, md5 68e92c03, nicht verändert), VERSION bleibt '4.78.0'.
Fassung: `vx/xla/index.html` – md5 **3c83a1d26e0398f86df4548d6a0f73e8**.
PRIVAT: Getestet nur mit synthetischen .cbp (Kopien aus `vx/cbpimp/tests`). Keine Datei und kein Songtitel von Xander in App, Tests, Fotos.

## Plan (aus BAUPLAN P2/P3, ARCHITEKTUR, Entscheidungen 16.11.)

- P2: Kern aus dem Prototyp `vx/cbpimp/cbp-import.js` (17/17) in die App, erst beim Öffnen einer Datei übersetzt, Rechnung im Worker.
- P3: Import-Blatt – Datei wählen, Teile farbig (gleiche Farbe = gleiche Szene), „Passt“, Wahl Als Song / In Szenen / Beides (empfohlen),
  Fassung A ehrlich (welche Spuren jetzt, welche mit dem Ausbau), Auswahl änderbar, Index 5 = MELODIE, Projekte unverändert, ein ↶, Guide.
- Nicht in diesem Schritt: HALBTON (Schritt 2), mehr als 8 Spuren/Szenen (Fassung B, anderes Paket).

## Änderung

**Kern `xla-core.js`** (als `<script type="text/plain" id="sq-xla-src">`, 53 KB Text, wird beim Start nicht übersetzt):
- Prototyp übernommen (CBOR-Leser, Teile-Erkennung, Song exakt), **markenfrei** (Kommentare, Meldungen, Arten `va`/`smp`/`kit`,
  Werksklänge als `snd:<rolle>`/`kit:<kit>` – die App löst sie über ihre Werksliste auf; Erkennung über die Plugin-ID).
- Neu: Wahl `mode` **beides** (Szenen + Song, Standard) · **szenen** (Song leer) · **song** (Szenen frei, Song aus eigenen Clips je
  Teil, Teil-Marken mit Namen; bei sehr vielen Teilen 64-Takt-Stücke). Spurwahl `lanes` (Listen von Spur-IDs), Rolle je Spur
  (Bass/Melodie/Akkorde/Synth aus Name, Lage, Mehrstimmigkeit), Reihenfolge der Wichtigkeit: Bass, Melodie, dann Notenzahl.
  **MELODIE-Platz:** die melodieführende Bahn liegt auf Index 5 (Spur mit `mel`); ohne Melodie bleibt Index 5 die leere
  MELODIE-Spur der App, solange hinten Platz ist. `names`/`alias` (Name je Teil, „gleiche Szene wie“, Schleifen aufgelöst).
  Worker-Anschluss `handle({op: open|build|close})`; die Übersicht für das Blatt enthält keine Noten.
- Node-Test `tests/core-test.cjs`: **31/31** (17 Prototyp-Tests angepasst + 14 neue).

**Block `/* XLA-BEGIN */ … /* XLA-END */`** (am Ende des Hauptskripts, `xla-block.js`):
- Worker als Blob aus dem Text-Block (Rückfall data:-URL, ohne Worker im Hauptfaden); Datei als übertragbarer ArrayBuffer;
  Worker endet 20 s nach dem Schließen des Blatts (nicht, solange das Blatt mit gelesener Datei offen ist). Obergrenze 20 MB.
- Blatt „DAW-Projekt öffnen“ im Stil des Import-Blatts (Klassen `imp1`, gleiche Knöpfe, Farben `IMP1_PC`): Kopfzeile Name · BPM ·
  Taktart · Takte, Warnungen, Teile-Leiste links → rechts + Teil-Knöpfe, Name ändern (12 Zeichen), „Eigene Szene“ / „Gleiche Szene
  wie …“, Wahl (3 große Knöpfe, Beides vorgewählt), Spurliste (übernommen / kommt mit dem Ausbau, Tippen wechselt, Grenze meldet
  sich), DRUMS-, Hilfsspur-, Audio- und Stumm-Hinweis, Bericht je Spur (aufklappbar), „Passt – öffnen“, Hinweis in einfachem Deutsch.
- „Passt“: neues Projekt (`newProjectRaw` + Spuren/Szenen/Song, `normalizeProject`), importierte Spuren ⇅ fest + Eine Skala aus
  (Noten exakt), Tastatur-Oktave aus der Lage, Spuren 6–8 mit 4 Stimmen außer die Noten brauchen mehr (CPU-Regel §4.2),
  Lautstärke/Panorama aus der DAW, Delay-Notenwert → Projekt-Echo, Taktart (Clips mit `ts`), Tonart. Öffnen über `importProjectUI`
  (das offene Projekt wird gesichert und bleibt unverändert unter Projekte). Song-Ansicht bei Als Song/Beides, Matrix bei In Szenen.
  In Schritten (vvYield) und die Ansicht im selben Schritt wie der Wechsel → keine Long Task.
- **↶ in einem Schritt:** Eintrag `{kind: 'xla'}` – ↶ holt das vorige Projekt bitgleich zurück (aus dem Eintrag; seine
  Parkkopie wird wie bei „Öffnen“ entfernt), ↷ öffnet den Import wieder (das vorige wird gesichert). Verlauf-Rekorder kennt 'xla'.
- Guide-Eintrag „DAW-Projekt (.cbp) öffnen“ (zeigt auf „Datei wählen“), Test-Zugang `window.__xla`.

**Haken außerhalb (je eine Zeile, Kennung XLA):** `imp1File` (Kennung → eigenes Blatt) · `undoState` · `undoApply` · `onFilePicked`
(„Datei öffnen“ mit .cbp → Blatt) · Hinweis im Import-Blatt „…, MIDI oder DAW-Projekt (.cbp) wählen“ · Menü-Untertitel
„Tempo · Taktart · Teile · .cbp“. Sonst nichts an bestehendem Aussehen/Bedienung geändert.

## Tests

- `node tests/core-test.cjs` → **31/31** (`tests/core-test.out`).
- `node xla-test.mjs index.html` (Playwright, Touch per CDP, echter Datei-Wähler) → **46/46** (`xla-test.out`; 3 Läufe grün, der letzte auf der Endfassung, je ≈ 80 s):
  Einstieg (Untertitel, Hinweis, Guide) · Datei per Touch → Blatt, im Worker · 0 Long Tasks beim Lesen/Rechnen · 8 Teile farbig, gleiche
  Teile gleiche Farbe · Beides vorgewählt, „8 Teile → 4 Szenen“ · Name ändern (alle 3 Refrains) · gleiche Szene wie / eigene Szene ·
  Als Song / In Szenen / Beides · ✕ ändert nichts · „Datei öffnen“ mit .cbp · Passt → neues Projekt, Plätze (DRUMS 4, Melodie 5 mit
  mel), ⇅ fest/Eine Skala aus, Szenen + 8 Marken + Song-Ansicht · **Song in der App = Kern Note für Note (894)** · ein ↶-Eintrag ·
  voriges Projekt unverändert unter Projekte · Wiedergabe ab Takt 5 (noteLog je Spur genau) · ↶ bitgleich zurück, keine Doppel ·
  ↷ bitgleich · Speichern/Laden bitgleich · 12 Spuren quer: 7 + DRUMS, 2 „kommt mit dem Ausbau“, Bass/Melodie dabei, Grenze,
  Auswahl ändern, 8 Spuren wie gewählt, exakt (1 362 Noten) · App Als Song (894, Szenen frei) / In Szenen / Loop → 1 Szene ·
  Fehler: abgeschnitten, Unsinn, > 20 MB · ohne Worker · MIDI-Weg unverändert · Layout 428×926, 926×428, 320×640 (✕ sichtbar,
  Tasten ≥ 44, nichts außerhalb, keine Überlappung, kein waagrechtes Rollen) · Blatt 21 s offen → rechnet weiter · Worker endet
  20 s nach dem Schließen · Konsole ohne Fehler.
- Fotos (`fotos/`): `xla-p-menue.png` (Menü-Untertitel), `xla-p-blatt.png` (Blatt hochkant), `xla-p-song.png` (Song nach Passt),
  `xla-p-alssong.png` (Als Song), `xla-l-spuren.png` (12 Spuren quer, Spurliste), `xla-l-song.png` (Song quer), `smoke-end.png`.
- Pflicht (`pflicht.out`): topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · Rauchtest `errors []` · „MS 2000“ 1× · `^  live: true,` 1×
  · VERSION '4.78.0' · Markenwörter je Wort ≤ Basis (0 Wörter mit mehr Treffern; der Kern-Text ist markenfrei, Node-Test prüft das)
  · keine Emojis/Bildzeichen im Block und Kern · Syntax des Text-Blocks mit acorn geprüft.

## Messung

- **Startzeit** (`startzeit.mjs`, frischer Kontext je Lauf, abwechselnd, 3 Läufe je Datei, Median DOMContentLoaded / load / App bereit):
  Lauf A: Basis 541 / 603 / 650 ms · neu 563 / 579 / 630 ms. Lauf B (`startzeit.json`): Basis 592 / 627 / 682 ms · neu 608 / 643 / 684 ms.
  → kein messbarer Unterschied (Streuung ± 30–70 ms bei geteilter CPU). Der Kern wird beim Start nicht übersetzt.
- Größe: 9 543 731 → 9 624 131 Byte (+80 KB, +0,84 %); gzip -9 3 157 033 → 3 185 055 (+28 KB, +0,9 %).
- Import (Chromium, Server mit geteilter CPU): Datei lesen + Teile im Worker, Blatt offen nach 120–145 ms (erstes Mal, inkl.
  Worker-Start), danach Neuberechnung 2–25 ms im Worker; Hauptfaden je Schritt ≤ 28 ms (erstes Öffnen des Blatts).
- „Passt“ (`lt-mess.mjs`, 5 Läufe 12 Spuren): 56–73 ms gesamt, größter Schritt 15–30 ms, **0 Long Tasks**. Im vollen Test trat unter
  Last vereinzelt nach „Passt“ eine Long Task von 50–70 ms auf (geteilte CPU; Einzelmessung 0) – als INFO protokolliert.

## Offen

1. **HALBTON** (Entscheidung 2) – Schritt 2: Wahl im Blatt, Spuren ⇅ folgt, Projekt-Harmonie chromatisch (im Kern als Option vorhanden).
2. Fassung B (24 Spuren / 32 Szenen) – eigenes Paket; der Kern baut schon für jede Grenze (`maxT`, `maxS`).
3. „Als Song“: eigene Song-Clips zeigen im Song-Editor die Szenen-Nummer 1 mit Punkt (so stellt die App eigene Clips dar), obwohl
   Szene 1 leer ist. Ggf. eigene Anzeige vorschlagen (sichtbar → Funk).
4. Nur synthetische Dateien getestet; Xanders echte Datei nur lokal (P5) – andere DAW-Fassungen können Felder anders haben (Leser tolerant).
5. Erste Auswahl nach dem Import ist die vorher gewählte Spur (z. B. eine leere SYNTH 4); ggf. die erste importierte Spur wählen.
6. Klang angenähert (Bericht je Spur); Audio-Spuren (WAVs), Akkord- und Text-Spur kommen später (BRÜCKE A7–A9).
7. Am echten iPhone 12 noch nicht gemessen (Worker-Start, erstes Blatt, Wechsel).
