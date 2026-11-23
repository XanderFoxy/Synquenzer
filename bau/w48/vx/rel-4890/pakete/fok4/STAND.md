# FOK4 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 496e9d9d146f8bd7d48c2e61f0e04caf (Eingang 4.88.0 695af0504463a6385e21dc94e55b00c9).
Bau: `python3 apply.py <eingang> <ausgang.html>` – Block `block.js` (FOK4-BEGIN/-END) direkt vor `function fokus1Post`; 3 Haken `/*FOK4*/`:
fokus1Pre (Hochladen → fok4Up), fokus1Pre (Tönung aus, solange ein Stück im Hintergrund lädt – wie bisher bei „more“), fokus1Load/onChunk (fok4Next).
Diff: 84 Zeilen neu, 3 geändert (Block 81 Zeilen + 3 Haken-Zeilen). Pflicht: `pflicht.out`.

**Kern-Test: `test/fok4-test.cjs`** – `node test/fok4-test.cjs <neu.html> [basis.html] [RUNS]` (A = neu, B = basis, abwechselnd, frischer Kontext;
gegen eine andere Fassung: einfach deren index.html als 1. bzw. 2. Argument). Ausgabe `test/fok4-test.out`, Einzelwerte `test/fok4-test.json`.
60-s-Lied (Kick/Snare/Bass/Melodie), Spektral offen, 428×926 Touch dpr 2. Fälle: Z Zerlegen (Hauptfaden-Teil), F Nur Rest bis genau fertig,
A Alles, G Nur Gefundenes, S schnelles Hin und Her mit Verschieben. Je Fall: Long Tasks (PerformanceObserver), GL-Hochladen im Bild-Takt (gezählt),
Bilder, Endbild readPixels-FNV (Tönung-Stückzeichnen LT2S beim Abgreifen aus → Vollbild, sonst zeitabhängig). „BILD OK“ = alle Hashes A = B.
Zusatz `test/fok4-bild.cjs` (gleich, plus CDP-Spur: Hauptfaden-Bilder > 16 ms je Fall F/G), `test/gpu-probe.cjs` (Grafik-Kosten je Teil).

Verfahren: Stück kommt vom Kern → ist es sichtbar, lädt eine eigene Aufgabe (setTimeout, nicht im Bild) es hoch: gleiche Größe wie das alte Stück →
nur die Spalten, die sich unterscheiden, per texSubImage2D (UNPACK_ROW_LENGTH/SKIP_PIXELS) in die vorhandene Textur + Mipmaps; sonst neue Textur.
Dann fenceSync + flush, Abfrage alle 2–5 ms (höchstens ≈ 60 ms, dann weiter wie bisher). Erst dann gehört die Textur dem Stück; das nächste Bild
zeigt es. Eins nach dem anderen; Bild nur, wenn kein Fokus-Bild ohnehin ansteht. Inhalt je Textur in einer WeakMap (damit nach Ablösung
mitten im Hochladen gegen den echten Inhalt verglichen wird). Ungültig gewordene Aufträge (Fokus-Wechsel, Dokument, Grafik-Verlust) → neue Textur
gelöscht, alte bleibt beim alten Stück. Fehler → FOK4.on = false, alter Weg. Zähler: FOK4.nNew/nSub/nSame/nCol/nWait/nDrop/err.

Messung (Last 2–5, andere Agenten parallel): s. CHANGES.md. Grafik-Kosten (gpu-probe, ruhig): Vollbild 9,6 ms, Stück neu + Mipmaps 8,3, ohne Mipmaps 0,8,
texSubImage2D + Mipmaps 6,7, nur Mipmaps 6,3, Zurücklesen 4,2.

Grenzen (ehrlich):
- Long Tasks > 50 ms verschwinden in dieser Testumgebung NICHT verlässlich: Die verbliebenen sind das Bild-Zeichnen selbst (Vollbild + Zurücklesen
  der Leinwand in der Software-Grafik) unter Rechenlast des Kerns – Hochladen war nur ein Teil (≈ 8 von 20–50 ms). Gemessen ist: kein Hochladen mehr
  im Bild, Bildzeit ≈ −40 %, gleiche Bildzahl.
- Mipmaps rechnet weiter die Grafik (generateMipmap): eigene Mipmaps im Kern wären schneller, aber nicht sicher bitgleich auf jedem Gerät – nicht gebaut.
- Zerlegen in „Alles“: 1 Long Task bleibt (Tönung hochladen + erstes Vollbild mit Tönung, Bereich LT2/LT2S) – unverändert.
- Nur am Kopflos-Chromium geprüft, nicht am iPhone (dort Abfrage des Zauns ggf. nur je Bild → spätestens nach ≈ 60 ms weiter wie bisher).
