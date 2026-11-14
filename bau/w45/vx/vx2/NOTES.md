# VX2 – Gesang-Editor an echtem Gesang: Stücke = Noten/Silben · NOTES

Datei: `vx/vx2/index.html` = basis.html (4.62.0) + VX2. Block `/* ===== VX2-BEGIN … VX2-END ===== */` direkt nach `/* ===== NX1-END ===== */`
(weit weg von Ebenen-Liste, Spektral-Seite, Tastatur links). Einzige Stelle außerhalb: 1 Zeile in `vx1rAnalyse` (Kommentar `/* VX2 … */`, `typeof`-Schutz).
VERSION/CHANGES unberührt, nichts beim App-Start, keine sichtbare Änderung an Aussehen/Bedienung (nur andere Stück-Grenzen).

## Entscheidungen
1. **Quelle der Stücke = Tonhöhen-Noten (G2, VS2-Segmente)**, nicht die Einsatz-Erkennung. Gemessen an der 33-s-Aufnahme mit Noten-Annotation:
   Erkennung 213 Marken, Präzision 20 %; G2 59 Noten, Präzision 85 %. Jede Note beginnt ein Stück – auch ein Legato-Tonwechsel (Wunsch: Tonwechsel = Grenze).
   Die Note wird an einen Erkennungs-Einsatz ±20 ms eingerastet (probengenau), sonst Noten-Beginn (10-ms-Raster).
2. **Erkennungs-Marken ohne Note** bleiben nur mit Einsatz-Merkmal: stimmloser Konsonant davor (≥ 2 stimmlose Rahmen in −100…+20 ms), Pegel-Tal > 6 dB
   (Pegel über 30 ms – die 1-ms-Hülle zeigt in tiefen Stimmen 7–13 dB Perioden-Welligkeit auch im gehaltenen Vokal) oder Wort-Beginn nach Ruhe – und danach
   ≥ 50 ms gesungen. Atem/Geräusch/Pausen werden kein eigenes Stück (bleiben als Ausklang/Lücke). Mindestabstand 50 ms.
3. **Nur Gesang-Editor, nur erkannte Marken**: gespeicherte Marken (`m.marks`, alte/bearbeitete Takes) bleiben unverändert; das Ergebnis ersetzt `WP.det`
   (gilt dann auch in der Zeitkarte des Takes) und wird beim ersten Bearbeiten wie bisher festgeschrieben. Ohne Tonhöhe (G2 fehlt / < 2 Noten) → wie bisher.
   Schalter `window.__vx2.on(false)`; `window.__vx2.last()` = Zahlen der letzten Wahl.
4. **Keine Zusatz-Laufzeit**: Op 'vxa' (Worker) und G2 laufen wie bisher gleichzeitig; Anker + Anlauf der neuen Marken auf dem Hauptfaden aus derselben
   Analyse (`vx2AnLead`, gleiche Rechnung wie 'vxa', in Node bitgenau geprüft, 12–16 ms für 33 s). Analyse #1 3,6–4,0 s (vorher 3,8 s).
5. Konsonant vor dem Vokal gehört wie bisher als Anlauf zum Stück (VX1-Logik unverändert), Anker = lautester Spitzenwert im Einschwingbereich (unverändert).

## Zahlen vorher (4.62.0) → nachher (rv1-test, alle 3 Aufnahmen; run0-basis.txt / run2.txt; rv1-vorher.json / rv1-nachher.json)
| Messung | vorher | nachher |
|---|---|---|
| #1 Stücke / Noten | 150 / 59 | **60 / 59** (+2 %) |
| #1 Stücke an einer Note ±40 ms | 51/150 = 34 % | **52/60 = 87 %** |
| #1 Einsätze ±40 ms Anfang · Vokal-Beginn | 38 · 47 von 59 (79,7 % → FEHLER) | **45 · 49** von 59 (83 % OK) |
| #1 Tonhöhe ±50 ct | 75/85, Median 6 ct | 55/56, Median 2 ct |
| Raster 1/8 auf der Linie #1 · #10 · #14 | 94/150 · 31/56 · 45/69 | **58/60 · 20/28 · 28/32** |
| #10 · #14 Stücke | 56 · 69 | 28 · 32 |
| Quantisieren: Render | 438 / 235 / 216 ms | 471 / 406 / 321 ms (weniger, längere Stücke) |
| rv1-test gesamt | 48/53 | 48/53 (andere Fehler, s. u.) |
Node (dbg/eval.cjs, gleiche Rechnung ohne Browser, Datei-Zeit): roh 213 → 60, Präz 26 → 85 %, Anfang 35 → 43, Vokal 46 → 50.

