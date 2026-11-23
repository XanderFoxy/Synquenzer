# Prüfung Synquenzer 4.88.0 (rel-4880)

Geprüfte Datei: `rel-4880/index.html`, md5 `695af0504463a6385e21dc94e55b00c9`, 7 300 575 B (gzip -6 2 519 388 B).
Basis 4.87.0: `rel-4870/index.html` (md5 `280c5b0b…`, 7 419 782 B, gzip -6 2 549 282 B) → roh −119 207 B, gzip −29 894 B.
Pakete IMPD → SPKV → GES3 → PERF4 (PERF4 zuletzt), gebaut mit `rel-4880/bau.py`; zweiter Bau gleicher md5.
Stufen: impd `3bdc4982…` · spkv `e28cc960…` · ges3 `2b720d7b…` · perf4 `030b69e2…` · Versionsnummer → `695af050…`.
Anpassungen im bau.py: keine nötig (alle Anker passten nacheinander; nur die md5-Listen der apply.py wurden wie gewohnt erweitert).
Prüfordner `rel-4880/pruef/` (Haupt-Server `pruef/srv/` = Kopie index.html + version.json 4.88.0, Port 8970).

**Ergebnis: alles grün, nichts rot.** Keine HTTP-Fehler in den Server-Logs.

## Pflicht

| Prüfung | Ergebnis |
|---|---|
| „MS 2000“ | 1× |
| Zeilen `^  live: true,` | 1× |
| 0.00537728 / 0.19492 / 413.56 / 0.193046 / xander-krypto | je 0× |
| `const VERSION = '4.88.0';` | 1× (4.87.0: 0×) |
| Marker IMPD/SPKV/GES3/GES3-MK BEGIN/END | je 1× |
| Doppelte Top-Level-Definitionen `pruef/doppelt.js` (gegen 4.87) | 38/38 geparst, 0 Parse-Fehler, neu [], keine neuen Skript-Blöcke |
| Neuer Code | Nicht-ASCII nur in Kommentaren (ä ö ü – →); keine neue sichtbare Oberfläche, keine Markennamen, kein Emoji |

## Rauchtest hochkant 428×926 Touch `pruef/rauch.js`: 6/6

bereit nach 1275 ms · ▶ läuft, ■ steht · ≡ zeigt „SYNQUENZER 4.88.0“ (`VERSION` 4.88.0) · Klang-Editor (Synth, Spur 0) offen ·
0 Seitenfehler · 0 console.error · 0 HTTP-Fehler. GES3 `load-test.cjs` hoch + quer (926×428): Haken da, Worker-Op 'det' g3 4→2 / 6→2, Fehler 0.

## Kern-Tests der vier Pakete gegen rel-4880: 4/4 grün

| Paket | Test | Ergebnis gegen 4.88 | Vergleich mit Paket |
|---|---|---|---|
| IMPD | `pruef/impd/impd-test.cjs 8972` (basis = 4.87, neu = 4.88) | ALLE OK 10/10; fest 14,61 → 0,84 ms, Lauf 102,26 → 0,82 ms, 440 Hz, bitgleich leer/111,5/Nutzer-Tempo | OK-Zeilen **identisch** (ohne ms) |
| SPKV | `pruef/spkv/kern-spkv.mjs` (RASTER=1, nur A = 4.88; version.json → 4.88.0) | Verf. Bass: Kick im Bass 2/16, Bass als Kick 13/24, Noten 23/30, Grundton 23/30, 7,8/3,95 dB; Verf. Drums 16/16, 0/16, 19/30, 7,32/3,54 dB; errs [] | alle Zählwerte **identisch** mit Paket-A |
| GES3 | `pruef/ges3/kern-test.cjs 4.87 4.88` | A 4,1 → 1,5 ms; B Fehlmarken 44 → 3, Treffer 18/18, alte Takes bitgleich 9/9 | Ausgabe **identisch** mit `ges3/nachher.txt` |
| PERF4 | `pruef/perf4/kern-test.cjs 8971` (a = 4.87, b = 4.88) | ERGEBNIS bitgleich: 12 Werksklänge, Klangschule 35, MS-Platte 407, FM 32 Alg., 0 Fehler; `ke1-test.cjs` voller Zustand a/b/a gleich bis auf Zeitfelder `tm.*` | wie Paket |

## Ältere Sonden aus rel-4870/pruef (Node, Bereich Gesang/Import/Klang) gegen 4.88: 6/6 identisch

GES2 `alt/ges2/kern-test.cjs` 18/18, 53 Noten · VOX3 `w/pt.mjs`, `w/rt.mjs` · VOX2 `w/kt.mjs` 79/80 · IMP4 `imp4-kern-test.mjs` ALLE OK ·
TON1 `kern.js` – Ausgaben jeweils **identisch** mit dem 4.87-Lauf (0 Zeilen anders; Ausgaben in `pruef/alt/`).
Browser-Sonden der 4.87-Pakete (TON2, ZRL3, DRUM1, KE2, IMP4-Browser, TRP2, BM1, IMPS, alte Lanes A–C) nicht erneut gelaufen (kurze Prüfung).

## Rot

Nichts.
