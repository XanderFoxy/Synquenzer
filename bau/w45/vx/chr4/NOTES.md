# CHR4 – Formanten bei großen Verschiebungen · NOTES (Stand Auftrag 1/2)

Datei `vx/chr4/index.html` = basis5 (4.60.0), in Auftrag 1/2 UNVERÄNDERT (nur Messung/Versuche). Werkzeuge in `src/`:
- `chr3-pruef.mjs` / `chr3-pruef-eval.mjs` / `tmlib.mjs` / `hull.mjs` / `fexp.mjs` (Kopien aus chr3): `TMFILE=<abs index.html> node src/chr3-pruef.mjs <out.json>`; Basis `src/pruef-vorher.json`.
- `pdb.mjs` – Hüllen-Fehler je neuem Teilton in dB (ohne Rendern, exakte Teilton-Pegel); `node src/pdb.mjs [v]`.
- `pdb2.mjs` – dasselbe mit exakten Steigungen (Obergrenze Vibrato-Hermite).
- `fexp2.mjs '<JSON>'` – Render-Versuche: `G`, `rmp` (Rand), `hull:{…}` (CHR3-Hermite), `os:1` (Orakel-Steigung), `e:[400,-500,"w"]`.

## Zahlen (Basis 4.60.0)
| Fall | Formant % | Übergang dB | Glätte |
|---|---|---|---|
| weich / hart / natürlich | 2,43 / 2,58 / 2,67 | 3,15 / 4,02 / 3,30 | 1,11 / 1,19 / 1,00 |
| Chor +400 / −500 | 9,25 / 5,99 | 7,08 / 5,90 | – |
Teilton-dB (leistungsgewichtet): linear +400 4,78, −500 6,20; Hermite mit exakter Steigung 2,14 / 4,04.
Orakel-Hülle 5,79 / 4,08 %, + Schutzzone 0: 5,28 / 3,80 % → Ziel ≤ 5 % hängt an den Rand-Rahmen, nicht nur an der Hülle.
Rand-Kandidat G 2,5 ms + Rampe 20 ms: Übergang 6,36 / 5,32 / weich 2,95 dB, Glätte weich 1,10, Knackser 0, Formant 9,06 / 6,07 / 2,48 %.

## Offen (Auftrag 2b, Stand 1/2 – siehe auch Ende)
Rand-Rahmen klären (Band 300–1000 Hz +4…12 dB an Noten-Rändern), dann Rand + Hülle einbauen (G2 und G6 gleich), Pflicht + Tests.

## Auftrag 2/2 – Test (Datei am Ende wieder = basis5, cmp gleich)
Rand-Versuch in der App-Datei (G2 model + G6 modelRuns: Schutzzone G; G2 render + G6 renderMulti: Blende RMP), je alle 5 Fälle mit
`chr3-pruef` (Zahlen `tmp/pruef-<variante>.json`, Varianten = basis5 mit ersetzten Konstanten, HTML gelöscht):
| G / RMP | weich F·Ü·Gl | hart F·Ü·Gl | natürlich F·Ü·Gl | +400 F·Ü | −500 F·Ü | chr2-Grenze (gegen basis2) |
|---|---|---|---|---|---|---|
| 15 / 10 (Basis) | 2,43·3,15·1,11 | 2,58·4,02·1,19 | 2,67·3,30·1,00 | 9,25·7,08 | 5,99·5,90 | ok |
| 3 / 10 | 2,45·2,95·1,12 | **2,80**·3,61·1,14 | 2,60·3,11·1,04 | 9,07·6,14 | 6,00·5,08 | hart F > 2,74 |
| 3 / 20 | 2,45·2,96·1,12 | **2,77**·3,67·1,23 | 2,58·3,12·**1,06** | 9,14·6,42 | 6,03·5,35 | hart F, natürlich Gl |
| 3,5 / 10 | 2,40·2,94·1,08 | **2,78**·3,58·1,15 | 2,57·3,12·1,05 | 9,24·6,22 | 6,07·5,14 | hart F |
| 4 / 10 | 2,38·2,94·1,16 | 2,74·3,60·1,14 | 2,55·3,09·**1,14** | 9,19·6,27 | 6,18·5,17 | natürlich Gl, +400 ruhig |
| 2,5 / 20 · 2 / 20 · 4 / 20 · 3 / 15 | Übergang ähnlich besser | hart F 2,86/2,93/2,68/2,79, hart Gl 1,30/1,36/1,13/**1,46** | Gl 1,13/1,17/1,14/1,07 | | | je ≥ 1 Grenze |
| 15 / 20 | 2,34·3,11·1,07 | 2,56·4,02·0,94 | 2,54·3,28·0,99 | 9,30·7,40 | 6,02·6,23 | Chor schlechter |
Befund: kleine Schutzzone (2–4 ms) senkt den Übergang überall (Chor −0,6…−0,9 dB, hart 4,02 → 3,6 dB), Knackser bleiben 0 –
aber der Formant im Modus „hart“ steigt stets (+0,16…+0,35 %, Grenze chr2-test +0,2 %), Glätte „natürlich“ kippt je nach Wert.
Die Blende allein (15/20) hilft nicht. → Nicht eingebaut (nicht schlechter ohne Grund). Ursache vermutlich: mit kleinem G liegen die
Rand-Rahmen (Gleitton der Original-Stimme) im Modell, dort sind die Teilton-Pegel unsicher → Hülle am Rand ungenau. Für 2b: G klein
NUR mit Rand-Gewicht der Hülle (Rand-Rahmen nehmen die Hülle des Noten-Kerns) – dann sollte hart-Formant gleich bleiben.

Tests auf `index.html` (= basis5):
| Prüfung | Ergebnis |
|---|---|
| `chr2-test.mjs` (Kopie hier, `src/synth.mjs` + `src/tune-meas.mjs` aus chr3; Basis `vx/basis2.html`) | **ALLE OK (82)** in 107 s (`src/run-chr2.txt`) |
| chr3-Prüfungen (`TMFILE=<abs> node src/chr3-pruef.mjs src/pruef-nachher.json`, `node src/chr3-pruef-eval.mjs …`) | ALLE OK (27), offen 8 (`src/pruef-eval.txt`), Zahlen = `pruef-vorher.json` |
| vx1-test (`node ../rolle/vx1-test.mjs <abs> <abs fotos>`) | 61/61 OK (`reg/vx1.txt`) |
| imp1-test (Kopie `reg/imp1-test.mjs <abs>`) | ALLE OK (48) in 116 s (`reg/imp1.txt`) |
| Pflicht | topdefs doppelt 0/Syntax 0, dupkeys 0, smoke errors [] (`smoke-2.png`), MS 2000 1×, „  live: true,“ 1×, VERSION 4.60.0 |
