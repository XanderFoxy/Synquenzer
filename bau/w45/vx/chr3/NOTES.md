# CHR3 – Stimmen trennen: geteilte Teiltöne · NOTES (Stand Auftrag 3/3)

Datei: `vx/chr3/index.html` = basis4 (4.59.0) + Kern `chr2Core` aus `src/core3.js` (alle Änderungen dort, Stellen „CHR3“) + Kopf-Hinweis im CHR2-Block
+ Block `CHR3-BEGIN … CHR3-END` (nur Beschreibung) direkt nach `/* CHR2-END */`. Bau: `python3 src/apply3.py <basis4-Kopie>`. Bedienung/Ablage/Speichern
unverändert, VERSION/CHANGES unberührt, nichts beim App-Start. Der Kern läuft weiter im Worker aus `chr2Core.toString()`.

## Was neu ist im Kern
1. Verfolgung (Schritt 1/2): Verfeinern = gewichteter Median der Teilton-Schätzungen, nur dazu passende Teiltöne zählen (Toleranz max(1,2 %, 0,35 Bin));
   liegt der Median > 50 ct vom Gitter → kein Kandidat (sonst Geister wie 337 Hz aus F4-Grundton + E5-Teiltönen). Grundton beim Abziehen ganz (vorher
   auf 1,6 × Teilton 2 gedeckelt → Geist darunter). Teilton 3…5 einer tieferen Stimme mit schwachem Grundton („a“ tief): Grundton + ≥ 2 Nicht-Vielfache
   nötig. Schwache Kandidaten (0,1–0,2 × stärkster) füllen nur fehlende Stimmen, die Auto-Zahl zählt sie nicht.
2. Hülle je Stimme: Vorlauf über alle Rahmen, Log-Pegel der UNgeteilten Teiltöne über Log-Frequenz (48 Bänder, außen flach), ±2 Rahmen derselben Note.
3. Gemeinsames Schicksal: für jedes geteilte Paar (Teilton anderer Stimme < 2,5 Bin) zieht die Spitze im Vibrato zur stärkeren Stimme
   (Spitze ≈ w·cv + (1−w)·cu, kleinste Quadrate über ±6 Rahmen, nur Rahmen mit Abstand < 0,7 σ; f0 je Rahmen genau aus ungeteilten Spitzen).
   Anteil w mit der Hüllen-Erwartung verrechnet (Gewicht Σ(cv−cu)² : 1). Ohne Vibrato-Trennung → Hülle; ohne Hülle → altes Nachbar-Mittel.
4. Oktav-Schutz: tragen die Nicht-Vielfachen von 2 (bzw. 3) unter Teilton 1–12 < 15 % der Leistung, holt sich die Stimme mehr von ihren geteilten
   Nicht-Vielfachen aus dem Anteil der Partner-Stimme (Summe bleibt), tief → hoch.
Befund: Hülle allein reicht bei hohen Stimmen nicht (Teiltöne ~600 Hz auseinander tasten die Formanten zu grob ab: D5 „e“ Teilton 2 im Tal geschätzt 0,25
statt 0,03); Entmischen im Rahmen (2×2, Gauß oder Hann-Keule) brachte nichts – verworfen.

