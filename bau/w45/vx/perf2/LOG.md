# PERF2 – LOG (Teil D: Auslieferung ohne Kommentare)

- 09:13 perf1/MESSUNG.md, PLAN.md, NOTES.md gelesen (PLAN Nr. 4 = PERF1D). Paket angelegt: basis.html = index.html = Kopie
  rel-4700/index.html (4.70.0, sha256 73890cf1…). index.html bleibt unverändert: dieses Paket baut nur ein Werkstatt-Werkzeug.
- 09:13 terser 5.36.0, parse5 7.1.2, postcss 8.4.47, acorn 8.14.0 aus npm nach werkzeug/ (Versionen fest, package-lock.json).
- 09:14 Quelle untersucht: 24 ausführbare `<script>`, 9 `text/plain` (Worklet-/Block-Quellen), 1 `<style>`. „MS 2000“ steht in
  `const MK_LABEL = 'MS 2000';` (Zeichenkette), „  live: true,“ in `const CLOUD = Object.assign({` (Z 53210, mit Kommentar am Ende).
- 09:15 Code gesucht, der eigenen Quelltext liest: vv3Fmx / lkWkCheck lesen nur sq-worklet-src (text/plain, bleibt). Kein Zugriff auf
  `document.scripts` / `currentScript`. ~25 Stellen `fn.toString()` für Worker/Worklets (Code bleibt gültig, nur ohne Kommentare);
  **eine** Stelle hasht Quelltext: `clCoreVer()` = FNV(vsCleanMake.toString()) = Schlüssel des Reinigungs-Zwischenspeichers im
  Audio-Store → vsCleanMake bleibt in der Auslieferung wörtlich (Schutz-Funktion).
- 09:16 Entscheidung: terser-Ausgabe verliert die Zeile „^  live: true,“ und schreibt `const VERSION="4.70.0"` um (Werkzeuge suchen
  `const VERSION = '…'`). Stattdessen Token-Verfahren mit acorn: jedes Token wörtlich, nur Kommentare/Leerraum dazwischen weg,
  Zeilenumbrüche bleiben gezählt erhalten (ASI gleich, alle Zeilennummern gleich), Schutz-Zeilen behalten ihre Abstände.
  Prüfung je Skript: AST gleich + jede Knoten-Startzeile gleich.
- 09:18 ausliefern.mjs geschrieben. 09:20 erster Lauf: OK, 9 178 098 → 6 779 318 Bytes (−26,1 %), 10,7 s; zweiter Lauf bytegleich
  (sha256 9c39eb97…). Zeilenzahl beider Dateien 110 667.
- 09:21 Pflicht auf basis + aus: topdefs 26 Skripte / 7 789 Namen / 0 doppelt / 0 Syntax, dupkeys 0; Rauchtest aus.html errors [].
- 09:22 Größen (perf1/mess/groesse.cjs) und Übersetzen (mess/kompil2.cjs, vm.Script, ungedrosselt) gemessen.
- 09:24 Zeitreihe mess/serie.sh (4×, basis/aus je Lauf abwechselnd: ruhig 3+3, Spur 2+2, Auswertung spur.cjs) im Hintergrund.
- 09:30 golden.mjs (Song-Render + 6 Werksklänge, Quelle 2× + Auslieferung, FNV über Float32) und reg/serie-reg.sh vorbereitet.
  Kern-Sonden lesen Code per Text-Anker aus der HTML (chr2-test: `function chr2Core() {`, `const CHR2 = {`) → Kopie
  reg/chr2-test-imp2b-aus.mjs mit leerraum-toleranten Ankern (sonst zeichengleich). spk11-test als Kopie (schreibt sonst Fotos/JSON
  in den spk11-Ordner).
- 09:23–09:26 Zeitreihe fertig (0 Seitenfehler): bereit 2 786 → 2 565 ms, HTML gelesen 2 323 → 2 113 ms (Median 3, 4×). Spuren ausgewertet,
  Trace-Dateien gelöscht (je 38 MB).
