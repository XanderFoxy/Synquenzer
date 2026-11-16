# ZRL2 – Zerlegen weiter schneller + Fortschritt (OFFEN-1611 A4)

`index.html` = rel-4761 (4.76.1, VERSION bleibt '4.76.1') + zwei eigene Blöcke `ZRL2-BEGIN … ZRL2-END` und sechs einzeilige Haken mit „ZRL2“.
`basis.html` = unveränderte rel-4761 (md5 `e4dc1b9599eef2656308cb990e407f37`). Endfassung md5 **`50e0a88c2db5841308a30c565ca3de56`**.
Sicherungen: `index.vor-zrl2.html` (= Basis), `index.vor-fort.html` (nur Zerlegen-Teil). Bau: `bau1.py` (Zerlegen), `bau2.py` (Fortschritt),
jede Ersetzung mit Prüfung „genau 1 Treffer“. Rechnerlast während der ganzen Arbeit 5–14 (andere Agenten) → alle Zeiten A/B abwechselnd,
dazu CPU-Zeit (weniger lastabhängig) und Mikro-Messungen im selben Prozess.

## Ist-Messung vorher (Basis 4.76.1)
- Node-Kern (`mess/zr-node.mjs`, Spektral-Kern wie im Worker), 3 min: zerlegen **10 057 ms** (Last 5,7), Ausgabe `mess/vor-180-basis.json`.
- Test-Chromium (`zrl2-test.mjs`, Basis-Läufe): 3 min **14 017 / 12 696 ms** (Last 10–11), 20 s 3196/2873/2027 ms. (ZRL1 hatte bei Last 1,2 ≈ 8,7 s gemessen.)
- Langer Transient über 3 min: ≈ 2,4 s ohne jede Fortschrittsmeldung (nur „Suche Schläge …“).

## Wohin die Zeit geht (Profil-Beleg `prof/basis180.cpuprofile`, Auswertung `mess/prof-unter.cjs`)
Teilbaum zerlegen 8,0 s + zPrep 1,4 s (async getrennt):
| Teil | ms | Anteil |
|---|---|---|
| HPSS-Mediane `medLine` (Zeit + Frequenz, Fenster 17) | 2 272 | 28 % |
| zerlegen selbst: REPET-Sortiernetz (Z. 1604) 675, Kachel-Schreiben (Z. 1632/1635/1636) ≈ 760, Rest | 2 112 | 26 % |
| FFT Tiefband `lowSplit4 → magsLo` (SPK4) | 830 | 10 % |
| FFT Haupt-Beträge `magsAt` | 865 | 11 % |
| zPrep (einmal je Stück, IDB-Zwischenspeicher): log10-Quantisierung 328, Paar-Ähnlichkeit 177, FFT 600 | 1 381 | – |
| 3×3-Glätten `smRow` | 406 | 5 % |
| loSig, bassTrack4, lowSplit4, projLk | ≈ 1 100 | 14 % |
Befunde: (a) HPSS rechnet je Streifen 146 Zeilen, Zerlegen liest nur 130 (Streifen ± 1 Rahmen) → 11 % Median-Arbeit umsonst. (b) Die Binärsuche
im Median-Fenster springt oft falsch; zeilenweises Rechnen (Cache) brachte dagegen **nichts** (`mess/medbench.mjs`: ×1,02–1,06, verworfen).
(c) Die 18 Rand-Rahmen jedes Streifens werden im nächsten Streifen noch einmal per FFT gerechnet (12 % der Haupt-FFT). (d) `smRow` summiert für
Bass- und Gesang-Anteil über alle 2049 Bins, obwohl EB nur unter KL (≈ 520 Hz) und EV nur 100 Hz…10 kHz ≠ 0 sein können. (e) Kachel-Schreiben
läuft je Zelle durch die (leere) Liste eigener Ebenen.

## Änderungen (alle im Spektral-Kern, Block `ZRL2` in `spk1DspMake`; Ergebnis bitgleich)
1. `zrl2Mags` (Haken in zerlegen, Zeile `const X = …`): wie `magsAt`, übernimmt die Rand-Rahmen des vorigen Streifens. Streifen-Versatz 128 ist
   gerade → dieselben FFT-Paare [gerade, ungerade] → dieselben Bits; geprüft: Signal-Objekt, N, K, Versatz gerade, Paar vollständig, jede `cen`
   gleich; Zwischenspeicher je Dokument in einer WeakMap (hält das Dokument nicht fest), erster Streifen eines Laufs rechnet alles neu.
