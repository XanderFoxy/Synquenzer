# CMD1 – Werks-Kit „Elektro-Maschine“ (synthetischer Drum-Nachbau)

Basis rel-4780 (`basis.html`, md5 68e92c03…). VERSION nicht erhöht. Block `/* CMD1-BEGIN */ … /* CMD1-END */`, ein einzeiliger Haken
(Kennung CMD1). Bau: `python3 apply.py` → `index.html`.

## Was und warum
Die Vorlage-Klänge stammen aus Sample-Instrumenten; deren Samples dürfen nicht in die öffentliche App. Darum: **kein Sample,
kein Audio-Schnipsel, keine Wellen-Tabelle aus der Vorlage** – jedes Pad ist die vorhandene Drum-Engine der App (`DrumSynth.hit`:
Ton-Oszillator + 2. Oszillator, Rauschen mit Filter/Bursts, Metall-Schicht, Klick) mit eigenen Zahlenwerten. Im Block stehen nur
diese Zahlen (12 Pads × ≈ 15–20 Werte).

- Kit-Eintrag im Reiter Kits („Elektro-Maschine“, Vorbild-Zeile „Elektro-Drumcomputer, synthetisch nachgebaut“), 8. Werks-Kit.
- 12 Einzelklänge automatisch im Instrument-Browser („Elektro-Maschine · KICK“ …, wie bei jedem Werks-Kit).
- SHAKER = Pedal-Hat mit Choke-Gruppe 1 (schließt die offene Hat), BECKEN ohne Vorlage (neutrales helles Synth-Becken).
- Kit-Effekte trocken (Hall 0, Echo 0, Lautstärke 0,85) – die gemessenen Schläge waren trocken. Die anderen Werks-Kits haben 8 % Hall.
- Keine neue Bedienung, kein anderes Aussehen, keine Änderung an anderen Kits oder der Engine.

## Haken
`if (typeof cmdKit === 'function') cmdKit(SQF, KIT_NAMES, KIT_REF);` direkt nach `const SQF = …` (vor `applyKitFix`, `DRUM_FACTORY`,
`FACTORY_BY_ID`). `cmdKit` trägt Kit-Daten in `SQF.NEW_KITS`, den Eintrag in `SQF.KITS`, den Namen in `KIT_NAMES` und die
Vorbild-Zeile in `KIT_REF` ein. Der Block steht im selben Skript nach UPD-END und enthält nur gehobene Funktionen (der Haken läuft
vor dem Block). Fehlt etwas (`SQ_FACTORY` ohne `NEW_KITS`), gibt `cmdKit` still `false` zurück – die App läuft wie vorher.

## Wie nachgebaut (Messung außerhalb der App, Werkzeuge und Vorlagen privat)
1. Je Vorlage-Klang ein Einzelschlag (Anschlag 100, trocken, 48 kHz, 0,5 s) aus Kalibrier-Aufnahmen geschnitten.
2. Derselbe Schlag aus der Drum-Engine der App (Chromium, OfflineAudioContext, gesäter Zufall).
3. Kosten = Terzband-Form (25 Hz–16 kHz, auf das lauteste Band normiert, Bänder bis 40 dB darunter, RMS) + Band-Hüllkurven
   (6 Bänder × Zeit) + Abklingzeiten −20/−40 dB (log-Verhältnis). Für Toms, Snare und Kick zusätzlich erstes Unterschreiten −20/−40 dB und
   Schwerpunkt (Kick mit halbem Gewicht). Für Hats/Clap ab 200 Hz (unter 200 Hz liegt in der Vorlage-Aufnahme nur der Nachklang des vorigen Toms, −40 dB).
4. Differential Evolution je Pad über 15–20 Engine-Werte, mehrere Runden (jede gesät mit dem besten Stand).
5. Pegel je Pad: Abstand zum Kick wie im Original; Kick so laut wie die Kicks der Werks-Kits (lautestes Pad = Pegel 1,0).

## Ergebnis (Abweichung Nachbau ↔ Vorlage)
| Pad | Vorlage im Song | Terz RMS dB | Terz max dB | Hüllkurve dB | −20 dB Nachbau−Original ms | −40 dB Nachbau−Original ms | Pegel-Fehler dB |
|---|---|---|---|---|---|---|---|
| KICK | ja | 4.2 | 9.1 | 4.5 | +6 | -6 | +0.0 |
| SNARE | ja | 4.7 | 11.5 | 6.4 | +3 | -29 | +0.1 |
| RIM | nein | 8.0 | 16.6 | 10.3 | +1 | +27 | +0.1 |
| CLAP ¹ | ja | 5.2 | 14.2 | 4.7 | +31 | +16 | -0.0 |
| HH ZU ¹ | nein | 2.6 | 5.7 | 3.0 | -1 | -10 | -0.0 |
| HH OFFEN ¹ | ja | 1.7 | 3.1 | 1.8 | – | – | +1.0 |
| TOM TIEF | ja | 6.8 | 14.7 | 8.7 | -50 | +3 | +0.0 |
| TOM MITTE | ja | 7.5 | 16.7 | 5.9 | -45 | – | +0.0 |
| TOM HOCH | ja | 6.8 | 13.5 | 7.1 | -29 | +74 | +0.1 |
| BECKEN | – (ohne Vorlage) | – | – | – | – | – | – |
| PERC | nein | 5.1 | 10.9 | 7.9 | -25 | +6 | +0.1 |
| SHAKER ¹ | nein | 2.7 | 7.5 | 2.3 | -2 | -11 | +0.0 |