- 09:26–09:36 Regression reg/serie-reg.sh nacheinander: vx1 61/61, mtx3 51/51, spk6-kern + spk6 OK, imp1 OK, spk11 38/3 (gleich wie
  Quelle r4700), trp1 81/81, mtx4 117/118 (Zeitgrenze). golden: Demo hat keinen Song → Fehler im Test; chr2: Import-Pfad der Kopie falsch.
- 09:37 golden mit Song aus allen Szenen: Song-Render schon Quelle gegen Quelle nicht bitgleich → Song-Render nur Pegel/Länge,
  bitgleich über mkRender; 09:41 golden(4): 12 Werksklänge bitgleich, Kontrolle bitgleich, clCoreVer gleich → ERGEBNIS bitgleich.
- 09:39 chr2 (Kopie, Import absolut): 76/77, der eine Fehler = Hilfsskript tune-meas.mjs findet seinen Text-Anker
  `function vsDspMake() {` nicht (Prüf-Werkzeug; auf der Quelle ALLE OK 82).
- 09:42 pflicht.log, regression.log, NOTES.md. index.html = basis.html (unverändert, cmp gleich).

# PERF2 – LOG Teil E (Spektral-Code erst beim Öffnen)
- 10:21 Auftrag. perf1/PLAN Nr. 5 gelesen. Inventar `e/analyse.cjs` (acorn + eslint-scope): 12 SPK-Bereiche, 485 Namen, 61 Seiteneffekte,
  64 Zugriffe von außen; Abhängigkeits-Graph `e/deps.cjs`: SPK7-Wege (normWt/Stimme/Takes) nur SPK7-intern → SPK7 bleibt ganz.
- 10:26 Entscheidung: verschieben ja, mit Bleibe-Stellen (SPK1-Zustand, NormProject, Zip, Open, Einstiege, spk12Guide) und Hüllen + Gettern
  im Block SPKL. Getter erst nach der SYNQUENZER-Umhüllungs-Schleife (liest alle Felder).
- 10:28 `e/bau.cjs` + `e/spkl.js` → index.html. Pflicht: topdefs 26 Skripte, 7 382 Namen, 0 doppelt, 0 Syntax; dupkeys 0; MS 2000 1×,
  live 1×, VERSION '4.70.0'; `e/pruef-spk.cjs` sq-spk-src 410 Namen, 0 doppelt, Syntax OK. Rauchtest errors [] (`e/smoke.png`).
- 10:29 Messung 4× (basis/index abwechselnd, 3 Paare): bereit 2 912 → 2 657 ms, längste Aufgabe 1 286 → 968 ms.
- 10:31 Regression e/reg.sh gestartet; spk1/spk5/spk5f/spk8s/spk10s brachen ab (mess/spur*.f32 fehlten neben der HTML) → Dateien aus
  r4700/mess kopiert, zweite Spur e/reg2.sh.
- 10:33 `e/probe.mjs` ALLES OK (13): Container schreiben/lesen in frischer Seite ohne Spektral-Code ohne Verlust; Block-Ladezeit 33 / 96 ms.
- 10:36 ausliefern.mjs auf index.html: OK, aber +52 KB gzip (text/plain unberührt) → Offen Nr. 1.
- 10:41 Regression bis ki1 fertig (alles wie r4700, spk12 besser); spk5p/spk7/spk12b-d/spk6p/spk4 aus Zeitgründen nicht mehr gelaufen.

