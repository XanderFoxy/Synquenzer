# LT3 – Stand: fertig (gebaut, gemessen)
Ausgang `index.html` md5 83cb473e0c0a4d214456f7e3480423f4 (Eingang 4.90.0 a23eefd7ac3f52251e5bc881f1de4628, VERSION unverändert).
Bau: `python3 apply.py <eingang> <ausgang.html>` – Block `block.js` (LT3-BEGIN/-END) direkt hinter `// LT2-END`; 3 Haken `/*LT3*/` in lt2sDraw:
Startbedingung LT2S `(P.slow||lt3Slow(P))` (statt nur `P.slow`, Reihenfolge der übrigen Bedingungen gleich, lt3Slow zuletzt), Streifenzahl
`P.cost||lt3Est()`, Messung des Bildabstands nach jedem vollen Bild ohne Farben (`lt3Measure`). Diff `lt3.diff` +11/−3. Pflicht: `pflicht.out`.

## Befund (4.90.0, Last ~1)
`test/base0.out` (A/A): bei niedriger Last bleibt im 60-s-Lied nur **Fall Z** (Zerlegen fertig) mit 1 Long Task 53–83 ms; F/A/G/S 0.
Zeitlinie (`test/lt3-probe.cjs`): Tönung kommt (Hochladen 0,6 ms Skript) → nächstes Bild spk1GlDraw 0,5 ms Skript, aber Bildabstand 48–81 ms =
erstes Vollbild **mit Farben** in der Software-Grafik + Zurücklesen. LT2S (stückweise in eigenes Bild, seit 4.7x) griff hier nicht, weil es nur
nach einem schon gemessenen langsamen Farben-Bild startet (`LT2S.slow`), das es beim ersten Mal noch nicht gibt.
Bilder ohne Farben: Abstand 16–28 ms (`test/lt3-probe2.cjs`), mit Farben 53–81 ms → Faktor ≈ 3,5.

## Änderung
Gibt es noch kein gemessenes Farben-Bild (`LT2S.cost` = 0) und lagen mindestens 2 der letzten 4 Bilder ohne Farben über 19 ms Abstand (Gerät
verpasst schon ohne Farben den 60-Hz-Takt), startet LT2S auch für das erste Farben-Bild; Streifenzahl aus 3,5 × größtem Abstand / 20 ms (2–6).
Sobald ein echtes Farben-Bild gemessen ist, gilt wie bisher nur dessen Messung. Schnelle Geräte (Abstand ≤ 19 ms) unverändert.
Endbild: LT2S zeichnet mit demselben Programm streifenweise (Schere) in ein eigenes Bild und kopiert es per texelFetch → pixelgleich (gemessen).

## Kern-Test: `test/lt3-test.cjs`
`node test/lt3-test.cjs <neu.html> [basis.html] [RUNS]` (A = 1. Datei, B = 2., abwechselnd, frischer Kontext; gegen eine andere Fassung einfach deren
index.html angeben). Kopie des FOK4-Tests (60-s-Lied, Spektral, 428×926 Touch dpr 2, Port 9300–9399, version.json 4.90.0) plus: Bild, das LT2S
zeigt (readPixels im onPres-Haken) = Vollbild-Prüfsumme („PRAES OK“), Zähler LT2S.nSeq/nStep, LT3.n/g. Ausgabe auf stdout, Einzelwerte `test/lt3-test.json`.
Läufe: `test/ab1.out` (1. Bau, nur Bilder mit allen Stücken gemessen → keine Messung vorhanden, keine Wirkung), `test/ab2.out` (2. Bau, 1 von 4 > 20 ms),
**`test/ab3.out` = Endfassung**: Z A 0/0 0/0 0/0 | B 1/74 1/62 1/85; F/A/G/S A alle 0 | B im 3. Lauf (Last 2,8) 2/58, 1/68, 2/56, 3/55; BILD OK, PRAES OK.
`test/smoke.cjs <index.html>`: Laden ohne Seitenfehler/console.error.

## Grenzen (ehrlich)
- Farben erscheinen nach dem Zerlegen in dieser Umgebung ≈ 0,1 s später (Probe: ≈ 150 ms nach Eintreffen der Tönung statt ≈ 60 ms), dafür ohne
  60–85-ms-Hänger – derselbe Tausch, den LT2S bei späteren Farbwechseln schon macht. Zwischendurch bleibt das alte Bild (ohne Farben) stehen.
- Partielles Neuzeichnen beim Fokus-Fertigstellen (nur geänderte Stücke in ein gehaltenes Bild) nicht gebaut: bei niedriger Last dort schon 0 Long Tasks.
- Nur Kopflos-Chromium (Software-Grafik). Auf schnellen Geräten (Bildabstand ≤ 19 ms) greift LT3 nicht → wie 4.90.0.
