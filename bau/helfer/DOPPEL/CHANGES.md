# DOPPEL – doppelte Werkzeuge zusammenlegen (Basis R-4300, App 4.30.0)

Basis: `bau/snapshots/R-4300.html` → `bau/helfer/DOPPEL/index.html`. VERSION bleibt `'4.30.0'`.
Jede geänderte Stelle trägt `// DOPPEL` bzw. `/* DOPPEL … */`. Diff: `patch.diff` (152 Zeilen, nur Piano-Rolle).

## Aufgabe 1 – Piano-Rolle: je Funktion EIN Knopf

Vorher standen in der Aktionsleiste der Rolle 5 Knöpfe für 3 Funktionen:

| vorher | nachher |
|---|---|
| N1 **Spiegeln** (Auswahl, sonst ganzer Clip; Achse Mitte; Clip-Tonart) + PINSEL **Umkehren ↕** + **Achse: 1. Note** (Bereich; Tonart der Stelle) | **Spiegeln** (SVG wie bisher) + Schalter **Achse: Mitte / Achse: 1. Note** direkt daneben |
| N1 **Umdrehen** (Auswahl, sonst ganzer Clip) + PINSEL **Krebs ↔** (Bereich) | **Umdrehen** (SVG wie bisher) |
| PINSEL **Tauschen ⇆** | **Tauschen** mit gezeichnetem Symbol (zwei gegenläufige Pfeile über der gestrichelten Mitte, gleicher Stil wie die N1-Symbole) |

Die Leiste ist damit zwei Knöpfe kürzer (18 → 16 sichtbar), Leistenhöhe ± 0 px (428×926: 44 px, 926×428: 36 px, 428×650: 40 px – gemessen vorher und nachher).
Keine Pfeil-Zeichen ↕ ↔ ⇆ mehr in der Leiste.

### Verhalten
- **Bereich** (Spiegeln und Umdrehen): Auswahl (erste Note … letztes Ende), sonst Lineal-Takte (Bereich), sonst ganzer Clip.
  Tauschen bleibt unverändert (Lineal-Takte, sonst Auswahl, sonst ganzer Clip).
- **Spiegeln**, Tonart der Stelle (Pinsel-Tonart von Hand, sonst Tonart der Stelle, sonst Clip-Tonart; gemessen am Bereichsanfang – wie vorher Umkehren):
  - *Achse Mitte* (Standard, wie N1): um die Mitte zwischen tiefster und höchster Leiterstufe, exakt; leiterfremde Töne bleiben zwischen den Stufen, zweimal = Ausgangslage.
  - *Achse 1. Note* (wie Umkehren): um die erste Note, Ergebnis in die Tonart gerastet.
  - Die Achse wird mit dem Schalter neben Spiegeln gewählt und überlebt das Schließen (wie vorher). **Standard ist jetzt Mitte** (vorher bei Umkehren: 1. Note), damit Spiegeln wie bisher wirkt.
- **Umdrehen**: zeitlich rückwärts im Bereich, Länge/Anschlag/Ton je Note bleiben, Roh-Einsatz wandert mit; eine Note über das Bereichsende rechnet bis zum Bereichsende (wie Krebs).
- Jede Geste = 1 Undo (Beschriftung „Spiegeln“ / „Umdrehen“ / „Tauschen“).

### Bewusste Änderungen (alte Fälle, die anders wirken)
1. Spiegeln/Umdrehen mit **Lineal-Bereich und ohne Auswahl**: wirkt jetzt nur im Bereich (vorher bei N1: ganzer Clip). Das ist das Bereichs-Verhalten von Krebs/Umkehren.
2. **Auswahl und Lineal-Bereich gleichzeitig**: die Auswahl gewinnt (vorher bei Krebs/Umkehren: der Bereich). So bleibt N1 mit Auswahl gleich.
3. Spiegeln (Achse Mitte) rechnet in der **Tonart der Stelle** statt nur der Clip-Tonart. Im Clip-Editor ist das die angezeigte Clip-Tonart (gleich, außer bei noch nicht bestätigter Auto-Tonart) bzw. die Pinsel-Tonart, wenn sie von Hand gesetzt ist.
4. Achse-Standard Mitte statt 1. Note (siehe oben).
5. Altes **Umkehren mit Achse Mitte** rastete leiterfremde Ergebnisse in die Tonart; Spiegeln mit Achse Mitte rechnet exakt wie N1 (sonst wäre N1 „zweimal Spiegeln = Ausgangslage“ mit leiterfremden Tönen kaputt). Betrifft nur Töne, die nach dem Spiegeln zwischen zwei Leiterstufen liegen; mit Achse 1. Note wird weiter gerastet.

Alle anderen alten Fälle: Ergebnis gleich – geprüft in `tests/t-gleich.mjs` (8 Zufalls-Clips in 4 Tonarten × 17 Fälle, alte Knöpfe in R-4300 gegen neue Knöpfe, per Finger, Noten + „1× Undo = Ausgangslage“; Fall 5 wird dort gezielt als „nur leiterfremde Töne anders“ geprüft).