## Messung (`node src/meas.mjs <datei|core.js> [fälle] [out.json]`, vorher `src/vorher.json`, nachher `src/nachher.json`)
v = Verfolgung ±30 ct, w = getrennte Welle (YIN ±30 ct), dB = Pegel-Abstand Ziel/fremd
| Fall | vorher w (v) · dB | nachher w (v) · dB |
|---|---|---|
| 3 Terz + Quinte | 100/99,5/**67,2** · 24/28/29 | **100/100/100** (100) · 29/28/29 |
| 4 eng | 99/**65/65/68** (98/64/78/63) · 22/**6/7**/13 | **100/100/100/98,9** (100) · 25/25/27/17 |
| 2 Terz / 2 Quinte / 3 Sinus / 3 Terz+Sext | 100 / 86,5–100 / 100 / 100 | 100 / 100 / 100 / 100 |
| 3 andere Melodie (tiefer) | 72/78/81 · 9/5/17 | 100/93/93 · 26/28/21 |
| 3 Pegel 1/0,6/0,8 | 87/67/67 · 25/1/29 | 100/100/99,7 · 29/28/29 |
| 4 eng andere Melodie | 55/7/56/51 · 13/−13/3/7 | 100/100/93/82 · 24/13/20/11 |
| 4 eng andere Vokale | 63/76/85/68 · 5/4/11/10 | 100/100/100/97 · 25/24/22/14 |
Auto-Zahl 3/2 richtig. Zeit 8,6 s Gemisch 0,6–1,3 s (vorher 0,5–0,9); 56,6 s: 3 St. 3,1 → 4,3 s, 4 St. 4,5 → 5,9 s, Heap 7 → 19 MB (`src/lang.mjs`).
Stimmführung: 0 falsch zugeordnete Rahmen in allen Fällen (`src/diag.mjs`).
Test `chr3-test.mjs` (Kopie chr2-test; Aufruf `node chr3-test.mjs <abs index.html> <abs basis4.html>`): ALLE OK (82), Läufe `src/run2.txt`, Fotos `fotos/`.
Pflicht: topdefs doppelt 0/Syntax 0, dupkeys 0, smoke errors [] (`smoke-1.png`), „MS 2000“ 1×, „  live: true,“ 1×, VERSION 4.59.0.

## Offen (Auftrag 2/3, 3/3)
- 4 enge Stimmen tief (andere Melodie, F3/C4 mit Vokal „a“: Grundton schwach) Unterstimme 82 % / 11 dB – Grenze: Teiltöne 1/2 fast leer, Rest geteilt.
- Echte Kreuzung zweier Stimmen (eine läuft durch die andere) nicht geprüft; Oktav-Verdopplung bleibt Grenze.
- Ohne Vibrato (sehr gerade Stimmen) fällt der Anteil auf die Hülle zurück (hohe Stimmen schwächer) – mit echten Aufnahmen prüfen.

## Auftrag 2/3 – Formanten bei großen Verschiebungen (Stand: Befund + Versuche, Datei unverändert)
Werkzeuge: `src/tmlib.mjs` (tune-meas als Modul, `TMFILE=../index.html`), `src/fdiag*.mjs` (Zerlegung), `src/fexp.mjs '<JSON-Varianten>'`
(Varianten: `G`, `rmp`, `step`, `per`, `or` = Orakel-Hülle, `hull: {lam, w, mask, cap, e0, e1, lv, up, dn, ex}`, `fr` = je Rahmen), `src/hull.mjs`
(Text-Bausteine Steigung im Modell + `chr3Hull` Hermite; gleiche Bausteine später für G2 model/render und G6 modelRuns/setS). Basis `src/tm2-vorher.json`.
Befund:
1. Rest x − Modell im Vokal −28 dB (Teiltöne −40 dB; Hauptteil > 7 kHz + Hauch) – kein großer Geist der Original-Tonhöhe im ruhigen Teil.
2. Hülle zwischen den Teiltönen ist der größte Einzelposten: liegt ein Formant zwischen zwei Teiltönen (hohe Stimme), verfehlt die lineare
   Log-Interpolation die Spitze um bis 12 dB. Orakel (wahre Hülle): +400 9,3 → 5,8 %, −500 6,0 → 4,1 %, Anlauf −500 50 → 0.
3. Ränder/Übergänge: Schutzzone 15 ms + Rampe 10 ms = Original-Tonhöhe am Strecken-Rand (LSD 15–19 dB); Legato mit Vokalwechsel: Rest-Spitze −8 dB.
   G 15 → 0 ms: Übergang +400 7,08 → 5,99, −500 5,90 → 4,98, weich 3,15 → 2,68 dB, Knackser 0; aber Glätte weich 1,11 → 1,34 (offen).
   Modell-Schritt 5 ms: Übergang besser, Formant schlechter.
