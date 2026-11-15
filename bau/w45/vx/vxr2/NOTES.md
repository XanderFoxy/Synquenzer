# VXR2 – Gesang-Editor robust gegen die Lage des Takes · NOTES

Paket: `basis.html` = `index.vor-vxr2.html` = rel-4740 (4.74.0, md5 b66de3cb…, enthält IMP2 + IMP2B). `index.html` = 4.74.0 + VXR2.
Bau: `bau/block.js` + `bau/apply.mjs` (`node bau/apply.mjs index.vor-vxr2.html index.html bau/block.js`). Läufe: `out/`, `reg/`, Log: `LOG.md`.
Eigener Test: `vxr2-test.mjs` (A/B index gegen basis, ruft die Testkopie `work/rv1s-test.mjs` auf; Original imp2b/work/rv1s-test.mjs unverändert).

## Ausgangslage (gemessen an 4.74.0, nicht aus den alten NOTES übernommen)
- (b) Knacken #10 und (c) Raster „frei daneben“ (#10, #14) sind in 4.74.0 **schon behoben** (IMP2B-FIX: `imp2bGap`, `imp2bYield`):
  #10 t1 0,388 Verhältnis 0,89, auffällig 0, Raster 25/31 frei daneben 0; #14 (120,6/0,686) 32/37 frei daneben 0.
- (a) Stückzahl: auf 4.74.0 bei t1 0,378/0,383/0,388/0,393 zwar je **31** Stücke (die 32 → 31 von 4.66 kippt hier nicht mehr), aber
  die Stücke sind **nicht dieselben**: nur 6/31 Marken gleich, Abweichung bis 0,95 s; Stück-Anfänge 3/31 gleich.
- (d) #14 (120,6/0,686) Stück 35 links: weiter FEHLER (Abweichung 0,108 ab 346 ms = 36 ms vor dem Schnitt). rv1 ORIGINAL basis 1/53.

## Ursache (a) – belegt
Sonde `work/rv1s-test.mjs` mit `RV1_PROBE` (Prüfsummen von Take und Quelle, Erkennung, Noten, Stücke):
- Der Take-Inhalt ist bei 0,383 und 0,388 **bitgleich** (gleiche Prüfsumme ab der ersten Probe ≠ 0); nur der Vorlauf aus digitaler
  Stille ist 240 Proben (5 ms) kürzer (84 473 gegen 84 233 Nullproben, 48 kHz).
- Erkennung (Op 'det'), Analyse (Op 'vxa', 1/10 ms) und Tonhöhe (G2, 10 ms) rechnen in Rahmen ab Probe 0 → der Inhalt liegt eine halbe
  Rahmenbreite anders im Raster: andere G2-Noten (z. B. Note 2,402–2,49 nur bei 0,383, 4,717–4,765 nur bei 0,388), 2 Erkennungs-Marken mehr,
  andere stimmhaft-Entscheidungen → andere Stück-Wahl (VX2).
- Zusätzlich: die gehörte Fassung (G4, `g4Proc`) ist selbst rahmenabhängig – ihr Inhalt ist bei 0,383/0,388 **nicht** bitgleich
  (Prüfsummen verschieden). Erster Versuch (Ausschnitt an der G4-Fassung) blieb darum kippelig (30/31/30/31).

## Umbau VXR2 (ein Block nach IMP2B-END, 3 Haken)
- `vxr2Off(x, sr)`: führende Nullproben über 0,25 s hinaus (0 = nichts zu tun – aufgenommene Takes ohne digitale Stille bleiben wie bisher).
- `vxr2Det(b)`: Erkennung an `x.subarray(off)` (immer genau 0,25 s Stille vor dem ersten Ton), Zeiten probengenau zurück.
- `vxr2Marks(id, b, raw, rn)`: Stück-Wahl (VX2) an der Quelle **vor G4** (`wpBase(id, null, true)` – dieselbe Quelle wie Erkennung und
  G2 schon bisher), ausgeschnitten wie oben: Op 'vxa' + G2-Noten (eigener Schlüssel im G2-Worker) + `vx2Pick` → Zeiten zurück.
  Gleiche Buchführung wie vx2Marks (VX2.res, VX2.last, Quellwechsel-Wiederholung). An = null: Analyse-Felder, **Anker und Anlauf**
  rechnet vx1rAnalyse wie bisher am ganzen Take an der gehörten Fassung (vx2-Prüfung 7 „Anker/Anlauf = Op 'vxa' bitgleich“ bleibt erfüllt).
