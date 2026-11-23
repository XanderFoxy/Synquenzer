# Prüfung Synquenzer 4.90.0 (rel-4900) – kurz

Datei `rel-4900/index.html`, md5 `a23eefd7ac3f52251e5bc881f1de4628`, 7 322 502 B (gzip -6 2 527 669 B).
Basis 4.88.0 `rel-4880/index.html` (md5 `695af050…`, 7 300 575 B, gzip 2 519 388 B) → roh +21 927 B, gzip +8 281 B (gegen 4.89: +22 947 / +8 804).
Pakete CHR6 → CMD3 → FOK4 → SPKV2 → GES4 (wie 4.89) → KKS → ARPG → KSM → DSE → FARB → SZN → VXRR → PERF5 (zuletzt), Bau `rel-4900/bau.py`;
zweiter Bau gleicher md5 (`pruef/bau1.md5`, `pruef/bau2.log`).
Stufen: chr6 `61d55dd9` · cmd3 `ae9c7c6d` · fok4 `ad45a857` · spkv2 `719c1b73` · ges4 `3bbe9e8c` · kks `be22baf3` · arpg `d57182dd` · ksm `ccef985e` ·
dse `3acc8abe` · farb `ac6bed69` · szn `9844f801` · vxrr `4c5cba28` · perf5 `46203c92` · Version → `a23eefd7`.
Größe je Paket in der Kette = Größe des Pakets allein auf 4.88 (KKS +3 093, ARPG +1 111, KSM +6 498, DSE +6 884, FARB +455, SZN +805, VXRR +4 101); PERF5 −14 587 B wie in 4.89.
Anpassungen im bau.py: keine – alle Anker passten nacheinander; nur die md5-Listen der apply.py wie gewohnt erweitert (Stufen-Dateien heißen `stufe01…13`).

**Ergebnis: grün.** Zwei rote Zeilen im ersten Lauf, beide erklärt (ARPG A2 = Versionsnummer in der Projektdatei; DSE-Render knapp an der Testgrenze, 2. Lauf grün).

## Pflicht (`pruef/pflicht.out`, `pruef/doppelt.out`, `pruef/rauch.out`)
| Prüfung | Ergebnis |
|---|---|
| „MS 2000“ / `^  live: true,` | 1× / 1× |
| 0.00537728 / 0.19492 / 413.56 / 0.193046 / xander-krypto | je 0× |
| `const VERSION = '4.90.0';` | 1× (4.88.0 / 4.89.0: 0×) |
| Marker CHR6, CMD3, FOK4, SPKV2, GES4, GES4-K, KKS, ARPG, DSE, FARB, VXRR / KSM, SZN | je BEGIN/END 1× / 2× |
| `doppelt.js` gegen 4.88 | 38/38 geparst, 0 Parse-Fehler, neu [], keine neuen Skripte |
| Rauchtest 428×926 Touch `pruef/rauch.js` | bereit 1007 ms, ▶/■, ≡ „SYNQUENZER 4.90.0“, Klang-Editor offen, 0 Seitenfehler, 0 console.error |
| Gegencheck ohne Welle 5 | Stufe nach GES4 = `rel-4890/stufe5-ges4.html` (3bbe9e8c); PERF5 darauf = `rel-4890/stufe6-perf5.html` (375d6e5a) → bis auf VERSION = 4.89 |

## Kern-Tests Welle 5 gegen 4.90 (`pruef/<paket>/`, Basis 4.88): 7/7 grün
| Paket | Ergebnis |
|---|---|
| KKS `kks-test.cjs` | ALLE OK (15), Zeilen gleich wie Paket |
| ARPG `arpg-test.cjs` | 26/27 – A2 rot nur durch `appVersion` 4.88.0 → 4.90.0 in der Projektdatei; gegen die Stufe vor der Versionsnummer (`srv5/neu488`, 46203c92): **27/27** (`pruef/arpg-nach/`) |
| KSM `kern-ksm.cjs` | ALLE OK, Werte gleich wie Paket |
| DSE `kern-dse.cjs` | 1. Lauf 22/23: „Lock hörbar“ mit↔ohne −31,2 dB (Grenze > −30; Paket −29,4); 2. Lauf **23/23** (−29,8 dB). Schwankt von Lauf zu Lauf auch beim Paket allein (dort −28,2 dB, Spitze 0,352–0,380); mit↔mit immer ≈ −140 dB (`pruef/dse-nach/`) |
| FARB `farb-test.cjs` | ALLE OK (16), gleich wie Paket |
| SZN `szn-test.cjs` | ALLE OK (32/32) hoch + quer, gleich wie Paket |
| VXRR `vxrr-test.cjs` | 17/17, gleich wie Paket |

## Kern-Tests Welle 4 gegen 4.90 (einmal, wie in rel-4890): 6/6 grün
| Paket | Ergebnis |
|---|---|
| CHR6 `kern-test.mjs` | Hülle 2,338 dB, Formant 1,600 %, Ton 0 ct, 80 Fälle – identisch mit 4.89 (nur Laufzeit) |
| CMD3 `cmd3-test.cjs` (basis 4.88, neu 4.90) | ALLE OK 17/17 (neuer Lead-Berichtstext „eigenes Echo 1/8 \| 1/16 wie in der DAW“ = gewollt; T16 nur Render-Rauschen) |
| FOK4 `fok4-test.cjs` (A 4.90, B 4.88, 1 Runde) | BILD OK 5/5; Hochladen im Bild F 0/22, G 1/13, S 0/12; Fehler [] |
| SPKV2 `kern-spkv2.mjs` RASTER=1 | alle Zahlen identisch mit 4.89 (Bass als Kick 4/24, Bass 27/30, Grundton 27/30), errs [] |
| GES4 `kern-test.cjs` 4.88 → 4.90; `load-test.cjs` | identisch mit `ges4/nachher.txt` und 4.89; Vibrato 5 → 2 hoch + quer, Fehler 0 |
| PERF5 `kern-test.cjs` (a = Stufe vor PERF5, b = 4.90) | ERGEBNIS bitgleich (12 Werksklänge, CSSOM 440 Regeln, MS/NDP pixelgleich, Konsole []); ke1 nur Zeitfelder. 1. Lauf unter Last (4 Browser) „UNRUHIG“, weil die Kontrolle a/a nicht gleich war – b war dabei = a2; 2. Lauf allein grün |

## Offen
- DSE-Test „Lock hörbar“: Grenze −30 dB liegt mitten in der Lauf-zu-Lauf-Schwankung (−28 … −31 dB) – Test wackelt, nicht die App.
- ARPG-Test A2 vergleicht die Projektdatei samt `appVersion` – in jeder neuen Fassung rot (Test veraltet, nicht die App).
- IMP4-Test T6 erwartet weiter den alten Berichtstext (seit CMD3 gewollt anders, siehe rel-4890). Alt-Sonden aus rel-4880/4870 diesmal nicht gelaufen (kurze Prüfung).
