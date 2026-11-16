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
unterscheidbar; die Blöcke sind text/plain und werden beim Start nicht geparst, der Gewinn ist nur die Übertragung (−100 KB gzip);
eine kürzere Auswertung beim ersten Öffnen ist NICHT gemessen (Prüfer: 8 Runden, Mittel 3158 / 3222 ms, kein Unterschied).

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
  **Berichtigt (Prüfung, Befund 2):** NICHT alle – drei Worker nehmen ihren Text aus Funktionen IM gekürzten Block sq-g9-src:
  g9-Vorstufe (g9ErkMake.toString(), Quelle Zeile 6388), ASR-Worker (g9AsrWorkerMain, 6632, Modul-Worker) und KI1-Worker
  (g9AsrWorkerMain + ki1WorkerMain, 98554). Ihr Text ist jetzt ohne Kommentare; Syntaxbaum gleich (Prüfer statisch.mjs), Start und
  Ergebnis jetzt in test/lader.mjs geprüft (g9Plan = G9E.plan im Haupt-Faden, ASR/KI1 antworten) und vom Werkzeug bewacht (KOMM-P fnText).
- Pflicht auf der Auslieferung: topdefs „Skripte 26, Namen 7988, doppelt 0, Syntaxfehler 0“; dupkeys „0 doppelte Schlüssel“;
  smoke „title SYNQUENZER errors []“; MS 2000 1×; '^  live: true,' 1×; VERSION '4.76.1'.
- freigabe.sh (Kopie) ganzer Lauf auf rel-4761/index.html: **GRÜN** in 2 min 55 s unter Last (2 Läufe bytegleich, Pflicht Quelle + Auslieferung, Rauchtest); frei/index.html md5 dd5abfd2… = aus/index.html.

## Offen
1. Worklet-/Worker-Texte in Vorlagen-Zeichenketten bleiben wörtlich (ST_WK 3,6 K Kommentar-Zeichen, JAM2_PROC_SRC 1,0 K,
   MIXA_PROC_SRC 0,3 K, BM_WK im bm-Block; CSS-Vorlagen) – ≈ 2 KB gzip, eigenes kleines Paket (Vorlage neu escapen).
2. Abweichung von OFFEN A8 „Worklet-Texte bleiben unberührt“: betrifft BEIDE Worklet-Module, sq-worklet-src (Klang-Worklet, auch
   per Text gelesen) und sq-md-src (Trommel-Worklet „synq-md“, nur addModule) – Prüfung Befund 3. Abgesichert durch Schutz +
   Nachrechnen + KOMM-P + golden bitgleich + lader.mjs. Wer es nicht will: Schalter `--worklets-unberuehrt` (beide Blöcke bleiben
   bytegleich, Zahlen siehe Prüfung). Entscheidung gehört zur Auslieferungs-Freigabe.
3. Nur Chromium geprüft; Safari/iPhone nach der ersten Auslieferung einmal Kaltstart + Klang ansehen.
4. Neue Text-Zugriffe: der Zähl-Wächter (`stellen`) merkt nur NEUE Stellen mit dem Block-Namen (auch Fehlermeldungs-Strings genau
   gleich dem Namen). Eine neue Suche an einer BESTEHENDEN Zugriffs-Stelle merkte er nicht (Prüfung Befund 1) – dafür jetzt KOMM-P
   (statisch, Such-Texte/Regex nachgerechnet) + lader.mjs in freigabe.sh (Laufzeit). Nicht erfasst bleiben: Block-Name dynamisch
   zusammengesetzt (`'sq-' + x + '-src'`), Text über mehrere Funktionen/Objekte weitergereicht (über eine Ebene hinaus), Suche mit
   einem erst zur Laufzeit gebauten Such-Text; Funktions-Text per `'' + fn` / `${fn}` statt toString/String.
5. Fehler-Stapel aus diesen Blöcken: Zeilen bleiben gleich (Zeilenzahl erhalten), Spalten verschieben sich (Einrückung weg).
6. Beobachtet (App, nicht KOMM): mkRender liefert unter Last ab und zu einen stillen Render – in Quelle, alter und neuer Auslieferung
   gleich oft (Prüfer p3: 1/72, 4/72, 2/72). golden.mjs rendert stille Versuche jetzt neu und meldet die Zahl; Ursache (vermutlich
   Worklet-Nachricht vor dem ersten Block im OfflineAudioContext) wäre ein eigenes kleines Paket.

## Anleitung: so nutzt freigabe.sh das Werkzeug
- Sofort: `vx/komm/freigabe.sh rel-XXXX/index.html rel-XXXX/aus` (Kopie von perf2/freigabe.sh; nimmt `vx/komm/ausliefern.mjs` aus
  dem eigenen Ordner, Werkzeug-Module aus perf2/werkzeug, Spektral-Prüfwerkzeuge aus perf2/e). Muss mit „GRÜN“ enden.