Mittel der 7 Song-Klänge: Terz 5.3 dB RMS, Hüllkurve 5.6 dB (Prüfung 17.11.: vorher „9“ – HH ZU und SHAKER spielt der Song nicht).

¹ ab 200 Hz verglichen (s. o.). −20/−40 dB = erstes Unterschreiten (2-ms-RMS). „–“ = Schlag klingt länger als 0,49 s.
Hörvergleich (Original | Nachbau, je zweimal) und die volle Messtabelle mit den Werten der Vorlage liegen nur lokal (privat).

Ehrlich, was nicht ganz geht:
- **Toms** (Terz 6,8–7,5 dB): Ton + Rauschen der Engine trifft den breiten tiefen „Bauch“ (40–100 Hz) der Vorlage nur teilweise.
  Schwerpunkt und Ausklang bis −40 dB passen (Schwerpunkt im Mittel ≈ +20 %, TOM HOCH ≈ +35 % heller); −20 dB wird 30–50 ms früher
  erreicht. Ohne die Kalibrier-Maße in der Kostenfunktion war die Terz-Form besser (3,8–6,6 dB), aber die Toms bis 4× zu hell und zu kurz –
  gewählt ist der Stand, der wie ein tiefer Tom mit langem Ausklang klingt.
- **Clap** (Terz max 14 dB): ganz oben (≥ 12,5 kHz) fällt die Vorlage steil ab, das Rausch-Filter der Engine flacher; Ausklang
  bis −20 dB ≈ 30 ms länger.
- **Snare**: der tiefe Anteil der Vorlage (40–80 Hz) fehlt teilweise (Terz max 11,5 dB); −40 dB ≈ 30 ms früher.
- **Rim** (nicht im Song, 8 dB): die Vorlage klingt in einem schmalen Band um 2,5 kHz nach – dafür hat die Engine kein Resonanz-Filter.
- **Hats** unter 200 Hz nicht verglichen (s. o.). **BECKEN** ohne Vorlage.
- Rauschen ist je Schlag zufällig: wiederholte Messungen schwanken um ≈ ±0,5 dB.

## Tests (`node cmd1-test.mjs <index.html> [fotos]`, Chromium, iPhone 12 Pro Max 428×926)
Ergebnis: **ALLE OK: 19** (`test-ergebnis.txt`).
- T1a–e: Kit genau einmal (8 Werks-Kits, die 7 alten unverändert da), Eintrag im Reiter Kits, ladbar per id, Vorbild-Zeile, 12 Pad-Daten,
  Einzelklang im Instrument-Browser, keine Marken-/Gerätenamen in Daten/Tipp/Vorbild, Start ohne Fehler.
- T2a–c: Kit lädt (Name + Herkunft), alle 12 Pads tragen genau die Kit-Werte, ohne Fehler.
- T3a–d: jedes Pad spielt (echte `drumHit`-Kette), 2 Takte Drums offline gerendert (alle 12 Pads + Groove: Pegel −29,8 dB RMS,
  Spitze −12 dBFS, keine NaN, anders als 909), jedes Pad im Render hörbar (−25…−12 dBFS), Pedal-Hat schließt die offene Hat.
- T4a–c: Speichern/Laden: Projekt-JSON trägt Kit + eigene Änderung (Kick 61,5 Hz), Laden nach Kit-Wechsel stellt beides her;
  nach Neuladen der Seite (Autosave) noch da.
- T5a–b: MIDI-Export: Drum-Spur auf Kanal 10, nur Pad-Noten (36 37 38 39 42 45 46 47 49 50 56 70); Live-MIDI: Pad-Note spielt dasselbe Pad.
- T6: Klang in der App = gemessener Nachbau: je Pad ein Schlag durch die ganze App-Kette gegen die Engine direkt (dieselben
  Rausch-Puffer): Terz-Form 0,4–1,7 dB RMS. Die Kette (Spur/Master) gibt nur an den Rändern (25–40 Hz, 16 kHz) bis 3,2 dB dazu/weg.

## Pflicht
- `topdefs.cjs index.html`: Skripte 26, Namen 8054, doppelt 0, Syntaxfehler 0
- `dupkeys.cjs index.html`: 0 doppelte Schlüssel
- `smoke.mjs`: title SYNQUENZER, errors [] (`fotos/smoke.png`)
- „MS 2000“ genau 1×, „^  live: true,“ genau 1×, `CMD1-BEGIN` 1×, Haken 1×; `basis.html` md5 68e92c03 (= rel-4780)
- Größe: index.html 9 549 580 B (+5 849 B gegenüber basis.html)

