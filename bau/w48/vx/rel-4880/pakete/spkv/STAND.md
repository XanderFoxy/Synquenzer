# SPKV auf 4.87.0 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 81347f5bb25e53205c248fa1e4b6eaeb (Eingang 280c5b0b6a9ed1f8ac77868fb8d5d38f). Bau: `python3 apply.py <eingang> <ausgang>`
(Block `block.js` mit SPKV-BEGIN/-END direkt vor `async function verfeinern` in spk1DspMake → läuft im Worker, kein neuer Top-Level-Name;
1 Haken `/*SPKV*/` nach `refineEst(...)` in verfeinern). Diff zur Basis: 1 Zeile ersetzt + Block.

**Kern-Test-Datei: `test/kern-spkv.mjs`** (`[RASTER=1] node kern-spkv.mjs <neu.html> [basis.html]`), Ausgabe `test/kern-spkv.out`.
Synthetischer Song (Kick/Snare/Hi-Hat/Bass bekannt), Zerlegen → Verfeinern Bass → Verfeinern Drums; je Ereignis Anteil der bekannten Spur in der Ziel-Ebene.

Ansatz (`spkvFix`, nur Ziel bass/drums, nur Verfeinern):
- Tiefband mit FFT 8192 (Grundton je Rahmen, Obertöne h2–h4 gegen Zwischenstellen; Grundton-Lage: Unteroktave mit Spitze + ungeradem Teilton → Oktave tiefer).
- Ton-Abschnitte = stetiger Grundton mit Obertönen ≥ 3 Rahmen; ein Anschlag (Fluss im Tiefband, FFT 1024) vor einem Abschnitt bekommt dessen Ton.
- Kick = Anschlag, dessen Tiefband-Energie nicht auf dem Bass-Kamm liegt; Schwellen nach Raster-Stelle (Viertel < Achtel < Sechzehntel < daneben).
  Raster nur, wenn ≥ 60 % der starken Anschläge darauf liegen.
- Maske: Bass-Anschlag mit Tonverlauf ohne Kick → Tiefband (< 200 Hz) ganz Bass; Kick-Fenster (0,22 s) → nur Kamm-Anteil Bass, Rest Drums.

Messung (RASTER=1, A = SPKV, B = 4.87.0): s. CHANGES.md. Zerlegen unverändert (A = B bitgleich in allen Zahlen), andere Ziele unverändert (früher Ausstieg).
Pflicht: MS 2000 1×, „  live: true,“ 1×, verbotene Zahlen 0, doppelt.js neu [], Konsole/Seitenfehler [] (428×926, Touch, isMobile).

Grenzen (ehrlich):
- Nicht am echten Demo-Song gemessen, nur am synthetischen Song (Zeitrahmen). Bass-Anschläge als Kick nur 16 → 13/24, nicht 0.
- Verfeinern Drums nach Verfeinern Bass nimmt dem Bass wieder etwas (23 → 19/30 Noten), bleibt aber über vorher (16/30).
- Tempo-Erkennung (imp1) liefert beim Test-Song 74,7 statt 112 BPM; SPKV erkennt das Raster dann als unpassend und arbeitet ohne Raster-Vorrang.
- Ein Sinus-Bass ohne Obertöne wird nicht als Ton-Abschnitt erkannt (dann wie vorher).
