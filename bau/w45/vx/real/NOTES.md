# RV1 – Echttest mit echtem Gesang · NOTES (Stand Auftrag 1/2)

Datei: `vx/real/index.html` = basis5 (4.60.0) + RV1. Block `RV1-BEGIN … RV1-END` (Beschreibung) direkt nach `/* KI1-END */`; einzige Code-Stelle „RV1“
in `imp1Core` (läuft im Worker aus toString). VERSION/CHANGES unberührt, nichts beim App-Start.
Audio: freier Datensatz (3 echte Gesangsaufnahmen, mono 44,1 kHz, #1 33 s mit Noten-Annotation A1 = 59 Noten, #10 9 s, #14 12 s), liegt NUR in
`realvox/dl` (nicht unter vx, nicht im Repo). Test liest Dateien `<name>_<nr>.wav` / `<name>_<nr>_notesA1.csv` aus dem übergebenen Ordner.

Test: `node vx/real/rv1-test.mjs <abs index.html> <abs realvox/dl> [out.json]` (~100 s, `RV1_ONLY=1` nur #1). Weg wie Xander: Export-Blatt ›
„Audio/MIDI importieren“ › Datei-Wähler › Erkennen › „Als Gesang“ › Gesang-Editor (vx1rOpen) › Quantisieren/Verschieben › Chor „Pop modern“ (echt).
Läufe: `run1.txt` (Basis), `run3.txt` (Endstand), Zahlen `rv1-vorher.json` / `rv1-nachher.json`. Diagnose Node: `dbg/imp-q.mjs <index> <wav…>`.

## Behoben (RV1)
1. Import „Gesang allein“ kippte bei 48 kHz (Telefon-/Test-Browser dekodieren auf 48 kHz) auf „Mix“ ohne Frage: echte Männerstimme (Grundton
   114–175 Hz) streut ins Band 30–120 Hz; Bass-Anteil 0,026 (44,1k) bzw. 0,052 (48k: Herunterteilen auf 12 statt 11,025 kHz) gegen Schwelle 0,03.
   Jetzt: Gesang allein auch bei Bass < 15 % UND ≥ 1,5 % leisen Rahmen (−30 dB, Atem-/Phrasen-Pausen). Mischungen: leise Rahmen 0–0,1 %, Bass 53–58 %.
   #1: mix 115,7 ohne Frage → gesang 118,6 + „119 oder 59 / 237?“ (Raster-Treue der annotierten Einsätze: Rang 3,3 % → 0,8 %, bester Wert 119);
   #10: mix 114,4 → gesang 112 + Frage (= 44,1k-Ergebnis). imp1-test ALLE OK (48), Mischungen unverändert.

## Gemessen (Endstand, run3.txt) – 42/53 OK, Rest = Befunde unten
| Prüfung | #1 | #10 | #14 |
|---|---|---|---|
| Import: Quelle / Frage / Vorschlag | gesang / ja / 118,6 (119·59·237) | gesang / ja / 112 | gesang / ja / 132,6 (133·66) |
| Analyse (Worker) | 150 Stücke, 3,4 s | 56, 1,1 s | 69, 1,3 s |
| Einsätze ±40 ms (Stück-Anfang · Vokal-Beginn) | 39/59 · 48/59 | – | – |
| Tonhöhe ±50 ct (Stück-Median gegen Note) | 75/86, Median 7 ct | – | – |
| Silben ohne Spracherkennung | leer + Hinweis „Text: im Marken-Editor …“ | leer | leer |
| Quant. 1/8: Schnitte / 2. Ableitung max (Quelle) / auffällig | 149 / 0,057 (0,094) / 0 | 55 / 0,105 (0,296) / 0 | 68 / 0,034 (0,185) / 0 |
| Quant.: max Sprung / auffällig | 0,055 / 0 | 0,127 / 0 | 0,060 / 0 |
| Render nach Quant. | 279 ms | 167 ms | 168 ms |
| rechts (mehr Platz): Dehnung · Ton | 1,20× · 0 ct | (Fenster leer) | 1,18× · −2 ct |
| links 60 ms: Ausklang Vorgänger | 400 ms, max Abw. 1,1e-4 | 221 ms, 0,004 an der vorderen Naht | 216 ms bitgleich |
| Chor Pop echt (9 s): Versatz Plan/gemessen | uni 6/6 12/11,9 · oct-1 15/15,1 16/15,8 · st+2 9/32,5 17/40,3 | | |
| Chor: Schwankung σ / Formant Kopie 1–2 | uni 5,4 ct 1,48 % · st+2 16,7 ct 3,38 % · oct-1 2,9 ct 1,57 % (ohne echt ≈ 0) | | |
| Chor: Knack-Stellen (gegen Kopie ohne echt) | uni 0/0 · oct-1 0/0 · st+2 5/5 (bei 13,67 s, 14,62 s, 24,2 s; 0,004–0,007) | | |

## Befunde (groß, für Auftrag 2/2)
1. Übersegmentierung: 150 Stücke für 59 Noten (#1) – nur 56/150 Stücke beginnen an einer Note (37 %). Die Marken (wpDetect) setzen auch mitten in
   gehaltenen Vokalen (Vibrato-/Lautstärke-Wellen). Folgen: Quantisieren schiebt Teile mitten in einer Note, viele Stücke wollen dieselbe Rasterlinie
   (quantizeMarks: das weiter entfernte bleibt stehen → #1 94/150 auf dem Raster, 35 „Linie besetzt“, 14 Vorgänger-Sperre, 7 frei daneben).
   Weg: Marke nur bei Einsatz-Merkmal (Konsonant/stimmlos davor, Tonhöhen-Sprung > 70 ct, Pegel-Tal > 6 dB) – Tonhöhen-Noten (G2) als zweite Quelle.
2. Chor st+2 (Terz/Quart nach Tonleiter) aus echtem Gesang: gemessener Versatz 23 ms über Plan und σ 16,7 ct (uni/oct-1 passen). Verdacht: im echt-Weg
   verschiebt sich die Noten-Grenze der Harmonie (Intervall wechselt an anderer Stelle als ohne echt) → Hüllkurven-Versatz und Tonhöhen-Unterschied
   an Übergängen; dazu 5 kleine Knack-Stellen (2. Ableitung 0,004–0,007 gegen 0,0001–0,0016) in beiden st+2-Kopien an denselben Quell-Stellen.
3. Links-Verschieben: Ausklang des Vorgängers nicht in jedem Fall bitgleich – Abweichung an seiner VORDEREN Naht (#10: 0,004 bei 1 ms, Vorgänger
   selbst −88 ms verschoben; #1: 1,1e-4 bei 25 ms). Nicht gestaucht (Länge/Ton gleich), aber eine Aktion ändert ein Nachbarstück → Ursache im 'hyb'-Render prüfen.
4. Tempo bei #14 abhängig von der Abtastrate: 120,7 (44,1k) gegen 132,6 (48k) im Gesang-Weg (Herunterteilen 11,025/12 kHz → andere Silben-Spitzen).
   Frage kommt in beiden Fällen; Vorschlag sollte gleich sein (z. B. immer auf 11,025 kHz umrechnen) – ändert aber Mix-Ergebnisse minimal → mit imp1-test prüfen.
5. Spracherkennung offline nicht da (G9.rec = null): Stücke bleiben ehrlich leer; der Knopf „Text erkennen“ schließt den Editor und schickt in den
   Marken-Editor – kein erfundener Text, aber Rücksprung ins andere Blatt (Bedienung, kein Fehler).

## Test-Grenzen
- Knack-Index relativ (lautestes 1-ms-Fenster / Median der Umgebung) ist bei Stille/„echt“ (Rest × 0,12) unbrauchbar → absolut: 2. Ableitung an der Naht
  gegen beide Quell-Seiten (Stück-Anfang und Ausklang-Stelle des Vorgängers) ±20 ms; Chor gegen dieselbe Kopie ohne „echt“.
- Rechts-Verschieben: Ziel muss mehr Platz als in der Quelle geben (sonst wird gekürzt, nicht gedehnt); #10 Stück 6: Anker des Vorgängers liegt am
  Ende seines Stücks → Messfenster leer (kein App-Fehler).

## Pflicht (Endstand)
topdefs doppelt 0 / Syntax 0, dupkeys 0, smoke errors [] (`smoke-1.png`), „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter = Basis (Zählung gleich),
VERSION unverändert, Diff zur Basis: RV1-Block + 5 Zeilen imp1Core + diag.quiet. Regression imp1-test (Kopie aus vx/imp, danach gelöscht; Lauf `reg/imp1.txt`) ALLE OK (48).

---
# Auftrag 2/2 – Nachprüfung (Ergebnis)

App-Datei unverändert seit Auftrag 1 (`index.html` 17:46 = basis5 + RV1-Import-Fix). Geändert nur der Test `rv1-test.mjs` (Mess-Fehler) – alte Fassung
`dbg/rv1-test.vor-a2.mjs`. Diagnose-Skripte: `dbg/hyb-node.cjs` (Gesang-Kern 'hyb' aus index.html in Node nachrechnen, Abweichung orten),
`dbg/chor-lag.mjs` (Chor-Versatz je 1-s-Fenster). Test-Schalter: `RV1_ONLY=1|10|14`, `RV1_K=<Stück>` (Stück erzwingen), `RV1_DUMP=1` (Puffer nach dbg/).

## Läufe
| Lauf | rv1-test | Rest |
|---|---|---|
| Lauf 4 (Beginn, = Lauf 3) `run4.txt` | 42/53 OK | 11 Fehler |
| Lauf 7 (Ende) `run7.txt`, Zahlen `rv1-nachher.json` | **49/53 OK** | 4 = echte Grenzen (Übersegmentierung #1, Raster #1/#10/#14) |
| vx1-test (`rolle/vx1-test.mjs`, `reg/vx1.txt`) | **61/61 OK** | |
| imp1-test (Kopie `reg/imp1-test.mjs`, `reg/imp1.txt`) | **ALLE OK (48)**, 119 s | |
| chr2-test (Kopie `chr2-test.mjs` + `src/synth.mjs`, `src/tune-meas.mjs` aus chr3; Basis `vx/basis2.html`; `src/run-chr2.txt`) | **ALLE OK (82)**, 115 s | |

## Befunde aus Auftrag 1, nachgeprüft
- **Befund 3 (Links-Verschieben nicht bitgleich) = Test-Fehler.** Node-Nachrechnung: vorher/nachher weicht nur Stück k selbst ab (#10: 2,8817–3,1316 s),
  der Vorgänger ist bitgleich. Ursache: die Quelle des Renders (wpBase) wechselt zwischen Quantisieren und Verschieben (Tonhöhen-Fassung wird fertig) –
  der Test verglich zwei Quellen. Jetzt Vergleich mit der Fassung nach ↶ (gleiche Quelle) + Meldung „quelle gleich/gewechselt“; wo die Quelle gleich
  blieb (#14), ist ↶ bitgleich mit dem Quantisier-Stand. Ergebnis: #1 400 ms, #10 111 ms, #14 127 ms Ausklang bitgleich (max Abw. 0).
- **Befund 2 (Chor st+2 Versatz 32/40 statt 9/17 ms, σ 16,7 ct, 5 Knackser) = Mess-Fehler.** Rechnung stabil (Kopie mit „echt“ vor/nach der Kopie ohne
  bitgleich). Versatz je 1-s-Fenster = Plan (9 ms in 17/31 Fenstern); einzelne Fenster 25–49 ms (Hülle ändert sich mit „echt“ an Noten-Übergängen der
  Terz) zogen die Gesamt-Korrelation weg, mit falschem Versatz stiegen σ und „Knackser“. Test: Median der Fenster-Versätze. Ergebnis #1:
  6/6 12/12 9/9 17/17 15/15 16/16 ms, σ 2,9–5,4 ct, Knackser 0 (vorher 5/5 bei st+2).
- **#10 rechts (Dehnung 15,8×) = Test-Fehler:** Stück ohne Platz für den Vokal des Vorgängers gewählt (Anker am Stück-Ende). Jetzt Wahl mit Anker ≥ 0,2 s
  vor dem Stück; Rechts-Ziel rechnet die eigene Verschiebung des Vorgängers mit (#14 Stück 55: Vorgänger +101 ms → sonst 0,80× „gestaucht“ gemessen).
  Ergebnis: #1 1,13× / 0 ct, #10 1,30× / −4 ct, #14 1,30× (Ton dort nicht messbar, Vorgänger-Rest stimmlos).

## Echte Grenzen (bleiben, nicht klein)
1. **Übersegmentierung**: #1 150 Stücke für 59 Noten, nur 56/150 (37 %) beginnen an einer Note. Marken (wpDetect) auch mitten in gehaltenen Vokalen.
   Folge: Quantisieren 1/8 – #1 94/150 auf dem Raster (35 Linie besetzt, 14 Vorgänger-Sperre, 7 frei daneben), #10 31/56, #14 45/69. Ohne Knacken
   (2. Ableitung/Sprung an allen Schnitten ≤ Quelle, 0 auffällig), aber Teile werden mitten in Noten verschoben. Weg: Marke nur bei Einsatz-Merkmal
   (stimmlos davor, Tonhöhen-Sprung > 70 ct, Pegel-Tal > 6 dB), Tonhöhen-Noten (G2) als zweite Quelle – eigenes Paket, ändert Marken alter Takes nicht.
2. **Tempo #14 hängt von der Abtastrate ab** (44,1 kHz 120,7 / 48 kHz 132,6 im Gesang-Weg); Frage kommt in beiden Fällen. Weg: immer auf 11,025 kHz
   umrechnen – ändert Mix-Ergebnisse minimal, nur mit imp1-test.
3. **Chor-Formant aus echtem Gesang**: #1 (33 s, Männerstimme) in Plan-Richtung (+1,5 / +3,3 / +1,6 %), #10 (9 s) und #14 (12 s, höher) teils
   umgekehrt (#10 uni −1,7 %; #14 uni −1,0 %, st+2 −2,1 %, oct-1 −0,7 %; ohne „echt“ ≈ 0). Messung über den Spektral-Schwerpunkt 300–3500 Hz ist bei
   kurzen Aufnahmen/höheren Stimmen unsicher (Teiltöne, eigenes Schwanken je Kopie) → an CHR4 (Formanten) übergeben; Versatz/σ/Knackser dort OK.
4. **Spracherkennung offline nicht vorhanden**: Silben bleiben ehrlich leer, Hinweis schickt in den Marken-Editor (kein erfundener Text).

## Pflicht (Ende Auftrag 2)
topdefs 26 Skripte, doppelt 0 / Syntax 0; dupkeys 0; smoke errors [] (`smoke-2.png`); „MS 2000“ 1×; „  live: true,“ 1× (= Basis); Markenwörter = Basis;
VERSION 4.60.0 unverändert; nichts beim App-Start neu.
