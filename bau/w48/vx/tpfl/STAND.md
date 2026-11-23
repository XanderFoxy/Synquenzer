# TPFL – Stand (fertig, nur Tests)
Kein App-Code geändert, kein apply.py: Die App bleibt 4.90.0 (md5 a23eefd7ac3f52251e5bc881f1de4628). Pflicht für 4.90 siehe `pflicht.out`: „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×.
Geänderte Testdateien (Original je `*.bak` daneben):
- `../imp4/imp4-test.cjs` (T6 neuer Bericht-Text; Aufruf jetzt `node imp4-test.cjs <port> [basis-ordner] [neu-ordner]`)
- `../arpg/arpg-test.cjs` (A2 ohne `appVersion`)
- `../dse/test/kern-dse.cjs` („Render: Lock hörbar“ über die HH-Spur allein, Grenze −15 dB)

## Kern-Test (alle drei gegen 4.90)
Server-Wurzel `srv/`: `v490/` (4.90.0), `b486/` (4.86.0, Basis IMP4), `a488/` (4.88.0, Basis ARPG/DSE), `olock/` (4.90 ohne Lock-Wirkung, aus `ohne-lock.py`),
je mit version.json. Die Symlinks `basis` → b486 und `neu` → v490 sind für den unveränderten Standard-Aufruf von imp4 gedacht.
```
cd srv && python3 -m http.server <port 9300–9399> --bind 127.0.0.1 &
node ../imp4/imp4-test.cjs <port> b486 v490                       # 9/9
node ../arpg/arpg-test.cjs <port> a488/index.html v490/index.html # 27/27
node ../dse/test/kern-dse.cjs <port> v490 a488                    # 23/23 (3× hintereinander)
node ../dse/test/kern-dse.cjs <port> olock a488                   # Gegenprobe: genau „Render: Lock hörbar“ FEHLER
```
Die Läufe in `vorher/` und `nachher/` liefen aus Kopien der Testdateien. Grund: imp4 und arpg schreiben Fotos neben die Testdatei, und die Fotos der Pakete sollen unverändert bleiben.
Gegen eine andere Fassung: Deren index.html nach `srv/<ordner>/` legen, dazu version.json. Dann `<ordner>` statt `v490` angeben.
Ergebnisse und Messwerte: `BERICHT.md`.
