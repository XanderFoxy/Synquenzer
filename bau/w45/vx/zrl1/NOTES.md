# ZRL1 – Zerlegen wieder schneller (OFFEN.md A3)

`index.html` = rel-4740 (4.74.0) + Änderungen nur in den Blöcken des Themas (SPK1-Kern, SPK4-Kern), jede Stelle mit `/* ZRL1 */` bzw. `ZRL1:`
im Kommentar. Keine Haken außerhalb, kein sichtbarer Unterschied, VERSION bleibt 4.74.0. `basis.html` = unveränderte 4.74.0-Quelle.
Sicherungen: `index.vor-opt1.html` (= Basis), `index.vor-opt2.html` (Stand nach Schritt 1). Bau-Skripte: `opt1.py`, `opt2.py` (Ersetzungen mit Treffer-Prüfung).

## Befund zuerst (Profil)
- Werkzeug: `mess/zr-node.mjs <html>` lädt den Spektral-Kern **genau so wie der Worker** (gleiche Funktionsliste wie spk1Worker + spk8WUrl) in Node,
  rechnet `create` + `zerlegen` auf dem Demo-Song (20 s) oder gekachelt (`LEN=180`), SDR je Ebene, `DUMP=1` Energie je Ebene (Bit-Vergleich).
  CPU-Profil: `node --cpu-prof … mess/zr-node.mjs`, Auswertung `mess/prof.cjs` (Selbst-/Gesamtzeit) + Zeilen-Ticks (`positionTicks`). Profile in `prof/`.
- Die alte Zahl „4,1 s je 20 s“ (SPK3) gilt nicht mehr: SPK3-R (Tiefband auf herabgesetztem Signal) hatte sie schon zurückgeholt.
  4.74.0 im Test-Chromium: 20 s **1,7–1,95 s** (Last 0,3–0,6), 3 min **14,0 s**.
- Wohin die Zeit ging (Node, 3 min, Kern 12,2 s CPU): Haupt-Schleife in `zerlegen` 4,3 s (REPET-Median über 10 ähnliche Stellen je Bin,
  3×3-Glätten beim Kachel-Schreiben), `hpss`/`medLine` 3,4 s, FFT 1,9 s + `magPair` **1,7 s** (Math.hypot), `zPrep` 1,1 s selbst
  (Ähnlichkeit aller Paare, quadratisch), `bassTrack4` 0,67 s, `loSig` 0,38 s. Kick-Vorlage (`kickTpl`) nur 0,25 s, Sortieren je Oberton
  (`opt.rob`) nicht messbar → die in SPK3 vermuteten Ursachen (Vorlage 16384, Sortieren) sind **nicht** mehr die Kosten; dort nichts geändert.

## Was geändert ist (alle gemessenen Ergebnisse bitgleich: Energie je Ebene und SDR identisch, 20 s und 3 min – gemessen, nicht bewiesen; zu magPair s. Prüfung)
1. `magPair` (SPK1): `Math.sqrt(a*a+b*b)` statt `Math.hypot`, kein Modulo. (hypot ist in V8 ein Vielfaches langsamer.) Abweichung in Float64
   ≤ 1 ULP (5 Mio. Zufallspaare: 1,88 Mio. abweichend, max. 4,4e-16 relativ), nach Float32 **0 / 5 Mio.** – alle Aufrufer speichern Float32
   bzw. rechnen erst dB (Spektrogramm-Bytes, Noten-Übersicht): auch dort 0 / 5 Mio. (`mess/hypot-db.cjs`).
2. `medLine` (SPK1, gleitender Median für HPSS): je Schritt alten Wert im sortierten Fenster durch den neuen **ersetzen** und nur bis zur
   richtigen Stelle schieben (statt Entfernen + Einfügen mit zwei Verschiebungen); gleiches Fenster (W = 2·h + 1 Einträge) → gleicher Median,
   auch bei geradem L (Nachbesserung Prüfung, `mess/medline-alle.cjs`: L = 1…40, 0 / 578 665 abweichend).
3. `zPrep` (SPK1, Ähnlichkeit): jedes Paar (g, h) einmal rechnen und in beide Bestenlisten eintragen (halbe Arbeit); je Liste kommen die
   Kandidaten weiterhin aufsteigend an, Produkt-Summe in gleicher Reihenfolge → gleiche Listen.
