# CHR5 – Formanten bei großen Sprüngen (Fortsetzung CHR4 „2b“) · NOTES

**Ergebnis: nichts eingebaut.** `index.html` = `basis.html` (4.63.0, cmp gleich), kein CHR5-Markerblock, keine Haken. Grund: keiner der
Wege war „messbar besser und nirgends schlechter“; das Ziel (+400 ≤ 6 %, −500 ≤ 5 %) hängt vor allem an der Hülle im Noten-KERN, nicht am Rand.

## Zahlen (Basis 4.63.0 = 4.60.0, `src/pruef-vorher.json`)
| Fall | Formant % | Übergang dB | Glätte | Ton ct |
|---|---|---|---|---|
| weich / hart / natürlich | 2,43 / 2,58 / 2,67 | 3,15 / 4,02 / 3,30 | 1,11 / 1,19 / 1,00 | 1,9 / 2,1 / – |
| Chor +400 / −500 (G2 = G6 Chor-Weg) | 9,25 / 5,99 | 7,08 / 5,90 | 1,34 / 0,45 | 2,3 / 0,9 |

## Wo steckt der Fehler? (+400, 20-ms-Raster, `tmp/fr-lin400.txt` / `tmp/fr-or400.txt`)
| Hülle | gesamt | Rand (±70 ms um Noten-Grenzen, 45/182 Rahmen) | Kern (137/182) |
|---|---|---|---|
| linear (heute) | 9,31 | 3,26 | **6,05** |
| Orakel (wahre Hülle) | 5,68 | 2,88 | 2,80 |
→ Selbst ein perfekter Rand (0) ließe mit linearer Hülle ≈ 6,1 %. Das Ziel +400 ≤ 6 % liegt knapp über dem Orakel (5,79 %) und braucht eine
Kern-Hülle nahe am Orakel. Kern-Fehler: Vokale „o“/„e“, F1 liegt zwischen Teilton 1 und 2 → Band 300–1000 Hz 2–5 dB zu leise, +10…+31 % je Rahmen.
Rand im Einzelnen (`src/diag.mjs`): an Strecken-Anfängen fehlt die verschobene Stimme (Schutzzone G 15 ms + Blende; 2,87 s: Ziel-Kamm −10 dB,
Original-Kamm +15 dB), im Legato (0,69 s) ist der Original-Abzug sauber, aber die verschobene Hülle im Gleitton 6 dB zu leise.

## Versuche (alle verworfen, Skripte in `src/`)
| Weg | +400 F | −500 F | weich F | hart F (Ton) | Befund |
|---|---|---|---|---|---|
| Basis | 9,25 | 5,99 | 2,43 | 2,58 (2,1 ct) | |
| All-Pol-Hülle (DAP), Teilton-dB statt %: lin 4,78/6,20 dB | 4,62…6,9 dB | 6,7…8,4 dB | – | – | zu wenig Stützstellen, Pole falsch (`dap.mjs`, `pdbdap.mjs`) |
| Rand-Rahmen nehmen Hüllen-FORM des Kerns (EZ 30 ms), G 15 | 9,27 | 5,99 | 2,46 | 2,59 | wirkungslos (`fexp5.mjs`) |
| dasselbe + G 3 ms | 9,10 | 5,98 | 2,48 | **2,83 (3,0 ct)** | Übergang 6,15/5,08 dB besser, hart schlechter |
| + EZ 20 + Rampe 20 | 9,14 | 6,03 | 2,45 | 2,77, Gl 1,24 | hart schlechter |
| Hülle unter T1 mit Steigung T1→T2 (±6/±10 dB) | – | **6,17…6,67** | – | – | −500 schlechter (`fexp5b.mjs`) |
| G 3 ms nur bei |Verschiebung| ≥ 150 ct (Versatz 12 ms sonst) | 9,07 | 6,00 | **2,60** | 2,80 | Modell-Raster verschoben, hart-Kurve > 150 ct (`fexp5c.mjs`) |
| Hülle Betrag-linear (β 0,5/1) | 9,06/9,00 | 6,06/**6,24** | – | – | −500 schlechter (`fexp5d.mjs`) |
Wichtige Erkenntnis zu CHR4s Vermutung: der Anstieg „hart“-Formant bei kleinem G kommt NICHT aus der Hüllen-Form der Rand-Rahmen (Rand-Form vom Kern
ändert ihn nicht: 2,80 → 2,83). Ursache ist die hart-Kurve am Noten-Anfang (folgt der Stimme; Schleifer/unsichere Tonhöhe → große Korrektur im
Rand, Ton-Fehler hart 2,1 → 3,0 ct). Ein kleines G bräuchte dort eine Kurve, die die ersten ~15 ms nur sanft korrigiert.

## Nächster Weg (Vorschlag, unsichtbar – keine Bedienung)
1. **Hüllen-Gedächtnis je Vokal-Klasse** (die einzige neue Information für den Kern): Rahmen des Takes nach Hüllen-Form gruppieren (niedrige
   Cepstrum-Ordnung aus den Teiltönen), Teilton-Pegel aller Rahmen einer Gruppe mit ANDERER Grundfrequenz als Stützstellen über der Frequenz
   sammeln; die Hülle zwischen T1 und T2 dann aus diesen Stützstellen (Gesang wiederholt Vokale auf verschiedenen Tonhöhen). Im Prüf-Take:
   „a“ auf 330/392/397 Hz, „o“ auf 401/487 Hz, „e“ auf 330/435 Hz. Aufwand ~1–2 h, zuerst Offline-Probe mit `pdb.mjs` (Teilton-dB).
2. Rand: kleines G (3 ms) nur zusammen mit einer hart-Kurve, die im Rand (erste/letzte 15 ms einer Strecke) die Korrektur einblendet statt der
   Stimme zu folgen; Ziel: Chor-Übergang −0,9 dB (7,08 → 6,15, 5,90 → 5,08) ohne hart-Formant-Anstieg.
3. Ziel-Grenzen prüfen: +400 ≤ 6 % ≈ Orakel (5,79 %); realistisch mit 1.+2. eher 7…8 %.

## Tests (index.html = basis.html)
| Prüfung | Ergebnis |
|---|---|
| Pflicht | topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · smoke errors [] (`smoke.png`) · MS 2000 1× · „  live: true,“ 1× · VERSION 4.63.0 |
| chr2-test (gegen vx/basis2.html) | ALLE OK (82), 127 s (`reg/chr2.txt`) |
| vx1-test | 61/61 (`reg/vx1.txt`) |
| spk6-test | ALLES OK (`reg/spk6.txt`) |
| chr3-pruef | Zahlen = Basis (`src/pruef-vorher.json`) |
