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


---

# XLA · Schritt 2 von 2: HALBTON (⇅½) + P5-Prüfung (Fassung A)

Ausgang `index.vor-schritt2.html` (md5 3c83a1d2). Endfassung `index.html` – md5 **25b48280b98ed07cf479d1bb446a2ac7**. VERSION bleibt '4.78.0', Basis 68e92c03 unverändert.
Bau: `python3 apply.py` (basis.html + xla-core.js + xla-block.js + Haken). Sicherungen: `*.vor-schritt2.*`.

## Plan

- P4 aus BAUPLAN, Weg P4.3 (wie im Auftrag): jede importierte Synth-Spur bekommt **xs:1**, gespeichert **mit follow:false**. Neue Fassung:
  die Tastatur (⇅ TRANSPONIEREN) verschiebt sie genau in Halbtönen. Ältere Fassungen kennen xs nicht → Spur ist dort ⇅ fest, Noten exakt.
- Die Projekt-Harmonie bleibt (kein Wechsel auf HALBTON fürs ganze Projekt) → eigene ⇅-Spuren folgen weiter nach AKKORD/TONART.
- Rückung je Teil (JAM3) und „Abschnitt transponieren“ (TRP1) wirken auf ⇅½-Spuren wie auf feste Spuren (ohne neuen Code).
- P5: Durchlauf als Xander, 3 Minuten Wiedergabe, Regression der berührten Bereiche.

## Änderung

**Kern `xla-core.js`:** `transpose: 'halbton'` → Spuren `follow:false, os:false, xs:1`, Ergebnis `xs:true, transpose`, `settings: null`
(vorher: Spuren ⇅ folgt + Projekt-Harmonie „chromatic“). Ohne Angabe: „fest“ (wie Schritt 1). Node-Test **32/32** (HALBTON-Test neu, „fest“-Test neu).

**Block XLA, Abschnitt „Schritt 2“** (`xla-block.js`):
- `xlaXsOn(i)` (nur Synth, ⇅ fest, xs:1; nie Perkussion/STIMME/Drum-Einzelspur), `xlaXsShift` = Verschiebung des Träger-Eintrags
  **gegen die Projekt-Tonart** (e.shift, wie der Träger sie rechnet: nächster Weg/absolut, Tritonus nach voriger Richtung) – so gehen alle
  Szenen gleich weit, auch wenn eine Szene ihre Tonart später selbst erkennt. `xlaXsOut` (Note + k, in 0…127 oktaviert),
  `xlaXsNoteFor` (Aufnahme/FANG/Schritt-Eingabe: gespeichert wird die Note, die als die gespielte klingt, inkl. Rückung).
- Blatt: Abschnitt **„Transponieren“** – „Halbton (empfohlen) · jede Taste verschiebt alle Szenen genau“ (vorgewählt) | „Noten fest · nur im
  Song je Teil (Rückung)“, Hinweis „Tastatur auf ⇅ TRANSPONIEREN: die Taste C spielt das Original (C-Dur), eine Taste höher = einen Halbton höher …“.
- Passt: `xs` je Spur, Projekt-Kennzeichen `xlaHt:1`, Meldung „… · Tastatur: Halbton“, **die erste importierte Spur ist gewählt** (Offen 5 aus Schritt 1).
- Anzeige: Spurkopf „⇅½“ (leuchtet wie ⇅ bei Träger; Name macht Platz, CSS mit :has nur in engen Lagen), Spur-Taste „⇅½“ (auch wenn das
  Häkchen sonst versteckt ist), Video-Spurkopf ⇅ statt FEST.
- Spur-Taste ⇅ antippen: im Halbton-Projekt (oder an einer ⇅½-Spur) **⇅½ → fest → ⇅ folgt → ⇅½** mit kurzer Meldung; sonst wie bisher folgt ↔ fest.
- ↷ des Imports mit der Auswahl des Imports (applyProject ui:true) → bitgleich.
- Guide „Transponieren im DAW-Projekt (⇅½ Halbton)“ → ⇅ TRANSPONIEREN.

**Haken außerhalb (je eine Zeile, Kennung XLA):** mapOut · clipNoteFor · normTrack (xs nur mit follow:false) · normalizeProject (xlaHt) ·
Spurkopf (renderGrid) · renderStrip · Klick auf ⇅ · Video-Spurkopf. Kein anderes Aussehen/keine andere Bedienung geändert.

## Tests

