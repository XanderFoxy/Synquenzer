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
1. `wpDetect`: `r = typeof vxr2Det === 'function' ? await vxr2Det(b) : await wpCall({op: 'det', …})`
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