- Ohne Worker (WP oder G2) oder ohne Vorlauf: `undefined` → VX2 rechnet unverändert.
- Verworfen (v3, LOG): Anker/Anlauf ebenfalls aus der lagefesten Rechnung – Stück-Anfänge dann probengleich, aber vx2-test 12/14
  (Prüfung 7 und 3 verlangen Anker/Anlauf bitgleich zu Op 'vxa' an der gehörten Fassung; Abweichung 3,6 ms / 10 ms) → zurückgenommen.

### Haken-Liste (außerhalb des Blocks, je eine Zeile, typeof-geschützt, Kommentar „VXR2“)
1. `wpDetect`: `r = typeof vxr2Det === 'function' ? await vxr2Det(b, id) : await wpCall({op: 'det', …})` (Nachbesserung: `id` dazu, s. „Prüfung“)
2. `vx2Marks` (VX2-Block), erste Zeile im async-Teil: `if (typeof vxr2Marks === 'function') { const v = await vxr2Marks(id, b, raw, rn); if (v !== undefined) return v; }`
Block: `/* ===== VXR2-BEGIN … VXR2-END ===== */` direkt nach `IMP2B-END`. Neue Namen: VXR2, vxr2Off, vxr2Det, vxr2Marks (+ `window.__vxr2`).
Nichts Sichtbares, keine Knöpfe, VERSION bleibt 4.74.0.

