# KOMM (OFFEN-1611 A8) – Auslieferung: Kommentare/Einrückung auch aus den text/plain-Blöcken

Basis: rel-4761/index.html (4.76.1, md5 e4dc1b9599eef2656308cb990e407f37) = basis.html. Die Quelle bleibt unverändert (Werkzeug-Paket).

## Ist-Messung vorher (perf2/ausliefern.mjs, = rel-4761/aus/index.html, sha256 bd2ec74779b20430…)
- Auslieferung 6 962 740 B roh, gzip -6 2 364 074 B (gzip -9 2 358 819).
- 9 text/plain-Blöcke „unberührt“ (bericht.json): sq-worklet-src 421 876 Z., sq-mk-src 306 909, sq-bm-src 169 855, sq-g9-src 105 382,
  sq-md-src 73 978, sq-ndp-src 70 914, sq-form-src 55 092, sq-arp-src 29 017, sq-sr-src 10 488 → zusammen 1,24 M Zeichen mit
  1 753 Kommentaren (164 K Kommentar-Zeichen, davon sq-worklet-src 91 K) plus Einrückung.

## Ursache (Beleg)
perf2/ausliefern.mjs behandelt nur ausführbare Skripte (+ sq-spk-src); alle anderen text/plain bleiben bytegleich, weil der Code
manche davon per Text liest. Geprüft, WIE jeder Block gelesen wird (alle Fundstellen der Namen im Code, ana/ + test/stellen.mjs):
| Block | Zugriff (Zeile Quelle) | Art |
|---|---|---|
| sq-g9-src | g9Load 64995 | <script>-Element, nur ausführen |
| sq-arp-src | arpSrcLoad 30780 | dito |
| sq-form-src / sq-sr-src | blockLoad 113482/113483 | dito |
| sq-ndp-src | ndpLoad 30803 | dito |
| sq-mk-src | mkLoad 30787 | dito |
| sq-bm-src | bmLoad 30501 | dito (BM_WK darin ist eine Vorlage → bleibt wörtlich) |
| sq-md-src | MDX src() 26037 → addModule Blob/data: | Worklet-Modul |
| sq-worklet-src | 7 Stellen: SynthHost/loadWorklet 30976, mkRender 30890, vvAddModule 75033, SPK2 btoa 104330 (alle addModule) **und Text-Suche**: mkwEval 23702 (Anker-Kommentare `/*MKW{*/` … `/*}MKW*/`, Code dazwischen per new Function), lkWkCheck 29990 (Regex `const PVA = '…'`, `const PVM = '…'`), vv3Fmx 78834 (`const LEVEL_LUT` … erster `// V0d (A.4b 3)`) | Worklet + Text |
Kein generischer Zugriff (kein querySelectorAll('script'), document.scripts, outerHTML auf Skripte).

## Änderung (nur vx/komm/ausliefern.mjs, Block /* KOMM-BEGIN … KOMM-END */ + einzeilige Haken „// KOMM“)
- KOMM_BLOECKE: die 9 Blöcke laufen durch dasselbe Token-Verfahren wie die Skripte (acorn-Tokenizer; Zeichenketten/Vorlagen/Regex
  unverändert; Zeilenzahl gleich; AST-Vergleich mit Startzeilen; 0 Kommentare übrig). Worklet-Module mit sourceType 'module'.
- sq-worklet-src geschützt: die drei Anker-Kommentare bleiben wörtlich (kommGap), Zeilen mit `const PVA = '`, `const PVM = '`,
  `const LEVEL_LUT` behalten ihre Abstände; danach rechnet kommZugriffe jeden Text-Zugriff nach (Regex-Treffer gleich, ausgeschnittene
  Stücke MKW und LEVEL_LUT…V0d: gleicher AST), sonst ABBRUCH.
- Wächter (Muster PERF2 F): je Block Zahl der Stellen 'id' / #id in der Ausgabe = erwartet (id-Attribut + bekannte Zugriffe:
  8 × 2, sq-worklet-src 8). Neuer Text-Zugriff → ABBRUCH mit Hinweis.
- `--ohne-komm` = altes Verhalten (Vergleich): erzeugt bytegleich die bisherige Auslieferung (sha256 bd2ec74779b20430…).
- Werkzeug-Ordner: komm/werkzeug falls vorhanden, sonst perf2/werkzeug (acorn 8.14.0, parse5 7.1.2, postcss 8.4.47).
- freigabe.sh (Kopie): ruft ausliefern.mjs aus dem eigenen Ordner; Prüf-Werkzeuge für sq-spk-src aus perf2/e.

## Messung nachher
| | roh B | gzip -6 B | gzip -9 B |
|---|---:|---:|---:|
| Quelle | 9 485 431 | 3 146 513 | – |
| Auslieferung bisher (PERF2) | 6 962 740 | 2 364 074 | 2 358 819 |
| **Auslieferung KOMM** | **6 612 592** | **2 263 221** | **2 259 111** |
| Δ | −350 148 (−5,0 %) | **−100 853 (−4,3 %)** | −99 708 |
Anteil je Block (gzip, Block zurückgesetzt): worklet 52,7 K · mk 19,9 K · g9 9,5 K · bm 5,9 K · form 5,3 K · arp 5,0 K · ndp 4,0 K ·
md 2,4 K · sr 1,5 K. Ohne sq-worklet-src (falls man den Block lieber unberührt lässt): ≈ −48 KB gzip.
Start „bereit“ (test/lader.mjs, abwechselnd, Last 20–24): alt 825 / 2 080 ms, KOMM 859 / 890 ms – unter dieser Last nicht
unterscheidbar; die Blöcke sind text/plain und werden beim Start nicht geparst, der Gewinn ist Übertragung (−100 KB gzip) und
kürzere Auswertung beim ersten Öffnen.

