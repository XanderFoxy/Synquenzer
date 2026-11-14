# VX2 – Gesang-Editor an echtem Gesang: Stücke = Noten/Silben · NOTES

Datei: `vx/vx2/index.html` = basis.html (4.62.0) + VX2. Block `/* ===== VX2-BEGIN … VX2-END ===== */` direkt nach `/* ===== NX1-END ===== */`
(weit weg von Ebenen-Liste, Spektral-Seite, Tastatur links). Stellen außerhalb (nach der Prüfung): 3 Ein-Zeiler mit Kommentar `/* VX2 … */` und `typeof`-Schutz – `vx1rAnalyse` (Marken + Quelle), `vx1rPieces` und `vx1rCommit` (`vx2Mk` statt `wpMarks`).
VERSION/CHANGES unberührt, nichts beim App-Start, keine sichtbare Änderung an Aussehen/Bedienung (nur andere Stück-Grenzen).

## Entscheidungen
1. **Quelle der Stücke = Tonhöhen-Noten (G2, VS2-Segmente)**, nicht die Einsatz-Erkennung. Gemessen an der 33-s-Aufnahme mit Noten-Annotation:
   Erkennung 213 Marken, Präzision 20 %; G2 59 Noten, Präzision 85 %. Jede Note beginnt ein Stück – auch ein Legato-Tonwechsel (Wunsch: Tonwechsel = Grenze).
   Die Note wird an einen Erkennungs-Einsatz ±20 ms eingerastet (probengenau), sonst Noten-Beginn (10-ms-Raster).
2. **Erkennungs-Marken ohne Note** bleiben nur mit Einsatz-Merkmal: stimmloser Konsonant davor (≥ 2 stimmlose Rahmen in −100…+20 ms), Pegel-Tal > 6 dB
   (Pegel über 30 ms – die 1-ms-Hülle zeigt in tiefen Stimmen 7–13 dB Perioden-Welligkeit auch im gehaltenen Vokal) oder Wort-Beginn nach Ruhe – und danach
   ≥ 50 ms gesungen. Atem/Geräusch/Pausen werden kein eigenes Stück (bleiben als Ausklang/Lücke). Mindestabstand 50 ms.
3. **Nur Gesang-Editor, nur erkannte Marken**: gespeicherte Marken (`m.marks`, alte/bearbeitete Takes) bleiben unverändert; ~~das Ergebnis ersetzt `WP.det`
   (gilt dann auch in der Zeitkarte des Takes)~~ → **seit der Prüfung (Befund 2): nur Sicht des Gesang-Editors** (`VX2.res`, `vx2Mk`); `WP.det`, Marken-Editor,
   Zeitkarte und Songtext bleiben bei den erkannten Marken; mit Songtext (`m.lyrics`/`m.ly`) gilt im Gesang-Editor wie bisher die Erkennung. Beim ersten
   Bearbeiten im Gesang-Editor werden seine Stücke wie bisher festgeschrieben (`m.marks`). Ohne Tonhöhe (G2 fehlt / < 2 Noten) → wie bisher.
   Schalter `window.__vx2.on(false)`; `window.__vx2.last()` = Zahlen der letzten Wahl.
4. **Keine Zusatz-Laufzeit**: Op 'vxa' (Worker) und G2 laufen wie bisher gleichzeitig; Anker + Anlauf der neuen Marken auf dem Hauptfaden aus derselben
   Analyse (`vx2AnLead`, gleiche Rechnung wie 'vxa', in Node bitgenau geprüft, 12–16 ms für 33 s). Analyse #1 3,6–4,0 s (vorher 3,8 s).
5. Konsonant vor dem Vokal gehört wie bisher als Anlauf zum Stück (VX1-Logik unverändert), Anker = lautester Spitzenwert im Einschwingbereich (unverändert).

## Zahlen vorher (4.62.0) → nachher (rv1-test, alle 3 Aufnahmen; run0-basis.txt / run2.txt; rv1-vorher.json / rv1-nachher.json)
| Messung | vorher | nachher |
|---|---|---|
| #1 Stücke / Noten | 150 / 59 | **60 / 59** (+2 %) |
| #1 Stücke an einer Note ±40 ms | 51/150 = 34 % | **52/60 = 87 %** |
| #1 Einsätze ±40 ms Anfang · Vokal-Beginn | 38 · 47 von 59 (79,7 % → FEHLER) | **45 · 49** von 59 – Anfang 76 %: Ziel ≥ 80 % (Anfang) **nicht** erreicht; die Prüfung ist grün, weil sie max(Anfang, Vokal) = 83 % nimmt (Korrektur nach Prüfung, Befund 4) |
| #1 Tonhöhe ±50 ct | 75/85, Median 6 ct | 55/56, Median 2 ct |
| Raster 1/8 auf der Linie #1 · #10 · #14 | 94/150 · 31/56 · 45/69 | **58/60 · 20/28 · 28/32** |
| #10 · #14 Stücke | 56 · 69 | 28 · 32 |
| Quantisieren: Render | 438 / 235 / 216 ms | 471 / 406 / 321 ms (weniger, längere Stücke) |
| rv1-test gesamt | 48/53 | 48/53 (andere Fehler, s. u.) |
Node (dbg/eval.cjs, gleiche Rechnung ohne Browser, Datei-Zeit): roh 213 → 60, Präz 26 → 85 %, Anfang 35 → 43, Vokal 46 → 50.

