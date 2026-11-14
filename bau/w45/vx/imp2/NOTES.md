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
#10: 112 Rang 76 % (Tonhöhe) bzw. 53 % (Modell-Noten aus einem freien Paket) – rate-unabhängig gleich wie vorher, also kein Abtastraten-Fehler.
**Korrektur nach Prüfung (Befund 6):** „125–130“ ist NICHT belegt – mit Energie-Einsätzen des Prüfers (Spektralfluss, an #1 geeicht) liegt 112 auf
Rang 10,4 %, 126 auf 61 %, am besten 167,5 ≈ 1,5 × 112. Das Urteil über #10 hängt an der Einsatz-Quelle; offen, nicht „vermutlich falsch“.
#14 stützen die Prüfer-Einsätze nur schwach (120,6 Rang 5 %, 132,6 Rang 18 %; am besten 138–140 bei nur 31 Einsätzen in 12 s).

## Regression
- imp1-test: ALLE OK (48), 124 s. vx1-test: 61/61.
- rv1-test: Basis heute 48/53 → IMP2 45/53. +1 (#1 „≥ 80 % der Noten haben einen Stück-Anfang“ jetzt OK – knapp: Vokal-Beginn 47 → 48 von 59
  = 81,4 % bei Grenze 80 %, Stück-Anfang bleibt 38/59). −4 = Verschieben links/rechts an
  ANDEREN Stücken (#10 Stück 47 statt 30, #14 Stück 52 statt 55): neues Tempo/t1 → `imp1Take` legt den Take ab Takt 0 an (Auftakt als Stille) → Take um
  einige ms verschoben → Marken (`wpDetect`) anders (#10 56 → 58, #14 69 → 66 Stücke) → der Test wählt andere Stücke. Gegenprobe `RV1_K=30` (#10): mit
  IMP2 links + rechts OK. Fehlerbilder liegen im Gesang-Editor-Verschieben (Ausklang 31 ms vor dem Schnitt nicht bitgleich; #10 −27 ct gegen Grenze 25;
  #14 Dehnung 1,61× gegen 1,55, Vorgänger stimmlos), nicht im Import. → Entscheidung beim Zusammenführen (VX2/VX3 berührt genau diese Stellen).
  **Korrektur nach Prüfung (Befund 2):** Zuordnung nach Datei-Zeit statt Index (`fix/rv1t-test.mjs`, `RV1_T`): #10 ist eine andere Silbe (Basis 4,985 s,
  IMP2 7,068 s; IMP2 an 4,985 s = Stück 32: OK/OK; Basis an 7,068 s = Stück 45: FEHLER/FEHLER mit denselben Zahlen). **#14 ist dieselbe Silbe**
  (9,742 s: Basis Stück 55 OK/OK, IMP2 Stück 52 FEHLER/FEHLER, Dehnung 1,609×, Abweichung bei 245 ms) – „andere Stücke“ war dort falsch. Ursache ist
  das (richtige) Tempo-Raster 121 statt 133: die Basis mit vorweg eingetipptem 120,6 scheitert an derselben Silbe genauso (Prüfer: 1,618×).
  Meine Gegenproben `RV1_K=30/55` trafen auf IMP2 andere Silben (4,703 s / 10,294 s). Keine der 4 neuen FEHLER-Zeilen kommt aus dem IMP2-Code.
- Laufzeit Analyse (Node, 148-s-Song bei 48 kHz): Herunterteilen 40 → 175 ms, gesamt ≈ 800 → 940 ms (+17 %, im Worker, einmal je Import).
  Seit Prüfung (Befund 4) mit reeller FFT schneller als die Basis – Zahlen unter „Prüfung“.

## Offen / Vorschläge
1. ~~Laufzeit ausgleichen~~ – seit Prüfung gebaut (`imp2Spec`, reelle FFT über halbe Länge), Analyse zeichengleich, siehe „Prüfung“.
2. #10 (9 s, frei gesungen): Gesang-Weg schlägt 112 vor; Tonhöhen-/Modell-Einsätze zeigen 125–130, Energie-Einsätze (Prüfer) dagegen 112 bzw. 167,5 –
   Wahrheit unbekannt, also nichts ändern ohne Annotation. Weg, falls eine kommt: Tonhöhen-Einsätze (VX1/G2) als zweite Quelle in die Raster-Treue.
3. Gesang-Editor: Marken hängen von einer Verschiebung des Takes um wenige ms ab (#10: 5 ms → 2 Stücke mehr) – zu VX2/VX3 (Übersegmentierung).
4. Test-Hinweis: rv1-test wählt das Verschiebe-Stück nach Index aus dem Quantisier-Stand; bei anderem Tempo wechselt es. Für Vergleiche NICHT RV1_K
   (Index), sondern die Silbe nach Datei-Zeit (`fix/rv1t-test.mjs`, `RV1_T=<s>`) – Vorschlag für real/rv1-test.mjs (Ordner des RV1-Pakets, nicht hier geändert).
5. Für VX2/VX3 (Gesang-Editor-Verschieben, eigener Fehler, schon in der Basis): #14 Silbe 9,742 s bei Tempo-Raster 121 (rechts: stimmloser Vorgänger
   1,61× gedehnt > 1,55; links: Ausklang ab 245 ms nicht bitgleich), #10 Silbe 7,068 s bei Raster 112 (−27 ct, 1,42×; Ausklang Abw. 0,043 bei 162 ms).
6. Nebenbefund (schon in der Basis, nicht IMP2, nicht gebaut – sichtbar): Import-Blatt nach Antippen des ½×-Vorschlags „… 60 oder 60?“ mit zwei gleichen
   Knöpfen „60 BPM | 60 BPM“ (Basis: 66/66). Vorschlag: nach der Wahl die Frage mit dem neuen Paar (60 · 121) neu stellen oder ausblenden.

## Dateien
`imp2-node.mjs` (Raten-Prüfung), `resp.mjs` (Kennlinie + Zeit), `prof.mjs` (Zeitanteile), `pitchons.mjs` + `fitcurve.mjs` (unabhängige Tempo-Prüfung),
`block.js` + `apply.mjs` (Bau). Seit Prüfung in `fix/`: `krumm-test.mjs` (Befund 1), `fft-test.mjs` (Befund 4), `sweep.mjs` + `kennlinie.mjs` (Befund 5),
`zeit.mjs`, `rv1t-test.mjs` + `rv1t-lauf.sh` (Befund 2, Silbe nach Datei-Zeit). Audio liegt außerhalb von vx (realvox/imp2rs, realvox/npz). Läufe: node-*.txt/json, run-*.txt, rv1-*.json.

## Prüfung (Befunde aus PRUEFUNG.md, behoben im eigenen Ordner; Bau weiter `block.js` → `apply.mjs` → index.html)
Diff zu basis.html jetzt: 2 Haken-Zeilen (`spec`, `down`) + 1 Block IMP2-BEGIN … IMP2-END (67 Zeilen), alles in `imp1Core`. VX2/SPK8 nicht berührt
(kein anderes Paket ändert `imp1Core`). Nichts Sichtbares, keine neuen Knöpfe, VERSION 4.63.0.

| Befund | Stand | vorher → nachher |
|---|---|---|
| 1 MITTEL krumme Abtastrate | **behoben** – `imp2Rs`: schrittweise nur bei `st = exact && P === P0`, sonst je Probe gerundet | `fix/krumm-test.mjs` (down-Pegel 1 kHz + Klick-Lage bei 22,05/32/44,1/48/96 kHz + 0,5 / −0,3 / 0,001 / 0,0048 / 3·10⁻⁶ Hz; Analyse #1/#10/#14/92 4/4 bei sr + δ): FEHLER 37/37 → **ALLE OK (37)**; z. B. #14 bei 48 000,5: 88,6 Mix → 120,7 Gesang (2 Teile), #1 bei 44 100,001: Fehler „still“ → 118,6 |
| 2 MITTEL rv1-test 45/53 | **nachgestellt, nicht in IMP2 behebbar** (Gesang-Editor-Verschieben, VX2/VX3-Stelle) | Silbe nach Datei-Zeit (`fix/rv1t-test.mjs`, `RV1_T`): #14 9,742 s Basis OK/OK (Stück 55) – IMP2 FEHLER/FEHLER (Stück 52, 1,609×) = dieselbe Silbe, Ursache Tempo-Raster 121; #10 4,985 s IMP2 OK/OK (Stück 32), 7,068 s IMP2 FEHLER/FEHLER (1,422×, −27 ct) = Basis-Zahlen. NOTES oben korrigiert, Übergabe Offen 4/5 |
| 3 LEICHT Chor #10 | **nachgestellt, nicht behoben** | 4 FEHLER wie beim Prüfer (st+2/2: 26 statt 17 ms, gegen Lead 44 ms, σ 15,3 ct). Die Basis rechnet für 22,05/44,1-kHz-Eingang dasselbe t1 0,388 (node-vorher.txt) – der Chor reagiert auf 5 ms Take-Lage; Chor-Code, nicht IMP2. Zu CHR |
| 4 LEICHT Laufzeit | **behoben** – reelle FFT `imp2Spec` (komplexe FFT halber Länge + Aufteilung), Haken in `spec()` | `fix/fft-test.mjs`: Betrag gleich bis 1,1·10⁻¹⁴ (n 512) / 1,5·10⁻¹³ (n 4096), Ränder eingeschlossen; Analyse von 7 Stücken **zeichengleich** (alle Felder außer ms). Node (min aus 3, Last 7–9 auf 4 Kernen): 148 s 92 4/4 Basis 846 · IMP2 alt 818–940 · **jetzt 637 ms**; #14 77 · 101 · **49**; #1 219 · 175 · **164**. Browser-Worker (min aus 2, `fix/browser*.txt`): 92 4/4 Basis 909 → **721 ms**, 120 6/8 488 → 356, #1 205 → 160, #14@48k 72 → 69, #10 53 → 41 (Prüfer, IMP2 alt: 920 / 555 / 225 / 97 / 61). Speicher +84 kB je s Audio (Zwischenpuffer 22 050 Hz) bleibt, kurzlebig im Worker |
| 5 LEICHT Sperre bei 32 kHz | **behoben** – Stufe 1 Übergang 5 000 … 16 025 Hz (alles faltet in die Sperre von Stufe 2) | `fix/sweep.mjs` (Sinus alle 100 Hz ab 7 kHz, 16–192 kHz): schlechteste Sperre −42,2 dB (24 kHz/7,3 kHz; auch 44,1/48/96 kHz bei 16,7 kHz −42,5…−44) → **−51,7 dB** (32 kHz/14,8 kHz); Durchlass 1–5 kHz ±0,08 dB; `fix/kennlinie.txt`: 32k 15 kHz −47,1 → −52,3, 44,1k 16,7 kHz −42,5 → −61,9. Tempo-Läufe (imp2-node.mjs, `fix/node-fix.txt`) ALLE OK, bis auf zwei Rundungen gleich: 92 4/4 stabil 0,95 → 0,96 bei 48k (jetzt bei allen Raten gleich), Melodie 96 roh 95,99 → 96 bei 48k |
| 6 LEICHT Bericht/Notizen | **behoben** | Bibliotheksname aus NOTES Z. 31 und LOG Z. 4 entfernt; #10-Aussage „125–130“ zurückgenommen, #14-Stütze nur schwach, rv1-Begründung für #14 korrigiert, „+1 bei #1“ als knapp markiert |
| Nebenbefund „60 oder 60?“ | nicht gebaut (Basis, sichtbar) | Vorschlag Offen 6 |

Prüfungen nach dem Einbau (nacheinander, `fix/`): Pflicht `pflicht.txt`/`smoke.txt` · imp1-test ALLE OK (48), 118 s (`reg-imp1.txt`) · rv1-test 45/53
(`reg-rv1.txt`, genau dieselben 8 FEHLER-Zeilen wie vor dem Einbau und beim Prüfer – die Änderungen verschieben kein Tempo/t1 von #1/#10/#14) ·
vx1-test 61/61 (`reg-vx1.txt`) · Browser: Worker rechnet den neuen Code (worker true, gleiche Tempi wie Node), Touch-Import #14 bei 428×926 und
926×428: „121 oder 60?“, Knöpfe 44 px, nichts seitlich abgeschnitten, ½× → 60,3, Konsole leer (`browser.txt`, Fotos `fix/fotos/`).
Nebenwirkung wie bisher: imp1-/rv1-test überschreiben Fotos in vx/imp/fotos, vx/imp/tmp-audio und vx/real/fotos.
