# Prüfung Synquenzer 4.87.0 (rel-4870)

Geprüfte Datei: `rel-4870/index.html`, md5 `280c5b0b6a9ed1f8ac77868fb8d5d38f` (nicht verändert). Basis 4.86.0: `rel-4860/index.html` (md5 `a7515b98…`).
Pakete TON2 → ZRL3 → DRUM1 → KE2 → IMP4 → TRP2 → BM1 → VOX3 → IMPS (gebaut mit `rel-4870/bau.py`).
Prüfordner `rel-4870/pruef/` (Haupt-Server `pruef/srv/` = Kopie index.html + `version.json` `{"version":"4.87.0"}`, Port 8960).
Angepasst wurden nur Pfad, Port und Server-Ordner:
- `zrl3/test/test-zrl3.mjs`: Server-Ordner je Seite (`A/` = 4.87 mit version.json 4.87.0, `B/` = 4.86 mit 4.86.0). Grund: im ersten Lauf mit einer
  gemeinsamen version.json 4.87.0 lud sich die 4.86-Seite (B) selbst neu („Execution context was destroyed“) – Testaufbau, kein Fehler von 4.87.
- `bm1`: kleiner Node-Server (`bm1/srvjs.cjs`, Port 8964), version.json je Seite (base.html → 4.86.0, index.html → 4.87.0), aus demselben Grund.
- `drum1/kern.mjs`: version.json 4.87.0. `alt/arp2/test.mjs`: Port 8965. `alt/mlg3/quer.js`: Port 8960. `alt/lt2`, `alt/zrl2`: version.json A = 4.87.0, B = 4.86.0.

**Ergebnis: alles grün, nichts rot.** Bekannt und harmlos: 404 auf `medien/abspann-logo.*` (sonst keine HTTP-Fehler in den Server-Logs).

## 1. Kern-Tests der Pakete gegen rel-4870: 9/9 grün

| Paket | Test | Ergebnis gegen rel-4870 | Vergleich mit Paket |
|---|---|---|---|
| TON2 | `ton2/lauf.sh … 180` (sonde.js, Browser) | erster Ton nach 0,089 s, gemerkte Analyse hit 1/miss 0/bad 0, 0 Fehler | Paket im selben Lauf 0,051 s, Basis 4.86 0,33 s → Richtung schneller wie Paket. Leise (Begrenzer): 0,27 s, Paket 0,238 s, hit 1 |
| ZRL3 | `zrl3/test/test-zrl3.mjs` (SEK=20, RUNDEN=1) | alle 5 Schritte bitgleich zu 4.86 (Hashes gleich), 0 Fehler | ganz rechnen 1 Note 1851 → 804 ms, 2 Noten 1991 → 534, Verschiebung 1821 → 770; erstes Anlegen 1575 → 1849 (füllt, wie Paket +) |
| DRUM1 | `drum1/kern.mjs` | SUMME kick 515/528 +0 · snare 342/344 +10 · hihat 1546/1768 +1 · Konsole 0 | **identisch** mit `kern-nachher.out` (alle ERG-Zeilen ohne ms) |
| KE2 | `ke2/w/kt.mjs … 20261118 48 0/4 full` | 12 Töne | **identisch** mit dem Lauf gegen `ke2/out.html` und mit `w/vorC-0.json` (neue Eichung) |
| IMP4 | `imp4/imp4-test.cjs` (Browser) + `imp4-kern-test.mjs` (Node) | 9/9 OK (Clap −0,43 dB, Basis −4,08 dB) und 7/7 OK | Paket 9/9 (−0,31 dB) und 7/7; Kern-Ausgabe gleich |
| TRP2 | `trp2/trp2-test.js 8963 srv-b` | 0/12 falsch, 0/2, 0/339, 0 Fehler | JSON **identisch** mit `nachher.json` |
| BM1 | `bm1/bm1-test.mjs` | OK BM1 12/12 | wie Paket 12/12 |
| VOX3 | `vox3/w/pt.mjs`, `w/rt.mjs` | Plopps 113/120, fehl 0, sauber 0; Raumton 1,28/1,26 dB, max 2,44, 13/20 | Ausgaben **identisch** mit `vox3/out.html` |
| IMPS | `imps/imps-test.cjs` (48 kHz) | ALLE OK 7/7 (k 1/1/1, Takt-Lage 0,50417 ×3, Stücke 0/0/0 ms) | wie Paket 7/7 |

## 2. Prüfungen 4.84–4.86 gegen rel-4870: 17/17 grün

| Test | Ergebnis |
|---|---|
| TON1 `alt/ton1/kern.js` | Ausgabe **identisch** mit 4.86-Lauf |
| TON1 `alt/ton1/gleich.js` (gegen 4.85) | 192 000 Proben, 0 abweichend |
| TON1 `alt/ton1/sonde.js korn` | ruhig: Pegel erste 300 ms 0,0271 (4.86 im selben Lauf 0,0275), 0 Fehler. Unter Volllast (Last 4,7) 0,0157 – laufabhängig |
| LT2 `alt/lt2/lt2-d-test.mjs` (REPS=1) | beide Ansichten: Endbild + Bildschirm gleich, Hashes = Paket (gef 6bd40b71), 0 Fehler |
| ZRL2 `alt/zrl2/test-zr.mjs` (RUNDEN=1) | Hash 3be4629c = 3be4629c, bitgleich, 0 Fehler |
| ARP2 `alt/arp2/test.mjs neu abcdef` | a, b, c, e **identisch** mit 4.86-Lauf; d/f nur zeitabhängige Zählwerte anders (wie bei 4.86); 0 Fehler |
| GES2 `alt/ges2/kern-test.cjs` | 18/18, 53 Noten, 3,0 ct – **identisch** |
| VOX2 `alt/vox2/w/kt.mjs` | 79/80, 0 Fehlalarme, same true – **identisch** (auch mit vox3/out.html) |
| VOX2 `kt.mjs` mit `CO={"ps":0}` | **identisch** mit 4.86-Lauf |
| ENT1B `probe.js` | 18/18 |
| ENT1C `sonde.js` | 12/12, FAILS 0 |
| ENT1D `sonde.js` / `sonde2.js` | 6/6 / 26/26 |
| VL3 `test.js` | rc 0; JSON gleich mit 4.86-Lauf bis auf die zufälligen Clip-IDs |
| MLG3 `kern.js` / `quer.js` | **identisch** / identisch (420→420, Undo 1→1) |
| KMP1 `kern.js` | **identisch** mit 4.86-Lauf |

## 3. Rauchtest hochkant 428×926 Touch `pruef/rauch.js`: 6/6

bereit nach 1005 ms (unter Last) · ▶ läuft, ■ steht · ≡ zeigt „SYNQUENZER 4.87.0“ (`VERSION` 4.87.0, Bild `pruef/rauch-menu.png`) ·
Klang-Editor (Synth, Spur 0) offen (`pruef/rauch-klang.png`) · 0 Seitenfehler · 0 console.error (auch 0 HTTP-Fehler).

## 4. Doppelte Top-Level-Definitionen `pruef/doppelt.js` (gegen rel-4860): 1/1

38/38 Skripte geparst, 0 Parse-Fehler, neue Doppelungen 0, keine neuen Skript-Blöcke (`pruef/doppelt.out`).

## Rot

Nichts.