## Neue FEHLER-Zeilen im rv1-test = Bezugsfenster des Tests, kein neuer Knackser
Mit ganzen Noten als Stücken verschiebt Quantisieren 1/8 weiter (bis ±126 ms) und der Vorgänger wird öfter gedehnt. Der Test vergleicht die 2. Ableitung des
Ausgangs ±4 ms an der Naht mit der Quelle ±20 ms um den Stück-Anfang und um die UNGEDEHNTE Vorgänger-Stelle. Gedehnt spielt aber der Ausklang des Vorgängers
(oft der Konsonant der nächsten Silbe) bis an die Naht. Puffer-Dump: Schnitt 34 (#1) Ausgang = Quelle 36 ms vor dem Stück (Korrelation 0,99; Quelle 0,126 ≥
Ausgang 0,115); Schnitt 38 (#1) Quelle 0,076 ≥ Ausgang 0,020; #14 Stück 23 rechts Ausgang = Quelle 30,8 ms vor dem Stück (Korrelation 1,000; 0,027 ≥ 0,011).
Mit Bezug inkl. Ausklang des Vorgängers (Test-Kopie `vx2/rv1-test.mjs`, INFO „VX2-Bezug“): Knack/Sprung 0/0 bei allen drei Aufnahmen.
Vorschlag für rv1-test: Quelle auch `si − 40 ms ± 20 ms` (Ausklang) in den Bezug nehmen (Kopie zeigt es nur als INFO, die Prüfungen sind unverändert).

## Offen / Weg
1. **Konsonant am Ende des Vorgängers**: G2 beginnt eine Note, wenn die Tonhöhe stabil ist; liegt dazwischen ein kurzer stimmhafter Einschwing-Rahmen, findet der
   Anlauf (nur stimmlose Rahmen direkt vor der Marke) den Konsonanten nicht – er bleibt im Ausklang des Vorgängers und wird beim Rechts-Schieben mitgedehnt.
   Versuch „Marke auf den Beginn des gesungenen Laufs ≤ 60 ms davor“: Node Anfang 43 → 41, Vokal 50 → 50 – nicht besser, nicht eingebaut. Besser wäre ein Anlauf,
   der auch über 1–2 stimmhafte Einschwing-Rahmen bis zum Konsonanten zurückgeht (VX1-Logik `lead`, eigenes Paket, mit vx1-test prüfen).
2. **#10 Raster 20/28** (4 Linie besetzt, 3 gesperrt): 9-s-Aufnahme mit schnellen Noten (Achtel bei 112 BPM = 268 ms, Noten kürzer) – zwei Noten wollen dieselbe
   1/8-Linie. Kein Segmentierungs-Fehler; Weg: bei Kollision 1/16 oder Triolen-Raster vorschlagen (Quantisier-Logik, nicht VX2).
3. #1 Einsätze „Anfang“ 45/59 (76 %): die meisten Abweichungen sind Konsonant-Anläufe 110–150 ms vor der annotierten (Tonhöhen-)Note – gewollt (Anschwung vor dem
   Taktstrich); Vokal-Beginn 49/59 = 83 %. Rest: 3 Noten, die G2 zusammenfasst (gleiche Tonhöhe, wieder angesungen, Pegel-Tal < 6 dB).
4. Spracherkennung offline weiter nicht da (Silben bleiben leer) – unverändert.

## Dateien
- `dbg/vx2-core.js` Kern (Quelle für den Block, `python3 dbg/sync.py` überträgt ihn), `dbg/feat-node.cjs` (Merkmale aus index.html in Node), `dbg/eval.cjs`
  (Bewertung, Kern-Gleichheit mit „check“), `dbg/eval0.cjs`, `dbg/feat-raw.cjs` (Merkmal-Tabelle), `dbg/feat-*.json` (Merkmale je Aufnahme), `dbg/q-*.json` (Stücke nach Quantisieren).
- `rv1-test.mjs` = Kopie von vx/real/rv1-test.mjs + INFO „VX2-Bezug“ + Dump der Quantisier-Puffer (RV1_DUMP). Läufe: run0-basis.txt (Basis), run1.txt (#1), run2.txt (alle).
- Regression: reg/vx1.txt (61/61), reg/imp1.txt (ALLE OK 48).
