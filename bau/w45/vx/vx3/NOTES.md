# VX3 – Gesang-Editor an echtem Gesang: Konsonant-Anlauf · NOTES

Datei: `vx/vx3/index.html` = basis.html (4.64.0) + VX3. Block `/* ===== VX3-BEGIN … VX3-END ===== */` direkt nach `/* ===== VX2-END ===== */`.
Haken (je 1 Zeile, Kommentar `/* VX3 … */`, typeof-Schutz):
1. `nx1RunG` (Op 'vxa', Analyse-Kern) vor dem `return`: `vx3Lead(mk, {kind, env, rms, zcr}, an, …, lead)` überschreibt den Anlauf.
2. `wpWorker`: `vx3Lead.toString()` kommt mit in den Worker-Quelltext (sonst rechnete der Worker den alten Anlauf).
3. `wpCall` (erste Zeile): Schalter aus → Nachricht 'vxa' bekommt `vx3: false` (Worker und Hauptfaden-Rückfall rechnen dann wie 4.64).
4. `vx2AnLead` (VX2-Block) vor dem `return`: gleiche Rechnung `vx3Lead(mk, A, an, …, lead)`.
Diff zur Basis 57 Zeilen. VERSION/CHANGES unberührt, nichts beim App-Start, keine sichtbare Änderung an Aussehen/Bedienung (nur andere Stück-Anfänge).
Test-API `window.__vx3`: `on(v)` (Schalter, leert VX1R.ana/VX2.res), `lead(...)`, `leadOf(id)` (Anlauf aus der App-Analyse nachrechnen).

## Entscheidungen
1. **Anlauf über den Vokal-Einsatz** (`vx3Lead`): von der Marke über ≤ 3 gesungene Rahmen (10 ms) zurück (Tonhöhen-Noten beginnen 10–30 ms im Vokal;
   30–39 ms brauchen wegen der Rahmen-Lage 3); mehr gesungen davor = Legato → kein Anlauf. Liegt die Marke selbst in einem stimmlosen Rahmen, zählt er mit.
   Danach ≤ 3 stille Rahmen (Verschluss vor p/t/k), dann der stimmlose Lauf. Node-Varianten (ev3.cjs, App-Quelle): über 1/2/3 Rahmen #1 19/21/22, #10 10/11/11,
   #14 17/18/18; ohne Lücke (#14 15); nur eigene Rahmen + Lücke, kein Zurückgehen: #1 13, #14 11.
2. **Grenze 150 ms ab dem Vokal-Einsatz** (statt ab der Marke): #1 22 → 25. Gesamt-Anlauf ≤ 150 ms + (Marke − Vokal-Einsatz).
3. **Anker-Abstand ≤ 0,2 s**: Anlauf ≤ 0,199 − Anker-Abstand der Marke (vx1rCommit klemmt `an` auf 0,2 – sonst spränge der Anker beim ersten Bearbeiten).
   Greift bei den 3 Aufnahmen nie (lead + an > 0,2: 0), im synthetischen Test bis 0,1925.
4. **Legato-Schutz** (eigener Test zeigte es): am Tonwechsel ist die Periodik 2 Rahmen gestört → „stimmlos“. Ein Lauf ohne Verschluss zwischen zwei gesungenen
   Läufen zählt nur mit Rauschen (ZCR ≥ 0,15) oder ≥ 3 dB leiser als der Vokal danach. Fällt bei den Aufnahmen 2× weg (#1 13,61 s 10 ms, #10 2,30 s 20 ms;
   beide ZCR ≤ 0,03, −3/−1 dB = Tonwechsel), Konsonant #1 25 → 24, #10 11 → 10. Synthetischer Legato-Wechsel: vorher 35 ms Anlauf in den Vorgänger, jetzt 0.
5. **Kern und vx2AnLead gleich**: dieselbe Funktion an beiden Stellen; Worker = Hauptfaden-Rückfall = `leadOf` bitgleich (vx3-test), Op 'vxa' = Gesang-Editor
   bitgleich (vx2-test Prüfung 7), Node-Kern aus index.html = App (Δ kind/an/lead 0).