4. `zerlegen` (SPK1): Nachbar-Zeilen je Rahmen einmal statt je Bin; REPET-Median auf den **Bytes** (LUT steigt → gleiche Reihenfolge, LUT erst
   am Ende), bei 10 Nachbarn ein Sortiernetz (29 Vergleiche, für alle 1024 0-1-Folgen geprüft) ohne Sprünge; 3×3-Mittel für die Rahmen des
   Streifens vorab zeilenweise in **derselben Summen-Reihenfolge** wie `sm` (Float64, ohne Rand-Abfragen je Zelle), Puffer einmal je Zerlegen.
5. `bassTrack4` (SPK4): Oberton-Bins je Kandidat einmal (gleiche Ausdrücke wie `pk`), Spitzen (±1 Bin) je Rahmen einmal in `PK`.
Verworfen (gemessen): FFT-Schleifen getauscht (Twiddle außen) – in V8 kein stabiler Gewinn (452/405 vs 394/565 ms), nicht eingebaut.

## Messung vorher/nachher
| | Basis 4.74.0 | ZRL1 | Faktor |
|---|---|---|---|
| Node-Kern 20 s (zr-node, Last ~1) | 1,88–2,36 s | 1,37–1,52 s | ×1,4–1,5 |
| Node-Kern 3 min (Kern-CPU) | 15,2 s (12,2 s CPU) | 9,2 s | ×1,65 |
| **Chromium 20 s** (zrl1-test, je 3 Läufe abwechselnd, Median) | **1938 ms** (1691/2012/1938) | **1306 ms** (1104/1610/1306) | **×1,48** |
| **Chromium 3 min** (je 2 Läufe abwechselnd, Last 3,7–6,4) | **15150 ms** (16151/14150) | **12250 ms** (10456/14043) | ×1,24 |
| Chromium 3 min Einzel bei Last 0,6 (vorher) / 3,7 (nachher) | 14027 ms | 10456 ms | ×1,34 |
| **Chromium 3 min bei geringer Last** (Prüfer `ab.mjs`, Last 1,2–1,9, abwechselnd) | **14300 / 14263 ms** | **8886 / 9017 ms** | **×1,59** |
| Chromium 3 min, Endstand nach Prüfung (zrl1-test `RUNDEN3=2`, Last 1,2–1,3) | 13947 / 13778 ms | 8683 / 9154 ms | ×1,55 |
| Chromium 20 s, Endstand nach Prüfung (3 Läufe abwechselnd, Last 0,8–0,9) | 1841 ms (1841/1846/1654) | 1146 ms (1267/1086/1146) | ×1,61 |
| SDR Drums/Bass/Tonal 20 s | 8,545 / 4,373 / 9,945 | 8,545 / 4,373 / 9,945 | ±0,000 |
| SDR 3 min (gekachelt, Raster passt nicht → Bass niedrig) | 5,642 / 0,611 / 9,933 | 5,642 / 0,611 / 9,933 | ±0,000 |
| Energie je Ebene (Bit-Vergleich) | – | Abweichung 0 (20 s und 3 min) | |
| Speicher-Spitze 3 min: RSS aller Renderer-Prozesse (Seite + Worker) | 393 MB (vor Zerlegen 385) | 395 MB (vor Zerlegen 385) | Ziel ≤ 500 OK |
Ziel „≤ 2,5 s je 20 s im Test-Chromium“: erfüllt (vorher schon knapp, jetzt mit Abstand). Last stand während der ersten 3-min-Läufe bei 3,7–6,4
(andere Agenten) → die dort berichteten ×1,24–1,34 waren zu vorsichtig; bei geringer Last (1,2–1,9) misst der 3-min-Fall **×1,55–1,59**
(Prüfer und Endstand), der Node-Kern ohne Seiten-Last ×1,65.
Speicher: Zerlegen selbst braucht je Streifen nur wenige MB (Streifen 128 Rahmen, Ähnlichkeits-Bytes 7 MB für 3 min, loSig 10 MB);
die Spitze ist das Dokument (PCM Int16 + Mitte Float32 ≈ 95 MB für 3 min Stereo) plus die Seite. `Runtime.getHeapUsage` des Workers (CDP)
zeigt nur 3 MB, weil die großen Typed Arrays außerhalb des JS-Heaps liegen – darum RSS als Maß.