## Fotos (DPR 2)
- `fotos/cmd1-browser-hoch.png` – Reiter Kits mit „Elektro-Maschine“, hochkant 428×926
- `fotos/cmd1-browser-quer.png` – dasselbe quer 926×428 (Liste bis zur neuen Zeile gerollt)
- `fotos/smoke.png` – Rauchtest

## Prüfung (unabhängig, 17.11.)
Selbst gelaufen bzw. nachgemessen:
- Pflicht: `topdefs` Skripte 26, Namen 8054, doppelt 0, Syntaxfehler 0; `dupkeys` 0; `smoke` errors []; „MS 2000“ 1×, „^  live: true,“ 1×,
  `CMD1-BEGIN`/`CMD1-END` je 1×, Haken 1×; `basis.html` md5 68e92c03; `apply.py` baut `index.html` bit-gleich (md5 ded8a00f); Diff zur Basis
  nur Block + Haken (41 Zeilen dazu, keine weg). VERSION unverändert 4.78.0.
- Paket-Test: ALLE OK 19 (mit der privaten Markenliste). Startzeit (5 Läufe je Datei, Median „App bereit“): Basis 842 ms, CMD1 710 ms – nicht
  schlechter (Unterschied = Rauschen).
- Öffentlicher Code: nur Engine-Zahlen, keine Samples/Audio-Daten, keine Marken-, Geräte- oder Vorlagen-Namen (Block, Tipp, Vorbild-Zeile, NOTES,
  KURZ, LOG, Test, `apply.py` durchsucht). Fotos: nur der Reiter Kits.
- Nachmessung mit eigenem Schnitt aus den Aufnahmen und eigenen Maßen, 20 Schläge je Pad aus der App (echter Zufall): Terz-Abweichung bestätigt
  (Kick 4,2 · Snare 4,6 · Clap 5,0 · Toms 6,8/7,5/6,7 · HH offen 1,7 · HH zu 3,1 · Shaker 3,0 · Perc 6,0 · Rim 7,9 dB, Median). Schwerpunkte und
  −40 dB-Zeiten der Tabelle bestätigt.

Korrigiert (klein):
- HH ZU und SHAKER spielt die Vorlage nicht (Noten der Projektdatei nachgezählt) – Tabelle oben auf „nein“, Mittel über 7 statt 9 Klänge:
  Terz 5,3 dB, Hüllkurve 5,6 dB (vorher 4,7 / 4,9). Ebenso in der privaten Messtabelle und in den privaten Skripten.
- Abschnitt „Wie nachgebaut“: die Kalibrier-Maße zählen auch beim Kick (halbes Gewicht).

Befunde (offen, nicht still geändert):
1. **Pegel/Balance.** „Pegel-Fehler ≤ 1 dB“ gilt nur für die Sample-Spitze eines einzelnen gesäten Renders. In der App schwankt die Spitze je
   Schlag mit dem Rauschen (Rim über 20 Schläge −6,9…−1,5 dB zum Kick); im Median liegen die Pads 0,1–2 dB über dem Soll, Rim 1,5 dB darunter.
   Wichtiger: nach Lautheit (K-bewertet, 0–400 ms) sind alle Pads gegenüber dem Kick **4–10 dB lauter als in der Vorlage** (Clap +10, Perc +9,
   Tom Mitte +7, Hats +6, Rim +6, Snare +5, Tom hoch +5, Shaker +4,5, Tom tief +4). Grund: der Kick des Nachbaus ist spitzer (Scheitel 10,3 statt
   6,0 dB) – gleiche Spitze, leiserer Körper. Der Kick steht im Kit also weiter hinten als im Original. Vorschlag (hörbar anders, darum erst
   anhören): Pegel nach Lautheit statt nach Spitze abgleichen, Kick bleibt 0,47 – lvl snare 0,236 · rim 0,508 · perc 0,197 · clap 0,083 ·
   tomL 0,158 · hatC 0,082 · tomM 0,092 · shaker 0,140 · tomH 0,093 · hatO 0,041.
2. **Abklingzeiten tiefer Klänge.** „Erstes Unterschreiten“ im 2-ms-Fenster springt bei Tönen unter 100 Hz je Schlag um bis zu 80 ms (TOM HOCH
   −20 dB: 148 ms in der Tabelle, Median aus 20 Schlägen 98 ms). Mit geglätteter Hüllkurve (10 ms, letztes Mal über −20 dB) klingt TOM HOCH 60 ms
   länger statt 30 ms kürzer, TOM TIEF 56 ms kürzer. Die Werte der Vorlage weichen für Kick −40 dB (231 statt 361 ms) und TOM HOCH (177/334 statt
   275/431 ms) von der Kalibrier-Tabelle ab: gleiche Taste, anderes Fenster. Die Aussage „−20 dB 30–50 ms früher“ gilt nur für dieses Maß.
3. **Noten der Vorlage.** Die Tasten der Vorlage liegen nicht auf GM. Wer deren Noten auf die Drum-Spur holt, braucht eine Umbelegung (privat
   aufgeschrieben); ohne sie spielen Kick und zwei Toms falsche Pads (RIM, SNARE, CLAP). Das Kit selbst ist davon nicht betroffen.

