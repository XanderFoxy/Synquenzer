# CMD2 – Kit „Elektro-Maschine“ auf 4.79: Pegel nach Lautheit, neue Toms, Tasten-Umlegung im DAW-Projekt-Import

Basis R-4790 (`synq-snapshots/R-4790.html`, md5 d29d696f, wird nur gelesen). VERSION bleibt 4.79.0. Bau: `python3 apply.py` → `index.html`
(bitgleich wiederholbar). Größe 9 761 296 B (+9 010 B), gzip +3,4 KB.

## Was drin ist
- `cmd2-block.js` (`/* CMD2-BEGIN */…/* CMD2-END */`, im Haupt-Skript vor dem Import-Teil): Kit-Daten (12 Pads, nur Engine-Zahlen),
  `cmdKit` (wie CMD1, Haken nach `SQF`, Kennung CMD1), `cmdKitLine` (Zusatz zur DRUMS-Zeile im Import-Blatt).
- `cmd2-xla.js` (`/* CMD2-XLA-BEGIN */…END`, im Import-Kern `sq-xla-src`, läuft im Worker): Erkennung + Umlegung.
- Haken (je eine Zeile, alle mit `CMD2` markiert): `read()` → `cmdMapAll(tracks)`; `soundFor` → `cmdSound` für erkannte Spuren;
  `allocate`/`summary` → Kit der DRUMS-Spur von der erkannten Spur, `drumKit`/`drumMap` in der Übersicht; `xlaKitId` → `elektro`;
  Import-Blatt: „DRUMS: … → Kit Elektro-Maschine · Tasten umgelegt“.

## A) Pegel nach Lautheit
Je Pad 24 Schläge mit frischem Zufall (wie in der App), K-bewertet 0–400 ms, Median, relativ zum Kick; Ziel = derselbe Abstand am
Original-Einzelschlag. Kick bleibt 0,47; lvl wirkt linear → lvl × 10^(Δ/20). Neu: snare 0,235 · rim 0,496 · perc 0,194 · clap 0,083 ·
tomL 0,109 · hatC 0,083 · tomM 0,149 · shaker 0,140 · tomH 0,130 · hatO 0,041 · Becken 0,064 (ohne Vorlage: −6,3 dB wie die Hats).
(Prüfer-Startwerte bestätigt bis auf die Toms – die sind neu, siehe B.) Vorher lagen die Pads +2 … +10 dB zu laut gegenüber dem Kick.
Nachmessung mit anderen Schlägen: alle Pads im Median −0,2 … +0,1 dB am Ziel (privat und App-Test T7).

## B) Abklingmaß und Toms
Neues Maß: 10-ms-Hüllkurve, letztes Mal über −20/−40 dB, Median über die Schläge (das alte 2-ms-Maß sprang bei tiefen Tönen bis 80 ms).
Toms nachoptimiert (Tonhöhe fällt wie beim Vorbild): −20 dB-Zeit je Tom ±4 ms am Original (Ziel ±15 ms), „Bauch“ 40–100 Hz
1,5–2,0 dB statt 10–12 dB, Terz-Form 4,3–6,1 dB statt 6,7–7,5 dB. Kick, Snare, Clap, Hats, Rim, Perc, Shaker: Klang wie CMD1, nur Pegel neu.

## C) Tasten-Umlegung im DAW-Projekt-Import
Erkennung nur am Aufbau (keine Namen, keine Hashes): Drum-Instrument der DAW, ALLE Noten auf den Tasten 37–46 (ohne 40), also nie die
GM-Bassdrum 35/36, und mindestens eine Taste, die nur in diesem Layout vorkommt (37 Kick, 41/43/45 Toms, 44 Pedal-Hat). Ist eine Spur
sicher erkannt, gilt das für alle Drum-Spuren, deren Tasten passen (gleiche Maschine). Umlegung 37→36, 38→38, 39→39, 41→45, 43→47,
45→50, 46→46, 42→42, 44→70 (SHAKER = Pedal-Hat); eins zu eins, darum bleibt die Teile-Erkennung gleich. Die DRUMS-Spur bekommt das
Kit „Elektro-Maschine“. Andere Drum-Spuren (GM) bleiben wie in 4.79. Der Import bleibt EIN ↶-Schritt (Eintrag `xla`).
Mit der echten Projektdatei (nur lokal): 3 Drum-Spuren erkannt, Song in der App spielt je Pad genau die Noten der Datei.
D) Hall bleibt 0.

## Tests (`[CMD2_ZIEL=… CMD2_CBP=… CMD2_MARKEN=…] node cmd2-test.mjs <index.html> [fotos] [privat-fotos]`)
**ALLE OK: 30** (`test-ergebnis.txt`). T1–T6 = CMD1-Tests auf 4.79 (Kit-Eintrag, laden, 12 Pads spielen, Offline-Render, Pedal-Hat,
MIDI, Klang in der App = Nachbau 0,4–1,7 dB, Speichern/Laden + Neuladen). Neu:
- T7 Lautheit je Pad ±1 dB im Median (24 Schläge, Seeds 701–724): −0,2 … +0,1 dB.
- T8 Import der echten Datei: Blatt-Zeile „→ Kit Elektro-Maschine · Tasten umgelegt“; Kit auf der Drum-Spur; Notenzahl je Pad im
  Song (MIDI-Export wie gehört) = Notenzahl je Taste der Datei nach Umlegung (Erwartung mit dem Import-Kern der Basis gelesen);
  ein ↶ (Eintrag `xla`), ↶ bringt das vorige Projekt, ↷ den Import; Speichern/Laden bitgleich; Neuladen.
- T9 GM-Testdatei (Bassdrum 36): Kit wie in 4.79, keine Umlegung, Zeile ohne „umgelegt“.

## Pflicht (`pflicht.sh` → `pflicht.out`)
topdefs: Skripte 26, Namen 8225, doppelt 0, Syntaxfehler 0 · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „^  live: true,“ 1× ·
VERSION 4.79.0 · Markenwörter nicht mehr als Basis · keine Emojis · Basis md5 d29d696f · apply.py bitgleich · CMD2-BEGIN 1×,
CMD2-XLA-BEGIN 1×, Haken 1×. Import-Kern (Text-Block) zusätzlich in Node übersetzt und auf die echte Datei laufen lassen.
Startzeit (`startzeit.json`, 4 Läufe, Median „App bereit“): Basis 584 ms, CMD2 562 ms (gleich, Rauschen).

## Fotos (DPR 2)
`fotos/cmd2-browser-hoch.png` (428×926), `fotos/cmd2-browser-quer.png` (926×428): Reiter Kits mit „Elektro-Maschine“.
Fotos des Import-Blatts zeigen Spur-Namen der Projektdatei → nur privat.

## Offen / ehrlich
- Gleichzeitige Schläge zweier DAW-Spuren auf dasselbe Pad werden in der App ein Schlag (in der DAW zwei übereinander = lauter). In der
  Projektdatei betrifft das 36 Clap-Schläge.
- Erkennung am Aufbau: eine GM-Drum-Spur ohne Bassdrum, die nur Tasten 37–46 spielt (z. B. Side-Stick + Toms), würde ebenfalls
  umgelegt (37 → Kick). Selten; dann hilft ↶ bzw. Kit/Noten von Hand.
- Toms: Terz-Form 4,3–6,1 dB (Rest der Abweichung in den Obertönen). Rim (nicht im Song) unverändert 7,9 dB.