## Pflicht / Regression (Endfassung md5 `d6b3289dcc42e242bc8465d69ee7bb5c`, Basis `b66de3cbd5c2d66019c5c0c3d199e06c`)
topdefs „Skripte 26, Namen 7926, doppelt 0, Syntaxfehler 0“ · dupkeys „0 doppelte Schlüssel“ · Rauchtest `errors []` (`smoke-zrl1.png`) ·
„MS 2000“ 1× · „  live: true,“ 1× · VERSION '4.74.0'.

| Test | ZRL1 | Basis 4.74.0 (wo rot) | Bewertung |
|---|---|---|---|
| zrl1-test (eigen) | ALLE OK (7) | – | |
| spk5-test | 24/24 ALLES OK | | |
| spk6-test | 26/26 ALLES OK | | |
| spk11-test (Kopie in reg/) | 41 OK / 0 | | |
| spk11b-test (Kopie, lib-Pfad absolut) | 17 OK / 0 | | |
| fokus1-kern-test (Kopie) | 26 OK / 0 | | |
| spkfix-test (Kopie) | 11/11 ALLES OK | | |
| spk1-test | 17/18 (verfeinern-verbessert-ziel 4,37 → 4,36) | 17/18, derselbe FEHL | vorbestehend (SPK4) |
| spk4-test (Last 9–10) | 6 FEHLER/23 | 3 FEHLER/22 (Last ~3): pflicht (erwartet 4.60), verfeinern +1 dB, ki1 quer-428/370 | 3 gleich |
| · zusätzlich a3-andere-klaenge / a3-nachbau-zeit | va2 3,89 → 4,54, Zeiten +10–25 % | – | Last: Nachbau ist zeitabhängig (SPK4 Offen 3). Nachgemessen bei Last 0,5: Text gleich, Zeiten 2329/1680/2495/2062 → 2066/1563/2259/2057 ms |
| · zusätzlich reg-spk2-test | 27/30 | spk2-test direkt auf Basis: 27/30, **dieselben 3** (noten-erkannt 12/51 Treffer, Oktave 5 – identisch) | vorbestehend; Noten gleich |
Fremde Paketordner unberührt: Tests, die neben sich schreiben, liefen als Kopie in `reg/`; Basis-Läufe in `basis-lauf/`, `s2a/`, `s2b/`.

## Werkzeuge
- `zrl1-test.mjs <index> <basis>`: Chromium, Worker der Seite über `spk1Call('create'|'zerlegen'|'render')`, A/B abwechselnd (`RUNDEN=3`
  für 20 s, `RUNDEN3=1` für 3 min, `NUR=20|180`), SDR gegen die Stems + Energie je Ebene (Bit-Vergleich), RSS-Spitze der Renderer-Prozesse,
  Konsole. Ergebnis `zrl1-test.json`/`.log` (Lauf 1: `zrl1-test.lauf1.*`).
- `mess/zr-node.mjs`, `mess/prof.cjs`, `mess/fftbench.mjs`; Regression `reg/run.sh` (fremde Test-Skripte, die neben sich schreiben, als Kopie
  in `reg/<paket>/`, damit fremde Paketordner unberührt bleiben).

## Offen
1. Weitere Kosten (Node, 3 min nach ZRL1): FFT 1,9 s, HPSS-Median 2,3 s, Kachel-Schreiben 0,5 s, Ähnlichkeit 0,7 s. Nächste Schritte ohne
   Ergebnis-Änderung: Rand-Rahmen (2×9 je Streifen = 14 %) zwischen Streifen weiterreichen statt neu rechnen (FFT + HPSS); HPSS-Zeitmedian für alle
   Bins gemeinsam Zeile für Zeile (Cache). Mit kleiner Ergebnis-Änderung (±0,01 dB): Radix-4-/Real-FFT, Math.round-Ersatz.
2. Auf dem iPhone selbst ungemessen (Faktor dort ähnlich erwartet, alles reine JS-Rechnung); ein 3-min-Song braucht im Test-Chromium jetzt
   ~10–12 s, auf dem iPhone grob das 1,5–2-fache.
3. Fortschritt bei „Alle Ebenen abtasten“ / langem Transient (A3, zweiter Teil) nicht Teil dieses Pakets.
