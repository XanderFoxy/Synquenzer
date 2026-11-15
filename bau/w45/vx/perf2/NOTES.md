# PERF2 Teil D – Auslieferung ohne Kommentare (Werkstatt-Schritt)

Quelle = `basis.html` = `index.html` = rel-4700/index.html (4.70.0), **unverändert** (VERSION bleibt '4.70.0'). Neu ist nur das
Werkzeug `ausliefern.mjs` und seine Ausgabe `aus.html` (= die Datei, die statt der Quelle hochgeladen würde). Aussehen und
Bedienung unverändert; die App-Quelle wird nicht angefasst.

Aufruf: `node ausliefern.mjs <quelle.html> <auslieferung.html> [<bericht.json>]` (≈ 11 s). Werkzeuge fest in `werkzeug/`
(acorn 8.14.0, parse5 7.1.2, postcss 8.4.47; terser 5.36.0 liegt bei, wird nicht benutzt – siehe unten). Zwei Läufe → bytegleich
(sha256 `9c39eb973243f6f0…`, `bericht.json`).

## Wie es arbeitet
- HTML mit parse5 lesen; ersetzt werden nur die Inhalte der 24 ausführbaren `<script>` und des einen `<style>`. Alles andere
  (HTML, Attribute, HTML-Kommentare, die 9 `type="text/plain"`-Blöcke) bleibt Byte für Byte gleich.
- JS: acorn zerlegt in Tokens; **jedes Token wird wörtlich übernommen** (Zeichenketten, Vorlagen, Regex, Zahlen unverändert, also
  auch Anführungszeichen, `\u…`-Schreibweisen). Entfernt werden nur Kommentare und Leerraum zwischen Tokens: ein Zwischenraum mit
  n Zeilenumbrüchen wird zu genau n `\n`, sonst zu "" oder " " (wo zwei Tokens sonst verschmelzen würden: Wort+Wort, `1 .x`, `/re/ in`,
  `a - -b`, kein `//`, `/*`, `<!--`, `-->`, `</`).
  Folge: **Semikolon-Automatik (ASI) unverändert und jede Zeile steht auf derselben Zeilennummer wie in der Quelle** (beide Dateien
  110 667 Zeilen) – Fehlermeldungen vom Telefon (logErr mit Stapel) zeigen weiter die Quell-Zeile; nur die Spalte ist anders.
- CSS: postcss-Tokenizer, nur Kommentare raus (mit Zeilenumbrüchen → ebenso viele `\n`).
- **Schutz-Zeilen** behalten Einrückung und Abstände (nur der Zeilenend-Kommentar fällt weg):
  `^  live: true,` (Pflicht-Marke) und `^const VERSION = '<x.y.z>';` (Werkzeuge und der künftige PERF1A-Vorlauf suchen die Zeile per Text).
- **Schutz-Funktion** `vsCleanMake` bleibt samt Kommentaren wörtlich: `clCoreVer()` hasht `vsCleanMake.toString()` und nutzt das als
  Schlüssel des Reinigungs-Zwischenspeichers im Audio-Store. Ohne Schutz würde der erste Start der Auslieferung alle gereinigten
  Takes neu rechnen und alte Einträge liegen lassen. Golden-Test: `clCoreVer` in Quelle und Auslieferung gleich (`2stdc`).
- Selbstprüfung, sonst Abbruch ohne Ausgabe: je Skript AST der Ausgabe == AST der Quelle (ohne Positionen, mit raw-Texten) **und**
  jede Knoten-Startzeile gleich; 0 Kommentare (außer in der Schutz-Funktion); CSS-Baum ohne Kommentare gleich; Ausgabe neu mit
  parse5 gelesen (gleiche Elemente, text/plain bytegleich); gleiche Zeilenzahl; „MS 2000“ 1×, „^  live: true,“ 1×, VERSION-Zeile 1×.

## Warum nicht terser
terser (compress:false, mangle:false, comments:false) schreibt jede Zeichenkette neu (Quotes, Escapes), legt Zeilen zusammen und
verliert dabei die Pflicht-Zeile „^  live: true,“ sowie `const VERSION = '4.70.0';` (wird `const VERSION="4.70.0"`), und alle
Zeilennummern ändern sich. Das Token-Verfahren nutzt ebenfalls einen echten Parser, ändert aber nur Leerraum/Kommentare, ist per
AST-Vergleich nachgewiesen gleich und hält Pflicht-Marken ohne Sonderprüfung. Die Pflicht-Prüfungen gelten deshalb **unverändert
auch für die Auslieferung** (keine angepasste Prüfung nötig). Größen-Nachteil gegenüber terser: nur die erhaltenen Zeilenumbrüche
(1 Byte je Zeile, in gzip fast frei) – terser wurde aus Zeitgründen nicht gemessen.