- `node tests/core-test.cjs` → **32/32**.
- `node xla2-test.mjs index.html basis.html` (Playwright, Touch per CDP, 428×926 / 926×428 / 320×640) → **51/51** (`xla2-test.out`, 290 s):
  Blatt-Abschnitt + Hinweis + Layout hochkant/quer/320 · Passt (xs, xlaHt, Harmonie unverändert, Meldung, Auswahl, ⇅½ an Taste und Köpfen) ·
  **Tastatur genau**: nächster Weg −5…+6 (768 Notenprüfungen), absolut −12…+12 (1 600), TONART (Grundton außerhalb der Tonart), „Eine Skala“ an,
  Akkord gedrückt – 0 falsch, DRUMS unverändert · **Matrix per Touch** (Szene, ▶, TRANSP., Taste): noteLog jede Note genau · **eigene ⇅-Spur**:
  folgt dem Akkord und klingt genau wie ohne ⇅½-Spuren · Stopp ohne hängende Noten · **Song**: Rückung +1 ab Teil 3 + Träger +2 → davor +2,
  danach +3 · **MIDI-Export** +1 ab dem Teil, mit Song-Träger +2 dazu · ↶/↷ der Rückung (Touch) · Speichern/Laden bitgleich ·
  **4.78.0 öffnet die Datei**: Spuren ⇅ fest, Noten/Song gleich, Tastatur lässt sie aus · Spur-Taste ⇅½→fest→⇅→⇅½ (Touch) · normales Projekt
  unverändert · Aufnahme unter Träger (gehört = gespeichert) · „Noten fest“-Import · Guide ·
  **P5 als Xander**: Menü › Öffnen … (.cbp) → Beides/Halbton → Passt → ↶/↷ bitgleich → Szene 3 per Touch → Taste → +5 → Song ▶ (+5) →
  speichern/laden → Rückung im Marken-Blatt (Touch) → ↶ (Touch) → ↷ ·
  **3 Minuten** (Song mit Schleife 110 s + Matrix mit Szenenwechseln, 28 Träger-Wechsel, Rückung ab Teil 5): 588 Noten der ⇅½-Spuren genau
  (0 falsch), 883 Drum-Schläge unverändert, Ausgang ohne NaN/Übersteuern (Spitze 0,62), keine Knackser an den Wechseln (größter Sprung
  dort 0,23 = 99,9-%-Wert der ganzen Wiedergabe), nach dem Stopp alle Stimmen frei und Ausklang unter −79 dBFS, Planer 0 Fehler, Konsole leer.
- Schritt-1-Test `xla-test.mjs` → **46/46** (eine Auswahl im Test auf die erste Wahl-Gruppe beschränkt; 1. Lauf unter Last 1 Long Task 174 ms beim Lesen, 2. Lauf 0).
- Regression: **trp1 81/81** (Abschnitt transponieren, Song, MIDI, Video, ↶) · **mtx3 51/51** (Matrix) · **beg1 56/58** (Träger/Tastatur/Begleiter):
  „Prüfung 5 (5/4 ohne Stil)“ scheitert genauso an der unveränderten Basis 4.78.0 (57/58) und im XLB-Lauf; das zweite Element wechselt mit
  der Last („Ausgang“ 1. Lauf, „Aufnahme = Live“ 2. Lauf – beide auch im Release-Lauf r4780 rot) → nicht von XLA.
- Fotos (`fotos/`): `xla2-p-blatt.png` (Abschnitt Transponieren), `xla2-p-matrix.png` (⇅½ an Köpfen + Spur-Taste), `xla2-l-blatt.png`, `xla2-l-matrix.png`, `smoke-end.png`.
- Pflicht (`pflicht.out`, `pflicht2.sh`): topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · Rauchtest `errors []` · „MS 2000“ 1× · `^  live: true,` 1× ·
  VERSION '4.78.0' · Markenwörter: 0 Wörter häufiger als in der Basis · keine Emojis/Bildzeichen in Block und Kern.

## Messung

- Startzeit (3 Läufe je Datei, frischer Kontext, abwechselnd; Median DCL / load / App bereit), zweimal:
  A: Basis 682 / 720 / 794 ms · neu 634 / 675 / 752 ms · B: Basis 637 / 685 / 778 ms · neu 682 / 726 / 777 ms → kein messbarer Unterschied (Streuung ± 100 ms bei Last 7–8).