2. `zrl2Hpss`/`zrl2Med`: HPSS nur für die Zeilen r0…r1 = MG−1…n−MG, die zerlegen liest; je Ausgabe dasselbe Fenster (außen 0) → derselbe Median;
   alter Wert linear von der näheren Seite gesucht. H/mh außerhalb bleiben 0 (H wird von zerlegen nicht gelesen).
   Mikro-Messung echte Beträge (`mess/medbench2.mjs`, CPU-Median je Streifen): Basis 35,3 ms → nur Zeilen 34,0 → + lineare Suche **29,6 ms (−16 %)**, 0 Abweichungen.
3. `zrl2Sm` statt der drei `smRow` (Haken: eine Zeile): gleiche Summen-Reihenfolge, nur in den Bins, in denen das 3×3-Fenster ≠ 0 sein kann, sonst 0
   (= Summe aus neun +0). `mess/tilebench.mjs`: **5,09 → 2,73 ms** je Streifen (−46 %), 0 Abweichungen.
4. `zrl2Tiles` (Haken: `if (!own.length) … else for (…)`): Kacheln schreiben ohne eigene Ebenen (frei = 255) ohne Schleife je Zelle, Felder einmal
   geholt; mit eigenen Ebenen unverändert der alte Weg. `mess/tilebench.mjs`: **5,68 → 4,00 ms** je Streifen (−30 %), Bytes gleich.
5. Fortschritt langer Transient: `ops.spk12trans` bekommt `emit` (Haken 1) und meldet „Schläge suchen“ je 1024 Rahmen, erst ab 4096 Rahmen ≈ 24 s
   Auswahl (Haken 2, kein Einfluss auf die Rechnung); Hauptfaden: `spk12Trans` gibt `zrl2TrCb(U)` mit (Haken 3, nur ohne `keep`), die vorhandene
   Statuszeile zeigt „Suche Schläge … NN %“ (wie SPK12 „Ebene „…“ abtasten … NN %“). Block `ZRL2` hinter `SPK12-END`.
   **Einziger sichtbarer Unterschied**: die Prozentzahl hinter dem schon vorhandenen Text „Suche Schläge …“ bei Auswahlen über ≈ 24 s.
6. „Alle Ebenen abtasten“ aus: Fortschritt gab es schon (SPK12-Prüfung, `src()` meldet „Ebene abtasten“) – geprüft, nichts geändert.
Verworfen (gemessen): Zeit-Median zeilenweise für alle Bins (Cache) – kein Gewinn. Gekürztes REPET-Sortiernetz: alle 29 Vergleicher nötig für Stelle 4/5.

## Messung nachher
| | Basis 4.76.1 | ZRL2 | Faktor |
|---|---|---|---|
| **Test-Chromium 3 min** (zrl2-test, 2 Runden abwechselnd, Last 10–11) | 14 017 / 12 696 ms (Median 13 357) | 11 534 / 11 944 ms (Median 11 739) | **×1,14** |
| Test-Chromium 20 s (3 Runden abwechselnd, Last 9,5–12) | 3196/2873/2027 (Median 2873) | 2561/2110/1725 (Median 2110) | ×1,36 |
| **Node-Kern 3 min, selber Prozess, 4 Runden abwechselnd, CPU-Zeit** (`mess/zr-ab.mjs`, `mess/ab-180.out`) | 6907/9535/9052/8645 (Median 8849) | 5818/8128/7749/7409 (Median 7579) | **×1,17** (jede Runde ×1,17–1,19) |
| Node-Kern 60 s, selber Prozess, CPU-Median | 3190 ms | 2838 ms | ×1,12 |
| Ergebnis: SDR Drums/Bass/Tonal 20 s · 3 min | 8,545/4,373/9,945 · 5,642/0,611/9,933 | gleich | ±0,000 |
| Energie je Ebene (20 s, 3 min, Summe + gewichtete Summe) | – | Abweichung 0 | bitgleich |
| Hash über alle Proben aller 4 Ebenen (Node, 60 s und 3 min) | add2fce1 · ee7849cc | add2fce1 · ee7849cc | gleich |
| Speicher-Spitze 3 min (RSS aller Renderer) | 396 MB | 407 MB | Ziel ≤ 500 OK |
| Transient 3 min (ganzes Stück) | 346 Schläge, 0 Meldungen | 346 Schläge (gleiche Zeiten), 30 Meldungen: 3 % nach 103 ms … 99 % nach 2701 ms | |
| „Alle Ebenen abtasten“ aus + Transient 3 min (`EBENE=1`, `ebene/zrl2-test.json`) | – | „Ebene abtasten“ 48 Meldungen (2 % nach 135 ms … 99,6 % nach 6842 ms), danach „Schläge suchen“ 30 Meldungen bis 9042 ms | |
Einordnung: ≈ 15 % weniger Rechenzeit beim Zerlegen. Bei geringer Last (ZRL1-Basis 8,7 s) wären das ≈ 7,5 s für 3 min – bei Last 10 nicht direkt gemessen.

