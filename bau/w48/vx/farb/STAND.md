# FARB – Stand: fertig

Bau: `apply.py <eingang> <ausgang>` (md5 4.88.0 = 695af0504463a6385e21dc94e55b00c9) fügt `block.css` (Marker FARB-BEGIN/-END) direkt
nach der Alias-Zeile `:root{--t9:var(--t1);…;--t24a:var(--t8a)}` im Haupt-Stil ein. Der spätere `:root`-Block gewinnt; nur
`--t9…--t16` und `--t9a…--t16a` werden neu gesetzt, `--t17…--t24` bleiben (= 1–8, MAX_T ist 16). Anker: Ende der Alias-Zeile
(`--t24:var(--t8);--t24a:var(--t8a)}` + Zeilenende), je 1×. Ausgang md5 092b626f3d4f73bd9854912f4d52684a.
Kein JS geändert: alle Stellen (Matrix, Song SV.cols, Video vvCols, Auswahl, Blätter) lesen `--tN` aus dem CSS; grep fand keine
fest eingetragenen Spurfarben-Listen. Ein eigener Spur-Mixer mit Farben wurde nicht gefunden/gemessen (MIX = Mix & Master ohne Spurfarben).

Farben (OKLCH-Auswahl, `farbwahl.py`/`pruef_satz.py`/`such2.py`): 9 #fc782d, 10 #4beefd, 11 #f693cf, 12 #8cecb8, 13 #fec87e,
14 #3aa0ff, 15 #fd9f94, 16 #eedb2e. Reihenfolge so, dass Nachbarn und „Spur n / n+8“ sich klar unterscheiden.
Knappstes Paar: 2 (#8b9cff) – 14 (#3aa0ff) mit 0,076 (alte Palette knappstes Paar 2–8: 0,083). Blau 14 hat Kontrast 7,03:1.

Kern-Test: `farb-test.cjs` (Ergebnis `farb-test.out`, Werte `farb-test.json`), Fotos: `foto.cjs`.
- Server: `cd srv && python3 -m http.server <port>` (srv/alt = 4.88.0, srv/neu = Ausgang, je version.json); Port in port.txt.
- Gegen andere Fassung: Datei nach `srv/<name>/index.html` (+ version.json) legen, dann `node farb-test.cjs <port> <name> alt`.
- Prüft: 16. Spur per Tipp auf „＋ Spur“, 16 verschiedene Farben, Abstand ≥ 0,07, Kontrast, 1–8 bitgleich, 6-Spur-Ausgangsprojekt
  unverändert, Matrix-Kopf/Feld, Song, Video, Tipp auf Spur 14 → Auswahlfarbe, keine Seitenfehler. Stand: ALLE OK.
Pflicht (`pflicht.out`): MS 2000 1×, „  live: true,“ 1×, verbotene Zahlen 0×, doppelt.js neu [].
Fotos: foto-vorher.png / foto-nachher.png (hochkant, Matrix Spuren 9–16), dazu -quer.png.
