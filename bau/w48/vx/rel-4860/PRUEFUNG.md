# Prüfung Synquenzer 4.86.0 (rel-4860)

Geprüfte Datei: `rel-4860/index.html`, md5 `a7515b980ddc423e84f9d5cdf8f132a6` (während der Prüfung nicht verändert).
Basis 4.85: `rel-4850/index.html` (md5 `9c7f63cf…`). Pakete: TON1 → LT2 → ZRL2 → ARP2 → GES2 → VOX2 (gebaut mit `rel-4860/bau.py`).
Prüfordner: `rel-4860/pruef/` (Server-Ordner `pruef/srv/` mit Kopie der index.html und `version.json` = `{"version":"4.86.0"}`, Port 8860).
Sonden sind Kopien; angepasst wurden nur Pfad, Port und Server:
- `arp2/test.mjs`: Port 8762 → 8862, Server-Ordner `pruef/arp2/srv/` (`neu/` = rel-4860, `paket/` = arp2/index.html).
- `lt2/lt2-d-test.mjs`, `zrl2/test-zr.mjs`: eingebauter Server liefert `version.json` jetzt je Seite (A = 4.86.0, B = 4.85.0).
- `mlg3/quer.js`: fester Port 8850 → 8860.

Gleichbleibende Pakettexte: alle 7 Blöcke (TON1, LT2, ZRL2 q+lo, ARP2, GES2, VOX2) stehen wörtlich je 1× in rel-4860; `VERSION = '4.86.0'` 1×, „MS 2000“ 1×, „  live: true,“ 1×.

**Ergebnis: alles grün, nichts rot.**

Bekannt und harmlos: 404 auf `medien/abspann-logo.mp4/.mov` (fehlt nur im Testordner).

## 1. Kern-Tests/Sonden der Pakete gegen rel-4860: 9/9 grün

| Paket | Test | Ergebnis | Vergleich mit Paket-Datei |
|---|---|---|---|
| TON1 | `ton1/kern.js` (Node, späte Quelle) | grün | Ausgabe **identisch** mit dem Lauf gegen ton1/index.html |
| TON1 | `ton1/gleich.js` (bitgleich gegen 4.85) | grün | 192 000 Proben, 0 abweichend (wie das Paket) |
| TON1 | `ton1/sonde.js 8860 korn` (Browser, Reload + sofort ▶) | grün | Pegel erste 300 ms 0,0224 (Paket im selben Lauf 0,0257, alter Paket-Lauf 0,0266, ohne TON1 0,0007); Vergleich 0,0277; 0 Fehler |
| LT2 | `lt2/lt2-d-test.mjs` (A = rel-4860, B = rel-4850, REPS=1) | grün | quer: Endbild + Bildschirm gleich, Flacker-Prüfung gleich. hoch: im 1. Lauf (Last 1,9) wich die **Basis** im Schritt „gef“ ab, rel-4860 hatte dort genau den Hash des Paket-Laufs (6bd40b71). Wiederholung hoch: Endbild + Bildschirm gleich, alle 4 Hashes = Paket-Lauf. 0 Fehler |
| ZRL2 | `zrl2/test-zr.mjs` (A = rel-4860, B = rel-4850, RUNDEN=1) | grün | Hash 3be4629c = 3be4629c, Teil-Hashes gleich, bitgleich true, 0 Fehler (wie Paket). `test-q.mjs` prüft nur `block-q.js`, der wörtlich in rel-4860 steht; nicht neu gelaufen |
| ARP2 | `arp2/test.mjs neu abcdef` | grün | a, b, c, e **identisch** mit paket; d: doppelt 0, hh 6 (wie Paket); f: liveStill 3, clipRun 3, afterStop 0 (wie Paket). Abweichend nur Zählwerte, die vom Zeitpunkt abhängen (d „beg“, f „arpRun“ 2 statt 1); 0 Fehler |
| GES2 | `ges2/kern-test.cjs` | grün | 18/18, 53 Noten (Soll 53), 3,0 ct, Ausgabe **identisch** mit dem Paket |
| VOX2 | `vox2/w/kt.mjs` | grün | Ausgabe **identisch** mit vox2/out.html (79/80, 0 Fehlalarme, same true) |
| VOX2 | `vox2/w/kt.mjs` mit `CO={"ps":0}` | grün | Ausgabe identisch mit rel-4850 (alte Erkennung bitgleich) |

## 2. Kern-Tests 4.84/4.85 gegen rel-4860: 8/8 grün

| Test | Ergebnis |
|---|---|
| ENT1B `pruef/ent1b/probe.js` | 18/18 |
| ENT1C `pruef/ent1c/sonde.js` | 12/12, FAILS 0 |
| ENT1D `pruef/ent1d/sonde.js` | 6/6 |
| ENT1D `pruef/ent1d/sonde2.js` | 26/26 |
| VL3 `pruef/vl3/test.js` | 9/9 Flags; JSON gleich mit 4.85-Lauf bis auf die zufälligen Clip-IDs |
| MLG3 `pruef/mlg3/kern.js` | out.json **identisch** mit 4.85-Lauf |
| MLG3 `pruef/mlg3/quer.js` | identisch mit 4.85-Lauf (420→420, Undo 1→1), 0 pageerror |
| KMP1 `pruef/kmp1/kern.js` | out.json **identisch** mit 4.85-Lauf |

## 3. Rauchtest hochkant 428×926, Touch `pruef/rauch.js`: 6/6

- bereit nach 755 ms
- ▶ → läuft, ■ → steht
- ≡ → Menü offen, „SYNQUENZER 4.86.0“ (`VERSION` = 4.86.0), Bild `pruef/rauch-menu.png`
- Klang-Editor (Synth, Spur 0) offen, Bild `pruef/rauch-klang.png`
- 0 Seitenfehler, 0 console.error (auch 0 HTTP-Fehler)

## 4. Doppelte Top-Level-Definitionen `pruef/doppelt.js` (gegen rel-4850): 1/1

- 38/38 Skripte geparst, 0 Parse-Fehler, neue Doppelungen **0**, keine neuen oder fehlenden Skript-Blöcke.

## Rot

Nichts.