### Code
- `dpRange()` / `dpRangeOf()` – Bereich wie oben.
- `dpMirror(r)` – Spiegeln (aus N1 `mirrorNotes` + PINSEL `mpInvert`), `dpReverse(r)` – Umdrehen (aus `reverseNotes` + `mpCrab`).
- Alte Namen bleiben aufrufbar und zeigen auf die neuen Funktionen: `mirrorNotes`, `reverseNotes`, `mpInvert`, `mpCrab`, Knöpfe `A.mpInv`, `A.mpCrab`.
- `mpBlock(lab, fn, rangeFn)` – drittes Argument neu (ohne: wie bisher `mpRange`).
- Test-API `rollApi().mp`: neu `spiegeln()`, `umdrehen()`, `tauschen()` (wie ein Tipp); alte Namen `invert`, `crab`, `swap` zeigen darauf. `mp.state.axis` / `mp.setAxis()` unverändert.
- `n1Pos`/`n1Note` sind jetzt unbenutzt (stehen gelassen, um den Diff klein zu halten).

### Alte Tests – angepasste Erwartungen (nur, wo der Knopf bewusst weg ist)
Kopien unter `tests/alt-n1/` (aus Zweig helfer-n12d1k2) und `tests/alt-pinsel/` (aus Zweig melodie-pinsel):
- `alt-n1/*`: **unverändert** (nur Pfad zur App).
- `alt-pinsel/t-bloecke.mjs`: „Umkehren ↕“ → „Spiegeln“, „Krebs ↔“ → „Umdrehen“, „Tauschen ⇆“ → „Tauschen“; weil der Achse-Standard jetzt Mitte ist, stellt der Test am Anfang auf „1. Note“ (Erwartungen der Noten unverändert).
- `alt-pinsel/t-layout.mjs`: prüft zusätzlich die Knöpfe mit Klasse `n1b` (Spiegeln/Umdrehen/Tauschen haben jetzt diese statt `mpb`; gleiche 44-px-Trefferfläche).
- `alt-pinsel/t-alt.mjs`: Basis R-4300 statt R-4261 (Pfade).
- `alt-pinsel/lib.mjs`, `alle.sh`: nur Pfade.

## Aufgabe 2 – Doppel-Suche app-weit

Durchgesehen: Matrix/Clip-Blatt, Song (Bereich-Leiste, ⋯ Mehr, Marken, Melodie, Akkorde), Piano-Rolle, LAUF, Drum-Editor, Synth-Editoren, Gesang/Takes/Chor, Video, Hauptmenü, Halte-Menüs.
Ergebnis: **kein weiteres echtes, gleich wirkendes Doppel in derselben Leiste** außer dem oben zusammengelegten. Darum keine weitere Änderung; alles Weitere steht hier als Vorschlag.

