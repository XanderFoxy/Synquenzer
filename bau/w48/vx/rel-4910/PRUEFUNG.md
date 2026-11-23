# Prüfung Synquenzer 4.91.0 (rel-4910) – kurz

Datei `rel-4910/index.html`, md5 `44fa0f187f10e18dfc5944fcfe1b5bdb`, 7 327 679 B (gzip -6 2 529 717 B).
Basis 4.90.0 `rel-4900/index.html` (md5 `a23eefd7…`, 7 322 502 B, gzip 2 527 669 B) → roh +5 177 B, gzip +2 048 B.
Pakete KSM2 → LT3 → PERF5 (allgemeiner Verdichter aus `rel-4900/pakete/perf5`, zuletzt) → VERSION `'4.90.0'` → `'4.91.0'` (1×), Bau `rel-4910/bau.py`;
zweiter Bau gleicher md5 für Ausgabe und alle Stufen (`pruef/bau1.md5`, `pruef/bau1.log`, `pruef/bau2.log`).
Stufen: ksm2 `941cc0f7` (= Paket-Ausgang, +4 372 B) · lt3 `abc3cf24` (+1 010 B = Paket allein) · perf5 `8d90f64f` (−205 B) · Version → `44fa0f18`.
Anpassungen im bau.py: nur der Anker für die md5-Liste – PERF5 trägt die Basis 4.90 nicht in ERLAUBT, darum hängt bau.py dort hinter `695af050…` (4.88) an.
Alle Anker von KSM2 und LT3 passten nacheinander (keine Überschneidung). PERF5 verdichtet nur die neue KSM2-Bit-Mask-Vorlage in `sq-bm-src`/BM_WK
(54 690 → 54 485 Zeichen, 3 Such-Texte gleich; Bericht `pruef/perf5-bericht.txt`), alles andere bleibt gleich.

**Ergebnis: grün.** Zwei Auffälligkeiten im ersten (parallelen) Lauf, beide im zweiten Lauf allein weg und nicht in 4.91 begründet (siehe KSM2, LT3).

## Pflicht (`pruef/pflicht.out`, `pruef/doppelt.out`, `pruef/rauch.out`)
| Prüfung | Ergebnis |
|---|---|
| „MS 2000“ / `^  live: true,` | 1× / 1× |
| 0.00537728 / 0.19492 / 413.56 / 0.193046 / xander-krypto | je 0× |
| `const VERSION = '4.91.0';` | 1× (4.90.0: 0×) |
| Marker CHR6 … VXRR wie 4.90 (KSM, SZN je 2×, sonst 1×); LT3 BEGIN/END 1×, `/*LT3*/` 3× | ok |
| Marker KSM2 | BEGIN/END je **1×** (Stufe vor PERF5: 2×) – PERF5 entfernt Kommentare in Worklet-Vorlagen, darunter den KSM2-Marker in BM_WK; Code `ksm2X/ksm2Kx/ksm2E` unverändert vorhanden |
| `doppelt.js` gegen 4.90 | 38/38 geparst, 0 Parse-Fehler, neu [], keine neuen Skripte |
| Rauchtest 428×926 Touch `pruef/rauch.js` | bereit 1039 ms, ▶/■, ≡ „SYNQUENZER 4.91.0“, Klang-Editor offen, 0 Seitenfehler, 0 console.error |