## Tests (Zahlen)
- Zwei Läufe bytegleich (md5 dd5abfd217e662147431b227a011ee1e); `--ohne-komm` = alte Auslieferung bytegleich.
- Gegenprobe 1: zusätzlicher Text-Zugriff `getElementById('sq-mk-src').textContent` → „ABBRUCH: sq-mk-src: 3 Text-Stellen statt 2“.
- Gegenprobe 2: Anker-Schutz aus → „ABBRUCH: sq-worklet-src: Anker /*MKW{*/ … /*}MKW*/ fehlt“.
- golden.mjs (Kopie test/golden.mjs) Quelle gegen KOMM-Auslieferung: **ERGEBNIS bitgleich** – 12 Werksklänge
  (analog/fm6/wt/mk/bm) über das App-Worklet je 2 Kanäle bitgleich, Kontrolle Quelle==Quelle OK, Song/Trommeln Pegel ±1 % OK,
  clCoreVer gleich (2stdc), Konsole 0 Fehler.
- test/lader.mjs (alt/neu/alt/neu): g9, arp (ARPC+BMARP), mk, bm, ndp, form, sr laden = true; lkWkCheck true; vv3Fmx 32 ALGS;
  Klang-Worklet „ready“; md-Worklet (MDX.load) true; BM-Worklet (bmModule) true; Konsole 0 Fehler – alt und neu gleich.
  (Meine Zusatzprobe ST_WK per blob: scheitert unter file:// in BEIDEN Fassungen – Probenfehler; ST_WK steht im Hauptskript, das
  bytegleich zur bisherigen Auslieferung ist.)
- Worker (Spektral zerlegen, Gesang-Analyse, Reinigen, Chor, G4, MIXA …) bauen ihren Text aus fn.toString() im Hauptskript:
  alle 24 ausführbaren Skripte + CSS sind bytegleich zur bisherigen Auslieferung (nur die 9 text/plain ändern sich) → unverändert.
- Pflicht auf der Auslieferung: topdefs „Skripte 26, Namen 7988, doppelt 0, Syntaxfehler 0“; dupkeys „0 doppelte Schlüssel“;
  smoke „title SYNQUENZER errors []“; MS 2000 1×; '^  live: true,' 1×; VERSION '4.76.1'.
- freigabe.sh (Kopie) ganzer Lauf auf rel-4761/index.html: **GRÜN** in 2 min 55 s unter Last (2 Läufe bytegleich, Pflicht Quelle + Auslieferung, Rauchtest); frei/index.html md5 dd5abfd2… = aus/index.html.

## Offen
1. Worklet-/Worker-Texte in Vorlagen-Zeichenketten bleiben wörtlich (ST_WK 3,6 K Kommentar-Zeichen, JAM2_PROC_SRC 1,0 K,
   MIXA_PROC_SRC 0,3 K, BM_WK im bm-Block; CSS-Vorlagen) – ≈ 2 KB gzip, eigenes kleines Paket (Vorlage neu escapen).
2. sq-worklet-src weicht von der alten Notiz „Worklet-Texte bleiben unberührt“ ab – abgesichert durch Schutz + Nachrechnen +
   golden bitgleich. Wer es nicht will: Eintrag aus KOMM_BLOECKE nehmen (Block bleibt dann bytegleich, Gewinn ≈ 48 KB statt 101 KB).
3. Nur Chromium geprüft; Safari/iPhone nach der ersten Auslieferung einmal Kaltstart + Klang ansehen.
4. Neue Text-Zugriffe auf diese Blöcke (auch Fehlermeldungs-Strings in Anführungszeichen genau gleich dem Namen) lassen den Wächter
   anschlagen – gewollt; dann Zugriff prüfen und `stellen` anpassen.
5. Fehler-Stapel aus diesen Blöcken: Zeilen bleiben gleich (Zeilenzahl erhalten), Spalten verschieben sich (Einrückung weg).

## Anleitung: so nutzt freigabe.sh das Werkzeug
- Sofort: `vx/komm/freigabe.sh rel-XXXX/index.html rel-XXXX/aus` (Kopie von perf2/freigabe.sh; nimmt `vx/komm/ausliefern.mjs` aus
  dem eigenen Ordner, Werkzeug-Module aus perf2/werkzeug, Spektral-Prüfwerkzeuge aus perf2/e). Muss mit „GRÜN“ enden.
- Oder dauerhaft übernehmen: `cp vx/komm/ausliefern.mjs vx/perf2/ausliefern.mjs` – perf2/freigabe.sh ruft `$H/ausliefern.mjs` auf und
  braucht sonst nichts Neues (perf2/werkzeug liegt daneben). Vorher Sicherung `perf2/ausliefern.mjs.perf2` anlegen.
- Zurück zum alten Verhalten ohne Dateitausch: `node ausliefern.mjs --ohne-komm <quelle> <ziel> [bericht]`.
- Nach dem ersten Release mit KOMM einmal `node vx/komm/test/golden.mjs <quelle> <auslieferung>` (→ „ERGEBNIS bitgleich“) und
  `node vx/komm/test/lader.mjs <auslieferung>` (alle Werte true/ready, Konsole []) in die Release-Prüfung aufnehmen.
