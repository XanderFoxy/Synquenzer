# Prüfung Synquenzer 4.89.0 (rel-4890) – kurz

Datei `rel-4890/index.html`, md5 `337effcfe6226e4049dc58385a2bd93a`, 7 299 555 B (gzip -6 2 518 865 B).
Basis 4.88.0 `rel-4880/index.html` (md5 `695af050…`, 7 300 575 B, gzip -6 2 519 388 B) → roh −1 020 B, gzip −523 B.
Pakete CHR6 → CMD3 → FOK4 → SPKV2 → GES4 → PERF5 (PERF5 zuletzt), Bau `rel-4890/bau.py`; zweiter Bau gleicher md5.
Stufen: chr6 `61d55dd9…` · cmd3 `ae9c7c6d…` · fok4 `ad45a857…` · spkv2 `719c1b73…` · ges4 `3bbe9e8c…` · perf5 `375d6e5a…` · Version → `337effcf…`.
Anpassungen im bau.py: keine (alle Anker passten nacheinander; nur die md5-Listen der apply.py wie gewohnt erweitert).
PERF5 spart in 4.89 genau so viel wie auf 4.88 allein (−14 587 B).

**Ergebnis: grün.** Einzige rote Zeile ist eine gewollte Text-Änderung (IMP4 T6, siehe unten). Keine HTTP-Fehler in den Server-Logs.

## Pflicht
| Prüfung | Ergebnis |
|---|---|
| „MS 2000“ / `^  live: true,` | 1× / 1× |
| 0.00537728 / 0.19492 / 413.56 / 0.193046 / xander-krypto | je 0× |
| `const VERSION = '4.89.0';` | 1× (4.88.0: 0×) |
| Marker CHR6, CMD3 (+6 Haken), FOK4 (+3), SPKV2, GES4, GES4-K (+2) | je BEGIN/END 1× |
| `doppelt.js` gegen 4.88 | 38/38 geparst, 0 Parse-Fehler, neu [], keine neuen Skripte |
| Rauchtest 428×926 Touch `pruef/rauch.js` | bereit 1013 ms, ▶/■, ≡ „SYNQUENZER 4.89.0“, Klang-Editor offen, 0 Seitenfehler, 0 console.error |

## Kern-Tests der Pakete gegen 4.89 (`pruef/<paket>/`): 6/6 grün
| Paket | Ergebnis | Vergleich |
|---|---|---|
| CHR6 `kern-test.mjs` | Hülle 2,338 dB, Formant 1,600 %, Ton 0 ct, 80 Fälle | identisch mit `chr6/nachher.json` (nur Laufzeit) |
| CMD3 `cmd3-test.cjs` (basis 4.88, neu 4.89) | ALLE OK 17/17 | wie Paket |
| FOK4 `fok4-test.cjs` (A 4.89, B 4.88, 1 Runde) | BILD OK 5/5; Hochladen im Bild F 0/22, G 1/13, S 0/12; Fehler [] | wie Paket |
| SPKV2 `kern-spkv2.mjs` RASTER=1 | Bass als Kick 4/24, Bass 27/30, Grundton 27/30; errs [] | alle Zahlen identisch mit Paket-A |
| GES4 `kern-test.cjs` 4.88 → 4.89; `load-test.cjs` | Ausgabe identisch mit `ges4/nachher.txt`; hoch+quer Vibrato 5 → 2, Fehler 0 | identisch |
| PERF5 `kern-test.cjs` (a = Stufe 5, b = 4.89) | ERGEBNIS bitgleich (12 Werksklänge, CSSOM 440 Regeln, MS/NDP-Platte pixelgleich, Konsole []) ; ke1 nur Zeitfelder | wie Paket |
| CHR6 `rauch.js` | Chor-Kern im Worker, `chr6Lm` drin, errs [] | – |

## Sonden aus rel-4880/pruef gegen 4.89 (`pruef/alt488/`)
IMPD ALLE OK (OK-Zeilen gleich bis auf ms) · PERF4 ERGEBNIS bitgleich (a 4.88 / b 4.89) · GES3 Ausgabe identisch ·
SPKV jetzt = SPKV2-Werte (gewollt: Bass als Kick 13 → 4/24) · GES2, VOX3 pt/rt, VOX2, IMP4-Kern, TON1: Ausgaben identisch mit 4.88.

## Browser-Sonden der 4.87-Pakete (einmal, je ≤ 3 min; `pruef/alt487/`, Basis 4.86)
TON2 hit 1 / miss 0, errs [] · ZRL3 (20 s, 1 Runde) 5/5 Schritte bitgleich, errs [] · DRUM1 SUMME identisch mit Paket (kick 515/528,
snare 342/344, hihat 1546/1768, Konsole 0; 1. Lauf brach ab, weil der Zufalls-Port 8884 belegt war – 2. Lauf auf festem Port) ·
KE2 Smoke 4.89.0, Erkennung im Worker, errors [] · IMP4 8/9 – **T6 rot gewollt**: CMD3 ändert den Bericht der Lead-Spur von
„eigenes Delay 1/8 → Projekt-Echo …“ auf „eigenes Echo 1/8 | 1/16 wie in der DAW“ (CMD3 T13) · TRP2 identisch mit `nachher.json` ·
BM1 12/12 · IMPS ALLE OK 7/7.

## Offen
IMP4-Test T6 erwartet noch den alten Berichtstext (Test veraltet, nicht die App). FOK4-Zeiten unter Last nur 1 Runde.
