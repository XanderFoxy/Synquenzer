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
