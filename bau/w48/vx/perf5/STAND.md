# PERF5 – Stand (fertig)
Kern-Test-Datei: **kern-test.cjs** – `node kern-test.cjs <port> [<server-ordner>]` (Standard-Ordner: ./srv). Im Server-Ordner
a/index.html = vorher, b/index.html = nachher, je version.json {"version":"4.88.0"}; Server z. B. `cd srv && python3 -m http.server <port>`.
Gegen eine andere Fassung: die andere Datei als b/index.html (oder a/) hineinlegen und neu laufen lassen. Ergebnis tests/kern.out,
Schluss-Zeile „ERGEBNIS bitgleich“. Prüft: 12 Werksklänge bitgleich (FNV je Kanal, Kontrolle a/a), Worklet-Vorlagen laden (MIC_WK,
ST_WK, mixaModSrc() = MIXA+MX1+MX2+MX3+JAM2), CSSOM je CSS-Vorlage der stillen Blöcke (alle Regeln als cssText), Screenshots
MS-Platte (tests/ms-*.png) und NDP-Platte (tests/ndp-*.png) Byte/Pixel-gleich mit Kontrolle a/a, Klangschule, Klang erkennen
(Unterschiede nur Zeitfelder, Zeile „ke1 Unterschiede“ mit Kontrolle), Text-Zugriffe, Konsole/Seitenfehler.
Dazu: rauch.js `<port> b` (tests/rauch-b.out), tests/doppelt.out, tests/cssdiff.cjs `<a.html> <b.html>` (zeigt CSSOM-Abweichungen).

## Bau
`python3 apply.py <eingang> <ausgang>` (≈ 6 s). Hilfsdateien im selben Ordner: block.js (= cat block_head.js block_tail.js; Kopf
aus PERF4 block.js), acorn.js (acorn 8.18.0). ERLAUBT = ['695af0504463a6385e21dc94e55b00c9'] (bau.py erweitert sie).
Ausgang 4.88.0+PERF5: md5 c8a61f894f5934144ad9c23fb9ec9a59. Keine festen Anker im Inhalt -> beim Zusammenbau als LETZTES anwenden
(nach PERF4, falls das noch mitläuft). Kein neuer Code in der Ausgabe (nur Vorlagen-Inhalte kürzer); Marker PERF5-BEGIN/-END in apply.py.

## Verfahren (block.js, PERF5-Teil)
- Alle Skripte (stille Blöcke + ausführbare <script>) mit acorn zerlegt; Vorlagen ` … ` ohne ${, ohne \, ≥ 1000 Zeichen:
  - Worklet (registerProcessor + AudioWorkletProcessor), in allen Skripten: wie PERF4-Block verdichtet (Token wörtlich, Prüfung
    Token-Folge + Umbruch-Merkmal + Syntaxbaum; Rand einer Vorlage bleibt getrennt, weil MIXA/MX1/MX2/MX3/JAM2 verkettet werden).
    Such-Texte: aus Funktionen, die den Vorlagen-Namen nennen (bzw. die Funktion, die die Vorlage zurückgibt).
  - CSS (nur stille Blöcke): Kommentare raus, Leerraum neben { } ; , weg, sonst genau ein Leerzeichen; Zeichenketten/url() wörtlich;
    in Werten mit var(…) und in --Eigenschaften bleibt der Leerraum wörtlich (der Browser hält sie als Original-Text).
    Prüfung: CSS-Token-Folge gleich, Leerraum-Merkmal gleich außer neben { } ; ,, Klammern ausgeglichen; Such-Texte der Funktionen
    im selben Block, die den Namen nennen (bei abweichender Zählung bleibt die Vorlage wörtlich).
- Je geändertes Skript: Token-Folge gleich (nur Vorlagen-Inhalte anders), Syntaxbaum gleich, Such-Texte des Blocks (PERF4) gleich.
  Jede Abweichung -> Abbruch ohne Ausgang. apply.py: MS 2000 1×, '^  live: true,' 1×, verbotene Zahlen 0×, Skript-Grenzen, Kopf gleich.

## Zahlen (4.88.0)
Worklets: MIC_WK 1023->838, ST_WK 19895->12037, MIXA 3691->2656, MX1 1928->1471, MX2 1634->1322, MX3 1016->840, JAM2 8623->5750
(BM_WK schon von PERF4 verdichtet, bleibt gleich). CSS: arp1 3051->2910, form 2146->2105, ndp 13988->13522, mk 16901->15979,
bm 4623->4586, ks 5554->5491. Datei roh -14 587 B, gzip -6 -5 604 B, gzip -9 -5 781 B.
