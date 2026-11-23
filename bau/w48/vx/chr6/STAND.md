# CHR6 – Stand (fertig)
Eingang 4.88.0 (md5 695af0504463a6385e21dc94e55b00c9) → `out.html` (md5 61d55dd9f17fef78c397b762f5b89e26) per
`python3 apply.py <eingang> <ausgang>` (block.js im selben Ordner).

## Änderung
Nur Chor-Weg: `g6pDspMake` bekommt `chr6Lm` (Marker CHR6-BEGIN/-END); in `renderMulti`/`setS` ersetzt sie die lineare
Interpolation der Log-Teiltonpegel (Stelle mit `Math.floor(ke)`, 1 Treffer) durch Lanczos-3 über 6 Nachbar-Teiltöne,
begrenzt auf +3 dB über / −1 dB unter den beiden Nachbarn; unter Teilton 1 und am oberen Rand wie bisher linear/flach.
Stimm-Korrektur (G2 `render`, Stelle mit `Math.floor(kk)`) und alles andere bitgleich (diff: 2 Stellen).

## Kern-Test
`node kern-test.mjs <index.html> [out.json]` – lädt `g6pDspMake` aus der angegebenen Fassung und misst den Chor-Kern
(`modelRuns` + `renderMulti`) mit synthetischen Vokalen a/e/i/o/u (f0 110/196 Hz) bei −12/−7/−4/+4/+7/+12 HT
(+ 20 „echt“-Fälle mit Formant-Faktor 1,035/0,97). Gegen eine andere Fassung: einfach deren index.html angeben.
Maße: Formant-Lage F1/F2 (Leistungs-Schwerpunkt ±5 HT um den Formanten, Ausgabe gegen Ideal auf der Ziel-Tonhöhe),
LPC-Gipfel-Formant %, Hüllen-Fehler dB (leistungsgewichtet je Teilton bis 5 kHz), Ton ct (Kamm-Suche gegen Ziel). ~40 s.
Versuche: `CHR6_PATCH=<var/x.mjs> node kern-test.mjs …` (var/mk.py erzeugt Varianten; Ergebnisse var/*.txt).

| Maß | vorher (vorher.json) | nachher (nachher.json) |
|---|---|---|
| Formant % (Schwerpunkt) | 1,685 | 1,600 |
| Formant % groß (|HT| ≥ 7) | 1,779 | 1,717 |
| LPC-Formant % | 3,382 | 3,126 |
| Hülle dB | 2,829 | 2,338 |
| „echt“ Formant / Hülle | 1,609 % / 2,498 dB | 1,582 % / 2,021 dB |
| schlimmster Fall | 8,18 % | 7,04 % |
| Ton max | 0,0 ct | 0,0 ct |

Versuchs-Reihe (Formant % / Hülle dB): linear 1,685/2,83 · Catmull-Rom 1,647/2,52 · Spline 1,607/2,46 · Lanczos-2 –/2,52 ·
Lanczos-3 1,598/2,34 (gewählt, Begrenzung nicht bindend) · Mischung 50 % 1,626/2,57.

## Pflicht
MS 2000 1× · „  live: true,“ 1× · 0× Sperrzahlen/xander-krypto · doppelt.js: neu [] · Rauchtest (`rauch.js`, 428×926 Touch):
VERSION 4.88.0, errs [], Chor-Kern im Seiten-Kontext + als Worker-Quelltext gerechnet (endlich, `chr6Lm` enthalten).

## Offen / ehrlich
- Gewinn bei der Formant-LAGE ist klein (−5 %), bei der Hülle deutlich (−17 %). Vokal „o“ (F1/F2 eng beisammen) wird
  bei −7/−12 HT etwas schlechter (Hülle 1,38 → 1,56 dB, Formant 1,77 → 2,18 %); +7 HT Formant 1,03 → 1,09 %.
- Die Grenze ist grundsätzlich: liegen die Formanten schmaler als der Teiltonabstand (hohe Stimme, Sprung nach unten),
  fehlt im Original die Information – keine Interpolation holt das zurück (vgl. vx/chr5 „Orakel“).
- Nur synthetisch gemessen; echte Aufnahmen (Schwankung der Teilton-Pegel) nicht geprüft – die Begrenzung (+3/−1 dB) hält
  Ausreißer klein.