| # | Stelle A | Stelle B | gleich/ähnlich | Unterschied | Vorschlag |
|---|---|---|---|---|---|
| 1 | Rolle: **Spiegeln** (N1) | Rolle: **Umkehren ↕** (PINSEL), selbe Leiste | gleich | Bereich/Achse/Tonart der Stelle | **zusammengelegt** (Aufgabe 1) |
| 2 | Rolle: **Umdrehen** (N1) | Rolle: **Krebs ↔** (PINSEL), selbe Leiste | gleich | Bereich, Kürzen am Bereichsende | **zusammengelegt** (Aufgabe 1) |
| 3 | Song, MELODIE-Menü **Bearbeiten** | selbes Menü **Als Clip …** | fast gleich | beide öffnen den Melodie-Editor; „Als Clip …“ zeigt zusätzlich den Hinweis „Takte im Lineal wählen, dann [Als Clip]“ | bleibt (Hinweis-Einstieg). Vorschlag: „Als Clip …“ direkt in den Editor mit gewähltem Bereich und markiertem [Als Clip] |
| 4 | Stopp-Blatt (320 px) **■ Stopp zum Takt** | selbes Blatt **■■ Sofort** | nur im Stillstand gleich | beim Spielen: zum Takt gegen sofort | bleibt; Vorschlag: im Stillstand nur einen Knopf „Alle Töne aus“ zeigen |
| 5 | Song, Bereich-Leiste **❖ Als Teil …** | ⋯ Mehr **Zusammenfassen** und **Als neuen Teil konsolidieren** | ähnlich (3 Wege) | alle machen einen neuen Teil; Konsolidieren merkt sich zusätzlich den Ursprung („Zurückholen“), Zusammenfassen nimmt eigene Clips/Melodie/Stimme mit | bleibt; Vorschlag: ein Eintrag „Als Teil …“ mit Schalter „Ursprung behalten“ |
| 6 | Marken-Blatt **Zusammenfassen** | selbes Blatt **Als neuen Teil konsolidieren** | ähnlich | wie Nr. 5 | wie Nr. 5 |
| 7 | Drum-Editor Kopf: **‹ Kit ›** / **Sichern** | Reiter KIT: **Kit ▾** / **Kit sichern** | gleich, selbes Blatt, andere Zeile | gleiche Handler (Browser, Sichern) | bleibt; Vorschlag: Zeile im KIT-Reiter streichen |
| 8 | Synth-Kopf quer **⋯**: Init, Modulationen | Untermenü **Timbre und Sequenz ▸**: Init, Modulationen | gleich, verschachtelt | keiner | bleibt; Vorschlag: im Untermenü weglassen, wenn aus ⋯ geöffnet |
| 9 | Akkord-Wahl **Akkorde quantisieren …** | AKKORDE-Menü, Bereich ⋯ Mehr | gleich, 3 Orte | keiner | bleibt (Kontext-Zugänge) |
| 10 | Akkord-Zeile **Quantisieren** | **Akkorde quantisieren …** | ähnlich | Szene/Teil gegen Song-Träger | bleibt; Vorschlag „Zeile quantisieren“ |
| 11 | Clip-Blatt **Quantisieren…** | Rolle **Quant.** | gleich (Szenen-Clip) / ähnlich | in Song-Clip/Melodie quantisiert „Quant.“ sofort ohne Blatt | bleibt; Verhalten angleichen |
| 12 | STIMME-Clip **Quantisieren…** | Takes **✎ Marken · Quantisieren** | gleich, 2 Namen | keiner | bleibt; Namen angleichen |
| 13 | Takes **ZIP + Projekt** | Herkunftshinweis **WAV/ZIP exportieren** | gleich, 2 Namen | keiner | bleibt; einen Namen wählen |
| 14 | Menü → Sounds **Alle eigenen Sounds exportieren / importieren** | Sound-Bibliothek **Exportieren / Importieren** | gleich, 2 Orte | keiner | bleibt; Namen angleichen |
| 15 | ●-Halten **Aufnahme**: Länge, Quantisieren, Einzähler, Klick | Menü → Aufnahme | gleich, 2 Orte | keiner | bleibt (Schnellzugriff) |
| 16 | ●-Halten **FANG – Gespieltes einfangen** | Knopf **FANG / FANG TEIL** | ähnlich | Knopf entscheidet nach Modus (Teil/Stimme), das Blatt fängt immer gleich | bleibt; Vorschlag: Blatt ruft dieselbe Entscheidung auf |
| 17 | Clip-Blatt **×2** (bis 64 Takte) | Rolle **Dupl.** ohne Auswahl (bis 64), Drums **×2** (bis 16) | ähnlich | Grenzen 64/16, Undo-Texte | bleibt; Vorschlag: eine Funktion, eine Grenze |
| 18 | Clip-Blatt **−1 / +1** | Rolle **Takte − / +** | ähnlich | verschiedene Kürz-Logik | bleibt; Vorschlag: eine Kürz-Logik |
| 19 | Clip-Blatt Tonart **Fest… / Auto** | LAUF **Skala ▾** | gleich, 2 Orte | keiner | bleibt |
| 20 | Rolle Pinsel **Tonart: Auto** (7 Modi) | Magic-Zeile **Auto** (Dur/Moll) | ähnlich, gleicher Speicher | andere Auswahl | bleibt; Vorschlag: ein Tonart-Wähler |
| 21 | Popup Harmonie-Modus, „? So funktioniert’s“ | Menü → Harmonie | gleich, 2 Orte | keiner | bleibt |
| 22 | Spur-Blatt **＋ Spur / Spur entfernen** | Menü → Projekt | gleich, 2 Orte | keiner | bleibt |
| 23 | Spur-Blatt **Mit GarageBand aufnehmen** | Takes-Blatt | gleich, 2 Orte | keiner | bleibt |
| 24 | KIT **Swing** | Menü → Aufnahme **Swing** | gleich, 2 Orte | derselbe Wert | bleibt |
| 25 | ⋯ **Anschlag POSITION**, FEST-Hinweis | Menü → Bedienung **Tastatur-Anschlag** | gleich, 3 Orte | keiner | bleibt |
| 26 | Menü → Klang **Alle Töne aus** | Kopf **■** im Stillstand | gleich, 2 Orte | keiner | bleibt |
| 27 | Song Schleife-Popup **Bereich** | ⋯ Mehr **⟲ Als Schleife** | gleich, 2 Orte | keiner | bleibt |
| 28 | Leerer Song **Kette aus Szenen … / ＋ Teil einsetzen** | MELODIE-Menü / ⋯ Mehr | gleich, 2 Orte | keiner | bleibt |
| 29 | Marken-Blatt **Farbe** | Teil-Blatt Farbpunkte | gleich, 2 Orte | keiner | bleibt |
| 30 | Rolle Aktionsleiste **Pause** (Schritt-Eingabe) | Magic-Zeile **Pause** (Werkzeug „Zelle still“) | **gleicher Name, andere Wirkung** | Schritt-Pause gegen Werkzeug | bleibt; Vorschlag: umbenennen („Pause-Schritt“) |

Nicht gezählt (Layout-Zwillinge, je Format nur einer sichtbar): FANG hoch/quer, Synth-Kopf ⋯/◎ hoch/quer, „Als Teil“ im ⋯ Mehr unter 360 px, „Als Clip“ als Kopf-/Werkzeugknopf, ↶/↷ in Clip-Blatt/Rolle/LAUF.
In Video und Chor keine Doppel gefunden.