## Messung (Quelle → Auslieferung)
| Teil | roh | gzip -6 | brotli 5 | brotli 11 |
|---|---:|---:|---:|---:|
| ganze Datei | 9 178 098 → **6 779 318** (−26,1 %) | 3 054 966 → **2 315 508** (−739 KB, −24,2 %) | 2 632 523 → 2 024 511 (−23,1 %) | 2 230 763 → 1 740 761 (−22,0 %) |
| Haupt-Skript | 6 869 891 → 4 742 347 | 2 313 251 → 1 667 966 (−27,9 %) | 1 970 999 → 1 437 801 | 1 674 999 → 1 237 217 |
| kleine Skripte (23) | 614 357 → 389 257 | 209 329 → 140 137 | 196 256 → 132 721 | 174 950 → 120 620 |
| CSS | 436 156 → 390 020 | 97 852 → 72 430 | 92 157 → 69 405 | 78 779 → 58 725 |
| Worklet-Texte (9, unberührt) | 1 246 223 | 430 619 | 390 606 | 346 978 |

Bei der angenommenen gzip-Auslieferung der Online-Seite: **−0,74 MB je Fassung** (bei 5 Mbit/s ≈ −1,2 s, bei 20 Mbit/s ≈ −0,3 s);
zusammen mit PERF1A (Fassung nur einmal laden) ≈ 2,3 statt 2 × 3,05 MB je Update.

Start, Chromium 428×926 ×3, **CPU 4×**, Median aus 3 (je Lauf abwechselnd Quelle/Auslieferung, Rechner geteilt), `mess/r/`:
| Kennzahl (ms ab Navigation) | Quelle | Auslieferung | Δ |
|---|---:|---:|---:|
| erste Darstellung | 500 | 464 | −36 |
| **HTML fertig gelesen** (domInteractive) | 2 323 | **2 113** | **−210 (−9 %)** |
| DOMContentLoaded | 2 525 | 2 285 | −240 |
| **bereit** | 2 786 | **2 565** | **−221 (−8 %)** |
| Sperrzeit bis bereit | 1 784 | 1 532 | −252 |
| längste Aufgabe bis bereit (Übersetzen + Rumpf) | 1 059 | 1 177 | Rauschen (Einzelwerte 965–1 315 / 1 162–1 253) |
| load | 2 989 | 3 213 | +224 (nach „bereit“, Ursache nicht geklärt; in allen 3 Paaren) |
Alle drei Auslieferungs-Läufe waren bei „HTML gelesen“ und „bereit“ schneller als alle drei Quell-Läufe.
Spur mit CPU-Profil (4×, 2 Läufe je Fassung, Spur macht ~25 % langsamer): HTML lesen (`ParseHTML`) 470/484 → 352/391 ms,
Text dekodieren (`TextResourceDecoder::Decode`) 371/258 → 156/204 ms; **Übersetzen** (`V8.PreParse` + `V8.ParseProgram`)
902/825 → 971/796 ms, größtes `v8.compile` 897/856 → 1 008/781 ms = **unverändert** (wie in PERF1 gemessen: Kommentare kosten beim
Übersetzen fast nichts). Ungedrosselt (`mess/kompil2.cjs`, vm.Script, Median 15/21): alle Skripte 156/145 → 151/135 ms, Haupt-Skript
128 → 120/122 ms (−5 %).
Speicher: Quelltext-Speicher (CDP backingStorage) 7,2 → 4,9 MB; JS-Heap nach GC gleich (7,0 MB). Das Haupt-Skript enthält weiter
4 342 Zeichen außerhalb Latin-1 (vorher 13 597, Rest in Zeichenketten) → die Engine hält es weiter als 2-Byte-Text.