## Kern-Tests der eingebauten Pakete gegen 4.91
| Paket | Ergebnis |
|---|---|
| KSM2 `kern-ksm2.cjs` (neu 4.91, basis 4.90) | 2. Lauf allein (`pruef/ksm2/kern-ksm2-2.out`): **gleich wie Paket** – WT 9 Locks hörbar (−39,7 … +3,3 dB), MS-Platte 6 (−31,3 … +1,0), Bit Mask 7 (−41,9 … +3,5); Basis: 0; ohne Lock Hash neu = basis (WT/MS/BM); Konsole []. 1. Lauf (parallel zu SZN/PERF5): Lock-Werte gleich, aber WT-Hash ohne Lock neu ≠ basis (WT auch innerhalb einer Seite `stabil:false`) und in der **Basis 4.90** BM ksF2e einmal 0 dB → Last-Ausreißer. Gegenprobe `wt-quer.cjs`: WT ohne Lock 4.91 ↔ 4.90 −102 … −113 dB, 4.91 ↔ 4.91 −101 … −111 dB (= Jitter) |
| LT3 `lt3-test.cjs` (A 4.91, B 4.90, 2 Runden) | 2. Lauf allein (`pruef/lt3/lt3-test-2.out`): Zerlegen fertig Long Tasks A 0/0 · 0/0, B 1/54 · 1/53; F/A/G/S überall 0; BILD OK, PRAES OK (stückweise gezeigtes Bild = Vollbild `ddf507e3`), Fehler []. 1. Lauf (Last 1,5–2,3): Z A 0/0 · 0/0, B 1/61 · 1/57; dazu je 1 Lastaufgabe 53–64 ms in S/A (A) bzw. F (B) – gleiches Muster wie 4.90 unter Last im Paket-Lauf |
| PERF5 `kern-test.cjs` (a = Stufe vor PERF5, b = 4.91) | **ERGEBNIS bitgleich**: 12 Werksklänge, CSSOM 440 Regeln (44 593 Zeichen), MS/NDP pixelgleich, Worklets laden, Konsole []; ke1 nur Zeitfelder (wie 4.90) |

## Kern-Tests Welle 5 gegen 4.91 (`pruef/<paket>/`, Basis 4.88, TPFL-Fassungen von ARPG und DSE): 7/7 grün
| Paket | Ergebnis |
|---|---|
| KKS `kks-test.cjs` | ALLE OK (15), Ausgabe gleich wie 4.90-Lauf |
| ARPG `arpg-test.cjs` (TPFL, A2 ohne `appVersion`) | **27/27** ALLES OK |
| KSM `kern-ksm.cjs` | ALLE OK, Ausgabe gleich wie 4.90-Lauf |
| DSE `kern-dse.cjs` (TPFL, HH-Spur allein) | **23/23**; HH mit↔ohne −4,7 dB (Grenze > −15), mit↔mit −304,9 dB; Gesamtmix −29,4 dB (nur Info) |
| FARB `farb-test.cjs` | ALLE OK (16), gleich wie 4.90-Lauf |
| SZN `szn-test.cjs` | ALLE OK (32/32) hoch + quer, gleich wie 4.90-Lauf |
| VXRR `vxrr-test.cjs` | 17/17, gleich wie 4.90-Lauf |

Läufe: `pruef/lauf-a…d.sh` (je 3 parallel, LT3 allein), Server `pruef/srv5` (basis = 4.88, neu = 4.91, version.json 4.88.0) und `pruef/perf5/srv`.

## Offen
- KSM2-Marker im BM-Worklet verschwindet durch PERF5 (Kommentar). Spätere Pakete dürfen ihn nicht als Anker im Ausgang erwarten.
- KSM2-Test: WT-Hash ohne Lock ist nur auf 1e-5 gerundet und kippt gelegentlich (auch 4.90 gegen sich selbst) – unter Last wackelt der Hash-Vergleich, nicht die App; besser dB-Abstand wie `wt-quer.cjs`.
- LT3 wirkt nur auf langsamen Geräten (Bildabstand ohne Farben > 19 ms); die Farben erscheinen dort ≈ 0,1 s später. Nur in kopflosem Chromium gemessen.
- Kern-Tests Welle 4 (CHR6, CMD3, FOK4, SPKV2, GES4) und Alt-Sonden diesmal nicht gelaufen (kurze Prüfung; KSM2/LT3/PERF5 berühren deren Wege nicht, FOK4-Fälle laufen im LT3-Test mit).