## Messung vorher → nachher (vxr2-test.mjs, out/vxr2/ und out/vxr2a/, Läufe parallel, Last 5–10)
| Punkt | 4.74.0 (basis) | VXR2 (index) |
|---|---|---|
| (a) #10 Stücke bei t1 0,378/0,383/0,388/0,393 | 31/31/31/31 – Marken nur **6/31** gleich (max. 0,95 s), Anfänge 3/31 | **29/29/29/29 – Marken 29/29 probengleich (0 Proben)**; Anfang mit Anlauf 17/29 gleich (max. 36,9 ms, s. Offen 1) |
| (b) #10 Knacken t1 0,388 / 0,383 | Verhältnis 0,89 / 1,0, auffällig 0 | 0,74 / 0,75, auffällig 0 |
| (c) #10 Raster t1 0,388 / 0,383 | 25/31 · 24/31, frei daneben 0 | 23/29 · 22/29, frei daneben 0 |
| (c) #14 Raster (120,6/0,686) | 32/37, frei daneben 0 | 28/32, frei daneben 0 |
| (d) #10 links (Test wählt Stück 16 bzw. 15) | OK (bitgleich 719/190 ms) | OK (703/740 ms) |
| (d) #14 links (120,6/0,686) | **FEHLER** Stück 35 (Abw. 0,108 ab 346 ms) | OK – aber **anderes Stück** (16), s. unten |
| rv1-test ORIGINAL (Standard-Lauf #1/#10/#14) | **1/53 FEHLER** (#14 Stück 35 links) | **ALLE OK 53** |

(d) ehrlich: die Lösung von (d) im Standard-Lauf kommt daher, dass #14 jetzt 32 statt 37 Stücke hat und der Test ein anderes Stück
verschiebt. Der Mechanismus (Vorgänger im Quantisier-Stand in eine Lücke **gedehnt**, nach dem Verschieben ungestaucht + abgeschnitten,
IMP2B `fix/move-sim.mjs`) ist unverändert – s. Messung „gleiche Silbe“ unten und Offen 2.

Gleiche Silbe wie in der Basis (`RV1_T=11.125`, Datei-Zeit von Basis-Stück 35, `out/d14-index.txt`): VXR2 Stück 30 → **FEHLER**,
Abweichung 0,109 ab 350 ms (36 ms vor dem Schnitt), Vorgänger −111 ms quantisiert – zahlengleich mit der Basis. **(d) ist nicht behoben.**

## Zeit (A/B, nacheinander, abwechselnd, je 3×, #10 t1 0,388, Last 3,7–4,3; `out/zeit/zeit.txt`)
| | Lauf 1 | 2 | 3 | Median |
|---|---|---|---|---|
| Gesang-Editor erste Analyse (`__vx1.analyse`), basis | 1 686 ms | 1 713 | 1 753 | **1 713 ms** |
| dto. index (VXR2) | 2 317 ms | 2 571 | 2 750 | **2 571 ms (+858 ms, +50 %)** |
Ursache: eine zusätzliche Tonhöhen-Analyse (G2) des ausgeschnittenen Takes im G2-Worker (die normale G2-Analyse des ganzen Takes läuft
weiter, sie trägt Tonhöhen-Anzeige und G4). Nur bei Takes mit > 0,25 s digitaler Stille vorn (Import), nur beim ersten Öffnen je Take,
im Worker (Hauptfaden: Nullproben zählen + Kopie, < 2 ms). Aufgenommene Takes: unverändert. Abschaltbar: `__vxr2.on(false)`.

## Regression (index.html = VXR2, `reg/`; zwei Ketten parallel, Last 6–10)
- vx1-test 61/61 · vx2-test 14/14 · vx3-test 15/15
- rv1-test ORIGINAL: index **ALLE OK 53** · basis FEHLER 1/53 (#14 Stück 35 links, wie bekannt)
- rv1-test-imp2b (Kopie): index ALLE OK 53
- chr2-test-imp2b: ALLE OK (82)
- voxr1-test: index allein (Last 3,2) 80/83 · unter Last 78/83 · basis unter Last 79/83 – dieselben 3 bekannten Inhalts-FEHLER (Klicks A
  17/20, Überstand B 3,2 dB, Raumton-Farbe; VOXR1F-NOTES „80/83“), unter Last zusätzlich Zeit/Long Task (beide Fassungen). VXR2 berührt VOXR1 nicht.
- vxr2-test.mjs: (a) index OK (`out/vxr2a-test.txt`), (b)(c)(d) #10 OK, #14 (b)(c) OK, (d) OK nur wegen anderem Stück (s. oben) (`out/vxr2-test.txt`;
  dort (a) noch mit dem strengeren Maß „Anfang mit Anlauf“ = FEHLER 17/29 – darum (a) jetzt an den Marken, Anlauf als INFO).

## Pflichtprüfungen (index.html)
topdefs: Skripte 26, Namen 7930 (basis 7926: +VXR2, vxr2Off, vxr2Det, vxr2Marks), doppelt 0, Syntaxfehler 0 · dupkeys 0 doppelte Schlüssel ·
smoke title SYNQUENZER errors [] (`out/smoke.png`) · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION '4.74.0'.
md5 index.html **93c9860ee0bff060eb90452f6fe5e2b1** (basis b66de3cbd5c2d66019c5c0c3d199e06c). Diff: 49 Zeilen neu, 1 ersetzt (wpDetect-Haken).

## Offen
1. **Anlauf (Stück-Anfang) noch rasterabhängig**: Marken sind lagefest, der Anlauf (Konsonant vor dem Vokal) kommt weiter aus Op 'vxa' an
   der gehörten G4-Fassung im 10-ms-Raster → bei ±5 ms Vorlauf 12/29 Anfänge um 5 ms, einzelne bis 37 ms anders. Lagefest machen geht nur,
   wenn vx2-Prüfung 7/3 („Anker/Anlauf = Op 'vxa' bitgleich an der gehörten Fassung“) geändert wird (v3 im LOG: dann probengleich).
   Besser (Profi-Weg, auch für die +0,86 s): **Vorlauf beim Import auf ein festes Raster legen** (Vorlauf so auffüllen, dass der erste Ton
   immer gleich im Analyse-Raster liegt, Clip-Einstieg `in` um dasselbe verschieben → hörbar gleich, alle Analysen inkl. G4 ohne Zusatz-
   rechnung lagefest). Berührt Import/LT1/imp.t1 – eigener Auftrag.
2. **(d) nicht behoben** (gleiche Silbe weiter FEHLER, 36 ms vor dem Schnitt): Vorgänger war im Quantisier-Stand in eine Lücke gedehnt;
   nach dem Verschieben des Nachfolgers nach links spielt er ungestaucht und wird abgeschnitten (IMP2B `fix/move-sim.mjs`). „Bitgleich
   bis zum Schnitt“ verlangt eine Entscheidung (hörbar): Dehnung des Vorgängers beim Verschieben behalten (z. B. Dehnfaktor am Vorgänger
   festhalten, bis er selbst bearbeitet wird) → im Funk vorschlagen, nicht still gebaut. Gegen die ungedehnte Quelle ist er bitgleich (rv1-imp2b OK).
3. **Zeit +0,86 s** bei der ersten Analyse importierter Takes (s. oben) – mit Punkt 1 (Import-Raster) entfiele die Zusatz-Analyse.
4. Stückzahl #10 jetzt 29 statt 31 (#14 32 statt 37, #1 70 statt 68): Stück-Wahl an der Quelle vor G4 und mit 0,25 s Vorlauf; rv1-Prüfungen
   gegen die Noten-Annotation (Einsatz ±40 ms, Tonhöhe) alle OK – aber andere Stücke als 4.74, für Xander sichtbar (andere Teilung im Editor).
5. Mit „Gesang reinigen“ (vr1Proc) oder SÄUBERN ist die Quelle vor G4 selbst eine gerechnete Fassung – ob die lagefest ist, nicht geprüft.