## Tests
- `zrl2-test.mjs index.html basis.html` (`RUNDEN=3 RUNDEN3=2`, Ausgabe `zrl2-test.out`, `zrl2-test.json`): **ALLE OK (12)** – Ziel 20 s ≤ 2,5 s,
  20 s/3 min schneller, SDR gleich 20 s/3 min, Energie bitgleich 20 s/3 min, Speicher ≤ 500 MB, Transient gleich + Fortschritt, Konsole [].
- Node: `mess/zr-node.mjs` 3 min Energie je Ebene identisch (`mess/z1-180-index.json` = `mess/vor-180-basis.json`), `mess/zr-ab.mjs` Hash gleich.
- Mikro: `mess/medbench2.mjs` (0 Abweichungen), `mess/tilebench.mjs` (0 Abweichungen).
- Regression (Kopien in `reg/`, Last 7–29): **spk5-test ALLES OK · 24 Prüfungen** (darunter „Zerlegen: Auswahl“ = Start mitten im Stück, erster Streifen ohne Übernahme) ·
  **spk6-test ALLES OK** (27 OK, Kern-Messwerte 24/0).
- Pflicht: topdefs „Skripte 26, Namen 7989, doppelt 0, Syntaxfehler 0“ (Basis 7988; +1 = `zrl2TrCb`) · dupkeys „0 doppelte Schlüssel“ ·
  Rauchtest `errors []`, `smoke-zrl2.png` byte-gleich mit `smoke-basis.png` · „MS 2000“ 1× · „  live: true,“ 1× · VERSION '4.76.1'.

## Haken außerhalb der Blöcke (je eine Zeile, Kennung ZRL2)
zerlegen (SPK1): `const X = zrl2Mags(…), {H, mh} = zrl2Hpss(…)` · `zrl2Sm(…)` statt der smRow-Zeile · `if (!own.length) zrl2Tiles(…); else for (…)`.
SPK12: `ops.spk12trans = (d, m, emit) =>` · neue Zeile `if (emit && nF > 4096 && (n & 1023) === 1023) emit(…)` · `spk12Trans`: 4. Argument von spk1Call.
Stellen von LT2/SPKK/IMPK nicht berührt (keine Long-Task-/Import-Stellen; spk12Trans nur die eine Aufruf-Zeile – beim Zusammenführen mit SPKK beachten).

## Offen
1. Weitere bitgleiche Wege (gemessen klein, nicht gebaut): Rand-Rahmen auch im Tiefband (`lowSplit4 → magsLo`, SPK4-Block, ≈ 100 ms je 3 min);
   zPrep-Quantisierung ohne log10 (Schwellen-Tabelle + genaue Rechnung nahe der Schwellen, ≈ 200 ms, nur beim ersten Zerlegen eines Stücks).
2. Mit kleiner Ergebnis-Änderung (wie ZRL1 Offen): Real-FFT / Radix-4, schnellerer Median (z. B. Sortiernetz-Paare) – nur nach Freigabe.
3. „Alle Ebenen abtasten“ aus: Fortschritt war schon da; das Ebenen-Signal selbst kostet bei 3 min ≈ 6,9 s (Last 8) – eigenes Paket (Block-Render).
4. Statuszeile „Suche Schläge … NN %“ nur über den Rückruf geprüft (30 Meldungen), nicht per Geste im Spektral-Blatt fotografiert.
5. Übrige Spektral-Regression (spk1/spk4/spk11/spk11b/fokus1/spkfix) in diesem Paket nicht gelaufen (Zeit, Last 10–29); spk5/spk6 grün, Ergebnis bitgleich.
