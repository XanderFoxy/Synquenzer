# SPK10 – NOTES (Bass-Ebene · Oktave je Note)

Bau: `python3 bau.py` = `basis.html` (4.64.0, unverändert) + `spk10-block.js` direkt nach `/* SPK8-END */` + 2 Haken „SPK10“ im SPK8-Block
(je ein Ein-Zeilen-Eingriff, typeof-Schutz; SPK9-Stellen – spk1DspMake-Hakenzeile, `const src`-Zeile, SPK2 `segNotes`-Zeile – nicht berührt):
1. SPK8 `bassNoten`: neue Zeile direkt nach `const found = H2.segNotes(…)`:
   `if (typeof spk10Okt === 'function') spk10Okt(Z2, d, found, {R, hopS});`
2. SPK8 `spk8WUrl`: Blob-Teil `';' + spk8DspMake.toString() + ';'` + `(typeof spk10Okt === 'function' ? spk10Okt.toString() + ';' : '')`
   → `spk10Okt` ist im Spektral-Worker vorhanden; Hauptfaden-Rückfall hat die globale Funktion.
VERSION/CHANGES unberührt. Schalter `Z2.o10` (wird bei jedem Aufruf über die Grundwerte gelegt; `an: 0` = genau SPK8).

## Was gebaut ist – `spk10Okt(Z2, d, found, c)` (nur Bass-Ebene, nur über SPK8)
- Je gefundene Note Rahmen alle 25 ms von a + 50 ms bis b − 40 ms (mind. einer), Betragsspektrum des **Originals** mit **kurzem Fenster
  N 4096** (≈ 93 ms) über das SPK3-Unterabtasten (`Z2.magsLo`, R 4), Leistung.
- Merkmal r = 10·log10((P(3f) + P(5f)) / (P(2f) + P(4f))), Spitze ±1 Bin, über die Note summiert (Grundton-Bereich bewusst nicht benutzt:
  dort liegen Kick-Rest und die Unter-Oktave des Bass-Klangs).
- r < −19 dB (ungerade Obertöne fehlen deutlich) und 2f ≤ 290 Hz → Note ist die Unter-Oktave einer Note um 2f: Ton im Viertelton-Raster
  ±1,5 Halbtöne um 2f mit dem Kamm 1–6 (Gewicht 0,86^h) im kurzen Fenster neu, auf MIDI gerundet; `m`, `f`, `fz` umgerechnet.
- Kick-Abzug (`o10.kick`) als Schalter aus: gleiche Noten, spart die Kick-Vorlage für N 4096.

## Messung (`messb/faelle8.mjs` = Kopie aus spk8/messb, ergänzt um `spk10Okt`, `B10=` Block-Datei, `P10=` Schalter-JSON, `D10=1` Merkmal je Note)
WICHTIG: Die Kopie in `spk10/messb/` benutzen – `spk8/messb/faelle8.mjs` holt nur `spk8DspMake` aus der Datei und misst daher den SPK8-Stand.

Merkmal r je gefundener Note (vor dem Leck-Schutz), Wahrheit = Abstand zum nächsten richtigen Ton:
| Fall | richtige Noten r (tiefster Wert) | Oktav-zu-tief r |
|---|---|---|
| ohne Pads (bassdrums) | −11,3 … | −20,6 / −22,6 / −22,9 / −23,0 (3× davon 32 statt 43 → Ton um 2f nötig) |
| Demo / mit Pads | −16,2 (G2: Pad G3 = 2·G2 hebt die geraden Obertöne) | – |
| Lauf (walk) | −6,8 … | −12 … +1 (Nachbarton-Obertöne: 5·G1 ≈ 3·E2, Snare auf 3f/5f; Notengrenzen 80 ms daneben) |
| okt / basspads / ohneraster / laut | −14 … −16,6 | – |
Schwelle −19 dB liegt zwischen −16,6 (richtig, alle Fälle) und −20,6 (falsch); Rand 2,4 / 1,6 dB.

| Fall | vorher (4.64) | nachher (SPK10) |
|---|---|---|
| bassdrums (ohne Pads) | 19/32 · 0,655 (29) | **22/32 · 0,759 (29)** |
| demo | 29/32 · 0,806 (36) | 29/32 · 0,806 (36) |
| walk | 8/32 · 0,216 (37) | 8/32 · 0,216 (37) |
| sech | 29/64 · 0,617 (47) | 29/64 · 0,617 (47) |
| okt 24/32 · 0,686 · lang 4/4 · 0,333 · leise 16/32 · 0,50 · hoch 13/32 · 0,448 · laut 30/32 · 0,789 · basspads 32/32 · 0,97 · ohneraster 24/32 · 0,727 · sr48 28/32 · 0,718 · ohnebass 0 (28) | – | alle gleich (`reg/faelle8.out`) |

