# IMP2 – Tempo unabhängig von der Abtastrate · NOTES

Datei: `vx/imp2/index.html` = basis.html (4.63.0) + IMP2. Diff: 2 Haken-Zeilen + 1 Block (≈ 67 Zeilen), alles IN `imp1Core` (damit es über
`imp1Core.toString()` automatisch im Worker läuft – kein Haken am Worker nötig):
- Haken, 1. Zeile in `down(x, sr)`: `if (typeof imp2Down === 'function') return imp2Down(x, sr);   /* IMP2 … */`
- Haken, 1. Zeile in `spec(x, i0, p, out)` (seit Prüfung, Befund 4): `if (typeof imp2Spec === 'function') return imp2Spec(x, i0, p, out);   /* IMP2 … */`
- Block `/* IMP2-BEGIN … */ … /* IMP2-END */` direkt nach `down()` (vor `const med`): `imp2Kai` (Kaiser-Sinc in Sekunden), `imp2Rs` (Stufe 1,
  Phasen-Tabelle), `imp2Down` (Stufe 2 Halbband + Pegel RMS 0,1), `imp2Spec` (reelle FFT, seit Prüfung). Quelle: `block.js`, eingesetzt mit `apply.mjs` (basis.html → index.html).
Nichts Sichtbares, keine neuen Knöpfe, VERSION unverändert. VX2/SPK8-Stellen nicht berührt.

## Befund (vorher)
`down()` teilte durch k = floor(sr/11000): 44,1 kHz → 11 025 Hz, 48 und 96 kHz → 12 000 Hz, Kastenfilter der Länge k (Dreieck). Damit hing die
ganze Merkmals-Kette (STFT 512, Rahmen 10 ms, Bänder, Spitzen) an der Eingangsrate; das Dreieck dämpft 5 kHz um 5–6 dB und lässt 7 kHz nur
−10…−13 dB gedämpft falten – je Rate anders. Wichtig: die App dekodiert jeden Import auf 48 kHz (`ggbDecode`, GGB_SR 48000), d. h. im Browser lief
immer der 12-kHz-Weg; 44,1 kHz kommt über Takes (`m.sr`) und SPK1-Quellen.

## Verfahren (nachher)
Immer genau 11 025 Hz, Ausgabe-Zeitpunkte j/11 025 s ab der ersten Probe (wie vorher). Filter in Sekunden entworfen → bei jeder Rate dieselbe Kennlinie.
1. Eingang → 22 050 Hz: Kaiser-Sinc, Grenze 10 512,5 Hz, Übergang 11 025 Hz (5 000 … 16 025 Hz), 50 dB (flach bis 5 kHz; alles im Übergang faltet nach
   ≥ 6 025 Hz = Sperre von Stufe 2) – seit Prüfung (Befund 5), vorher Grenze 11 025 / Übergang 12 050 (Sperre ab 17 kHz);
   Phasen-Tabelle exakt (44,1/88,2 kHz: 1 Phase, 48/96 kHz: 147, 32 kHz: 441); ganzzahlige Raten mit > 4096 Phasen und krumme Raten (z. B. 48 000,5):
   4096 Phasen, je Ausgabe-Probe gerundet (krumme Raten erst seit Prüfung, Befund 1 – vorher Unsinn); 22 050 Hz: Stufe entfällt;
   unter 22 050 Hz (16/8 kHz) Grenze = sr/2.
2. Halbband 22 050 → 11 025 Hz: Grenze 5 512,5 Hz, Übergang 1 025 Hz, 50 dB (flach bis 5 kHz, Sperre ab 6 kHz), 16 Paare (jede 2. Zahl 0).
Kennlinie (resp.mjs, Sinus-Pegel nach dem Umrechnen, dB, alt/neu):
| Hz | 2000 | 4000 | 5000 | 5500 | 6000 | 7000 | 10000 |
|---|---|---|---|---|---|---|---|
| 44,1k | −0,9 / 0,0 | −3,7 / 0,0 | −6,0 / −0,1 | −7,4 / −5,8 | −9,0 / −40 | −12,9 / −49 | −38 / −55 |
| 48k | −0,8 / 0,0 | −3,1 / 0,0 | −5,0 / 0,0 | −6,1 / −5,8 | −51 / −40 | −10,5 / −49 | −27,5 / −54 |
| 96k | −0,8 / 0,0 | −3,3 / 0,0 | −5,2 / 0,0 | −6,4 / −5,8 | −51 / −40 | −11,0 / −49 | −28 / −54 |
Verworfen: 1 Stufe (140 Abgriffe bei 48k, 515 ms/180 s); 40 bzw. 35 dB (kaum schneller, Kennlinie je Rate bis 0,3 dB verschieden); Halbieren vorab
bei 96k ([1 2 1]/4, −0,2 dB bei 5 kHz – mit 2 Stufen unnötig).