- Größe: 9 633 709 Byte (+9,6 KB gegen Schritt 1, +90 KB gegen Basis); gzip -9 3 188 640 (+31,6 KB gegen Basis, +1,0 %).
- Laufzeit (`t2/cost.mjs`, 60 s Matrix, Szenenwechsel + Träger-Wechsel alle 4 s): `xlaXsOut` 194 Aufrufe, **0,8 ms gesamt**; applyCarrierChange
  höchstens 0,7 ms je Wechsel (Schritt-1-Fassung 0,3 ms). Long Tasks > 50 ms: neu 3, Schritt-1-Fassung 9 (Last).
- 3-Minuten-Lauf: Takt-Lücken des Audio-Fadens (headless, geteilte CPU) neu 82, Vergleichslauf ohne ⇅½ 180 (`xla2-lang-basis.out`); eine
  Stille von 64 ms trat auch im beg1-Lauf auf → Umgebung, am iPhone zu messen.

## Wechselwirkung mit eigenen ⇅-Spuren (AKKORD)

- Keine Beeinflussung: eine eigene ⇅-Spur klingt im Halbton-Projekt Note für Note wie ohne ⇅½-Spuren (geprüft).
- Musikalisch: ⇅½-Spuren gehen nur um den Grundton, eigene ⇅-Spuren nach dem Harmonie-Modus. Mit einem Akkord (z. B. Am in C-Dur) oder
  mit „Ein Ton bleibt in der Tonart“ (Standard) bleibt die eigene Spur in der Tonart, der Import wird genau verschoben – das kann sich reiben.
  Ausweg ohne neue Bedienung: an der eigenen Spur ⇅ auf ⇅½ tippen (geht im Halbton-Projekt) oder Harmonie-Modus HALBTON. Guide sagt das.

## Offen

1. **Funk:** Die sichtbaren Teile (Abschnitt „Transponieren“ im Blatt, „⇅½“ an Kopf/Spur-Taste, Tippen ⇅½ → fest → ⇅ im Halbton-Projekt)
   sind in diesem Paket nur gebaut, nicht ausgeliefert – vor der Auslieferung mit Xander abstimmen (CLAUDE.md Regel 3), falls sein OK nicht
   schon im Funk steht.
2. „Song › Transponieren …“ (ganzer Song, song.xp) bewegt wie bisher nur ⇅-Spuren; ⇅½-Spuren gehen mit der Tastatur und der Rückung je Teil
   (Rückung am ersten Teil = ganzer Song). Soll „Song transponieren“ sie mitnehmen → Entscheidung.
3. In 4.78 gespeichert: xs und xlaHt fallen weg (Spuren bleiben fest, Noten exakt); zurück in der neuen Fassung ist ⇅½ dann nur über einen neuen Import.
4. Tippen auf ⇅ hat (wie bisher) keinen ↶-Eintrag.
5. Tritonus (6 Halbtöne) geht wie bei ⇅-Spuren in die zuletzt benutzte Richtung (+6 oder −6).
6. Video: ⇅½-Spuren zeigen im Video „⇅“ (nicht „⇅½“).
7. Aus Schritt 1 weiter offen: Fassung B (24/32), Anzeige „Szene 1“ bei Als Song, Audio-/Akkord-/Text-Spuren, Klang angenähert,
   echte Datei nur bei Xander (nur synthetische Dateien hier), Messung am iPhone 12 (Startzeit, Takt-Lücken, Blatt).


---

# Prüfung (Nachbessern nach dem Prüfer, 17.11.)

Ausgang `index.vor-pruef.html` (md5 25b48280, Endfassung Schritt 2). Zwischenstand nach den Behebungen `index.vor-pruef2.html` (md5 50425b93).
**Endfassung `index.html` – md5 9aae12693fa5952248f1ae5da15884e5.** VERSION bleibt '4.78.0', Basis rel-4780 unverändert (68e92c03).
Bau: `python3 apply.py` (Abschnitte 5 und 6 neu). Sicherungen: `*.vor-pruef.*`, `*.vor-pruef2.*`. Arbeit unterbrochen durch einen Neustart des
Containers (02:20); danach jede Behebung neu nachgeprüft.

## Befunde (Prüfer: 3 mittel, 3 klein) – nachgeprüft, alle echt, behoben

Der Befund-Text im Auftrag brach nach Befund 4 ab. Befund 5 ist aus der Prüfer-Ausgabe `pruef/p5.out` nachgestellt; Befund 6 war nicht lesbar –
an seiner Stelle steht unten ein selbst gefundener Fehler derselben Art (Hilfe-Text sagt im Halbton-Projekt Falsches).

