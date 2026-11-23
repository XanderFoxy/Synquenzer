# ZRL2 auf 4.85.0 – Stand: fertig (2 von 3 Punkten)
Ausgang `index.html` md5 cbdf7b2e629b5d3306eb03e1c5890a20 (Eingang 9c7f63cf…). Bau: `python3 apply.py <eingang> <ausgang>` (Blöcke `block-q.js`, `block-lo.js`).
Gebaut (bitgleich):
1. Tiefband (`magsLo`, spk3DspMake): Rand-Rahmen des vorigen Streifens werden übernommen (gleiche FFT-Paare, Prüfung Signal-Objekt, Fenster, N/R/K, cen je Rahmen, Versatz gerade). Speicher kopiert vor der Rückgabe (lowSplit4 ändert Y in place), 2 Einträge je Schlüssel, Freigabe im finally von zerlegen.
2. zPrep-Quantisierung ohne log10: Tabelle über float32-Bits (Exponent + 6 Mantissen-Bits), je Zelle höchstens eine Schwelle (per Binärsuche mit der alten Formel gefunden), nahe der Schwelle (±2,5e-4 relativ) und Sonderwerte genau gerechnet.
Nicht gebaut: 3. „nach einer Noten-Änderung nur geänderte Streifen neu rechnen“ (SPKFIX redo6: Noten geändert → ganze Audio-Ebene). Braucht eigenen bitgleich-Test mit Audio-Ebene + Noten; in 30 min nicht sauber machbar.
Tests: `test/test-q.mjs` (34,5 Mio. Werte, 0 falsch), `test/test-zr.mjs` (Chromium, iPhone hochkant, A/B, Hash gleich, Konsole []), `test/test-dbg.mjs` (Teilzeiten im Worker). Ausgaben `test/*.out`.
Pflicht: MS 2000 1×, „  live: true,“ 1×, verbotene Zahlen 0, keine neue Top-Level-Definition (alle neuen Namen innerhalb spk1DspMake/spk3DspMake).
