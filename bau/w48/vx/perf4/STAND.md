# PERF4 – Stand (fertig)
Kern-Test-Datei: **kern-test.cjs** (`node kern-test.cjs <port>`; Server-Ordner mit a/index.html = vorher, b/index.html = nachher,
je version.json {"version":"4.87.0"}; Ergebnis tests/kern.out „ERGEBNIS bitgleich“). Dazu ke1-test.cjs (voller Zustand Klang
erkennen a/b/a, tests/ke1-*.json), rauch.js `<port> b` (tests/rauch-b.out), tests/doppelt.out.

## Bau
`python3 apply.py <eingang> <ausgang>` (≈ 5 s). Hilfsdateien im selben Ordner: block.js, acorn.js (Kopie acorn 8.18.0).
md5-Liste ERLAUBT = ['280c5b0b6a9ed1f8ac77868fb8d5d38f'] (bau.py erweitert sie). Ausgang 4.87.0+PERF4: md5 ca61bb2da9e3a642b3ef15ac44889b4e.
Anker: nur die 14 Block-Öffner `<script type="text/plain" id="sq-…-src">` je genau 1× (neue sq-…-src-Blöcke werden mitbehandelt);
im Blockinhalt keine festen Anker -> läuft nach den anderen Paketen (muss als LETZTES Paket angewandt werden).

## Verfahren (block.js)
- acorn zerlegt jeden Block (Parser treibt den Tokenizer); jedes Token bleibt wörtlich. Zwischenraum mit Zeilenumbruch -> genau
  ein "\n" (Semikolon-Automatik gleich), sonst "" bzw. " " wo Tokens verschmelzen würden (Wort+Wort, Regex+Wort, Zahl+".", ++/--,
  // und /*, <! und </, ->, ?.).
- Worklet-Vorlagen in Blöcken (`const NAME = \`…registerProcessor…\`` ohne `${`, ohne Backslash; heute nur BM_WK im BM-Block)
  werden ebenso verdichtet (88 136 -> 53 657 Zeichen).
- Text-Zugriffe der App: aus jeder Funktion, die einen Block-Namen (bzw. den Vorlagen-Namen) nennt, die Such-Texte und Regex;
  vorher/nachher auf dem Block gezählt bzw. Treffer verglichen; bei Abweichung bleiben die Zeilen wörtlich (so bleiben
  /*MKW{*/ /*}MKW*/ /*MKT{*/ /*}MKT*/, `// V0d (A.4b 3)`, `const PVA = '…'`, `const PVM = '…'` erhalten).
- Prüfung je Block/Vorlage, sonst Abbruch ohne Ausgang: Token-Folge + Umbruch-Merkmal gleich, Syntaxbaum (ohne Positionen) gleich,
  Such-Texte gleich; apply.py: MS 2000 1×, '^  live: true,' 1×, Skript-Grenzen gleich, Kopf gleich.

## Zahlen je Block (Zeichen vorher -> nachher)
ks 192 807 -> 140 677 · bm 149 572 -> 115 011 · ke1 118 587 -> 98 769 · xla 56 656 -> 39 296 · arp1 14 869 -> 12 092 ·
vl2x 10 720 -> 8 330 · worklet 252 828 -> 252 168 · mk 243 455 -> 243 241 · g9/arp/form/sr/ndp/md nur Leerzeilen (zusammen −0,4 K).

## Offen / ehrlich
- Ziel laut Auftrag ≈ −52 KB + −20 KB gzip: erreicht −34,7 KB gzip. Der −52-KB-Teil (alte Notiz perf2 Offen 1) betraf sq-spk-src,
  den es in 4.87 nicht mehr als stillen Block gibt; die älteren Blöcke (g9, mk, worklet, md, …) waren schon verdichtet (KOMM).
- CSS-Vorlagen in den Blöcken (mk-Platte 16,9 K mit 0,8 K Kommentaren, ndp 14 K) und Worklet-Vorlagen im Haupt-Skript
  (ST_WK, JAM2/MIXA) unberührt – eigener kleiner Schritt, falls gewünscht.
- Nur Chromium geprüft.