## Neue FEHLER-Zeilen im rv1-test = Bezugsfenster des Tests, kein neuer Knackser
Mit ganzen Noten als Stücken verschiebt Quantisieren 1/8 weiter (bis ±126 ms) und der Vorgänger wird öfter gedehnt. Der Test vergleicht die 2. Ableitung des
Ausgangs ±4 ms an der Naht mit der Quelle ±20 ms um den Stück-Anfang und um die UNGEDEHNTE Vorgänger-Stelle. Gedehnt spielt aber der Ausklang des Vorgängers
(oft der Konsonant der nächsten Silbe) bis an die Naht. Puffer-Dump: Schnitt 34 (#1) Ausgang = Quelle 36 ms vor dem Stück (Korrelation 0,99; Quelle 0,126 ≥
Ausgang 0,115); Schnitt 38 (#1) Quelle 0,076 ≥ Ausgang 0,020; #14 Stück 23 rechts Ausgang = Quelle 30,8 ms vor dem Stück (Korrelation 1,000; 0,027 ≥ 0,011).
Mit Bezug inkl. Ausklang des Vorgängers (Test-Kopie `vx2/rv1-test.mjs`, INFO „VX2-Bezug“): Knack/Sprung 0/0 bei allen drei Aufnahmen.
Vorschlag für rv1-test: Quelle auch `si − 40 ms ± 20 ms` (Ausklang) in den Bezug nehmen (Kopie zeigt es nur als INFO, die Prüfungen sind unverändert).

## Offen / Weg
1. **Konsonant am Ende des Vorgängers**: G2 beginnt eine Note, wenn die Tonhöhe stabil ist; liegt dazwischen ein kurzer stimmhafter Einschwing-Rahmen, findet der
   Anlauf (nur stimmlose Rahmen direkt vor der Marke) den Konsonanten nicht – er bleibt im Ausklang des Vorgängers und wird beim Rechts-Schieben mitgedehnt.
   Versuch „Marke auf den Beginn des gesungenen Laufs ≤ 60 ms davor“: Node Anfang 43 → 41, Vokal 50 → 50 – nicht besser, nicht eingebaut. Besser wäre ein Anlauf,
   der auch über 1–2 stimmhafte Einschwing-Rahmen bis zum Konsonanten zurückgeht (VX1-Logik `lead`, eigenes Paket, mit vx1-test prüfen).
2. **#10 Raster 20/28** (4 Linie besetzt, 3 gesperrt): 9-s-Aufnahme mit schnellen Noten (Achtel bei 112 BPM = 268 ms, Noten kürzer) – zwei Noten wollen dieselbe
   1/8-Linie. Kein Segmentierungs-Fehler; Weg: bei Kollision 1/16 oder Triolen-Raster vorschlagen (Quantisier-Logik, nicht VX2).
3. #1 Einsätze „Anfang“ 45/59 (76 %, Ziel ≥ 80 % nicht erreicht). ~~die meisten Abweichungen sind Konsonant-Anläufe~~ – korrigiert (Prüfung, Befund 4):
   von 14 Fehlgriffen ist es die Hälfte (7 mehr als 100 ms zu früh), 3 sind 48–74 ms zu früh, 4 zu spät (Tonhöhen-Grenzen / verlorene Silbe). Stand nach der
   Prüfung s. Abschnitt „Prüfung“.
4. Spracherkennung offline weiter nicht da (Silben bleiben leer) – unverändert.

## Dateien
- `dbg/vx2-core.js` Kern (Quelle für den Block, `python3 dbg/sync.py` überträgt ihn), `dbg/feat-node.cjs` (Merkmale aus index.html in Node), `dbg/eval.cjs`
  (Bewertung, Kern-Gleichheit mit „check“), `dbg/eval0.cjs`, `dbg/feat-raw.cjs` (Merkmal-Tabelle), `dbg/feat-*.json` (Merkmale je Aufnahme), `dbg/q-*.json` (Stücke nach Quantisieren).
- `rv1-test.mjs` = Kopie von vx/real/rv1-test.mjs + INFO „VX2-Bezug“ + Dump der Quantisier-Puffer (RV1_DUMP). Läufe: run0-basis.txt (Basis), run1.txt (#1), run2.txt (alle).
- Regression: reg/vx1.txt (61/61), reg/imp1.txt (ALLE OK 48).

## Prüfung (PRUEFUNG.md: 2 schwer, 2 mittel, 4 leicht) – Behebung
Vorher-Stand: `fix/index.v1.html` (VX2 wie geprüft), `dbg/vx2-core.v1.js`. Werkzeuge: `fix/eval2.cjs` (Node, A1 + A2, verloren/zusammen wie der Prüfer, Konsonant-Maß),
`fix/ftab.cjs` (Merkmal-Tabelle), `fix/probe.mjs` + `fix/analyze.mjs` + `fix/stale2.mjs` (Prüfer-Sonden, in der App), neuer Test `vx2-test.mjs`.

| Befund | Stand | vorher (VX2 v1) → nachher | Test |
|---|---|---|---|
| 1 schwer: echte Silben verloren | **behoben** | App #1 gegen A2: Vokal-Beginn 50 → **56**/64 (Basis 56), Noten ohne Grenze 7 → **1** (Basis 0), zusätzliche Noten in einem Stück 9 → **2** (Basis 1), Anfang 45 → 51; gegen A1: ohne Grenze 5 → 4 (Basis 1), zusammen 5 → 4, Vokal 49 → 50. Node: nur-A2-Silben 5 → 9 von 13 (Erkennung roh 10) | Node `fix/eval2.cjs`, App `fix/analyze.mjs` |
| 2 schwer: Marken app-weit ersetzt, Text springt | **behoben** | `WP.det` bleibt; Marken-Editor/Zeitkarte/Songtext unverändert (Test: 9 erkannte Marken bleiben 9, v1: 6); Text Fall A und B bleibt an seinen Marken (v1: springt) | `vx2-test.mjs` 14/14 (gegen v1 10/14) |
| 3 mittel: SPK5-R umgangen | **behoben** | App: Analyse auf aktueller Quelle 0/3 → **3/3**; Anker gegen Neu-Messung > 5 ms #1 42 → **0**, #10 13 → 0, #14 22 → 0, Anlauf 0; kalt neu gerechnet = erstes Öffnen (69/32/35) | `fix/stale-fix.txt`, `vx2-test.mjs` (Quelle wechselt während der Rechnung) |
| 4 mittel: „Anfang ≥ 80 %“ verfehlt | **Bericht korrigiert, Ziel weiter nicht erreicht** | Anfang 45/59 = 76 % (Vokal 50/59 = 85 %). Node-Aufschlüsselung der 15 Fehlgriffe: 7 Konsonant-Anläufe (Anfang −115…−177 ms, Vokal-Beginn ±40 ms getroffen – gewollt: Konsonant gehört zum Stück), 3 zu früh 45–72 ms, 1 −176 ms, 3 zu spät +71/+92/+208 ms (dort liegen A1 und A2 selbst 40–100 ms auseinander). ≥ 80 % „Anfang“ verlangt, den Konsonanten abzutrennen – widerspricht der Festlegung, nicht eingebaut. | – |
| 5 leicht: rv1-test rot | **Vorschlag fertig** (fremder Ordner nicht geändert) | `fix/rv1-bezug.diff`: Bezug der Knack-/Sprung-Prüfung auch am Ausklang des Vorgängers (si − 40 ms ± 20 ms), bei Quantisieren und Verschieben. Offiziell 48/53 → mit Vorschlag **52/53** (nur #10 Raster) | `fix/run-fix.txt`, `fix/run-fix-bezug.txt` |
| 6 leicht: Regression erreicht VX2 nicht | **behoben** | neuer Test `vx2-test.mjs`: erkannte Marken ohne `m.marks` → VX2 (6 Stücke, Konsonant 6/6, Anker 4 ms), Befunde 2/3/7, Festschreiben, Schalter aus | 14/14 |
| 7 leicht: Anker/Anlauf doppelt | **abgesichert, nicht entdoppelt** | Gleichheit jetzt geprüft: `vx2-test.mjs` (App, bitgleich Δ 0) und `dbg/eval.cjs … check` (Node, #1/#10/#14 Δ 0). Entdoppeln hieße Op 'vxa' im Worker-Kern (`nx1RunG`) ändern (fremde Stelle) oder einen 2. 'vxa'-Lauf (+~1 s beim Öffnen) – beides schlechter. Wer den Anlauf ändert, sieht den Unterschied sofort im Test. | 2 Prüfungen |
| 8 leicht: Raster #10 FEHLER | **offen (nicht VX2)** | #10 32 Stücke, 24/32 auf dem Raster = 8 daneben (v1 8 von 28, Basis 25 von 56). Weg wie gehabt: bei Kollision 1/16 oder Triolen vorschlagen (Quantisier-Logik) | rv1-test |

### Entscheidungen
- **Stimmhafte Konsonanten** (Befund 1): Erkennungs-Marke ohne Tonhöhen-Note wird Stück, wenn sie sicher ist (conf ≥ 0,6), das Pegel-Tal (30 ms) ≥ 2 dB beträgt
  und im Tal weniger Nulldurchgänge sind als im Vokal davor/danach (Nasal/Lateral). Gemessen an 131 Kandidaten (#1): alle 7 echten Silben mit conf ≥ 0,6 erfüllen es,
  von den 120 ohne Note keiner (außer einer, die schon über Tal > 6 dB kommt). Schwelle 2 dB statt 2,5 (A2 verloren 3 → 2) / 3 dB (4). Stückzahl #1 60 → 66 (App 69), #10 28 → 32, #14 32 → 35.
- Die zweite Ursache des Prüfers (Marke ≤ 100 ms neben einer verschobenen Tonhöhen-Note) bleibt: an den Stellen 8,03/10,25/13,14/22,21 s (Datei) liegen die beiden
  Annotationen selbst 40–100 ms auseinander; Lockern des Einrastens war schon vorher schlechter (60/30 ms: Anfang 43 → 39).
- **Nur Sicht des Gesang-Editors** (Befund 2): Songtext hängt per Reihenfolge an den erkannten Marken, deshalb gilt VX2 nicht, sobald Text da ist; ohne Text
  verschiebt nichts mehr Text oder Zeitkarte. Festgeschrieben wird erst beim Bearbeiten im Gesang-Editor (wie bisher) – dann gelten die Stücke überall, auch nach Laden.
- **SPK5-R** (Befund 3): `vx2Marks` prüft nach der Rechnung `vx1rSrc(id) !== b` und misst an der neuen Quelle neu (≤ 2×); der Haken in `vx1rAnalyse` übernimmt
  die gemessene Quelle (`b = v2.b`). In allen 3 Aufnahmen wechselte die Quelle während der ersten Analyse (`VX2.last.quelle` 1) – die Basis misst dann ebenfalls zweimal.
  Analysezeit direkt hintereinander gemessen (`fix/probe-basis2.txt`, `fix/probe-fix2.txt`): erste Analyse #1 3488 ms gegen Basis 3344 ms, #10 1456 / 1281, #14 1423 / 1363;
  kalt #1 1101/1160 gegen 1100/1224, #10 423/372 gegen 365/336, #14 378/370 gegen 612/553 – im Rahmen der Last-Schwankung (ein Einzellauf unter Last: 4465 ms).

### Offen
- **Konsonant-Zuordnung auf der Quelle, die die App rendert** (Prüfer-Maß aus analyze.mjs, alle Stücke an derselben Analyse gemessen): #1 Basis 16/31 · v1 10/31 ·
  jetzt 12/31; #10 8/13 · 6/13 · 9/13; #14 12/18 · 4/18 · 7/18. Gegenüber v1 besser, gegenüber der Basis (150/56/69 Stücke) bei #1/#14 weniger: Tonhöhen-Noten
  beginnen 10–30 ms im Vokal, der Anlauf (stimmlose Rahmen direkt vor der Marke) findet den Konsonanten dann nicht. Weg wie in „Offen 1“: Anlauf über 1–2 stimmhafte
  Einschwing-Rahmen (VX1-Logik `lead`, im Kern UND in `vx2AnLead`, Gleichheit hält `vx2-test.mjs` fest). In Node (alte Quelle) gleich wie die Erkennung (15/29, 6/12 · 7/12, 6/11 · 5/11).
- Präzision gegen A1 sinkt erwartungsgemäß (A1 fasst Silben zusammen): App 52/60 → 50/69 (Prüfung „≥ 70 %“ OK); gegen A2 56/69 = 81 %.
- Mit Songtext zeigt der Gesang-Editor die erkannten Marken (wie 4.62.0). Besser wäre, den Text beim Festschreiben mitzunehmen (g9MarkHook) – eigenes Paket.
- rv1-test `vx/real/rv1-test.mjs` braucht vor dem Einbau den Bezug aus `fix/rv1-bezug.diff`.

### Läufe (einzeln nacheinander)
vx2-test 14/14 (`fix/vx2-test.txt`) · vx1-test 61/61 (`fix/reg/vx1.txt`) · imp1-test ALLE OK 48 (`fix/reg/imp1.txt`, Kopie im eigenen Ordner) · rv1-test offiziell 48/53
(`fix/run-fix.txt`; v1 48–49/53, Basis 48/53), mit Bezug-Vorschlag 52/53 · Prüfer-Sonden `fix/probe-fix.txt`, `fix/stale-fix.txt` · Pflicht s. LOG.