# PERF2 – LOG Prüfung (unabhängig, Werkzeuge in pr/)
- 10:59 Auftrag „Prüfe unabhängig PERF2“. basis.html = rel-4700/index.html (md5 gleich).
- 11:00 Pflicht nacheinander für index/aus/aus-e (`pr/pflicht.sh`): alle grün (0 doppelt, 0 Syntax, dupkeys 0, Marken 1×, VERSION '4.70.0', errors []).
- 11:01 `pr/vgl.cjs`: index = basis mit verschobenen Zeilen (6 682 + 103 986 = 110 668, 0 Abweichung) + SPKL + 5 Notizen.
- 11:02 `pr/zugriff.cjs` (eigene acorn/eslint-scope-Analyse): 410 Namen, 77 Zugriffe von außen, 0 beim Start, 0 doppelt; `pr/fn.cjs` ordnet zu.
- 11:03 `pr/laufzeit.mjs`: Fingerabdruck aller 7 664 Namen basis ↔ index, nach spkLoad() gleich (bis auf gewollte SPKL-Teile); Guide/Menü gleich.
- 11:04 `pr/astvgl.cjs` basis ↔ aus.html: 24/24 AST gleich, Startzeilen gleich, text/plain 9/9 bytegleich; vsCleanMake-Text in allen Dateien gleich.
- 11:05 sw.js gelesen (inhaltsunabhängig, version.json); keine Laufzeit-Textsuche im Haupt-Skript; Strikt-Modus in beiden gleich (locker).
- 11:06–11:09 Messung `pr/mess.mjs` 4× (S1: 5 Runden × 4 Dateien, S2: 7 Runden basis/index): E nur ≈ −3 % bis bereit, längste Aufgabe −30 %.
- 11:10 `pr/kreuz.mjs` 4.70 ↔ Kandidat (gleiche Herkunft, Container hin und zurück): ALLES OK 9/9.
- 11:11–… Regression nachgeholt (`pr/reg.sh`): spk12b, spk12c, spk6p, spk4, spk12d. Pixel-Vergleich `pr/bild*.mjs`: 0 Pixel.
- PRUEFUNG.md geschrieben.
- 11:21 Regression fertig: spk12b 72/0, spk12c 47/0, spk12d 28/0, spk6p ALLES OK, spk4 3/23 FEHLER (dieselben wie r4700, dort 5). spk7 lief schon in Teil E (ALLES OK 13).

# PERF2 – LOG Teil F (Prüf-Befunde beheben, endgültiger Auslieferungs-Weg)
- 11:24 Auftrag. LOG/NOTES/PRUEFUNG gelesen; Ablauf bisher (STAND/helfer): Quelle R-XXXX → synquenzer/index.html + version.json → push;
  dieselbe Datei → inapp/synquenzer.html → Artifact (In-App vN). Sicherungen der alten Stände in `f/` (*.vor-f.*).
- 11:26 Befund 2: `e/spkl.js` – `spkLHint` + Hinweis in beiden Zip-Hüllen, nur wenn `spkLoad()` scheitert (Sichern sofort, Öffnen nach 3,8 s,
  weil „Takes übernommen“/„Container geöffnet“ bei 1,8/2,0 s kommen und je 1,6 s stehen). `node e/bau.cjs basis.html index.html`:
  Unterschied zum alten index.html nur diese 5 Zeilen im Block SPKL (diff). basis.html = rel-4700/index.html (cmp gleich).
- 11:27 Befund 6/Offen 1: `ausliefern.mjs` – `TEXT_PLAIN_ALS_SKRIPT = ['sq-spk-src']` (gleiches Token-Verfahren + AST-Prüfung) und
  Wächter: in der Ausgabe nur 2 Erwähnungen (id + blockLoad), sonst Abbruch. basis → Ausgabe bytegleich zu aus.html (9c39eb97…);
  index → aus-f.html 6 780 885 B (b2253baa…), sq-spk-src 612 730 → 432 826 Zeichen, 733 Kommentare. Gegenprobe Wächter
  (Zusatz-Funktion liest textContent): ABBRUCH „3 Erwähnungen statt 2“.