4. Hermite-Hülle mit Steigungen aus dem Vibrato (Ridge, Kern der Note, Zeit-Trend 1/t/t² heraus, Pegel-Maske): Hüllen-Fehler an den neuen
   Teiltönen etwa halbiert; +400 9,25 → 8,18 %, aber −500 5,99 → 6,8–7,3 % (F1-Band zu laut) → nicht eingebaut.
5. Anlauf −500 50 ms = Mess-Fehler (YIN des Ideals springt in Note 8 auf 2·f0); gegen die Ziel-Kurve 0 ms.
Das Formant-Maß (Schwerpunkt der Cepstrum-Hülle 300–3500 Hz) schwankt schon mit Orakel-Hülle je Rahmen ±5–12 % – für 2b zusätzlich direkt
an den Teiltönen messen (dB-Fehler je neuem Teilton, `src/fhull.mjs`).

## Auftrag 3/3 – Test (App-Datei unverändert seit 1/3, nur Test + Messung)
| Prüfung | Ergebnis |
|---|---|
| `chr2-test.mjs` (Original aus `chr/`, Kopie hier; Basis `vx/basis2.html` 4.57 ohne Knackser-Fix) | **ALLE OK (82)** in 115 s (`src/run3-chr2.txt`); CHR2 3/3 war 72/82 |
| die 10 bekannten FEHLER | alle weg: 3 St. Unterstimme Welle 67,2 → 100 %; 4 eng Verfolgung 98/64/78/63 → 100/100/100/100 %, Welle 99/65/65/68 → 100/100/100/98,9 %, Pegel 22/6/7/13 → 25/25/27/17 dB |
| App-Weg (Worker, Takes-Blatt › Trennen 3) | Welle 100/100/100 %, 29/28/29 dB, Summe = Original −78 dB, ein ↶/↷ |
| Tuning gegen 4.57 | Knackser 5 → 0 in allen 5 Fällen, LSD/Formant/Ton gleich |
| `chr3-test.mjs` (Tuning-Vergleich gegen 4.59) | ALLE OK (82) (`src/run2.txt`, Stand 1/3, Datei seitdem gleich) |
| chr3-Prüfungen Formant/Übergang/Anlauf (`src/chr3-pruef.mjs`, Bewertung `src/chr3-pruef-eval.mjs`) | ALLE OK (27), **offen 8** (`src/pruef-eval.txt`) |
| Regression | vx1-test 61/61 (`reg/vx1.txt`), imp1-test ALLE OK 48 (Kopie `reg/imp1-test.mjs`, `reg/imp1.txt`) |
| Pflicht | topdefs 0/0, dupkeys 0, smoke errors [] (`smoke-3.png`), MS 2000 1×, live: true 1×, VERSION 4.59.0 |

chr3-Prüfungen (Aufruf `TMFILE=<abs index.html> node src/chr3-pruef.mjs <out.json>`, dann `node src/chr3-pruef-eval.mjs <out.json> [<basis.json>]`;
Ziele aus 2/3: Formant ≤ 4 %, Übergang ≤ 4 dB, Anlauf ≤ 20 ms; Anlauf gegen die bekannte Ziel-Kurve F0·2^(Cent/1200), weil das Ideal in Note 8 selbst springt):
| Fall | Formant % | Übergang dB | Anlauf Ziel-Kurve (tune-meas) ms | Knackser |
|---|---|---|---|---|
| weich / hart / natürlich | 2,43 / 2,58 / 2,67 | 3,15 / 4,02 / 3,30 | 0 / 10 / 0 (0) | 0 |
| Chor +400 (G2 und Chor-Weg gleich) | **9,25** | **7,08** | 0 (0) | 0 |
| Chor −500 (G2 und Chor-Weg gleich) | **5,99** | **5,90** | 0 (50 = Mess-Fehler) | 0 |
Datei = Basis 4.59 in G2/G6 (Text gleich, Zahlen gleich). Offen (Auftrag 2b): Formant und Übergang bei großen Chor-Verschiebungen –
Wege und Versuche siehe Auftrag 2/3 (Schutzzone G 0 ms: Übergang −1 dB, aber Glätte weich 1,11 → 1,34; Hermite-Hülle: +400 besser, −500 schlechter).
