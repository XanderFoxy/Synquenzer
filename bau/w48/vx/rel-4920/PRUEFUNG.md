# Prüfung Synquenzer 4.92.0 (rel-4920) – kurz

Datei `rel-4920/index.html`, md5 `66f76eda53a65f92644a1ae8f1cdbb60`, 7 344 931 B (gzip -6 2 534 618 B).
Basis 4.91.0 `rel-4910/index.html` (md5 `44fa0f18…`, 7 327 679 B, gzip 2 529 717 B) → roh +17 252 B, gzip +4 901 B.
Pakete VTRIM (`neu/vtrim`, Hilfsdateien nach `pakete/vtrim/`) → PERF5 (aus `rel-4910/pakete/perf5`, zuletzt) → VERSION `'4.91.0'` → `'4.92.0'` (1×), Bau `rel-4920/bau.py`;
zweiter Bau gleicher md5 für Ausgabe und alle Stufen (`pruef/bau1.md5`, `pruef/bau1.log`, `pruef/bau2.log`).
Stufen: vtrim `eced0dc7` (= Paket-Ausgang, 17 Anker passten) · perf5 `eced0dc7` (±0 B – VTRIM bringt keine Worklet-/CSS-Vorlage, Bericht `pruef/perf5-bericht.txt`) · Version → `66f76eda`.
Anpassung: nur die md5-Liste von PERF5 (`ERLAUBT` + `eced0dc7…`, über den Anker 4.88 `695af050…`); VTRIM trägt 4.91 schon.

**Ergebnis: grün.**

## Pflicht (`pruef/pflicht.out`, `pruef/doppelt.out`, `pruef/rauch.out`)
| Prüfung | Ergebnis |
|---|---|
| „MS 2000“ / `^  live: true,` | 1× / 1× |
| 0.00537728 / 0.19492 / 413.56 / 0.193046 / xander-krypto | je 0× |
| `const VERSION = '4.92.0';` | 1× (4.91.0: 0×) |
| Marker CHR6 … LT3, VL3 wie 4.91 (KSM, SZN je 2×, sonst 1×); VTRIM BEGIN/END je 1× (neu) | ok |
| `doppelt.js` gegen 4.91 | 38/38 geparst, 0 Parse-Fehler, neu [], keine neuen Skripte |
| Rauchtest 428×926 Touch `pruef/rauch.js` | bereit 1118 ms, ▶/■, ≡ „SYNQUENZER 4.92.0“, Klang-Editor offen, 0 Seitenfehler, 0 console.error |

## Kern-Tests gegen 4.92 (`pruef/<paket>/`)
| Paket | Ergebnis |
|---|---|
| VTRIM `kern2.cjs` (neu 4.92, basis 4.91, Server `pruef/vtrim/srv`) | **29/29**: Ende −1,5 s per Touch, Mixdown 4,00 → 2,50 s, danach trocken still, bis zur Blende bitgleich; Sprung an der Kante 0,098 (Signal 0,129), Mix 0,009; Loop-Klammer: Nachlauf 0,8 s → 0 mit einem Tipp; ohne Schnitt Quellen-Plan, trockener Render, Clip-WAV bitgleich zu 4.91, Mix-Hash kommt in beiden vor; 0 Seitenfehler hochkant/quer. Fotos `pruef/vtrim/foto-*.png` |
| KKS `kks-test.cjs` (Basis 4.88) | ALLE OK (15) |
| ARPG `arpg-test.cjs` (TPFL-Fassung) | 27/27 ALLES OK |
| DSE `kern-dse.cjs` (TPFL-Fassung) | 23/23; HH mit↔ohne −4,8 dB, mit↔mit −305,4 dB |
| VXRR `vxrr-test.cjs` | 17/17 |

Lauf: `pruef/lauf.sh` (VTRIM allein, dann je 2 parallel), Server `pruef/srv` (4.92, Rauchtest), `pruef/srv5` (basis 4.88, neu 4.92, version.json 4.88.0), `pruef/vtrim/srv` (version.json 4.91.0).

## Offen
- Song-Gesang (direkt im Song aufgenommene Blöcke) hat kein Ende-Fähnchen; dort begrenzt weiter die Blocklänge.
- Gesang→Noten: Noten, die vor dem Ende beginnen, klingen bis zu ihrem Notenende.
- Werkstatt (Wellenform/Warp hörbar und sichtbar mitziehen) ist nicht Teil von 4.92 – bewusst getrennt vom Sequencer.
- Kern-Tests KSM, KSM2, FARB, SZN, LT3, PERF5 und Welle 4 diesmal nicht gelaufen (kurze Prüfung; PERF5 ändert in 4.92 nichts, ±0 B).