- Oder dauerhaft übernehmen: `cp vx/komm/ausliefern.mjs vx/perf2/ausliefern.mjs` – perf2/freigabe.sh ruft `$H/ausliefern.mjs` auf und
  braucht sonst nichts Neues (perf2/werkzeug liegt daneben). Vorher Sicherung `perf2/ausliefern.mjs.perf2` anlegen.
- Zurück zum alten Verhalten ohne Dateitausch: `node ausliefern.mjs --ohne-komm <quelle> <ziel> [bericht]`.
- Nach dem ersten Release mit KOMM einmal `node vx/komm/test/golden.mjs <quelle> <auslieferung>` (→ „ERGEBNIS bitgleich“).
  `test/lader.mjs <auslieferung>` läuft seit der Prüfung IN freigabe.sh mit (Schritt „Probe Blöcke“, muss „ALLES OK“ melden).
- Dauerhaft übernehmen heißt jetzt: ausliefern.mjs UND freigabe.sh UND test/lader.mjs nach perf2 kopieren (freigabe.sh ruft
  `$H/test/lader.mjs`) – oder vx/komm/freigabe.sh direkt benutzen.
- Schalter: `--ohne-komm` (alt, PERF2), `--worklets-unberuehrt` (KOMM ohne die beiden Worklet-Module, OFFEN A8 wörtlich).

## Prüfung (16.11., Nachbesserung nach Prüfer-Befunden)
Sicherung vorher: `sicherung-0830/` (ausliefern.mjs, freigabe.sh, NOTES.md, LOG.md, test/). Die Auslieferung selbst ändert sich NICHT
(md5 dd5abfd217e662147431b227a011ee1e wie vorher) – nachgebessert sind Wächter, Probe und Tests. Außerhalb des KOMM-Blocks nur
einzeilige Haken mit „// KOMM“ (geprüft: Datei ohne Block und Haken-Zeilen = Sicherung). Die Befund-Liste kam ab Nr. 4 abgeschnitten
an; Nr. 1–3 nachgeprüft, Rest aus den Prüfer-Dateien (pruef/golden2-QA.out, golden3-AQ.out, p3.out) selbst nachgeprüft (→ 4).

| # | Befund | nachgeprüft | behoben |
|---|---|---|---|
| 1 (mittel) | Wächter merkt neue Text-Suche an BESTEHENDER Zugriffs-Stelle nicht | **echt**: alte Fassung (Sicherung) auf Prüfer-Variante v1 → „OK“, Auslieferung kaputt (lader: mkwEval=null) | KOMM-P statisch im Werkzeug (Vorschlag b) + lader.mjs als Pflicht-Schritt in freigabe.sh (Vorschlag a) |
| 2 (klein) | Aussage „alle Worker aus dem Hauptskript“ falsch; g9-Worker ungeprüft | **echt** (Aussage): g9ErkMake/g9AsrWorkerMain liegen in sq-g9-src; kein Fehler im Ergebnis | NOTES berichtigt; lader.mjs startet g9-Vorstufe (= Haupt-Faden), ASR- und KI1-Modul-Worker; KOMM-P bewacht die toString-Stellen (fnText 1/2) |
| 3 (klein) | Abweichung von A8 betrifft auch sq-md-src | **echt** (Notiz) | Offen 2 nennt beide; Schalter `--worklets-unberuehrt` lässt beide bytegleich |
| 4 (selbst) | golden.mjs wackelt unter Last (Prüfer: einmal Quelle≠Auslieferung, einmal Quelle≠Quelle) | **echt**: stille mkRender-Renders in jeder Fassung (p3) | stille Versuche bis 3× neu, Zahl als INFO; „kürzere Auswertung“ in NOTES als nicht gemessen berichtigt |

**KOMM-P (ausliefern.mjs, im KOMM-Block):** Zugriffs-Funktionen = Funktionen mit Block-Namen als Zeichenkette + per Name/Text
aufgerufene (blockLoad, SynthHost.load) + Aufrufer einer Text-zurückgebenden Funktion im selben Umfeld (MDX src → load/render).
Auf 4.76.1: 32 Zugriffs-Funktionen, 6 Such-Vergleiche (mkwEval 2 Anker, vv3Fmx LEVEL_LUT/V0d, lkWkCheck PVA/PVM) alle gleich,
toString g9ErkMake 1×, g9AsrWorkerMain 2× = erwartet. Kein Fehlalarm. Laufzeit des Werkzeugs +≈1 s (15–21 s bei Last 5–8).
Bewusst breit: alle Methoden namens `load` zählen als Ziel von `SynthHost.load(…, src)` (mehr Vergleiche, kein Fehlalarm).