## Zahlen vorher (4.64.0) → nachher (App-Sonde dbg/probe3.mjs + dbg/analyze.mjs = Prüfer-Maß; reg/probe-analyze.txt)
| Messung | vorher | nachher | Ziel |
|---|---|---|---|
| Konsonant beim Stück #1 | 12/31 | **24/31** | ≥ 16 ✔ |
| Konsonant beim Stück #10 | 9/13 | **10/13** | ≥ 9 ✔ |
| Konsonant beim Stück #14 | 7/18 | **18/18** | ≥ 12 ✔ |
| Stücke mit Anlauf #1 · #10 · #14 | 10 · 8 · 4 | 23 · 12 · 15 | – |
| Stückzahl #1 · #10 · #14 | 69 · 32 · 35 | 69 · 32 · 35 | gleich ✔ |
| Raster 1/8 (rv1) | 67/69 · 24/32 · 30/35 | 67/69 · 24/32 · 30/35 | gleich ✔ (#10: 4 gesperrt/3 besetzt statt 3/4) |
| Präzision A1 (rv1) | 50/69 | 50/69 | gleich ✔ (A2 56 → 57) |
| #1 Vokal-Beginn ±40 ms (A1 · A2) | 50/59 · 56/64 | 50/59 · 56/64 | gleich |
| #1 Stück-Anfang ±40 ms (A1 · A2) | 45/59 · 51/64 | **39/59 · 46/64** | ≥ 80 % ✘ (s. u.) |
| #1 Noten ohne Grenze (A1 · A2) | 4 · 1 | 4 · 1 | gleich |
| rv1-test | 52/53 (nur #10 Raster) | 52/53 (nur #10 Raster) | – |

**„Anfang ≥ 80 %“ ist mit dem Anlauf nicht erreichbar, es sinkt zwangsläufig.** Die Annotation A1 markiert den Vokal-Einsatz (Tonhöhe): die schon in 4.64
verfehlten „Konsonant-Anläufe“ liegen −115…−177 ms vor der Note bei Vokal-Beginn ±40 ms. Jeder Konsonant > 40 ms, der jetzt richtig zum Stück kommt, schiebt
den Stück-Anfang aus dem ±40-ms-Fenster: die 6 verlorenen Treffer (+23 → −59, −8 → −50, −10 → −130, +7 → −135, +22 → −70, +2 → −141 ms) sind genau solche
Stellen, Vokal-Beginn bleibt dort getroffen. Kein Treffer kam hinzu: die späten Fehlgriffe (+49/+79/+97/+99 ms) sind Tonhöhen-Grenzen/verlorene Silben
(Pick, nicht Anlauf). rv1 prüft max(Anfang, Vokal) und bleibt grün (50/59 = 85 %). Den Konsonanten abzutrennen, um „Anfang“ zu heben, widerspräche
der Festlegung (Konsonant gehört zum Stück) – wie schon in der VX2-Prüfung (Befund 4).

## Tests (einzeln nacheinander)
- `vx3-test.mjs` (neu) 9/9 (reg/vx3.txt): Marken 25 ms im Vokal → Stück am Konsonanten (±12 ms; erste ms über der Schwelle), Konsonant beim Stück,
  Legato-Tonwechsel ohne Anlauf, Vokal-Beginn ±15 ms, Worker = Hauptfaden = leadOf bitgleich, Festschreiben (an ≤ 0,2, Anker/Anfang ≤ 0,05 ms), Schalter
  aus = Stücke an den Marken (4.64), wieder an = gleich. Gegen basis.html 6/9 rot (reg/vx3-basis.txt: Stücke 75 ms hinter dem Konsonanten-Beginn).
- vx2-test 14/14 (reg/vx2.txt) · rv1-test 52/53, nur #10 Raster wie 4.64 (reg/rv1.txt, reg/rv1.json) · vx1-test 61/61 (reg/vx1.txt) · imp1-test ALLE OK 48 (reg/imp1.txt).
- Pflicht s. LOG.md.

## Offen / Weg
1. Konsonant nach dem Quantisieren hörbar am Vokal? (Prüfer-Sonde `pruef/kons.mjs`: Kreuzkorrelation Quelle → Ausgang) – nicht nachgemessen (Zeit).
   Sonde: `QUANT=1 node dbg/probe3.mjs …` schreibt die Puffer, kons.mjs mit eigenen Tags.
2. Rest-Fehlgriffe Konsonant: #1 7, #10 3 – meist Grenzfälle des Maßes (Konsonant-Beginn unter der halben Pegel-Schwelle, 1–2 ms nach dem Rahmen-Beginn;
   Konsonant 160 ms > 150 ms; Vorgänger + 40 ms).
3. Längere Anläufe machen die Vorgänger-Sperre beim Quantisieren häufiger (#10 ein Stück „gesperrt“ statt „Linie besetzt“, Raster-Zahl gleich). Bei sehr
   schnellen Noten könnte das Raster dadurch sinken – Weg wie VX2 Offen 2 (1/16 oder Triolen bei Kollision vorschlagen).
4. „Anfang“-Maß: Vorschlag, im rv1-Bericht „Anfang“ gegen den Konsonanten-Beginn der Annotation zu messen oder nur Vokal-Beginn zu werten.

## Dateien
- `dbg/probe3.mjs` (Kopie Prüfer-Sonde + Quelle abziehen, QUANT=1 mit Quantisieren), `dbg/analyze.mjs` (Prüfer-Maß, unverändert kopiert),
  `dbg/ev3.cjs` (Node: Op 'vxa' aus index.html an der App-Quelle, Varianten, Maße), `dbg/runstat.cjs` (Merkmale der Anlauf-Läufe), `dbg/vx3-block.js` (erster Block-Entwurf),
  `dbg/dump/*.json` (Sonden-Daten; Puffer *.f32 gelöscht).