1. **mittel – Anzeige zeigte die eigenen ⇅-Spuren, nicht den Import** (p6: Taste D „+2 · → D Dorisch“ bei D-Dur-Import; TONART F♯ „+5“ bei +6).
   Behoben: Haken `shownShift` und `singleReadout` → im Halbton-Projekt (`xlaHt` und mindestens eine ⇅½-Spur) zeigt der Träger, was der Import tut,
   gerechnet wie `xlaXsOut`: „+2 · → D-Dur“, „+6 · → F♯-Dur“, Akkord Am „−3 · → A-Dur“; das Lesefeld zeigt keine Stufe. Sonst unverändert.
   Prüfer-Sonden neu: p3b TONART „+6 · → F♯-Dur“ = Import 6/6/6; gemischte Clip-Tonart „+4“ = Verschiebung 4; p1 R1 0 Abweichungen in 16 Fällen.
2. **mittel – eigene ⇅-Spuren rieben mit dem Import** (p6: unter D 2 von 7 Tönen fremd, unter E 4/7). Behoben (Weg 1 des Vorschlags, wie
   BAUPLAN P4.1 „im importierten Projekt gehen auch eigene neue Spuren in Halbtönen“): bei „Passt“ werden auch die leeren Synth-Spuren ⇅½, und
   „＋ Spur“ im Halbton-Projekt legt eine ⇅½-Spur an (Haken `addTrack`). Nie Perkussion, STIMME, Drum-Einzelspur. Normales Projekt: wie bisher.
   Wer eine Spur nach Akkord will, tippt ⇅ an der Spur (⇅½ → fest → ⇅). p6b: 0 fremde Töne unter allen Tasten und dem Akkord.
3. **mittel – Song › Transponieren bewegte keine Import-Spur** (p1 R2: 0 von 3 späten Noten). Behoben: ⇅½-Spuren nehmen `song.xp` wie ⇅ folgt –
   Haken in `outPitch`, MIDI-Export (Song, Spur, Einzelspuren), Video-Tastatur, S&H in der Tonart, Aufnahme (`xlaXsNoteFor`). Rückung je Teil und
   „Abschnitt transponieren“ schreiben `song.xp` mit, wirken also wie vorher. p1 R2 neu: 3 von 3 verschoben.
4. **klein – Hinweis und Guide stimmten im Standard „nächster Weg“ nicht** (p4: Tasten 0 … +6, dann −5 … −1). Behoben: Blatt-Hinweis „die Taste C
   spielt das Original (C-Dur). Jede andere Taste spielt den Song genau in ihrer Tonart – auf dem kürzesten Weg, höchstens 6 Halbtöne …“; der Guide
   sagt dasselbe und erklärt „absolut“.
5. **klein – Drum-Einzelspur (MTX3) im Halbton-Projekt** (p5: Tippen meldete „⇅½ Halbton“, ohne dass ⇅½ wirkt). Behoben: `xlaFolgtTap` lässt
   Drum-Einzelspuren aus – dort wie bisher folgt ↔ fest, nie ⇅½.
6. **selbst gefunden – Hilfe-Karte „Transponieren – so funktioniert's“** (erstes TRANSPONIEREN und „? So funktioniert's“ im Harmonie-Modus) sagte im
   Halbton-Projekt „Taste leuchtet = Stufe in der Tonart“ – für ⇅½ falsch. Behoben: ein Haken in `showCoach`, gleiche Karte und Knöpfe, im
   DAW-Projekt (⇅½) der Text: „jede Taste verschiebt den ganzen Song genau um Halbtöne · Taste C = Original (C-Dur), jede andere Taste … kürzester Weg
   (höchstens 6 Halbtöne) · Akkord = genau auf den Grundton · Spuren mit ⇅ (ohne ½) folgen wie bisher den Akkorden“; mit Oktave „absolut“: „Eine Taste
   höher = einen Halbton höher“. Ohne ⇅½-Spur und im normalen Projekt bleibt der Text wie in 4.78.0.

Diff gegen die Basis: zwei Blöcke (Kern-Text, Logik) mit XLA-BEGIN/END und 24 einzeilige Haken (14 neue, 10 geänderte Zeilen), jede mit Kennung XLA
(geprüft: 0 Zeilen außerhalb der Blöcke ohne XLA).

## Tests (Prüfung)

