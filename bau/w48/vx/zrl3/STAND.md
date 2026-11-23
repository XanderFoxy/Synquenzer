# ZRL3 auf 4.86.0 – Stand: fertig (Kern gebaut und gemessen; Grenzen unten)
Ausgang `index.html` md5 f0a4ae8ced20e9fa72efc8dc57e89f76 (Eingang a7515b98…). Bau: `python3 apply.py <eingang> <ausgang>` (Block `block.js`, 1 Haken `/*ZRL3*/`).
**Kern-Test-Datei: `test/test-zrl3.mjs`** (`node test-zrl3.mjs <neu.html> <basis.html>`, SEK=40 RUNDEN=2). Ausgaben: `test/test-zrl3.out` (40 s, 2 Runden),
`test/test-zrl3-final20.out` (Endfassung, 20 s). Der 40-s-Lauf lief auf der Vorfassung mit 48 MB Speichergrenze; einziger Unterschied zur Endfassung ist die
Grenze (32 MB), die nicht auf die Bits wirkt. Die Endfassung ist mit 20 s nachgeprüft.

Ansatz: In spk6 `synth` läuft der Phasen-Vocoder je Abschnitt (regs) über `zrl3Pv` (Block innerhalb von spk6DspMake, läuft damit auch im Worker;
kein neuer Top-Level-Name). Der Schlüssel je Abschnitt ist ein Hash (2×32 bit, FNV + Murmur) über die genauen Eingaben: Signal-Bits [s0−N, e0+N),
rr/fv je Rahmen (so, wie pv sie liest), N/H/sr/fmt, Länge und Rand-Überhang. Ein Abschnitt hängt nur von diesen Eingaben ab (lp/sp/fresh werden am
Anfang jedes Abschnitts neu gesetzt). Gleicher Schlüssel heißt also gleiche Bits. Es werden nur Abschnitte ohne Treffer gerechnet. Speicher: LRU bis 32 MB im Worker.
Das wirkt auf jedes Ganz-Rechnen einer Audio-Ebene: redo6 „ganz“ (Noten in derselben Masken-Op geändert), s6plan full, s6shift.

Test (A = ZRL3, B = 4.86.0, abwechselnd, Hash Int16+o+sc der Ebene nach jedem Schritt): alle 5 Schritte bitgleich, Konsole ohne Fehler.
1 Note geändert, ganz rechnen 2697 → 1116 ms, 2 Noten 2951 → 1028, Zeit-Verschiebung 2766 → 976, erstes Anlegen 3368 → 3565 (+6 %, füllt), Bereichs-Weg 168 → 206.

Grenzen (ehrlich):
- Ein Abschnitt ist ein zusammenhängender Bereich mit Tonhöhen-Änderung. Liegen Noten ohne Pause (unter etwa 0,2 s) aneinander, bilden sie einen
  Abschnitt. Eine Noten-Änderung rechnet dann diesen ganzen Abschnitt neu (weil die Phasen durchlaufen, geht es bitgleich nicht kleiner). Bei durchgehendem Gesang ist der Gewinn daher klein.
- Der erste Ganz-Lauf nach dem Neuladen der Seite füllt den Speicher erst und ist nicht schneller.
- Die Grundlage (baseOf, Block-Rendern) wird weiter ganz gerechnet; das ist die Restzeit von etwa 1 s bei 40 s.
- Der Bereichs-Weg (patchA/spkfixPatch) ist ungeändert, kostet aber +20–40 ms für Hash und Kopie.
- redo6 selbst ist nicht geändert. Der Test nutzt s6plan full:1 (dasselbe make(…, full) → synth) und keine echte Masken-Op mit gleichzeitiger Noten-Änderung.
Pflicht: MS 2000 1×, „  live: true,“ 1×, verbotene Zahlen 0, doppelt.js neu [] / parseFehler [], diff zur Basis: genau 1 Zeile ersetzt.
