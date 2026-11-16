# UPD – LOG

- 06:30 Start. Gelesen: OFFEN-1611 A6, PERF1 NOTES (Befund 10, PERF1A), VW + PERF1A in rel-4761/index.html, sw.js/version.json/
  manifest im Repo (nur gelesen). Last 18,7.
- 06:34 Paketordner, basis.html = rel-4761/index.html (md5 e4dc1b95…), sw-online.js = Repo-sw.js (Kopie).
- 06:35 upd-test.mjs (nach PERF1 fix/p1a-fix.mjs, neu: gzip, Last-Modified, HEAD, Rand-Szenarien kurz/alt, Phase „nächster Start“).
  Ist-Messung basis kurz/alt/ok/alt-ohne-SW (mess/v-*.json, serie-vorher.log mit Last 17–26): Doppel-Download bestätigt.
- 06:36 UPD-Block (block-upd.js) + Haken, bau.cjs → index.html; topdefs 0 doppelt / 0 Syntaxfehler.
- 06:37 Probe index kurz: 1 Download statt 3 (mess/probe-index-kurz.json).
- 06:38 A/B-Reihe index/basis im Wechsel (serie-nachher.sh, Last je Lauf in mess/serie-nachher.log); Pflicht (pflicht.log).
- 06:40 Auslieferung (perf2/ausliefern.mjs, nur gelesen/ausgeführt) → aus/index.html 6 964 722 B, gzip -6 2 364 521 B
  (basis-Auslieferung 2 364 075 B: +446 B). Reihe kurz auf den Auslieferungen (mess/a-*.json, serie-aus.log).

## Ergebnisse (node zeig.cjs mess/*.json) – Downloads = gesendete Bytes / eine gzip-Seite
| Lauf | Update | nächster Start | gesamt | Neuladen nach |
|---|---|---|---|---|
| v-basis-ok.json (ok, gz 3.01 MB) | 1 (3.01 MB) | 4.76.2→4.76.2, +0 | **1** | 693 ms |
| n-basis-ok.json (ok, gz 3.01 MB) | 1 (3.01 MB) | 4.76.2→4.76.2, +0 | **1** | 564 ms |
| n-index-ok.json (ok, gz 3.01 MB) | 1 (3.01 MB) | 4.76.2→4.76.2, +0 | **1** | 660 ms |
| v-basis-kurz.json (kurz, gz 3.01 MB) | 2 (6.03 MB) | 4.76.1→4.76.2, +1 | **3** | 372 ms |
| n-basis-kurz.json (kurz, gz 3.01 MB) | 2 (6.03 MB) | 4.76.1→4.76.2, +1 | **3** | 113 ms |
| probe-index-kurz.json (kurz, gz 3.01 MB) | 1 (3.01 MB) | 4.76.2→4.76.2, +0 | **1** | 31189 ms |
| n-index-kurz.json (kurz, gz 3.01 MB) | 1 (3.01 MB) | 4.76.2→4.76.2, +0 | **1** | 30431 ms |
| a-basis-kurz.json (kurz, gz 2.27 MB) | 2 (4.54 MB) | 4.76.1→4.76.2, +1 | **3** | 163 ms |
| a-index-kurz.json (kurz, gz 2.27 MB) | 1 (2.27 MB) | 4.76.2→4.76.2, +0 | **1** | 30496 ms |
| v-basis-alt.json (alt, gz 3.01 MB) | 2 (6.03 MB) | 4.76.1→4.76.2, +1 | **3** | 369 ms |
| n-basis-alt.json (alt, gz 3.01 MB) | 2 (6.03 MB) | 4.76.1→4.76.2, +1 | **3** | 360 ms |
| n-index-alt.json (alt, gz 3.01 MB) | 1 (3.01 MB) | 4.76.1→4.76.2, +1 | **2** | 60174 ms |
| v-basis-alt-nosw.json (alt, ohne SW, gz 3.01 MB) | 1.25 (3.76 MB) | 4.76.2→4.76.2, +1 | **2.25** | 148 ms |
| n-index-alt-nosw.json (alt, ohne SW, gz 3.01 MB) | 1 (3.01 MB) | 4.76.1→4.76.2, +1 | **2** | 60247 ms |

Last (loadavg 1 min) je Lauf: serie-vorher.log 16,8–26,4 · serie-nachher.log 10,6–20,5 · serie-aus.log 14,8–19,1. 0 Seitenfehler in allen Läufen.
- 06:43 Ende. Pflicht grün (pflicht.log). Nicht committet, Repo und Originale unberührt.