- **`xla4-test.mjs` (neu, Hilfe-Karte) → 14/14** (`xla4-test.out`, 30 s): erstes TRANSPONIEREN per Touch hochkant und quer, Text, Karte im Rasterbereich,
  nie über den Tasten, ohne Rollen, „Verstanden“ per Touch · Harmonie-Modus › „? So funktioniert's“ per Touch · Oktave absolut · alle Spuren auf ⇅ →
  Text wie 4.78.0 · normales Projekt Text und Lage genau wie 4.78.0 · Konsole leer.
- **`xla3-test.mjs` (Befunde 1–5) → 29/29** auf der Endfassung (`t2/end-xla3.log`, 68 s).
- **`xla2-test.mjs`** kurz → **46/46** auf der Endfassung (`t2/end-xla2-kurz.log`); mit 3-Minuten-Wiedergabe auf 50425b93 (`t2/pruef-xla2.log`):
  Song 367 + Matrix 225 Noten der ⇅½-Spuren genau (0 falsch), 883 Drum-Schläge gleich, Spitze 0,665, längste Stille 17,4 ms, Konsole leer; einziges
  FEHLER dort war die alte Erwartung „Synth 4 ⇅“ (jetzt gewollt ⇅½) – Test angepasst.
- **`xla-test.mjs` (Schritt 1) → 46/46** auf der Endfassung (`t2/end-xla1.log`).
- Regression auf 50425b93 (Unterschied zur Endfassung nur der Hilfe-Karten-Haken, im normalen Projekt ohne Wirkung – xla4 C4): trp1 81/81, mtx3 51/51,
  beg1 57/59 („Prüfung 5“ auch an der Basis rot; die Block-Prüfung vergleicht gegen die alte vx/basis.html – nicht XLA).
- Prüfer-Sonden erneut (`pruef2/`, auf 50425b93): p1 (R2 3/3, R1 0 Abweichungen), p3b, p5b, p6b (angepasst: die leeren Spuren sind jetzt ⇅½;
  eine eigene ⇅-Spur entsteht per Tippen) – Konsole leer.
- Fotos (`fotos/`, 428×926 / 926×428, deviceScaleFactor 2, nur synthetische Datei): `xla3-p-blatt.png`, `xla3-p-matrix.png` („D +2 · → D-Dur“, alle
  Synth-Spuren ⇅½), `xla3-l-matrix.png` („F♯ +6 · → F♯-Dur“), `xla4-l-hilfe.png` (Hilfe-Karte quer), `smoke-end.png`.
- Pflicht (`pflicht.out`): topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · Rauchtest `errors []` · „MS 2000“ 1× · `^  live: true,` 1× ·
  VERSION '4.78.0' · Markenwörter: 0 Wörter häufiger als in der Basis; in den 1 148 neuen Zeilen kein Markenwort (auch klein geschrieben) · keine Emojis.

## Messung (Prüfung)

- Startzeit (`startzeit.mjs`, 3 Läufe je Datei, Median „App bereit“), Last 5–7: Lauf A Basis 589 / neu 588 ms, Lauf B 655 / 647 ms; 02:18-Lauf 605 / 590 ms
  → kein messbarer Unterschied. Neuer Code läuft nur im Halbton-Projekt (eine Abfrage `S.xlaHt` je Aufruf).
- Größe 9 639 102 Byte (+95 KB gegen die Basis, +1,0 %); gzip -9 3 190 328 (+33 KB).
- Paketordner 52 MB, Platte frei 3,1 GB.

## Offen (Prüfung)

1. **Funk:** Die sichtbaren Neuerungen sollte Xander in eigenen Worten bestätigen (CLAUDE.md Regel 3; das „generelle OK vom 16.11.“ stand nur im
   Auftragstext): Abschnitt „Transponieren“, „⇅½“ an Spurkopf und Spur-Taste, Tipp-Wechsel ⇅½ → fest → ⇅, **neu: leere und neue Synth-Spuren im
   DAW-Projekt ⇅½**, Text der Hilfe-Karte im DAW-Projekt.
2. Befund 6 des Prüfers war im Auftrag abgeschnitten – bitte nachreichen, falls er nicht der Hilfe-Karte entspricht.
3. Im Halbton-Projekt leuchten die Tasten weiter nach Stufe der Tonart (gilt für ⇅-Spuren; für ⇅½ ohne Bedeutung) – nicht geändert (sichtbar → Funk).
4. Nur synthetische .cbp getestet; am echten iPhone 12 nicht gemessen.