- 11:28 Größen gzip -6: basis 3 042 282, index 3 043 356, aus 2 298 440, aus-e (alt) 2 350 810, **aus-f 2 299 184**.
- 11:29–11:31 Befund 7 + 2 als Probe: `e/probe.mjs` + `zip-fehlerfall-hinweis` (Block künstlich zerstört, gewollte Fehler nicht gezählt)
  + `spk6-ebenen-container` (mL1/mL2/aA1.bin über frische Seiten ohne Block, FNV über Render Mix + L2). index: ALLES OK;
  Gegenprobe auf dem alten index (f/index.vor-f.html): FEHLER zip-fehlerfall-hinweis (kein Hinweis) → Prüfung trennscharf.
- 11:33 Befund 5: `freigabe.sh <quelle> <ordner>` (Pflicht Quelle, ausliefern 2× bytegleich, Pflicht Auslieferung, VERSION gleich,
  Rauchtest, probe.mjs auf der Auslieferung). Lauf auf index.html: GRÜN in 1 min 50 s → `f/frei/`, Kopie `aus-f.html`.
- 11:34 Befunde 1/3/4 in NOTES berichtigt; PRUEFUNG.md um „Stand nach PERF2 F“ ergänzt.
- 11:36 `f/lauf.sh` nacheinander: Rauchtest index, golden index↔aus-f, spk6k/spk6/spk5/spk7/spk12d auf aus-f, Messung 5 Runden.
- 11:40 4.72-Weg vorbereitet: auf R-4710 steht SPK11B nach SPK12-END und umhüllt spk11Go/spk11Render/spk11Hits beim Laden →
  `e/bau.cjs` nimmt SPK11B mit in den Block (+ Getter `__spk11b`), nur wenn vorhanden (4.70-Bau bytegleich). R-4710 gebaut →
  `f/r4710/index.html`: topdefs 0/0, sq-spk-src 418 Namen 0 doppelt; `e/analyse.cjs` R-4710: 0 neue Zugriffe von außen gegenüber 4.70,
  neue Seiteneffekte nur SPK11B (Hüllen um Block-Funktionen + __spk11b). `f/lauf2.sh`: golden erneut, Rauchtest/Probe/spk11b/spk11 auf dem 4.71-Bau.
- 11:36–11:41 `f/reg/reg.log`: Rauchtest index errors []; golden index↔aus-f 1. Lauf „NICHT bitgleich“ nur wegen Song-Pegel ±1 %
  schon Quelle gegen Quelle (Kontrolle 0,1108 vs 0,1100 unter Last), Werksklänge bitgleich, clCoreVer gleich; spk6k ALLES OK,
  spk6 ALLES OK, spk5 ALLES OK (24), spk7 ALLES OK (13), spk12d 28/0 – alles auf der Auslieferung aus-f.
- 11:41 Messung 5 Runden × 4 Dateien (`f/mess-f.json`, `f/paar.cjs`): bereit basis 3 042 → aus-f 2 582 ms, gepaart −556 (5/5),
  längste Aufgabe 1 190 → 883, Heap 17,1 → 14,3 MB; index allein +155 (2/5) = Rauschen. Rechner unter Last.
- 11:42 golden2 index↔aus-f: ERGEBNIS bitgleich. Rauchtest 4.71-Bau errors [].
- 11:43 text/plain-Blöcke gezählt (`f/textplain.cjs`): außer Worklet (per Text durchsucht) zusammen ≈ 73 K Kommentar-Zeichen → Offen.
- 11:42–11:44 4.71-Bau (`f/reg/reg2.log`): Rauchtest errors [], probe ALLES OK (Block 19 / 76 ms), spk11 41/0 (r4710: 41/41).
  spk11b-Kopie startete nicht (Modul ./work fehlte) → Verweis auf vx/spk11b/work, neu in `f/lauf3.sh` (+ freigabe.sh auf dem 4.71-Bau).
  4.71-Auslieferung (`f/r4710/aus`): gzip 3 051 428 → 2 304 647 B, `const VERSION = '4.71.0';` erhalten (PERF1A-Vorlauf liest diese Zeile).