**Tests (Zahlen)**
- test/gp-p/lauf.sh (bau.mjs erzeugt 5 Varianten, je eine neue Suche/Zugriff): **8/8** – v1 mkwEval sucht Kommentar-Text
  (Prüfer-Gegenprobe), v2 vv3Fmx über const, v3 MDX.load über `src()` + const im Umfeld (md-Kommentar), v4 neuer
  `g9ErkMake.toString()`, v5 Regex in lkWkCheck → je ABBRUCH mit Fundstelle; Basis OK und bytegleich (dd5abfd2…);
  `--ohne-komm` = PERF2 bytegleich (bd2ec747…); `--worklets-unberuehrt` OK, beide Worklet-Blöcke bytegleich zur Quelle.
- test/gp-p/lader-neg.out: Prüfer-Variante v1 mit ALTEM Werkzeug → „OK“; lader.mjs darauf → „FEHLER … mkwEval=null“ (Code 1).
- test/lader.out (alt/neu/alt/neu, Last 11): alle 4 Läufe gleiche Werte (Funktions-Ergebnisse, nicht nur „da“): 7 Blöcke true,
  lkWkCheck true, vv3Fmx 32 ALGS (Hash gleich), mkwEval 55 Einträge (Hash gleich), g9-Worker = Haupt-Faden, ASR/KI1 antworten,
  Klang-Worklet ready, md/BM/Stimme-Worklet true; bereit alt 837/953 ms, neu 851/756 ms (kein Unterschied).
  Hinweis: der alte Stimme-Worklet-„FEHLER“ war die Probe (file://); lader läuft jetzt über http://localhost (page.route).
  404 von Nebendateien (ohne Server) zählen nicht als Konsolenfehler, die Pfade stehen in der Ausgabe.
- test/golden2.out: **ERGEBNIS bitgleich** (12 Werksklänge bitgleich, Kontrolle Quelle==Quelle OK, stille Versuche 0/0/0, Konsole []).
- freigabe.sh (Kopie, jetzt mit Schritt „Probe Blöcke“) ganzer Lauf: **GRÜN** in 43 s (Last 4–7); frei2/index.html md5 dd5abfd2….
- Pflicht auf frei2/index.html: topdefs „Skripte 26, Namen 7988, doppelt 0, Syntaxfehler 0“; dupkeys „0 doppelte Schlüssel“;
  smoke „title SYNQUENZER errors []“; MS 2000 1×; '^  live: true,' 1×; VERSION '4.76.1'.

**Zahlen zur Worklet-Entscheidung (gzip -6):** PERF2 2 364 074 · KOMM 2 263 221 (−100 853) · KOMM `--worklets-unberuehrt`
2 317 677 (−46 397; roh 6 801 482, md5 b31d5a80…). Empfehlung: KOMM wie gebaut (mit Worklets) – Zugriffe jetzt statisch UND zur
Laufzeit abgesichert; wer A8 wörtlich will, nimmt den Schalter.

**Offen nach Prüfung:** siehe „Offen“ 2, 4 (nicht erfasste Zugriffs-Arten), 6 (stille mkRender, App), dazu: Übernahme nach perf2
braucht drei Dateien (ausliefern.mjs, freigabe.sh, test/lader.mjs); Safari/iPhone weiter ungeprüft (Offen 3).

## 4.77 (16.11.): neue Stelle erstStart namentlich erlaubt
- Anlass: freigabe.sh auf rel-4770 brach ab „sq-worklet-src: 9 Text-Stellen statt 8“. Neue Stelle = ERST `erstStart()` (4.77,
  Paket ERST): liest den ganzen textContent, schneidet ihn nur per slice in 64-K-Teil-Blobs, erstWkUrl vergleicht ihn als Ganzes
  mit dem Text von loadWorklet (`src === W.src`). Keine Suche im Text → Kürzen unbedenklich (golden + lader bestätigen es).
- Änderung ausliefern.mjs (Sicherung sicherung-4770/): KOMM_BLOECKE['sq-worklet-src'] bekommt `stellenFn: {erstStart: 1}`;
  kommSammeln zählt je Funktion (samt inneren) die Block-Namen-Zeichenketten (`idN`); `kommStellenSoll(id)` = stellen + je
  stellenFn-Name die gefundene Zahl, die 0 (Funktion nennt den Block nicht, z. B. 4.76.1) oder genau die erlaubte sein muss.
  bericht.json: `kommStellen` je Block (worklet: {stellen, basis 8, namentlich {erstStart}}).
- Gegenproben (rel-4770/pruef/komm/stellen/gp/*.out): neue Stelle in erstFree → „10 statt 9“; 2. Stelle in erstStart →
  „Funktion erstStart nennt den Block 2× statt 1“; erstStart umbenannt → „9 statt 8 (… erstStart 0)“ – je ABBRUCH.
- Läufe: 4.77 GRÜN (rel-4770/aus, md5 7a72a1aa…, bytegleich zur Werk-Kopie mit stellen 9); 4.76.1 GRÜN (md5 dd5abfd2… = frei2,
  also unverändert); golden 4.77 „ERGEBNIS bitgleich“ (12 Werksklänge, Konsole []).