## Zahlen vorher → nachher (Node, imp2-node.mjs: dieselben Stücke mit einem hochwertigen Umrechner auf 22,05/44,1/48/96 kHz; node-vorher.txt / node-nachher.txt)
| Stück | vorher 22,05 / 44,1 / 48 / 96 kHz | nachher (alle Raten) | Spanne vorher → nachher |
|---|---|---|---|
| App-Render 92 4/4 (WAV + MP3) | 92 · 4/4 · 8 Teile überall | 92 · 4/4 · 8 Teile | 0,00 → 0,00 |
| App-Render 120 3/4 / 120 6/8 | 120 · richtig überall | 120 · richtig | 0,01 → 0,00 |
| Melodie 96 (Gesang) | 96 · Frage · 48/192 | 96 · Frage · 48/192 | 0,00 → 0,01 |
| Echt #1 (Annotation ≈ 119) | 118,6 / 118,6 / 118,6 / **119,7** | 118,6 (Frage 119 · 59 · 237) | 1,10 → 0,00 |
| Echt #10 | 112,1 überall | 112,13 | 0,02 → 0,00 |
| Echt #14 | 120,7 / 120,7 / **132,6** / **132,6** | 120,6 (Frage 121 · 60) | 11,87 → 0,05 |
Bass-Anteil (lowRatio) jetzt rate-unabhängig (#1 0,051 bei 48k → 0,025; #10 0,051 → 0,027), Quelle „gesang“ + Frage bleibt bei allen.
Richtig? Unabhängige Einsätze aus der Tonhöhe (pitchons.mjs: YIN 10 ms, Stimm-Beginn / Sprung > 70 ct; fitcurve.mjs = Raster-Treue wie rv1-test),
an #1 geeicht (beste 119,5 = Annotation 119): #14 → beste 60,5–61 (½ von 121): **120,6 Rang 0,8 %** (mit ½×), **132,6 Rang 59 %** → der alte
48-kHz-Wert war falsch, jetzt richtig. Oktav-Fehler: keiner (Vorschlag 120,6 = Viertel, ½× wird gefragt wie bisher).
#10: 112 Rang 76 % (Tonhöhe) bzw. 53 % (Modell-Noten aus einem freien Paket) – beide Bezüge zeigen 125–130; rate-unabhängig gleich wie vorher,
also kein Abtastraten-Fehler, aber vermutlich nicht richtig (siehe offen).

## Regression
- imp1-test: ALLE OK (48), 124 s. vx1-test: 61/61.
- rv1-test: Basis heute 48/53 → IMP2 45/53. +1 (#1 „≥ 80 % der Noten haben einen Stück-Anfang“ jetzt OK, Basis 38/59). −4 = Verschieben links/rechts an
  ANDEREN Stücken (#10 Stück 47 statt 30, #14 Stück 52 statt 55): neues Tempo/t1 → `imp1Take` legt den Take ab Takt 0 an (Auftakt als Stille) → Take um
  einige ms verschoben → Marken (`wpDetect`) anders (#10 56 → 58, #14 69 → 66 Stücke) → der Test wählt andere Stücke. Gegenprobe `RV1_K=30` (#10): mit
  IMP2 links + rechts OK. Fehlerbilder liegen im Gesang-Editor-Verschieben (Ausklang 31 ms vor dem Schnitt nicht bitgleich; #10 −27 ct gegen Grenze 25;
  #14 Dehnung 1,61× gegen 1,55, Vorgänger stimmlos), nicht im Import. → Entscheidung beim Zusammenführen (VX2/VX3 berührt genau diese Stellen).
- Laufzeit Analyse (Node, 148-s-Song bei 48 kHz): Herunterteilen 40 → 175 ms, gesamt ≈ 800 → 940 ms (+17 %, im Worker, einmal je Import).

## Offen / Vorschläge
1. Laufzeit ausgleichen (Vorschlag, nicht gebaut): `features()` rechnet reelle Signale mit komplexer FFT (512 je Rahmen + 4096 je 8 Rahmen ≈ 300 ms
   von 650 ms). Reelle FFT über halbe Länge (Paar-Packung) spart ≈ 40 % davon (≈ 120 ms) – mehr als IMP2 kostet; Ergebnis bis auf Rundung gleich.
2. #10 (9 s, frei gesungen): Gesang-Weg schlägt 112 vor, Tonhöhen- und Modell-Einsätze sprechen für 125–130. Weg: Tonhöhen-Einsätze (VX1/G2 hat sie)
   als zweite Quelle in die Raster-Treue nehmen; eigenes Paket, mit imp1-/rv1-test.
3. Gesang-Editor: Marken hängen von einer Verschiebung des Takes um wenige ms ab (#10: 5 ms → 2 Stücke mehr) – zu VX2/VX3 (Übersegmentierung).
4. Test-Hinweis: rv1-test wählt das Verschiebe-Stück aus dem Quantisier-Stand; bei anderem Tempo wechselt es. Für Vergleiche Stück fest per RV1_K.

## Dateien
`imp2-node.mjs` (Raten-Prüfung), `resp.mjs` (Kennlinie + Zeit), `prof.mjs` (Zeitanteile), `pitchons.mjs` + `fitcurve.mjs` (unabhängige Tempo-Prüfung),
`block.js` + `apply.mjs` (Bau). Audio liegt außerhalb von vx (realvox/imp2rs, realvox/npz). Läufe: node-*.txt/json, run-*.txt, rv1-*.json.
