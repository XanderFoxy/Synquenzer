# CHR3 – Stimmen trennen: geteilte Teiltöne · NOTES (Stand Auftrag 1/3)

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