`faelle8 SOLL=1` (13 Fälle): 13 OK / 0 FEHLER; Untergrenze bassdrums in `messb/faelle8-soll.json` (Kopie) auf 22 · 0,739 gehoben.
Zeit „Noten finden“ Bass-Ebene gepaart (o10.an 0/1, Last ~4,8): demo 1489/1369, 1411/1322, 1284/1252 ms; walk 1657/1408, 1328/1307,
1080/1085 ms → ≈ 1,0× (zusätzlich nur wenige kurze FFTs 4096→1024 je Note; Kick-Vorlage für N 4096 bewusst aus).

## Verworfen (gemessen, nicht eingebaut)
- Schwelle −15 dB: demo 29 → 28, okt 24 → 23 (richtige G2 mit Pad G3 kippen).
- `nd` Merkmal auf Original ohne Trommel-Ebene (Render aller anderen Ebenen + Rest): Lauf-Oktavfehler weiter −12 … +2 dB, demo 29 → 28,
  basspads 32 → 31, Zeit +40 % → verworfen.
- `rp` Ton jeder Note ±2 Halbtöne im kurzen Fenster neu (gegen den Halbton-Verschmier der Verfolgung N 16384): Kamm 2–6: walk 8 → 7,
  demo 29 → 26, okt 24 → 13; Kamm 1–6: walk 2, demo 20 → verworfen (93 ms Fenster: 10,8 Hz Bins, ein Halbton bei 65 Hz = 3,9 Hz;
  Pad-Teiltöne und Unter-Oktave ziehen).

## Ziel – NICHT erreicht (ehrlich)
Ziel Lauf ≥ 20/32 und 16tel ≥ 45/64 und ohne Pads ≥ 24/32: erreicht nur ohne Pads 22/32 (+3, Präzision +0,10). Ursachen gemessen:
- Lauf: nur ~9 der 24 Fehler sind Oktavfehler; der Rest sind Halbton-Verschmierung (Fenster 370 ms über zwei 268-ms-Noten: 32 statt 33,
  36 statt 38) und Notengrenzen 80–150 ms daneben. Das Oktav-Merkmal ist mit Pads und Nachbartönen nicht trennscharf (s. Tabelle).
- 16tel: 21 Noten fehlen ganz – die Verfolgung (N 16384) bleibt bei C2, kurze C3/G2/E2-Einwürfe (96 ms) erscheinen gar nicht als
  eigene Tonhöhe; D2 wird C2/C#2. Eine Oktav-Entscheidung je Note kann fehlende Noten nicht erzeugen.
Weg (nächster Auftrag, erst messen): zweite Stufe nach den Anschlägen – je Anschlag-Abschnitt (O.ons, auch ohne 3-dB-Anstieg) Tonhöhe aus
einem Fenster, das genau den Abschnitt deckt (Zero-Padding auf 16384 für feines Raster), Kandidaten nur aus den Pad-freien Teiltönen:
Pad-Ebene (SPK4 polyNoten) als Vorlage abziehen statt Trommel-Ebene; Oktave über die ungeraden Obertöne erst danach.
Kick-Rest je Schlag (kleinste Quadrate) bringt für die Oktave nichts mehr, seit das Merkmal den Grundton-Bereich nicht benutzt
(Kick-Abzug an/aus gab gleiche Noten).

## Pflicht / Regression (Endstand, einzeln nacheinander, `reg.sh` → `reg/*.out`)
- Pflicht: topdefs Skripte 26 / doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke `errors []` (`smoke.png`) · „MS 2000“ 1× · „  live: true,“ 1× ·
  VERSION 4.64.0 unverändert · eingefügter Text ohne Marken-/Datensatz-/Produktnamen (Markenwörter je Wort = Basis).
- faelle8 (Kopie spk10/messb) 13/13 · spk8-seite 14/14 (Worker, hochkant + quer, Demo 29/32 · 0,806, ↶/↷, Konsole []) ·
  spk5-test ALLES OK 24 · spk5-fade-test ALLES OK · spk1-test 17 OK / 1 FEHLER verfeinern-verbessert-ziel 4,37 → 4,36 (bekannt seit SPK4).
- spk4-test: siehe LOG.md.