## Regression auf aus.html (reg/reg.log, `regression.log`, alles nacheinander)
| Sonde | Ergebnis auf aus.html | Vergleich Quelle 4.70.0 |
|---|---|---|
| Pflicht (topdefs, dupkeys, Marken) | 26 Skripte, 7 789 Namen, 0 doppelt, 0 Syntax; dupkeys 0; MS 2000 1×, „^  live: true,“ 1×, `const VERSION = '4.70.0';` 1× | gleich (`pflicht.log`) |
| Rauchtest | errors [] (`smoke-aus.png`) | gleich |
| vx1 | 61/61 | 61/61 |
| imp1 | ALLE OK (121 s) | ALLE OK |
| mtx3 | 51/51 | 51/51 |
| spk6-kern / spk6 | ALLES OK / ALLES OK | gleich |
| spk11 (Kopie reg/spk11-test.mjs) | 38 OK / 3 FEHLER | **gleich**: dieselben 3 Fehler `drums-auf-kit` mit denselben Zahlen (kick 89, kickEcht 63, …) in r4700/spk11.log und spk11/spk11-test.out – bekannter Befund, behoben in SPK11B |
| trp1 | 81/81 | 81/81 |
| mtx4 | 117/118 – offen: Zeitgrenze „P2 1×: 64 dichte Clips … kein Long Task > 50 ms“ | r4700: 114/118 mit denselben Zeitmessungen unter Volllast |
| chr2-test-imp2b (Kopie, Anker leerraum-tolerant) | 76/77: Abschnitte 1–2e alle OK; 1 FEHLER „Tuning-Messung lief“ | Ursache: Hilfsskript chr3/src/tune-meas.mjs schneidet Kern-Code per Text-Anker aus der Datei (`Error: fehlt: function vsDspMake() {`) – Prüf-Werkzeug, nicht die App; auf der Quelle r4700/chrk.log ALLE OK (82) |
| **Worklet-Klang (golden.mjs)** | **bitgleich**: 12 Werksklänge (analog/fm6/wt/mk/bm) über das App-Worklet, 2 Kanäle; Kontrolle Quelle == Quelle bitgleich; clCoreVer gleich (`2stdc`); 0 Konsolenfehler | – |

Zum Golden-Render: der Song-Render über `vvRenderAudio` (alle Spuren, auch nur Trommeln wie in mtx3) ist **schon Quelle gegen Quelle
nicht bitgleich wiederholbar** (Länge und Hashes schwanken von Seite zu Seite; Worklet-Nachrichten landen je nach Zeit in anderen
Render-Blöcken). Er wird deshalb nur auf Länge ±2 % und Pegel je Kanal ±1 % verglichen (OK); bitgleich verglichen wird der
deterministische Weg mkRender (Hauptfaden-Parameter → App-Worklet → Puffer). Ein früherer Lauf mit 6 Klängen war ebenfalls bitgleich.

## Risiken / Grenzen
1. **Werkstatt-Sonden, die Code per Text-Anker aus der HTML schneiden** (`function imp1Core() {`, `const IMP1 = {`, `/* IMP2-BEGIN`,
   `/* SPK3-END */`, `'\nconst VXR1 = {'` …; ~40 Test-Skripte in vx/) finden diese Anker in der Auslieferung nicht. Das betrifft nur
   die Prüf-Werkzeuge, nicht die App (AST gleich). Regel daher wie im PERF1-Plan: alle Sonden auf der Quelle; auf der Auslieferung
   Rauchtest, Browser-Sonden und Golden-Render. Für chr2-test-imp2b gibt es dafür die Kopie `reg/chr2-test-imp2b-aus.mjs` (nur die
   zwei Anker leerraum-tolerant; sonst zeichengleich). spk6-kern sucht `function name(` und klappt auf beiden.
2. **Ablauf beim Veröffentlichen:** im Repo bleibt die Quelle; hochgeladen wird die Ausgabe von `ausliefern.mjs`. Wer die Online-Datei
   direkt bearbeitet oder die Quelle aus der Online-Datei zurückholt, verliert Kommentare. Prüfsummen von Quelle und Auslieferung stehen
   im Bericht. Der Werkstatt-Schritt gehört in das Release-Skript (vor dem Hochladen, nach den Sonden).
3. Spalten in Fehler-Stapeln passen nicht mehr zur Quelle (Zeilen schon). Bei Bedarf ließe sich eine Spalten-Karte erzeugen.
4. `fn.toString()` (~25 Worker/Worklet-Quellen aus Haupt-Funktionen) liefert Code ohne Kommentare – gleiche Bedeutung; die eine
   Stelle, die den Text als Schlüssel nutzt (clCoreVer), ist geschützt. Neue Stellen, die Funktions-Text hashen oder per Text
   durchsuchen, müssen in `SCHUTZ_FUNKTIONEN` eingetragen werden (Suchmuster: `.toString()` + Hash/indexOf/match).
5. Künftiger Code, der den Haupt-Skript-Text selbst durchsucht (z. B. nach `/* NAME-BEGIN */`), würde in der Auslieferung nichts
   finden – heute gibt es keinen solchen Zugriff (geprüft: `document.scripts`, `currentScript`, `querySelector('script')`, `outerHTML`).
6. Gemessen in Chromium mit 4× Drossel; Safari/iPhone nicht gemessen. Netz-Ersparnis ist reine Byte-Rechnung (Online-Kompression
   angenommen gzip, nicht gemessen – Proxy 403).
7. Möglicher nächster Schritt (nicht gebaut): die restlichen 4 342 Nicht-Latin-1-Zeichen in Zeichenketten als `\u…` schreiben →
   Haupt-Skript als 1-Byte-Text (≈ −4,7 MB Quelltext-Speicher). Ändert raw-Texte (AST-Wert gleich), braucht eigene Prüfung.
